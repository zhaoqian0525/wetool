## [1.8.8] - 2026-08-08

### Added（工具添加到主屏幕 + 登录保持）
- 每个工具页注入独立 PWA manifest（`/tool/[id]/manifest.webmanifest`）：封面作应用图标，`start_url` 带 `?app=1`，主屏幕打开即全屏使用该工具
- 工具详情页新增「添加到主屏幕」按钮：Android/桌面 Chrome 弹系统安装框，iPhone Safari 显示「分享 → 添加到主屏幕」引导
- 从主屏幕打开工具自动进入全屏，右上角按钮变为「🏠 返回广场」
- 登录跳回：工具页登录入口带 `redirect` 参数，登录成功自动回到原工具；`/auth/callback` 同步透传 redirect，邮箱验证完成同样回到原工具

### Note
- PWA 与网站同源（scope "/"），登录态保存在 localStorage，主屏幕打开自动恢复登录，无需重新登录
- 工具页操作栏的安装按钮在已安装（standalone）或浏览器不支持时自动隐藏

## [1.8.7] - 2026-08-08

### Changed（创作体验优化）
- 移动端「预览」tab 点击直接进入全屏预览（不再切到内嵌预览页），退出全屏回到代码 tab
- AI 输出上限放松：max_tokens 默认 6000 → 16000（环境变量 AI_MAX_TOKENS 可覆盖），3 万字长工具不再被截断
- AI 输入上下文放松：currentCode 上限 24000 → 32000 字符，上下文总字符护栏 36000 → 48000，改编长工具时代码不再被裁剪

### Note
- 长代码（3 万字）完整生成约需 40-60 秒，这是模型输出速率的物理限制；此前"较快"是因为 6000 token 截断提前停止（代码残缺）
- 若 Vercel 环境变量里设置了 AI_MAX_TOKENS=6000，请删除或改为 16000，否则会覆盖代码默认值

## [1.8.6] - 2026-08-08

### Changed（创作体验重构）
- 创作页移动端改为「对话 / 代码 / 预览」三 tab 切换；桌面宽屏三栏同时显示（AI 对话独立成左栏）
- 改编工具进入时自动开启全新对话（清掉历史对话，只保留「已加载工具」消息），不再混入上一个工具的对话；对话区新增「新建对话」按钮
- 「想用外部 AI」提示词与示例默认折叠，点击展开，降低创作页信息密度
- 新增安装到主屏幕提示（InstallPrompt）：桌面浏览器显示「安装微坞」按钮（beforeinstallprompt），iPhone Safari 显示「添加到主屏幕」引导，关闭后不再打扰

### Fixed
- AI 生成完成自动切换到「代码」tab（移动端），生成后直接看到已填入的代码

## [1.8.5] - 2026-08-08

### Fixed（紧急）
- 修复 AI 生成无内容：deepseek-v4-flash 默认开启思考模式（reasoning_content），思考 token 会耗尽 max_tokens（6000），导致正文 content 为空、前端报「AI 没有返回内容，请重试」
- 请求体对 v4 系模型显式发送 `thinking: { type: "disabled" }` 关闭思考，正文直接输出完整 HTML，不再被截断
- 附带收益：单次生成 completion token 从 6000+（全烧在思考上）降至约 2300，速度更快、更省钱

## [1.8.4] - 2026-08-08

### Changed
- AI 生成模型显式钉为 `deepseek-v4-flash`（低价档），可用环境变量 `AI_MODEL` 覆盖；禁止在生产切到 pro，避免误用高价模型
- `[ai-usage]` 用量日志新增 model 字段，每次生成可核对实际使用的模型
## [1.8.3] - 2026-08-08

### Security（紧急）
- 移除随公开仓库泄漏的密钥：AI_HANDOFF.md 曾明文包含 DeepSeek API Key 与 Supabase Service Role Key，现已全部移除并改为占位符 + 轮换指引
- `src/app/api/tools/[id]/route.ts`、`history/route.ts` 删除硬编码的 service_role key 兜底，改为必须从 `SUPABASE_SERVICE_ROLE_KEY` 环境变量读取，缺失时明确报错
- 请立即轮换密钥：DeepSeek 控制台重新生成 API Key、Supabase Dashboard 轮换 service_role key，并同步更新 `.env.local` 与 Vercel 环境变量（`DEEPSEEK_API_KEY` / `SUPABASE_SERVICE_ROLE_KEY`）

### Changed（AI 成本控制，防止烧钱）
- 请求上下文压缩：多轮对话不再重发历史里的完整 HTML，只保留最近 8 条用户需求（每条 ≤1000 字符）+ 当前代码（≤24000 字符），单次请求输入 token 大幅下降
- 输出 token 上限可配置（`AI_MAX_TOKENS`，默认 6000）
- 每 IP 速率限制（默认 8 次/分钟、120 次/天，可用 `AI_RATE_MIN` / `AI_RATE_DAY` 调整），超限返回 429
- 余额保护：生成前查询 DeepSeek 余额（5 分钟缓存），低于 ¥1 拒绝生成
- 用量记账：每次生成把 prompt/completion token 数写入服务端日志（`[ai-usage]`），可在 Vercel Logs 查看实际消耗
## [1.8.2] - 2026-08-08

### Fixed
- 修复对话生成结果载入编辑器时混入 AI 回复文字：`extractHtmlFromAiOutput` 改为优先取 ```html/``` 代码块；无代码块时只截取 `<!DOCTYPE`/`<html>` 到 `</html>` 的文档部分，前后的说明文字不再进入代码

### Changed
- 生成完成后代码自动填入编辑器（无需再点版本按钮），点「预览」即可直接看效果；版本按钮仍可随时切换历史版本
- 版本按钮显示需求摘要（如「V1·喝水打卡」「V2·改成红色主题」），方便区分对比
- 对话空态新增快捷场景按钮：纪念日记录器 / 喝水打卡 / 倒计时器 / 记账本 / 随机点名 / BMI 计算器，点一下直接开始生成

## [1.8.1] - 2026-08-08

### Added
- 创作页升级为「和 AI 对话生成工具」（对话优先）：
  - 无历史对话时自动展开，输入需求点「发送」即可，AI 边聊边生成代码版本（V1、V2…）
  - 多轮对话持续修改：「换个配色」「加个历史记录」「再生成一个更简约的版本」都能接着改
  - 版本按钮切换：点 V1/V2… 即载入该版本完整代码到编辑器，回到熟悉的代码编辑模式直接查看/修改
  - 「＋ 换个版本」一键生成不同风格/布局的替代版本；对话与版本列表本地保存，刷新不丢
- 工具详情「改编」升级为对话改编：加载工具代码后自动展开对话，提示「直接告诉我你想怎么改」
- 权限安抚反馈：用户提出网络/服务器/登录/支付等沙盒外需求时，AI 先温和说明原因，再给出可运行的替代方案（如 localStorage 模拟），不直接拒之门外

### Changed
- `/api/ai/generate` 支持多轮对话消息 + 当前代码上下文（改编时基于已有代码修改）
- 系统提示词新增对话/多版本/权限边界规则；敏感词过滤保持需求与结果双重校验
- 引导页教程第 2-4 步更新为「和 AI 对话生成 → 载入完整代码 → 外部 AI 可选」
## [1.8.0] - 2026-08-08

### Added
- 内置 AI 生成（DeepSeek，创作页免复制粘贴）：
  - 创作页「直接用 AI 生成」面板：输入需求 → 点「开始生成」→ 流式显示代码 → 「填入编辑器」一键进入编辑器；支持「停止生成 / 重新生成 / 复制代码」
  - 服务端流式 API `/api/ai/generate`（SSE 透传 `deepseek-chat`，`DEEPSEEK_API_KEY` 仅存服务端环境变量，绝不进客户端 bundle）
  - 系统提示词强制沙盒合规白名单：移动端 375px、按钮 ≥44px、完全自包含无网络请求、localStorage 记忆、只输出 ```html 代码块
  - 敏感内容过滤（赌博/色情/诈骗/恶意程序/破解外挂）：需求与生成结果双重校验，违规直接拦截并提示原因
  - 引导页教程同步：第 2 步改为「直接用 AI 生成」，第 4 步补充「填入编辑器」自动填入说明

### Changed
- `.env.local.example` 新增 `DEEPSEEK_API_KEY` 示例；`AI_HANDOFF.md` 记录 DeepSeek Key 与使用规范（Vercel 生产环境需手动配置同名环境变量）

## [1.7.2] - 2026-08-08

### Added
- 品牌资产落地（ROADMAP 11.1，A 阶段）：
  - 新增 `src/components/WewooLogo.tsx`：渐变版 `WewooMark` + 单色版 `WewooMonoMark`，几何来自品牌规范（靛蓝→紫渐变 #5046E5→#8B5CF6 + 白色 W + 节点青圆点 #22D3EE）
  - 导航栏（桌面/移动）、页脚、登录页接入品牌 Logo
  - favicon 替换为品牌图标（app/icon.png 64px）、新增 apple-icon.png（180px）、PWA 图标 icon-192/512 与 maskable 版全部换成品牌标志
  - 新增 OG 分享图 `public/og.png`（1200×630：墨黑底 + 品牌标志 + 标语），首页与工具详情页 openGraph / twitter 元数据接入
  - 引导页 Hero 与首页空状态加入品牌标志点缀

### Changed
- 移除默认 favicon.ico（由 app/icon.png 自动提供）

---
## [1.7.1] - 2026-08-08

### Fixed
- 首页「最近使用」加载慢：登录后最近使用区块比其他区块晚 1-2 秒才出现，现改为缓存优先——先同步显示上次数据（`wewoo-recent-<userId>` 本地缓存）再后台刷新替换，与其他区块同时出现
- 首页浏览量查询 400：`fetchViewCounts` 把内置工具 id（"1".."18"）与 UUID 混在一起查询 Supabase，触发 PostgREST 400，导致数据库工具的真实浏览量无法显示；现仅对 UUID 工具查库、内置/本地工具走 mock 兜底，首页浏览量恢复正常

### Changed
- ROADMAP.md 新增「十、上架合规准备」章节：拆分为「早期就要布局（P0，随 v1.8~v2 推进）」与「上架前再做（P2，留计划）」，覆盖 App Store / 国内安卓 / Google Play 审核要求

---
## [1.7.0] - 2026-08-08

### Added
- 首页缓存优先（体验与性能优化）：
  - `wewoo-tools-cache` 缓存带时间戳（TTL 60 秒）与结构版本号，首页先同步渲染上次数据再后台刷新替换，弱网 / 慢 Supabase 时首屏秒开
  - 首页工具列表与浏览量并行请求互不阻塞，列表刷新后自动补充新工具浏览量
- 服务端搜索：新增 `/api/tools/search`（Supabase ilike 匹配 title / description / author，仅公开工具，最多 50 条），首页搜索输入防抖 300ms，服务端结果与本地内置工具合并去重
- 发布封面自定义：发布弹窗新增「封面」选择（自动截图 / 上传图片 ≤5MB / 渐变+表情），默认自动截图可跳过，不改变原有发布流程
- 作者可更换封面：工具详情页作者操作区新增「🖼️ 换封面」，发布后可随时重新截图、上传图片或换渐变封面

### Changed
- 移除创作页「停留 30 秒自动展开 AI 提示词」的打扰式弹层
- 浏览量改为会话内去重（同一浏览器会话只计一次），防止反复进出刷量
- emoji 映射收敛到 `src/lib/constants.ts`（首页 / 工具页 / 用户页共用 `getToolEmoji` 与 `CATEGORY_EMOJI`）
- `src/lib/data.ts` 拆分：内置工具数据与类型移入 `src/lib/mock-tools.ts`，业务 API 保留并 re-export，对外导入完全兼容

### Fixed
- 首页搜索时「最近使用 / 我的工具」等区块隐藏，搜索结果紧跟搜索框下方（此前被区块挤到页面下方，手机端不便）

---
## [1.6.6] - 2026-08-08

### Fixed
- 修复工具详情页全屏模式上下滑动后，退出全屏会影响预览模式界面：
  - 全屏时锁定页面滚动，滑动不再穿透到预览页背景（此前退出全屏后页面停留在别处）
  - 进入全屏前记录工具内滚动位置，退出后恢复，预览界面保持原样（此前全屏内滚动位置残留到预览，显示被"滑动"过）
- 工具沙盒（`src/lib/sandbox.ts`）新增滚动位置读取/恢复消息（`WEWOO_GET_SCROLL` / `WEWOO_SET_SCROLL`），跨域 iframe 下也可安全控制滚动

---
## [1.6.5] - 2026-08-08

### Fixed
- 修复内置工具（1-18）登录状态下退出后无法恢复上次状态：云端 `tool_state` / `tool_usage_history` / `tool_recent` 的 `tool_id` 为 UUID 类型，内置工具字符串 id 写入报 `invalid input syntax for type uuid`，导致记忆、使用记录、首页「最近使用」全部失效；现为 18 个内置工具建立稳定 UUID 映射（`src/lib/builtinIds.ts`），状态保存/恢复、使用记录、最近使用全部打通
- 修复工具详情页本地墓碑 key 不一致：登录用户的 localStorage 快照按账号隔离（`wewoo-ls-<id>-<userId>`），读取时未带账号后缀导致本地缓存也读不到，现读写一致
- 首页「最近使用」支持内置工具：内置工具状态写入 `tool_state` 后，`/api/user/recent-tools` 从 `MOCK_TOOLS` 补充详情并还原前端 id，点击可正常进入工具

---
## [1.6.4] - 2026-08-07

### Added
- 18 个早期内置工具全部升级：统一补齐移动端适配（375px、按钮/输入 ≥44px）、viewport、localStorage 记忆（刷新/全屏/重进恢复）与现代化界面
- 工具功能完善（示例）：旅行分账（额外分摊项+自动保存）、旅行分账 Pro（多成员/多笔消费/自动结算谁给谁钱）、喝水打卡（自定义目标+近 7 天历史+连续打卡）、冰箱食材（保质期自动分级提醒）、酒店比价（性价比排行推荐）、古诗词抽查/填空（内置题库+成绩统计）、英语单词小测（50 词库+计分）、九九乘法测验（计时+错题重做+最快纪录）、单位换算（6 大类 30+ 单位+温度换算）、密码生成器（历史记录持久化）、AI 回复格式转换器（输入自动保存）等

### Changed
- 科学计算器 Pro 新增「计算历史」面板（自动保存最近 50 条）
- 密码生成器历史记录改为 localStorage 持久化（原为内存，刷新即丢；同时修复与 window.history 的命名冲突）
- 螺纹参数查询：新增移动端适配（窄屏布局）+ 上次查询型号记忆
- AI 回复格式转换器：输入内容自动保存，刷新不丢

### Fixed
- 修复密码生成器在沙盒中历史变量与浏览器内置 history 冲突导致的报错

---

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
