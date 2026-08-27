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
import CoverPicker, { COVER_GRADIENTS, DEFAULT_COVER_CHOICE, type CoverChoice } from "@/components/CoverPicker";
import { captureCover, dataUrlToBlob, generateCustomCoverBlob, generateDefaultCoverBlob, uploadCoverToStorage } from "@/lib/cover";
import { AI_PROMPT_TEMPLATE, aiPrompts, containsSensitiveContent, extractHtmlFromAiOutput, sceneTemplates } from "@/lib/aiPrompts";
import { getLsSnapshot } from "@/lib/toolStateBridge";
import { Modal } from "@/components/ui";
import CapabilityBadges from "@/components/CapabilityBadges";

// --- Constants ---

const SCENE_CATEGORIES = ["生活实用", "学习成长", "趣味游戏", "联网查询", "AI 助手"];
const SCENE_CATEGORY_SHORT: Record<string, string> = {
  "生活实用": "生活",
  "学习成长": "学习",
  "趣味游戏": "游戏",
  "联网查询": "联网",
  "AI 助手": "AI",
};

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

interface AiChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: string[]; // v2.10.0：用户消息附带的图片（base64 data URL）
  streaming?: boolean;
}

interface AiVersion {
  id: string;
  label: string;
  code: string;
  desc?: string;
}

interface DraftMeta {
  id: string;
  title: string;
  updatedAt: number;
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

// v2.10.0：把图片文件压缩为视觉模型可用的 base64 data URL（最长边 1024px，JPEG 0.82）
function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("请选择图片文件"));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("图片读取失败"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("图片解析失败"));
      img.onload = () => {
        const maxSide = 1024;
        let width = img.width;
        let height = img.height;
        if (width > maxSide || height > maxSide) {
          const scale = Math.min(maxSide / width, maxSide / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        try {
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        } catch {
          resolve(String(reader.result));
        }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
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
  const [coverChoice, setCoverChoice] = useState<CoverChoice>(DEFAULT_COVER_CHOICE);

  // Share card state
  const [shareCardOpen, setShareCardOpen] = useState(false);
  const [shareCardData, setShareCardData] = useState<PublishResult | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  // Fullscreen preview
  const [fullscreenPreview, setFullscreenPreview] = useState(false);

  // Mobile editor/preview tab（移动端切换用）
  const [mobileTab, setMobileTab] = useState<"chat" | "code" | "preview">("chat");

  // AI prompt helper
  const [externalPromptOpen, setExternalPromptOpen] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<AiChatMsg[]>([]);
  const [aiImages, setAiImages] = useState<string[]>([]); // v2.10.0：待发送图片
  const [deviceTarget, setDeviceTarget] = useState<"mobile" | "desktop">("mobile"); // v2.11.0：设备适配目标
  const [aiVersions, setAiVersions] = useState<AiVersion[]>([]);
  const [aiActiveVersion, setAiActiveVersion] = useState<number | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [sceneTemplatesOpen, setSceneTemplatesOpen] = useState(false);
  const [sceneCategory, setSceneCategory] = useState("生活实用");
  const [drafts, setDrafts] = useState<DraftMeta[]>([]);
  const [draftsOpen, setDraftsOpen] = useState(false);

  const debouncedCode = useDebounce(code, 500);
  const debouncedCodeRef = useRef(debouncedCode);
  debouncedCodeRef.current = debouncedCode;

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const initialLoadDone = useRef(false);
  const aiImageInputRef = useRef<HTMLInputElement>(null); // v2.10.0：图片选择
  const desktopPreviewRef = useRef<HTMLDivElement>(null); // v2.17.0：桌面预览缩放容器
  const [desktopPreviewScale, setDesktopPreviewScale] = useState(0.35);
  // 桌面预览：按容器宽度缩放 1280px 视口，呈现真实桌面布局
  useEffect(() => {
    if (deviceTarget !== "desktop") return;
    const el = desktopPreviewRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setDesktopPreviewScale(Math.min(1, w / 1280));
    };
    update();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, [deviceTarget]);

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

  // Load source tool（v1.8.6：改编 = 全新对话，清掉历史对话，避免混入上一个工具的记录）
  useEffect(() => {
    if (sourceLoaded) return;
    if (!sourceToolIdParam) return;
    try {
      localStorage.removeItem("wewoo-ai-chat" + (user?.id ? "-" + user.id : ""));
    } catch {
      /* ignore */
    }
    setAiMessages([]);
    setAiVersions([]);
    setAiActiveVersion(null);
    fetchToolById(sourceToolIdParam)
      .then((tool) => {
        if (tool) {
          setSourceToolId(tool.id);
          setSourceToolTitle(tool.title);
          setDeviceTarget(tool.layoutTarget === "desktop" ? "desktop" : "mobile"); // v2.11.0：改编继承设备适配
          if (tool.code) setCode(tool.code);
          setAiMessages([
            {
              id: genMsgId(),
              role: "assistant",
              content: `已加载工具「${tool.title ?? "改编源"}」的代码。直接告诉我你想怎么改，我会生成新版完整代码，例如：「换一套配色」「加一个功能」「改成上下布局」。`,
          },
        ]);
      }
      toast.info("已加载改编源，可直接用对话修改");
      setSourceLoaded(true);
    })
      .catch(() => {
        // v1.14.0 容错：改编源加载失败（网络抖动）不阻塞创作页
        toast.error("加载改编源失败，请重试");
        setSourceLoaded(true);
      });
  }, [sourceToolIdParam, sourceLoaded]);

  // Persist versions
  useEffect(() => {
    if (!initialLoadDone.current) return;
    saveVersions(versions);
  }, [versions]);


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

  // --- AI 直接生成 ---
    // --- AI 对话生成 ---
  const aiAbortRef = useRef<AbortController | null>(null);
  const aiChatScrollRef = useRef<HTMLDivElement>(null);
  const aiChatKey = "wewoo-ai-chat" + (user?.id ? "-" + user.id : "");
  const draftsKey = "wewoo-drafts" + (user?.id ? "-" + user.id : "");

  const genMsgId = () => "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  // v1.14.0：从导航入口（?new=1）进入创作页 = 全新对话，清掉历史草稿并移除参数；
  // 直接访问 /create 或页面内刷新仍保留草稿（生成到一半刷新不丢）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("new")) return;
    const key = user ? "wewoo-ai-chat-" + user.id : "wewoo-ai-chat";
    try {
      localStorage.removeItem(key);
    } catch {
      // 隐私模式忽略
    }
    setAiMessages([]);
    setAiVersions([]);
    setAiActiveVersion(null);
    window.history.replaceState({}, "", "/create");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // 恢复对话（localStorage）
  useEffect(() => {
    try {
      const raw = localStorage.getItem(aiChatKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as { messages?: AiChatMsg[]; versions?: AiVersion[]; activeVersion?: number } | null;
      if (saved?.messages) {
        setAiMessages(
          saved.messages.filter(
            (m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
          )
        );
      }
      if (saved?.versions) {
        setAiVersions(saved.versions.filter((v) => v && typeof v.code === "string"));
      }
      if (typeof saved?.activeVersion === "number" && saved.activeVersion >= 0) {
        setAiActiveVersion(saved.activeVersion);
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiChatKey]);

  // 持久化对话（空对话不写入，避免误判为有历史）
  useEffect(() => {
    try {
      if (aiMessages.length === 0 && aiVersions.length === 0) {
        localStorage.removeItem(aiChatKey);
        return;
      }
      localStorage.setItem(
        aiChatKey,
        JSON.stringify({ messages: aiMessages, versions: aiVersions, activeVersion: aiActiveVersion })
      );
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiMessages, aiVersions, aiActiveVersion]);

  // 草稿列表（按 userId 隔离）
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftsKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setDrafts(parsed.filter((d) => d && typeof d.id === "string"));
      }
    } catch { /* ignore */ }
  }, [draftsKey]);

  // 首次进入且无历史对话时自动展开（对话优先）


  // 消息更新时自动滚动到底部
  useEffect(() => {
    const el = aiChatScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [aiMessages]);

    const runAiSend = useCallback(async (reqText: string, versionDesc?: string, images?: string[]) => {
    const req = reqText.trim();
    if (!req || aiGenerating) return;
    const sensitive = containsSensitiveContent(req);
    if (sensitive.hit) {
      setAiError(`内容包含${sensitive.label ?? "违规"}描述，平台不支持生成这类工具`);
      return;
    }
    const reqImages = (images ?? []).slice(0, 4);
    const userMsg: AiChatMsg = { id: genMsgId(), role: "user", content: req, ...(reqImages.length ? { images: reqImages } : {}) };
    const asstMsg: AiChatMsg = { id: genMsgId(), role: "assistant", content: "", streaming: true };
    const nextMessages = [...aiMessages, userMsg, asstMsg];
    setAiMessages(nextMessages);
    setAiError(null);
    setAiGenerating(true);

    const history = nextMessages
      .filter((m) => m.role === "user" || (m.role === "assistant" && m.content.trim()))
      .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }));

    const currentCode =
      aiActiveVersion !== null && aiVersions[aiActiveVersion] && aiVersions[aiActiveVersion].code
        ? aiVersions[aiActiveVersion].code
        : code.trim()
        ? code
        : undefined;

    const controller = new AbortController();
    aiAbortRef.current = controller;
    let acc = "";
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, currentCode, deviceTarget, ...(reqImages.length ? { images: reqImages } : {}) }),
        signal: controller.signal,
      });
      if (!res.ok) {
        let msg = "AI 生成失败，请稍后重试";
        try { const j = await res.json(); if (j && typeof j.error === "string") msg = j.error; } catch { /* ignore */ }
        setAiError(msg);
        setAiMessages((prev) => prev.filter((m) => m.id !== asstMsg.id));
        setAiGenerating(false);
        return;
      }
      if (!res.body) {
        setAiError("AI 服务无响应，请稍后重试");
        setAiMessages((prev) => prev.filter((m) => m.id !== asstMsg.id));
        setAiGenerating(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buf = "";
      let chunkAcc = "";
      let doneReading = false;
      const flush = () => {
        if (!chunkAcc) return;
        acc += chunkAcc;
        chunkAcc = "";
        setAiMessages((prev) =>
          prev.map((m) => (m.id === asstMsg.id ? { ...m, content: acc } : m))
        );
      };
      while (!doneReading) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let sep;
        while ((sep = buf.indexOf("\n\n")) >= 0) {
          const event = buf.slice(0, sep);
          buf = buf.slice(sep + 2);
          for (const line of event.split("\n")) {
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (data === "[DONE]") { doneReading = true; break; }
            try {
              const j = JSON.parse(data);
              const delta = j?.choices?.[0]?.delta?.content;
              if (typeof delta === "string" && delta) chunkAcc += delta;
            } catch { /* ignore */ }
          }
          if (doneReading) break;
        }
        flush();
      }
      flush();
      setAiMessages((prev) =>
        prev.map((m) => (m.id === asstMsg.id ? { ...m, content: acc, streaming: false } : m))
      );
      setAiGenerating(false);

      if (acc.trim()) {
        const html = extractHtmlFromAiOutput(acc);
        if (html) {
          const sensitive2 = containsSensitiveContent(html);
          if (sensitive2.hit) {
            setAiError(`生成结果包含${sensitive2.label ?? "违规"}描述，已拦截，请换个描述重新生成`);
          } else {
            const ver: AiVersion = { id: "v" + Date.now().toString(36), label: "V" + (aiVersions.length + 1), code: html, desc: versionDesc ?? (req.replace(/^(请)?(帮我)?(做一个|做|来一个)?/i, "").slice(0, 8) || "新版本") };
            setAiVersions((prev) => [...prev, ver]);
            setAiActiveVersion(aiVersions.length);
            setCode(html);
            setMobileTab("code");
            toast.success(`已生成 ${ver.label}，代码已自动填入编辑器，可点「预览」查看效果`);
          }
        }
      } else {
        setAiError("AI 没有返回内容，请重试");
      }
    } catch (err) {
      const aborted = err instanceof DOMException && err.name === "AbortError";
      setAiMessages((prev) => prev.map((m) => (m.id === asstMsg.id ? { ...m, streaming: false } : m)));
      setAiGenerating(false);
      if (!aborted) setAiError("AI 生成失败，请检查网络后重试");
    }
  }, [aiMessages, aiVersions, aiActiveVersion, code, aiGenerating, toast, deviceTarget]);

  const handleAiSend = useCallback(() => {
    const t = aiInput.trim();
    if (!t) return;
    setAiInput("");
    const images = aiImages;
    setAiImages([]);
    runAiSend(t, undefined, images);
  }, [aiInput, aiImages, runAiSend]);

  // v2.10.0：选择/拍照导入图片（压缩后附带进 AI 对话）
  const handleAiPickImages = useCallback(async (e: { target: HTMLInputElement }) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    const room = 4 - aiImages.length;
    if (room <= 0) {
      toast.error("最多附带 4 张图片");
      return;
    }
    const picked = files.slice(0, room);
    const next: string[] = [];
    for (const f of picked) {
      try {
        next.push(await compressImageFile(f));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "图片处理失败");
      }
    }
    if (next.length) setAiImages((prev) => [...prev, ...next]);
  }, [aiImages, toast]);

  const handleAiNewVersion = useCallback(() => {
    if (aiGenerating) return;
    runAiSend("请基于当前这个工具，再生成一个不同风格或布局的版本，核心功能保持不变，输出完整代码", "换个风格");
  }, [runAiSend, aiGenerating]);

  const handleAiStop = useCallback(() => {
    aiAbortRef.current?.abort();
  }, []);

  const handleAiFillVersion = useCallback((ver: AiVersion) => {
    if (!ver || !ver.code) return;
    setCode(ver.code);
    setExternalPromptOpen(false);
    setMobileTab("code");
    editorRef.current?.focus();
    toast.success(`已载入 ${ver.label} 完整代码，可直接修改`);
  }, [setCode, toast]);

  // v2.4.0 草稿箱：把当前对话保存为草稿
  const saveCurrentAsDraft = useCallback(() => {
    const firstUser = aiMessages.find((m) => m.role === "user" && m.content.trim());
    if (!firstUser && !code.trim()) return;
    const id = "d" + Date.now().toString(36);
    const title = firstUser ? firstUser.content.trim().slice(0, 24) : "手动编辑的草稿";
    try {
      localStorage.setItem(
        "wewoo-draft-" + id,
        JSON.stringify({ messages: aiMessages, versions: aiVersions, code, title })
      );
      const next: DraftMeta[] = [{ id, title, updatedAt: Date.now() }, ...drafts.filter((d) => d.id !== id)];
      setDrafts(next);
      localStorage.setItem(draftsKey, JSON.stringify(next));
    } catch { /* ignore */ }
  }, [aiMessages, aiVersions, code, drafts, draftsKey]);

  const restoreDraft = useCallback((id: string) => {
    try {
      const raw = localStorage.getItem("wewoo-draft-" + id);
      if (!raw) return;
      const content = JSON.parse(raw) as { messages?: AiChatMsg[]; versions?: AiVersion[]; code?: string };
      setAiMessages(
        (content.messages || []).filter(
          (m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
        )
      );
      setAiVersions((content.versions || []).filter((v) => v && typeof v.code === "string"));
      if (content.code) setCode(content.code);
      setAiActiveVersion(content.versions?.length ? content.versions.length - 1 : null);
      setDraftsOpen(false);
      toast.success("已恢复草稿");
    } catch { /* ignore */ }
  }, [setCode, toast]);

  const deleteDraft = useCallback((id: string) => {
    try {
      localStorage.removeItem("wewoo-draft-" + id);
      const next = drafts.filter((d) => d.id !== id);
      setDrafts(next);
      localStorage.setItem(draftsKey, JSON.stringify(next));
    } catch { /* ignore */ }
  }, [drafts, draftsKey]);

  const handleNewChat = useCallback(() => {
    if (aiGenerating) aiAbortRef.current?.abort();
    saveCurrentAsDraft();
    setAiMessages([]);
    setAiVersions([]);
    setAiActiveVersion(null);
    setAiError(null);
    setCode("");
    try { localStorage.removeItem(aiChatKey); } catch { /* ignore */ }
    toast.success("已新建对话，旧对话已存入草稿箱");
  }, [aiGenerating, saveCurrentAsDraft, aiChatKey, toast]);

  const handleAiClear = useCallback(() => {
    if (aiGenerating) aiAbortRef.current?.abort();
    setAiMessages([]);
    setAiVersions([]);
    setAiActiveVersion(null);
    setAiError(null);
    try { localStorage.removeItem(aiChatKey); } catch { /* ignore */ }
    toast.success("对话已清空");
  }, [aiGenerating, aiChatKey, toast]);
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
    // v2.10.1 发布侧审核底线：标题/简介敏感词拦截 + 长度上限（与 AI 生成侧一致）
    if (publishTitle.trim().length > 60) {
      setPublishError("工具名称过长，请精简到 60 字以内");
      return;
    }
    if (publishDesc.trim().length > 200) {
      setPublishError("一句话介绍过长，请精简到 200 字以内");
      return;
    }
    const sensitiveTitle = containsSensitiveContent(publishTitle);
    const sensitiveDesc = containsSensitiveContent(publishDesc);
    if (sensitiveTitle.hit || sensitiveDesc.hit) {
      setPublishError(
        `内容包含${(sensitiveTitle.hit ? sensitiveTitle.label : sensitiveDesc.label) ?? "违规"}描述，无法发布，请修改后再试`
      );
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
          author: user.user_metadata?.name || user.email?.split("@")[0] || "匿名",
          source_tool_id: sourceToolId || null,
          visibility: publishPublic,
          is_downloadable: publishDownloadable,
          layout_target: deviceTarget,
        })
        .select("id")
        .single();

      if (error) {
        throw new Error(error.message || "发布失败");
      }
      toolId = String((data as { id: string | number }).id);

      // Step 2: Generate & upload cover image（自动截图 / 上传图片 / 渐变+表情）
      setPublishStep("screenshot");
      let coverUrl: string | null = null;

      try {
        let coverBlob: Blob | null = null;
        if (coverChoice.mode === "upload" && coverChoice.uploadDataUrl) {
          coverBlob = await dataUrlToBlob(coverChoice.uploadDataUrl);
        } else if (coverChoice.mode === "gradient") {
          const gradientCss = COVER_GRADIENTS[coverChoice.gradientIndex % COVER_GRADIENTS.length];
          coverBlob = await generateCustomCoverBlob(title, currentVersions.length, coverChoice.emoji, gradientCss);
        } else {
          coverBlob = await captureCover(currentCode);
        }
        if (coverBlob) {
          setPublishStep("uploading");
          coverUrl = await uploadCoverToStorage(coverBlob, toolId, client);
        }
      } catch {
        console.warn("Cover generation failed");
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
    setCoverChoice(DEFAULT_COVER_CHOICE);
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
      className="btn-primary min-w-[44px] min-h-[44px] flex items-center justify-center px-3 py-1.5 text-sm rounded-lg font-medium"
    >
      发布
    </button>
  ) : (
    <Link
      href="/auth"
      className="btn-primary min-w-[44px] min-h-[44px] flex items-center justify-center px-3 py-1.5 text-sm rounded-lg font-medium"
    >
      登录后发布
    </Link>
  );

  const mobileActions = (
    <>
      <button
        onClick={() => { setPreviewLsSeed(readPreviewSeed()); setCode(TEMPLATE_CODE); toast.info("已填入示例工具"); }}
        className="btn-secondary"
      >
        示例
      </button>
      <Link
        href="/guide"
        target="_blank"
        title="教程"
        aria-label="教程"
        className="btn-secondary"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        教程
      </Link>
      <button
        onClick={saveSnapshot}
        className={`min-w-[44px] min-h-[44px] flex items-center justify-center px-3 py-1.5 text-sm rounded-lg transition-all font-medium ${
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
      <Link
        href="/guide"
        target="_blank"
        className="min-w-[44px] min-h-[44px] flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        教程
      </Link>
      <button
        onClick={handleCopyCode}
        className="min-w-[44px] min-h-[44px] flex items-center px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
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
  useToolStorage("preview", user?.id, user);

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
                {/* 移动端：对话 / 代码 / 预览 三 tab（v1.8.6） */}
        <div className="lg:hidden flex-shrink-0 flex items-center justify-center px-3 py-2 bg-gray-200 border-b border-gray-300">
          <div className="flex bg-gray-100 rounded-xl p-1 w-full max-w-[320px]">
            <button
              onClick={() => setMobileTab("chat")}
              className={`flex-1 min-h-[44px] flex items-center justify-center gap-1 rounded-lg text-sm font-medium transition-all ${mobileTab === "chat" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500"}`}
            >
              <span className="text-base leading-none">💬</span>
              对话
            </button>
            <button
              onClick={() => setMobileTab("code")}
              className={`flex-1 min-h-[44px] flex items-center justify-center gap-1 rounded-lg text-sm font-medium transition-all ${mobileTab === "code" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500"}`}
            >
              <span className="text-base leading-none">📝</span>
              代码
            </button>
            <button
              onClick={() => { setPreviewLsSeed(readPreviewSeed()); setFullscreenPreview(true); }}
              className={`flex-1 min-h-[44px] flex items-center justify-center gap-1 rounded-lg text-sm font-medium transition-all ${mobileTab === "preview" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500"}`}
            >
              <span className="text-base leading-none">👁</span>
              预览
            </button>
          </div>
        </div>
        {/* === AI Chat Panel（桌面左栏 / 移动端对话 tab）=== */}
        <div className={`flex-1 flex flex-col min-h-0 bg-white lg:w-[33%] ${mobileTab === "chat" ? "flex" : "hidden"} lg:flex`}>
          <div className="flex-shrink-0 flex items-center justify-between px-3 lg:px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-1.5">
              <span className="text-base">💬</span>
              <span className="text-sm font-medium text-gray-800">和 AI 对话生成工具</span>
              <span className="text-xs text-gray-400 hidden sm:inline">内置 DeepSeek</span>
              {/* v2.11.0：设备适配切换（仅电脑端显示） */}
              <div className="hidden lg:flex items-center ml-2 rounded-lg bg-gray-100 p-0.5" role="group" aria-label="设备适配">
                <button
                  onClick={() => setDeviceTarget("mobile")}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    deviceTarget === "mobile" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                  style={{ touchAction: "manipulation" }}
                  title="移动端优先（默认）"
                >
                  📱 手机优先
                </button>
                <button
                  onClick={() => setDeviceTarget("desktop")}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    deviceTarget === "desktop" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                  style={{ touchAction: "manipulation" }}
                  title="电脑端优先（宽屏布局）"
                >
                  🖥️ 电脑优先
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setDraftsOpen((v) => !v)}
                className={`min-h-[40px] px-2.5 py-1 text-xs transition-colors ${
                  draftsOpen ? "text-indigo-600" : "text-gray-500 hover:text-indigo-600"
                }`}
                style={{ touchAction: "manipulation" }}
              >
                📁 草稿{drafts.length > 0 ? `（${drafts.length}）` : ""}
              </button>
              {aiMessages.length > 0 && (
                <button
                  onClick={handleAiClear}
                  className="min-h-[40px] px-2.5 py-1 text-xs text-gray-400 hover:text-rose-500 transition-colors"
                  style={{ touchAction: "manipulation" }}
                >
                  清空对话
                </button>
              )}
              <button
                onClick={handleNewChat}
                className="min-h-[40px] px-2.5 py-1 text-xs text-indigo-600 hover:text-indigo-700 transition-colors"
                style={{ touchAction: "manipulation" }}
              >
                ＋ 新建对话
              </button>
            </div>
          </div>
          {draftsOpen && (
            <div className="flex-shrink-0 max-h-[180px] overflow-y-auto bg-white border-b border-gray-100 px-3 py-2 space-y-1">
              {drafts.length > 0 ? (
                drafts.map((d) => (
                  <div key={d.id} className="flex items-center gap-1.5">
                    <button
                      onClick={() => restoreDraft(d.id)}
                      className="flex-1 min-w-0 text-left px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      style={{ touchAction: "manipulation" }}
                    >
                      <div className="text-xs font-medium text-gray-700 truncate">{d.title}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{formatTime(d.updatedAt)}</div>
                    </button>
                    <button
                      onClick={() => deleteDraft(d.id)}
                      className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-gray-300 hover:text-rose-500 text-xs rounded-lg hover:bg-rose-50 transition-colors"
                      style={{ touchAction: "manipulation" }}
                      aria-label="删除草稿"
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-3">暂无草稿，新建对话时会自动保存</p>
              )}
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-3 lg:px-4 py-3 space-y-3">
{/* AI 对话生成 */}
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3">
                

                {aiVersions.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "thin" }}>
                    <span className="text-xs text-gray-500 flex-shrink-0">版本</span>
                    {aiVersions.map((v, idx) => (
                      <button
                        key={v.id}
                        onClick={() => handleAiFillVersion(v)}
                        title="载入编辑器，查看/修改完整代码"
                        className={`flex-shrink-0 min-h-[40px] px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                          aiActiveVersion === idx
                            ? "bg-emerald-600 text-white border-emerald-500"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                        style={{ touchAction: "manipulation" }}
                      >
                        {v.label}
                        {v.desc && <span className="ml-1 opacity-75">·{v.desc}</span>}
                      </button>
                    ))}
                    {!aiGenerating && (
                      <button
                        onClick={handleAiNewVersion}
                        className="flex-shrink-0 min-h-[40px] px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full hover:bg-indigo-100 transition-all"
                        style={{ touchAction: "manipulation" }}
                      >
                        ＋ 换个版本
                      </button>
                    )}
                  </div>
                )}

                <div ref={aiChatScrollRef} className="space-y-2 max-h-[280px] overflow-y-auto pr-1 mb-2">
                  {aiMessages.length === 0 && (
                    <>
                      <div className="text-center px-3 pt-3 pb-1">
                        <div className="text-3xl leading-none mb-3">✨</div>
                        <h3 className="text-[15px] font-semibold text-gray-900">想做点什么？</h3>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          告诉 AI 你的想法，它会生成可运行的工具
                        </p>
                      </div>

                      <button
                        onClick={() => setSceneTemplatesOpen((v) => !v)}
                        className="w-full min-h-[44px] flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-sm hover:shadow-md active:scale-[0.99] transition-all"
                        style={{ touchAction: "manipulation" }}
                      >
                        <span className="flex items-center gap-2">🎨 从场景模板开始</span>
                        <span className="flex items-center gap-1 text-xs font-normal text-white/80">
                          16 个模板
                          <svg className={`w-4 h-4 transition-transform ${sceneTemplatesOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </span>
                      </button>

                      {sceneTemplatesOpen && (
                        <div className="space-y-2.5">
                          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                            {SCENE_CATEGORIES.map((cat) => (
                              <button
                                key={cat}
                                onClick={() => setSceneCategory(cat)}
                                className={`flex-1 min-h-[34px] px-1.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                  sceneCategory === cat
                                    ? "bg-white text-indigo-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                                style={{ touchAction: "manipulation" }}
                              >
                                {SCENE_CATEGORY_SHORT[cat] ?? cat}
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {sceneTemplates
                              .filter((t) => t.category === sceneCategory)
                              .map((t) => (
                                <button
                                  key={t.id}
                                  onClick={() => {
                                    if (aiGenerating) return;
                                    runAiSend(t.prompt);
                                  }}
                                  className="min-h-[40px] flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:text-indigo-600 active:scale-[0.98] transition-all"
                                  style={{ touchAction: "manipulation" }}
                                >
                                  <span className="text-base leading-none flex-shrink-0">{t.emoji}</span>
                                  <span className="leading-snug text-left">{t.label}</span>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}

                      <div className="text-center pt-0.5">
                        <Link
                          href="/guide"
                          target="_blank"
                          className="text-xs text-gray-400 hover:text-indigo-600 underline underline-offset-2"
                        >
                          📖 不会写？看看教程
                        </Link>
                      </div>
                    </>
                  )}
                  {aiMessages.map((m) => (
                    <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                      <div
                        className={`max-w-[88%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                          m.role === "user"
                            ? "bg-indigo-600 text-white rounded-br-sm"
                            : "bg-white text-gray-700 border border-gray-200 rounded-bl-sm"
                        }`}
                      >
                        {m.role === "user" && m.images && m.images.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-1.5">
                            {m.images.map((src, idx) => (
                              <img
                                key={idx}
                                src={src}
                                alt="附带图片"
                                className="w-16 h-16 object-cover rounded-lg bg-white/20"
                              />
                            ))}
                          </div>
                        )}
                        {m.content || (m.streaming ? "思考中…" : "")}
                        {m.streaming && (
                          <span className="inline-block w-1.5 h-3.5 ml-1 align-middle bg-indigo-500 animate-pulse" />
                        )}
                        {!m.streaming && m.role === "assistant" && (() => {
                          const html = extractHtmlFromAiOutput(m.content);
                          if (!html) return null;
                          return (
                            <>
                              <div className="mt-1.5 text-xs text-emerald-600">✅ 代码已自动填入编辑器，点版本按钮可切换</div>
                              <CapabilityBadges code={html} className="mt-2" />
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>

                {aiError && (
                  <div className="mb-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                    {aiError}
                  </div>
                )}

                {aiImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {aiImages.map((src, idx) => (
                      <div key={idx} className="relative">
                        <img src={src} alt="待发送图片" className="w-14 h-14 object-cover rounded-lg border border-gray-200" />
                        <button
                          onClick={() => setAiImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-800/80 text-white text-[10px] leading-none flex items-center justify-center hover:bg-rose-500"
                          aria-label="移除图片"
                          style={{ touchAction: "manipulation" }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  ref={aiImageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleAiPickImages}
                  aria-label="选择图片"
                />
                <div className="flex items-end gap-2">
                  <button
                    onClick={() => aiImageInputRef.current?.click()}
                    disabled={aiGenerating}
                    title="添加图片 / 拍照"
                    aria-label="添加图片或拍照"
                    className="flex-shrink-0 min-h-[44px] px-3 py-2 text-base bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ touchAction: "manipulation" }}
                  >
                    📷
                  </button>
                  <textarea
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    disabled={aiGenerating}
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAiSend();
                      }
                    }}
                    className="flex-1 min-h-[44px] max-h-[96px] bg-white border border-gray-200 rounded-lg p-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 resize-none"
                    placeholder="描述需求或修改意见…"
                    aria-label="AI 对话输入"
                  />
                  {aiGenerating ? (
                    <button
                      onClick={handleAiStop}
                      className="flex-shrink-0 min-h-[44px] px-4 py-2 text-sm font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-500 active:scale-95 transition-all"
                      style={{ touchAction: "manipulation" }}
                    >
                      ⏹ 停止
                    </button>
                  ) : (
                    <button
                      onClick={handleAiSend}
                      disabled={!aiInput.trim()}
                      className="flex-shrink-0 min-h-[44px] px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ touchAction: "manipulation" }}
                    >
                      发送
                    </button>
                  )}
                </div>
                <div className="mt-1.5 text-xs text-gray-400 leading-relaxed">
                  平台已支持白名单联网、内置 AI 与图片理解（点 📷 可拍照/导入图片）；超出沙盒范围的需求，AI 会说明原因并给出替代方案
                </div>
              </div>
              
            {/* 外部提示词折叠（v1.8.6：默认收起，点击展开） */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
              <button
                onClick={() => setExternalPromptOpen((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5 min-h-[44px]"
                style={{ touchAction: "manipulation" }}
              >
                <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <span className="text-base">📘</span> 想用外部 AI（ChatGPT/Kimi 等）？复制这段提示词
                </span>
                <svg className={`w-3.5 h-3.5 text-gray-500 transition-transform ${externalPromptOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {externalPromptOpen && (
                <div className="px-3 pb-3 space-y-3">
<div className="relative">
                <pre className="text-xs text-gray-500 bg-gray-100 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap leading-relaxed border border-gray-200">
{AI_PROMPT_TEMPLATE}</pre>
                <button
                  onClick={handleCopyPrompt}
                  className="absolute top-2 right-2 min-h-[40px] flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 active:scale-95 transition-all"
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
                <div className="mb-1.5 text-xs font-medium text-gray-500">
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
                      className="min-h-[36px] px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full hover:bg-indigo-100 active:scale-95 transition-all"
                      style={{ touchAction: "manipulation" }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

                </div>
              )}
            </div>
          </div>
        </div>
{/* === Editor Panel === */}
        <div className={`flex-1 flex flex-col min-h-0 bg-[#0A1628] lg:w-[34%] ${mobileTab === "code" ? "flex" : "hidden"} lg:flex`}>
          <div className="flex-shrink-0 flex items-center justify-between px-3 lg:px-4 py-1.5 lg:py-2 bg-[#0F1F38] border-b border-white/10">
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
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3 lg:w-3.5 lg:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                教程
              </Link>
              <button
                onClick={() => { setCode(""); editorRef.current?.focus(); }}
                className="text-xs lg:text-sm text-gray-500 hover:text-red-400 transition-colors flex items-center gap-0.5 min-w-[44px] min-h-[44px] justify-center"
                title="清空编辑器"
                aria-label="清空编辑器"
              >
                <svg className="w-3 h-3 lg:w-3.5 lg:h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline">清空</span>
              </button>
              <span className="text-xs text-gray-500 hidden sm:inline">Ctrl+S 保存快照</span>
              <span className="text-xs text-gray-500">{code.length.toLocaleString()} 字符</span>
            </div>
          </div>

          <textarea
            ref={editorRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 w-full bg-[#0A1628] text-gray-100 font-mono text-sm lg:text-sm leading-relaxed p-3 lg:p-4 resize-none outline-none"
            style={{ tabSize: 2, MozTabSize: 2, fontSize: "16px" }}
            spellCheck={false}
            placeholder={"把代码粘贴到这里 👉\n\n没代码？点右上角「试试示例」\n或者点这里看教程 → "}
            aria-label="代码编辑器"
          />

          {versions.length > 0 && (
            <div className="flex-shrink-0 border-t border-white/10">
              <div className="flex items-center justify-between px-3 lg:px-4 py-1.5 lg:py-2 bg-[#0F1F38]/60">
                <span className="text-[10px] lg:text-xs font-medium text-gray-400 uppercase tracking-wider">版本快照</span>
                <span className="text-xs text-gray-500">{versions.length} 个版本</span>
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
                      className="w-full aspect-[3/4] rounded-md border-2 border-white/15 group-hover:border-indigo-400 transition-colors overflow-hidden relative"
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
                  <span className="text-[10px] lg:text-xs text-gray-400 whitespace-nowrap">← 向左滑动</span>
                </div>
              </div>
            </div>
          )}

          {versions.length === 0 && (
            <div className="flex-shrink-0 border-t border-white/10 px-3 lg:px-4 py-2 flex items-center gap-2">
              <svg className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-gray-500">点击「保存快照」或按 Ctrl+S 保存当前版本</span>
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
        <div className={`flex-1 flex flex-col items-center justify-center bg-gray-200 p-3 lg:p-4 min-h-0 lg:w-[33%] ${mobileTab === "preview" ? "flex" : "hidden"} lg:flex`}>
          <div className="relative flex flex-col items-center flex-1 w-full justify-center">
            <div className="flex flex-col items-center w-full">
              {deviceTarget === "desktop" ? (
                <>
                  <div className="w-full max-w-[720px] bg-gray-800 rounded-xl p-2 shadow-2xl">
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-700 rounded-t-lg">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                      <div className="ml-2 flex-1 bg-white/10 rounded-full px-3 py-1 text-[11px] text-gray-400 truncate">we-woo.net</div>
                    </div>
                    <div ref={desktopPreviewRef} className="relative w-full overflow-hidden bg-white" style={{ aspectRatio: "16/9" }}>
                      <iframe
                        key={`desktop2:${isWechatPreview ? previewBlobUrl : previewSrcDoc}`}
                        {...previewIframeProps}
                        title="桌面预览"
                        className="absolute top-0 left-0 border-0"
                        style={{ width: "1280px", height: "720px", transform: `scale(${desktopPreviewScale})`, transformOrigin: "top left" }}
                        sandbox={previewSandbox}
                      />
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-gray-400 text-center">电脑预览 · 1280 × 720</p>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>

                                    <div className="lg:hidden flex flex-col items-center justify-center w-full flex-1 min-h-0 gap-3 text-gray-500">
              <button
                onClick={() => { setPreviewLsSeed(readPreviewSeed()); setFullscreenPreview(true); }}
                className="mt-1 min-h-[44px] flex items-center justify-center gap-1.5 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                ⛶ 全屏预览
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
              onClick={() => { setFullscreenPreview(false); setMobileTab("code"); }}
              className="min-h-[44px] px-4 text-sm text-white bg-white/20 rounded-lg hover:bg-white/30"
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
        <Modal open maxWidth="max-w-md" cardClassName="max-h-[90vh] flex flex-col">
            <div className="p-5 lg:p-6 overflow-y-auto">
              <h2 className="text-lg font-bold text-gray-900 mb-4">发布工具</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">工具名称 *</label>
                  <input
                    value={publishTitle}
                    onChange={(e) => setPublishTitle(e.target.value)}
                    placeholder="给你的工具取个名字"
                    className="input-base"
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
                    className="input-base"
                    style={{ fontSize: "16px" }}
                    disabled={publishing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                  <select
                    value={publishCategory}
                    onChange={(e) => setPublishCategory(e.target.value)}
                    className="input-base"
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

                {/* v2.11.0：设备适配选择（发布时记录到详情页徽章） */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">设备适配</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDeviceTarget("mobile")}
                      disabled={publishing}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${
                        deviceTarget === "mobile"
                          ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                      style={{ touchAction: "manipulation" }}
                    >
                      📱 移动端优化
                    </button>
                    <button
                      onClick={() => setDeviceTarget("desktop")}
                      disabled={publishing}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${
                        deviceTarget === "desktop"
                          ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                      style={{ touchAction: "manipulation" }}
                    >
                      🖥️ 电脑端优化
                    </button>
                  </div>
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

                <CoverPicker value={coverChoice} onChange={setCoverChoice} disabled={publishing} />

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

                <div className="pt-1">
                  <p className="text-xs font-medium text-gray-500 mb-1.5">工具能力（发布后展示给用户）</p>
                  <CapabilityBadges code={code} showEmpty />
                </div>

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
                className="flex-1 btn-ghost min-h-[48px] text-base disabled:opacity-40"
                disabled={publishing}
              >
                取消
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="btn-primary flex-1 min-h-[48px] py-3 text-base font-medium disabled:opacity-50"
              >
                {publishBtnText}
              </button>
            </div>
        </Modal>
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
    <Modal open maxWidth="max-w-sm">
        <div className="h-1.5 brand-gradient" />
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
    </Modal>
  );
}
