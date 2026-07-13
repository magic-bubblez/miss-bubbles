(function () {
  if (!window.fetch || !window.DOMParser || !history.pushState) return;

  var cache = {};
  var parser = new DOMParser();
  var swappedBody = false;
  var routeSelector = 'style, link[rel="stylesheet"], link[rel="preconnect"]';

  function currentTheme() {
    var fromUrl = location.search.match(/[?&]t=(d|l)/);
    if (fromUrl) return fromUrl[1] === 'd' ? 'dark' : 'light';

    try {
      var stored = localStorage.getItem('bubbles-theme');
      if (stored === 'dark' || stored === 'light') return stored;
    } catch (e) {}

    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  function persistTheme(theme) {
    try {
      localStorage.setItem('bubbles-theme', theme);
    } catch (e) {}
  }

  function tagLinks(theme) {
    var tag = 't=' + (theme === 'dark' ? 'd' : 'l');
    var anchors = document.querySelectorAll('a[href]');

    for (var i = 0; i < anchors.length; i++) {
      var raw = anchors[i].getAttribute('href');
      if (!raw) continue;
      if (raw.indexOf('://') !== -1 || raw.indexOf('mailto:') === 0) continue;
      if (/\.(png|jpe?g|gif|svg|webp|pdf)$/i.test(raw)) continue;

      var clean = raw.replace(/[?&]t=[dl]/g, '').replace(/\?$/, '');
      var sep = clean.indexOf('?') !== -1 ? '&' : '?';
      anchors[i].setAttribute('href', clean + sep + tag);
    }
  }

  function markRouteHead() {
    var nodes = document.head.querySelectorAll(routeSelector);
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].setAttribute('data-smooth-nav-route', '');
    }
  }

  function syncHead(nextDoc) {
    var oldNodes = document.head.querySelectorAll('[data-smooth-nav-route]');
    for (var i = 0; i < oldNodes.length; i++) oldNodes[i].remove();

    var newNodes = nextDoc.head.querySelectorAll(routeSelector);
    for (var j = 0; j < newNodes.length; j++) {
      var clone = newNodes[j].cloneNode(true);
      clone.setAttribute('data-smooth-nav-route', '');
      document.head.appendChild(clone);
    }

    document.title = nextDoc.title;
  }

  function syncBody(nextDoc) {
    while (document.body.attributes.length) {
      document.body.removeAttribute(document.body.attributes[0].name);
    }

    for (var i = 0; i < nextDoc.body.attributes.length; i++) {
      var attr = nextDoc.body.attributes[i];
      document.body.setAttribute(attr.name, attr.value);
    }

    document.body.innerHTML = nextDoc.body.innerHTML;
  }

  function eligibleLink(anchor) {
    if (!anchor || anchor.target || anchor.hasAttribute('download')) return null;

    var href = anchor.getAttribute('href');
    if (!href || href.indexOf('#') === 0) return null;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return null;
    if (/\.(png|jpe?g|gif|svg|webp|pdf|zip)$/i.test(href)) return null;

    var url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin) return null;
    if (url.pathname === location.pathname && url.search === location.search) return null;

    return url.href;
  }

  function loadPage(url) {
    if (!cache[url]) {
      cache[url] = fetch(url, { credentials: 'same-origin' })
        .then(function (response) {
          if (!response.ok) throw new Error('Navigation request failed');
          return response.text();
        })
        .then(function (html) {
          return parser.parseFromString(html, 'text/html');
        });
    }

    return cache[url];
  }

  function swapTo(url, push) {
    return loadPage(url)
      .then(function (nextDoc) {
        var theme = currentTheme();
        if (push) history.pushState(null, '', url);

        document.documentElement.setAttribute('data-theme', theme);
        persistTheme(theme);
        syncHead(nextDoc);
        syncBody(nextDoc);
        swappedBody = true;
        tagLinks(theme);
        scrollTo(0, 0);
      })
      .catch(function () {
        location.href = url;
      });
  }

  markRouteHead();

  document.addEventListener('click', function (event) {
    var toggle = event.target.closest && event.target.closest('.theme-toggle');
    if (toggle && swappedBody) {
      event.preventDefault();
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      persistTheme(next);
      tagLinks(next);
      return;
    }

    var anchor = event.target.closest && event.target.closest('a[href]');
    var url = eligibleLink(anchor);
    if (!url || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    swapTo(url, true);
  });

  document.addEventListener('mouseover', function (event) {
    var anchor = event.target.closest && event.target.closest('a[href]');
    var url = eligibleLink(anchor);
    if (url) loadPage(url);
  });

  window.addEventListener('popstate', function () {
    swapTo(location.href, false);
  });
})();
