"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { WechatGuide, useIsWechat } from "@/components/WechatGuide";
import { ToolPageErrorBoundary } from "@/components/ToolPageErrorBoundary";
import { ToolHistoryDrawer } from "@/components/ToolHistoryDrawer";
import { useBlobSrcDoc } from "@/hooks/useBlobSrcDoc";
import { useToolStorage } from "@/hooks/useToolStorage";
import { fetchToolById, resolveSourceTool, fetchReviews, fetchAverageRating, addReview, fetchTools, fetchViewCounts, incrementToolView, toggleLike, fetchUserLikes, fetchLikeCount, type Tool, type Review, type LikeTargetType, type Visibility } from "@/lib/data";
import { wrapSecureSrcDoc } from "@/lib/sandbox";
import { authedFetch } from "@/lib/api-client";
import { getLsSnapshot, setLsSnapshot } from "@/lib/toolStateBridge";
import CoverPicker, { COVER_GRADIENTS, DEFAULT_COVER_CHOICE, type CoverChoice } from "@/components/CoverPicker";
import { captureCover, generateCustomCoverBlob, uploadCoverToStorage } from "@/lib/cover";
import { getSupabase } from "@/lib/supabase";

const EMOJI_RE = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;
function getToolEmoji(tool: Tool): string {
  const code = typeof tool.code === "string" ? tool.code : "";
  const m = code.match(EMOJI_RE);
  if (m) return m[0];
  const cat: Record<string, string> = { "旅行": "✈️", "工程计算": "🔧", "生活": "🏡", "教育": "📚", "小游戏": "🎮" };
  return cat[tool.category] || "🛠️";
}

export default function ToolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [tool, setTool] = useState<Tool | null>(null);

  // 工具数据持久化
  useToolStorage(id, user?.id);
  const [isJustPublished, setIsJustPublished] = useState(false);
  const [toolVisibility, setToolVisibility] = useState(tool?.visibility ?? "public");
  const [loading, setLoading] = useState(true);

  // 同步 tool 的 visibility
  useEffect(() => { if (tool) setToolVisibility(tool.visibility); }, [tool]);

  // 检测是否刚从发布页跳转过来
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setIsJustPublished(params.get("new") === "1");
    }
  }, []);
  const [viewCount, setViewCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reviewLikes, setReviewLikes] = useState<Set<string>>(new Set());

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState({ average: 0, count: 0 });
  const [newRating, setNewRating] = useState(0);
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Share + history + delete + clear state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [coverEditOpen, setCoverEditOpen] = useState(false);
  const [coverSaving, setCoverSaving] = useState(false);
  const [coverChoice, setCoverChoice] = useState<CoverChoice>(DEFAULT_COVER_CHOICE);
  const [deleting, setDeleting] = useState(false);
  const [clearingState, setClearingState] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Related tools
  const [related, setRelated] = useState<Tool[]>([]);

  // 🔥 iframe 加载状态 — 显示骨架屏直到 iframe onLoad 触发
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  // 全屏滚动保持：进入前记录预览滚动位置，退出后恢复，避免全屏滑动影响预览界面
  const fullscreenScrollRef = useRef<number | null>(null);
  const enterFullscreen = useCallback(async () => {
    const y = await new Promise<number | null>((resolve) => {
      const iframe = document.getElementById("tool-iframe") as HTMLIFrameElement | null;
      if (!iframe?.contentWindow) { resolve(null); return; }
      let done = false;
      const timer = setTimeout(() => { if (!done) { done = true; cleanup(); resolve(null); } }, 300);
      const onMsg = (e: MessageEvent) => {
        if (!e.data || e.data.type !== "WEWOO_SCROLL") return;
        if (!done) { done = true; cleanup(); resolve(typeof e.data.y === "number" ? e.data.y : null); }
      };
      const cleanup = () => { window.removeEventListener("message", onMsg); clearTimeout(timer); };
      window.addEventListener("message", onMsg);
      try { iframe.contentWindow.postMessage({ type: "WEWOO_GET_SCROLL" }, "*"); } catch { cleanup(); resolve(null); }
    });
    fullscreenScrollRef.current = y ?? 0;
    setFullscreen(true);
  }, []);
  const exitFullscreen = useCallback(() => {
    setFullscreen(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const iframe = document.getElementById("tool-iframe") as HTMLIFrameElement | null;
        if (iframe?.contentWindow) {
          try {
            iframe.contentWindow.postMessage({ type: "WEWOO_SET_SCROLL", y: fullscreenScrollRef.current ?? 0 }, "*");
          } catch { /* ignore */ }
        }
      });
    });
  }, []);
  // 全屏时锁定页面滚动，避免滑动穿透到预览页背景
  useEffect(() => {
    if (!fullscreen) return;
    const bodyPrev = document.body.style.overflow;
    const htmlPrev = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = bodyPrev;
      document.documentElement.style.overflow = htmlPrev;
    };
  }, [fullscreen]);
  // 当 tool 变化时重置 iframe 加载状态
  useEffect(() => {
    setIframeLoaded(false);
  }, [tool?.id]);

  // 🔥 合并主数据加载
  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      // 并行加载 tool、reviews、rating
      let t: Tool | null = null;
      let revs: Review[] = [];
      let avg: { average: number; count: number } = { average: 0, count: 0 };
      try {
        [t, revs, avg] = await Promise.all([
          fetchToolById(id),
          fetchReviews(id),
          fetchAverageRating(id),
        ]);
      } catch {
        // 任一请求失败 → 尝试单独加载 tool
        t = await fetchToolById(id);
      }

      if (cancelled) return;

      if (t) {
        const resolved = await resolveSourceTool(t);
        if (cancelled) return;
        setTool(resolved);
        // 加载关联工具
        fetchTools().then((all) => {
          if (cancelled) return;
          setRelated(all.filter((rt) => rt.category === resolved.category && rt.id !== resolved.id).slice(0, 4));
        });
      } else {
        setTool(null);
      }

      setReviews(revs);
      // 加载评论点赞状态
      if (user?.id && revs.length > 0) {
        fetchUserLikes(user.id, "review", revs.map(r => r.id)).then(s => {
          if (!cancelled) setReviewLikes(s);
        });
      }
      setAvgRating(avg);
      setLoading(false);
    }

    loadAll();

    // 加载浏览量并增加一次浏览
    fetchViewCounts([id]).then((c) => { if (!cancelled) setViewCount(c[id] ?? 0); });
    incrementToolView(id).then(() => {
      if (!cancelled) setViewCount((v) => v + 1);
    });
    if (user?.id) {
      // 加载点赞状态
      fetchLikeCount("tool", id).then(c => { if (!cancelled) setLikeCount(c); });
      fetchUserLikes(user.id, "tool", [id]).then(s => { if (!cancelled) setLiked(s.has(id)); });
      fetchUserLikes(user.id, "save", [id]).then(s => { if (!cancelled) setSaved(s.has(id)); });
    }

    return () => { cancelled = true; };
  }, [id, user?.id]);

  // 🔥 记录最近使用 + 使用历史
  // 注意：不在此处直接 POST state（会把云端记忆数据整体覆盖），
  // “最近使用”标记在状态加载完成后合并写入（见下方状态加载 effect）
  useEffect(() => {
    if (!user?.id || !id) return;
    // 记录使用历史
    authedFetch(`/api/tools/${id}/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "opened", detail: {} }),
    }).catch(() => {});
  }, [id, user?.id]);

  // Share handler
  const handleShare = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: tool?.title, url }); } catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        toast.success("链接已复制");
        setTimeout(() => setShareCopied(false), 2000);
      } catch { /* ignore */ }
    }
  }, [tool]);

  const handleSubmitReview = useCallback(async () => {
    if (!user || submitting) return;
    if (newRating === 0) {
      setReviewError("请先选择评分");
      return;
    }
    if (!newContent.trim()) {
      setReviewError("请输入评价内容");
      return;
    }
    setSubmitting(true);
    setReviewError("");
    try {
      const review = await addReview(id, user.id, user.user_metadata?.name || user.email?.split("@")[0] || "匿名用户", newRating, newContent.trim());
      setReviews((prev) => [review, ...prev]);
      setAvgRating((prev) => {
        const newTotal = prev.average * prev.count + newRating;
        const newCount = prev.count + 1;
        return { average: Math.round((newTotal / newCount) * 10) / 10, count: newCount };
      });
      setNewRating(0);
      setNewContent("");
    } finally {
      setSubmitting(false);
    }
  }, [user, id, newRating, newContent, submitting]);

  // 🔥 使用 Blob URL 替代 srcdoc（兼容微信/QQ 等内嵌浏览器）
  // srcDoc 用于标准浏览器（Safari/Chrome/Firefox），blobUrl 仅用于微信/QQ/X5
  const isWechat = useIsWechat();
  // 🔥 iframe 状态持久化 — 接收 postMessage 并写 Supabase
  const [savedState, setSavedState] = useState<Record<string, unknown> | null>(null);
  const [stateLoaded, setStateLoaded] = useState(false);
  // 同步读取游客本地墓碑，作为 iframe 初始快照（登录用户以云端为准，见 lsSeed）
  const [guestLsSeed, setGuestLsSeed] = useState<Record<string, string> | null>(null);
  useEffect(() => {
    if (typeof window === "undefined" || !tool?.id) return;
    try {
      const raw =
        localStorage.getItem("wewoo-ls-" + tool.id + (user?.id ? "-" + user.id : "")) ||
        localStorage.getItem("wewoo-ls-" + tool.id);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
          setGuestLsSeed(parsed as Record<string, string>);
        }
      }
    } catch { /* ignore */ }
  }, [tool?.id, user?.id]);

  // iframe 启动快照：状态加载完成后冻结一次，避免后续保存触发 iframe 重建
  const lsSeedRef = useRef<Record<string, string> | null | undefined>(undefined);
  const lsSeed = useMemo<Record<string, string> | null>(() => {
    const s = (savedState?._ls && typeof savedState._ls === "object" ? savedState._ls : guestLsSeed) as Record<string, string> | null;
    // 工具与状态都就绪后才冻结，避免 tool 尚未加载时过早冻结为 null
    if (stateLoaded && tool?.id) {
      if (lsSeedRef.current === undefined) lsSeedRef.current = s;
      return lsSeedRef.current;
    }
    return s;
  }, [savedState, guestLsSeed, stateLoaded, tool?.id]);
  const { srcDoc: previewSrcDoc, blobUrl: previewBlobUrl, sandbox: blobSandbox } = useBlobSrcDoc(tool?.code ?? "", lsSeed);
  // srcDoc 就绪后才挂载 iframe，避免先以空文档挂载再重建（导致空白闪烁/二次加载）
  const docReady = !!previewSrcDoc;
  // 加载已保存的状态
  useEffect(() => {
    if (!tool?.id) return; // 等待工具数据加载完成
    if (!user?.id) { setStateLoaded(true); return; }
    authedFetch(`/api/tools/${tool.id}/state`)
      .then((r) => r.json())
      .then((data) => {
        const cloud = (data.state && typeof data.state === "object" ? data.state : null) as Record<string, unknown> | null;
        // 游客墓碑合并：本机曾以游客身份使用过且云端还没有 _ls → 合并上云
        let merged = cloud;
        const guestLs = (() => {
          try { return JSON.parse(localStorage.getItem("wewoo-ls-" + tool.id + (user?.id ? "-" + user.id : "")) || localStorage.getItem("wewoo-ls-" + tool.id) || "null"); } catch { return null; }
        })() as Record<string, string> | null;
        if (!cloud?._ls && guestLs && typeof guestLs === "object" && Object.keys(guestLs).length > 0) {
          merged = { ...(cloud || {}), _ls: guestLs };
          setLsSnapshot(tool.id, guestLs);
        } else if (cloud?._ls && typeof cloud._ls === "object") {
          setLsSnapshot(tool.id, cloud._ls as Record<string, string>);
        }
        // 合并写入“最近使用”标记，避免把云端记忆数据整体覆盖
        const openedState = { ...(merged || {}), _opened: new Date().toISOString() };
        authedFetch(`/api/tools/${tool.id}/state`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: openedState }),
        }).catch(() => {});
        setSavedState(openedState);
        setStateLoaded(true);
      })
      .catch(() => setStateLoaded(true));
  }, [tool?.id, user?.id]);

  // 状态加载完成后兜底注入一次（覆盖 READY 早于云端状态返回的情况）
  const stateInjectedForRef = useRef<string | null>(null);
  useEffect(() => {
    const tid = tool?.id ?? "";
    if (!stateLoaded || stateInjectedForRef.current === tid) return;
    const ls = getLsSnapshot(tid);
    if (!savedState && !ls) return;
    stateInjectedForRef.current = tid;
    const state = { ...(savedState || {}), ...(ls ? { _ls: ls } : {}) };
    ["tool-iframe"]
      .map((sel) => document.getElementById(sel))
      .filter((el): el is HTMLIFrameElement => el instanceof HTMLIFrameElement)
      .forEach((f) => {
        try { f.contentWindow?.postMessage({ type: "WEWOO_STATE_INJECT", state }, "*"); } catch { /* ignore */ }
      });
  }, [stateLoaded, savedState, tool?.id]);

  // 🔥 iframe 错误降级 + 消息处理
  useEffect(() => {
    if (!previewBlobUrl || !tool) { setIframeError(false); return; }
    setIframeError(false);
    let errorTimer: ReturnType<typeof setTimeout>;
    let readyConfirmed = false;

    // 保存状态到 Supabase（合并 _ls 快照，避免 localStorage 数据被覆盖）
    const saveState = (state: Record<string, unknown>) => {
      if (!user?.id || !tool?.id) return;
      const ls = getLsSnapshot(tool?.id ?? "");
      const merged = ls ? { ...state, _ls: ls } : state;
      authedFetch(`/api/tools/${tool.id}/state`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: merged }),
      }).catch(() => {});
      setSavedState(merged);
    };

    function onMessage(e: MessageEvent) {
      if (!e.data || !e.data.type) return;
      const { type, key, value, data, _id } = e.data;
      // 始终回复给消息来源 iframe（内嵌/全屏各自独立），避免错发到另一个 iframe
      const reply = (payload: Record<string, unknown>) => {
        try { (e.source as Window | null)?.postMessage(payload, "*"); } catch { /* ignore */ }
      };

      switch (type) {
        case "WEWOO_READY":
          readyConfirmed = true;
          // 注入已保存的状态（含 localStorage 快照，刷新/全屏后恢复）
          {
            const ls = getLsSnapshot(tool?.id ?? "");
            if (savedState || ls) {
              reply({ type: "WEWOO_STATE_INJECT", state: { ...(savedState || {}), ...(ls ? { _ls: ls } : {}) } });
            }
          }
          break;
        case "WEWOO_SAVE":
          if (user && tool) {
            const newState = { ...(savedState || {}), [key]: value };
            saveState(newState);
            // 回复确认
            reply({ type: "WEWOO_SAVED", _id, key, ok: true });
          }
          break;
        case "WEWOO_LOAD":
          // 从已保存状态中读取
          reply({ type: "WEWOO_LOADED", _id, key, value: savedState?.[key] ?? null });
          break;
        case "WEWOO_DRAFT_SAVE":
          if (user && tool) {
            let parsed: Record<string, unknown>;
            try { parsed = JSON.parse(data); } catch { break; }
            saveState({ ...(savedState || {}), _draft: parsed });
            reply({ type: "WEWOO_DRAFT_SAVED", _id, ok: true });
          }
          break;
        case "WEWOO_REMOVE":
          if (user && tool && savedState) {
            const newState = { ...savedState };
            delete newState[key];
            saveState(newState);
          }
          break;
        case "WEWOO_CLEAR":
          if (user && tool) saveState({});
          break;
        case "WEWOO_LIST":
          reply({
            type: "WEWOO_LISTED",
            _id,
            keys: savedState ? Object.keys(savedState).filter((k) => k !== "_draft") : [],
          });
          break;
        case "WEWOO_STATE_SAVE":
          if (user && tool) {
            let parsed: Record<string, unknown>;
            try { parsed = JSON.parse(data); } catch { break; }
            saveState({ ...(savedState || {}), _draft: parsed });
          }
          break;
        case "WEWOO_STATE_LOAD":
          // 返回已保存的完整状态（含 localStorage 快照）
          {
            const ls = getLsSnapshot(tool?.id ?? "");
            if (savedState || ls) {
              reply({ type: "WEWOO_STATE_INJECT", _id, state: { ...(savedState || {}), ...(ls ? { _ls: ls } : {}) } });
            }
          }
          break;
      }
    }
    window.addEventListener("message", onMessage);

    errorTimer = setTimeout(() => {
      if (!readyConfirmed) setIframeError(true);
    }, 12000);

    return () => {
      window.removeEventListener("message", onMessage);
      clearTimeout(errorTimer);
    };
  }, [previewBlobUrl, tool?.id, user?.id, savedState]);

  // 清空工具使用记录/状态
  const handleClearState = useCallback(async () => {
    if (!user?.id || !id || clearingState) return;
    setClearingState(true);
    try {
      await authedFetch(`/api/tools/${id}/state`, { method: "DELETE" });
      setSavedState(null);
      toast.success("记录已清空");
      // 刷新 iframe 显示不带状态的原始工具
      setIframeLoaded(false);
      setIframeError(false);
    } catch {
      toast.error("清空失败，请重试");
    } finally {
      setClearingState(false);
    }
  }, [user?.id, id, clearingState]);

  // 下载型工具：打包并触发下载
  const handleDownload = useCallback(() => {
    if (!tool) return;
    const html = wrapSecureSrcDoc(tool.code);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (tool.title || "工具") + ".html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast.success("下载已开始");
  }, [tool, toast]);

  // 删除工具
  const handleDelete = useCallback(async () => {
    if (!tool || !user || deleting) return;
    setDeleting(true);
    try {
      const res = await authedFetch(`/api/tools/${id}`, { method: "DELETE" });
      const body = await res.json();
      if (!body.ok) throw new Error(body.error || "删除失败");
      // 从置顶中移除
      const pinnedKey = "wewoo-pinned-" + user.id;
      const pinned: string[] = JSON.parse(localStorage.getItem(pinnedKey) || "[]");
      const idx = pinned.indexOf(id);
      if (idx >= 0) { pinned.splice(idx, 1); localStorage.setItem(pinnedKey, JSON.stringify(pinned)); }
      toast.success("已删除");
      router.push("/user/" + user.id);
    } catch {
      toast.error("删除失败");
      setDeleting(false);
    }
  }, [tool, user, id, deleting, toast, router]);

  // 更换封面（仅作者）：自动截图 / 上传图片 / 渐变+表情
  const handleSaveCover = useCallback(async () => {
    if (!tool || !user || coverSaving) return;
    setCoverSaving(true);
    try {
      const client = getSupabase();
      if (!client) throw new Error("数据库未连接，无法保存封面");
      let blob: Blob | null = null;
      if (coverChoice.mode === "upload" && coverChoice.uploadDataUrl) {
        const res = await fetch(coverChoice.uploadDataUrl);
        blob = await res.blob();
      } else if (coverChoice.mode === "gradient") {
        const gradientCss = COVER_GRADIENTS[coverChoice.gradientIndex % COVER_GRADIENTS.length];
        blob = await generateCustomCoverBlob(tool.title, 0, coverChoice.emoji, gradientCss);
      } else {
        blob = await captureCover(tool.code);
      }
      if (!blob) throw new Error("封面生成失败，请换一种方式");
      const url = await uploadCoverToStorage(blob, tool.id, client);
      if (!url) throw new Error("封面上传失败，请稍后重试");
      const { error } = await client.from("tools").update({ cover_url: url }).eq("id", tool.id);
      if (error) throw new Error(error.message || "保存失败");
      setTool({ ...tool, coverUrl: url });
      setCoverEditOpen(false);
      toast.success("封面已更新");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "保存失败，请重试");
    } finally {
      setCoverSaving(false);
    }
  }, [tool, user, coverChoice, coverSaving, toast]);

  // 作者权限检查
  const isAuthor = user && tool && tool.authorId === user.id;
  const handleChangeVisibility = (v: string) => {
    if (!tool || !isAuthor) return;
    setToolVisibility(v as Visibility);
    // TODO: 同时更新 Supabase visibility
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <DetailSkeleton />
        </main>
      </div>
    );
  }

  // 私密工具且非作者 → 404
  if (tool && tool.visibility === "private" && !isAuthor) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
        <Navbar />
        <div className="flex flex-col items-center justify-center px-4 py-20">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">无权访问</h2>
          <p className="text-sm text-gray-500 mb-6">此工具为私密状态，仅作者本人可查看</p>
          <Link
            href="/"
            className="min-h-[44px] flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            返回广场
          </Link>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
        <Navbar />
        <div className="flex flex-col items-center justify-center px-4 py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">工具未找到</h2>
          <p className="text-sm text-gray-500 mb-6">这个链接可能已经失效，或工具已被作者删除</p>
          <Link
            href="/"
            className="min-h-[44px] flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            返回广场
          </Link>
        </div>
      </div>
    );
  }

  const categoryEmoji: Record<string, string> = { "旅行": "✈️", "工程计算": "🔧", "生活": "🏡", "教育": "📚", "小游戏": "🎮" };

  return (
    <ToolPageErrorBoundary>
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
        {/* Tool Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="inline-block text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              {tool.category}
            </span>
            {isJustPublished && (
              <span className="inline-block text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full animate-pulse">
                刚刚发布
              </span>
            )}
            {/* 可见性徽章（仅作者可见） */}
            {isAuthor && (
              <div className="relative group">
                <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer ${
                  toolVisibility === "public" ? "text-green-700 bg-green-100" :
                  toolVisibility === "unlisted" ? "text-amber-700 bg-amber-100" :
                  "text-red-700 bg-red-100"
                }`}>
                  {toolVisibility === "public" ? "公开" : toolVisibility === "unlisted" ? "未列出" : "私密"}
                </span>
                {/* 下拉菜单 */}
                <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-30 hidden group-hover:block min-w-[120px]">
                  <button onClick={() => handleChangeVisibility("public")} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" /> 公开
                  </button>
                  <button onClick={() => handleChangeVisibility("unlisted")} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> 未列出
                  </button>
                  <button onClick={() => handleChangeVisibility("private")} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" /> 私密
                  </button>
                </div>
              </div>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{tool.title}</h1>
          {tool.description && (
            <p className="text-sm text-gray-500 mb-4">{tool.description}</p>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
            <span>
              by{" "}
              {tool.authorId ? (
                <Link href={`/user/${tool.authorId}`} className="text-indigo-600 hover:underline">
                  @{tool.author}
                </Link>
              ) : (
                `@${tool.author}`
              )}
            </span>
            <span>·</span>
            <span>{new Date(tool.createdAt).toLocaleDateString("zh-CN")}</span>
            {viewCount > 0 && (
              <>
                <span>·</span>
                <span className="text-blue-400">👁 {viewCount} 次浏览</span>
              </>
            )}
            {user && (
              <>
                <span>·</span>
                <button
                  onClick={() => setHistoryOpen(true)}
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  📋 使用记录
                </button>
              </>
            )}
          </div>

          {/* Source tool chain */}
          {tool.sourceTool && (
            <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
              <span>✨ 改编自</span>
              <Link
                href={`/tool/${tool.sourceTool.id}`}
                className="text-indigo-600 hover:underline font-medium"
              >
                @{tool.sourceTool.author}
              </Link>
              <span>的</span>
              <span className="text-gray-700">《{tool.sourceTool.title}》</span>
            </div>
          )}
        </div>

        {/* Preview & Actions */}
        {tool.isDownloadable ? (
          /* 下载型工具 */
          <div className="bg-white rounded-2xl border-2 border-dashed border-indigo-200 p-6 sm:p-8 text-center">
            <div
              className="w-full h-40 sm:h-52 rounded-xl mb-5 flex items-center justify-center"
              style={{ background: tool.thumbnailGradient || "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
            >
              <span className="text-5xl select-none">💻</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">此工具需要下载到电脑使用</h3>
            <p className="text-sm text-gray-500 mb-5 max-w-md mx-auto leading-relaxed">
              包含本地文件读写等浏览器沙箱不支持的功能，下载后双击 HTML 文件即可在电脑浏览器中运行全部功能。
            </p>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 min-h-[48px] px-6 py-3 bg-indigo-600 text-white rounded-xl text-base font-medium hover:bg-indigo-700 active:scale-[0.97] transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              下载工具
            </button>
            <p className="text-xs text-gray-400 mt-3">文件：{tool.title || "工具"}.html</p>
          </div>
        ) : (
        <div className="flex flex-col" style={{ height: "calc(100vh - 200px)", minHeight: "400px" }}>
          {/* Action bar — compact toolbar above iframe */}
          <div className="flex items-center gap-1.5 pb-3 flex-wrap">
            {user ? (
              <>
                <button
                  onClick={async () => {
                    if (liking) return;
                    setLiking(true);
                    try {
                      const newLiked = await toggleLike(user.id, "tool", id, liked);
                      setLiked(newLiked);
                      setLikeCount(c => newLiked ? c + 1 : Math.max(0, c - 1));
                      toast.success(newLiked ? "已点赞" : "已取消点赞");
                    } catch (e: unknown) {
                      toast.error(e instanceof Error ? e.message : "操作失败");
                    } finally { setLiking(false); }
                  }}
                  disabled={liking}
                  className={`inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                    liked ? "bg-red-50 text-red-600 ring-1 ring-red-200" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                  } ${liking ? "opacity-60" : ""}`}
                >
                  {liked ? "❤️" : "🤍"}{likeCount > 0 ? ` ${likeCount}` : ""}
                </button>
                <button
                  onClick={async () => {
                    if (saving) return;
                    setSaving(true);
                    try {
                      const newSaved = await toggleLike(user.id, "save", id, saved);
                      setSaved(newSaved);
                      toast.success(newSaved ? "已收藏" : "已取消收藏");
                    } catch (e: unknown) {
                      toast.error(e instanceof Error ? e.message : "操作失败");
                    } finally { setSaving(false); }
                  }}
                  disabled={saving}
                  className={`inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                    saved ? "bg-amber-50 text-amber-600 ring-1 ring-amber-200" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                  } ${saving ? "opacity-60" : ""}`}
                >
                  {saved ? "⭐" : "☆"}
                </button>
              </>
            ) : (
              <Link href="/auth" className="inline-flex items-center gap-1 h-8 px-2.5 bg-white text-gray-400 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50">
                登录
              </Link>
            )}
            <span className="w-px h-5 bg-gray-200 mx-0.5" />
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1 h-8 px-2.5 bg-white text-gray-500 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 active:scale-95 transition-all"
            >
              {shareCopied ? "✓ 已复制" : "🔗"}
            </button>
            <button
              onClick={enterFullscreen}
              className="inline-flex items-center gap-1 h-8 px-2.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 active:scale-95 transition-all"
            >
              ⛶ 全屏
            </button>
            <Link
              href={`/create?source_tool_id=${tool.id}`}
              className="inline-flex items-center gap-1 h-8 px-2.5 bg-white text-indigo-600 border border-indigo-200 rounded-lg text-xs font-medium hover:bg-indigo-50 active:scale-95 transition-all"
            >
              ✨ 改编
            </Link>
            {isAuthor && (
              <>
              <button
                onClick={() => { setCoverChoice(DEFAULT_COVER_CHOICE); setCoverEditOpen(true); }}
                className="inline-flex items-center gap-1 h-8 px-2.5 text-xs text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                🖼️ 换封面
              </button>
              <button
                onClick={() => setDeleteOpen(true)}
                className="inline-flex items-center gap-1 h-8 px-2.5 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                删除
              </button>
              </>
            )}
          </div>

          {/* Full-height iframe（等待状态加载完成后再挂载，确保启动快照已就绪） */}
          {stateLoaded && tool.code ? (
            iframeError ? (
              <IframeErrorFallback />
            ) : (
            <WechatGuide toolUrl={`https://we-woo.net/tool/${id}`}>
              <div
                className={`${fullscreen ? "fixed inset-0 z-50 bg-black" : "relative flex-1 min-h-0 rounded-xl overflow-hidden shadow-lg bg-white border border-gray-200"}`}
              >
                {!docReady && <IframeSkeleton />}
                {fullscreen && (
                  <button
                    onClick={exitFullscreen}
                    style={{ touchAction: "manipulation" }}
                    className="absolute top-3 right-3 z-30 flex items-center gap-1 px-3 py-1.5 bg-gray-800/80 text-white text-xs rounded-full hover:bg-gray-700 active:scale-95 transition-all shadow border border-white/10"
                  >
                    退出全屏
                  </button>
                )}
                {docReady && (
                  <iframe
                    id="tool-iframe"
                    key={`${tool?.id ?? "empty"}:${isWechat ? previewBlobUrl : previewSrcDoc}`}
                    {...(isWechat ? { src: previewBlobUrl } : { srcDoc: previewSrcDoc })}
                    title={tool.title}
                    className="absolute inset-0 w-full h-full border-0"
                    sandbox={blobSandbox}
                    onLoad={() => setIframeLoaded(true)}
                    onError={() => setIframeError(true)}
                    style={{ opacity: 1 }}
                  />
                )}
              </div>
            </WechatGuide>
            )
          ) : (
            <div className="flex-1 rounded-xl flex flex-col items-center justify-center p-8" style={{ background: tool.thumbnailGradient }}>
              <span className="text-4xl mb-2">{categoryEmoji[tool.category] || "🛠️"}</span>
              <span className="text-white font-bold">{tool.title}</span>
            </div>
          )}
        </div>
        )}

        {/* Related tools */}
        {related.length > 0 && (
          <section className="mt-12 border-t border-gray-200 pt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">相关工具</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {related.map((rt) => (
                <Link
                  key={rt.id}
                  href={`/tool/${rt.id}`}
                  className="group card-hover-float block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="relative aspect-[4/3] flex items-center justify-center overflow-hidden" style={{ background: rt.thumbnailGradient }}>
                    <span className="text-3xl drop-shadow-lg">{getToolEmoji(rt)}</span>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-700 group-hover:text-indigo-600 truncate">{rt.title}</p>
                    <p className="text-[10px] text-gray-400 truncate">@{rt.author}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <section className="mt-12 border-t border-gray-200 pt-8">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-bold text-gray-900">用户评价</h2>
            {avgRating.count > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-sm ${star <= Math.round(avgRating.average) ? "text-yellow-400" : "text-gray-200"}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">{avgRating.average}</span>
                <span className="text-xs text-gray-400">({avgRating.count} 条评价)</span>
              </div>
            )}
          </div>

          {/* Write review */}
          {user ? (
            <div className="bg-white rounded-2xl p-4 sm:p-5 mb-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">写评价</h3>
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => { setNewRating(star); setReviewError(""); }}
                    className={`min-w-[44px] min-h-[44px] flex items-center justify-center text-2xl transition-colors ${star <= newRating ? "text-yellow-400" : "text-gray-200"} hover:text-yellow-400`}
                  >
                    ★
                  </button>
                ))}
                {newRating > 0 && (
                  <span className="text-xs text-gray-400 ml-2">
                    {newRating === 5 ? "太棒了！" : newRating === 4 ? "很不错" : newRating === 3 ? "一般般" : newRating === 2 ? "有待改进" : "很差"}
                  </span>
                )}
              </div>
              <textarea
                value={newContent}
                onChange={(e) => { setNewContent(e.target.value); setReviewError(""); }}
                placeholder="分享你的使用体验..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-base resize-none focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50"
                style={{ fontSize: "16px" }}
                rows={3}
              />
              {reviewError && (
                <p className="text-xs text-red-500 mt-1">{reviewError}</p>
              )}
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="mt-3 min-h-[44px] px-5 py-2 bg-indigo-600 text-white text-sm rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {submitting ? "提交中..." : "发布评价"}
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-center">
              <p className="text-sm text-gray-500">
                <Link href="/auth" className="text-indigo-600 hover:underline font-medium">登录</Link>后即可发表评价
              </p>
            </div>
          )}

          {/* Review list */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {review.userName[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{review.userName}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString("zh-CN")}
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-sm ${star <= review.rating ? "text-yellow-400" : "text-gray-200"}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{review.content}</p>
                  {/* 评论点赞 */}
                  {user && (
                    <div className="mt-2 flex items-center gap-1">
                      <button
                        onClick={async () => {
                          const liked = reviewLikes.has(review.id);
                          try {
                            const newLiked = await toggleLike(user.id, "review", review.id, liked);
                            setReviewLikes(prev => {
                              const next = new Set(prev);
                              newLiked ? next.add(review.id) : next.delete(review.id);
                              return next;
                            });
                          } catch (e: unknown) {
                            toast.error(e instanceof Error ? e.message : "操作失败");
                          }
                        }}
                        className={`inline-flex items-center gap-0.5 text-xs px-2 py-1 rounded-lg transition-colors ${
                          reviewLikes.has(review.id) ? "text-red-500 bg-red-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {reviewLikes.has(review.id) ? "❤️" : "🤍"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm text-gray-400">还没有评价，来第一个评价吧</p>
            </div>
          )}
        </section>
      </main>
    </div>
    <ToolHistoryDrawer
      toolId={id}
      userId={user?.id}
      open={historyOpen}
      onClose={() => setHistoryOpen(false)}
    />
    {/* 更换封面对话框（仅作者） */}
    {coverEditOpen && (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto">
          <h3 className="text-base font-semibold text-gray-900 mb-1">更换封面</h3>
          <p className="text-xs text-gray-500 mb-4">封面会显示在首页广场、分享卡片和最近使用里</p>
          <CoverPicker value={coverChoice} onChange={setCoverChoice} disabled={coverSaving} />
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setCoverEditOpen(false)}
              disabled={coverSaving}
              className="flex-1 min-h-[44px] py-2.5 text-sm text-gray-500 hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-40"
            >
              取消
            </button>
            <button
              onClick={handleSaveCover}
              disabled={coverSaving}
              className="flex-1 min-h-[44px] py-2.5 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {coverSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  保存中
                </>
              ) : (
                "保存封面"
              )}
            </button>
          </div>
        </div>
      </div>
    )}
    {/* 删除确认对话框 */}
    {deleteOpen && (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-xs w-full text-center">
          <div className="text-3xl mb-3">⚠️</div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">确认删除</h3>
          <p className="text-sm text-gray-500 mb-4">
            确定要删除此工具吗？此操作不可恢复，所有相关数据（收藏、评论、使用记录等）将被一并删除。
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
              className="flex-1 min-h-[44px] text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-40"
            >
              取消
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 min-h-[44px] text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              {deleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  删除中
                </>
              ) : (
                "确认删除"
              )}
            </button>
          </div>
        </div>
      </div>
    )}

    </ToolPageErrorBoundary>
  );
}

// ---- Iframe 加载骨架屏 ----

function IframeSkeleton() {
  return (
    <div className="absolute inset-0 bg-white flex flex-col items-center justify-center animate-pulse">
      {/* 模拟手机内容的骨架 */}
      <div className="w-full max-w-[280px] space-y-3 px-6">
        {/* Header bar */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gray-200" />
          <div className="flex-1 h-3 bg-gray-200 rounded" />
        </div>
        {/* Card block */}
        <div className="rounded-xl border border-gray-100 p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
          <div className="h-10 bg-gray-200 rounded-lg mt-2" />
        </div>
        {/* Small cards */}
        <div className="grid grid-cols-2 gap-2">
          <div className="h-16 bg-gray-100 rounded-xl" />
          <div className="h-16 bg-gray-100 rounded-xl" />
        </div>
        {/* List items */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-4/5" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
      </div>
      <p className="mt-6 text-xs text-gray-300">工具加载中...</p>
    </div>
  );
}

// ---- Iframe 语法错误降级 UI ----
function IframeErrorFallback() {
  return (
    <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-6 sm:p-8 text-center">
      <div className="text-4xl mb-3">⚠️</div>
      <h3 className="text-base font-semibold text-amber-800 mb-2">
        该工具可能包含语法错误
      </h3>
      <p className="text-sm text-amber-600 max-w-xs mx-auto leading-relaxed">
        无法在移动端正常显示。请尝试在电脑浏览器打开，或联系创作者修复。
      </p>
    </div>
  );
}

// ---- 详情页加载骨架屏 ----

function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-5 bg-gray-200 rounded-full w-16 mb-3" />
        <div className="h-7 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-3/4 mb-4" />
        <div className="flex gap-4">
          <div className="h-4 bg-gray-100 rounded w-24" />
          <div className="h-4 bg-gray-100 rounded w-20" />
        </div>
      </div>
      <div className="flex gap-8">
        <div className="w-[399px] h-[731px] bg-gray-100 rounded-[36px] hidden lg:block" />
        <div className="h-[300px] lg:hidden w-full bg-gray-100 rounded-xl" />
        <div className="flex-1 space-y-3">
          <div className="h-12 bg-gray-100 rounded-xl" />
          <div className="flex gap-2">
            <div className="flex-1 h-11 bg-gray-100 rounded-xl" />
            <div className="flex-1 h-11 bg-gray-100 rounded-xl" />
          </div>
          <div className="h-11 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
