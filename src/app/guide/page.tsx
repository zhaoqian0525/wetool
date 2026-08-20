"use client";

import Link from "next/link";
import { GUIDE_REQ_TEXT, aiPrompts } from "@/lib/aiPrompts";
import { WewooMark } from "@/components/WewooLogo";

const steps = [
  {
    num: 1,
    title: "想好做什么工具",
    icon: "💡",
    color: "from-amber-400 to-orange-500",
    desc: "先想一个需求：倒计时、记账、计算器……都可以。",
    tip: "没想法？看看首页别人的工具找灵感",
  },
  {
    num: 2,
    title: "和 AI 对话生成",
    icon: "🤖",
    color: "from-indigo-400 to-purple-500",
    desc: "在创作页直接描述你的想法，点发送，AI 会边聊边生成代码。",
    tip: "可继续对话调整：「换个配色」「加个历史记录」。平台支持白名单联网和内置 AI，超出沙盒范围 AI 会说明并给替代方案",
    code: true,
  },
  {
    num: 3,
    title: "载入代码",
    icon: "📋",
    color: "from-blue-400 to-cyan-500",
    desc: "点版本按钮（V1、V2…），完整代码会自动填入编辑器。",
    tip: "多轮对话产生多个版本，可来回切换对比",
  },
  {
    num: 4,
    title: "外部 AI（可选）",
    icon: "📋",
    color: "from-green-400 to-teal-500",
    desc: "想用 ChatGPT、Kimi 等外部 AI，就把提示词复制过去，再把代码粘贴回来。",
    tip: "编辑器里有旧代码就先清空再粘贴",
  },
  {
    num: 5,
    title: "预览效果",
    icon: "👁️",
    color: "from-pink-400 to-rose-500",
    desc: "右侧手机框实时显示效果，可以直接点击试用。",
    tip: "数据用 localStorage 保存，刷新也不会丢",
  },
  {
    num: 6,
    title: "保存快照",
    icon: "💾",
    color: "from-amber-400 to-yellow-500",
    desc: "满意就点「保存快照」，关掉页面也不丢。",
    tip: "可保存多个版本，随时切换",
  },
  {
    num: 7,
    title: "发布",
    icon: "🚀",
    color: "from-indigo-500 to-blue-500",
    desc: "点「发布」，填名称、简介、选分类，即可生成分享链接和二维码。",
    tip: "需要先登录",
  },
  {
    num: 8,
    title: "分享给朋友",
    icon: "🎉",
    color: "from-purple-400 to-pink-500",
    desc: "把链接或二维码发给朋友，用手机浏览器打开就能用。",
    tip: "微信里打开可能受限，建议引导朋友用浏览器打开",
  },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-60 h-60 bg-purple-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 py-16 lg:py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
            <WewooMark className="w-10 h-10" />
          </div>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
            <span className="text-sm">📖 新手教程</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">
            零基础也能做工具
          </h1>
          <p className="text-lg lg:text-xl text-indigo-100 mb-8">
            不需要懂编程，跟着步骤走，5 分钟做出你的第一个小工具
          </p>
          <Link
            href="/create?new=1"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold px-8 py-3 rounded-xl hover:scale-105 transition-transform shadow-lg"
          >
            去创作页面
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-3xl mx-auto px-4 py-12 lg:py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">跟着做，一共 8 步</h2>
        <p className="text-gray-500 text-center mb-12">每一步都有提示，别着急，慢慢来</p>

        <div className="space-y-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex">
                {/* Left: Number */}
                <div className={`flex-shrink-0 w-20 lg:w-24 bg-gradient-to-br ${step.color} flex flex-col items-center justify-center text-white py-6`}>
                  <span className="text-3xl lg:text-4xl font-bold">{step.num}</span>
                </div>
                {/* Right: Content */}
                <div className="flex-1 p-5 lg:p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{step.icon}</span>
                    <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm lg:text-base leading-relaxed mb-3">
                    {step.desc}
                  </p>
                  {step.tip && (
                    <div className="flex items-start gap-1.5 text-sm text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2">
                      <span className="flex-shrink-0">💡</span>
                      <span>{step.tip}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Prompt Examples for Step 2 */}
              {step.code && (
                <details className="border-t border-gray-100 bg-gray-50">
                  <summary className="flex items-center justify-between px-5 lg:px-6 py-4 cursor-pointer select-none text-sm font-medium text-gray-700 hover:bg-gray-100">
                    <span className="flex items-center gap-1.5">💡 展开示例提示词（长按可复制）</span>
                    <svg className="w-4 h-4 text-gray-500 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </summary>
                  <div className="px-5 lg:px-6 pb-5">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      下面这些话可以直接发给 AI（长按可以复制），都已按微坞的要求写好（手机适配 + localStorage 记忆），照用就能做出功能完整的工具。也可以先复制下面的「微坞通用创作要求」，再随意组合你的想法：
                    </p>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-indigo-700">📋 微坞通用创作要求（建议每条都加上）</span>
                      <button
                        className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        onClick={() => {
                          if (typeof navigator !== "undefined" && navigator.clipboard) {
                            navigator.clipboard.writeText(GUIDE_REQ_TEXT);
                          }
                        }}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        复制
                      </button>
                    </div>
                    <p className="text-xs text-indigo-700 leading-relaxed">{GUIDE_REQ_TEXT}</p>
                  </div>
                  <div className="space-y-3">
                    {aiPrompts.map((p) => (
                      <div key={p.label} className="panel p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            {p.label}
                          </span>
                          <button
                            className="text-xs text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
                            onClick={() => {
                              if (typeof navigator !== "undefined" && navigator.clipboard) {
                                navigator.clipboard.writeText(p.prompt);
                              }
                            }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            复制
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{p.prompt}</p>
                      </div>
                    ))}
                  </div>
                  </div>
                </details>
              )}

              {/* Visual illustration for step 4 */}
              {step.num === 4 && (
                <div className="border-t border-gray-100 bg-gray-900 p-5 lg:p-6">
                  <p className="text-xs text-gray-400 mb-3">编辑器长这样 👇</p>
                  <div className="bg-gray-800 rounded-lg p-3 font-mono text-xs text-gray-300">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <div className="w-2 h-2 rounded-full bg-yellow-400" />
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <span className="ml-2 text-gray-500">HTML</span>
                    </div>
                    <p className="text-green-400">&lt;!DOCTYPE html&gt;</p>
                    <p className="text-blue-400">&lt;html&gt;</p>
                    <p className="text-gray-500 pl-4">...你的代码...</p>
                    <p className="text-blue-400">&lt;/html&gt;</p>
                    <p className="text-gray-500 mt-2">← 把代码粘贴到这里</p>
                  </div>
                </div>
              )}

              {/* Visual illustration for step 5 */}
              {step.num === 5 && (
                <div className="border-t border-gray-100 bg-gray-50 p-5 lg:p-6">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <div className="bg-gray-800 rounded-2xl p-2 shadow-lg inline-block">
                        <div className="bg-white rounded-xl w-32 h-48 flex items-center justify-center">
                          <span className="text-3xl">📱</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">左边：写代码</p>
                    </div>
                    <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <div className="text-center">
                      <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-lg inline-block p-2">
                        <div className="bg-gradient-to-br from-indigo-400 to-purple-400 rounded-lg w-32 h-48 flex items-center justify-center">
                          <span className="text-3xl">✨</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">右边：看效果</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">常见问题</h2>
          <div className="space-y-4">
            <details className="panel p-5 group">
              <summary className="font-medium text-gray-800 cursor-pointer flex items-center justify-between">
                <span>我完全不会编程，真的能做吗？</span>
                <span className="text-indigo-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                能。告诉 AI 你想要什么工具，它会帮你写全部代码。
              </p>
            </details>
            <details className="panel p-5 group">
              <summary className="font-medium text-gray-800 cursor-pointer flex items-center justify-between">
                <span>用哪个 AI 比较好？</span>
                <span className="text-indigo-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                直接用微坞内置 AI 就行；也可以把提示词复制到 ChatGPT、Kimi 等外部 AI。
              </p>
            </details>
            <details className="panel p-5 group">
              <summary className="font-medium text-gray-800 cursor-pointer flex items-center justify-between">
                <span>发布需要注册账号吗？</span>
                <span className="text-indigo-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                发布要登录，邮箱注册即可；不登录也能写代码和预览。
              </p>
            </details>
            <details className="panel p-5 group">
              <summary className="font-medium text-gray-800 cursor-pointer flex items-center justify-between">
                <span>代码粘贴进去后预览是空白的？</span>
                <span className="text-indigo-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                多半是代码不完整或出错。让 AI 检查一下，或从场景模板生成一个能跑的示例。
              </p>
            </details>
            <details className="panel p-5 group">
              <summary className="font-medium text-gray-800 cursor-pointer flex items-center justify-between">
                <span>可以修改别人发布的工具吗？</span>
                <span className="text-indigo-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                可以。详情页点「改编」，代码会复制到你的编辑器，改完发布自己的版本。
              </p>
            </details>
            <details className="panel p-5 group">
              <summary className="font-medium text-gray-800 cursor-pointer flex items-center justify-between">
                <span>发布的工具别人怎么看到？</span>
                <span className="text-indigo-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                发布后出现在首页广场；把链接或二维码发给朋友，手机浏览器打开即用。
              </p>
            </details>
            <details className="panel p-5 group">
              <summary className="font-medium text-gray-800 cursor-pointer flex items-center justify-between">
                <span>工具能记住用户的数据吗？比如打卡记录、游戏进度</span>
                <span className="text-indigo-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                能。代码里用 localStorage 保存，刷新、重进都能恢复；登录后同步到云端。
              </p>
            </details>
            <details className="panel p-5 group">
              <summary className="font-medium text-gray-800 cursor-pointer flex items-center justify-between">
                <span>工具能联网获取数据吗？</span>
                <span className="text-indigo-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                能，但仅限白名单公开数据（汇率、天气、词典等），用 __wewoo.fetch 调用。
              </p>
            </details>
            <details className="panel p-5 group">
              <summary className="font-medium text-gray-800 cursor-pointer flex items-center justify-between">
                <span>工具能使用 AI 吗？</span>
                <span className="text-indigo-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                能。用 __wewoo.ai.chat 做问答、总结、分类，每天 1000 次。
              </p>
            </details>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 lg:p-10 text-white">
            <h2 className="text-2xl font-bold mb-3">准备好了吗？</h2>
            <p className="text-indigo-100 mb-6">跟着教程做，你也可以做出好用的工具！</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/create?new=1"
                className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 font-semibold px-6 py-3 rounded-xl hover:scale-105 transition-transform shadow-lg"
              >
                <span>🚀 开始创作</span>
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/30 transition-colors"
              >
                <span>🏠 先逛逛广场</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
