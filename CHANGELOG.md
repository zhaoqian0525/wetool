# Changelog

本文档记录微坞 WeWoo 项目的所有重要变更。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

---

## [Unreleased]

### Fixed
- 移动端创作页预览白屏 → 预览 iframe 与工具详情页一致：普通浏览器用 srcDoc，仅微信/QQ 用 blob URL
- 创作页全屏预览白屏 → 同步修复
- 移动端创作界面优化：新增「编辑 / 预览」标签切换，编辑与预览不再上下挤压各占半屏
- 手机通过局域网 IP 访问 dev server 时页面交互全部失效（Next.js 拦截跨源 dev 资源导致 React 未水合）→ next.config.ts 增加 allowedDevOrigins
- 移动端点「预览」直接进入全屏，去掉「先内嵌预览再点全屏」两步操作
- 全屏预览顶部栏改为常显，修复 3 秒自动隐藏导致退不出全屏的问题
- 手机打开工具后返回需划两次才回主页 → iframe 的 srcdoc 内容变化会在父页面新增历史条目，预览 iframe 改为按内容源 key 重挂载（工具页 + 创作页）

---

## [1.4.1] - 2026-07-31

### Added
- 封面截图脚本 `scripts/screenshot-tool-html.mjs`（直接渲染 HTML，无需网站部署）

### Fixed
- SW 缓存导致页面不刷新 → 改为页面不缓存、静态资源缓存
- 封面系统全线挂掉 → 修复 uploadCover、创建 storage bucket、已补所有工具封面
- 工具页需两次返回 → 修复 useBlobSrcDoc 先清空再赋值
- Supabase 工具标签页标题显示"工具未找到" → generateMetadata 加 Supabase 查询
- 工具删除不生效 → 改用 service_role key
- 创作页默认代码 → 改为空白编辑器

### Changed
- 收藏功能简化：点赞和收藏分离，收藏 → 首页"我的工具"+ 个人主页
- 工具页操作栏重设计：紧凑图标按钮，全屏按钮移至顶部
- 主页"我的工具"改为横向滚动小卡片
- 广场卡片标签对比度增强
- 个人主页移除旧"我的常用"section

---

## [1.4.0] - 2026-07-30

### Added
- ❤️ 点赞功能：支持工具和评论点赞，Supabase likes 表，跨设备同步
- ⭐ 收藏功能：独立于点赞，收藏的工具出现在首页"我的工具"和个人主页
- 手机端顶部导航栏：显示用户头像、用户名、退出登录按钮
- /cleanup 页面：清理旧 localStorage 残留数据
- `supabase_fix_rls.sql`：完整的 RLS 策略修复脚本

### Fixed
- 工具发布 `source_tool_id` 列缺失
- tools/favorites/reviews 表 RLS 阻止写入
- 工具详情页重复常用按钮
- 收藏/点赞的工具查不到 MOCK_TOOLS 中的数据
- history API 改为 Supabase 实现（原为 localStorage 存根）
- 常用工具从 localStorage 迁移到 Supabase user_pinned_tools

### Changed
- 移除旧收藏功能（favorites 表），统一用点赞+收藏双功能
- getPinnedTools/togglePinnedTool/isPinned 改为 async Supabase 实现

---

## [1.3.0] - 2026-07-29

### Fixed
- 分类图标显示问号（GBK转换破坏 emoji，改用 Unicode 转义）
- 工具仅剩 4 个（MOCK_TOOLS 从 4 个恢复为 8 个）
- 收藏提示"已取消收藏"（toggleFavorite 改为抛出异常 + 前端 catch 显示错误）
- 番茄钟标题 emoji 损坏

### Added
- Supabase 播种脚本 `scripts/seed-tools.mjs`（需 service_role key 绕过 RLS）
- 新增工具：BMI 计算器、单词卡片、倒计时器、八杯水提醒

---

## [1.2.0] - 2026-07-29

### Changed
- **核心数据层重构**：所有 CRUD 操作统一迁移到 Supabase
- 移除 localStorage 三层数据源合并逻辑（wewoo-published-tools / wewoo-favorites / wewoo-mock-*）
- 移除 Mock 数据存储层（getMockFavorites、getMockReviews、getMockViewCounts 等 8 个函数）
- MOCK_TOOLS 从 18 个精简为 4 个，仅 Supabase 完全不可用时兜底
- fetchTools 改为仅查询 `visibility = 'public'` 的工具
- 移除全部 `local-` 前缀的本地工具路由

### Fixed
- **跨设备数据不同步**：工具发布、收藏、评论不再依赖 localStorage，切换设备数据一致
- **收藏/发布偶发丢失**：移除 localStorage 不可靠存储，全量走 Supabase
- 个人主页工具列表空数据崩溃问题
- 删除工具改为调用 Supabase 级联删除 API

### Added
- Footer 显示版本号 + 更新时间（version.json buildTimestamp）

---

## [1.1.0] - 2026-07-29

### Added
- 用户注册与登录（Supabase Auth，PKCE 流程，邮箱验证）
- 工具创建、发布、编辑（代码编辑器 + 手机预览框）
- 工具广场与分类筛选（全部/旅行/工程计算/生活/教育）
- 工具详情页与 iframe 沙箱渲染（Blob URL + srcdoc 双模式）
- 收藏功能（Supabase favorites 表 + localStorage fallback）
- 微信环境引导提示（WechatGuide 组件 + 复制链接）
- 代码自动包装（viewport/CSP/reset CSS/安全 shim 注入）
- 三级可见性发布（公开/未列出/私密）
- 下载型工具支持（is_downloadable 标记 + HTML 打包下载）
- 个人主页"我的常用"快捷入口（user_pinned_tools 表）
- 工具使用状态自动保存与恢复（草稿/历史 local + Supabase）
- 操作历史记录查看与清空
- 首页"最近使用"快捷入口 + "我的收藏"区域
- 搜索引擎优化（sitemap/robots/OG/Twitter Card/JSON-LD）
- PWA 支持（manifest/sw.js/ServiceWorker + 图标）
- 服务条款（/terms）与隐私政策（/privacy）页面
- 浏览量统计（view_count 字段 + increment_view_count RPC）

### Fixed
- 发布后工具广场不可见（合并本地工具 + 发布后自动跳转详情页）
- iPhone Safari 白屏（blob URL origin 锁定改 srcdoc 优先）
- 数据库 `.in()` 查询 400 错误（空数组守卫 + chunkArray 分批）
- 工具详情页 PC 端布局（手机框改为大尺寸自适应 iframe）
- 全屏模式失效（fixed 定位被 WechatGuide Fragment 吞掉）
- SQL 迁移幂等性（ADD COLUMN IF NOT EXISTS + CASCADE）
- RPC increment_view_count 非 UUID ID 导致 400
- CSP base-uri 报错（移除 base 标签 + 改为 'none'）
- 草稿自动保存与按钮点击记录

### Changed
- iframe 代码包装模板全面降级为 ES5（var + function，兼容旧手机 WebView）
- iframe 内部新增 5 秒白屏检测 + onerror 捕获 + 错误降级 UI
- 广场卡片不再嵌入实时 iframe 预览，改为静态封面
- Supabase 项目迁移至新实例 + Vercel 环境变量同步更新
- 首页 SSG 静态生成，提升首屏加载速度
