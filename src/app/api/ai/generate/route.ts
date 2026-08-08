import { NextRequest } from "next/server";
import { AI_SYSTEM_PROMPT, containsSensitiveContent } from "@/lib/aiPrompts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_HISTORY = 24;
const MAX_PROMPT_LENGTH = 8000;
const MAX_CODE_LENGTH = 60000;
const MAX_TOKENS = 8192;

interface ChatItem {
  role: "user" | "assistant";
  content: string;
}

/**
 * POST /api/ai/generate
 * Body: { messages?: {role,content}[], prompt?: string, currentCode?: string }
 * 将需求/对话发送给 DeepSeek（deepseek-chat），以 SSE 流式返回生成的 HTML。
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

  let body: { prompt?: unknown; messages?: unknown; currentCode?: unknown };
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
    return new Response(JSON.stringify({ error: "需求描述过长，请精简到 8000 字以内" }), {
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
      ? body.currentCode.trim().slice(0, MAX_CODE_LENGTH)
      : "";
  let system = AI_SYSTEM_PROMPT;
  if (currentCode) {
    system +=
      "\n\n当前已有工具代码（用户可能要求在此基础上修改；无论是否修改，都必须输出完整的新 HTML 文件，而不是片段或 diff）：\n```html\n" +
      currentCode +
      "\n```";
  }

  const upstreamMessages = [
    { role: "system", content: system },
    ...(history.length > 0 ? history : [{ role: "user", content: prompt }]),
  ];

  let upstream: Response;
  try {
    upstream = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: upstreamMessages,
        stream: true,
        max_tokens: MAX_TOKENS,
        temperature: 0.6,
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

  // 透传 DeepSeek 的 SSE 流
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}