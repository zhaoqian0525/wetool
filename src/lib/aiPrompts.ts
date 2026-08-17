// 微坞创作提示词常量（引导页 / 创作页共用）

/** 微坞通用创作要求：建议用户在给 AI 的提示词里附上这段 */
export const GUIDE_REQ_TEXT =
  "移动端优先，适配 375px 宽度，按钮和输入框至少 44px；界面简洁现代、颜色柔和；完全自包含，不引用外部 CDN 或图片，不使用网络请求（fetch/XHR）、cookie、弹窗、跳转、外部链接；需要记住用户数据时用 localStorage 保存和读取（微坞会自动持久化，刷新/全屏/重进都能恢复）；用户输入无效时给出友好提示；把完整代码放在一个 HTML 文件里，用 ```html 代码块输出。";

/** 创作页「一键复制」的默认提示词模板 */
export const AI_PROMPT_TEMPLATE = `请帮我写一个完整、独立的单文件 HTML 应用，用于[工具功能]。要求：
1. 移动端优先，适配 375px 宽度，所有按钮和输入框至少 44px，方便手指点击。
2. 自带 CSS 样式，设计简洁现代、颜色柔和；界面要有清晰的标题和操作提示，第一次用的人也知道怎么操作。
3. 完全自包含：不引用外部 CDN 或图片，不使用网络请求（fetch/XHR）、cookie、弹窗、跳转、外部链接；如需复制结果、导出文件、分享或读取用户昵称，使用平台提供的零风险 API（见 3.5 条）。
4. 需要记住用户数据时（如打卡记录、游戏进度、表单内容），用 localStorage 保存和读取。微坞会自动持久化这些数据：刷新页面、切换全屏、下次进入都能恢复。
3.5 平台零风险 API（回调风格，均可用）：复制文本 __wewoo.copyText('文本', cb)；导出文件 __wewoo.download('文件名.txt', '内容', 'text/plain', cb)（也支持 csv/json/html，文件名带扩展名即可）；分享 __wewoo.share({ title, text, url }, cb)；读取登录用户信息 __wewoo.getUser(function(err, user){ user.name / user.avatar })（未登录返回 null，不要依赖它做核心功能）；语音朗读 __wewoo.speak('文字', { lang: 'zh-CN' }, cb) 或直接用原生 speechSynthesis；大量计算可用 new Worker(URL.createObjectURL(new Blob(['...'])))。
5. 用户输入无效数据时给出友好提示，不要直接报错。
6. 代码要精简可靠，能直接运行。
7. 把完整代码放在一个 HTML 文件里，用 \`\`\`html 代码块输出。`;

export interface AiPromptExample {
  label: string;
  prompt: string;
}

/** 示例提示词：都已按微坞要求写好（手机适配 + localStorage 记忆），可直接照用 */
export const aiPrompts: AiPromptExample[] = [
  {
    label: "BMI 计算器",
    prompt:
      "帮我写一个 BMI 计算器：输入身高（cm）和体重（kg），点计算显示 BMI 值和健康等级（偏瘦/正常/超重/肥胖）并用不同颜色区分。把最近一次输入用 localStorage 保存，下次打开自动回填。界面用渐变背景和圆角卡片，按钮和输入框至少 44px，适配 375px 手机。完全自包含，不引用外部资源、不使用网络请求。把完整代码放在 ```html 代码块里。",
  },
  {
    label: "倒计时器",
    prompt:
      "帮我写一个倒计时器：可以设置时长（分/秒）和提示文字，开始后显示剩余时间（带圆形进度动画），结束时动画提醒。把上次设置的时长和文字用 localStorage 保存，下次打开自动恢复。界面漂亮，按钮至少 44px，适配 375px 手机。完全自包含、不使用网络请求。把完整代码放在 ```html 代码块里。",
  },
  {
    label: "随机点名器",
    prompt:
      "帮我写一个随机点名器：输入一串名字（用逗号或换行分隔），点开始名字快速滚动，再点一下停在随机一个名字上并高亮，记录最近抽中的名字。把名单和记录用 localStorage 保存，下次打开还在。要有动画效果，按钮至少 44px，适配 375px 手机。完全自包含、不使用网络请求。把完整代码放在 ```html 代码块里。",
  },
  {
    label: "颜色选择器",
    prompt:
      "帮我写一个颜色选择器：点击或输入选择颜色，显示 HEX 和 RGB 值并一键复制，保存最近用过的颜色列表（点一下可再次使用）。用 localStorage 保存最近颜色，刷新不丢。界面简洁好看，按钮至少 44px，适配 375px 手机。完全自包含、不使用网络请求。把完整代码放在 ```html 代码块里。",
  },
  {
    label: "喝水打卡",
    prompt:
      "帮我写一个喝水打卡记录器：每喝一杯点一下按钮，显示今天喝了几杯、目标进度和连续打卡天数；用 localStorage 保存数据，跨天自动归零但保留连续天数。界面可爱一点，按钮至少 44px，适配 375px 手机。完全自包含、不使用网络请求。把完整代码放在 ```html 代码块里。",
  },
  {
    label: "记账本",
    prompt:
      "帮我写一个简单的记账本：可以添加收入和支出（金额+备注），显示总余额和最近的账单列表，可以删除单条记录；用 localStorage 保存账目，刷新不丢。界面简洁、适配 375px 手机，按钮至少 44px。完全自包含、不使用网络请求。把完整代码放在 ```html 代码块里。",
  },
];


/** DeepSeek 内置 AI 生成的系统提示词：强制沙盒合规白名单 + 安全红线 */
export const AI_SYSTEM_PROMPT = `你是微坞 WeWoo 平台（we-woo.net）的 AI 工具生成助手。用户会描述一个想要的小工具，你需要输出一个完整、独立、可直接运行的单文件 HTML 应用。硬性要求：
1. 移动端优先，适配 375px 宽度，按钮和输入框至少 44px；界面简洁现代、配色柔和，有清晰标题和操作提示。
2. 完全自包含：不引用外部 CDN、字体或图片，不使用裸网络请求（fetch/XHR/WebSocket）、cookie、弹窗、跳转、外部链接；如需联网数据或 AI 问答，使用平台提供的白名单代理 API（见 3.6 条）。
3. 需要记住用户数据时（打卡记录、游戏进度、表单内容等）用 localStorage 保存和读取；平台会自动持久化，刷新页面、切换全屏、下次进入都能恢复。
4. 用户输入无效数据时给出友好提示，不要直接报错；代码要精简可靠，能直接运行。
5. 只输出一个完整 HTML 文件，把全部代码放在 \`\`\`html 代码块里输出，不要输出多余解释文字。
安全红线（遇到直接拒绝并说明原因）：不生成赌博、色情、诈骗、恶意程序/病毒、破解外挂、侵犯隐私窃取数据等违法或违规内容；不生成需要服务器、数据库、登录注册才能使用的功能（平台沙盒不支持）；不生成诱导分享、裂变拉新、虚假宣传类内容。
对话与多版本规则：
6. 这是多轮对话：用户会先描述需求，之后可能要求修改（例如"换个配色""加个历史记录""改成上下布局"）。每次都要基于最新上下文输出完整的新 HTML 文件，不要只给片段或 diff。
7. 用户说"换个版本""另一种风格""再生成一个"时，保持核心功能不变，输出一个布局、配色或交互风格不同的完整替代版本。
8. 权限边界与安抚：如果用户需要的功能超出微坞沙盒能力（白名单之外的任意联网、服务器、数据库、登录注册、支付、弹窗、跳转、外部链接、上传、读取剪贴板等），不要只说"做不了"。先用一两句话温和说明原因（例如"这个功能需要服务器/完整网络权限，微坞的工具沙盒里暂时无法运行"），再给出一个能在沙盒里运行的替代方案（例如用 localStorage 模拟数据、本地计算近似实现、用 3.6 条的白名单联网获取公开数据），并照常输出完整代码。
9. 生成结果必须符合沙盒：不包含裸 fetch/XHR/WebSocket、cookie、弹窗、跳转、外部链接、外部 CDN 或图片资源；需要保存数据时一律用 localStorage；需要复制/导出/分享时使用 3.5 条的平台 API，不要自己用 navigator.clipboard.readText 或直接发起下载到外部；需要联网数据或 AI 问答时使用 3.6 条的平台代理 API。
3.6 平台联网与 AI API（回调风格，均可用）：白名单联网 __wewoo.fetch('https://公开API地址', function(err, res){ res.status / res.data（文本，JSON 需自行 JSON.parse） })（仅白名单域名 + GET，常用于汇率/天气/词典/翻译/名言等公开数据；调用前用特性检测 if (window.__wewoo && __wewoo.fetch)，失败时降级提示"该功能需要联网，请在微坞内打开"）；内置 AI 问答 __wewoo.ai.chat({ prompt: '问题', context: '可选上下文', history: [{ role: 'user'|'assistant', content: '历史内容' }], maxTokens: 1500, json: false }, function(err, res){ res.reply；当 json:true 时 res.json 是已解析的对象 })。history 用于多轮对话记忆，由工具自己维护并传入（最多约 10 条）；maxTokens 控制输出长度，默认 1500、上限 4000，长文/长总结才需要调大；json:true 时要求 AI 只输出合法 JSON，便于工具解析结构化结果（如账单分类汇总）。每日有 1000 次调用额度，正常使用足够，但仍不建议把它当作核心功能的唯一依赖。`;

/** 敏感内容检测：返回命中的分类，未命中则 hit=false */
export interface SensitiveCheckResult {
  hit: boolean;
  label?: string;
}

const SENSITIVE_RULES: { label: string; words: string[] }[] = [
  { label: "赌博相关", words: ["赌博", "赌场", "博彩", "时时彩", "六合彩", "澳门赌场", "开奖预测", "彩票预测", "下注平台"] },
  { label: "成人内容", words: ["色情", "情色", "裸聊", "成人视频", "黄色网站", "色情网站", "av网站"] },
  { label: "诈骗内容", words: ["诈骗", "刷单返利", "杀猪盘", "裸贷", "虚假中奖", "贷款套现", "传销拉人"] },
  { label: "恶意程序", words: ["木马", "勒索软件", "挖矿脚本", "盗号", "钓鱼网站", "黑客攻击", "入侵服务器", "肉鸡"] },
  { label: "破解外挂", words: ["游戏外挂", "破解版下载", "刷钻", "外挂脚本"] },
];

export function containsSensitiveContent(text: string): SensitiveCheckResult {
  const t = (text || "").toLowerCase();
  for (const rule of SENSITIVE_RULES) {
    for (const w of rule.words) {
      if (t.includes(w.toLowerCase())) return { hit: true, label: rule.label };
    }
  }
  return { hit: false };
}

/** 从 AI 输出中提取完整 HTML：优先取 ```html/``` 代码块；无代码块时截取 <!DOCTYPE/<html> 到 </html> 的文档部分，避免混入回复文字 */
export function extractHtmlFromAiOutput(text: string): string {
  const t = (text || "").trim();
  if (!t) return "";
  // 1) 代码块：```html ... ```（大小写不敏感）或 ``` ... ```
  const fence = t.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (fence && fence[1] && fence[1].trim()) return fence[1].trim();
  // 2) 无代码块：从 <!DOCTYPE 或 <html 截取到最后一个 </html>，去掉前后说明文字
  let docStart = t.search(/<!DOCTYPE[\s>]/i);
  if (docStart < 0) docStart = t.search(/<html[\s>]/i);
  if (docStart >= 0) {
    const closeIdx = t.lastIndexOf("</html>");
    if (closeIdx >= docStart) return t.slice(docStart, closeIdx + 7).trim();
    const rest = t.slice(docStart);
    if (/<body[\s>]/i.test(rest) || /<head[\s>]/i.test(rest)) return rest.trim();
    return "";
  }
  // 3) 整段看起来就是 HTML
  if (/<body[\s>]/i.test(t) || /<head[\s>]/i.test(t) || /<style[\s>]/i.test(t) || /<script[\s>]/i.test(t)) return t;
  return "";
}
