/* Musify TV - persistent storage (localStorage) + settings. */
(function () {
  'use strict';
  var MTV = window.MTV, PFX = 'mtv.';

  MTV.store = {
    get: function (k, d) {
      try {
        var v = localStorage.getItem(PFX + k);
        return v === null ? d : JSON.parse(v);
      } catch (e) { return d; }
    },
    set: function (k, v) {
      try { localStorage.setItem(PFX + k, JSON.stringify(v)); } catch (e) { /* quota / disabled */ }
    },
    clear: function () {
      try {
        var ks = [], i, k;
        for (i = 0; i < localStorage.length; i++) {
          k = localStorage.key(i);
          if (k && k.indexOf(PFX) === 0) { ks.push(k); }
        }
        for (i = 0; i < ks.length; i++) { localStorage.removeItem(ks[i]); }
      } catch (e) { /* ignore */ }
    }
  };

  /* Public Piped API instances (from the official TeamPiped documentation). */
  var INSTANCES = [
    'https://pipedapi.kavin.rocks',
    'https://pipedapi.leptons.xyz',
    'https://pipedapi.nosebs.ru',
    'https://pipedapi-libre.kavin.rocks',
    'https://piped-api.privacy.com.de',
    'https://pipedapi.adminforge.de',
    'https://api.piped.yt',
    'https://pipedapi.drgns.space',
    'https://pipedapi.owo.si',
    'https://pipedapi.ducks.party',
    'https://piped-api.codespace.cz',
    'https://pipedapi.reallyaweso.me',
    'https://api.piped.private.coffee',
    'https://pipedapi.darkness.services',
    'https://pipedapi.orangenet.cc'
  ];

  var DEF = {
    lang: 'ar', accent: 'rose', quality: 'high', autoplay: true,
    instance: INSTANCES[0], instances: INSTANCES
  };
  var s = MTV.store.get('settings', {}), k;
  for (k in DEF) {
    if (DEF.hasOwnProperty(k) && !s.hasOwnProperty(k)) { s[k] = DEF[k]; }
  }
  MTV.settings = s;
  MTV.defaultInstances = INSTANCES;
  MTV.saveSettings = function () { MTV.store.set('settings', MTV.settings); };
})();
