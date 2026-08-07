/**
 * 全站共享常量与工具函数（v1.7.0 收敛重复定义）
 */

/** 分类 emoji 统一映射（首页 / 工具页 / 用户页共用） */
export const CATEGORY_EMOJI: Record<string, string> = {
  旅行: "✈️",
  工程计算: "🔧",
  生活: "🏡",
  教育: "📚",
  小游戏: "🎮",
};

const EMOJI_RE = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;

/** 从工具代码里提取第一个 emoji 作为卡片图标，否则用分类 emoji 兜底 */
export function getToolEmoji(
  tool: { code?: string; category?: string } | Record<string, unknown>
): string {
  const code = typeof tool.code === "string" ? tool.code : "";
  const m = code.match(EMOJI_RE);
  if (m) return m[0];
  const category = typeof tool.category === "string" ? tool.category : "";
  return CATEGORY_EMOJI[category] || "🛠️";
}