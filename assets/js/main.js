
(function () {
  'use strict';
  var WA = 'https://wa.me/375255217763';

  /* ---- мобильное меню ---- */
  function initDrawer() {
    var d = document.getElementById('drawer');
    var b = document.querySelector('.header .burger');
    if (!d || !b) return;
    var last = null;
    function open() {
      last = document.activeElement;
      d.hidden = false; d.setAttribute('data-open', '');
      b.setAttribute('aria-expanded', 'true');
      document.body.classList.add('is-locked');
      var f = d.querySelector('a, button'); if (f) f.focus({ preventScroll: true });
    }
    function close() {
      d.hidden = true; d.removeAttribute('data-open');
      b.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('is-locked');
      if (last) last.focus({ preventScroll: true });
    }
    b.addEventListener('click', function () { d.hidden ? open() : close(); });
    d.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]') || e.target.closest('a') || !e.target.closest('.drawer__in')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !d.hidden) close();
      if (e.key === 'Tab' && !d.hidden) {
        var it = d.querySelectorAll('a, button, input');
        if (!it.length) return;
        var f = it[0], l = it[it.length - 1];
        if (e.shiftKey && document.activeElement === f) { e.preventDefault(); l.focus(); }
        else if (!e.shiftKey && document.activeElement === l) { e.preventDefault(); f.focus(); }
      }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 1020 && !d.hidden) close(); });
  }

  /* ---- сборка объёма работ ---- */
  function initScope() {
    var box = document.getElementById('scope');
    if (!box) return;
    var inputs = box.querySelectorAll('.chk input');
    var n = document.getElementById('scN');
    var list = document.getElementById('scList');
    var empty = document.getElementById('scEmpty');
    var send = document.getElementById('scSend');
    function render() {
      var pick = [];
      [].forEach.call(inputs, function (i) { if (i.checked) pick.push(i.getAttribute('data-w')); });
      n.textContent = pick.length;
      list.innerHTML = pick.map(function (t) { return '<li>' + t + '</li>'; }).join('');
      list.hidden = !pick.length;
      empty.hidden = !!pick.length;
      var msg = 'Заявка с сайта: ИП Харкевич И.И.\nОбъём работ: ' + (pick.length ? '\n— ' + pick.join('\n— ') : 'уточним по телефону') + '\n\nОбъект: ';
      send.href = WA + '?text=' + encodeURIComponent(msg);
    }
    [].forEach.call(inputs, function (i) { i.addEventListener('change', render); });
    render();
  }

  /* ---- график этапов ---- */
  function initGantt() {
    var host = document.getElementById('terms');
    if (!host) return;
    var typeBox = document.getElementById('gType');
    var stateBox = document.getElementById('gState');
    var area = document.getElementById('gArea');
    var svg = document.getElementById('gSvg');
    var rows = document.getElementById('gRows');
    var total = document.getElementById('gTotal');
    var L = { type: document.getElementById('gTypeL'), area: document.getElementById('gAreaL'), state: document.getElementById('gStateL') };
    var st = { t: 'flat', s: 'second', a: 62 };
    var NAMES = { flat: 'Квартира', house: 'Дом', office: 'Офис', industrial: 'Производство' };
    var SNAMES = { second: 'Вторичка', new: 'Новостройка', shell: 'Только коробка' };

    function base() {
      var a = st.a, w;
      if (st.t === 'flat') w = a * 0.11 + 4;
      else if (st.t === 'house') w = a * 0.09 + 5;
      else if (st.t === 'office') w = a * 0.055 + 5.5;
      else w = a * 0.012 + 8;
      if (st.s === 'shell') w *= 1.45;
      if (st.s === 'new') w *= 0.86;
      var cap = { flat: 30, house: 56, office: 34, industrial: 46 }[st.t];
      return Math.max(5, Math.min(cap, w));
    }
    function plan() {
      var W = base();
      var share = [
        ['Демонтаж и земля', 0.12],
        ['Коробка и конструкции', 0.26],
        ['Инженерия', 0.18],
        ['Черновая отделка', 0.20],
        ['Чистовая отделка', 0.18],
        ['Пусконаладка и сдача', 0.06]
      ];
      var acc = 0;
      return share.map(function (s) {
        var len = Math.max(0.6, W * s[1]);
        var o = { name: s[0], start: acc, len: len };
        acc += len;
        return o;
      });
    }
    function draw() {
      var p = plan();
      var W = p.reduce(function (a, b) { return a + b.len; }, 0);
      total.textContent = Math.round(W);
      var H = 26, gap = 4, top = 22, left = 0, wid = 520;
      var out = '<text x="0" y="10" font-family="JetBrains Mono,monospace" font-size="9" fill="#6E767D">недели</text>';
      var ticks = Math.max(2, Math.min(10, Math.round(W / 2)));
      for (var i = 0; i <= ticks; i++) {
        var x = left + (wid / ticks) * i;
        out += '<line x1="' + x + '" y1="16" x2="' + x + '" y2="' + (top + p.length * (H + gap)) + '" stroke="rgba(17,20,23,.12)"/>';
        out += '<text x="' + x + '" y="' + (12) + '" font-family="JetBrains Mono,monospace" font-size="8" fill="#6E767D" text-anchor="middle">' + Math.round(W / ticks * i) + '</text>';
      }
      p.forEach(function (r, i) {
        var y = top + i * (H + gap);
        var x = left + wid * (r.start / W), w = wid * (r.len / W);
        out += '<text x="0" y="' + (y + H / 2 + 3) + '" font-family="Golos Text,sans-serif" font-size="9.5" fill="#111417" text-anchor="start" opacity="0">' + r.name + '</text>';
        out += '<rect x="' + x + '" y="' + y + '" width="' + Math.max(2, w) + '" height="' + H + '" fill="' + (i % 2 ? '#111417' : '#D22B2B') + '"/>';
        out += '<text x="' + (x + w + 6) + '" y="' + (y + H / 2 + 3) + '" font-family="JetBrains Mono,monospace" font-size="8.5" fill="#6E767D">' + (Math.round(r.len * 10) / 10) + ' н.</text>';
      });
      svg.setAttribute('viewBox', '0 0 ' + wid + ' ' + (top + p.length * (H + gap) + 6));
      svg.innerHTML = out;
      rows.innerHTML = p.map(function (r) {
        return '<div class="grow"><span>' + r.name + '</span><b>' + (Math.round(r.len * 10) / 10) + ' нед.</b></div>';
      }).join('');
      L.type.textContent = NAMES[st.t];
      L.area.textContent = st.a + ' м²';
      L.state.textContent = SNAMES[st.s];
    }
    typeBox.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      [].forEach.call(typeBox.children, function (c) { c.classList.toggle('is-on', c === b); });
      st.t = b.getAttribute('data-t');
      if (st.t === 'industrial') { area.min = 100; area.max = 6000; }
      else if (st.t === 'house') { area.min = 60; area.max = 600; }
      else { area.min = 20; area.max = 400; }
      st.a = Math.min(Math.max(st.a, +area.min), +area.max);
      area.value = st.a;
      draw();
    });
    stateBox.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      [].forEach.call(stateBox.children, function (c) { c.classList.toggle('is-on', c === b); });
      st.s = b.getAttribute('data-s'); draw();
    });
    area.addEventListener('input', function () { st.a = +area.value; draw(); });
    draw();
  }

  /* ---- форма заявки ---- */
  function initLead() {
    var f = document.getElementById('lead');
    if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = document.getElementById('lName'), t = document.getElementById('lTel'), k = document.getElementById('lTask');
      var bad = false;
      [n, t].forEach(function (el) { if (!el.value.trim()) { el.style.borderColor = '#D22B2B'; bad = true; } else { el.style.borderColor = ''; } });
      if (bad) return;
      var msg = 'Заявка с сайта: ИП Харкевич И.И.\nИмя: ' + n.value.trim() + '\nТелефон: ' + t.value.trim() + (k.value.trim() ? '\nЗадача: ' + k.value.trim() : '');
      window.open(WA + '?text=' + encodeURIComponent(msg), '_blank');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initDrawer(); initScope(); initGantt(); initLead();
    var y = document.getElementById('yr'); if (y) y.textContent = new Date().getFullYear();
  });
})();
