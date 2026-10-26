// Catalogue page: filters, product cards, photo viewer, quote tray.
(function () {
  var P = window.GMI_PRODUCTS, USES = window.GMI_USES, fmt = window.GMI_fmtDims;
  var grid = document.getElementById('grid');
  var countEl = document.getElementById('count');
  var tray = document.getElementById('tray');
  var trayN = document.getElementById('tray-n');
  var params = new URLSearchParams(location.search);
  var filter = { use: USES[params.get('use')] ? params.get('use') : 'all', shape: params.get('shape') === 'round' || params.get('shape') === 'rect' ? params.get('shape') : 'all' };

  function img(p, v, size) { return 'img/p/' + (size || 'sm') + '/' + p.img + '.' + v + '.jpg'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ── Cards ──
  grid.innerHTML = P.map(function (p) {
    var on = GMI.quote.has(p.id);
    return '<article class="card" data-id="' + p.id + '" data-use="' + p.use + '" data-shape="' + p.shape + '">' +
      '<button class="card-img" type="button" data-open aria-label="View photos of ' + esc(p.name) + '">' +
        '<img src="' + img(p, 1) + '" alt="' + esc(p.name) + '" loading="lazy" width="540" height="720">' +
        '<img src="' + img(p, 2) + '" alt="" loading="lazy" width="540" height="720">' +
        '<span class="card-code">' + p.id.toUpperCase() + '</span>' +
        '<span class="card-tag">' + USES[p.use].short + '</span>' +
      '</button>' +
      '<div class="card-body">' +
        '<h3>' + esc(p.name) + '</h3>' +
        '<p class="card-dims">' + fmt(p) + '</p>' +
        (p.fill ? '<p class="card-fill">Holds ' + p.fill + '</p>' : '') +
        '<div class="card-actions"><button class="add" type="button" data-add aria-pressed="' + on + '">' + (on ? 'In quote list ✓' : 'Add to quote') + '</button></div>' +
      '</div>' +
    '</article>';
  }).join('') + '<p class="empty" id="empty" hidden>No tins match both filters. Try “Any shape”, or <a href="contact.html">ask us for a custom size</a>.</p>';

  // ── Filters ──
  function applyFilter() {
    var shown = 0;
    grid.querySelectorAll('.card').forEach(function (c) {
      var ok = (filter.use === 'all' || c.dataset.use === filter.use) && (filter.shape === 'all' || c.dataset.shape === filter.shape);
      c.hidden = !ok; if (ok) shown++;
    });
    document.getElementById('empty').hidden = shown > 0;
    countEl.textContent = shown + ' of ' + P.length + ' tins';
    document.querySelectorAll('[data-f]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(filter[b.dataset.f] === b.dataset.v));
    });
    var q = new URLSearchParams();
    if (filter.use !== 'all') q.set('use', filter.use);
    if (filter.shape !== 'all') q.set('shape', filter.shape);
    history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : ''));
  }
  document.querySelectorAll('[data-f]').forEach(function (b) {
    b.addEventListener('click', function () { filter[b.dataset.f] = b.dataset.v; applyFilter(); });
  });
  applyFilter();

  // ── Quote buttons ──
  function paintAdds() {
    grid.querySelectorAll('.card').forEach(function (c) {
      var on = GMI.quote.has(c.dataset.id), b = c.querySelector('[data-add]');
      b.setAttribute('aria-pressed', String(on));
      b.textContent = on ? 'In quote list ✓' : 'Add to quote';
    });
    var vb = document.getElementById('v-add');
    if (vb && current) { var on = GMI.quote.has(current.id); vb.setAttribute('aria-pressed', String(on)); vb.textContent = on ? 'In quote list ✓' : 'Add to quote list'; }
    var n = GMI.quote.count();
    trayN.textContent = n + (n === 1 ? ' tin' : ' tins');
    tray.classList.toggle('show', n > 0);
    tray.toggleAttribute('inert', n === 0);
  }
  function toggle(id) {
    var on = GMI.quote.toggle(id);
    var p = GMI.product(id);
    GMI.toast(on ? 'Added ' + p.name + ' to your quote list' : 'Removed ' + p.name);
  }
  grid.addEventListener('click', function (e) {
    var card = e.target.closest('.card'); if (!card) return;
    if (e.target.closest('[data-add]')) toggle(card.dataset.id);
    else if (e.target.closest('[data-open]')) openViewer(card.dataset.id);
  });
  document.addEventListener('gmi:quote', paintAdds);
  paintAdds();

  // ── Viewer ──
  var dlg = document.getElementById('viewer');
  var current = null, view = 1;
  function showView(v) {
    view = v;
    document.getElementById('v-img').src = img(current, v, 'lg');
    dlg.querySelectorAll('.viewer-thumbs button').forEach(function (b, i) { b.setAttribute('aria-current', String(i + 1 === v)); });
  }
  function openViewer(id) {
    current = GMI.product(id);
    var p = current;
    document.getElementById('v-code').textContent = p.id.toUpperCase() + ' · ' + USES[p.use].label;
    document.getElementById('v-title').textContent = p.name;
    var rows = [['Size', fmt(p), true], ['Shape', p.shape === 'round' ? 'Round' : (p.dims[0] === p.dims[1] ? 'Square' : 'Rectangular')]];
    if (p.fill) rows.push(['Holds', p.fill]);
    if (p.lid) rows.push(['Lid', p.lid]);
    rows.push(['Finish', 'Plain tinplate or lacquer colour']);
    rows.push(['Used for', USES[p.use].label]);
    document.getElementById('v-specs').innerHTML = rows.map(function (r) {
      return '<dt>' + r[0] + '</dt><dd' + (r[2] ? ' class="mono"' : '') + '>' + esc(r[1]) + '</dd>';
    }).join('');
    var msg = 'Hi Gateway, I would like a price for the ' + p.name + ' (' + p.id.toUpperCase() + ', ' + fmt(p) + '). Quantity: ';
    document.getElementById('v-wa').href = 'https://wa.me/' + GMI.phone + '?text=' + encodeURIComponent(msg);
    document.getElementById('v-img').alt = p.name;
    dlg.querySelectorAll('.viewer-thumbs img').forEach(function (t, i) { t.src = img(p, i + 1); t.alt = ''; });
    showView(1);
    paintAdds();
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }
  dlg.querySelectorAll('.viewer-thumbs button').forEach(function (b, i) { b.addEventListener('click', function () { showView(i + 1); }); });
  document.getElementById('v-add').addEventListener('click', function () { toggle(current.id); });
  dlg.querySelector('.viewer-close').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') showView(view % 3 + 1);
    if (e.key === 'ArrowLeft') showView((view + 1) % 3 + 1);
  });
  // swipe between photos
  var sx = 0;
  var main = dlg.querySelector('.viewer-main');
  main.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  main.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) showView(dx < 0 ? view % 3 + 1 : (view + 1) % 3 + 1);
  }, { passive: true });
})();
