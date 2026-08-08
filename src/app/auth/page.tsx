"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { WewooMark } from "@/components/WewooLogo";

/** 将 Supabase 错误信息映射为中文友好提示 */
function mapAuthError(msg: string): string {
  if (!msg) return "操作失败，请重试";

  const lower = msg.toLowerCase();

  // 网络/CORS/CSP 相关——"Failed to fetch" 系列
  if (lower.includes("failed to fetch") || lower.includes("networkerror") || lower.includes("network request failed")) {
    return "网络连接失败，无法连接到服务器。请检查网络代理或 VPN 设置后重试。";
  }
  if (lower.includes("cors") || lower.includes("blocked by cors")) {
    return "请求被安全策略拦截。如果你在用代理/VPN，请尝试关闭后重试。";
  }

  // 登录相关
  if (lower.includes("invalid login credentials")) {
    return "邮箱或密码错误";
  }
  if (lower.includes("email not confirmed")) {
    return "邮箱尚未验证，请检查收件箱（含垃圾邮件）完成验证后再登录";
  }

  // 注册相关
  if (lower.includes("already registered") || lower.includes("user already registered")) {
    return "该邮箱已注册，请直接登录";
  }
  if (lower.includes("already been registered")) {
    return "该邮箱已注册，请直接登录";
  }
  if (lower.includes("password should be at least")) {
    return "密码长度不足，至少需要 6 个字符";
  }
  if (lower.includes("signup is disabled")) {
    return "注册功能暂时关闭";
  }

  // 频率限制 — 邮箱额度耗尽
  if (lower.includes("rate limit") || lower.includes("for security purposes")) {
    if (lower.includes("email")) {
      return "邮箱验证额度已耗尽，请稍后再试。或联系管理员在 Supabase 中关闭邮箱验证。";
    }
    return "请求太频繁：" + msg + "（等待 60 秒后重试）";
  }

  // 配置错误
  if (lower.includes("supabase") && lower.includes("not configured")) {
    return "服务未正确配置，请联系管理员";
  }

  // 其他——直接显示原始消息
  return msg;
}

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, configured, signUp, signIn } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState(""); // 成功提示（如"请验证邮箱"）
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // 冷却倒计时
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(c => {
      if (c <= 1) return 0;
      return c - 1;
    }), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // 从 URL 参数读取错误（来自 /auth/callback 重定向）
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      setError(decodeURIComponent(urlError));
    }
  }, [searchParams]);

  // 已登录——跳转首页
  useEffect(() => {
    if (user && !loading) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email || !password) {
      setError("请填写邮箱和密码");
      return;
    }

    if (tab === "register" && password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    if (password.length < 6) {
      setError("密码至少需要 6 个字符");
      return;
    }

    setSubmitting(true);
    try {
      const result =
        tab === "login"
          ? await signIn(email, password)
          : await signUp(email, password);

      // ---- 有错误 ----
      if (result.error) {
        const msg = result.error.message.toLowerCase();
        setError(mapAuthError(result.error.message));
        // 频率限制：触发 60 秒冷却
        if (msg.includes("rate limit") || msg.includes("for security")) {
          setCooldown(60);
        } else {
          setCooldown(0);
        }
        return;
      }

      // ---- 注册成功 ----
      if (tab === "register") {
        const identities = result.data?.identities;
        const user = result.data?.user;

        // identities.length === 0 → 需要邮箱验证
        // 或者 user 存在但 session 为 null → 需要验证
        if (
          (identities && identities.length === 0) ||
          (user && !user.email_confirmed_at)
        ) {
          // 需要邮箱验证——不自动登录
          setInfo("注册成功！我们已向你的邮箱发送了一封验证邮件，请检查收件箱（含垃圾邮件）完成验证后再登录。");
          // 切换到登录页签，保留邮箱
          setTab("login");
          setPassword("");
          setConfirmPassword("");
        } else {
          // 无需验证——直接跳转首页（AuthProvider 的 onAuthStateChange 会触发）
          router.push("/");
        }
        return;
      }

      // ---- 登录成功 ----
      if (tab === "login") {
        if (result.data?.user) {
          router.push("/");
        } else {
          // 理论上不应发生
          setError("登录异常，请重试");
        }
      }
    } catch (err) {
      // 捕获未预期的异常（如网络中断）
      const msg = err instanceof Error ? err.message : "未知错误";
      setError(mapAuthError(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 lg:pb-0">
      {/* 顶部导航 */}
      <header className="h-12 sm:h-14 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-4 flex-shrink-0">
        <Link href="/" className="flex items-center gap-1.5 text-base sm:text-lg font-bold text-indigo-600">
          <WewooMark className="w-6 h-6" />
          微坞
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-sm">
          {/* 标题 */}
          <div className="text-center mb-8">
            <WewooMark className="w-12 h-12 mx-auto mb-3" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              {tab === "login" ? "欢迎回来" : "加入微坞"}
            </h1>
            <p className="text-sm text-gray-500">
              {tab === "login"
                ? "登录你的账号，继续创作和收藏"
                : "注册一个账号，开始分享你的工具"}
            </p>
          </div>

          {/* Supabase 未配置提示 */}
          {!configured && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
              服务暂未配置，无法使用注册/登录功能。
              <br />
              需要设置{" "}
              <code className="bg-amber-100 px-1 rounded text-xs">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
              和{" "}
              <code className="bg-amber-100 px-1 rounded text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>。
            </div>
          )}

          {/* 成功提示（验证邮箱） */}
          {info && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-start gap-2">
                <span className="text-xl flex-shrink-0">✅</span>
                <div>
                  <p className="text-sm font-medium text-green-800 mb-1">注册成功</p>
                  <p className="text-sm text-green-700 leading-relaxed">{info}</p>
                </div>
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-2">
                <span className="text-sm flex-shrink-0">⚠️</span>
                <p className="text-sm text-red-600 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* 页签切换 */}
          <div className="flex border border-gray-200 rounded-xl mb-6 bg-white p-1">
            <button
              onClick={() => {
                setTab("login");
                setError("");
                setInfo("");
              }}
              className={`flex-1 min-h-[44px] py-2.5 text-sm font-medium rounded-lg transition-all ${
                tab === "login"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              登录
            </button>
            <button
              onClick={() => {
                setTab("register");
                setError("");
                setInfo("");
              }}
              className={`flex-1 min-h-[44px] py-2.5 text-sm font-medium rounded-lg transition-all ${
                tab === "register"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              注册
            </button>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                邮箱
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full min-h-[48px] px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                style={{ fontSize: "16px" }}
                disabled={submitting || !configured}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 个字符"
                className="w-full min-h-[48px] px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                style={{ fontSize: "16px" }}
                disabled={submitting || !configured}
                autoComplete={tab === "login" ? "current-password" : "new-password"}
                required
              />
            </div>

            {tab === "register" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="confirmPassword">
                  确认密码
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入密码"
                  className="w-full min-h-[48px] px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                  style={{ fontSize: "16px" }}
                  disabled={submitting || !configured}
                  autoComplete="new-password"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !configured || cooldown > 0}
              className="w-full min-h-[52px] py-3.5 bg-indigo-600 text-white rounded-xl text-base font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-[0.98]"
            >
              {cooldown > 0 ? (
                `请等待 ${cooldown} 秒`
              ) : submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  处理中...
                </span>
              ) : tab === "login" ? (
                "登录"
              ) : (
                "注册"
              )}
            </button>
          </form>

          {/* 底部 */}
          <p className="mt-6 text-center text-xs text-gray-400">
            登录即表示同意微坞的{" "}
            <Link href="/terms" className="text-indigo-500 hover:underline">
              服务条款
            </Link>{" "}
            和{" "}
            <Link href="/privacy" className="text-indigo-500 hover:underline">
              隐私政策
            </Link>
          </p>

          {tab === "login" && (
            <p className="mt-3 text-center text-xs text-gray-400">
              还没有账号？{" "}
              <button
                onClick={() => {
                  setTab("register");
                  setError("");
                  setInfo("");
                }}
                className="text-indigo-500 hover:underline font-medium"
              >
                立即注册
              </button>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

/** 包装在 Suspense 中，因为 useSearchParams 需要 Suspense 边界 */
export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
