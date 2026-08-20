"use client";

import { useState, useEffect, useMemo, useRef, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { fetchTools, loadToolsCacheSync, fetchViewCounts, fetchToolsByUser, fetchUserLikedTools, CATEGORIES, type Tool } from "@/lib/data";
import { authedFetch } from "@/lib/api-client";
import versionInfo from "../../version.json";
import { WewooMark } from "@/components/WewooLogo";
import { Badge } from "@/components/ui";

// ---- Constants ----



// ---- Component ----

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("全部");
  const [loading, setLoading] = useState(true);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [myTools, setMyTools] = useState<Tool[]>([]);
  const [recentTools, setRecentTools] = useState<Array<Record<string, unknown>>>([]);
  const [myToolsLoading, setMyToolsLoading] = useState(false);
  const [pinnedToolIds, setPinnedToolIds] = useState<string[]>([]);
  const [likedTools, setLikedTools] = useState<Tool[]>([]);
  const [serverResults, setServerResults] = useState<Tool[] | null>(null);
  // v1.9 PWA 登录状态提示：仅全站主屏幕入口（standalone）且未登录时显示
  const [standalone, setStandalone] = useState(false);
  const [authBannerDismissed, setAuthBannerDismissed] = useState(false);
  useEffect(() => {
    try {
      setStandalone(
        window.matchMedia("(display-mode: standalone)").matches ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (navigator as any).standalone === true
      );
    } catch { /* ignore */ }
  }, []);

  // 缓存优先：先同步渲染上次数据（弱网/慢接口时首屏秒开），再后台刷新替换
  useEffect(() => {
    const cached = loadToolsCacheSync();
    if (cached.tools.length > 0) {
      setTools(cached.tools);
      setLoading(false);
    }
  }, []);

  // 加载工具列表 + 浏览量：并行发起，互不阻塞；列表刷新后补充新工具浏览量
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cached = loadToolsCacheSync();
      const [data, cachedCounts] = await Promise.all([
        fetchTools(),
        cached.tools.length > 0
          ? fetchViewCounts(cached.tools.map((t) => t.id))
          : Promise.resolve({} as Record<string, number>),
      ]);
      if (cancelled) return;
      setTools(data);
// v2.0.0：列表接口已带 view_count，直接并入状态（减少一次额外查询）；
      // ????????? viewCount ??? fetchViewCounts ??
      const countsFromList: Record<string, number> = {};
      for (const t of data) {
        if (t.viewCount !== undefined) countsFromList[t.id] = t.viewCount;
      }
      setViewCounts((prev) => ({ ...countsFromList, ...cachedCounts, ...prev }));
      setLoading(false);
      const freshIds = data
        .map((t) => t.id)
        .filter((id) => !(id in cachedCounts) && !(id in countsFromList));
      if (freshIds.length > 0) {
        fetchViewCounts(freshIds).then((extra) => {
          if (!cancelled) setViewCounts((prev) => ({ ...prev, ...extra }));
        });
      }
    })();
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

  // 加载最近使用的工具（缓存优先：先同步显示上次数据，再后台刷新替换，避免比其他区块晚 1-2 秒）
  useEffect(() => {
    if (!user) { setRecentTools([]); return; }
    let cancelled = false;
    const cacheKey = "wewoo-recent-" + user.id;
    // 先同步渲染缓存，保证与首页其他区块同时出现
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached && Array.isArray(cached.tools)) {
          setRecentTools(cached.tools);
        }
      }
    } catch {
      // 缓存解析失败，忽略
    }
    authedFetch(`/api/user/recent-tools`)
      .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        // 401/登录态失效或服务端错误：保留本地缓存数据，避免"最近使用"区块凭空消失
        if (!ok) return;
        const tools = Array.isArray(data.tools) ? data.tools : [];
        setRecentTools(tools);
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), tools }));
        } catch {
          // 缓存写入失败（如隐私模式），忽略
        }
      })
      .catch(() => {
        // 网络失败：保留本地缓存数据，不覆盖
      });
    return () => { cancelled = true; };
  }, [user]);

  // 加载收藏的工具
  useEffect(() => {
    if (!user) { setLikedTools([]); return; }
    fetchUserLikedTools(user.id, "save").then(tools => setLikedTools(tools));
  }, [user]);

  // 服务端搜索：输入防抖 300ms；结果与本地内置工具合并展示（见 filtered）
  useEffect(() => {
    const q = search.trim();
    if (!q) { setServerResults(null); return; }
    let cancelled = false;
    const timer = setTimeout(() => {
      authedFetch("/api/tools/search?q=" + encodeURIComponent(q))
        .then((r) => r.json())
        .then((data) => {
          if (!cancelled) setServerResults((data.tools || []) as Tool[]);
        })
        .catch(() => { if (!cancelled) setServerResults(null); });
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [search]);

  // 搜索时隐藏"最近使用/我的工具"等区块，让搜索结果紧跟在搜索框下方（移动端更顺手）
  const isSearching = search.trim().length > 0;

  const filtered = useMemo(() => {
    let list = activeCategory === "全部" ? tools : tools.filter((t) => t.category === activeCategory);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      // 本地（含内置工具）过滤，保证离线/慢网络时仍可用
      const localMatch = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.author.toLowerCase().includes(q) ||
          (t.description ?? "").toLowerCase().includes(q)
      );
      // 服务端搜索结果补充：不在本地列表中的才加入（去重）
      const knownIds = new Set(list.map((t) => t.id));
      const serverExtra = (serverResults ?? [])
        .filter((t) => !knownIds.has(t.id))
        .filter((t) => activeCategory === "全部" || t.category === activeCategory);
      list = [...serverExtra, ...localMatch];
    }
    if (sortBy === "popular") {
      list = [...list].sort((a, b) => (viewCounts[b.id] ?? 0) - (viewCounts[a.id] ?? 0));
    } else {
      list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [tools, activeCategory, search, sortBy, viewCounts, serverResults]);

  // 常用工具（从所有工具中筛选 pinned 的 ID）
  const pinnedTools = useMemo(() => {
    if (pinnedToolIds.length === 0) return [];
    const idSet = new Set(pinnedToolIds);
    return tools.filter((t) => idSet.has(t.id));
  }, [tools, pinnedToolIds]);

  // 合并"我的工具"（自己发布的 + 收藏的）
  const combinedMyTools = useMemo(() => {
    const myIds = new Set(myTools.map(t => t.id));
    const combined = [...myTools];
    for (const lt of likedTools) {
      if (!myIds.has(lt.id)) combined.push(lt);
    }
    return combined;
  }, [myTools, likedTools]);

  // v2.7.0 个性化首页：基于收藏分类推荐同分类热门工具
  const recommendedTools = useMemo(() => {
    if (!user || likedTools.length === 0) return [];
    const likedCategories = new Set(likedTools.map((t) => t.category).filter(Boolean));
    const likedIds = new Set(likedTools.map((t) => t.id));
    const myIds = new Set(myTools.map((t) => t.id));
    return tools
      .filter((t) => likedCategories.has(t.category) && !likedIds.has(t.id) && !myIds.has(t.id))
      .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
      .slice(0, 8);
  }, [user, likedTools, myTools, tools]);

  return (
    <div className="min-h-screen bg-page pb-20 lg:pb-0">
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
              href="/create?new=1"
              className="min-w-[44px] min-h-[44px] flex items-center px-4 py-1.5 text-sm brand-gradient text-white rounded-xl hover:opacity-90 transition-colors font-medium"
            >
              开始创作
            </Link>
          </div>
        }
      />

      {/* Hero / Search / Category Filter */}
      <main>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
        {/* 标题行：大标题 + 搜索图标（v1.9.7） */}
        <div className="flex items-center justify-between gap-3 mb-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">AI 工具广场</h1>
          <button
            onClick={() => {
              if (searchOpen) {
                setSearch("");
                setSearchOpen(false);
              } else {
                setSearchOpen(true);
                setTimeout(() => searchRef.current?.focus(), 50);
              }
            }}
            aria-label={searchOpen ? "关闭搜索" : "搜索工具"}
            className={`min-w-[44px] min-h-[44px] flex-shrink-0 flex items-center justify-center rounded-full transition-all ${
              searchOpen
                ? "bg-indigo-50 text-indigo-600"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {searchOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" /></svg>
            )}
          </button>
        </div>

        {/* 搜索框：点击图标展开（v1.9.7 压缩） */}
        {searchOpen && (
          <div className="relative mt-2 mb-3 animate-in fade-in duration-200">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") { setSearch(""); setSearchOpen(false); } }}
              placeholder="搜索工具名称、作者或描述..."
              className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all"
              style={{ fontSize: "16px" }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="清空搜索"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </section>

      {/* v1.9 PWA 全站入口登录状态提示（仅 standalone 且未登录） */}
      {!isSearching && standalone && !user && !authLoading && !authBannerDismissed && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-3">
          <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl px-4 py-3 shadow-md shadow-indigo-200/50">
            <div className="flex items-center gap-2.5 text-sm leading-snug">
              <span className="text-base flex-shrink-0">🔑</span>
              <span>未登录 · 登录后可保存使用记录、收藏工具</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Link
                href="/auth"
                className="min-h-[44px] flex items-center px-4 bg-white text-indigo-600 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
              >
                去登录
              </Link>
              <button
                onClick={() => setAuthBannerDismissed(true)}
                aria-label="关闭提示"
                className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Newbie guide banner */}
      {!isSearching && <GuideBanner />}

      {/* 最近使用（已登录且有记录时显示，无记录不显示；搜索时隐藏） */}
      {!isSearching && (user ? (
        recentTools.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
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
                  {/* 封面：封面图优先，无封面用渐变占位 */}
                  <div
                    className="relative aspect-square overflow-hidden"
                    style={{ background: String(t.thumbnailGradient || "linear-gradient(135deg, #5046e5, #8b5cf6)") }}
                  >
                    {t.coverUrl ? (
                      <Image
                        src={String(t.coverUrl)}
                        alt={String(t.title)}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 30vw, 15vw"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                  {/* 标题 */}
                  <div className="p-2">
                    <h3 className="text-xs font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                      {String(t.title || "")}
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
      ))}

      {/* 我的工具 — 紧凑横向滚动（搜索时隐藏） */}
      {!isSearching && user && combinedMyTools.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-3">
          <h2 className="text-xs font-semibold text-gray-500 mb-1.5">📦 我的工具 · {combinedMyTools.length} 个</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1"
               style={{scrollbarWidth:"none", msOverflowStyle:"none"}}>
            {combinedMyTools.map((t) => (
              <Link
                key={t.id}
                href={`/tool/${t.id}`}
                className="flex-shrink-0 w-24 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div
                  className="relative h-16 overflow-hidden"
                  style={{ background: t.thumbnailGradient || "linear-gradient(135deg, #5046e5, #8b5cf6)" }}
                >
                  {t.coverUrl && (
                    <Image
                      src={t.coverUrl}
                      alt={t.title}
                      fill
                      className="object-cover"
                      sizes="96px"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="px-2 py-1.5">
                  <p className="text-xs font-medium text-gray-800 truncate leading-tight">{t.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 为你推荐（v2.7.0：根据收藏分类推荐同分类热门工具） */}
      {!isSearching && user && recommendedTools.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-3">
          <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
            <span>✨</span>为你推荐
            <span className="text-xs font-normal text-gray-400">· 根据你的收藏</span>
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
            {recommendedTools.map((t) => (
              <Link
                key={t.id}
                href={`/tool/${t.id}`}
                className="flex-shrink-0 w-[120px] sm:w-[140px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover-float group"
              >
                <div
                  className="relative aspect-square overflow-hidden"
                  style={{ background: t.thumbnailGradient || "linear-gradient(135deg, #5046e5, #8b5cf6)" }}
                >
                  {t.coverUrl ? (
                    <Image
                      src={t.coverUrl}
                      alt={t.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 30vw, 15vw"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div className="p-2">
                  <h3 className="text-xs font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                    {t.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 分类 + 排序（v1.9.5：与广场内容在一起，位于最近使用/我的工具下方） */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-1 pb-3">
        <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
          <span>{isSearching ? "🔍" : "🧩"}</span>
          {isSearching ? "搜索结果" : "广场"}
          {!loading && filtered.length > 0 && (
            <span className="text-xs font-normal text-gray-400">· {filtered.length} 个工具</span>
          )}
        </h2>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex-shrink-0 min-h-[44px] flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.key
                    ? "brand-gradient text-white shadow-md shadow-indigo-200"
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
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center px-3 rounded-full text-xs font-medium transition-all ${
                sortBy === "latest" ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              最新
            </button>
            <button
              onClick={() => setSortBy("popular")}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center px-3 rounded-full text-xs font-medium transition-all ${
                sortBy === "popular" ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              热门
            </button>
          </div>
        </div>
      </section>
      {/* Tool Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 lg:pb-16">
        {loading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState category={activeCategory} search={search} />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filtered.map((tool, idx) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  viewCount={viewCounts[tool.id] ?? tool.viewCount}
                  rank={sortBy === "popular" && !isSearching ? idx + 1 : undefined}
                />
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

const ToolCard = memo(function ToolCard({ tool, viewCount, rank }: { tool: Tool; viewCount?: number; rank?: number }) {
  return (
    <Link
      href={`/tool/${tool.id}`}
      className="group card-hover-float block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Thumbnail: 纯净封面，不叠加任何徽章（v1.9.2） */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {rank != null && rank <= 3 && (
          <div
            className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow ${
              rank === 1 ? "bg-amber-500" : rank === 2 ? "bg-slate-400" : "bg-orange-700"
            }`}
          >
            {rank}
          </div>
        )}
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
          <div className="absolute inset-0" style={{ background: tool.thumbnailGradient }} />
        )}
      </div>

      {/* Card body：信息集中在下方，分层清晰 */}
      <div className="p-3">
        <h3 className="flex items-center gap-1 text-[15px] font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
          <span className="truncate">{tool.title}</span>
          {tool.isDownloadable && (
            <Badge tone="amber" className="flex-shrink-0 text-[10px] px-1.5 py-0.5 border border-amber-200">
              💻 下载
            </Badge>
          )}
        </h3>
        <div className="flex items-center justify-between gap-2 mt-1.5">
          <p className="text-xs text-gray-500 truncate">@{tool.author}</p>
          {viewCount !== undefined && viewCount > 0 && (
            <span className="flex-shrink-0 text-[11px] text-gray-400 flex items-center gap-0.5">
              👁 {viewCount > 999 ? (viewCount / 1000).toFixed(1) + "k" : viewCount}
            </span>
          )}
        </div>
        {tool.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
            {tool.description}
          </p>
        )}
      </div>
    </Link>
  );
});

// ---- Guide banner (first-time visitor) ----

function GuideBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // 游客与登录用户分开记忆：登录后即使关过游客版提示，也能再看一次教程入口
  const bannerKey = user ? "wewoo-guide-banner-dismissed-login" : "wewoo-guide-banner-dismissed";

  useEffect(() => {
    try {
      const seen = localStorage.getItem(bannerKey);
      if (seen) setDismissed(true);
    } catch {
      // ignore
    }
  }, [bannerKey]);

  const dismiss = () => {
    try {
      localStorage.setItem(bannerKey, "1");
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-2">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3 sm:gap-4">
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-full flex items-center justify-center text-xl sm:text-2xl">
          📖
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">
            {user ? "想不起来怎么做？看看新手教程" : "第一次来？看看新手教程"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">不会编程也能做，5 分钟上手，随时可以回来复习</p>
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
          <WewooMark className="w-12 h-12 sm:w-14 sm:h-14" />
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
        href="/create?new=1"
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
