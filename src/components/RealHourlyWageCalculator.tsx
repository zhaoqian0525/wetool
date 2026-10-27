"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { trackGrowthEvent } from "@/lib/growth";

const FULL_TOOL_URL =
  "/tool/c800bd9b-09bb-4dd0-a1f0-ac67f6e3a7a8?utm_source=hourly_wage&utm_medium=landing&utm_campaign=first_100";

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

export default function RealHourlyWageCalculator() {
  const [salary, setSalary] = useState("10000");
  const [workDays, setWorkDays] = useState("22");
  const [workHours, setWorkHours] = useState("8");
  const [commuteHours, setCommuteHours] = useState("1");
  const [showResult, setShowResult] = useState(true);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied" | "shared">("idle");
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackGrowthEvent("tool_open", {
      toolId: "hourly-wage-landing",
      path: "/real-hourly-wage",
      onceKey: "hourly-wage-open",
    });
  }, []);

  const result = useMemo(() => {
    const monthlySalary = toPositiveNumber(salary, 0);
    const days = toPositiveNumber(workDays, 0);
    const hours = toPositiveNumber(workHours, 0);
    const commute = Math.max(0, Number(commuteHours) || 0);
    const workHoursPerMonth = days * hours;
    const realHoursPerMonth = days * (hours + commute);

    return {
      monthlySalary,
      days,
      hours,
      commute,
      workHoursPerMonth,
      realHoursPerMonth,
      workHourly: workHoursPerMonth > 0 ? monthlySalary / workHoursPerMonth : 0,
      realHourly: realHoursPerMonth > 0 ? monthlySalary / realHoursPerMonth : 0,
      commuteHoursPerMonth: days * commute,
    };
  }, [salary, workDays, workHours, commuteHours]);

  const handleCalculate = () => {
    setShowResult(true);
    setHasCalculated(true);
    trackGrowthEvent("tool_completed", {
      toolId: "hourly-wage-landing",
      path: "/real-hourly-wage",
    });
    window.setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const handleShare = async () => {
    const text = "月薪高不一定时薪高。把加班和通勤算进去，看看你的一小时值多少钱。";
    const shareData = {
      title: "真实时薪计算器",
      text,
      url:
        window.location.origin +
        "/real-hourly-wage?utm_source=share&utm_medium=referral&utm_campaign=first_100&utm_content=result_share",
    };

    trackGrowthEvent("share_click", {
      toolId: "hourly-wage-landing",
      path: "/real-hourly-wage",
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
    <div className="rounded-[28px] border border-indigo-100 bg-white p-4 shadow-2xl shadow-indigo-200/45 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-indigo-600">免费计算</p>
          <h2 className="mt-1 text-xl font-black text-slate-900">你的真实时薪是多少？</h2>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">不用登录</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2 block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">月薪（元）</span>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">¥</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={salary}
              onChange={(event) => setSalary(event.target.value)}
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-lg font-bold text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">每月工作天数</span>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            max="31"
            value={workDays}
            onChange={(event) => setWorkDays(event.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-bold text-slate-900 outline-none focus:border-indigo-400 focus:bg-white"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">每天工作小时</span>
          <input
            type="number"
            inputMode="decimal"
            min="1"
            max="24"
            step="0.5"
            value={workHours}
            onChange={(event) => setWorkHours(event.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-bold text-slate-900 outline-none focus:border-indigo-400 focus:bg-white"
          />
        </label>

        <label className="col-span-2 block">
          <span className="mb-1.5 flex items-center justify-between gap-2 text-sm font-semibold text-slate-700">
            <span>每天通勤（小时）</span>
            <span className="text-xs font-normal text-slate-400">可填 0</span>
          </span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            max="12"
            step="0.25"
            value={commuteHours}
            onChange={(event) => setCommuteHours(event.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-bold text-slate-900 outline-none focus:border-indigo-400 focus:bg-white"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={handleCalculate}
        className="mt-4 h-14 w-full rounded-2xl bg-indigo-600 px-5 text-base font-black text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.99]"
      >
        算出我的真实时薪
      </button>

      {showResult && (
        <div ref={resultRef} className="mt-5 rounded-2xl bg-slate-950 p-5 text-white">
          <p className="text-xs font-bold tracking-[0.14em] text-indigo-300">
            {hasCalculated ? "把通勤也算进去之后" : "示例数据 · 把通勤也算进去之后"}
          </p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-4xl font-black tracking-tight text-amber-300">¥{formatMoney(result.realHourly)}</span>
            <span className="pb-1 text-sm text-slate-400">/ 小时</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-slate-400">只看上班时间</p>
              <p className="mt-1 text-base font-bold">¥{formatMoney(result.workHourly)}/小时</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-slate-400">每月通勤</p>
              <p className="mt-1 text-base font-bold">{result.commuteHoursPerMonth.toFixed(1)} 小时</p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-300">
            每月实际投入 {result.realHoursPerMonth.toFixed(1)} 小时。时薪不是选工作的唯一标准，但它能帮你看清时间换来了多少收入。
          </p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleShare}
          className="h-11 rounded-xl border border-indigo-200 bg-indigo-50 px-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100"
        >
          {shareState === "copied" ? "已复制" : shareState === "shared" ? "已分享" : "分享结果"}
        </button>
        <a
          href={FULL_TOOL_URL}
          className="flex h-11 items-center justify-center rounded-xl bg-slate-900 px-3 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          打开完整版工具
        </a>
      </div>
      <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
        本页计算不会上传工资数据；完整版支持双基准对比、历史记录与手机桌面安装。
      </p>
    </div>
  );
}
