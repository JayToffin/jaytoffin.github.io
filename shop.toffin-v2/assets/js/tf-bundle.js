/* =====================================================================
   Toffin v2 · tf-bundle.js — halaman Paket Bundling.
   - Slider isi paket: preset "bundle-items" di tf-sliders.js.
   - Tombol "Add to cart" mengisi modal #bundle-variant dengan produk paket
     yang diklik (dibaca dari markup: data-name / data-img / data-variants).
   - Paket > 10 produk: ubin "+N produk lainnya" membuka sisa slide.
   Vanilla JS; modalnya sendiri dibuka Bootstrap 4 lewat data-toggle.
   ===================================================================== */
(function () {
	'use strict';

	/* modal varian: isi dari paket yang diklik */
	var modal = document.getElementById('bundle-variant');
	if (!modal) return;
	var list = modal.querySelector('[data-bv-list]');
	document.querySelectorAll('[data-bundle-cta]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			var bundle = btn.closest('.tf-bundle');
			list.innerHTML = '';
			bundle.querySelectorAll('.product[data-name]').forEach(function (p) {
				var name = p.getAttribute('data-name');
				var variants = (p.getAttribute('data-variants') || '').split('|').filter(Boolean);
				var item = document.createElement('div'); item.className = 'bv-item';
				item.innerHTML = '<div class="bv-thumb"><img src="' + p.getAttribute('data-img') + '" alt=""></div>'
					+ '<div class="bv-info"><p class="bv-name">' + name + '</p>'
					+ (variants.length
						? '<label class="bv-label"><span>Varian warna</span><select class="bv-select"><option value="" selected disabled>Pilih varian</option>' + variants.map(function (v) { return '<option>' + v + '</option>'; }).join('') + '</select></label>'
						: '<span class="fs-qty">Tanpa varian</span>')
					+ '</div>';
				list.appendChild(item);
			});
		});
	});

	/* paket > 10 produk: klik ubin "+N produk lainnya" menampilkan slide yang tersembunyi lalu Swiper diukur ulang */
	document.querySelectorAll('[data-bundle-more]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			var el = btn.closest('.swiper'), tile = btn.closest('[data-bundle-more-slide]');
			el.querySelectorAll('.swiper-slide[hidden]').forEach(function (s) { s.hidden = false; });
			if (tile) tile.parentNode.removeChild(tile);
			if (el.swiper) { el.swiper.update(); el.swiper.slideNext(); }
		});
	});
})();
