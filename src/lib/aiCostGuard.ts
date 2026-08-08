// AI 成本控制（v1.8.3）：上下文压缩 / 限流 / 余额保护 / 用量解析。
// 独立模块，方便测试；路由只负责调用。
export interface ChatItem {
  role: "user" | "assistant";
  content: string;
}

export interface AiUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

// ===== 可调参数（环境变量可覆盖） =====
export const MAX_CODE_LENGTH = 32000; // currentCode 上限（v1.8.7 放松：适配 3 万字长工具改编）
export const MAX_TOKENS = Number(process.env.AI_MAX_TOKENS ?? 16000); // 输出上限（v1.8.7 放松：3 万字 HTML 约需 7k+ token）
export const MAX_CONTEXT_CHARS = 48000; // 上游 system+history 总字符护栏（v1.8.7 放松）
export const RATE_MIN = Number(process.env.AI_RATE_MIN ?? 8); // 每 IP 每分钟请求上限
export const RATE_DAY = Number(process.env.AI_RATE_DAY ?? 120); // 每 IP 每天请求上限
export const MIN_BALANCE_CNY = 1.0; // 余额低于该值（元）拒绝生成
export const BALANCE_TTL_MS = 5 * 60 * 1000;

/** 压缩对话历史：只保留最近 N 条用户需求，丢弃 assistant 的完整代码消息（当前代码已通过 currentCode 单独传入） */
export function compactHistory(messages: ChatItem[]): { role: "user"; content: string }[] {
  return messages
    .filter((m) => m.role === "user")
    .slice(-8)
    .map((m) => ({ role: "user" as const, content: m.content.slice(0, 1000) }));
}

/** 组装系统提示词：基础规则 + 当前代码（截断到上限） */
export function buildSystem(currentCode: string, basePrompt: string): string {
  let system = basePrompt;
  const code = (currentCode || "").trim().slice(0, MAX_CODE_LENGTH);
  if (code) {
    system +=
      "\n\n当前已有工具代码（用户可能要求在此基础上修改；无论是否修改，都必须输出完整的新 HTML 文件，而不是片段或 diff）：\n```html\n" +
      code +
      "\n```";
  }
  return system;
}

/** 每 IP 速率限制（内存实现，Vercel 单实例内生效，作为第一道防线） */
const rateMap = new Map<string, number[]>();
export function checkRateLimit(ip: string): { ok: boolean; retryAfterSec?: number } {
  const now = Date.now();
  if (rateMap.size > 10000) {
    for (const [k, v] of rateMap) {
      if (v.length === 0 || now - v[v.length - 1] > 86_400_000) rateMap.delete(k);
    }
  }
  const hits = (rateMap.get(ip) ?? []).filter((t) => now - t < 86_400_000);
  const minHits = hits.filter((t) => now - t < 60_000);
  if (minHits.length >= RATE_MIN || hits.length >= RATE_DAY) {
    return { ok: false, retryAfterSec: 60 };
  }
  hits.push(now);
  rateMap.set(ip, hits);
  return { ok: true };
}

/** 查询 DeepSeek 余额（带 5 分钟缓存；查询失败不阻塞生成） */
let balanceCache: { at: number; cny: number | null } = { at: 0, cny: null };
export async function getBalanceCny(apiKey: string): Promise<number | null> {
  const now = Date.now();
  if (now - balanceCache.at < BALANCE_TTL_MS) return balanceCache.cny;
  try {
    const res = await fetch("https://api.deepseek.com/user/balance", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    if (!res.ok) return balanceCache.cny;
    const j = (await res.json()) as { balance_infos?: { total_balance?: string }[] };
    const cny =
      j.balance_infos?.[0]?.total_balance != null ? parseFloat(j.balance_infos[0].total_balance) : null;
    balanceCache = { at: now, cny };
    return cny;
  } catch {
    return balanceCache.cny;
  }
}

/** 从 SSE 尾部提取 usage（DeepSeek 流式最后一个 chunk 带 usage 字段） */
export function extractUsageFromSseTail(tail: string): AiUsage | null {
  let usage: AiUsage | null = null;
  for (const line of tail.split("\n")) {
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();
    if (!payload || payload === "[DONE]") continue;
    try {
      const j = JSON.parse(payload);
      if (j?.usage && (j.usage.prompt_tokens != null || j.usage.total_tokens != null)) {
        usage = {
          promptTokens: j.usage.prompt_tokens ?? 0,
          completionTokens: j.usage.completion_tokens ?? 0,
          totalTokens: j.usage.total_tokens ?? 0,
        };
      }
    } catch {
      // 半行 JSON，等下一个 chunk
    }
  }
  return usage;
}