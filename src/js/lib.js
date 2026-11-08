/* Musify TV - local library: liked songs, history, playlists. */
(function () {
  'use strict';
  var MTV = window.MTV, S = MTV.store;
  var liked = S.get('liked', []), recent = S.get('recent', []), lists = S.get('lists', []);

  function slim(t) { return { id: t.id, title: t.title, artist: t.artist, dur: t.dur, thumb: t.thumb }; }
  function idx(a, id) {
    for (var i = 0; i < a.length; i++) { if (a[i].id === id) { return i; } }
    return -1;
  }

  var L = MTV.lib = {
    liked: function () { return liked; },
    isLiked: function (id) { return idx(liked, id) >= 0; },
    toggleLike: function (t) {
      var i = idx(liked, t.id);
      if (i >= 0) { liked.splice(i, 1); S.set('liked', liked); return false; }
      liked.unshift(slim(t));
      S.set('liked', liked);
      return true;
    },
    recent: function () { return recent; },
    addRecent: function (t) {
      var i = idx(recent, t.id);
      if (i >= 0) { recent.splice(i, 1); }
      recent.unshift(slim(t));
      if (recent.length > 40) { recent.length = 40; }
      S.set('recent', recent);
    },
    lists: function () { return lists; },
    getList: function (id) {
      for (var i = 0; i < lists.length; i++) { if (lists[i].id === id) { return lists[i]; } }
      return null;
    },
    createList: function (name, tracks) {
      var l = { id: 'p' + new Date().getTime(), name: name, tracks: (tracks || []).map(slim) };
      lists.push(l);
      S.set('lists', lists);
      return l;
    },
    addToList: function (pid, t) {
      var l = L.getList(pid);
      if (!l || idx(l.tracks, t.id) >= 0) { return false; }
      l.tracks.push(slim(t));
      S.set('lists', lists);
      return true;
    },
    removeFromList: function (pid, tid) {
      var l = L.getList(pid), i;
      if (!l) { return; }
      i = idx(l.tracks, tid);
      if (i >= 0) { l.tracks.splice(i, 1); S.set('lists', lists); }
    },
    deleteList: function (pid) {
      for (var i = 0; i < lists.length; i++) {
        if (lists[i].id === pid) { lists.splice(i, 1); break; }
      }
      S.set('lists', lists);
    }
  };
})();
