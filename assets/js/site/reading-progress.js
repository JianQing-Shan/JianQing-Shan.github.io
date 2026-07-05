export function initReadingProgress() {
  var path = location.pathname;
  var isArticle = path.indexOf('/posts/') === 0 && !!document.querySelector('.post-single');
  var isDeepTerm = (path.indexOf('/tags/') === 0 && path !== '/tags/') || (path.indexOf('/series/') === 0 && path !== '/series/');
  var isUtilityPage = path === '/search/' || path === '/archives/';
  if (!isArticle && !isDeepTerm && !isUtilityPage) return;
  if (document.getElementById('reading-progress')) return;

  var bar = document.createElement('div');
  bar.id = 'reading-progress';
  document.body.appendChild(bar);

  function update() {
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
    bar.style.width = (pct < 0 ? 0 : pct > 100 ? 100 : pct) + '%';
  }

  var ticking = false;
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        update();
      });
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}
