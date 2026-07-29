import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase 客户端单例
 *
 * 使用模块级变量缓存客户端实例，避免每次调用都创建新 client。
 * 这对 Auth 尤为重要——多个 client 实例会导致 session 状态不同步。
 */
let _client: SupabaseClient | null = null;
let _configured: boolean | null = null;

/** 返回 Supabase 客户端单例，未配置则返回 null */
export function getSupabase(): SupabaseClient | null {
  // 已经初始化过——直接返回缓存
  if (_client) return _client;

  // 已经确认未配置——直接返回 null
  if (_configured === false) return null;

  // 优先使用环境变量，兜底硬编码（解决 Vercel 环境变量不稳定问题）
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cvacrykzcppiflmvwwfe.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_HedSPsepnDWtvd3IuQhlWw_JPeVevVu";

  // 检测占位符或缺失
  if (!url || !key || url === "your_supabase_project_url" || url.includes("your-project")) {
    _configured = false;
    return null;
  }

  try {
    _client = createClient(url, key, {
      auth: {
        // 自动检测 URL 中的 auth 回调（邮箱验证、OAuth 回调）
        detectSessionInUrl: true,
        // 使用 PKCE 流程（更安全，推荐）
        flowType: "pkce",
        // 自动刷新 token
        autoRefreshToken: true,
        // 持久化 session 到 localStorage
        persistSession: true,
        // 邮箱验证后的重定向地址
        // signUp 的 redirectTo 会覆盖此默认值
      },
    });
    _configured = true;
    return _client;
  } catch {
    _configured = false;
    return null;
  }
}

/** Supabase 是否已配置真实凭据 */
export const isSupabaseConfigured = (): boolean => {
  if (_configured !== null) return _configured;
  return getSupabase() !== null;
};

/**
 * 获取邮箱验证回调 URL
 * 在浏览器端使用 window.location.origin，服务端使用环境变量或默认值
 */
export function getAuthRedirectTo(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth/callback`;
  }
  // 服务端渲染时 fallback
  return "https://we-woo.net/auth/callback";
}
