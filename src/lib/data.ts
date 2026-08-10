/**
 * 数据层 API（v1.7.0 从单文件拆分出内置工具部分，见 mock-tools.ts）
 *
 * - 从 mock-tools.ts 复用类型/常量/内置工具，并对外保持导出兼容
 * - 业务函数：工具/评论/点赞/收藏/浏览量/最近使用等
 */
import {
  CATEGORIES,
  MOCK_TOOLS,
  MOCK_REVIEWS,
  getMockReviews,
  setMockReviews,
} from "./mock-tools";
import type {
  Tool,
  ToolCategory,
  Visibility,
  Favorite,
  Review,
} from "./mock-tools";

// 对外保持兼容的导出（原 data.ts 的公共 API）
export { CATEGORIES, MOCK_TOOLS };
export type { Tool, ToolCategory, Visibility, Favorite, Review };

// ---- Helpers ----

/** Row mapper: Supabase row → Tool object */
function mapRow(row: Record<string, unknown>): Tool {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    author: String(row.author ?? ""),
    authorId: row.author_id ? String(row.author_id) : undefined,
    category: row.category as ToolCategory,
    code: String(row.code ?? ""),
    thumbnailGradient:
      String(row.thumbnail_gradient ?? row.thumbnailGradient ?? ""),
    coverUrl: row.cover_url ? String(row.cover_url) : undefined,
    createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString()),
    description: row.description ? String(row.description) : undefined,
    sourceToolId: row.source_tool_id ? String(row.source_tool_id) : undefined,
    viewCount: row.view_count !== undefined && row.view_count !== null ? Number(row.view_count) : undefined,
    visibility: (["public", "unlisted", "private"].includes(String(row.visibility ?? ""))
      ? String(row.visibility)
      : "public") as Visibility,
    isDownloadable: row.is_downloadable === true || row.is_downloadable === "true" || row.isDownloadable === true || undefined,
  };
}

// ---- Supabase client singleton (cached, lazy) ----

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabaseClient: any | null | undefined;

async function getSupabaseClient() {
  // Return cached null if already known to be unavailable
  if (_supabaseClient === null) return null;
  // Return cached client if already created
  if (_supabaseClient) return _supabaseClient;

  // 使用 supabase.ts 的单例，确保 auth session 全局同步
  const { getSupabase } = await import("@/lib/supabase");
  const client = getSupabase();
  if (!client) {
    _supabaseClient = null;
    return null;
  }
  _supabaseClient = client;
  return _supabaseClient;
}

/** Split an array into chunks of at most `size` elements each. */
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/** Wrap a Supabase query with a 3-second timeout. Returns null on timeout. */
async function queryWithTimeout<T>(promise: Promise<T>, timeoutMs = 3000): Promise<T | null> {
  try {
    const result = await Promise.race([
      promise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
    return result;
  } catch {
    return null;
  }
}

// ---- Tool data fetching ----

function loadLocalTools(): Tool[] {
  try {
    if (typeof localStorage === "undefined") return [];
    const raw = localStorage.getItem("wewoo-published-tools");
    if (!raw) return [];
    return JSON.parse(raw).map((t: Record<string, unknown>) => ({
      id: "local-" + (t.id || ""),
      title: String(t.title ?? "未命名"),
      author: String(t.author ?? "匿名"),
      authorId: t.author_id ? String(t.author_id) : undefined,
      category: (t.category || "生活") as ToolCategory,
      code: String(t.code ?? ""),
      thumbnailGradient: String(t.thumbnailGradient ?? t.thumbnail_gradient ?? ""),
      createdAt: String(t.createdAt ?? new Date().toISOString()),
      description: t.description ? String(t.description) : undefined,
      visibility: (["public", "unlisted", "private"].includes(String(t.visibility ?? t.is_public !== false ? "public" : "private"))
        ? String(t.visibility ?? (t.is_public !== false ? "public" : "private"))
        : "public") as Visibility,
      isDownloadable: t.is_downloadable === true || undefined,
    }));
  } catch {
    return [];
  }
}

function loadJson(key: string, fallback: unknown) {
  try { return JSON.parse(localStorage.getItem(key) || ""); } catch { return fallback; }
}
function saveJson(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* quota */ }
}

// ---- 常用工具置顶（Supabase 云端同步） ----

export async function getPinnedTools(userId: string): Promise<string[]> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    const result = await queryWithTimeout(
      supabase.from("user_pinned_tools")
        .select("tool_id")
        .eq("user_id", userId)
        .order("pinned_at", { ascending: false })
    );
    if (result && !(result as { error: unknown }).error && (result as { data: unknown }).data) {
      return ((result as { data: Record<string, unknown>[] }).data).map(r => String(r.tool_id));
    }
  }
  // 兜底：localStorage 旧数据
  try { return JSON.parse(localStorage.getItem("wewoo-pinned-" + userId) || "[]") as string[]; } catch { return []; }
}

export async function togglePinnedTool(userId: string, toolId: string): Promise<boolean> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    // 检查是否已存在
    const { data: existing } = await supabase
      .from("user_pinned_tools")
      .select("id")
      .eq("user_id", userId)
      .eq("tool_id", toolId)
      .maybeSingle();

    if (existing) {
      // 取消置顶
      await supabase.from("user_pinned_tools").delete().eq("id", existing.id);
      return false;
    } else {
      // 添加置顶（最多 8 个）
      const { count } = await supabase.from("user_pinned_tools")
        .select("*", { count: "exact", head: true }).eq("user_id", userId);
      if ((count ?? 0) >= 8) {
        // 删除最旧的
        const { data: oldest } = await supabase.from("user_pinned_tools")
          .select("id").eq("user_id", userId).order("pinned_at", { ascending: true }).limit(1);
        if (oldest?.[0]) {
          await supabase.from("user_pinned_tools").delete().eq("id", oldest[0].id);
        }
      }
      await supabase.from("user_pinned_tools").insert({
        user_id: userId, tool_id: toolId,
        pinned_at: new Date().toISOString(),
      });
      return true;
    }
  }
  throw new Error("数据库未连接");
}

export async function isPinned(userId: string, toolId: string): Promise<boolean> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    const { data } = await supabase.from("user_pinned_tools")
      .select("id").eq("user_id", userId).eq("tool_id", toolId).maybeSingle();
    return !!data;
  }
  return false;
}

// 首页工具缓存：Supabase 慢/不可用时兜底展示最近一次成功数据
// v1.7.0：缓存带时间戳与结构版本，首页先同步渲染缓存再后台刷新
const TOOLS_CACHE_KEY = "wewoo-tools-cache";
const TOOLS_CACHE_TTL = 60_000; // 60 秒内视为新鲜（仍会后台刷新，避免数据过期）
const TOOLS_CACHE_VERSION = 2; // 缓存结构版本，升级后旧缓存自动失效

interface ToolsCacheEntry {
  savedAt: number;
  version: number;
  tools: Tool[];
}

function loadCachedTools(): Tool[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(TOOLS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // 兼容旧格式（纯数组）
    const tools: Tool[] = Array.isArray(parsed) ? parsed : parsed.tools;
    const version = Array.isArray(parsed) ? 1 : (parsed.version ?? 1);
    if (!Array.isArray(tools) || version !== TOOLS_CACHE_VERSION) return [];
    return tools;
  } catch {
    return [];
  }
}

/** 同步读取缓存（供首页首屏先渲染）。返回缓存工具列表与是否新鲜。 */
export function loadToolsCacheSync(): { tools: Tool[]; fresh: boolean } {
  const tools = loadCachedTools();
  if (tools.length === 0) return { tools: [], fresh: false };
  let fresh = false;
  try {
    const raw = localStorage.getItem(TOOLS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const savedAt = Array.isArray(parsed) ? 0 : (parsed.savedAt ?? 0);
      fresh = Date.now() - savedAt < TOOLS_CACHE_TTL;
    }
  } catch {
    // 忽略解析失败
  }
  return { tools, fresh };
}

function saveToolsCache(tools: Tool[]) {
  if (typeof localStorage === "undefined") return;
  try {
    const entry: ToolsCacheEntry = {
      savedAt: Date.now(),
      version: TOOLS_CACHE_VERSION,
      tools,
    };
    localStorage.setItem(TOOLS_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage 满则跳过缓存
  }
}

export async function fetchTools(): Promise<Tool[]> {
  const supabase = await getSupabaseClient();
  let dbTools: Tool[] = [];
  if (supabase) {
    // 网络慢时给足时间（6s），超时/失败重试一次；仍失败则用本地缓存兜底
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = await queryWithTimeout(
        supabase.from("tools").select("id, title, description, author, author_id, category, cover_url, thumbnail_gradient, is_downloadable, created_at, visibility, source_tool_id, view_count").order("created_at", { ascending: false }),
        6000
      );
      if (result && !(result as { error: unknown }).error) {
        const rows = (result as { data: Record<string, unknown>[] }).data;
        if (rows && rows.length > 0) {
          dbTools = rows.map(mapRow);
          saveToolsCache(dbTools);
          break;
        }
      }
    }
    if (dbTools.length === 0) dbTools = loadCachedTools();
  }
  // 合并本地发布的公开工具
  const localPublic = loadLocalTools().filter((t) => t.visibility === "public");
  const merged = [...localPublic, ...dbTools, ...MOCK_TOOLS];
  // 去重
  const seen = new Set<string>();
  const builtinIds = new Set(MOCK_TOOLS.map((m) => m.id));
  return merged.filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    // 默认封面：仅内置工具存在公共封面文件，用户工具无封面时前端显示渐变占位
    if (!t.coverUrl && builtinIds.has(t.id)) t.coverUrl = `/covers/${t.id}.webp`;
    return true;
  });
}

export async function fetchToolById(id: string): Promise<Tool | null> {
  // 本地工具
  if (id.startsWith("local-")) {
    const local = loadLocalTools().find((t) => t.id === id);
    if (local) return local;
  }
  const supabase = await getSupabaseClient();
  if (supabase) {
    const result = await queryWithTimeout(
      supabase.from("tools").select("*").eq("id", id).single()
    );
    if (result && !(result as { error: unknown }).error && (result as { data: unknown }).data) {
      const tool = mapRow((result as { data: Record<string, unknown> }).data);
      writeToolDetailCache(tool);
      return tool;
    }
  }
  return ensureCover(MOCK_TOOLS.find((t) => t.id === id) ?? null);
}

/** 给工具加默认封面图 */
export interface ToolDetailCacheEntry {
  savedAt: number;
  tool: Tool;
}

// 详情数据缓存（v1.13.0）：fetchToolById 成功后写入，详情页进入时同步预填，实现秒开；
// 网络结果始终覆盖缓存，保证数据最新。TTL 24h，最多缓存 10 个工具（含完整 code，防超限）。
const TOOL_DETAIL_CACHE_PREFIX = "wewoo-tool-detail-";
const TOOL_DETAIL_CACHE_INDEX = "wewoo-tool-detail-index";
const TOOL_DETAIL_CACHE_TTL = 24 * 60 * 60 * 1000;
const TOOL_DETAIL_CACHE_MAX = 10;

function readToolDetailCacheIndex(): string[] {
  try {
    const raw = localStorage.getItem(TOOL_DETAIL_CACHE_INDEX);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** 同步读取工具详情缓存（供详情页首屏预填），TTL 过期或缺失返回 null */
export function readToolDetailCache(id: string): Tool | null {
  try {
    const raw = localStorage.getItem(TOOL_DETAIL_CACHE_PREFIX + id);
    if (!raw) return null;
    const entry = JSON.parse(raw) as ToolDetailCacheEntry;
    if (!entry || !entry.tool || Date.now() - entry.savedAt > TOOL_DETAIL_CACHE_TTL) {
      localStorage.removeItem(TOOL_DETAIL_CACHE_PREFIX + id);
      return null;
    }
    return entry.tool;
  } catch {
    return null;
  }
}

function writeToolDetailCache(tool: Tool): void {
  try {
    localStorage.setItem(TOOL_DETAIL_CACHE_PREFIX + tool.id, JSON.stringify({ savedAt: Date.now(), tool }));
    const index = readToolDetailCacheIndex().filter((x) => x !== tool.id);
    index.unshift(tool.id);
    // 超限：删除最旧条目
    while (index.length > TOOL_DETAIL_CACHE_MAX) {
      const old = index.pop();
      if (old) localStorage.removeItem(TOOL_DETAIL_CACHE_PREFIX + old);
    }
    localStorage.setItem(TOOL_DETAIL_CACHE_INDEX, JSON.stringify(index));
  } catch {
    // localStorage 满/隐私模式：忽略缓存写入
  }
}


function ensureCover(tool: Tool | null): Tool | null {
  if (tool && !tool.coverUrl && MOCK_TOOLS.some((m) => m.id === tool.id)) {
    tool.coverUrl = `/covers/${tool.id}.webp`;
  }
  return tool;
}

export async function fetchToolsByUser(userId: string): Promise<Tool[]> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    const result = await queryWithTimeout(
      supabase.from("tools").select("id, title, description, author, author_id, category, cover_url, thumbnail_gradient, is_downloadable, created_at, visibility, source_tool_id, view_count").eq("author_id", userId).order("created_at", { ascending: false })
    );
    if (result && !(result as { error: unknown }).error && (result as { data: unknown }).data) {
      return ((result as { data: Record<string, unknown>[] }).data).map(mapRow);
    }
  }
  return MOCK_TOOLS.filter((t) => t.authorId === userId).map((t) => ({ ...t, coverUrl: t.coverUrl || `/covers/${t.id}.webp` }));
}

/**
 * Resolve the source tool chain and attach sourceTool info to a tool.
 * Only resolves one level deep (direct parent).
 */
export async function resolveSourceTool(tool: Tool): Promise<Tool> {
  if (!tool.sourceToolId) return tool;
  const source = await fetchToolById(tool.sourceToolId);
  if (source) {
    tool.sourceTool = { id: source.id, title: source.title, author: source.author };
  }
  return tool;
}

// ---- Reviews ----

export async function fetchReviews(toolId: string): Promise<Review[]> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    const result = await queryWithTimeout(
      supabase.from("reviews").select("*").eq("tool_id", toolId).order("created_at", { ascending: false })
    );
    if (result && !(result as { error: unknown }).error && (result as { data: unknown }).data) {
      return ((result as { data: Record<string, unknown>[] }).data).map((row) => ({
        id: String(row.id),
        toolId: String(row.tool_id),
        userId: String(row.user_id),
        userName: String(row.user_name ?? ""),
        rating: Number(row.rating),
        content: String(row.content ?? ""),
        createdAt: String(row.created_at),
      }));
    }
  }
  return getMockReviews()
    .filter((r) => r.toolId === toolId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function fetchAverageRating(
  toolId: string
): Promise<{ average: number; count: number }> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    const result = await queryWithTimeout(
      supabase.from("reviews").select("rating", { count: "exact" }).eq("tool_id", toolId)
    );
    if (result && !(result as { error: unknown }).error && (result as { data: unknown }).data) {
      const data = (result as { data: { rating: number }[]; count: number }).data;
      if (data.length > 0) {
        const avg = data.reduce((s, r) => s + r.rating, 0) / data.length;
        return { average: Math.round(avg * 10) / 10, count: (result as { count: number }).count ?? data.length };
      }
    }
    return { average: 0, count: 0 };
  }
  const reviews = getMockReviews().filter((r) => r.toolId === toolId);
  if (reviews.length === 0) return { average: 0, count: 0 };
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return { average: Math.round(avg * 10) / 10, count: reviews.length };
}

export async function addReview(
  toolId: string,
  userId: string,
  userName: string,
  rating: number,
  content: string
): Promise<Review> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    const result = await queryWithTimeout(
      supabase.from("reviews").insert({
        tool_id: toolId,
        user_id: userId,
        user_name: userName,
        rating,
        content,
        created_at: new Date().toISOString(),
      }).select().single()
    );
    if (result && !(result as { error: unknown }).error && (result as { data: unknown }).data) {
      const row = (result as { data: Record<string, unknown> }).data;
      return {
        id: String(row.id),
        toolId: String(row.tool_id),
        userId: String(row.user_id),
        userName: String(row.user_name ?? ""),
        rating: Number(row.rating),
        content: String(row.content ?? ""),
        createdAt: String(row.created_at),
      };
    }
  }
  // Mock mode
  const newReview: Review = {
    id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    toolId,
    userId,
    userName,
    rating,
    content,
    createdAt: new Date().toISOString(),
  };
  setMockReviews([newReview, ...getMockReviews()]);
  return newReview;
}

// ---- Likes (替代收藏，支持工具和评论点赞) ----

export type LikeTargetType = "tool" | "review" | "save";

export interface Like {
  id: string;
  userId: string;
  targetType: LikeTargetType;
  targetId: string;
  createdAt: string;
}

/** 获取用户对指定目标的点赞状态 */
export async function fetchUserLikes(
  userId: string,
  targetType: LikeTargetType,
  targetIds: string[]
): Promise<Set<string>> {
  if (targetIds.length === 0) return new Set();
  const supabase = await getSupabaseClient();
  if (supabase) {
    const result = await queryWithTimeout(
      supabase.from("likes")
        .select("target_id")
        .eq("user_id", userId)
        .eq("target_type", targetType)
        .in("target_id", targetIds)
    );
    if (result && !(result as { error: unknown }).error && (result as { data: unknown }).data) {
      return new Set(((result as { data: Record<string, unknown>[] }).data).map(r => String(r.target_id)));
    }
  }
  return new Set();
}

/** 切换点赞状态，返回新状态 */
export async function toggleLike(
  userId: string,
  targetType: LikeTargetType,
  targetId: string,
  currentlyLiked: boolean
): Promise<boolean> {
  const supabase = await getSupabaseClient();
  if (!supabase) throw new Error("数据库未连接");

  if (currentlyLiked) {
    const result = await queryWithTimeout(
      supabase.from("likes").delete()
        .eq("user_id", userId)
        .eq("target_type", targetType)
        .eq("target_id", targetId)
    );
    if (result && !(result as { error: unknown }).error) return false;
  } else {
    const result = await queryWithTimeout(
      supabase.from("likes").insert({
        user_id: userId,
        target_type: targetType,
        target_id: targetId,
        created_at: new Date().toISOString(),
      })
    );
    if (result && !(result as { error: unknown }).error) return true;
  }
  throw new Error("操作失败，请稍后重试");
}

/** 获取指定工具的点赞数 */
export async function fetchLikeCount(
  targetType: LikeTargetType,
  targetId: string
): Promise<number> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    const result = await queryWithTimeout(
      supabase.from("likes").select("*", { count: "exact", head: true })
        .eq("target_type", targetType)
        .eq("target_id", targetId)
    );
    if (result && !(result as { error: unknown }).error && (result as { count: number }).count !== null) {
      return (result as { count: number }).count;
    }
  }
  return 0;
}

/** 获取用户点赞过的工具列表（含 MOCK_TOOLS） */
export async function fetchUserLikedTools(userId: string, targetType: LikeTargetType = "tool"): Promise<Tool[]> {
  const supabase = await getSupabaseClient();
  const result: Tool[] = [];
  
  if (supabase) {
    const { data: likeRows, error } = await supabase
      .from("likes")
      .select("target_id")
      .eq("user_id", userId)
      .eq("target_type", targetType)
      .order("created_at", { ascending: false });

    if (!error && likeRows && likeRows.length > 0) {
      const toolIds = likeRows.map((r: Record<string, unknown>) => String(r.target_id));
      // 先查 Supabase
      const { data: dbTools } = await supabase
        .from("tools")
        .select("id, title, description, author, author_id, category, cover_url, thumbnail_gradient, is_downloadable, created_at, visibility, source_tool_id, view_count")
        .in("id", toolIds);
      if (dbTools) result.push(...dbTools.map(mapRow));
      
      // 再查 MOCK_TOOLS 兜底
      for (const tid of toolIds) {
        if (!result.find(t => t.id === tid)) {
          const mock = MOCK_TOOLS.find(t => t.id === tid);
          if (mock) result.push({ ...mock, coverUrl: mock.coverUrl || `/covers/${mock.id}.webp` });
        }
      }
      
      // 按点赞顺序排序
      const idOrder = new Map<string, number>(toolIds.map((id: string, i: number) => [id, i]));
      result.sort((a, b) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99));
    }
  }
  return result;
}

// ---- View counts ----

const MOCK_VIEW_COUNTS: Record<string, number> = {
  "1": 1280, "2": 642, "3": 893, "4": 457, "5": 1024,
  "6": 312, "7": 578, "8": 836, "9": 445, "10": 299,
  "11": 671, "12": 523, "13": 188, "14": 412, "15": 2048, "16": 756,
};

const VIEW_COUNT_KEY = "wewoo-mock-view-counts";

function getMockViewCounts(): Record<string, number> {
  if (typeof window === "undefined") return MOCK_VIEW_COUNTS;
  try {
    const stored = localStorage.getItem(VIEW_COUNT_KEY);
    if (stored) return { ...MOCK_VIEW_COUNTS, ...JSON.parse(stored) };
  } catch {}
  return MOCK_VIEW_COUNTS;
}

function setMockViewCounts(counts: Record<string, number>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VIEW_COUNT_KEY, JSON.stringify(counts));
  } catch {}
}

export async function fetchViewCounts(toolIds: string[]): Promise<Record<string, number>> {
  if (toolIds.length === 0) return {};
  const counts: Record<string, number> = {};
  const supabase = await getSupabaseClient();
  if (supabase) {
    // 仅查询 UUID 工具（数据库 tools 表 id 为 uuid 类型）；内置工具（"1".."18"）等
    // 非 UUID id 混入会触发 PostgREST 400，统一走下方 mock 兜底
    const uuidIds = toolIds.filter((id) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    );
    const chunks = chunkArray(uuidIds, 100);
    for (const chunk of chunks) {
      const result = await queryWithTimeout(
        supabase.from("tools").select("id, view_count").in("id", chunk)
      );
      if (result && !(result as { error: unknown }).error && (result as { data: unknown }).data) {
        const data = (result as { data: { id: string; view_count: number | null }[] }).data;
        for (const row of data) {
          counts[row.id] = row.view_count ?? 0;
        }
      }
    }
  }
  // mock 兜底：内置工具 + 本地工具 + 数据库查不到的行
  const mockCounts = getMockViewCounts();
  for (const id of toolIds) {
    if (counts[id] === undefined) counts[id] = mockCounts[id] ?? 0;
  }
  return counts;
}

export async function incrementToolView(toolId: string): Promise<void> {
  // 会话内去重：同一浏览器会话只计一次浏览量，防止反复进出刷量
  if (typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
    try {
      const key = "wewoo-viewed:" + toolId;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // 隐私模式等场景 sessionStorage 不可用，忽略
    }
  }
  const supabase = await getSupabaseClient();
  if (supabase) {
    // 仅 UUID 格式的工具 ID 才调用 RPC（mock/local 工具的 ID 不是 UUID）
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(toolId);
    if (isUUID) {
      try {
        await supabase.rpc("increment_view_count", { tool_id: toolId });
      } catch {
        // RPC might not exist yet; silently fall back to mock
      }
    }
  }
  // Always update mock counts for offline/preview
  if (typeof window !== "undefined") {
    const counts = getMockViewCounts();
    counts[toolId] = (counts[toolId] ?? 0) + 1;
    setMockViewCounts(counts);
  }
}

// ---- 最近使用 ----

export async function fetchRecentTools(userId: string, limit = 6): Promise<Tool[]> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    const { data: recentRows, error } = await supabase
      .from("tool_recent")
      .select("tool_id")
      .eq("user_id", userId)
      .order("opened_at", { ascending: false })
      .limit(limit);

    if (!error && recentRows && recentRows.length > 0) {
      const toolIds = recentRows.map((r: Record<string, unknown>) => String(r.tool_id));
      const chunks = chunkArray(toolIds, 100);
      const allTools: Tool[] = [];
      for (const chunk of chunks) {
        const result = await queryWithTimeout(
          supabase.from("tools").select("*").in("id", chunk)
        );
        if (result && !(result as { error: unknown }).error && (result as { data: unknown }).data) {
          allTools.push(...((result as { data: Record<string, unknown>[] }).data).map(mapRow));
        }
      }
      // 按最近打开时间排序
      const idOrder = new Map<string, number>(toolIds.map((id: string, i: number) => [id, i]));
      return allTools.sort((a, b) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99));
    }
  }
  return [];
}

