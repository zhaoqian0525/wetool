# 微坞 WeWoo

> AI 小工具分享社区 — 像发朋友圈一样分享你做的 AI 小工具

[![Version](https://img.shields.io/badge/version-2.9.0-indigo)](version.json)
[![Deploy](https://img.shields.io/badge/deploy-Vercel-black)](https://we-woo.net)

**微坞 (WeWoo)** 是一个 AI 生成的小工具分享平台。任何人都可以在这里创建、发布和发现实用的网页小工具 — 旅行分账、工程计算、课堂互动、生活日常，应有尽有。

🌐 生产环境：[https://we-woo.net](https://we-woo.net)

---

## 技术栈

| 分类 | 技术 |
|---|---|
| 前端框架 | Next.js 16 (App Router) + React 19 |
| UI | Tailwind CSS 4 |
| 语言 | TypeScript |
| 数据库 | Supabase (PostgreSQL + Auth) |
| 部署 | Vercel |
| 包管理 | npm |

---

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build
```

开发服务器启动后访问 [http://localhost:3000](http://localhost:3000)。

### 环境变量

需要在根目录创建 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 数据库

项目使用 Supabase PostgreSQL，执行以下脚本建表：

```bash
# 在 Supabase SQL Editor 中执行
cat supabase_view_count.sql
```

核心表：`tools`、`favorites`、`reviews`、`tool_drafts`、`tool_usage_history`、`user_pinned_tools`、`tool_state`、`tool_recent`

---

## 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx            # 首页（工具广场）
│   ├── create/             # 创建/编辑工具
│   ├── tool/[id]/          # 工具详情页
│   ├── user/[id]/          # 个人主页
│   ├── auth/               # 登录/注册 + 邮箱回调
│   ├── api/                # API 路由
│   └── terms/privacy/      # 法律页面
├── components/             # 可复用组件
│   ├── Navbar.tsx          # 导航栏
│   ├── Footer.tsx          # 页脚（显示版本号+更新时间）
│   ├── AuthProvider.tsx    # 全局认证状态
│   └── ...
├── lib/                    # 核心逻辑
│   ├── data.ts             # 数据层（Supabase CRUD）
│   ├── supabase.ts         # Supabase 客户端
│   ├── sandbox.ts          # iframe 沙箱安全包装
│   └── cover.ts            # 封面截图生成
├── hooks/                  # 自定义 Hooks
└── proxy.ts                # 开发代理
```

---

## 核心功能

- 🔧 **工具创作** — 在线代码编辑器 + 手机预览框，写完即发布
- 🏠 **工具广场** — 分类筛选（旅行/工程/生活/教育），搜索 + 排序
- ❤️ **收藏 & 最近使用** — Supabase 持久化，跨设备同步
- 👤 **个人主页** — 展示发布、收藏、常用工具
- 🔒 **三级可见性** — 公开 / 未列出 / 私密
- 📱 **PWA 支持** — 可添加到主屏幕，离线可用
- 📊 **浏览量统计** — Supabase RPC 实时计数

---

## 版本管理规则

每次代码推送必须：

1. 更新 `version.json` 中的 `version` 和 `buildTimestamp`
2. 更新 `CHANGELOG.md`（遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/) 格式）
3. 页脚自动显示版本号和更新时间
4. Git commit 信息包含清晰的变更描述

---

## 许可证

MIT © 2026 WeWoo
