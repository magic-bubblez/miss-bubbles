(function () {
  var KEY = 'bubbles-theme';
  var PARAM = 't';

  function readFromUrl() {
    var m = location.search.match(/[?&]t=(d|l)/);
    return m ? (m[1] === 'd' ? 'dark' : 'light') : null;
  }

  function readFromStorage() {
    try {
      var t = localStorage.getItem(KEY);
      if (t === 'dark' || t === 'light') return t;
    } catch (e) {}
    return null;
  }

  function persist(theme) {
    try { localStorage.setItem(KEY, theme); } catch (e) {}
  }

  function tagLinks(theme) {
    var tag = PARAM + '=' + (theme === 'dark' ? 'd' : 'l');
    var anchors = document.querySelectorAll('a[href]');
    for (var i = 0; i < anchors.length; i++) {
      var raw = anchors[i].getAttribute('href');
      if (!raw) continue;
      if (raw.indexOf('://') !== -1 || raw.indexOf('mailto:') === 0) continue;
      if (/\.(png|jpe?g|gif|svg|pdf)$/i.test(raw)) continue;
      var clean = raw.replace(/[?&]t=[dl]/g, '').replace(/\?$/, '');
      var sep = clean.indexOf('?') !== -1 ? '&' : '?';
      anchors[i].setAttribute('href', clean + sep + tag);
    }
  }

  var theme = readFromUrl() || readFromStorage() || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  persist(theme);

  document.addEventListener('DOMContentLoaded', function () {
    tagLinks(theme);

    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      persist(next);
      tagLinks(next);
    });
  });
})();
