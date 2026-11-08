/* Musify TV - screens, mini player, now-playing, dialogs. ES5 only. */
(function () {
  'use strict';
  var MTV = window.MTV, $ = MTV.$, el = MTV.el, t = MTV.t, P = MTV.player, L = MTV.lib, A = MTV.api;
  var UI = MTV.ui = {};
  var view = $('view'), modalEl = $('modal'), npEl = $('np'), toastEl = $('toast');
  var stack = [], token = 0, toastT, exitArmed = false, prevFocus = null, npPrev = null;
  var V = {}, B = {}, N = {}, LY = { id: '', status: 'none', lines: null, plain: '' }, lyIdx = -1, mode = 'lyrics';

  var COLORS = { rose: '#ff5c8a', amber: '#ffb547', teal: '#2fd3b5', violet: '#a68bff' };
  var IC = {
    home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
    search: 'M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
    library: 'M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 5h-3v5.5a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1 2.5-2.5c.57 0 1.08.19 1.5.51V5h4v2zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z',
    settings: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
    play: 'M8 5v14l11-7z',
    pause: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z',
    next: 'M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z',
    prev: 'M6 6h2v12H6zm3.5 6l8.5 6V6z',
    heart: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
    shuffle: 'M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z',
    repeat: 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z',
    lyrics: 'M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z',
    queue: 'M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z',
    more: 'M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'
  };

  UI.icon = function (n, cls) {
    var s = el('span', 'ic' + (cls ? ' ' + cls : ''));
    s.innerHTML = '<svg viewBox="0 0 24 24"><path d="' + IC[n] + '"/></svg>';
    return s;
  };
  function setIcon(b, n) {
    if (b._ic === n) { return; }
    b._ic = n;
    MTV.empty(b);
    b.appendChild(UI.icon(n));
  }
  function cbtn(icon, fn, cls) {
    var d = MTV.focusable(el('div', cls || 'cb'), fn);
    setIcon(d, icon);
    return d;
  }
  function nodes(root) { return Array.prototype.slice.call(root.querySelectorAll('[data-f]')); }

  UI.toast = function (msg) {
    toastEl.textContent = msg;
    toastEl.className = '';
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.className = 'hide'; }, 2600);
  };

  UI.applyAccent = function () {
    var c = COLORS[MTV.settings.accent] || COLORS.rose;
    document.documentElement.style.setProperty('--acc', c);
  };

  /* ---------------- Navigation rail ---------------- */
  var NAV = [['home', 'home'], ['search', 'search'], ['library', 'library'], ['settings', 'settings']];
  function buildRail() {
    var r = MTV.empty($('rail')), b = el('div', 'brand');
    b.appendChild(el('span', 'logo', 'M'));
    b.appendChild(el('span', 'bn', 'Musify TV'));
    r.appendChild(b);
    NAV.forEach(function (n) {
      var d = MTV.focusable(el('div', 'rb'), function () { UI.go(n[0], {}, false); });
      d.setAttribute('data-nav', n[0]);
      d.appendChild(UI.icon(n[1]));
      d.appendChild(el('span', 'rl', t(n[0])));
      r.appendChild(d);
    });
    markRail();
  }
  function markRail() {
    var root = stack.length ? stack[0].name : '', rb = document.querySelectorAll('.rb'), i;
    for (i = 0; i < rb.length; i++) {
      rb[i].classList.toggle('act', rb[i].getAttribute('data-nav') === root);
    }
  }

  /* ---------------- View stack ---------------- */
  function saveFocus() {
    if (!stack.length) { return; }
    var top = stack[stack.length - 1], f = nodes(view);
    top.fi = Math.max(0, f.indexOf(MTV.nav.current()));
    top.st = view.scrollTop;
  }
  function render(restore) {
    var top = stack[stack.length - 1], pref, f, target;
    token++;
    MTV.empty(view);
    view.scrollTop = 0;
    pref = V[top.name](top.params, view, token);
    markRail();
    f = nodes(view);
    target = (restore && f[top.fi]) ? f[top.fi] : (pref || f[0]);
    if (restore) { view.scrollTop = top.st || 0; }
    if (target && npEl.classList.contains('hide')) { MTV.nav.focus(target); }
  }
  UI.go = function (name, params, push) {
    saveFocus();
    if (!push) { stack = []; }
    stack.push({ name: name, params: params || {}, fi: 0, st: 0 });
    render(false);
  };

  /* ---------------- Reusable pieces ---------------- */
  function chip(label, fn, sel) {
    return MTV.focusable(el('div', 'chip' + (sel ? ' sel' : ''), label), fn);
  }
  function msg(text) { return el('div', 'msg', text); }

  function card(title, sub, thumb, fn) {
    var c = MTV.focusable(el('div', 'card'), fn);
    c.appendChild(MTV.thumb(thumb, 'sq'));
    c.appendChild(MTV.auto(el('div', 'cn', title)));
    c.appendChild(MTV.auto(el('div', 'cs', sub)));
    return c;
  }
  function makeRow() {
    var box = el('div', 'rowx sx'), trk = el('div', 'trk');
    box.appendChild(trk);
    return { box: box, trk: trk };
  }
  function trackRow(title, tracks) {
    var sec = el('section', 'sec'), r = makeRow();
    sec.appendChild(el('h2', 'st', title));
    sec.appendChild(r.box);
    fillTracks(r.trk, tracks);
    return { sec: sec, row: r.trk };
  }
  function fillTracks(row, tracks) {
    MTV.empty(row);
    tracks.slice(0, 24).forEach(function (tr, i) {
      row.appendChild(card(tr.title, tr.artist, tr.thumb, function () { P.playList(tracks, i); }));
    });
  }
  function playShuffled(list) {
    if (!list.length) { return; }
    if (!P.shuffle) { P.toggleShuffle(); }
    P.playList(list, Math.floor(Math.random() * list.length));
  }

  UI.songList = function (tracks, opts) {
    opts = opts || {};
    var box = el('div', 'slist');
    tracks.forEach(function (tr, i) {
      var row = el('div', 'srow'), m, tx, more;
      row.setAttribute('data-id', tr.id);
      if (P.cur && P.cur.id === tr.id) { row.className += ' cur'; }
      m = MTV.focusable(el('div', 'sr-main'), function () {
        if (opts.onPlay) { opts.onPlay(i); } else { P.playList(tracks, i); }
      });
      m.appendChild(MTV.thumb(tr.thumb, 'sm'));
      tx = el('div', 'sr-t');
      tx.appendChild(MTV.auto(el('div', 't1', tr.title)));
      tx.appendChild(MTV.auto(el('div', 't2', tr.artist)));
      m.appendChild(tx);
      m.appendChild(el('div', 'sr-d', tr.dur ? MTV.fmt(tr.dur) : ''));
      more = MTV.focusable(el('div', 'sr-more'), function () { UI.songMenu(tr, opts); });
      more.appendChild(UI.icon('more'));
      row.appendChild(m);
      row.appendChild(more);
      box.appendChild(row);
    });
    return box;
  };
  function markPlaying() {
    var rows = document.querySelectorAll('.srow'), i, id = P.cur ? P.cur.id : '';
    for (i = 0; i < rows.length; i++) {
      rows[i].classList.toggle('cur', rows[i].getAttribute('data-id') === id);
    }
  }

  /* ---------------- Dialogs ---------------- */
  function closeModal() {
    modalEl.className = 'hide';
    MTV.empty(modalEl);
    if (prevFocus && document.body.contains(prevFocus)) { MTV.nav.focus(prevFocus); }
    else { MTV.nav.focusFirst(); }
  }
  function openModal(card, first) {
    MTV.empty(modalEl).appendChild(card);
    modalEl.className = '';
    MTV.nav.focus(first);
  }
  UI.modal = function (title, items) {
    prevFocus = MTV.nav.current();
    var card = el('div', 'mcard'), list = el('div', 'ml sy');
    card.appendChild(MTV.auto(el('div', 'mt', title)));
    items.forEach(function (it) {
      var b = MTV.focusable(el('div', 'mi'), function () { closeModal(); if (it.fn) { it.fn(); } });
      if (it.icon) { b.appendChild(UI.icon(it.icon)); }
      b.appendChild(MTV.auto(el('span', 'mil', it.label)));
      list.appendChild(b);
    });
    card.appendChild(list);
    openModal(card, list.firstChild);
  };
  UI.prompt = function (title, ph, ok) {
    prevFocus = MTV.nav.current();
    var card = el('div', 'mcard'), inp = el('input', 'sin'), row = el('div', 'mbtns'), go;
    card.appendChild(MTV.auto(el('div', 'mt', title)));
    inp.type = 'text';
    inp.placeholder = ph || '';
    MTV.auto(inp);
    MTV.focusable(inp);
    card.appendChild(inp);
    go = chip(t('ok'), function () {
      var v = inp.value.replace(/^\s+|\s+$/g, '');
      closeModal();
      if (v) { ok(v); }
    }, true);
    row.appendChild(go);
    row.appendChild(chip(t('cancel'), closeModal));
    card.appendChild(row);
    inp.onenter = function () { MTV.nav.focus(go); };
    openModal(card, inp);
  };
  UI.pickList = function (tr) {
    var items = L.lists().map(function (l) {
      return { label: l.name, icon: 'library', fn: function () {
        UI.toast(L.addToList(l.id, tr) ? t('added') : t('saved'));
      } };
    });
    items.push({ label: t('newList'), icon: 'queue', fn: function () {
      UI.prompt(t('listName'), '', function (name) { L.createList(name, [tr]); UI.toast(t('saved')); });
    } });
    UI.modal(t('addToList'), items);
  };
  UI.songMenu = function (tr, ctx) {
    var items = [
      { label: t('playNext'), icon: 'next', fn: function () { P.playNext(tr); UI.toast(t('added')); } },
      { label: t('addQueue'), icon: 'queue', fn: function () { P.enqueue(tr); UI.toast(t('added')); } },
      { label: L.isLiked(tr.id) ? t('unlike') : t('like'), icon: 'heart', fn: function () {
        L.toggleLike(tr); updateNp(); render(true);
      } },
      { label: t('addToList'), icon: 'library', fn: function () { UI.pickList(tr); } }
    ];
    if (ctx && ctx.listId) {
      items.push({ label: t('removeFromList'), icon: 'close', fn: function () {
        L.removeFromList(ctx.listId, tr.id); render(true);
      } });
    }
    UI.modal(tr.title, items);
  };

  /* ---------------- Screens ---------------- */
  V.home = function (p, root, tok) {
    var chips = el('div', 'chips'), lang = MTV.settings.lang, r, lists, disc;
    root.appendChild(el('h1', 'vt', t('home')));
    MTV.genres.forEach(function (g) {
      chips.appendChild(chip(g[lang] || g.en, function () { UI.go('search', { q: g.q, run: true }, true); }));
    });
    root.appendChild(chips);
    if (L.recent().length) { root.appendChild(trackRow(t('recent'), L.recent()).sec); }
    if (L.liked().length) { root.appendChild(trackRow(t('liked'), L.liked()).sec); }
    lists = L.lists();
    if (lists.length) {
      var sec = el('section', 'sec'), r = makeRow();
      sec.appendChild(el('h2', 'st', t('playlists')));
      lists.forEach(function (l) {
        r.trk.appendChild(card(l.name, l.tracks.length + ' ' + t('nSongs'), l.tracks[0] ? l.tracks[0].thumb : '',
          function () { UI.go('playlist', { id: l.id }, true); }));
      });
      sec.appendChild(r.box);
      root.appendChild(sec);
    }
    disc = trackRow(t('discover'), []);
    disc.row.appendChild(msg(t('loading')));
    root.appendChild(disc.sec);
    A.search(lang === 'ar' ? 'أغاني عربية جديدة' : 'new music hits').then(function (list) {
      if (tok !== token) { return; }
      if (list.length) { fillTracks(disc.row, list); } else { MTV.empty(disc.row).appendChild(msg(t('noResults'))); }
    }, function () {
      if (tok !== token) { return; }
      MTV.empty(disc.row).appendChild(msg(t('error')));
    });
  };

  V.search = function (p, root, tok) {
    var inp = el('input', 'sin'), sug = el('div', 'chips'), res = el('div', 'res'), filt = p.filter || 'music_songs', fl = el('div', 'chips');
    root.appendChild(el('h1', 'vt', t('search')));
    inp.type = 'text';
    inp.value = p.q || '';
    inp.placeholder = t('searchPh');
    MTV.auto(inp);
    MTV.focusable(inp);
    root.appendChild(inp);
    [['music_songs', 'songs'], ['videos', 'videos']].forEach(function (x) {
      fl.appendChild(chip(t(x[1]), function () {
        p.filter = x[0];
        if (inp.value.replace(/\s/g, '')) { p.q = inp.value; p.run = true; }
        render(false);
      }, filt === x[0]));
    });
    root.appendChild(fl);
    root.appendChild(sug);
    root.appendChild(res);

    function run(q) {
      q = (q || '').replace(/^\s+|\s+$/g, '');
      if (!q) { return; }
      p.q = q;
      p.run = false;
      MTV.empty(sug);
      MTV.empty(res).appendChild(msg(t('loading')));
      A.search(q, filt).then(function (list) {
        if (tok !== token) { return; }
        MTV.empty(res);
        if (!list.length) { res.appendChild(msg(t('noResults'))); return; }
        res.appendChild(UI.songList(list));
        MTV.nav.focus(res.querySelector('[data-f]'));
      }, function () {
        if (tok !== token) { return; }
        MTV.empty(res).appendChild(msg(t('error')));
      });
    }
    inp.onenter = function () { run(inp.value); };
    inp.addEventListener('input', MTV.debounce(function () {
      var v = inp.value.replace(/^\s+|\s+$/g, '');
      if (v.length < 2) { MTV.empty(sug); return; }
      A.suggestions(v).then(function (arr) {
        if (tok !== token) { return; }
        MTV.empty(sug);
        arr.forEach(function (s) {
          sug.appendChild(chip(s, function () { inp.value = s; run(s); }));
        });
      }, function () { /* suggestions are optional */ });
    }, 350));
    if (p.run && p.q) { run(p.q); return null; }
    return inp;
  };

  function plRow(l) {
    var row = el('div', 'srow'), m = MTV.focusable(el('div', 'sr-main'), function () {
      UI.go('playlist', { id: l.id }, true);
    }), tx = el('div', 'sr-t');
    m.appendChild(MTV.thumb(l.tracks[0] ? l.tracks[0].thumb : '', 'sm'));
    tx.appendChild(MTV.auto(el('div', 't1', l.name)));
    tx.appendChild(el('div', 't2', l.tracks.length + ' ' + t('nSongs')));
    m.appendChild(tx);
    row.appendChild(m);
    return row;
  }

  V.library = function (p, root) {
    var tab = p.tab || 'liked', tabs = el('div', 'chips'), pref = null, acts, list;
    root.appendChild(el('h1', 'vt', t('library')));
    [['liked', 'liked'], ['recent', 'recent'], ['lists', 'playlists']].forEach(function (x, ix) {
      var c = chip(t(x[1]), function () { p.tab = x[0]; p.ft = ix; render(false); }, tab === x[0]);
      tabs.appendChild(c);
      if (p.ft === ix) { pref = c; }
    });
    p.ft = undefined;
    root.appendChild(tabs);
    acts = el('div', 'chips');
    if (tab === 'lists') {
      acts.appendChild(chip(t('newList'), function () {
        UI.prompt(t('listName'), '', function (name) { L.createList(name); UI.toast(t('saved')); render(false); });
      }));
      acts.appendChild(chip(t('importList'), function () {
        UI.prompt(t('importList'), t('importPh'), function (v) {
          var id = A.playlistId(v);
          if (!id) { UI.toast(t('error')); return; }
          UI.toast(t('loading'));
          A.playlist(id).then(function (r) {
            L.createList(r.name, r.tracks);
            UI.toast(t('saved'));
            if (stack.length && stack[stack.length - 1].name === 'library') { render(false); }
          }, function () { UI.toast(t('error')); });
        });
      }));
      root.appendChild(acts);
      if (!L.lists().length) { root.appendChild(msg(t('emptyLib'))); }
      L.lists().forEach(function (l) { root.appendChild(plRow(l)); });
    } else {
      list = tab === 'liked' ? L.liked() : L.recent();
      if (!list.length) { root.appendChild(msg(t('emptyLib'))); return pref; }
      acts.appendChild(chip(t('playAll'), function () { P.playList(list, 0); }));
      acts.appendChild(chip(t('shuffle'), function () { playShuffled(list); }));
      root.appendChild(acts);
      root.appendChild(UI.songList(list));
    }
    return pref;
  };

  V.playlist = function (p, root) {
    var l = L.getList(p.id), acts = el('div', 'chips');
    if (!l) { root.appendChild(msg(t('emptyLib'))); return null; }
    root.appendChild(MTV.auto(el('h1', 'vt', l.name)));
    root.appendChild(el('div', 'sub', l.tracks.length + ' ' + t('nSongs')));
    acts.appendChild(chip(t('playAll'), function () { P.playList(l.tracks, 0); }));
    acts.appendChild(chip(t('shuffle'), function () { playShuffled(l.tracks); }));
    acts.appendChild(chip(t('deleteList'), function () {
      UI.modal(t('confirmDelete'), [
        { label: t('remove'), icon: 'close', fn: function () { L.deleteList(l.id); UI.back(); } },
        { label: t('cancel') }
      ]);
    }));
    root.appendChild(acts);
    if (!l.tracks.length) { root.appendChild(msg(t('emptyLib'))); }
    root.appendChild(UI.songList(l.tracks, { listId: l.id }));
    return null;
  };

  V.settings = function (p, root) {
    var S = MTV.settings, keys = ['rose', 'amber', 'teal', 'violet'];
    root.appendChild(el('h1', 'vt', t('settings')));
    function row(label, value, fn) {
      var r = MTV.focusable(el('div', 'setrow'), fn);
      r.appendChild(MTV.auto(el('div', 'sl', label)));
      r.appendChild(MTV.auto(el('div', 'sv', value)));
      root.appendChild(r);
    }
    row(t('language'), S.lang === 'ar' ? 'العربية' : 'English', function () {
      S.lang = S.lang === 'ar' ? 'en' : 'ar';
      MTV.saveSettings();
      UI.refreshAll();
    });
    row(t('accent'), t(S.accent), function () {
      S.accent = keys[(keys.indexOf(S.accent) + 1) % keys.length];
      MTV.saveSettings();
      UI.applyAccent();
      render(true);
    });
    row(t('quality'), t(S.quality), function () {
      S.quality = S.quality === 'high' ? 'low' : 'high';
      MTV.saveSettings();
      render(true);
    });
    row(t('autoplay'), S.autoplay ? t('on') : t('off'), function () {
      S.autoplay = !S.autoplay;
      MTV.saveSettings();
      render(true);
    });
    row(t('server'), S.instance.replace(/^https?:\/\//, ''), function () {
      var items = S.instances.map(function (u) {
        return { label: u.replace(/^https?:\/\//, ''), fn: function () {
          S.instance = u; MTV.saveSettings(); UI.toast(t('saved')); render(true);
        } };
      });
      items.push({ label: t('addServer'), icon: 'queue', fn: function () {
        UI.prompt(t('addServer'), t('serverPh'), function (v) {
          v = v.replace(/\/+$/, '');
          if (!/^https?:\/\/[^\s]+$/.test(v)) { UI.toast(t('error')); return; }
          if (S.instances.indexOf(v) < 0) { S.instances.unshift(v); }
          S.instance = v;
          MTV.saveSettings();
          render(true);
        });
      } });
      UI.modal(t('server'), items);
    });
    row(t('refreshServers'), '', function () {
      UI.toast(t('loading'));
      A.refreshServers().then(function () { UI.toast(t('serversUpdated')); }, function () { UI.toast(t('error')); });
    });
    row(t('clearData'), '', function () {
      UI.modal(t('clearData'), [
        { label: t('remove'), icon: 'close', fn: function () { MTV.store.clear(); window.location.reload(); } },
        { label: t('cancel') }
      ]);
    });
    row(t('about'), 'Musify · GPL-3.0', function () {
      UI.modal(t('about'), [{ label: t('aboutText') }, { label: 'github.com/gokadzev/Musify' }, { label: t('close') }]);
    });
    return null;
  };

  /* ---------------- Mini player ---------------- */
  function buildBar() {
    var b = MTV.empty($('bar')), line = el('div', 'bline'), tx = el('div', 'btx'), ctl = el('div', 'bctl');
    B.fill = el('div', 'bfill');
    line.appendChild(B.fill);
    b.appendChild(line);
    B.main = MTV.focusable(el('div', 'bmain'), function () { if (P.cur) { UI.openNp(); } });
    B.art = MTV.thumb('', 'bart');
    B.main.appendChild(B.art);
    B.title = MTV.auto(el('div', 'bti'));
    B.artist = MTV.auto(el('div', 'bar2'));
    tx.appendChild(B.title);
    tx.appendChild(B.artist);
    B.main.appendChild(tx);
    b.appendChild(B.main);
    ctl.setAttribute('dir', 'ltr');
    B.prev = cbtn('prev', function () { P.prev(); }, 'bbtn');
    B.play = cbtn('play', function () { P.toggle(); }, 'bbtn');
    B.next = cbtn('next', function () { P.next(false); }, 'bbtn');
    ctl.appendChild(B.prev);
    ctl.appendChild(B.play);
    ctl.appendChild(B.next);
    b.appendChild(ctl);
    updateBar();
  }
  function updateBar() {
    var c = P.cur;
    B.title.textContent = c ? c.title : t('chooseSong');
    B.artist.textContent = c ? c.artist : '';
    MTV.setThumb(B.art, c ? c.thumb : '');
    setIcon(B.play, P.playing ? 'pause' : 'play');
    B.play.classList.toggle('busy', !!(P.loading && !P.playing));
  }

  /* ---------------- Now playing ---------------- */
  function buildNp() {
    var wrap = el('div', 'npw'), left = el('div', 'npl'), right = el('div', 'npr'), pb, times, ctr;
    N.art = el('div', 'nart th');
    N.title = MTV.auto(el('div', 'nti'));
    N.artist = MTV.auto(el('div', 'nar'));
    left.appendChild(N.art);
    left.appendChild(N.title);
    left.appendChild(N.artist);
    N.panel = el('div', 'npp sy');
    N.panel.setAttribute('data-pad', '80');
    pb = MTV.focusable(el('div', 'npb'), function () { P.toggle(); });
    pb.setAttribute('dir', 'ltr');
    pb.onkey = function (k) { P.seekBy(k === 37 ? -10 : 10); return true; };
    N.pf = el('div', 'npf');
    pb.appendChild(N.pf);
    times = el('div', 'npt');
    times.setAttribute('dir', 'ltr');
    N.tc = el('span', '', '0:00');
    N.td = el('span', '', '0:00');
    times.appendChild(N.tc);
    times.appendChild(N.td);
    ctr = el('div', 'npc');
    ctr.setAttribute('dir', 'ltr');
    N.prev = cbtn('prev', function () { P.prev(); });
    N.play = cbtn('play', function () { P.toggle(); }, 'cb big');
    N.next = cbtn('next', function () { P.next(false); });
    N.shuf = cbtn('shuffle', function () { P.toggleShuffle(); });
    N.rep = cbtn('repeat', function () { P.cycleRepeat(); });
    N.like = cbtn('heart', function () { UI.likeCurrent(); });
    N.lyr = cbtn('lyrics', function () { mode = 'lyrics'; renderPanel(); updateNp(); });
    N.que = cbtn('queue', function () { mode = 'queue'; renderPanel(); updateNp(); });
    [N.prev, N.play, N.next, N.shuf, N.rep, N.like, N.lyr, N.que].forEach(function (b) { ctr.appendChild(b); });
    right.appendChild(N.panel);
    right.appendChild(pb);
    right.appendChild(times);
    right.appendChild(ctr);
    wrap.appendChild(left);
    wrap.appendChild(right);
    MTV.empty(npEl).appendChild(wrap);
    updateNp();
    renderPanel();
  }
  function updateNp() {
    if (!N.title) { return; }
    var c = P.cur;
    N.title.textContent = c ? c.title : '';
    N.artist.textContent = c ? c.artist : '';
    if (N.art.getAttribute('data-u') !== (c ? c.thumb : '')) { MTV.setThumb(N.art, c ? c.thumb : ''); }
    setIcon(N.play, P.playing ? 'pause' : 'play');
    N.play.classList.toggle('busy', !!(P.loading && !P.playing));
    N.shuf.classList.toggle('act', P.shuffle);
    N.rep.classList.toggle('act', P.repeat !== 'off');
    N.rep.setAttribute('data-r', P.repeat === 'one' ? '1' : '');
    N.like.classList.toggle('act', !!(c && L.isLiked(c.id)));
    N.lyr.classList.toggle('act', mode === 'lyrics');
    N.que.classList.toggle('act', mode === 'queue');
    updateBar();
  }
  function renderPanel() {
    if (!N.panel) { return; }
    MTV.empty(N.panel);
    N.panel.scrollTop = 0;
    lyIdx = -1;
    N.lines = null;
    if (mode === 'queue') {
      N.panel.appendChild(UI.songList(P.queue, { onPlay: function (i) { P.playIndex(i); } }));
      return;
    }
    if (LY.status === 'loading') { N.panel.appendChild(msg(t('loading'))); return; }
    if (LY.status !== 'ok') { N.panel.appendChild(msg(t('noLyrics'))); return; }
    var box = el('div', 'lyr');
    if (LY.lines) {
      N.lines = LY.lines.map(function (ln) {
        var d = MTV.auto(el('div', 'll', ln.text || '♪'));
        box.appendChild(d);
        return d;
      });
    } else {
      LY.plain.split(/\r?\n/).forEach(function (s) { box.appendChild(MTV.auto(el('div', 'll on2', s || ' '))); });
    }
    N.panel.appendChild(box);
  }
  function loadLyrics() {
    var tr = P.cur, id;
    if (!tr) { return; }
    id = tr.id;
    LY = { id: id, status: 'loading', lines: null, plain: '' };
    if (mode === 'lyrics') { renderPanel(); }
    A.lyrics(tr).then(function (r) {
      if (!P.cur || P.cur.id !== id) { return; }
      LY = { id: id, status: r ? 'ok' : 'none', lines: r ? r.lines : null, plain: r ? r.plain : '' };
      if (mode === 'lyrics') { renderPanel(); }
    }, function () {
      if (!P.cur || P.cur.id !== id) { return; }
      LY = { id: id, status: 'none', lines: null, plain: '' };
      if (mode === 'lyrics') { renderPanel(); }
    });
  }
  function updateTime() {
    var d = P.duration(), c = P.audio.currentTime || 0, pct = d ? Math.min(100, c / d * 100) : 0, i, ln;
    B.fill.style.width = pct + '%';
    if (npEl.classList.contains('hide')) { return; }
    N.pf.style.width = pct + '%';
    N.tc.textContent = MTV.fmt(c);
    N.td.textContent = MTV.fmt(d);
    if (mode === 'lyrics' && N.lines && LY.lines) {
      i = -1;
      while (i + 1 < LY.lines.length && LY.lines[i + 1].t <= c + 0.3) { i++; }
      if (i !== lyIdx) {
        if (lyIdx >= 0 && N.lines[lyIdx]) { N.lines[lyIdx].classList.remove('now'); }
        lyIdx = i;
        if (i >= 0) {
          ln = N.lines[i];
          ln.classList.add('now');
          N.panel.scrollTop = ln.offsetTop - N.panel.clientHeight / 2 + ln.offsetHeight / 2;
        }
      }
    }
  }

  UI.openNp = function () {
    if (!P.cur) { return; }
    npPrev = MTV.nav.current();
    npEl.className = '';
    updateNp();
    updateTime();
    MTV.nav.focus(N.play);
  };
  function closeNp() {
    npEl.className = 'hide';
    if (npPrev && document.body.contains(npPrev)) { MTV.nav.focus(npPrev); } else { MTV.nav.focusFirst(); }
  }
  UI.toggleNp = function () {
    if (npEl.classList.contains('hide')) { UI.openNp(); } else { closeNp(); }
  };
  UI.likeCurrent = function () {
    if (!P.cur) { return; }
    UI.toast(L.toggleLike(P.cur) ? t('like') : t('unlike'));
    updateNp();
  };

  UI.back = function () {
    if (!modalEl.classList.contains('hide')) { closeModal(); return; }
    if (!npEl.classList.contains('hide')) { closeNp(); return; }
    if (stack.length > 1) { stack.pop(); render(true); return; }
    if (exitArmed) {
      try { tizen.application.getCurrentApplication().exit(); } catch (e) { /* not on a TV */ }
      return;
    }
    exitArmed = true;
    UI.toast(t('pressBackAgain'));
    setTimeout(function () { exitArmed = false; }, 2500);
  };

  UI.refreshAll = function () {
    MTV.applyLang();
    UI.applyAccent();
    buildRail();
    buildBar();
    buildNp();
    saveFocus();
    render(true);
  };

  UI.init = function () {
    MTV.applyLang();
    UI.applyAccent();
    buildRail();
    buildBar();
    buildNp();
    P.on(function (ev) {
      if (ev === 'track') { updateNp(); markPlaying(); loadLyrics(); updateTime(); }
      else if (ev === 'state') { updateNp(); }
      else if (ev === 'time') { updateTime(); }
    });
    UI.go('home', {}, false);
  };
})();
