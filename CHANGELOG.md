# Changelog

本文档记录微坞 WeWoo 项目的所有重要变更。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

---

## [Unreleased]

### Added
- 暂无

### Fixed
- 暂无

### Changed
- 暂无

---

## [1.2.1] - 2026-07-29

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
