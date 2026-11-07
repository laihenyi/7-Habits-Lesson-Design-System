/* 學生學習單：把教案轉成單張 A4（210×297mm，以 794×1123px 排版），
   內容：定義填空、三題判斷、我的事件、工具圖（空白）、if-then、回顧。
   同一份 HTML 同時用於頁面預覽（縮放）與下載列印；載入後若超出一頁會自動改用較緊湊的版面。 */
var WS = (function () {
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function S(x, n) { x = String(x == null ? '' : x).trim(); return n && x.length > n ? x.slice(0, n) : x; }
  function A(a, max, n) { return (Array.isArray(a) ? a : []).map(function (x) { return S(x, n); }).filter(Boolean).slice(0, max); }
  function blanks(n) { n = Math.max(3, Math.min(10, n || 4)); var s = ''; while (s.length < n) s += '＿'; return s; }

  // 從教案直接組出學習單（不用 AI）
  function fromPlan(plan, ctx) {
    var def = S(plan.def), m = def.match(/「([^」]{2,})」/), inner = m ? m[1] : '';
    var defText = inner ? def.replace('「' + inner + '」', '「' + blanks(inner.length) + '」') : def;
    var ifm = S(plan.ifthen).match(/^「?(當|下次|如果)(.*?)，\s*(我會|我要)(.*?)。?」?$/);
    var scaffold = ifm ? ifm[1] + blanks(Math.max(4, ifm[2].length)) + '，' + ifm[3] + blanks(Math.max(4, ifm[4].length)) + '。' : '當＿＿＿＿＿＿，我會＿＿＿＿＿＿。';
    var intro = ctx.band === 0 ? '想一想，再寫下來。不會寫的字可以畫圖或注音。' : ctx.band === 1 ? '這張學習單沒有標準答案，寫你真實的想法。' : '不用寫得漂亮，寫真的。';
    var hints = ctx.band === 0 ? ['發生了什麼事', '我做了什麼'] : ['時間、地點', '對方做了什麼', '我當下做了什麼'];
    return {
      title: S(plan.title) || (ctx.habitName + '學習單'),
      intro: intro,
      defBlank: { text: defText, answer: inner },
      judgments: (plan.judgments || []).map(function (j) { return S(j.q); }).filter(Boolean).slice(0, 3),
      eventPrompt: S(plan.out) || '寫一件你自己遇到的事。',
      eventHints: hints,
      ifthen: scaffold,
      ifthenExample: S(plan.ifthen),
      reflect: S(plan.revisit),
      toolHint: S(plan.toolDesc),
      mode: 'plain'
    };
  }

  // 清理 AI 回傳的學習單 JSON；缺的欄位用教案補
  function clean(o, plan, ctx) {
    var base = fromPlan(plan, ctx); o = o || {};
    var db = o.defBlank || {};
    var r = {
      title: S(o.title, 20) || base.title,
      intro: S(o.intro, 40) || base.intro,
      defBlank: { text: S(db.text, 80) || base.defBlank.text, answer: S(db.answer, 20) || base.defBlank.answer },
      judgments: A(o.judgments && o.judgments.map ? o.judgments.map(function (j) { return j && typeof j === 'object' ? j.q : j; }) : [], 3, 50),
      eventPrompt: S(o.eventPrompt, 60) || base.eventPrompt,
      eventHints: A(o.eventHints, 3, 12),
      ifthen: S(o.ifthen, 50) || base.ifthen,
      ifthenExample: base.ifthenExample,
      reflect: S(o.reflect, 40) || base.reflect,
      toolHint: S(o.toolHint, 50) || base.toolHint,
      mode: 'ai'
    };
    if (r.judgments.length < 3) r.judgments = base.judgments;
    if (!r.eventHints.length) r.eventHints = base.eventHints;
    if (r.defBlank.text.indexOf('＿') < 0 && base.defBlank.text.indexOf('＿') >= 0) r.defBlank = base.defBlank;
    return r;
  }

  var CSS = [
    '.a4{width:794px;height:1123px;box-sizing:border-box;padding:36px 44px 32px;background:#fff;color:#17262B;font:15px/1.6 "Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif;position:relative;overflow:hidden}',
    '.a4 *{box-sizing:border-box}',
    '.a4 .in{display:flex;flex-direction:column;gap:12px;height:100%}',
    '.a4 .hd{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;border-bottom:2px solid #17262B;padding-bottom:8px}',
    '.a4 .hd h1{font:800 22px/1.3 "Noto Serif TC","Songti TC",serif;margin:0}',
    '.a4 .hd .k{font-size:12px;color:#5B6B70;letter-spacing:.06em}',
    '.a4 .id{font-size:13px;white-space:nowrap;color:#17262B}',
    '.a4 .id span{display:inline-block;border-bottom:1px solid #17262B;min-width:64px;margin:0 10px 0 4px}',
    '.a4 .intro{font-size:13px;color:#5B6B70;margin:-4px 0 0}',
    '.a4 .sec{display:flex;flex-direction:column;gap:6px}',
    '.a4 .sec h2{font:700 15px/1.4 "Noto Sans TC",sans-serif;margin:0;display:flex;gap:8px;align-items:baseline}',
    '.a4 .sec h2 i{font-style:normal;font:800 15px/1 "Noto Serif TC",serif;color:#0F5F5A;min-width:16px}',
    '.a4 .sec h2 small{font-weight:400;font-size:12px;color:#5B6B70}',
    '.a4 .def{font:600 16px/1.9 "Noto Serif TC",serif;padding:6px 12px;border:1px solid #D3DCDD;border-radius:6px}',
    '.a4 .jd{display:grid;grid-template-columns:20px minmax(0,1fr) auto;gap:4px 8px;align-items:start;padding:5px 0;border-bottom:1px dashed #D3DCDD}',
    '.a4 .jd .n{font-weight:700;color:#5B6B70}',
    '.a4 .jd .q{line-height:1.5}',
    '.a4 .jd .v{white-space:nowrap;font-size:13px;display:flex;gap:10px}',
    '.a4 .jd .v b{display:inline-flex;align-items:center;gap:3px;font-weight:500}',
    '.a4 .jd .v b:before{content:"";width:12px;height:12px;border:1.2px solid #17262B;border-radius:50%;display:inline-block}',
    '.a4 .jd .r{grid-column:2/4;font-size:12px;color:#5B6B70;display:flex;gap:6px;align-items:flex-end;padding-top:10px}',
    '.a4 .jd .r:after{content:"";flex:1;border-bottom:1px solid #9DB0B4}',
    '.a4 .lines{display:flex;flex-direction:column}',
    '.a4 .lines i{display:block;height:30px;border-bottom:1px solid #9DB0B4}',
    '.a4 .hint{font-size:12px;color:#5B6B70}',
    '.a4 .two{display:grid;grid-template-columns:1fr 1fr;gap:16px}',
    '.a4 .box{border:1px solid #D3DCDD;border-radius:6px;padding:8px 10px;min-height:120px}',
    '.a4 .tool{border:1px solid #D3DCDD;border-radius:6px;overflow:hidden;background:#F3F6F6}',
    '.a4 .tool svg{display:block;width:100%;height:auto;max-height:300px}',
    '.a4 .ift{font:600 17px/2 "Noto Serif TC",serif;padding:4px 12px;border:1px solid #D3DCDD;border-radius:6px}',
    '.a4 .ex{font-size:12px;color:#5B6B70}',
    '.a4 .ft{margin-top:auto;display:flex;justify-content:space-between;gap:12px;font-size:12px;color:#5B6B70;border-top:1px solid #D3DCDD;padding-top:6px}',
    '.a4.band0{font-size:17px}.a4.band0 .def{font-size:19px;line-height:2}.a4.band0 .lines i{height:38px}.a4.band0 .ift{font-size:19px}.a4.band0 .jd .q{font-size:16px}',
    '.a4.band2 .lines i{height:26px}',
    '.a4.c1{padding:28px 40px 24px}.a4.c1 .in{gap:8px}.a4.c1 .lines i.more{display:none}.a4.c1 .tool svg{max-height:220px}.a4.c1 .box{min-height:90px}.a4.c1 .intro{display:none}',
    '.a4.c2{font-size:13px;padding:22px 36px 20px}.a4.c2 .in{gap:6px}.a4.c2 .lines i{height:24px}.a4.c2 .tool svg{max-height:170px}.a4.c2 .def,.a4.c2 .ift{font-size:14px;line-height:1.7}.a4.c2 .hd h1{font-size:19px}.a4.c2 .jd .r{display:none}',
    '.a4.c3 .tool{display:none}.a4.c3 .toolnote{display:block}.a4 .toolnote{display:none;font-size:12px;color:#5B6B70}'
  ].join('\n');

  function svgBlank(ctx) {
    if (!ctx.toolKey || !ctx.DG) return '';
    var s = ctx.DG.render(ctx.toolKey, null, { fill: false, light: true });
    return s ? s.replace(/ width="\d+" height="\d+"/, '') : '';
  }
  function lines(n, opt) { var s = ''; for (var i = 0; i < n; i++) s += '<i' + (opt && i >= opt ? ' class="more"' : '') + '></i>'; return '<div class="lines">' + s + '</div>'; }

  function inner(ws, ctx) {
    var b = ctx.band, big = b === 0;
    var H = [];
    H.push('<div class="hd"><div><div class="k">習慣' + esc(ctx.habitNum) + '・' + esc(ctx.habitName) + '　' + esc(ctx.bandLabel) + '</div><h1>' + esc(ws.title) + '</h1></div>' +
      '<div class="id">班級<span></span>姓名<span></span>日期<span></span></div></div>');
    if (ws.intro) H.push('<p class="intro">' + esc(ws.intro) + '</p>');
    H.push('<div class="sec"><h2><i>一</i>定義<small>把空格填起來</small></h2><div class="def">' + esc(ws.defBlank.text) + '</div></div>');
    var vs = big ? '<b>是</b><b>不是</b>' : '<b>是</b><b>不是</b><b>再問一句</b>';
    H.push('<div class="sec"><h2><i>二</i>判斷<small>圈一個，' + (big ? '說說看為什麼' : '寫一句理由') + '</small></h2>' +
      ws.judgments.map(function (q, i) { return '<div class="jd"><span class="n">' + (i + 1) + '</span><span class="q">' + esc(q) + '</span><span class="v">' + vs + '</span>' + (big ? '' : '<span class="r">因為</span>') + '</div>'; }).join('') + '</div>');
    H.push('<div class="sec"><h2><i>三</i>我的事件<small>' + esc(ws.eventPrompt) + '</small></h2>' +
      (big ? '<div class="two"><div class="box"><div class="hint">畫出來</div></div><div><div class="hint">' + esc(ws.eventHints.join('・')) + '</div>' + lines(4, 3) + '</div></div>'
        : '<div class="hint">' + esc(ws.eventHints.join('・')) + '</div>' + lines(b === 2 ? 5 : 4, b === 2 ? 4 : 3)) + '</div>');
    var svg = svgBlank(ctx);
    if (svg) H.push('<div class="sec"><h2><i>四</i>' + esc(ctx.toolName) + '<small>' + esc(ws.toolHint) + '</small></h2><div class="tool">' + svg + '</div><div class="toolnote">（工具圖另附：' + esc(ctx.toolName) + '）</div></div>');
    H.push('<div class="sec"><h2><i>' + (svg ? '五' : '四') + '</i>我的 if-then<small>照這個句型寫一句你明天就能做的</small></h2><div class="ift">' + esc(ws.ifthen) + '</div>' + (ws.ifthenExample ? '<div class="ex">例：' + esc(ws.ifthenExample) + '</div>' : '') + '</div>');
    H.push('<div class="ft"><span>' + (ws.reflect ? '回顧時只問：' + esc(ws.reflect) : '') + '</span><span>七個習慣・' + esc(ctx.habitName) + '</span></div>');
    return '<div class="in">' + H.join('') + '</div>';
  }

  // 自動縮排到一頁：依序套 c1、c2、c3
  var FIT = 'function fitA4(el){el.classList.remove("c1","c2","c3");var inn=el.firstElementChild,svg=el.querySelector(".tool svg");' +
    'var cs=getComputedStyle(el),avail=function(){return el.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom)};' +
    'var over=function(){return inn.scrollHeight-avail()};' +
    'var shrink=function(min){if(!svg)return over()<=1;svg.style.maxHeight="";var o=over();if(o<=1)return true;var h=svg.getBoundingClientRect().height,t=Math.floor(h-o-2);if(t>=min){svg.style.maxHeight=t+"px";return over()<=1}svg.style.maxHeight=min+"px";return over()<=1};' +
    'if(shrink(200))return 0;el.classList.add("c1");if(shrink(150))return 1;el.classList.add("c2");if(shrink(120))return 2;el.classList.add("c3");return 3}';
  var fitA4 = null;
  try { fitA4 = new Function(FIT + ';return fitA4;')(); } catch (e) {}

  function page(ws, ctx) { return '<div class="a4 band' + ctx.band + '" id="a4">' + inner(ws, ctx) + '</div>'; }

  function doc(ws, ctx) {
    return '<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(ws.title) + '｜學習單</title>' +
      '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=Noto+Serif+TC:wght@600;800&display=swap" rel="stylesheet">' +
      '<style>@page{size:A4;margin:0}html,body{margin:0;background:#E9EEEE}body{display:flex;flex-direction:column;align-items:center;gap:12px;padding:16px}' +
      '.bar{font:14px/1.5 "Noto Sans TC",sans-serif;color:#17262B;display:flex;gap:12px;align-items:center}.bar button{font:inherit;padding:8px 16px;border-radius:8px;border:1px solid #0F5F5A;background:#0F5F5A;color:#fff;cursor:pointer}' +
      '@media print{html,body{background:#fff;padding:0;gap:0}.bar{display:none}.a4{width:210mm;height:297mm;page-break-after:avoid}}' + CSS + '</style></head><body>' +
      '<div class="bar"><button type="button" onclick="window.print()">列印／存成 PDF</button><span>A4 直式，邊界設 0，取消「頁首與頁尾」。</span></div>' +
      page(ws, ctx) +
      '<script>' + FIT + ';function go(){fitA4(document.getElementById("a4"))}go();window.addEventListener("load",go);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(go);</' + 'script></body></html>';
  }

  return { fromPlan: fromPlan, clean: clean, inner: inner, page: page, doc: doc, CSS: CSS, fit: fitA4 };
})();
