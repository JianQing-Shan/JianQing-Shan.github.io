import { getNavContext, getNavFrom, setNavAnchor } from './nav-context.js';

function currentPageKind() {
  var path = location.pathname;
  var single = document.querySelector('.post-single');
  return {
    isArticle: path.indexOf('/posts/') === 0 && !!single,
    isTagTerm: path.indexOf('/tags/') === 0 && path !== '/tags/',
    isSeriesTerm: path.indexOf('/series/') === 0 && path !== '/series/'
  };
}

function contextNav(pathname) {
  var prev = null;
  var next = null;
  var matched = false;
  var ctx = getNavContext();

  if (ctx && ctx.length) {
    ctx.forEach(function (o) {
      if (o && o.t) o.t = o.t.replace(/^post link to\s*/i, '');
    });
    for (var i = 0; i < ctx.length; i++) {
      if (ctx[i].u === pathname) {
        matched = true;
        prev = i > 0 ? ctx[i - 1] : null;
        next = i < ctx.length - 1 ? ctx[i + 1] : null;
        break;
      }
    }
  }

  return { prev: prev, next: next, matched: matched };
}

function fallbackNav(paginav) {
  if (!paginav) return { prev: null, next: null };
  var pp = paginav.querySelector('.prev');
  var nn = paginav.querySelector('.next');
  return {
    prev: pp ? { u: pp.getAttribute('href'), t: '' } : null,
    next: nn ? { u: nn.getAttribute('href'), t: '' } : null
  };
}

function addBackButton(kind, matched) {
  if (!kind.isArticle && !kind.isTagTerm && !kind.isSeriesTerm) return;

  document.body.classList.add('has-post-back');
  var logo = document.querySelector('.header-nav .logo');
  if (!logo) return;

  var fallback = kind.isTagTerm ? '/tags/' : kind.isSeriesTerm ? '/series/' : '/posts/';
  var goBack = function (e) {
    e.preventDefault();
    if (kind.isArticle) {
      setNavAnchor(location.pathname);
      var navFrom = getNavFrom();
      if (matched && navFrom) {
        location.href = navFrom;
        return;
      }
      var sm = document.querySelector('meta[name="series"]');
      location.href = (sm && sm.content) ? '/series/#' + encodeURIComponent(sm.content) : '/posts/';
      return;
    }
    location.href = fallback;
  };

  var logoLink = logo.querySelector('a');
  var back = document.createElement('a');
  back.id = 'post-back';
  back.href = fallback;
  back.setAttribute('aria-label', '返回');
  back.setAttribute('title', '返回');
  back.innerHTML = '❮';
  back.addEventListener('click', goBack);
  logo.insertBefore(back, logo.firstChild);
  if (logoLink) logoLink.addEventListener('click', goBack);
}

function addTopNav(prev, next) {
  var meta = document.querySelector('.post-meta');
  if (!meta) return;

  if (prev) {
    var ap = document.createElement('a');
    ap.className = 'post-nav-arrow prev';
    ap.href = prev.u;
    ap.title = prev.t || '上一篇';
    ap.setAttribute('aria-label', '上一篇');
    ap.innerHTML = '<span class="pn-g">❮</span><span>PREV</span>';
    meta.insertBefore(ap, meta.firstChild);
  }

  if (next) {
    var an = document.createElement('a');
    an.className = 'post-nav-arrow next';
    an.href = next.u;
    an.title = next.t || '下一篇';
    an.setAttribute('aria-label', '下一篇');
    an.innerHTML = '<span>NEXT</span><span class="pn-g">❯</span>';
    meta.appendChild(an);
  }
}

function syncBottomNav(paginav, prev, next, matched) {
  if (!paginav) return;

  var setSide = function (cls, item, label) {
    var el = paginav.querySelector('.' + cls);
    if (matched) {
      if (!item) {
        if (el) el.remove();
        return;
      }
      if (!el) {
        el = document.createElement('a');
        el.className = cls;
        el.innerHTML = '<span class="title"></span><span></span>';
        (cls === 'prev') ? paginav.insertBefore(el, paginav.firstChild) : paginav.appendChild(el);
      }
      el.setAttribute('href', item.u);
      el.querySelector('span:not(.title)').textContent = item.t;
    }
    if (el) {
      var ti = el.querySelector('.title');
      if (ti) ti.textContent = label;
    }
  };

  setSide('prev', prev, 'PREV');
  setSide('next', next, 'NEXT');
}

export function initArticleNav() {
  var kind = currentPageKind();
  var nav = contextNav(location.pathname);
  var paginav = document.querySelector('.paginav');

  if (kind.isArticle && !nav.matched) {
    var fallback = fallbackNav(paginav);
    nav.prev = fallback.prev;
    nav.next = fallback.next;
  }

  addBackButton(kind, nav.matched);

  if (!kind.isArticle) return;
  addTopNav(nav.prev, nav.next);
  syncBottomNav(paginav, nav.prev, nav.next, nav.matched);
}
