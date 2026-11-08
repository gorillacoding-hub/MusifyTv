/* Musify TV - playback engine (HTML5 audio, queue, shuffle/repeat, related-songs autoplay). */
(function () {
  'use strict';
  var MTV = window.MTV;
  var a = new Audio();
  a.preload = 'auto';

  var P = MTV.player = {
    audio: a, queue: [], index: -1, cur: null, related: [],
    shuffle: false, repeat: 'off', playing: false, loading: false
  };
  var listeners = [], hist = [], errCount = 0, token = 0;

  function emit(ev) {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](ev, P); } catch (e) { /* UI errors must never stop playback */ }
    }
  }
  P.on = function (fn) { listeners.push(fn); };

  P.duration = function () {
    var d = a.duration;
    return (isFinite(d) && d > 0) ? d : ((P.cur && P.cur.dur) || 0);
  };

  function playNow() {
    var pr = a.play();
    if (pr && pr.catch) { pr.catch(function () { /* autoplay policy / interrupted */ }); }
  }

  function tryCandidate(list, n, my) {
    if (my !== token) { return; }
    if (n >= list.length) { return fail(my); }
    a._cand = list;
    a._n = n;
    a.src = list[n].url;
    a.load();
    playNow();
  }

  function fail(my) {
    if (my !== token) { return; }
    P.loading = false;
    P.playing = false;
    errCount++;
    if (MTV.ui) { MTV.ui.toast(MTV.t('playbackError')); }
    emit('state');
    if (errCount < 3 && P.index < P.queue.length - 1) { P.next(false, true); }
  }

  P.playIndex = function (i) {
    if (i < 0 || i >= P.queue.length) { return; }
    var my = ++token, t;
    P.index = i;
    P.cur = t = P.queue[i];
    P.loading = true;
    P.playing = false;
    a.pause();
    MTV.lib.addRecent(t);
    emit('track');
    MTV.api.stream(t.id).then(function (info) {
      if (my !== token) { return; }
      P.related = info.related;
      tryCandidate(info.candidates, 0, my);
    }, function () { fail(my); });
  };

  P.playList = function (list, i) {
    P.queue = list.slice();
    hist = [];
    errCount = 0;
    P.playIndex(i || 0);
  };

  function go(i) { hist.push(P.index); P.playIndex(i); }

  P.next = function (auto, skipRepeatOne) {
    var n = P.queue.length;
    if (!n) { return; }
    if (auto && P.repeat === 'one' && !skipRepeatOne) { a.currentTime = 0; playNow(); return; }
    if (P.shuffle && n > 1) {
      var r;
      do { r = Math.floor(Math.random() * n); } while (r === P.index);
      return go(r);
    }
    if (P.index < n - 1) { return go(P.index + 1); }
    if (P.repeat === 'all') { return go(0); }
    if (auto && MTV.settings.autoplay && P.related.length) {
      var ids = {}, add = [], k;
      for (k = 0; k < n; k++) { ids[P.queue[k].id] = 1; }
      for (k = 0; k < P.related.length && add.length < 10; k++) {
        if (!ids[P.related[k].id]) { add.push(P.related[k]); }
      }
      if (add.length) { P.queue = P.queue.concat(add); return go(P.index + 1); }
    }
    if (auto) { a.pause(); P.playing = false; emit('state'); }
  };

  P.prev = function () {
    if (a.currentTime > 4 || !hist.length) { a.currentTime = 0; return; }
    P.playIndex(hist.pop());
  };

  P.toggle = function () {
    if (!P.cur) { return; }
    if (a.paused) { playNow(); } else { a.pause(); }
  };
  P.pause = function () { a.pause(); };
  P.play = function () { if (P.cur) { playNow(); } };

  P.seekBy = function (sec) {
    if (!P.cur) { return; }
    var d = P.duration() || 0;
    a.currentTime = Math.max(0, Math.min(Math.max(0, d - 1), (a.currentTime || 0) + sec));
  };

  P.enqueue = function (t) {
    P.queue.push(t);
    if (P.index < 0) { P.playIndex(P.queue.length - 1); }
  };
  P.playNext = function (t) {
    if (P.index < 0) { return P.enqueue(t); }
    P.queue.splice(P.index + 1, 0, t);
  };
  P.toggleShuffle = function () { P.shuffle = !P.shuffle; emit('state'); };
  P.cycleRepeat = function () {
    P.repeat = P.repeat === 'off' ? 'all' : (P.repeat === 'all' ? 'one' : 'off');
    emit('state');
  };

  a.addEventListener('playing', function () {
    P.loading = false; P.playing = true; errCount = 0; emit('state');
  });
  a.addEventListener('pause', function () {
    if (!a.ended) { P.playing = false; emit('state'); }
  });
  a.addEventListener('waiting', function () { P.loading = true; emit('state'); });
  a.addEventListener('canplay', function () { P.loading = false; emit('state'); });
  a.addEventListener('timeupdate', function () { emit('time'); });
  a.addEventListener('ended', function () { P.next(true); });
  a.addEventListener('error', function () {
    if (!a._cand) { return; }
    tryCandidate(a._cand, a._n + 1, token);
  });
})();
