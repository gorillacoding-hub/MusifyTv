#!/usr/bin/env node
/* Logic tests for the non-DOM modules (api / lib / store) with a mocked network. */
'use strict';
var assert = require('assert'), path = require('path');
global.window = global;
var mem = {};
global.localStorage = {
  getItem: function (k) { return mem.hasOwnProperty(k) ? mem[k] : null; },
  setItem: function (k, v) { mem[k] = String(v); },
  removeItem: function (k) { delete mem[k]; },
  key: function (i) { return Object.keys(mem)[i]; },
  get length() { return Object.keys(mem).length; }
};

var routes = {};          /* url -> {status, body} | 'net' */
var hits = [];
global.XMLHttpRequest = function () {
  var x = this;
  x.open = function (m, u) { x.url = u; };
  x.send = function () {
    setTimeout(function () {
      hits.push(x.url);
      var r = routes[x.url];
      if (!r || r === 'net') { return x.onerror(); }
      x.status = r.status;
      x.responseText = JSON.stringify(r.body);
      x.onload();
    }, 0);
  };
};

['util', 'store', 'i18n', 'api', 'lib'].forEach(function (f) { require(path.join('..', 'src', 'js', f + '.js')); });
var MTV = global.MTV, A = MTV.api;
var s0 = MTV.settings.instances[0], s1 = MTV.settings.instances[1];

function item(id, title) {
  return { url: '/watch?v=' + id, title: title, uploaderName: 'Artist - Topic', duration: 200, thumbnail: 'http://x/t.jpg', type: 'stream' };
}

(async function () {
  /* video id + playlist id parsing */
  assert.strictEqual(A.videoId('/watch?v=dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.strictEqual(A.playlistId('https://www.youtube.com/playlist?list=PLabc123_-xyz'), 'PLabc123_-xyz');
  assert.strictEqual(A.playlistId('hello'), null);

  /* LRC parsing incl. multi-timestamp lines, sorted */
  var lrc = A.parseLrc('[00:12.50]Second\n[00:01.00][00:30.00]First and repeat\n[ar:x]');
  assert.deepStrictEqual(lrc.map(function (l) { return l.t; }), [1, 12.5, 30]);
  assert.strictEqual(lrc[0].text, 'First and repeat');

  /* search: failover from a dead first server to the second, selected server is remembered */
  routes[s0 + '/search?q=hi&filter=music_songs'] = 'net';
  routes[s1 + '/search?q=hi&filter=music_songs'] = { status: 200, body: { items: [item('AAAAAAAAAAA', 'One'), { url: '/channel/x', type: 'channel' }] } };
  var list = await A.search('hi');
  assert.strictEqual(list.length, 1);
  assert.strictEqual(list[0].artist, 'Artist');
  assert.strictEqual(MTV.settings.instance, s1);

  /* empty songs result falls back to the "videos" filter */
  routes[s1 + '/search?q=zz&filter=music_songs'] = { status: 200, body: { items: [] } };
  routes[s1 + '/search?q=zz&filter=videos'] = { status: 200, body: { items: [item('BBBBBBBBBBB', 'Two')] } };
  assert.strictEqual((await A.search('zz')).length, 1);

  /* stream ranking: AAC first, highest bitrate first (quality=high), lowest when quality=low */
  routes[s1 + '/streams/CCCCCCCCCCC'] = { status: 200, body: { audioStreams: [
    { url: 'u-opus', mimeType: 'audio/webm', bitrate: 160000 },
    { url: 'u-aac48', mimeType: 'audio/mp4', bitrate: 48000 },
    { url: 'u-aac128', mimeType: 'audio/mp4', bitrate: 128000 }
  ], relatedStreams: [item('DDDDDDDDDDD', 'Rel')] } };
  var st = await A.stream('CCCCCCCCCCC');
  assert.deepStrictEqual(st.candidates.map(function (c) { return c.url; }), ['u-aac128', 'u-aac48', 'u-opus']);
  assert.strictEqual(st.related.length, 1);
  MTV.settings.quality = 'low';
  st = await A.stream('CCCCCCCCCCC');
  assert.strictEqual(st.candidates[0].url, 'u-aac48');

  /* all servers down -> rejects after at most 4 attempts */
  hits = [];
  MTV.settings.instance = s0;
  var failed = false;
  try { await A.search('dead'); } catch (e) { failed = true; }
  assert.ok(failed);
  assert.ok(hits.length <= 4, 'max 4 attempts, got ' + hits.length);

  /* library */
  var L = MTV.lib, tr = { id: 'AAAAAAAAAAA', title: 'One', artist: 'A', dur: 1, thumb: '' };
  assert.strictEqual(L.toggleLike(tr), true);
  assert.strictEqual(L.isLiked(tr.id), true);
  assert.strictEqual(L.toggleLike(tr), false);
  var pl = L.createList('Mine', [tr]);
  assert.strictEqual(L.addToList(pl.id, tr), false, 'no duplicates');
  assert.strictEqual(L.addToList(pl.id, { id: 'BBBBBBBBBBB', title: 'b' }), true);
  L.removeFromList(pl.id, 'AAAAAAAAAAA');
  assert.strictEqual(L.getList(pl.id).tracks.length, 1);
  L.deleteList(pl.id);
  assert.strictEqual(L.lists().length, 0);
  for (var i = 0; i < 60; i++) { L.addRecent({ id: 'id' + i, title: 't' }); }
  assert.strictEqual(L.recent().length, 40);

  console.log('OK - smoke tests passed');
})().catch(function (e) { console.error(e); process.exit(1); });
