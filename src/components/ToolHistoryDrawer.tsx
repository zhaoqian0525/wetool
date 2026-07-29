"use client";

import { useState, useEffect, useCallback } from "react";

interface HistoryEntry {
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

  const loadHistory = useCallback(() => {
    if (!toolId || !userId) return;
    try {
      const raw = localStorage.getItem(getHistoryKey(toolId, userId));
      setHistory(raw ? JSON.parse(raw) : []);
    } catch {
      setHistory([]);
    }
  }, [toolId, userId]);

  useEffect(() => {
    if (open) loadHistory();
  }, [open, loadHistory]);

  const saveHistory = (items: HistoryEntry[]) => {
    if (!toolId || !userId) return;
    localStorage.setItem(getHistoryKey(toolId, userId), JSON.stringify(items));
    setHistory(items);
  };

  const handleDelete = (idx: number) => {
    if (deletingIdx !== null) return;
    setDeletingIdx(idx);
    // 模拟一点延迟展示 loading
    setTimeout(() => {
      const next = history.filter((_, i) => i !== idx);
      saveHistory(next);
      setDeletingIdx(null);
      if (expandedIdx === idx) setExpandedIdx(null);
    }, 200);
  };

  const handleClearAll = () => {
    if (!toolId || !userId) return;
    setClearing(true);
    setTimeout(() => {
      localStorage.removeItem(getHistoryKey(toolId, userId));
      setHistory([]);
      setClearing(false);
      setShowConfirm(false);
    }, 200);
  };

  if (!open) return null;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diffMin < 1) return "刚刚";
    if (diffMin < 60) return diffMin + " 分钟前";
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    return h + ":" + m;
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

        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-sm text-gray-400">还没有使用记录</p>
              <p className="text-xs text-gray-300 mt-1">
                操作工具后记录会自动出现在这里
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {history.map((entry, i) => (
                <div
                  key={i}
                  className={`transition-opacity ${
                    deletingIdx === i ? "opacity-30" : ""
                  }`}
                >
                  <div className="flex items-center">
                    <button
                      onClick={() =>
                        setExpandedIdx(expandedIdx === i ? null : i)
                      }
                      className="flex-1 text-left px-5 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-800 truncate pr-2">
                          {entry.action}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatTime(entry.time)}
                        </span>
                      </div>
                    </button>
                    {/* 单条删除 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(i);
                      }}
                      disabled={deletingIdx !== null}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors disabled:opacity-30"
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
                  {expandedIdx === i && entry.data && (
                    <div className="px-5 pb-3">
                      <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 font-mono space-y-1">
                        {Object.keys(entry.data).length === 0 ? (
                          <span className="text-gray-400">无输入数据</span>
                        ) : (
                          Object.entries(entry.data).map(([k, v]) => (
                            <div key={k} className="flex gap-2">
                              <span className="text-gray-400 flex-shrink-0">
                                {k}:
                              </span>
                              <span className="text-gray-700 truncate">
                                {String(v ?? "")}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
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
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                确认清空
              </h3>
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
