"use client";

import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import OnboardingModal from "@/components/OnboardingModal";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { WechatGuide, useIsWechat } from "@/components/WechatGuide";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { CATEGORIES, fetchToolById } from "@/lib/data";
import { scanDangerousCode } from "@/lib/sandbox";
import { useDebounce } from "@/hooks/useDebounce";
import { useBlobSrcDoc } from "@/hooks/useBlobSrcDoc";
import { useToolStorage } from "@/hooks/useToolStorage";
import { captureCover, generateDefaultCoverBlob, uploadCoverToStorage } from "@/lib/cover";
import { AI_PROMPT_TEMPLATE, aiPrompts } from "@/lib/aiPrompts";
import { getLsSnapshot } from "@/lib/toolStateBridge";

// --- Constants ---

const DEFAULT_CODE = "";

const TEMPLATE_CODE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>喝水打卡</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
    body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px;background:linear-gradient(160deg,#4facfe,#00f2fe)}
    .card{width:100%;max-width:340px;background:#fff;border-radius:24px;padding:28px 22px;box-shadow:0 16px 40px rgba(0,0,0,.18)}
    .head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
    .title{font-size:20px;font-weight:800;color:#0f172a}
    .date{font-size:12px;color:#94a3b8;margin-top:2px}
    .cups{display:flex;align-items:flex-end;gap:5px;height:64px;margin:16px 0 12px}
    .cup{width:18px;border-radius:8px 8px 4px 4px;background:#e2e8f0;transition:height .3s,background .3s}
    .cup.on{background:#38bdf8}
    .count-row{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:8px}
    .count{font-size:40px;font-weight:800;color:#0284c7}
    .count small{font-size:14px;color:#94a3b8;font-weight:600}
    .goal{font-size:12px;color:#94a3b8}
    .bar{height:10px;background:#f1f5f9;border-radius:99px;overflow:hidden;margin-bottom:16px}
    .bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#38bdf8,#0ea5e9);border-radius:99px;transition:width .4s}
    .row{display:flex;gap:10px;margin-top:10px}
    .btn{flex:1;min-height:48px;border:0;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer}
    .btn-add{background:#0284c7;color:#fff}
    .btn-sub{background:#f1f5f9;color:#64748b}
    .btn-reset{flex:none;min-width:110px;background:#fff;color:#f43f5e;border:1.5px solid #fecdd3}
    .streak{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:16px;padding:11px;background:#f0f9ff;border-radius:12px;color:#0369a1;font-size:13px;font-weight:600}
    .streak b{font-size:16px;color:#0284c7}
  </style>
</head>
<body>
  <div class="card">
    <div class="head">
      <div>
        <div class="title">💧 喝水打卡</div>
        <div class="date" id="date"></div>
      </div>
      <div style="font-size:28px">🥤</div>
    </div>

    <div class="cups" id="cups"></div>
    <div class="count-row">
      <div class="count"><span id="count">0</span><small> / 8 杯</small></div>
      <div class="goal" id="goal">目标 8 杯</div>
    </div>
    <div class="bar"><i id="bar"></i></div>

    <div class="row">
      <button class="btn btn-add" id="add">+1 杯</button>
      <button class="btn btn-sub" id="sub">-1 杯</button>
    </div>
    <div class="row">
      <button class="btn btn-reset" id="reset">清零今天</button>
      <div class="streak" style="flex:1;margin:0">🔥 连续打卡 <b id="streak">0</b> 天</div>
    </div>
  </div>

  <script>
    // ===== 记忆功能示例 =====
    // 微坞会自动持久化 localStorage：刷新页面、切换全屏、重新进入都能恢复
    var KEY = "wewoo-water-data";
    var GOAL = 8;

    function todayKey() {
      var d = new Date();
      var m = String(d.getMonth() + 1).padStart(2, "0");
      var day = String(d.getDate()).padStart(2, "0");
      return d.getFullYear() + "-" + m + "-" + day;
    }

    function load() {
      try {
        var raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : {};
      } catch (e) { return {}; }
    }

    var data = load();
    var tk = todayKey();
    if (typeof data[tk] !== "number") data[tk] = 0;
    var count = data[tk];

    function save() {
      localStorage.setItem(KEY, JSON.stringify(data));
    }

    function calcStreak() {
      var d = new Date();
      if ((data[tk] || 0) === 0) d.setDate(d.getDate() - 1); // 今天还没喝，从昨天开始算
      var streak = 0;
      for (var i = 0; i < 365; i++) {
        var m = String(d.getMonth() + 1).padStart(2, "0");
        var day = String(d.getDate()).padStart(2, "0");
        var k = d.getFullYear() + "-" + m + "-" + day;
        if ((data[k] || 0) > 0) streak++;
        else break;
        d.setDate(d.getDate() - 1);
      }
      return streak;
    }

    function render() {
      document.getElementById("date").textContent = tk.replace(/-/g, "/") + " · 数据自动保存";
      document.getElementById("count").textContent = count;
      document.getElementById("goal").textContent = "目标 " + GOAL + " 杯";
      document.getElementById("bar").style.width = Math.min(100, count / GOAL * 100) + "%";
      document.getElementById("streak").textContent = calcStreak();

      var cups = document.getElementById("cups");
      cups.innerHTML = "";
      for (var i = 0; i < 8; i++) {
        var c = document.createElement("div");
        c.className = "cup" + (i < count ? " on" : "");
        c.style.height = (20 + i * 5) + "px";
        cups.appendChild(c);
      }
    }

    document.getElementById("add").addEventListener("click", function () {
      count++;
      data[tk] = count;
      save();
      render();
    });
    document.getElementById("sub").addEventListener("click", function () {
      if (count > 0) {
        count--;
        data[tk] = count;
        save();
        render();
      }
    });
    document.getElementById("reset").addEventListener("click", function () {
      count = 0;
      data[tk] = 0;
      save();
      render();
    });

    render();
  </script>
</body>
</html>`;

const LOCAL_STORAGE_KEY = "wewoo-versions";

const THUMBNAIL_GRADIENTS = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #f093fb, #f5576c)",
  "linear-gradient(135deg, #4facfe, #00f2fe)",
  "linear-gradient(135deg, #fa8231, #f7b731)",
  "linear-gradient(135deg, #43e97b, #38f9d7)",
  "linear-gradient(135deg, #a18cd1, #fbc2eb)",
  "linear-gradient(135deg, #ffecd2, #fcb69f)",
  "linear-gradient(135deg, #667eea, #764ba2)",
];

// --- Types ---

interface Version {
  id: string;
  timestamp: number;
  code: string;
  gradientIndex: number;
}

interface PublishResult {
  toolId: string;
  title: string;
  description: string;
  coverUrl: string | null;
}

// --- Helpers ---

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function loadVersions(): Version[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Version[]) : [];
  } catch {
    return [];
  }
}

function saveVersions(vs: Version[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(vs));
  } catch {
    // full
  }
}

// --- Component ---

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-gray-100">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <CreatePageInner />
    </Suspense>
  );
}

function CreatePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sourceToolIdParam = searchParams.get("source_tool_id");
  const { user } = useAuth();
  const toast = useToast();

  const [code, setCode] = useState(DEFAULT_CODE);
  const [versions, setVersions] = useState<Version[]>([]);
  const [copied, setCopied] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);

  // Adaptation
  const [sourceToolId, setSourceToolId] = useState<string | null>(null);
  const [sourceToolTitle, setSourceToolTitle] = useState<string | null>(null);
  const [sourceLoaded, setSourceLoaded] = useState(false);

  // Publish state
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishTitle, setPublishTitle] = useState("");
  const [publishDesc, setPublishDesc] = useState("");
  const [publishCategory, setPublishCategory] = useState("生活");
  const [publishPublic, setPublishPublic] = useState("public" as string);
  const [publishDownloadable, setPublishDownloadable] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [codeWarnings, setCodeWarnings] = useState<{ level: string; label: string; count: number }[]>([]);
  const [publishStep, setPublishStep] = useState<"" | "screenshot" | "uploading" | "done">("");
  const [publishedToolUrl, setPublishedToolUrl] = useState("");

  // Share card state
  const [shareCardOpen, setShareCardOpen] = useState(false);
  const [shareCardData, setShareCardData] = useState<PublishResult | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  // Fullscreen preview
  const [fullscreenPreview, setFullscreenPreview] = useState(false);

  // Mobile editor/preview tab（移动端切换用）
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");

  // AI prompt helper
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const promptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedCode = useDebounce(code, 500);
  const debouncedCodeRef = useRef(debouncedCode);
  debouncedCodeRef.current = debouncedCode;

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const initialLoadDone = useRef(false);

  const codeRef = useRef(code);
  codeRef.current = code;
  const versionsRef = useRef(versions);
  versionsRef.current = versions;

  // Restore versions
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;
    const saved = loadVersions();
    if (saved.length > 0) setVersions(saved);
  }, []);

  // Load source tool
  useEffect(() => {
    if (sourceLoaded) return;
    if (!sourceToolIdParam) return;
    fetchToolById(sourceToolIdParam).then((tool) => {
      if (tool) {
        setSourceToolId(tool.id);
        setSourceToolTitle(tool.title);
        if (tool.code) setCode(tool.code);
      }
      toast.info("已加载改编源");
      setSourceLoaded(true);
    });
  }, [sourceToolIdParam, sourceLoaded]);

  // Persist versions
  useEffect(() => {
    if (!initialLoadDone.current) return;
    saveVersions(versions);
  }, [versions]);

  // 停留超过30秒且编辑器为空 → 自动展开 AI 提示词区域
  useEffect(() => {
    if (code.trim() !== "") return;
    promptTimerRef.current = setTimeout(() => {
      setPromptExpanded(true);
    }, 30_000);
    return () => {
      if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
    };
  }, [code]);

  // Save snapshot
  const saveSnapshot = useCallback(() => {
    const currentCode = codeRef.current;
    const currentVersions = versionsRef.current;
    const snapshot: Version = {
      id: generateId(),
      timestamp: Date.now(),
      code: currentCode,
      gradientIndex: currentVersions.length % THUMBNAIL_GRADIENTS.length,
    };
    setVersions([snapshot, ...currentVersions]);
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 1500);
    toast.info("快照已保存");
    if (timelineRef.current) {
      timelineRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, []);

  const restoreVersion = useCallback((v: Version) => setCode(v.code), []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveSnapshot();
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        const textarea = editorRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = codeRef.current.substring(0, start) + "  " + codeRef.current.substring(end);
        setCode(newValue);
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        });
      }
    },
    [saveSnapshot]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveSnapshot();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [saveSnapshot]);

  // --- Copy to clipboard with animation ---
  const copyAndAnimate = useCallback(
    async (text: string, cb: (v: boolean) => void) => {
      try {
        await navigator.clipboard.writeText(text);
        cb(true);
        setTimeout(() => cb(false), 2000);
      } catch {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        cb(true);
        setTimeout(() => cb(false), 2000);
      }
    },
    []
  );

  // --- Copy AI prompt to clipboard ---
  const handleCopyPrompt = useCallback(() => {
    copyAndAnimate(AI_PROMPT_TEMPLATE, (ok) => {
      setPromptCopied(ok);
      if (ok) toast.success("提示词已复制，去 AI 对话里粘贴吧");
    });
  }, [copyAndAnimate, toast]);

  // --- Publish handler ---
  const handlePublish = async () => {
    if (!user) return;
    if (!publishTitle.trim()) {
      setPublishError("请输入工具名称");
      return;
    }
    const categories = CATEGORIES.filter((c) => c.key !== "全部");
    if (!categories.some((c) => c.key === publishCategory)) {
      setPublishError("请选择分类");
      return;
    }
    setPublishing(true);
    setPublishError("");

    try {
      const currentVersions = versionsRef.current;
      const thumbnailIdx = THUMBNAIL_GRADIENTS.indexOf(
        THUMBNAIL_GRADIENTS[currentVersions.length % THUMBNAIL_GRADIENTS.length]
      );
      const gradient = THUMBNAIL_GRADIENTS[thumbnailIdx < 0 ? 0 : thumbnailIdx];
      const currentCode = codeRef.current;
      const title = publishTitle.trim();
      const desc = publishDesc.trim();
      const category = publishCategory;

      // Step 1: Insert tool into Supabase
      setPublishStep("done");
      let toolId = "";

      if (!isSupabaseConfigured()) {
        throw new Error("数据库未配置，请检查 Supabase 环境变量");
      }

      const client = getSupabase();
      if (!client) {
        throw new Error("数据库连接失败，请稍后重试");
      }

      const { data, error } = await client
        .from("tools")
        .insert({
          title,
          description: desc,
          category,
          code: currentCode,
          thumbnail_gradient: gradient,
          author_id: user.id,
          author: user.email?.split("@")[0] ?? "匿名",
          source_tool_id: sourceToolId || null,
          visibility: publishPublic,
          is_downloadable: publishDownloadable,
        })
        .select("id")
        .single();

      if (error) {
        throw new Error(error.message || "发布失败");
      }
      toolId = String((data as { id: string | number }).id);

      // Step 2: Generate & upload cover image
      setPublishStep("screenshot");
      let coverUrl: string | null = null;

      try {
        const coverBlob = await captureCover(currentCode);
        if (coverBlob) {
          setPublishStep("uploading");
          coverUrl = await uploadCoverToStorage(coverBlob, toolId, client);
        }
      } catch {
        console.warn("Cover screenshot failed");
      }

      // Fallback: default gradient cover
      if (!coverUrl) {
        try {
          setPublishStep("screenshot");
          const fallbackBlob = await generateDefaultCoverBlob(title, currentVersions.length);
          setPublishStep("uploading");
          coverUrl = await uploadCoverToStorage(fallbackBlob, toolId, client);
        } catch {
          console.warn("Fallback cover generation also failed");
        }
      }

      // Update tool record with cover_url
      if (coverUrl) {
        try {
          await client.from("tools").update({ cover_url: coverUrl }).eq("id", toolId);
        } catch {
          // Non-critical: tool is already published
        }
      }

      setPublishStep("");
      setPublishing(false);
      setPublishOpen(false);

      // Build tool URL
      const toolUrl = `${window.location.origin}/tool/${toolId}`;

      // Auto-copy link
      await copyAndAnimate(toolUrl, setShareCopied);
      toast.success("发布成功！3 秒后跳转到工具页");

      // 直接跳转到工具详情页
      setTimeout(() => {
        router.push(`/tool/${toolId}?new=1`);
      }, 1500);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "发布失败，请稍后重试";
      setPublishError(message);
      toast.error(message);
      setPublishing(false);
      setPublishStep("");
    }
  };

  const openPublish = () => {
    if (!user) return;
    setPublishOpen(true);
    setPublishError("");
    setPublishStep("");
    const result = scanDangerousCode(codeRef.current);
    setCodeWarnings(result.warnings);
  };

  const closeShareCard = () => {
    setShareCardOpen(false);
    setShareCardData(null);
    router.push("/");
  };

  const handleCopyCode = useCallback(() => {
    copyAndAnimate(codeRef.current, setCopied);
    toast.success("代码已复制");
  }, [copyAndAnimate, toast]);

  const handleReset = useCallback(() => setCode(DEFAULT_CODE), []);

  // Publish button text based on current step
  const publishBtnText = publishing
    ? publishStep === "screenshot"
      ? "正在生成封面..."
      : publishStep === "uploading"
      ? "正在上传封面..."
      : publishStep === "done"
      ? "发布中..."
      : "发布中..."
    : "确认发布";

  // Publish button
  const publishBtn = user ? (
    <button
      onClick={openPublish}
      className="min-w-[44px] min-h-[44px] flex items-center justify-center px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
    >
      发布
    </button>
  ) : (
    <Link
      href="/auth"
      className="min-w-[44px] min-h-[44px] flex items-center justify-center px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
    >
      登录后发布
    </Link>
  );

  const mobileActions = (
    <>
      <button
        onClick={() => { setPreviewLsSeed(readPreviewSeed()); setCode(TEMPLATE_CODE); toast.info("已填入示例工具"); }}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center px-2 py-1 text-xs rounded-lg transition-all font-medium bg-indigo-500 text-white hover:bg-indigo-600"
      >
        示例
      </button>
      <button
        onClick={saveSnapshot}
        className={`min-w-[44px] min-h-[44px] flex items-center justify-center px-2.5 py-1 text-xs rounded-lg transition-all font-medium ${
          savedIndicator
            ? "bg-green-500 text-white"
            : "bg-amber-500 text-white hover:bg-amber-600"
        }`}
      >
        {savedIndicator ? "已保存" : "保存"}
      </button>
      {publishBtn}
    </>
  );

  const desktopActions = (
    <div className="flex items-center gap-2">
      <button
        onClick={handleReset}
        className="min-w-[44px] min-h-[44px] flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        重置
      </button>
      <button
        onClick={() => { setPreviewLsSeed(readPreviewSeed()); setCode(TEMPLATE_CODE); toast.info("已填入示例工具"); }}
        className="min-w-[44px] min-h-[44px] flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        试试示例
      </button>
      <button
        onClick={handleCopyCode}
        className="min-w-[44px] min-h-[44px] flex items-center px-3 py-1.5 text-sm bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors"
      >
        {copied ? "已复制 ✓" : "复制代码"}
      </button>
      <button
        onClick={saveSnapshot}
        className={`min-w-[44px] min-h-[44px] flex items-center px-3 py-1.5 text-sm rounded-lg transition-all font-medium ${
          savedIndicator
            ? "bg-green-500 text-white"
            : "bg-amber-500 text-white hover:bg-amber-600"
        }`}
      >
        {savedIndicator ? "已保存 ✓" : "保存快照"}
      </button>
      {publishBtn}
    </div>
  );

    // 🔥 预览记忆：恢复上次保存的 localStorage 快照（刷新/全屏/重新进入预览都能接着用）
  const [previewLsSeed, setPreviewLsSeed] = useState<Record<string, string> | null>(null);
  const readPreviewSeed = useCallback((): Record<string, string> | null => {
    if (typeof window === "undefined") return null;
    const lsKey = "wewoo-ls-preview" + (user?.id ? "-" + user.id : "");
    let local: Record<string, string> | null = null;
    try {
      const raw = localStorage.getItem(lsKey);
      if (raw) local = JSON.parse(raw);
    } catch { /* ignore */ }
    const bridge = getLsSnapshot("preview");
    const merged: Record<string, string> = {
      ...(local && typeof local === "object" ? local : {}),
      ...(bridge && typeof bridge === "object" ? bridge : {}),
    };
    return Object.keys(merged).length > 0 ? merged : null;
  }, [user?.id]);

  // 首次进入时加载一次；「示例 / 全屏」等入口会按需刷新
  useEffect(() => {
    setPreviewLsSeed(readPreviewSeed());
  }, [readPreviewSeed]);

  // 🔥 Blob URL for iframe preview (more compatible than srcdoc)
  const isWechatPreview = useIsWechat();
  const { srcDoc: previewSrcDoc, blobUrl: previewBlobUrl, sandbox: previewSandbox } = useBlobSrcDoc(debouncedCode, previewLsSeed);

  // 普通浏览器用 srcDoc；微信/QQ 才用 blob URL（sandbox iframe 的 null origin 无法加载父页面 blob）
  const previewIframeProps = isWechatPreview
    ? previewBlobUrl
      ? { src: previewBlobUrl }
      : {}
    : previewSrcDoc
    ? { srcDoc: previewSrcDoc }
    : {};

  // 工具数据持久化（预览用）
  useToolStorage("preview", user?.id);

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      <OnboardingModal />
      {/* Navbar */}
      <Navbar
        children={
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 hidden sm:inline">创作工作台</span>
            {versions.length > 0 && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {versions.length} 个快照
              </span>
            )}
          </div>
        }
        actions={desktopActions}
        mobileActions={mobileActions}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 pb-14 lg:pb-0">
        {/* 移动端：编辑/预览切换 */}
        <div className="lg:hidden flex-shrink-0 flex items-center justify-center px-3 py-2 bg-gray-200 border-b border-gray-300">
          <div className="flex bg-gray-900/5 rounded-xl p-1 w-full max-w-[260px]">
            <button
              onClick={() => setMobileTab("editor")}
              className={`flex-1 min-h-[40px] flex items-center justify-center gap-1 rounded-lg text-sm font-medium transition-all ${
                mobileTab === "editor"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              编辑
            </button>
            <button
              onClick={() => { setPreviewLsSeed(readPreviewSeed()); setMobileTab("preview"); setFullscreenPreview(true); }}
              className={`flex-1 min-h-[40px] flex items-center justify-center gap-1 rounded-lg text-sm font-medium transition-all ${
                mobileTab === "preview"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              预览
            </button>
          </div>
        </div>
        {/* === Editor Panel === */}
        <div className={`flex-1 flex flex-col min-h-0 bg-gray-900 lg:w-1/2 ${mobileTab === "preview" ? "hidden lg:flex" : ""}`}>
          <div className="flex-shrink-0 flex items-center justify-between px-3 lg:px-4 py-1.5 lg:py-2 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-gray-400 ml-1.5">HTML</span>
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
              <Link
                href="/guide"
                target="_blank"
                className="text-[10px] lg:text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3 lg:w-3.5 lg:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                教程
              </Link>
              <button
                onClick={() => { setCode(""); editorRef.current?.focus(); }}
                className="text-[10px] lg:text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-0.5 min-w-[44px] min-h-[44px] justify-center"
                title="清空编辑器"
                aria-label="清空编辑器"
              >
                <svg className="w-3 h-3 lg:w-3.5 lg:h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline">清空</span>
              </button>
              <span className="text-[10px] lg:text-xs text-gray-500 hidden sm:inline">Ctrl+S 保存快照</span>
              <span className="text-[10px] lg:text-xs text-gray-500">{code.length.toLocaleString()} 字符</span>
            </div>
          </div>

          <textarea
            ref={editorRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 w-full bg-gray-900 text-gray-100 font-mono text-sm lg:text-sm leading-relaxed p-3 lg:p-4 resize-none outline-none"
            style={{ tabSize: 2, MozTabSize: 2, fontSize: "16px" }}
            spellCheck={false}
            placeholder={"把代码粘贴到这里 👉\n\n没代码？点右上角「试试示例」\n或者点这里看教程 → "}
            aria-label="代码编辑器"
          />

          {/* AI Prompt Helper */}
          <div className={`flex-shrink-0 border-t border-gray-700 transition-all duration-300 overflow-hidden ${promptExpanded ? "max-h-[720px]" : "max-h-0"}`}>
            <div className="px-3 lg:px-4 py-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">📘</span>
                  <span className="text-xs lg:text-sm font-medium text-gray-300">
                    不知道怎么让 AI 写？复制这段提示词
                  </span>
                </div>
                <button
                  onClick={() => setPromptExpanded(false)}
                  className="text-gray-500 hover:text-gray-300 text-lg leading-none px-1"
                  aria-label="收起提示"
                >
                  ×
                </button>
              </div>
              <div className="relative">
                <pre className="text-[11px] lg:text-xs text-gray-400 bg-gray-800/80 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap leading-relaxed border border-gray-700/50">
{AI_PROMPT_TEMPLATE}</pre>
                <button
                  onClick={handleCopyPrompt}
                  className="absolute top-2 right-2 min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 active:scale-95 transition-all"
                  style={{ touchAction: "manipulation" }}
                >
                  {promptCopied ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      已复制
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      一键复制
                    </>
                  )}
                </button>
              </div>
              {/* 示例提示词：点一下复制，照着改就能用 */}
              <div>
                <div className="mb-1.5 text-[11px] lg:text-xs font-medium text-gray-400">
                  ✨ 示例提示词（点一下复制，照着改就能用）
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {aiPrompts.map((p) => (
                    <button
                      key={p.label}
                      onClick={() =>
                        copyAndAnimate(p.prompt, (ok) => {
                          if (ok) toast.success("已复制「" + p.label + "」提示词，去 AI 对话里粘贴吧");
                        })
                      }
                      className="min-h-[36px] px-3 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 rounded-full hover:bg-indigo-500/20 active:scale-95 transition-all"
                      style={{ touchAction: "manipulation" }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Collapsed toggle */}
          {!promptExpanded && (
            <button
              onClick={() => setPromptExpanded(true)}
              className="flex-shrink-0 flex items-center justify-center gap-1.5 w-full py-2 text-[11px] lg:text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-colors border-t border-gray-700/50"
            >
              <span>📘</span>
              <span>不知道怎么让 AI 写？复制这段提示词</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}

          {versions.length > 0 && (
            <div className="flex-shrink-0 border-t border-gray-700">
              <div className="flex items-center justify-between px-3 lg:px-4 py-1.5 lg:py-2 bg-gray-800/50">
                <span className="text-[10px] lg:text-xs font-medium text-gray-400 uppercase tracking-wider">版本快照</span>
                <span className="text-[10px] lg:text-xs text-gray-500">{versions.length} 个版本</span>
              </div>
              <div ref={timelineRef} className="flex gap-2 px-3 lg:px-4 pb-2.5 lg:pb-3 overflow-x-auto" style={{ scrollbarWidth: "thin" }}>
                {versions.map((v, idx) => (
                  <button
                    key={v.id}
                    onClick={() => restoreVersion(v)}
                    className="flex-shrink-0 group flex flex-col items-center gap-1 w-[60px] lg:w-[72px] focus:outline-none min-h-[44px] justify-center"
                    title={`恢复至 ${formatTime(v.timestamp)}`}
                  >
                    <div
                      className="w-full aspect-[3/4] rounded-md border-2 border-gray-600 group-hover:border-indigo-400 transition-colors overflow-hidden relative"
                      style={{ background: THUMBNAIL_GRADIENTS[v.gradientIndex] }}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                        <div className="w-6 lg:w-8 h-1 lg:h-1.5 rounded-full bg-white mb-0.5" />
                        <div className="w-8 lg:w-10 h-0.5 lg:h-1 rounded-full bg-white mb-0.5" />
                        <div className="w-5 lg:w-6 h-0.5 lg:h-1 rounded-full bg-white" />
                      </div>
                      <div className="absolute top-1 right-1 bg-black/40 text-white text-[9px] lg:text-[10px] px-1 rounded font-mono">#{idx + 1}</div>
                    </div>
                    <span className="text-[10px] lg:text-[11px] text-gray-400 group-hover:text-gray-200 text-center leading-tight">{formatTime(v.timestamp)}</span>
                  </button>
                ))}
                <div className="flex-shrink-0 flex items-center">
                  <span className="text-[10px] lg:text-xs text-gray-600 whitespace-nowrap">← 向左滑动</span>
                </div>
              </div>
            </div>
          )}

          {versions.length === 0 && (
            <div className="flex-shrink-0 border-t border-gray-700 px-3 lg:px-4 py-2 flex items-center gap-2">
              <svg className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[10px] lg:text-xs text-gray-500">点击「保存快照」或按 Ctrl+S 保存当前版本</span>
            </div>
          )}

          {sourceToolId && sourceToolTitle && (
            <div className="flex-shrink-0 border-t border-gray-700 bg-purple-900/30 px-3 lg:px-4 py-2 flex items-center gap-2">
              <span className="text-xs">✨</span>
              <span className="text-xs text-gray-300">
                正在改编：<span className="text-purple-300 font-medium">{sourceToolTitle}</span>
              </span>
            </div>
          )}
        </div>

        {/* === Preview Panel === */}
        <div className={`flex-1 flex flex-col items-center justify-center bg-gray-200 p-3 lg:p-4 min-h-0 lg:w-1/2 ${mobileTab === "editor" ? "hidden lg:flex" : ""}`}>
          <div className="relative flex flex-col items-center flex-1 w-full justify-center">
            <div className="hidden lg:flex flex-col items-center">
              <WechatGuide>
                <div
                  className="relative bg-gray-800 rounded-[36px] p-3 shadow-2xl"
                  style={{
                    width: "calc(375px + 24px)",
                    height: "calc(667px + 64px)",
                    maxHeight: "calc(100vh - 200px)",
                  }}
                >
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-b-2xl z-10" />
                  <div className="w-full h-full overflow-hidden rounded-[24px] bg-white relative flex flex-col">
                    <div className="h-5 flex-shrink-0" />
                    <iframe
                      key={`desktop:${isWechatPreview ? previewBlobUrl : previewSrcDoc}`}
                      {...previewIframeProps}
                      title="工具预览"
                      className="flex-1 w-full border-0"
                      sandbox={previewSandbox}
                    />
                  </div>
                </div>
              </WechatGuide>
              <p className="mt-4 text-xs text-gray-400 text-center">手机预览 · 375 × 667</p>
            </div>

                        <div className="lg:hidden flex flex-col items-center justify-center w-full flex-1 min-h-0 gap-3 text-gray-500">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <p className="text-sm">预览已切换为全屏模式</p>
              <button
                onClick={() => { setPreviewLsSeed(readPreviewSeed()); setFullscreenPreview(true); }}
                className="mt-1 min-h-[44px] flex items-center justify-center gap-1.5 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                重新打开全屏预览
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen preview overlay */}
      {fullscreenPreview && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* 顶部控制栏，常显 */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-black/60 backdrop-blur-sm z-10 transition-opacity duration-500" id="previewBar">
            <span className="text-sm text-white/80">预览工具效果</span>
            <button
              onClick={() => { setFullscreenPreview(false); setMobileTab("editor"); }}
              className="min-h-[36px] px-4 text-sm text-white bg-white/20 rounded-lg hover:bg-white/30"
            >
              退出预览
            </button>
          </div>
          <iframe
            key={`fullscreen:${isWechatPreview ? previewBlobUrl : previewSrcDoc}`}
            {...previewIframeProps}
            title="全屏预览"
            className="absolute inset-0 w-full h-full border-0"
            sandbox={previewSandbox}
          />
        </div>
      )}

      {/* Publish Modal */}
      {publishOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 lg:p-6 overflow-y-auto">
              <h2 className="text-lg font-bold text-gray-900 mb-4">发布工具</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">工具名称 *</label>
                  <input
                    value={publishTitle}
                    onChange={(e) => setPublishTitle(e.target.value)}
                    placeholder="给你的工具取个名字"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    style={{ fontSize: "16px" }}
                    autoFocus
                    disabled={publishing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">一句话介绍</label>
                  <input
                    value={publishDesc}
                    onChange={(e) => setPublishDesc(e.target.value)}
                    placeholder="简单说说这个工具能做什么"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    style={{ fontSize: "16px" }}
                    disabled={publishing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                  <select
                    value={publishCategory}
                    onChange={(e) => setPublishCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    style={{ fontSize: "16px" }}
                    disabled={publishing}
                  >
                    {CATEGORIES.filter((c) => c.key !== "全部").map((cat) => (
                      <option key={cat.key} value={cat.key}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 可见范围选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">可见范围</label>
                  <div className="space-y-2">
                    {[
                      { value: "public", label: "公开", desc: "出现在广场，任何人可见", color: "text-green-700 bg-green-50 border-green-300", dot: "bg-green-500" },
                      { value: "unlisted", label: "未列出", desc: "不在广场显示，有链接就能访问", color: "text-amber-700 bg-amber-50 border-amber-300", dot: "bg-amber-500" },
                      { value: "private", label: "私密", desc: "仅自己可见，适合测试或草稿", color: "text-red-700 bg-red-50 border-red-300", dot: "bg-red-500" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setPublishPublic(opt.value)}
                        disabled={publishing}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                          publishPublic === opt.value ? `${opt.color} border-2` : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          publishPublic === opt.value ? "border-transparent" : "border-gray-300"
                        }`}>
                          {publishPublic === opt.value && <span className={`w-2 h-2 rounded-full ${opt.dot}`} />}
                        </span>
                        <div>
                          <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                          <span className="block text-xs text-gray-400">{opt.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 下载型工具选项 */}
                <label className="flex items-start gap-3 py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={publishDownloadable}
                    onChange={(e) => setPublishDownloadable(e.target.checked)}
                    disabled={publishing}
                    className="mt-0.5 w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">此工具需要下载到电脑使用</span>
                    <p className="text-xs text-gray-400 mt-0.5">如 PDF 处理等需要本地文件权限的功能</p>
                  </div>
                </label>
                {publishDownloadable && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                    此工具将不会在网页端在线运行，用户需下载到电脑后使用。
                  </div>
                )}

                {publishError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                    {publishError}
                  </div>
                )}

                {(() => {
                  const safety = codeWarnings.filter((w) => w.level !== "info");
                  const memoryNotes = codeWarnings.filter((w) => w.level === "info");
                  return (
                    <>
                      {safety.length > 0 && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
                          <p className="font-medium text-amber-800 mb-2">⚠️ 代码安全提示</p>
                          <p className="text-amber-700 text-xs mb-2">
                            检测到以下可能不安全的 API 调用。微坞会在运行时自动拦截这些操作，但建议你移除或替换它们以确保工具在所有环境下正常运行：
                          </p>
                          <ul className="space-y-1">
                            {safety.map((w, i) => (
                              <li key={i} className="text-xs text-amber-700 flex items-center gap-1.5">
                                <span className={w.level === "high" ? "text-red-500" : "text-amber-500"}>
                                  {w.level === "high" ? "🔴" : "🟡"}
                                </span>
                                <span className="font-medium">{w.label}</span>
                                <span className="text-amber-500">（{w.count} 处）</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {memoryNotes.length > 0 && (
                        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-sm">
                          <p className="font-medium text-indigo-800 mb-1">🧠 记忆功能已启用</p>
                          <p className="text-indigo-700 text-xs leading-relaxed">
                            检测到工具使用 localStorage 保存数据。微坞会自动持久化这些数据——刷新页面、切换全屏、重新进入都能恢复上次的状态；登录用户的数据还会同步到云端，换设备也不丢。
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}

                {!isSupabaseConfigured() && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-600">
                    当前为演示模式，工具将保存到本地浏览器。配置 Supabase 后可发布到云端。
                  </div>
                )}
              </div>
            </div>

            <div className="flex border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => { if (!publishing) setPublishOpen(false); }}
                className="flex-1 min-h-[48px] py-3 text-base text-gray-500 hover:bg-gray-50 transition-colors font-medium disabled:opacity-40"
                disabled={publishing}
              >
                取消
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex-1 min-h-[48px] py-3 text-base bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium"
              >
                {publishBtnText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Card Modal */}
      {shareCardOpen && shareCardData && (
        <ShareCard
          data={shareCardData}
          copied={shareCopied}
          onCopyLink={() => {
            const url = `${window.location.origin}/tool/${shareCardData.toolId}`;
            copyAndAnimate(url, setShareCopied);
            toast.success("链接已复制到剪贴板");
          }}
          onShare={() => {
            const url = `${window.location.origin}/tool/${shareCardData.toolId}`;
            const text = `看看这个工具：「${shareCardData.title}」${shareCardData.description ? " — " + shareCardData.description : ""}`;
            if (navigator.share) {
              navigator.share({ title: shareCardData.title, text, url }).catch(() => {});
            } else {
              copyAndAnimate(url, setShareCopied);
              toast.success("已复制链接，粘贴给你的朋友吧！");
            }
          }}
          onClose={closeShareCard}
        />
      )}

    </div>
  );
}

// --- Share Card Component ---

function ShareCard({
  data,
  copied,
  onCopyLink,
  onShare,
  onClose,
}: {
  data: PublishResult;
  copied: boolean;
  onCopyLink: () => void;
  onShare: () => void;
  onClose: () => void;
}) {
  const toolUrl = typeof window !== "undefined" ? `${window.location.origin}/tool/${data.toolId}` : "";
  const qrUrl = toolUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(toolUrl)}&bgcolor=ffffff&color=4f46e5`
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">🎉 发布成功</h3>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-4">
          {/* Cover */}
          <div className="relative rounded-xl overflow-hidden shadow-md bg-gray-100 aspect-[375/200]">
            {data.coverUrl ? (
              <img
                src={data.coverUrl}
                alt={data.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                }}
              >
                <span className="text-white/80 text-lg font-bold px-4 text-center line-clamp-2">
                  {data.title}
                </span>
              </div>
            )}
            {/* Overlay gradient at bottom for readability */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-white text-base font-bold truncate drop-shadow-md">{data.title}</p>
              {data.description && (
                <p className="text-white/80 text-xs mt-0.5 truncate drop-shadow-md">{data.description}</p>
              )}
            </div>
          </div>

          {/* QR Code */}
          <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
            <div className="flex-shrink-0 w-[90px] h-[90px] bg-white rounded-lg border border-gray-200 overflow-hidden">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="扫码访问工具"
                  className="w-full h-full object-contain p-1"
                  loading="eager"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg className="w-8 h-8 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2m6-6v2m0-2h-2m-2 0H8m4-4V4m0 0H8m4 0h4" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-2">扫码或复制链接分享给朋友</p>
              <p className="text-[11px] text-gray-400 break-all leading-relaxed bg-white rounded-lg border border-gray-200 p-2 truncate">
                {toolUrl}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCopyLink}
              className={`flex-1 min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                copied
                  ? "bg-green-50 text-green-600 border border-green-200 scale-[0.97]"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  已复制
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  复制链接
                </>
              )}
            </button>
            <button
              onClick={onShare}
              className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 active:scale-95 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              分享给朋友
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
