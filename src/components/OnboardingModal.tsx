"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const GUIDE_SEEN_KEY = "wewoo-guide-seen";

const slides = [
  {
    icon: "👋",
    title: "欢迎使用微坞！",
    desc: "这里可以创建自己的小工具，分享给所有人。别担心不会编程，跟着引导走就行！",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: "🤖",
    title: "让 AI 帮你写代码",
    desc: "打开 ChatGPT / Kimi / 豆包等 AI 工具，告诉它你想要什么，比如「帮我做一个 BMI 计算器」。AI 会给你一段代码，复制下来就行。",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: "📝",
    title: "粘贴代码到编辑器",
    desc: "把代码粘贴到左边黑色的编辑器里。右边手机框会立刻显示效果 —— 改一行代码，右边马上变！",
    color: "from-green-500 to-teal-500",
  },
  {
    icon: "🚀",
    title: "保存 · 发布 · 分享",
    desc: "满意了点「保存快照」保存进度，然后点「发布」填写信息就能分享给朋友了！发布前需要先登录哦。",
    color: "from-amber-500 to-orange-500",
  },
];

export default function OnboardingModal() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const seen = localStorage.getItem(GUIDE_SEEN_KEY);
      if (!seen) {
        setShow(true);
      }
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
  };

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!show) return null;

  const slide = slides[step];
  const isLast = step === slides.length - 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Slide visual */}
        <div className={`bg-gradient-to-br ${slide.color} p-8 text-center relative`}>
          <button
            onClick={handleSkip}
            className="absolute top-3 right-4 text-white/70 hover:text-white text-sm transition-colors"
          >
            跳过
          </button>
          <div className="text-6xl mb-3 animate-bounce">{slide.icon}</div>
          <h2 className="text-xl font-bold text-white">{slide.title}</h2>
        </div>

        {/* Slide content */}
        <div className="p-6">
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            {slide.desc}
          </p>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-2 rounded-full transition-all ${
                  i === step ? "w-6 bg-indigo-600" : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`第 ${i + 1} 步`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 min-h-[44px] py-2.5 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                上一步
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 min-h-[44px] py-2.5 text-sm text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
            >
              {isLast ? "开始创作 🚀" : "下一步 →"}
            </button>
          </div>

          {/* Link to full guide */}
          {isLast && (
            <Link
              href="/guide"
              onClick={handleClose}
              className="block text-center mt-3 text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              📖 查看完整图文教程
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
