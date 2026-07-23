"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { fetchTools, fetchFavoriteCounts, CATEGORIES, type Tool } from "@/lib/data";

// Extract first emoji from tool's HTML code for card icon
const EMOJI_RE = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;
function getToolEmoji(tool: Tool): string {
  const m = tool.code.match(EMOJI_RE);
  if (m) return m[0];
  const cat: Record<string, string> = { "旅行": "✈️", "工程计算": "🔧", "生活": "🏡", "教育": "📚" };
  return cat[tool.category] || "🛠️";
}

export default function HomePage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("全部");
  const [loading, setLoading] = useState(true);
  const [favoriteCounts, setFavoriteCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");

  useEffect(() => {
    fetchTools().then((data) => {
      setTools(data);
      fetchFavoriteCounts(data.map((t) => t.id)).then(setFavoriteCounts);
      setLoading(false);
    });
  }, []);

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
      list = [...list].sort((a, b) => (favoriteCounts[b.id] ?? 0) - (favoriteCounts[a.id] ?? 0));
    } else {
      list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [tools, activeCategory, search, sortBy, favoriteCounts]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        children={
          <span className="hidden sm:inline text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            AI 工具集市
          </span>
        }
        actions={
          <Link
            href="/create"
            className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            开始创作
          </Link>
        }
      />

      {/* Hero / Search / Category Filter */}
      <section className="max-w-6xl mx-auto px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          发现实用小工具
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          像逛街一样，逛逛大家用 AI 做的好东西
        </p>

        {/* Search bar */}
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索工具名称、作者或描述..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
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
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
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
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === "latest" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              最新
            </button>
            <button
              onClick={() => setSortBy("popular")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === "popular" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              热门
            </button>
          </div>
        </div>
      </section>

      {/* Tool Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        {loading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState category={activeCategory} search={search} />
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">{filtered.length} 个工具</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((tool) => (
                <ToolCard key={tool.id} tool={tool} favoriteCount={favoriteCounts[tool.id]} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 pb-12 text-center">
        <p className="text-xs text-gray-400">
          微坞 WeTool · 像发朋友圈一样分享你做的 AI 小工具
        </p>
      </footer>
    </div>
  );
}

// ---- Tool Card ----

function ToolCard({ tool, favoriteCount }: { tool: Tool; favoriteCount?: number }) {
  const emoji = getToolEmoji(tool);

  return (
    <Link
      href={`/tool/${tool.id}`}
      className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all duration-200"
    >
      {/* Thumbnail */}
      <div
        className="relative aspect-[4/3] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: tool.thumbnailGradient }}
      >
        {/* Large emoji icon */}
        <span className="text-3xl sm:text-4xl mb-1.5 drop-shadow-lg group-hover:scale-110 transition-transform duration-200">
          {emoji}
        </span>
        {/* Title */}
        <span className="relative text-white font-bold text-xs sm:text-sm text-center drop-shadow-md line-clamp-2 px-3">
          {tool.title}
        </span>
        {/* Category badge */}
        <span className="absolute top-2 right-2 bg-white/25 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
          {tool.category}
        </span>
        {/* Favorite count badge */}
        {favoriteCount !== undefined && favoriteCount > 0 && (
          <span className="absolute bottom-2 left-2 flex items-center gap-0.5 bg-white/25 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded-full">
            ♥ {favoriteCount}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
          {tool.title}
        </h3>
        <p className="text-xs text-gray-400 mt-0.5 truncate">@{tool.author}</p>
        {tool.description && (
          <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
            {tool.description}
          </p>
        )}
      </div>
    </Link>
  );
}

// ---- Loading skeleton ----

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"
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
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <h3 className="text-lg font-medium text-gray-600 mb-1">
        {search ? `没有找到「${search}」相关的工具` : "还没有工具"}
      </h3>
      <p className="text-sm text-gray-400 mb-6">
        {search
          ? "换个关键词试试，或者成为第一个分享这类工具的人"
          : category === "全部"
          ? "成为第一个分享工具的人吧"
          : `「${category}」分类下暂无工具，去创作一个吧`}
      </p>
      <Link
        href="/create"
        className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        开始创作
      </Link>
    </div>
  );
}
