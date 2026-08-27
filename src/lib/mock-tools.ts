/**
 * 内置工具与基础类型/常量（v1.7.0 从 data.ts 拆分，保持导出兼容）
 *
 * - Tool / ToolCategory / Visibility / Favorite / Review 类型
 * - CATEGORIES 分类常量
 * - MOCK_TOOLS 18 个内置工具
 * - MOCK_REVIEWS + getMockReviews / setMockReviews（内置工具评论，localStorage 持久化）
 */
// ---- Types ----

export type ToolCategory = "旅行" | "工程计算" | "生活" | "教育" | "小游戏";

export type Visibility = "public" | "unlisted" | "private";

export interface Tool {
  id: string;
  title: string;
  author: string;
  authorId?: string;
  category: ToolCategory;
  code: string;
  thumbnailGradient: string;
  coverUrl?: string;
  createdAt: string;
  description?: string;
  sourceToolId?: string;
  sourceTool?: { id: string; title: string; author: string };
  viewCount?: number;
  visibility: Visibility;
  isDownloadable?: boolean;
  /** v2.0.1：平台下架标记（公共列表过滤；详情页非作者显示已下架） */
  isBanned?: boolean;
  /** v2.11.0：设备适配目标（mobile 移动端优先 / desktop 电脑端优先，旧工具默认 mobile） */
  layoutTarget?: "mobile" | "desktop";
}

export interface Favorite {
  toolId: string;
  userId: string;
  createdAt: string;
}

export interface Review {
  id: string;
  toolId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  content: string;
  createdAt: string;
  // v1.14.0 评论系统完善
  parentId?: string | null; // 回复的父评论 id
  replyToName?: string | null; // 回复对象昵称
  avatarUrl?: string | null; // 评论者头像
  imageUrl?: string | null; // 评论配图
  likeCount?: number; // 点赞数（最热排序用）
}

export const CATEGORIES: { key: string; label: string; icon: string }[] = [
  { key: "全部", label: "全部", icon: "🏠" },
  { key: "旅行", label: "旅行出门", icon: "✈️" },
  { key: "工程计算", label: "工程计算", icon: "🔧" },
  { key: "生活", label: "生活日常", icon: "🏡" },
  { key: "教育", label: "课堂互动", icon: "📚" },
  { key: "小游戏", label: "小游戏", icon: "🎮" },
];

// ---- Mock data ----

export const MOCK_TOOLS: Tool[] = [
  {
    id: "1",
    title: "旅行分账计算器",
    author: "旅行达人小明",
    authorId: "user-001",
    category: "旅行",
    visibility: "public",
    code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>旅行分账计算器</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(160deg,#eef2ff,#f5f3ff);min-height:100vh;padding:16px;color:#1e293b}
  .wrap{max-width:420px;margin:0 auto}
  h1{font-size:20px;font-weight:800;color:#4c1d95;text-align:center;margin-bottom:2px}
  .sub{font-size:12px;color:#94a3b8;text-align:center;margin-bottom:14px}
  .card{background:#fff;border-radius:16px;padding:16px;margin-bottom:12px;box-shadow:0 4px 16px rgba(76,29,149,.08)}
  .card h3{font-size:14px;color:#4c1d95;margin-bottom:10px}
  .row{display:flex;gap:8px;align-items:center;margin-bottom:10px}
  .row label{font-size:13px;color:#64748b;flex-shrink:0;width:56px}
  .row input{flex:1;min-height:44px;padding:0 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:16px;outline:none;background:#f8fafc}
  .row input:focus{border-color:#7c3aed;background:#fff}
  .btn{min-height:46px;border:0;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;transition:transform .1s}
  .btn:active{transform:scale(.97)}
  .btn-primary{width:100%;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff}
  .btn-mini{min-height:38px;padding:0 12px;font-size:13px;font-weight:600;border-radius:9px;background:#ede9fe;color:#6d28d9}
  .result{display:none;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border-radius:16px;padding:16px;text-align:center;margin-bottom:12px}
  .result.show{display:block}
  .result .big{font-size:32px;font-weight:800;margin:4px 0}
  .result .exact{font-size:12px;opacity:.85}
  .item{display:flex;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid #f1f5f9;font-size:14px}
  .item:last-child{border-bottom:0}
  .item .name{flex:1;color:#334155}
  .item .cost{font-weight:700;color:#7c3aed}
  .item button{min-width:34px;min-height:34px;border:0;border-radius:8px;background:#fee2e2;color:#dc2626;font-size:15px;cursor:pointer}
  .empty{font-size:12px;color:#cbd5e1;text-align:center;padding:8px 0}
  .tips{font-size:11px;color:#94a3b8;text-align:center;margin-top:4px}
</style>
</head>
<body>
<div class="wrap">
  <h1>💰 旅行分账计算器</h1>
  <p class="sub">数据自动保存，下次打开还在</p>

  <div class="result" id="result">
    <div>每人应付</div>
    <div class="big" id="perPerson">¥0</div>
    <div class="exact" id="exact">总额 ¥0 · 共 0 人</div>
  </div>

  <div class="card">
    <h3>基本信息</h3>
    <div class="row"><label>总花费</label><input id="amount" type="number" inputmode="decimal" placeholder="0.00" value="0"></div>
    <div class="row"><label>人数</label><input id="people" type="number" inputmode="numeric" placeholder="0" value="2"></div>
    <button class="btn btn-primary" id="calcBtn">计算每人应付</button>
  </div>

  <div class="card">
    <h3>✏️ 额外分摊项（打车 / 门票 / 房费…）</h3>
    <div class="row"><input id="itemName" placeholder="名称，如：打车"></div>
    <div class="row"><input id="itemCost" type="number" inputmode="decimal" placeholder="金额 ¥"></div>
    <button class="btn btn-primary" id="addBtn">添加分摊项</button>
    <div id="items"></div>
  </div>
  <p class="tips">微坞会自动记住你填的数据，刷新 / 全屏 / 重新进入都不丢</p>
</div>
<script>
var KEY = "wewoo-travel-split";
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}}
function save(){localStorage.setItem(KEY, JSON.stringify(data))}
var data = load();
if(!Array.isArray(data.items)) data.items = [];
if(typeof data.amount !== "number") data.amount = 0;
if(typeof data.people !== "number") data.people = 2;

var amountEl=document.getElementById("amount"), peopleEl=document.getElementById("people");
var itemNameEl=document.getElementById("itemName"), itemCostEl=document.getElementById("itemCost");

function renderItems(){
  var box=document.getElementById("items");
  if(data.items.length===0){box.innerHTML='<div class="empty">还没有分摊项，添加一笔试试</div>';return}
  box.innerHTML="";
  data.items.forEach(function(it,i){
    var d=document.createElement("div");d.className="item";
    d.innerHTML='<span class="name">'+it.name+'</span><span class="cost">¥'+Number(it.cost).toFixed(2)+'</span>';
    var b=document.createElement("button");b.textContent="×";b.onclick=function(){data.items.splice(i,1);save();renderItems();calc();};
    d.appendChild(b);box.appendChild(d);
  });
}
function calc(){
  var a=parseFloat(amountEl.value)||0;
  var p=parseInt(peopleEl.value)||1;
  if(p<1)p=1;
  var extra=data.items.reduce(function(s,it){return s+(parseFloat(it.cost)||0)},0);
  var total=a+extra;
  var per=total/p;
  document.getElementById("result").classList.add("show");
  document.getElementById("perPerson").textContent="¥ "+Math.ceil(per);
  document.getElementById("exact").textContent="总额 ¥"+total.toFixed(2)+"（含分摊 ¥"+extra.toFixed(2)+"）· 共 "+p+" 人";
}
function remember(){
  data.amount=parseFloat(amountEl.value)||0;
  data.people=parseInt(peopleEl.value)||2;
  save();
}
document.getElementById("calcBtn").onclick=function(){calc();remember();};
document.getElementById("addBtn").onclick=function(){
  var n=itemNameEl.value.trim(), c=parseFloat(itemCostEl.value)||0;
  if(!n){itemNameEl.focus();return}
  if(c<=0){itemCostEl.focus();return}
  data.items.push({name:n,cost:c});
  save();
  itemNameEl.value="";itemCostEl.value="";
  renderItems();calc();
};
amountEl.value=data.amount||"";peopleEl.value=data.people;
renderItems();
if(data.items.length>0||data.amount>0)calc();
</script>
</body>
</html>`,
    thumbnailGradient: "linear-gradient(135deg, #667eea, #764ba2)",
    createdAt: "2026-07-20T10:30:00Z",
    description: "和朋友们一起旅行，快速算出每人该付多少钱",
  },
  {
    id: "2",
    title: "螺栓强度校核",
    author: "老王机械师",
    authorId: "user-002",
    category: "工程计算",
    visibility: "public",
    code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>螺栓强度校核</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(160deg,#fff7ed,#fef2f2);min-height:100vh;padding:16px;color:#1e293b}
  .wrap{max-width:420px;margin:0 auto}
  h1{font-size:20px;font-weight:800;color:#9a3412;text-align:center;margin-bottom:2px}
  .sub{font-size:12px;color:#94a3b8;text-align:center;margin-bottom:14px}
  .card{background:#fff;border-radius:16px;padding:16px;margin-bottom:12px;box-shadow:0 4px 16px rgba(154,52,18,.08)}
  .card h3{font-size:14px;color:#9a3412;margin-bottom:10px}
  .row{display:flex;gap:8px;align-items:center;margin-bottom:10px}
  .row label{font-size:13px;color:#64748b;flex-shrink:0;width:88px}
  .row input,.row select{flex:1;min-height:44px;padding:0 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:16px;outline:none;background:#f8fafc}
  .row select{font-size:15px}
  .row input:focus,.row select:focus{border-color:#ea580c;background:#fff}
  .btn{width:100%;min-height:46px;border:0;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#ea580c,#f97316);color:#fff;transition:transform .1s}
  .btn:active{transform:scale(.97)}
  .result{display:none;border-radius:16px;padding:16px;margin-bottom:12px;text-align:center}
  .result.show{display:block}
  .result.ok{background:#f0fdf4;border:1.5px solid #bbf7d0}
  .result.warn{background:#fffbeb;border:1.5px solid #fde68a}
  .result .big{font-size:26px;font-weight:800;color:#9a3412;margin:4px 0}
  .result .row2{display:flex;justify-content:space-between;font-size:13px;color:#64748b;padding:4px 0;border-bottom:1px dashed #e2e8f0}
  .result .row2:last-child{border-bottom:0}
  .result .row2 b{color:#334155}
  .tips{font-size:11px;color:#94a3b8;text-align:center;margin-top:4px}
</style>
</head>
<body>
<div class="wrap">
  <h1>🔩 螺栓强度校核</h1>
  <p class="sub">输入参数，一键计算许用应力与可承受拉力</p>
  <div class="card">
    <h3>参数输入</h3>
    <div class="row"><label>公称直径 d</label><input id="d" type="number" inputmode="decimal" placeholder="mm" value="16"></div>
    <div class="row"><label>性能等级</label><select id="grade">
      <option value="4.8">4.8 级（普通）</option>
      <option value="5.8">5.8 级</option>
      <option value="8.8" selected>8.8 级（高强）</option>
      <option value="10.9">10.9 级（高强）</option>
      <option value="12.9">12.9 级（超高强）</option>
    </select></div>
    <div class="row"><label>安全系数</label><input id="safety" type="number" inputmode="decimal" step="0.1" value="1.5"></div>
    <div class="row"><label>受拉载荷 F</label><input id="load" type="number" inputmode="decimal" placeholder="kN（可选）" value=""></div>
    <button class="btn" id="calcBtn">计算强度</button>
  </div>
  <div class="result" id="result"></div>
  <p class="tips">数据自动保存 · 载荷校核：F ≤ 许用拉力即安全</p>
</div>
<script>
var KEY="wewoo-bolt-check";
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}}
var data=load();
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
var dEl=document.getElementById("d"),gEl=document.getElementById("grade"),sEl=document.getElementById("safety"),lEl=document.getElementById("load");
if(data.d!==undefined)dEl.value=data.d;
if(data.g!==undefined)gEl.value=data.g;
if(data.s!==undefined)sEl.value=data.s;
if(data.l!==undefined)lEl.value=data.l;

function area(d){
  // 有效应力截面积 As ≈ 0.7854 * (d - 0.9382*P)^2，P 按粗牙近似；这里用公称直径简化
  return Math.PI*(d*d)/4;
}
function calc(){
  var d=parseFloat(dEl.value)||0;
  var g=gEl.value;
  var n=parseFloat(sEl.value)||1.5;
  var f=parseFloat(lEl.value)||0;
  if(d<=0){alert("请输入公称直径");return}
  if(n<=0){sEl.value=1;n=1}
  var gb=(parseInt(g.split(".")[0])*100);
  var gs=(parseInt(g.split(".")[0])*10)*parseInt(g.split(".")[1]);
  var allow=gs/n;
  var As=area(d);
  var maxKN=allow*As/1000; // 许用拉力 kN（按有效面积简化）
  var ok=true;
  var extra="";
  if(f>0){
    ok=f<=maxKN;
    extra='<div class="row2"><span>校核载荷 '+f+' kN</span><b>'+(ok?"✅ 安全":"⚠️ 超载")+'</b></div>';
  }
  var r=document.getElementById("result");
  r.className="result show "+(ok?"ok":"warn");
  r.innerHTML='<div class="big">许用应力 [σ] = '+allow.toFixed(1)+' MPa</div>'+
    '<div class="row2"><span>抗拉强度 σb</span><b>'+gb+' MPa</b></div>'+
    '<div class="row2"><span>屈服强度 σs</span><b>'+gs+' MPa</b></div>'+
    '<div class="row2"><span>许用拉力（估算）</span><b>约 '+maxKN.toFixed(1)+' kN</b></div>'+
    extra;
  data.d=d;data.g=g;data.s=n;data.l=f;save();
}
document.getElementById("calcBtn").onclick=calc;
calc();
</script>
</body>
</html>`,
    thumbnailGradient: "linear-gradient(135deg, #f093fb, #f5576c)",
    createdAt: "2026-07-19T14:00:00Z",
    description: "输入螺栓直径和材料参数，一键计算抗拉强度",
  },
  {
    id: "3",
    title: "古诗词随机抽查",
    author: "语文张老师",
    authorId: "user-003",
    category: "教育",
    visibility: "public",
    code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>古诗词随机抽查</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(160deg,#fefce8,#fff7ed);min-height:100vh;padding:16px;color:#1e293b}
  .wrap{max-width:420px;margin:0 auto}
  h1{font-size:20px;font-weight:800;color:#92400e;text-align:center;margin-bottom:2px}
  .sub{font-size:12px;color:#94a3b8;text-align:center;margin-bottom:14px}
  .stats{display:flex;gap:8px;margin-bottom:12px}
  .stat{flex:1;background:#fff;border-radius:12px;padding:10px;text-align:center;box-shadow:0 2px 8px rgba(146,64,14,.06)}
  .stat .num{font-size:20px;font-weight:800;color:#d97706}
  .stat .lbl{font-size:11px;color:#94a3b8;margin-top:2px}
  .card{background:#fff;border-radius:16px;padding:16px;box-shadow:0 4px 16px rgba(146,64,14,.08)}
  .prompt{font-size:22px;font-weight:700;color:#78350f;text-align:center;padding:18px 8px;background:#fffbeb;border-radius:12px;border:1.5px dashed #fcd34d;margin-bottom:12px}
  .mode{font-size:12px;color:#b45309;text-align:center;margin-bottom:10px}
  .input{width:100%;min-height:46px;border:1.5px solid #e2e8f0;border-radius:10px;padding:0 12px;font-size:16px;outline:none;background:#f8fafc;margin-bottom:10px}
  .input:focus{border-color:#d97706;background:#fff}
  .btn{width:100%;min-height:46px;border:0;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#d97706,#f59e0b);color:#fff;transition:transform .1s}
  .btn:active{transform:scale(.97)}
  .btn.ghost{background:#f3f4f6;color:#6b7280;margin-top:8px}
  .feedback{display:none;border-radius:12px;padding:12px;margin-top:10px;font-size:14px;text-align:center}
  .feedback.show{display:block}
  .feedback.ok{background:#f0fdf4;color:#15803d;border:1.5px solid #bbf7d0}
  .feedback.no{background:#fef2f2;color:#b91c1c;border:1.5px solid #fecaca}
  .feedback .poem{font-weight:700;margin-top:4px}
</style>
</head>
<body>
<div class="wrap">
  <h1>📜 古诗词随机抽查</h1>
  <p class="sub">考考你的诗词积累，成绩自动保存</p>
  <div class="stats">
    <div class="stat"><div class="num" id="sTotal">0</div><div class="lbl">已答</div></div>
    <div class="stat"><div class="num" id="sRight">0</div><div class="lbl">答对</div></div>
    <div class="stat"><div class="num" id="sRate">0%</div><div class="lbl">正确率</div></div>
  </div>
  <div class="card">
    <div class="mode" id="mode">请补充下一句</div>
    <div class="prompt" id="prompt">——</div>
    <input class="input" id="answer" placeholder="输入你的答案" autocomplete="off">
    <button class="btn" id="submitBtn">提交答案</button>
    <button class="btn ghost" id="nextBtn">下一题</button>
    <div class="feedback" id="feedback"></div>
  </div>
</div>
<script>
var POEMS=[
  ["床前明月光","疑是地上霜"],
  ["白日依山尽","黄河入海流"],
  ["春眠不觉晓","处处闻啼鸟"],
  ["锄禾日当午","汗滴禾下土"],
  ["举头望明月","低头思故乡"],
  ["红豆生南国","春来发几枝"],
  ["离离原上草","一岁一枯荣"],
  ["两个黄鹂鸣翠柳","一行白鹭上青天"],
  ["千山鸟飞绝","万径人踪灭"],
  ["飞流直下三千尺","疑是银河落九天"],
  ["欲穷千里目","更上一层楼"],
  ["少壮不努力","老大徒伤悲"],
  ["野火烧不尽","春风吹又生"],
  ["停车坐爱枫林晚","霜叶红于二月花"],
  ["随风潜入夜","润物细无声"],
  ["海内存知己","天涯若比邻"],
  ["会当凌绝顶","一览众山小"],
  ["但愿人长久","千里共婵娟"]
];
var KEY="wewoo-poem-quiz";
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{t:0,r:0}}catch(e){return{t:0,r:0}}}
var data=load();if(typeof data.t!=="number")data.t=0;if(typeof data.r!=="number")data.r=0;
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function refreshStats(){
  document.getElementById("sTotal").textContent=data.t;
  document.getElementById("sRight").textContent=data.r;
  document.getElementById("sRate").textContent=(data.t?Math.round(data.r/data.t*100):0)+"%";
}
var cur=null, mode=0, answered=false;
function newQuestion(){
  cur=POEMS[Math.floor(Math.random()*POEMS.length)];
  mode=Math.random()<0.5?0:1; // 0=填下句 1=填上句
  document.getElementById("mode").textContent=mode===0?"请补充下一句":"请补充上一句";
  document.getElementById("prompt").textContent=mode===0?cur[0]:cur[1];
  document.getElementById("answer").value="";
  document.getElementById("feedback").className="feedback";
  answered=false;
  document.getElementById("submitBtn").textContent="提交答案";
  document.getElementById("answer").focus();
}
function normalize(s){return s.replace(/[，。！？、\s]/g,"")}
function submit(){
  if(answered){nextQuestion();return}
  var val=document.getElementById("answer").value.trim();
  if(!val)return;
  var right=mode===0?cur[1]:cur[0];
  var ok=normalize(val)===normalize(right);
  data.t++;if(ok)data.r++;save();refreshStats();
  var fb=document.getElementById("feedback");
  fb.className="feedback show "+(ok?"ok":"no");
  fb.innerHTML=(ok?"✅ 答对啦！":"❌ 答案是：")+"<div class='poem'>"+right+"</div>";
  answered=true;
  document.getElementById("submitBtn").textContent="下一题";
}
document.getElementById("submitBtn").onclick=submit;
document.getElementById("nextBtn").onclick=function(){if(!answered){submit()}else{newQuestion()}};
document.getElementById("answer").addEventListener("keydown",function(e){if(e.key==="Enter")submit()});
refreshStats();
newQuestion();
</script>
</body>
</html>`,
    thumbnailGradient: "linear-gradient(135deg, #4facfe, #00f2fe)",
    createdAt: "2026-07-18T09:15:00Z",
    description: "课堂上随机出题，考考学生的诗词积累",
  },
  {
    id: "4",
    title: "宝宝辅食记录",
    author: "新手妈妈小怡",
    authorId: "user-004",
    category: "生活",
    visibility: "public",
    code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>宝宝辅食记录</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(160deg,#fdf2f8,#fff7ed);min-height:100vh;padding:16px;color:#1e293b}
  .wrap{max-width:420px;margin:0 auto}
  h1{font-size:20px;font-weight:800;color:#be185d;text-align:center;margin-bottom:2px}
  .sub{font-size:12px;color:#94a3b8;text-align:center;margin-bottom:14px}
  .stats{display:flex;gap:8px;margin-bottom:12px}
  .stat{flex:1;background:#fff;border-radius:12px;padding:10px;text-align:center;box-shadow:0 2px 8px rgba(190,24,93,.06)}
  .stat .num{font-size:18px;font-weight:800;color:#db2777}
  .stat .lbl{font-size:11px;color:#94a3b8;margin-top:2px}
  .card{background:#fff;border-radius:16px;padding:16px;margin-bottom:12px;box-shadow:0 4px 16px rgba(190,24,93,.08)}
  .card h3{font-size:14px;color:#be185d;margin-bottom:10px}
  .row{display:flex;gap:8px;margin-bottom:10px}
  .row input{flex:1;min-height:44px;border:1.5px solid #e2e8f0;border-radius:10px;padding:0 12px;font-size:16px;outline:none;background:#f8fafc}
  .row input:focus{border-color:#db2777;background:#fff}
  .reacts{display:flex;gap:8px;margin-bottom:10px}
  .react{flex:1;min-height:44px;border:1.5px solid #e2e8f0;border-radius:10px;background:#fff;font-size:14px;cursor:pointer;color:#64748b}
  .react.sel{color:#fff;font-weight:700}
  .react.sel.r1{background:#10b981;border-color:#10b981}
  .react.sel.r2{background:#f59e0b;border-color:#f59e0b}
  .react.sel.r3{background:#ef4444;border-color:#ef4444}
  .btn{width:100%;min-height:46px;border:0;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#db2777,#f472b6);color:#fff;transition:transform .1s}
  .btn:active{transform:scale(.97)}
  .rec{display:flex;align-items:flex-start;gap:8px;padding:10px 0;border-bottom:1px solid #f1f5f9}
  .rec:last-child{border-bottom:0}
  .rec .tag{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
  .rec .tag.r1{background:#d1fae5}.rec .tag.r2{background:#fef3c7}.rec .tag.r3{background:#fee2e2}
  .rec .body{flex:1;min-width:0}
  .rec .food{font-size:15px;font-weight:700;color:#334155}
  .rec .meta{font-size:11px;color:#94a3b8;margin-top:2px}
  .rec .note{font-size:12px;color:#64748b;margin-top:2px}
  .rec button{min-width:34px;min-height:34px;border:0;border-radius:8px;background:#fee2e2;color:#dc2626;font-size:14px;cursor:pointer}
  .empty{font-size:12px;color:#cbd5e1;text-align:center;padding:12px 0}
</style>
</head>
<body>
<div class="wrap">
  <h1>🍼 宝宝辅食记录</h1>
  <p class="sub">记录每天吃了什么，宝宝反应如何（自动保存）</p>
  <div class="stats">
    <div class="stat"><div class="num" id="sCount">0</div><div class="lbl">记录数</div></div>
    <div class="stat"><div class="num" id="sLike">0</div><div class="lbl">爱吃</div></div>
    <div class="stat"><div class="num" id="sWarn">0</div><div class="lbl">不爱/留意</div></div>
  </div>
  <div class="card">
    <h3>✏️ 新增辅食记录</h3>
    <div class="row">
      <input id="food" placeholder="食物，如：南瓜泥" style="flex:2">
      <input id="date" type="date" style="flex:1.4">
    </div>
    <div class="reacts">
      <button class="react r1" data-r="1">😋 爱吃</button>
      <button class="react r2" data-r="2">😐 一般</button>
      <button class="react r3" data-r="3">😣 不爱</button>
    </div>
    <input class="row" id="note" placeholder="备注（可选），如：加了米糊" style="width:100%;min-height:44px;border:1.5px solid #e2e8f0;border-radius:10px;padding:0 12px;font-size:16px;outline:none;background:#f8fafc;margin-bottom:10px">
    <button class="btn" id="addBtn">添加记录</button>
  </div>
  <div class="card">
    <h3>📋 记录列表</h3>
    <div id="list"></div>
  </div>
</div>
<script>
var KEY="wewoo-baby-food";
function load(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}}
var list=load();if(!Array.isArray(list))list=[];
function save(){localStorage.setItem(KEY,JSON.stringify(list))}
var reactSel=1;
document.querySelectorAll(".react").forEach(function(b){
  b.onclick=function(){
    reactSel=parseInt(b.dataset.r);
    document.querySelectorAll(".react").forEach(function(x){x.classList.remove("sel")});
    b.classList.add("sel");
  };
});
document.querySelector(".react.r1").classList.add("sel");
function today(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
document.getElementById("date").value=today();
var REACT={1:["😋","r1"],2:["😐","r2"],3:["😣","r3"]};
function add(){
  var food=document.getElementById("food").value.trim();
  var date=document.getElementById("date").value||today();
  var note=document.getElementById("note").value.trim();
  if(!food){document.getElementById("food").focus();return}
  list.unshift({food:food,date:date,r:reactSel,note:note});
  save();
  document.getElementById("food").value="";document.getElementById("note").value="";
  render();
}
function del(i){list.splice(i,1);save();render()}
function render(){
  var box=document.getElementById("list");
  if(list.length===0){box.innerHTML='<div class="empty">还没有记录，先添加一条吧</div>';refreshStats();return}
  box.innerHTML="";
  list.forEach(function(it,i){
    var d=document.createElement("div");d.className="rec";
    var em=REACT[it.r]||REACT[1];
    d.innerHTML='<div class="tag '+em[1]+'">'+em[0]+'</div>'+
      '<div class="body"><div class="food">'+it.food+'</div>'+
      '<div class="meta">'+it.date+(it.note?" · "+it.note:"")+'</div></div>';
    var b=document.createElement("button");b.textContent="×";b.onclick=function(){del(i)};
    d.appendChild(b);box.appendChild(d);
  });
  refreshStats();
}
function refreshStats(){
  document.getElementById("sCount").textContent=list.length;
  document.getElementById("sLike").textContent=list.filter(function(x){return x.r===1}).length;
  document.getElementById("sWarn").textContent=list.filter(function(x){return x.r===3}).length;
}
document.getElementById("addBtn").onclick=add;
render();
</script>
</body>
</html>`,
    thumbnailGradient: "linear-gradient(135deg, #fa8231, #f7b731)",
    createdAt: "2026-07-21T16:45:00Z",
    description: "记录每天宝宝吃了什么，自动生成营养报告",
  },
  {
    id: "5",
    title: "酒店比价小助手",
    author: "省钱达人阿杰",
    authorId: "user-005",
    category: "旅行",
    visibility: "public",
    code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>酒店比价小助手</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(160deg,#ecfeff,#f0f9ff);min-height:100vh;padding:16px;color:#1e293b}
  .wrap{max-width:420px;margin:0 auto}
  h1{font-size:20px;font-weight:800;color:#0e7490;text-align:center;margin-bottom:2px}
  .sub{font-size:12px;color:#94a3b8;text-align:center;margin-bottom:14px}
  .card{background:#fff;border-radius:16px;padding:16px;margin-bottom:12px;box-shadow:0 4px 16px rgba(14,116,144,.08)}
  .card h3{font-size:14px;color:#0e7490;margin-bottom:10px}
  .row{display:flex;gap:8px;margin-bottom:10px}
  .row input{flex:1;min-height:44px;border:1.5px solid #e2e8f0;border-radius:10px;padding:0 12px;font-size:16px;outline:none;background:#f8fafc}
  .row input:focus{border-color:#06b6d4;background:#fff}
  .btn{width:100%;min-height:46px;border:0;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#0891b2,#06b6d4);color:#fff;transition:transform .1s}
  .btn:active{transform:scale(.97)}
  .hotel{display:flex;align-items:center;gap:10px;padding:12px;border:1.5px solid #e2e8f0;border-radius:12px;margin-bottom:8px;background:#fff}
  .hotel.best{border-color:#f59e0b;background:#fffbeb}
  .hotel .idx{width:26px;height:26px;border-radius:8px;background:#e0f2fe;color:#0369a1;font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .hotel.best .idx{background:#f59e0b;color:#fff}
  .hotel .body{flex:1;min-width:0}
  .hotel .name{font-size:15px;font-weight:700;color:#334155}
  .hotel .meta{font-size:12px;color:#64748b;margin-top:2px}
  .hotel .score{font-size:13px;font-weight:800;color:#0e7490;text-align:right}
  .hotel .score small{display:block;font-size:10px;color:#94a3b8;font-weight:400}
  .hotel button{min-width:32px;min-height:32px;border:0;border-radius:8px;background:#fee2e2;color:#dc2626;font-size:13px;cursor:pointer}
  .empty{font-size:12px;color:#cbd5e1;text-align:center;padding:12px 0}
  .tip{font-size:11px;color:#94a3b8;text-align:center;margin-top:6px}
</style>
</head>
<body>
<div class="wrap">
  <h1>🏨 酒店比价小助手</h1>
  <p class="sub">输入候选酒店，自动算性价比并推荐（自动保存）</p>
  <div class="card">
    <h3>✏️ 添加候选酒店</h3>
    <div class="row"><input id="name" placeholder="酒店名称" style="flex:1.6"></div>
    <div class="row">
      <input id="price" type="number" inputmode="decimal" placeholder="每晚价格 ¥" style="flex:1">
      <input id="rate" type="number" inputmode="decimal" min="0" max="5" step="0.1" placeholder="评分 0-5" style="flex:.8">
    </div>
    <button class="btn" id="addBtn">添加并比较</button>
  </div>
  <div class="card">
    <h3>📊 性价比排行（每花 100 元获得多少评分）</h3>
    <div id="list"></div>
  </div>
  <p class="tip">性价比 = 评分 ÷ 每晚价格 × 100，越高越划算；黄色为推荐</p>
</div>
<script>
var KEY="wewoo-hotel-compare";
function load(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}}
var list=load();if(!Array.isArray(list))list=[];
function save(){localStorage.setItem(KEY,JSON.stringify(list))}
function add(){
  var name=document.getElementById("name").value.trim();
  var price=parseFloat(document.getElementById("price").value)||0;
  var rate=parseFloat(document.getElementById("rate").value)||0;
  if(!name){document.getElementById("name").focus();return}
  if(price<=0){document.getElementById("price").focus();return}
  if(rate<=0||rate>5){document.getElementById("rate").focus();return}
  list.push({name:name,price:price,rate:rate});
  save();
  document.getElementById("name").value="";document.getElementById("price").value="";document.getElementById("rate").value="";
  render();
}
function del(i){list.splice(i,1);save();render()}
function render(){
  var box=document.getElementById("list");
  if(list.length===0){box.innerHTML='<div class="empty">还没有酒店，添加几家对比吧</div>';return}
  var sorted=list.map(function(h,i){return {h:h,i:i,v:h.rate/h.price*100}}).sort(function(a,b){return b.v-a.v});
  var bestV=sorted[0].v;
  box.innerHTML="";
  sorted.forEach(function(s,rank){
    var d=document.createElement("div");d.className="hotel"+(rank===0?" best":"");
    var total="约 ¥"+(s.h.price*(s.h.rate/5)).toFixed(0)+" 等价体验";
    d.innerHTML='<div class="idx">'+(rank+1)+'</div>'+
      '<div class="body"><div class="name">'+s.h.name+'</div>'+
      '<div class="meta">¥'+s.h.price.toFixed(0)+'/晚 · 评分 '+s.h.rate.toFixed(1)+' · '+total+'</div></div>'+
      '<div class="score">'+s.v.toFixed(1)+'<small>分/百元</small></div>';
    var b=document.createElement("button");b.textContent="×";b.onclick=function(){del(s.i)};
    d.appendChild(b);box.appendChild(d);
  });
}
document.getElementById("addBtn").onclick=add;
render();
</script>
</body>
</html>`,
    thumbnailGradient: "linear-gradient(135deg, #43e97b, #38f9d7)",
    createdAt: "2026-07-17T11:00:00Z",
    description: "对比多家酒店，找到性价比最高的选择",
  },
  {
    id: "6",
    title: "齿轮参数速算",
    author: "CAD老陈",
    authorId: "user-002",
    category: "工程计算",
    visibility: "public",
    code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>齿轮参数速算</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(160deg,#f5f3ff,#eef2ff);min-height:100vh;padding:16px;color:#1e293b}
  .wrap{max-width:420px;margin:0 auto}
  h1{font-size:20px;font-weight:800;color:#5b21b6;text-align:center;margin-bottom:2px}
  .sub{font-size:12px;color:#94a3b8;text-align:center;margin-bottom:14px}
  .card{background:#fff;border-radius:16px;padding:16px;margin-bottom:12px;box-shadow:0 4px 16px rgba(91,33,182,.08)}
  .card h3{font-size:14px;color:#5b21b6;margin-bottom:10px}
  .row{display:flex;gap:8px;align-items:center;margin-bottom:10px}
  .row label{font-size:13px;color:#64748b;flex-shrink:0;width:96px}
  .row input{flex:1;min-height:44px;padding:0 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:16px;outline:none;background:#f8fafc}
  .row input:focus{border-color:#7c3aed;background:#fff}
  .btn{width:100%;min-height:46px;border:0;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;transition:transform .1s}
  .btn:active{transform:scale(.97)}
  .out{background:#f5f3ff;border:1.5px solid #ddd6fe;border-radius:12px;padding:6px 12px}
  .out .li{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #e9d5ff;font-size:14px}
  .out .li:last-child{border-bottom:0}
  .out .li span{color:#64748b}
  .out .li b{color:#5b21b6}
  .out .li.hl b{color:#c026d3;font-size:16px}
  .tips{font-size:11px;color:#94a3b8;text-align:center;margin-top:6px}
</style>
</head>
<body>
<div class="wrap">
  <h1>⚙️ 齿轮参数速算</h1>
  <p class="sub">输入模数与齿数，秒出全套齿轮尺寸（自动保存）</p>
  <div class="card">
    <h3>参数输入</h3>
    <div class="row"><label>模数 m</label><input id="m" type="number" inputmode="decimal" step="0.25" value="2"></div>
    <div class="row"><label>主动轮 z1</label><input id="z1" type="number" inputmode="numeric" value="20"></div>
    <div class="row"><label>从动轮 z2</label><input id="z2" type="number" inputmode="numeric" value="60"></div>
    <div class="row"><label>压力角 α</label><input id="ang" type="number" inputmode="decimal" value="20"></div>
    <button class="btn" id="calcBtn">计算参数</button>
  </div>
  <div class="card">
    <h3>📐 计算结果</h3>
    <div class="out" id="out"></div>
  </div>
  <p class="tips">标准直齿圆柱齿轮 · 数据自动保存，下次打开还在</p>
</div>
<script>
var KEY="wewoo-gear-calc";
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}}
var data=load();
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
var mEl=document.getElementById("m"),z1El=document.getElementById("z1"),z2El=document.getElementById("z2"),aEl=document.getElementById("ang");
if(data.m!==undefined)mEl.value=data.m;
if(data.z1!==undefined)z1El.value=data.z1;
if(data.z2!==undefined)z2El.value=data.z2;
if(data.ang!==undefined)aEl.value=data.ang;
function fmt(v){return Math.round(v*1000)/1000}
function calc(){
  var m=parseFloat(mEl.value)||0;
  var z1=parseInt(z1El.value)||0;
  var z2=parseInt(z2El.value)||0;
  var ang=parseFloat(aEl.value)||20;
  if(m<=0||z1<=0||z2<=0){document.getElementById("out").innerHTML='<div style="color:#dc2626;text-align:center;padding:8px">请输入有效参数</div>';return}
  var rows=[
    ["分度圆直径 d1",fmt(m*z1)+" mm"],
    ["分度圆直径 d2",fmt(m*z2)+" mm"],
    ["齿顶圆 da1",fmt(m*(z1+2))+" mm"],
    ["齿顶圆 da2",fmt(m*(z2+2))+" mm"],
    ["齿根圆 df1",fmt(m*(z1-2.5))+" mm"],
    ["齿根圆 df2",fmt(m*(z2-2.5))+" mm"],
    ["中心距 a",fmt(m*(z1+z2)/2)+" mm"],
    ["全齿高 h",fmt(2.25*m)+" mm"],
    ["齿距 p",fmt(Math.PI*m)+" mm"],
    ["传动比 i = z2/z1",fmt(z2/z1)]
  ];
  var html='<div class="li hl"><span>传动比（减速比）</span><b>1 : '+fmt(z2/z1)+'</b></div>';
  rows.forEach(function(r){html+='<div class="li"><span>'+r[0]+'</span><b>'+r[1]+'</b></div>'});
  document.getElementById("out").innerHTML=html;
  data.m=m;data.z1=z1;data.z2=z2;data.ang=ang;save();
}
document.getElementById("calcBtn").onclick=calc;
calc();
</script>
</body>
</html>`,
    thumbnailGradient: "linear-gradient(135deg, #a18cd1, #fbc2eb)",
    createdAt: "2026-07-16T08:30:00Z",
    description: "输入模数和齿数，秒出节圆直径和中心距",
  },
  {
    id: "7",
    title: "英语单词小测",
    author: "英语李老师",
    authorId: "user-003",
    category: "教育",
    visibility: "public",
    code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>英语单词小测</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(160deg,#eff6ff,#ecfeff);min-height:100vh;padding:16px;color:#1e293b}
  .wrap{max-width:420px;margin:0 auto}
  h1{font-size:20px;font-weight:800;color:#1d4ed8;text-align:center;margin-bottom:2px}
  .sub{font-size:12px;color:#94a3b8;text-align:center;margin-bottom:14px}
  .stats{display:flex;gap:8px;margin-bottom:12px}
  .stat{flex:1;background:#fff;border-radius:12px;padding:10px;text-align:center;box-shadow:0 2px 8px rgba(29,78,216,.06)}
  .stat .num{font-size:20px;font-weight:800;color:#2563eb}
  .stat .lbl{font-size:11px;color:#94a3b8;margin-top:2px}
  .card{background:#fff;border-radius:16px;padding:16px;box-shadow:0 4px 16px rgba(29,78,216,.08)}
  .word{font-size:30px;font-weight:800;color:#1e3a8a;text-align:center;padding:16px 8px;background:#eff6ff;border-radius:12px;margin-bottom:12px;letter-spacing:.5px}
  .opt{display:block;width:100%;min-height:48px;border:1.5px solid #e2e8f0;border-radius:12px;background:#fff;font-size:16px;color:#334155;margin-bottom:8px;cursor:pointer;text-align:left;padding:0 14px;transition:all .15s}
  .opt:active{transform:scale(.98)}
  .opt.right{background:#dcfce7;border-color:#22c55e;color:#15803d;font-weight:700}
  .opt.wrong{background:#fee2e2;border-color:#ef4444;color:#b91c1c}
  .opt.dim{opacity:.5}
  .feed{display:none;font-size:14px;text-align:center;padding:10px;border-radius:12px;margin-top:8px}
  .feed.show{display:block}
  .feed.ok{background:#f0fdf4;color:#15803d}
  .feed.no{background:#fef2f2;color:#b91c1c}
  .btn{width:100%;min-height:46px;border:0;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;transition:transform .1s;margin-top:6px}
  .btn:active{transform:scale(.97)}
</style>
</head>
<body>
<div class="wrap">
  <h1>📖 英语单词小测</h1>
  <p class="sub">看英文选中文释义 · 成绩自动保存</p>
  <div class="stats">
    <div class="stat"><div class="num" id="sTotal">0</div><div class="lbl">已答</div></div>
    <div class="stat"><div class="num" id="sRight">0</div><div class="lbl">答对</div></div>
    <div class="stat"><div class="num" id="sRate">0%</div><div class="lbl">正确率</div></div>
  </div>
  <div class="card">
    <div class="word" id="word">—</div>
    <div id="opts"></div>
    <div class="feed" id="feed"></div>
    <button class="btn" id="nextBtn">下一题</button>
  </div>
</div>
<script>
var WORDS=[
  ["abandon","放弃；抛弃"],["ability","能力；才能"],["absorb","吸收；使专心"],["abstract","抽象的"],["academic","学术的"],
  ["access","接近；通道"],["accompany","陪伴"],["accomplish","完成；实现"],["accurate","准确的"],["achieve","实现；达到"],
  ["adapt","适应；改编"],["adequate","足够的"],["adjust","调整；适应"],["admire","钦佩；欣赏"],["adopt","采用；收养"],
  ["advance","前进；进步"],["advantage","优势"],["adventure","冒险"],["affect","影响"],["afford","负担得起"],
  ["agency","代理处；机构"],["ambition","雄心；野心"],["analyze","分析"],["announce","宣布"],["anxious","焦虑的"],
  ["apparent","明显的"],["appeal","呼吁；吸引"],["apply","申请；应用"],["appreciate","感激；欣赏"],["approach","接近；方法"],
  ["appropriate","适当的"],["approve","批准；赞成"],["arise","出现；升起"],["arrange","安排"],["aspect","方面"],
  ["assess","评估"],["assign","分配；指派"],["assist","帮助"],["assume","假定"],["attach","附上；系上"],
  ["attain","达到；获得"],["attempt","尝试"],["attitude","态度"],["attract","吸引"],["available","可用的"],
  ["average","平均的"],["avoid","避免"],["aware","意识到的"],["balance","平衡"],["barrier","障碍"]
];
var KEY="wewoo-word-quiz";
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{t:0,r:0}}catch(e){return{t:0,r:0}}}
var data=load();if(typeof data.t!=="number")data.t=0;if(typeof data.r!=="number")data.r=0;
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function refreshStats(){
  document.getElementById("sTotal").textContent=data.t;
  document.getElementById("sRight").textContent=data.r;
  document.getElementById("sRate").textContent=(data.t?Math.round(data.r/data.t*100):0)+"%";
}
var cur=null,curRight=null,answered=false;
function shuffle(arr){for(var i=arr.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=arr[i];arr[i]=arr[j];arr[j]=t}return arr}
function newQ(){
  cur=WORDS[Math.floor(Math.random()*WORDS.length)];
  var pool=shuffle(WORDS.slice()).filter(function(w){return w[0]!==cur[0]}).slice(0,3).map(function(w){return w[1]});
  pool.push(cur[1]);pool=shuffle(pool);
  curRight=cur[1];
  document.getElementById("word").textContent=cur[0];
  document.getElementById("feed").className="feed";
  answered=false;
  var box=document.getElementById("opts");box.innerHTML="";
  pool.forEach(function(txt){
    var b=document.createElement("button");b.className="opt";b.textContent=txt;
    b.onclick=function(){pick(b,txt)};
    box.appendChild(b);
  });
}
function pick(btn,txt){
  if(answered)return;
  answered=true;
  var ok=txt===curRight;
  data.t++;if(ok)data.r++;save();refreshStats();
  document.querySelectorAll(".opt").forEach(function(b){
    if(b.textContent===curRight){b.classList.add("right")}
    else{b.classList.add("dim")}
  });
  if(!ok)btn.classList.add("wrong");
  var fb=document.getElementById("feed");
  fb.className="feed show "+(ok?"ok":"no");
  fb.textContent=ok?"✅ 回答正确！"+cur[0]+" = "+cur[1]:"❌ 正确答案："+cur[0]+" = "+cur[1];
}
document.getElementById("nextBtn").onclick=function(){if(!answered){document.querySelectorAll(".opt")[0]&&document.querySelectorAll(".opt")[0].click()}newQ()};
refreshStats();newQ();
</script>
</body>
</html>`,
    thumbnailGradient: "linear-gradient(135deg, #ffecd2, #fcb69f)",
    createdAt: "2026-07-22T07:00:00Z",
    description: "随机抽取四六级词汇，限时拼写测试",
  },
  {
    id: "8",
    title: "每日喝水打卡",
    author: "健康生活家",
    authorId: "user-004",
    category: "生活",
    visibility: "public",
    code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>每日喝水打卡</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(160deg,#4facfe,#00f2fe);min-height:100vh;padding:16px;color:#1e293b}
  .wrap{max-width:420px;margin:0 auto}
  .card{background:#fff;border-radius:20px;padding:20px 18px;box-shadow:0 12px 32px rgba(2,132,199,.2);margin-bottom:12px}
  .head{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
  .title{font-size:20px;font-weight:800;color:#0f172a}
  .date{font-size:12px;color:#94a3b8;margin-bottom:10px}
  .cups{display:flex;align-items:flex-end;gap:5px;height:64px;margin:14px 0 10px}
  .cup{width:22px;border-radius:8px 8px 4px 4px;background:#e2e8f0;transition:height .3s,background .3s}
  .cup.on{background:#38bdf8}
  .count-row{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:8px}
  .count{font-size:40px;font-weight:800;color:#0284c7}
  .count small{font-size:14px;color:#94a3b8;font-weight:600}
  .bar{height:10px;background:#f1f5f9;border-radius:99px;overflow:hidden;margin-bottom:6px}
  .bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#38bdf8,#0ea5e9);border-radius:99px;transition:width .4s}
  .goal-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
  .goal-row label{font-size:12px;color:#94a3b8}
  .goal-row input{width:64px;min-height:36px;border:1.5px solid #e2e8f0;border-radius:9px;text-align:center;font-size:15px;font-weight:700;color:#0284c7;outline:none}
  .row{display:flex;gap:10px}
  .btn{flex:1;min-height:48px;border:0;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;transition:transform .1s}
  .btn:active{transform:scale(.97)}
  .btn-add{background:#0284c7;color:#fff}
  .btn-sub{background:#f1f5f9;color:#64748b}
  .btn-reset{flex:none;min-width:104px;background:#fff;color:#f43f5e;border:1.5px solid #fecdd3}
  .streak{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:12px;padding:10px;background:#f0f9ff;border-radius:12px;color:#0369a1;font-size:13px;font-weight:600}
  .streak b{font-size:16px;color:#0284c7}
  .hist-title{font-size:13px;font-weight:700;color:#334155;margin-bottom:8px}
  .hist{display:flex;align-items:flex-end;gap:6px;height:70px}
  .hist .col{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px}
  .hist .col .v{font-size:10px;color:#64748b}
  .hist .col .bar2{width:100%;background:#e0f2fe;border-radius:6px 6px 2px 2px;position:relative;flex:1;display:flex;align-items:flex-end;overflow:hidden}
  .hist .col .bar2 i{display:block;width:100%;background:#0ea5e9;border-radius:6px 6px 2px 2px}
  .hist .col .d{font-size:10px;color:#94a3b8}
  .hist .col.today .d{color:#0284c7;font-weight:700}
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="head"><div class="title">💧 每日喝水打卡</div><div style="font-size:26px">🥤</div></div>
    <div class="date" id="date"></div>
    <div class="cups" id="cups"></div>
    <div class="count-row">
      <div class="count"><span id="count">0</span><small> / <span id="goalLbl">8</span> 杯</small></div>
      <div style="font-size:12px;color:#94a3b8" id="pct">0%</div>
    </div>
    <div class="bar"><i id="bar"></i></div>
    <div class="goal-row"><label>每日目标（杯）</label><input id="goal" type="number" inputmode="numeric" value="8"></div>
    <div class="row">
      <button class="btn btn-add" id="add">+1 杯</button>
      <button class="btn btn-sub" id="sub">-1 杯</button>
      <button class="btn btn-reset" id="reset">清零</button>
    </div>
    <div class="streak">🔥 连续打卡 <b id="streak">0</b> 天</div>
  </div>
  <div class="card">
    <div class="hist-title">📊 近 7 天喝水情况</div>
    <div class="hist" id="hist"></div>
  </div>
</div>
<script>
var KEY="wewoo-water-track";
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}}
var data=load();if(!data.days)data.days={};if(!data.goal)data.goal=8;
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function keyOf(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
var tk=keyOf(new Date());
if(typeof data.days[tk]!=="number")data.days[tk]=0;
var count=data.days[tk],goal=data.goal;
function calcStreak(){
  var d=new Date();
  if((data.days[tk]||0)===0)d.setDate(d.getDate()-1);
  var s=0;
  for(var i=0;i<365;i++){
    var k=keyOf(d);
    if((data.days[k]||0)>0)s++;else break;
    d.setDate(d.getDate()-1);
  }
  return s;
}
function render(){
  document.getElementById("date").textContent=tk.replace(/-/g,"/")+" · 数据自动保存";
  document.getElementById("count").textContent=count;
  document.getElementById("goalLbl").textContent=goal;
  document.getElementById("pct").textContent=Math.min(100,Math.round(count/goal*100))+"%";
  document.getElementById("bar").style.width=Math.min(100,count/goal*100)+"%";
  document.getElementById("streak").textContent=calcStreak();
  var cups=document.getElementById("cups");cups.innerHTML="";
  var n=Math.min(goal,10);
  for(var i=0;i<n;i++){
    var c=document.createElement("div");c.className="cup"+(i<count?" on":"");
    c.style.height=(20+i*5)+"px";cups.appendChild(c);
  }
  // 近7天
  var hist=document.getElementById("hist");hist.innerHTML="";
  var max=1;
  var days=[];
  for(var j=6;j>=0;j--){
    var d=new Date();d.setDate(d.getDate()-j);
    var k=keyOf(d);
    var v=data.days[k]||0;
    if(v>max)max=v;
    days.push({k:k,v:v,today:j===0});
  }
  days.forEach(function(it){
    var col=document.createElement("div");col.className="col"+(it.today?" today":"");
    col.innerHTML='<div class="v">'+it.v+'</div><div class="bar2"><i style="height:'+Math.round(it.v/max*100)+'%"></i></div><div class="d">'+(it.today?"今天":it.k.slice(5).replace("-","/"))+'</div>';
    hist.appendChild(col);
  });
}
function commit(){data.days[tk]=count;save();render()}
document.getElementById("add").onclick=function(){count++;commit()};
document.getElementById("sub").onclick=function(){if(count>0){count--;commit()}};
document.getElementById("reset").onclick=function(){count=0;commit()};
document.getElementById("goal").onchange=function(){var g=parseInt(this.value)||8;if(g<1)g=1;if(g>30)g=30;this.value=g;data.goal=g;goal=g;save();render()};
render();
</script>
</body>
</html>`,
    thumbnailGradient: "linear-gradient(135deg, #667eea, #764ba2)",
    createdAt: "2026-07-20T12:00:00Z",
    description: "设置喝水目标，记录每日饮水，8杯水健康打卡",
  },
  {
    id: "9",
    title: "行程花费日记",
    author: "背包客小李",
    authorId: "user-001",
    category: "旅行",
    visibility: "public",
    code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>行程花费日记</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(160deg,#f0fdf4,#fefce8);min-height:100vh;padding:16px;color:#1e293b}
  .wrap{max-width:420px;margin:0 auto}
  h1{font-size:20px;font-weight:800;color:#15803d;text-align:center;margin-bottom:2px}
  .sub{font-size:12px;color:#94a3b8;text-align:center;margin-bottom:14px}
  .total{background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;border-radius:16px;padding:14px;text-align:center;margin-bottom:12px}
  .total .lbl{font-size:12px;opacity:.85}
  .total .big{font-size:30px;font-weight:800}
  .cats{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
  .cat{font-size:12px;background:#fff;border-radius:99px;padding:5px 10px;color:#64748b;box-shadow:0 2px 6px rgba(22,163,74,.08)}
  .cat b{color:#15803d}
  .card{background:#fff;border-radius:16px;padding:16px;margin-bottom:12px;box-shadow:0 4px 16px rgba(22,163,74,.08)}
  .card h3{font-size:14px;color:#15803d;margin-bottom:10px}
  .row{display:flex;gap:8px;margin-bottom:10px}
  .row select,.row input{min-height:44px;border:1.5px solid #e2e8f0;border-radius:10px;padding:0 12px;font-size:16px;outline:none;background:#f8fafc}
  .row select{flex:1;font-size:14px}
  .row input{flex:1}
  .row input:focus,.row select:focus{border-color:#16a34a;background:#fff}
  .btn{width:100%;min-height:46px;border:0;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;transition:transform .1s}
  .btn:active{transform:scale(.97)}
  .item{display:flex;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid #f1f5f9;font-size:14px}
  .item:last-child{border-bottom:0}
  .item .emoji{font-size:18px}
  .item .name{flex:1;color:#334155}
  .item .name small{display:block;font-size:11px;color:#94a3b8}
  .item .cost{font-weight:700;color:#15803d}
  .item button{min-width:34px;min-height:34px;border:0;border-radius:8px;background:#fee2e2;color:#dc2626;font-size:14px;cursor:pointer}
  .empty{font-size:12px;color:#cbd5e1;text-align:center;padding:12px 0}
</style>
</head>
<body>
<div class="wrap">
  <h1>🧾 行程花费日记</h1>
  <p class="sub">每一笔开销都记下来，自动分类统计（自动保存）</p>
  <div class="total"><div class="lbl">总花费</div><div class="big" id="total">¥0.00</div></div>
  <div class="cats" id="cats"></div>
  <div class="card">
    <h3>✏️ 记一笔</h3>
    <div class="row">
      <select id="cat">
        <option value="餐饮">🍜 餐饮</option>
        <option value="交通">🚗 交通</option>
        <option value="住宿">🏨 住宿</option>
        <option value="门票">🎫 门票</option>
        <option value="购物">🛍️ 购物</option>
        <option value="其他">📦 其他</option>
      </select>
      <input id="amount" type="number" inputmode="decimal" placeholder="金额 ¥" style="flex:.9">
    </div>
    <input id="note" placeholder="备注，如：机场大巴" style="width:100%;min-height:44px;border:1.5px solid #e2e8f0;border-radius:10px;padding:0 12px;font-size:16px;outline:none;background:#f8fafc;margin-bottom:10px">
    <button class="btn" id="addBtn">添加</button>
  </div>
  <div class="card">
    <h3>📋 明细</h3>
    <div id="list"></div>
  </div>
</div>
<script>
var KEY="wewoo-travel-expense";
function load(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}}
var list=load();if(!Array.isArray(list))list=[];
function save(){localStorage.setItem(KEY,JSON.stringify(list))}
var EMOJI={"餐饮":"🍜","交通":"🚗","住宿":"🏨","门票":"🎫","购物":"🛍️","其他":"📦"};
function add(){
  var cat=document.getElementById("cat").value;
  var amount=parseFloat(document.getElementById("amount").value)||0;
  var note=document.getElementById("note").value.trim();
  if(amount<=0){document.getElementById("amount").focus();return}
  list.unshift({cat:cat,amount:amount,note:note,t:Date.now()});
  save();
  document.getElementById("amount").value="";document.getElementById("note").value="";
  render();
}
function del(i){list.splice(i,1);save();render()}
function render(){
  var total=list.reduce(function(s,x){return s+x.amount},0);
  document.getElementById("total").textContent="¥"+total.toFixed(2);
  var agg={};
  list.forEach(function(x){if(!agg[x.cat])agg[x.cat]=0;agg[x.cat]+=x.amount});
  var cats=document.getElementById("cats");cats.innerHTML="";
  Object.keys(agg).forEach(function(k){
    var s=document.createElement("span");s.className="cat";
    s.innerHTML=(EMOJI[k]||"📦")+" "+k+" <b>¥"+agg[k].toFixed(0)+"</b>";
    cats.appendChild(s);
  });
  var box=document.getElementById("list");
  if(list.length===0){box.innerHTML='<div class="empty">还没有记录，记第一笔吧</div>';return}
  box.innerHTML="";
  list.forEach(function(it,i){
    var d=document.createElement("div");d.className="item";
    d.innerHTML='<span class="emoji">'+(EMOJI[it.cat]||"📦")+'</span>'+
      '<span class="name">'+it.cat+'<small>'+(it.note||"无备注")+'</small></span>'+
      '<span class="cost">¥'+it.amount.toFixed(2)+'</span>';
    var b=document.createElement("button");b.textContent="×";b.onclick=function(){del(i)};
    d.appendChild(b);box.appendChild(d);
  });
}
document.getElementById("addBtn").onclick=add;
render();
</script>
</body>
</html>`,
    thumbnailGradient: "linear-gradient(135deg, #f093fb, #f5576c)",
    createdAt: "2026-07-15T18:00:00Z",
    description: "旅途中的每一笔开销都记下来，自动分类统计",
  },
  {
    id: "10",
    title: "单位换算大全",
    author: "工具人大刘",
    authorId: "user-005",
    category: "工程计算",
    visibility: "public",
    code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>单位换算大全</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(160deg,#fdf4ff,#f5f3ff);min-height:100vh;padding:16px;color:#1e293b}
  .wrap{max-width:420px;margin:0 auto}
  h1{font-size:20px;font-weight:800;color:#7e22ce;text-align:center;margin-bottom:2px}
  .sub{font-size:12px;color:#94a3b8;text-align:center;margin-bottom:14px}
  .tabs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
  .tab{min-height:40px;padding:0 14px;border:1.5px solid #e2e8f0;border-radius:99px;background:#fff;font-size:13px;color:#64748b;cursor:pointer}
  .tab.sel{background:linear-gradient(135deg,#a855f7,#7c3aed);color:#fff;border-color:transparent;font-weight:700}
  .card{background:#fff;border-radius:16px;padding:16px;box-shadow:0 4px 16px rgba(126,34,206,.08)}
  .row{display:flex;gap:8px;margin-bottom:10px}
  .row input{flex:1;min-height:46px;border:1.5px solid #e2e8f0;border-radius:10px;padding:0 12px;font-size:18px;font-weight:700;outline:none;background:#f8fafc;text-align:center}
  .row input:focus{border-color:#a855f7;background:#fff}
  .row select{min-height:46px;border:1.5px solid #e2e8f0;border-radius:10px;padding:0 10px;font-size:14px;outline:none;background:#f8fafc;flex:1.1}
  .swap{display:block;margin:0 auto 10px;min-width:44px;min-height:44px;border:0;border-radius:12px;background:#f3e8ff;color:#7e22ce;font-size:18px;cursor:pointer}
  .result{background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border-radius:12px;padding:14px;text-align:center;margin-top:6px}
  .result .big{font-size:26px;font-weight:800;word-break:break-all}
  .result .lbl{font-size:12px;opacity:.85;margin-top:2px}
  .tips{font-size:11px;color:#94a3b8;text-align:center;margin-top:10px}
</style>
</head>
<body>
<div class="wrap">
  <h1>📐 单位换算大全</h1>
  <p class="sub">长度 / 重量 / 面积 / 体积 / 温度 / 速度 · 自动保存</p>
  <div class="tabs" id="tabs"></div>
  <div class="card">
    <div class="row"><input id="val" type="number" inputmode="decimal" placeholder="输入数值"></div>
    <div class="row">
      <select id="from"></select>
      <select id="to"></select>
    </div>
    <button class="swap" id="swap">⇅</button>
    <div class="result"><div class="big" id="out">—</div><div class="lbl" id="outLbl">输入数值开始换算</div></div>
  </div>
  <p class="tips">数据自动保存 · 刷新 / 全屏 / 重新进入都保留上次的选择</p>
</div>
<script>
var GROUPS={
  "长度":{base:"m",units:[["m","米",1],["km","千米",1000],["cm","厘米",0.01],["mm","毫米",0.001],["in","英寸",0.0254],["ft","英尺",0.3048],["yd","码",0.9144],["mile","英里",1609.344]]},
  "重量":{base:"kg",units:[["kg","千克",1],["g","克",0.001],["mg","毫克",1e-6],["t","吨",1000],["jin","斤",0.5],["lb","磅",0.453592],["oz","盎司",0.0283495]]},
  "面积":{base:"m2",units:[["m2","平方米",1],["km2","平方千米",1e6],["cm2","平方厘米",1e-4],["mu","亩",666.667],["ha","公顷",10000],["ft2","平方英尺",0.092903]]},
  "体积":{base:"L",units:[["L","升",1],["ml","毫升",0.001],["m3","立方米",1000],["cm3","立方厘米",0.001],["gal","加仑(美)",3.78541],["cup","杯",0.24]]},
  "温度":{base:"C",units:[["C","摄氏度",0],["F","华氏度",1],["K","开尔文",2]]},
  "速度":{base:"m/s",units:[["ms","米/秒",1],["kmh","千米/时",0.277778],["mph","英里/时",0.44704],["knot","节",0.514444]]}
};
var KEY="wewoo-unit-convert";
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}}
var data=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){}}
var curGroup=data.group||"长度";
var fromEl=document.getElementById("from"),toEl=document.getElementById("to"),valEl=document.getElementById("val");

function fillTabs(){
  var box=document.getElementById("tabs");box.innerHTML="";
  Object.keys(GROUPS).forEach(function(g){
    var b=document.createElement("button");b.className="tab"+(g===curGroup?" sel":"");
    b.textContent=g;b.onclick=function(){curGroup=g;data.group=g;save();fillTabs();fillUnits();convert();};
    box.appendChild(b);
  });
}
function fillUnits(){
  var g=GROUPS[curGroup];fromEl.innerHTML="";toEl.innerHTML="";
  g.units.forEach(function(u,i){
    var o=document.createElement("option");o.value=String(i);o.textContent=u[1];
    fromEl.appendChild(o);
    var o2=document.createElement("option");o2.value=String(i);o2.textContent=u[1];
    toEl.appendChild(o2);
  });
  var fi=data.from||0,ti=data.to||1;
  if(g.units[fi])fromEl.value=fi;
  if(g.units[ti])toEl.value=ti;
}
function toBase(v,idx){
  var u=GROUPS[curGroup].units[idx];
  if(curGroup==="温度"){
    if(idx===0)return v;if(idx===1)return (v-32)*5/9;return v-273.15;
  }
  return v*u[2];
}
function fromBase(v,idx){
  var u=GROUPS[curGroup].units[idx];
  if(curGroup==="温度"){
    if(idx===0)return v;if(idx===1)return v*9/5+32;return v+273.15;
  }
  return v/u[2];
}
function convert(){
  var v=parseFloat(valEl.value);
  if(isNaN(v)){document.getElementById("out").textContent="—";return}
  var fi=parseInt(fromEl.value)||0,ti=parseInt(toEl.value)||0;
  var res=fromBase(toBase(v,fi),ti);
  document.getElementById("out").textContent=Math.round(res*1e8)/1e8;
  var fn=GROUPS[curGroup].units[fi][1],tn=GROUPS[curGroup].units[ti][1];
  document.getElementById("outLbl").textContent=v+" "+fn+" = "+tn;
  data.from=fi;data.to=ti;data.group=curGroup;save();
}
document.getElementById("swap").onclick=function(){
  var t=fromEl.value;fromEl.value=toEl.value;toEl.value=t;
  data.from=parseInt(fromEl.value);data.to=parseInt(toEl.value);save();convert();
};
fromEl.onchange=convert;toEl.onchange=convert;
valEl.addEventListener("input",convert);
fillTabs();fillUnits();convert();
</script>
</body>
</html>`,
    thumbnailGradient: "linear-gradient(135deg, #4facfe, #00f2fe)",
    createdAt: "2026-07-14T13:00:00Z",
    description: "长度、面积、体积、重量、温度…30 种单位瞬间换算",
  },
  {
    id: "11",
    title: "九九乘法测验",
    author: "数学赵老师",
    authorId: "user-003",
    category: "教育",
    visibility: "public",
    code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>九九乘法测验</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(160deg,#fef2f2,#fefce8);min-height:100vh;padding:16px;color:#1e293b}
  .wrap{max-width:420px;margin:0 auto}
  h1{font-size:20px;font-weight:800;color:#dc2626;text-align:center;margin-bottom:2px}
  .sub{font-size:12px;color:#94a3b8;text-align:center;margin-bottom:14px}
  .stats{display:flex;gap:8px;margin-bottom:12px}
  .stat{flex:1;background:#fff;border-radius:12px;padding:10px;text-align:center;box-shadow:0 2px 8px rgba(220,38,38,.06)}
  .stat .num{font-size:18px;font-weight:800;color:#ef4444}
  .stat .lbl{font-size:11px;color:#94a3b8;margin-top:2px}
  .card{background:#fff;border-radius:16px;padding:16px;box-shadow:0 4px 16px rgba(220,38,38,.08)}
  .question{font-size:40px;font-weight:800;color:#1e293b;text-align:center;padding:18px 8px;background:#fef2f2;border-radius:12px;margin-bottom:12px;letter-spacing:2px}
  .input{width:100%;min-height:52px;border:1.5px solid #e2e8f0;border-radius:12px;text-align:center;font-size:28px;font-weight:700;outline:none;background:#f8fafc;margin-bottom:10px}
  .input:focus{border-color:#ef4444;background:#fff}
  .btn{width:100%;min-height:46px;border:0;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#ef4444,#f97316);color:#fff;transition:transform .1s}
  .btn:active{transform:scale(.97)}
  .feed{display:none;font-size:15px;text-align:center;padding:10px;border-radius:12px;margin-top:8px}
  .feed.show{display:block}
  .feed.ok{background:#f0fdf4;color:#15803d}
  .feed.no{background:#fef2f2;color:#b91c1c}
  .wrong-title{font-size:13px;font-weight:700;color:#334155;margin:12px 0 6px}
  .wrong{display:flex;justify-content:space-between;font-size:13px;color:#64748b;padding:6px 0;border-bottom:1px dashed #f1f5f9}
  .wrong b{color:#b91c1c}
</style>
</head>
<body>
<div class="wrap">
  <h1>✖️ 九九乘法测验</h1>
  <p class="sub">随机出题 · 计时答题 · 错题重做 · 成绩自动保存</p>
  <div class="stats">
    <div class="stat"><div class="num" id="sQ">0</div><div class="lbl">本轮答对</div></div>
    <div class="stat"><div class="num" id="sBest">0</div><div class="lbl">最快纪录</div></div>
    <div class="stat"><div class="num" id="sTime">0s</div><div class="lbl">本轮用时</div></div>
  </div>
  <div class="card">
    <div class="question" id="q">—</div>
    <input class="input" id="ans" type="number" inputmode="numeric" placeholder="答案" autocomplete="off">
    <button class="btn" id="goBtn">提交</button>
    <div class="feed" id="feed"></div>
    <div class="wrong-title" id="wrongTitle" style="display:none">📋 本轮错题</div>
    <div id="wrongs"></div>
  </div>
</div>
<script>
var KEY="wewoo-multiply-best";
function loadBest(){try{return JSON.parse(localStorage.getItem(KEY))||0}catch(e){return 0}}
var best=loadBest();
var right=0,wrongs=[],startT=Date.now(),curA=0,curB=0,answered=false;
function renderStats(){
  document.getElementById("sQ").textContent=right;
  document.getElementById("sBest").textContent=best>0?best+"s":"—";
  document.getElementById("sTime").textContent=Math.round((Date.now()-startT)/1000)+"s";
}
function newQ(){
  curA=1+Math.floor(Math.random()*9);curB=1+Math.floor(Math.random()*9);
  document.getElementById("q").textContent=curA+" × "+curB+" = ?";
  document.getElementById("ans").value="";
  document.getElementById("feed").className="feed";
  answered=false;
  document.getElementById("goBtn").textContent="提交";
  document.getElementById("ans").focus();
}
function renderWrongs(){
  document.getElementById("wrongTitle").style.display=wrongs.length?"block":"none";
  var html="";
  wrongs.forEach(function(w){
    var m=w.match(/（你答 (\d+)）/);
    var clean=w.replace(/（你答.*?）/,"");
    html+='<div class="wrong"><span>'+clean+'</span><b>你答 '+(m?m[1]:"")+'</b></div>';
  });
  document.getElementById("wrongs").innerHTML=html;
}
function finishRound(){
  var secs=Math.round((Date.now()-startT)/1000);
  if(best===0||secs<best){best=secs;localStorage.setItem(KEY,JSON.stringify(best))}
  document.getElementById("feed").className="feed show ok";
  document.getElementById("feed").textContent="🎉 完成 10 题！用时 "+secs+"s"+(best===secs?"（新纪录！）":"");
  right=0;wrongs=[];startT=Date.now();
  renderWrongs();renderStats();
  setTimeout(newQ,1600);
}
function submit(){
  if(answered){newQ();return}
  var v=parseInt(document.getElementById("ans").value);
  if(isNaN(v))return;
  var correct=curA*curB;
  answered=true;
  var fb=document.getElementById("feed");
  if(v===correct){
    right++;
    fb.className="feed show ok";fb.textContent="✅ 答对啦！"+curA+"×"+curB+"="+correct;
  }else{
    wrongs.push(curA+"×"+curB+"="+correct+"（你答 "+v+"）");
    fb.className="feed show no";fb.textContent="❌ 正确答案："+curA+"×"+curB+"="+correct;
  }
  renderWrongs();
  document.getElementById("goBtn").textContent="下一题";
  renderStats();
  if(v===correct&&right>=10)setTimeout(finishRound,600);
}
document.getElementById("goBtn").onclick=submit;
document.getElementById("ans").addEventListener("keydown",function(e){if(e.key==="Enter")submit()});
newQ();renderStats();
</script>
</body>
</html>`,
    thumbnailGradient: "linear-gradient(135deg, #fa8231, #f7b731)",
    createdAt: "2026-07-13T10:00:00Z",
    description: "随机出题，计时答题，小学生口算练习神器",
  },
  {
    id: "12",
    title: "冰箱食材管理",
    author: "持家白领丽丽",
    authorId: "user-004",
    category: "生活",
    visibility: "public",
    code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>冰箱食材管理</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(160deg,#f0f9ff,#ecfeff);min-height:100vh;padding:16px;color:#1e293b}
  .wrap{max-width:420px;margin:0 auto}
  h1{font-size:20px;font-weight:800;color:#0369a1;text-align:center;margin-bottom:2px}
  .sub{font-size:12px;color:#94a3b8;text-align:center;margin-bottom:14px}
  .alerts{display:flex;gap:8px;margin-bottom:12px}
  .alert{flex:1;background:#fff;border-radius:12px;padding:10px;text-align:center;box-shadow:0 2px 8px rgba(3,105,161,.06)}
  .alert .num{font-size:20px;font-weight:800}
  .alert .lbl{font-size:11px;color:#94a3b8;margin-top:2px}
  .alert.exp .num{color:#dc2626}.alert.warn .num{color:#f59e0b}.alert.ok .num{color:#10b981}
  .card{background:#fff;border-radius:16px;padding:16px;margin-bottom:12px;box-shadow:0 4px 16px rgba(3,105,161,.08)}
  .card h3{font-size:14px;color:#0369a1;margin-bottom:10px}
  .row{display:flex;gap:8px;margin-bottom:10px}
  .row input{flex:1;min-height:44px;border:1.5px solid #e2e8f0;border-radius:10px;padding:0 12px;font-size:16px;outline:none;background:#f8fafc}
  .row input:focus{border-color:#0ea5e9;background:#fff}
  .btn{width:100%;min-height:46px;border:0;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#fff;transition:transform .1s}
  .btn:active{transform:scale(.97)}
  .item{display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid #f1f5f9}
  .item:last-child{border-bottom:0}
  .item .ico{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
  .item.exp .ico{background:#fee2e2}.item.warn .ico{background:#fef3c7}.item.ok .ico{background:#d1fae5}
  .item .body{flex:1;min-width:0}
  .item .name{font-size:15px;font-weight:700;color:#334155}
  .item .meta{font-size:12px;margin-top:2px}
  .item.exp .meta{color:#dc2626;font-weight:600}
  .item.warn .meta{color:#b45309;font-weight:600}
  .item.ok .meta{color:#94a3b8}
  .item button{min-width:34px;min-height:34px;border:0;border-radius:8px;background:#fee2e2;color:#dc2626;font-size:14px;cursor:pointer}
  .empty{font-size:12px;color:#cbd5e1;text-align:center;padding:12px 0}
</style>
</head>
<body>
<div class="wrap">
  <h1>🧊 冰箱食材管理</h1>
  <p class="sub">录入食材与保质期，快过期自动提醒（自动保存）</p>
  <div class="alerts">
    <div class="alert exp"><div class="num" id="cExp">0</div><div class="lbl">已过期</div></div>
    <div class="alert warn"><div class="num" id="cWarn">0</div><div class="lbl">快过期</div></div>
    <div class="alert ok"><div class="num" id="cOk">0</div><div class="lbl">新鲜</div></div>
  </div>
  <div class="card">
    <h3>✏️ 添加食材</h3>
    <div class="row">
      <input id="name" placeholder="食材名称，如：牛奶" style="flex:1.6">
      <input id="qty" placeholder="数量" style="flex:.7">
    </div>
    <div class="row"><input id="exp" type="date" style="flex:1"></div>
    <button class="btn" id="addBtn">添加</button>
  </div>
  <div class="card">
    <h3>📋 食材清单（按紧急程度排序）</h3>
    <div id="list"></div>
  </div>
</div>
<script>
var KEY="wewoo-fridge";
function load(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}}
var list=load();if(!Array.isArray(list))list=[];
function save(){localStorage.setItem(KEY,JSON.stringify(list))}
function today(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
document.getElementById("exp").value=today();
function daysLeft(exp){
  var a=new Date(exp),b=new Date(today());
  return Math.round((a-b)/86400000);
}
function stateOf(exp){
  var d=daysLeft(exp);
  if(d<0)return "exp";
  if(d<=3)return "warn";
  return "ok";
}
function add(){
  var name=document.getElementById("name").value.trim();
  var qty=document.getElementById("qty").value.trim()||"1";
  var exp=document.getElementById("exp").value||today();
  if(!name){document.getElementById("name").focus();return}
  list.push({name:name,qty:qty,exp:exp});
  save();
  document.getElementById("name").value="";document.getElementById("qty").value="";
  render();
}
function del(i){list.splice(i,1);save();render()}
function render(){
  var expN=0,warnN=0,okN=0;
  list.forEach(function(it){
    var s=stateOf(it.exp);
    if(s==="exp")expN++;else if(s==="warn")warnN++;else okN++;
  });
  document.getElementById("cExp").textContent=expN;
  document.getElementById("cWarn").textContent=warnN;
  document.getElementById("cOk").textContent=okN;
  var box=document.getElementById("list");
  if(list.length===0){box.innerHTML='<div class="empty">还没有食材，先添加吧</div>';return}
  var sorted=list.map(function(it,i){return {it:it,i:i,s:stateOf(it.exp)}})
    .sort(function(a,b){var o={exp:0,warn:1,ok:2};return o[a.s]-o[b.s]});
  box.innerHTML="";
  sorted.forEach(function(x){
    var d=document.createElement("div");d.className="item "+x.s;
    var ico=x.s==="exp"?"⚠️":(x.s==="warn"?"⏰":"✅");
    var meta;
    if(x.s==="exp")meta="已过期 "+(-daysLeft(x.exp))+" 天";
    else if(x.s==="warn")meta="还有 "+daysLeft(x.exp)+" 天到期";
    else meta="保质期至 "+x.it.exp;
    d.innerHTML='<div class="ico">'+ico+'</div>'+
      '<div class="body"><div class="name">'+x.it.name+'</div>'+
      '<div class="meta">'+x.it.qty+' · '+meta+'</div></div>';
    var b=document.createElement("button");b.textContent="×";b.onclick=function(){del(x.i)};
    d.appendChild(b);box.appendChild(d);
  });
}
document.getElementById("addBtn").onclick=add;
render();
</script>
</body>
</html>`,
    thumbnailGradient: "linear-gradient(135deg, #43e97b, #38f9d7)",
    createdAt: "2026-07-12T15:00:00Z",
    description: "录入食材和保质期，快过期时自动提醒不浪费",
  },
  {
    id: "13",
    title: "旅行分账 Pro 版",
    author: "省钱达人阿杰",
    authorId: "user-005",
    category: "旅行",
    visibility: "public",
    code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>旅行分账 Pro 版</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(160deg,#f5f3ff,#eef2ff);min-height:100vh;padding:16px;color:#1e293b}
  .wrap{max-width:440px;margin:0 auto}
  h1{font-size:20px;font-weight:800;color:#4c1d95;text-align:center;margin-bottom:2px}
  .sub{font-size:12px;color:#94a3b8;text-align:center;margin-bottom:14px}
  .card{background:#fff;border-radius:16px;padding:16px;margin-bottom:12px;box-shadow:0 4px 16px rgba(76,29,149,.08)}
  .card h3{font-size:14px;color:#4c1d95;margin-bottom:10px}
  .row{display:flex;gap:8px;margin-bottom:10px}
  .row input{flex:1;min-height:44px;border:1.5px solid #e2e8f0;border-radius:10px;padding:0 12px;font-size:16px;outline:none;background:#f8fafc}
  .row input:focus{border-color:#7c3aed;background:#fff}
  .row select{min-height:44px;border:1.5px solid #e2e8f0;border-radius:10px;padding:0 10px;font-size:14px;outline:none;background:#f8fafc;flex:1}
  .btn{width:100%;min-height:46px;border:0;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;transition:transform .1s}
  .btn:active{transform:scale(.97)}
  .btn.mini{flex:none;width:88px;min-height:44px}
  .members{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}
  .member{min-height:38px;padding:0 12px;border-radius:99px;border:1.5px solid #e2e8f0;background:#fff;font-size:13px;color:#64748b;cursor:pointer}
  .member.on{background:#7c3aed;color:#fff;border-color:#7c3aed;font-weight:700}
  .member.x{color:#dc2626;background:#fee2e2;border-color:#fecaca}
  .split{font-size:12px;color:#94a3b8;margin-bottom:8px}
  .rec{display:flex;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid #f1f5f9;font-size:13px}
  .rec:last-child{border-bottom:0}
  .rec .info{flex:1}
  .rec .info b{color:#334155}
  .rec .info small{display:block;color:#94a3b8;font-size:11px}
  .rec .amt{font-weight:700;color:#7c3aed}
  .rec button{min-width:32px;min-height:32px;border:0;border-radius:8px;background:#fee2e2;color:#dc2626;font-size:13px;cursor:pointer}
  .settle{background:#f5f3ff;border:1.5px solid #ddd6fe;border-radius:12px;padding:12px}
  .settle .li{display:flex;justify-content:space-between;font-size:13px;padding:5px 0;border-bottom:1px dashed #e9d5ff}
  .settle .li:last-child{border-bottom:0}
  .settle .li b{color:#6d28d9}
  .settle .tip{font-size:11px;color:#94a3b8;margin-top:6px;text-align:center}
  .empty{font-size:12px;color:#cbd5e1;text-align:center;padding:10px 0}
</style>
</head>
<body>
<div class="wrap">
  <h1>💸 旅行分账 Pro</h1>
  <p class="sub">多人多笔消费 · 自动算清谁给谁钱 · 自动保存</p>
  <div class="card">
    <h3>👥 成员管理</h3>
    <div class="row"><input id="mName" placeholder="成员名，如：小明"><button class="btn mini" id="addM">添加</button></div>
    <div class="members" id="members"></div>
  </div>
  <div class="card">
    <h3>✏️ 记一笔消费</h3>
    <div class="row"><input id="eDesc" placeholder="消费内容，如：晚餐" style="flex:1.4"><input id="eAmt" type="number" inputmode="decimal" placeholder="金额 ¥" style="flex:.9"></div>
    <div class="row"><select id="ePayer"></select></div>
    <div class="split">分摊给：<span id="splitHint">默认全部成员</span></div>
    <div class="members" id="splitSel"></div>
    <button class="btn" id="addE">添加消费</button>
  </div>
  <div class="card">
    <h3>🧾 消费记录</h3>
    <div id="records"></div>
  </div>
  <div class="card">
    <h3>🤝 结算建议</h3>
    <div class="settle" id="settle"></div>
  </div>
</div>
<script>
var KEY="wewoo-travel-pro";
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{m:[],e:[]}}catch(e){return{m:[],e:[]}}}
var data=load();if(!Array.isArray(data.m))data.m=[];if(!Array.isArray(data.e))data.e=[];
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
var payerEl=document.getElementById("ePayer");
function renderMembers(){
  var box=document.getElementById("members");box.innerHTML="";
  data.m.forEach(function(name,i){
    var b=document.createElement("button");b.className="member on";b.textContent=name;
    box.appendChild(b);
    var x=document.createElement("button");x.className="member x";x.textContent="×";
    x.onclick=function(){
      data.m.splice(i,1);
      data.e=data.e.filter(function(e){return e.payer!==name});
      save();renderMembers();renderAll();
    };
    box.appendChild(x);
  });
  if(data.m.length===0)box.innerHTML='<div class="empty">先添加成员</div>';
  payerEl.innerHTML="";
  data.m.forEach(function(name){
    var o=document.createElement("option");o.value=name;o.textContent=name;
    payerEl.appendChild(o);
  });
  renderSplit();
}
function renderSplit(){
  var box=document.getElementById("splitSel");box.innerHTML="";
  data.m.forEach(function(name){
    var b=document.createElement("button");b.className="member on";b.textContent=name;
    b.dataset.on="1";
    b.onclick=function(){
      if(b.dataset.on==="1"){b.dataset.on="0";b.classList.remove("on")}
      else{b.dataset.on="1";b.classList.add("on")}
      updateSplitHint();
    };
    box.appendChild(b);
  });
  updateSplitHint();
}
function updateSplitHint(){
  var n=document.querySelectorAll("#splitSel .member.on").length;
  document.getElementById("splitHint").textContent=n===data.m.length?"全部成员":n+" 个成员";
}
document.getElementById("addM").onclick=function(){
  var n=document.getElementById("mName").value.trim();
  if(!n){document.getElementById("mName").focus();return}
  if(data.m.indexOf(n)>=0){document.getElementById("mName").focus();return}
  data.m.push(n);save();
  document.getElementById("mName").value="";
  renderMembers();
};
document.getElementById("addE").onclick=function(){
  var desc=document.getElementById("eDesc").value.trim();
  var amt=parseFloat(document.getElementById("eAmt").value)||0;
  var payer=payerEl.value;
  if(!desc){document.getElementById("eDesc").focus();return}
  if(amt<=0){document.getElementById("eAmt").focus();return}
  if(!payer)return;
  var split=[];
  document.querySelectorAll("#splitSel .member.on").forEach(function(b){split.push(b.textContent)});
  data.e.unshift({desc:desc,amt:amt,payer:payer,split:split});
  save();
  document.getElementById("eDesc").value="";document.getElementById("eAmt").value="";
  renderAll();
};
function delE(i){data.e.splice(i,1);save();renderAll()}
function renderAll(){renderRecords();renderSettle()}
function renderRecords(){
  var box=document.getElementById("records");
  if(data.e.length===0){box.innerHTML='<div class="empty">还没有消费记录</div>';return}
  box.innerHTML="";
  data.e.forEach(function(it,i){
    var d=document.createElement("div");d.className="rec";
    d.innerHTML='<div class="info"><b>'+it.desc+'</b><small>'+it.payer+' 付 · 分摊给 '+(it.split.length?it.split.join("、"):"全部")+'</small></div>'+
      '<span class="amt">¥'+it.amt.toFixed(2)+'</span>';
    var b=document.createElement("button");b.textContent="×";b.onclick=function(){delE(i)};
    d.appendChild(b);box.appendChild(d);
  });
}
function renderSettle(){
  var box=document.getElementById("settle");
  if(data.m.length===0||data.e.length===0){box.innerHTML='<div class="empty">添加成员和消费后自动生成结算</div>';return}
  var share={},paid={};
  data.m.forEach(function(n){share[n]=0;paid[n]=0});
  data.e.forEach(function(it){
    var parts=it.split&&it.split.length?it.split:data.m.slice();
    parts.forEach(function(p){if(share[p]!==undefined)share[p]+=it.amt/parts.length});
    if(paid[it.payer]!==undefined)paid[it.payer]+=it.amt;
  });
  var bal={};
  data.m.forEach(function(n){bal[n]=Math.round((paid[n]-share[n])*100)/100});
  var html="";
  data.m.forEach(function(n){
    var v=bal[n];
    html+='<div class="li"><span>'+n+'</span><b style="color:'+(v>=0?"#059669":"#dc2626")+'">'+(v>=0?"应收 ¥":"应付 ¥")+Math.abs(v).toFixed(2)+'</b></div>';
  });
  html+='<div class="tip">最少转账次数建议</div>';
  var payList=data.m.filter(function(n){return bal[n]<-0.01}).map(function(n){return {o:n,v:-bal[n]}}).sort(function(a,b){return b.v-a.v});
  var getList=data.m.filter(function(n){return bal[n]>0.01}).map(function(n){return {g:n,v:bal[n]}}).sort(function(a,b){return b.v-a.v});
  var gi=0;
  payList.forEach(function(p){
    while(p.v>0.01&&gi<getList.length){
      var take=Math.min(p.v,getList[gi].v);
      html+='<div class="li"><span>'+p.o+' → '+getList[gi].g+'</span><b>¥'+take.toFixed(2)+'</b></div>';
      p.v=Math.round((p.v-take)*100)/100;
      getList[gi].v=Math.round((getList[gi].v-take)*100)/100;
      if(getList[gi].v<=0.01)gi++;
    }
  });
  box.innerHTML=html;
}
renderMembers();renderAll();
</script>
</body>
</html>`,
    thumbnailGradient: "linear-gradient(135deg, #f093fb, #f5576c)",
    createdAt: "2026-07-22T08:00:00Z",
    description: "基于原版分账计算器，增加了多币种换算功能",
    sourceToolId: "1",
  },
  {
    id: "14",
    title: "小学生古诗词填空",
    author: "语文张老师",
    authorId: "user-003",
    category: "教育",
    visibility: "public",
    code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>小学生古诗词填空</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(160deg,#fefce8,#fff7ed);min-height:100vh;padding:16px;color:#1e293b}
  .wrap{max-width:420px;margin:0 auto}
  h1{font-size:20px;font-weight:800;color:#a16207;text-align:center;margin-bottom:2px}
  .sub{font-size:12px;color:#94a3b8;text-align:center;margin-bottom:14px}
  .stats{display:flex;gap:8px;margin-bottom:12px}
  .stat{flex:1;background:#fff;border-radius:12px;padding:10px;text-align:center;box-shadow:0 2px 8px rgba(161,98,7,.06)}
  .stat .num{font-size:20px;font-weight:800;color:#ca8a04}
  .stat .lbl{font-size:11px;color:#94a3b8;margin-top:2px}
  .card{background:#fff;border-radius:16px;padding:16px;box-shadow:0 4px 16px rgba(161,98,7,.08)}
  .title2{font-size:13px;color:#a16207;text-align:center;margin-bottom:4px}
  .poem{font-size:22px;font-weight:700;color:#713f12;text-align:center;padding:18px 8px;background:#fffbeb;border-radius:12px;border:1.5px dashed #fde047;margin-bottom:12px;line-height:1.8}
  .poem .blank{display:inline-block;min-width:72px;border-bottom:2px solid #ca8a04;color:#ca8a04;font-weight:800}
  .input{width:100%;min-height:46px;border:1.5px solid #e2e8f0;border-radius:10px;text-align:center;font-size:18px;outline:none;background:#f8fafc;margin-bottom:10px}
  .input:focus{border-color:#ca8a04;background:#fff}
  .btn{width:100%;min-height:46px;border:0;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#ca8a04,#eab308);color:#fff;transition:transform .1s}
  .btn:active{transform:scale(.97)}
  .feed{display:none;font-size:15px;text-align:center;padding:10px;border-radius:12px;margin-top:8px}
  .feed.show{display:block}
  .feed.ok{background:#f0fdf4;color:#15803d}
  .feed.no{background:#fef2f2;color:#b91c1c}
</style>
</head>
<body>
<div class="wrap">
  <h1>📖 小学生古诗词填空</h1>
  <p class="sub">挖空的诗句，你能填对吗？（自动保存成绩）</p>
  <div class="stats">
    <div class="stat"><div class="num" id="sTotal">0</div><div class="lbl">已答</div></div>
    <div class="stat"><div class="num" id="sRight">0</div><div class="lbl">答对</div></div>
    <div class="stat"><div class="num" id="sRate">0%</div><div class="lbl">正确率</div></div>
  </div>
  <div class="card">
    <div class="title2" id="author">—</div>
    <div class="poem" id="poem">—</div>
    <input class="input" id="ans" placeholder="填写空缺的字词" autocomplete="off">
    <button class="btn" id="goBtn">提交</button>
    <div class="feed" id="feed"></div>
  </div>
</div>
<script>
var ITEMS=[
  {a:"李白",p:"床前明月光，疑是地上霜。举头望明月，低头思故（ ）",k:"乡"},
  {a:"骆宾王",p:"鹅鹅鹅，曲项向天歌。白毛浮绿水，红掌拨清（ ）",k:"波"},
  {a:"王之涣",p:"白日依山尽，黄河入海流。欲穷千里目，更上一（ ）楼",k:"层"},
  {a:"李绅",p:"锄禾日当午，汗滴禾下土。谁知盘中餐，粒粒皆辛（ ）",k:"苦"},
  {a:"孟浩然",p:"春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多（ ）",k:"少"},
  {a:"王维",p:"红豆生南国，春来发几枝。愿君多采撷，此物最相（ ）",k:"思"},
  {a:"贺知章",p:"碧玉妆成一树高，万条垂下绿丝绦。不知细叶谁裁出，二月春风似剪（ ）",k:"刀"},
  {a:"杜甫",p:"两个黄鹂鸣翠柳，一行白鹭上青天。窗含西岭千秋雪，门泊东吴万里（ ）",k:"船"},
  {a:"杜牧",p:"远上寒山石径斜，白云生处有人家。停车坐爱枫林晚，霜叶红于二月（ ）",k:"花"},
  {a:"柳宗元",p:"千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江（ ）",k:"雪"},
  {a:"王安石",p:"墙角数枝梅，凌寒独自开。遥知不是雪，为有暗香（ ）",k:"来"},
  {a:"杨万里",p:"泉眼无声惜细流，树阴照水爱晴柔。小荷才露尖尖角，早有蜻蜓立上（ ）",k:"头"},
  {a:"李白",p:"飞流直下三千尺，疑是银河落九（ ）",k:"天"},
  {a:"王翰",p:"葡萄美酒夜光杯，欲饮琵琶马上催。醉卧沙场君莫笑，古来征战几人（ ）",k:"回"}
];
var KEY="wewoo-poem-fill";
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{t:0,r:0}}catch(e){return{t:0,r:0}}}
var data=load();if(typeof data.t!=="number")data.t=0;if(typeof data.r!=="number")data.r=0;
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function refreshStats(){
  document.getElementById("sTotal").textContent=data.t;
  document.getElementById("sRight").textContent=data.r;
  document.getElementById("sRate").textContent=(data.t?Math.round(data.r/data.t*100):0)+"%";
}
var cur=null,answered=false;
function newQ(){
  cur=ITEMS[Math.floor(Math.random()*ITEMS.length)];
  document.getElementById("author").textContent="—— "+cur.a+"《"+(cur.p.split("。")[0].slice(0,4))+"》";
  document.getElementById("poem").innerHTML=cur.p.replace("（ ）",'<span class="blank">____</span>');
  document.getElementById("ans").value="";
  document.getElementById("feed").className="feed";
  answered=false;
  document.getElementById("goBtn").textContent="提交";
  document.getElementById("ans").focus();
}
function submit(){
  if(answered){newQ();return}
  var v=document.getElementById("ans").value.trim();
  if(!v)return;
  var ok=v===cur.k;
  data.t++;if(ok)data.r++;save();refreshStats();
  document.getElementById("poem").innerHTML=cur.p.replace("（ ）",'<span class="blank" style="color:#15803d;border-color:#22c55e">'+cur.k+'</span>');
  var fb=document.getElementById("feed");
  fb.className="feed show "+(ok?"ok":"no");
  fb.textContent=ok?"✅ 太棒了，答对了！":"❌ 正确答案是："+cur.k;
  answered=true;
  document.getElementById("goBtn").textContent="下一题";
}
document.getElementById("goBtn").onclick=submit;
document.getElementById("ans").addEventListener("keydown",function(e){if(e.key==="Enter")submit()});
refreshStats();newQ();
</script>
</body>
</html>`,
    thumbnailGradient: "linear-gradient(135deg, #43e97b, #38f9d7)",
    createdAt: "2026-07-22T09:00:00Z",
    description: "改编自古诗词随机抽查，改为填空模式更适合作业",
    sourceToolId: "3",
  },  {
    id: "15",
    title: "科学计算器 Pro",
    author: "数学课代表",
    authorId: "user-005",
    category: "工程计算",
    visibility: "public",
    code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>科学计算器 · 安全版</title>
    <style>
        * {margin:0;padding:0;box-sizing:border-box;user-select:none}
        body {font-family:'Segoe UI','PingFang SC',Roboto,'Helvetica Neue',sans-serif;min-height:100vh;display:flex;justify-content:center;align-items:center;background:linear-gradient(145deg,#0d0d2b 0%,#1a1a4e 40%,#2d1b4e 80%,#1a0f2e 100%);padding:16px}
        .calculator {width:100%;max-width:400px;background:rgba(255,255,255,.06);backdrop-filter:blur(24px) saturate(1.2);-webkit-backdrop-filter:blur(24px) saturate(1.2);border-radius:32px;padding:20px 18px 22px;box-shadow:0 30px 80px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.06) inset,0 0 0 1px rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.05);transition:transform .2s ease}
        .display {background:rgba(0,0,0,.45);border-radius:18px;padding:14px 18px 12px;margin-bottom:16px;min-height:100px;border:1px solid rgba(255,255,255,.06);box-shadow:inset 0 4px 20px rgba(0,0,0,.3);display:flex;flex-direction:column;justify-content:flex-end;position:relative}
        .display-top {display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
        .mode-indicator {font-size:13px;font-weight:600;color:rgba(120,200,255,.85);background:rgba(0,150,255,.12);padding:2px 12px;border-radius:20px;letter-spacing:.5px;border:1px solid rgba(120,200,255,.15);cursor:default}
        .mode-indicator:active {opacity:.6}
        .memory-indicator {font-size:13px;color:rgba(255,200,100,.7);background:rgba(255,200,100,.08);padding:2px 12px;border-radius:20px;border:1px solid rgba(255,200,100,.1);display:none}
        .memory-indicator.active {display:inline-block}
        .expression {font-size:18px;color:rgba(200,210,230,.75);text-align:right;min-height:28px;word-break:break-all;padding:2px 0;font-family:'Courier New',monospace;letter-spacing:.5px;transition:color .2s;line-height:1.4}
        .expression .cursor-blink {display:inline-block;width:2px;height:22px;background:rgba(200,210,230,.4);margin-left:2px;vertical-align:text-bottom;animation:blink 1s step-end infinite}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        .result {font-size:38px;font-weight:700;color:#f0f4ff;text-align:right;min-height:48px;padding:2px 0 0;font-family:'Courier New',monospace;letter-spacing:.5px;text-shadow:0 0 30px rgba(100,180,255,.08);transition:color .25s ease;line-height:1.2}
        .result.error {color:#ff6b7a;font-size:28px}
        .result.success {color:#7ae0b0}
        .buttons {display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
        .btn {padding:14px 0;border:none;border-radius:14px;font-size:18px;font-weight:600;cursor:pointer;transition:all .15s ease;background:rgba(255,255,255,.06);color:#d0d8e8;border:1px solid rgba(255,255,255,.04);box-shadow:0 4px 12px rgba(0,0,0,.15),inset 0 1px 0 rgba(255,255,255,.04);font-family:'Segoe UI','PingFang SC',sans-serif;position:relative;overflow:hidden;min-height:52px;display:flex;align-items:center;justify-content:center}
        .btn::after {content:'';position:absolute;inset:0;background:radial-gradient(circle at 30% 30%,rgba(255,255,255,.04),transparent 70%);pointer-events:none}
        .btn:active {transform:scale(.94);transition-duration:.04s}
        .btn:active::before {content:'';position:absolute;inset:0;background:rgba(255,255,255,.08);border-radius:inherit}
        .btn-number {background:rgba(255,255,255,.07);color:#e8edf5;border-color:rgba(255,255,255,.05)}
        .btn-number:hover {background:rgba(255,255,255,.13)}
        .btn-number:active {background:rgba(255,255,255,.18)}
        .btn-operator {background:rgba(255,170,50,.15);color:#ffb347;border-color:rgba(255,170,50,.1)}
        .btn-operator:hover {background:rgba(255,170,50,.25)}
        .btn-operator:active {background:rgba(255,170,50,.35)}
        .btn-science {background:rgba(80,150,255,.12);color:#8abfff;border-color:rgba(80,150,255,.08);font-size:15px}
        .btn-science:hover {background:rgba(80,150,255,.22)}
        .btn-science:active {background:rgba(80,150,255,.32)}
        .btn-control {background:rgba(255,80,80,.12);color:#ff7a7a;border-color:rgba(255,80,80,.08)}
        .btn-control:hover {background:rgba(255,80,80,.22)}
        .btn-control:active {background:rgba(255,80,80,.32)}
        .btn-equals {background:linear-gradient(145deg,rgba(0,200,150,.25),rgba(0,160,200,.2));color:#5ee0b8;border-color:rgba(0,200,150,.15);font-size:24px;font-weight:700;box-shadow:0 4px 20px rgba(0,200,150,.08)}
        .btn-equals:hover {background:linear-gradient(145deg,rgba(0,200,150,.35),rgba(0,160,200,.3));box-shadow:0 4px 30px rgba(0,200,150,.15)}
        .btn-equals:active {background:linear-gradient(145deg,rgba(0,200,150,.45),rgba(0,160,200,.4))}
        .btn-paren {background:rgba(200,200,255,.06);color:#b0bcdd;border-color:rgba(200,200,255,.05)}
        .btn-paren:hover {background:rgba(200,200,255,.14)}
        .btn-special {background:rgba(200,180,255,.08);color:#c8b8ff;border-color:rgba(200,180,255,.06)}
        .btn-special:hover {background:rgba(200,180,255,.18)}
        .btn-special:active {background:rgba(200,180,255,.28)}
        .memory-bar {display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px}
        .btn-memory {padding:6px 0;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;background:rgba(255,255,255,.04);color:rgba(180,190,210,.5);border:1px solid rgba(255,255,255,.03);transition:all .15s ease;font-family:'Segoe UI','PingFang SC',sans-serif;letter-spacing:.3px}
        .btn-memory:hover {background:rgba(255,255,255,.08);color:rgba(180,190,210,.8)}
        .btn-memory:active {transform:scale(.94)}
        .btn-memory.active {color:rgba(255,200,100,.7);background:rgba(255,200,100,.06);border-color:rgba(255,200,100,.08)}
        @media(max-width:440px){.calculator{padding:14px 12px 16px;border-radius:24px}.btn{font-size:16px;min-height:44px;padding:10px 0;border-radius:12px}.btn-science{font-size:13px}.result{font-size:30px;min-height:38px}.expression{font-size:15px;min-height:22px}.display{padding:10px 14px 10px;min-height:80px;border-radius:14px}.buttons{gap:8px}.btn-equals{font-size:20px}.memory-bar{gap:6px}.btn-memory{font-size:11px;padding:4px 0}}
        @media(max-width:360px){.btn{font-size:14px;min-height:38px;padding:8px 0;border-radius:10px}.btn-science{font-size:11px}.result{font-size:26px;min-height:32px}.expression{font-size:13px}.buttons{gap:6px}.calculator{padding:10px 8px 12px}}
        ::-webkit-scrollbar{width:0;height:0}
        .btn:disabled{opacity:.3;cursor:not-allowed;transform:none!important}
        .btn:disabled::before{display:none!important}
        .hidden{display:none!important}
    </style>
</head>
<body>
<div class="calculator" id="app">
    <div class="display">
        <div class="display-top">
            <span class="mode-indicator" id="modeIndicator">DEG</span>
            <span class="memory-indicator" id="memoryIndicator">M</span>
        </div>
        <div class="expression" id="expressionDisplay">
            <span id="exprText"></span><span class="cursor-blink"></span>
        </div>
        <div class="result" id="resultDisplay">0</div>
    </div>
    <div class="buttons" id="buttonGrid">
        <button class="btn btn-science" data-action="sin(">sin</button>
        <button class="btn btn-science" data-action="cos(">cos</button>
        <button class="btn btn-science" data-action="tan(">tan</button>
        <button class="btn btn-science" data-action="log(">log</button>
        <button class="btn btn-science" data-action="ln(">ln</button>
        <button class="btn btn-science" data-action="sqrt(">√</button>
        <button class="btn btn-science" data-action="^2">x²</button>
        <button class="btn btn-science" data-action="^3">x³</button>
        <button class="btn btn-science" data-action="^">xⁿ</button>
        <button class="btn btn-science" data-action="^-1">1/x</button>
        <button class="btn btn-science" data-action="!">x!</button>
        <button class="btn btn-special" data-action="π">π</button>
        <button class="btn btn-special" data-action="e">e</button>
        <button class="btn btn-science" data-action="10^">EXP</button>
        <button class="btn btn-paren" data-action="(">(</button>
        <button class="btn btn-paren" data-action=")">)</button>
        <button class="btn btn-number" data-action="7">7</button>
        <button class="btn btn-number" data-action="8">8</button>
        <button class="btn btn-number" data-action="9">9</button>
        <button class="btn btn-operator" data-action="÷">÷</button>
        <button class="btn btn-number" data-action="4">4</button>
        <button class="btn btn-number" data-action="5">5</button>
        <button class="btn btn-number" data-action="6">6</button>
        <button class="btn btn-operator" data-action="×">×</button>
        <button class="btn btn-number" data-action="1">1</button>
        <button class="btn btn-number" data-action="2">2</button>
        <button class="btn btn-number" data-action="3">3</button>
        <button class="btn btn-operator" data-action="-">−</button>
        <button class="btn btn-number" data-action="0">0</button>
        <button class="btn btn-number" data-action=".">.</button>
        <button class="btn btn-operator" data-action="+">+</button>
        <button class="btn btn-equals" data-action="=">=</button>
        <button class="btn btn-control" data-action="AC">AC</button>
        <button class="btn btn-control" data-action="←">⌫</button>
        <button class="btn btn-operator" data-action="%">%</button>
        <button class="btn btn-special" data-action="(-)">(-)</button>
    </div>
    <div class="memory-bar">
        <button class="btn-memory" data-action="MC">MC</button>
        <button class="btn-memory" data-action="MR">MR</button>
        <button class="btn-memory" data-action="M+">M+</button>
        <button class="btn-memory" data-action="M-">M-</button>
    </div>
</div>
<script>
(function(){'use strict';
const exprText=document.getElementById('exprText');
const resultDisplay=document.getElementById('resultDisplay');
const modeIndicator=document.getElementById('modeIndicator');
const memoryIndicator=document.getElementById('memoryIndicator');
let expression='',currentResult=0,lastResult=0,memory=0,hasMemory=false,isDegMode=true,justEvaluated=false;
function factorial(n){if(n<0)return NaN;if(!Number.isInteger(n)){const g=[0.99999999999980993,676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];function gamma(z){if(z<.5)return Math.PI/(Math.sin(Math.PI*z)*gamma(1-z));z-=1;let x=g[0];for(let i=1;i<9;i++)x+=g[i]/(z+i);const t=z+7.5;return Math.sqrt(2*Math.PI)*Math.pow(t,z+.5)*Math.exp(-t)*x}return gamma(n+1)}if(n===0||n===1)return 1;let r=1;for(let i=2;i<=n;i++)r*=i;return r}
function deg2rad(d){return d*Math.PI/180}
function sinDeg(x){return Math.sin(deg2rad(x))}
function cosDeg(x){return Math.cos(deg2rad(x))}
function tanDeg(x){return Math.tan(deg2rad(x))}
class Tokenizer{constructor(e){this.expr=e;this.pos=0;this.tokens=[];this.tokenize()}tokenize(){const s=this.expr;let i=0;while(i<s.length){const ch=s[i];if(ch===' '){i++;continue}if(/[0-9.]/.test(ch)){let n='';while(i<s.length&&/[0-9.]/.test(s[i])){n+=s[i];i++}this.tokens.push({type:'NUMBER',value:parseFloat(n)});continue}if(/[a-zA-Z]/.test(ch)){let id='';while(i<s.length&&/[a-zA-Z]/.test(s[i])){id+=s[i];i++}this.tokens.push({type:'IDENTIFIER',value:id});continue}if('+-*/%^!()'.includes(ch)){this.tokens.push({type:ch,value:ch});i++;continue}i++}this.tokens.push({type:'EOF'})}getNext(){if(this.pos<this.tokens.length)return this.tokens[this.pos++];return{type:'EOF'}}peek(){if(this.pos<this.tokens.length)return this.tokens[this.pos];return{type:'EOF'}}}
class Parser{constructor(tokens){this.tokens=tokens;this.current=tokens.getNext()}eat(type){if(this.current.type===type){this.current=this.tokens.getNext();return true}return false}expect(type){if(this.current.type===type){const val=this.current;this.current=this.tokens.getNext();return val}throw new Error('语法错误')}parse(){const val=this.expr();if(this.current.type!=='EOF')throw new Error('表达式错误');return val}expr(){let left=this.term();while(this.current.type==='+'||this.current.type==='-'){const op=this.current.type;this.current=this.tokens.getNext();const right=this.term();if(op==='+')left+=right;else left-=right}return left}term(){let left=this.factor();while(this.current.type==='*'||this.current.type==='/'||this.current.type==='%'){const op=this.current.type;this.current=this.tokens.getNext();const right=this.factor();if(op==='*')left*=right;else if(op==='/'){if(right===0)throw new Error('除以零');left/=right}else left=left*right/100}return left}factor(){let left=this.unary();if(this.current.type==='^'){this.current=this.tokens.getNext();const right=this.factor();left=Math.pow(left,right)}return left}unary(){if(this.current.type==='-'){this.current=this.tokens.getNext();return -this.primary()}else if(this.current.type==='+'){this.current=this.tokens.getNext();return this.primary()}return this.primary()}primary(){const tok=this.current;if(tok.type==='NUMBER'){this.current=this.tokens.getNext();if(this.current.type==='!'){this.current=this.tokens.getNext();return factorial(tok.value)}return tok.value}if(tok.type==='IDENTIFIER'){const name=tok.value;this.current=this.tokens.getNext();if(this.current.type==='('){this.current=this.tokens.getNext();const arg=this.expr();if(this.current.type!==')')throw new Error('缺少右括号');this.current=this.tokens.getNext();return this.applyFunction(name,arg)}else{let val;if(name==='pi')val=Math.PI;else if(name==='e')val=Math.E;else if(name==='ans')val=lastResult;else throw new Error('未知常量:'+name);if(this.current.type==='!'){this.current=this.tokens.getNext();return factorial(val)}return val}}if(tok.type==='('){this.current=this.tokens.getNext();const val=this.expr();if(this.current.type!==')')throw new Error('缺少右括号');this.current=this.tokens.getNext();if(this.current.type==='!'){this.current=this.tokens.getNext();return factorial(val)}return val}throw new Error('意外符号:'+tok.type)}applyFunction(name,arg){switch(name){case'sin':return isDegMode?sinDeg(arg):Math.sin(arg);case'cos':return isDegMode?cosDeg(arg):Math.cos(arg);case'tan':return isDegMode?tanDeg(arg):Math.tan(arg);case'log':return Math.log10(arg);case'ln':return Math.log(arg);case'sqrt':return Math.sqrt(arg);default:throw new Error('未知函数:'+name)}}}
function evaluate(expr){let sanitized=expr.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/π/g,'pi').replace(/Ans/g,'ans');const tokenizer=new Tokenizer(sanitized);const parser=new Parser(tokenizer);const result=parser.parse();if(typeof result!=='number'||!isFinite(result))throw new Error('结果无效');return result}
function updateDisplay(){exprText.textContent=expression||'';if(expression===''){resultDisplay.textContent=currentResult!==0?String(currentResult):'0'}modeIndicator.textContent=isDegMode?'DEG':'RAD';memoryIndicator.classList.toggle('active',hasMemory&&memory!==0)}
function setResult(value,isError){if(isError){resultDisplay.textContent='错误';resultDisplay.className='result error'}else if(typeof value==='number'){if(Number.isInteger(value)&&Math.abs(value)<1e15){resultDisplay.textContent=String(value)}else{let str=String(value);if(str.length>18)str=value.toExponential(8);resultDisplay.textContent=str}resultDisplay.className='result success'}else{resultDisplay.textContent=String(value);resultDisplay.className='result'}}
function setError(msg){resultDisplay.textContent=msg||'错误';resultDisplay.className='result error'}
function appendToExpression(value){if(justEvaluated){const ops=['+','-','×','÷','^','%'];if(ops.includes(value)||value==='^'){expression=String(currentResult);justEvaluated=false}else{expression='';currentResult=0;justEvaluated=false;resultDisplay.textContent='0';resultDisplay.className='result'}}if(expression==='0'&&/^[0-9.]$/.test(value)){if(value==='.')expression='0.';else expression=value;updateDisplay();return}expression+=value;updateDisplay();if(!justEvaluated){resultDisplay.textContent='';resultDisplay.className='result'}justEvaluated=false}
function handleAction(action){if(action==='AC'){expression='';currentResult=0;justEvaluated=false;resultDisplay.textContent='0';resultDisplay.className='result';updateDisplay();return}if(action==='←'){if(justEvaluated){expression='';currentResult=0;justEvaluated=false;resultDisplay.textContent='0';resultDisplay.className='result';updateDisplay();return}const removeTokens=['sin(','cos(','tan(','log(','ln(','sqrt(','10^','(-'];let removed=false;for(const token of removeTokens){if(expression.endsWith(token)){expression=expression.slice(0,-token.length);removed=true;break}}if(!removed)expression=expression.slice(0,-1);updateDisplay();if(expression===''){resultDisplay.textContent='0';resultDisplay.className='result'}else{resultDisplay.textContent='';resultDisplay.className='result'}justEvaluated=false;return}if(action==='='){if(expression.trim()==='')return;try{const result=evaluate(expression);lastResult=currentResult;currentResult=result;setResult(result);justEvaluated=true;updateDisplay()}catch(e){setError('错误');justEvaluated=false;updateDisplay()}return}if(action==='DEG/RAD'){isDegMode=!isDegMode;updateDisplay();if(expression&&!justEvaluated){try{const result=evaluate(expression);currentResult=result;setResult(result)}catch(e){}}return}if(action==='MC'){memory=0;hasMemory=false;updateDisplay();return}if(action==='MR'){if(hasMemory){if(justEvaluated){expression='';currentResult=0;justEvaluated=false;resultDisplay.textContent='0';resultDisplay.className='result'}appendToExpression(String(memory))}return}if(action==='M+'){const val=currentResult||parseFloat(expression)||0;memory+=val;hasMemory=true;updateDisplay();return}if(action==='M-'){const val=currentResult||parseFloat(expression)||0;memory-=val;hasMemory=true;updateDisplay();return}appendToExpression(action)}
document.querySelectorAll('.btn[data-action]').forEach(btn=>{btn.addEventListener('click',function(){handleAction(this.dataset.action)})});
document.querySelectorAll('.btn-memory[data-action]').forEach(btn=>{btn.addEventListener('click',function(){handleAction(this.dataset.action)})});
document.addEventListener('keydown',function(e){const key=e.key;if(/^[0-9.]$/.test(key)){e.preventDefault();handleAction(key);return}const opMap={'+':'+','-':'-','*':'×','/':'÷','^':'^','%':'%'};if(key in opMap){e.preventDefault();handleAction(opMap[key]);return}if(key==='Enter'||key==='='){e.preventDefault();handleAction('=');return}if(key==='Backspace'){e.preventDefault();handleAction('←');return}if(key==='Escape'){e.preventDefault();handleAction('AC');return}if(key==='('){e.preventDefault();handleAction('(');return}if(key===')'){e.preventDefault();handleAction(')');return}const sciMap={'s':'sin(','c':'cos(','t':'tan(','l':'log(','n':'ln(','r':'sqrt(','p':'π','e':'e','x':'^'};if(key in sciMap){e.preventDefault();handleAction(sciMap[key])}});
let backspaceTimer=null;const backspaceBtn=document.querySelector('[data-action="←"]');if(backspaceBtn){const clearFn=function(){backspaceTimer=setTimeout(()=>{handleAction('AC');if(navigator.vibrate)navigator.vibrate(10)},500)};backspaceBtn.addEventListener('mousedown',clearFn);backspaceBtn.addEventListener('mouseup',()=>clearTimeout(backspaceTimer));backspaceBtn.addEventListener('mouseleave',()=>clearTimeout(backspaceTimer));backspaceBtn.addEventListener('touchstart',clearFn);backspaceBtn.addEventListener('touchend',()=>clearTimeout(backspaceTimer));backspaceBtn.addEventListener('touchcancel',()=>clearTimeout(backspaceTimer))}
modeIndicator.addEventListener('dblclick',function(){handleAction('DEG/RAD')});
updateDisplay();resultDisplay.textContent='0';resultDisplay.className='result';
console.log('安全科学计算器已加载')})();
</script>
<script>
(function(){
  // 计算历史（自动保存）：监听表达式/结果变化，记录到 localStorage
  var KEY = 'wewoo-sci-calc-history';
  function loadHist(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}}
  var hist = loadHist();
  var calcEl = document.querySelector('.calculator');
  if(!calcEl) return;
  var panel = document.createElement('div');
  panel.style.cssText = 'margin-top:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:14px';
  panel.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
    '<span style="font-size:13px;color:rgba(200,210,230,.8)">🕘 计算历史（自动保存）</span>' +
    '<button id="wewooHistClear" style="min-height:32px;padding:0 10px;border:0;border-radius:8px;background:rgba(255,80,80,.15);color:#ff7a7a;font-size:12px;cursor:pointer">清空</button></div>' +
    '<div id="wewooHist" style="font-size:12px;color:rgba(255,255,255,.35)"></div>';
  calcEl.appendChild(panel);
  var listEl = document.getElementById('wewooHist');
  function render(){
    if(!hist.length){listEl.innerHTML = '暂无历史'; return}
    listEl.innerHTML = '';
    hist.slice().reverse().forEach(function(h){
      var d = document.createElement('div');
      d.style.cssText = 'display:flex;justify-content:space-between;gap:8px;padding:6px 0;border-bottom:1px dashed rgba(255,255,255,.08);font-size:12px';
      d.innerHTML = '<span style="color:rgba(200,210,230,.7);word-break:break-all">' + h.expr + '</span><b style="color:#7ae0b0;flex-shrink:0">' + h.res + '</b>';
      listEl.appendChild(d);
    });
  }
  var lastExpr = '';
  function check(){
    var r = document.querySelector('.result');
    if(!r) return;
    var txt = r.textContent;
    if(!txt || txt === '0' || r.classList.contains('error')) return;
    var exprEl = document.querySelector('.expression');
    var expr = exprEl ? exprEl.textContent.replace(/[▌|]/g, '') : '';
    if(!expr || expr === lastExpr) return;
    lastExpr = expr;
    hist.push({expr: expr, res: txt});
    if(hist.length > 50) hist = hist.slice(-50);
    try{localStorage.setItem(KEY, JSON.stringify(hist))}catch(e){}
    render();
  }
  setInterval(check, 700);
  document.getElementById('wewooHistClear').onclick = function(){hist = []; try{localStorage.removeItem(KEY)}catch(e){} render()};
  render();
})();
</script></body>
</html>
`,
    thumbnailGradient: "linear-gradient(135deg, #0d0d2b, #2d1b4e)",
    createdAt: "2026-07-29T00:00:00Z",
    description: "安全版科学计算器：四则运算、三角函数、对数指数、幂运算阶乘、记忆功能、键盘支持 | 使用静态解析器，无动态代码执行",
  },
  {
    id: "16",
    title: "密码生成器",
    author: "安全第一",
    authorId: "user-006",
    category: "生活",
    visibility: "public",
    code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>密码生成器</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:linear-gradient(135deg,#1e1b4b,#312e81);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px}
.card{background:#fff;border-radius:24px;padding:28px 24px;width:100%;max-width:380px;box-shadow:0 25px 80px rgba(0,0,0,.25)}
h2{font-size:20px;color:#1e1b4b;margin-bottom:4px;display:flex;align-items:center;gap:8px}
h2 .icon{font-size:24px}
.sub{color:#6b7280;font-size:13px;margin-bottom:20px}
.pw-box{background:#f3f4f6;border-radius:14px;padding:16px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:56px}
.pw-text{font-family:'Courier New',monospace;font-size:18px;font-weight:700;color:#1e1b4b;word-break:break-all;flex:1;user-select:all}
.copy-btn{flex-shrink:0;min-width:44px;min-height:44px;display:flex;align-items:center;justify-content:center;background:#6366f1;color:#fff;border:none;border-radius:10px;cursor:pointer;font-size:16px;transition:all .15s}
.copy-btn:active{transform:scale(.93)}
.copy-btn.copied{background:#10b981}
.strength{margin-bottom:16px}
.strength-bar{height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden;margin-bottom:4px}
.strength-fill{height:100%;border-radius:3px;transition:all .3s}
.strength-label{font-size:12px;color:#6b7280}
.settings{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
.setting{display:flex;align-items:center;gap:8px;font-size:13px;color:#374151;min-height:36px}
.setting input[type="checkbox"]{width:18px;height:18px;accent-color:#6366f1;cursor:pointer}
.setting label{cursor:pointer;user-select:none}
.length-row{display:flex;align-items:center;gap:10px;margin-bottom:16px}
.length-row label{font-size:13px;color:#374151;flex-shrink:0}
.length-row input[type="range"]{flex:1;accent-color:#6366f1}
.length-row .len-val{font-size:14px;font-weight:700;color:#6366f1;min-width:28px;text-align:center}
.gen-btn{width:100%;min-height:48px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:14px;font-size:16px;font-weight:600;cursor:pointer;transition:all .15s}
.gen-btn:active{transform:scale(.97)}
.history{margin-top:16px}
.history h3{font-size:13px;color:#6b7280;margin-bottom:8px}
.history-list{max-height:120px;overflow-y:auto}
.history-item{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:#f9fafb;border-radius:8px;margin-bottom:4px;font-size:12px;font-family:'Courier New',monospace;color:#374151}
.history-item .copy-sm{background:none;border:none;color:#6366f1;cursor:pointer;font-size:12px;padding:4px 8px;border-radius:6px}
.history-item .copy-sm:active{background:#eef2ff}
</style>
</head>
<body>
<div class="card">
<h2><span class="icon">🔐</span>密码生成器</h2>
<p class="sub">一次生成一个高强度随机密码</p>
<div class="pw-box">
<span class="pw-text" id="pw">点击生成</span>
<button class="copy-btn" id="copyBtn" onclick="copyPw()">📋</button>
</div>
<div class="strength">
<div class="strength-bar"><div class="strength-fill" id="bar" style="width:0%"></div></div>
<span class="strength-label" id="label">—</span>
</div>
<div class="settings">
<div class="setting"><input type="checkbox" id="upper" checked onchange="update()"><label for="upper">大写 A-Z</label></div>
<div class="setting"><input type="checkbox" id="lower" checked onchange="update()"><label for="lower">小写 a-z</label></div>
<div class="setting"><input type="checkbox" id="num" checked onchange="update()"><label for="num">数字 0-9</label></div>
<div class="setting"><input type="checkbox" id="sym" onchange="update()"><label for="sym">符号 !@#$</label></div>
</div>
<div class="length-row">
<label>长度</label>
<input type="range" id="len" min="6" max="32" value="16" oninput="updateLen()">
<span class="len-val" id="lenVal">16</span>
</div>
<button class="gen-btn" onclick="generate()">🎲 生成密码</button>
<div class="history">
<h3>📜 生成历史</h3>
<div class="history-list" id="hist"></div>
</div>
</div>
<script>
var histList=JSON.parse(localStorage.getItem('wewoo-pw-hist')||'[]');
var chars={upper:'ABCDEFGHIJKLMNOPQRSTUVWXYZ',lower:'abcdefghijklmnopqrstuvwxyz',num:'0123456789',sym:'!@#$%^&*()-_=+[]{}|;:,.<>?'};

function updateLen(){
document.getElementById('lenVal').textContent=document.getElementById('len').value;
generate()
}

function update(){generate()}

function generate(){
var pool='';
if(document.getElementById('upper').checked)pool+=chars.upper;
if(document.getElementById('lower').checked)pool+=chars.lower;
if(document.getElementById('num').checked)pool+=chars.num;
if(document.getElementById('sym').checked)pool+=chars.sym;
if(!pool){document.getElementById('pw').textContent='请选择字符类型';return}
var len=parseInt(document.getElementById('len').value);
var pw='';
var arr=new Uint32Array(len);
if(window.crypto&&crypto.getRandomValues){crypto.getRandomValues(arr)}else{for(var i=0;i<len;i++)arr[i]=Math.floor(Math.random()*0xFFFFFFFF)}
for(var i=0;i<len;i++)pw+=pool[arr[i]%pool.length];
document.getElementById('pw').textContent=pw;
// Strength
var score=0;
if(pool.length>=26)score++;
if(pool.length>=52)score++;
if(pool.length>=62)score++;
if(pool.length>=70)score++;
if(len>=12)score++;if(len>=16)score++;if(len>=24)score++;
var pct=Math.min(100,Math.round(score/7*100));
var bar=document.getElementById('bar');
bar.style.width=pct+'%';
if(pct<=30){bar.style.background='#ef4444';document.getElementById('label').textContent='弱 — 容易被破解'}
else if(pct<=60){bar.style.background='#f59e0b';document.getElementById('label').textContent='中等 — 还可以更强'}
else if(pct<=85){bar.style.background='#6366f1';document.getElementById('label').textContent='强 — 足够安全'}
else {bar.style.background='#10b981';document.getElementById('label').textContent='极强 — 非常安全'}
// History
histList.unshift(pw);
if(histList.length>10)histList.pop();
localStorage.setItem('wewoo-pw-hist',JSON.stringify(histList));
renderHistory()
}

function copyPw(){
var pw=document.getElementById('pw').textContent;
if(pw==='点击生成')return;
navigator.clipboard.writeText(pw).then(function(){
var btn=document.getElementById('copyBtn');
btn.textContent='✓';btn.classList.add('copied');
setTimeout(function(){btn.textContent='📋';btn.classList.remove('copied')},1500)
}).catch(function(){})
}

function renderHistory(){
var h=document.getElementById('hist');
h.innerHTML=histList.map(function(p,i){return '<div class="history-item"><span>'+p.substring(0,24)+(p.length>24?'…':'')+'</span><button class="copy-sm" onclick="copyHistory('+i+')">复制</button></div>'}).join('')
}
function copyHistory(i){
navigator.clipboard.writeText(histList[i]).catch(function(){})
}

generate()
</script>
</body>
</html>`,
    thumbnailGradient: "linear-gradient(135deg, #1e1b4b, #312e81)",
    createdAt: "2026-07-23T11:00:00Z",
    description: "一键生成高强度随机密码，支持大小写数字符号组合，显示密码强度评级",
  },
  {
    id: "17",
    title: "AI 回复格式转换器",
    author: "微坞创作者",
    authorId: "user-000",
    category: "生活",
    visibility: "public",
    code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>AI回复格式转换器</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#f5f5f5;min-height:100vh;padding:16px;color:#333}
.app{max-width:600px;margin:0 auto}
h1{font-size:20px;margin-bottom:16px;color:#1a1a2e}
.tabs{display:flex;gap:4px;background:#e5e7eb;border-radius:10px;padding:4px;margin-bottom:12px}
.tab{flex:1;padding:10px 8px;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;background:transparent;color:#666;transition:all .2s}
.tab.active{background:#fff;color:#4f6ef7;box-shadow:0 1px 4px rgba(0,0,0,.1)}
textarea{width:100%;min-height:200px;padding:14px;border:2px solid #e5e7eb;border-radius:12px;font-size:15px;line-height:1.7;resize:vertical;font-family:monospace;background:#fff;outline:none;transition:border .2s}
textarea:focus{border-color:#4f6ef7}
.actions{display:flex;gap:8px;margin:12px 0;flex-wrap:wrap}
.btn{padding:10px 20px;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s}
.btn-primary{background:#4f6ef7;color:#fff}
.btn-primary:hover{background:#3a56d4}
.btn-outline{background:#fff;color:#666;border:2px solid #e5e7eb}
.btn-outline:hover{border-color:#4f6ef7;color:#4f6ef7}
.preview{background:#fff;border:2px solid #e5e7eb;border-radius:12px;padding:20px;min-height:120px;line-height:1.8;font-size:15px;white-space:pre-wrap;word-break:break-all}
.preview.empty{color:#999;display:flex;align-items:center;justify-content:center}
.preview strong{color:#1a1a2e}
.preview em{color:#555}
.preview code{background:#f0f0f0;padding:2px 6px;border-radius:4px;font-size:13px}
.info{font-size:12px;color:#999;margin-top:8px;text-align:center}
</style>
</head>
<body>
<div class="app">
<h1>AI回复格式转换器</h1>

<div class="tabs">
  <button class="tab active" onclick="switchTab('input')">输入</button>
  <button class="tab" onclick="switchTab('output')">预览/输出</button>
</div>

<textarea id="inputArea" placeholder="粘贴AI回复内容（支持Markdown标记）..."></textarea>

<div class="actions">
  <button class="btn btn-primary" onclick="convert()">转换格式</button>
  <button class="btn btn-outline" onclick="copyText()">复制结果</button>
  <button class="btn btn-outline" onclick="clearAll()">清空</button>
</div>

<div class="preview empty" id="preview">转换后的内容将显示在这里</div>
<div class="info">支持：去掉Markdown标记 | 统一换行 | 整理列表 | 一键复制</div>
</div>

<script>
let convertedText = '';
let tab = 'input';

function switchTab(t) {
  tab = t;
  document.querySelectorAll('.tab').forEach((b,i)=>b.classList.toggle('active',i===(t==='input'?0:1)));
  if (t==='output' && convertedText) {
    document.getElementById('preview').textContent = convertedText;
    document.getElementById('preview').classList.remove('empty');
  }
}

function convert() {
  const raw = document.getElementById('inputArea').value.trim();
  if (!raw) { document.getElementById('preview').textContent='请先输入内容';return; }

  let text = raw;

  // 去掉代码块
  text = text.replace(/\`\`\`[\\s\\S]*?\`\`\`/g, (m) => {
    const code = m.replace(/\`\`\`\\w*/g,'').trim();
    return '\\n【代码】\\n' + code + '\\n';
  });

  // 标题 → 加粗
  text = text.replace(/^#{1,3}\\s+(.+)/gm, (_,t) => '\\n【' + t.trim() + '】');

  // 粗体
  text = text.replace(/\\*\\*(.+?)\\*\\*/g, (_,t) => '『' + t + '』');

  // 斜体
  text = text.replace(/\\*(.+?)\\*/g, (_,t) => '「' + t + '」');

  // 有序列表
  text = text.replace(/^\\d+\\.\\s+/gm, '· ');

  // 无序列表
  text = text.replace(/^[\\-\\*\\+]\\s+/gm, '· ');

  // 行内代码
  text = text.replace(/\`([^\`]+)\`/g, (_,t) => '『' + t + '』');

  // 链接 [text](url) → 只留文字
  text = text.replace(/\\[([^\\]]+)\\]\\([^)]+\\)/g, '\$1');

  // 图片 → 移除
  text = text.replace(/!\\[.*?\\]\\(.*?\\)/g, '[图片]');

  // 去掉多余空行（2个以上换行合并为2个）
  text = text.replace(/\\n{3,}/g, '\\n\\n');

  // 去掉行首尾空格
  text = text.split('\\n').map(l=>l.trim()).join('\\n');

  // 去掉残留的反引号和星号
  text = text.replace(/[*\`~]/g, '');

  convertedText = text;
  document.getElementById('preview').textContent = text;
  document.getElementById('preview').classList.remove('empty');

  // 自动切到预览
  document.getElementById('inputArea').style.display='none';
  document.querySelector('.actions').style.display='none';
  document.querySelectorAll('.tab').forEach((b,i)=>b.classList.toggle('active',i===1));
}

function copyText() {
  if (!convertedText) { convert(); if (!convertedText) return; }
  navigator.clipboard.writeText(convertedText).then(()=>{
    const btn=event.target;
    const orig=btn.textContent;
    btn.textContent='已复制!';
    btn.style.background='#10b981';
    btn.style.color='#fff';
    setTimeout(()=>{btn.textContent=orig;btn.style.background='';btn.style.color=''},1500);
  });
}

function clearAll() {
  document.getElementById('inputArea').value='';
  document.getElementById('preview').textContent='转换后的内容将显示在这里';
  document.getElementById('preview').classList.add('empty');
  convertedText='';
  document.getElementById('inputArea').style.display='';
  document.querySelector('.actions').style.display='';
  document.querySelectorAll('.tab').forEach((b,i)=>b.classList.toggle('active',i===0));
}
<script>
// 记忆：输入内容自动保存，刷新/重进不丢
(function(){
  var KEY = 'wewoo-ai-format-input';
  var ta = document.getElementById('inputArea');
  if(!ta) return;
  try{ ta.value = localStorage.getItem(KEY) || ''; }catch(e){}
  var timer = null;
  ta.addEventListener('input', function(){
    clearTimeout(timer);
    timer = setTimeout(function(){ try{ localStorage.setItem(KEY, ta.value); }catch(e){} }, 500);
  });
})();
</script></script>
</body>
</html>

`,
    thumbnailGradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    createdAt: "2026-07-29T12:51:06.632Z",
    description: "一键转换AI生成的Markdown/代码块为微信/飞书可读格式，修复PDF复制空白问题",
  },
  {
    id: "18",
    title: "螺纹参数查询",
    author: "微坞创作者",
    authorId: "user-000",
    category: "工程计算",
    visibility: "public",
    code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>螺纹参数查询工具</title>
    <style>
        /* ===== 全局重置 ===== */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', 'PingFang SC', Roboto, 'Helvetica Neue', sans-serif;
            background: #f0f4f8;
            color: #1e293b;
            padding: 24px;
            min-height: 100vh;
            display: flex;
            justify-content: center;
        }

        .app-container {
            max-width: 1280px;
            width: 100%;
        }

        /* ===== 头部 ===== */
        .header {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            color: #f1f5f9;
            padding: 32px 40px;
            border-radius: 20px;
            margin-bottom: 32px;
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.25);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .header-icon {
            font-size: 38px;
            line-height: 1;
        }

        .header-title h1 {
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 0.5px;
            background: linear-gradient(to right, #60a5fa, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .header-title p {
            font-size: 14px;
            color: #94a3b8;
            margin-top: 4px;
            -webkit-text-fill-color: #94a3b8;
        }

        .header-badge {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(4px);
            padding: 8px 20px;
            border-radius: 40px;
            font-size: 13px;
            color: #cbd5e1;
            border: 1px solid rgba(255, 255, 255, 0.06);
            white-space: nowrap;
        }

        .header-badge span {
            color: #60a5fa;
            font-weight: 600;
        }

        /* ===== 查询区 ===== */
        .search-section {
            background: #ffffff;
            border-radius: 16px;
            padding: 28px 32px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            margin-bottom: 28px;
            display: flex;
            flex-wrap: wrap;
            align-items: flex-end;
            gap: 20px 24px;
            border: 1px solid #e9edf2;
        }

        .search-group {
            flex: 1 1 200px;
            min-width: 160px;
        }

        .search-group label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: #475569;
            margin-bottom: 6px;
            letter-spacing: 0.3px;
        }

        .search-group select,
        .search-group input {
            width: 100%;
            padding: 10px 14px;
            font-size: 15px;
            border: 1.5px solid #d1d9e6;
            border-radius: 10px;
            background: #fafcff;
            color: #1e293b;
            transition: border-color 0.2s, box-shadow 0.2s;
            outline: none;
            font-family: inherit;
            appearance: auto;
        }

        .search-group select:focus,
        .search-group input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
            background: #ffffff;
        }

        .search-group select option {
            padding: 6px;
        }

        .search-btn {
            background: #3b82f6;
            color: #fff;
            border: none;
            padding: 10px 32px;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s, transform 0.1s;
            font-family: inherit;
            white-space: nowrap;
            height: 46px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .search-btn:hover {
            background: #2563eb;
        }

        .search-btn:active {
            transform: scale(0.97);
        }

        .search-btn svg {
            width: 18px;
            height: 18px;
            fill: none;
            stroke: currentColor;
            stroke-width: 2.5;
            stroke-linecap: round;
            stroke-linejoin: round;
        }

        .search-group .hint {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 4px;
            padding-left: 4px;
        }

        /* ===== 结果卡片 ===== */
        .result-section {
            margin-bottom: 32px;
            min-height: 60px;
        }

        .result-card {
            background: #ffffff;
            border-radius: 16px;
            padding: 0;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
            border: 1px solid #e9edf2;
            overflow: hidden;
            display: none;
            animation: slideUp 0.35s ease;
        }

        .result-card.active {
            display: block;
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(16px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .result-header {
            background: #f8fafc;
            padding: 20px 28px;
            border-bottom: 1px solid #e9edf2;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
        }

        .result-header .spec-name {
            font-size: 24px;
            font-weight: 700;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .result-header .spec-name .type-tag {
            font-size: 13px;
            font-weight: 600;
            color: #3b82f6;
            background: #dbeafe;
            padding: 2px 14px;
            border-radius: 40px;
            letter-spacing: 0.3px;
        }

        .result-header .copy-btn {
            background: transparent;
            border: 1px solid #d1d9e6;
            padding: 6px 16px;
            border-radius: 8px;
            font-size: 13px;
            color: #475569;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .result-header .copy-btn:hover {
            background: #f1f5f9;
            border-color: #94a3b8;
        }

        .result-body {
            padding: 28px 28px 32px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 20px 32px;
        }

        .result-item {
            display: flex;
            flex-direction: column;
        }

        .result-item .label {
            font-size: 13px;
            font-weight: 500;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            margin-bottom: 4px;
        }

        .result-item .value {
            font-size: 26px;
            font-weight: 700;
            color: #0f172a;
            display: flex;
            align-items: baseline;
            gap: 4px;
        }

        .result-item .value .unit {
            font-size: 15px;
            font-weight: 400;
            color: #94a3b8;
            margin-left: 4px;
        }

        .result-item .value .sub {
            font-size: 16px;
            font-weight: 400;
            color: #64748b;
        }

        .result-item .desc {
            font-size: 13px;
            color: #94a3b8;
            margin-top: 2px;
        }

        .result-item.highlight .value {
            color: #2563eb;
        }

        .result-item.highlight .label {
            color: #2563eb;
        }

        /* ===== 数据表格 ===== */
        .table-section {
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e9edf2;
            overflow: hidden;
        }

        .table-header {
            padding: 18px 24px;
            background: #f8fafc;
            border-bottom: 1px solid #e9edf2;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
        }

        .table-header h3 {
            font-size: 17px;
            font-weight: 600;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .table-header .count-badge {
            background: #e2e8f0;
            color: #475569;
            font-size: 13px;
            font-weight: 600;
            padding: 0 12px;
            border-radius: 40px;
            height: 26px;
            display: inline-flex;
            align-items: center;
        }

        .table-wrapper {
            overflow-x: auto;
            padding: 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
            min-width: 600px;
        }

        thead {
            background: #f1f5f9;
        }

        thead th {
            padding: 14px 18px;
            text-align: left;
            font-weight: 600;
            color: #334155;
            font-size: 13px;
            letter-spacing: 0.3px;
            border-bottom: 2px solid #d1d9e6;
            white-space: nowrap;
        }

        thead th:first-child {
            padding-left: 24px;
        }

        tbody td {
            padding: 13px 18px;
            border-bottom: 1px solid #edf2f7;
            color: #1e293b;
            white-space: nowrap;
        }

        tbody td:first-child {
            padding-left: 24px;
            font-weight: 600;
            color: #0f172a;
        }

        tbody tr:hover {
            background: #f8fafc;
        }

        tbody tr:last-child td {
            border-bottom: none;
        }

        .table-type-tag {
            display: inline-block;
            font-size: 11px;
            font-weight: 600;
            padding: 2px 12px;
            border-radius: 40px;
            background: #dbeafe;
            color: #2563eb;
        }

        .table-type-tag.fine {
            background: #e0e7ff;
            color: #4f46e5;
        }

        .table-type-tag.unc {
            background: #fce7f3;
            color: #be185d;
        }

        .table-type-tag.unf {
            background: #fdf2f8;
            color: #b91c1c;
        }

        .empty-state {
            text-align: center;
            padding: 48px 20px;
            color: #94a3b8;
        }

        .empty-state .emoji {
            font-size: 48px;
            display: block;
            margin-bottom: 12px;
        }

        .empty-state p {
            font-size: 16px;
        }

        /* ===== 响应式 ===== */
        @media (max-width: 768px) {
            body {
                padding: 12px;
            }

            .header {
                padding: 20px 24px;
                flex-direction: column;
                align-items: flex-start;
            }

            .header-title h1 {
                font-size: 22px;
            }

            .header-badge {
                font-size: 12px;
                padding: 6px 14px;
            }

            .search-section {
                padding: 20px;
                flex-direction: column;
                align-items: stretch;
                gap: 14px;
            }

            .search-group {
                flex: 1 1 auto;
                min-width: 0;
            }

            .search-btn {
                width: 100%;
                justify-content: center;
                height: 46px;
            }

            .result-header {
                flex-direction: column;
                align-items: flex-start;
                padding: 16px 20px;
            }

            .result-header .spec-name {
                font-size: 20px;
                flex-wrap: wrap;
            }

            .result-body {
                grid-template-columns: 1fr 1fr;
                padding: 20px;
                gap: 16px;
            }

            .result-item .value {
                font-size: 22px;
            }

            .table-header {
                padding: 14px 16px;
                flex-direction: column;
                align-items: flex-start;
            }

            thead th,
            tbody td {
                padding: 10px 12px;
                font-size: 13px;
            }

            thead th:first-child,
            tbody td:first-child {
                padding-left: 16px;
            }
        }

        @media (max-width: 480px) {
            .result-body {
                grid-template-columns: 1fr;
                gap: 12px;
            }

            .result-item .value {
                font-size: 20px;
            }

            table {
                font-size: 12px;
                min-width: 400px;
            }

            thead th,
            tbody td {
                padding: 8px 10px;
            }
        }

        /* ===== 滚动条美化 ===== */
        .table-wrapper::-webkit-scrollbar {
            height: 8px;
        }

        .table-wrapper::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 4px;
        }

        .table-wrapper::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
        }

        .table-wrapper::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }

        /* ===== Toast 提示 ===== */
        .toast {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%) translateY(80px);
            background: #0f172a;
            color: #f1f5f9;
            padding: 12px 28px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
            opacity: 0;
            transition: all 0.4s ease;
            pointer-events: none;
            z-index: 999;
        }

        .toast.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
            /* ===== 移动端适配 ===== */
        @media (max-width: 640px) {
            body { padding: 10px; }
            .header { padding: 18px 16px; border-radius: 14px; gap: 10px; }
            .header-title h1 { font-size: 20px; }
            .header-icon { font-size: 26px; }
            .header-badge { padding: 6px 12px; font-size: 11px; }
            .search-section { padding: 16px 14px; gap: 12px; }
            .search-group { min-width: 100%; }
            .search-btn { min-height: 46px; }
            .result-section, .table-section { margin-bottom: 16px; }
            .result-card { padding: 16px; }
            .table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        }
    </style>
</head>
<body>

    <div class="app-container">

        <!-- ===== 头部 ===== -->
        <header class="header">
            <div class="header-left">
                <div class="header-icon">🔩</div>
                <div class="header-title">
                    <h1>螺纹参数查询</h1>
                    <p>公制 · 英制 · 底孔 · 通孔 · 螺距</p>
                </div>
            </div>
            <div class="header-badge">
                📐 共 <span id="totalCount">0</span> 种规格
            </div>
        </header>

        <!-- ===== 查询区 ===== -->
        <section class="search-section">
            <div class="search-group">
                <label for="typeSelect">螺纹类型</label>
                <select id="typeSelect">
                    <option value="metric_coarse">公制粗牙 (M)</option>
                    <option value="metric_fine">公制细牙 (MF)</option>
                    <option value="unc">英制粗牙 (UNC)</option>
                    <option value="unf">英制细牙 (UNF)</option>
                </select>
            </div>

            <div class="search-group">
                <label for="specSelect">规格</label>
                <select id="specSelect"></select>
                <div class="hint">⬆ 选择或输入过滤</div>
            </div>

            <div class="search-group" style="flex: 0 0 auto; min-width: 0;">
                <button class="search-btn" id="queryBtn">
                    <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    查询
                </button>
            </div>
        </section>

        <!-- ===== 结果卡片 ===== -->
        <section class="result-section">
            <div class="result-card" id="resultCard">
                <div class="result-header">
                    <div class="spec-name">
                        <span id="resultSpec">M8</span>
                        <span class="type-tag" id="resultTypeTag">公制粗牙</span>
                    </div>
                    <button class="copy-btn" id="copyBtn">📋 复制参数</button>
                </div>
                <div class="result-body" id="resultBody">
                    <div class="result-item">
                        <span class="label">螺距 (P)</span>
                        <div class="value"><span id="resultPitch">—</span><span class="unit">mm</span></div>
                    </div>
                    <div class="result-item highlight">
                        <span class="label">底孔直径 (攻丝)</span>
                        <div class="value"><span id="resultTapDrill">—</span><span class="unit">mm</span></div>
                        <div class="desc">推荐钻头直径</div>
                    </div>
                    <div class="result-item highlight">
                        <span class="label">通孔直径 (螺栓)</span>
                        <div class="value"><span id="resultClearance">—</span><span class="unit">mm</span></div>
                        <div class="desc">中等配合 · ISO 273</div>
                    </div>
                    <div class="result-item">
                        <span class="label">大径 (公称)</span>
                        <div class="value"><span id="resultMajor">—</span><span class="unit">mm</span></div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ===== 数据表格 ===== -->
        <section class="table-section">
            <div class="table-header">
                <h3>
                    📋 全部螺纹参数
                    <span class="count-badge" id="tableCount">0</span>
                </h3>
                <div style="font-size:13px; color:#94a3b8;">
                    底孔 = 大径 − 螺距 &nbsp;·&nbsp; 通孔 = 中等配合
                </div>
            </div>
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>规格</th>
                            <th>类型</th>
                            <th>螺距 (mm)</th>
                            <th>底孔 (mm)</th>
                            <th>通孔 (mm)</th>
                            <th>大径 (mm)</th>
                        </tr>
                    </thead>
                    <tbody id="tableBody">
                        <!-- 由 JS 渲染 -->
                    </tbody>
                </table>
            </div>
        </section>

        <!-- ===== Toast ===== -->
        <div class="toast" id="toast"></div>

    </div>

    <script>
        // ================================================================
        //  数据
        // ================================================================

        // 公制粗牙 (M)  —  大径 = 规格数值
        const METRIC_COARSE = [
            { spec: 'M1.6', pitch: 0.35, tap: 1.25, clearance: 1.8, major: 1.6 },
            { spec: 'M2', pitch: 0.40, tap: 1.60, clearance: 2.2, major: 2.0 },
            { spec: 'M2.5', pitch: 0.45, tap: 2.05, clearance: 2.7, major: 2.5 },
            { spec: 'M3', pitch: 0.50, tap: 2.50, clearance: 3.2, major: 3.0 },
            { spec: 'M4', pitch: 0.70, tap: 3.30, clearance: 4.3, major: 4.0 },
            { spec: 'M5', pitch: 0.80, tap: 4.20, clearance: 5.3, major: 5.0 },
            { spec: 'M6', pitch: 1.00, tap: 5.00, clearance: 6.4, major: 6.0 },
            { spec: 'M8', pitch: 1.25, tap: 6.80, clearance: 8.4, major: 8.0 },
            { spec: 'M10', pitch: 1.50, tap: 8.50, clearance: 10.5, major: 10.0 },
            { spec: 'M12', pitch: 1.75, tap: 10.20, clearance: 13.0, major: 12.0 },
            { spec: 'M14', pitch: 2.00, tap: 12.00, clearance: 15.0, major: 14.0 },
            { spec: 'M16', pitch: 2.00, tap: 14.00, clearance: 17.0, major: 16.0 },
            { spec: 'M18', pitch: 2.50, tap: 15.50, clearance: 19.0, major: 18.0 },
            { spec: 'M20', pitch: 2.50, tap: 17.50, clearance: 21.0, major: 20.0 },
            { spec: 'M22', pitch: 2.50, tap: 19.50, clearance: 23.0, major: 22.0 },
            { spec: 'M24', pitch: 3.00, tap: 21.00, clearance: 25.0, major: 24.0 },
            { spec: 'M27', pitch: 3.00, tap: 24.00, clearance: 28.0, major: 27.0 },
            { spec: 'M30', pitch: 3.50, tap: 26.50, clearance: 31.0, major: 30.0 },
            { spec: 'M33', pitch: 3.50, tap: 29.50, clearance: 34.0, major: 33.0 },
            { spec: 'M36', pitch: 4.00, tap: 32.00, clearance: 37.0, major: 36.0 },
            { spec: 'M39', pitch: 4.00, tap: 35.00, clearance: 40.0, major: 39.0 },
            { spec: 'M42', pitch: 4.50, tap: 37.50, clearance: 43.0, major: 42.0 },
            { spec: 'M45', pitch: 4.50, tap: 40.50, clearance: 46.0, major: 45.0 },
            { spec: 'M48', pitch: 5.00, tap: 43.00, clearance: 50.0, major: 48.0 },
            { spec: 'M52', pitch: 5.00, tap: 47.00, clearance: 54.0, major: 52.0 },
            { spec: 'M56', pitch: 5.50, tap: 50.50, clearance: 58.0, major: 56.0 },
            { spec: 'M60', pitch: 5.50, tap: 54.50, clearance: 62.0, major: 60.0 },
            { spec: 'M64', pitch: 6.00, tap: 58.00, clearance: 66.0, major: 64.0 },
        ];

        // 公制细牙 (MF)  —  大径 = 规格数值
        const METRIC_FINE = [
            { spec: 'M8×1', pitch: 1.00, tap: 7.00, clearance: 8.4, major: 8.0 },
            { spec: 'M10×1.25', pitch: 1.25, tap: 8.75, clearance: 10.5, major: 10.0 },
            { spec: 'M12×1.25', pitch: 1.25, tap: 10.75, clearance: 13.0, major: 12.0 },
            { spec: 'M14×1.5', pitch: 1.50, tap: 12.50, clearance: 15.0, major: 14.0 },
            { spec: 'M16×1.5', pitch: 1.50, tap: 14.50, clearance: 17.0, major: 16.0 },
            { spec: 'M18×1.5', pitch: 1.50, tap: 16.50, clearance: 19.0, major: 18.0 },
            { spec: 'M20×1.5', pitch: 1.50, tap: 18.50, clearance: 21.0, major: 20.0 },
            { spec: 'M22×1.5', pitch: 1.50, tap: 20.50, clearance: 23.0, major: 22.0 },
            { spec: 'M24×2', pitch: 2.00, tap: 22.00, clearance: 25.0, major: 24.0 },
            { spec: 'M27×2', pitch: 2.00, tap: 25.00, clearance: 28.0, major: 27.0 },
            { spec: 'M30×2', pitch: 2.00, tap: 28.00, clearance: 31.0, major: 30.0 },
            { spec: 'M33×2', pitch: 2.00, tap: 31.00, clearance: 34.0, major: 33.0 },
            { spec: 'M36×3', pitch: 3.00, tap: 33.00, clearance: 37.0, major: 36.0 },
            { spec: 'M39×3', pitch: 3.00, tap: 36.00, clearance: 40.0, major: 39.0 },
            { spec: 'M42×3', pitch: 3.00, tap: 39.00, clearance: 43.0, major: 42.0 },
            { spec: 'M45×3', pitch: 3.00, tap: 42.00, clearance: 46.0, major: 45.0 },
            { spec: 'M48×3', pitch: 3.00, tap: 45.00, clearance: 50.0, major: 48.0 },
            { spec: 'M52×3', pitch: 3.00, tap: 49.00, clearance: 54.0, major: 52.0 },
            { spec: 'M56×4', pitch: 4.00, tap: 52.00, clearance: 58.0, major: 56.0 },
            { spec: 'M60×4', pitch: 4.00, tap: 56.00, clearance: 62.0, major: 60.0 },
            { spec: 'M64×4', pitch: 4.00, tap: 60.00, clearance: 66.0, major: 64.0 },
        ];

        // 英制粗牙 UNC  —  大径 (英寸→mm)
        const UNC = [
            { spec: '1/4-20 UNC', pitch: 1.270, tap: 5.10, clearance: 6.8, major: 6.350 },
            { spec: '5/16-18 UNC', pitch: 1.411, tap: 6.50, clearance: 8.4, major: 7.938 },
            { spec: '3/8-16 UNC', pitch: 1.588, tap: 7.90, clearance: 10.0, major: 9.525 },
            { spec: '7/16-14 UNC', pitch: 1.814, tap: 9.30, clearance: 11.5, major: 11.113 },
            { spec: '1/2-13 UNC', pitch: 1.954, tap: 10.70, clearance: 13.0, major: 12.700 },
            { spec: '9/16-12 UNC', pitch: 2.117, tap: 12.10, clearance: 14.5, major: 14.288 },
            { spec: '5/8-11 UNC', pitch: 2.309, tap: 13.50, clearance: 16.0, major: 15.875 },
            { spec: '3/4-10 UNC', pitch: 2.540, tap: 16.50, clearance: 19.0, major: 19.050 },
            { spec: '7/8-9 UNC', pitch: 2.822, tap: 19.50, clearance: 22.0, major: 22.225 },
            { spec: '1-8 UNC', pitch: 3.175, tap: 22.20, clearance: 25.0, major: 25.400 },
        ];

        // 英制细牙 UNF
        const UNF = [
            { spec: '1/4-28 UNF', pitch: 0.907, tap: 5.40, clearance: 6.8, major: 6.350 },
            { spec: '5/16-24 UNF', pitch: 1.058, tap: 6.90, clearance: 8.4, major: 7.938 },
            { spec: '3/8-24 UNF', pitch: 1.058, tap: 8.50, clearance: 10.0, major: 9.525 },
            { spec: '7/16-20 UNF', pitch: 1.270, tap: 9.90, clearance: 11.5, major: 11.113 },
            { spec: '1/2-20 UNF', pitch: 1.270, tap: 11.50, clearance: 13.0, major: 12.700 },
            { spec: '9/16-18 UNF', pitch: 1.411, tap: 13.10, clearance: 14.5, major: 14.288 },
            { spec: '5/8-18 UNF', pitch: 1.411, tap: 14.50, clearance: 16.0, major: 15.875 },
            { spec: '3/4-16 UNF', pitch: 1.588, tap: 17.50, clearance: 19.0, major: 19.050 },
            { spec: '7/8-14 UNF', pitch: 1.814, tap: 20.60, clearance: 22.0, major: 22.225 },
            { spec: '1-12 UNF', pitch: 2.117, tap: 23.50, clearance: 25.0, major: 25.400 },
        ];

        // ---- 类型映射 ----
        const TYPE_MAP = {
            metric_coarse: { label: '公制粗牙', data: METRIC_COARSE, tagClass: '' },
            metric_fine: { label: '公制细牙', data: METRIC_FINE, tagClass: 'fine' },
            unc: { label: '英制粗牙', data: UNC, tagClass: 'unc' },
            unf: { label: '英制细牙', data: UNF, tagClass: 'unf' },
        };

        // ---- 所有数据扁平化 (用于表格) ----
        const ALL_DATA = [];
        for (const [key, info] of Object.entries(TYPE_MAP)) {
            for (const item of info.data) {
                ALL_DATA.push({
                    ...item,
                    typeKey: key,
                    typeLabel: info.label,
                    tagClass: info.tagClass,
                });
            }
        }

        // ================================================================
        //  DOM 引用
        // ================================================================

        const typeSelect = document.getElementById('typeSelect');
        const specSelect = document.getElementById('specSelect');
        const queryBtn = document.getElementById('queryBtn');
        const resultCard = document.getElementById('resultCard');
        const resultSpec = document.getElementById('resultSpec');
        const resultTypeTag = document.getElementById('resultTypeTag');
        const resultPitch = document.getElementById('resultPitch');
        const resultTapDrill = document.getElementById('resultTapDrill');
        const resultClearance = document.getElementById('resultClearance');
        const resultMajor = document.getElementById('resultMajor');
        const copyBtn = document.getElementById('copyBtn');
        const tableBody = document.getElementById('tableBody');
        const totalCount = document.getElementById('totalCount');
        const tableCount = document.getElementById('tableCount');
        const toast = document.getElementById('toast');

        let toastTimer = null;

        // ================================================================
        //  工具函数
        // ================================================================

        function showToast(msg) {
            if (toastTimer) clearTimeout(toastTimer);
            toast.textContent = msg;
            toast.classList.add('show');
            toastTimer = setTimeout(() => {
                toast.classList.remove('show');
            }, 2000);
        }

        function formatNum(v) {
            if (v === undefined || v === null) return '—';
            return Number(v).toFixed(2);
        }

        // ================================================================
        //  核心逻辑：更新规格下拉
        // ================================================================

        function updateSpecOptions(typeKey) {
            const info = TYPE_MAP[typeKey];
            if (!info) return;
            const data = info.data;
            specSelect.innerHTML = '';
            data.forEach((item, idx) => {
                const opt = document.createElement('option');
                opt.value = String(idx);
                opt.textContent = item.spec;
                specSelect.appendChild(opt);
            });
            if (data.length > 0) specSelect.selectedIndex = 0;
        }

        // ================================================================
        //  核心逻辑：查询并显示结果
        // ================================================================

        function queryThread() {
            const typeKey = typeSelect.value;
            const info = TYPE_MAP[typeKey];
            if (!info) return;
            const data = info.data;
            const idx = parseInt(specSelect.value, 10);
            if (isNaN(idx) || idx < 0 || idx >= data.length) {
                resultCard.classList.remove('active');
                return;
            }
            const item = data[idx];
            if (!item) {
                resultCard.classList.remove('active');
                return;
            }

            // 填充结果
            resultSpec.textContent = item.spec;
            resultTypeTag.textContent = info.label;
            resultTypeTag.className = 'type-tag' + (info.tagClass ? ' ' + info.tagClass : '');
            resultPitch.textContent = formatNum(item.pitch);
            resultTapDrill.textContent = formatNum(item.tap);
            resultClearance.textContent = formatNum(item.clearance);
            resultMajor.textContent = formatNum(item.major);

            resultCard.classList.add('active');

            // 滚动到结果区域 (移动端友好)
            if (window.innerWidth < 768) {
                resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        // ================================================================
        //  渲染表格
        // ================================================================

        function renderTable() {
            if (ALL_DATA.length === 0) {
                tableBody.innerHTML = \`
                        <tr><td colspan="6">
                            <div class="empty-state">
                                <span class="emoji">📭</span>
                                <p>暂无数据</p>
                            </div>
                        </td></tr>
                    \`;
                totalCount.textContent = '0';
                tableCount.textContent = '0';
                return;
            }

            let html = '';
            for (const item of ALL_DATA) {
                html += \`
                        <tr>
                            <td>\${item.spec}</td>
                            <td><span class="table-type-tag \${item.tagClass}">\${item.typeLabel}</span></td>
                            <td>\${formatNum(item.pitch)}</td>
                            <td><strong>\${formatNum(item.tap)}</strong></td>
                            <td>\${formatNum(item.clearance)}</td>
                            <td>\${formatNum(item.major)}</td>
                        </tr>
                    \`;
            }
            tableBody.innerHTML = html;
            totalCount.textContent = String(ALL_DATA.length);
            tableCount.textContent = String(ALL_DATA.length);
        }

        // ================================================================
        //  复制功能
        // ================================================================

        function copyResult() {
            const spec = resultSpec.textContent;
            if (!spec || spec === '—') {
                showToast('⚠️ 请先查询一个规格');
                return;
            }
            const pitch = resultPitch.textContent;
            const tap = resultTapDrill.textContent;
            const clear = resultClearance.textContent;
            const major = resultMajor.textContent;
            const type = resultTypeTag.textContent;

            const lines = [
                \`🔩 螺纹: \${spec}  (\${type})\`,
                \`   螺距: \${pitch} mm\`,
                \`   底孔: \${tap} mm  (攻丝钻头)\`,
                \`   通孔: \${clear} mm  (中等配合)\`,
                \`   大径: \${major} mm\`,
            ];
            const text = lines.join('\\n');

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    showToast('✅ 已复制到剪贴板');
                }).catch(() => {
                    fallbackCopy(text);
                });
            } else {
                fallbackCopy(text);
            }
        }

        function fallbackCopy(text) {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            ta.style.top = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
                showToast('✅ 已复制到剪贴板');
            } catch (_) {
                showToast('⚠️ 复制失败，请手动复制');
            }
            document.body.removeChild(ta);
        }

        // ================================================================
        //  事件绑定
        // ================================================================

        // 类型切换 → 更新规格下拉
        typeSelect.addEventListener('change', function() {
            saveLastQuery();
            updateSpecOptions(this.value);
            // 自动查询第一个
            queryThread();
        });

        // 规格切换 → 自动查询
        specSelect.addEventListener('change', function() { saveLastQuery(); queryThread(); });

        // 查询按钮 → 查询
        queryBtn.addEventListener('click', queryThread);

        // 复制按钮
        copyBtn.addEventListener('click', copyResult);

        // 键盘支持：回车触发查询
        specSelect.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                queryBtn.click();
            }
        });

        // ================================================================
        //  初始化
        // ================================================================

                function init() {
            // 恢复上次查询的型号（记忆功能：刷新/重进后保留）
            let saved = null;
            try { saved = JSON.parse(localStorage.getItem('wewoo-thread-last') || 'null'); } catch (e) {}
            const defaultType = (saved && saved.type) || 'metric_coarse';
            typeSelect.value = defaultType;
            updateSpecOptions(defaultType);
            if (saved && saved.spec) {
                for (let i = 0; i < specSelect.options.length; i++) {
                    if (specSelect.options[i].value === saved.spec) { specSelect.selectedIndex = i; break; }
                }
            }
            // 渲染表格
            renderTable();
            // 自动查询第一个
            queryThread();
        }

        function saveLastQuery() {
            try { localStorage.setItem('wewoo-thread-last', JSON.stringify({ type: typeSelect.value, spec: specSelect.value })); } catch (e) {}
        }

        init();

        // ================================================================
        //  额外：输入过滤（在规格下拉中快速定位）
        // ================================================================

        // 为 specSelect 增加键盘过滤：用户输入时自动选中匹配项
        specSelect.addEventListener('keyup', function(e) {
            // 忽略 回车、上下箭头、ESC 等控制键
            const ignoreKeys = ['ArrowUp', 'ArrowDown', 'Enter', 'Escape', 'Tab', 'Shift', 'Control', 'Alt', 'Meta'];
            if (ignoreKeys.includes(e.key)) return;
            // 如果按的是字母或数字，尝试匹配
            const val = this.value.trim().toUpperCase();
            if (val.length === 0) return;
            const options = this.options;
            for (let i = 0; i < options.length; i++) {
                const text = options[i].text.toUpperCase();
                if (text.includes(val)) {
                    this.selectedIndex = i;
                    // 触发查询
                    queryThread();
                    break;
                }
            }
        });

        console.log('🔩 螺纹参数查询工具已加载，共 ' + ALL_DATA.length + ' 种规格');
    </script>

</body>
</html>
`,
    thumbnailGradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    createdAt: "2026-07-29T12:51:06.637Z",
    description: "快速查询公制/英制螺纹参数：螺距、中径、小径、钻孔直径等",
  },

];

// Pre-seeded reviews for mock mode
export const MOCK_REVIEWS: Review[] = [
  { id: "r1", toolId: "1", userId: "mock-user-2", userName: "老王机械师", rating: 5, content: "旅行必备！算出来每人多少钱一目了然，再也不用手动算了。", createdAt: "2026-07-21T14:00:00Z" },
  { id: "r2", toolId: "1", userId: "mock-user-3", userName: "语文张老师", rating: 4, content: "很好用，要是能导出图片就更好了", createdAt: "2026-07-21T16:30:00Z" },
  { id: "r3", toolId: "1", userId: "mock-user-4", userName: "新手妈妈小怡", rating: 5, content: "周末和闺蜜出门就用这个算的，超方便！", createdAt: "2026-07-22T09:00:00Z" },
  { id: "r4", toolId: "3", userId: "mock-user-1", userName: "旅行达人小明", rating: 5, content: "课堂上用这个抽查学生，全班抢答，效果太好了！", createdAt: "2026-07-20T10:00:00Z" },
  { id: "r5", toolId: "3", userId: "mock-user-5", userName: "省钱达人阿杰", rating: 4, content: "诗词库可以再多一点就好了", createdAt: "2026-07-21T08:00:00Z" },
  { id: "r6", toolId: "2", userId: "mock-user-1", userName: "旅行达人小明", rating: 5, content: "虽然我不搞工程，但这个看起来好专业！", createdAt: "2026-07-20T15:00:00Z" },
  { id: "r7", toolId: "5", userId: "mock-user-4", userName: "新手妈妈小怡", rating: 4, content: "出门旅游省钱神器，推荐！", createdAt: "2026-07-18T12:00:00Z" },
  { id: "r8", toolId: "8", userId: "mock-user-3", userName: "语文张老师", rating: 5, content: "督促自己多喝水，八杯水的设计很直观", createdAt: "2026-07-22T07:30:00Z" },
  { id: "r9", toolId: "11", userId: "mock-user-4", userName: "新手妈妈小怡", rating: 5, content: "给孩子练口算太合适了，计时功能很有挑战性", createdAt: "2026-07-16T19:00:00Z" },
  { id: "r10", toolId: "7", userId: "mock-user-2", userName: "老王机械师", rating: 4, content: "适合背单词，要是有发音功能就更棒了", createdAt: "2026-07-22T10:00:00Z" },
  { id: "r11", toolId: "4", userId: "mock-user-5", userName: "省钱达人阿杰", rating: 5, content: "老婆让我帮忙记宝宝辅食，这个太实用了", createdAt: "2026-07-21T20:00:00Z" },
  { id: "r12", toolId: "12", userId: "mock-user-1", userName: "旅行达人小明", rating: 5, content: "终于不用翻冰箱找过期的食材了！", createdAt: "2026-07-15T11:00:00Z" },
];

// localStorage keys
const REV_KEY = "wewoo-mock-reviews";

// Lazy-loaded mock data backed by localStorage (survives page refresh)
let _mockReviews: Review[] | null = null;

export function getMockReviews(): Review[] {
  if (_mockReviews === null) {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(REV_KEY);
        _mockReviews = raw ? JSON.parse(raw) : structuredClone(MOCK_REVIEWS);
      } catch {
        _mockReviews = structuredClone(MOCK_REVIEWS);
      }
    } else {
      _mockReviews = structuredClone(MOCK_REVIEWS);
    }
  }
  return _mockReviews!;
}

export function setMockReviews(revs: Review[]): void {
  _mockReviews = revs;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(REV_KEY, JSON.stringify(revs));
    } catch { /* full */ }
  }
}
