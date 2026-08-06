"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { authedFetch } from "@/lib/api-client";

interface HistoryEntry {
  /** DB 记录 id（云端记录才有） */
  id?: string;
  action: string;
  data: Record<string, unknown>;
  time: string;
}

interface ToolHistoryDrawerProps {
  toolId?: string;
  userId?: string;
  open: boolean;
  onClose: () => void;
}

function getHistoryKey(toolId: string, userId: string) {
  return "wewoo-hist-" + toolId + "-" + userId;
}

/** 读取本地缓存的使用记录（工具内动作记录） */
function loadLocalHistory(toolId: string, userId: string): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(getHistoryKey(toolId, userId));
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveLocalHistory(toolId: string, userId: string, items: HistoryEntry[]) {
  try {
    localStorage.setItem(getHistoryKey(toolId, userId), JSON.stringify(items));
  } catch { /* quota */ }
}

/** 根据动作名推断展示图标与颜色 */
function entryMeta(action: string): { icon: string; dot: string; label: string } {
  if (action === "opened") return { icon: "📂", dot: "bg-blue-400", label: "打开工具" };
  if (/保存|打卡|记录|添加/.test(action)) return { icon: "💾", dot: "bg-emerald-400", label: action };
  if (/计算|生成|转换|查询|搜索|开始|提交/.test(action)) return { icon: "⚡", dot: "bg-amber-400", label: action };
  return { icon: "🖱️", dot: "bg-gray-300", label: action };
}

export function ToolHistoryDrawer({
  toolId,
  userId,
  open,
  onClose,
}: ToolHistoryDrawerProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [deletingIdx, setDeletingIdx] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [query, setQuery] = useState("");
  const [restoreMsg, setRestoreMsg] = useState<string | null>(null);

  // 加载记录：本地记录先展示，登录用户再合并云端记录（跨设备同步）
  const loadHistory = useCallback(async () => {
    if (!toolId || !userId) { setHistory([]); return; }
    const local = loadLocalHistory(toolId, userId);
    setHistory(local);

    try {
      const res = await authedFetch(`/api/tools/${toolId}/history`);
      if (!res.ok) return;
      const data = await res.json();
      const cloud: HistoryEntry[] = (data.history || []).map((h: Record<string, unknown>) => ({
        id: String(h.id),
        action: String(h.action || "操作"),
        data: (h.input_data && typeof h.input_data === "object" ? h.input_data : {}) as Record<string, unknown>,
        time: String(h.created_at || ""),
      }));
      // 合并去重：以 (action,time) 去重，云端优先
      const seen = new Set<string>();
      const merged: HistoryEntry[] = [];
      for (const e of [...cloud, ...local]) {
        const key = e.action + "|" + e.time;
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(e);
      }
      merged.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setHistory(merged);
    } catch {
      // 云端拉取失败 → 保留本地记录
    }
  }, [toolId, userId]);

  useEffect(() => {
    if (open) { loadHistory(); setQuery(""); setRestoreMsg(null); }
  }, [open, loadHistory]);

  // 搜索过滤：按动作名或输入数据内容
  const filtered = useMemo(() => {
    if (!query.trim()) return history;
    const q = query.trim().toLowerCase();
    return history.filter((e) =>
      e.action.toLowerCase().includes(q) ||
      JSON.stringify(e.data || {}).toLowerCase().includes(q)
    );
  }, [history, query]);

  // 一键恢复：把该条记录的表单数据重新注入工具 iframe（全屏/内嵌同时生效）
  const handleRestore = (entry: HistoryEntry) => {
    const data = entry.data || {};
    if (Object.keys(data).length === 0) {
      setRestoreMsg("这条记录没有可恢复的输入数据");
      setTimeout(() => setRestoreMsg(null), 2000);
      return;
    }
    const state: Record<string, unknown> = { _draft: data };
    const targets = ["tool-iframe", "fullscreen-iframe"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLIFrameElement => el instanceof HTMLIFrameElement);
    targets.forEach((f) => {
      try { f.contentWindow?.postMessage({ type: "WEWOO_STATE_INJECT", state }, "*"); } catch { /* ignore */ }
    });
    setRestoreMsg("已恢复到当时状态 ✓");
    setTimeout(() => setRestoreMsg(null), 2000);
  };

  const handleDelete = async (idx: number) => {
    if (deletingIdx !== null || !toolId || !userId) return;
    setDeletingIdx(idx);
    const entry = filtered[idx];
    try {
      if (entry?.id) {
        // 云端记录 → 删除云端
        await authedFetch(`/api/tools/${toolId}/history?historyId=${encodeURIComponent(entry.id)}`, { method: "DELETE" });
      }
      const next = history.filter((e) => e !== entry);
      // 本地缓存只保存工具内动作记录（无 id 的条目），避免把云端记录写回本地
      const localNext = next.filter((e) => !e.id);
      saveLocalHistory(toolId, userId, localNext);
      setHistory(next);
      setExpandedIdx(null);
    } catch {
      // ignore
    } finally {
      setDeletingIdx(null);
    }
  };

  const handleClearAll = async () => {
    if (!toolId || !userId) return;
    setClearing(true);
    try {
      // 清云端
      await authedFetch(`/api/tools/${toolId}/history?all=true`, { method: "DELETE" });
    } catch {
      // ignore
    } finally {
      // 清本地
      saveLocalHistory(toolId, userId, []);
      setHistory([]);
      setClearing(false);
      setShowConfirm(false);
    }
  };

  if (!open) return null;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diffMin < 1) return "刚刚";
    if (diffMin < 60) return diffMin + " 分钟前";
    if (diffMin < 60 * 24) return Math.floor(diffMin / 60) + " 小时前";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getMonth() + 1}月${d.getDate()}日 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white h-full shadow-xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            我的使用记录
            {history.length > 0 && (
              <span className="text-xs font-normal text-gray-400 ml-1">
                ({history.length}条)
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* 搜索框 */}
        {history.length > 0 && (
          <div className="px-4 pt-3 pb-1">
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 h-10">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索动作或输入内容…"
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="min-w-[32px] min-h-[32px] flex items-center justify-center text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* 恢复提示 */}
        {restoreMsg && (
          <div className="px-4 pt-2">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg px-3 py-2">
              {restoreMsg}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
              <div className="text-4xl mb-3">{history.length === 0 ? "📋" : "🔍"}</div>
              <p className="text-sm text-gray-500 font-medium">
                {history.length === 0 ? "还没有使用记录" : "没有找到匹配的记录"}
              </p>
              {history.length === 0 && (
                <p className="text-xs text-gray-400 mt-2 leading-relaxed max-w-[240px]">
                  打开工具后正常使用即可自动记录。点击「计算 / 保存 / 打卡」等按钮，操作会出现在这里，
                  支持一键恢复到当时状态。
                </p>
              )}
            </div>
          ) : (
            <div className="py-3">
              {filtered.map((entry, i) => {
                const meta = entryMeta(entry.action);
                const expanded = expandedIdx === i;
                const dataEntries = Object.entries(entry.data || {});
                return (
                  <div key={entry.id || i} className="relative pl-12 pr-3 pb-4">
                    {/* 时间线竖线 */}
                    {i < filtered.length - 1 && (
                      <div className="absolute left-[26px] top-8 bottom-0 w-px bg-gray-200" />
                    )}
                    {/* 时间线圆点 */}
                    <div className="absolute left-[19px] top-[14px] w-[15px] h-[15px] rounded-full border-2 border-white shadow ring-1 ring-gray-100 flex items-center justify-center">
                      <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                    </div>
                    <div className="rounded-xl border border-gray-100 hover:border-gray-200 bg-white transition-colors overflow-hidden">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedIdx(expanded ? null : i)}
                          className="flex-1 min-w-0 text-left px-3 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <span className="text-base flex-shrink-0">{meta.icon}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-gray-800 truncate">{meta.label}</span>
                            <span className="block text-[11px] text-gray-400 mt-0.5">{formatTime(entry.time)}</span>
                          </span>
                          <span className="text-[10px] text-gray-300 flex-shrink-0">{dataEntries.length > 0 ? `${dataEntries.length} 项输入` : "无输入"}</span>
                        </button>
                      </div>
                      {expanded && (
                        <div className="px-3 pb-2.5">
                          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 font-mono space-y-1">
                            {dataEntries.length === 0 ? (
                              <span className="text-gray-400">无输入数据</span>
                            ) : (
                              dataEntries.map(([k, v]) => (
                                <div key={k} className="flex gap-2">
                                  <span className="text-gray-400 flex-shrink-0">{k}:</span>
                                  <span className="text-gray-700 break-all">{String(v ?? "")}</span>
                                </div>
                              ))
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handleRestore(entry)}
                              disabled={dataEntries.length === 0}
                              className="flex-1 min-h-[40px] text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-40 flex items-center justify-center gap-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              恢复到当时状态
                            </button>
                            <button
                              onClick={() => handleDelete(i)}
                              disabled={deletingIdx !== null}
                              className="min-w-[44px] min-h-[40px] flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors disabled:opacity-30"
                              title="删除此记录"
                            >
                              {deletingIdx === i ? (
                                <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-3">
            <button
              onClick={() => setShowConfirm(true)}
              disabled={clearing}
              className="w-full min-h-[44px] text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              {clearing ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                  清空中...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  清空全部记录
                </>
              )}
            </button>
          </div>
        )}

        {/* 确认对话框 */}
        {showConfirm && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <div className="bg-white rounded-2xl shadow-xl p-6 mx-4 max-w-xs w-full text-center">
              <div className="text-3xl mb-3">⚠️</div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">确认清空</h3>
              <p className="text-sm text-gray-500 mb-4">
                确定清空此工具下的所有使用记录吗？此操作不可恢复。
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={clearing}
                  className="flex-1 min-h-[44px] text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-40"
                >
                  取消
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={clearing}
                  className="flex-1 min-h-[44px] text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  {clearing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      清空中
                    </>
                  ) : (
                    "确认清空"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
