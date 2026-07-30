"use client";

import { useState, useEffect, useMemo, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { fetchTools, fetchViewCounts, fetchToolsByUser, getPinnedTools, CATEGORIES, type Tool } from "@/lib/data";
import versionInfo from "../../version.json";

// ---- Constants ----

// Extract first emoji from tool's HTML code for card icon
const EMOJI_RE = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;
function getToolEmoji(tool: Tool | Record<string, unknown>): string {
  const code = typeof tool.code === "string" ? tool.code : "";
  const m = code.match(EMOJI_RE);
  if (m) return m[0];
  const cat: Record<string, string> = { "旅行": "✈️", "工程计算": "🔧", "生活": "🏡", "教育": "📚" };
  const category = typeof tool.category === "string" ? tool.category : "";
  return cat[category] || "🛠️";
}

// ---- Component ----

export default function HomePage() {
  const { user } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("全部");
  const [loading, setLoading] = useState(true);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [myTools, setMyTools] = useState<Tool[]>([]);
  const [recentTools, setRecentTools] = useState<Array<Record<string, unknown>>>([]);
  const [myToolsLoading, setMyToolsLoading] = useState(false);
  const [pinnedToolIds, setPinnedToolIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchTools().then((data) => {
      if (cancelled) return;
      setTools(data);
      const ids = data.map((t) => t.id);
      fetchViewCounts(ids).then((counts) => {
        if (!cancelled) setViewCounts(counts);
      });
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  // 加载"我的工具"：从 Supabase 查询
  useEffect(() => {
    if (!user) { setMyTools([]); setMyToolsLoading(false); return; }
    let cancelled = false;
    setMyToolsLoading(true);
    fetchToolsByUser(user.id).then((tools) => {
      if (!cancelled) { setMyTools(tools); setMyToolsLoading(false); }
    }).catch(() => {
      if (!cancelled) { setMyTools([]); setMyToolsLoading(false); }
    });
    return () => { cancelled = true; };
  }, [user?.id]);

  // 加载最近使用的工具
  useEffect(() => {
    if (!user) { setRecentTools([]); return; }
    fetch(`/api/user/recent-tools?userId=${encodeURIComponent(user.id)}`)
      .then((r) => r.json())
      .then((data) => setRecentTools(data.tools || []))
      .catch(() => setRecentTools([]));
  }, [user]);

  // 加载常用工具 ID
  useEffect(() => {
    if (!user) { setPinnedToolIds([]); return; }
    getPinnedTools(user.id).then(ids => setPinnedToolIds(ids));
  }, [user]);

  const filtered = useMemo(() => {
    let list = activeCategory === "全部" ? tools : tools.filter((t) => t.category === activeCategory);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.author.toLowerCase().includes(q) ||
          (t.description ?? "").toLowerCase().includes(q)
      );
    }
    if (sortBy === "popular") {
      list = [...list].sort((a, b) => (viewCounts[b.id] ?? 0) - (viewCounts[a.id] ?? 0));
    } else {
      list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [tools, activeCategory, search, sortBy, viewCounts]);

  // 常用工具（从所有工具中筛选 pinned 的 ID）
  const pinnedTools = useMemo(() => {
    if (pinnedToolIds.length === 0) return [];
    const idSet = new Set(pinnedToolIds);
    return tools.filter((t) => idSet.has(t.id));
  }, [tools, pinnedToolIds]);

  // 合并"我的工具"（自己发布的 + 常用的）
  const combinedMyTools = useMemo(() => {
    const myIds = new Set(myTools.map(t => t.id));
    const combined = [...myTools];
    for (const pt of pinnedTools) {
      if (!myIds.has(pt.id)) combined.push(pt);
    }
    return combined;
  }, [myTools, pinnedTools]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Navbar
        children={
          <span className="hidden sm:inline text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            AI 工具集市
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/guide"
              className="min-w-[44px] min-h-[44px] hidden sm:flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              教程
            </Link>
            <Link
              href="/create"
              className="min-w-[44px] min-h-[44px] flex items-center px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
            >
              开始创作
            </Link>
          </div>
        }
      />

      {/* Hero / Search / Category Filter */}
      <main>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-3 sm:pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
          发现实用小工具
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mb-4">
          像逛街一样，逛逛大家用 AI 做的好东西
        </p>

        {/* Search bar */}
        <div className="relative mb-4">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索工具名称、作者或描述..."
            className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all"
            style={{ fontSize: "16px" }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category + Sort */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex-shrink-0 min-h-[44px] flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.key
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <span className="mr-1.5">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => setSortBy("latest")}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center px-3 rounded-lg text-xs font-medium transition-all ${
                sortBy === "latest" ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              最新
            </button>
            <button
              onClick={() => setSortBy("popular")}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center px-3 rounded-lg text-xs font-medium transition-all ${
                sortBy === "popular" ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              热门
            </button>
          </div>
        </div>
      </section>

      {/* Newbie guide banner */}
      <GuideBanner />

      {/* 最近使用（已登录且有记录时显示，无记录不显示） */}
      {user ? (
        recentTools.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span>🕐</span>最近使用
            </h2>
            {/* 横向滚动容器 */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
              {recentTools.map((t: Record<string, unknown>) => (
                <Link
                  key={String(t.id)}
                  href={`/tool/${t.id}`}
                  className="flex-shrink-0 w-[120px] sm:w-[140px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover-float group"
                >
                  {/* 封面：渐变背景 + emoji */}
                  <div
                    className="aspect-square flex items-center justify-center"
                    style={{ background: String(t.thumbnailGradient || "linear-gradient(135deg, #4f46e5, #7c3aed)") }}
                  >
                    <span className="text-3xl sm:text-4xl">{getToolEmoji(t)}</span>
                  </div>
                  {/* 标题 */}
                  <div className="p-2">
                    <h3 className="text-xs font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                      {String(t.title || "").length > 8
                        ? String(t.title).slice(0, 8) + "…"
                        : String(t.title || "")}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )
      ) : (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-indigo-700">登录后可快速找回最近使用的工具</p>
            <Link
              href="/auth"
              className="flex-shrink-0 inline-flex items-center gap-1 min-h-[32px] px-4 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              登录
            </Link>
          </div>
        </section>
      )}

      {/* 我的工具（已登录时显示，加载中/无数据时有对应状态） */}
      {user && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>📦</span>我的工具
            {!myToolsLoading && <span className="text-xs font-normal text-gray-400">({combinedMyTools.length} 个)</span>}
            {pinnedTools.length > 0 && <span className="text-xs font-normal text-indigo-400">含 {pinnedTools.length} 个常用</span>}
          </h2>
          {myToolsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {[1,2,3,4].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : combinedMyTools.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {combinedMyTools.map((t) => (
              <Link
                key={t.id}
                href={`/tool/${t.id}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover-float group"
              >
                <div
                  className="aspect-[4/3] flex items-center justify-center"
                  style={{ background: t.thumbnailGradient || "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
                >
                  <span className="text-3xl">{getToolEmoji(t)}</span>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{t.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">@{t.author}</p>
                  {pinnedToolIds.includes(t.id) && (
                    <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600">📌 常用</span>
                  )}
                  {t.visibility !== "public" && (
                    <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                      t.visibility === "private" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}>{t.visibility === "private" ? "私密" : "未列出"}</span>
                  )}
                </div>
              </Link>
            ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-gray-200 rounded-xl p-6 text-center">
              <p className="text-sm text-gray-400 mb-3">还没有发布工具</p>
              <Link href="/create" className="inline-flex items-center gap-1 text-xs text-indigo-600 font-medium hover:text-indigo-700">
                ✨ 创建第一个工具
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Tool Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 lg:pb-16">
        {loading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState category={activeCategory} search={search} />
        ) : (
          <>
            <p className="text-xs text-gray-500 mb-3">{filtered.length} 个工具</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filtered.map((tool) => (
                <ToolCard key={tool.id} tool={tool} viewCount={viewCounts[tool.id]} />
              ))}
            </div>
          </>
        )}
      </section>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 pb-8 lg:pb-12 text-center">
        <p className="text-xs text-gray-500">
          微坞 WeWoo · 像发朋友圈一样分享你做的 AI 小工具
        </p>
        <p className="text-[10px] text-gray-400 mt-1">
          v{versionInfo.version} · {versionInfo.buildDate}
        </p>
      </footer>
    </div>
  );
}

// ---- ToolCard — React.memo 防止不必要的重渲染 ----

const ToolCard = memo(function ToolCard({ tool, viewCount }: { tool: Tool; viewCount?: number }) {
  const emoji = getToolEmoji(tool);

  return (
    <Link
      href={`/tool/${tool.id}`}
      className="group card-hover-float block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Thumbnail: cover_url > gradient placeholder */}
      <div className="relative aspect-[4/3] flex flex-col items-center justify-center overflow-hidden">
        {tool.coverUrl ? (
          <Image
            src={tool.coverUrl}
            alt={tool.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
          />
        ) : (
          <>
            {/* Gradient background placeholder — 无 cover 时显示 */}
            <div className="absolute inset-0" style={{ background: tool.thumbnailGradient }} />
            {/* Large emoji icon */}
            <span className="relative z-10 text-3xl sm:text-4xl mb-1.5 drop-shadow-lg group-hover:scale-110 transition-transform duration-200">
              {emoji}
            </span>
            {/* Title */}
            <span className="relative z-10 text-white font-bold text-xs sm:text-sm text-center drop-shadow-md line-clamp-2 px-3">
              {tool.title}
            </span>
          </>
        )}
        {/* Category badge */}
        <span className="absolute top-2 right-2 z-10 bg-white/25 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
          {tool.category}
        </span>
        {/* 下载型标签 */}
        {tool.isDownloadable && (
          <span className="absolute top-2 left-2 z-10 bg-white/25 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
            💻 下载型
          </span>
        )}
        {/* Stats badges */}
        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1">
          {viewCount !== undefined && viewCount > 0 && (
            <span className="flex items-center gap-0.5 bg-white/25 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded-full">
              👁 {viewCount > 999 ? (viewCount / 1000).toFixed(1) + "k" : viewCount}
            </span>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
          {tool.title}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5 truncate">@{tool.author}</p>
        {tool.description && (
          <p className="text-xs text-gray-600 mt-1.5 line-clamp-2 leading-relaxed">
            {tool.description}
          </p>
        )}
      </div>
    </Link>
  );
});

// ---- Guide banner (first-time visitor) ----

function GuideBanner() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem("wewoo-guide-banner-dismissed");
      if (seen) setDismissed(true);
    } catch {
      // ignore
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem("wewoo-guide-banner-dismissed", "1");
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-2">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3 sm:gap-4">
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-xl sm:text-2xl">
          📖
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">第一次来？看看新手教程</p>
          <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">5 分钟学会做你的第一个小工具，不会编程也能做</p>
        </div>
        <Link
          href="/guide"
          className="flex-shrink-0 min-h-[44px] flex items-center px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
        >
          查看教程
        </Link>
        <button
          onClick={dismiss}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-500 transition-colors"
          aria-label="关闭"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ---- Loading skeleton ----

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
        >
          <div className="aspect-[4/3] bg-gray-200" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Empty state ----

function EmptyState({ category, search }: { category: string; search: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center animate-in fade-in duration-300">
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-inner">
          <svg className="w-12 h-12 sm:w-14 sm:h-14 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        {/* Floating sparkles */}
        <div className="absolute -top-1 -right-1 text-lg animate-bounce" style={{ animationDuration: "1.5s" }}>✨</div>
        <div className="absolute -bottom-2 -left-1 text-base animate-bounce" style={{ animationDuration: "2s", animationDelay: "0.3s" }}>💡</div>
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
        {search ? `没有找到「${search}」相关的工具` : "这里还是空的"}
      </h3>
      <p className="text-sm text-gray-500 mb-6 max-w-xs leading-relaxed">
        {search
          ? "换个关键词试试，或者成为第一个分享这类工具的人"
          : category === "全部"
          ? "还没有人发布工具！成为第一个创作者，把你的想法变成一个实用小工具分享给大家"
          : `「${category}」分类下还没有工具，做第一个吃螃蟹的人吧`}
      </p>
      <Link
        href="/create"
        className="min-h-[44px] flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-md shadow-indigo-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        开始创作
      </Link>
    </div>
  );
}
