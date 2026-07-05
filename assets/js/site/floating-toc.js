export function initFloatingToc() {
  var content = document.querySelector('.post-content');
  if (!content) return;

  var heads = [].slice.call(content.querySelectorAll('h1[id], h2[id], h3[id], h4[id]'));
  if (heads.length < 2) return;

  var nav = document.createElement('nav');
  nav.id = 'floating-toc';
  nav.setAttribute('aria-label', '目录');

  var rail = document.createElement('div');
  rail.className = 'ftoc-rail';
  var panel = document.createElement('div');
  panel.className = 'ftoc-panel';

  var rows = heads.map(function (h, idx) {
    var lvl = h.tagName.charAt(1);
    var dash = document.createElement('span');
    dash.className = 'ftoc-dash';
    dash.setAttribute('data-level', lvl);

    var item = document.createElement('a');
    item.className = 'ftoc-item';
    item.href = '#' + h.id;
    item.setAttribute('data-level', lvl);
    item.textContent = (h.textContent || '').replace(/#\s*$/, '').trim();
    item.style.setProperty('--i', idx);

    rail.appendChild(dash);
    panel.appendChild(item);
    return { dash: dash, item: item, head: h };
  });

  nav.appendChild(rail);
  nav.appendChild(panel);
  document.body.appendChild(nav);

  function update() {
    var pos = window.scrollY + window.innerHeight * 0.25;
    var cur = 0;
    for (var i = 0; i < rows.length; i++) {
      var top = rows[i].head.getBoundingClientRect().top + window.scrollY;
      if (top - 4 <= pos) cur = i; else break;
    }
    for (var j = 0; j < rows.length; j++) {
      var on = j === cur;
      rows[j].dash.classList.toggle('active', on);
      rows[j].item.classList.toggle('active', on);
    }
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
