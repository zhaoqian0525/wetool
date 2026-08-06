import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getServerConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cvacrykzcppiflmvwwfe.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_HedSPsepnDWtvd3IuQhlWw_JPeVevVu";
  return { url, key };
}

export interface AuthedContext {
  supabase: SupabaseClient;
  userId: string;
}

/**
 * 从 Authorization: Bearer <access_token> 解析当前登录用户，
 * 并返回携带该用户 JWT 的 Supabase 客户端（RLS 的 auth.uid() 才能生效）。
 * 绝不允许信任客户端传入的 userId，身份一律以 token 为准。
 */
export async function getAuthedSupabase(request: NextRequest): Promise<AuthedContext | null> {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) return null;
  try {
    const { url, key } = getServerConfig();
    const base = createClient(url, key);
    const { data, error } = await base.auth.getUser(token);
    if (error || !data.user) return null;
    const supabase = createClient(url, key, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    return { supabase, userId: data.user.id };
  } catch {
    return null;
  }
}

/** 仅校验身份并返回 userId（用于不需要 RLS 查询的接口） */
export async function getAuthUserId(request: NextRequest): Promise<string | null> {
  const ctx = await getAuthedSupabase(request);
  return ctx ? ctx.userId : null;
}

/** 统一的未授权响应 */
export function unauthorizedResponse() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}
