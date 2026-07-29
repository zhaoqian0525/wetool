/**
 * 工具代码模板包裹
 *
 * wrapToolCode 是工具代码渲染的统一入口，确保所有设备上有基本可用的展示效果。
 *
 * 模板包含：
 * 1. 完整 HTML5 结构 + <meta charset>
 * 2. viewport meta — 适配移动端，禁止缩放
 * 3. 基础 CSS 重置 — box-sizing + system-ui 字体 + 内边距
 * 4. 全局错误捕获 — fetch/XMLHttpRequest/WebSocket/localStorage 等被禁 API
 *    调用时在页面顶部显示红色提示横幅
 * 5. CSP 安全策略 + Storage 安全 shim（由 wrapSecureSrcDoc 注入）
 *
 * 使用方式：
 *   import { wrapToolCode } from "@/lib/tool-template";
 *   const safeHtml = wrapToolCode(userCode);
 */

import { wrapSecureSrcDoc } from "./sandbox";

/**
 * 将用户原始 HTML 代码包裹进预设模板。
 *
 * @param userCode - 用户原始 HTML 代码（可以是完整文档或代码片段）
 * @returns 可直接放入 iframe srcDoc 的安全完整 HTML 字符串
 */
export function wrapToolCode(userCode: string): string {
  return wrapSecureSrcDoc(userCode);
}
