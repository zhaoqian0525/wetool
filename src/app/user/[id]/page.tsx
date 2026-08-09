"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { fetchToolsByUser, fetchTools, fetchUserLikedTools, type Tool } from "@/lib/data";
import { getToolEmoji } from "@/lib/constants";

export default function UserPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const isSelf = user?.id === id;

  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [myTools, setMyTools] = useState<Tool[]>([]);
  const [likedTools, setLikedTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetchToolsByUser(id),
      fetchTools(),
      fetchUserLikedTools(id, "save"),
    ]).then(([userTools, all, liked]) => {
      setMyTools(userTools);
      setAllTools(all);
      setLikedTools(liked);
      setLoading(false);
    }).catch(() => { setLoading(false); });
  }, [id]);

  // v1.9.10 昵称展示：自己用昵称/邮箱前缀，他人用其最新工具的作者名
  const displayName = isSelf
    ? user?.user_metadata?.name || user?.email?.split("@")[0] || "我的主页"
    : myTools[0]?.author || "微坞用户";

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* User header（v1.9.10 昵称优先） */}
        <div className="mb-8 text-center sm:text-left">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl mx-auto sm:mx-0 mb-3">
            {displayName[0]?.toUpperCase() || "微"}
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {isSelf ? displayName : `@${displayName} 的主页`}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            已发布 {myTools.length} 个工具
          </p>
        </div>
        {/* 收藏的工具 */}
        {likedTools.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span>⭐</span>{isSelf ? "我收藏的工具" : "收藏的工具"}
              <span className="text-xs font-normal text-gray-400">({likedTools.length} 个)</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {likedTools.map((t) => (
                <Link
                  key={t.id}
                  href={`/tool/${t.id}`}
                  className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div
                    className="aspect-[4/3] flex items-center justify-center"
                    style={{ background: t.thumbnailGradient || "linear-gradient(135deg,#5046e5,#8b5cf6)" }}
                  >
                    <span className="text-2xl">{getToolEmoji(t)}</span>
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-gray-800 truncate">{t.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{t.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 发布的工具 */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>🛠️</span>{isSelf ? "我的工具" : "发布的工具"}
          </h2>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 h-32 animate-pulse" />
              ))}
            </div>
          ) : myTools.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <p className="text-3xl mb-2">🛠️</p>
              <p className="text-sm text-gray-400">还没有发布工具</p>
              {isSelf && (
                <Link
                  href="/create"
                  className="inline-flex items-center min-h-[44px] mt-3 px-4 py-2 text-sm text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  去创作
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {myTools.map((t) => (
                <div key={t.id} className="group relative">
                  <Link
                    href={`/tool/${t.id}`}
                    className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div
                      className="aspect-[4/3] flex items-center justify-center"
                      style={{ background: t.thumbnailGradient || "linear-gradient(135deg,#5046e5,#8b5cf6)" }}
                    >
                      <span className="text-2xl">{getToolEmoji(t)}</span>
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium text-gray-800 truncate">{t.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{t.category}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
