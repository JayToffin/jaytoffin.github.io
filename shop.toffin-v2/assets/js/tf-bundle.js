/* =====================================================================
   Toffin v2 · tf-bundle.js — halaman Paket Bundling.
   - Slider isi paket: preset "bundle-items" di tf-sliders.js.
   - Tombol "Add to cart" mengisi modal #bundle-variant dengan produk paket
     yang diklik (dibaca dari markup: data-name / data-img / data-variants).
   - Chip navigasi menandai paket yang sedang terlihat.
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

	/* chip navigasi: tandai paket yang sedang di layar */
	var chips = [].slice.call(document.querySelectorAll('.tf-bundle-nav__chip'));
	var secs = chips.map(function (c) { return document.querySelector(c.getAttribute('href')); });
	if (chips.length && 'IntersectionObserver' in window) {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (e) {
				if (!e.isIntersecting) return;
				var i = secs.indexOf(e.target);
				if (i >= 0) chips.forEach(function (c, n) { c.classList.toggle('is-active', n === i); });
			});
		}, { rootMargin: '-140px 0px -60% 0px' });
		secs.forEach(function (s) { if (s) io.observe(s); });
	}
})();
