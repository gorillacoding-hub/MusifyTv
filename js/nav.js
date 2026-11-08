/* Musify TV - D-pad spatial navigation (no DOM focus, so the TV keyboard never pops up by accident). */
(function () {
  'use strict';
  var MTV = window.MTV, cur = null;
  var N = MTV.nav = { onExtra: null };

  function visible(e) { return e.offsetWidth > 0 && e.offsetHeight > 0; }

  function scope() {
    if (!MTV.$('modal').classList.contains('hide')) { return MTV.$('modal'); }
    if (!MTV.$('np').classList.contains('hide')) { return MTV.$('np'); }
    return MTV.$('app');
  }

  function list(sc) {
    var a = sc.querySelectorAll('[data-f]'), o = [], i;
    for (i = 0; i < a.length; i++) { if (visible(a[i])) { o.push(a[i]); } }
    return o;
  }

  function gap(a1, a2, b1, b2) {
    if (b2 < a1) { return a1 - b2; }
    if (b1 > a2) { return b1 - a2; }
    return 0;
  }

  function reveal(e) {
    var p = e.parentNode, pr, er, pad;
    while (p && p !== document.body) {
      if (p.classList && (p.classList.contains('sy') || p.classList.contains('sx'))) {
        pr = p.getBoundingClientRect();
        er = e.getBoundingClientRect();
        pad = parseInt(p.getAttribute('data-pad') || '50', 10);
        if (p.classList.contains('sy')) {
          if (er.top < pr.top + pad) { p.scrollTop -= (pr.top + pad - er.top); }
          else if (er.bottom > pr.bottom - 30) { p.scrollTop += (er.bottom - (pr.bottom - 30)); }
        } else {
          /* Horizontal rows move an inner track with translateX (works in LTR and RTL, old and new Chromium). */
          var tk = p.firstChild, x = tk._x || 0, el0 = e.offsetLeft, el1 = el0 + e.offsetWidth;
          var vl = -x + 24, vr = -x + p.clientWidth - 24;
          if (el1 > vr) { x -= (el1 - vr); } else if (el0 < vl) { x += (vl - el0); }
          tk._x = x;
          tk.style.transform = 'translateX(' + x + 'px)';
        }
      }
      p = p.parentNode;
    }
  }

  N.focus = function (e) {
    if (cur) { cur.classList.remove('on'); }
    cur = e || null;
    if (cur) { cur.classList.add('on'); reveal(cur); }
  };
  N.current = function () { return cur; };
  N.focusFirst = function (sc) {
    var l = list(sc || scope());
    N.focus(l.length ? l[0] : null);
  };

  function move(dir) {
    var sc = scope();
    if (!cur || !sc.contains(cur) || !visible(cur)) { return N.focusFirst(sc); }
    var r = cur.getBoundingClientRect(), all = list(sc), best = null, bs = 1e9, i, c, q, p, s, off, sc2;
    for (i = 0; i < all.length; i++) {
      c = all[i];
      if (c === cur) { continue; }
      q = c.getBoundingClientRect();
      if (dir === 'left') {
        if (q.right > r.left + 8) { continue; }
        p = r.left - q.right; s = gap(r.top, r.bottom, q.top, q.bottom);
        off = Math.abs((q.top + q.bottom) / 2 - (r.top + r.bottom) / 2);
      } else if (dir === 'right') {
        if (q.left < r.right - 8) { continue; }
        p = q.left - r.right; s = gap(r.top, r.bottom, q.top, q.bottom);
        off = Math.abs((q.top + q.bottom) / 2 - (r.top + r.bottom) / 2);
      } else if (dir === 'up') {
        if (q.bottom > r.top + 8) { continue; }
        p = r.top - q.bottom; s = gap(r.left, r.right, q.left, q.right);
        off = Math.abs((q.left + q.right) / 2 - (r.left + r.right) / 2);
      } else {
        if (q.top < r.bottom - 8) { continue; }
        p = q.top - r.bottom; s = gap(r.left, r.right, q.left, q.right);
        off = Math.abs((q.left + q.right) / 2 - (r.left + r.right) / 2);
      }
      sc2 = p + s * 3 + off * 0.25;
      if (sc2 < bs) { bs = sc2; best = c; }
    }
    if (best) { N.focus(best); }
  }

  function onKey(e) {
    var k = e.keyCode, tg = e.target;
    if (tg && tg.tagName === 'INPUT') {
      if (k === 13) { e.preventDefault(); tg.blur(); if (tg.onenter) { tg.onenter(); } return; }
      if (k === 10009 || k === 27) { e.preventDefault(); tg.blur(); return; }
      if (k === 38 || k === 40) { tg.blur(); } else { return; }
    }
    if (cur && cur.onkey && (k === 37 || k === 39) && cur.onkey(k)) { e.preventDefault(); return; }
    switch (k) {
      case 37: e.preventDefault(); move('left'); return;
      case 38: e.preventDefault(); move('up'); return;
      case 39: e.preventDefault(); move('right'); return;
      case 40: e.preventDefault(); move('down'); return;
      case 13:
        e.preventDefault();
        if (cur) { if (cur.tagName === 'INPUT') { cur.focus(); } else { cur.click(); } }
        return;
      case 10009: case 27: case 8:
        e.preventDefault();
        if (MTV.ui) { MTV.ui.back(); }
        return;
      default:
        if (N.onExtra && N.onExtra(k)) { e.preventDefault(); }
    }
  }
  document.addEventListener('keydown', onKey, true);
})();