"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui";

const GUIDE_SEEN_KEY = "wewoo-guide-seen";

export default function OnboardingModal({ onClose }: { onClose?: () => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (!localStorage.getItem(GUIDE_SEEN_KEY)) setShow(true);
    } catch {
      // ignore
    }
  }, []);

  const handleClose = () => {
    try {
      localStorage.setItem(GUIDE_SEEN_KEY, "1");
    } catch {
      // ignore
    }
    setShow(false);
    onClose?.();
  };

  if (!show) return null;

  return (
    <Modal open={show} maxWidth="max-w-md" z="z-[60]" cardClassName="rounded-3xl">
      <div className="bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 px-7 py-8 text-center text-white">
        <div className="mb-3 text-5xl">✨</div>
        <h2 className="text-2xl font-black">欢迎来到微坞</h2>
        <p className="mt-2 text-sm leading-6 text-white/80">
          不会编程也没关系。直接把想要的东西告诉 AI。
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-3 text-sm leading-6 text-gray-600">
          <p className="flex gap-2">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">1</span>
            说一句需求，例如「做一个旅游分账工具」。
          </p>
          <p className="flex gap-2">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">2</span>
            AI 会生成可运行的工具，不满意继续说「换配色」「加一个功能」。
          </p>
          <p className="flex gap-2">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">3</span>
            满意后在预览里确认，发布前登录即可分享。
          </p>
        </div>

        <button
          onClick={handleClose}
          className="btn-primary mt-6 flex min-h-[48px] w-full items-center justify-center rounded-xl px-5 text-sm font-bold"
        >
          开始做
        </button>
        <Link
          href="/guide"
          onClick={handleClose}
          className="mt-3 flex min-h-[44px] items-center justify-center rounded-xl text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800"
        >
          先看 1 分钟教程
        </Link>
      </div>
    </Modal>
  );
}
