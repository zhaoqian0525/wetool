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

interface GrowthData {
  initialized?: boolean;
  hint?: string;
  days?: number;
  excludedTestEvents?: number;
  totals?: {
    events: number;
    visitors: number;
    firstVisit: number;
    returnVisit: number;
    toolOpen: number;
    toolInteraction: number;
    toolCompleted: number;
    shareClick: number;
    shareCompleted: number;
    remixClick: number;
    createStarted: number;
    publishCompleted: number;
    loginStarted: number;
    loginCompleted: number;
    loginReturned: number;
  };
  channels?: {
    source: string;
    medium: string;
    campaign: string;
    content: string;
    visitors: number;
    events: number;
    toolOpen: number;
    toolCompleted: number;
    shareClick: number;
    remixClick: number;
    createStarted: number;
    publishCompleted: number;
  }[];
  tools?: { toolId: string; opens: number; completions: number }[];
  daily?: { date: string; visitors: number; events: number; completions: number }[];
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
  const [tab, setTab] = useState<"pending" | "all" | "growth" | "usage">("pending");
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [growth, setGrowth] = useState<GrowthData | null>(null);
  const [growthLoading, setGrowthLoading] = useState(false);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const isAdmin = !!user && ADMIN_EMAILS.includes((user.email ?? "").toLowerCase());

  const load = useCallback(async () => {
    if (tab === "growth") {
      setGrowthLoading(true);
      try {
        const res = await authedFetch("/api/admin/growth?days=30");
        if (res.ok) {
          setGrowth((await res.json()) as GrowthData);
        } else {
          toast.error("增长看板加载失败，请检查管理员权限");
        }
      } catch {
        toast.error("网络异常");
      } finally {
        setGrowthLoading(false);
      }
      return;
    }
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
            <div className="flex flex-wrap gap-2 mb-4">
              {(["pending", "all", "growth", "usage"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    tab === t ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-200"
                  }`}
                >
                  {t === "pending"
                    ? "待处理举报"
                    : t === "all"
                      ? "全部举报"
                      : t === "growth"
                        ? "渠道看板"
                        : "用量看板"}
                </button>
              ))}
            </div>

            {(tab === "pending" || tab === "all") && (loading ? (
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
            ))}

            {tab === "growth" && (
              <div className="space-y-4">
                {growthLoading ? (
                  <div className="space-y-3">
                    <div className="h-20 bg-gray-200 rounded-xl animate-pulse" />
                    <div className="h-20 bg-gray-200 rounded-xl animate-pulse" />
                  </div>
                ) : growth && growth.initialized === false ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-sm text-amber-800">
                    增长事件表尚未初始化：请在 Supabase SQL Editor 执行
                    <code className="mx-1 rounded bg-amber-100 px-1 font-mono">supabase_v227_growth_events.sql</code>
                    后刷新。
                  </div>
                ) : growth?.totals ? (
                  <>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        ["访客", growth.totals.visitors],
                        ["新访客", growth.totals.firstVisit],
                        ["回访", growth.totals.returnVisit],
                        ["打开工具", growth.totals.toolOpen],
                        ["首次交互", growth.totals.toolInteraction],
                        ["完成工具", growth.totals.toolCompleted],
                        ["分享点击", growth.totals.shareClick],
                        ["分享完成", growth.totals.shareCompleted],
                        ["改编点击", growth.totals.remixClick],
                        ["成功发布", growth.totals.publishCompleted],
                        ["登录完成", growth.totals.loginCompleted],
                        ["登录后返回", growth.totals.loginReturned],
                      ].map(([label, value]) => (
                        <div key={String(label)} className="rounded-2xl border border-gray-200 bg-white p-4">
                          <div className="text-xs text-gray-500">{label}</div>
                          <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
                        </div>
                      ))}
                    </div>
                    {!!growth.excludedTestEvents && (
                      <p className="text-xs text-gray-400">
                        已排除 UTM/内容以 test 开头的测试事件 {growth.excludedTestEvents} 条
                      </p>
                    )}

                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <h3 className="mb-3 font-medium text-gray-900">按渠道（最近 {growth.days ?? 30} 天）</h3>
                      {!growth.channels || growth.channels.length === 0 ? (
                        <p className="text-sm text-gray-400">暂无渠道数据</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[760px] text-left text-xs">
                            <thead className="text-gray-400">
                              <tr>
                                <th className="py-2 pr-3">来源</th>
                                <th className="py-2 pr-3">媒介</th>
                                <th className="py-2 pr-3">活动</th>
                                <th className="py-2 pr-3">内容</th>
                                <th className="py-2 pr-3">访客</th>
                                <th className="py-2 pr-3">打开</th>
                                <th className="py-2 pr-3">完成</th>
                                <th className="py-2 pr-3">分享</th>
                                <th className="py-2 pr-3">改编</th>
                                <th className="py-2">发布</th>
                              </tr>
                            </thead>
                            <tbody>
                              {growth.channels.map((channel) => (
                                <tr key={`${channel.source}|${channel.medium}|${channel.campaign}|${channel.content}`} className="border-t border-gray-100 text-gray-700">
                                  <td className="py-2 pr-3">{channel.source}</td>
                                  <td className="py-2 pr-3">{channel.medium || "—"}</td>
                                  <td className="py-2 pr-3">{channel.campaign || "—"}</td>
                                  <td className="py-2 pr-3">{channel.content || "—"}</td>
                                  <td className="py-2 pr-3 font-semibold">{channel.visitors}</td>
                                  <td className="py-2 pr-3">{channel.toolOpen}</td>
                                  <td className="py-2 pr-3">{channel.toolCompleted}</td>
                                  <td className="py-2 pr-3">{channel.shareClick}</td>
                                  <td className="py-2 pr-3">{channel.remixClick}</td>
                                  <td className="py-2">{channel.publishCompleted}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <h3 className="mb-3 font-medium text-gray-900">工具表现</h3>
                      {!growth.tools || growth.tools.length === 0 ? (
                        <p className="text-sm text-gray-400">暂无工具数据</p>
                      ) : (
                        <div className="space-y-2">
                          {growth.tools.map((tool) => (
                            <div key={tool.toolId} className="flex items-center justify-between gap-2 text-sm">
                              <span className="truncate text-gray-700">{tool.toolId}</span>
                              <span className="shrink-0 text-xs text-gray-400">
                                打开 {tool.opens} · 完成 {tool.completions}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-400">
                    暂无增长数据
                  </div>
                )}
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
