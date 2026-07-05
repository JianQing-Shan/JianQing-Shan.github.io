export function initSearchState() {
  if (location.pathname.indexOf('/search') !== 0) return;

  var sinp = document.getElementById('searchInput');
  var sres = document.getElementById('searchResults');
  if (!sinp || !sres) return;

  sinp.addEventListener('input', function () {
    var v = sinp.value.trim();
    history.replaceState(null, '', v ? (location.pathname + '?query=' + encodeURIComponent(v)) : location.pathname);
  });

  sres.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('a.entry-link')) {
      try {
        sessionStorage.setItem('search-cache', JSON.stringify({ q: sinp.value, html: sres.innerHTML }));
      } catch (err) {}
    }
  }, true);

  var q = new URLSearchParams(location.search).get('query');
  if (!q) return;

  sinp.value = q;
  var cache = null;
  try {
    cache = JSON.parse(sessionStorage.getItem('search-cache') || 'null');
  } catch (err) {}

  if (cache && cache.q === q && cache.html) {
    sres.innerHTML = cache.html;
    return;
  }

  var tries = 0;
  var timer = setInterval(function () {
    sinp.dispatchEvent(new Event('input', { bubbles: true }));
    if (sres.children.length || ++tries > 12) clearInterval(timer);
  }, 250);
}
