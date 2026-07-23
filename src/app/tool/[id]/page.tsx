"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { fetchToolById, resolveSourceTool, toggleFavorite, fetchFavoritedToolIds, fetchFavoriteCount, fetchReviews, fetchAverageRating, addReview, fetchTools, type Tool, type Review } from "@/lib/data";
import { wrapSecureSrcDoc, IFRAME_SANDBOX } from "@/lib/sandbox";

export default function ToolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [favoriting, setFavoriting] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState({ average: 0, count: 0 });
  const [newRating, setNewRating] = useState(0);
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Fullscreen + share
  const [fullscreen, setFullscreen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Related tools
  const [related, setRelated] = useState<Tool[]>([]);

  // 🔥 iframe 加载状态 — 显示骨架屏直到 iframe onLoad 触发
  const [iframeLoaded, setIframeLoaded] = useState(false);
  // 当 tool 变化时重置 iframe 加载状态
  useEffect(() => {
    setIframeLoaded(false);
  }, [tool?.id]);

  // 🔥 合并主数据加载
  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      // 并行加载 tool、reviews、rating
      const [t, revs, avg] = await Promise.all([
        fetchToolById(id),
        fetchReviews(id),
        fetchAverageRating(id),
      ]);

      if (cancelled) return;

      if (t) {
        const resolved = await resolveSourceTool(t);
        if (cancelled) return;
        setTool(resolved);
        // 加载关联工具
        fetchTools().then((all) => {
          if (cancelled) return;
          setRelated(all.filter((rt) => rt.category === resolved.category && rt.id !== resolved.id).slice(0, 4));
        });
      } else {
        setTool(null);
      }

      setReviews(revs);
      setAvgRating(avg);
      setLoading(false);
    }

    loadAll();

    // 并行加载收藏状态
    fetchFavoriteCount(id).then((c) => { if (!cancelled) setFavoriteCount(c); });
    if (user?.id) {
      fetchFavoritedToolIds(user.id).then((ids) => {
        if (!cancelled) setFavorited(ids.includes(id));
      });
    }

    return () => { cancelled = true; };
  }, [id, user?.id]);

  // Share handler
  const handleShare = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: tool?.title, url }); } catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } catch { /* ignore */ }
    }
  }, [tool]);

  const handleFavorite = useCallback(async () => {
    if (!user || favoriting) return;
    setFavoriting(true);
    try {
      const newState = await toggleFavorite(user.id, id, favorited);
      setFavorited(newState);
      setFavoriteCount((c) => (newState ? c + 1 : Math.max(0, c - 1)));
    } finally {
      setFavoriting(false);
    }
  }, [user, id, favorited, favoriting]);

  const handleSubmitReview = useCallback(async () => {
    if (!user || submitting) return;
    if (newRating === 0) {
      setReviewError("请先选择评分");
      return;
    }
    if (!newContent.trim()) {
      setReviewError("请输入评价内容");
      return;
    }
    setSubmitting(true);
    setReviewError("");
    try {
      const review = await addReview(id, user.id, user.user_metadata?.name || user.email?.split("@")[0] || "匿名用户", newRating, newContent.trim());
      setReviews((prev) => [review, ...prev]);
      setAvgRating((prev) => {
        const newTotal = prev.average * prev.count + newRating;
        const newCount = prev.count + 1;
        return { average: Math.round((newTotal / newCount) * 10) / 10, count: newCount };
      });
      setNewRating(0);
      setNewContent("");
    } finally {
      setSubmitting(false);
    }
  }, [user, id, newRating, newContent, submitting]);

  // 🔥 预计算 srcDoc（避免每次渲染都重新计算）
  const previewSrcDoc = tool?.code ? wrapSecureSrcDoc(tool.code) : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <DetailSkeleton />
        </main>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
        <Navbar />
        <div className="flex flex-col items-center justify-center px-4 py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">工具未找到</h2>
          <p className="text-sm text-gray-500 mb-6">这个链接可能已经失效，或工具已被作者删除</p>
          <Link
            href="/"
            className="min-h-[44px] flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            返回广场
          </Link>
        </div>
      </div>
    );
  }

  const categoryEmoji: Record<string, string> = { "旅行": "✈️", "工程计算": "🔧", "生活": "🏡", "教育": "📚" };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Navbar
        children={
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回广场
          </Link>
        }
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Tool Header */}
        <div className="mb-6 sm:mb-8">
          <span className="inline-block text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full mb-3">
            {tool.category}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{tool.title}</h1>
          {tool.description && (
            <p className="text-sm text-gray-500 mb-4">{tool.description}</p>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
            <span>
              by{" "}
              {tool.authorId ? (
                <Link href={`/user/${tool.authorId}`} className="text-indigo-600 hover:underline">
                  @{tool.author}
                </Link>
              ) : (
                `@${tool.author}`
              )}
            </span>
            <span>·</span>
            <span>{new Date(tool.createdAt).toLocaleDateString("zh-CN")}</span>
            {favoriteCount > 0 && (
              <>
                <span>·</span>
                <span className="text-red-400">♥ {favoriteCount} 收藏</span>
              </>
            )}
          </div>

          {/* Source tool chain */}
          {tool.sourceTool && (
            <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
              <span>✨ 改编自</span>
              <Link
                href={`/tool/${tool.sourceTool.id}`}
                className="text-indigo-600 hover:underline font-medium"
              >
                @{tool.sourceTool.author}
              </Link>
              <span>的</span>
              <span className="text-gray-700">《{tool.sourceTool.title}》</span>
            </div>
          )}
        </div>

        {/* Preview & Actions */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile: simple iframe preview */}
          <div className="lg:hidden">
            {tool.code ? (
              <div className="rounded-xl overflow-hidden shadow-lg bg-white relative" style={{ height: "500px" }}>
                {/* 🔥 骨架屏：iframe 加载完毕前显示 */}
                {!iframeLoaded && <IframeSkeleton />}
                <iframe
                  srcDoc={previewSrcDoc}
                  title={tool.title}
                  className="w-full h-full border-0"
                  sandbox={IFRAME_SANDBOX}
                  onLoad={() => setIframeLoaded(true)}
                  style={{ opacity: iframeLoaded ? 1 : 0, transition: "opacity 0.3s" }}
                />
              </div>
            ) : (
              <div className="rounded-xl shadow-lg flex flex-col items-center justify-center p-8" style={{ background: tool.thumbnailGradient, height: "300px" }}>
                <span className="text-4xl mb-2">{categoryEmoji[tool.category] || "🛠️"}</span>
                <span className="text-white font-bold">{tool.title}</span>
              </div>
            )}
          </div>

          {/* Desktop: phone frame preview */}
          <div className="hidden lg:flex flex-shrink-0 justify-center">
            {tool.code ? (
              <div
                className="relative bg-gray-800 rounded-[36px] p-3 shadow-2xl"
                style={{ width: "399px", height: "731px" }}
              >
                {/* Smaller notch */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-b-2xl z-10" />
                <div className="w-full h-full overflow-hidden rounded-[24px] bg-white flex flex-col relative">
                  {/* Spacer so notch doesn't cover content */}
                  <div className="h-5 flex-shrink-0" />
                  {/* 🔥 骨骼屏 */}
                  {!iframeLoaded && <IframeSkeleton />}
                  <iframe
                    srcDoc={previewSrcDoc}
                    title={tool.title}
                    className="flex-1 w-full border-0"
                    sandbox={IFRAME_SANDBOX}
                    onLoad={() => setIframeLoaded(true)}
                    style={{ opacity: iframeLoaded ? 1 : 0, transition: "opacity 0.3s" }}
                  />
                </div>
              </div>
            ) : (
              <div
                className="relative rounded-2xl shadow-lg flex flex-col items-center justify-center p-8"
                style={{ background: tool.thumbnailGradient, width: "320px", height: "400px" }}
              >
                <div className="text-center text-white">
                  <div className="text-4xl mb-4">{categoryEmoji[tool.category] || "🛠️"}</div>
                  <h2 className="text-xl font-bold mb-2">{tool.title}</h2>
                  <p className="text-sm text-white/80">by @{tool.author}</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions sidebar */}
          <div className="flex-1 space-y-3 sm:space-y-4">
            <button
              onClick={() => setFullscreen(true)}
              className="w-full min-h-[48px] py-3 bg-indigo-600 text-white rounded-xl text-base font-medium hover:bg-indigo-700 transition-colors"
            >
              打开使用
            </button>

            <div className="flex gap-2">
              {user ? (
                <button
                  onClick={handleFavorite}
                  disabled={favoriting}
                  className={`flex-1 min-h-[44px] py-2.5 border rounded-xl text-sm font-medium transition-colors ${
                    favorited
                      ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  } ${favoriting ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {favoriting ? "..." : favorited ? "❤️ 已收藏" : "🤍 收藏"}
                </button>
              ) : (
                <Link
                  href="/auth"
                  className="flex-1 min-h-[44px] flex items-center justify-center py-2.5 border border-gray-200 text-gray-400 rounded-xl text-sm font-medium text-center hover:bg-gray-50 transition-colors"
                >
                  登录后收藏
                </Link>
              )}
              <button
                onClick={handleShare}
                className="flex-1 min-h-[44px] py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                {shareCopied ? "✓ 链接已复制" : "🔗 分享"}
              </button>
            </div>

            <Link
              href={`/create?source_tool_id=${tool.id}`}
              className="block w-full min-h-[44px] flex items-center justify-center py-2.5 border border-indigo-200 text-indigo-600 rounded-xl text-sm font-medium text-center hover:bg-indigo-50 transition-colors"
            >
              ✨ 改编这个工具
            </Link>

            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <div className="text-xs text-gray-400">
                <span className="font-medium text-gray-500">分类</span> · {tool.category}
              </div>
              <div className="text-xs text-gray-400">
                <span className="font-medium text-gray-500">发布</span> · {new Date(tool.createdAt).toLocaleDateString("zh-CN")}
              </div>
              <div className="text-xs text-gray-400">
                <span className="font-medium text-gray-500">作者</span> ·{" "}
                {tool.authorId ? (
                  <Link href={`/user/${tool.authorId}`} className="text-indigo-600 hover:underline">
                    @{tool.author}
                  </Link>
                ) : (
                  `@${tool.author}`
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related tools */}
        {related.length > 0 && (
          <section className="mt-12 border-t border-gray-200 pt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">相关工具</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {related.map((rt) => (
                <Link
                  key={rt.id}
                  href={`/tool/${rt.id}`}
                  className="group block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all"
                >
                  <div className="relative aspect-[4/3] flex items-center justify-center overflow-hidden" style={{ background: rt.thumbnailGradient }}>
                    <span className="text-white font-bold text-xs text-center drop-shadow-md line-clamp-2 px-2">{rt.title}</span>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-700 group-hover:text-indigo-600 truncate">{rt.title}</p>
                    <p className="text-[10px] text-gray-400 truncate">@{rt.author}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Fullscreen tool overlay */}
        {fullscreen && tool.code && (
          <div className="fixed inset-0 z-50 bg-white flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shadow-sm">
              <span className="text-sm font-medium text-gray-800 truncate">{tool.title}</span>
              <button
                onClick={() => setFullscreen(false)}
                className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0"
              >
                ✕ 退出全屏
              </button>
            </div>
            <iframe
              srcDoc={previewSrcDoc}
              title={tool.title}
              className="flex-1 w-full border-0"
              sandbox={IFRAME_SANDBOX}
            />
          </div>
        )}

        {/* Reviews Section */}
        <section className="mt-12 border-t border-gray-200 pt-8">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-bold text-gray-900">用户评价</h2>
            {avgRating.count > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-sm ${star <= Math.round(avgRating.average) ? "text-yellow-400" : "text-gray-200"}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">{avgRating.average}</span>
                <span className="text-xs text-gray-400">({avgRating.count} 条评价)</span>
              </div>
            )}
          </div>

          {/* Write review */}
          {user ? (
            <div className="bg-white rounded-2xl p-4 sm:p-5 mb-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">写评价</h3>
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => { setNewRating(star); setReviewError(""); }}
                    className={`min-w-[44px] min-h-[44px] flex items-center justify-center text-2xl transition-colors ${star <= newRating ? "text-yellow-400" : "text-gray-200"} hover:text-yellow-400`}
                  >
                    ★
                  </button>
                ))}
                {newRating > 0 && (
                  <span className="text-xs text-gray-400 ml-2">
                    {newRating === 5 ? "太棒了！" : newRating === 4 ? "很不错" : newRating === 3 ? "一般般" : newRating === 2 ? "有待改进" : "很差"}
                  </span>
                )}
              </div>
              <textarea
                value={newContent}
                onChange={(e) => { setNewContent(e.target.value); setReviewError(""); }}
                placeholder="分享你的使用体验..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-base resize-none focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50"
                style={{ fontSize: "16px" }}
                rows={3}
              />
              {reviewError && (
                <p className="text-xs text-red-500 mt-1">{reviewError}</p>
              )}
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="mt-3 min-h-[44px] px-5 py-2 bg-indigo-600 text-white text-sm rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {submitting ? "提交中..." : "发布评价"}
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-center">
              <p className="text-sm text-gray-500">
                <Link href="/auth" className="text-indigo-600 hover:underline font-medium">登录</Link>后即可发表评价
              </p>
            </div>
          )}

          {/* Review list */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {review.userName[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{review.userName}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString("zh-CN")}
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-sm ${star <= review.rating ? "text-yellow-400" : "text-gray-200"}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{review.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm text-gray-400">还没有评价，来第一个评价吧</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// ---- Iframe 加载骨架屏 ----

function IframeSkeleton() {
  return (
    <div className="absolute inset-0 bg-white flex flex-col items-center justify-center animate-pulse">
      {/* 模拟手机内容的骨架 */}
      <div className="w-full max-w-[280px] space-y-3 px-6">
        {/* Header bar */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gray-200" />
          <div className="flex-1 h-3 bg-gray-200 rounded" />
        </div>
        {/* Card block */}
        <div className="rounded-xl border border-gray-100 p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
          <div className="h-10 bg-gray-200 rounded-lg mt-2" />
        </div>
        {/* Small cards */}
        <div className="grid grid-cols-2 gap-2">
          <div className="h-16 bg-gray-100 rounded-xl" />
          <div className="h-16 bg-gray-100 rounded-xl" />
        </div>
        {/* List items */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-4/5" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
      </div>
      <p className="mt-6 text-xs text-gray-300">工具加载中...</p>
    </div>
  );
}

// ---- 详情页加载骨架屏 ----

function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-5 bg-gray-200 rounded-full w-16 mb-3" />
        <div className="h-7 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-3/4 mb-4" />
        <div className="flex gap-4">
          <div className="h-4 bg-gray-100 rounded w-24" />
          <div className="h-4 bg-gray-100 rounded w-20" />
        </div>
      </div>
      <div className="flex gap-8">
        <div className="w-[399px] h-[731px] bg-gray-100 rounded-[36px] hidden lg:block" />
        <div className="h-[300px] lg:hidden w-full bg-gray-100 rounded-xl" />
        <div className="flex-1 space-y-3">
          <div className="h-12 bg-gray-100 rounded-xl" />
          <div className="flex gap-2">
            <div className="flex-1 h-11 bg-gray-100 rounded-xl" />
            <div className="flex-1 h-11 bg-gray-100 rounded-xl" />
          </div>
          <div className="h-11 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
