/* Musify TV - helpers. ES5 only (Tizen 4.0 / Chromium 56). */
(function (w) {
  'use strict';
  var MTV = w.MTV = {};

  MTV.$ = function (id) { return document.getElementById(id); };

  MTV.el = function (tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (text !== undefined && text !== null) { e.textContent = text; }
    return e;
  };

  MTV.auto = function (e) { e.setAttribute('dir', 'auto'); return e; };

  MTV.empty = function (n) {
    while (n.firstChild) { n.removeChild(n.firstChild); }
    return n;
  };

  MTV.fmt = function (s) {
    s = Math.max(0, Math.floor(s || 0));
    var m = Math.floor(s / 60), r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  };

  MTV.debounce = function (fn, ms) {
    var tm;
    return function () {
      var a = arguments, c = this;
      clearTimeout(tm);
      tm = setTimeout(function () { fn.apply(c, a); }, ms);
    };
  };

  MTV.focusable = function (node, fn) {
    node.setAttribute('data-f', '1');
    if (fn) { node.onclick = fn; }
    return node;
  };

  MTV.setThumb = function (d, url) {
    d.style.backgroundImage = 'none';
    d.setAttribute('data-u', url || '');
    if (!url) { return; }
    var i = new Image();
    i.onload = function () {
      if (d.getAttribute('data-u') === url) {
        d.style.backgroundImage = 'url("' + url.replace(/"/g, '%22') + '")';
      }
    };
    i.src = url;
  };

  MTV.thumb = function (url, cls) {
    var d = MTV.el('div', 'th ' + (cls || ''));
    MTV.setThumb(d, url);
    return d;
  };
})(window);
