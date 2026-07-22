// ---- Types ----

export type ToolCategory = "旅行" | "工程计算" | "生活" | "教育";

export interface Tool {
  id: string;
  title: string;
  author: string;
  authorId?: string;
  category: ToolCategory;
  code: string;
  thumbnailGradient: string;
  createdAt: string;
  description?: string;
  sourceToolId?: string;
  sourceTool?: { id: string; title: string; author: string };
}

export interface Favorite {
  toolId: string;
  userId: string;
  createdAt: string;
}

export const CATEGORIES: { key: string; label: string; icon: string }[] = [
  { key: "全部", label: "全部", icon: "🏠" },
  { key: "旅行", label: "旅行出门", icon: "✈️" },
  { key: "工程计算", label: "工程计算", icon: "🔧" },
  { key: "生活", label: "生活日常", icon: "🏡" },
  { key: "教育", label: "课堂互动", icon: "📚" },
];

// ---- Mock data ----

const MOCK_TOOLS: Tool[] = [
  {
    id: "1",
    title: "旅行分账计算器",
    author: "旅行达人小明",
    authorId: "user-001",
    category: "旅行",
    code: "",
    thumbnailGradient: "linear-gradient(135deg, #667eea, #764ba2)",
    createdAt: "2026-07-20T10:30:00Z",
    description: "和朋友们一起旅行，快速算出每人该付多少钱",
  },
  {
    id: "2",
    title: "螺栓强度校核",
    author: "老王机械师",
    authorId: "user-002",
    category: "工程计算",
    code: "",
    thumbnailGradient: "linear-gradient(135deg, #f093fb, #f5576c)",
    createdAt: "2026-07-19T14:00:00Z",
    description: "输入螺栓直径和材料参数，一键计算抗拉强度",
  },
  {
    id: "3",
    title: "古诗词随机抽查",
    author: "语文张老师",
    authorId: "user-003",
    category: "教育",
    code: "",
    thumbnailGradient: "linear-gradient(135deg, #4facfe, #00f2fe)",
    createdAt: "2026-07-18T09:15:00Z",
    description: "课堂上随机出题，考考学生的诗词积累",
  },
  {
    id: "4",
    title: "宝宝辅食记录",
    author: "新手妈妈小怡",
    authorId: "user-004",
    category: "生活",
    code: "",
    thumbnailGradient: "linear-gradient(135deg, #fa8231, #f7b731)",
    createdAt: "2026-07-21T16:45:00Z",
    description: "记录每天宝宝吃了什么，自动生成营养报告",
  },
  {
    id: "5",
    title: "酒店比价小助手",
    author: "省钱达人阿杰",
    authorId: "user-005",
    category: "旅行",
    code: "",
    thumbnailGradient: "linear-gradient(135deg, #43e97b, #38f9d7)",
    createdAt: "2026-07-17T11:00:00Z",
    description: "对比多家酒店，找到性价比最高的选择",
  },
  {
    id: "6",
    title: "齿轮参数速算",
    author: "CAD老陈",
    authorId: "user-002",
    category: "工程计算",
    code: "",
    thumbnailGradient: "linear-gradient(135deg, #a18cd1, #fbc2eb)",
    createdAt: "2026-07-16T08:30:00Z",
    description: "输入模数和齿数，秒出节圆直径和中心距",
  },
  {
    id: "7",
    title: "英语单词小测",
    author: "英语李老师",
    authorId: "user-003",
    category: "教育",
    code: "",
    thumbnailGradient: "linear-gradient(135deg, #ffecd2, #fcb69f)",
    createdAt: "2026-07-22T07:00:00Z",
    description: "随机抽取30个四六级词汇，限时拼写测试",
  },
  {
    id: "8",
    title: "每日喝水打卡",
    author: "健康生活家",
    authorId: "user-004",
    category: "生活",
    code: "",
    thumbnailGradient: "linear-gradient(135deg, #667eea, #764ba2)",
    createdAt: "2026-07-20T12:00:00Z",
    description: "设置喝水目标，定时提醒，记录每日饮水",
  },
  {
    id: "9",
    title: "行程花费日记",
    author: "背包客小李",
    authorId: "user-001",
    category: "旅行",
    code: "",
    thumbnailGradient: "linear-gradient(135deg, #f093fb, #f5576c)",
    createdAt: "2026-07-15T18:00:00Z",
    description: "旅途中的每一笔开销都记下来，自动分类统计",
  },
  {
    id: "10",
    title: "单位换算大全",
    author: "工具人大刘",
    authorId: "user-005",
    category: "工程计算",
    code: "",
    thumbnailGradient: "linear-gradient(135deg, #4facfe, #00f2fe)",
    createdAt: "2026-07-14T13:00:00Z",
    description: "长度、面积、体积、重量、温度…30 种单位瞬间换算",
  },
  {
    id: "11",
    title: "九九乘法测验",
    author: "数学赵老师",
    authorId: "user-003",
    category: "教育",
    code: "",
    thumbnailGradient: "linear-gradient(135deg, #fa8231, #f7b731)",
    createdAt: "2026-07-13T10:00:00Z",
    description: "随机出题，计时答题，小学生口算练习神器",
  },
  {
    id: "12",
    title: "冰箱食材管理",
    author: "持家白领丽丽",
    authorId: "user-004",
    category: "生活",
    code: "",
    thumbnailGradient: "linear-gradient(135deg, #43e97b, #38f9d7)",
    createdAt: "2026-07-12T15:00:00Z",
    description: "录入食材和保质期，快过期时自动提醒不浪费",
  },
  {
    id: "13",
    title: "旅行分账 Pro 版",
    author: "省钱达人阿杰",
    authorId: "user-005",
    category: "旅行",
    code: "",
    thumbnailGradient: "linear-gradient(135deg, #f093fb, #f5576c)",
    createdAt: "2026-07-22T08:00:00Z",
    description: "基于原版分账计算器，增加了多币种换算功能",
    sourceToolId: "1",
  },
  {
    id: "14",
    title: "小学生古诗词填空",
    author: "语文张老师",
    authorId: "user-003",
    category: "教育",
    code: "",
    thumbnailGradient: "linear-gradient(135deg, #43e97b, #38f9d7)",
    createdAt: "2026-07-22T09:00:00Z",
    description: "改编自古诗词随机抽查，改为填空模式更适合作业",
    sourceToolId: "3",
  },
];

// Pre-seeded favorites for mock mode
const MOCK_FAVORITES: Favorite[] = [
  { toolId: "1", userId: "mock-user-1", createdAt: "2026-07-21T08:00:00Z" },
  { toolId: "3", userId: "mock-user-1", createdAt: "2026-07-21T09:00:00Z" },
  { toolId: "5", userId: "mock-user-1", createdAt: "2026-07-21T10:00:00Z" },
  { toolId: "2", userId: "mock-user-2", createdAt: "2026-07-20T12:00:00Z" },
  { toolId: "1", userId: "mock-user-2", createdAt: "2026-07-20T13:00:00Z" },
];

// In-memory mutable copy for mock mode (so toggles persist during session)
let mockFavorites = structuredClone(MOCK_FAVORITES);

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
    createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString()),
    description: row.description ? String(row.description) : undefined,
    sourceToolId: row.source_tool_id ? String(row.source_tool_id) : undefined,
  };
}

// ---- Helper: get Supabase client when configured ----

async function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    return createClient(supabaseUrl, supabaseKey);
  } catch {
    return null;
  }
}

// ---- Tool data fetching ----

export async function fetchTools(): Promise<Tool[]> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data.map(mapRow);
      }
    } catch {
      // fall through
    }
  }
  await new Promise((r) => setTimeout(r, 400));
  return MOCK_TOOLS;
}

export async function fetchToolById(id: string): Promise<Tool | null> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) {
        return mapRow(data);
      }
    } catch {
      // fall through
    }
  }
  await new Promise((r) => setTimeout(r, 200));
  return MOCK_TOOLS.find((t) => t.id === id) ?? null;
}

export async function fetchToolsByUser(userId: string): Promise<Tool[]> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("author_id", userId)
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data.map(mapRow);
      }
    } catch {
      // fall through
    }
  }
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_TOOLS.filter((t) => t.authorId === userId);
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

// ---- Favorites ----

export async function fetchFavoritedToolIds(userId: string): Promise<string[]> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("tool_id")
        .eq("user_id", userId);
      if (!error && data) {
        return data.map((row: Record<string, unknown>) => String(row.tool_id));
      }
    } catch {
      // fall through
    }
  }
  return mockFavorites
    .filter((f) => f.userId === userId)
    .map((f) => f.toolId);
}

export async function toggleFavorite(
  userId: string,
  toolId: string,
  currentlyFavorited: boolean
): Promise<boolean> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    try {
      if (currentlyFavorited) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("tool_id", toolId);
        if (!error) return false;
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({
            user_id: userId,
            tool_id: toolId,
            created_at: new Date().toISOString(),
          });
        if (!error) return true;
      }
    } catch {
      // fall through
    }
  }

  // Mock mode
  if (currentlyFavorited) {
    mockFavorites = mockFavorites.filter(
      (f) => !(f.userId === userId && f.toolId === toolId)
    );
    return false;
  } else {
    mockFavorites.push({
      toolId,
      userId,
      createdAt: new Date().toISOString(),
    });
    return true;
  }
}

export async function fetchFavoriteCount(toolId: string): Promise<number> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    try {
      const { count, error } = await supabase
        .from("favorites")
        .select("*", { count: "exact", head: true })
        .eq("tool_id", toolId);
      if (!error && count !== null) return count;
    } catch {
      // fall through
    }
  }
  return mockFavorites.filter((f) => f.toolId === toolId).length;
}

/** Batch: get favorite counts for multiple tool IDs */
export async function fetchFavoriteCounts(
  toolIds: string[]
): Promise<Record<string, number>> {
  const supabase = await getSupabaseClient();
  const counts: Record<string, number> = {};
  if (supabase) {
    try {
      // Supabase doesn't support GROUP BY in client SDK cleanly;
      // fetch all rows and count in JS for mock-like simplicity
      const { data, error } = await supabase
        .from("favorites")
        .select("tool_id")
        .in("tool_id", toolIds);
      if (!error && data) {
        for (const row of data as { tool_id: string }[]) {
          counts[row.tool_id] = (counts[row.tool_id] || 0) + 1;
        }
        return counts;
      }
    } catch {
      // fall through
    }
  }
  for (const tid of toolIds) {
    counts[tid] = mockFavorites.filter((f) => f.toolId === tid).length;
  }
  return counts;
}

export async function fetchFavoritedToolsByUser(
  userId: string
): Promise<Tool[]> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    try {
      // Get favorited tool_ids
      const { data: favRows, error: favError } = await supabase
        .from("favorites")
        .select("tool_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!favError && favRows && favRows.length > 0) {
        const toolIds = favRows.map((r: Record<string, unknown>) => String(r.tool_id));
        const { data: tools, error: toolsError } = await supabase
          .from("tools")
          .select("*")
          .in("id", toolIds);
        if (!toolsError && tools) {
          const toolMap = new Map(
            (tools as Record<string, unknown>[]).map((row) => [String(row.id), mapRow(row)])
          );
          // Preserve favorite order
          return toolIds
            .map((id) => toolMap.get(id))
            .filter(Boolean) as Tool[];
        }
      }
      return [];
    } catch {
      // fall through
    }
  }

  // Mock mode
  const favoritedToolIds = mockFavorites
    .filter((f) => f.userId === userId)
    .map((f) => f.toolId);
  return MOCK_TOOLS.filter((t) => favoritedToolIds.includes(t.id));
}
