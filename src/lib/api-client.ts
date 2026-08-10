"use client";

import { getSupabase } from "./supabase";

/**
 * ? Supabase session token ? fetch?
 * ????????? Authorization: Bearer <access_token>?
 * ??? API ?????????????????? userId??
 */
export async function authedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const client = getSupabase();
  let token = "";
  if (client) {
    try {
      const { data } = await client.auth.getSession();
      token = data.session?.access_token ?? "";
    } catch {
      token = "";
    }
  }
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(input, { ...init, headers });

  // token 过期（手机上常见）：刷新 session 后重试一次，避免接口 401 导致数据消失
  if (res.status === 401 && client) {
    try {
      const { data: refreshed } = await client.auth.refreshSession();
      const newToken = refreshed.session?.access_token ?? "";
      if (newToken) {
        const retryHeaders = new Headers(init?.headers);
        retryHeaders.set("Authorization", `Bearer ${newToken}`);
        return fetch(input, { ...init, headers: retryHeaders });
      }
    } catch {
      // 刷新失败（refresh token 过期等），返回原始 401
    }
  }
  return res;
}
