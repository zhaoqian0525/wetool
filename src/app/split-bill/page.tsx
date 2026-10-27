import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SplitBillCalculator from "@/components/SplitBillCalculator";

const baseUrl = "https://we-woo.net";
const pageUrl = `${baseUrl}/split-bill`;
const title = "分账计算器：聚餐旅行，一算就清";
const description =
  "输入总金额和人数，立即算出每人应付；除不尽自动提示差额。完整版还支持按项目分账、保存记录和分享。";
const coverUrl =
  "https://cvacrykzcppiflmvwwfe.supabase.co/storage/v1/object/public/tool-covers/public/332fbf19-2537-4af3-a36c-e82829921f54.webp";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pageUrl },
  keywords: ["分账计算器", "AA制计算", "聚餐分账", "旅行分账", "人均计算"],
  openGraph: {
    type: "article",
    locale: "zh_CN",
    url: pageUrl,
    siteName: "微坞 WeWoo",
    title,
    description,
    images: [{ url: coverUrl, width: 375, height: 667, alt: "分账计算器 - 微坞 WeWoo" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [coverUrl],
  },
};

const faqs = [
  {
    question: "分账计算器怎么用？",
    answer:
      "输入这顿饭或这次旅行的总金额，再填人数，页面会立即算出每人应付。除不尽时会提示剩余差额。",
  },
  {
    question: "每个人点的东西不一样怎么办？",
    answer:
      "快速版按人数平均分；如果要按每个人点的项目分别计算，打开完整版分账计算器即可。",
  },
  {
    question: "除不尽的钱怎么处理？",
    answer:
      "页面按两位小数计算，并提示剩余差额。实际付款时可以让最后一人补差额，或者直接向上取整。",
  },
  {
    question: "会保存金额或个人信息吗？",
    answer:
      "这个落地页只在当前浏览器中计算，不上传金额；需要保存历史记录时再打开完整版。",
  },
];

export default function SplitBillPage() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "分账计算器",
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
        children={
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            分账计算器
          </span>
        }
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
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-700 text-white">
          <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-lime-300/20 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1fr_430px] lg:items-center lg:py-20">
            <div>
              <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-[0.12em]">
                聚餐 · 旅行 · 合租
              </span>
              <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.08] tracking-tight sm:text-6xl">
                分账不清
                <br />
                <span className="text-lime-300">一算就清</span>
              </h1>
              <p className="mt-5 max-w-xl text-base font-medium leading-8 text-emerald-50 sm:text-lg">
                不用拿计算器反复按。输入总金额和人数，马上知道每人多少；除不尽也能看到差额。
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-sm font-semibold text-emerald-50">
                <span className="rounded-full bg-white/10 px-3 py-2">无需登录</span>
                <span className="rounded-full bg-white/10 px-3 py-2">3 秒算完</span>
                <span className="rounded-full bg-white/10 px-3 py-2">金额不上传</span>
              </div>
            </div>
            <SplitBillCalculator />
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["01", "按人数快速摊", "总金额和人数一填，马上得到每人应付。"],
              ["02", "除不尽有提示", "按两位小数计算，剩余差额直接告诉你。"],
              ["03", "复杂场景有完整版", "按项目分账、保存记录、分享给同行的人。"],
            ].map(([number, heading, copy]) => (
              <article key={number} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-sm font-black text-emerald-600">
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
              <p className="text-xs font-black tracking-[0.16em] text-emerald-600">一顿饭，谁都不想吃亏</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-slate-900">
                328 元，
                <br />
                4 个人怎么分？
              </h2>
            </div>
            <div className="space-y-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-black text-slate-900">平均分 · 4 人</p>
                    <p className="mt-1 text-sm text-slate-500">总金额 ¥328</p>
                  </div>
                  <strong className="whitespace-nowrap text-2xl text-emerald-700">¥82.00</strong>
                </div>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-black text-slate-900">除不尽 · 3 人</p>
                    <p className="mt-1 text-sm text-slate-500">总金额 ¥100</p>
                  </div>
                  <strong className="whitespace-nowrap text-2xl text-amber-700">¥33.33</strong>
                </div>
                <p className="mt-2 text-xs text-amber-700">还剩 ¥0.01，可由最后一人补差额。</p>
              </div>
              <p className="px-1 pt-2 text-sm leading-7 text-slate-500">
                快速版负责把最常见的场景算清楚；如果每个人点的项目不同，再打开完整版按项目分账。
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="text-2xl font-black text-slate-900">分账时常见的 4 个问题</h2>
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
            <p className="text-xs font-black tracking-[0.16em] text-emerald-300">不止平均分</p>
            <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-black sm:text-3xl">用完整版按项目分账</h2>
                <p className="mt-2 max-w-xl text-sm leading-7 text-slate-300">
                  每个人点了不同东西、有人不喝酒、有人没参加某项活动，都可以在完整版里分开算。
                </p>
              </div>
              <a
                href="/tool/332fbf19-2537-4af3-a36c-e82829921f54?utm_source=split_bill&utm_medium=landing_footer&utm_campaign=first_100"
                className="flex min-h-[48px] shrink-0 items-center justify-center rounded-xl bg-lime-300 px-6 text-sm font-black text-slate-950 transition hover:bg-lime-200"
              >
                打开完整版分账
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
