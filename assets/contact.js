// Contact page: quote list with quantities, then hand off to WhatsApp or email.
(function () {
  var form = document.getElementById('quote');
  var list = document.getElementById('qlist');
  var empty = document.getElementById('qempty');
  var fmt = window.GMI_fmtDims;
  var via = 'wa';

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function render() {
    var items = GMI.quote.all();
    var ids = Object.keys(items).filter(function (id) { return GMI.product(id); });
    empty.hidden = ids.length > 0;
    list.hidden = ids.length === 0;
    list.innerHTML = ids.map(function (id) {
      var p = GMI.product(id);
      return '<div class="qitem" data-id="' + id + '">' +
        '<div class="thumb"><img src="img/p/sm/' + p.img + '.1.jpg" alt="" width="56" height="56"></div>' +
        '<div><b>' + esc(p.name) + '</b><small>' + p.id.toUpperCase() + ' · ' + fmt(p) + '</small></div>' +
        '<div class="qty"><label class="label muted" for="q-' + id + '" style="display:block;font-size:10px;margin-bottom:2px">Quantity</label>' +
          '<input id="q-' + id + '" inputmode="numeric" placeholder="e.g. 5,000" value="' + esc(items[id]) + '"></div>' +
        '<button class="rm" type="button" aria-label="Remove ' + esc(p.name) + '">×</button>' +
      '</div>';
    }).join('');
  }

  list.addEventListener('input', function (e) {
    var row = e.target.closest('.qitem');
    if (row && e.target.matches('input')) GMI.quote.setQty(row.dataset.id, e.target.value);
  });
  list.addEventListener('click', function (e) {
    var row = e.target.closest('.qitem');
    if (row && e.target.closest('.rm')) { GMI.quote.remove(row.dataset.id); render(); }
  });
  // re-render only when another tab changes the list (typing here also fires the event)
  window.addEventListener('storage', function (e) { if (e.key === 'gmi-quote') render(); });

  form.querySelectorAll('[data-via]').forEach(function (b) { b.addEventListener('click', function () { via = b.dataset.via; }); });

  function val(id) { return document.getElementById(id).value.trim(); }
  function mark(id, bad) { document.getElementById(id).classList.toggle('bad', bad); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = val('name'), phone = val('phone'), email = val('email'), msg = val('msg');
    var items = GMI.quote.all(), ids = Object.keys(items).filter(function (id) { return GMI.product(id); });
    var badName = !name;
    var badContact = !phone && !email;
    var badEmail = !!email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    var badNeed = ids.length === 0 && !msg;
    mark('f-name', badName);
    mark('f-phone', badContact);
    mark('f-email', badEmail || badContact);
    mark('f-msg', badNeed);
    if (badName || badContact || badEmail || badNeed) {
      var first = form.querySelector('.field.bad input, .field.bad textarea');
      if (first) first.focus();
      GMI.toast('Check the highlighted fields.');
      return;
    }

    var lines = ['Hello Gateway Metal Industries,', ''];
    if (ids.length) {
      lines.push('I would like a quote for:');
      ids.forEach(function (id, i) {
        var p = GMI.product(id);
        lines.push((i + 1) + '. ' + p.name + ' (' + p.id.toUpperCase() + ', ' + fmt(p) + ') - qty: ' + (items[id] || 'to discuss'));
      });
      lines.push('');
    }
    if (msg) { lines.push('Notes: ' + msg, ''); }
    lines.push('Name: ' + name);
    if (val('company')) lines.push('Company: ' + val('company'));
    if (phone) lines.push('Phone: ' + phone);
    if (email) lines.push('Email: ' + email);
    if (val('city')) lines.push('City: ' + val('city'));
    var text = lines.join('\n');

    if (via === 'email') {
      location.href = 'mailto:' + GMI.email + '?subject=' + encodeURIComponent('Quote request from ' + name + (val('company') ? ', ' + val('company') : '')) + '&body=' + encodeURIComponent(text);
    } else {
      window.open('https://wa.me/' + GMI.phone + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    }
    GMI.toast(via === 'email' ? 'Opening your email app…' : 'Opening WhatsApp…');
  });

  ['name', 'phone', 'email', 'msg'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () {
      var f = document.getElementById(id).closest('.field');
      if (f.classList.contains('bad')) f.classList.remove('bad');
    });
  });

  render();
})();
