import { NextRequest } from "next/server";
import { AI_SYSTEM_PROMPT, DESKTOP_TARGET_INSTRUCTION, containsSensitiveContent } from "@/lib/aiPrompts";
import {
  ChatItem,
  AiUsage,
  MAX_TOKENS,
  MAX_CONTEXT_CHARS,
  MAX_HISTORY_ITEM_CHARS,
  MIN_BALANCE_CNY,
  checkRateLimitRemote,
  getBalanceCny,
  extractUsageFromSseTail,
  compactHistory,
  buildSystem,
} from "@/lib/aiCostGuard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// AI 模型：默认 flash（便宜档），可用环境变量 AI_MODEL 覆盖；严禁在生产切到 pro
const AI_MODEL = process.env.AI_MODEL ?? "deepseek-v4-flash";
// v2.10.0 视觉模型：用户附带图片时切换（图片理解/设计稿转工具）
const AI_VISION_MODEL = process.env.AI_VISION_MODEL ?? "deepseek-v4-flash-vision-exp";

const MAX_HISTORY = 40; // 客户端消息条数硬上限（实际保留数量由上下文预算决定）
const MAX_PROMPT_LENGTH = 12000; // 单次 prompt 上限（v2.26.0 回收）
const MAX_IMAGES = 4; // 单次最多附带图片数
const MAX_IMAGE_CHARS = 2_000_000; // 单张 base64 上限（约 1.5MB）

type VisionPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

type UpstreamMessage = {
  role: "system" | "user";
  content: string | VisionPart[];
};

function contentLength(m: UpstreamMessage): number {
  if (typeof m.content === "string") return m.content.length;
  return m.content.reduce((s, p) => s + (p.type === "text" ? p.text.length : p.image_url.url.length), 0);
}

/** 包装上游 SSE 流：原样透传，同时捕获最后一个 chunk 的 usage 用于记账 */
function withUsageCapture(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onEnd: (usage: AiUsage | null) => void
): ReadableStream<Uint8Array> {
  let tail = "";
  let usage: AiUsage | null = null;
  const decoder = new TextDecoder("utf-8");
  return new ReadableStream({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          const u = extractUsageFromSseTail(tail) ?? usage;
          onEnd(u);
          controller.close();
          return;
        }
        tail = (tail + decoder.decode(value, { stream: true })).slice(-4096);
        const u = extractUsageFromSseTail(tail);
        if (u) usage = u;
        controller.enqueue(value);
      } catch (e) {
        controller.error(e);
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });
}

function logUsage(ip: string, usage: AiUsage | null, codeChars: number, promptChars: number, model: string) {
  const row = {
    ts: new Date().toISOString(),
    ip,
    model,
    codeChars,
    promptChars,
    promptTokens: usage?.promptTokens ?? null,
    completionTokens: usage?.completionTokens ?? null,
    totalTokens: usage?.totalTokens ?? null,
  };
  console.log("[ai-usage]", JSON.stringify(row));
}

/**
 * POST /api/ai/generate
 * Body: { messages?: {role,content}[], prompt?: string, currentCode?: string, deviceTarget?: "mobile"|"desktop" }
 * 将需求/对话发送给 DeepSeek（默认 deepseek-v4-flash），以 SSE 流式返回生成的 HTML。
 * 服务端持有 DEEPSEEK_API_KEY，绝不进入客户端 bundle。
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "AI 服务尚未配置，请稍后再试" }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  // 速率限制（按 IP；取 x-forwarded-for 最后一段，避免客户端伪造首段绕过）
  const fwd = request.headers.get("x-forwarded-for");
  const ip = fwd ? (fwd.split(",").pop()?.trim() || "unknown") : "unknown";
  const rl = await checkRateLimitRemote(ip);
  if (!rl.ok) {
    return new Response(JSON.stringify({ error: "请求太频繁，请稍后再试" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Retry-After": String(rl.retryAfterSec ?? 60),
      },
    });
  }

  let body: { prompt?: unknown; messages?: unknown; currentCode?: unknown; images?: unknown; deviceTarget?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "请求格式错误" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  // 组装对话历史（兼容旧的单次 prompt 用法）
  let history: ChatItem[] = [];
  if (Array.isArray(body?.messages)) {
    history = body.messages
      .filter(
        (m): m is ChatItem =>
          !!m &&
          typeof m === "object" &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string"
      )
      .slice(-MAX_HISTORY)
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_PROMPT_LENGTH) }));
  }
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  if (history.length === 0 && !prompt) {
    return new Response(JSON.stringify({ error: "请先描述你想做的工具" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return new Response(JSON.stringify({ error: `需求描述过长，请精简到 ${MAX_PROMPT_LENGTH} 字以内` }), {
      status: 413,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  // 敏感词检查：取最近一条用户消息（或单次 prompt）
  const lastUserText =
    [...history].reverse().find((m) => m.role === "user")?.content ?? prompt;
  const sensitive = containsSensitiveContent(lastUserText);
  if (sensitive.hit) {
    return new Response(
      JSON.stringify({ error: `内容包含${sensitive.label ?? "违规"}描述，平台不支持生成这类工具，请换一个需求试试` }),
      { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }

  // 当前代码上下文（改编/修改时携带）
  const currentCode =
    typeof body?.currentCode === "string" && body.currentCode.trim()
      ? body.currentCode.trim()
      : "";
  // v2.11.0：设备适配目标（默认移动端优先）
  const deviceTarget = typeof body?.deviceTarget === "string" && body.deviceTarget === "desktop" ? "desktop" : "mobile";
  // v2.10.0：视觉输入，仅接受 base64 data URL（客户端已压缩）
  const images: string[] = (Array.isArray(body?.images) ? body.images : [])
    .filter((i): i is string => typeof i === "string" && i.startsWith("data:image/") && i.length > 64)
    .slice(0, MAX_IMAGES)
    .map((i) => i.slice(0, MAX_IMAGE_CHARS));
  const hasImages = images.length > 0;
  const model = hasImages ? AI_VISION_MODEL : AI_MODEL;
  const promptChars = (history.at(-1)?.content ?? prompt).length;

  // 余额保护：低于阈值直接拒绝，防止余额被刷到负数
  const balance = await getBalanceCny(apiKey);
  if (balance != null && balance < MIN_BALANCE_CNY) {
    return new Response(JSON.stringify({ error: "AI 生成额度即将用尽，请稍后再试" }), {
      status: 429,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  // 压缩上下文：只保留用户需求 + 当前代码，不再重发历史完整 HTML
  const system = buildSystem(
    currentCode,
    deviceTarget === "desktop" ? AI_SYSTEM_PROMPT + "\n\n" + DESKTOP_TARGET_INSTRUCTION : AI_SYSTEM_PROMPT
  );
  // 上下文预算制：先给 system（含当前代码）和图片留足空间，剩余预算从最新往旧动态保留用户历史
  const systemLen = contentLength({ role: "system", content: system });
  const imageLen = hasImages ? images.reduce((s, u) => s + u.length, 0) : 0;
  const historyBudget = Math.max(MAX_HISTORY_ITEM_CHARS, MAX_CONTEXT_CHARS - systemLen - imageLen - 2000);
  const compacted = compactHistory(history, historyBudget);
  const upstreamMessages: UpstreamMessage[] = [
    { role: "system", content: system },
    ...(compacted.length > 0 ? compacted : [{ role: "user" as const, content: prompt }]),
  ];

  // v2.10.0：把图片附加到最近一条用户消息（多模态 content 块）
  if (hasImages) {
    const lastIdx = upstreamMessages.length - 1;
    const lastText = typeof upstreamMessages[lastIdx].content === "string" ? upstreamMessages[lastIdx].content : "";
    const parts: VisionPart[] = [
      { type: "text" as const, text: lastText },
      ...images.map((url) => ({ type: "image_url" as const, image_url: { url } })),
    ];
    upstreamMessages[lastIdx] = {
      role: "user",
      content: parts,
    };
  }

  // 总字符护栏：超出时丢弃更早的用户消息（始终保留 system 与最后一条用户消息，避免丢掉图片）
  let total = upstreamMessages.reduce((s, m) => s + contentLength(m), 0);
  while (total > MAX_CONTEXT_CHARS && upstreamMessages.length > 2) {
    const removed = upstreamMessages.splice(1, 1)[0];
    total -= contentLength(removed);
  }

  let upstream: Response;
  try {
    upstream = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: upstreamMessages,
        stream: true,
        max_tokens: MAX_TOKENS,
        temperature: 0.6,
        stream_options: { include_usage: true },
        // v1.8.5: deepseek-v4 系列默认开启思考模式，会耗尽 max_tokens 导致正文为空，这里显式关闭思考
        ...(model.includes("v4") ? { thinking: { type: "disabled" } } : {}),
      }),
    });
  } catch {
    return new Response(JSON.stringify({ error: "AI 服务连接失败，请稍后重试" }), {
      status: 502,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => "");
    return new Response(
      JSON.stringify({ error: "AI 生成失败，请稍后重试", detail: errText.slice(0, 300) }),
      { status: 502, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }

  if (!upstream.body) {
    return new Response(JSON.stringify({ error: "AI 服务无响应，请稍后重试" }), {
      status: 502,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  // 透传 DeepSeek 的 SSE 流，同时捕获 usage 记账
  const reader = upstream.body.getReader();
  const stream = withUsageCapture(reader, (u) => logUsage(ip, u, currentCode.length, promptChars, model));
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
