"use client";

import Link from "next/link";

const steps = [
  {
    num: 1,
    title: "找到你想要的工具",
    icon: "💡",
    color: "from-amber-400 to-orange-500",
    desc: "先想好你要做什么工具。比如：一个倒计时器、一个颜色转换器、一个BMI计算器……什么都可以！",
    tip: "想不出来？可以看看首页别人做的工具找灵感",
  },
  {
    num: 2,
    title: "让 AI 帮你写代码",
    icon: "🤖",
    color: "from-indigo-400 to-purple-500",
    desc: "打开任意 AI 对话工具（比如 ChatGPT、Kimi、豆包、文心一言），告诉它你想要什么，让它帮你写一个 HTML 小工具。",
    tip: "不知道怎么问 AI？看下面的示例提示词",
    code: true,
  },
  {
    num: 3,
    title: "复制代码",
    icon: "📋",
    color: "from-blue-400 to-cyan-500",
    desc: "AI 会给你一段代码。把这段代码全部选中，复制下来（Ctrl+C 或长按复制）。",
    tip: "代码通常以 <!DOCTYPE html> 开头，到 </html> 结尾",
  },
  {
    num: 4,
    title: "粘贴到微坞编辑器",
    icon: "📝",
    color: "from-green-400 to-teal-500",
    desc: "回到微坞的创作页面，把代码粘贴到左边黑色的编辑器里（Ctrl+V 或长按粘贴）。右边会立刻显示效果！",
    tip: "如果编辑器里已经有代码，先全选删除再粘贴",
  },
  {
    num: 5,
    title: "预览效果",
    icon: "👁️",
    color: "from-pink-400 to-rose-500",
    desc: "右边的手机框里会实时显示你的工具效果。你可以试试点击、输入，看看好不好用。",
    tip: "手机上点「全屏预览」可以看到完整效果；工具用 localStorage 保存的数据，刷新页面也会保留",
  },
  {
    num: 6,
    title: "保存快照",
    icon: "💾",
    color: "from-amber-400 to-yellow-500",
    desc: "满意了就点「保存快照」按钮（或者按 Ctrl+S），这样即使关掉页面也不会丢失。",
    tip: "可以保存多个版本，随时切换回去",
  },
  {
    num: 7,
    title: "发布并分享",
    icon: "🚀",
    color: "from-indigo-500 to-blue-500",
    desc: "点「发布」按钮，填写工具名称和简介，选择分类，点确认。发布后会自动生成分享链接和二维码！",
    tip: "需要先登录才能发布哦",
  },
  {
    num: 8,
    title: "分享给朋友",
    icon: "🎉",
    color: "from-purple-400 to-pink-500",
    desc: "发布成功后，可以复制链接发给朋友，或者让他们扫二维码。所有人都能在手机上直接打开使用！",
    tip: "链接在微信、QQ 里也能直接打开",
  },
];

const aiPrompts = [
  {
    label: "BMI 计算器",
    prompt: "帮我写一个 BMI 计算器，输入身高和体重，点击按钮就能算出 BMI 值并显示是否正常。要好看一点，用渐变背景，圆角卡片。全部代码放在一个 HTML 文件里。",
  },
  {
    label: "倒计时器",
    prompt: "帮我写一个倒计时器，可以设置倒计时的时间和提示文字。开始后显示剩余时间，到时间了会有动画提醒。用漂亮的颜色，适配手机屏幕。全部代码放在一个 HTML 文件里。",
  },
  {
    label: "随机点名器",
    prompt: "帮我写一个随机点名器，可以输入一串名字（用逗号分隔），点开始按钮后名字快速滚动，再点一下就随机停在一个名字上。要有动画效果。把名单用 localStorage 保存，下次打开还在。全部代码放在一个 HTML 文件里。",
  },
  {
    label: "颜色选择器",
    prompt: "帮我写一个颜色选择器，点击可以选颜色，显示颜色的 HEX 值和 RGB 值，还可以复制。界面要简洁好看。全部代码放在一个 HTML 文件里。",
  },
  {
    label: "喝水打卡（带记忆）",
    prompt: "帮我写一个喝水打卡记录器，每喝一杯水点一下按钮，显示今天喝了多少杯和连续打卡天数。用 localStorage 保存数据，刷新页面不丢失。界面可爱一点，适配手机。全部代码放在一个 HTML 文件里。",
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
            href="/create"
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
                <div className="border-t border-gray-100 bg-gray-50 p-5 lg:p-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    下面这些话可以直接发给 AI（长按可以复制）。想让工具记住用户的数据（打卡、进度、账目），在需求里加上「数据用 localStorage 保存，刷新不丢失」即可：
                  </p>
                  <div className="space-y-3">
                    {aiPrompts.map((p) => (
                      <div key={p.label} className="bg-white rounded-xl border border-gray-200 p-4">
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
            <details className="bg-white rounded-xl border border-gray-200 p-5 group">
              <summary className="font-medium text-gray-800 cursor-pointer flex items-center justify-between">
                <span>我完全不会编程，真的能做吗？</span>
                <span className="text-indigo-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                当然可以！你只需要告诉 AI 你想要什么工具，AI 会帮你写出全部代码。你只要把代码复制粘贴到微坞就行了。就像让厨师做菜，你只需要点菜，不用自己炒。
              </p>
            </details>
            <details className="bg-white rounded-xl border border-gray-200 p-5 group">
              <summary className="font-medium text-gray-800 cursor-pointer flex items-center justify-between">
                <span>用哪个 AI 比较好？</span>
                <span className="text-indigo-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                推荐用 ChatGPT、Kimi、豆包、文心一言、通义千问等任意一个都可以。免费版就够用了。关键是把你的需求说清楚，比如"帮我做一个 XXX，要好看，适配手机"。
              </p>
            </details>
            <details className="bg-white rounded-xl border border-gray-200 p-5 group">
              <summary className="font-medium text-gray-800 cursor-pointer flex items-center justify-between">
                <span>发布需要注册账号吗？</span>
                <span className="text-indigo-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                是的，发布工具需要先登录。注册很简单，用邮箱就行。不登录也可以在编辑器里写代码和预览，只是不能发布到广场分享给别人。
              </p>
            </details>
            <details className="bg-white rounded-xl border border-gray-200 p-5 group">
              <summary className="font-medium text-gray-800 cursor-pointer flex items-center justify-between">
                <span>代码粘贴进去后预览是空白的？</span>
                <span className="text-indigo-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                可能是代码不完整或者有错误。可以回到 AI 那里，让它检查一下代码。也可以先试试点「试试示例」按钮，加载一个能用的示例代码看看效果，确保编辑器正常工作。
              </p>
            </details>
            <details className="bg-white rounded-xl border border-gray-200 p-5 group">
              <summary className="font-medium text-gray-800 cursor-pointer flex items-center justify-between">
                <span>可以修改别人发布的工具吗？</span>
                <span className="text-indigo-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                可以！在任意工具详情页点「改编」按钮，就会把别人的代码复制到你的编辑器里，你可以随便修改后发布自己的版本。这是微坞的特色功能 —— 大家互相学习、互相改进。
              </p>
            </details>
            <details className="bg-white rounded-xl border border-gray-200 p-5 group">
              <summary className="font-medium text-gray-800 cursor-pointer flex items-center justify-between">
                <span>发布的工具别人怎么看到？</span>
                <span className="text-indigo-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                发布后工具会出现在首页广场，所有人都能看到。你也可以把生成的链接或二维码分享给朋友，他们在手机上直接打开就能用，不需要安装任何东西。
              </p>
            </details>
            <details className="bg-white rounded-xl border border-gray-200 p-5 group">
              <summary className="font-medium text-gray-800 cursor-pointer flex items-center justify-between">
                <span>工具能记住用户的数据吗？比如打卡记录、游戏进度</span>
                <span className="text-indigo-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                可以！微坞有「记忆功能」：只要工具代码里用 localStorage 保存数据，刷新页面、切换全屏、回到主页再进来，数据都能自动恢复。做工具时告诉 AI「数据用 localStorage 保存」就行。未登录用户的数据保存在本机；登录后还会同步到云端，换设备也不丢。
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
                href="/create"
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
