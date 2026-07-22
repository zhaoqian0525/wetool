"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { fetchToolById, resolveSourceTool, toggleFavorite, fetchFavoritedToolIds, fetchFavoriteCount, fetchReviews, fetchAverageRating, addReview, type Tool, type Review } from "@/lib/data";
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

  // Load tool
  useEffect(() => {
    fetchToolById(id).then((t) => {
      if (t) {
        resolveSourceTool(t).then(setTool);
      } else {
        setTool(null);
      }
      setLoading(false);
    });
  }, [id]);

  // Load favorite state & count
  useEffect(() => {
    fetchFavoriteCount(id).then(setFavoriteCount);
    if (user?.id) {
      fetchFavoritedToolIds(user.id).then((ids) => {
        setFavorited(ids.includes(id));
      });
    }
  }, [id, user?.id]);

  // Load reviews
  useEffect(() => {
    fetchReviews(id).then(setReviews);
    fetchAverageRating(id).then(setAvgRating);
  }, [id]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center px-4 py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">工具未找到</h2>
          <p className="text-sm text-gray-500 mb-6">这个链接可能已经失效，或工具已被作者删除</p>
          <Link
            href="/"
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            返回广场
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Tool Header */}
        <div className="mb-8">
          <span className="inline-block text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full mb-3">
            {tool.category}
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{tool.title}</h1>
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
          {/* Phone preview */}
          <div className="flex-shrink-0 flex justify-center">
            {tool.code ? (
              <div
                className="relative bg-gray-800 rounded-[36px] p-3 shadow-2xl"
                style={{ width: "399px", height: "731px", maxWidth: "calc(100vw - 32px)" }}
              >
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-gray-700" />
                </div>
                <div className="w-full h-full overflow-hidden rounded-[24px] bg-white">
                  <iframe
                    srcDoc={wrapSecureSrcDoc(tool.code)}
                    title={tool.title}
                    className="w-full h-full border-0"
                    sandbox={IFRAME_SANDBOX}
                  />
                </div>
              </div>
            ) : (
              <div
                className="relative rounded-2xl shadow-lg flex flex-col items-center justify-center p-8"
                style={{
                  background: tool.thumbnailGradient,
                  width: "320px",
                  height: "400px",
                  maxWidth: "calc(100vw - 32px)",
                }}
              >
                <div className="text-center text-white">
                  <div className="text-4xl mb-4">
                    {tool.category === "旅行" ? "✈️" : tool.category === "工程计算" ? "🔧" : tool.category === "教育" ? "📚" : "🏡"}
                  </div>
                  <h2 className="text-xl font-bold mb-2">{tool.title}</h2>
                  <p className="text-sm text-white/80">by @{tool.author}</p>
                </div>
                <div className="absolute bottom-6 flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                  <div className="w-2 h-2 rounded-full bg-white/60" />
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                </div>
              </div>
            )}
          </div>

          {/* Actions sidebar */}
          <div className="flex-1 space-y-4">
            <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
              打开使用
            </button>

            <div className="flex gap-2">
              {user ? (
                <button
                  onClick={handleFavorite}
                  disabled={favoriting}
                  className={`flex-1 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
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
                  className="flex-1 py-2.5 border border-gray-200 text-gray-400 rounded-xl text-sm font-medium text-center hover:bg-gray-50 transition-colors"
                >
                  登录后收藏
                </Link>
              )}
              <button className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                🔗 分享
              </button>
            </div>

            <Link
              href={`/create?source_tool_id=${tool.id}`}
              className="block w-full py-2.5 border border-indigo-200 text-indigo-600 rounded-xl text-sm font-medium text-center hover:bg-indigo-50 transition-colors"
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
            <div className="bg-white rounded-xl p-5 mb-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">写评价</h3>
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => { setNewRating(star); setReviewError(""); }}
                    className={`text-2xl transition-colors ${star <= newRating ? "text-yellow-400" : "text-gray-200"} hover:text-yellow-400`}
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
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50"
                rows={3}
              />
              {reviewError && (
                <p className="text-xs text-red-500 mt-1">{reviewError}</p>
              )}
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="mt-3 px-5 py-2 bg-indigo-600 text-white text-sm rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {submitting ? "提交中..." : "发布评价"}
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-5 mb-6 text-center">
              <p className="text-sm text-gray-500">
                <Link href="/auth" className="text-indigo-600 hover:underline font-medium">登录</Link>后即可发表评价
              </p>
            </div>
          )}

          {/* Review list */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
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
