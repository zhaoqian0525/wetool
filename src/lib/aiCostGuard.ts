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
export const MAX_CODE_LENGTH = 100000; // currentCode 上限（v2.25.0 再放松：适配 10 万字长工具改编）
export const MAX_TOKENS = Number(process.env.AI_MAX_TOKENS ?? 32000); // 输出上限（v2.26.0 回收到与 10 万字代码匹配）
export const MAX_CONTEXT_CHARS = 150000; // 上游 system+history 总字符护栏（v2.26.0 回收）
export const MAX_HISTORY_ITEM_CHARS = 8000; // 单条历史消息最多保留的字符数（预算制，v2.26.0）
export const RATE_MIN = Number(process.env.AI_RATE_MIN ?? 8); // 每 IP 每分钟请求上限
export const RATE_DAY = Number(process.env.AI_RATE_DAY ?? 120); // 每 IP 每天请求上限
export const MIN_BALANCE_CNY = 1.0; // 余额低于该值（元）拒绝生成
export const BALANCE_TTL_MS = 5 * 60 * 1000;

/** 压缩对话历史：在给定字符预算内，从最新往旧尽量多保留用户需求；最新一条始终保留 */
export function compactHistory(messages: ChatItem[], budget: number): { role: "user"; content: string }[] {
  const users = messages.filter((m) => m.role === "user");
  if (users.length === 0) return [];
  const kept: { role: "user"; content: string }[] = [];
  let used = 0;
  for (let i = users.length - 1; i >= 0; i--) {
    const content = users[i].content.slice(0, MAX_HISTORY_ITEM_CHARS);
    if (kept.length > 0 && used + content.length > budget) break;
    kept.unshift({ role: "user", content });
    used += content.length;
  }
  return kept;
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

const FALLBACK_SUPABASE_URL = "https://cvacrykzcppiflmvwwfe.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY = "sb_publishable_HedSPsepnDWtvd3IuQhlWw_JPeVevVu";

/**
 * 跨实例速率限制（v1.15.0）：优先走 Supabase RPC（ai_rate_bump，见 supabase_fix_rls_all.sql），
 * 多实例/冷启动下依然生效；RPC 未部署或网络异常时回退内存 Map，不阻断生成。
 */
export async function checkRateLimitRemote(ip: string): Promise<{ ok: boolean; retryAfterSec?: number }> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;
    const res = await fetch(`${url}/rest/v1/rpc/ai_rate_bump`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ p_ip: ip, p_min: RATE_MIN, p_day: RATE_DAY }),
      signal: AbortSignal.timeout(2500),
      cache: "no-store",
    });
    if (res.ok) {
      const j = (await res.json()) as { ok?: boolean; retry_after?: number };
      return { ok: j.ok !== false, retryAfterSec: j.retry_after ?? 60 };
    }
  } catch {
    // RPC 未部署 / 网络异常：回退内存限流
  }
  return checkRateLimit(ip);
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
