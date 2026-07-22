// ---- Types ----

export type ToolCategory = "旅行" | "工程计算" | "生活" | "教育";

export interface Tool {
  id: string;
  title: string;
  author: string;
  authorId?: string;
  category: ToolCategory;
  code: string;
  thumbnailGradient: string;
  createdAt: string;
  description?: string;
  sourceToolId?: string;
  sourceTool?: { id: string; title: string; author: string };
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
];

// ---- Mock data ----

const MOCK_TOOLS: Tool[] = [
  {
    id: "1",
    title: "旅行分账计算器",
    author: "旅行达人小明",
    authorId: "user-001",
    category: "旅行",
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
  },
];

// Pre-seeded favorites for mock mode
const MOCK_FAVORITES: Favorite[] = [
  { toolId: "1", userId: "mock-user-1", createdAt: "2026-07-21T08:00:00Z" },
  { toolId: "3", userId: "mock-user-1", createdAt: "2026-07-21T09:00:00Z" },
  { toolId: "5", userId: "mock-user-1", createdAt: "2026-07-21T10:00:00Z" },
  { toolId: "2", userId: "mock-user-2", createdAt: "2026-07-20T12:00:00Z" },
  { toolId: "1", userId: "mock-user-2", createdAt: "2026-07-20T13:00:00Z" },
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

// In-memory mutable copy for mock mode (so toggles persist during session)
let mockFavorites = structuredClone(MOCK_FAVORITES);
let mockReviews = structuredClone(MOCK_REVIEWS);

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
    createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString()),
    description: row.description ? String(row.description) : undefined,
    sourceToolId: row.source_tool_id ? String(row.source_tool_id) : undefined,
  };
}

// ---- Helper: get Supabase client when configured ----

async function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    return createClient(supabaseUrl, supabaseKey);
  } catch {
    return null;
  }
}

// ---- Tool data fetching ----

export async function fetchTools(): Promise<Tool[]> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data.map(mapRow);
      }
    } catch {
      // fall through
    }
  }
  await new Promise((r) => setTimeout(r, 400));
  return MOCK_TOOLS;
}

export async function fetchToolById(id: string): Promise<Tool | null> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) {
        return mapRow(data);
      }
    } catch {
      // fall through
    }
  }
  await new Promise((r) => setTimeout(r, 200));
  return MOCK_TOOLS.find((t) => t.id === id) ?? null;
}

export async function fetchToolsByUser(userId: string): Promise<Tool[]> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("author_id", userId)
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data.map(mapRow);
      }
    } catch {
      // fall through
    }
  }
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_TOOLS.filter((t) => t.authorId === userId);
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

// ---- Favorites ----

export async function fetchFavoritedToolIds(userId: string): Promise<string[]> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("tool_id")
        .eq("user_id", userId);
      if (!error && data) {
        return data.map((row: Record<string, unknown>) => String(row.tool_id));
      }
    } catch {
      // fall through
    }
  }
  return mockFavorites
    .filter((f) => f.userId === userId)
    .map((f) => f.toolId);
}

export async function toggleFavorite(
  userId: string,
  toolId: string,
  currentlyFavorited: boolean
): Promise<boolean> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    try {
      if (currentlyFavorited) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("tool_id", toolId);
        if (!error) return false;
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({
            user_id: userId,
            tool_id: toolId,
            created_at: new Date().toISOString(),
          });
        if (!error) return true;
      }
    } catch {
      // fall through
    }
  }

  // Mock mode
  if (currentlyFavorited) {
    mockFavorites = mockFavorites.filter(
      (f) => !(f.userId === userId && f.toolId === toolId)
    );
    return false;
  } else {
    mockFavorites.push({
      toolId,
      userId,
      createdAt: new Date().toISOString(),
    });
    return true;
  }
}

export async function fetchFavoriteCount(toolId: string): Promise<number> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    try {
      const { count, error } = await supabase
        .from("favorites")
        .select("*", { count: "exact", head: true })
        .eq("tool_id", toolId);
      if (!error && count !== null) return count;
    } catch {
      // fall through
    }
  }
  return mockFavorites.filter((f) => f.toolId === toolId).length;
}

/** Batch: get favorite counts for multiple tool IDs */
export async function fetchFavoriteCounts(
  toolIds: string[]
): Promise<Record<string, number>> {
  const supabase = await getSupabaseClient();
  const counts: Record<string, number> = {};
  if (supabase) {
    try {
      // Supabase doesn't support GROUP BY in client SDK cleanly;
      // fetch all rows and count in JS for mock-like simplicity
      const { data, error } = await supabase
        .from("favorites")
        .select("tool_id")
        .in("tool_id", toolIds);
      if (!error && data) {
        for (const row of data as { tool_id: string }[]) {
          counts[row.tool_id] = (counts[row.tool_id] || 0) + 1;
        }
        return counts;
      }
    } catch {
      // fall through
    }
  }
  for (const tid of toolIds) {
    counts[tid] = mockFavorites.filter((f) => f.toolId === tid).length;
  }
  return counts;
}

export async function fetchFavoritedToolsByUser(
  userId: string
): Promise<Tool[]> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    try {
      // Get favorited tool_ids
      const { data: favRows, error: favError } = await supabase
        .from("favorites")
        .select("tool_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!favError && favRows && favRows.length > 0) {
        const toolIds = favRows.map((r: Record<string, unknown>) => String(r.tool_id));
        const { data: tools, error: toolsError } = await supabase
          .from("tools")
          .select("*")
          .in("id", toolIds);
        if (!toolsError && tools) {
          const toolMap = new Map(
            (tools as Record<string, unknown>[]).map((row) => [String(row.id), mapRow(row)])
          );
          // Preserve favorite order
          return toolIds
            .map((id) => toolMap.get(id))
            .filter(Boolean) as Tool[];
        }
      }
      return [];
    } catch {
      // fall through
    }
  }

  // Mock mode
  const favoritedToolIds = mockFavorites
    .filter((f) => f.userId === userId)
    .map((f) => f.toolId);
  return MOCK_TOOLS.filter((t) => favoritedToolIds.includes(t.id));
}

// ---- Reviews ----

export async function fetchReviews(toolId: string): Promise<Review[]> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("tool_id", toolId)
        .order("created_at", { ascending: false });
      if (!error && data) {
        return (data as Record<string, unknown>[]).map((row) => ({
          id: String(row.id),
          toolId: String(row.tool_id),
          userId: String(row.user_id),
          userName: String(row.user_name ?? ""),
          rating: Number(row.rating),
          content: String(row.content ?? ""),
          createdAt: String(row.created_at),
        }));
      }
    } catch {
      // fall through
    }
  }
  return mockReviews
    .filter((r) => r.toolId === toolId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function fetchAverageRating(
  toolId: string
): Promise<{ average: number; count: number }> {
  const supabase = await getSupabaseClient();
  if (supabase) {
    try {
      const { data, error, count } = await supabase
        .from("reviews")
        .select("rating", { count: "exact" })
        .eq("tool_id", toolId);
      if (!error && data && data.length > 0) {
        const avg =
          (data as { rating: number }[]).reduce((s, r) => s + r.rating, 0) /
          data.length;
        return { average: Math.round(avg * 10) / 10, count: count ?? data.length };
      }
      return { average: 0, count: 0 };
    } catch {
      // fall through
    }
  }
  const reviews = mockReviews.filter((r) => r.toolId === toolId);
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
    try {
      const { data, error } = await supabase
        .from("reviews")
        .insert({
          tool_id: toolId,
          user_id: userId,
          user_name: userName,
          rating,
          content,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (!error && data) {
        const row = data as Record<string, unknown>;
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
    } catch {
      // fall through
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
  mockReviews.unshift(newReview);
  return newReview;
}
