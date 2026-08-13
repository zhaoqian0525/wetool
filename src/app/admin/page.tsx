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
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const isAdmin = !!user && ADMIN_EMAILS.includes((user.email ?? "").toLowerCase());

  const load = useCallback(async () => {
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
              {(["pending", "all"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    tab === t ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-200"
                  }`}
                >
                  {t === "pending" ? "待处理举报" : "全部举报"}
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
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}