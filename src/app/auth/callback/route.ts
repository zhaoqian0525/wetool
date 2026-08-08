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

  // v1.8.8 透传 redirect，验证成功后回到来源页（如主屏幕打开的工具）
  const redirectParam = searchParams.get("redirect");
  const safeRedirect =
    redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
      ? redirectParam
      : null;
  const authUrl = (msg: string) =>
    `${origin}/auth?error=${encodeURIComponent(msg)}${
      safeRedirect ? `&redirect=${encodeURIComponent(safeRedirect)}` : ""
    }`;

  // Supabase 返回了错误（如链接过期）
  if (error) {
    return NextResponse.redirect(authUrl(errorDescription || error));
  }

  // 没有 code——直接跳回登录页
  if (!code) {
    return NextResponse.redirect(
      safeRedirect ? `${origin}/auth?redirect=${encodeURIComponent(safeRedirect)}` : `${origin}/auth`
    );
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.redirect(authUrl("Supabase 未配置"));
  }

  // 用 code 交换 session（PKCE 流程）
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(authUrl(exchangeError.message));
  }

  // 成功——重定向到来源页（默认首页），已登录状态
  return NextResponse.redirect(safeRedirect ? `${origin}${safeRedirect}` : `${origin}/`);
}
