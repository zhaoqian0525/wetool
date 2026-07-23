"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { fetchToolsByUser, fetchFavoritedToolsByUser, type Tool } from "@/lib/data";

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"creations" | "favorites">("creations");
  const [creations, setCreations] = useState<Tool[]>([]);
  const [favs, setFavs] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchToolsByUser(id), fetchFavoritedToolsByUser(id)]).then(
      ([created, favorited]) => {
        setCreations(created);
        setFavs(favorited);
        setLoading(false);
      }
    );
  }, [id]);

  // Derive a display name from the first tool's author or the user id
  const displayName =
    creations[0]?.author ?? favs[0]?.author ?? id.slice(0, 8);

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
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0">
            {displayName[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">@{displayName}</h1>
            <p className="text-sm text-gray-500">
              {creations.length} 个工具 · {favs.length} 个收藏
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-gray-200 w-auto inline-flex">
          <button
            onClick={() => setActiveTab("creations")}
            className={`min-h-[44px] flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "creations"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            创作的工具 ({creations.length})
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`min-h-[44px] flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "favorites"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            收藏的工具 ({favs.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <ToolGrid
            tools={activeTab === "creations" ? creations : favs}
            emptyMessage={
              activeTab === "creations"
                ? "还没有发布过工具"
                : "还没有收藏任何工具"
            }
            emptyCta={
              activeTab === "creations" ? (
                <Link
                  href="/create"
                  className="inline-block mt-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  开始创作
                </Link>
              ) : (
                <Link
                  href="/"
                  className="inline-block mt-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  去广场逛逛
                </Link>
              )
            }
          />
        )}
      </main>
    </div>
  );
}

// ---- Tool Grid ----

function ToolGrid({
  tools,
  emptyMessage,
  emptyCta,
}: {
  tools: Tool[];
  emptyMessage: string;
  emptyCta: React.ReactNode;
}) {
  if (tools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-sm text-gray-500">{emptyMessage}</p>
        {emptyCta}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {tools.map((tool) => (
        <Link
          key={tool.id}
          href={`/tool/${tool.id}`}
          className="group block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all duration-200"
        >
          {/* Thumbnail: cover_url > gradient */}
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
                <div className="absolute inset-0" style={{ background: tool.thumbnailGradient }} />
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-2 left-2 w-12 h-1.5 rounded-full bg-white" />
                  <div className="absolute top-6 left-2 w-8 h-1 rounded-full bg-white" />
                  <div className="absolute top-2 right-2 w-10 h-1 rounded-full bg-white" />
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-8 rounded-lg bg-white/60" />
                </div>
                <span className="relative text-white font-bold text-sm text-center drop-shadow-md line-clamp-2 px-3">
                  {tool.title}
                </span>
              </>
            )}
            <span className="absolute top-2 right-2 z-10 bg-white/20 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
              {tool.category}
            </span>
          </div>
          <div className="p-3">
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
              {tool.title}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              @{tool.author}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ---- Loading Skeleton ----

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
