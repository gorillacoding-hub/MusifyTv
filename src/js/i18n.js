/* Musify TV - translations (Arabic default, English). */
(function () {
  'use strict';
  var MTV = window.MTV;

  var D = {
    ar: {
      home: 'الرئيسية', search: 'بحث', library: 'مكتبتي', settings: 'الإعدادات',
      searchPh: 'ابحث عن أغنية أو فنان', songs: 'أغاني', videos: 'فيديوهات',
      noResults: 'لا توجد نتائج', loading: 'جارٍ التحميل…',
      error: 'تعذّر الاتصال بالخادم. جرّب خادمًا آخر من الإعدادات.',
      recent: 'استمعت مؤخرًا', liked: 'المفضلة', playlists: 'قوائم التشغيل', discover: 'اكتشف',
      playAll: 'تشغيل الكل', shuffle: 'عشوائي', newList: 'قائمة جديدة',
      importList: 'استيراد قائمة يوتيوب', importPh: 'الصق رابط القائمة', listName: 'اسم القائمة',
      ok: 'موافق', cancel: 'إلغاء', playNext: 'تشغيل التالي', addQueue: 'إضافة إلى قائمة الانتظار',
      like: 'إضافة إلى المفضلة', unlike: 'إزالة من المفضلة', addToList: 'إضافة إلى قائمة',
      removeFromList: 'إزالة من القائمة', added: 'تمت الإضافة', saved: 'تم الحفظ',
      deleteList: 'حذف القائمة', confirmDelete: 'حذف هذه القائمة؟', remove: 'حذف',
      nowPlaying: 'قيد التشغيل', lyrics: 'الكلمات', queue: 'قائمة الانتظار',
      noLyrics: 'لا توجد كلمات لهذه الأغنية', language: 'اللغة', accent: 'لون التطبيق',
      quality: 'جودة الصوت', high: 'عالية', low: 'منخفضة',
      autoplay: 'تشغيل أغانٍ مشابهة تلقائيًا', on: 'مفعّل', off: 'متوقف',
      server: 'الخادم', addServer: 'إضافة خادم', refreshServers: 'تحديث قائمة الخوادم',
      serversUpdated: 'تم تحديث قائمة الخوادم', clearData: 'مسح كل البيانات',
      about: 'حول التطبيق', pressBackAgain: 'اضغط رجوع مرة أخرى للخروج',
      emptyLib: 'لا يوجد شيء هنا بعد', playbackError: 'تعذّر تشغيل هذه الأغنية',
      nSongs: 'أغنية', chooseSong: 'اختر أغنية للتشغيل', serverPh: 'https://pipedapi.example.com',
      rose: 'وردي', amber: 'عنبري', teal: 'فيروزي', violet: 'بنفسجي', close: 'إغلاق',
      aboutText: 'منفذ لتطبيق Musify (gokadzev) على أجهزة سامسونج تايزن 4.0. رخصة GPL-3.0.'
    },
    en: {
      home: 'Home', search: 'Search', library: 'Library', settings: 'Settings',
      searchPh: 'Search for a song or artist', songs: 'Songs', videos: 'Videos',
      noResults: 'No results', loading: 'Loading…',
      error: 'Could not reach the server. Try another server in Settings.',
      recent: 'Recently played', liked: 'Liked songs', playlists: 'Playlists', discover: 'Discover',
      playAll: 'Play all', shuffle: 'Shuffle', newList: 'New playlist',
      importList: 'Import YouTube playlist', importPh: 'Paste the playlist link', listName: 'Playlist name',
      ok: 'OK', cancel: 'Cancel', playNext: 'Play next', addQueue: 'Add to queue',
      like: 'Add to liked songs', unlike: 'Remove from liked songs', addToList: 'Add to playlist',
      removeFromList: 'Remove from playlist', added: 'Added', saved: 'Saved',
      deleteList: 'Delete playlist', confirmDelete: 'Delete this playlist?', remove: 'Delete',
      nowPlaying: 'Now playing', lyrics: 'Lyrics', queue: 'Queue',
      noLyrics: 'No lyrics found for this song', language: 'Language', accent: 'Accent color',
      quality: 'Audio quality', high: 'High', low: 'Low',
      autoplay: 'Autoplay similar songs', on: 'On', off: 'Off',
      server: 'Server', addServer: 'Add server', refreshServers: 'Refresh server list',
      serversUpdated: 'Server list updated', clearData: 'Clear all data',
      about: 'About', pressBackAgain: 'Press Back again to exit',
      emptyLib: 'Nothing here yet', playbackError: 'Could not play this song',
      nSongs: 'songs', chooseSong: 'Pick a song to start', serverPh: 'https://pipedapi.example.com',
      rose: 'Rose', amber: 'Amber', teal: 'Teal', violet: 'Violet', close: 'Close',
      aboutText: 'Port of Musify (gokadzev) for Samsung Tizen 4.0 TVs. Licensed GPL-3.0.'
    }
  };

  MTV.t = function (k) {
    var l = MTV.settings.lang;
    return (D[l] && D[l][k]) || D.en[k] || k;
  };

  MTV.applyLang = function () {
    var ar = MTV.settings.lang === 'ar';
    document.documentElement.lang = ar ? 'ar' : 'en';
    document.documentElement.dir = ar ? 'rtl' : 'ltr';
  };

  MTV.genres = [
    { ar: 'بوب', en: 'Pop', q: 'pop hits' },
    { ar: 'عربي', en: 'Arabic', q: 'اغاني عربية' },
    { ar: 'هيب هوب', en: 'Hip Hop', q: 'hip hop hits' },
    { ar: 'روك', en: 'Rock', q: 'rock classics' },
    { ar: 'هادئ', en: 'Chill', q: 'chill music' },
    { ar: 'رياضة', en: 'Workout', q: 'workout music' },
    { ar: 'جاز', en: 'Jazz', q: 'jazz essentials' },
    { ar: 'كلاسيكي', en: 'Classical', q: 'classical music' },
    { ar: 'إلكترونية', en: 'Electronic', q: 'electronic music' },
    { ar: 'لوفاي', en: 'Lo-fi', q: 'lofi beats' }
  ];
})();
