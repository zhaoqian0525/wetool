import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import LandingViewTracker from "@/components/LandingViewTracker";

const baseUrl = "https://we-woo.net";
const pageUrl = `${baseUrl}/2048`;
const title = "2048 小游戏：走错一步，可以撤回";
const description =
  "不用下载，打开就玩。支持撤回一步、最高分自动保存，手机上也能单手玩。";
const coverUrl = `${baseUrl}/growth/2048-cover.png`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pageUrl },
  keywords: ["2048", "2048小游戏", "在线2048", "撤回2048", "手机小游戏"],
  openGraph: {
    type: "article",
    locale: "zh_CN",
    url: pageUrl,
    siteName: "微坞 WeWoo",
    title,
    description,
    images: [{ url: coverUrl, width: 1200, height: 630, alt: "2048 小游戏 - 微坞 WeWoo" }],
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
    question: "2048 怎么撤回？",
    answer:
      "在游戏里点「撤回」按钮，就可以回到上一步。走错方向或者手滑时不用重开。",
  },
  {
    question: "最高分会保存吗？",
    answer:
      "会。重新打开工具后，本机保存的最高分会继续保留；登录后使用记录也会同步。",
  },
  {
    question: "手机上怎么玩？",
    answer:
      "在手机上直接向上下左右滑动即可。页面适配手机屏幕，也支持添加到主屏幕后全屏玩。",
  },
  {
    question: "需要下载或登录吗？",
    answer:
      "不需要下载，打开就能玩。登录主要用于保存使用记录和跨设备同步。",
  },
];

const TILE_STYLES: Record<number, string> = {
  2: "bg-amber-50 text-amber-900",
  4: "bg-amber-100 text-amber-900",
  8: "bg-orange-200 text-orange-900",
  16: "bg-orange-300 text-white",
  32: "bg-orange-400 text-white",
  64: "bg-orange-500 text-white",
  128: "bg-yellow-400 text-white",
  256: "bg-yellow-500 text-white",
  512: "bg-rose-500 text-white",
  1024: "bg-rose-600 text-white",
  2048: "bg-indigo-600 text-white",
};

function BoardMock({
  tiles,
  label,
  badge,
}: {
  tiles: number[];
  label?: string;
  badge?: string;
}) {
  return (
    <div className="relative rounded-[26px] border border-white/20 bg-slate-950/30 p-3 shadow-2xl backdrop-blur">
      {badge && (
        <span className="absolute -right-2 -top-2 z-10 rounded-full bg-lime-300 px-3 py-1 text-[11px] font-black text-slate-950 shadow-lg">
          {badge}
        </span>
      )}
      <div className="grid grid-cols-4 gap-1.5">
        {tiles.map((value, index) => (
          <div
            key={index}
            className={`flex aspect-square items-center justify-center rounded-lg text-sm font-black sm:text-base ${
              value === 0 ? "bg-white/10" : TILE_STYLES[value] || "bg-indigo-600 text-white"
            } ${value >= 1000 ? "text-[11px] sm:text-xs" : ""}`}
          >
            {value || ""}
          </div>
        ))}
      </div>
      {label && <p className="mt-3 text-center text-xs font-bold text-white/70">{label}</p>}
    </div>
  );
}

const HERO_TILES = [
  2, 4, 8, 16,
  32, 64, 128, 256,
  512, 1024, 2, 4,
  0, 0, 8, 16,
];

const BEFORE_TILES = [
  2, 4, 8, 16,
  32, 64, 128, 256,
  512, 1024, 2, 4,
  0, 0, 8, 16,
];

const AFTER_TILES = [
  2, 4, 8, 16,
  32, 64, 128, 256,
  512, 1024, 2, 4,
  0, 8, 16, 32,
];

export default function Game2048Page() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "2048 小游戏",
      url: pageUrl,
      applicationCategory: "GameApplication",
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
      <LandingViewTracker toolId="2048-landing" path="/2048" onceKey="2048-open" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar
        children={
          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
            2048
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
        <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-rose-600 to-fuchsia-700 text-white">
          <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1fr_390px] lg:items-center lg:py-20">
            <div>
              <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-[0.12em]">
                经典 2048 · 手机也能玩
              </span>
              <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.08] tracking-tight sm:text-6xl">
                走错一步
                <br />
                <span className="text-amber-300">不用重开</span>
              </h1>
              <p className="mt-5 max-w-xl text-base font-medium leading-8 text-orange-50 sm:text-lg">
                不用下载，打开就玩。手滑走错方向，点一下撤回回到上一步；最高分自动保存。
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <a
                  href="/tool/4c285279-d7cf-4852-a9e0-ed022b06dccf?utm_source=2048&utm_medium=landing&utm_campaign=first_100"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-white px-6 text-sm font-black text-orange-700 shadow-sm transition hover:bg-orange-50"
                >
                  开始玩 2048
                </a>
                <a
                  href="#undo"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/20"
                >
                  看撤回怎么用
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 text-sm font-semibold text-orange-50">
                <span className="rounded-full bg-white/10 px-3 py-2">无需登录</span>
                <span className="rounded-full bg-white/10 px-3 py-2">撤回一步</span>
                <span className="rounded-full bg-white/10 px-3 py-2">最高分保存</span>
              </div>
            </div>
            <BoardMock tiles={HERO_TILES} label="手滑走错？点撤回" badge="↩ 撤回一步" />
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["01", "撤回一步", "走错方向不用重开，回到上一步继续玩。"],
              ["02", "最高分自动保存", "下次打开继续挑战，不用从零开始。"],
              ["03", "手机单手滑", "上下左右滑动即可，适配手机全屏。"],
            ].map(([number, heading, copy]) => (
              <article key={number} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-sm font-black text-orange-600">
                  {number}
                </span>
                <h2 className="mt-5 text-lg font-black text-slate-900">{heading}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-500">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="undo" className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="text-xs font-black tracking-[0.16em] text-orange-600">撤回，是 2048 的后悔药</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-slate-900">
                手滑一次，
                <br />
                不用整局重来
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-500">
                2048 最怕的不是不会玩，而是关键时刻滑错一格。撤回一步，把刚才的失误收回来，继续冲高分。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <BoardMock tiles={BEFORE_TILES} label="走错一步" />
              <BoardMock tiles={AFTER_TILES} label="撤回一步" badge="已撤回" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="text-2xl font-black text-slate-900">玩 2048 常见的 4 个问题</h2>
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
            <p className="text-xs font-black tracking-[0.16em] text-amber-300">现在就开一局</p>
            <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-black sm:text-3xl">不用下载，点开就玩</h2>
                <p className="mt-2 max-w-xl text-sm leading-7 text-slate-300">
                  支持撤回一步、最高分保存和手机全屏。走错一步，也可以继续。
                </p>
              </div>
              <a
                href="/tool/4c285279-d7cf-4852-a9e0-ed022b06dccf?utm_source=2048&utm_medium=landing_footer&utm_campaign=first_100"
                className="flex min-h-[48px] shrink-0 items-center justify-center rounded-xl bg-amber-300 px-6 text-sm font-black text-slate-950 transition hover:bg-amber-200"
              >
                开始玩 2048
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
