function fromList(sel) {
  return [].map.call(document.querySelectorAll(sel), function (a) {
    return { u: a.pathname, t: (a.getAttribute('aria-label') || a.textContent || '').trim() };
  });
}

function ctxOf(link) {
  var card = link.closest && link.closest('.series-card-list');
  if (card) {
    return [].map.call(card.querySelectorAll('li > a'), function (a) {
      return { u: a.pathname, t: (a.textContent || '').trim() };
    });
  }
  if (link.closest('.searchResults')) return fromList('.searchResults li .entry-link');
  if (link.closest('.archive-entry')) return fromList('.archive-entry .entry-link');
  if (link.closest('.post-entry, .first-entry')) return fromList('.first-entry .entry-link, .post-entry .entry-link');
  return null;
}

export function getNavContext() {
  try {
    return JSON.parse(sessionStorage.getItem('nav-ctx') || 'null');
  } catch (err) {
    return null;
  }
}

export function getNavFrom() {
  try {
    return sessionStorage.getItem('nav-from');
  } catch (err) {
    return null;
  }
}

export function setNavAnchor(pathname) {
  try {
    sessionStorage.setItem('nav-anchor', pathname);
  } catch (err) {}
}

export function restoreNavAnchor() {
  var anchor;
  try {
    anchor = sessionStorage.getItem('nav-anchor');
  } catch (err) {
    return;
  }
  if (!anchor) return;
  try {
    sessionStorage.removeItem('nav-anchor');
  } catch (err) {}

  var links = document.querySelectorAll('.entry-link, .series-card-list a');
  for (var i = 0; i < links.length; i++) {
    if (links[i].pathname === anchor) {
      var row = links[i].closest('.post-entry, .first-entry, .archive-entry, .series-card-list li') || links[i];
      row.scrollIntoView({ block: 'center' });
      row.classList.add('nav-return-flash');
      setTimeout(function () { row.classList.remove('nav-return-flash'); }, 1000);
      break;
    }
  }
}

export function initNavContext() {
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a && e.target.closest) {
      var row = e.target.closest('.post-entry, .first-entry, .archive-entry, .searchResults li, .series-card-list li');
      if (row) a = row.querySelector('a.entry-link, a[href]');
    }
    if (!a) return;
    if (a.id === 'post-back' || a.closest('.post-nav-arrow') || a.closest('.paginav')) return;

    var list = ctxOf(a);
    if (list && list.length) {
      try {
        sessionStorage.setItem('nav-ctx', JSON.stringify(list));
        sessionStorage.setItem('nav-from', location.pathname + location.search + location.hash);
      } catch (err) {}
    }
  }, true);
}
