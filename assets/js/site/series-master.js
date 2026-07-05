function numOf(li) {
  var a = li.querySelector('a');
  return a ? +a.getAttribute('data-num') : 0;
}

function reorder(card, desc, animate) {
  var ol = card.querySelector('.series-card-list');
  if (!ol) return;

  var items = [].slice.call(ol.children);
  var firsts = animate ? items.map(function (li) { return li.getBoundingClientRect().top; }) : null;
  items.sort(function (x, y) { return desc ? numOf(y) - numOf(x) : numOf(x) - numOf(y); });
  items.forEach(function (li) { ol.appendChild(li); });
  card.classList.toggle('desc', desc);

  if (!animate) return;
  items.forEach(function (li, i) {
    var dy = firsts[i] - li.getBoundingClientRect().top;
    li.style.transition = 'none';
    li.style.transform = 'translateY(' + dy + 'px)';
  });
  ol.offsetHeight;
  items.forEach(function (li) {
    li.style.transition = 'transform .4s cubic-bezier(.22, 1, .36, 1)';
    li.style.transform = '';
  });
  setTimeout(function () {
    items.forEach(function (li) {
      li.style.transition = '';
      li.style.transform = '';
    });
  }, 460);
}

function savedDesc(key) {
  try {
    return localStorage.getItem('series-order:' + key) === 'desc';
  } catch (err) {
    return false;
  }
}

export function initSeriesMaster() {
  var master = document.getElementById('series-master');
  if (!master) return;

  var names = [].slice.call(master.querySelectorAll('.series-name-item'));
  var cards = [].slice.call(master.querySelectorAll('.series-card'));
  var active = null;

  function show(key, setHash) {
    active = key;
    cards.forEach(function (c) {
      var on = c.getAttribute('data-key') === key;
      c.hidden = !on;
      if (on) reorder(c, savedDesc(key), false);
    });
    names.forEach(function (n) {
      n.classList.toggle('active', n.getAttribute('data-key') === key);
    });
    master.classList.add('is-open');
    if (setHash) history.replaceState(null, '', '#' + encodeURIComponent(key));
  }

  function hide() {
    active = null;
    master.classList.remove('is-open');
    names.forEach(function (n) { n.classList.remove('active'); });
    history.replaceState(null, '', location.pathname + location.search);
  }

  names.forEach(function (n) {
    n.addEventListener('click', function () {
      var key = n.getAttribute('data-key');
      if (active === key) hide(); else show(key, true);
    });
  });

  cards.forEach(function (c) {
    var btn = c.querySelector('.series-sort');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var key = c.getAttribute('data-key');
      var desc = !c.classList.contains('desc');
      reorder(c, desc, true);
      try {
        localStorage.setItem('series-order:' + key, desc ? 'desc' : 'asc');
      } catch (err) {}
    });
  });

  var fromHash = decodeURIComponent((location.hash || '').slice(1));
  var hit = fromHash && names.some(function (n) { return n.getAttribute('data-key') === fromHash; });
  if (hit) show(fromHash, false);
  else if (names[0]) show(names[0].getAttribute('data-key'), true);
}
