"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { fetchTools, fetchFavoriteCounts, CATEGORIES, type Tool } from "@/lib/data";

export default function HomePage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("全部");
  const [loading, setLoading] = useState(true);
  const [favoriteCounts, setFavoriteCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchTools().then((data) => {
      setTools(data);
      // Fetch favorite counts for all tools
      fetchFavoriteCounts(data.map((t) => t.id)).then(setFavoriteCounts);
      setLoading(false);
    });
  }, []);

  const filtered =
    activeCategory === "全部"
      ? tools
      : tools.filter((t) => t.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
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

      {/* Hero / Category Filter */}
      <section className="max-w-6xl mx-auto px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          发现实用小工具
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          像逛街一样，逛逛大家用 AI 做的好东西
        </p>

        {/* Category Pills */}
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
      </section>

      {/* Tool Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        {loading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState category={activeCategory} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((tool) => (
              <ToolCard key={tool.id} tool={tool} favoriteCount={favoriteCounts[tool.id]} />
            ))}
          </div>
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
  return (
    <Link
      href={`/tool/${tool.id}`}
      className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all duration-200"
    >
      {/* Thumbnail */}
      <div
        className="relative aspect-[4/3] flex flex-col items-center justify-center p-4 overflow-hidden"
        style={{ background: tool.thumbnailGradient }}
      >
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 left-2 w-12 h-1.5 rounded-full bg-white" />
          <div className="absolute top-6 left-2 w-8 h-1 rounded-full bg-white" />
          <div className="absolute top-2 right-2 w-10 h-1 rounded-full bg-white" />
          <div className="absolute top-6 right-2 w-6 h-1 rounded-full bg-white" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-8 rounded-lg bg-white/60" />
        </div>

        {/* Title overlay */}
        <span className="relative text-white font-bold text-sm text-center drop-shadow-md line-clamp-2">
          {tool.title}
        </span>

        {/* Category badge */}
        <span className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
          {tool.category}
        </span>

        {/* Favorite count badge */}
        {favoriteCount !== undefined && favoriteCount > 0 && (
          <span className="absolute bottom-2 left-2 flex items-center gap-0.5 bg-white/20 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded-full">
            ♥ {favoriteCount}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
          {tool.title}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          @{tool.author}
        </p>
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

function EmptyState({ category }: { category: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">📭</div>
      <h3 className="text-lg font-medium text-gray-600 mb-1">还没有工具</h3>
      <p className="text-sm text-gray-400 mb-6">
        {category === "全部"
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
