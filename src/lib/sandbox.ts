/**
 * 微坞沙箱安全工具
 *
 * 防护层级（从外到内）：
 * 1. iframe sandbox="allow-scripts" — 仅允许脚本执行，禁止 same-origin / forms / popups / top-navigation
 * 2. wrapSecureSrcDoc 注入 CSP <meta> — 浏览器级权限限制（connect-src 'none' 等）
 * 3. wrapSecureSrcDoc 注入 CSP <meta> — 浏览器级权限限制（connect-src 'none' 等）
 * 4. wrapSecureSrcDoc 注入安全 shim — localStorage / sessionStorage / cookie 在 null-origin 下静默降级
 * 5. 代码扫描 — 发布前检测危险 API，警告创作者
 *
 * 安全模型：
 * - sandbox="allow-scripts"（无 allow-same-origin）使 iframe 获得 opaque origin（null）
 * - 这意味着 localStorage / sessionStorage / document.cookie / fetch / XMLHttpRequest 全部抛 SecurityError
 * - CSP meta 作为第二道防线，封锁 connect-src / frame-src / object-src / form-action
 * - 安全 shim 在脚本执行前拦截 Storage 访问，返回内存级 mock，避免工具白屏崩溃
 */

// ---- 危险调用模式（仅用于扫描告警，不修改代码） ----

interface DangerousPattern {
  /** 正则表达式 */
  regex: RegExp;
  /** 危险等级 */
  level: "high" | "medium" | "info";
  /** 中文说明 */
  label: string;
}

const DANGEROUS_PATTERNS: DangerousPattern[] = [
  {
    regex: /\bfetch\s*\(/g,
    level: "high",
    label: "fetch() 网络请求",
  },
  {
    regex: /\bXMLHttpRequest\b/g,
    level: "high",
    label: "XMLHttpRequest 网络请求",
  },
  {
    regex: /\bnew\s+WebSocket\s*\(/g,
    level: "high",
    label: "WebSocket 连接",
  },
  {
    regex: /\bEventSource\s*\(/g,
    level: "high",
    label: "EventSource (SSE) 连接",
  },
  {
    regex: /\blocalStorage\b/g,
    level: "info",
    label: "localStorage 数据持久化（记忆功能）",
  },
  {
    regex: /\bsessionStorage\b/g,
    level: "info",
    label: "sessionStorage 临时存储（刷新后不保留）",
  },
  {
    regex: /\bdocument\.cookie\b/g,
    level: "high",
    label: "document.cookie 读取",
  },
  {
    regex: /\bindexedDB\b/g,
    level: "high",
    label: "IndexedDB 数据库",
  },
  {
    regex: /\bnavigator\.sendBeacon\s*\(/g,
    level: "high",
    label: "navigator.sendBeacon() 数据外发",
  },
  {
    regex: /\bwindow\.postMessage\s*\(/g,
    level: "medium",
    label: "window.postMessage() 跨窗口通信",
  },
  {
    regex: /\bwindow\.open\s*\(/g,
    level: "medium",
    label: "window.open() 弹窗",
  },
  {
    regex: /\beval\s*\(/g,
    level: "high",
    label: "eval() 动态执行",
  },
  {
    regex: /\bnew\s+Function\s*\(/g,
    level: "high",
    label: "new Function() 动态执行",
  },
  {
    regex: /\bdocument\.write\s*\(/g,
    level: "medium",
    label: "document.write()",
  },
];

export interface SanitizeResult {
  warnings: { level: "high" | "medium" | "info"; label: string; count: number }[];
}

/**
 * 扫描代码中的危险调用，仅返回告警列表。
 * 注意：不修改代码本身——实际限制由 sandbox + CSP meta 在浏览器层面强制执行。
 */
export function scanDangerousCode(code: string): SanitizeResult {
  const warnings: SanitizeResult["warnings"] = [];

  for (const pattern of DANGEROUS_PATTERNS) {
    // 只扫描 <script> 标签内的内容
    const scriptMatches = extractScriptContent(code);
    let totalCount = 0;

    for (const scriptContent of scriptMatches) {
      const matches = scriptContent.match(pattern.regex);
      if (matches) totalCount += matches.length;
    }

    if (totalCount > 0) {
      warnings.push({
        level: pattern.level,
        label: pattern.label,
        count: totalCount,
      });
    }
  }

  return { warnings };
}

/**
 * 提取所有 <script> 标签内的代码内容（支持内联和外部引用提示）
 */
function extractScriptContent(html: string): string[] {
  const results: string[] = [];
  // 匹配 <script ...>...</script> 内的内容
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = scriptRegex.exec(html)) !== null) {
    results.push(match[1]);
  }

  // 也检查内联事件属性中的代码
  const inlineRegex = /\bon\w+\s*=\s*"([^"]*)"|\bon\w+\s*=\s*'([^']*)'/gi;
  while ((match = inlineRegex.exec(html)) !== null) {
    const content = match[1] || match[2];
    if (content) results.push(content);
  }

  return results;
}

// ---- 安全的 srcDoc 包装 ----

/**
 * 安全 shim 脚本：在用户代码执行前注入，拦截 Storage / cookie 访问。
 *
 * 为什么需要 shim：
 * - sandbox="allow-scripts"（无 allow-same-origin）使 iframe 获得 null origin
 * - 此环境下 localStorage / sessionStorage / document.cookie 全部抛 SecurityError
 * - 很多工具代码直接调用 localStorage，不做 try-catch，会导致脚本中断、白屏
 * - shim 在脚本执行前将 Storage 替换为内存级 mock，静默降级
 */
const SECURITY_SHIM = `<script>
(function(){
  // ===== 警告横幅 =====
  var _bannerShown = false;
  function _showBanner(msg) {
    if (_bannerShown) return;
    _bannerShown = true;
    var b = document.createElement('div');
    b.textContent = msg || '\u26a0 \u8be5\u5de5\u5177\u5c1d\u8bd5\u4f7f\u7528\u4e86\u4e0d\u88ab\u652f\u6301\u7684\u529f\u80fd';
    b.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#dc2626;color:#fff;padding:6px 14px;text-align:center;font-size:12px;font-family:system-ui,-apple-system,sans-serif;line-height:1.4;pointer-events:none;';
    document.body.insertBefore(b, document.body.firstChild);
    setTimeout(function(){ b.style.opacity = '0.6'; }, 4000);
  }
  // v2.0.0 权限透明反馈：越权调用给出具体权限提示（不再只是笼统警告）
  // fetch 拦截
  try {
    var _origFetch = window.fetch;
    window.fetch = function() { _showBanner('\u26a0 \u6b64\u5de5\u5177\u6ca1\u6709\u8054\u7f51\u6743\u9650\uff0c\u7f51\u7edc\u8bf7\u6c42\u5df2\u88ab\u62e6\u622a'); return _origFetch.apply(this, arguments); };
  } catch(_) {}
  // XMLHttpRequest 拦截
  try {
    var _OrigXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() { _showBanner('\u26a0 \u6b64\u5de5\u5177\u6ca1\u6709\u8054\u7f51\u6743\u9650\uff0c\u7f51\u7edc\u8bf7\u6c42\u5df2\u88ab\u62e6\u622a'); return new _OrigXHR(); };
    window.XMLHttpRequest.prototype = _OrigXHR.prototype;
  } catch(_) {}
  // WebSocket 拦截
  try {
    var _OrigWS = window.WebSocket;
    window.WebSocket = function() { _showBanner('\u26a0 \u6b64\u5de5\u5177\u6ca1\u6709\u8054\u7f51\u6743\u9650\uff0c\u7f51\u7edc\u8fde\u63a5\u5df2\u88ab\u62e6\u622a'); return new _OrigWS(); };
    window.WebSocket.prototype = _OrigWS.prototype;
  } catch(_) {}
  // EventSource 拦截
  try {
    var _OrigES = window.EventSource;
    window.EventSource = function() { _showBanner('\u26a0 \u6b64\u5de5\u5177\u6ca1\u6709\u8054\u7f51\u6743\u9650\uff0c\u5b9e\u65f6\u8fde\u63a5\u5df2\u88ab\u62e6\u622a'); return new _OrigES(); };
    window.EventSource.prototype = _OrigES.prototype;
  } catch(_) {}
  // 系统通知拦截（沙盒内 Notification 不可用，给出明确提示而非报错）
  try {
    window.Notification = function() { _showBanner('\u26a0 \u6b64\u5de5\u5177\u6ca1\u6709\u7cfb\u7edf\u901a\u77e5\u6743\u9650'); return { permission: 'denied', close: function(){} }; };
    window.Notification.permission = 'denied';
    window.Notification.requestPermission = function() { return Promise.resolve('denied'); };
  } catch(_) {}
  // 外部跳转/弹窗拦截
  try {
    var _OrigOpen = window.open;
    window.open = function() { _showBanner('\u26a0 \u6b64\u5de5\u5177\u6ca1\u6709\u5916\u90e8\u8df3\u8f6c\u6743\u9650\uff0c\u5f39\u7a97\u5df2\u88ab\u62e6\u622a'); return null; };
  } catch(_) {}
  // sendBeacon 拦截
  try {
    var _OrigBeacon = navigator.sendBeacon;
    navigator.sendBeacon = function() { _showBanner('\u26a0 \u6b64\u5de5\u5177\u6ca1\u6709\u8054\u7f51\u6743\u9650\uff0c\u6570\u636e\u4e0a\u4f20\u5df2\u88ab\u62e6\u622a'); return false; };
  } catch(_) {}

  // ===== 持久化 Storage mock — 拦截 null-origin 下的 SecurityError，并自动同步到父页面 =====
  // localStorage 数据会防抖同步给父页面保存（登录用户上云 / 游客本地墓碑），
  // 刷新或全屏后由父页面注入快照恢复，实现『墓碑机制』。
  function createMemoryStorage(syncToParent) {
    var data = {};
    // 预置快照：父页面在 srcdoc 中同步注入的 __wewooLsSeed__（墓碑/云端记忆）
    if (syncToParent && window.__wewooLsSeed__ && typeof window.__wewooLsSeed__ === 'object') {
      var _seed = window.__wewooLsSeed__;
      for (var _sk in _seed) {
        if (Object.prototype.hasOwnProperty.call(_seed, _sk)) data[_sk] = String(_seed[_sk]);
      }
    }
    var _timer = null;
    function _schedule() {
      if (!syncToParent) return;
      if (_timer) clearTimeout(_timer);
      _timer = setTimeout(function() {
        _timer = null;
        try { window.parent.postMessage({ type: 'WEWOO_LS_SYNC', data: JSON.stringify(data) }, '*'); } catch(_) {}
      }, 800);
    }
    var api = {
      getItem: function(k) { return Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null; },
      setItem: function(k, v) { data[k] = String(v); _schedule(); },
      removeItem: function(k) { delete data[k]; _schedule(); },
      clear: function() { data = {}; _schedule(); },
      key: function(i) { return Object.keys(data)[i] || null; },
      get length() { return Object.keys(data).length; }
    };
    // 供父页面注入快照
    api._applySnapshot = function(snap) {
      if (!snap || typeof snap !== 'object') return;
      var k;
      for (k in snap) { if (Object.prototype.hasOwnProperty.call(snap, k)) data[k] = String(snap[k]); }
    };
    // 页面卸载前立即同步，避免防抖窗口内的写入丢失
    try {
      window.addEventListener('pagehide', function() {
        if (_timer) { clearTimeout(_timer); _timer = null; }
        if (syncToParent) { try { window.parent.postMessage({ type: 'WEWOO_LS_SYNC', data: JSON.stringify(data) }, '*'); } catch(_) {} }
      });
    } catch(_) {}
    return api;
  }
  try { if (!window.localStorage) throw 1; var _t = window.localStorage.getItem('_test'); }
  catch(e) { try { Object.defineProperty(window, 'localStorage', { value: createMemoryStorage(true), writable: false, configurable: false }); } catch(_){} }
  try { if (!window.sessionStorage) throw 1; var _t2 = window.sessionStorage.getItem('_test'); }
  catch(e) { try { Object.defineProperty(window, 'sessionStorage', { value: createMemoryStorage(false), writable: false, configurable: false }); } catch(_){} }
  // 暴露快照注入入口（STORAGE_API / 父页面使用）
  try {
    window.__wewooLsApply__ = function(snap) {
      try { if (window.localStorage && window.localStorage._applySnapshot) window.localStorage._applySnapshot(snap); } catch(_) {}
    };
  } catch(_) {}
  // 父页面注入的快照：到达后立即应用到 localStorage 内存（早于用户脚本读取）
  try {
    window.addEventListener('message', function(e) {
      if (!e.data) return;
      // 全屏模式滚动位置保持：进入全屏前读取 / 退出全屏后恢复
      if (e.data.type === 'WEWOO_GET_SCROLL') {
        try { e.source.postMessage({ type: 'WEWOO_SCROLL', y: (window.pageYOffset || document.documentElement.scrollTop || 0) }, '*'); } catch(_) {}
        return;
      }
      if (e.data.type === 'WEWOO_SET_SCROLL') {
        try { window.scrollTo(0, Math.max(0, Number(e.data.y) || 0)); } catch(_) {}
        return;
      }
      if (e.data.type !== 'WEWOO_STATE_INJECT') return;
      if (e.data.state && e.data.state._ls) {
        try { window.__wewooLsApply__ && window.__wewooLsApply__(e.data.state._ls); } catch(_) {}
      }
    });
  } catch(_) {}
  // cookie — 返回空字符串，设置时静默忽略，也会触发横幅
  try { Object.defineProperty(document, 'cookie', { get: function(){ _showBanner(); return ''; }, set: function(){ _showBanner(); }, configurable: true }); } catch(_){}
  // indexedDB — 返回 undefined
  try { Object.defineProperty(window, 'indexedDB', { value: undefined, configurable: true }); } catch(_){}
  // 如果 indexedDB 被访问过，拦截 open
  var _origIDBOpen = window.indexedDB && window.indexedDB.open;
  if (_origIDBOpen) {
    try { window.indexedDB.open = function() { _showBanner(); return _origIDBOpen.apply(window.indexedDB, arguments); }; } catch(_) {}
  }
})();
<\/script>`;

const STORAGE_API = `<script>
(function(){
  var _callbacks = {};
  var _cbId = 0;
  // v2.1.1：AI 调用失败的非侵入式顶部提示（即使工具不处理回调错误也能看到）
  var _aiBanner = null;
  function _showAiError(msg) {
    try {
      if (!_aiBanner) {
        _aiBanner = document.createElement('div');
        _aiBanner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#d97706;color:#fff;padding:8px 14px;text-align:center;font-size:13px;font-family:system-ui,-apple-system,sans-serif;line-height:1.5;pointer-events:none;box-shadow:0 2px 8px rgba(0,0,0,.2);';
        (document.body || document.documentElement).appendChild(_aiBanner);
      }
      _aiBanner.textContent = msg || 'AI 调用失败，请稍后重试';
      _aiBanner.style.display = 'block';
      clearTimeout(_aiBanner.__t);
      _aiBanner.__t = setTimeout(function() { if (_aiBanner) _aiBanner.style.display = 'none'; }, 5000);
    } catch(_) {}
  }
  function _send(msg, cb) {
    var id = ++_cbId;
    if (cb) _callbacks[id] = cb;
    msg._id = id;
    try { window.parent.postMessage(msg, '*'); } catch(_) {}
  }
  window.addEventListener('message', function(e) {
    if (!e.data) return;
    // v1.11.1: 父页面监听器可能晚于本 iframe 的一次性 READY 挂载（iOS Safari srcdoc 同步加载），
    // 收到 WEWOO_PING 时补发 READY，避免 12 秒误报「语法错误」
    if (e.data.type === 'WEWOO_PING') {
      try { window.parent.postMessage({ type: 'WEWOO_READY' }, '*'); } catch(_) {}
    }
    // 回调匹配（父页面响应，带 _id；loadState 的 WEWOO_STATE_INJECT 回复也带 _id）
    if (e.data._id !== undefined) {
      var cb = _callbacks[e.data._id];
      if (cb) { delete _callbacks[e.data._id]; cb(e.data.error, e.data.value); }
    }
    // 状态注入：回填已保存的表单数据（父页面 READY 注入无 _id，loadState 回复带 _id）
    if (e.data.type === 'WEWOO_STATE_INJECT' && e.data.state) {
      var state = e.data.state;
      if (state._draft) {
        Object.keys(state._draft).forEach(function(k) {
          try {
            var el = document.querySelector('[name="' + k + '"]') || document.getElementById(k);
            if (el) {
              if (el.type==='checkbox') el.checked = state._draft[k];
              else if (el.type==='radio') { if (state._draft[k] === el.value) el.checked = true; }
              else el.value = state._draft[k] || '';
            }
          } catch(_) {}
        });
      }
    }
  });
  try { _send({ type: 'WEWOO_READY' }); } catch(_) {}
  // 延迟加载状态（等待 DOM 渲染完成后再回填输入值）
  setTimeout(function() { try { window.__wewoo.loadState(); } catch(_) {} }, 600);
  window.__wewoo = {
    save: function(key, value, cb) {
      _send({ type: 'WEWOO_SAVE', key: key, value: JSON.stringify(value) }, cb || function(){});
    },
    load: function(key, cb) {
      _send({ type: 'WEWOO_LOAD', key: key }, function(err, val) {
        if (cb) try { cb(null, val ? JSON.parse(val) : null); } catch(_) { cb(null, val); }
      });
    },
    remove: function(key, cb) {
      _send({ type: 'WEWOO_REMOVE', key: key }, cb || function(){});
    },
    list: function(cb) {
      _send({ type: 'WEWOO_LIST' }, function(err, keys) { cb(null, keys || []); });
    },
    clear: function(cb) {
      _send({ type: 'WEWOO_CLEAR' }, cb || function(){});
    },
    // 草稿：保存当前所有输入框的值
    saveDraft: function(cb) {
      var data = {}; var els = document.querySelectorAll('input,textarea,select');
      els.forEach(function(el) {
        var k = el.name || el.id || ('_idx' + Array.prototype.slice.call(el.parentElement.children).indexOf(el));
        if (el.type==='checkbox') data[k] = el.checked;
        else if (el.type==='radio') { if (el.checked) data[k] = el.value; }
        else data[k] = el.value;
      });
      _send({ type: 'WEWOO_DRAFT_SAVE', data: JSON.stringify(data) }, cb || function(){});
    },
    // 草稿：回填已保存的草稿到输入框
    loadDraft: function(cb) {
      _send({ type: 'WEWOO_DRAFT_LOAD' }, function(err, val) {
        var data = val ? JSON.parse(val) : null;
        if (data) {
          Object.keys(data).forEach(function(k) {
            try {
              var el = document.querySelector('[name="' + k + '"]') || document.getElementById(k);
              if (el) {
                if (el.type==='checkbox') el.checked = data[k];
                else if (el.type==='radio') { if (data[k] === el.value) el.checked = true; }
                else el.value = data[k] || '';
              }
            } catch(_) {}
          });
        }
        if (cb) cb(null, data);
      });
    },
    // 动作记录
    recordAction: function(action, inputData, cb) {
      _send({ type: 'WEWOO_ACTION_RECORD', action: action, data: JSON.stringify(inputData || {}) }, cb || function(){});
    },
    // 获取历史
    getHistory: function(cb) {
      _send({ type: 'WEWOO_HISTORY_GET' }, function(err, val) {
        if (cb) cb(null, val ? JSON.parse(val) : []);
      });
    },
    // 保存工具状态（所有表单数据）
    saveState: function(cb) {
      var data = {}; var els = document.querySelectorAll('input,textarea,select');
      els.forEach(function(el) {
        var k = el.name || el.id || ('_idx' + Array.prototype.slice.call(el.parentElement.children).indexOf(el));
        if (el.type==='checkbox') data[k] = el.checked;
        else if (el.type==='radio') { if (el.checked) data[k] = el.value; }
        else data[k] = el.value;
      });
      _send({ type: 'WEWOO_STATE_SAVE', data: JSON.stringify(data) }, cb || function(){});
    },
    // 恢复工具状态
    loadState: function(cb) {
      _send({ type: 'WEWOO_STATE_LOAD' }, function(err, val) {
        var data = val ? JSON.parse(val) : null;
        if (data) {
          Object.keys(data).forEach(function(k) {
            try {
              var el = document.querySelector('[name="' + k + '"]') || document.getElementById(k);
              if (el) {
                if (el.type==='checkbox') el.checked = data[k];
                else if (el.type==='radio') { if (data[k] === el.value) el.checked = true; }
                else el.value = data[k] || '';
              }
            } catch(_) {}
          });
        }
        if (cb) cb(null, data);
      });
    },
    // ---- v2.0.3 M2 零风险 API：剪贴板/文件导出/分享/用户信息/语音朗读 ----
    copyText: function(text, cb) {
      _send({ type: 'WEWOO_COPY_TEXT', text: String(text == null ? '' : text) }, cb || function(){});
    },
    download: function(filename, content, mime, cb) {
      if (typeof mime === 'function') { cb = mime; mime = 'text/plain'; }
      _send({ type: 'WEWOO_DOWNLOAD', filename: String(filename || 'download.txt'), content: String(content == null ? '' : content), mime: String(mime || 'text/plain') }, cb || function(){});
    },
    share: function(opts, cb) {
      opts = opts || {};
      _send({ type: 'WEWOO_SHARE', title: String(opts.title || ''), text: String(opts.text || ''), url: String(opts.url || '') }, cb || function(){});
    },
    getUser: function(cb) {
      _send({ type: 'WEWOO_USER_GET' }, function(err, val) {
        if (cb) cb(null, val ? JSON.parse(val) : null);
      });
    },
    speak: function(text, opts, cb) {
      if (typeof opts === 'function') { cb = opts; opts = {}; }
      opts = opts || {};
      try {
        if (!window.speechSynthesis) { if (cb) cb('unsupported'); return; }
        var u = new SpeechSynthesisUtterance(String(text == null ? '' : text));
        u.lang = opts.lang || 'zh-CN';
        if (opts.rate) u.rate = Number(opts.rate);
        if (opts.pitch) u.pitch = Number(opts.pitch);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
        if (cb) cb(null, 'ok');
      } catch(e) { if (cb) cb(String((e && e.message) || 'error')); }
    },
    // ---- v2.24.0：拍照/上传图片（input type=file + FileReader，不走 getUserMedia，回调 (err, {dataUrl,name,type,size})） ----
    pickImage: function(opts, cb) {
      if (typeof opts === 'function') { cb = opts; opts = {}; }
      opts = opts || {};
      try {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        if (opts.capture) input.setAttribute('capture', 'environment');
        input.style.display = 'none';
        document.body.appendChild(input);
        input.onchange = function() {
          var f = input.files && input.files[0];
          try { document.body.removeChild(input); } catch(_) {}
          if (!f) { if (cb) cb('未选择图片', null); return; }
          var reader = new FileReader();
          reader.onload = function() {
            if (cb) cb(null, { dataUrl: String(reader.result), name: f.name, type: f.type, size: f.size });
          };
          reader.onerror = function() { if (cb) cb('图片读取失败', null); };
          reader.readAsDataURL(f);
        };
        input.click();
      } catch(e) { if (cb) cb(String((e && e.message) || 'error'), null); }
    },
    // ---- v2.1.0 M3：白名单联网代理（仅白名单域名 + GET，回调 (err, {status,data,contentType})） ----
    fetch: function(url, opts, cb) {
      if (typeof opts === 'function') { cb = opts; opts = {}; }
      opts = opts || {};
      _send({
        type: 'WEWOO_FETCH',
        url: String(url || ''),
        method: String((opts.method || 'GET').toUpperCase()),
        body: opts.body != null ? String(opts.body) : ''
      }, function(err, val) {
        if (cb) {
          if (err) { cb(err); return; }
          try { cb(null, val ? JSON.parse(val) : null); } catch(_) { cb(null, val); }
        }
      });
    },
    // ---- v2.1.0 M3：工具内 AI 网关（回调 (err, {reply[, json]})；支持字符串或 { prompt, context, history, maxTokens, json } 调用） ----
    ai: {
      chat: function(input, opts, cb) {
        if (typeof opts === 'function') { cb = opts; opts = {}; }
        opts = opts || {};
        var prompt = '';
        var context = '';
        var history = [];
        var maxTokens = 0;
        var wantJson = false;
        var image = null;
        if (input != null && typeof input === 'object') {
          prompt = String(input.prompt || '');
          context = String(input.context != null ? input.context : '');
          history = Array.isArray(input.history) ? input.history : (Array.isArray(opts.history) ? opts.history : []);
          maxTokens = input.maxTokens != null ? Number(input.maxTokens) : (opts.maxTokens != null ? Number(opts.maxTokens) : 0);
          wantJson = input.json != null ? !!input.json : !!opts.json;
          image = typeof input.image === 'string' ? input.image : (typeof opts.image === 'string' ? opts.image : null);
        } else {
          prompt = String(input || '');
          context = String(opts.context != null ? opts.context : '');
          history = Array.isArray(opts.history) ? opts.history : [];
          maxTokens = opts.maxTokens != null ? Number(opts.maxTokens) : 0;
          wantJson = !!opts.json;
          image = typeof opts.image === 'string' ? opts.image : null;
        }
        _send({
          type: 'WEWOO_AI_CHAT',
          prompt: prompt.slice(0, 2000),
          context: context.slice(0, 4000),
          history: history,
          maxTokens: maxTokens > 0 ? maxTokens : undefined,
          json: wantJson,
          image: image
        }, function(err, val) {
          if (err) { _showAiError(String(err)); }
          if (cb) {
            if (err) { cb(err); return; }
            try { cb(null, val ? JSON.parse(val) : null); } catch(_) { cb(null, val); }
          }
        });
      }
    }
  };

  // 自动监听输入变化 — 防抖 800ms 保存草稿，5s 保存状态
  var _draftTimer = null;
  var _stateTimer = null;
  function _onInputChange() {
    clearTimeout(_draftTimer);
    clearTimeout(_stateTimer);
    _draftTimer = setTimeout(function() { window.__wewoo.saveDraft(); }, 800);
    _stateTimer = setTimeout(function() { window.__wewoo.saveState(); }, 5000);
  }
  function _attachInputListeners(el) {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
      try {
        el.addEventListener('input', _onInputChange);
        el.addEventListener('change', _onInputChange);
        el.setAttribute('data-wewoo-monitored', '1');
      } catch(_) {}
    }
    if (el.children) for (var i = 0; i < el.children.length; i++) _attachInputListeners(el.children[i]);
  }

  // 按钮点击记录
  var _actionKeywords = /计算|记录|添加|保存|喝|打卡|提交|确认|记|算|开始|转换|生成|查|搜索|设置|改名|修改/;
  document.addEventListener('click', function(e) {
    var target = e.target;
    while (target && target !== document.body) {
      if (target.tagName === 'BUTTON' || (target.tagName === 'A' && target.getAttribute('role') === 'button')) {
        try {
          var action = target.getAttribute('data-wewoo-action') || target.textContent.replace(/\\s+/g,'').substring(0,30);
          if (target.getAttribute('data-wewoo-action') || _actionKeywords.test(action)) {
            var inpData = {};
            var els = document.querySelectorAll('input,textarea,select');
            els.forEach(function(el) {
              var k = el.name || el.id || '';
              if (!k) return;
              if (el.type==='checkbox') inpData[k] = el.checked;
              else if (el.type==='radio') { if (el.checked) inpData[k] = el.value; }
              else inpData[k] = el.value || '';
            });
            window.__wewoo.recordAction(action, inpData);
          }
        } catch(_) {}
        break;
      }
      target = target.parentElement;
    }
  }, true);

  // 延迟监听动态创建的输入元素
  if (window.MutationObserver) {
    new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          if (added[j].nodeType === 1) _attachInputListeners(added[j]);
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
  // 初始扫描
  setTimeout(function() { _attachInputListeners(document.documentElement); }, 500);
  setTimeout(function() { _attachInputListeners(document.documentElement); }, 2000);
})();
<\/script>`;

/**
 * 非侵入式错误提示：顶部小横幅，不阻断交互。
 * 1. 隐藏的横幅元素（仅出错时显示）
 * 2. window.onerror 捕获运行时错误
 * 3. 8 秒超时检测 body 是否有点击/触摸事件
 */
const ERROR_FALLBACK = `<div id="wewoo-err-msg" style="display:none;position:fixed;top:0;left:0;right:0;z-index:99997;background:#fef3c7;border-bottom:2px solid #f59e0b;padding:6px 16px;font-family:system-ui,-apple-system,sans-serif;text-align:center;font-size:13px;color:#92400e;">
  \u26a0\ufe0f \u8be5\u5de5\u5177\u53ef\u80fd\u5305\u542b\u9519\u8bef\uff0c\u90e8\u5206\u529f\u80fd\u53ef\u80fd\u65e0\u6cd5\u6b63\u5e38\u4f7f\u7528
  <button onclick="document.getElementById('wewoo-err-msg').style.display='none'" style="margin-left:12px;background:none;border:1px solid #f59e0b;color:#92400e;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:12px;">\u00d7</button>
</div>
<script>
(function(){
  var ERR_EL_ID = 'wewoo-err-msg';
  function _showErr() {
    var el = document.getElementById(ERR_EL_ID);
    if (el) { el.style.display = 'block'; }
  }
  // 捕获运行时错误（语法错误无法捕获，但能兜底大部分场景）
  var _origOnerror = window.onerror;
  window.onerror = function(msg, src, line, col, err) {
    _showErr();
    if (_origOnerror) return _origOnerror.apply(this, arguments);
    return true;
  };
  // 超时检测：8 秒后检查页面是否有实际内容
  setTimeout(function() {
    var body = document.body;
    if (!body) return;
    // 统计非系统元素
    var children = body.children;
    var visibleCount = 0;
    for (var i = 0; i < children.length; i++) {
      var c = children[i];
      if (c.id === ERR_EL_ID) continue;
      if (c.tagName === 'SCRIPT' || c.tagName === 'STYLE') continue;
      visibleCount++;
    }
    if (visibleCount === 0) { _showErr(); return; }
    // 二次检查：innerHTML 是否几乎为空（排除 banner 提示和我们的脚本）
    var html = (body.innerHTML || '').replace(/<script[^>]*>[\\s\\S]*?<\\/script>/gi, '').replace(/<style[^>]*>[\\s\\S]*?<\\/style>/gi, '').replace(/\\s/g, '');
    if (html.length < 80) { _showErr(); }
  }, 8000);
})();
<\/script>`;

/**
 * 在用户代码中注入安全头部，返回可直接用于 iframe 的字符串。
 *
 * 注入内容（按顺序）：
 * 1. CSP <meta> 标签 — 浏览器级权限限制
 * 2. 安全 shim 脚本 — Storage / cookie 静默降级
 * 3. 错误检测 fallback — 5 秒白屏检测 + onerror 兜底
 */
export function wrapSecureSrcDoc(rawCode: string, lsSeed?: Record<string, string> | null): string {
  const cspMeta =
    '<meta http-equiv="Content-Security-Policy" content="' +
    "default-src 'none'; " +
    "style-src 'unsafe-inline'; " +
    "script-src 'unsafe-inline' blob:; " +
    "img-src data: https:; " +
    "font-src 'none'; " +
    "connect-src 'none'; " +
    "frame-src 'none'; " +
    "worker-src blob:; " +
    "media-src 'none'; " +
    "object-src 'none'; " +
    "base-uri 'none'; " +
    "form-action 'none'" +
    '">';

  // 同步注入的 localStorage 快照：必须在用户脚本执行前被 SECURITY_SHIM 读取，
  // 使工具启动时就能读到上次保存的数据（墓碑/云端记忆）。
  const seedScript =
    lsSeed && Object.keys(lsSeed).length > 0
      ? '<script>window.__wewooLsSeed__=' + JSON.stringify(lsSeed).replace(/</g, '\\u003c') + ';<\/script>'
      : '';
  const viewportMeta = '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">';
  const resetCSS = '<style>*,*::before,*::after{box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;margin:0;padding:16px}</style>';

  let result: string;

  // 路径 1：已有 <head>
  if (/<head[\s>]/i.test(rawCode)) {
    result = rawCode;
    if (!/<meta\s+name=["']viewport["']/i.test(result)) {
      result = result.replace(/(<head[\s>][^]*?>)/i, `$1\n  ${viewportMeta}`);
    }
    result = result.replace(/(<head[\s>][^]*?>)/i, `$1\n  ${resetCSS}\n  ${cspMeta}\n  ${seedScript}${SECURITY_SHIM}
  ${STORAGE_API}`);
  }
  // 路径 2：有 <html> 但没有独立 <head>
  else if (/<html[\s>]/i.test(rawCode)) {
    result = rawCode.replace(
      /(<html[\s>][^]*?>)/i,
      `$1\n<head>\n  <meta charset="UTF-8">\n  ${viewportMeta}\n  ${resetCSS}\n  ${cspMeta}\n  ${seedScript}${SECURITY_SHIM}
  ${STORAGE_API}\n</head>`
    );
  }
  // 路径 3：完全裸的代码片段
  else {
    result = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  ${viewportMeta}
  ${cspMeta}
  ${resetCSS}
</head>
<body>
  ${seedScript}${SECURITY_SHIM}
  ${STORAGE_API}
${rawCode}
</body>
</html>`;
  }

  // 统一在 </body> 前注入错误检测 fallback
  return result.replace(/<\/body>/i, ERROR_FALLBACK + '\n</body>');
}

// ---- 安全的 sandbox 属性值 ----

/**
 * iframe sandbox 属性值。
 *
 * allow-scripts: 允许 JavaScript 执行（工具必须）
 *
 * 明确禁止：
 * - allow-same-origin: 防止 iframe 访问父页面 cookie / localStorage / 同源 API
 * - allow-forms: 防止表单提交
 * - allow-popups: 防止 window.open 弹窗
 * - allow-top-navigation: 防止 iframe 劫持父窗口跳转
 * - allow-modals: 防止 alert/confirm/prompt 干扰
 *
 * 副作用：localStorage / sessionStorage / cookie 在 null-origin 下抛错，
 * 由 SECURITY_SHIM 静默降级为内存 mock。
 */
export const IFRAME_SANDBOX = "allow-scripts";
