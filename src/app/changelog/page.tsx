import Link from "next/link";
import Navbar from "@/components/Navbar";
import versionInfo from "../../../version.json";

const CHANGELOG_ENTRIES = [
  {
    version: "1.0.1",
    date: "2026-07-27",
    sections: {
      "新增": [
        "工具状态自动保存与恢复（Supabase tool_state 表）",
        "清空使用记录功能（二次确认）",
        "首页「最近使用」快捷入口",
        "版本号 + 变更日志页面",
      ],
      "修复": [
        "iPhone Safari 白屏（blob URL origin 锁定 → srcDoc）",
        "工具详情页 iframe 无法全屏 → 重构为主体区域",
        "错误检测过于敏感 → 降低阈值 / 延长检测时间",
        "数据库 .in() 查询 400 → 分批 + 空数组守卫",
        "CSP base-uri 报错 → 移除 base 标签 + 'none'",
        "Vercel 环境变量更新为新 Supabase 项目",
      ],
      "变更": [
        "iframe 包装模板 ES6 → ES5 兼容旧手机",
        "iframe 内部新增白屏检测 + 错误降级 UI",
        "首页新增「我的收藏」区域",
        "PWA 图标生成（192/512/maskable）",
      ],
    },
  },
  {
    version: "1.0.0",
    date: "2026-07-27",
    sections: {
      "新增": [
        "用户注册与登录（Supabase Auth）",
        "工具创建/发布/编辑",
        "工具广场与分类筛选",
        "iframe 沙箱渲染",
        "收藏功能",
        "微信环境引导",
        "三级可见性（公开/未列出/私密）",
        "下载型工具",
        "个人主页常用快捷入口",
        "操作历史记录",
        "SEO + PWA + 服务条款/隐私政策",
        "浏览量统计",
      ],
    },
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Navbar
        children={
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600"
          >
            ← 返回广场
          </Link>
        }
      />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">变更日志</h1>
        <p className="text-sm text-gray-500 mb-8">
          当前版本：v{versionInfo.version} · {versionInfo.description}
        </p>

        <div className="space-y-10">
          {CHANGELOG_ENTRIES.map((entry) => (
            <section key={entry.version}>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3 mb-4">
                <span className="inline-block bg-indigo-600 text-white text-xs px-2.5 py-1 rounded-full">
                  v{entry.version}
                </span>
                <span className="text-sm font-normal text-gray-400">{entry.date}</span>
              </h2>
              {Object.entries(entry.sections).map(([section, items]) => (
                <div key={section} className="mb-5">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    {section === "新增" ? "✨" : section === "修复" ? "🔧" : "🔄"} {section}
                  </h3>
                  <ul className="space-y-1.5">
                    {items.map((item: string, i: number) => (
                      <li key={i} className="text-sm text-gray-600 pl-4 relative before:content-['·'] before:absolute before:left-0 before:text-gray-400">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ))}
        </div>

        <p className="mt-12 text-xs text-gray-400 text-center">
          详细变更记录见项目根目录 <code className="bg-gray-100 px-1 rounded">CHANGELOG.md</code>
        </p>
      </main>
    </div>
  );
}
