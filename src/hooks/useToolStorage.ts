"use client";

import { useEffect, useCallback } from "react";
import { authedFetch } from "@/lib/api-client";

/**
 * useToolStorage
 *
 * 在工具详情页/创建页监听 iframe 发来的 __wewoo 存储消息，
 * 将数据持久化到父页面 localStorage，按 toolId + userId 隔离。
 *
 * 用法：
 *   useToolStorage(toolId, userId);
 *
 * 工具内使用：
 *   __wewoo.save("drinkCount", 5);
 *   __wewoo.load("drinkCount", (err, val) => { count = val; });
 */

const STORAGE_PREFIX = "wewoo-db-";
const DRAFT_PREFIX = "wewoo-draft-";
const HISTORY_PREFIX = "wewoo-hist-";

function getNsKey(toolId: string, userId?: string): string {
  return STORAGE_PREFIX + toolId + (userId ? "-" + userId : "");
}
function getDraftKey(toolId: string, userId?: string): string {
  return DRAFT_PREFIX + toolId + (userId ? "-" + userId : "");
}
function getHistoryKey(toolId: string, userId?: string): string {
  return HISTORY_PREFIX + toolId + (userId ? "-" + userId : "");
}

function loadJson(key: string, fallback: unknown) {
  try { return JSON.parse(localStorage.getItem(key) || ""); } catch { return fallback; }
}
function saveJson(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* quota */ }
}

export function useToolStorage(toolId?: string, userId?: string) {
  const handleMessage = useCallback(
    (e: MessageEvent) => {
      if (!e.data || typeof e.data.type !== "string") return;
      if (!e.data.type.startsWith("WEWOO_")) return;
      if (!toolId) return;

      const msg = e.data;
      const source = e.source as Window | null;
      if (!source) return;

      const nsKey = getNsKey(toolId, userId);
      let data: Record<string, string>;

      try {
        data = JSON.parse(localStorage.getItem(nsKey) || "{}");
      } catch {
        data = {};
      }

      const respond = (error: string | null, value?: string | null) => {
        source.postMessage(
          { _id: msg._id, error, value },
          { targetOrigin: "*" }
        );
      };

      switch (msg.type) {
        case "WEWOO_READY": {
          // 工具加载完成，不需要特殊处理
          break;
        }
        case "WEWOO_SAVE": {
          data[msg.key] = msg.value;
          try {
            localStorage.setItem(nsKey, JSON.stringify(data));
          } catch {
            // quota exceeded
            respond("storage_quota_exceeded");
            return;
          }
          respond(null);
          break;
        }
        case "WEWOO_LOAD": {
          const val = data[msg.key] ?? null;
          respond(null, val);
          break;
        }
        case "WEWOO_LIST": {
          const keys = Object.keys(data);
          respond(null, JSON.stringify(keys));
          break;
        }
        case "WEWOO_REMOVE": {
          delete data[msg.key];
          localStorage.setItem(nsKey, JSON.stringify(data));
          respond(null);
          break;
        }
        case "WEWOO_CLEAR": {
          localStorage.removeItem(nsKey);
          respond(null);
          break;
        }
        // --- 草稿保存 ---
        case "WEWOO_DRAFT_SAVE": {
          const dk = getDraftKey(toolId, userId);
          saveJson(dk, msg.data ? JSON.parse(msg.data) : {});
          respond(null);
          break;
        }
        // --- 草稿加载 ---
        case "WEWOO_DRAFT_LOAD": {
          const dk = getDraftKey(toolId, userId);
          const draft = loadJson(dk, null);
          respond(null, draft ? JSON.stringify(draft) : null);
          break;
        }
        // --- 动作记录 ---
        case "WEWOO_ACTION_RECORD": {
          const hk = getHistoryKey(toolId, userId);
          const hist = loadJson(hk, []) as Array<Record<string, unknown>>;
          try {
            hist.unshift({
              action: msg.action || "操作",
              data: msg.data ? JSON.parse(msg.data) : {},
              time: new Date().toISOString(),
            });
            if (hist.length > 50) hist.length = 50; // 最多50条
            saveJson(hk, hist);
          } catch { /* ignore */ }
          respond(null);
          break;
        }
        // --- 获取历史 ---
        case "WEWOO_HISTORY_GET": {
          const hk = getHistoryKey(toolId, userId);
          const hist = loadJson(hk, []);
          respond(null, JSON.stringify(hist));
          break;
        }
        // --- 工具状态保存（持久化到 Supabase） ---
        case "WEWOO_STATE_SAVE": {
          const stateData = msg.data ? (() => { try { return JSON.parse(msg.data); } catch { return {}; } })() : {};
          // 同时保存到 localStorage 作本地缓存
          const dk = getDraftKey(toolId, userId);
          saveJson(dk, stateData);
          // 已登录时异步同步到 API（身份由 token 识别）
          if (userId) {
            authedFetch(`/api/tools/${toolId}/state`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ state: stateData }),
            }).catch(() => {});
          }
          respond(null);
          break;
        }
        // --- 恢复工具状态 ---
        case "WEWOO_STATE_LOAD": {
          const dk = getDraftKey(toolId, userId);
          if (!userId) {
            const local = loadJson(dk, null);
            respond(null, local ? JSON.stringify(local) : null);
            break;
          }
          authedFetch(`/api/tools/${toolId}/state`)
            .then((r) => r.json())
            .then((res) => {
              // 优先使用 Supabase 数据，fallback 到 localStorage
              if (res.state && Object.keys(res.state).length > 0) {
                respond(null, JSON.stringify(res.state));
              } else {
                const local = loadJson(dk, null);
                respond(null, local ? JSON.stringify(local) : null);
              }
            })
            .catch(() => {
              const local = loadJson(dk, null);
              respond(null, local ? JSON.stringify(local) : null);
            });
          break;
        }
      }
    },
    [toolId, userId]
  );

  useEffect(() => {
    if (!toolId) return;
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [toolId, handleMessage]);
}
