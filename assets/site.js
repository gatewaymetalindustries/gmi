// Shared behaviour: mobile menu, quote list, scroll reveals, toast.
(function () {
  var KEY = 'gmi-quote';

  // ── Quote list (kept in this browser only) ──
  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* private mode: list lasts for this page only */ }
    memory = list;
    document.dispatchEvent(new CustomEvent('gmi:quote', { detail: list }));
    paintPills();
  }
  var memory = read();

  var quote = {
    all: function () { return Object.assign({}, memory); },
    has: function (id) { return Object.prototype.hasOwnProperty.call(memory, id); },
    count: function () { return Object.keys(memory).length; },
    add: function (id) { var l = quote.all(); if (!(id in l)) l[id] = ''; write(l); },
    remove: function (id) { var l = quote.all(); delete l[id]; write(l); },
    toggle: function (id) { quote.has(id) ? quote.remove(id) : quote.add(id); return quote.has(id); },
    setQty: function (id, qty) { var l = quote.all(); if (id in l) { l[id] = qty; write(l); } },
    clear: function () { write({}); }
  };

  function paintPills() {
    var n = quote.count();
    document.querySelectorAll('[data-quote-count]').forEach(function (el) {
      el.textContent = n;
      var pill = el.closest('.quote-pill');
      if (pill) {
        pill.classList.toggle('has', n > 0);
        pill.setAttribute('aria-label', 'Quote list, ' + n + (n === 1 ? ' tin' : ' tins'));
      }
    });
  }

  // ── Toast ──
  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  // ── Mobile menu ──
  function initMenu() {
    var btn = document.querySelector('.menu-btn');
    var sheet = document.getElementById('sheet');
    if (!btn || !sheet) return;
    var close = sheet.querySelector('.sheet-close');
    function open() {
      sheet.classList.add('open');
      sheet.removeAttribute('inert');
      btn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      setTimeout(function () { close.focus(); }, 50);
    }
    function shut() {
      sheet.classList.remove('open');
      sheet.setAttribute('inert', '');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      btn.focus();
    }
    sheet.setAttribute('inert', '');
    btn.addEventListener('click', open);
    close.addEventListener('click', shut);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheet.classList.contains('open')) shut(); });
  }

  // ── Reveal on scroll ──
  function initReveal() {
    var els = document.querySelectorAll('.rise');
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  window.GMI = {
    quote: quote,
    toast: toast,
    phone: '917738486780',
    email: 'sales@gatewaymetalindustries.com',
    product: function (id) { return (window.GMI_PRODUCTS || []).filter(function (p) { return p.id === id; })[0]; }
  };

  // Keep pills in sync if another tab changes the list
  window.addEventListener('storage', function (e) { if (e.key === KEY) { memory = read(); paintPills(); document.dispatchEvent(new CustomEvent('gmi:quote', { detail: memory })); } });

  document.addEventListener('DOMContentLoaded', function () {
    paintPills();
    initMenu();
    initReveal();
    var y = document.querySelector('[data-year]');
    if (y) y.textContent = new Date().getFullYear();
  });
})();
