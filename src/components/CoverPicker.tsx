"use client";

import { useRef } from "react";

export type CoverMode = "auto" | "upload" | "gradient";

export interface CoverChoice {
  mode: CoverMode;
  /** 上传图片的 dataURL（mode === "upload" 时使用） */
  uploadDataUrl?: string;
  /** 渐变序号（mode === "gradient" 时使用） */
  gradientIndex: number;
  /** 渐变封面大表情（mode === "gradient" 时使用） */
  emoji: string;
}

export const DEFAULT_COVER_CHOICE: CoverChoice = {
  mode: "auto",
  gradientIndex: 0,
  emoji: "🛠️",
};

/** 封面渐变配色（发布/更换封面共用，与 create 页缩略图渐变保持一致风格） */
export const COVER_GRADIENTS = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #f093fb, #f5576c)",
  "linear-gradient(135deg, #4facfe, #00f2fe)",
  "linear-gradient(135deg, #fa8231, #f7b731)",
  "linear-gradient(135deg, #43e97b, #38f9d7)",
  "linear-gradient(135deg, #a18cd1, #fbc2eb)",
  "linear-gradient(135deg, #ffecd2, #fcb69f)",
  "linear-gradient(135deg, #11998e, #38ef7d)",
];

const EMOJIS = ["🛠️", "🎮", "📝", "🧮", "⏰", "📅", "💰", "🎯", "🍳", "🌦️", "🎵", "💪", "📚", "🧠", "🎨", "❤️"];

const MODES: { value: CoverMode; label: string; desc: string; icon: string }[] = [
  { value: "auto", label: "自动截图", desc: "发布时截取工具界面", icon: "📸" },
  { value: "upload", label: "上传图片", desc: "用自己的封面图", icon: "🖼️" },
  { value: "gradient", label: "渐变封面", desc: "配色 + 表情", icon: "🎨" },
];

/**
 * 封面选择器：自动截图 / 上传图片 / 渐变+表情
 * 用于发布弹窗与作者更换封面，保持两处交互一致。
 */
export default function CoverPicker({
  value,
  onChange,
  disabled,
}: {
  value: CoverChoice;
  onChange: (v: CoverChoice) => void;
  disabled?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("图片不能超过 5MB");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ ...value, mode: "upload", uploadDataUrl: String(reader.result) });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">封面</label>
      <div className="flex gap-2 mb-3">
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange({ ...value, mode: m.value })}
            className={`flex-1 flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border text-xs transition-colors ${
              value.mode === m.value
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <span className="text-base">{m.icon}</span>
            <span className="font-medium">{m.label}</span>
            <span className="text-[10px] text-gray-400">{m.desc}</span>
          </button>
        ))}
      </div>

      {/* 预览 */}
      <div className="w-24 h-32 rounded-xl overflow-hidden border border-gray-200 shadow-sm mb-3 flex items-center justify-center relative">
        {value.mode === "upload" && value.uploadDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.uploadDataUrl} alt="封面预览" className="w-full h-full object-cover" />
        ) : value.mode === "gradient" ? (
          <div
            className="w-full h-full flex flex-col items-center justify-center"
            style={{ background: COVER_GRADIENTS[value.gradientIndex % COVER_GRADIENTS.length] }}
          >
            <span className="text-4xl drop-shadow">{value.emoji}</span>
            <span className="text-[10px] text-white/90 font-medium mt-1 px-1 text-center">微坞 WeWoo</span>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
            <span className="text-3xl mb-1">📸</span>
            <span className="text-[10px] px-1 text-center">发布时自动截取工具界面</span>
          </div>
        )}
      </div>

      {value.mode === "upload" && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileRef.current?.click()}
          className="w-full min-h-[40px] px-3 py-2 text-sm border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {value.uploadDataUrl ? "重新选择图片" : "选择图片（≤5MB）"}
        </button>
      )}

      {value.mode === "gradient" && (
        <div className="space-y-2">
          <div className="flex gap-1.5 flex-wrap">
            {COVER_GRADIENTS.map((g, i) => (
              <button
                key={i}
                type="button"
                disabled={disabled}
                onClick={() => onChange({ ...value, gradientIndex: i })}
                className={`w-8 h-8 rounded-lg border-2 transition-all ${
                  value.gradientIndex === i ? "border-indigo-600 scale-110" : "border-transparent"
                }`}
                style={{ background: g }}
              />
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                disabled={disabled}
                onClick={() => onChange({ ...value, emoji: e })}
                className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border ${
                  value.emoji === e ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />
    </div>
  );
}