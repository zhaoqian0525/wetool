"use client";

import { useEffect, useCallback } from "react";
import { authedFetch } from "@/lib/api-client";

/** v2.1.0 M3：沙盒内工具调用平台代理接口（联网 / AI 网关），统一处理鉴权与超时 */
async function callToolApi(
  path: string,
  payload: Record<string, unknown>,
  respond: (error: string | null, value?: string | null) => void
) {
  try {
    const res = await authedFetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(25000),
    });
    let j: { error?: string } & Record<string, unknown> = {};
    try {
      j = (await res.json()) as typeof j;
    } catch {
      j = {};
    }
    if (!res.ok || typeof j.error === "string") {
      respond(j.error || `请求失败（${res.status}）`, null);
      return;
    }
    respond(null, JSON.stringify(j));
  } catch (e) {
    const msg = e instanceof Error && e.name === "TimeoutError" ? "请求超时，请稍后重试" : "网络错误，请检查连接";
    respond(msg, null);
  }
}
import { getLsSnapshot, setLsSnapshot, getDraftSnapshot, setDraftSnapshot } from "@/lib/toolStateBridge";

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
 *
 * v1.6.0 记忆机制：
 * - 工具内 localStorage 写入（WEWOO_LS_SYNC）→ 本地墓碑 + 登录用户防抖上云
 * - 游客（未登录）刷新/全屏后由父页面注入快照恢复
 * - 登录后首次使用自动把游客墓碑合并上云
 */

const STORAGE_PREFIX = "wewoo-db-";
const DRAFT_PREFIX = "wewoo-draft-";
const HISTORY_PREFIX = "wewoo-hist-";
const LS_PREFIX = "wewoo-ls-";

function getNsKey(toolId: string, userId?: string): string {
  return STORAGE_PREFIX + toolId + (userId ? "-" + userId : "");
}
function getDraftKey(toolId: string, userId?: string): string {
  return DRAFT_PREFIX + toolId + (userId ? "-" + userId : "");
}
function getHistoryKey(toolId: string, userId?: string): string {
  return HISTORY_PREFIX + toolId + (userId ? "-" + userId : "");
}
/** localStorage 快照墓碑：游客用无后缀 key，登录用户按 userId 隔离 */
function getLsKey(toolId: string, userId?: string): string {
  return LS_PREFIX + toolId + (userId ? "-" + userId : "");
}

function loadJson(key: string, fallback: unknown) {
  try { return JSON.parse(localStorage.getItem(key) || ""); } catch { return fallback; }
}
function saveJson(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* quota */ }
}

// ---- 云端防抖写（localStorage 快照），key = toolId ----
const lsCloudTimers = new Map<string, ReturnType<typeof setTimeout>>();

/** 把 _ls 快照合并当前 _draft 后写入云端（避免两种写入互相覆盖） */
function writeLsCloud(toolId: string, snap: Record<string, string>) {
  const draft = getDraftSnapshot(toolId);
  const state: Record<string, unknown> = { _ls: snap };
  if (draft) state._draft = draft;
  authedFetch(`/api/tools/${toolId}/state`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state }),
  }).catch(() => {});
}

/** 把 _draft 快照合并当前 _ls 后写入云端 */
function writeDraftCloud(toolId: string, draft: Record<string, unknown>) {
  const ls = getLsSnapshot(toolId);
  const state: Record<string, unknown> = { _draft: draft };
  if (ls) state._ls = ls;
  authedFetch(`/api/tools/${toolId}/state`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state }),
  }).catch(() => {});
}

/** 沙盒内可见的最小用户信息（只暴露昵称/头像，不暴露邮箱与 ID） */
export interface ToolSandboxUser {
  id?: string;
  email?: string;
  user_metadata?: { name?: string; avatar_url?: string } | null;
}

export function useToolStorage(toolId?: string, userId?: string, user?: ToolSandboxUser | null) {
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
          // 游客：注入本地墓碑快照（刷新/全屏后恢复 localStorage）
          if (!userId) {
            const ls = loadJson(getLsKey(toolId), null) as Record<string, string> | null;
            if (ls && typeof ls === "object" && Object.keys(ls).length > 0) {
              setLsSnapshot(toolId, ls);
              source.postMessage(
                { type: "WEWOO_STATE_INJECT", state: { _ls: ls } },
                { targetOrigin: "*" }
              );
            }
          }
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
          let parsed: Record<string, unknown> = {};
          try { parsed = msg.data ? JSON.parse(msg.data) : {}; } catch { parsed = {}; }
          setDraftSnapshot(toolId, parsed);
          saveJson(dk, parsed);
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
        // --- localStorage 快照同步（v1.6 墓碑机制） ---
        case "WEWOO_LS_SYNC": {
          let snap: Record<string, string>;
          try { snap = msg.data ? JSON.parse(msg.data) : {}; } catch { break; }
          if (!snap || typeof snap !== "object") break;
          // 过滤非法值，确保都是字符串
          const clean: Record<string, string> = {};
          for (const k of Object.keys(snap)) {
            const v = snap[k];
            if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") clean[k] = String(v);
          }
          if (Object.keys(clean).length === 0 && msg.data) break; // 全空时不覆盖已有墓碑
          setLsSnapshot(toolId, clean);
          // 本地墓碑：游客恢复 + 登录用户快速恢复
          saveJson(getLsKey(toolId, userId), clean);
          // 登录用户：防抖同步云端（创作页预览不写云端）
          if (userId && toolId !== "preview") {
            const timerKey = toolId;
            if (lsCloudTimers.has(timerKey)) clearTimeout(lsCloudTimers.get(timerKey)!);
            lsCloudTimers.set(
              timerKey,
              setTimeout(() => {
                lsCloudTimers.delete(timerKey);
                writeLsCloud(toolId, clean);
              }, 800)
            );
          }
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
        // --- 工具状态保存（表单草稿 → 本地 + 云端） ---
        case "WEWOO_STATE_SAVE": {
          const stateData = msg.data ? (() => { try { return JSON.parse(msg.data); } catch { return {}; } })() : {};
          setDraftSnapshot(toolId, stateData);
          // 同时保存到 localStorage 作本地缓存
          const dk = getDraftKey(toolId, userId);
          saveJson(dk, stateData);
          // 已登录时异步同步到 API（身份由 token 识别），合并 _ls 防止覆盖；创作页预览跳过
          if (userId && toolId !== "preview") {
            writeDraftCloud(toolId, stateData);
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
              const cloud = (res.state && typeof res.state === "object" ? res.state : null) as Record<string, unknown> | null;
              if (cloud && Object.keys(cloud).length > 0) {
                if (cloud._draft && typeof cloud._draft === "object") setDraftSnapshot(toolId, cloud._draft as Record<string, unknown>);
                if (cloud._ls && typeof cloud._ls === "object") setLsSnapshot(toolId, cloud._ls as Record<string, string>);
                // 只回填表单草稿（_ls 由 READY 注入负责）
                respond(null, cloud._draft ? JSON.stringify(cloud._draft) : null);
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
        // --- v2.0.3 M2：剪贴板写入（仅写，永不读） ---
        case "WEWOO_COPY_TEXT": {
          const text = String(msg.text ?? "");
          if (!text) { respond("empty_text"); break; }
          const copyDone = (err: string | null) => respond(err, err ? undefined : "ok");
          const fallbackCopy = () => {
            try {
              const ta = document.createElement("textarea");
              ta.value = text;
              ta.setAttribute("readonly", "");
              ta.style.position = "fixed";
              ta.style.top = "-9999px";
              ta.style.opacity = "0";
              document.body.appendChild(ta);
              ta.select();
              ta.setSelectionRange(0, text.length);
              const ok = document.execCommand("copy");
              ta.remove();
              copyDone(ok ? null : "copy_failed");
            } catch {
              copyDone("copy_failed");
            }
          };
          if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(text).then(() => copyDone(null)).catch(fallbackCopy);
          } else {
            fallbackCopy();
          }
          break;
        }
        // --- v2.0.3 M2：文件导出 ---
        case "WEWOO_DOWNLOAD": {
          const filename = String(msg.filename || "download.txt");
          const content = String(msg.content ?? "");
          const mime = String(msg.mime || "text/plain");
          try {
            const blob = new Blob([content], { type: mime });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 5000);
            respond(null, "ok");
          } catch {
            respond("download_failed");
          }
          break;
        }
        // --- v2.0.3 M2：分享（Web Share + 桌面复制兜底） ---
        case "WEWOO_SHARE": {
          const shareText = msg.text ? String(msg.text) : "";
          const shareUrl = msg.url ? String(msg.url) : window.location.href;
          if (navigator.share) {
            navigator.share({
              title: msg.title ? String(msg.title) : document.title,
              text: shareText || undefined,
              url: msg.url ? shareUrl : undefined,
            })
              .then(() => respond(null, "ok"))
              .catch(() => respond("cancelled"));
          } else {
            const copyStr = [shareText, shareUrl].filter(Boolean).join("\n");
            try {
              const ta = document.createElement("textarea");
              ta.value = copyStr;
              ta.setAttribute("readonly", "");
              ta.style.position = "fixed";
              ta.style.top = "-9999px";
              ta.style.opacity = "0";
              document.body.appendChild(ta);
              ta.select();
              ta.setSelectionRange(0, copyStr.length);
              const ok = document.execCommand("copy");
              ta.remove();
              respond(ok ? null : "copy_failed", ok ? "copied" : undefined);
            } catch {
              respond("copy_failed");
            }
          }
          break;
        }
        // --- v2.0.3 M2：只读用户信息（昵称/头像，不暴露邮箱与 ID） ---
        case "WEWOO_USER_GET": {
          if (!user) { respond(null, "null"); break; }
          respond(null, JSON.stringify({
            name: user.user_metadata?.name || user.email?.split("@")[0] || "用户",
            avatar: user.user_metadata?.avatar_url || null,
          }));
          break;
        }
        // --- v2.1.0 M3：白名单联网代理（__wewoo.fetch） ---
        case "WEWOO_FETCH": {
          const fUrl = String(msg.url ?? "");
          const fMethod = String(msg.method ?? "GET").toUpperCase();
          const fBody = String(msg.body ?? "");
          if (!fUrl) { respond("url 不能为空", null); break; }
          callToolApi("/api/proxy", { toolId, url: fUrl.slice(0, 500), method: fMethod, body: fBody.slice(0, 8000) }, respond);
          break;
        }
        // --- v2.1.0 M3：工具内 AI 网关（__wewoo.ai.chat） ---
        case "WEWOO_AI_CHAT": {
          const aPrompt = String(msg.prompt ?? "").trim();
          const aContext = String(msg.context ?? "");
          const aHistory = Array.isArray(msg.history) ? msg.history.slice(0, 10) : [];
          const aMaxTokens = Number(msg.maxTokens) > 0 ? Number(msg.maxTokens) : undefined;
          const aJson = !!msg.json;
          if (!aPrompt) { respond("prompt 不能为空", null); break; }
          callToolApi(
            "/api/ai/tool",
            {
              toolId,
              prompt: aPrompt.slice(0, 2000),
              context: aContext.slice(0, 4000),
              history: aHistory,
              ...(aMaxTokens ? { maxTokens: aMaxTokens } : {}),
              ...(aJson ? { json: true } : {}),
            },
            respond
          );
          break;
        }

      }
    },
    [toolId, userId, user]
  );

  useEffect(() => {
    if (!toolId) return;
    // 页面卸载/隐藏时立即冲刷待同步的云端写入，避免防抖窗口内丢失
    const flush = () => {
      for (const [key, timer] of lsCloudTimers) {
        clearTimeout(timer);
        const snap = getLsSnapshot(key);
        if (snap) writeLsCloud(key, snap);
      }
      lsCloudTimers.clear();
    };
    window.addEventListener("message", handleMessage);
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
    };
  }, [toolId, handleMessage]);
}
