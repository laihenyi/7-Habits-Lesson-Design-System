/* 領導力工具圖：依 diagram-design 的規範繪製 14 種工具。
   規範重點：單檔內嵌 SVG、4px 格線、直角圓角連接線（r=8）、標籤遮罩留白、
   focal 強調色最多 2 處、無陰影、中文字級不低於 12px、SVG 具 title/desc 的無障礙結構。 */
var DG = (function () {
  var SANS = "'Geist','Noto Sans TC','PingFang TC','Microsoft JhengHei',sans-serif";
  var MONO = "'Geist Mono',ui-monospace,monospace";
  var LIGHT = {
    paper: '#F3F6F6', box: '#FFFFFF', ink: '#17262B', muted: '#4A5C61', soft: '#6F8186',
    rule: 'rgba(23,38,43,0.16)', accent: '#0F5F5A', tint: 'rgba(15,95,90,0.10)', fill: 'rgba(74,92,97,0.10)'
  };
  var seq = 0;

  function pal() {
    try {
      var cs = getComputedStyle(document.documentElement), o = {};
      Object.keys(LIGHT).forEach(function (k) { var v = cs.getPropertyValue('--d-' + k).trim(); o[k] = v || LIGHT[k]; });
      return o;
    } catch (e) { return LIGHT; }
  }
  function g(n) { return Math.round(n / 4) * 4; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function cw(c, fs) { var k = c.charCodeAt(0); return (k >= 0x2E80 || (k >= 0xFF00 && k <= 0xFFEF)) ? fs : fs * 0.6; }
  function tw(s, fs) { var w = 0; for (var i = 0; i < s.length; i++) w += cw(s[i], fs); return w; }
  function wrap(s, maxW, fs, maxL) {
    var lines = [], cur = '', w = 0;
    for (var i = 0; i < s.length; i++) {
      var a = cw(s[i], fs);
      if (w + a > maxW && cur) { lines.push(cur); cur = ''; w = 0; }
      cur += s[i]; w += a;
    }
    if (cur) lines.push(cur);
    if (lines.length > maxL) { lines = lines.slice(0, maxL); lines[maxL - 1] = lines[maxL - 1].slice(0, -1) + '…'; }
    return lines;
  }

  // ---- primitives -------------------------------------------------------
  function text(c, x, y, s, o) {
    o = o || {};
    c.o.push('<text x="' + x + '" y="' + y + '" fill="' + (o.fill || c.p.ink) + '" font-size="' + (o.fs || 12) +
      '" font-weight="' + (o.w || 500) + '" font-family="' + (o.mono ? MONO : SANS) + '" text-anchor="' + (o.anchor || 'start') + '">' + esc(s) + '</text>');
  }
  function slot(c, x, y, w, s, o) {
    o = o || {};
    var fs = o.fs || 12, lh = o.lh || 18, maxL = o.maxL || 2, anchor = o.anchor || 'start';
    var ax = anchor === 'middle' ? x + w / 2 : x;
    if (c.fill && s) {
      var ls = wrap(s, w, fs, maxL);
      if (o.h) y += Math.max(0, Math.floor((o.h - ls.length * lh) / 2));
      ls.forEach(function (l, i) { text(c, ax, y + fs + i * lh, l, { fs: fs, w: o.w || 400, fill: o.fill, anchor: anchor }); });
      return ls.length * lh;
    }
    if (!c.fill) {
      var n = o.blankL || Math.min(maxL, 2);
      for (var i = 0; i < n; i++) {
        var ly = y + fs + 3 + i * lh, x1 = anchor === 'middle' ? x + 4 : x, x2 = anchor === 'middle' ? x + w - 4 : x + w;
        c.o.push('<line x1="' + x1 + '" y1="' + ly + '" x2="' + x2 + '" y2="' + ly + '" stroke="' + c.p.soft + '" stroke-opacity="0.5" stroke-width="0.8"/>');
      }
      return n * lh;
    }
    return lh;
  }
  function box(c, x, y, w, h, o) {
    o = o || {};
    var k = o.kind || 'plain', rx = o.rx == null ? 6 : o.rx, p = c.p;
    var fill = k === 'focal' ? p.tint : k === 'soft' ? p.fill : p.box;
    var stroke = k === 'focal' ? p.accent : k === 'soft' ? p.muted : p.ink;
    c.o.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + rx + '" fill="' + p.paper + '"/>');
    c.o.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + rx + '" fill="' + fill + '" stroke="' + stroke +
      '" stroke-width="1"' + (k === 'dash' ? ' stroke-dasharray="4,3" stroke-opacity="0.6"' : '') + '/>');
  }
  function path(c, d, o) {
    o = o || {};
    c.o.push('<path d="' + d + '" fill="none" stroke="' + (o.accent ? c.p.accent : c.p.muted) + '" stroke-width="' + (o.accent ? 1.4 : 1) + '"' +
      (o.dash ? ' stroke-dasharray="5,4"' : '') + (o.noArrow ? '' : ' marker-end="url(#' + c.id + (o.accent ? '-aa' : '-a') + ')"') + '/>');
  }
  function line(c, x1, y1, x2, y2, o) {
    o = o || {};
    c.o.push('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (o.stroke || c.p.rule) + '" stroke-width="' + (o.sw || 0.8) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + '/>');
  }
  // 水平—垂直—水平的直角圓角連接線
  function elbowH(c, x1, y1, x2, y2, xm, o) {
    if (y1 === y2) return path(c, 'M' + x1 + ' ' + y1 + ' H' + x2, o);
    var r = Math.min(8, Math.abs(y2 - y1) / 2), v = y2 > y1 ? 1 : -1, h = x2 > x1 ? 1 : -1;
    path(c, 'M' + x1 + ' ' + y1 + ' H' + (xm - h * r) + ' Q' + xm + ' ' + y1 + ' ' + xm + ' ' + (y1 + v * r) +
      ' V' + (y2 - v * r) + ' Q' + xm + ' ' + y2 + ' ' + (xm + h * r) + ' ' + y2 + ' H' + x2, o);
  }
  // 垂直—水平—垂直（由下往上）
  function elbowV(c, x1, y1, x2, y2, ym, o) {
    if (x1 === x2) return path(c, 'M' + x1 + ' ' + y1 + ' V' + y2, o);
    var r = Math.min(8, Math.abs(x2 - x1) / 2), h = x2 > x1 ? 1 : -1, v = y2 < y1 ? -1 : 1;
    path(c, 'M' + x1 + ' ' + y1 + ' V' + (ym - v * r) + ' Q' + x1 + ' ' + ym + ' ' + (x1 + h * r) + ' ' + ym +
      ' H' + (x2 - h * r) + ' Q' + x2 + ' ' + ym + ' ' + x2 + ' ' + (ym + v * r) + ' V' + y2, o);
  }
  function title(c, name) { text(c, 36, 28, name, { fs: 14, w: 600 }); }
  function legend(c, y, items, W) {
    line(c, 36, y - 12, W - 36, y - 12);
    var x = 36;
    items.forEach(function (it) {
      if (it.k === 'focal') c.o.push('<rect x="' + x + '" y="' + (y - 8) + '" width="16" height="12" rx="2" fill="' + c.p.tint + '" stroke="' + c.p.accent + '"/>');
      else if (it.k === 'plain') c.o.push('<rect x="' + x + '" y="' + (y - 8) + '" width="16" height="12" rx="2" fill="' + c.p.box + '" stroke="' + c.p.ink + '"/>');
      else if (it.k === 'dash') c.o.push('<line x1="' + x + '" y1="' + (y - 2) + '" x2="' + (x + 16) + '" y2="' + (y - 2) + '" stroke="' + c.p.muted + '" stroke-width="1.4" stroke-dasharray="4,3"/>');
      else c.o.push('<line x1="' + x + '" y1="' + (y - 2) + '" x2="' + (x + 16) + '" y2="' + (y - 2) + '" stroke="' + (it.k === 'acc' ? c.p.accent : c.p.ink) + '" stroke-width="2"/>');
      text(c, x + 24, y + 2, it.t, { fill: c.p.muted, fs: 12 });
      x += 24 + tw(it.t, 12) + 28;
    });
  }
  function pad(arr, n) { var a = (arr || []).slice(0, n); while (a.length < n) a.push(''); return a; }
  function nice(max) {
    if (!(max > 0)) return 4;
    var exp = Math.pow(10, Math.floor(Math.log(max / 4) / Math.LN10)), f = max / 4 / exp;
    var step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * exp;
    return step * 4;
  }

  // ---- renderers --------------------------------------------------------
  var R = {};

  R.priority = function (c, d) {
    var items = c.fill ? d.items : pad([], 5).map(function () { return { t: '', p: '' }; });
    var n = items.length, y0 = 72, rh = 48, W = 720, H = y0 + n * rh + 68;
    title(c, '優先順序表');
    text(c, 36, 60, '順序', { fill: c.p.soft }); text(c, 84, 60, '等級', { fill: c.p.soft }); text(c, 140, 60, '要做的事', { fill: c.p.soft });
    var focal = 0;
    items.forEach(function (it, i) {
      var y = y0 + i * rh;
      line(c, 36, y, W - 36, y);
      text(c, 48, y + 29, String(i + 1), { mono: true, fs: 12, fill: c.p.muted, anchor: 'middle' });
      var f = c.fill && it.p === 'A' && focal < 2; if (f) focal++;
      box(c, 84, y + 10, 36, 28, { kind: f ? 'focal' : 'plain', rx: 4 });
      if (c.fill && it.p) text(c, 102, y + 29, it.p, { mono: true, w: 600, fill: f ? c.p.accent : c.p.ink, anchor: 'middle' });
      slot(c, 140, y, 520, it.t, { maxL: 1, blankL: 1, h: rh });
    });
    line(c, 36, y0 + n * rh, W - 36, y0 + n * rh);
    legend(c, H - 20, [{ k: 'focal', t: 'A 最重要、非做不可' }, { k: 'plain', t: 'B 有點重要　C 不太重要' }], W);
    return { w: W, h: H, desc: '優先順序表，把要做的事標上 A、B、C 並排出順序' };
  };

  R.lotus = function (c, d) {
    var W = 720, cw_ = 208, ch = 72, gap = 12, x0 = 36, y0 = 56, H = 332;
    title(c, '蓮花圖');
    var cells = c.fill ? d.petals : pad([], 8);
    var map = [0, 1, 2, 3, -1, 4, 5, 6, 7];
    map.forEach(function (m, i) {
      var x = x0 + (i % 3) * (cw_ + gap), y = y0 + Math.floor(i / 3) * (ch + gap), center = m < 0;
      box(c, x, y, cw_, ch, { kind: center ? 'focal' : 'plain' });
      text(c, x + 12, y + 18, center ? '主題' : '概念 ' + (m + 1), { fs: 12, fill: center ? c.p.accent : c.p.soft, w: 600 });
      slot(c, x + 12, y + 26, cw_ - 24, center ? (c.fill ? d.center : '') : cells[m], { maxL: 2, blankL: 1, fill: c.p.ink });
    });
    return { w: W, h: H, desc: '蓮花圖，中間是主題，周圍八格是相關概念' };
  };

  R.goalplan = function (c, d) {
    var W = 720, acts = c.fill ? d.actions : pad([], 4), n = acts.length;
    var gw = 320, gh = 64, gx = (W - gw) / 2, gy = 56, by = gy + gh + 32, ay = by + 32, aw = 148, ah = 88, gapx = 24;
    var total = n * aw + (n - 1) * gapx, ax0 = g((W - total) / 2), H = ay + ah + 36;
    title(c, '目標計畫表');
    var cx = gx + gw / 2, first = ax0 + aw / 2, last = ax0 + (n - 1) * (aw + gapx) + aw / 2;
    path(c, 'M' + cx + ' ' + (gy + gh) + ' V' + by, { noArrow: true });
    if (n > 1) path(c, 'M' + first + ' ' + by + ' H' + last, { noArrow: true });
    for (var i = 0; i < n; i++) path(c, 'M' + (ax0 + i * (aw + gapx) + aw / 2) + ' ' + by + ' V' + ay);
    box(c, gx, gy, gw, gh, { kind: 'focal' });
    text(c, gx + 12, gy + 18, '目標', { fill: c.p.accent, w: 600 });
    slot(c, gx + 12, gy + 26, gw - 24, c.fill ? d.goal : '', { maxL: 2, blankL: 1, w: 600 });
    acts.forEach(function (a, i) {
      var ax = ax0 + i * (aw + gapx);
      box(c, ax, ay, aw, ah, {});
      text(c, ax + 12, ay + 18, '行動 ' + (i + 1), { fill: c.p.soft, w: 600 });
      slot(c, ax + 12, ay + 26, aw - 24, a, { maxL: 3, blankL: 2 });
    });
    return { w: W, h: H, desc: '目標計畫表，上方是清楚的目標，下方是達成目標要做的行動' };
  };

  R.gantt = function (c, d) {
    var W = 720, T = c.fill ? d.total : 8, tasks = c.fill ? d.tasks : pad([], 5).map(function () { return null; });
    var x0 = 208, pitch = Math.floor(476 / T / 4) * 4, y0 = 84, rh = 44, n = tasks.length, H = y0 + n * rh + 68;
    title(c, '甘特圖');
    text(c, 36, 64, '工作事項（單位：' + (c.fill ? d.unit : '週') + '）', { fill: c.p.soft });
    for (var i = 0; i < T; i++) {
      text(c, x0 + i * pitch + pitch / 2, 64, String(i + 1), { mono: true, fill: c.p.soft, anchor: 'middle' });
      line(c, x0 + i * pitch, 72, x0 + i * pitch, y0 + n * rh);
    }
    line(c, x0 + T * pitch, 72, x0 + T * pitch, y0 + n * rh);
    line(c, 36, 76, x0 + T * pitch, 76, { stroke: c.p.soft });
    var best = -1, bl = 0;
    if (c.fill) tasks.forEach(function (t, i) { if (t.e - t.s + 1 > bl) { bl = t.e - t.s + 1; best = i; } });
    tasks.forEach(function (t, i) {
      var y = y0 + i * rh;
      line(c, 36, y + rh, x0 + T * pitch, y + rh);
      slot(c, 36, y, 160, t ? t.t : '', { maxL: 2, blankL: 1, w: 600, h: rh });
      if (t) {
        var f = i === best, bx = x0 + (t.s - 1) * pitch, bw = (t.e - t.s + 1) * pitch;
        c.o.push('<rect x="' + bx + '" y="' + (y + 10) + '" width="' + bw + '" height="24" rx="4" fill="' + (f ? c.p.tint : c.p.fill) + '" stroke="' + (f ? c.p.accent : c.p.muted) + '" stroke-width="1"/>');
      }
    });
    legend(c, H - 20, [{ k: 'focal', t: '花最久的工作' }, { k: 'plain', t: '其他工作' }], W);
    return { w: W, h: H, desc: '甘特圖，顯示每個工作事項從哪個時間開始、到哪個時間結束' };
  };

  R.stopthink = function (c, d) {
    var W = 720, cy = 176, H = 336, opts = c.fill ? d.options : ['', '', ''], ch = c.fill ? d.choice : 1;
    var sx = 36, sw = 148, sh = 120, ox = 272, ow = 176, oh = 56, rx = 536, rw = 148;
    var oy = [cy - 84, cy, cy + 84], ay = [cy - 32, cy, cy + 32];
    title(c, '停步思考圖');
    // 區域框：刺激與反應之間的空間
    c.o.push('<rect x="256" y="52" width="208" height="248" rx="8" fill="' + c.p.paper + '"/>');
    c.o.push('<rect x="256" y="52" width="208" height="248" rx="8" fill="none" stroke="' + c.p.rule.replace(/[\d.]+\)$/, '0.4)') + '" stroke-width="1" stroke-dasharray="4,3"/>');
    for (var i = 0; i < 3; i++) elbowH(c, sx + sw, ay[i], ox, oy[i], 228);
    if (c.fill) {
      if (oy[ch] === cy) path(c, 'M' + (ox + ow) + ' ' + cy + ' H' + rx);
      else elbowH(c, ox + ow, oy[ch], rx, cy, 492);
    } else {
      for (var j = 0; j < 3; j++) elbowH(c, ox + ow, oy[j], rx, ay[j], 492, { dash: true });
    }
    box(c, sx, cy - sh / 2, sw, sh, {});
    text(c, sx + 12, cy - sh / 2 + 20, '刺激', { fill: c.p.soft, w: 600 });
    slot(c, sx + 12, cy - sh / 2 + 28, sw - 24, c.fill ? d.stimulus : '', { maxL: 4, blankL: 3 });
    opts.forEach(function (o, i) {
      var f = c.fill && i === ch;
      box(c, ox, oy[i] - oh / 2, ow, oh, { kind: f ? 'focal' : 'plain' });
      slot(c, ox + 8, oy[i] - oh / 2, ow - 16, o, { maxL: 2, blankL: 2, h: oh, w: f ? 600 : 400 });
    });
    // 區域標籤遮罩（置於區域框上緣，標籤與框線保持間距）
    var lab = '刺激與反應之間的空間', lw = g(tw(lab, 12) + 16);
    c.o.push('<rect x="' + (360 - lw / 2) + '" y="44" width="' + lw + '" height="16" rx="2" fill="' + c.p.paper + '"/>');
    text(c, 360, 56, lab, { fill: c.p.muted, anchor: 'middle' });
    box(c, rx, cy - sh / 2, rw, sh, { kind: 'focal' });
    text(c, rx + 12, cy - sh / 2 + 20, '我選的回應', { fill: c.p.accent, w: 600 });
    slot(c, rx + 12, cy - sh / 2 + 28, rw - 24, c.fill ? opts[ch] : '', { maxL: 4, blankL: 3 });
    return { w: W, h: H, desc: '停步思考圖，從刺激出發，在三種可能的反應中選出最適當的回應' };
  };

  R.proscons = function (c, d) {
    var W = 720, P = c.fill ? d.pros : [], C = c.fill ? d.cons : [], n = Math.max(P.length, C.length, c.fill ? 3 : 4);
    var y0 = 112, H = y0 + n * 60 + 24;
    title(c, '優缺點分析圖');
    box(c, 36, 56, 312, 44, {});
    text(c, 192, 83, '做得好、進行順利的', { w: 600, anchor: 'middle' });
    box(c, 372, 56, 312, 44, { kind: 'focal' });
    text(c, 528, 83, '需要改進的', { w: 600, anchor: 'middle', fill: c.p.accent });
    for (var i = 0; i < n; i++) {
      var y = y0 + i * 60;
      box(c, 36, y, 312, 52, { kind: 'soft', rx: 6 });
      slot(c, 48, y, 288, P[i] || '', { maxL: 2, blankL: 2, h: 52 });
      box(c, 372, y, 312, 52, { kind: 'soft', rx: 6 });
      slot(c, 384, y, 288, C[i] || '', { maxL: 2, blankL: 2, h: 52 });
    }
    return { w: W, h: H, desc: '優缺點分析圖，左邊是做得好的事，右邊是需要改進的事' };
  };

  R.linechart = function (c, d) {
    var W = 720, H = 420, px0 = 84, px1 = 684, py0 = 72, py1 = 312;
    var xs = c.fill ? d.x : ['', '', '', '', ''], series = c.fill ? d.series : [];
    title(c, '線型圖');
    text(c, 36, 60, c.fill && d.yLabel ? d.yLabel : '分數', { fill: c.p.soft });
    for (var k = 0; k <= 5; k++) {
      var gy = py1 - k * 48;
      line(c, px0, gy, px1, gy, k === 0 ? { stroke: c.p.soft, sw: 1 } : {});
      text(c, px0 - 12, gy + 4, String(k), { mono: true, fs: 12, fill: c.p.soft, anchor: 'end' });
    }
    var n = xs.length, ix0 = px0 + 40, ix1 = px1 - 40, xp = function (i) { return n === 1 ? (ix0 + ix1) / 2 : Math.round(ix0 + i * (ix1 - ix0) / (n - 1)); };
    xs.forEach(function (lb, i) {
      line(c, xp(i), py1, xp(i), py1 + 6, { stroke: c.p.soft });
      slot(c, xp(i) - 36, py1 + 12, 72, lb, { maxL: 2, blankL: 1, anchor: 'middle' });
    });
    var styles = [{ s: c.p.accent, w: 2.4, dash: '' }, { s: c.p.ink, w: 1.6, dash: '' }, { s: c.p.muted, w: 1.6, dash: '5,4' }];
    series.forEach(function (se, si) {
      var st = styles[si], pts = se.v.map(function (v, i) { return [xp(i), Math.round(py1 - v * 48)]; });
      c.o.push('<polyline points="' + pts.map(function (p) { return p.join(','); }).join(' ') + '" fill="none" stroke="' + st.s + '" stroke-width="' + st.w + '"' + (st.dash ? ' stroke-dasharray="' + st.dash + '"' : '') + ' stroke-linejoin="round"/>');
      pts.forEach(function (p) { c.o.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4" fill="' + c.p.paper + '" stroke="' + st.s + '" stroke-width="1.6"/>'); });
    });
    if (c.fill) {
      var items = series.map(function (se, si) { return { k: si === 0 ? 'acc' : si === 1 ? 'ink' : 'dash', t: se.name }; });
      legend(c, H - 24, items, W);
    } else {
      legend(c, H - 24, [{ k: 'acc', t: '領域一' }, { k: 'ink', t: '領域二' }, { k: 'dash', t: '領域三' }], W);
    }
    return { w: W, h: H, desc: '線型圖，用不同的線追蹤各個領域在不同時間的表現' };
  };

  R.flowchart = function (c, d) {
    var W = 720, steps = c.fill ? d.steps : pad([], 4), n = steps.length, bw = 108, bh = 80, gapx = 24, y = 72, H = 188;
    var total = n * bw + (n - 1) * gapx, x0 = g((W - total) / 2);
    title(c, '流程圖');
    for (var i = 0; i < n - 1; i++) path(c, 'M' + (x0 + i * (bw + gapx) + bw) + ' ' + (y + bh / 2) + ' H' + (x0 + (i + 1) * (bw + gapx)), { accent: c.fill && i === n - 2 });
    steps.forEach(function (s, i) {
      var x = x0 + i * (bw + gapx), end = i === 0 || i === n - 1, f = c.fill && i === n - 1;
      box(c, x, y, bw, bh, { kind: f ? 'focal' : 'plain', rx: end ? 20 : 6 });
      text(c, x + bw / 2, y + 22, i === 0 ? '開始' : i === n - 1 ? '完成' : '步驟 ' + i, { fill: f ? c.p.accent : c.p.soft, w: 600, anchor: 'middle' });
      slot(c, x + 8, y + 32, bw - 16, s, { maxL: 2, blankL: 2, anchor: 'middle' });
    });
    return { w: W, h: H, desc: '流程圖，依序列出從開始到完成的各個步驟' };
  };

  R.control = function (c, d) {
    var W = 720, H = 412, ox = 36, oy = 72, ow = 648, oh = 316, ix = 184, iy = 116, iw = 352, ih = 228;
    title(c, '控制圈圖');
    if (c.fill && d.situation) text(c, 36, 52, '情境：' + d.situation, { fill: c.p.muted });
    box(c, ox, oy, ow, oh, { kind: 'soft', rx: 8 });
    box(c, ix, iy, iw, ih, { kind: 'focal', rx: 8 });
    var ol = '關注圈：在乎，但不能控制', il = '控制圈：我能決定的';
    var olw = g(tw(ol, 12) + 16), ilw = g(tw(il, 12) + 16);
    c.o.push('<rect x="' + (ox + 16) + '" y="' + (oy - 8) + '" width="' + olw + '" height="16" rx="2" fill="' + c.p.paper + '"/>');
    text(c, ox + 24, oy + 4, ol, { fill: c.p.muted, w: 600 });
    c.o.push('<rect x="' + (ix + 16) + '" y="' + (iy - 8) + '" width="' + ilw + '" height="16" rx="2" fill="' + c.p.paper + '"/>');
    text(c, ix + 24, iy + 4, il, { fill: c.p.accent, w: 600 });
    var inn = c.fill ? d.inner : pad([], 4), out = c.fill ? d.outer : pad([], 4);
    inn.forEach(function (s, i) { slot(c, ix + 20, iy + 28 + i * 48, iw - 40, s, { maxL: 2, blankL: 1 }); });
    out.forEach(function (s, i) {
      var left = i % 2 === 0, row = Math.floor(i / 2), x = left ? ox + 16 : ix + iw + 16;
      slot(c, x, iy + 36 + row * 88, 116, s, { maxL: 3, blankL: 2, lh: 18 });
    });
    return { w: W, h: H, desc: '控制圈圖，內圈是自己能控制的事，外圈是關心卻無法控制的事' };
  };

  R.venn = function (c, d) {
    var W = 720, H = 412, r = 140, cy = 236, c1 = 276, c2 = 444;
    var a = c.fill ? d.a : { name: '', only: [] }, b = c.fill ? d.b : { name: '', only: [] }, both = c.fill ? d.both : [];
    title(c, '維恩圖');
    c.o.push('<defs><clipPath id="' + c.id + '-cp"><circle cx="' + c1 + '" cy="' + cy + '" r="' + r + '"/></clipPath></defs>');
    c.o.push('<circle cx="' + c1 + '" cy="' + cy + '" r="' + r + '" fill="' + c.p.fill + '" stroke="' + c.p.ink + '" stroke-width="1"/>');
    c.o.push('<circle cx="' + c2 + '" cy="' + cy + '" r="' + r + '" fill="' + c.p.fill + '" stroke="' + c.p.muted + '" stroke-width="1"/>');
    c.o.push('<circle cx="' + c2 + '" cy="' + cy + '" r="' + r + '" fill="' + c.p.tint + '" clip-path="url(#' + c.id + '-cp)"/>');
    c.o.push('<circle cx="' + c1 + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + c.p.ink + '" stroke-width="1"/>');
    text(c, c1 - 40, 84, c.fill ? a.name : '第一個', { w: 600, fs: 14, anchor: 'middle' });
    text(c, c2 + 40, 84, c.fill ? b.name : '第二個', { w: 600, fs: 14, anchor: 'middle' });
    pad(a.only, c.fill ? a.only.length : 3).forEach(function (s, i) { slot(c, 164, cy - 64 + i * 48, 132, s, { maxL: 2, blankL: 1, anchor: 'middle' }); });
    pad(b.only, c.fill ? b.only.length : 3).forEach(function (s, i) { slot(c, 428, cy - 64 + i * 48, 132, s, { maxL: 2, blankL: 1, anchor: 'middle' }); });
    text(c, 360, cy - 80, '相同', { fill: c.p.accent, w: 600, anchor: 'middle' });
    pad(both, c.fill ? both.length : 3).forEach(function (s, i) { slot(c, 312, cy - 60 + i * 44, 96, s, { maxL: 2, blankL: 1, anchor: 'middle' }); });
    return { w: W, h: H, desc: '維恩圖，兩個圓各自列出獨有的特點，重疊的部分是兩者相同之處' };
  };

  R.brainstorm = function (c, d) {
    var W = 720, cy = 168, H = 312, br = c.fill ? d.branches : pad([], 6);
    var cwid = 148, chh = 64, cx = 286, bw = 164, bh = 48;
    var left = br.filter(function (_, i) { return i % 2 === 0; }), right = br.filter(function (_, i) { return i % 2 === 1; });
    title(c, '腦力激盪圖');
    function col(arr, side) {
      var m = arr.length, ys = m === 1 ? [cy] : m === 2 ? [cy - 44, cy + 44] : [cy - 84, cy, cy + 84];
      var ex = side < 0 ? cx : cx + cwid, bx = side < 0 ? 36 : 520, tx = side < 0 ? bx + bw : bx, xm = side < 0 ? 243 : 477;
      arr.forEach(function (s, k) {
        var ay = m === 1 ? cy : g(cy - chh / 2 + chh * (k + 1) / (m + 1));
        if (m === 3 && k === 1) ay = cy;
        elbowH(c, ex, ay, tx, ys[k], xm);
      });
      arr.forEach(function (s, k) {
        box(c, bx, ys[k] - bh / 2, bw, bh, {});
        slot(c, bx + 8, ys[k] - bh / 2, bw - 16, s, { maxL: 2, blankL: 1, anchor: 'middle', h: bh });
      });
    }
    col(left, -1); col(right, 1);
    box(c, cx, cy - chh / 2, cwid, chh, { kind: 'focal' });
    slot(c, cx + 8, cy - chh / 2 + 10, cwid - 16, c.fill ? d.center : '', { maxL: 2, blankL: 1, anchor: 'middle', w: 600 });
    if (!c.fill) text(c, cx + cwid / 2, cy - chh / 2 + 54, '主題', { fill: c.p.accent, anchor: 'middle', w: 600 });
    return { w: W, h: H, desc: '腦力激盪圖，主題寫在中央，向外延伸出各種想法' };
  };

  R.fishbone = function (c, d) {
    var W = 960, H = 440, CY = 216, HEAD = 796, causes = c.fill ? d.causes : pad([], 4).map(function () { return { cat: '', items: ['', '', ''] }; });
    var root = c.fill ? d.root : -1;
    title(c, '魚骨圖');
    path(c, 'M36 ' + CY + ' H' + HEAD, { accent: false });
    var tags = [];
    causes.forEach(function (ca, i) {
      var k = i + 1, up = k % 2 === 1, ax = HEAD - 84 - 148 * k, fx = ax - 72, fy = up ? CY - 120 : CY + 120, f = i === root;
      c.o.push('<line x1="' + ax + '" y1="' + CY + '" x2="' + fx + '" y2="' + fy + '" stroke="' + (f ? c.p.accent : c.p.ink) + '" stroke-width="' + (f ? 1.6 : 1.2) + '"/>');
      (ca.items || []).slice(0, 3).forEach(function (it, j) {
        var m = j + 2, tx = ax - 12 * m, ty = up ? CY - 20 * m : CY + 20 * m;
        c.o.push('<line x1="' + tx + '" y1="' + ty + '" x2="' + (tx - 28) + '" y2="' + ty + '" stroke="' + c.p.soft + '" stroke-width="1"/>');
        if (it) text(c, tx - 34, ty + 4, it, { fill: c.p.muted, anchor: 'end' });
      });
      tags.push({ x: fx, y: fy, up: up, cat: ca.cat, f: f });
    });
    tags.forEach(function (t) {
      var tw_ = 96, th = 28, y = t.up ? t.y - th : t.y;
      box(c, t.x - tw_ / 2, y, tw_, th, { kind: t.f ? 'focal' : 'plain', rx: 4 });
      text(c, t.x, y + 19, t.cat || '類別', { w: 600, anchor: 'middle', fill: t.cat ? (t.f ? c.p.accent : c.p.ink) : c.p.soft });
    });
    box(c, HEAD, CY - 44, 144, 88, { kind: 'focal' });
    text(c, HEAD + 12, CY - 24, '結果／問題', { fill: c.p.accent, w: 600 });
    slot(c, HEAD + 12, CY - 14, 120, c.fill ? d.effect : '', { maxL: 3, blankL: 2, w: 600 });
    legend(c, H - 24, [{ k: 'focal', t: '最主要的原因' }, { k: 'plain', t: '其他原因' }], W);
    return { w: W, h: H, desc: '魚骨圖，魚頭是結果或問題，每根魚骨是一類原因' };
  };

  R.barchart = function (c, d) {
    var W = 720, H = 416, px0 = 84, px1 = 684, py0 = 72, py1 = 304, bars = c.fill ? d.bars : pad([], 5).map(function () { return null; });
    var n = bars.length, mx = c.fill ? Math.max.apply(null, bars.map(function (b) { return b.value; })) : 0, top = c.fill ? nice(mx) : 4, step = top / 4;
    title(c, '長條圖');
    text(c, 36, 60, '單位：' + (c.fill && d.unit ? d.unit : '　'), { fill: c.p.soft });
    for (var k = 0; k <= 4; k++) {
      var gy = py1 - k * 58;
      line(c, px0, gy, px1, gy, k === 0 ? { stroke: c.p.soft, sw: 1 } : {});
      if (c.fill) text(c, px0 - 12, gy + 4, String(Math.round(step * k * 100) / 100), { mono: true, fill: c.p.soft, anchor: 'end' });
    }
    var pitch = Math.floor((px1 - px0) / n / 4) * 4, bw = g(pitch * 0.6), best = -1, bv = -1;
    if (c.fill) bars.forEach(function (b, i) { if (b.value > bv) { bv = b.value; best = i; } });
    bars.forEach(function (b, i) {
      var x = px0 + i * pitch + (pitch - bw) / 2;
      if (b) {
        var h = Math.max(2, Math.round(232 * b.value / top)), f = i === best;
        c.o.push('<rect x="' + x + '" y="' + (py1 - h) + '" width="' + bw + '" height="' + h + '" fill="' + (f ? c.p.tint : c.p.fill) + '" stroke="' + (f ? c.p.accent : c.p.muted) + '" stroke-width="1"/>');
        var vt = String(b.value), vw = g(tw(vt, 12) + 8);
        c.o.push('<rect x="' + (x + bw / 2 - vw / 2) + '" y="' + (py1 - h - 22) + '" width="' + vw + '" height="16" rx="2" fill="' + c.p.paper + '"/>');
        text(c, x + bw / 2, py1 - h - 8, String(b.value), { mono: true, fill: f ? c.p.accent : c.p.muted, anchor: 'middle' });
      }
      slot(c, px0 + i * pitch + 4, py1 + 10, pitch - 8, b ? b.label : '', { maxL: 2, blankL: 1, anchor: 'middle', w: 600 });
    });
    legend(c, H - 24, [{ k: 'focal', t: '最高的一項' }, { k: 'plain', t: '其他' }], W);
    return { w: W, h: H, desc: '長條圖，用直條的高度比較不同項目的數值' };
  };

  R.synergy = function (c, d) {
    var W = 720, H = 372, tx = 212, tw_ = 296, ty = 64, th = 80, by = 232, bw = 260, bh = 104, lx = 64, rx = 396;
    title(c, '統合綜效圖');
    elbowV(c, lx + bw / 2, by, tx + tw_ / 3, ty + th, 188);
    elbowV(c, rx + bw / 2, by, tx + tw_ * 2 / 3, ty + th, 188);
    box(c, tx, ty, tw_, th, { kind: 'focal' });
    text(c, tx + 12, ty + 20, '第 3 選擇：更好的想法', { fill: c.p.accent, w: 600 });
    slot(c, tx + 12, ty + 28, tw_ - 24, c.fill ? d.better : '', { maxL: 2, blankL: 2, w: 600 });
    box(c, lx, by, bw, bh, {});
    text(c, lx + 12, by + 20, '我的想法', { fill: c.p.soft, w: 600 });
    slot(c, lx + 12, by + 28, bw - 24, c.fill ? d.mine : '', { maxL: 3, blankL: 3 });
    box(c, rx, by, bw, bh, {});
    text(c, rx + 12, by + 20, '你的想法', { fill: c.p.soft, w: 600 });
    slot(c, rx + 12, by + 28, bw - 24, c.fill ? d.yours : '', { maxL: 3, blankL: 3 });
    return { w: W, h: H, desc: '統合綜效圖，把我的想法和你的想法合起來，找出比雙方原本更好的第三選擇' };
  };

  // ---- 資料清理 ---------------------------------------------------------
  function S(x, n) { x = String(x == null ? '' : x).trim(); return x.length > n ? x.slice(0, n) : x; }
  function A(a, max, n) { return (Array.isArray(a) ? a : []).map(function (x) { return S(x, n); }).filter(Boolean).slice(0, max); }
  function I(x, lo, hi, def) { x = Math.round(Number(x)); return isFinite(x) ? Math.min(hi, Math.max(lo, x)) : def; }
  var CLEAN = {
    priority: function (d) {
      var it = (Array.isArray(d.items) ? d.items : []).map(function (x) { x = x || {}; var p = S(x.p, 1).toUpperCase(); return { t: S(x.t, 28), p: 'ABC'.indexOf(p) >= 0 && p ? p : 'C' }; }).filter(function (x) { return x.t; }).slice(0, 6);
      return it.length >= 3 ? { items: it } : null;
    },
    lotus: function (d) { var p = pad(A(d.petals, 8, 14), 8); return S(d.center, 14) && p.filter(Boolean).length >= 4 ? { center: S(d.center, 14), petals: p } : null; },
    goalplan: function (d) { var a = A(d.actions, 4, 30); return S(d.goal, 32) && a.length >= 2 ? { goal: S(d.goal, 32), actions: a } : null; },
    gantt: function (d) {
      var T = I(d.total, 3, 10, 6), t = (Array.isArray(d.tasks) ? d.tasks : []).map(function (x) { x = x || {}; var s = I(x.s, 1, T, 1), e = I(x.e, 1, T, s); return { t: S(x.t, 16), s: Math.min(s, e), e: Math.max(s, e) }; }).filter(function (x) { return x.t; }).slice(0, 6);
      return t.length >= 3 ? { unit: S(d.unit, 2) || '週', total: T, tasks: t } : null;
    },
    stopthink: function (d) { var o = pad(A(d.options, 3, 28), 3); return S(d.stimulus, 40) && o.filter(Boolean).length === 3 ? { stimulus: S(d.stimulus, 40), options: o, choice: I(d.choice, 0, 2, 1) } : null; },
    proscons: function (d) { var p = A(d.pros, 4, 28), q = A(d.cons, 4, 28); return p.length && q.length ? { pros: p, cons: q } : null; },
    linechart: function (d) {
      var x = A(d.x, 6, 6); if (x.length < 2) return null;
      var s = (Array.isArray(d.series) ? d.series : []).slice(0, 3).map(function (se) { se = se || {}; var v = Array.isArray(se.v) ? se.v : []; return { name: S(se.name, 8), v: x.map(function (_, i) { var n = Number(v[i]); return isFinite(n) ? Math.min(5, Math.max(0, n)) : 0; }) }; }).filter(function (se) { return se.name; });
      return s.length ? { x: x, series: s, yLabel: S(d.yLabel, 12) } : null;
    },
    flowchart: function (d) { var s = A(d.steps, 5, 18); return s.length >= 3 ? { steps: s } : null; },
    control: function (d) { var a = A(d.inner, 4, 26), b = A(d.outer, 4, 16); return a.length && b.length ? { situation: S(d.situation, 28), inner: a, outer: b } : null; },
    venn: function (d) {
      d = d || {}; var a = d.a || {}, b = d.b || {};
      var o = { a: { name: S(a.name, 8), only: A(a.only, 3, 12) }, b: { name: S(b.name, 8), only: A(b.only, 3, 12) }, both: A(d.both, 3, 10) };
      return o.a.name && o.b.name && o.both.length ? o : null;
    },
    brainstorm: function (d) { var b = A(d.branches, 6, 14); return S(d.center, 14) && b.length >= 3 ? { center: S(d.center, 14), branches: b } : null; },
    fishbone: function (d) {
      var ca = (Array.isArray(d.causes) ? d.causes : []).slice(0, 4).map(function (x) { x = x || {}; return { cat: S(x.cat, 6), items: A(x.items, 3, 6) }; }).filter(function (x) { return x.cat && x.items.length; });
      return S(d.effect, 24) && ca.length >= 2 ? { effect: S(d.effect, 24), causes: ca, root: I(d.root, 0, ca.length - 1, 0) } : null;
    },
    barchart: function (d) {
      var b = (Array.isArray(d.bars) ? d.bars : []).map(function (x) { x = x || {}; var v = Number(x.value); return { label: S(x.label, 10), value: isFinite(v) && v >= 0 ? v : 0 }; }).filter(function (x) { return x.label; }).slice(0, 6);
      return b.length >= 2 ? { unit: S(d.unit, 6), bars: b } : null;
    },
    synergy: function (d) { var m = S(d.mine, 40), y = S(d.yours, 40), b = S(d.better, 44); return m && y && b ? { mine: m, yours: y, better: b } : null; }
  };

  // 14 個領導力工具：名稱、說明（取自老師提供的工具文件）、此工具圖的 JSON 格式、常搭配的習慣
  var TOOLS = [
    { key: 'priority', name: '優先順序表', habits: [3], desc: '優先順序表是實行「要事第一」的極佳工具。學生先列出所有要做的事，在每件事前面標上 A、B、C：A 最重要而且非做不可，B 有點重要，C 不太重要。也可用數字標示重要性。',
      shape: '{"items":[{"t":"事項，28 字內","p":"A|B|C"}×4~6，A 排最前]}' },
    { key: 'lotus', name: '蓮花圖', habits: [2, 6], desc: '蓮花圖是腦力激盪或匯整想法的工具，最中間的格子是討論的主題，旁邊 8 格是與主題相關的概念，可用來針對一個主題腦力激盪或拆解大問題。',
      shape: '{"center":"主題，14 字內","petals":["概念，14 字內"×8]}' },
    { key: 'goalplan', name: '目標計畫表', habits: [2, 3], desc: '目標計畫表用來釐清目標以及達成目標所需完成的工作事項。最上方寫清晰、具體的目標，下方寫達成目標要採取的各項行動。可與甘特圖及優先順序表一起使用。',
      shape: '{"goal":"清晰具體的目標，32 字內","actions":["行動，30 字內"×3~4]}' },
    { key: 'gantt', name: '甘特圖', habits: [3, 2], desc: '甘特圖用於計畫專案的時程，標出專案開始與結束的時間，以及每個工作事項需要的工作時間。較複雜，適合高年級以上學生。',
      shape: '{"unit":"週|天","total":總期數 3~10,"tasks":[{"t":"工作，16 字內","s":開始期數,"e":結束期數}×3~6]}' },
    { key: 'stopthink', name: '停步思考圖', habits: [1], desc: '停步思考圖強化「在刺激與反應之間，我們有選擇的空間」。先把刺激（碰到的情境、事件）寫在左邊，再想可能的幾種反應，最後把最適當的反應寫在右邊。',
      shape: '{"stimulus":"刺激，40 字內","options":["可能的反應，28 字內"×3],"choice":最適當反應的索引 0~2}' },
    { key: 'proscons', name: '優缺點分析圖', habits: [4, 7], desc: '優缺點分析圖用於評估一個情況，或整理大家對一個活動的回饋。左欄列出表現優異或進行順利的事項，右欄列出需要改進的事項。可用於班級、小組或個人。',
      shape: '{"pros":["做得好的，28 字內"×3~4],"cons":["需要改進的，28 字內"×3~4]}' },
    { key: 'linechart', name: '線型圖', habits: [7], desc: '線型圖用於比較不同時間的資料。學生追蹤自己每週、每月、每學期在某些領域的表現，每條線代表一個領域。',
      shape: '{"yLabel":"縱軸說明，12 字內","x":["時間點，6 字內"×4~6],"series":[{"name":"領域，8 字內","v":[每個時間點的分數 0~5]}×1~3]}' },
    { key: 'flowchart', name: '流程圖', habits: [2, 3], desc: '流程圖是具組織功能的工具，用於規劃或描述一個流程。學生可規劃每個科目專案的執行步驟，或記錄自己一天的行程。',
      shape: '{"steps":["步驟，18 字內"×4~5，第一個是開始、最後一個是完成]}' },
    { key: 'control', name: '控制圈圖', habits: [1], desc: '控制圈圖幫助學生專注於自己能掌控的事。將可以掌控的事列在內圈（控制圈），很關心卻無法掌控的事列在外圈（關注圈）。例：準時上學，天氣與交通在關注圈，準時起床、前一天準備好衣服在控制圈。',
      shape: '{"situation":"情境，28 字內","inner":["我能控制的，26 字內"×3~4],"outer":["在乎但不能控制的，16 字內"×3~4]}' },
    { key: 'venn', name: '維恩圖', habits: [4, 5], desc: '維恩圖用來比較不同事物的異同。兩個圓圈各自寫出獨有的特點，重疊的部分寫出相同之處。小學階段通常先用兩個圓圈。',
      shape: '{"a":{"name":"甲，8 字內","only":["獨有特點，12 字內"×2~3]},"b":{"name":"乙，8 字內","only":["獨有特點，12 字內"×2~3]},"both":["相同點，10 字內"×2~3]}' },
    { key: 'brainstorm', name: '腦力激盪圖', habits: [6, 8], desc: '腦力激盪圖用於創意發想與規劃，讓學生以非線性方式整理想法。主題寫在中央，以線條延伸出不同想法。腦力激盪時不批評、不刪減，鼓勵創意，最後再篩選。',
      shape: '{"center":"主題，14 字內","branches":["想法，14 字內"×4~6]}' },
    { key: 'fishbone', name: '魚骨圖', habits: [5, 6], desc: '魚骨圖（石川圖）呈現特定事件、問題或結果的肇因。魚頭寫結果或問題，分支出去的魚骨寫導致的原因，可用來分析問題成因或達成某種結果所需的元素。',
      shape: '{"effect":"結果或問題，24 字內","causes":[{"cat":"原因類別，6 字內","items":["具體原因，6 字內"×2~3]}×3~4],"root":最主要原因類別的索引}' },
    { key: 'synergy', name: '統合綜效圖', habits: [6, 4], desc: '統合綜效圖用於對解決某件事有不同意見時，幫助學生找到比雙方原先想法都更好的「第 3 選擇」。左右分別寫「我的想法」和「你的想法」，一起腦力激盪出「更好的想法」寫在上方。第 3 選擇不是妥協，是雙方都認為更好的方案。',
      shape: '{"mine":"我的想法，40 字內","yours":"你的想法，40 字內","better":"更好的想法（不是妥協），44 字內"}' },
    { key: 'barchart', name: '長條圖', habits: [7, 8], desc: '長條圖用於比較不同的數值，每個數值用一個直條表示，可比較幾組不同的數值，或某個數值在不同時間點的差異。',
      shape: '{"unit":"單位，6 字內","bars":[{"label":"項目，10 字內","value":數值}×3~6]}' }
  ];
  var BYNAME = {}; TOOLS.forEach(function (t) { BYNAME[t.name] = t; });
  function toolFor(s) {
    s = String(s || '');
    if (BYNAME[s]) return BYNAME[s];
    for (var i = 0; i < TOOLS.length; i++) if (s.indexOf(TOOLS[i].name) >= 0 || (TOOLS[i].key === 'control' && /控制圈/.test(s)) || (TOOLS[i].key === 'venn' && /范氏|維恩/.test(s)) || (TOOLS[i].key === 'proscons' && /優缺點/.test(s))) return TOOLS[i];
    return null;
  }

  function render(key, data, opt) {
    opt = opt || {};
    var fn = R[key]; if (!fn) return null;
    var fill = opt.fill !== false && !!data;
    var id = 'dg' + (++seq), c = { fill: fill, p: opt.light ? LIGHT : pal(), id: id, o: [] };
    var m = fn(c, data || {});
    var name = TOOLS.filter(function (x) { return x.key === key; })[0].name;
    var defs = '<defs><marker id="' + id + '-a" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="' + c.p.muted + '"/></marker>' +
      '<marker id="' + id + '-aa" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="' + c.p.accent + '"/></marker></defs>';
    var size = opt.light ? ' width="' + m.w + '" height="' + m.h + '"' : ' style="min-width:' + m.w + 'px;width:100%;height:auto;display:block"';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + m.w + ' ' + m.h + '"' + size + ' role="img" aria-labelledby="' + id + '-title ' + id + '-desc">' +
      '<title id="' + id + '-title">' + esc(name + (fill ? '' : '（空白學習單）')) + '</title><desc id="' + id + '-desc">' + esc(m.desc) + '</desc>' + defs +
      '<rect width="100%" height="100%" fill="' + c.p.paper + '"/>' + c.o.join('') + '</svg>';
  }

  return { TOOLS: TOOLS, toolFor: toolFor, clean: function (key, d) { try { return CLEAN[key] ? CLEAN[key](d || {}) : null; } catch (e) { return null; } }, render: render, LIGHT: LIGHT };
})();
