"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { getPinnedTools, togglePinnedTool, fetchToolsByUser, fetchTools, fetchUserLikedTools, type Tool } from "@/lib/data";

export default function UserPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const isSelf = user?.id === id;

  const [pinned, setPinned] = useState<string[]>([]);
  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [myTools, setMyTools] = useState<Tool[]>([]);
  const [likedTools, setLikedTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getPinnedTools(id).then(setPinned);
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

  const handleTogglePin = useCallback(async (toolId: string) => {
    if (!id) return;
    const added = await togglePinnedTool(id, toolId);
    const updated = await getPinnedTools(id);
    setPinned(updated);
    toast.success(added ? "已添加到常用" : "已取消常用");
  }, [id, toast]);

  // 从所有可用工具中查找置顶工具（不限用户自己发布的）
  const pinnedTools = pinned
    .map((tid) => allTools.find((t) => t.id === tid))
    .filter(Boolean) as Tool[];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* User header */}
        <div className="mb-8 text-center sm:text-left">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl mx-auto sm:mx-0 mb-3">
            {user?.email?.[0]?.toUpperCase() || "?"}
          </div>
          {isSelf ? (
            <h1 className="text-xl font-bold text-gray-900">我的主页</h1>
          ) : (
            <h1 className="text-xl font-bold text-gray-900">
              @{id?.substring(0, 8)} 的主页
            </h1>
          )}
          <p className="text-sm text-gray-500 mt-1">
            已发布 {myTools.length} 个工具
          </p>
        </div>

        {/* 我的常用 */}
        {isSelf && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span>📌</span>我的常用
              {pinnedTools.length > 0 && (
                <span className="text-xs font-normal text-gray-400">({pinnedTools.length}/8)</span>
              )}
            </h2>

            {pinnedTools.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
                <p className="text-sm text-gray-400 mb-3">
                  把常用的工具固定在这里，方便快速打开 →
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center min-h-[44px] px-4 py-2 text-sm text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  去广场挑选
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {pinnedTools.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tool/${t.id}`}
                    className="group relative bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md hover:border-indigo-200 transition-all text-center"
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleTogglePin(t.id);
                      }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors z-10"
                      title="取消常用"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                      </svg>
                    </button>
                    <div
                      className="w-10 h-10 mx-auto rounded-lg flex items-center justify-center text-lg mb-1.5"
                      style={{ background: t.thumbnailGradient || "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
                    >
                      <span className="text-white text-sm">
                        {t.title?.charAt(0) || "🛠"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 font-medium truncate">
                      {t.title.length > 6 ? t.title.substring(0, 6) + "…" : t.title}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

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
                    style={{ background: t.thumbnailGradient || "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
                  >
                    <span className="text-2xl">{t.title?.charAt(0) || "🛠"}</span>
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
                      style={{ background: t.thumbnailGradient || "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
                    >
                      <span className="text-2xl">{t.title?.charAt(0) || "🛠"}</span>
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium text-gray-800 truncate">{t.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{t.category}</p>
                    </div>
                  </Link>
                  {/* 置顶按钮 */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleTogglePin(t.id);
                    }}
                    className={`absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center rounded-lg transition-colors z-10 ${
                      pinned.includes(t.id)
                        ? "bg-indigo-100 text-indigo-600"
                        : "bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100"
                    }`}
                    title={pinned.includes(t.id) ? "取消常用" : "添加到常用"}
                  >
                    <svg className="w-3.5 h-3.5" fill={pinned.includes(t.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
