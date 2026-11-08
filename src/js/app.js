/* Musify TV - boot. */
(function () {
  'use strict';
  var MTV = window.MTV, P = MTV.player;

  /* Make the remote's media and colour keys reach the page (Tizen TV only). */
  try {
    var keys = ['MediaPlay', 'MediaPause', 'MediaPlayPause', 'MediaStop', 'MediaFastForward',
      'MediaRewind', 'MediaTrackPrevious', 'MediaTrackNext', 'ColorF0Red', 'ColorF1Green'];
    for (var i = 0; i < keys.length; i++) {
      try { tizen.tvinputdevice.registerKey(keys[i]); } catch (e) { /* key not available on this remote */ }
    }
  } catch (e2) { /* not running on a TV */ }

  MTV.nav.onExtra = function (k) {
    switch (k) {
      case 415: P.play(); return true;                 /* Play */
      case 19: P.pause(); return true;                 /* Pause */
      case 10252: case 179: P.toggle(); return true;   /* Play/Pause */
      case 413: P.pause(); return true;                /* Stop */
      case 417: P.seekBy(10); return true;             /* Fast-forward */
      case 412: P.seekBy(-10); return true;            /* Rewind */
      case 10232: case 177: P.prev(); return true;     /* Previous */
      case 10233: case 176: P.next(false); return true;/* Next */
      case 403: MTV.ui.likeCurrent(); return true;     /* Red: like */
      case 404: MTV.ui.toggleNp(); return true;        /* Green: now playing */
      default: return false;
    }
  };

  MTV.ui.init();
})();
