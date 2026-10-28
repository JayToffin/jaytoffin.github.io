/* =====================================================================
   Toffin v2 · tf-plp.js — daftar produk: katalog contoh, filter, urutkan,
   auto-load per batch (IntersectionObserver), drawer filter di ponsel.
   Vanilla JS, tanpa jQuery. Katalog di sini hanya contoh statis.
   ===================================================================== */
(function () {
	'use strict';
	var grid = document.querySelector('[data-tf-plp-grid]');
	if (!grid) return;

	/* ---------- pohon kategori = shop.toffin.id (produksi, menu Category, Okt 2026) ----------
	   [induk, [sub…]]; induk tanpa sub = kategori tunggal. Di Odoo: product.public.category (parent_id). */
	var CATS = [
		['Beverage Maker', []],
		['Coffee Machine', ['Home Espresso Machine', 'Commercial Espresso Machine', 'Fully Automatic Machine', 'Automatic Coffee Brewers', 'Accessories & Parts']],
		['Ingredients', ['Sauce', 'Syrup', 'Coffee Beans', 'Bakery Ingredients', 'Pure Extract', 'Concentrate', 'Powder', 'Ancillary', 'Amarena Cherry']],
		['Coffee Grinder', ['Manual Grinders', 'Espresso Grinders', 'Accessories & Parts']],
		['Water Treatment', []],
		['Manual Brew', ['Pour Over', 'Immersion', 'Coffee Press', 'Kettle', 'Server', 'Scale', 'Tea Equipment', 'Cold Brew Coffee', 'Syphon & Beam Heater', 'Paper Filter', 'Accessories & Parts']],
		['Gelato & Soft Ice', ['Gelato Machine', 'Soft Ice Machine', 'Gelato Ingredients', 'Soft Ice Ingredients', 'Accessories']],
		['Hot Kitchen Equipment', ['Oven', 'Dishwasher', 'Griddle', 'Burner', 'Fryer', 'Pasta Cooker', 'Grill', 'Wok', 'Toaster', 'Other Equipment']],
		['Cold Kitchen Equipment', ['Chiller & Freezer', 'Ice Maker', 'Juicer & Blender', 'Pastry Showcase']],
		['Other Equipment', ['Sinks & Taps', 'Serveware', 'Cream Dispenser', 'Soda Maker', 'Drink Mixer', 'Food Service', 'Safety', 'Cleaning', 'Utility Refuse']],
		['Cleaner', []],
		['SMEG', ['Coffee', 'Blender & Juicer', 'Kitchen', 'Bakeware', 'MDA']]
	];
	var CAT_ALIAS = { 'Hot Kitchen': 'Hot Kitchen Equipment', 'Cold Kitchen': 'Cold Kitchen Equipment' };   /* tautan lama di homepage */

	/* ---------- katalog contoh: 28 produk dasar × 3 varian = 84 ---------- */
	var BASE = [
		['Nuova Simonelli Appia Life 2 Group', 'Nuova Simonelli', 'Coffee Machine', 'Commercial Espresso Machine', 230000000, 250000000, 'product-1.jpg', 4.9, 128],
		['Victoria Arduino Eagle One Prima', 'Victoria Arduino', 'Coffee Machine', 'Home Espresso Machine', 118500000, 0, 'product-2.jpg', 5.0, 46],
		['Nuova Simonelli Oscar Mood', 'Nuova Simonelli', 'Coffee Machine', 'Home Espresso Machine', 24900000, 27500000, 'product-3.jpg', 4.8, 312],
		['VBM Domobar Junior HX', 'VBM', 'Coffee Machine', 'Home Espresso Machine', 32800000, 0, 'product-4.jpg', 4.7, 87],
		['Victoria Arduino Black Eagle Maverick 2 Group', 'Victoria Arduino', 'Coffee Machine', 'Commercial Espresso Machine', 398000000, 0, 'product-5.jpg', 5.0, 19],
		['Nuova Simonelli Aurelia Wave 3 Group', 'Nuova Simonelli', 'Coffee Machine', 'Commercial Espresso Machine', 315000000, 340000000, 'product-6.jpg', 4.9, 54],
		['Eureka Mignon Specialita 55 mm', 'Eureka', 'Coffee Grinder', 'Espresso Grinders', 9950000, 11200000, 'grinder.jpg', 4.8, 540],
		['Eureka Zeus 65 mm', 'Eureka', 'Coffee Grinder', 'Espresso Grinders', 38500000, 0, 'grinder.jpg', 4.9, 73],
		['Victoria Arduino Mythos MY75', 'Victoria Arduino', 'Coffee Grinder', 'Espresso Grinders', 62000000, 0, 'product-8.jpg', 5.0, 28],
		['Nuova Simonelli Prontobar Silent Fully Automatic', 'Nuova Simonelli', 'Coffee Machine', 'Fully Automatic Machine', 189000000, 205000000, 'product-1.1.jpg', 4.6, 41],
		['Bravo Water Treatment Pro 1200', 'Bravo', 'Water Treatment', '', 7850000, 8900000, 'product-1.2.jpg', 4.7, 210],
		['Bravo Filter Cartridge C500', 'Bravo', 'Water Treatment', '', 1250000, 0, 'product-1.3.png', 4.8, 964],
		['TFN Milk Pitcher 600 ml Stainless', 'TFN', 'Coffee Machine', 'Accessories & Parts', 285000, 350000, 'product-1.4.jpg', 4.9, 1830],
		['TFN Tamper 58 mm Walnut', 'TFN', 'Coffee Machine', 'Accessories & Parts', 425000, 0, 'product-1.5.jpg', 4.8, 720],
		['Toffin Espresso Blend 1 kg', 'Toffin', 'Ingredients', 'Coffee Beans', 245000, 0, 'product-2.jpg', 4.9, 2650],
		['Toffin Chocolate Powder 1 kg', 'Toffin', 'Ingredients', 'Powder', 168000, 190000, 'product-3.jpg', 4.8, 1420],
		['TFN Automatic Coffee Brewer 5 L', 'TFN', 'Coffee Machine', 'Automatic Coffee Brewers', 6400000, 0, 'product-4.jpg', 4.6, 96],
		['Manual Brew Starter Kit V60', 'Toffin', 'Manual Brew', 'Pour Over', 385000, 450000, 'product-5.jpg', 4.9, 3100],
		['TFN Gelato Display 12 Pan', 'TFN', 'Gelato & Soft Ice', 'Gelato Machine', 58000000, 0, 'product-6.jpg', 4.7, 12],
		['TFN Ice Machine 80 kg/day', 'TFN', 'Cold Kitchen Equipment', 'Ice Maker', 21500000, 23900000, 'product-7.jpg', 4.7, 64],
		['Toffin Syrup Hazelnut 750 ml', 'Toffin', 'Ingredients', 'Syrup', 135000, 155000, 'product-3.jpg', 4.9, 1980],
		['Comandante C40 MK4 Manual Grinder', 'Comandante', 'Coffee Grinder', 'Manual Grinders', 5250000, 0, 'grinder.jpg', 4.9, 230],
		['Hario Buono Kettle 1.2 L', 'Hario', 'Manual Brew', 'Kettle', 695000, 790000, 'product-1.4.jpg', 4.8, 860],
		['SMEG Espresso Machine ECF02', 'SMEG', 'SMEG', 'Coffee', 9990000, 11490000, 'product-2.jpg', 4.8, 140],
		['TFN Combi Oven 6 Tray', 'TFN', 'Hot Kitchen Equipment', 'Oven', 48500000, 0, 'product-6.jpg', 4.7, 22],
		['TFN Cream Dispenser 1 L', 'TFN', 'Other Equipment', 'Cream Dispenser', 1450000, 1650000, 'product-1.5.jpg', 4.8, 410],
		['TFN Hot Water & Beverage Dispenser 20 L', 'TFN', 'Beverage Maker', '', 4750000, 5200000, 'product-4.jpg', 4.7, 120],
		['Toffin Machine Cleaner Tablet 100 pcs', 'Toffin', 'Cleaner', '', 320000, 0, 'product-1.3.png', 4.9, 1260]
	];
	var VARIANT = ['', ' (Black)', ' (White)'];
	/* foto tambahan untuk slider foto kartu (contoh): tiap produk dapat foto utama + 2 foto lain */
	var EXTRA = ['product-1.2.jpg', 'product-1.3.png', 'product-1.4.jpg', 'product-1.5.jpg', 'product-2.jpg', 'product-3.jpg', 'product-4.jpg', 'product-5.jpg', 'product-6.jpg', 'product-7.jpg', 'product-8.jpg', 'grinder.jpg', 'product-1.1.jpg'];
	function photos(main, seed) {
		var out = [main];
		for (var n = 0; out.length < 3; n++) { var f = EXTRA[(seed + n * 5) % EXTRA.length]; if (out.indexOf(f) < 0) out.push(f); }
		return out.map(function (f) { return 'images/' + f; });
	}
	var LOC = ['Jakarta Utara', 'Jakarta Selatan', 'Bandung', 'Surabaya'];
	var BADGE = [null, 'promo', 'ready', 'bundle', null, null];
	var CATALOG = [];
	BASE.forEach(function (b, i) {
		VARIANT.forEach(function (v, k) {
			var price = Math.round(b[4] * (1 + k * 0.035) / 1000) * 1000;
			var old = b[5] ? Math.round(b[5] * (1 + k * 0.035) / 1000) * 1000 : 0;
			CATALOG.push({ id: i * 3 + k, name: b[0] + v, brand: b[1], cat: b[2], sub: b[3], price: price, old: old, img: 'images/' + b[6], imgs: photos(b[6], i * 2 + k), rating: b[7], sold: Math.max(1, Math.round(b[8] / (k + 1))), loc: LOC[(i + k) % LOC.length], badge: BADGE[(i + k) % BADGE.length] });
		});
	});

	/* ---------- state ---------- */
	var BATCH = 20;          /* tampil 20 kartu dulu; sisanya otomatis per 20 saat digulir */
	var armed = false;       /* batch berikutnya baru boleh dimuat setelah pengguna menggulir */
	var state = { q: '', cats: [], brands: [], min: 0, max: 0, sort: 'relevan', shown: 0, list: [] };
	var sentinel = document.querySelector('[data-tf-plp-sentinel]');
	var status = document.querySelector('[data-tf-plp-status]');
	var statusText = status.querySelector('[data-tf-plp-status-text]');
	var moreBtn = status.querySelector('[data-tf-plp-more]');
	var countEl = document.querySelector('[data-tf-plp-count]');
	var activeEl = document.querySelector('[data-tf-plp-active]');
	var badgeEl = document.querySelector('[data-tf-plp-badge]');
	var loading = false;

	function rupiah(n) { return 'Rp ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }

	function apply() {
		var ql = state.q.toLowerCase();
		var list = CATALOG.filter(function (p) {
			if (ql && (p.name + ' ' + p.brand + ' ' + p.cat + ' ' + p.sub).toLowerCase().indexOf(ql) < 0) return false;
			if (state.cats.length && !state.cats.some(function (c) { return c.p === p.cat && (!c.s || c.s === p.sub); })) return false;
			if (state.brands.length && state.brands.indexOf(p.brand) < 0) return false;
			if (state.min && p.price < state.min) return false;
			if (state.max && p.price > state.max) return false;
			return true;
		});
		var s = state.sort;
		if (s === 'termurah') list.sort(function (a, b) { return a.price - b.price; });
		else if (s === 'termahal') list.sort(function (a, b) { return b.price - a.price; });
		else if (s === 'terlaris') list.sort(function (a, b) { return b.sold - a.sold; });
		else if (s === 'terbaru') list.sort(function (a, b) { return b.id - a.id; });
		state.list = list; state.shown = 0;
		grid.innerHTML = '';
		renderActive(); renderContext();
		if (!list.length) {
			grid.innerHTML = '<div class="tf-plp__empty"><strong>Tidak ada produk yang cocok</strong>Coba longgarkan filter atau kata kunci lain.</div>';
			status.classList.add('is-done'); statusText.textContent = ''; countEl.textContent = '0 produk';
			return;
		}
		countEl.textContent = list.length + ' produk';
		loadMore(true);
	}

	/* kartu produk = markup kartu "Produk Populer" di homepage (.product + .fs-*), termasuk slider foto .tf-pg */
	function card(p) {
		var off = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
		var alt = p.name.replace(/"/g, '&quot;');
		return '<div class="product">'
			+ '<div class="text"><p class="product__list__item--icons"><span><a href="#" aria-label="Simpan ke favorit"><svg class="tf-i tf-i--2x" aria-hidden="true"><use href="#i-heart"/></svg></a></span></p></div>'
			+ '<div class="tf-pg swiper" data-tf-pg><div class="swiper-wrapper">'
			+ p.imgs.map(function (src, n) { return '<div class="swiper-slide"><a href="detail-produk.html" class="img-prod"><img class="img-fluid" src="' + src + '" alt="' + alt + ' - foto ' + (n + 1) + '" draggable="false"' + (n ? ' loading="lazy"' : '') + '></a></div>'; }).join('')
			+ '</div><div class="swiper-pagination tf-pg__dots"></div></div>'
			+ (off ? '<div class="fs-tag">' + off + '%</div>' : '')
			+ '<div class="fs-body">'
			+ '<h3 class="fs-product-title"><a href="detail-produk.html">' + p.name + '</a></h3>'
			+ '<div class="fs-price-row"><div class="fs-price"><span class="fs-price-new">' + rupiah(p.price) + '</span>' + (off ? '<span class="fs-price-old">' + rupiah(p.old) + '</span>' : '') + '</div></div>'
			+ '<div class="fs-actions"><a class="fs-btn fs-btn-primary" href="#">Add to cart</a></div>'
			+ '</div></div>';
	}
	function skeleton(n) {
		var h = '';
		for (var i = 0; i < n; i++) h += '<div class="tf-skel" data-tf-skel><div class="tf-skel__media"></div><div class="tf-skel__body"><span class="tf-skel__line"></span><span class="tf-skel__line tf-skel__line--w60"></span><span class="tf-skel__line tf-skel__line--w40"></span></div></div>';
		return h;
	}

	/* ---------- auto-load ---------- */
	function loadMore(first) {
		if (loading || state.shown >= state.list.length) return;
		loading = true;
		var next = state.list.slice(state.shown, state.shown + BATCH);
		status.classList.remove('is-done');
		status.classList.add('is-loading');
		statusText.textContent = 'Memuat produk…';
		grid.insertAdjacentHTML('beforeend', skeleton(Math.min(next.length, BATCH)));
		/* jeda kecil meniru permintaan ke server supaya skeleton terlihat */
		setTimeout(function () {
			grid.querySelectorAll('[data-tf-skel]').forEach(function (el) { el.remove(); });
			grid.insertAdjacentHTML('beforeend', next.map(card).join(''));
			if (window.tfSliders) window.tfSliders.init(grid);   /* galeri foto kartu (tf-sliders.js) */
			state.shown += next.length;
			loading = false;
			status.classList.remove('is-loading');
			if (state.shown >= state.list.length) {
				status.classList.add('is-done');
				statusText.textContent = 'Semua ' + state.list.length + ' produk sudah ditampilkan';
			} else {
				statusText.textContent = 'Menampilkan ' + state.shown + ' dari ' + state.list.length + ' produk';
			}
		}, first ? 120 : 900);   /* jeda meniru permintaan ke server supaya skeleton & status "Memuat" terlihat */
	}
	var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
		if (armed && entries[0].isIntersecting) loadMore();
	}, { rootMargin: '0px 0px 80px 0px' }) : null;   /* tanpa pra-muat jauh: muat saat ujung daftar tiba di layar */
	if (io) io.observe(sentinel); else status.classList.add('is-manual');
	/* cadangan: cek geometri sentinel saat gulir/resize (throttle 120 ms). IO kadang terlambat melapor
	   pada beberapa browser; tanpa IO sama sekali tombol "Muat lebih banyak" tetap tersedia. */
	var lastCheck = 0;
	function nearSentinel() { return sentinel.getBoundingClientRect().top - window.innerHeight < 80; }
	function onScroll() {
		armed = true;
		var now = Date.now();
		if (now - lastCheck < 120) return;   /* throttle sederhana, tanpa rAF */
		lastCheck = now;
		if (nearSentinel()) loadMore();
	}
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll);
	moreBtn.addEventListener('click', function () { armed = true; loadMore(); });

	/* ---------- filter ---------- */
	var filter = document.querySelector('[data-tf-filter]');
	function syncFromInputs() {
		state.cats = catSelection();
		state.brands = [].map.call(filter.querySelectorAll('input[data-brand]:checked'), function (i) { return i.value; });
		state.min = parseInt((filter.querySelector('[data-price-min]').value || '0').replace(/\D/g, ''), 10) || 0;
		state.max = parseInt((filter.querySelector('[data-price-max]').value || '0').replace(/\D/g, ''), 10) || 0;
	}
	/* ---------- kategori: pohon induk › sub (seperti produksi) ----------
	   Induk punya kotak centang (tiga keadaan: semua / sebagian / tidak) dan tombol panah terpisah untuk membuka sub;
	   mencentang induk = semua sub; mencentang sub = mempersempit. 7 induk pertama tampil, sisanya "Lihat semua kategori";
	   kolom cari menyaring induk & sub. Tanpa angka jumlah; sub tanpa produk tetap tampil (redup). */
	function $$(sel, ctx) { return [].slice.call((ctx || filter).querySelectorAll(sel)); }
	function cssq(v) { return String(v).replace(/"/g, '\\"'); }
	function escH(v) { return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
	var catTree = filter.querySelector('[data-cat-tree]'), catQ = filter.querySelector('[data-cat-q]'), catMore = filter.querySelector('[data-cat-more]'), catEmpty = filter.querySelector('[data-cat-empty]');
	var CAT_SHOW = 7;
	var NCAT = {}, NSUB = {};
	CATALOG.forEach(function (p) { NCAT[p.cat] = (NCAT[p.cat] || 0) + 1; if (p.sub) NSUB[p.cat + '|' + p.sub] = (NSUB[p.cat + '|' + p.sub] || 0) + 1; });
	var CHEV = '<svg class="tf-i" aria-hidden="true"><use href="#i-chevron-down"/></svg>';
	catTree.innerHTML = CATS.map(function (c, i) {
		var P = c[0], subs = c[1], n = NCAT[P] || 0;
		return '<div class="tf-cat__node' + (i >= CAT_SHOW ? ' is-more' : '') + (n ? '' : ' is-zero') + '" data-node="' + escH(P) + '">'
			+ '<div class="tf-cat__row"><label class="tf-filter__opt"><input type="checkbox" data-cat-p="' + escH(P) + '"><span class="tf-cat__name">' + escH(P) + '</span></label>'
			+ (subs.length ? '<button type="button" class="tf-cat__x" data-cat-x aria-expanded="false" aria-label="Sub-kategori ' + escH(P) + '">' + CHEV + '</button>' : '<span class="tf-cat__x is-none"></span>') + '</div>'
			+ (subs.length ? '<div class="tf-cat__subs">' + subs.map(function (s) {
				var m = NSUB[P + '|' + s] || 0;
				return '<label class="tf-filter__opt tf-cat__sub' + (m ? '' : ' is-zero') + '"><input type="checkbox" data-cat-s="' + escH(s) + '" data-parent="' + escH(P) + '"><span class="tf-cat__name">' + escH(s) + '</span></label>';
			}).join('') + '</div>' : '')
			+ '</div>';
	}).join('');
	catMore.textContent = 'Lihat semua kategori';
	function catBoxes(P, S) {   /* kotak centang induk + sub-nya (S kosong) atau satu sub */
		if (S) return $$('[data-cat-s="' + cssq(S) + '"][data-parent="' + cssq(P) + '"]');
		return $$('[data-cat-p="' + cssq(P) + '"], [data-cat-s][data-parent="' + cssq(P) + '"]');
	}
	function syncParents() {   /* induk: penuh / sebagian (indeterminate) / kosong; bagian yang terpilih ikut terbuka */
		$$('[data-cat-p]').forEach(function (pb) {
			var node = pb.closest('[data-node]'), subs = $$('[data-cat-s]', node);
			if (subs.length) {
				var on = subs.filter(function (x) { return x.checked; }).length;
				pb.checked = on === subs.length; pb.indeterminate = on > 0 && on < subs.length;
				if (on && on < subs.length) setExp(node, true);
			}
			node.classList.toggle('is-sel', pb.checked || pb.indeterminate);
		});
	}
	function catSelection() {   /* [{p, s}] — s kosong = seluruh induk */
		var out = [];
		$$('[data-cat-p]').forEach(function (pb) {
			var P = pb.getAttribute('data-cat-p');
			if (pb.checked) { out.push({ p: P, s: '' }); return; }
			$$('[data-cat-s]:checked', pb.closest('[data-node]')).forEach(function (x) { out.push({ p: P, s: x.getAttribute('data-cat-s') }); });
		});
		return out;
	}
	function setExp(node, open) { node.classList.toggle('is-exp', open); var b = node.querySelector('[data-cat-x]'); if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false'); }
	catTree.addEventListener('click', function (e) {
		var x = e.target.closest('[data-cat-x]'); if (!x) return;
		var node = x.closest('[data-node]'); setExp(node, !node.classList.contains('is-exp'));
	});
	catMore.addEventListener('click', function () {
		var all = catTree.classList.toggle('is-all');
		catMore.textContent = all ? 'Tampilkan lebih sedikit' : 'Lihat semua kategori';
	});
	function catSearch() {
		var q = catQ.value.trim().toLowerCase(), any = false;
		catTree.classList.toggle('is-search', !!q);
		$$('[data-node]', catTree).forEach(function (node) {
			var pHit = !q || node.getAttribute('data-node').toLowerCase().indexOf(q) > -1, sHit = false;
			$$('.tf-cat__sub', node).forEach(function (l) {
				var hit = !q || pHit || l.textContent.toLowerCase().indexOf(q) > -1;
				l.hidden = !hit; if (q && !pHit && hit) sHit = true;
			});
			node.hidden = !(pHit || sHit); node.classList.toggle('is-hit', !!q && sHit);
			if (!node.hidden) any = true;
		});
		catEmpty.hidden = any; catMore.hidden = !!q;
	}
	catQ.addEventListener('input', catSearch);
	function selectCat(name, only) {   /* dari URL / breadcrumb: pilih induk utuh atau satu sub */
		var hit = CATS.filter(function (c) { return c[0] === name; })[0];
		if (only) $$('[data-cat-p], [data-cat-s]').forEach(function (i) { if (i.getAttribute('data-cat-p') === only || i.getAttribute('data-parent') === only) i.checked = false; });
		if (hit) catBoxes(name).forEach(function (i) { i.checked = true; });
		else CATS.forEach(function (c) { if (c[1].indexOf(name) > -1 && (!only || c[0] === only) && !hit) { hit = c; catBoxes(c[0], name).forEach(function (i) { i.checked = true; }); } });
		syncParents();
		if (hit) { var node = catTree.querySelector('[data-node="' + cssq(hit[0]) + '"]'); setExp(node, true); }
	}

	/* ---------- konteks kategori: judul & breadcrumb ---------- */
	var crumbEl = document.querySelector('[data-tf-plp-crumb]'), baseTitle = null;
	function renderContext() {
		if (baseTitle === null) baseTitle = titleEl ? titleEl.textContent : 'Semua Produk';
		var ps = state.cats.map(function (c) { return c.p; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
		var P = ps.length === 1 ? ps[0] : '';
		var one = P && state.cats.length === 1 && state.cats[0].s ? state.cats[0].s : '';
		if (titleEl) titleEl.textContent = state.q ? baseTitle : P ? (one || P) : baseTitle;
		if (crumbEl) crumbEl.innerHTML = '<a href="index.html">Beranda</a>' + (P
			? '<span><a href="product-list.html">Semua Produk</a></span>' + (one ? '<span><a href="product-list.html?cat=' + encodeURIComponent(P) + '" data-crumb-cat="' + escH(P) + '">' + escH(P) + '</a></span><span>' + escH(one) + '</span>' : '<span>' + escH(P) + '</span>')
			: '<span>Semua Produk</span>');
	}
	if (crumbEl) crumbEl.addEventListener('click', function (e) {
		var a = e.target.closest('[data-crumb-cat]'); if (!a) return;
		e.preventDefault(); selectCat(a.getAttribute('data-crumb-cat'), a.getAttribute('data-crumb-cat')); syncFromInputs(); apply();
	});
	filter.addEventListener('change', function (e) {
		var t = e.target;
		if (t.matches('[data-cat-p]')) {   /* induk: centang/hapus semua sub */
			$$('[data-cat-s][data-parent="' + cssq(t.getAttribute('data-cat-p')) + '"]').forEach(function (x) { x.checked = t.checked; });
			syncParents();
		} else if (t.matches('[data-cat-s]')) syncParents();
		if (t.matches('input[type="checkbox"]')) { syncFromInputs(); apply(); }
	});
	filter.addEventListener('click', function (e) {
		var t = e.target.closest('[data-tf-filter-toggle]');
		if (t) { t.parentElement.classList.toggle('is-open'); return; }
		if (e.target.closest('[data-tf-filter-reset]')) { resetAll(); return; }
		var more = e.target.closest('[data-tf-filter-more]');
		if (more) { more.parentElement.querySelectorAll('.tf-filter__opt[hidden]').forEach(function (o) { o.hidden = false; }); more.remove(); }
	});
	filter.querySelectorAll('[data-price-min], [data-price-max]').forEach(function (inp) {
		inp.addEventListener('change', function () { syncFromInputs(); apply(); });
	});
	function resetAll() {
		filter.querySelectorAll('input[type="checkbox"]').forEach(function (i) { i.checked = false; });
		filter.querySelectorAll('[data-price-min], [data-price-max]').forEach(function (i) { i.value = ''; });
		if (catQ) { catQ.value = ''; catSearch(); }
		syncParents(); syncFromInputs(); apply();
	}
	function renderActive() {
		var tags = [];
		if (state.q) tags.push(['q', '"' + state.q + '"']);
		state.cats.forEach(function (c) { tags.push(['cat', c.s ? c.s : c.p, c.p + '|' + (c.s || '')]); });
		state.brands.forEach(function (b) { tags.push(['brand', b]); });
		if (state.min || state.max) tags.push(['price', (state.min ? rupiah(state.min) : 'Rp0') + ' – ' + (state.max ? rupiah(state.max) : '∞')]);
		activeEl.innerHTML = tags.map(function (t) {
			return '<button type="button" class="tf-plp__tag" data-tag-type="' + t[0] + '" data-tag-val="' + (t[2] || t[1]).replace(/"/g, '&quot;') + '">' + t[1] + '<svg class="tf-i" aria-hidden="true"><use href="#i-x"/></svg></button>';
		}).join('');
		badgeEl.textContent = tags.length ? String(tags.length) : '';
	}
	activeEl.addEventListener('click', function (e) {
		var tag = e.target.closest('[data-tag-type]'); if (!tag) return;
		var type = tag.getAttribute('data-tag-type'), val = tag.getAttribute('data-tag-val');
		if (type === 'cat') { var pv = val.split('|'); catBoxes(pv[0], pv[1]).forEach(function (i) { i.checked = false; }); syncParents(); }
		if (type === 'brand') filter.querySelectorAll('input[data-brand]').forEach(function (i) { if (i.value === val) i.checked = false; });
		if (type === 'q') { state.q = ''; baseTitle = 'Semua Produk'; }
		if (type === 'price') filter.querySelectorAll('[data-price-min], [data-price-max]').forEach(function (i) { i.value = ''; });
		syncFromInputs(); apply();
	});

	/* ---------- urutkan ---------- */
	var sortEl = document.querySelector('[data-tf-plp-sort]');
	sortEl.addEventListener('change', function () { state.sort = sortEl.value; apply(); });
	/* urutan awal dari URL, mis. product-list.html?sort=terlaris (link "Lihat Semua Produk" di homepage) */
	var urlSort = new URLSearchParams(location.search).get('sort');
	if (urlSort && sortEl.querySelector('option[value="' + urlSort + '"]')) { sortEl.value = urlSort; state.sort = urlSort; }

	/* ---------- drawer filter (ponsel) ---------- */
	var backdrop = document.querySelector('[data-tf-plp-backdrop]');
	function openDrawer(open) {
		filter.classList.toggle('is-open', open); backdrop.classList.toggle('is-open', open);
		document.body.classList.toggle('tf-lock', open);
		filter.setAttribute('aria-hidden', open ? 'false' : 'true');
	}
	document.querySelectorAll('[data-tf-plp-open]').forEach(function (b) { b.addEventListener('click', function () { openDrawer(true); }); });
	document.querySelectorAll('[data-tf-plp-close]').forEach(function (b) { b.addEventListener('click', function () { openDrawer(false); }); });
	backdrop.addEventListener('click', function () { openDrawer(false); });
	document.addEventListener('keydown', function (e) { if (e.key === 'Escape') openDrawer(false); });

	/* ---------- favorit: sama seperti homepage (tf-app.js), ikon hati diberi .selected ---------- */
	grid.addEventListener('click', function (e) {
		var a = e.target.closest('.product__list__item--icons a'); if (!a) return;
		e.preventDefault(); a.classList.toggle('selected');
	});

	/* ---------- dari pencarian header (tf-search.js): ?q=…&brand=…&cat=… ---------- */
	var titleEl = document.querySelector('[data-tf-plp-title]');
	var params = new URLSearchParams(location.search);
	state.q = (params.get('q') || '').trim();
	if (state.q && titleEl) titleEl.textContent = 'Hasil untuk "' + state.q + '"';
	var urlBrand = params.get('brand'), urlCat = params.get('cat');
	if (urlBrand) {
		var hit = null;
		filter.querySelectorAll('input[data-brand]').forEach(function (i) { if (i.value === urlBrand) { i.checked = true; hit = i; } });
		/* brand dari halaman Brand yang belum ada di daftar filter (katalog contoh): tambahkan opsinya supaya filter
		   tetap aktif dan daftar menampilkan keadaan kosong, bukan diam-diam semua produk */
		if (!hit) {
			var more = filter.querySelector('[data-tf-filter-more]'), lab = document.createElement('label');
			lab.className = 'tf-filter__opt';
			lab.innerHTML = '<input type="checkbox" data-brand value="' + urlBrand.replace(/"/g, '&quot;') + '" checked> ' + urlBrand.replace(/</g, '&lt;');
			if (more) more.parentNode.insertBefore(lab, more); else filter.appendChild(lab);
		}
		if (titleEl && !state.q) titleEl.textContent = 'Produk ' + urlBrand;
	}
	if (urlCat) selectCat(CAT_ALIAS[urlCat] || urlCat);

	/* ---------- mulai ---------- */
	syncFromInputs(); apply();
})();
