/* =====================================================================
   Toffin v2 · tf-sliders.js — SATU tempat untuk semua slider Swiper 11.
   Pakai: beri elemen .swiper atribut data-tf-slider="<preset>", atau
   data-tf-pg untuk galeri foto di kartu produk. Panah dicari di
   pembungkus terdekat (.tf-carousel / .tf-bundle__carousel) atau di dalam
   slider itu sendiri (hero), hanya anak langsung supaya tidak tertukar.
   Konten yang dimuat belakangan (mis. tf-plp.js per batch) cukup memanggil
   window.tfSliders.init(elemenInduk). Aman dipanggil berulang.
   Memerlukan Swiper 11 (CDN) dimuat lebih dulu.
   ===================================================================== */
(function () {
	'use strict';

	var PRESETS = {
		/* hero poster homepage: 1,15 / 2 / 3, berputar otomatis */
		hero: {
			loop: true, speed: 600, slidesPerView: 1.15, spaceBetween: 12,
			autoplay: { delay: 5500, disableOnInteraction: false },
			breakpoints: { 576: { slidesPerView: 2, spaceBetween: 14 }, 992: { slidesPerView: 3, spaceBetween: 16 } }
		},
		/* Flash Sale & Flash Sale Berikutnya */
		flash: {
			slidesPerView: 2, spaceBetween: 8,
			breakpoints: { 768: { slidesPerView: 3, spaceBetween: 10 }, 992: { slidesPerView: 4, spaceBetween: 12 }, 1200: { slidesPerView: 5, spaceBetween: 12 } }
		},
		/* slider kartu produk (Produk Populer, dst.) */
		products: {
			slidesPerView: 2, spaceBetween: 5,
			breakpoints: { 768: { slidesPerView: 3, spaceBetween: 5 }, 992: { slidesPerView: 4, spaceBetween: 10 }, 1200: { slidesPerView: 5, spaceBetween: 10 } }
		},
		/* produk terkait di halaman detail (Aksesoris, Alternatif): maks. 4 kartu tampil, sisanya digeser */
		related: {
			slidesPerView: 2, spaceBetween: 8, watchOverflow: true,
			breakpoints: { 768: { slidesPerView: 3, spaceBetween: 10 }, 992: { slidesPerView: 4, spaceBetween: 10 }, 1200: { slidesPerView: 4, spaceBetween: 12 } }
		},
		/* kartu paket bundling berbanner di homepage */
		bundles: {
			slidesPerView: 2, spaceBetween: 8, watchOverflow: true,
			breakpoints: { 576: { slidesPerView: 3, spaceBetween: 10 }, 992: { slidesPerView: 4, spaceBetween: 10 }, 1200: { slidesPerView: 5, spaceBetween: 12 } }
		},
		/* daftar voucher di tab Toffin Rewards (homepage); panel tersembunyi sampai tab dibuka → observer.
		   Lebar slide dari CSS (100% - 20px, sisa = intipan voucher berikutnya); slidesOffsetAfter = lebar intipan
		   supaya slide terakhir tetap rata kiri, tidak menyisakan potongan voucher sebelumnya di kiri */
		vouchers: {
			slidesPerView: 'auto', spaceBetween: 8, slidesOffsetAfter: 20, watchOverflow: true, observer: true, observeParents: true
		},
		/* isi paket di product-bundle.html */
		'bundle-items': {
			slidesPerView: 2.2, spaceBetween: 8, watchOverflow: true,
			breakpoints: { 576: { slidesPerView: 2.5, spaceBetween: 10 }, 768: { slidesPerView: 3, spaceBetween: 10 }, 992: { slidesPerView: 4, spaceBetween: 10 }, 1200: { slidesPerView: 5, spaceBetween: 10 } }   /* 5 kartu tampil di desktop, sisanya digeser (Rendi 2026-10-09) */
		}
	};

	/* galeri foto di kartu produk: geser di foto, dot pagination, tanpa panah */
	var GALLERY = { nested: true, loop: true, speed: 350, threshold: 6 };

	function navFor(el) {
		/* tombol panah di luar slider: pembungkus [data-tf-slider-wrap] berisi [data-tf-prev] / [data-tf-next] */
		var wrap = el.closest('[data-tf-slider-wrap]');
		if (wrap) return { nextEl: wrap.querySelector('[data-tf-next]'), prevEl: wrap.querySelector('[data-tf-prev]') };
		var scope = el.querySelector(':scope > .swiper-button-next') ? el
			: (el.closest('.tf-carousel, .tf-bundle__carousel') || el.parentElement);
		var next = scope.querySelector(':scope > .swiper-button-next');
		var prev = scope.querySelector(':scope > .swiper-button-prev');
		return next || prev ? { nextEl: next, prevEl: prev } : undefined;
	}

	function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }

	function init(root) {
		if (!window.Swiper) return;
		root = root || document;
		/* slider luar dulu, baru galeri foto yang bersarang di dalamnya */
		root.querySelectorAll('[data-tf-slider]').forEach(function (el) {
			if (el.swiper) return;
			var preset = PRESETS[el.getAttribute('data-tf-slider')];
			if (!preset) return;
			new window.Swiper(el, assign({ navigation: navFor(el) }, preset));
		});
		root.querySelectorAll('[data-tf-pg]').forEach(function (el) {
			if (el.swiper || el.querySelectorAll('.swiper-slide').length < 2) return;
			new window.Swiper(el, assign({ pagination: { el: el.querySelector('.tf-pg__dots'), clickable: true } }, GALLERY));
		});
	}

	window.tfSliders = { init: init, presets: PRESETS };
	init();
})();
