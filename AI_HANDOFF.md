# WeWoo 项目移交文档 — AI 接手开发指南

> 写给下一个 AI（Codex/Claude）或新开发者。涵盖所有关键信息。

---

## 1. 项目概览

**微坞 WeWoo** — AI 小工具分享社区。用户可以创建、发布、发现 HTML 网页小工具（计算器、转换器、游戏等）。

- **域名**：https://we-woo.net
- **GitHub**：https://github.com/zhaoqian0525/wetool
- **当前版本**：v1.10.0（见 version.json）
- **文件根目录**：`D:\Workbuddy\We-woo`

---

## 2. 技术栈

| 项 | 值 |
|---|---|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript 5 |
| CSS | Tailwind CSS v4 |
| 后端 | Supabase (BaaS) |
| 部署 | Vercel (生产环境 `wetool1` 项目) |
| 构建 | Webpack（Turbopack 本地不可用，scripts 需加 `--webpack`） |
| 截图 | Puppeteer（Edge 浏览器）、html2canvas |

### 关键依赖
```json
"@supabase/supabase-js": "^2.110.8"
"html2canvas": "^1.4.1"
"next": "^16.0.0"
"puppeteer": "^25.4.0"
"tailwindcss": "^4.0.0"
```

---

## 3. 全部 API Key / 密钥

### Supabase（项目 ID: cvacrykzcppiflmvwwfe）

| Key 名称 | 值 |
|---|---|
| **URL** | `https://cvacrykzcppiflmvwwfe.supabase.co` |
| **Anon Key（公开）** | `sb_publishable_HedSPsepnDWtvd3IuQhlWw_JPeVevVu` |
| **Service Role Key（保密，仅服务端）** | `service_role_xxxx（v1.8.3 已从仓库移除，请到 Supabase Dashboard 轮换并配置环境变量）` |

**Service Role Key 用途**：DELETE API（`src/app/api/tools/[id]/route.ts`）用来绕过 RLS 删除工具。代码层已做权限验证。

### DeepSeek（内置 AI 生成，v1.8）

| Key 名称 | 值 |
|---|---|
| **API Key（服务端专用）** | `sk-xxxx（v1.8.3 已从仓库移除，请到 DeepSeek 控制台重新生成）` |
| **接口** | `https://api.deepseek.com/chat/completions`（model: `deepseek-chat`，SSE 流式） |

> 使用位置：`src/app/api/ai/generate/route.ts`（服务端 Route Handler）。`DEEPSEEK_API_KEY` 配置在 `.env.local`，**禁止**加 `NEXT_PUBLIC_` 前缀，否则会泄漏到客户端 bundle。Vercel 生产环境需在项目 Settings → Environment Variables 手动添加同名变量。
>
> **⚠️ v1.8.3 安全修复：本文件曾明文包含 DeepSeek API Key 与 Supabase Service Role Key 并随公开仓库泄漏，已移除。请立即在 DeepSeek 控制台重新生成 API Key、在 Supabase Dashboard 轮换 service_role key，并把新值更新到 `.env.local` 与 Vercel 环境变量。任何密钥严禁写入本文件或任何提交到仓库的文件。**
### GitHub

| Key 名称 | 值 |
|---|---|
| **仓库** | `zhaoqian0525/wetool` |
| **Push Token（替换为你自己的 GitHub PAT）** | `YOUR_GITHUB_PERSONAL_ACCESS_TOKEN` |

> 推送命令格式：`git push https://YOUR_TOKEN@github.com/zhaoqian0525/wetool.git main`

### Vercel

- 项目名：`wetool1`
- 环境变量需在 Vercel Dashboard 设置：
  - `NEXT_PUBLIC_SUPABASE_URL` = `https://cvacrykzcppiflmvwwfe.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_HedSPsepnDWtvd3IuQhlWw_JPeVevVu`
  - `SUPABASE_SERVICE_ROLE_KEY` = 上面的 Service Role Key
- 代码中有硬编码兜底（Vercel 环境变量偶尔不稳定），超时 3 秒自动 fallback

### Supabase Dashboard
`https://supabase.com/dashboard/project/cvacrykzcppiflmvwwfe`

---

## 4. 数据库结构

### tools 表（核心）
```sql
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  author_id TEXT NOT NULL,       -- Supabase user UUID
  code TEXT NOT NULL,             -- 完整 HTML 代码
  category TEXT DEFAULT '',
  description TEXT DEFAULT '',
  thumbnail_gradient TEXT DEFAULT 'linear-gradient(135deg, #4f46e5, #7c3aed)',
  visibility TEXT DEFAULT 'public',   -- public / unlisted / private
  is_downloadable BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  cover_url TEXT,                 -- Supabase Storage URL
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### likes 表（点赞 + 收藏双用途）
```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  target_type TEXT NOT NULL,     -- 'tool' | 'review' | 'save'
  target_id TEXT NOT NULL,       -- tool ID 或 review ID
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, target_type, target_id)
);
-- target_type 区分三种操作：
--   'tool'   → ❤️ 点赞（显示计数）
--   'save'   → ⭐ 收藏（出现在"我的工具"和个人主页）
--   'review' → 评论点赞
```

### 其他表
- `favorites`、`reviews`、`tool_drafts`、`tool_usage_history`、`user_pinned_tools`、`tool_state`、`tool_recent`
- 完整建库脚本：`supabase_view_count.sql`（幂等，可重复执行）

### Storage Bucket
- `tool-covers` — 公开读，认证用户可上传（SQL: `supabase_fix_storage.sql`）

---

## 5. RLS 策略

### tools 表
```sql
-- 所有人可读 public 工具
CREATE POLICY "tools_public_read" ON tools FOR SELECT USING (visibility = 'public');
-- 可读非 private 工具（URL 直接访问）
CREATE POLICY "tools_direct_read" ON tools FOR SELECT USING (visibility != 'private');
-- 作者可读写自己工具
CREATE POLICY "tools_author_select" ON tools FOR SELECT USING (auth.uid()::text = author_id);
CREATE POLICY "tools_user_insert" ON tools FOR INSERT WITH CHECK (auth.uid()::text = author_id);
CREATE POLICY "tools_author_update" ON tools FOR UPDATE USING (auth.uid()::text = author_id);
CREATE POLICY "tools_author_delete" ON tools FOR DELETE USING (auth.uid()::text = author_id);
```

### 关键坑点
1. Anon Key 客户端没有 `auth.uid()`，`tools_author_select` 等策略不生效
2. Service Role Key 绕过全部 RLS（用于 DELETE API 等）
3. 完整 RLS：`supabase_fix_rls.sql`

---

## 6. Auth 认证

- **流程**：PKCE + Supabase Auth
- **邮箱验证**：已关闭（`Supabase Dashboard → Authentication → Settings → Disable "Confirm email"`）
- **回调**：`/auth/callback`
- **Provider**：`src/components/AuthProvider.tsx`，提供 `useAuth()` hook
- **本地运行**：`localhost:3000`（需在 Supabase Dashboard 配置 `http://localhost:3000/auth/callback` 为允许的回调 URL）

---

## 7. 源码结构

```
src/
├── app/
│   ├── page.tsx                    # 首页（SSG 静态生成）
│   ├── layout.tsx                  # 根布局（metadata、PWA、SEO）
│   ├── manifest.ts                 # PWA Manifest
│   ├── sitemap.ts / robots.ts      # SEO
│   ├── auth/                       # 登录/注册
│   │   ├── page.tsx                # 登录表单（含限频倒计时）
│   │   └── callback/route.ts       # Auth 回调处理
│   ├── create/                     # 创作页
│   │   └── page.tsx                # 编辑器 + 发布流程 + 封面生成
│   ├── tool/[id]/                  # 工具详情页
│   │   ├── page.tsx                # 主体（iframe 预览 + 评论 + 操作栏）
│   │   └── layout.tsx              # generateMetadata（标签页标题）
│   ├── user/[id]/                  # 个人主页
│   │   └── page.tsx                # 收藏工具 + 发布工具列表
│   ├── guide/                      # 新手教程
│   ├── terms/ / privacy/           # 法律页面
│   ├── cleanup/                    # 旧数据清理页
│   └── api/tools/[id]/             # API Routes
│       ├── route.ts                # DELETE（用 service_role key）
│       ├── state/route.ts          # POST/GET 工具内表单状态
│       └── history/route.ts        # 使用记录
├── components/
│   ├── AuthProvider.tsx            # Auth Context
│   ├── Navbar.tsx                  # 桌面端导航 + 手机端用户菜单
│   ├── Footer.tsx                  # 桌面端底部（版本号来自 version.json）
│   ├── ToastProvider.tsx           # Toast 通知
│   ├── ServiceWorkerRegister.tsx   # PWA SW 注册
│   ├── ToolHistoryDrawer.tsx       # 使用记录抽屉
│   ├── ToolPageErrorBoundary.tsx   # 错误边界
│   ├── WechatGuide.tsx             # 微信/QQ 浏览器引导
│   └── OnboardingModal.tsx         # 首次引导弹窗
├── hooks/
│   ├── useBlobSrcDoc.ts            # iframe 渲染模式切换（srcDoc vs blobUrl）
│   ├── useDebounce.ts              # 防抖
│   └── useToolStorage.ts           # 工具内 localStorage API
├── lib/
│   ├── data.ts                     # 核心数据层（~3300 行！）
│   │   ├── MOCK_TOOLS (18个静态工具)
│   │   ├── Supabase CRUD
│   │   ├── 点赞/收藏/浏览量/评论/搜索
│   │   └── 所有表操作函数
│   ├── supabase.ts                 # Supabase 客户端单例
│   ├── cover.ts                    # 封面生成/上传
│   ├── sandbox.ts                  # iframe 沙箱包装
│   └── tool-template.ts           # 工具模板
├── proxy.ts                        # Next.js middleware 代理
```

---

## 8. 重要代码约定

### 数据源双轨制
- **MOCK_TOOLS**：18 个静态工具（ID 1-18），在 `src/lib/data.ts` 中定义
- **Supabase**：用户发布的工具（UUID 格式 ID）
- 所有查询都先查 Supabase，失败 → MOCK_TOOLS
- 查询超时 3 秒，超时 → fallback

### 版本管理（推送前必做）
1. 更新 `version.json`（version + buildTimestamp）
2. 更新 `CHANGELOG.md`
3. 更新 `README.md` 版本 badge

### 构建命令
```bash
# 本地开发（必须加 --webpack）
npm run dev -- --webpack

# 本地构建
npm run build -- --webpack

# TS 检查
npx tsc --noEmit

# 启动
npm start
```

### 推送命令模板
```bash
git add -A
git commit -m "..."  # 使用 emoji 前缀：fix: / feat: / tweak: / chore:
git push https://YOUR_GITHUB_TOKEN@github.com/zhaoqian0525/wetool.git main
```

---

## 9. 已知架构决策和坑

### iframe 渲染
- 标准浏览器用 `srcDoc`
- 微信/QQ 用 `blob://` URL（通过 `useBlobSrcDoc` hook）
- Sandbox: `allow-scripts allow-same-origin`

### 封面系统
- 发布时自动截图：`captureCover()` → 失败 → `generateDefaultCoverBlob()` → `uploadCoverToStorage()`
- cover.ts 中的 `getSupabase()` 是 anon key 客户端，需传已认证 client
- bucket `tool-covers` 需在 Supabase SQL Editor 执行 `supabase_fix_storage.sql` 创建
- 也可用 `scripts/screenshot-tool-html.mjs` 离线生成封面

### Service Worker
- `public/sw.js` — 只缓存静态资源，不缓存页面（防止页面不刷新的 bug）
- 注册：`src/components/ServiceWorkerRegister.tsx`

### AI 生成（DeepSeek v4）
- 模型：`deepseek-v4-flash`（环境变量 AI_MODEL 可覆盖），必须保持低价档，禁止切到 pro
- 已关闭思考模式（v1.8.5）：请求体显式 `thinking: { type: "disabled" }`；换非推理模型需移除该参数
- 长度限制（v1.8.7）：max_tokens 默认 16000、currentCode 上限 32000 字符、上下文护栏 48000 字符；长代码（3 万字）完整生成约 40-60 秒属正常
- 若 Vercel 设置了 AI_MAX_TOKENS，注意同步调整，否则覆盖默认值

### DELETE API
- `src/app/api/tools/[id]/route.ts` 使用 service_role key 绕过 RLS
- 代码层验证 `author_id === userId`

### 创作页布局（v1.8.6）
- 移动端三 tab：对话 / 代码 / 预览（state: mobileTab）
- 桌面宽屏三栏同时显示：AI Chat Panel（src/app/create/page.tsx 内联，非独立组件）+ 编辑器 + 预览
- 改编（/create?source_tool_id=X）进入时自动清空历史对话，只保留「已加载工具」消息；对话持久化 key: wewoo-ai-chat-{userId}
- 外部提示词（AI_PROMPT_TEMPLATE / aiPrompts）在对话面板底部默认折叠，state: externalPromptOpen
- 安装提示组件：src/components/InstallPrompt.tsx（beforeinstallprompt + iOS 引导）

### 工具内数据持久化
- 通过 `window.postMessage` 与 iframe 通信（`type: "WEWOO_SAVED"` 等）
- 状态保存在 `tool_state` 表

### 发布流程
- 工具插入 Supabase → 封面生成 → cover_url 更新
- 如果平台 URL 内的 "工具未找到"标签栏标题 → `layout.tsx` 的 `generateMetadata` 可能只查了 MOCK_TOOLS

### 版本发布通知（v1.8.7 起默认执行）
- **每个版本发布推送后，默认发送邮件通知用户**（用户已确认，无需再问）
- 收件人：`1015790590@qq.com`；发件人：`2425066932@qq.com`（SMTP smtp.qq.com:465，授权码见 `.workbuddy/send-v183-mail.py`）
- 写法：复制 `.workbuddy/send-vXXX-mail.py` 改标题/正文即可，正文用 HTML 表格列出改动点

### 编码陷阱：PowerShell 写中文会乱码（2026-08-09 记录）
- **根因**：Windows PowerShell 5.1 下 `@'...'@ | python -`（heredoc 管道）按系统代码页编码，中文全部变成 `?`，导致邮件正文乱码、version.json/CHANGELOG/ROADMAP/提交消息中文损坏
- **症状**：v1.9.11、v1.10.0 邮件乱码；v1.6.1 CHANGELOG 段落和 v1.10.0 提交的文档中文全变 `?`
- **正确写法**：用 `[System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))` 直接写文件（UTF-8 无 BOM），不要用 heredoc 管道传中文
- **写后必须验证**：`Get-Content $path -Encoding UTF8 -Raw` 读回，确认没有 `?`、`�`（用 `[regex]::Matches($t, '\?')` 计数）
- **邮件脚本已内置自检**：`.workbuddy/send-vXXX-mail.py` 发送前 assert 主题/发件人含「微坞」、正文无 `??`，乱码会直接报错而不是发出去

---

## 10. 当前状态

### 首页统计
- MOCK_TOOLS：18 个（科学计算器、分账助手、密码生成器等）
- Supabase 工具：6 个（卡西欧计算器 ×2、倒计时、2048、番茄时钟、情侣纪念日）
- 所有工具封面已补全

### 功能状态
| 功能 | 状态 |
|---|---|
| 注册/登录 | ✅ PKCE + 邮箱验证已关闭 |
| 发布工具 | ✅ |
| 点赞/收藏 | ✅ likes 表，区分 target_type |
| 评论/评分 | ⚠️ 表创建了但 UI 待完善 |
| 个人主页 | ✅ 收藏 + 发布的工具 |
| 全屏模式 | ✅ |
| 搜索 | ✅ 客户端过滤 |
| 推荐/分类 | ✅ |
| PWA | ✅ |
| SEO | ✅ |
| 浏览量 | ✅ Supabase RPC increment_view_count |
| 下载型工具 | ✅ is_downloadable |
| 工具内数据保存 | ✅ postMessage + tool_state 表 |

### 待开发（ROADMAP.md）
- P1: 评论系统完整 UI、用户头像/简介、全文搜索、标签筛选
- P2: 热门榜单、管理后台、消息通知
- P3: OAuth 登录、暗色模式、数据面板
