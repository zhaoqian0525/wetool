import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import RealHourlyWageCalculator from "@/components/RealHourlyWageCalculator";

const baseUrl = "https://we-woo.net";
const pageUrl = `${baseUrl}/real-hourly-wage`;
const title = "真实时薪计算器（税前估算）：把通勤算进去";
const description =
  "月薪高不等于时薪高。输入月薪、工作天数和通勤时间，快速估算税前时间时薪；完整版可算五险一金、个税后的税后时薪。";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pageUrl },
  keywords: [
    "真实时薪计算器",
    "时薪计算",
    "月薪换算时薪",
    "通勤时间计算",
    "税前时薪",
    "通勤时薪",
    "加班时薪",
  ],
  openGraph: {
    type: "article",
    locale: "zh_CN",
    url: pageUrl,
    siteName: "微坞 WeWoo",
    title,
    description,
    images: [
      {
        url: "/growth/hourly-wage-cover.png",
        width: 900,
        height: 383,
        alt: "真实时薪计算器 - 微坞 WeWoo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/growth/hourly-wage-cover.png"],
  },
};

const faqs = [
  {
    question: "真实时薪怎么计算？",
    answer:
      "本页是税前快速估算：月薪除以每月实际投入的总时长。总时长包括每天的工作时间和通勤时间，再乘以每月工作天数；五险一金和个税请用完整版计算。",
  },
  {
    question: "为什么要计算通勤时间？",
    answer:
      "通勤是为完成工作额外付出的时间。两份工作月薪相近时，把通勤算进去，常常能看清哪一份真正占用了更多时间。",
  },
  {
    question: "单休和双休的时薪差多少？",
    answer:
      "单休通常意味着每月工作天数更多。即使月薪更高，多出来的工资也可能是在购买你的休息日。用相同公式计算后对比更直观。",
  },
  {
    question: "计算器会保存工资数据吗？",
    answer:
      "不会上传工资数据。页面上的结果只在当前浏览器中计算；需要五险一金、个税和法定基准对比时，可继续打开微坞完整版工具。",
  },
];

export default function RealHourlyWagePage() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "真实时薪计算器",
      url: pageUrl,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "CNY" },
      description,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar
        children={<span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">真实时薪</span>}
        actions={
          <Link
            href="/"
            className="hidden min-h-[44px] items-center rounded-xl px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 sm:flex"
          >
            逛工具广场
          </Link>
        }
      />

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 text-white">
          <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1fr_430px] lg:items-center lg:py-20">
            <div>
              <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-[0.12em]">
                找工作前，先算这笔账
              </span>
              <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.08] tracking-tight sm:text-6xl">
                月薪高
                <br />
                <span className="text-amber-300">不一定时薪高</span>
              </h1>
              <p className="mt-5 max-w-xl text-base font-medium leading-8 text-indigo-100 sm:text-lg">
                把单休、加班和每天通勤一起算进去，先看看你税前的时间时薪；需要税后结果时再打开完整版。
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-sm font-semibold text-indigo-50">
                <span className="rounded-full bg-white/10 px-3 py-2">无需登录</span>
                <span className="rounded-full bg-white/10 px-3 py-2">30 秒算完</span>
                <span className="rounded-full bg-white/10 px-3 py-2">工资不上传</span>
              </div>
            </div>
            <RealHourlyWageCalculator />
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["01", "把时间算完整", "工作时间和通勤时间都计入，不只看工资条上的数字。"],
              ["02", "用同一把尺比较", "月薪、上班天数、每天时长不同也能放到同一基准。"],
              ["03", "做决定前多看一眼", "时薪不是唯一标准，但它能让时间成本更透明。"],
            ].map(([number, heading, copy]) => (
              <article key={number} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-sm font-black text-indigo-600">
                  {number}
                </span>
                <h2 className="mt-5 text-lg font-black text-slate-900">{heading}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-500">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="text-xs font-black tracking-[0.16em] text-indigo-600">时间成本，算完才看清</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-slate-900">
                多拿 2,000 元，
                <br />
                时薪反而少了 10.6 元
              </h2>
            </div>
            <div className="space-y-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-black text-slate-900">A 工作 · 双休</p>
                    <p className="mt-1 text-sm text-slate-500">月薪 10,000 · 22 天 × 8 小时</p>
                  </div>
                  <strong className="whitespace-nowrap text-2xl text-emerald-700">¥56.8</strong>
                </div>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-black text-slate-900">B 工作 · 单休</p>
                    <p className="mt-1 text-sm text-slate-500">月薪 12,000 · 26 天 × 10 小时</p>
                  </div>
                  <strong className="whitespace-nowrap text-2xl text-rose-700">¥46.2</strong>
                </div>
              </div>
              <p className="px-1 pt-2 text-sm leading-7 text-slate-500">
                B 工作每月多拿 2,000 元，却多付出了大量时间。把工资放回时间里比较，选择会更清楚。
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="text-2xl font-black text-slate-900">计算时常见的 4 个问题</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {faqs.map((faq) => (
              <details key={faq.question} className="group rounded-2xl border border-slate-200 bg-white p-5">
                <summary className="cursor-pointer list-none pr-6 text-sm font-bold text-slate-800">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-500">{faq.answer}</p>
              </details>
            ))}
          </div>

          <div className="mt-10 rounded-[28px] bg-slate-950 p-7 text-white sm:p-10">
            <p className="text-xs font-black tracking-[0.16em] text-indigo-300">不止算一次</p>
            <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-black sm:text-3xl">用完整版看税后时薪</h2>
                <p className="mt-2 max-w-xl text-sm leading-7 text-slate-300">
                  完整版会算入五险一金和个税，并对比法定基准；还能添加到手机主屏幕随时使用。
                </p>
              </div>
              <a
                href="/tool/c800bd9b-09bb-4dd0-a1f0-ac67f6e3a7a8?utm_source=hourly_wage&utm_medium=landing_footer&utm_campaign=first_100"
                className="flex min-h-[48px] shrink-0 items-center justify-center rounded-xl bg-amber-300 px-6 text-sm font-black text-slate-950 transition hover:bg-amber-200"
              >
                打开完整版计算器
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
