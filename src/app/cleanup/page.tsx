"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";

interface LocalTool {
  id: string;
  title: string;
  author: string;
  author_id: string;
  category: string;
  visibility: string;
  description?: string;
  createdAt: string;
}

export default function CleanupPage() {
  const { user } = useAuth();
  const [tools, setTools] = useState<LocalTool[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wewoo-published-tools");
      if (raw) {
        setTools(JSON.parse(raw));
      }
    } catch { /* ignore */ }
  }, []);

  const handleDelete = (toolId: string) => {
    try {
      const raw = localStorage.getItem("wewoo-published-tools");
      if (!raw) return;
      const items = JSON.parse(raw);
      const filtered = items.filter((t: LocalTool) => t.id !== toolId);
      localStorage.setItem("wewoo-published-tools", JSON.stringify(filtered));
      setTools(filtered);
      setMessage(`已删除`);
      setTimeout(() => setMessage(""), 2000);
    } catch {
      setMessage("删除失败");
    }
  };

  const handleDeleteAll = () => {
    if (!confirm("确定删除所有 localStorage 工具？")) return;
    localStorage.removeItem("wewoo-published-tools");
    localStorage.removeItem("wewoo-favorites");
    setTools([]);
    setMessage("已全部清理");
  };

  return (
    <div className="min-h-screen bg-page pb-20">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-2">🛠️ 本地数据清理</h1>
        <p className="text-sm text-gray-500 mb-6">
          清理旧版本存留在浏览器 localStorage 中的工具数据。清理后刷新主页即可看到效果。
        </p>

        {message && (
          <div className="mb-4 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm">{message}</div>
        )}

        {tools.length === 0 ? (
          <div className="panel p-8 text-center">
            <p className="text-3xl mb-2">✨</p>
            <p className="text-sm text-gray-400">没有需要清理的本地数据</p>
            <Link href="/" className="inline-block mt-4 text-xs text-indigo-600 hover:underline">返回首页</Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">找到 {tools.length} 个本地工具（仅存在于此浏览器）：</p>
            <div className="space-y-3 mb-6">
              {tools.map((t) => (
                <div key={t.id} className="panel p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{t.title || "未命名"}</p>
                    <p className="text-xs text-gray-400">@{t.author || "匿名"} · {t.category || "未分类"} · {t.visibility || "公开"}</p>
                    <p className="text-[10px] text-gray-300">{t.id}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAll}
                className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
              >
                删除全部
              </button>
              <Link href="/" className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                返回首页
              </Link>
            </div>
          </>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
          <p className="font-medium mb-1">📌 说明</p>
          <p>旧版本的工具发布存到了浏览器本地存储，新版本改用云端数据库。这里的清理不会影响云端数据。</p>
          <p className="mt-1">如果你的工具还在云端数据库里，在首页就能看到。没有的话需要重新发布。</p>
        </div>
      </div>
    </div>
  );
}
