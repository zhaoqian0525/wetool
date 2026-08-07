## [1.6.3] - 2026-08-07

### Added
- 「微坞通用创作要求」提示词卡片：把移动端适配、localStorage 记忆、完全自包含等要求浓缩成一段可复制文本，引导页建议用户每次附上，AI 生成的工具更容易一次做对
- 创作页 AI 提示助手新增 6 个场景示例提示词（BMI 计算器 / 倒计时器 / 随机点名器 / 颜色选择器 / 喝水打卡 / 记账本），点一下即复制，照着改就能生成功能完整的工具
- 默认 AI 提示词升级为 7 条结构化要求（含界面操作提示、代码精简可靠、\`\`\`html 代码块输出）

### Changed
- 引导页示例提示词全部重写：6 个示例内置「移动端适配 + localStorage 记忆 + 完全自包含」要求，替换为更完整、可直接用的场景
- 「试试示例」模板从「记忆计数器」升级为完整的「喝水打卡」工具：今日杯数、目标进度条、连续打卡天数、跨天自动归零，全程 localStorage 记忆
- 示例提示词与通用要求抽到共享常量（src/lib/aiPrompts.ts），引导页/创作页保持同步，不再两处重复维护

### Fixed
- 修复引导页示例提示词数组结尾的语法错误（];];），修复后引导页可正常编译
- 创作页预览接入记忆快照：预览/全屏/刷新后工具用 localStorage 保存的数据能恢复（游客本地墓碑，登录用户按账号隔离），与工具详情页行为一致

---

## [1.6.2] - 2026-08-07

### Changed
- 默认 AI 提示词适配记忆功能：明确允许并推荐用 localStorage 保存用户数据（打卡记录、游戏进度、表单内容），并说明微坞会自动持久化——刷新页面、切换全屏、下次进入都能恢复；移除了「不使用 localStorage」的过时约束
- 「试试示例」模板改为「记忆计数器」小工具：直观演示 localStorage 保存/恢复效果（点 +1，刷新页面数字仍在）
- 新手教程（/guide）同步更新：新增「喝水打卡（带记忆）」示例提示词、随机点名器提示词加入「记住名单」、补充「工具能记住用户的数据吗？」FAQ、预览步骤提示记忆功能
- 新手引导弹窗第 4 步补充说明：工具会自动记住用户的数据，刷新页面也不丢
- 发布时代码扫描分级优化：localStorage / sessionStorage 从「黄色安全警告」降级为「信息提示」，发布时显示蓝色「🧠 记忆功能已启用」说明；fetch / eval / 弹窗等真实风险仍保留警告

### Fixed
- 修复创作页发布时把 localStorage 误报为「可能不安全的 API 调用」、与记忆功能宣传矛盾的问题

---

## [1.6.1] - 2026-08-07

### Fixed
- ??????????????????????????????????????? iframe?CSS ??????????????? iframe??? ? ????????? / ????????
- ?????? `fixed` ? `relative` ????????? iframe ????? 0????????
- ??????????? / ??????iframe ??? `opacity:0` ???iOS Safari ??? iframe ??????????????????????????? iframe ??????
- ?????????? localStorage????? / ???????? 2048 ?????????????????????? / ????????????????? localStorage ?? + ???????

### Changed
- ????????????2048 ??????? / ???????????????????????????????????????

---

# Changelog

本文档记录微坞 WeWoo 项目的所有重要变更。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

---

## [1.6.0] - 2026-08-06

### Added — 记忆机制（状态冻结 / 墓碑）
- 工具内 localStorage 数据自动持久化：工具写入 localStorage 后防抖（800ms）同步，刷新页面、切换全屏、换设备/换浏览器都能恢复到上次使用的状态（纪念日记录器这类工具不再每次清空）
- 游客（未登录）状态保存在本机「墓碑」，刷新可恢复；登录后首次使用自动把游客数据合并上云，不丢失
- 登录用户状态同步到 Supabase（tool_state），跨设备一致；云端写入合并 _draft 与 _ls，两种数据互不覆盖
- 全屏模式与内嵌共用同一条状态流，快照在工具脚本执行前同步注入 srcdoc，进入全屏即恢复
- 使用记录抽屉升级：时间线样式展示、支持按动作/内容搜索、每条记录可一键「恢复到当时状态」（重新注入表单数据）、空态引导文案

### Fixed
- 修复登录用户每次打开工具会把云端状态覆盖成仅「最近使用」标记的问题（改为合并写入），这是记忆数据能跨会话保存的前提
- 修复工具 iframe 启动时序：此前状态注入晚于用户脚本执行，刷新后 localStorage 读到空值；现改为 srcdoc 同步预置快照 + postMessage 兜底注入

---

## [1.5.1] - 2026-08-06

### Fixed
- 移动端搜索体验：搜索时隐藏「最近使用 / 我的工具 / 登录引导 / 新手横幅」区块，让搜索结果紧跟搜索框下方，避免结果被挤到页面底部；清空搜索后恢复原布局

---

## [1.5.0] - 2026-08-06

### Security
- 修复状态/使用历史/最近使用 API 的越权漏洞（IDOR）：改为读取 Authorization Bearer token 识别用户身份，不再信任客户端传入的 userId，未授权请求返回 401
- 工具删除 API 同样改为 token 鉴权 + 服务端所有权校验，避免他人用伪造 userId 删除工具

### Fixed
- 使用历史此前因表列名不匹配（detail → input_data）从未写入成功，现已修复
- 使用记录抽屉改为「云端 + 本地」合并展示，跨设备可见；删除/清空同步云端与本地
- 他人主页不再误显示当前登录用户的头像/邮箱首字母，改为显示该用户作者名，不再显示 UUID
- 全屏 iframe 状态注入改为回复消息来源（e.source），修复全屏后状态丢失/注入到错误 iframe 的问题
- 首页工具列表不再全量拉取每个工具的完整 HTML 代码，仅拉取卡片所需字段，网络体积大幅下降

### Changed
- 新增服务端鉴权 helper（src/lib/api-auth.ts）与前端带 token 的 fetch（src/lib/api-client.ts）
- 未登录用户的状态保存保留 localStorage 本地缓存，不再向数据库写入空 userId 的脏数据
- 清理 [Unreleased] 中与 [1.4.2] 重复的条目

---

## [1.4.2] - 2026-08-06

### Added
- 新增「小游戏」分类，已有斗地主、消消乐、Flappy bird、俄罗斯方块、2048 等小游戏归入该分类

### Fixed
- 主页工具加载异常 → fetchTools 超时从 3s 放宽到 6s 并重试一次，Supabase 慢/不可用时用本地缓存兜底，避免用户发布的工具从主页消失
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
