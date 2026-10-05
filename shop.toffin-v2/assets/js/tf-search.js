/* =====================================================================
   Toffin v2 · tf-search.js — pencarian lanjutan di header (semua halaman v2).
   Satu komponen [data-tf-search] dipakai dua kali:
     - desktop (>= 1200 px): kolom di header + panel lebar di bawahnya,
       dibuka saat kolom difokus, ditutup klik di luar / Esc. Pintasan "/".
     - ponsel  (< 1200 px): layar pencarian di sheet mobile (#mobile-search-browser),
       hasil selalu tampil (data-sx-mode="sheet").
   Cakupan: Semua / Produk / Kategori / Brand. Brand & kategori diturunkan dari
   produk yang cocok ("grinder" → Eureka, Victoria Arduino), dengan
   baris "Semua brand/kategori". Sebelum mengetik: riwayat (localStorage) +
   kategori populer. Hasil menuju product-list.html?q=…&brand=…&cat=… (dibaca
   tf-plp.js) atau product-single.html. Data di bawah = contoh; di backend
   diganti endpoint saran pencarian dengan bentuk data yang sama.
   ===================================================================== */
(function () {
	'use strict';
	var roots = [].slice.call(document.querySelectorAll('[data-tf-search]'));
	if (!roots.length) return;

	/* ---------- data contoh ---------- */
	var PRODUCTS = [
		['Nuova Simonelli Appia Life 2 Group', 'Nuova Simonelli', 'Coffee Machine', 230000000, 'product-1.jpg'],
		['Nuova Simonelli Oscar Mood', 'Nuova Simonelli', 'Coffee Machine', 24900000, 'product-3.jpg'],
		['Nuova Simonelli Aurelia Wave 3 Group', 'Nuova Simonelli', 'Coffee Machine', 315000000, 'product-6.jpg'],
		['Nuova Simonelli Prontobar Silent Fully Automatic', 'Nuova Simonelli', 'Coffee Machine', 189000000, 'product-1.1.jpg'],
		['Victoria Arduino Eagle One Prima', 'Victoria Arduino', 'Coffee Machine', 118500000, 'product-2.jpg'],
		['Victoria Arduino Black Eagle Maverick 2 Group', 'Victoria Arduino', 'Coffee Machine', 398000000, 'product-5.jpg'],
		['Victoria Arduino Mythos MY75', 'Victoria Arduino', 'Coffee Grinder', 62000000, 'product-8.jpg'],
		['VBM Domobar Junior HX', 'VBM', 'Coffee Machine', 32800000, 'product-4.jpg'],
		['Eureka Mignon Specialita 55 mm', 'Eureka', 'Coffee Grinder', 9950000, 'grinder.jpg'],
		['Eureka Zeus 65 mm', 'Eureka', 'Coffee Grinder', 38500000, 'grinder.jpg'],
		['Bravo Water Treatment Pro 1200', 'Bravo', 'Water Treatment', 7850000, 'product-1.2.jpg'],
		['Bravo Filter Cartridge C500', 'Bravo', 'Water Treatment', 1250000, 'product-1.3.png'],
		['TFN Milk Pitcher 600 ml Stainless', 'TFN', 'Coffee Machine', 285000, 'product-1.4.jpg'],
		['TFN Tamper 58 mm Walnut', 'TFN', 'Coffee Machine', 425000, 'product-1.5.jpg'],
		['TFN Automatic Coffee Brewer 5 L', 'TFN', 'Coffee Machine', 6400000, 'product-4.jpg'],
		['Toffin Espresso Blend 1 kg', 'Toffin', 'Ingredients', 245000, 'product-2.jpg'],
		['Toffin Chocolate Powder 1 kg', 'Toffin', 'Ingredients', 168000, 'product-3.jpg'],
		['Manual Brew Starter Kit V60', 'Toffin', 'Manual Brew', 385000, 'product-5.jpg'],
		['TFN Gelato Display 12 Pan', 'TFN', 'Gelato & Soft Ice', 58000000, 'product-6.jpg'],
		['TFN Ice Machine 80 kg/day', 'TFN', 'Other Equipment', 21500000, 'product-7.jpg']
	].map(function (r) { return { name: r[0], brand: r[1], cat: r[2], price: r[3], img: 'images/' + r[4] }; });
	var CATS = [['Coffee Machine', 'product-1.jpg'], ['Coffee Grinder', 'grinder.jpg'], ['Ingredients', 'product-2.jpg'], ['Water Treatment', 'product-1.2.jpg'], ['Manual Brew', 'product-5.jpg'], ['Gelato & Soft Ice', 'product-6.jpg'], ['Other Equipment', 'product-7.jpg']];
	var BRANDS = ['Nuova Simonelli', 'Victoria Arduino', 'Eureka', 'VBM', 'Bravo', 'TFN', 'Toffin'];
	var KEY = 'tf-search-recent';

	/* ---------- utilitas ---------- */
	function recent() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
	function setRecent(list) { try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, 6))); } catch (e) {} }
	function saveRecent(q) { q = (q || '').trim(); if (!q) return; setRecent([q].concat(recent().filter(function (x) { return x.toLowerCase() !== q.toLowerCase(); }))); }
	function rupiah(n) { return 'Rp ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
	function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
	function hl(s, q) { var i = s.toLowerCase().indexOf(q.toLowerCase()); return i < 0 ? esc(s) : esc(s.slice(0, i)) + '<mark>' + esc(s.slice(i, i + q.length)) + '</mark>' + esc(s.slice(i + q.length)); }
	function icon(n) { return '<svg class="tf-i" aria-hidden="true"><use href="#i-' + n + '"/></svg>'; }
	function listUrl(p) { var u = new URLSearchParams(); Object.keys(p).forEach(function (k) { if (p[k]) u.set(k, p[k]); }); return 'product-list.html' + (u.toString() ? '?' + u.toString() : ''); }

	/* ---------- isi panel ---------- */
	function render(box, raw, scope) {
		var q = raw.trim(), h = '';
		if (!q) {
			var r = recent();
			if (r.length) h += '<div class="tf-sx__sec"><div class="tf-sx__head"><h3 class="tf-sx__h">Terakhir dicari</h3><button type="button" class="tf-sx__link" data-sx-clear-recent>Hapus semua</button></div><div class="tf-sx__chips">'
				+ r.map(function (x) { return '<span class="tf-sx__chip" data-sx-go="' + esc(x) + '" role="button" tabindex="-1">' + icon('clock') + esc(x) + '<button type="button" class="tf-sx__x" data-sx-del="' + esc(x) + '" aria-label="Hapus ' + esc(x) + ' dari riwayat">' + icon('x') + '</button></span>'; }).join('') + '</div></div>';
			h += '<div class="tf-sx__sec"><div class="tf-sx__head"><h3 class="tf-sx__h">Kategori populer</h3></div><div class="tf-sx__chips">'
				+ CATS.slice(0, 6).map(function (c) { return '<a class="tf-sx__chip" href="' + listUrl({ cat: c[0] }) + '"><img src="images/' + c[1] + '" alt="">' + esc(c[0]) + '</a>'; }).join('') + '</div></div>';
			box.innerHTML = h; return;
		}
		var ql = q.toLowerCase();
		function m(s) { return s.toLowerCase().indexOf(ql) >= 0; }
		var hits = PRODUCTS.filter(function (p) { return m(p.name) || m(p.brand) || m(p.cat); });
		function group(key, names) {
			var out = names.map(function (n) { return { name: n, count: hits.filter(function (p) { return p[key] === n; }).length, direct: m(n) }; })
				.filter(function (g) { return g.count || g.direct; });
			out.forEach(function (g) { if (!g.count) g.count = PRODUCTS.filter(function (p) { return p[key] === g.name; }).length; });
			return out.sort(function (a, b) { return b.count - a.count; });
		}
		var bs = group('brand', BRANDS), cs = group('cat', CATS.map(function (c) { return c[0]; }));
		var ps = (scope === 'all' || scope === 'product') ? hits : [];
		if (scope === 'product') { bs = []; cs = []; }
		if (scope === 'category') bs = [];
		if (scope === 'brand') cs = [];
		if (!ps.length && !cs.length && !bs.length) {
			box.innerHTML = '<div class="tf-sx__empty"><strong>Tidak ada hasil untuk "' + esc(q) + '"</strong>Coba kata lain' + (scope !== 'all' ? ', atau ganti cakupan ke "Semua"' : '') + '.</div>'; return;
		}
		function brandRows(list, max) {
			return list.slice(0, max).map(function (b) { return '<a class="tf-sx__row" href="' + listUrl({ q: q, brand: b.name }) + '" data-sx-save><span class="tf-sx__mono">' + esc(b.name.charAt(0)) + '</span><span class="tf-sx__txt"><span class="tf-sx__name">' + hl(b.name, q) + '</span><span class="tf-sx__meta">' + b.count + ' produk "' + esc(q) + '"</span></span></a>'; }).join('');
		}
		function catRows(list, max) {
			return list.slice(0, max).map(function (c) { return '<a class="tf-sx__row" href="' + listUrl({ q: q, cat: c.name }) + '" data-sx-save><span class="tf-sx__cico">' + icon('layout-grid') + '</span><span class="tf-sx__txt"><span class="tf-sx__name">' + hl(c.name, q) + '</span><span class="tf-sx__meta">' + c.count + ' produk</span></span></a>'; }).join('');
		}
		if (scope === 'brand' || scope === 'category') {
			var isB = scope === 'brand', list = isB ? bs : cs, noun = isB ? 'brand' : 'kategori';
			box.innerHTML = '<div class="tf-sx__sec"><div class="tf-sx__head"><h3 class="tf-sx__h">' + (isB ? 'Brand' : 'Kategori') + ' yang punya "' + esc(q) + '"</h3><span class="tf-sx__meta">' + list.length + ' ' + noun + '</span></div>'
				+ '<a class="tf-sx__row" href="' + listUrl({ q: q }) + '" data-sx-save><span class="tf-sx__cico">' + icon(isB ? 'tag' : 'layout-grid') + '</span><span class="tf-sx__txt"><span class="tf-sx__name">Semua ' + noun + '</span><span class="tf-sx__meta">' + hits.length + ' produk "' + esc(q) + '"</span></span></a>'
				+ (isB ? brandRows(list, 20) : catRows(list, 20)) + '</div>';
			return;
		}
		var limit = scope === 'product' ? 8 : 5;
		var left = ps.length ? '<div class="tf-sx__sec"><div class="tf-sx__head"><h3 class="tf-sx__h">Produk</h3><span class="tf-sx__meta">' + ps.length + ' hasil</span></div>'
			+ ps.slice(0, limit).map(function (p) { return '<a class="tf-sx__row" href="product-single.html" data-sx-save><img class="tf-sx__thumb" src="' + p.img + '" alt=""><span class="tf-sx__txt"><span class="tf-sx__name">' + hl(p.name, q) + '</span><span class="tf-sx__meta">' + esc(p.brand) + ' · ' + esc(p.cat) + '</span></span><span class="tf-sx__price">' + rupiah(p.price) + '</span></a>'; }).join('') + '</div>' : '';
		var right = '';
		if (cs.length) right += '<div class="tf-sx__sec"><div class="tf-sx__head"><h3 class="tf-sx__h">Kategori</h3></div>' + catRows(cs, 3) + '</div>';
		if (bs.length) right += '<div class="tf-sx__sec"><div class="tf-sx__head"><h3 class="tf-sx__h">Brand</h3>' + (bs.length > 3 ? '<button type="button" class="tf-sx__link" data-sx-scope-to="brand">Semua ' + bs.length + ' brand</button>' : '') + '</div>' + brandRows(bs, 3) + '</div>';
		h = (left && right) ? '<div class="tf-sx__grid"><div>' + left + '</div><div>' + right + '</div></div>' : (left || right);
		h += '<a class="tf-sx__all" href="' + listUrl({ q: q }) + '" data-sx-save><span>Lihat semua hasil untuk "<strong>' + esc(q) + '</strong>"</span>' + icon('arrow-right') + '</a>';
		box.innerHTML = h;
	}

	/* ---------- satu instance komponen ---------- */
	function init(root) {
		var sheet = root.getAttribute('data-sx-mode') === 'sheet';
		var input = root.querySelector('[data-sx-input]');
		var box = root.querySelector('[data-sx-results]');
		var menu = root.querySelector('[data-sx-menu]');
		var scopeBtn = root.querySelector('[data-sx-scope]');
		var clearBtn = root.querySelector('[data-sx-clear]');
		var scope = 'all', active = -1;

		function items() { return [].slice.call(box.querySelectorAll('.tf-sx__row, .tf-sx__all')); }
		function setActive(i) {
			var it = items(); active = Math.max(-1, Math.min(i, it.length - 1));
			it.forEach(function (el, n) { el.classList.toggle('is-active', n === active); });
			if (it[active]) it[active].scrollIntoView({ block: 'nearest' });
		}
		function refresh() { render(box, input.value, scope); active = -1; root.classList.toggle('has-q', !!input.value); }
		function open() { if (!sheet) root.classList.add('is-open'); refresh(); }
		function close() { root.classList.remove('is-open'); menu.classList.remove('is-open'); scopeBtn.setAttribute('aria-expanded', 'false'); }
		function setScope(btn) {
			scope = btn.getAttribute('data-scope');
			menu.querySelectorAll('[data-scope]').forEach(function (x) { var on = x === btn; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on ? 'true' : 'false'); });
			root.querySelector('[data-sx-scope-label]').textContent = btn.textContent;
			input.placeholder = scope === 'all' ? 'Cari produk, kategori, brand' : 'Cari ' + btn.textContent.toLowerCase();
			menu.classList.remove('is-open'); scopeBtn.setAttribute('aria-expanded', 'false');
			input.focus(); open();
		}
		function go(q) { q = q.trim(); if (!q) return; saveRecent(q); location.href = listUrl({ q: q }); }

		input.addEventListener('focus', open);
		input.addEventListener('input', function () { if (!sheet) root.classList.add('is-open'); refresh(); });
		input.addEventListener('keydown', function (e) {
			if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
			else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
			else if (e.key === 'Enter') { e.preventDefault(); var it = items()[active]; if (it) it.click(); else go(input.value); }
			else if (e.key === 'Escape') { e.preventDefault(); close(); input.blur(); }   /* preventDefault: input type=search mengosongkan isi saat Esc */
		});
		clearBtn.addEventListener('click', function () { input.value = ''; input.focus(); refresh(); });
		scopeBtn.addEventListener('click', function () { var o = !menu.classList.contains('is-open'); menu.classList.toggle('is-open', o); scopeBtn.setAttribute('aria-expanded', o ? 'true' : 'false'); });
		menu.addEventListener('click', function (e) { var b = e.target.closest('[data-scope]'); if (b) setScope(b); });

		box.addEventListener('mousedown', function (e) { if (!e.target.closest('a')) e.preventDefault(); });   /* fokus tetap di kolom */
		box.addEventListener('click', function (e) {
			var t;
			if ((t = e.target.closest('[data-sx-del]'))) { e.preventDefault(); e.stopPropagation(); var v = t.getAttribute('data-sx-del'); setRecent(recent().filter(function (x) { return x !== v; })); refresh(); input.focus(); return; }
			if ((t = e.target.closest('[data-sx-clear-recent]'))) { setRecent([]); refresh(); input.focus(); return; }
			if ((t = e.target.closest('[data-sx-scope-to]'))) { setScope(menu.querySelector('[data-scope="' + t.getAttribute('data-sx-scope-to') + '"]')); return; }
			if ((t = e.target.closest('[data-sx-go]'))) { input.value = t.getAttribute('data-sx-go'); refresh(); input.focus(); return; }
			if ((t = e.target.closest('[data-sx-save]'))) saveRecent(input.value);
		});

		if (!sheet) {
			document.addEventListener('mousedown', function (e) { if (!root.contains(e.target)) close(); });
		} else {
			/* tombol cari di header ponsel membuka view ini (mobile-nav.js); fokuskan kolom */
			var openBtn = document.getElementById('btn-open-mobile-search');
			if (openBtn) openBtn.addEventListener('click', function () { refresh(); setTimeout(function () { input.focus(); }, 150); });
			refresh();
		}
		return { input: input, sheet: sheet };
	}

	var inst = roots.map(init);
	/* pintasan "/" → fokus kolom pencarian desktop (bila tidak sedang mengetik) */
	document.addEventListener('keydown', function (e) {
		if (e.key !== '/' || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable) return;
		var d = inst.filter(function (i) { return !i.sheet && i.input.offsetParent; })[0];
		if (d) { e.preventDefault(); d.input.focus(); }
	});
})();
