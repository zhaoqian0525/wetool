/**
 * 工具状态桥
 *
 * 在页面级消息处理器（tool/[id]/page.tsx）与 useToolStorage 之间共享
 * 每个工具最近一次的 _draft（表单数据）与 _ls（localStorage 快照），
 * 避免两种写入在云端互相覆盖，并支撑游客墓碑合并上云。
 */
const lsSnapshots = new Map<string, Record<string, string>>();
const draftSnapshots = new Map<string, Record<string, unknown> | null>();

/** 获取某工具最新的 localStorage 快照（可能未定义） */
export function getLsSnapshot(toolId: string): Record<string, string> | undefined {
  return lsSnapshots.get(toolId);
}

/** 更新某工具最新的 localStorage 快照；传入 undefined 表示清除 */
export function setLsSnapshot(toolId: string, snap: Record<string, string> | undefined) {
  if (snap === undefined || snap === null) lsSnapshots.delete(toolId);
  else lsSnapshots.set(toolId, snap);
}

/** 获取某工具最新的表单草稿（可能未定义） */
export function getDraftSnapshot(toolId: string): Record<string, unknown> | undefined {
  const v = draftSnapshots.get(toolId);
  return v ?? undefined;
}

/** 更新某工具最新的表单草稿；传入 null/undefined 表示清除 */
export function setDraftSnapshot(toolId: string, snap: Record<string, unknown> | null | undefined) {
  if (snap === undefined || snap === null) draftSnapshots.delete(toolId);
  else draftSnapshots.set(toolId, snap);
}
