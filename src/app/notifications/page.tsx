"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { authedFetch } from "@/lib/api-client";

interface NotificationItem {
  id: string;
  type: string;
  actor_name?: string | null;
  tool_id?: string | null;
  tool_title?: string | null;
  content?: string | null;
  read: boolean;
  created_at: string;
}

const TYPE_META: Record<string, { icon: string; label: string }> = {
  comment: { icon: "💬", label: "评论" },
  reply: { icon: "↩️", label: "回复" },
  like: { icon: "❤️", label: "点赞" },
  save: { icon: "⭐", label: "收藏" },
  system: { icon: "📢", label: "系统" },
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await authedFetch("/api/notifications");
        if (res.ok) {
          const j = await res.json();
          setItems(j.notifications || []);
          setUnread(j.unread || 0);
        }
      } catch {
        // 忽略加载失败
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const markAll = async () => {
    try {
      await authedFetch("/api/notifications", { method: "PATCH" });
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch {
      // 忽略
    }
  };

  return (
    <div className="min-h-screen bg-page pb-24 lg:pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            🔔 通知
            {unread > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-rose-500 rounded-full">
                {unread}
              </span>
            )}
          </h1>
          {items.length > 0 && unread > 0 && (
            <button
              onClick={markAll}
              className="min-h-[36px] px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              全部已读
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !user ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <p className="text-3xl mb-2">🔔</p>
            <p className="text-sm text-gray-500">登录后可查看通知</p>
            <Link
              href="/auth"
              className="inline-flex items-center mt-4 min-h-[40px] px-5 py-2 bg-indigo-600 text-white text-sm rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
              登录
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm text-gray-400">暂时没有通知</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((n) => {
              const meta = TYPE_META[n.type] ?? TYPE_META.system;
              const title =
                n.type === "comment"
                  ? `${n.actor_name || "有人"} 评论了你的工具${n.tool_title ? `「${n.tool_title}」` : ""}`
                  : n.type === "reply"
                    ? `${n.actor_name || "有人"} 回复了你${n.tool_title ? `「${n.tool_title}」中的评论` : "的评论"}`
                    : n.type === "like"
                      ? `${n.actor_name || "有人"} 点赞了你的工具${n.tool_title ? `「${n.tool_title}」` : ""}`
                      : n.type === "save"
                        ? `${n.actor_name || "有人"} 收藏了你的工具${n.tool_title ? `「${n.tool_title}」` : ""}`
                      : n.content || "系统通知";
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 bg-white rounded-xl border p-3.5 ${
                    n.read ? "border-gray-100" : "border-indigo-100 bg-indigo-50/40"
                  }`}
                >
                  <span className="text-xl leading-none mt-0.5">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-relaxed">{title}</p>
                    {n.content && n.type !== "system" && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.content}</p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(n.created_at).toLocaleString("zh-CN")}
                    </p>
                  </div>
                  {n.tool_id && (
                    <Link
                      href={`/tool/${n.tool_id}`}
                      className="flex-shrink-0 self-center text-xs text-indigo-500 hover:text-indigo-700"
                    >
                      查看
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
