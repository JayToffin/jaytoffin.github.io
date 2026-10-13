/* =====================================================================
   Toffin v2 · tf-flash.js — halaman Flash Sale (flashsale.html).
   Fitur produksi shop.toffin.id/current-flash-sale: hitung mundur, filter
   kategori (cid), urutkan harga (order=price|price_desc), rentang harga,
   pencarian, tombol Filters, halaman berikutnya (di sini auto-load).
   Panel filter = daftar produk (tf-plp.js): Kategori, Brand, Harga. Tambahan:
   tab sesi "Akan datang" dengan tombol "Ingatkan saya".
   Vanilla JS. Katalog di bawah hanya contoh statis (dibuat skrip rakit).
   ===================================================================== */
(function () {
	'use strict';
	var pad = function (n) { return String(Math.max(0, n)).padStart(2, '0'); };
	function rupiah(n) { return 'Rp ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
	function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

	/* ---------- hitung mundur: satu interval untuk semua .fs-countdown[data-end|data-start] ---------- */
	var cds = [].slice.call(document.querySelectorAll('.fs-countdown[data-end], .fs-countdown[data-start]')).map(function (el) {
		return { el: el, at: new Date(el.getAttribute('data-end') || el.getAttribute('data-start')).getTime(), isEnd: el.hasAttribute('data-end'),
			d: el.querySelector('[data-fs-d]'), h: el.querySelector('[data-fs-h]'), m: el.querySelector('[data-fs-m]'), s: el.querySelector('[data-fs-s]'),
			panel: (function (b) { return b ? document.getElementById(b.getAttribute('data-fs-banner')) : el.closest('[data-fs-panel]'); }(el.closest('[data-fs-banner]'))), ended: false };   /* banner di luar panel: cari panel lewat data-fs-banner */
	}).filter(function (c) { return !isNaN(c.at); });
	function tick() {
		var now = Date.now();
		cds.forEach(function (c) {
			var left = Math.max(0, Math.floor((c.at - now) / 1000)), d = Math.floor(left / 86400);
			if (c.d) { c.d.textContent = pad(d); c.d.parentElement.style.display = d > 0 ? '' : 'none'; }
			if (c.h) c.h.textContent = pad(Math.floor(left % 86400 / 3600));
			if (c.m) c.m.textContent = pad(Math.floor(left % 3600 / 60));
			if (c.s) c.s.textContent = pad(left % 60);
			if (left === 0 && !c.ended) { c.ended = true; c.el.classList.add('fs-countdown--ended'); if (c.panel && c.isEnd) c.panel.classList.add('is-ended'); }
		});
	}
	if (cds.length) { tick(); setInterval(tick, 1000); }

	/* ---------- tab sesi: berlangsung / akan datang ---------- */
	var tabs = [].slice.call(document.querySelectorAll('[data-fs-tab]'));
	function showTab(id, push) {
		tabs.forEach(function (t) {
			var on = t.getAttribute('data-fs-tab') === id;
			t.classList.toggle('is-on', on); t.setAttribute('aria-selected', on);
			var p = document.getElementById(t.getAttribute('data-fs-tab')); if (p) p.hidden = !on;
		});
		document.querySelectorAll('[data-fs-banner]').forEach(function (b) { b.hidden = b.getAttribute('data-fs-banner') !== id; });   /* banner ikut tab */
		if (push && history.replaceState) history.replaceState(null, '', id === 'fs-next' ? '#akan-datang' : location.pathname + location.search);
		if (id === 'fs-live' && grid) onScroll();
		if (id === 'fs-next' && nextPager) nextPager.start();   /* lanjutkan auto-load bila sentinel sudah terlihat */
	}
	tabs.forEach(function (t) { t.addEventListener('click', function () { showTab(t.getAttribute('data-fs-tab'), true); }); });

	/* ---------- ingatkan saya: delegasi karena kartu dirender JS (contoh: hanya keadaan tombol; produksi = simpan pengingat) ---------- */
	document.addEventListener('click', function (e) {
		var b = e.target.closest('[data-fs-remind]'); if (!b) return;
		var on = !b.classList.contains('is-on');
		b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on);
		b.querySelector('use').setAttribute('href', on ? '#i-bell-ringing' : '#i-bell');
		b.querySelector('span').textContent = on ? 'Pengingat aktif' : 'Ingatkan saya';
	});

	/* ---------- pemuat bertahap umum: skeleton → kartu, lanjut saat sentinel mendekati layar ---------- */
	function pager(o) {
		var shown = 0, loading = false, txt = o.status.querySelector('[data-fs-status-text]');
		function skel(n) { var h = ''; for (var i = 0; i < n; i++) h += '<div class="tf-skel" data-fs-skel><div class="tf-skel__media"></div><div class="tf-skel__body"><span class="tf-skel__line"></span><span class="tf-skel__line tf-skel__line--w60"></span><span class="tf-skel__line tf-skel__line--w40"></span></div></div>'; return h; }
		function near() { return o.sentinel.offsetParent && o.sentinel.getBoundingClientRect().top - window.innerHeight < 80; }
		function load(first) {
			if (loading || shown >= o.list.length) return;
			loading = true;
			var next = o.list.slice(shown, shown + o.batch);
			o.status.classList.remove('is-done'); o.status.classList.add('is-loading'); txt.textContent = 'Memuat produk…';
			o.grid.insertAdjacentHTML('beforeend', skel(next.length));
			setTimeout(function () {
				o.grid.querySelectorAll('[data-fs-skel]').forEach(function (el) { el.remove(); });
				o.grid.insertAdjacentHTML('beforeend', next.map(o.card).join(''));
				if (window.tfSliders) window.tfSliders.init(o.grid);
				shown += next.length; loading = false; o.status.classList.remove('is-loading');
				if (shown >= o.list.length) { o.status.classList.add('is-done'); txt.textContent = 'Semua ' + o.list.length + ' produk sudah ditampilkan'; }
				else { txt.textContent = 'Menampilkan ' + shown + ' dari ' + o.list.length + ' produk'; if (near()) load(); }   /* layar tinggi: lanjut tanpa menunggu gulir */
			}, first ? o.firstDelay : o.delay);
		}
		/* utama: IntersectionObserver pada sentinel; cadangan: event scroll (sama dengan sesi berlangsung) */
		if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { if (es[0].isIntersecting && shown) load(); }, { rootMargin: '0px 0px 80px 0px' }).observe(o.sentinel);
		else o.status.classList.add('is-manual');
		window.addEventListener('scroll', function () { if (shown && near()) load(); }, { passive: true });
		o.status.querySelector('[data-fs-more]').addEventListener('click', function () { load(); });
		return { start: function () { if (!shown && !loading) load(true); } };
	}

	/* ---------- tab akan datang: semua produk tanpa filter, dimuat per 12 saat tab dibuka ---------- */
	var NEXT = [{"name": "Victoria Arduino Black Eagle Maverick 2 Group", "old": 398000000, "imgs": ["images/product-1.jpg", "images/product-6.jpg", "images/product-1.3.png"]}, {"name": "Nuova Simonelli Musica Lux", "old": 38000000, "imgs": ["images/product-3.jpg", "images/product-8.jpg", "images/product-1.5.jpg"]}, {"name": "Eureka Zeus 65 mm", "old": 38500000, "imgs": ["images/product-5.jpg", "images/product-1.2.jpg", "images/product-1.jpg"]}, {"name": "Toffin Espresso Blend 1 kg", "old": 245000, "imgs": ["images/product-7.jpg", "images/product-1.4.jpg", "images/product-3.jpg"]}, {"name": "Furnotel Combi Oven 10 Tray", "old": 89000000, "imgs": ["images/product-1.1.jpg", "images/product1.png", "images/product-5.jpg"]}, {"name": "Toffin Sauce White Chocolate 1.89 L", "old": 255000, "imgs": ["images/product-1.3.png", "images/product-2.jpg", "images/product-7.jpg"]}, {"name": "Victoria Arduino Mythos MY75", "old": 62000000, "imgs": ["images/product-1.5.jpg", "images/product-4.jpg", "images/product-1.1.jpg"]}, {"name": "Nuova Simonelli Appia Life XT 2 Group", "old": 185000000, "imgs": ["images/product-1.jpg", "images/product-6.jpg", "images/product-1.3.png"]}, {"name": "Eureka Mignon Libra", "old": 14900000, "imgs": ["images/product-3.jpg", "images/product-8.jpg", "images/product-1.5.jpg"]}, {"name": "TFN Milk Pitcher 600 ml Stainless", "old": 350000, "imgs": ["images/product-5.jpg", "images/product-1.2.jpg", "images/product-1.jpg"]}, {"name": "TFN Knock Box Large", "old": 425000, "imgs": ["images/product-7.jpg", "images/product-1.4.jpg", "images/product-3.jpg"]}, {"name": "Toffin Syrup Hazelnut 750 ml", "old": 135000, "imgs": ["images/product-1.1.jpg", "images/product1.png", "images/product-5.jpg"]}, {"name": "Toffin Syrup Salted Caramel 750 ml", "old": 135000, "imgs": ["images/product-1.3.png", "images/product-2.jpg", "images/product-7.jpg"]}, {"name": "Toffin Frappe Base Powder 1 kg", "old": 210000, "imgs": ["images/product-1.5.jpg", "images/product-4.jpg", "images/product-1.1.jpg"]}, {"name": "TFN Thai Tea Powder 1 kg", "old": 185000, "imgs": ["images/product-1.jpg", "images/product-6.jpg", "images/product-1.3.png"]}, {"name": "Bravo Water Softener 12 L", "old": 4600000, "imgs": ["images/product-3.jpg", "images/product-8.jpg", "images/product-1.5.jpg"]}, {"name": "Bravo Filter Cartridge C1100", "old": 1850000, "imgs": ["images/product-5.jpg", "images/product-1.2.jpg", "images/product-1.jpg"]}, {"name": "Hario V60 Drip Set", "old": 520000, "imgs": ["images/product-7.jpg", "images/product-1.4.jpg", "images/product-3.jpg"]}, {"name": "TFN Cold Brew Tower 5 L", "old": 3200000, "imgs": ["images/product-1.1.jpg", "images/product1.png", "images/product-5.jpg"]}, {"name": "TFN Digital Scale Timer 2 kg", "old": 650000, "imgs": ["images/product-1.3.png", "images/product-2.jpg", "images/product-7.jpg"]}, {"name": "Bravo Trittico Mini", "old": 185000000, "imgs": ["images/product-1.5.jpg", "images/product-4.jpg", "images/product-1.1.jpg"]}, {"name": "TFN Soft Serve Machine Twin", "old": 72000000, "imgs": ["images/product-1.jpg", "images/product-6.jpg", "images/product-1.3.png"]}, {"name": "TFN Gelato Base Chocolate 2 kg", "old": 395000, "imgs": ["images/product-3.jpg", "images/product-8.jpg", "images/product-1.5.jpg"]}, {"name": "Furnotel Under Counter Chiller 1.5 m", "old": 21000000, "imgs": ["images/product-5.jpg", "images/product-1.2.jpg", "images/product-1.jpg"]}, {"name": "Osion Ice Maker Half Cube 60 kg", "old": 24500000, "imgs": ["images/product-7.jpg", "images/product-1.4.jpg", "images/product-3.jpg"]}, {"name": "Furnotel Induction Wok 5 kW", "old": 16500000, "imgs": ["images/product-1.1.jpg", "images/product1.png", "images/product-5.jpg"]}, {"name": "Rubbermaid Food Box 26 L", "old": 640000, "imgs": ["images/product-1.3.png", "images/product-2.jpg", "images/product-7.jpg"]}, {"name": "Rubbermaid Mop Bucket Wringer 33 L", "old": 2100000, "imgs": ["images/product-1.5.jpg", "images/product-4.jpg", "images/product-1.1.jpg"]}, {"name": "Nuova Simonelli Oscar Mood Red", "old": 27500000, "imgs": ["images/product-1.jpg", "images/product-6.jpg", "images/product-1.3.png"]}, {"name": "Victoria Arduino Eagle Tempo 2 Group", "old": 210000000, "imgs": ["images/product-3.jpg", "images/product-8.jpg", "images/product-1.5.jpg"]}];   /* @@NEXT-END@@ */
	var nextGrid = document.querySelector('[data-fs-next-grid]'), nextPager = null;
	if (nextGrid) {
		nextPager = pager({
			grid: nextGrid, sentinel: document.querySelector('[data-fs-next-sentinel]'), status: document.querySelector('[data-fs-next-status]'),
			list: NEXT, batch: 12, firstDelay: 500, delay: 900,   /* jeda meniru permintaan ke server supaya skeleton terlihat */
			card: function (p) {
				return '<div class="product is-soon">'
					+ '<div class="text"><p class="product__list__item--icons"><span><a href="#" aria-label="Simpan ke favorit"><svg class="tf-i tf-i--2x" aria-hidden="true"><use href="#i-heart"/></svg></a></span></p></div>'
					+ '<div class="tf-pg swiper" data-tf-pg><div class="swiper-wrapper">'
					+ p.imgs.map(function (src, n) { return '<div class="swiper-slide"><a href="detail-produk-flashsale.html" class="img-prod"><img class="img-fluid" src="' + src + '" alt="' + esc(p.name) + ' - foto ' + (n + 1) + '" draggable="false"' + (n ? ' loading="lazy"' : '') + '></a></div>'; }).join('')
					+ '</div><div class="swiper-pagination tf-pg__dots"></div></div>'
					+ '<div class="fs-tag fs-tag--soon">Segera</div>'
					+ '<div class="fs-body">'
					+ '<h3 class="fs-product-title"><a href="detail-produk-flashsale.html">' + esc(p.name) + '</a></h3>'
					+ '<div class="fs-price-row"><div class="fs-price"><span class="fs-price-new fs-price-new--soon">Rp ??.???</span><span class="fs-price-old">' + rupiah(p.old) + '</span></div></div>'
					+ '<div class="fs-actions"><button type="button" class="fs-btn fs-btn-remind" data-fs-remind aria-pressed="false"><svg class="tf-i" aria-hidden="true"><use href="#i-bell"/></svg><span>Ingatkan saya</span></button></div>'
					+ '</div></div>';
			}
		});
		nextGrid.addEventListener('click', function (e) { var a = e.target.closest('.product__list__item--icons a'); if (a) { e.preventDefault(); a.classList.toggle('selected'); } });
	}

	/* =====================================================================
	   Daftar produk sesi berlangsung
	   ===================================================================== */
	var grid = document.querySelector('[data-fs-grid]');
	if (!grid) return;
	var DATA = [{"id": 0, "name": "Furnotel 1.2m 3-Layer Japanese Style Refrigerated Deli Case RCD-CL120", "brand": "Furnotel", "cat": "Other Equipment", "sub": "Other Equipment", "old": 50900000, "price": 24670000, "left": 2, "total": 5, "imgs": ["images/product-1.jpg", "images/product-6.jpg", "images/product-1.3.png"], "off": 52}, {"id": 1, "name": "Rubbermaid Storage Cont Round 6qt/5.6l Clr / FG572324CLR", "brand": "Rubbermaid", "cat": "Other Equipment", "sub": "Other Equipment", "old": 156750, "price": 130000, "left": 18, "total": 40, "imgs": ["images/product-3.jpg", "images/product-8.jpg", "images/product-1.5.jpg"], "off": 17}, {"id": 2, "name": "Osion / HB-40U / Ice Maker Full Cube P/S 40kg/25kg Up-Down", "brand": "Osion", "cat": "Other Equipment", "sub": "Other Equipment", "old": 19800000, "price": 8830000, "left": 3, "total": 6, "imgs": ["images/product-5.jpg", "images/product-1.2.jpg", "images/product-1.jpg"], "off": 55}, {"id": 3, "name": "Rubbermaid Lid Round 2-4qt/2.2-4.4l Yel / FG572200YEL", "brand": "Rubbermaid", "cat": "Other Equipment", "sub": "Other Equipment", "old": 74800, "price": 70000, "left": 30, "total": 50, "imgs": ["images/product-7.jpg", "images/product-1.4.jpg", "images/product-3.jpg"], "off": 6}, {"id": 4, "name": "Nuova Simonelli Appia Life 2 Group", "brand": "Nuova Simonelli", "cat": "Coffee Machine", "sub": "Commercial Espresso Machine", "old": 250000000, "price": 200000000, "left": 3, "total": 10, "imgs": ["images/product-1.1.jpg", "images/product1.png", "images/product-5.jpg"], "off": 20}, {"id": 5, "name": "Nuova Simonelli Oscar Mood", "brand": "Nuova Simonelli", "cat": "Coffee Machine", "sub": "Home Espresso Machine", "old": 27500000, "price": 22550000, "left": 4, "total": 10, "imgs": ["images/product-1.3.png", "images/product-2.jpg", "images/product-7.jpg"], "off": 18}, {"id": 6, "name": "Victoria Arduino Eagle One Prima", "brand": "Victoria Arduino", "cat": "Coffee Machine", "sub": "Home Espresso Machine", "old": 165000000, "price": 140250000, "left": 5, "total": 8, "imgs": ["images/product-1.5.jpg", "images/product-4.jpg", "images/product-1.1.jpg"], "off": 15}, {"id": 7, "name": "Eureka Mignon Specialita 55 mm", "brand": "Eureka", "cat": "Coffee Grinder", "sub": "Coffee Grinder", "old": 11200000, "price": 8400000, "left": 7, "total": 20, "imgs": ["images/product-1.jpg", "images/product-6.jpg", "images/product-1.3.png"], "off": 25}, {"id": 8, "name": "Eureka Atom 75", "brand": "Eureka", "cat": "Coffee Grinder", "sub": "Coffee Grinder", "old": 32000000, "price": 27200000, "left": 2, "total": 6, "imgs": ["images/product-3.jpg", "images/product-8.jpg", "images/product-1.5.jpg"], "off": 15}, {"id": 9, "name": "Toffin Syrup Caramel 750 ml", "brand": "Toffin", "cat": "Ingredients", "sub": "Ingredients", "old": 135000, "price": 94500, "left": 40, "total": 120, "imgs": ["images/product-5.jpg", "images/product-1.2.jpg", "images/product-1.jpg"], "off": 30}, {"id": 10, "name": "Toffin Syrup Vanilla 750 ml", "brand": "Toffin", "cat": "Ingredients", "sub": "Ingredients", "old": 135000, "price": 99000, "left": 55, "total": 120, "imgs": ["images/product-7.jpg", "images/product-1.4.jpg", "images/product-3.jpg"], "off": 27}, {"id": 11, "name": "Toffin Sauce Chocolate 1.89 L", "brand": "Toffin", "cat": "Ingredients", "sub": "Ingredients", "old": 245000, "price": 183750, "left": 22, "total": 60, "imgs": ["images/product-1.1.jpg", "images/product1.png", "images/product-5.jpg"], "off": 25}, {"id": 12, "name": "Toffin Sauce Caramel 1.89 L", "brand": "Toffin", "cat": "Ingredients", "sub": "Ingredients", "old": 245000, "price": 196000, "left": 9, "total": 60, "imgs": ["images/product-1.3.png", "images/product-2.jpg", "images/product-7.jpg"], "off": 20}, {"id": 13, "name": "TFN Chocolate Powder 1 kg", "brand": "TFN", "cat": "Ingredients", "sub": "Ingredients", "old": 190000, "price": 142500, "left": 31, "total": 80, "imgs": ["images/product-1.5.jpg", "images/product-4.jpg", "images/product-1.1.jpg"], "off": 25}, {"id": 14, "name": "TFN Matcha Powder 500 g", "brand": "TFN", "cat": "Ingredients", "sub": "Ingredients", "old": 320000, "price": 256000, "left": 4, "total": 40, "imgs": ["images/product-1.jpg", "images/product-6.jpg", "images/product-1.3.png"], "off": 20}, {"id": 15, "name": "Toffin Cold Brew Concentrate 1 L", "brand": "Toffin", "cat": "Ingredients", "sub": "Ingredients", "old": 165000, "price": 132000, "left": 15, "total": 50, "imgs": ["images/product-3.jpg", "images/product-8.jpg", "images/product-1.5.jpg"], "off": 20}, {"id": 16, "name": "TFN Cup Sleeve 12 oz (1.000 pcs)", "brand": "TFN", "cat": "Ingredients", "sub": "Ingredients", "old": 450000, "price": 337500, "left": 12, "total": 30, "imgs": ["images/product-5.jpg", "images/product-1.2.jpg", "images/product-1.jpg"], "off": 25}, {"id": 17, "name": "TFN Gelato Base Fior di Latte 2 kg", "brand": "TFN", "cat": "Gelato & Soft Ice", "sub": "Gelato & Soft Ice", "old": 380000, "price": 304000, "left": 10, "total": 30, "imgs": ["images/product-7.jpg", "images/product-1.4.jpg", "images/product-3.jpg"], "off": 20}, {"id": 18, "name": "TFN Soft Ice Mix Vanilla 1 kg", "brand": "TFN", "cat": "Gelato & Soft Ice", "sub": "Gelato & Soft Ice", "old": 210000, "price": 157500, "left": 26, "total": 60, "imgs": ["images/product-1.1.jpg", "images/product1.png", "images/product-5.jpg"], "off": 25}, {"id": 19, "name": "Furnotel Gas Griddle 600 mm", "brand": "Furnotel", "cat": "Other Equipment", "sub": "Other Equipment", "old": 14800000, "price": 10360000, "left": 2, "total": 4, "imgs": ["images/product-1.3.png", "images/product-2.jpg", "images/product-7.jpg"], "off": 30}, {"id": 20, "name": "Furnotel Double Burner Gas Range", "brand": "Furnotel", "cat": "Other Equipment", "sub": "Other Equipment", "old": 9600000, "price": 7680000, "left": 3, "total": 5, "imgs": ["images/product-1.5.jpg", "images/product-4.jpg", "images/product-1.1.jpg"], "off": 20}, {"id": 21, "name": "Furnotel Electric Fryer 2 x 8 L", "brand": "Furnotel", "cat": "Other Equipment", "sub": "Other Equipment", "old": 7900000, "price": 5530000, "left": 6, "total": 10, "imgs": ["images/product-1.jpg", "images/product-6.jpg", "images/product-1.3.png"], "off": 30}, {"id": 22, "name": "Furnotel Lava Rock Grill 800 mm", "brand": "Furnotel", "cat": "Other Equipment", "sub": "Other Equipment", "old": 12500000, "price": 9375000, "left": 1, "total": 3, "imgs": ["images/product-3.jpg", "images/product-8.jpg", "images/product-1.5.jpg"], "off": 25}, {"id": 23, "name": "Osion Upright Chiller 2 Pintu", "brand": "Osion", "cat": "Other Equipment", "sub": "Other Equipment", "old": 16900000, "price": 11830000, "left": 2, "total": 6, "imgs": ["images/product-5.jpg", "images/product-1.2.jpg", "images/product-1.jpg"], "off": 30}, {"id": 24, "name": "Rubbermaid Brute Container 121 L", "brand": "Rubbermaid", "cat": "Other Equipment", "sub": "Other Equipment", "old": 1850000, "price": 1480000, "left": 14, "total": 25, "imgs": ["images/product-7.jpg", "images/product-1.4.jpg", "images/product-3.jpg"], "off": 20}, {"id": 25, "name": "Rubbermaid Spray Mop Kit", "brand": "Rubbermaid", "cat": "Other Equipment", "sub": "Other Equipment", "old": 980000, "price": 735000, "left": 8, "total": 20, "imgs": ["images/product-1.1.jpg", "images/product1.png", "images/product-5.jpg"], "off": 25}, {"id": 26, "name": "Rubbermaid Paper Towel Dispenser", "brand": "Rubbermaid", "cat": "Other Equipment", "sub": "Other Equipment", "old": 1150000, "price": 862500, "left": 11, "total": 20, "imgs": ["images/product-1.3.png", "images/product-2.jpg", "images/product-7.jpg"], "off": 25}, {"id": 27, "name": "Bravo Trittico Executive 305", "brand": "Bravo", "cat": "Gelato & Soft Ice", "sub": "Gelato & Soft Ice", "old": 320000000, "price": 288000000, "left": 1, "total": 3, "imgs": ["images/product-1.5.jpg", "images/product-4.jpg", "images/product-1.1.jpg"], "off": 10}, {"id": 28, "name": "TFN Milk Frother Pro 1.2 L", "brand": "TFN", "cat": "Coffee Machine", "sub": "Accessories", "old": 2450000, "price": 1715000, "left": 12, "total": 40, "imgs": ["images/product-1.jpg", "images/product-6.jpg", "images/product-1.3.png"], "off": 30}, {"id": 29, "name": "Bravo Water Treatment Pro 1200", "brand": "Bravo", "cat": "Water Treatment", "sub": "Water Treatment", "old": 8900000, "price": 6675000, "left": 6, "total": 15, "imgs": ["images/product-3.jpg", "images/product-8.jpg", "images/product-1.5.jpg"], "off": 25}, {"id": 30, "name": "Bravo Filter Cartridge C500", "brand": "Bravo", "cat": "Water Treatment", "sub": "Water Treatment", "old": 1250000, "price": 1000000, "left": 24, "total": 60, "imgs": ["images/product-5.jpg", "images/product-1.2.jpg", "images/product-1.jpg"], "off": 20}, {"id": 31, "name": "Manual Brew Starter Kit V60", "brand": "Toffin", "cat": "Manual Brew", "sub": "Manual Brew", "old": 450000, "price": 337500, "left": 19, "total": 50, "imgs": ["images/product-7.jpg", "images/product-1.4.jpg", "images/product-3.jpg"], "off": 25}, {"id": 32, "name": "TFN Drip Kettle Gooseneck 1 L", "brand": "TFN", "cat": "Manual Brew", "sub": "Manual Brew", "old": 520000, "price": 416000, "left": 4, "total": 25, "imgs": ["images/product-1.1.jpg", "images/product1.png", "images/product-5.jpg"], "off": 20}, {"id": 33, "name": "Nuova Simonelli Prontobar Silent", "brand": "Nuova Simonelli", "cat": "Coffee Machine", "sub": "Fully Automatic Machine", "old": 205000000, "price": 174250000, "left": 1, "total": 3, "imgs": ["images/product-1.3.png", "images/product-2.jpg", "images/product-7.jpg"], "off": 15}, {"id": 34, "name": "TFN Automatic Coffee Brewer 5 L", "brand": "TFN", "cat": "Coffee Machine", "sub": "Automatic Coffee Brewers", "old": 6400000, "price": 4800000, "left": 5, "total": 12, "imgs": ["images/product-1.5.jpg", "images/product-4.jpg", "images/product-1.1.jpg"], "off": 25}, {"id": 35, "name": "TFN Tamper 58 mm Walnut", "brand": "TFN", "cat": "Coffee Machine", "sub": "Accessories", "old": 425000, "price": 340000, "left": 16, "total": 40, "imgs": ["images/product-1.jpg", "images/product-6.jpg", "images/product-1.3.png"], "off": 20}, {"id": 36, "name": "Nuova Simonelli Aurelia Wave 3 Group", "brand": "Nuova Simonelli", "cat": "Coffee Machine", "sub": "Commercial Espresso Machine", "old": 340000000, "price": 289000000, "left": 2, "total": 4, "imgs": ["images/product-3.jpg", "images/product-8.jpg", "images/product-1.5.jpg"], "off": 15}];   /* @@DATA-END@@ */

	var BATCH = 15, armed = false, loading = false;
	var state = { q: '', cats: [], brands: [], min: 0, max: 0, sort: 'relevan', shown: 0, list: [] };
	var filter = document.querySelector('[data-tf-filter]');
	var sentinel = document.querySelector('[data-fs-sentinel]'), status = document.querySelector('[data-fs-status]');
	var statusText = status.querySelector('[data-fs-status-text]'), moreBtn = status.querySelector('[data-fs-more]');
	var countEl = document.querySelector('[data-fs-count]'), activeEl = document.querySelector('[data-fs-active]'), badgeEl = document.querySelector('[data-fs-badge]');

	function apply() {
		var ql = state.q.toLowerCase();
		var list = DATA.filter(function (p) {
			if (ql && (p.name + ' ' + p.brand + ' ' + p.cat + ' ' + p.sub).toLowerCase().indexOf(ql) < 0) return false;
			if (state.cats.length && state.cats.indexOf(p.cat) < 0 && state.cats.indexOf(p.sub) < 0) return false;   /* sama dengan tf-plp.js */
			if (state.brands.length && state.brands.indexOf(p.brand) < 0) return false;
			if (state.min && p.price < state.min) return false;
			if (state.max && p.price > state.max) return false;
			return true;
		});
		var s = state.sort;
		if (s === 'price') list.sort(function (a, b) { return a.price - b.price; });
		else if (s === 'price_desc') list.sort(function (a, b) { return b.price - a.price; });
		else if (s === 'diskon') list.sort(function (a, b) { return b.off - a.off; });
		state.list = list; state.shown = 0;
		grid.innerHTML = '';
		renderActive();
		if (!list.length) {
			grid.innerHTML = '<div class="tf-plp__empty"><strong>Tidak ada produk flash sale yang cocok</strong>Coba longgarkan filter, atau lihat <a href="#" data-fs-goto-next>flash sale berikutnya</a>.</div>';
			status.classList.add('is-done'); statusText.textContent = ''; countEl.textContent = '0 produk';
			return;
		}
		countEl.textContent = list.length + ' produk';
		loadMore(true);
	}

	/* kartu = kartu produk global (.product + .fs-*, galeri .tf-pg), tanpa bar stok (dihapus 13 Okt atas permintaan Rendi) */
	function card(p) {
		return '<div class="product">'
			+ '<div class="text"><p class="product__list__item--icons"><span><a href="#" aria-label="Simpan ke favorit"><svg class="tf-i tf-i--2x" aria-hidden="true"><use href="#i-heart"/></svg></a></span></p></div>'
			+ '<div class="tf-pg swiper" data-tf-pg><div class="swiper-wrapper">'
			+ p.imgs.map(function (src, n) { return '<div class="swiper-slide"><a href="detail-produk-flashsale.html" class="img-prod"><img class="img-fluid" src="' + src + '" alt="' + esc(p.name) + ' - foto ' + (n + 1) + '" draggable="false"' + (n ? ' loading="lazy"' : '') + '></a></div>'; }).join('')
			+ '</div><div class="swiper-pagination tf-pg__dots"></div></div>'
			+ '<div class="fs-tag">' + p.off + '%</div>'
			+ '<div class="fs-body">'
			+ '<h3 class="fs-product-title"><a href="detail-produk-flashsale.html">' + esc(p.name) + '</a></h3>'
			+ '<div class="fs-price-row"><div class="fs-price"><span class="fs-price-new">' + rupiah(p.price) + '</span><span class="fs-price-old">' + rupiah(p.old) + '</span></div></div>'
			+ '<div class="fs-actions"><a class="fs-btn fs-btn-primary" href="#">Add to cart</a></div>'
			+ '</div></div>';
	}
	function skeleton(n) {
		var h = '';
		for (var i = 0; i < n; i++) h += '<div class="tf-skel" data-fs-skel><div class="tf-skel__media"></div><div class="tf-skel__body"><span class="tf-skel__line"></span><span class="tf-skel__line tf-skel__line--w60"></span><span class="tf-skel__line tf-skel__line--w40"></span></div></div>';
		return h;
	}

	/* ---------- auto-load per 15 (pengganti ?page= produksi) ---------- */
	function loadMore(first) {
		if (loading || state.shown >= state.list.length) return;
		loading = true;
		var next = state.list.slice(state.shown, state.shown + BATCH);
		status.classList.remove('is-done'); status.classList.add('is-loading'); statusText.textContent = 'Memuat produk…';
		grid.insertAdjacentHTML('beforeend', skeleton(next.length));
		setTimeout(function () {
			grid.querySelectorAll('[data-fs-skel]').forEach(function (el) { el.remove(); });
			grid.insertAdjacentHTML('beforeend', next.map(card).join(''));
			if (window.tfSliders) window.tfSliders.init(grid);
			state.shown += next.length; loading = false; status.classList.remove('is-loading');
			if (state.shown >= state.list.length) { status.classList.add('is-done'); statusText.textContent = 'Semua ' + state.list.length + ' produk flash sale sudah ditampilkan'; }
			else statusText.textContent = 'Menampilkan ' + state.shown + ' dari ' + state.list.length + ' produk';
		}, first ? 120 : 800);   /* jeda meniru permintaan ke server */
	}
	var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (es) { if (armed && es[0].isIntersecting) loadMore(); }, { rootMargin: '0px 0px 80px 0px' }) : null;
	if (io) io.observe(sentinel); else status.classList.add('is-manual');
	var lastCheck = 0;
	function onScroll() {
		armed = true;
		var now = Date.now(); if (now - lastCheck < 120) return; lastCheck = now;
		if (sentinel.offsetParent && sentinel.getBoundingClientRect().top - window.innerHeight < 80) loadMore();
	}
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll);
	moreBtn.addEventListener('click', function () { armed = true; loadMore(); });

	/* ---------- filter sidebar ---------- */
	function num(sel) { return parseInt((filter.querySelector(sel).value || '0').replace(/\D/g, ''), 10) || 0; }
	function syncFromInputs() {
		state.cats = [].map.call(filter.querySelectorAll('input[data-cat]:checked'), function (i) { return i.value; });
		state.brands = [].map.call(filter.querySelectorAll('input[data-brand]:checked'), function (i) { return i.value; });
		state.min = num('[data-price-min]'); state.max = num('[data-price-max]');
	}
	/* sub-kategori tampil hanya bila induknya dicentang (sama dengan daftar produk) */
	function syncSubs() {
		filter.querySelectorAll('.tf-filter__sub[data-parent]').forEach(function (row) {
			var parent = filter.querySelector('input[data-cat="' + row.getAttribute('data-parent').replace(/"/g, '\\"') + '"]'), show = parent && parent.checked;
			row.hidden = !show; if (!show) row.querySelector('input').checked = false;
		});
	}
	filter.addEventListener('change', function (e) { if (e.target.matches('input[type="checkbox"]')) { syncSubs(); syncFromInputs(); apply(); } });
	filter.addEventListener('click', function (e) {
		var t = e.target.closest('[data-tf-filter-toggle]');
		if (t) { var g = t.parentElement; g.classList.toggle('is-open'); t.setAttribute('aria-expanded', g.classList.contains('is-open')); return; }
		if (e.target.closest('[data-tf-filter-reset]')) { resetAll(); return; }
		var more = e.target.closest('[data-tf-filter-more]');
		if (more) { more.parentElement.querySelectorAll('.tf-filter__opt[hidden]').forEach(function (o) { o.hidden = false; }); more.remove(); }
	});
	filter.querySelectorAll('[data-price-min], [data-price-max]').forEach(function (inp) { inp.addEventListener('change', function () { syncFromInputs(); apply(); }); });
	function resetAll() {
		filter.querySelectorAll('input[type="checkbox"]').forEach(function (i) { i.checked = false; });
		filter.querySelectorAll('[data-price-min], [data-price-max]').forEach(function (i) { i.value = ''; });
		qEl.value = ''; state.q = '';
		syncSubs(); syncFromInputs(); apply();
	}

	/* ---------- tag filter aktif ---------- */
	function renderActive() {
		var tags = [];
		if (state.q) tags.push(['q', state.q, '"' + state.q + '"']);
		state.cats.forEach(function (c) { tags.push(['cat', c, c]); });
		state.brands.forEach(function (b) { tags.push(['brand', b, b]); });
		if (state.min || state.max) tags.push(['price', '', (state.min ? rupiah(state.min) : 'Rp 0') + ' – ' + (state.max ? rupiah(state.max) : '∞')]);
		activeEl.innerHTML = tags.map(function (t) {
			return '<button type="button" class="tf-plp__tag" data-tag-type="' + t[0] + '" data-tag-val="' + esc(t[1]) + '">' + esc(t[2]) + '<svg class="tf-i" aria-hidden="true"><use href="#i-x"/></svg></button>';
		}).join('');
		badgeEl.textContent = tags.length ? String(tags.length) : '';
	}
	activeEl.addEventListener('click', function (e) {
		var tag = e.target.closest('[data-tag-type]'); if (!tag) return;
		var type = tag.getAttribute('data-tag-type'), val = tag.getAttribute('data-tag-val');
		var sel = { cat: 'input[data-cat]', brand: 'input[data-brand]' }[type];
		if (sel) filter.querySelectorAll(sel).forEach(function (i) { if (i.value === val) i.checked = false; });
		if (type === 'q') { qEl.value = ''; state.q = ''; }
		if (type === 'price') filter.querySelectorAll('[data-price-min], [data-price-max]').forEach(function (i) { i.value = ''; });
		syncSubs(); syncFromInputs(); apply();
	});

	/* ---------- pencarian di dalam flash sale (kolom "Search..." produksi) ---------- */
	var qEl = document.querySelector('[data-fs-q]'), qTimer;
	qEl.addEventListener('input', function () { clearTimeout(qTimer); qTimer = setTimeout(function () { state.q = qEl.value.trim(); apply(); }, 250); });

	/* ---------- urutkan (nilai price / price_desc = parameter order produksi) ---------- */
	var sortEl = document.querySelector('[data-fs-sort]');
	sortEl.addEventListener('change', function () { state.sort = sortEl.value; apply(); });

	/* ---------- drawer filter (ponsel) ---------- */
	var backdrop = document.querySelector('[data-fs-backdrop]');
	function openDrawer(open) {
		filter.classList.toggle('is-open', open); backdrop.classList.toggle('is-open', open);
		document.body.classList.toggle('tf-lock', open);
	}
	document.querySelectorAll('[data-fs-open]').forEach(function (b) { b.addEventListener('click', function () { openDrawer(true); }); });
	document.querySelectorAll('[data-fs-close]').forEach(function (b) { b.addEventListener('click', function () { openDrawer(false); }); });
	backdrop.addEventListener('click', function () { openDrawer(false); });
	document.addEventListener('keydown', function (e) { if (e.key === 'Escape') openDrawer(false); });

	/* ---------- favorit & tautan "flash sale berikutnya" di keadaan kosong ---------- */
	grid.addEventListener('click', function (e) {
		var a = e.target.closest('.product__list__item--icons a');
		if (a) { e.preventDefault(); a.classList.toggle('selected'); return; }
		if (e.target.closest('[data-fs-goto-next]')) { e.preventDefault(); showTab('fs-next', true); window.scrollTo({ top: 0, behavior: 'smooth' }); }
	});

	/* ---------- parameter URL: ?order=price|price_desc, ?q=, ?cat= (nama kategori induk), #akan-datang ---------- */
	var params = new URLSearchParams(location.search);
	var order = params.get('order');
	if (order && sortEl.querySelector('option[value="' + order + '"]')) { sortEl.value = order; state.sort = order; }
	if (params.get('q')) { qEl.value = params.get('q'); state.q = qEl.value.trim(); }
	if (params.get('cat')) filter.querySelectorAll('input[data-cat]').forEach(function (i) { if (i.value === params.get('cat')) i.checked = true; });
	if (location.hash === '#akan-datang') showTab('fs-next', false);

	syncSubs(); syncFromInputs(); apply();
}());
