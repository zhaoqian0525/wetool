"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function AuthPage() {
  const router = useRouter();
  const { user, loading, configured, signUp, signIn } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already logged in — redirect to home
  if (user && !loading) {
    router.replace("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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

      if (result.error) {
        // Map common Supabase errors to Chinese
        const msg = result.error.message;
        if (msg.includes("Invalid login credentials")) {
          setError("邮箱或密码错误");
        } else if (msg.includes("already registered")) {
          setError("该邮箱已注册，请直接登录");
        } else if (msg.includes("Email rate limit")) {
          setError("操作太频繁，请稍后再试");
        } else {
          setError(msg);
        }
      } else if (tab === "register") {
        // Registration successful — check if email confirmation is needed
        setError("");
        setTab("login");
        setPassword("");
        setConfirmPassword("");
        // Supabase may send a confirmation email; show hint
        alert("注册成功！如果开启了邮箱验证，请检查收件箱确认后登录。");
      } else {
        // Login success — redirect
        router.push("/");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 lg:pb-0">
      {/* Simplified header */}
      <header className="h-12 sm:h-14 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-4 flex-shrink-0">
        <Link href="/" className="text-base sm:text-lg font-bold text-indigo-600">
          微坞
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-sm">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              {tab === "login" ? "欢迎回来" : "加入微坞"}
            </h1>
            <p className="text-sm text-gray-500">
              {tab === "login"
                ? "登录你的账号，继续创作和收藏"
                : "注册一个账号，开始分享你的工具"}
            </p>
          </div>

          {/* Supabase not configured hint */}
          {!configured && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
              提示：需要配置 Supabase 环境变量才能启用登录功能。
              <br />
              请设置 <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> 和{" "}
              <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>。
            </div>
          )}

          {/* Tab switcher */}
          <div className="flex border border-gray-200 rounded-xl mb-6 bg-white">
            <button
              onClick={() => {
                setTab("login");
                setError("");
              }}
              className={`flex-1 min-h-[44px] py-2.5 text-sm font-medium rounded-xl transition-all ${
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
              }}
              className={`flex-1 min-h-[44px] py-2.5 text-sm font-medium rounded-xl transition-all ${
                tab === "register"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              注册
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                style={{ fontSize: "16px" }}
                disabled={submitting || !configured}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 个字符"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                style={{ fontSize: "16px" }}
                disabled={submitting || !configured}
                autoComplete={tab === "login" ? "current-password" : "new-password"}
              />
            </div>

            {tab === "register" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  确认密码
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入密码"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                  style={{ fontSize: "16px" }}
                  disabled={submitting || !configured}
                  autoComplete="new-password"
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !configured}
              className="w-full min-h-[48px] py-3 bg-indigo-600 text-white rounded-xl text-base font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting
                ? "处理中..."
                : tab === "login"
                ? "登录"
                : "注册"}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-gray-400">
            登录即表示同意微坞的服务条款和隐私政策
          </p>
        </div>
      </main>
    </div>
  );
}
