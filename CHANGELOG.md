# Changelog

本文档记录微坞 WeWoo 项目的所有重要变更。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

---

## [2.10.1] - 2026-08-24

### Added
- 发布侧审核底线：发布/改编工具时，标题与简介增加敏感词拦截与长度上限（标题 60 字、简介 200 字），与 AI 生成侧保持一致

---

## [2.10.0] - 2026-08-24

### Added
- DeepSeek 视觉能力接入：创作页 AI 对话支持「拍照 / 导入图片」，可把截图、设计稿、照片等附带给 AI，辅助生成或修改工具
- 工具内 AI 网关 `__wewoo.ai.chat` 新增 `image` 字段，工具可读取图片让 AI 做识别 / OCR / 分析

### Fixed
- 回复评论 / 楼中楼后，被回复人不再收到通知的问题（新增「回复」通知类型）
- 回复列表「删除」按钮在窄屏下溢出出框的布局问题

---

## [2.9.0] - 2026-08-21

### Added
- 工具分享：系统分享带上描述，复制链接时复制「标题 + 描述 + 链接」完整文案，优化微信分享体验
- 通知中心新增收藏通知：有人收藏你的工具时通知作者

---

## [2.8.3] - 2026-08-21

### Fixed
- 清除内置模板工具的预设假浏览量（此前最高 2048），热门排序改为从 0 开始真实统计

---

## [2.8.2] - 2026-08-21

### Changed
- 评论区支持楼中楼：对回复也可继续回复，回复平铺显示并标注「回复 @谁」

---

## [2.8.1] - 2026-08-21

### Fixed
- 评论配图上传改走服务端 service_role（/api/upload-review-image），修复客户端 RLS 导致的上传失败
- 评论区支持删除自己的评论与回复（数据层校验 user_id）

---

## [2.8.0] - 2026-08-21

### Changed
- 「为你推荐」并入广场排序：广场排序改为「最新 / 热门 / 推荐」三个选项，移除独立推荐区块；推荐空状态提示登录或收藏

---

## [2.7.3] - 2026-08-21

### Fixed
- AI 对话输入框提示语缩短，不再在输入框内显示不全
- 草稿箱入口常驻显示（此前无草稿时不显示，用户找不到）；空状态提示「新建对话时会自动保存」

---

## [2.7.2] - 2026-08-21

### Changed
- 移除首页独立「热门榜」区块，避免主界面过重；名次徽章并入广场「热门」排序，前三名显示金银铜角标

---

## [2.7.1] - 2026-08-21

### Fixed
- 创作页场景模板名称不再截断，长名称允许换行完整显示
- 新手教程语言精简；修正「微信里能直接打开」的错误说法，改为建议手机浏览器打开

---

## [2.7.0] - 2026-08-20

### Added（M4 个性化首页）
- 首页新增「为你推荐」区块：登录且有收藏时，按收藏分类推荐同分类热门工具

---

## [2.6.0] - 2026-08-20

### Added（M4 通知中心）
- 评论他人工具时自动通知工具作者；导航栏新增未读铃铛（桌面 + 移动）；新增 /notifications 通知页，支持全部已读
- 需在 Supabase 执行 `supabase_v26_notifications.sql`（notifications 表 + RLS）

---

## [2.5.0] - 2026-08-20

### Added（M4 评论 @/图片）
- 评论与回复内容中的「@昵称」自动高亮显示
- 评论支持配图：发布评价时可上传图片（5MB 内），列表展示配图
- 需在 Supabase 执行 `supabase_v25_review_images.sql`（reviews 加 image_url 列 + review-images 公开桶）

---

## [2.4.0] - 2026-08-20

### Added（M4 草稿箱）
- 创作页「新建对话」时自动把旧对话保存为草稿（不再直接丢弃），草稿列表支持恢复与删除，按用户隔离存储

---

## [2.3.0] - 2026-08-20

### Added（M4 热门榜单）
- 首页新增「热门榜 Top 5」区块：按浏览量排名，带金银铜名次徽章，搜索时隐藏；有浏览数据才展示，避免新站空榜

---

## [2.2.3] - 2026-08-20

### Changed
- 创作页 AI 对话空状态视觉重设计：欢迎卡片（大图标 + 标题 + 说明）、渐变色 CTA「从场景模板开始」、分段控件分类切换、两列模板卡片网格

---

## [2.2.2] - 2026-08-20

### Changed
- 创作页场景模板分类 tab 与模板按钮统一为 32px 高度、相同内边距，视觉更整齐

---

## [2.2.1] - 2026-08-20

### Changed
- 创作页场景模板改为默认收起：「🎨 从场景模板开始」点击展开，按分类 tab 切换展示，不再一次性平铺 16 个模板，降低 AI 对话框信息密度

---

## [2.2.0] - 2026-08-20

### Added（M4 场景模板库首批）
- 创作页 AI 对话空状态升级为场景模板选择器：16 个模板、5 大分类（生活实用 / 学习成长 / 趣味游戏 / 联网查询 / AI 助手），点一下直接发送给内置 AI 生成完整工具
- 每个模板内置移动端适配、localStorage 记忆、沙盒合规要求；联网模板带 __wewoo.fetch 标准写法，AI 模板带 __wewoo.ai.chat json 标准写法
- 替代原 6 个硬编码快捷场景按钮

---

## [2.1.9] - 2026-08-18

### Fixed
- iPhone「添加到主屏幕」链接不对：工具页 manifest 版本升至 v3，并新增客户端强制刷新（挂载后主动重新挂载工具 manifest 并预热请求），避免 iOS 沿用缓存的站点 manifest 而存成主站首页

---

## [2.1.8] - 2026-08-17

### Changed
- AI 生成提示词强化：实时公开数据场景（天气/汇率/词典/翻译/名言等）明确优先使用 __wewoo.fetch 联网，避免 AI 默认生成本地模拟数据

---

## [2.1.7] - 2026-08-17

### Fixed
- `__wewoo.fetch` 返回增加 `res.json`（自动解析后的对象）：不再依赖上游 Content-Type，只要响应内容能被 JSON.parse 成功就提供；修复 wttr.in 等返回 JSON 但标记为 text/plain 的接口导致 AI 天气工具「数据格式异常」
- AI 提示词与天气示例同步更新为标准写法（`res.json.current_condition[0].temp_C` 等）

---

## [2.1.6] - 2026-08-17

### Changed
- 教程第 2 步的示例提示词（通用创作要求 + 9 个示例）改为默认折叠、点击展开，减少长页面信息密度

---

## [2.1.5] - 2026-08-17

### Fixed
- AI 生成提示词明确「麦克风录音 / 摄像头拍照（getUserMedia/MediaRecorder）沙盒暂不支持」，避免 AI 生成无法运行的语音输入类工具；语音输入需求改为安抚并建议文字输入替代方案

---

## [2.1.4] - 2026-08-17

### Changed
- 教程与创作文案同步工具内新能力：
  - 微坞通用创作要求与复制模板：由「禁止网络请求」更新为「禁止裸网络请求，联网用 __wewoo.fetch 白名单，AI 用 __wewoo.ai.chat」
  - 默认示例新增「汇率换算（联网）」「天气查询（联网）」「AI 账单整理」三个可直接复制的新场景示例
  - 教程 FAQ 新增「工具能联网获取数据吗」「工具能使用 AI 吗」两条说明（白名单范围、history/json/maxTokens/每日 1000 次）
  - 创作页 AI 对话区提示语同步更新

---

## [2.1.3] - 2026-08-17

### Changed
- 管理员账号调用工具内 AI（__wewoo.ai.chat）时豁免每日配额与余额保护；普通用户仍受配额、余额保护、敏感词过滤约束

---

## [2.1.2] - 2026-08-17

### Changed
- `__wewoo.ai.chat` 每日配额从「登录 10 次 / 游客 5 次」提升到「登录 1000 次 / 游客 1000 次」

### Fixed
- AI 调用失败时（配额用尽、超时、服务异常等），沙盒顶部自动显示错误提示横幅，不再依赖工具代码自行处理回调错误

---

## [2.1.1] - 2026-08-17

### Added（工具内 AI 能力扩展）
- `__wewoo.ai.chat` 新增可选参数，完全向后兼容 v2.1.0 的 `{ prompt, context }` 用法：
  - `history`：多轮对话记忆（`[{ role: 'user'|'assistant', content }]`，工具自行维护并传入，接口不落库，最多约 10 条）
  - `maxTokens`：输出长度可申请，默认 1500、上限 4000，长文/长总结才需要调大
  - `json: true`：要求 AI 只返回合法 JSON，接口自动解析并在回调中给出 `res.json`（解析失败则 `res.json` 为 null、`res.reply` 保留原文）
- AI 系统提示词 3.6 条同步更新 `__wewoo.ai.chat` 的新参数用法与多轮/结构化说明
- 配额（登录 10 次/游客 5 次）、敏感词检查、余额保护、usage 记账保持不变

---

## [2.1.0] - 2026-08-14

### Added（M3 AI 网关 + 白名单联网代理）
- `__wewoo.fetch(url, opts, cb)`：工具内白名单联网（回调返回 { status, data, contentType }）。仅 https + 域名白名单（汇率/天气/词典/翻译/二维码/名言等公开 API，可用 PROXY_ALLOWED_HOSTS 覆盖）+ 仅 GET + 响应 256KB 上限 + 10s 超时 + 内容类型白名单（拒绝 HTML 防 XSS）+ 限流 + 审计日志 proxy_log
- `__wewoo.ai.chat({ prompt, context? }, cb)`：工具内 AI 问答（支持字符串/对象两种调用）。服务端持有 DeepSeek key（绝不下发浏览器）、模型钉死 flash 档、输入/输出敏感词检查、余额保护、每日配额（登录 10 次 / 游客 5 次）、usage 记账 ai_usage
- 管理后台新增「用量看板」tab：今日 AI 调用/tokens、按工具聚合、最近调用记录、最近代理请求
- 能力徽章更新：`联网（白名单）` 与 `内置 AI 问答` 变为可用能力；裸 fetch/XHR 等仍显示为受限并拦截
- AI 系统提示词新增 3.6 条：平台联网与 AI API 用法、特性检测与降级写法；联网边界措辞同步调整

### Notes
- 需在 Supabase 执行 `supabase_v21_m3.sql`（ai_usage / proxy_log 表 + RLS），未执行前用量看板显示「未初始化」提示，日志降级为服务端 console

---
## [2.0.3] - 2026-08-14

### Added（M2 零风险 API 第一批）
- `__wewoo.copyText(text, cb)`：沙盒内一键复制文本（优先 `navigator.clipboard.writeText`，不可用时父页面 execCommand 兜底），**只写不读**
- `__wewoo.download(filename, content, mime, cb)`：文件导出（txt/csv/json/html 等），父页面 Blob + a.click 下载
- `__wewoo.share({title, text, url}, cb)`：调用系统分享面板（`navigator.share`），不支持时回退复制文案
- `__wewoo.getUser(cb)`：只读登录用户昵称/头像（未登录返回 null），不暴露邮箱与 ID
- `__wewoo.speak(text, opts, cb)`：语音朗读（speechSynthesis），支持 lang/rate/pitch
- Web Worker 支持：沙盒 CSP `script-src` 增加 `blob:`，新增 `worker-src blob:`，大数据计算不再卡 UI
- AI 系统提示词同步更新：告知模型可用零风险 API 与 Worker 写法，把「复制结果/导出文件」从受限清单移出

### Fixed
- 修复沙盒桥接脚本 `STORAGE_API` 中 `loadState` 结尾多出闭合大括号导致的语法错误：该错误会使整个 `__wewoo` 桥接脚本无法执行（所有工具的复制/记忆 API 失效），已修正并通过预览实测

---
## [2.0.2] - 2026-08-14

### Fixed
- 广场 / 首页 / 搜索结果中数据库工具的封面不显示：v2.0.0 的 /api/tools/public 与 /api/tools/search 返回 camelCase 字段（coverUrl / authorId / sourceToolId / viewCount），而 mapRow 只读取 snake_case（cover_url 等），导致封面、作者 ID、源工具 ID、浏览数丢失。已为 mapRow 增加 camelCase 兼容（封面立即恢复，作者判断 / 改编链路 / 浏览量同步修复）
- 管理后台「下架 / 恢复 / 标记处理 / 驳回」操作无效：tools 表 RLS 仅允许作者更新自己的工具、reports 表无 UPDATE 策略，管理员以普通用户身份更新会被 RLS 拒绝。管理 API 已改用 SUPABASE_SERVICE_ROLE_KEY（代码层仍先校验管理员身份，未配置密钥时返回明确错误）

### Chore
- 删除测试工具「E2E自动截图-206600」（含关联的使用记录、举报、封面文件），公共列表恢复 16 个真实工具
---
## [2.0.1] - 2026-08-14

### Added（M1.5 审核底线落地）
- 已下架工具（is_banned）从公开入口隐藏：公共列表、服务端搜索、首页广场 / 最近使用 / 相关推荐均过滤；作者个人页仍可见自己的工具
- 工具详情页：非作者访问已下架工具显示「该工具已下架」；作者可见下架提示横幅（仅自己可见，可联系管理员申诉恢复）
- 管理后台 /admin：管理员（邮箱白名单 ADMIN_EMAILS，默认站长邮箱）登录后可查看举报队列、下架 / 恢复工具、标记已处理 / 驳回举报；导航栏用户菜单仅管理员显示「管理后台」入口
- 管理 API：POST /api/admin/tools/[id]/ban、GET /api/admin/reports?status=pending|all、POST /api/admin/reports/[id]/resolve，均需管理员 Bearer token 校验

### Fixed
- 管理举报列表接口 TypeScript 类型错误（titleMap 类型收窄），本地 build 通过

### Notes
- 前置 SQL supabase_v2_audit.sql 已在 Supabase 执行（reports 表 + RLS + tools.is_banned 列，RLS 已实测：匿名写入被拒）
- 管理员邮箱可用环境变量 ADMIN_EMAILS（服务端）/ NEXT_PUBLIC_ADMIN_EMAILS（前端入口显示）覆盖
---
## [2.0.0] - 2026-08-13

### Added（M1 容量地基 + 权限透明反馈）
- 公开工具列表 CDN 缓存接口 `GET /api/tools/public`：只取列表字段（不含完整 HTML code，网络体积 -80%+），`Cache-Control: s-maxage=60 + stale-while-revalidate=300`，首页并发访问不再每个客户端直查 Supabase；`fetchTools()` 优先走该接口，失败自动回退原直查逻辑
- 首页最近使用加载提速：`fetchRecentTools` 不再 `select("*")` 拉取完整 code，改用列表字段
- 封面上传自动压缩为 WebP（Canvas 重绘 375x667，quality 0.85，约省 50-70% 体积）并声明 `cache-control: max-age=86400`；压缩失败自动回退原图，不阻断上传
- 工具能力徽章：详情页/发布弹窗/AI 生成后自动展示「能做什么（✅ 本地记忆/音效/绘图/定时）/ 不能做什么（⛔ 联网/系统通知/外部跳转）」，由代码静态扫描生成（src/lib/capabilities.ts + CapabilityBadges 组件）
- 运行时越权反馈升级：沙盒内 fetch/XHR/WebSocket/EventSource/sendBeacon/Notification/window.open 被拦截时，顶部横幅给出具体权限提示（如「此工具没有联网权限，网络请求已被拦截」），不再只是笼统警告
- 举报入口：工具页新增「🚩 举报」（匿名点击跳登录），原因含垃圾广告/侵权内容/违法信息/色情低俗/其他；5 分钟防重复；配套 SQL `supabase_v2_audit.sql`（reports 表 + RLS + tools.is_banned 列）需在 Supabase 执行一次

### Changed
- 注册表单简化：移除「确认密码」字段（保留昵称可选、邮箱、密码），减少注册门槛

### Notes
- M1 剩余：is_banned 列表过滤接入（执行 SQL 后）、管理侧下架操作，见 ROADMAP M1.5
- 版本号从 1.x 系列进入 2.0 大版本（v2.0 里程碑：M1 基础设施/权限透明 → M2 零风险 API → M3 AI 网关+联网代理 → M4 社区收尾）

---

## [1.15.6] - 2026-08-13

### Fixed
- 自动截图生产环境 500（手机/电脑均提示「截图失败」）：`@sparticuz/chromium` 依赖相对路径定位 bin/ 下的 brotli 二进制（chromium.br 等），被 Next.js 打包后目录丢失导致启动即失败。已将其加入 `serverExternalPackages` 保持外部化，并把 `node_modules/@sparticuz/chromium/bin/**` 与 `fonts/**` 显式打进截图/渐变函数包（`outputFileTracingIncludes`）；错误响应附带 detail 字段便于诊断
- 渐变封面只有背景没有 emoji（iPhone Safari）：iOS 上 canvas 绘制 emoji 不可靠。新增服务端接口 POST /api/cover/gradient，用无头浏览器原生渲染渐变封面（渐变 + emoji + 标题 + 品牌角标）；客户端 `generateCustomCoverBlob` 服务端优先，失败自动回退本地 canvas，不影响既有三条封面路径
- Vercel 无头环境缺少中文字体与 emoji 字体（只有 Open Sans）：截图函数附带 NotoSansSC + NotoColorEmoji（约 27MB，随函数包分发），启动时复制到 /tmp/fonts 并设置 FONTCONFIG_PATH，用户工具 HTML 中的中文/emoji 与渐变封面均能正常渲染

### Notes
- 服务端截图/渐变超时放宽至 90s（Vercel Hobby 上限 300s），客户端对应超时提到 75s；冷启动首次截图会慢一些，属正常现象

---

## [1.15.5] - 2026-08-13

### Fixed
- 上传封面「图片读取失败」（手机+电脑均有）：dataUrlToBlob 改用 atob 同步解码。旧实现 fetch(dataURL) 会被本站 CSP connect-src（不含 data:）拦截，导致所有设备的「上传图片」封面路径一律失败。
- 自动截图 iPhone Safari 仍失败：封面截图改为服务端 Puppeteer 无头浏览器渲染（375x667 PNG），浏览器原生渲染与设备无关，canvas 直接入图；客户端 html2canvas 降级为兜底。
- iOS 渐变封面兜底失效：canvas.toBlob 永不回调（iOS Safari）时回退 canvas.toDataURL + atob 解码，保证渐变封面在 iOS 上也能生成并上传。
- 更换封面后首页不刷新：封面 URL 加版本参数（?v=时间戳）绕过浏览器/next-image 旧图缓存，并失效首页列表、详情、个人页本地缓存，保存后立即生效。

### Notes
- 新增接口：POST /api/cover/screenshot（需登录；Vercel 生产用 @sparticuz/chromium，本地开发用 puppeteer 本机 Chrome），失败自动回退原 html2canvas 路径，不影响既有功能。
## [1.15.4] - 2026-08-12

### Fixed
- iPhone Safari 封面生成仍然卡死（发布/更换封面）：v1.15.3 已给 html2canvas 加超时，但最后一步 canvas.toBlob 在 iOS 上可能永不回调（无异常、无超时），导致界面永远停在「正在生成封面」。v1.15.4 为 toBlob 补 8s 超时、dataURL 转 Blob 补 8s 超时、Supabase 封面上传补 25s 超时，任一步骤挂起都会自动走默认渐变封面兜底，不再永久卡住
- srcdoc 兼容：快照 iframe 的 srcdoc 若以 <!DOCTYPE 开头，部分浏览器（尤其 iOS Safari）可能出现空白/加载异常，现已剥离前缀再渲染

### Notes
- 行为不变：正常截图/上传图片/渐变封面三条路径在桌面与安卓均不受影响（本地 Chrome E2E 验证通过）
## [1.15.3] - 2026-08-12

### Fixed
- 发布新工具 / 更换封面一直卡在「正在生成封面」（iPhone Safari）：captureCover 第二阶段 html2canvas 截图没有超时保护，iOS Safari 下 promise 可能永不返回导致界面永远转圈。新增 15 秒超时（Promise.race），超时自动走默认渐变封面兜底；详情页更换封面截图失败也会自动保存默认渐变封面并提示，不再卡死
## [1.15.2] - 2026-08-12

### Fixed
- iOS「添加到主屏幕」的快捷方式被存成官网首页：工具页 manifest URL 版本化（?v=2）+ manifest 响应禁止缓存（no-store），强制 iOS 重新抓取到正确的工具 start_url。老设备需要：删除旧主屏快捷方式 → 清除 we-woo.net 网站数据 → 重新添加
- 封面上传被 Storage 策略误拒（v1.15.0 遗留）：cover_auth_upload/update/delete 用 storage.foldername()[2] 取文件 ID，对 public/<toolId>.png 恒为 NULL，导致所有新工具封面、头像上传 403（表现为发布后没有封面）。改用 storage.filename() 解析；需在 Supabase SQL Editor 执行一次 supabase_fix_rls_storage_v2.sql（已同步修正 supabase_fix_rls_all.sql）
## [1.15.1] - 2026-08-12

### Fixed
- 手机桌面（PWA/standalone）打开工具时「登录」按钮闪一下消失：登录态未加载完成时，工具页点赞区、写评价区、全屏未登录横幅、首页 standalone 未登录横幅均以骨架占位代替，登录态就绪后再渲染真实内容——已登录用户不再闪现「登录」按钮，未登录用户按钮稳定显示

## [1.15.0] - 2026-08-12

### Security（双 AI 安全审查驱动）
- 封面截图沙箱修复（P0）：`captureCover` 不再给用户代码 iframe 加 `allow-same-origin`；改为 T4 快照机制——沙盒运行（仅 allow-scripts）→ 注入快照脚本回传 DOM（canvas 序列化为 dataURL）→ 清理脚本/事件/嵌入内容后渲染进无脚本 iframe → html2canvas 截图。用户 HTML 无法再读写父页面 localStorage/Supabase token
- 修复封面构建注入 bug：用户 HTML 为 `<head><style>` 紧凑结构时，注入的 CSP/视口/重置样式被错误塞进 `<style>` 标签内部，导致样式失效且 CSP 未生效（顺带修复）
- 搜索参数化（P1）：`/api/tools/search` 过滤 `.or()` 字符串中的特殊字符，注入 payload 不再构成过滤注入面
- 工具可见性落库（P1）：详情页公开/未列出/私密切换同步写入 Supabase，失败自动回滚并 toast 提示
- AI 生成限流加固（P1）：新增 Supabase RPC `ai_rate_bump` 跨实例计数（`ai_rate_limit` 表），未部署时自动回退内存 Map；`x-forwarded-for` 改取可信末段
- lint 修复（P1）：`package.json` lint 改 `eslint .`（Next 16 已移除 `next lint`），删除遗留 `.eslintrc.json`

### Notes
- ⚠️ 请在 Supabase Dashboard → SQL Editor 执行一次 `supabase_fix_rls_all.sql`（幂等）：全表 RLS（likes/tool_state/tool_usage_history/tool_drafts/user_pinned_tools/tool_recent 等）+ Storage owner 路径约束 + `ai_rate_limit` 表/`ai_rate_bump` RPC。执行前 4.90/4.95 的线上防护不生效

## [1.14.0] - 2026-08-12

### Added
- 评论系统完善：最新/最热排序（最热按点赞数）、回复功能（回复 @昵称、嵌套展示、作者标记「作者」徽章、评论者头像），点赞数随按钮展示
- 创作新对话：底部「创建」入口带 ?new=1，进入即清空旧对话草稿并移除参数，改编入口（source_tool_id）不受影响仍保留原对话逻辑
- 用户主页提速：我的页面工具列表（发布的/收藏的）首次请求写入本地缓存，再次进入秒开再后台刷新

### Fixed
- 更换头像按钮被全局 min-height 撑成 44px 竖长条，修复为 28px 圆形（min-h-0）
- 修复网络抖动误弹「工具未找到」：fetchToolById 网络超时/失败与「确认不存在」区分开（有详情缓存则兜底返回），详情页网络失败时保留已渲染内容并显示可重试的「加载失败」视图，真实 404 仍正常显示
- resolveSourceTool 容错：改编源解析失败（网络抖动/源被删）不再中断主工具展示
- 改编源加载失败不再无提示，toast 提示「加载改编源失败，请重试」

### Notes
- 评论回复需要数据库新增列，请在 Supabase Dashboard → SQL Editor 执行一次 supabase_reviews_reply.sql（幂等，未执行时评论/回复自动回退为普通评论，功能不中断）

## [1.13.1] - 2026-08-11

### Added
- 个人头像更换：用户主页头像旁新增更换按钮，图片压缩到 512×512（WebP）后上传 Supabase Storage，写入用户资料；导航栏与用户主页统一用 Avatar 组件展示（有头像显示图片，无头像显示首字母渐变）
- 微信/社交分享优化：工具详情页 OG 分享图改用工具封面（内置工具用 WebP 封面，无封面兜底品牌图），描述带作者信息；用户主页新增分享 metadata（昵称 + 发布数量）

## [1.13.0] - 2026-08-10

### Changed（提速与收尾）
- 内置工具 18 个封面图全部转 WebP（质量 82），首页封面网络体积 -72%（1726KB → 478KB）；封面引用统一切到 `/covers/*.webp`，旧 PNG 保留兼容缓存
- 新增工具详情数据缓存：fetchToolById 成功后写入 localStorage（24h TTL、最多 10 条），工具详情页进入时命中缓存立即渲染 iframe 秒开，网络结果到达后覆盖保持最新
- ROADMAP 状态整理：勾选已修复技术债（B1/B2/B4/B5/B8 及 P2 暗色模式/组件化、P3 字段瘦身），文档与实际代码状态对齐

## [1.12.4] - 2026-08-10

### Fixed
- 修复最近使用卡片封面错误：recent-tools 接口未返回 coverUrl 字段，首页 `String(undefined)` 误判为有封面，渲染无效图片（src="undefined"）；接口现在正确返回封面，内置工具回退公共封面
- 修复无封面工具被兜底成不存在的 `/covers/<uuid>.png` 导致封面破图（mapRow / 搜索接口 / fetchTools 合并），无封面统一显示渐变占位，仅内置工具保留公共封面
- 修复手机端最近使用不显示：token 过期接口 401 或网络失败时不再清空最近使用（保留本地缓存数据）；authedFetch 遇 401 自动刷新 session 并重试一次

## [1.12.3] - 2026-08-10

### Changed
- 个人主页（收藏的工具 / 发布的工具）卡片图标改用工具封面图，无封面时显示纯渐变占位，不再使用 emoji
- 首页广场工具卡片、最近使用、我的工具卡片同样改为封面优先 + 纯渐变占位（无 emoji）
- 工具详情页相关工具推荐卡片同步改为封面优先（无 emoji）

## [1.12.2] - 2026-08-10

### Fixed
- 修复圆角体系 bug：业务圆角 token（--radius-sm/md/lg = 12/20/35px）与 Tailwind v4 圆角主题变量撞名，导致全站 46 处 rounded-lg 按钮（create 页保存/发布、首页最新/热门、重置/复制代码等）被误改成 35px 大圆角；token 改名（--radius-control/--radius-card/--radius-hero），rounded-lg 恢复标准 8px

### Changed（UI 形状统一）
- create 页顶部按钮统一：示例/教程/保存/发布全部 8px 圆角、44px 高、text-sm（保存按钮字号/内边距对齐）
- 首页「最新/热门」改胶囊形，与分类筛选按钮风格统一
- 桌面端登录按钮统一 44px 高 + 12px 圆角，与教程/开始创作对齐
- 工具封面 emoji 加半透明白色圆形背景（无封面工具：首页卡片/最近使用/我的工具/相关工具推荐/下载型封面/空状态占位），整体更精致统一
- 新手教程横幅图标格改圆形；用户页工具卡片统一 16px 圆角（与首页一致）

## [1.12.1] - 2026-08-10

### Added（P2 设计系统深化 · 第二批：暗色模式）
- 深/浅主题切换：导航栏新增切换按钮（桌面端操作栏 / 移动端头像区），跟随系统偏好 + localStorage 记忆（wewoo-theme），首帧前内联脚本防刷新闪烁，切换同步更新浏览器 theme-color（移动端地址栏颜色）
- 暗色样式全量适配：CSS 变量覆盖（--bg-page/--bg-card/--bg-soft/--text-*/--line/--brand-*）+ Tailwind 硬编码类覆盖（bg-white/bg-gray-*/text-gray-*/border-gray-*/indigo/绿/橙/红/蓝状态色及 hover/focus/group-hover 变体）
- 各页面根背景统一 bg-page 语义类（浅色值不变）；毛玻璃导航（bg-white/95）、引导页顶部渐变、输入框边框暗色适配

### Fixed
- 修复编译级 bug：globals.css 注释内嵌 `*/`（btn-*/text-secondary）导致注释提前闭合、残留文本把 `:root[data-theme="dark"]` 吞成无效规则被浏览器解析器丢弃（body 背景暗色不生效的根因）
- 修复首页根容器硬编码 bg-[#F9F9FB] 未随暗色变暗

## [1.12.0] - 2026-08-09

### Added（P2 设计系统深化·第一批）
- 设计 token 完整落地：圆角阶梯（12/20/35px）、文字层级（--text-1/2/3）、背景层级（--bg-card/--bg-soft）、页面宽度（--page-width）、补 --brand-200，青色点缀 #22D3EE 唯一来源 --accent-cyan（Logo 去掉硬编码）
- 语义工具类：panel（卡片）、btn-secondary（白底靛蓝描边）、btn-ghost（弱操作）、btn-danger（删除）、input-base（输入框统一）、radius-sm/md/lg、text-secondary/text-muted、bg-soft、page-width
- 组件化：新增 src/components/ui.tsx（Modal 统一遮罩/卡片/进出场动画 + Badge 语义徽章）

### Changed
- 6 处弹窗接入统一 Modal：新手引导、安装主屏幕引导、发布工具、发布成功卡片、更换封面、删除确认（行为零变化，遮罩/圆角/动画统一）
- 分类/状态/下载型徽章接入 Badge 组件（首页下载标、工具详情分类/刚刚发布/可见性）
- 高频卡片组合改 panel、示例/教程按钮改 btn-secondary、登录/发布输入框改 input-base、弹窗次按钮改 btn-ghost/btn-danger

---

## [1.11.1] - 2026-08-09

### Fixed
- 根治手机端（iPhone Safari）12 秒误报「该工具可能包含语法错误」（2048 小游戏、情侣纪念日记录等）：READY 确认从 effect 局部变量改为按 iframe 实例记忆，监听器挂载后主动 PING 补收 READY，iframe onLoad 作为兜底确认；「重新加载」现在会真正重建 iframe 并重新计时

### Changed
- 创作页顶部按钮样式统一：移动端「教程」由纯图标改为图标+文字，与「示例」统一为白底靛蓝描边次级按钮，与主操作（保存/发布）层级清晰

---

## [1.11.0] - 2026-08-09

### Added
- 创作页顶部新增「教程」按钮：移动端顶栏书图标按钮、桌面端操作栏「教程」文字按钮，登录后随时可打开教程（/guide）
- 创作页 AI 对话空状态新增「📖 不会写？看看教程，5 分钟上手」引导链接

### Changed
- 首页新手教程横幅按登录状态分开记忆：登录用户即使之前关过游客版提示，登录后还能再看一次教程入口（独立 localStorage key，看过即不再打扰）
- 教程横幅文案按登录状态适配（游客「第一次来？」，登录用户「想不起来怎么做？」）

---

## [1.10.0] - 2026-08-09

### Changed（视觉统一，UI 集中版）
- 登录/注册页按品牌规范统一：页面背景换 bg-page、顶栏品牌色、主按钮改品牌渐变 btn-primary、输入框聚焦环改品牌色 #5046E5
- 用户主页按品牌规范统一：页面背景换 bg-page、头像改品牌渐变 + 白字 + 阴影
- 发布弹窗与发布成功卡片品牌化：发布/确认按钮改品牌渐变、发布成功卡片顶部加品牌渐变条
- 交互动效体系化：btn-primary（hover 提亮 / 按压缩放 / 阴影）、btn-press、card-surface 工具类落地，配合已有 card-hover-float 与弹窗进出场动画
- 品牌 token 工具类落地到 globals.css：bg-page / text-brand / border-line / btn-primary / btn-press / card-surface，为 P2 设计系统深化铺路

## [1.9.11] - 2026-08-09

### Fixed
- 修复手机端（慢网络/登录用户）打开工具 12 秒误报「该工具可能包含语法错误」：根因是错误计时器在 iframe 尚未挂载时就已启动，状态请求超过 12 秒后误杀正常工具；现改为计时器仅在 iframe 真正挂载（stateLoaded && docReady）后启动
- 状态接口慢/挂起时兜底：最迟 10 秒放行 iframe 挂载，避免工具永远停留在加载骨架；云端记忆在接口返回后补注入，不影响原有记忆功能
- 「语法错误」降级页新增「重新加载」按钮，误报后可直接重试，无需刷新整页

## [1.9.10] - 2026-08-09

### Added
- 注册页新增可选「昵称」：写入 user_metadata.name，用户主页、发布工具作者名、评论统一展示昵称（不再显示 UUID 风格的邮箱前缀）

### Fixed
- 用户主页：他人主页头像/标题不再显示乱码邮箱前缀或空 "?"，无工具用户回退「微坞用户」+ 品牌头像
- 分类 emoji 映射统一到 src/lib/constants（消除 3 处重复定义，防改漏）

### Changed
- 确认创作页「外部提示词」无 30s 自动展开打扰：默认折叠，仅点击展开

## [1.9.9] - 2026-08-09

### Fixed
- 修复 iOS「添加到主屏幕」一半概率变成 we-woo.net：工具页原本同时存在站点 manifest 与工具 manifest，iOS 取到站点 start_url(/)；现改为每页只注入一个 manifest（工具页=工具 manifest，其余页面=站点 manifest）
- 修复工具详情页作者名「往上歪」、与日期不在同一行：移动端全局 44px 触控区规则把作者链接拉高、文字靠顶，改为链接内文字垂直居中
- 相关工具推荐补上封面图：有封面显示封面图，无封面回退渐变 + emoji

### Changed（创作页视觉统一）
- 创作页 AI 对话区字号统一：消息气泡改 text-sm，次要信息/提示/版本按钮统一 text-xs，去掉散落的 10px/11px；面板标题、外部提示词标题、输入框统一 text-sm
- 编辑器/预览面板零散 10px 提示统一为 text-xs

## [1.9.8] - 2026-08-09

### Fixed（稳定修复）
- 修复手机端（iPhone Safari/微信）游玩工具误报「该工具可能包含语法错误」：登录态就绪、状态保存会重复触发 iframe 就绪计时器，慢网延迟登录场景下 12 秒后误报；计时器改为只随工具/预览地址启动，savedState/user 最新值改走 ref，2048 等工具长时间游玩不再跳错
- 修复「单位换算大全」点击重量等分类报错：补回缺失的 save() 函数，避免 ReferenceError，分类切换恢复正常

## [1.9.7] - 2026-08-09

### Changed（首页视觉优化 + 品牌化）
- 首页大标题「AI 工具广场」回到 Hero 独立一行（更大更醒目），搜索栏压缩为图标按钮与标题同排，点击展开搜索框（自动聚焦，Esc/图标可收起）
- 默认封面品牌化：发布兜底封面与无封面占位统一使用品牌渐变（#5046E5→#8B5CF6）+ W 元素
- 设计 token 补全：全局字体栈加入 Noto Sans SC/Inter、新增背景灰 #F9F9FB 与分割线 #E7E7EA 变量、卡片阴影更新为设计系统规范
- 导航栏移除标题占用，恢复 logo + 「AI 工具集市」徽章

## [1.9.6] - 2026-08-09

### Changed（创作体验统一）
- 首页导航栏标题「发现实用小工具」改为「AI 工具广场」，与广场区块呼应，涵盖发现与创作
- 创作页 AI 对话面板浅色化：面板/头部/输入框/气泡/快捷按钮全部改为浅色，保留品牌靛蓝主色；行为零改动（流式对话/版本切换/自动填入/三 tab 不变）
- 代码编辑器统一为品牌墨黑 #0A1628（保留深色编码习惯），配套头部/快照栏/边框同步

## [1.9.5] - 2026-08-09

### Changed（首页布局优化）
- 「发现实用小工具」标题上移到导航栏 logo 旁（桌面/手机均显示），正文保留隐藏 h1 供 SEO/无障碍
- 分类与「最新/热门」排序下移到「最近使用/我的工具」下方，与广场网格在一起；新增「广场」标题与工具数量
- 搜索时区块标题变为「搜索结果」，分类/排序仍显示在结果上方

## [1.9.4] - 2026-08-09

### Changed（信息密度压缩）
- 工具详情页头部从 5 行压缩到 3 行：标题与分类/状态徽章同行；描述两行截断；「改编自」并入元信息行（作者 · 日期 · 浏览 · 改编自）
- 首页：删除「发现实用小工具」的副标题行；工具卡片描述改为一行截断；「最近使用 / 我的工具」区块标题间距收紧

## [1.9.3] - 2026-08-09

### Changed（工具详情页 UI 优化）
- 元信息行精简：作者/日期/浏览量统一浅灰小字低调展示，移除蓝色高亮「次浏览」与挤在行内的「使用记录」
- 操作栏分主次两层：主操作（点赞/收藏/分享/改编/全屏/安装）保持 44px 触控按钮；「使用记录 / 换封面 / 删除」下沉为浅色小字次要操作行，降低视觉噪音
- 分享按钮补上「分享」文字、收藏按钮补上「收藏」文字，按钮语义更清晰

## [1.9.2] - 2026-08-09

### Changed（广场工具卡片 UI 优化）
- 封面纯净化：移除封面上的类别徽章、浏览量徽章、下载型黑底标签，封面只保留图片（或渐变 + 大 emoji），不再叠加信息
- 信息下沉到卡片正文：标题加大到 15px，作者与浏览量在同一行低调展示（浅灰小字），下载型改为正文内的小圆角标签
- 最近使用小卡标题改为 truncate，不再手动截断字符

## [1.9.1] - 2026-08-09

### Changed（单工具主屏幕体验完善）
- 全站 PWA（主屏幕打开）下，工具页「添加到主屏幕」按钮仍然显示：引导复制工具链接，在 Safari/Chrome 打开后即可把单个工具加到主屏幕
- 单工具主屏幕入口（?app=1）全屏时去掉「返回广场」按钮，用户从主屏幕图标进入即单纯使用工具，靠系统手势返回
- 单工具全屏且未登录时，顶部显示登录提示条：「未登录 · 登录后进度和记录可云端保存」+ 登录按钮；登录成功后回到全屏工具（带 ?app=1）

## [1.9.0] - 2026-08-09

### Fixed（PWA 全站入口）
- 修复从主屏幕打开整个网站后，点进小工具会直接全屏的问题：现在正常进入详情页；仅单工具主屏幕入口（?app=1）才自动全屏

### Added（登录状态提示）
- PWA 主屏幕入口未登录时，首页顶部显示「未登录 · 登录后可保存使用记录、收藏工具」提示条 + 去登录按钮
- Navbar 移动端登录按钮升级为品牌渐变实心按钮，更醒目

### Changed（UI 升级第一批，v1.9）
- 设计系统 token 化：品牌渐变（#5046E5→#8B5CF6）、圆角/阴影抽成 CSS 变量
- 首页：分类选中态与「开始创作」按钮应用品牌渐变
- 工具详情页：操作栏按钮触控 32px→44px、字号 12→13px、圆角统一
- 创作页：AI 面板「清空对话/新建对话」字号 10px→12px、触控 40px；版本切换按钮 40px；移动端三 tab 44px；退出预览 44px
- 移动端全局字号规范：正文 15px、标题分级（h1 22px / h2 18px）

### Checked
- 内置工具打开正常；首页搜索/分类/卡片正常；PWA standalone 行为已验证（详情页不自动全屏、?app=1 自动全屏、登录提示条显示）

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
- 全屏模式与预览共用同一个 iframe（CSS fixed 覆盖视口），删除独立的第二个 iframe，修复全屏容器 `fixed` 与 `relative` 样式冲突导致高度崩缩为 0、预览状态丢失的问题
- 修复首次交互不可用：iframe 挂载即 `opacity:1` 可交互（此前 `opacity:0` 在 iOS Safari 命中测试不可靠，打开工具需要先点一下才能玩）
- 骨架屏仅在 iframe 未挂载时显示，避免遮挡可交互区域
- 修复 localStorage 记忆不生效：2048 小游戏、情侣纪念日记录器注入 localStorage 持久化（走墓碑 + 云端同步链路）

### Changed
- 2048 刷新后棋盘/分数还原可续玩；纪念日记录器刷新后主页与设置完整恢复

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
