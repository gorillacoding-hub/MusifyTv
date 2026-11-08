/* Musify TV - network layer: Piped API (with automatic server failover) + LRCLIB lyrics. */
(function () {
  'use strict';
  var MTV = window.MTV;
  var A = MTV.api = {};

  function xhr(url, ms) {
    return new Promise(function (resolve, reject) {
      var x = new XMLHttpRequest();
      x.open('GET', url, true);
      x.timeout = ms || 12000;
      x.onload = function () {
        if (x.status >= 200 && x.status < 300) {
          try { resolve(JSON.parse(x.responseText)); } catch (e) { reject(new Error('bad json')); }
        } else { reject(new Error('http ' + x.status)); }
      };
      x.onerror = function () { reject(new Error('network')); };
      x.ontimeout = function () { reject(new Error('timeout')); };
      x.send();
    });
  }
  A.xhr = xhr;

  function servers() {
    var s = MTV.settings, out = [s.instance], i;
    for (i = 0; i < s.instances.length; i++) {
      if (s.instances[i] !== s.instance) { out.push(s.instances[i]); }
    }
    return out;
  }

  /* Try the selected server first, then fail over (max 4 attempts). */
  function call(path) {
    var list = servers(), i = 0, max = Math.min(list.length, 4);
    function next(err) {
      if (i >= max) { return Promise.reject(err || new Error('failed')); }
      var base = list[i++];
      return xhr(base + path).then(function (r) {
        if (base !== MTV.settings.instance) {
          MTV.settings.instance = base;
          MTV.saveSettings();
        }
        return r;
      }, next);
    }
    return next();
  }

  function videoId(u) {
    var m = /[?&]v=([\w-]{11})/.exec(u || '');
    return m ? m[1] : null;
  }
  A.videoId = videoId;

  function cleanArtist(s) {
    return (s || '').replace(/\s*-\s*Topic$/i, '').replace(/VEVO$/i, '').trim();
  }

  function norm(i) {
    var id = videoId(i.url);
    if (!id || (i.type && i.type !== 'stream')) { return null; }
    return {
      id: id,
      title: i.title || '',
      artist: cleanArtist(i.uploaderName || i.uploader || ''),
      dur: i.duration > 0 ? i.duration : 0,
      thumb: i.thumbnail || i.thumbnailUrl || ''
    };
  }

  function mapList(items) {
    var out = [], n, k;
    items = items || [];
    for (k = 0; k < items.length; k++) {
      n = norm(items[k]);
      if (n) { out.push(n); }
    }
    return out;
  }
  A.mapList = mapList;

  A.search = function (q, filter) {
    filter = filter || 'music_songs';
    return call('/search?q=' + encodeURIComponent(q) + '&filter=' + filter).then(function (r) {
      var l = mapList(r.items);
      if (!l.length && filter === 'music_songs') { return A.search(q, 'videos'); }
      return l;
    });
  };

  A.suggestions = function (q) {
    return call('/suggestions?query=' + encodeURIComponent(q)).then(function (r) {
      return Object.prototype.toString.call(r) === '[object Array]' ? r.slice(0, 6) : [];
    });
  };

  /* Returns playable audio candidates (AAC/M4A first - best supported by the TV hardware decoder). */
  A.stream = function (id) {
    return call('/streams/' + id).then(function (r) {
      var all = [], src = r.audioStreams || [], k, low = MTV.settings.quality === 'low';
      for (k = 0; k < src.length; k++) { if (src[k] && src[k].url) { all.push(src[k]); } }
      function rank(a) {
        return /mp4|m4a|aac/i.test((a.mimeType || '') + (a.format || '') + (a.codec || '')) ? 0 : 1;
      }
      all.sort(function (a, b) {
        var d = rank(a) - rank(b);
        if (d) { return d; }
        return low ? (a.bitrate || 0) - (b.bitrate || 0) : (b.bitrate || 0) - (a.bitrate || 0);
      });
      if (!all.length) { throw new Error('no audio'); }
      return { candidates: all, related: mapList(r.relatedStreams) };
    });
  };

  A.playlistId = function (s) {
    var m = /[?&]list=([\w-]+)/.exec(s || '');
    if (m) { return m[1]; }
    return /^[\w-]{10,}$/.test((s || '').trim()) ? s.trim() : null;
  };

  A.playlist = function (id) {
    return call('/playlists/' + id).then(function (r) {
      return { name: r.name || 'Playlist', tracks: mapList(r.relatedStreams).slice(0, 100) };
    });
  };

  A.refreshServers = function () {
    return xhr('https://piped-instances.kavin.rocks/', 10000).then(function (r) {
      var l = [], k, u;
      for (k = 0; k < (r || []).length; k++) {
        u = r[k] && r[k].api_url;
        if (u) { l.push(u.replace(/\/+$/, '')); }
      }
      if (l.length) { MTV.settings.instances = l; MTV.saveSettings(); }
      return l.length;
    });
  };

  /* ---- Lyrics (LRCLIB, synced when available) ---- */
  function cleanTitle(s) {
    return (s || '').replace(/\(.*?\)|\[.*?\]/g, '').replace(/\b(official|video|audio|lyrics?)\b/ig, '')
      .replace(/\s+/g, ' ').trim();
  }

  function parseLrc(s) {
    var out = [];
    String(s || '').split(/\r?\n/).forEach(function (line) {
      var re = /\[(\d+):(\d+(?:\.\d+)?)\]/g, m, times = [], last = 0;
      while ((m = re.exec(line))) {
        times.push(parseInt(m[1], 10) * 60 + parseFloat(m[2]));
        last = re.lastIndex;
      }
      var txt = line.slice(last).trim();
      times.forEach(function (tm) { out.push({ t: tm, text: txt }); });
    });
    out.sort(function (a, b) { return a.t - b.t; });
    return out;
  }
  A.parseLrc = parseLrc;

  function shape(r) {
    if (!r) { return null; }
    if (r.syncedLyrics) {
      var lines = parseLrc(r.syncedLyrics);
      if (lines.length) { return { lines: lines, plain: '' }; }
    }
    if (r.plainLyrics) { return { lines: null, plain: r.plainLyrics }; }
    return null;
  }

  A.lyrics = function (tr) {
    var title = encodeURIComponent(cleanTitle(tr.title)), artist = encodeURIComponent(cleanArtist(tr.artist));
    var base = 'https://lrclib.net/api/';
    return xhr(base + 'get?track_name=' + title + '&artist_name=' + artist + '&duration=' + (tr.dur || 0), 9000)
      .then(shape, function () {
        return xhr(base + 'search?track_name=' + title + '&artist_name=' + artist, 9000).then(function (arr) {
          var k, s;
          for (k = 0; k < (arr || []).length; k++) {
            s = shape(arr[k]);
            if (s) { return s; }
          }
          return null;
        });
      });
  };
})();
