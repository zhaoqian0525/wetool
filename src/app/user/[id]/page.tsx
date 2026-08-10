"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Avatar from "@/components/Avatar";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { fetchToolsByUser, fetchTools, fetchUserLikedTools, type Tool } from "@/lib/data";
import { uploadAvatar } from "@/lib/avatar";

export default function UserPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const isSelf = user?.id === id;

  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [myTools, setMyTools] = useState<Tool[]>([]);
  const [likedTools, setLikedTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("图片不能超过 5MB");
      return;
    }
    setUploadingAvatar(true);
    try {
      const url = await uploadAvatar(file, user.id);
      if (url) {
        toast.success("头像已更新");
      } else {
        toast.error("头像上传失败，请重试");
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

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
    <div className="min-h-screen bg-page pb-20 lg:pb-0">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* User header（v1.9.10 昵称优先；v1.13.1 头像可更换） */}
        <div className="mb-8 text-center sm:text-left">
          <div className="relative w-16 h-16 mx-auto sm:mx-0 mb-3">
            <Avatar
              url={isSelf ? (user?.user_metadata?.avatar_url as string | undefined) : undefined}
              name={displayName}
              size={64}
              className="shadow-md"
            />
            {isSelf && (
              <>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors disabled:opacity-50"
                  aria-label="更换头像"
                  title="更换头像"
                >
                  {uploadingAvatar ? (
                    <span className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </>
            )}
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
                  className="block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div
                    className="relative aspect-[4/3] overflow-hidden"
                    style={{ background: t.thumbnailGradient || "linear-gradient(135deg,#5046e5,#8b5cf6)" }}
                  >
                    {t.coverUrl && (
                      <Image
                        src={t.coverUrl}
                        alt={t.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 25vw"
                        loading="lazy"
                      />
                    )}
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
                <div key={i} className="bg-white rounded-2xl border border-gray-100 h-32 animate-pulse" />
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
                    className="block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div
                      className="relative aspect-[4/3] overflow-hidden"
                      style={{ background: t.thumbnailGradient || "linear-gradient(135deg,#5046e5,#8b5cf6)" }}
                    >
                      {t.coverUrl && (
                        <Image
                          src={t.coverUrl}
                          alt={t.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, 25vw"
                          loading="lazy"
                        />
                      )}
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
