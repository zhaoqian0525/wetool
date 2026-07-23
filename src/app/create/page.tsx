"use client";

import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { CATEGORIES, fetchToolById } from "@/lib/data";
import { wrapSecureSrcDoc, IFRAME_SANDBOX, scanDangerousCode } from "@/lib/sandbox";

// --- Constants ---

const DEFAULT_CODE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>示例工具</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 20px;
      padding: 32px 24px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      width: 100%;
      max-width: 320px;
      text-align: center;
    }
    h2 { font-size: 20px; color: #333; margin-bottom: 24px; }
    .input-group { display: flex; gap: 8px; margin-bottom: 16px; }
    input {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 16px;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus { border-color: #667eea; }
    button {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.1s;
    }
    button:active { transform: scale(0.98); }
    .result {
      margin-top: 20px;
      padding: 16px;
      background: #f3f4f6;
      border-radius: 12px;
    }
    .result .label { font-size: 13px; color: #6b7280; margin-bottom: 4px; }
    .result .value { font-size: 28px; font-weight: 700; color: #667eea; }
  </style>
</head>
<body>
  <div class="card">
    <h2>🔢 简单计算器</h2>
    <div class="input-group">
      <input type="number" id="a" placeholder="数字 A" value="10">
      <input type="number" id="b" placeholder="数字 B" value="5">
    </div>
    <button onclick="calc()">计算 A + B</button>
    <div class="result">
      <div class="label">结果</div>
      <div class="value" id="result">15</div>
    </div>
  </div>
  <script>
    function calc() {
      const a = parseFloat(document.getElementById('a').value) || 0;
      const b = parseFloat(document.getElementById('b').value) || 0;
      document.getElementById('result').textContent = a + b;
    }
  </script>
</body>
</html>`;

const LOCAL_STORAGE_KEY = "wetool-versions";

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

  const [code, setCode] = useState(DEFAULT_CODE);
  const [versions, setVersions] = useState<Version[]>([]);
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");
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
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [codeWarnings, setCodeWarnings] = useState<{ level: string; label: string; count: number }[]>([]);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const initialLoadDone = useRef(false);

  // Restore versions
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;
    const saved = loadVersions();
    if (saved.length > 0) setVersions(saved);
  }, []);

  // Load source tool when adapting
  useEffect(() => {
    if (sourceLoaded) return;
    if (!sourceToolIdParam) return;
    fetchToolById(sourceToolIdParam).then((tool) => {
      if (tool) {
        setSourceToolId(tool.id);
        setSourceToolTitle(tool.title);
        if (tool.code) {
          setCode(tool.code);
        }
      }
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
    const snapshot: Version = {
      id: generateId(),
      timestamp: Date.now(),
      code,
      gradientIndex: versions.length % THUMBNAIL_GRADIENTS.length,
    };
    const updated = [snapshot, ...versions];
    setVersions(updated);
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 1500);
    if (timelineRef.current) {
      timelineRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [code, versions]);

  const restoreVersion = useCallback((v: Version) => {
    setCode(v.code);
  }, []);

  // Keyboard shortcuts
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
        const newValue = code.substring(0, start) + "  " + code.substring(end);
        setCode(newValue);
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        });
      }
    },
    [code, saveSnapshot]
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

  // Publish handler
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
      const thumbnailIdx =
        THUMBNAIL_GRADIENTS.indexOf(
          THUMBNAIL_GRADIENTS[versions.length % THUMBNAIL_GRADIENTS.length]
        );
      const gradient =
        THUMBNAIL_GRADIENTS[thumbnailIdx < 0 ? 0 : thumbnailIdx];

      if (isSupabaseConfigured()) {
        const client = getSupabase();
        if (client) {
          const { error } = await client.from("tools").insert({
            title: publishTitle.trim(),
            description: publishDesc.trim(),
            category: publishCategory,
            code,
            thumbnail_gradient: gradient,
            author_id: user.id,
            author: user.email?.split("@")[0] ?? "匿名",
            source_tool_id: sourceToolId || null,
          });
          if (error) throw error;
        }
      } else {
        // Fallback: save to localStorage for demo
        const key = "wetool-published-tools";
        const existing = JSON.parse(localStorage.getItem(key) ?? "[]");
        existing.unshift({
          id: generateId(),
          title: publishTitle.trim(),
          description: publishDesc.trim(),
          category: publishCategory,
          code,
          thumbnailGradient: gradient,
          author: user.email?.split("@")[0] ?? "匿名",
          author_id: user.id,
          source_tool_id: sourceToolId || null,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem(key, JSON.stringify(existing));
      }

      router.push("/");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "发布失败，请稍后重试";
      setPublishError(message);
    } finally {
      setPublishing(false);
    }
  };

  const openPublish = () => {
    if (!user) return;
    setPublishOpen(true);
    setPublishError("");
    // 扫描代码中的危险调用，用于发布前告警
    const result = scanDangerousCode(code);
    setCodeWarnings(result.warnings);
  };

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  const handleReset = useCallback(() => {
    setCode(DEFAULT_CODE);
  }, []);

  // Publish button: show login prompt if not authenticated
  const publishButton = user ? (
    <button
      onClick={openPublish}
      className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
    >
      发布工具
    </button>
  ) : (
    <Link
      href="/auth"
      className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
    >
      登录后发布
    </Link>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-100">
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
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              重置
            </button>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 text-sm bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors"
            >
              {copied ? "已复制 ✓" : "复制代码"}
            </button>
            <button
              onClick={saveSnapshot}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all font-medium ${
                savedIndicator
                  ? "bg-green-500 text-white"
                  : "bg-amber-500 text-white hover:bg-amber-600"
              }`}
            >
              {savedIndicator ? "已保存 ✓" : "保存快照"}
            </button>
            {publishButton}
          </div>
        }
      />

      {/* Mobile Tab Switcher */}
      <div className="flex-shrink-0 flex lg:hidden border-b border-gray-200 bg-white">
        <button
          onClick={() => setMobileTab("editor")}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            mobileTab === "editor"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          编辑代码
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            mobileTab === "preview"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          实时预览
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left Panel */}
        <div
          className={`flex-1 flex flex-col min-h-0 bg-gray-900 ${
            mobileTab === "editor" ? "flex" : "hidden"
          } lg:flex`}
        >
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-gray-400 ml-2">HTML</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 hidden sm:inline">Ctrl+S 保存快照</span>
              <span className="text-xs text-gray-500">{code.length.toLocaleString()} 字符</span>
            </div>
          </div>

          <textarea
            ref={editorRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 w-full bg-gray-900 text-gray-100 font-mono text-sm leading-relaxed p-4 resize-none outline-none"
            style={{ tabSize: 2, MozTabSize: 2 }}
            spellCheck={false}
            placeholder="将 AI 生成的 HTML 代码粘贴到这里..."
            aria-label="代码编辑器"
          />

          {/* Version Timeline */}
          {versions.length > 0 && (
            <div className="flex-shrink-0 border-t border-gray-700">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">版本快照</span>
                <span className="text-xs text-gray-500">{versions.length} 个版本</span>
              </div>
              <div ref={timelineRef} className="flex gap-2 px-4 pb-3 overflow-x-auto" style={{ scrollbarWidth: "thin" }}>
                {versions.map((v, idx) => (
                  <button
                    key={v.id}
                    onClick={() => restoreVersion(v)}
                    className="flex-shrink-0 group flex flex-col items-center gap-1.5 w-[72px] focus:outline-none"
                    title={`恢复至 ${formatTime(v.timestamp)}`}
                  >
                    <div
                      className="w-full aspect-[3/4] rounded-md border-2 border-gray-600 group-hover:border-indigo-400 transition-colors overflow-hidden relative"
                      style={{ background: THUMBNAIL_GRADIENTS[v.gradientIndex] }}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                        <div className="w-8 h-1.5 rounded-full bg-white mb-1" />
                        <div className="w-10 h-1 rounded-full bg-white mb-1" />
                        <div className="w-6 h-1 rounded-full bg-white" />
                      </div>
                      <div className="absolute top-1 right-1 bg-black/40 text-white text-[10px] px-1 rounded font-mono">#{idx + 1}</div>
                    </div>
                    <span className="text-[11px] text-gray-400 group-hover:text-gray-200 text-center leading-tight">{formatTime(v.timestamp)}</span>
                  </button>
                ))}
                <div className="flex-shrink-0 flex items-center">
                  <span className="text-xs text-gray-600 whitespace-nowrap">← 向左滑动</span>
                </div>
              </div>
            </div>
          )}

          {versions.length === 0 && (
            <div className="flex-shrink-0 border-t border-gray-700 px-4 py-2.5 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-gray-500">点击「保存快照」或按 Ctrl+S 保存当前版本</span>
            </div>
          )}

          {/* Adapting source banner */}
          {sourceToolId && sourceToolTitle && (
            <div className="flex-shrink-0 border-t border-gray-700 bg-purple-900/30 px-4 py-2 flex items-center gap-2">
              <span className="text-xs">✨</span>
              <span className="text-xs text-gray-300">
                正在改编：<span className="text-purple-300 font-medium">{sourceToolTitle}</span>
              </span>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div
          className={`flex-1 flex items-center justify-center bg-gray-200 p-4 min-h-0 ${
            mobileTab === "preview" ? "flex" : "hidden"
          } lg:flex`}
        >
          <div className="relative flex flex-col items-center">
            <div
              className="relative bg-gray-800 rounded-[36px] p-3 shadow-2xl"
              style={{
                width: "calc(375px + 24px)",
                height: "calc(667px + 64px)",
                maxWidth: "calc(100vw - 32px)",
                maxHeight: "calc(100vh - 200px)",
              }}
            >
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-b-2xl z-10" />
              <div className="w-full h-full overflow-hidden rounded-[24px] bg-white relative flex flex-col">
                <div className="h-5 flex-shrink-0" />
                <iframe
                  srcDoc={wrapSecureSrcDoc(code)}
                  title="工具预览"
                  className="flex-1 w-full border-0"
                  sandbox={IFRAME_SANDBOX}
                />
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-400 text-center">手机预览 · 375 × 667</p>
          </div>
        </div>
      </div>

      {/* Publish Modal */}
      {publishOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">发布工具</h2>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">工具名称 *</label>
                  <input
                    value={publishTitle}
                    onChange={(e) => setPublishTitle(e.target.value)}
                    placeholder="给你的工具取个名字"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">一句话介绍</label>
                  <input
                    value={publishDesc}
                    onChange={(e) => setPublishDesc(e.target.value)}
                    placeholder="简单说说这个工具能做什么"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                  <select
                    value={publishCategory}
                    onChange={(e) => setPublishCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {CATEGORIES.filter((c) => c.key !== "全部").map((cat) => (
                      <option key={cat.key} value={cat.key}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Error */}
                {publishError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {publishError}
                  </div>
                )}

                {/* Code safety warnings */}
                {codeWarnings.length > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                    <p className="font-medium text-amber-800 mb-2">
                      ⚠️ 代码安全提示
                    </p>
                    <p className="text-amber-700 text-xs mb-2">
                      检测到以下可能不安全的 API 调用。微坞会在运行时自动拦截这些操作，但建议你移除或替换它们以确保工具在所有环境下正常运行：
                    </p>
                    <ul className="space-y-1">
                      {codeWarnings.map((w, i) => (
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

                {/* Publish info */}
                {!isSupabaseConfigured() && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-600">
                    当前为演示模式，工具将保存到本地浏览器。配置 Supabase 后可发布到云端。
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => setPublishOpen(false)}
                className="flex-1 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex-1 py-3 text-sm bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium"
              >
                {publishing ? "发布中..." : "确认发布"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
