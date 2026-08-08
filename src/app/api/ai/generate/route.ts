import { NextRequest } from "next/server";
import { AI_SYSTEM_PROMPT, containsSensitiveContent } from "@/lib/aiPrompts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_PROMPT_LENGTH = 8000;
const MAX_TOKENS = 8192;

/**
 * POST /api/ai/generate
 * Body: { prompt: string }
 * 将需求发送给 DeepSeek（deepseek-chat），以 SSE 流式返回生成的 HTML。
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

  let body: { prompt?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "请求格式错误" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
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

  const sensitive = containsSensitiveContent(prompt);
  if (sensitive.hit) {
    return new Response(
      JSON.stringify({ error: `内容包含${sensitive.label ?? "违规"}描述，平台不支持生成这类工具，请换一个需求试试` }),
      { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
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
        model: "deepseek-chat",
        messages: [
          { role: "system", content: AI_SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
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