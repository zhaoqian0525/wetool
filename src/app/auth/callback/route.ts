import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

/**
 * 邮箱验证回调路由 /auth/callback
 *
 * Supabase 邮箱验证邮件中的链接会指向此页面，
 * 携带 code 或 type 参数。此路由负责：
 * 1. 从 URL 中提取 code
 * 2. 用 code 交换 session
 * 3. 成功后重定向到首页
 * 4. 失败时重定向到 /auth 并附带错误信息
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Supabase 返回了错误（如链接过期）
  if (error) {
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  // 没有 code——直接跳回登录页
  if (!code) {
    return NextResponse.redirect(`${origin}/auth`);
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent("Supabase 未配置")}`
    );
  }

  // 用 code 交换 session（PKCE 流程）
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(exchangeError.message)}`
    );
  }

  // 成功——重定向到首页，已登录状态
  return NextResponse.redirect(`${origin}/`);
}
