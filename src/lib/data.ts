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
    code: `<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#f5f3ff;padding:16px;color:#333}
h2{text-align:center;color:#5b21b6;font-size:18px;margin-bottom:4px}
.sub{text-align:center;color:#999;font-size:12px;margin-bottom:16px}
.card{background:#fff;border-radius:12px;padding:14px;margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,.05)}
.card h3{font-size:14px;color:#5b21b6;margin-bottom:10px}
.row{display:flex;gap:8px;align-items:center;margin-bottom:8px}
.row label{font-size:13px;color:#666;flex-shrink:0}
.row input,.row select{flex:1;padding:8px;border:1px solid #ddd;border-radius:8px;font-size:14px}
.btn{padding:8px 16px;background:#7c3aed;color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer}
.btn-sm{padding:4px 10px;font-size:12px}
.btn-danger{background:#ef4444;padding:4px 10px;font-size:12px;color:#fff;border:none;border-radius:6px;cursor:pointer}
.member{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f3f3f3;font-size:13px}
.member span{color:#555}
.total{background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border-radius:12px;padding:16px;text-align:center;margin-top:12px}
.total .big{font-size:28px;font-weight:bold}
.total .unit{font-size:13px;opacity:.8}
</style>
<h2>💰 旅行分账计算器</h2>
<p class="sub">输入花费和人数，自动算每人该付多少</p>
<div class="card">
  <h3>总花费</h3>
  <div class="row"><label>金额 ¥</label><input id="amount" type="number" placeholder="0" value="500"></div>
  <div class="row"><label>人数</label><input id="people" type="number" placeholder="0" value="4"></div>
  <button class="btn" style="width:100%" onclick="calc()">计算每人应付</button>
</div>
<div class="card" id="result" style="display:none">
  <h3>💰 每人应付</h3>
  <p id="perPerson" style="font-size:24px;font-weight:bold;color:#7c3aed;text-align:center;margin:12px 0"></p>
  <p style="font-size:12px;color:#999;text-align:center">通过微信 AA 收款一键发给朋友</p>
</div>
<div class="card">
  <h3>✏️ 记录额外分摊项</h3>
  <div class="row"><label>名称</label><input id="itemName" placeholder="比如：打车"></div>
  <div class="row"><label>金额</label><input id="itemCost" type="number" placeholder="0"></div>
  <button class="btn" style="width:100%" onclick="addItem()">添加</button>
  <div id="items" style="margin-top:10px"></div>
</div>
<script>
var items=[];
function calc(){
  var a=parseFloat(document.getElementById('amount').value)||0;
  var p=parseInt(document.getElementById('people').value)||1;
  var total=items.reduce(function(s,i){return s+i.cost},a);
  var per=Math.ceil(total/p);
  document.getElementById('perPerson').textContent='¥ '+per;
  document.getElementById('result').style.display='block';
}
function addItem(){
  var n=document.getElementById('itemName').value.trim();
  var c=parseFloat(document.getElementById('itemCost').value)||0;
  if(!n||c<=0)return;
  items.push({name:n,cost:c});
  renderItems();
  document.getElementById('itemName').value='';
  document.getElementById('itemCost').value='';
  calc();
}
function removeItem(i){items.splice(i,1);renderItems();calc()}
function renderItems(){
  document.getElementById('items').innerHTML=items.map(function(it,i){
    return '<div class="member"><span>'+it.name+'</span><span>¥'+it.cost+' <button class="btn-danger" onclick="removeItem('+i+')">×</button></span></div>'
  }).join('');
}
</script>`,
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
    code: `<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#fff5f5;padding:16px;color:#333}
h2{text-align:center;color:#c2410c;font-size:18px;margin-bottom:4px}
.sub{text-align:center;color:#999;font-size:12px;margin-bottom:16px}
.card{background:#fff;border-radius:12px;padding:14px;margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,.05)}
.card h3{font-size:14px;color:#c2410c;margin-bottom:10px}
.row{display:flex;gap:8px;align-items:center;margin-bottom:8px}
.row label{font-size:13px;color:#666;flex-shrink:0}
.row input,.row select{flex:1;padding:8px;border:1px solid #ddd;border-radius:8px;font-size:14px}
.btn{width:100%;padding:10px;background:#ea580c;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;margin-top:4px}
.result{background:linear-gradient(135deg,#ffedd5,#fed7aa);border-radius:12px;padding:16px;margin-top:12px;text-align:center}
.result .val{font-size:22px;font-weight:bold;color:#c2410c}
.result .label{font-size:12px;color:#9a3412}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
</style>
<h2>🔩 螺栓强度校核</h2>
<p class="sub">输入螺栓参数，一键计算抗拉与剪切强度</p>
<div class="card">
  <h3>螺栓参数</h3>
  <div class="row"><label>公称直径 d</label><input id="d" type="number" placeholder="mm" value="16"></div>
  <div class="row"><label>螺距 P</label><select id="pitch"><option value="0.5">M3-0.5</option><option value="0.7">M4-0.7</option><option value="0.8">M5-0.8</option><option value="1">M6-1.0</option><option value="1.25">M8-1.25</option><option value="1.5">M10-1.5</option><option value="1.75">M12-1.75</option><option value="2" selected>M16-2.0</option><option value="2.5">M20-2.5</option></select></div>
  <div class="row"><label>性能等级</label><select id="grade"><option value="4.8">4.8</option><option value="5.6">5.6</option><option value="8.8" selected>8.8</option><option value="10.9">10.9</option><option value="12.9">12.9</option></select></div>
  <div class="row"><label>安全系数 n</label><input id="safety" type="number" placeholder="" value="1.5" step="0.1"></div>
  <button class="btn" onclick="calculate()">计算强度</button>
</div>
<div class="result" id="result" style="display:none">
  <h3 style="color:#c2410c;margin-bottom:8px">计算结果</h3>
  <div class="grid">
    <div><div class="label">抗拉强度 σb</div><div class="val" id="sigmaB">-</div></div>
    <div><div class="label">屈服强度 σs</div><div class="val" id="sigmaS">-</div></div>
  </div>
  <div class="grid">
    <div><div class="label">许用拉应力</div><div class="val" id="allowT">-</div></div>
    <div><div class="label">许用剪应力</div><div class="val" id="allowS">-</div></div>
  </div>
  <p style="font-size:12px;color:#9a3412;margin-top:8px" id="verdict"></p>
</div>
<script>
function calculate(){
  var d=parseFloat(document.getElementById('d').value)||16;
  var p=parseFloat(document.getElementById('pitch').value)||2;
  var g=document.getElementById('grade').value;
  var n=parseFloat(document.getElementById('safety').value)||1.5;
  var d1=d-1.0825*p;
  var A1=Math.PI*d1*d1/4;
  var gb=parseInt(g.split('.')[0])*100;
  var gs=parseInt(g.split('.')[0])*10*parseInt(g.split('.')[1]);
  var sigmaB=gb;
  var sigmaS=gs;
  var allowTensile=sigmaS/n;
  var allowShear=allowTensile*0.6;
  document.getElementById('sigmaB').textContent=sigmaB+' MPa';
  document.getElementById('sigmaS').textContent=sigmaS+' MPa';
  document.getElementById('allowT').textContent=allowTensile.toFixed(1)+' MPa';
  document.getElementById('allowS').textContent=allowShear.toFixed(1)+' MPa';
  var ft=A1*allowTensile/1000;
  var fs=A1*allowShear/1000;
  var v=ft>50?'✅ 强度足够，可安全使用':ft>20?'⚠️ 中等载荷可用，重载请增大直径':'❌ 强度不足，建议增大直径或提高等级';
  document.getElementById('verdict').textContent='螺纹小径: '+d1.toFixed(2)+'mm | 危险截面积: '+A1.toFixed(1)+'mm² | 评估: '+v;
  document.getElementById('result').style.display='block';
}
</script>`,
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
    code: `<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'KaiTi','STKaiti',serif;background:#f0f9ff;padding:16px;color:#333}
h2{text-align:center;color:#0369a1;font-size:20px;margin-bottom:8px}
.sub{text-align:center;color:#999;font-size:12px;margin-bottom:16px}
.qcard{background:#fff;border-radius:16px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,.06);text-align:center}
.verse{font-size:22px;color:#0c4a6e;line-height:1.8;margin-bottom:16px;letter-spacing:2px}
.verse .blank{color:#0369a1;font-weight:bold;font-size:24px}
.poem{font-size:12px;color:#999;margin-bottom:10px}
.options{display:grid;gap:8px;margin-top:12px}
.opt{padding:12px;border:2px solid #e0e7ff;border-radius:10px;font-size:14px;cursor:pointer;background:#fff;transition:all .2s}
.opt:hover{border-color:#7dd3fc;background:#f0f9ff}
.opt.correct{border-color:#22c55e;background:#f0fdf4;color:#166534}
.opt.wrong{border-color:#ef4444;background:#fef2f2;color:#991b1b}
.opt.disabled{pointer-events:none}
.btn{width:100%;padding:12px;background:#0284c7;color:#fff;border:none;border-radius:10px;font-size:14px;cursor:pointer;margin-top:12px}
.score{text-align:center;margin-top:10px;font-size:14px;color:#0284c7}
</style>
<h2>📜 古诗词抽查</h2>
<p class="sub">随机出题 · 课堂互动神器</p>
<div class="qcard">
  <p class="poem" id="source"></p>
  <p class="verse" id="question"></p>
  <div class="options" id="options"></div>
  <p style="margin-top:10px;font-size:13px;color:#666" id="feedback"></p>
  <button class="btn" id="nextBtn" onclick="next()">下一题 ▶</button>
</div>
<p class="score">✅ <span id="correct">0</span> / <span id="total">0</span></p>
<script>
var bank=[
  {v:'床前明月光，__疑是地上霜',a:'李白《静夜思》',c:'疑',w:['凝','疑','怡','颐'],hint:'怀疑的疑'},
  {v:'举头望明月，__头思故乡',a:'李白《静夜思》',c:'低',w:['地','低','底','滴'],hint:'低头'},
  {v:'春眠不觉晓，__处闻啼鸟',a:'孟浩然《春晓》',c:'处',w:['处','初','出','楚'],hint:'到处'},
  {v:'锄禾日当午，__滴禾下土',a:'李绅《悯农》',c:'汗',w:['汉','汗','旱','寒'],hint:'汗水'},
  {v:'白日依山尽，黄河入__流',a:'王之涣《登鹳雀楼》',c:'海',w:['海','湖','江','河'],hint:'大海'},
  {v:'飞流直下三千尺，__是银河落九天',a:'李白《望庐山瀑布》',c:'疑',w:['疑','以','已','宜'],hint:'怀疑'},
  {v:'停车坐爱枫林晚，__叶红于二月花',a:'杜牧《山行》',c:'霜',w:['双','霜','爽','孀'],hint:'霜雪'},
];
var score=0,total=0,answered=false;
function next(){
  answered=false;
  document.getElementById('feedback').textContent='';
  var q=bank[Math.floor(Math.random()*bank.length)];
  document.getElementById('source').textContent='—— '+q.a;
  document.getElementById('question').innerHTML=q.v.replace('__','<span class="blank">__</span>');
  var opts=document.getElementById('options');
  var shuffled=q.w.slice().sort(function(){return Math.random()-.5});
  var html=shuffled.map(function(w){
    return '<button class="opt" onclick="answer(this,\\''+w+'\\',\\''+q.c+'\\')">'+w+'</button>';
  }).join('');
  opts.innerHTML=html;
}
function answer(el,w,c){
  if(answered)return;answered=true;
  total++;
  if(w===c){score++;el.classList.add('correct');document.getElementById('feedback').textContent='✅ 太棒了！';}
  else{el.classList.add('wrong');document.getElementById('feedback').textContent='❌ 正确答案：'+c+' ('+bank.find(function(q){return q.c===c}).hint+')';
    var opts=document.querySelectorAll('.opt');
    for(var i=0;i<opts.length;i++){if(opts[i].textContent===c)opts[i].classList.add('correct');}
  }
  var all=document.querySelectorAll('.opt');for(var j=0;j<all.length;j++)all[j].classList.add('disabled');
  document.getElementById('correct').textContent=score;
  document.getElementById('total').textContent=total;
}
next();
</script>`,
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
    code: `<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#fff7ed;padding:16px;color:#333}
h2{text-align:center;color:#c2410c;font-size:18px;margin-bottom:8px}
.sub{text-align:center;color:#999;font-size:12px;margin-bottom:12px}
.card{background:#fff;border-radius:14px;padding:14px;margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,.05)}
.card h3{font-size:14px;color:#c2410c;margin-bottom:10px}
.row{display:flex;gap:8px;align-items:center;margin-bottom:8px}
.row label{font-size:13px;color:#666;flex-shrink:0}
.row input,.row select{flex:1;padding:8px;border:1px solid #ddd;border-radius:8px;font-size:14px}
.btn{width:100%;padding:10px;background:#ea580c;color:#fff;border:none;border-radius:10px;font-size:14px;cursor:pointer}
.tag{padding:3px 10px;border-radius:20px;font-size:11px;color:#fff}
.tag-g{background:#22c55e}.tag-f{background:#f59e0b}.tag-d{background:#3b82f6}.tag-r{background:#ef4444}
.log-item{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #fef3c7;font-size:13px}
.log-item .time{color:#999;font-size:11px}
.remove{color:#ef4444;background:none;border:none;font-size:16px;cursor:pointer}
.summary{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.sbox{background:#fff;border-radius:10px;padding:10px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.04)}
.sbox .num{font-size:20px;font-weight:bold;color:#c2410c}
.sbox .lbl{font-size:11px;color:#999}
</style>
<h2>🍼 宝宝辅食记录</h2>
<p class="sub">记录每一餐 · 关注宝宝营养</p>
<div class="card">
  <h3>➕ 添加记录</h3>
  <div class="row"><label>食物</label><input id="food" placeholder="如：南瓜泥"></div>
  <div class="row"><label>类型</label><select id="type"><option value="g">🥬 谷物</option><option value="f">🍎 水果</option><option value="d">🥩 肉蛋</option><option value="r">🥦 蔬菜</option></select></div>
  <div class="row"><label style="font-size:13px">🐣 过敏反应</label><select id="reaction"><option value="无">✅ 无</option><option value="轻微">⚠️ 轻微皮疹</option><option value="明显">🚨 明显不适</option></select></div>
  <button class="btn" onclick="addFood()">📝 记录</button>
</div>
<div class="summary" id="summary">
  <div class="sbox"><div class="num" id="cnt">0</div><div class="lbl">今日记录</div></div>
  <div class="sbox"><div class="num" id="allergy">0</div><div class="lbl">⚠️ 过敏项</div></div>
</div>
<div class="card">
  <h3>📋 今日清单</h3>
  <div id="log"></div>
</div>
<script>
var logs=[];
function addFood(){
  var f=document.getElementById('food').value.trim();
  var t=document.getElementById('type').value;
  var r=document.getElementById('reaction').value;
  if(!f)return;
  var now=new Date();
  logs.push({food:f,type:t,reaction:r,time:now.getHours()+':'+String(now.getMinutes()).padStart(2,'0')});
  document.getElementById('food').value='';
  render();
}
function remove(i){logs.splice(i,1);render()}
function typeLabel(t){var m={g:'🥬',f:'🍎',d:'🥩',r:'🥦'};return (m[t]||'')}
function render(){
  document.getElementById('cnt').textContent=logs.length;
  document.getElementById('allergy').textContent=logs.filter(function(l){return l.reaction!=='无'}).length;
  document.getElementById('log').innerHTML=logs.length===0?'<p style="color:#999;text-align:center;font-size:13px;padding:12px 0">还没有记录~</p>':
    logs.map(function(l,i){
      return '<div class="log-item"><div><span>'+typeLabel(l.type)+' '+l.food+'</span> <span class="time">'+l.time+'</span></div><div style="display:flex;align-items:center;gap:6px">'+(l.reaction!=='无'?'<span style="font-size:12px;color:#ef4444">⚠️</span>':'')+'<button class="remove" onclick="remove('+i+')">×</button></div></div>';
    }).join('');
}
</script>`,
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
    code: `<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#ecfdf5;padding:16px;color:#333}
h2{text-align:center;color:#047857;font-size:18px;margin-bottom:4px}
.sub{text-align:center;color:#999;font-size:12px;margin-bottom:16px}
.card{background:#fff;border-radius:12px;padding:14px;margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,.05)}
.card h3{font-size:14px;color:#047857;margin-bottom:10px}
.row{display:flex;gap:6px;align-items:center;margin-bottom:8px}
.row input{flex:1;padding:8px;border:1px solid #ddd;border-radius:8px;font-size:14px}
.btn{width:100%;padding:10px;background:#059669;color:#fff;border:none;border-radius:10px;font-size:14px;cursor:pointer}
.hotel{display:flex;justify-content:space-between;align-items:center;padding:10px;border-radius:10px;margin-bottom:6px;background:#f9fafb}
.hotel.best{background:#d1fae5;border:2px solid #10b981}
.hotel .info{flex:1}
.hotel .name{font-size:14px;font-weight:600}
.hotel .plat{font-size:11px;color:#999}
.hotel .price{font-size:16px;font-weight:bold;color:#047857}
.remove{color:#ef4444;background:none;border:none;font-size:16px;cursor:pointer;margin-left:8px}
.rank{margin-top:8px}
.rank-item{display:flex;justify-content:space-between;padding:8px 10px;background:#f9fafb;border-radius:8px;margin-bottom:4px;font-size:13px}
.rank-item .rnk{color:#059669;font-weight:bold}
</style>
<h2>🏨 酒店比价小助手</h2>
<p class="sub">多平台比价 · 省钱一目了然</p>
<div class="card">
  <h3>➕ 添加酒店报价</h3>
  <div class="row"><input id="hname" placeholder="酒店名称"></div>
  <div class="row"><input id="hplat" placeholder="平台（如：携程、美团）"><input id="hprice" type="number" placeholder="价格 ¥"></div>
  <button class="btn" onclick="addHotel()">添加报价</button>
</div>
<div class="card">
  <h3>🏆 价格排行</h3>
  <div id="hotels"><p style="color:#999;text-align:center;font-size:13px;padding:8px">还没有添加报价</p></div>
</div>
<script>
var hotels=[];
function addHotel(){
  var n=document.getElementById('hname').value.trim();
  var p=document.getElementById('hplat').value.trim();
  var pr=parseFloat(document.getElementById('hprice').value)||0;
  if(!n||pr<=0)return;
  hotels.push({name:n,plat:p||'未标注',price:pr});
  document.getElementById('hname').value='';
  document.getElementById('hplat').value='';
  document.getElementById('hprice').value='';
  render();
}
function remove(i){hotels.splice(i,1);render()}
function render(){
  var sorted=hotels.slice().sort(function(a,b){return a.price-b.price});
  document.getElementById('hotels').innerHTML=hotels.length===0?'<p style="color:#999;text-align:center;font-size:13px;padding:8px">还没有添加报价</p>':
    sorted.map(function(h,i){
      return '<div class="hotel'+(i===0?' best':'')+'"><div class="info"><div class="name">'+(i===0?'👑 ':'')+h.name+'</div><div class="plat">'+h.plat+'</div></div><div class="price">¥'+h.price+'</div><button class="remove" onclick="remove('+hotels.indexOf(h)+')">×</button></div>';
    }).join('');
}
</script>`,
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
    code: `<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#faf5ff;padding:16px;color:#333}
h2{text-align:center;color:#7c3aed;font-size:18px;margin-bottom:4px}
.sub{text-align:center;color:#999;font-size:12px;margin-bottom:16px}
.card{background:#fff;border-radius:12px;padding:14px;margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,.05)}
.card h3{font-size:14px;color:#7c3aed;margin-bottom:10px}
.row{display:flex;gap:8px;align-items:center;margin-bottom:8px}
.row label{font-size:13px;color:#666;flex-shrink:0}
.row input{flex:1;padding:8px;border:1px solid #ddd;border-radius:8px;font-size:14px}
.btn{width:100%;padding:10px;background:#7c3aed;color:#fff;border:none;border-radius:10px;font-size:14px;cursor:pointer}
.result{background:linear-gradient(135deg,#ede9fe,#ddd6fe);border-radius:12px;padding:16px;margin-top:12px}
.result .row-r{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #c4b5fd;font-size:13px}
.result .row-r:last-child{border-bottom:none}
.result .val{font-weight:bold;color:#5b21b6}
.formula{font-size:11px;color:#7c3aed;text-align:center;margin-top:10px;font-style:italic}
</style>
<h2>⚙️ 齿轮参数速算</h2>
<p class="sub">输入模数和齿数，秒出所有参数</p>
<div class="card">
  <h3>基本参数</h3>
  <div class="row"><label>模数 m</label><input id="module" type="number" placeholder="mm" value="2"></div>
  <div class="row"><label>齿数 z</label><input id="teeth" type="number" placeholder="" value="30"></div>
  <div class="row"><label>压力角 α</label><select id="alpha" style="flex:1;padding:8px;border:1px solid #ddd;border-radius:8px;font-size:14px"><option value="20" selected>20°</option><option value="14.5">14.5°</option><option value="25">25°</option></select></div>
  <button class="btn" onclick="calc()">计算参数</button>
</div>
<div class="result" id="result" style="display:none">
  <h3 style="color:#7c3aed;margin-bottom:10px">计算结果</h3>
  <div class="row-r"><span>分度圆直径 d</span><span class="val" id="pitchD"></span></div>
  <div class="row-r"><span>齿顶圆直径 da</span><span class="val" id="addendumD"></span></div>
  <div class="row-r"><span>齿根圆直径 df</span><span class="val" id="dedendumD"></span></div>
  <div class="row-r"><span>齿顶高 ha</span><span class="val" id="addendumH"></span></div>
  <div class="row-r"><span>齿根高 hf</span><span class="val" id="dedendumH"></span></div>
  <div class="row-r"><span>全齿高 h</span><span class="val" id="totalH"></span></div>
  <div class="row-r"><span>周节 p</span><span class="val" id="circularP"></span></div>
  <p class="formula">ha = m · z / 2cosβ（直齿 β=0）</p>
</div>
<script>
function calc(){
  var m=parseFloat(document.getElementById('module').value)||2;
  var z=parseFloat(document.getElementById('teeth').value)||30;
  var d=m*z;
  var ha=m;
  var hf=1.25*m;
  var da=d+2*ha;
  var df=d-2*hf;
  var h=ha+hf;
  var p=Math.PI*m;
  document.getElementById('pitchD').textContent=d.toFixed(2)+' mm';
  document.getElementById('addendumD').textContent=da.toFixed(2)+' mm';
  document.getElementById('dedendumD').textContent=df.toFixed(2)+' mm';
  document.getElementById('addendumH').textContent=ha.toFixed(2)+' mm';
  document.getElementById('dedendumH').textContent=hf.toFixed(2)+' mm';
  document.getElementById('totalH').textContent=h.toFixed(2)+' mm';
  document.getElementById('circularP').textContent=p.toFixed(3)+' mm';
  document.getElementById('result').style.display='block';
}
</script>`,
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
    code: `<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#fffbeb;padding:16px;color:#333}
h2{text-align:center;color:#b45309;font-size:18px;margin-bottom:4px}
.sub{text-align:center;color:#999;font-size:12px;margin-bottom:16px}
.card{background:#fff;border-radius:14px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,.06);text-align:center;margin-bottom:10px}
.chinese{font-size:28px;color:#b45309;margin-bottom:4px;font-weight:bold}
.hint{font-size:12px;color:#999;margin-bottom:12px}
.answer{width:100%;padding:12px;border:2px solid #d4a373;border-radius:10px;font-size:18px;text-align:center;margin-bottom:10px;outline:none;letter-spacing:2px}
.answer:focus{border-color:#b45309}
.btn{width:100%;padding:10px;background:#d97706;color:#fff;border:none;border-radius:10px;font-size:14px;cursor:pointer;margin-bottom:6px}
.btn2{background:#fcd34d;color:#92400e}
.msg{font-size:14px;margin-top:6px;min-height:20px}
.score{display:flex;justify-content:center;gap:16px;font-size:13px;color:#b45309}
.result-list{margin-top:10px;text-align:left}
.result-list .item{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #fef3c7;font-size:13px}
.correct-w{color:#16a34a}.wrong-w{color:#dc2626}.skip-w{color:#9ca3af}
</style>
<h2>🇬🇧 英语单词小测</h2>
<p class="sub">看中文拼英文 · 四六级词汇</p>
<div class="card" id="quizArea">
  <p class="chinese" id="word"></p>
  <p class="hint" id="hintText"></p>
  <input class="answer" id="spell" placeholder="拼写单词..." autocomplete="off">
  <p class="msg" id="msg"></p>
  <button class="btn" onclick="check()">提交 ✏️</button>
  <button class="btn btn2" onclick="skip()">跳过 →</button>
</div>
<div class="score">
  <span>✅ <span id="sCorrect">0</span></span>
  <span>❌ <span id="sWrong">0</span></span>
  <span>⏭ <span id="sSkip">0</span></span>
</div>
<div id="results" class="result-list" style="display:none">
  <h4 style="margin-top:10px;color:#b45309;font-size:14px">📊 测验结果</h4>
</div>
<script>
var bank=[{c:'勤奋的',e:'diligent',h:'形容词'},{c:'杰出的',e:'remarkable',h:'形容词'},{c:'丰富的',e:'abundant',h:'形容词'},{c:'精确的',e:'accurate',h:'形容词'},{c:'牺牲',e:'sacrifice',h:'名词/动词'},{c:'灵活的',e:'flexible',h:'形容词'},{c:'必不可少的',e:'indispensable',h:'形容词'},{c:'矛盾',e:'contradiction',h:'名词'},{c:'热情',e:'enthusiasm',h:'名词'},{c:'现象',e:'phenomenon',h:'名词'}];
var correct=0,wrong=0,skip=0,results=[],current=null,quizEnd=false;
function pick(){
  if(bank.length===0){endQuiz();return;}
  var i=Math.floor(Math.random()*bank.length);
  current=bank[i];bank.splice(i,1);
  document.getElementById('word').textContent=current.c;
  document.getElementById('hintText').textContent='['+current.h+'] · 首字母: '+current.e[0].toUpperCase();
  document.getElementById('spell').value='';
  document.getElementById('msg').textContent='';
  document.getElementById('spell').focus();
}
function check(){
  if(quizEnd)return;
  var ans=document.getElementById('spell').value.trim().toLowerCase();
  if(!ans)return;
  if(ans===current.e){correct++;document.getElementById('msg').innerHTML='<span style="color:#16a34a">✅ 太棒了！</span>';}
  else{wrong++;document.getElementById('msg').innerHTML='<span style="color:#dc2626">❌ 正确答案: '+current.e+'</span>';}
  results.push({word:current,userAns:ans});
  updateScore();
  setTimeout(pick,800);
}
function skip(){if(quizEnd)return;skip++;results.push({word:current,userAns:null});updateScore();pick()}
function updateScore(){
  document.getElementById('sCorrect').textContent=correct;
  document.getElementById('sWrong').textContent=wrong;
  document.getElementById('sSkip').textContent=skip;
}
function endQuiz(){
  quizEnd=true;
  document.getElementById('quizArea').innerHTML='<p style="font-size:18px;color:#b45309;padding:20px">🎉 测验完成！</p><p style="font-size:14px;color:#666">正确 '+correct+' / 错误 '+wrong+' / 跳过 '+skip+'</p>';
  var list=document.getElementById('results');
  list.style.display='block';
  list.innerHTML='<h4 style="margin-bottom:10px;color:#b45309;font-size:14px">📊 详细结果</h4>'+results.map(function(r){
    var cls=r.userAns===null?'skip-w':r.userAns===r.word.e?'correct-w':'wrong-w';
    var icon=r.userAns===null?'⏭':r.userAns===r.word.e?'✅':'❌';
    return '<div class="item"><span>'+icon+' '+r.word.c+'</span><span class="'+cls+'">'+(r.userAns||'跳过')+' → '+r.word.e+'</span></div>';
  }).join('');
}
pick();
</script>`,
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
    code: `<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#eff6ff;padding:16px;color:#333}
h2{text-align:center;color:#1d4ed8;font-size:18px;margin-bottom:4px}
.sub{text-align:center;color:#999;font-size:12px;margin-bottom:12px}
.progress{text-align:center;margin-bottom:16px}
.progress .big{font-size:36px;font-weight:bold;color:#1d4ed8}
.progress .unit{font-size:14px;color:#60a5fa}
.water-bar{background:#dbeafe;border-radius:10px;height:10px;margin:8px 0;overflow:hidden}
.water-fill{background:linear-gradient(90deg,#3b82f6,#2563eb);height:100%;border-radius:10px;transition:width .3s}
.glasses{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}
.glass{aspect-ratio:1;border-radius:16px;border:3px solid #93c5fd;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;background:#fff;font-size:28px}
.glass.filled{background:#dbeafe;border-color:#3b82f6;transform:scale(1.05)}
.glass .ml{font-size:10px;color:#93c5fd;margin-top:2px}
.controls{display:flex;gap:8px}
.btn{flex:1;padding:10px;border:none;border-radius:10px;font-size:13px;cursor:pointer;color:#fff}
.btn-blue{background:#3b82f6}.btn-gray{background:#9ca3af}
.stats{display:flex;justify-content:space-around;margin-top:14px;font-size:12px;color:#6b7280}
</style>
<h2>💧 每日喝水打卡</h2>
<p class="sub">每天 8 杯水 · 健康好习惯</p>
<div class="progress" id="progressBar">
  <span class="big" id="totalMl">0</span><span class="unit"> ml</span>
  <div class="water-bar"><div class="water-fill" id="fillBar" style="width:0%"></div></div>
  <span style="font-size:12px;color:#60a5fa">目标: 2000ml</span>
</div>
<div class="glasses" id="glasses"></div>
<div class="controls">
  <button class="btn btn-blue" onclick="addGlass()">+ 一杯 (250ml)</button>
  <button class="btn btn-gray" onclick="resetDay()">🔄 重置</button>
</div>
<div class="stats">
  <span id="cupCount">已喝 0 杯</span>
  <span id="completion">完成 0%</span>
</div>
<script>
var TARGET=2000,CUP=250;
var cups=Math.floor(TARGET/CUP);
var filled=0;
function render(){
  var total=filled*CUP;
  var pct=Math.min(100,Math.round(total/TARGET*100));
  document.getElementById('totalMl').textContent=total;
  document.getElementById('fillBar').style.width=pct+'%';
  document.getElementById('cupCount').textContent='已喝 '+filled+' / '+cups+' 杯';
  document.getElementById('completion').textContent='完成 '+pct+'%';
  document.getElementById('glasses').innerHTML=Array.from({length:cups},function(_,i){
    return '<div class="glass'+(i<filled?' filled':'')+'" onclick="toggle('+i+')">💧<span class="ml">250ml</span></div>';
  }).join('');
}
function addGlass(){if(filled<cups){filled++;render()}}
function toggle(i){filled=i+1;if(filled===cups+1)filled=cups;render()}
function resetDay(){filled=0;render()}
render();
</script>`,
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
    code: `<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#fdf2f8;padding:16px;color:#333}
h2{text-align:center;color:#be185d;font-size:18px;margin-bottom:4px}
.sub{text-align:center;color:#999;font-size:12px;margin-bottom:12px}
.card{background:#fff;border-radius:14px;padding:14px;margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,.05)}
.card h3{font-size:14px;color:#be185d;margin-bottom:10px}
.row{display:flex;gap:6px;align-items:center;margin-bottom:8px}
.row input{flex:1;padding:8px;border:1px solid #ddd;border-radius:8px;font-size:14px}
.row select{flex:1;padding:8px;border:1px solid #ddd;border-radius:8px;font-size:14px}
.btn{width:100%;padding:10px;background:#db2777;color:#fff;border:none;border-radius:10px;font-size:14px;cursor:pointer}
.total-bar{background:linear-gradient(135deg,#db2777,#f472b6);color:#fff;border-radius:12px;padding:14px;text-align:center;margin-bottom:12px}
.total-bar .big{font-size:26px;font-weight:bold}
.total-bar .lbl{font-size:11px;opacity:.8}
.cats{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
.cat{padding:3px 8px;border-radius:12px;font-size:11px;background:#fce7f3;color:#be185d}
.log-item{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #fdf2f8;font-size:13px}
.log-item .cat-tag{font-size:10px;padding:1px 6px;border-radius:8px;margin-left:6px}
</style>
<h2>📒 行程花费日记</h2>
<p class="sub">旅途每一笔，清清楚楚</p>
<div class="total-bar">
  <div class="lbl">💰 旅行总花费</div>
  <div class="big" id="total">¥0</div>
</div>
<div class="card">
  <h3>➕ 记一笔</h3>
  <div class="row"><input id="desc" placeholder="买了什么 / 花了什么钱"></div>
  <div class="row"><input id="cost" type="number" placeholder="金额 ¥"><select id="cat"><option value="🏨住宿">🏨 住宿</option><option value="🍜餐饮">🍜 餐饮</option><option value="🚕交通">🚕 交通</option><option value="🎫门票">🎫 门票</option><option value="🛍购物">🛍 购物</option><option value="📱其他">📱 其他</option></select></div>
  <button class="btn" onclick="add()">💾 记录</button>
</div>
<div class="card">
  <h3>📋 消费明细</h3>
  <div id="cats" class="cats"></div>
  <div id="log"></div>
</div>
<script>
var logs=[];
function add(){
  var d=document.getElementById('desc').value.trim();
  var c=parseFloat(document.getElementById('cost').value)||0;
  var t=document.getElementById('cat').value;
  if(!d||c<=0)return;
  logs.unshift({desc:d,cost:c,cat:t});
  document.getElementById('desc').value='';
  document.getElementById('cost').value='';
  render();
}
function render(){
  var total=logs.reduce(function(s,l){return s+l.cost},0);
  document.getElementById('total').textContent='¥'+total;
  var cmap={};
  logs.forEach(function(l){cmap[l.cat]=(cmap[l.cat]||0)+l.cost});
  document.getElementById('cats').innerHTML=Object.keys(cmap).map(function(k){
    return '<span class="cat">'+k+' ¥'+cmap[k]+'</span>';
  }).join('');
  document.getElementById('log').innerHTML=logs.length===0?'<p style="color:#999;text-align:center;font-size:13px;padding:12px">还没有记录 · 开始记一笔吧</p>':
    logs.map(function(l,i){
      return '<div class="log-item"><span>'+l.desc+'<span class="cat-tag" style="background:#fce7f3;color:#be185d">'+l.cat+'</span></span><span style="font-weight:600;color:#be185d">¥'+l.cost+'</span></div>';
    }).join('');
}
</script>`,
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
    code: `<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#f0f9ff;padding:16px;color:#333}
h2{text-align:center;color:#0369a1;font-size:18px;margin-bottom:8px}
.tabs{display:flex;gap:4px;margin-bottom:14px;overflow-x:auto}
.tab{padding:6px 14px;border-radius:20px;font-size:13px;border:1px solid #bae6fd;background:#fff;color:#0369a1;cursor:pointer;white-space:nowrap;flex-shrink:0}
.tab.active{background:#0369a1;color:#fff;border-color:#0369a1}
.card{background:#fff;border-radius:14px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,.05);margin-bottom:10px}
.row{display:flex;gap:8px;align-items:center;margin-bottom:8px}
.row input{flex:1;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;text-align:center}
.row select{flex:1;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:13px;background:#fff}
.swap{text-align:center;margin:6px 0;font-size:20px;color:#0369a1}
.result-bar{background:linear-gradient(135deg,#e0f2fe,#bae6fd);border-radius:10px;padding:12px;text-align:center;margin-top:8px}
.result-bar .val{font-size:22px;font-weight:bold;color:#075985}
.result-bar .lbl{font-size:11px;color:#0369a1}
</style>
<h2>📐 单位换算大全</h2>
<div class="tabs" id="tabs">
  <button class="tab active" onclick="switchTab('length')">📏 长度</button>
  <button class="tab" onclick="switchTab('weight')">⚖️ 重量</button>
  <button class="tab" onclick="switchTab('temp')">🌡 温度</button>
  <button class="tab" onclick="switchTab('area')">📐 面积</button>
  <button class="tab" onclick="switchTab('volume')">🧴 体积</button>
</div>
<div class="card">
  <div class="row"><input id="inputVal" type="number" placeholder="输入数值" value="1" oninput="convert()"><select id="fromUnit" onchange="convert()"></select></div>
  <div class="swap">⇅</div>
  <div class="row"><select id="toUnit" onchange="convert()"></select></div>
  <div class="result-bar"><span class="val" id="outputVal">—</span><span class="lbl" id="outputUnit"></span></div>
</div>
<script>
var units={
  length:{units:{m:1,km:1000,cm:0.01,mm:0.001,inch:0.0254,ft:0.3048,mile:1609.34},name:'长度'},
  weight:{units:{kg:1,g:0.001,mg:1e-6,ton:1000,lb:0.4536,oz:0.02835},name:'重量'},
  temp:{units:{C:1,F:1,K:1},name:'温度',custom:true},
  area:{units:{m2:1,km2:1e6,cm2:1e-4,ha:10000,mu:666.67},name:'面积'},
  volume:{units:{L:1,mL:0.001,m3:1000,gal:3.785,qt:0.946},name:'体积'}
};
var current='length';
function switchTab(t){
  current=t;
  var tabs=document.querySelectorAll('.tab');
  for(var i=0;i<tabs.length;i++)tabs[i].classList.remove('active');
  event.target.classList.add('active');
  loadUnits();convert();
}
function loadUnits(){
  var keys=Object.keys(units[current].units);
  var opts=keys.map(function(k){return '<option value="'+k+'">'+k+'</option>';}).join('');
  document.getElementById('fromUnit').innerHTML=opts;
  document.getElementById('toUnit').innerHTML=opts;
}
function convert(){
  var v=parseFloat(document.getElementById('inputVal').value)||0;
  var f=document.getElementById('fromUnit').value;
  var t=document.getElementById('toUnit').value;
  var u=units[current];
  var result;
  if(u.custom){
    if(f==='C'&&t==='F')result=v*9/5+32;
    else if(f==='F'&&t==='C')result=(v-32)*5/9;
    else if(f==='C'&&t==='K')result=v+273.15;
    else if(f==='K'&&t==='C')result=v-273.15;
    else if(f==='F'&&t==='K')result=(v-32)*5/9+273.15;
    else if(f==='K'&&t==='F')result=(v-273.15)*9/5+32;
    else result=v;
  }else{
    result=v*u.units[f]/u.units[t];
  }
  document.getElementById('outputVal').textContent=result.toFixed(4);
  document.getElementById('outputUnit').textContent=' '+t;
}
loadUnits();convert();
</script>`,
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
    code: `<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#fff7ed;padding:16px;color:#333}
h2{text-align:center;color:#c2410c;font-size:20px;margin-bottom:4px}
.sub{text-align:center;color:#999;font-size:12px;margin-bottom:12px}
.card{background:#fff;border-radius:16px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,.06);text-align:center;margin-bottom:10px}
.question{font-size:36px;font-weight:bold;color:#c2410c;margin-bottom:14px;letter-spacing:4px}
.answer{width:100%;padding:14px;border:3px solid #fdba74;border-radius:12px;font-size:24px;text-align:center;outline:none;margin-bottom:10px}
.answer:focus{border-color:#ea580c}
.btn{width:100%;padding:10px;background:#ea580c;color:#fff;border:none;border-radius:10px;font-size:15px;cursor:pointer}
.msg{font-size:15px;margin:8px 0;min-height:22px}
.stats-bar{display:flex;justify-content:center;gap:20px;font-size:13px;color:#c2410c;margin-top:4px}
.timer{font-size:28px;font-weight:bold;color:#ea580c;margin-bottom:8px}
.start-btn{width:100%;padding:16px;background:#ea580c;color:#fff;border:none;border-radius:12px;font-size:18px;cursor:pointer;margin-top:10px}
</style>
<h2>✖️ 九九乘法测验</h2>
<p class="sub">计时答题 · 看看你能对几道</p>
<div id="startScreen" style="text-align:center;padding:30px 0">
  <p style="font-size:40px;margin-bottom:12px">🧮</p>
  <p style="color:#c2410c;font-size:15px;font-weight:bold">限时 60 秒 · 10 道题</p>
  <button class="start-btn" onclick="start()">开始挑战 🚀</button>
</div>
<div id="quizArea" style="display:none">
  <div class="timer" id="timer">60</div>
  <div class="card">
    <p class="question" id="qText"></p>
    <input type="number" class="answer" id="ans" placeholder="?" autocomplete="off">
    <p class="msg" id="msg"></p>
  </div>
  <div class="stats-bar">
    <span>✅ <span id="sc">0</span></span>
    <span>❌ <span id="sw">0</span></span>
    <span>📝 <span id="sq">0</span>/10</span>
  </div>
</div>
<script>
var correct=0,wrong=0,qnum=0,timer=60,a,b,active=false;
function start(){
  document.getElementById('startScreen').style.display='none';
  document.getElementById('quizArea').style.display='block';
  correct=0;wrong=0;qnum=0;timer=60;active=true;
  updateScore();
  document.getElementById('timer').textContent=timer;
  var ti=setInterval(function(){
    timer--;document.getElementById('timer').textContent=timer;
    if(timer<=0){clearInterval(ti);endQuiz();}
  },1000);
  window._timerId=ti;
  next();
}
function next(){
  if(!active)return;
  var ansEl=document.getElementById('ans');
  ansEl.value='';ansEl.focus();
  document.getElementById('msg').textContent='';
  a=Math.floor(Math.random()*9)+1;
  b=Math.floor(Math.random()*9)+1;
  document.getElementById('qText').textContent=a+' × '+b+' = ?';
}
ans.addEventListener('keydown',function(e){
  if(e.key==='Enter'){
    var val=parseInt(document.getElementById('ans').value);
    if(isNaN(val))return;
    qnum++;
    if(val===a*b){correct++;document.getElementById('msg').textContent='✅';document.getElementById('msg').style.color='#16a34a';}
    else{wrong++;document.getElementById('msg').textContent='❌ '+a+'×'+b+'='+(a*b);document.getElementById('msg').style.color='#dc2626';}
    updateScore();
    if(qnum>=10||timer<=0){endQuiz();return;}
    setTimeout(next,500);
  }
});
function updateScore(){
  document.getElementById('sc').textContent=correct;
  document.getElementById('sw').textContent=wrong;
  document.getElementById('sq').textContent=qnum;
}
function endQuiz(){
  active=false;clearInterval(window._timerId);
  document.getElementById('quizArea').innerHTML='<div class="card"><p style="font-size:40px;margin-bottom:8px">🏆</p><p style="font-size:22px;font-weight:bold;color:#c2410c">挑战结束</p><p style="font-size:14px;color:#666;margin-top:8px">正确 '+correct+' 题 / 错误 '+wrong+' 题 / 共 '+qnum+' 题</p><p style="font-size:36px;font-weight:bold;color:#ea580c;margin-top:12px">'+(correct>=9?'🌟 ':correct>=6?'👍 ':'💪 ')+(correct*10)+' 分</p><button class="btn" onclick="location.reload()" style="margin-top:14px">再来一次 🔄</button></div>';
}
</script>`,
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
    code: `<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#f0fdf4;padding:16px;color:#333}
h2{text-align:center;color:#166534;font-size:18px;margin-bottom:4px}
.sub{text-align:center;color:#999;font-size:12px;margin-bottom:12px}
.card{background:#fff;border-radius:14px;padding:14px;margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,.05)}
.card h3{font-size:14px;color:#166534;margin-bottom:10px}
.row{display:flex;gap:6px;align-items:center;margin-bottom:8px}
.row input{flex:1;padding:8px;border:1px solid #ddd;border-radius:8px;font-size:14px}
.btn{width:100%;padding:10px;background:#16a34a;color:#fff;border:none;border-radius:10px;font-size:14px;cursor:pointer}
.food-item{display:flex;justify-content:space-between;align-items:center;padding:10px;border-radius:10px;margin-bottom:6px;background:#f9fafb}
.food-item.expiring{background:#fef2f2;border:2px solid #fecaca}
.food-item.expired{background:#fef2f2;border:2px solid #ef4444}
.food-item .info{flex:1}
.food-item .fname{font-size:14px;font-weight:600}
.food-item .fdate{font-size:11px;color:#999;margin-top:2px}
.food-item .badge{padding:2px 8px;border-radius:10px;font-size:11px;color:#fff}
.badge-good{background:#22c55e}.badge-warn{background:#f59e0b}.badge-bad{background:#ef4444}
.remove{color:#ef4444;background:none;border:none;font-size:16px;cursor:pointer;margin-left:8px}
.stats-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:10px}
.stat{background:#fff;border-radius:10px;padding:8px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.04)}
.stat .num{font-size:18px;font-weight:bold}
.stat .lbl{font-size:10px;color:#999}
</style>
<h2>🧊 冰箱食材管理</h2>
<p class="sub">录入食材 · 快过期自动提醒</p>
<div class="card">
  <h3>➕ 添加食材</h3>
  <div class="row"><input id="fname" placeholder="食材名称（如：鸡蛋）"></div>
  <div class="row"><label style="font-size:13px;color:#666;flex-shrink:0">保质期</label><input id="fdate" type="date"></div>
  <button class="btn" onclick="addFood()">📥 放入冰箱</button>
</div>
<div class="stats-grid" id="stats">
  <div class="stat"><div class="num" style="color:#16a34a" id="fresh">0</div><div class="lbl">✅ 新鲜</div></div>
  <div class="stat"><div class="num" style="color:#f59e0b" id="warn">0</div><div class="lbl">⚠️ 临近</div></div>
  <div class="stat"><div class="num" style="color:#ef4444" id="bad">0</div><div class="lbl">🚫 过期</div></div>
</div>
<div class="card">
  <h3>📋 食材清单</h3>
  <div id="foodList"></div>
</div>
<script>
var foods=[];
function addFood(){
  var n=document.getElementById('fname').value.trim();
  var d=document.getElementById('fdate').value;
  if(!n||!d)return;
  foods.push({name:n,expiry:d});
  document.getElementById('fname').value='';
  document.getElementById('fdate').value='';
  render();
}
function remove(i){foods.splice(i,1);render()}
function daysLeft(d){
  var now=new Date();now.setHours(0,0,0,0);
  var exp=new Date(d);
  return Math.ceil((exp-now)/(1000*60*60*24));
}
function render(){
  var sorted=foods.slice().sort(function(a,b){return daysLeft(a.expiry)-daysLeft(b.expiry)});
  var fresh=0,warn=0,bad=0;
  document.getElementById('foodList').innerHTML=sorted.length===0?'<p style="color:#999;text-align:center;font-size:13px;padding:12px">冰箱空空如也~</p>':
    sorted.map(function(f,i){
      var d=daysLeft(f.expiry);
      var status,cls,badge;
      if(d<0){status='expired';cls='expired';badge='badge-bad';bad++;}
      else if(d<=3){status='expiring';cls='expiring';badge='badge-warn';warn++;}
      else{status='';cls='';badge='badge-good';fresh++;}
      var label=d<0?'已过期 '+Math.abs(d)+' 天':d===0?'今天到期':'还有 '+d+' 天';
      return '<div class="food-item '+cls+'"><div class="info"><div class="fname">'+f.name+'</div><div class="fdate">📅 '+f.expiry+' · '+label+'</div></div><span class="badge '+badge+'">'+(d<0?'🚫':d<=3?'⚠️':'✅')+'</span><button class="remove" onclick="remove('+foods.indexOf(f)+')">×</button></div>';
    }).join('');
  document.getElementById('fresh').textContent=fresh;
  document.getElementById('warn').textContent=warn;
  document.getElementById('bad').textContent=bad;
}
</script>`,
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
    code: `<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#f5f3ff;padding:16px;color:#333}
h2{text-align:center;color:#5b21b6;font-size:18px;margin-bottom:4px}
.sub{text-align:center;color:#999;font-size:12px;margin-bottom:12px}
.card{background:#fff;border-radius:12px;padding:14px;margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,.05)}
.card h3{font-size:14px;color:#5b21b6;margin-bottom:10px}
.row{display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap}
.row label{font-size:13px;color:#666;flex-shrink:0}
.row input,.row select{flex:1;min-width:80px;padding:8px;border:1px solid #ddd;border-radius:8px;font-size:14px}
.btn{width:100%;padding:10px;background:#7c3aed;color:#fff;border:none;border-radius:10px;font-size:14px;cursor:pointer}
.btn-sm{padding:4px 10px;font-size:12px}
.tag{padding:2px 8px;border-radius:10px;font-size:11px;color:#fff;margin-left:4px}
.result{background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border-radius:14px;padding:16px;text-align:center;margin-top:10px}
.result .big{font-size:32px;font-weight:bold}
.result .small{font-size:12px;opacity:.8}
.currency-bar{display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap}
.cbtn{padding:6px 12px;border-radius:16px;font-size:12px;border:1px solid #c4b5fd;background:#fff;color:#5b21b6;cursor:pointer}
.cbtn.active{background:#7c3aed;color:#fff;border-color:#7c3aed}
</style>
<h2>💰 旅行分账 Pro</h2>
<p class="sub">多人分账 · 多币种支持 · 小费计算</p>
<div class="card">
  <h3>🌍 选择币种</h3>
  <div class="currency-bar" id="cbar">
    <button class="cbtn active" onclick="setCurrency('CNY','¥',1)">¥ 人民币</button>
    <button class="cbtn" onclick="setCurrency('USD','$',7.2)">$ 美元</button>
    <button class="cbtn" onclick="setCurrency('JPY','¥',0.047)">¥ 日元</button>
    <button class="cbtn" onclick="setCurrency('EUR','€',7.8)">€ 欧元</button>
  </div>
</div>
<div class="card">
  <h3>💰 总花费</h3>
  <div class="row"><label>金额</label><input id="amount" type="number" value="2000"> <span id="sym" style="font-weight:bold;color:#5b21b6">¥</span></div>
  <div class="row"><label>人数</label><input id="people" type="number" value="4"></div>
  <div class="row"><label>小费 %</label><input id="tip" type="number" value="10" style="max-width:80px"> <span style="font-size:12px;color:#999">可选</span></div>
  <button class="btn" onclick="calc()">🧾 计算分账</button>
</div>
<div class="result" id="result" style="display:none">
  <div class="small">每人应付</div>
  <div class="big" id="perPerson"></div>
  <div class="small" id="detail" style="margin-top:6px"></div>
</div>
<script>
var rate=1,symbol='¥',cur='CNY';
function setCurrency(c,s,r){
  rate=r;symbol=s;cur=c;
  document.getElementById('sym').textContent=s;
  var btns=document.querySelectorAll('.cbtn');
  for(var i=0;i<btns.length;i++)btns[i].classList.remove('active');
  event.target.classList.add('active');
  calc();
}
function calc(){
  var a=parseFloat(document.getElementById('amount').value)||0;
  var p=parseInt(document.getElementById('people').value)||1;
  var t=parseFloat(document.getElementById('tip').value)||0;
  var total=a*(1+t/100);
  var per=Math.ceil(total/p);
  var cny=Math.round(per*rate*100)/100;
  var detail=total!==a?'含小费 '+t+'% · 总计 '+symbol+total.toFixed(0)+' · ':'';
  document.getElementById('detail').textContent=detail+(cur!=='CNY'?'≈ ¥'+cny:'');
  document.getElementById('perPerson').textContent=symbol+per;
  document.getElementById('result').style.display='block';
}
</script>`,
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
    code: `<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'KaiTi','STKaiti',serif;background:#fefce8;padding:16px;color:#333}
h2{text-align:center;color:#854d0e;font-size:20px;margin-bottom:4px}
.sub{text-align:center;color:#999;font-size:12px;margin-bottom:16px}
.card{background:#fff;border-radius:16px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,.06);text-align:center;margin-bottom:10px}
.poem-hint{font-size:12px;color:#a16207;margin-bottom:8px}
.verse{font-size:22px;color:#713f12;line-height:2;letter-spacing:2px;margin-bottom:14px}
.verse .blank-input{display:inline-block;width:50px;border:none;border-bottom:2px solid #eab308;font-size:22px;text-align:center;font-family:inherit;margin:0 4px;outline:none;color:#713f12;background:transparent}
.verse .blank-input:focus{border-bottom-color:#854d0e}
.verse .filled{color:#16a34a}.verse .wrong-fill{color:#dc2626}
.btn{width:100%;padding:10px;background:#ca8a04;color:#fff;border:none;border-radius:10px;font-size:14px;cursor:pointer;margin-top:4px}
.btn2{background:#fef3c7;color:#854d0e;margin-top:6px}
.msg{font-size:14px;margin-top:10px;min-height:20px}
.score{display:flex;justify-content:center;gap:20px;font-size:13px;color:#854d0e}
</style>
<h2>✍️ 古诗词填空</h2>
<p class="sub">适合小学生 · 填出空缺的字</p>
<div class="card" id="quiz">
  <p class="poem-hint" id="hint"></p>
  <p class="verse" id="verse"></p>
  <p class="msg" id="msg"></p>
  <button class="btn" onclick="submit()">提交 ✅</button>
  <button class="btn btn2" onclick="nextQ()">下一题 ▶</button>
</div>
<div class="score">
  <span>✅ <span id="sc">0</span></span>
  <span>❌ <span id="sw">0</span></span>
  <span>📝 <span id="sq">0</span></span>
</div>
<script>
var bank=[
  {before:'床前明月光',after:'是地上霜',blank:'疑',hint:'李白《静夜思》'},
  {before:'春眠不觉晓',after:'处闻啼鸟',blank:'处',hint:'孟浩然《春晓》'},
  {before:'锄禾日当午',after:'滴禾下土',blank:'汗',hint:'李绅《悯农》'},
  {before:'白日依山尽',after:'河入海流',blank:'黄',hint:'王之涣《登鹳雀楼》'},
  {before:'离离原上草',after:'岁一枯荣',blank:'一',hint:'白居易《赋得古原草送别》'},
  {before:'小荷才露尖尖角',after:'有蜻蜓立上头',blank:'早',hint:'杨万里《小池》'},
];
var correct=0,wrong=0,qnum=0,current=null;
function nextQ(){
  var i=Math.floor(Math.random()*bank.length);
  current=bank[i];
  document.getElementById('hint').textContent='—— '+current.hint;
  var blanks=document.querySelectorAll('.blank-input');
  for(var j=0;j<blanks.length;j++){blanks[j].className='blank-input';blanks[j].value='';}
  document.getElementById('verse').innerHTML=current.before+'<input class="blank-input" id="blankInput" maxlength="1" oninput="handleInput()">'+current.after;
  document.getElementById('msg').textContent='';
  document.getElementById('blankInput').focus();
}
function handleInput(){
  var inp=document.getElementById('blankInput');
  if(inp&&inp.value.length>0){inp.value=inp.value[inp.value.length-1];}
}
function submit(){
  if(!current)return;
  var inp=document.getElementById('blankInput');
  if(!inp)return;
  var val=inp.value.trim();
  qnum++;
  if(val===current.blank){
    correct++;inp.className='blank-input filled';inp.disabled=true;
    document.getElementById('msg').innerHTML='<span style="color:#16a34a">✅ 太棒了！</span>';
  }else{
    wrong++;inp.className='blank-input wrong-fill';inp.disabled=true;
    document.getElementById('msg').innerHTML='<span style="color:#dc2626">❌ 正确答案：'+current.blank+'</span>';
  }
  updateScore();
}
function updateScore(){
  document.getElementById('sc').textContent=correct;
  document.getElementById('sw').textContent=wrong;
  document.getElementById('sq').textContent=qnum;
}
nextQ();
</script>`,
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
</body>
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
var history=[];
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
history.unshift(pw);
if(history.length>10)history.pop();
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
h.innerHTML=history.map(function(p,i){return '<div class="history-item"><span>'+p.substring(0,24)+(p.length>24?'…':'')+'</span><button class="copy-sm" onclick="copyHistory('+i+')">复制</button></div>'}).join('')
}
function copyHistory(i){
navigator.clipboard.writeText(history[i]).catch(function(){})
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
</script>
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
            updateSpecOptions(this.value);
            // 自动查询第一个
            queryThread();
        });

        // 规格切换 → 自动查询
        specSelect.addEventListener('change', queryThread);

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
            // 设置默认类型
            const defaultType = 'metric_coarse';
            typeSelect.value = defaultType;
            updateSpecOptions(defaultType);
            // 渲染表格
            renderTable();
            // 自动查询第一个
            queryThread();
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
const MOCK_REVIEWS: Review[] = [
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

function getMockReviews(): Review[] {
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

function setMockReviews(revs: Review[]): void {
  _mockReviews = revs;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(REV_KEY, JSON.stringify(revs));
    } catch { /* full */ }
  }
}

// ---- Helpers ----

/** Row mapper: Supabase row → Tool object */
function mapRow(row: Record<string, unknown>): Tool {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    author: String(row.author ?? ""),
    authorId: row.author_id ? String(row.author_id) : undefined,
    category: row.category as ToolCategory,
    code: String(row.code ?? ""),
    thumbnailGradient:
      String(row.thumbnail_gradient ?? row.thumbnailGradient ?? ""),
    coverUrl: row.cover_url ? String(row.cover_url) : `/covers/${String(row.id)}.png`,
    createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString()),
    description: row.description ? String(row.description) : undefined,
    sourceToolId: row.source_tool_id ? String(row.source_tool_id) : undefined,
    viewCount: row.view_count !== undefined && row.view_count !== null ? Number(row.view_count) : undefined,
    visibility: (["public", "unlisted", "private"].includes(String(row.visibility ?? ""))
      ? String(row.visibility)
      : "public") as Visibility,
    isDownloadable: row.is_downloadable === true || row.is_downloadable === "true" || row.isDownloadable === true || undefined,
  };
}

// ---- Supabase client singleton (cached, lazy) ----

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabaseClient: any | null | undefined;

async function getSupabaseClient() {
  // Return cached null if already known to be unavailable
  if (_supabaseClient === null) return null;
  // Return cached client if already created
  if (_supabaseClient) return _supabaseClient;

  // 使用 supabase.ts 的单例，确保 auth session 全局同步
  const { getSupabase } = await import("@/lib/supabase");
  const client = getSupabase();
  if (!client) {
    _supabaseClient = null;
    return null;
  }
  _supabaseClient = client;
  return _supabaseClient;
}

/** Split an array into chunks of at most `size` elements each. */
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/** Wrap a Supabase query with a 3-second timeout. Returns null on timeout. */
async function queryWithTimeout<T>(promise: Promise<T>, timeoutMs = 3000): Promise<T | null> {
  try {
    const result = await Promise.race([
      promise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
    return result;
  } catch {
    return null;
  }
}

// ---- Tool data fetching ----

function loadLocalTools(): Tool[] {
  try {
    if (typeof localStorage === "undefined") return [];
    const raw = localStorage.getItem("wewoo-published-tools");
    if (!raw) return [];
    return JSON.parse(raw).map((t: Record<string, unknown>) => ({
      id: "local-" + (t.id || ""),
      title: String(t.title ?? "未命名"),
      author: String(t.author ?? "匿名"),
      authorId: t.author_id ? String(t.author_id) : undefined,
      category: (t.category || "生活") as ToolCategory,
      code: String(t.code ?? ""),
      thumbnailGradient: String(t.thumbnailGradient ?? t.thumbnail_gradient ?? ""),
      createdAt: String(t.createdAt ?? new Date().toISOString()),
      description: t.description ? String(t.description) : undefined,
      visibility: (["public", "unlisted", "private"].includes(String(t.visibility ?? t.is_public !== false ? "public" : "private"))
        ? String(t.visibility ?? (t.is_public !== false ? "public" : "private"))
        : "public") as Visibility,
      isDownloadable: t.is_downloadable === true || undefined,
    }));
  } catch {
    return [];
  }
}

function loadJson(key: string, fallback: unknown) {
  try { return JSON.parse(localStorage.getItem(key) || ""); } catch { return fallback; }
}
function saveJson(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* quota */ }
}

// ---- 常用工具置顶（Supabase 云端同步） ----

export async function getPinnedTools(userId: string): Promise<string[]> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    const result = await queryWithTimeout(
      supabase.from("user_pinned_tools")
        .select("tool_id")
        .eq("user_id", userId)
        .order("pinned_at", { ascending: false })
    );
    if (result && !(result as { error: unknown }).error && (result as { data: unknown }).data) {
      return ((result as { data: Record<string, unknown>[] }).data).map(r => String(r.tool_id));
    }
  }
  // 兜底：localStorage 旧数据
  try { return JSON.parse(localStorage.getItem("wewoo-pinned-" + userId) || "[]") as string[]; } catch { return []; }
}

export async function togglePinnedTool(userId: string, toolId: string): Promise<boolean> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    // 检查是否已存在
    const { data: existing } = await supabase
      .from("user_pinned_tools")
      .select("id")
      .eq("user_id", userId)
      .eq("tool_id", toolId)
      .maybeSingle();

    if (existing) {
      // 取消置顶
      await supabase.from("user_pinned_tools").delete().eq("id", existing.id);
      return false;
    } else {
      // 添加置顶（最多 8 个）
      const { count } = await supabase.from("user_pinned_tools")
        .select("*", { count: "exact", head: true }).eq("user_id", userId);
      if ((count ?? 0) >= 8) {
        // 删除最旧的
        const { data: oldest } = await supabase.from("user_pinned_tools")
          .select("id").eq("user_id", userId).order("pinned_at", { ascending: true }).limit(1);
        if (oldest?.[0]) {
          await supabase.from("user_pinned_tools").delete().eq("id", oldest[0].id);
        }
      }
      await supabase.from("user_pinned_tools").insert({
        user_id: userId, tool_id: toolId,
        pinned_at: new Date().toISOString(),
      });
      return true;
    }
  }
  throw new Error("数据库未连接");
}

export async function isPinned(userId: string, toolId: string): Promise<boolean> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    const { data } = await supabase.from("user_pinned_tools")
      .select("id").eq("user_id", userId).eq("tool_id", toolId).maybeSingle();
    return !!data;
  }
  return false;
}

// 首页工具缓存：Supabase 慢/不可用时兜底展示最近一次成功数据
const TOOLS_CACHE_KEY = "wewoo-tools-cache";

function loadCachedTools(): Tool[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(TOOLS_CACHE_KEY);
    return raw ? (JSON.parse(raw) as Tool[]) : [];
  } catch {
    return [];
  }
}

export async function fetchTools(): Promise<Tool[]> {
  const supabase = await getSupabaseClient();
  let dbTools: Tool[] = [];
  if (supabase) {
    // 网络慢时给足时间（6s），超时/失败重试一次；仍失败则用本地缓存兜底
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = await queryWithTimeout(
        supabase.from("tools").select("*").order("created_at", { ascending: false }),
        6000
      );
      if (result && !(result as { error: unknown }).error) {
        const rows = (result as { data: Record<string, unknown>[] }).data;
        if (rows && rows.length > 0) {
          dbTools = rows.map(mapRow);
          try { localStorage.setItem(TOOLS_CACHE_KEY, JSON.stringify(dbTools)); } catch { /* full */ }
          break;
        }
      }
    }
    if (dbTools.length === 0) dbTools = loadCachedTools();
  }
  // 合并本地发布的公开工具
  const localPublic = loadLocalTools().filter((t) => t.visibility === "public");
  const merged = [...localPublic, ...dbTools, ...MOCK_TOOLS];
  // 去重
  const seen = new Set<string>();
  return merged.filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    // 默认封面
    if (!t.coverUrl) t.coverUrl = `/covers/${t.id}.png`;
    return true;
  });
}

export async function fetchToolById(id: string): Promise<Tool | null> {
  // 本地工具
  if (id.startsWith("local-")) {
    const local = loadLocalTools().find((t) => t.id === id);
    if (local) return local;
  }
  const supabase = await getSupabaseClient();
  if (supabase) {
    const result = await queryWithTimeout(
      supabase.from("tools").select("*").eq("id", id).single()
    );
    if (result && !(result as { error: unknown }).error && (result as { data: unknown }).data) {
      return mapRow((result as { data: Record<string, unknown> }).data);
    }
  }
  return ensureCover(MOCK_TOOLS.find((t) => t.id === id) ?? null);
}

/** 给工具加默认封面图 */
function ensureCover(tool: Tool | null): Tool | null {
  if (tool && !tool.coverUrl) tool.coverUrl = `/covers/${tool.id}.png`;
  return tool;
}

export async function fetchToolsByUser(userId: string): Promise<Tool[]> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    const result = await queryWithTimeout(
      supabase.from("tools").select("*").eq("author_id", userId).order("created_at", { ascending: false })
    );
    if (result && !(result as { error: unknown }).error && (result as { data: unknown }).data) {
      return ((result as { data: Record<string, unknown>[] }).data).map(mapRow);
    }
  }
  return MOCK_TOOLS.filter((t) => t.authorId === userId).map((t) => ({ ...t, coverUrl: t.coverUrl || `/covers/${t.id}.png` }));
}

/**
 * Resolve the source tool chain and attach sourceTool info to a tool.
 * Only resolves one level deep (direct parent).
 */
export async function resolveSourceTool(tool: Tool): Promise<Tool> {
  if (!tool.sourceToolId) return tool;
  const source = await fetchToolById(tool.sourceToolId);
  if (source) {
    tool.sourceTool = { id: source.id, title: source.title, author: source.author };
  }
  return tool;
}

// ---- Reviews ----

export async function fetchReviews(toolId: string): Promise<Review[]> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    const result = await queryWithTimeout(
      supabase.from("reviews").select("*").eq("tool_id", toolId).order("created_at", { ascending: false })
    );
    if (result && !(result as { error: unknown }).error && (result as { data: unknown }).data) {
      return ((result as { data: Record<string, unknown>[] }).data).map((row) => ({
        id: String(row.id),
        toolId: String(row.tool_id),
        userId: String(row.user_id),
        userName: String(row.user_name ?? ""),
        rating: Number(row.rating),
        content: String(row.content ?? ""),
        createdAt: String(row.created_at),
      }));
    }
  }
  return getMockReviews()
    .filter((r) => r.toolId === toolId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function fetchAverageRating(
  toolId: string
): Promise<{ average: number; count: number }> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    const result = await queryWithTimeout(
      supabase.from("reviews").select("rating", { count: "exact" }).eq("tool_id", toolId)
    );
    if (result && !(result as { error: unknown }).error && (result as { data: unknown }).data) {
      const data = (result as { data: { rating: number }[]; count: number }).data;
      if (data.length > 0) {
        const avg = data.reduce((s, r) => s + r.rating, 0) / data.length;
        return { average: Math.round(avg * 10) / 10, count: (result as { count: number }).count ?? data.length };
      }
    }
    return { average: 0, count: 0 };
  }
  const reviews = getMockReviews().filter((r) => r.toolId === toolId);
  if (reviews.length === 0) return { average: 0, count: 0 };
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return { average: Math.round(avg * 10) / 10, count: reviews.length };
}

export async function addReview(
  toolId: string,
  userId: string,
  userName: string,
  rating: number,
  content: string
): Promise<Review> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    const result = await queryWithTimeout(
      supabase.from("reviews").insert({
        tool_id: toolId,
        user_id: userId,
        user_name: userName,
        rating,
        content,
        created_at: new Date().toISOString(),
      }).select().single()
    );
    if (result && !(result as { error: unknown }).error && (result as { data: unknown }).data) {
      const row = (result as { data: Record<string, unknown> }).data;
      return {
        id: String(row.id),
        toolId: String(row.tool_id),
        userId: String(row.user_id),
        userName: String(row.user_name ?? ""),
        rating: Number(row.rating),
        content: String(row.content ?? ""),
        createdAt: String(row.created_at),
      };
    }
  }
  // Mock mode
  const newReview: Review = {
    id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    toolId,
    userId,
    userName,
    rating,
    content,
    createdAt: new Date().toISOString(),
  };
  setMockReviews([newReview, ...getMockReviews()]);
  return newReview;
}

// ---- Likes (替代收藏，支持工具和评论点赞) ----

export type LikeTargetType = "tool" | "review" | "save";

export interface Like {
  id: string;
  userId: string;
  targetType: LikeTargetType;
  targetId: string;
  createdAt: string;
}

/** 获取用户对指定目标的点赞状态 */
export async function fetchUserLikes(
  userId: string,
  targetType: LikeTargetType,
  targetIds: string[]
): Promise<Set<string>> {
  if (targetIds.length === 0) return new Set();
  const supabase = await getSupabaseClient();
  if (supabase) {
    const result = await queryWithTimeout(
      supabase.from("likes")
        .select("target_id")
        .eq("user_id", userId)
        .eq("target_type", targetType)
        .in("target_id", targetIds)
    );
    if (result && !(result as { error: unknown }).error && (result as { data: unknown }).data) {
      return new Set(((result as { data: Record<string, unknown>[] }).data).map(r => String(r.target_id)));
    }
  }
  return new Set();
}

/** 切换点赞状态，返回新状态 */
export async function toggleLike(
  userId: string,
  targetType: LikeTargetType,
  targetId: string,
  currentlyLiked: boolean
): Promise<boolean> {
  const supabase = await getSupabaseClient();
  if (!supabase) throw new Error("数据库未连接");

  if (currentlyLiked) {
    const result = await queryWithTimeout(
      supabase.from("likes").delete()
        .eq("user_id", userId)
        .eq("target_type", targetType)
        .eq("target_id", targetId)
    );
    if (result && !(result as { error: unknown }).error) return false;
  } else {
    const result = await queryWithTimeout(
      supabase.from("likes").insert({
        user_id: userId,
        target_type: targetType,
        target_id: targetId,
        created_at: new Date().toISOString(),
      })
    );
    if (result && !(result as { error: unknown }).error) return true;
  }
  throw new Error("操作失败，请稍后重试");
}

/** 获取指定工具的点赞数 */
export async function fetchLikeCount(
  targetType: LikeTargetType,
  targetId: string
): Promise<number> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    const result = await queryWithTimeout(
      supabase.from("likes").select("*", { count: "exact", head: true })
        .eq("target_type", targetType)
        .eq("target_id", targetId)
    );
    if (result && !(result as { error: unknown }).error && (result as { count: number }).count !== null) {
      return (result as { count: number }).count;
    }
  }
  return 0;
}

/** 获取用户点赞过的工具列表（含 MOCK_TOOLS） */
export async function fetchUserLikedTools(userId: string, targetType: LikeTargetType = "tool"): Promise<Tool[]> {
  const supabase = await getSupabaseClient();
  const result: Tool[] = [];
  
  if (supabase) {
    const { data: likeRows, error } = await supabase
      .from("likes")
      .select("target_id")
      .eq("user_id", userId)
      .eq("target_type", targetType)
      .order("created_at", { ascending: false });

    if (!error && likeRows && likeRows.length > 0) {
      const toolIds = likeRows.map((r: Record<string, unknown>) => String(r.target_id));
      // 先查 Supabase
      const { data: dbTools } = await supabase
        .from("tools")
        .select("*")
        .in("id", toolIds);
      if (dbTools) result.push(...dbTools.map(mapRow));
      
      // 再查 MOCK_TOOLS 兜底
      for (const tid of toolIds) {
        if (!result.find(t => t.id === tid)) {
          const mock = MOCK_TOOLS.find(t => t.id === tid);
          if (mock) result.push({ ...mock, coverUrl: mock.coverUrl || `/covers/${mock.id}.png` });
        }
      }
      
      // 按点赞顺序排序
      const idOrder = new Map<string, number>(toolIds.map((id: string, i: number) => [id, i]));
      result.sort((a, b) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99));
    }
  }
  return result;
}

// ---- View counts ----

const MOCK_VIEW_COUNTS: Record<string, number> = {
  "1": 1280, "2": 642, "3": 893, "4": 457, "5": 1024,
  "6": 312, "7": 578, "8": 836, "9": 445, "10": 299,
  "11": 671, "12": 523, "13": 188, "14": 412, "15": 2048, "16": 756,
};

const VIEW_COUNT_KEY = "wewoo-mock-view-counts";

function getMockViewCounts(): Record<string, number> {
  if (typeof window === "undefined") return MOCK_VIEW_COUNTS;
  try {
    const stored = localStorage.getItem(VIEW_COUNT_KEY);
    if (stored) return { ...MOCK_VIEW_COUNTS, ...JSON.parse(stored) };
  } catch {}
  return MOCK_VIEW_COUNTS;
}

function setMockViewCounts(counts: Record<string, number>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VIEW_COUNT_KEY, JSON.stringify(counts));
  } catch {}
}

export async function fetchViewCounts(toolIds: string[]): Promise<Record<string, number>> {
  if (toolIds.length === 0) return {};
  const supabase = await getSupabaseClient();
  if (supabase) {
    // 分批查询避免 URL 过长 + 空数组导致 PostgREST 400
    const counts: Record<string, number> = {};
    const chunks = chunkArray(toolIds, 100);
    for (const chunk of chunks) {
      const result = await queryWithTimeout(
        supabase.from("tools").select("id, view_count").in("id", chunk)
      );
      if (result && !(result as { error: unknown }).error && (result as { data: unknown }).data) {
        const data = (result as { data: { id: string; view_count: number | null }[] }).data;
        for (const row of data) {
          counts[row.id] = row.view_count ?? 0;
        }
      }
    }
    if (Object.keys(counts).length > 0) return counts;
  }
  const mockCounts = getMockViewCounts();
  const result2: Record<string, number> = {};
  for (const id of toolIds) {
    result2[id] = mockCounts[id] ?? 0;
  }
  return result2;
}

export async function incrementToolView(toolId: string): Promise<void> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    // 仅 UUID 格式的工具 ID 才调用 RPC（mock/local 工具的 ID 不是 UUID）
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(toolId);
    if (isUUID) {
      try {
        await supabase.rpc("increment_view_count", { tool_id: toolId });
      } catch {
        // RPC might not exist yet; silently fall back to mock
      }
    }
  }
  // Always update mock counts for offline/preview
  if (typeof window !== "undefined") {
    const counts = getMockViewCounts();
    counts[toolId] = (counts[toolId] ?? 0) + 1;
    setMockViewCounts(counts);
  }
}

// ---- 最近使用 ----

export async function fetchRecentTools(userId: string, limit = 6): Promise<Tool[]> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    const { data: recentRows, error } = await supabase
      .from("tool_recent")
      .select("tool_id")
      .eq("user_id", userId)
      .order("opened_at", { ascending: false })
      .limit(limit);

    if (!error && recentRows && recentRows.length > 0) {
      const toolIds = recentRows.map((r: Record<string, unknown>) => String(r.tool_id));
      const chunks = chunkArray(toolIds, 100);
      const allTools: Tool[] = [];
      for (const chunk of chunks) {
        const result = await queryWithTimeout(
          supabase.from("tools").select("*").in("id", chunk)
        );
        if (result && !(result as { error: unknown }).error && (result as { data: unknown }).data) {
          allTools.push(...((result as { data: Record<string, unknown>[] }).data).map(mapRow));
        }
      }
      // 按最近打开时间排序
      const idOrder = new Map<string, number>(toolIds.map((id: string, i: number) => [id, i]));
      return allTools.sort((a, b) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99));
    }
  }
  return [];
}
