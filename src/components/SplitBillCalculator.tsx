"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { trackGrowthEvent } from "@/lib/growth";

const FULL_TOOL_URL =
  "/tool/332fbf19-2537-4af3-a36c-e82829921f54?utm_source=split_bill&utm_medium=landing&utm_campaign=first_100";

function formatMoney(value: number) {
  return value.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function toPositiveNumber(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export default function SplitBillCalculator() {
  const [total, setTotal] = useState("300");
  const [people, setPeople] = useState("4");
  const [hasCalculated, setHasCalculated] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied" | "shared">("idle");
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackGrowthEvent("tool_open", {
      toolId: "split-bill-landing",
      path: "/split-bill",
      onceKey: "split-bill-open",
    });
  }, []);

  const result = useMemo(() => {
    const amount = toPositiveNumber(total, 0);
    const count = Math.max(1, Math.floor(toPositiveNumber(people, 1)));
    const perPerson = amount / count;
    const rounded = Math.round(perPerson * 100) / 100;
    const remainder = Math.round((amount - rounded * count) * 100) / 100;
    return { amount, count, perPerson, rounded, remainder };
  }, [total, people]);

  const handleCalculate = () => {
    setHasCalculated(true);
    trackGrowthEvent("tool_completed", {
      toolId: "split-bill-landing",
      path: "/split-bill",
    });
    window.setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const handleShare = async () => {
    const text = "聚餐、旅行、合租分账总算不清？输入总金额和人数，马上知道每人多少。";
    const shareData = {
      title: "分账计算器",
      text,
      url:
        window.location.origin +
        "/split-bill?utm_source=share&utm_medium=referral&utm_campaign=first_100&utm_content=result_share",
    };

    trackGrowthEvent("share_click", {
      toolId: "split-bill-landing",
      path: "/split-bill",
    });

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareState("shared");
      } else {
        await navigator.clipboard.writeText(`${text}\n${shareData.url}`);
        setShareState("copied");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(`${text}\n${shareData.url}`);
        setShareState("copied");
      } catch {
        setShareState("idle");
      }
    }
  };

  return (
    <div className="rounded-[28px] border border-emerald-100 bg-white p-4 shadow-2xl shadow-emerald-200/45 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-emerald-600">免费计算</p>
          <h2 className="mt-1 text-xl font-black text-slate-900">这顿饭每人多少钱？</h2>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          不用登录
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2 block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">总金额（元）</span>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
              ¥
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={total}
              onChange={(event) => setTotal(event.target.value)}
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-lg font-bold text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
            />
          </div>
        </label>

        <label className="col-span-2 block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">几个人分</span>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            max="99"
            value={people}
            onChange={(event) => setPeople(event.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-base font-bold text-slate-900 outline-none focus:border-emerald-400 focus:bg-white"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={handleCalculate}
        className="mt-4 h-14 w-full rounded-2xl bg-emerald-600 px-5 text-base font-black text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 active:scale-[0.99]"
      >
        算出每人应付
      </button>

      <div ref={resultRef} className="mt-5 rounded-2xl bg-slate-950 p-5 text-white">
        <p className="text-xs font-bold tracking-[0.14em] text-emerald-300">
          {hasCalculated ? "按人数平均分" : "示例数据 · 按人数平均分"}
        </p>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-4xl font-black tracking-tight text-emerald-300">
            ¥{formatMoney(result.rounded)}
          </span>
          <span className="pb-1 text-sm text-slate-400">/ 人</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-slate-400">总金额</p>
            <p className="mt-1 text-base font-bold">¥{formatMoney(result.amount)}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-slate-400">人数</p>
            <p className="mt-1 text-base font-bold">{result.count} 人</p>
          </div>
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-300">
          {Math.abs(result.remainder) < 0.005
            ? "金额刚好除尽。"
            : `按两位小数计算会有 ¥${formatMoney(Math.abs(result.remainder))} 的差额，可让最后一人多付或少付。`}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleShare}
          className="h-11 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
        >
          {shareState === "copied" ? "已复制" : shareState === "shared" ? "已分享" : "分享给朋友"}
        </button>
        <a
          href={FULL_TOOL_URL}
          className="flex h-11 items-center justify-center rounded-xl bg-slate-900 px-3 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          按项目分账
        </a>
      </div>
      <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
        本页只做快速估算，不上传金额；完整版支持按项目分账、保存记录和分享。
      </p>
    </div>
  );
}
