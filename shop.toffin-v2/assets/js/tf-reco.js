/* =====================================================================
   Toffin v2 · tf-reco.js — section "Rekomendasi Untukmu" di homepage.
   Tab (Untuk Kamu / Terlaris / Promo / Terbaru / Ulasan) mengganti isi grid
   dengan daftar berbeda dari katalog contoh di bawah. Kartu = KARTU PRODUK
   GLOBAL (.product + .fs-*), galeri foto diaktifkan lewat tf-sliders.js.
   Di backend nanti: tiap tab = satu query (rekomendasi, terlaris, promo,
   terbaru, rating tertinggi); markup kartu tetap sama. Rating & jumlah terjual
   tidak tampil di kartu (hanya di detail produk); dipakai untuk mengurutkan tab.
   ===================================================================== */
(function () {
	'use strict';
	var grid = document.querySelector('[data-tf-reco-grid]');
	var tabs = [].slice.call(document.querySelectorAll('[data-reco]'));
	var more = document.querySelector('[data-tf-reco-more]');
	if (!grid || !tabs.length) return;

	/* katalog contoh: [nama, harga, harga coret (0 = normal), foto, rating, terjual, hari sejak rilis] */
	var P = [
		['Nuova Simonelli Appia Life 2 Group (Red)', 230000000, 250000000, ['product1.png', 'product-1.2.jpg', 'product-1.3.png'], 4.9, 128, 40],
		['Victoria Arduino Eagle One Prima', 118500000, 0, ['product-2.jpg', 'product-1.4.jpg', 'product-7.jpg'], 5.0, 46, 6],
		['Nuova Simonelli Oscar Mood', 24900000, 27500000, ['product-3.jpg', 'product-1.5.jpg', 'product-6.jpg'], 4.8, 312, 120],
		['VBM Domobar Junior HX', 32800000, 0, ['product-4.jpg', 'product-1.2.jpg', 'product-8.jpg'], 4.7, 87, 15],
		['Victoria Arduino Black Eagle Maverick 2 Group', 398000000, 0, ['product-5.jpg', 'product-1.1.jpg', 'product-2.jpg'], 5.0, 19, 3],
		['Nuova Simonelli Aurelia Wave 3 Group', 315000000, 340000000, ['product-6.jpg', 'product-1.3.png', 'product-4.jpg'], 4.9, 54, 60],
		['Eureka Mignon Specialita 55 mm', 9950000, 11200000, ['grinder.jpg', 'product-8.jpg', 'product-1.5.jpg'], 4.8, 540, 200],
		['Eureka Zeus 65 mm', 38500000, 0, ['grinder.jpg', 'product-8.jpg', 'product-1.4.jpg'], 4.9, 73, 9],
		['Victoria Arduino Mythos MY75', 62000000, 66500000, ['product-8.jpg', 'product-7.jpg', 'grinder.jpg'], 5.0, 28, 2],
		['Bravo Water Treatment Pro 1200', 7850000, 8900000, ['product-1.2.jpg', 'product-1.3.png', 'product-4.jpg'], 4.7, 210, 90],
		['Bravo Filter Cartridge C500', 1250000, 0, ['product-1.3.png', 'product-1.2.jpg', 'product-5.jpg'], 4.8, 964, 300],
		['TFN Milk Pitcher 600 ml Stainless', 285000, 350000, ['product-1.4.jpg', 'product-1.5.jpg', 'product-3.jpg'], 4.9, 1830, 250],
		['TFN Tamper 58 mm Walnut', 425000, 0, ['product-1.5.jpg', 'product-1.4.jpg', 'product-6.jpg'], 4.8, 720, 18],
		['Toffin Espresso Blend 1 kg', 245000, 0, ['product-2.jpg', 'product-3.jpg', 'product-5.jpg'], 4.9, 2650, 400],
		['Manual Brew Starter Kit V60', 385000, 450000, ['product-5.jpg', 'product-6.jpg', 'product-2.jpg'], 4.9, 3100, 1],
		['Nuova Simonelli Prontobar Silent', 189000000, 205000000, ['product-1.1.jpg', 'product-1.jpg', 'product-7.jpg'], 4.6, 41, 4]
	].map(function (r, i) { return { id: i, name: r[0], price: r[1], old: r[2], imgs: r[3], rating: r[4], sold: r[5], age: r[6] }; });

	function by(key, desc) { return function (a, b) { return desc ? b[key] - a[key] : a[key] - b[key]; }; }
	var LISTS = {
		untuk:    function () { return [0, 1, 2, 3, 6, 7, 9, 12, 14, 4].map(function (i) { return P[i]; }); },   /* campuran, 10 */
		terlaris: function () { return P.slice().sort(by('sold', true)).slice(0, 5); },                       /* 5 */
		promo:    function () { return P.filter(function (p) { return p.old; }).slice(0, 7); },                 /* hanya diskon, 7 */
		terbaru:  function () { return P.slice().sort(by('age')).slice(0, 8); },                               /* 8 */
		ulasan:   function () { return P.slice().sort(function (a, b) { return b.rating - a.rating || b.sold - a.sold; }).slice(0, 4); }   /* 4 */
	};
	/* "Lihat Semua Produk" ikut tab: urutan yang dikenali product-list.html (?sort=) */
	var MORE = { terlaris: 'product-list.html?sort=terlaris', terbaru: 'product-list.html?sort=terbaru' };

	function rupiah(n) { return 'Rp ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
	function esc(s) { return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

	function card(p) {
		var off = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
		var n = esc(p.name);
		return '<div class="product">'
			+ '<div class="text"><p class="product__list__item--icons"><span><a href="#" aria-label="Simpan ke favorit"><svg class="tf-i" aria-hidden="true"><use href="#i-heart"/></svg></a></span></p></div>'
			+ '<div class="tf-pg swiper" data-tf-pg><div class="swiper-wrapper">'
			+ p.imgs.map(function (src, i) { return '<div class="swiper-slide"><a href="product-single.html" class="img-prod"><img class="img-fluid" src="images/' + src + '" alt="' + n + ' - foto ' + (i + 1) + '" draggable="false"' + (i ? ' loading="lazy"' : '') + '></a></div>'; }).join('')
			+ '</div><div class="swiper-pagination tf-pg__dots"></div></div>'
			+ (off ? '<div class="fs-tag">' + off + '%</div>' : '')
			+ '<div class="fs-body">'
			+ '<h3 class="fs-product-title"><a href="product-single.html">' + n + '</a></h3>'
			+ '<div class="fs-price-row"><div class="fs-price"><span class="fs-price-new">' + rupiah(p.price) + '</span>' + (off ? '<span class="fs-price-old">' + rupiah(p.old) + '</span>' : '') + '</div></div>'
			+ '<div class="fs-actions"><a class="fs-btn fs-btn-primary" href="#">Add to cart</a></div>'
			+ '</div></div>';
	}

	function show(key) {
		tabs.forEach(function (t) {
			var on = t.getAttribute('data-reco') === key;
			t.classList.toggle('is-active', on);
			t.setAttribute('aria-selected', on ? 'true' : 'false');
		});
		grid.classList.add('is-switching');
		grid.innerHTML = LISTS[key]().map(card).join('');
		if (window.tfSliders) window.tfSliders.init(grid);
		if (more) more.setAttribute('href', MORE[key] || 'product-list.html');
		requestAnimationFrame(function () { grid.classList.remove('is-switching'); });
	}

	tabs.forEach(function (t) { t.addEventListener('click', function () { show(t.getAttribute('data-reco')); }); });
	var first = tabs.filter(function (t) { return t.classList.contains('is-active'); })[0] || tabs[0];
	show(first.getAttribute('data-reco'));
})();
