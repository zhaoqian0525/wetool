"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import { authedFetch } from "@/lib/api-client";
import { useToast } from "@/components/ToastProvider";

interface ReportItem {
  id: string;
  toolId: string;
  toolTitle: string;
  isBanned: boolean;
  reason: string;
  status: string;
  note?: string;
  createdAt: string;
}


interface UsageData {
  initialized?: boolean;
  today?: string;
  aiUsage?: {
    recent: { id: string; toolId: string; userId: string | null; ip: string; model: string; promptTokens: number; completionTokens: number; totalTokens: number; createdAt: string }[];
    todayCalls: number;
    todayTokens: number;
    byTool: { tool: string; calls: number; tokens: number }[];
  } | null;
  proxyLog?: {
    recent: { id: string; toolId: string; userId: string | null; ip: string; url: string; status: number; size: number; createdAt: string }[];
    todayCalls: number;
  } | null;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "待处理",
  processing: "处理中",
  resolved: "已处理",
  rejected: "已驳回",
};

/** 管理员邮箱（与 api-auth.ts 的 ADMIN_EMAILS 一致，供前端显示入口） */
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "1015790590@qq.com,zhaoqian970525@gmail.com")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<"pending" | "all" | "usage">("pending");
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const isAdmin = !!user && ADMIN_EMAILS.includes((user.email ?? "").toLowerCase());

  const load = useCallback(async () => {
    if (tab === "usage") {
      setUsageLoading(true);
      try {
        const res = await authedFetch("/api/admin/usage");
        if (res.ok) {
          const data = (await res.json()) as UsageData;
          setUsage(data);
        } else {
          toast.error("用量加载失败，请检查管理员权限");
        }
      } catch {
        toast.error("网络异常");
      } finally {
        setUsageLoading(false);
      }
      return;
    }
    setLoading(true);
    try {
      const res = await authedFetch(`/api/admin/reports?status=${tab}`);
      if (res.ok) {
        const data = (await res.json()) as { reports?: ReportItem[] };
        setReports(data.reports ?? []);
      } else {
        toast.error("加载失败，请检查管理员权限");
      }
    } catch {
      toast.error("网络异常");
    } finally {
      setLoading(false);
    }
  }, [tab, toast]);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const act = async (path: string, body: unknown, successMsg: string) => {
    setBusyId(path);
    try {
      const res = await authedFetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        toast.success(successMsg);
        load();
      } else {
        toast.error(data.error || "操作失败");
      }
    } catch {
      toast.error("网络异常");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">管理后台</h1>
          <Link href="/" className="text-sm text-indigo-600 hover:underline">← 返回首页</Link>
        </div>

        {authLoading ? (
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-20 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        ) : !user ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <p className="text-gray-600 mb-4">请先登录</p>
            <Link href="/auth?redirect=/admin" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm">
              去登录
            </Link>
          </div>
        ) : !isAdmin ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <p className="text-gray-600">当前账号没有管理员权限</p>
            <p className="text-xs text-gray-400 mt-2">管理员邮箱在服务端 ADMIN_EMAILS 环境变量中配置</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              {(["pending", "all", "usage"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    tab === t ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-200"
                  }`}
                >
                  {t === "pending" ? "待处理举报" : t === "all" ? "全部举报" : "用量看板"}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-3">
                <div className="h-20 bg-gray-200 rounded-xl animate-pulse" />
                <div className="h-20 bg-gray-200 rounded-xl animate-pulse" />
              </div>
            ) : reports.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500 text-sm">
                {tab === "pending" ? "暂无待处理举报 🎉" : "暂无举报记录"}
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((r) => (
                  <div key={r.id} className="bg-white rounded-2xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <Link href={`/tool/${r.toolId}`} className="font-medium text-indigo-600 hover:underline break-all">
                          {r.toolTitle}
                        </Link>
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="text-red-500 font-medium">{r.reason}</span>
                          {" · "}
                          {STATUS_LABEL[r.status] ?? r.status}
                          {r.isBanned && <span className="ml-2 text-rose-600 font-medium">（已下架）</span>}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(r.createdAt).toLocaleString("zh-CN")}
                          {r.note ? ` · 备注：${r.note}` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {!r.isBanned && (
                        <button
                          disabled={busyId !== null}
                          onClick={() => act(`/api/admin/tools/${r.toolId}/ban`, { banned: true }, "已下架该工具")}
                          className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs disabled:opacity-50"
                        >
                          下架工具
                        </button>
                      )}
                      {r.isBanned && (
                        <button
                          disabled={busyId !== null}
                          onClick={() => act(`/api/admin/tools/${r.toolId}/ban`, { banned: false }, "已恢复该工具")}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs disabled:opacity-50"
                        >
                          恢复工具
                        </button>
                      )}
                      {r.status === "pending" && (
                        <>
                          <button
                            disabled={busyId !== null}
                            onClick={() => act(`/api/admin/reports/${r.id}/resolve`, { status: "resolved" }, "已标记处理")}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs disabled:opacity-50"
                          >
                            标记已处理
                          </button>
                          <button
                            disabled={busyId !== null}
                            onClick={() => act(`/api/admin/reports/${r.id}/resolve`, { status: "rejected" }, "已驳回举报")}
                            className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-xs disabled:opacity-50"
                          >
                            驳回举报
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "usage" && (
              <div className="space-y-4">
                {usageLoading ? (
                  <div className="space-y-3">
                    <div className="h-20 bg-gray-200 rounded-xl animate-pulse" />
                    <div className="h-20 bg-gray-200 rounded-xl animate-pulse" />
                  </div>
                ) : usage && usage.initialized === false ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-sm text-amber-800">
                    用量表尚未初始化：请在 Supabase 执行 SQL 迁移 <code className="font-mono bg-amber-100 px-1 rounded">supabase_v21_m3.sql</code>（ai_usage / proxy_log 表）后刷新。
                  </div>
                ) : usage ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-2xl border border-gray-200 p-4">
                        <div className="text-xs text-gray-500">今日 AI 调用</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{usage.aiUsage?.todayCalls ?? 0} 次</div>
                        <div className="text-xs text-gray-400 mt-1">今日 tokens：{usage.aiUsage?.todayTokens ?? 0}</div>
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-200 p-4">
                        <div className="text-xs text-gray-500">今日代理请求</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{usage.proxyLog?.todayCalls ?? 0} 次</div>
                        <div className="text-xs text-gray-400 mt-1">白名单联网（wewoo.fetch）</div>
                      </div>
                    </div>

                    {usage.aiUsage ? (
                      <div className="bg-white rounded-2xl border border-gray-200 p-4">
                        <h3 className="font-medium text-gray-900 mb-3">AI 用量（按工具）</h3>
                        {usage.aiUsage.byTool.length === 0 ? (
                          <p className="text-sm text-gray-400">今日暂无调用</p>
                        ) : (
                          <div className="space-y-2">
                            {usage.aiUsage.byTool.map((t) => (
                              <div key={t.tool} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700 truncate max-w-[60%]">{t.tool}</span>
                                <span className="text-gray-400 text-xs">{t.calls} 次 · {t.tokens} tokens</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <h3 className="font-medium text-gray-900 mt-4 mb-2">最近调用</h3>
                        {usage.aiUsage.recent.length === 0 ? (
                          <p className="text-sm text-gray-400">暂无记录</p>
                        ) : (
                          <div className="space-y-1.5 text-xs">
                            {usage.aiUsage.recent.map((r) => (
                              <div key={r.id} className="flex items-center justify-between gap-2 border-b border-gray-100 pb-1.5">
                                <span className="text-gray-600 truncate">{r.toolId || "未知工具"}</span>
                                <span className="text-gray-400 shrink-0">{r.totalTokens} tokens · {new Date(r.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl border border-gray-200 p-4 text-sm text-gray-400">AI 用量数据不可用（表未初始化或查询失败）</div>
                    )}

                    {usage.proxyLog ? (
                      <div className="bg-white rounded-2xl border border-gray-200 p-4">
                        <h3 className="font-medium text-gray-900 mb-3">最近代理请求</h3>
                        {usage.proxyLog.recent.length === 0 ? (
                          <p className="text-sm text-gray-400">暂无记录</p>
                        ) : (
                          <div className="space-y-1.5 text-xs">
                            {usage.proxyLog.recent.map((r) => (
                              <div key={r.id} className="flex items-center justify-between gap-2 border-b border-gray-100 pb-1.5">
                                <span className="text-gray-600 truncate">{r.url}</span>
                                <span className="text-gray-400 shrink-0">HTTP {r.status} · {r.size}B · {new Date(r.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl border border-gray-200 p-4 text-sm text-gray-400">代理日志不可用（表未初始化或查询失败）</div>
                    )}
                  </>
                ) : null}
              </div>
            )}

          </>
        )}
      </main>
      <Footer />
    </div>
  );
}