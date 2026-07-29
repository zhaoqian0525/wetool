/**
 * 播种脚本：向 Supabase 写入初始工具数据
 * 用法：node scripts/seed-tools.mjs
 */
import { createClient } from "@supabase/supabase-js";

// 播种需要 service_role key（绕过 RLS），用法：
// 1. 在 Supabase Dashboard → Settings → API 获取 service_role key
// 2. 替换下面的 key
// 3. 运行：node scripts/seed-tools.mjs
const supabase = createClient(
  "https://cvacrykzcppiflmvwwfe.supabase.co",
  "YOUR_SERVICE_ROLE_KEY"
);

const tools = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    title: "旅行分账计算器",
    author: "旅行达人小明",
    author_id: "system",
    category: "旅行",
    visibility: "public",
    description: "和朋友一起旅行，快速算出每人该付多少钱",
    thumbnail_gradient: "linear-gradient(135deg, #667eea, #764ba2)",
    code: `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#f5f3ff;padding:16px;color:#333}h2{text-align:center;color:#5b21b6;font-size:18px;margin-bottom:12px}.card{background:#fff;border-radius:12px;padding:14px;margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,.05)}.row{display:flex;gap:8px;align-items:center;margin-bottom:8px}.row label{font-size:13px;color:#666}.row input{flex:1;padding:8px;border:1px solid #ddd;border-radius:8px;font-size:14px}.btn{width:100%;padding:10px;background:#7c3aed;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;margin-top:8px}.result{text-align:center;font-size:28px;font-weight:bold;color:#7c3aed;margin-top:16px}</style></head><body><h2>💰 旅行分账计算器</h2><div class="card"><div class="row"><label>总花费 ¥</label><input id="amount" type="number" value="500"></div><div class="row"><label>人数</label><input id="people" type="number" value="4"></div><button class="btn" onclick="calc()">计算每人应付</button><div class="result" id="result"></div></div><script>function calc(){var a=parseFloat(document.getElementById('amount').value)||0;var p=parseInt(document.getElementById('people').value)||1;var per=Math.ceil(a/p);document.getElementById('result').textContent='¥ '+per}</script></body></html>`,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    title: "螺栓强度校核",
    author: "老王机械师",
    author_id: "system",
    category: "工程计算",
    visibility: "public",
    description: "输入螺栓参数，一键计算抗拉与剪切强度",
    thumbnail_gradient: "linear-gradient(135deg, #f093fb, #f5576c)",
    code: `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#fff5f5;padding:16px;color:#333}h2{text-align:center;color:#c2410c;font-size:18px;margin-bottom:12px}.card{background:#fff;border-radius:12px;padding:14px;margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,.05)}.row{display:flex;gap:8px;align-items:center;margin-bottom:8px}.row label{font-size:13px;color:#666;flex-shrink:0}.row input,.row select{flex:1;padding:8px;border:1px solid #ddd;border-radius:8px;font-size:14px}.btn{width:100%;padding:10px;background:#ea580c;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;margin-top:8px}.result{background:#ffedd5;border-radius:12px;padding:16px;margin-top:12px;text-align:center;font-size:18px;font-weight:bold;color:#c2410c}</style></head><body><h2>🔩 螺栓强度校核</h2><div class="card"><div class="row"><label>公称直径 d(mm)</label><input id="d" type="number" value="16"></div><div class="row"><label>性能等级</label><select id="grade"><option value="4.8">4.8</option><option value="8.8" selected>8.8</option><option value="10.9">10.9</option></select></div><div class="row"><label>安全系数</label><input id="safety" type="number" value="1.5" step="0.1"></div><button class="btn" onclick="calculate()">计算强度</button><div class="result" id="result" style="display:none"></div></div><script>function calculate(){var d=parseFloat(document.getElementById('d').value)||16;var g=document.getElementById('grade').value;var n=parseFloat(document.getElementById('safety').value)||1.5;var gb=parseInt(g.split('.')[0])*100;var gs=parseInt(g.split('.')[0])*10*parseInt(g.split('.')[1]);var at=gs/n;document.getElementById('result').style.display='block';document.getElementById('result').textContent='许用应力: '+at.toFixed(1)+' MPa | 抗拉: '+gb+' MPa'}</script></body></html>`,
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    title: "科学计算器",
    author: "数学老师老王",
    author_id: "system",
    category: "教育",
    visibility: "public",
    description: "在线科学计算器，支持加减乘除",
    thumbnail_gradient: "linear-gradient(135deg, #4facfe, #00f2fe)",
    code: `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#f0f9ff;padding:16px;display:flex;justify-content:center;align-items:center;min-height:100vh}.calc{background:#1e293b;border-radius:16px;padding:16px;width:100%;max-width:320px}.display{background:#0f172a;color:#e2e8f0;border-radius:8px;padding:16px;text-align:right;font-size:28px;margin-bottom:12px;min-height:64px;word-break:break-all}.btns{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.btns button{padding:16px 8px;border:none;border-radius:8px;font-size:18px;cursor:pointer;background:#334155;color:#e2e8f0}.btns button.op{background:#f59e0b;color:#fff}.btns button.eq{background:#3b82f6;color:#fff}.btns button.clr{background:#ef4444;color:#fff}</style></head><body><div class="calc"><div class="display" id="display">0</div><div class="btns" id="btns"></div></div><script>var expr='';var btns=[['C','clr'],['(','op'],[')','op'],['÷','op'],['7',''],['8',''],['9',''],['×','op'],['4',''],['5',''],['6',''],['-','op'],['1',''],['2',''],['3',''],['+','op'],['0',''],['.',''],['⌫','clr'],['=','eq']];btns.forEach(function(b){var btn=document.createElement('button');btn.textContent=b[0];if(b[1])btn.className=b[1];btn.onclick=function(){handle(b[0])};document.getElementById('btns').appendChild(btn)});function handle(k){if(k==='C'){expr=''}else if(k==='⌫'){expr=expr.slice(0,-1)}else if(k==='='){try{expr=String(eval(expr.replace(/×/g,'*').replace(/÷/g,'/')))}catch(e){expr='Error'}}else{expr+=k}document.getElementById('display').textContent=expr||'0'}</script></body></html>`,
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    title: "番茄钟计时器",
    author: "效率达人小明",
    author_id: "system",
    category: "生活",
    visibility: "public",
    description: "番茄工作法计时器，帮你专注25分钟",
    thumbnail_gradient: "linear-gradient(135deg, #fa8231, #f7b731)",
    code: `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#fefce8;display:flex;justify-content:center;align-items:center;min-height:100vh;padding:16px}.card{background:#fff;border-radius:24px;padding:32px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.08);max-width:320px;width:100%}.timer{font-size:64px;font-weight:bold;color:#ca8a04;margin:24px 0;font-variant-numeric:tabular-nums}.btn{width:100%;padding:14px;border:none;border-radius:12px;font-size:16px;cursor:pointer;margin-bottom:8px;font-weight:600}.btn-start{background:#eab308;color:#fff}.btn-reset{background:#f1f5f9;color:#64748b}.status{font-size:14px;color:#94a3b8;margin-bottom:16px}</style></head><body><div class="card"><h2>🍅 番茄钟</h2><p class="status" id="status">准备开始</p><div class="timer" id="timer">25:00</div><button class="btn btn-start" id="startBtn" onclick="toggle()">开始</button><button class="btn btn-reset" onclick="reset()">重置</button></div><script>var timeLeft=25*60;var timer=null;var running=false;function toggle(){if(running){clearInterval(timer);running=false;document.getElementById('startBtn').textContent='继续';document.getElementById('status').textContent='已暂停'}else{running=true;document.getElementById('startBtn').textContent='暂停';document.getElementById('status').textContent='专注中...';timer=setInterval(tick,1000)}}function tick(){timeLeft--;var m=Math.floor(timeLeft/60);var s=timeLeft%60;document.getElementById('timer').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');if(timeLeft<=0){clearInterval(timer);running=false;document.getElementById('startBtn').textContent='开始';document.getElementById('status').textContent='完成!'}}function reset(){clearInterval(timer);running=false;timeLeft=25*60;document.getElementById('timer').textContent='25:00';document.getElementById('startBtn').textContent='开始';document.getElementById('status').textContent='准备开始'}</script></body></html>`,
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    title: "BMI 计算器",
    author: "健康达人小李",
    author_id: "system",
    category: "生活",
    visibility: "public",
    description: "输入身高体重，快速计算 BMI 指数",
    thumbnail_gradient: "linear-gradient(135deg, #43e97b, #38f9d7)",
    code: `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:linear-gradient(135deg,#d4fc79,#96e6a1);min-height:100vh;display:flex;justify-content:center;align-items:center;padding:16px}.card{background:#fff;border-radius:24px;padding:32px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,.12);max-width:340px;width:100%}h2{font-size:22px;color:#166534;margin-bottom:20px}.input-group{margin-bottom:14px;text-align:left}.input-group label{display:block;font-size:13px;color:#64748b;margin-bottom:4px}.input-group input{width:100%;padding:12px;border:2px solid #e2e8f0;border-radius:12px;font-size:16px;outline:none;transition:border-color .2s}.input-group input:focus{border-color:#22c55e}.btn{width:100%;padding:14px;background:#22c55e;color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:600;cursor:pointer;margin-top:8px}.result{margin-top:20px;padding:16px;background:#f0fdf4;border-radius:12px;font-size:18px;font-weight:bold;color:#166534}</style></head><body><div class="card"><h2>🏋️ BMI 计算器</h2><div class="input-group"><label>身高 (cm)</label><input id="height" type="number" value="170" min="50" max="250"></div><div class="input-group"><label>体重 (kg)</label><input id="weight" type="number" value="65" min="20" max="300"></div><button class="btn" onclick="calcBMI()">计算 BMI</button><div class="result" id="result" style="display:none"></div></div><script>function calcBMI(){var h=parseFloat(document.getElementById('height').value)/100;var w=parseFloat(document.getElementById('weight').value);if(!h||!w||h<=0||w<=0)return;var bmi=w/(h*h);var r=document.getElementById('result');r.style.display='block';r.textContent='BMI: '+bmi.toFixed(1)+' — '+(bmi<18.5?'偏瘦':bmi<24?'正常':bmi<28?'偏胖':'肥胖')}</script></body></html>`,
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    title: "单词卡片",
    author: "英语老师 Linda",
    author_id: "system",
    category: "教育",
    visibility: "public",
    description: "翻转卡片背单词，中英文对照记忆",
    thumbnail_gradient: "linear-gradient(135deg, #a18cd1, #fbc2eb)",
    code: `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#faf5ff;min-height:100vh;display:flex;justify-content:center;align-items:center;padding:16px}.card{background:#fff;border-radius:24px;padding:24px;text-align:center;box-shadow:0 4px 24px rgba(139,92,246,.12);max-width:340px;width:100%}.word-card{background:linear-gradient(135deg,#8b5cf6,#a855f7);border-radius:16px;padding:32px 24px;margin:24px 0;cursor:pointer;min-height:140px;display:flex;flex-direction:column;justify-content:center;transition:transform .3s}.word-card.flipped{transform:rotateY(90deg)}.word-card h3{color:#fff;font-size:28px;margin-bottom:8px}.word-card p{color:rgba(255,255,255,.8);font-size:16px}.btn{min-width:100px;padding:12px 24px;border:none;border-radius:12px;font-size:14px;cursor:pointer;font-weight:600;margin:4px}.btn-next{background:#8b5cf6;color:#fff}.btn-flip{background:#f3e8ff;color:#7c3aed}</style></head><body><div class="card"><h2>📖 单词卡片</h2><div class="word-card" id="card" onclick="flip()"><h3 id="word">Hello</h3><p id="meaning">你好</p></div><button class="btn btn-flip" onclick="flip()">🔄 翻转</button><button class="btn btn-next" onclick="next()">▶ 下一个</button></div><script>var words=[{en:'Hello',zh:'你好'},{en:'World',zh:'世界'},{en:'Apple',zh:'苹果'},{en:'Book',zh:'书'},{en:'School',zh:'学校'},{en:'Happy',zh:'快乐的'},{en:'Friend',zh:'朋友'},{en:'Music',zh:'音乐'}];var idx=0;var flipped=false;function flip(){flipped=!flipped;var d=document.getElementById('word');var m=document.getElementById('meaning');if(flipped){d.textContent=words[idx].zh;m.textContent=words[idx].en}else{d.textContent=words[idx].en;m.textContent=words[idx].zh}}function next(){idx=(idx+1)%words.length;flipped=false;document.getElementById('word').textContent=words[idx].en;document.getElementById('meaning').textContent=words[idx].zh}</script></body></html>`,
  },
  {
    id: "00000000-0000-0000-0000-000000000007",
    title: "倒计时器",
    author: "活动策划小张",
    author_id: "system",
    category: "生活",
    visibility: "public",
    description: "设置目标日期，实时显示剩余天数",
    thumbnail_gradient: "linear-gradient(135deg, #ffecd2, #fcb69f)",
    code: `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:linear-gradient(135deg,#ffecd2,#fcb69f);min-height:100vh;display:flex;justify-content:center;align-items:center;padding:16px}.card{background:#fff;border-radius:24px;padding:32px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,.1);max-width:360px;width:100%}.countdown{font-size:56px;font-weight:bold;color:#ea580c;margin:20px 0}.unit{font-size:14px;color:#94a3b8;margin-top:-10px}.input-group{margin-bottom:12px}.input-group input{width:100%;padding:12px;border:2px solid #e2e8f0;border-radius:12px;font-size:16px;text-align:center;outline:none}.input-group input:focus{border-color:#ea580c}</style></head><body><div class="card"><h2>⏰ 倒计时器</h2><p style="color:#94a3b8;font-size:13px;margin-bottom:12px">输入目标日期</p><div class="input-group"><input type="date" id="dateInput"></div><div class="countdown" id="countdown">—</div><div class="unit">天</div><p style="margin-top:16px;color:#64748b;font-size:14px" id="targetLabel"></p></div><script>var input=document.getElementById('dateInput');input.valueAsDate=new Date();input.addEventListener('change',update);function update(){var target=new Date(input.value);if(isNaN(target.getTime()))return;var now=new Date();now.setHours(0,0,0,0);target.setHours(0,0,0,0);var days=Math.ceil((target-now)/86400000);document.getElementById('countdown').textContent=Math.abs(days);document.getElementById('targetLabel').textContent=days>=0?'距离 '+input.value:'自 '+input.value+' 已过去';}update()</script></body></html>`,
  },
  {
    id: "00000000-0000-0000-0000-000000000008",
    title: "八杯水提醒",
    author: "养生达人小王",
    author_id: "system",
    category: "生活",
    visibility: "public",
    description: "每天喝够八杯水，可视化追踪饮水进度",
    thumbnail_gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)",
    code: `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:linear-gradient(135deg,#dbeafe,#bae6fd);min-height:100vh;display:flex;justify-content:center;align-items:center;padding:16px}.card{background:#fff;border-radius:24px;padding:24px;text-align:center;box-shadow:0 4px 24px rgba(59,130,246,.12);max-width:340px;width:100%}h2{font-size:20px;color:#1e40af;margin-bottom:4px}.sub{font-size:13px;color:#94a3b8;margin-bottom:20px}.cups{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:20px 0}.cup{width:44px;height:44px;border-radius:12px;border:2px solid #3b82f6;display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer;transition:all .2s;background:#fff}.cup.filled{background:#3b82f6;color:#fff;transform:scale(1.05)}.progress{background:#f0f9ff;border-radius:12px;padding:12px;margin-top:16px;font-size:15px;color:#1e40af;font-weight:600}.reset-btn{margin-top:16px;padding:8px 24px;background:#fee2e2;color:#dc2626;border:none;border-radius:10px;font-size:13px;cursor:pointer}</style></head><body><div class="card"><h2>💧 八杯水提醒</h2><p class="sub">点击杯子记录饮水</p><div class="cups" id="cups"></div><div class="progress" id="progress">0/8 杯</div><button class="reset-btn" onclick="reset()">重置</button></div><script>var filled=0;var cups=document.getElementById('cups');for(var i=0;i<8;i++){(function(n){var c=document.createElement('div');c.className='cup';c.textContent='💧';c.onclick=function(){if(!c.classList.contains('filled')){c.classList.add('filled');filled++;update()}else{c.classList.remove('filled');filled--;update()}};cups.appendChild(c)})(i)}function update(){document.getElementById('progress').textContent=filled+'/8 杯'+(filled>=8?' 🎉':'')}function reset(){filled=0;document.querySelectorAll('.cup').forEach(function(c){c.classList.remove('filled')});update()}</script></body></html>`,
  },
];

async function seed() {
  console.log("Seeding", tools.length, "tools...");

  for (const tool of tools) {
    // Delete existing tool with same ID first (idempotent)
    await supabase.from("tools").delete().eq("id", tool.id);

    const { error } = await supabase.from("tools").insert({
      ...tool,
      created_at: new Date("2026-07-20").toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to insert", tool.title, ":", error.message);
    } else {
      console.log("✓", tool.title);
    }
  }

  // Verify
  const { count } = await supabase
    .from("tools")
    .select("*", { count: "exact", head: true });
  console.log("\nTotal tools in DB:", count);
}

seed();
