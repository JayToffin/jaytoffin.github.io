/* =====================================================================
   Toffin v2 · tf-bundle.js — halaman promo bundling (product-bundle.html).
   - Add to cart: bila ada produk di paket yang punya varian (data-variants),
     buka popup #bundle-variant dan wajib pilih semua varian dulu; bila tidak
     ada, paket langsung masuk keranjang (contoh: angka keranjang + notifikasi).
     Alur produksi: POST /apiv2/bundle/cart dengan bundle_id + product_id.
   - Paket > 10 produk: ubin "+N produk lainnya" membuka sisa slide.
   - Chip brand mesin + urutkan untuk grid kartu.
   Vanilla JS; modal dibuka lewat Bootstrap 4 (jQuery tiruan bundle Odoo).
   ===================================================================== */
(function () {
	'use strict';
	function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

	/* ---------- keranjang (contoh tanpa backend) ---------- */
	var toastEl = null, toastTimer;
	function toast(html) {
		if (!toastEl) {
			toastEl = document.createElement('div'); toastEl.className = 'tf-toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite');
			document.body.appendChild(toastEl);
		}
		toastEl.innerHTML = '<svg class="tf-i" aria-hidden="true"><use href="#i-circle-check"/></svg><span>' + html + '</span><a href="cart.html">Lihat keranjang</a>';
		toastEl.classList.remove('is-on'); void toastEl.offsetWidth; toastEl.classList.add('is-on');
		clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 3200);
	}
	function addToCart(bundle, btn) {
		var title = (bundle.querySelector('.fs-product-title, .tf-bundle__title') || {}).textContent || 'Paket';
		document.querySelectorAll('.tf-util__badge').forEach(function (b) { b.textContent = (parseInt(b.textContent, 10) || 0) + 1; b.classList.remove('is-bump'); void b.offsetWidth; b.classList.add('is-bump'); });
		toast('Paket <b>' + esc(title.trim()) + '</b> masuk keranjang');
		if (btn) {
			var html = btn.innerHTML;
			btn.classList.add('is-added'); btn.disabled = true;
			btn.innerHTML = '<svg class="tf-i" aria-hidden="true"><use href="#i-check"/></svg> Masuk keranjang';
			setTimeout(function () { btn.classList.remove('is-added'); btn.disabled = false; btn.innerHTML = html; }, 1800);
		}
	}

	/* ---------- Add to cart: popup varian bila perlu ---------- */
	var modal = document.getElementById('bundle-variant');
	var list = modal && modal.querySelector('[data-bv-list]'), pkgEl = modal && modal.querySelector('[data-bv-pkg]'), form = modal && modal.querySelector('[data-bv-form]');
	var current = null;
	function variantsOf(el) { return (el.getAttribute('data-variants') || '').split('|').filter(Boolean); }
	document.addEventListener('click', function (e) {
		var btn = e.target.closest('[data-bundle-cta]'); if (!btn) return;
		var bundle = btn.closest('[data-tf-bundle]'), items = [].slice.call(bundle.querySelectorAll('[data-name]'));
		/* produk sama bisa muncul dua kali di markup (slider & daftar isi): ambil sekali per nama */
		var seen = {}; items = items.filter(function (p) { var n = p.getAttribute('data-name'); if (seen[n]) return false; seen[n] = 1; return true; });
		var need = items.filter(function (p) { return variantsOf(p).length; });
		if (!need.length || !modal) { addToCart(bundle, btn); return; }   /* tanpa varian: langsung masuk keranjang */
		current = { bundle: bundle, btn: btn };
		if (pkgEl) pkgEl.innerHTML = '<b>' + esc(((bundle.querySelector('.fs-product-title, .tf-bundle__title') || {}).textContent || '').trim()) + '</b> · ' + need.length + ' produk perlu dipilih variannya';
		list.innerHTML = items.map(function (p) {
			var v = variantsOf(p);
			return '<div class="bv-item' + (v.length ? ' bv-item--need' : '') + '">'
				+ '<div class="bv-thumb"><img src="' + p.getAttribute('data-img') + '" alt=""></div>'
				+ '<div class="bv-info"><p class="bv-name">' + esc(p.getAttribute('data-name')) + '</p>'
				+ (v.length
					? '<label class="bv-label"><span>Varian warna</span><select class="bv-select" required><option value="" selected disabled>Pilih varian</option>' + v.map(function (o) { return '<option>' + esc(o) + '</option>'; }).join('') + '</select></label><span class="bv-err">Pilih varian dulu</span>'
					: '')   /* produk tanpa varian: cukup nama */
				+ '</div></div>';
		}).join('');
		if (window.jQuery) window.jQuery(modal).modal('show');
	});
	if (form) {
		form.addEventListener('change', function (e) { var it = e.target.closest('.bv-item'); if (it) it.classList.remove('is-invalid'); });
		form.addEventListener('submit', function (e) {
			e.preventDefault();
			var bad = [].filter.call(list.querySelectorAll('.bv-select'), function (s) { var no = !s.value; s.closest('.bv-item').classList.toggle('is-invalid', no); return no; });
			if (bad.length) { bad[0].focus(); bad[0].closest('.bv-item').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); return; }
			if (window.jQuery) window.jQuery(modal).modal('hide');
			if (current) addToCart(current.bundle, current.btn);
		});
	}

	/* ---------- isi paket: panel di atas foto kartu, tanpa memanjangkan kartu (lihat product-bundle.css) ---------- */
	function placeIsi(det) {
		var card = det.closest('.tf-pk'), sum = det.querySelector('summary');
		card.style.setProperty('--isi-bottom', Math.round(card.getBoundingClientRect().bottom - sum.getBoundingClientRect().top + 6) + 'px');
	}
	document.querySelectorAll('.tf-pk__isi').forEach(function (det) {
		var label = det.querySelector('summary').firstChild;
		det.addEventListener('toggle', function () {
			if (det.open) {
				document.querySelectorAll('.tf-pk__isi[open]').forEach(function (o) { if (o !== det) o.open = false; });   /* satu panel terbuka */
				placeIsi(det);
			}
			label.nodeValue = det.open ? 'Tutup daftar produk ' : 'Lihat semua produk ';
			det.closest('.tf-pk').querySelectorAll('[data-pk-open]').forEach(function (b) { b.setAttribute('aria-expanded', det.open); });
		});
	});
	window.addEventListener('resize', function () { document.querySelectorAll('.tf-pk__isi[open]').forEach(placeIsi); });
	/* klik foto / judul kartu = buka-tutup panel yang sama (kartu mewakili paket, bukan satu produk) */
	document.addEventListener('click', function (e) {
		var t = e.target.closest('[data-pk-open]'); if (!t) return;
		var det = t.closest('.tf-pk').querySelector('.tf-pk__isi'); det.open = !det.open;
	});

	/* ---------- paket > 10 produk: ubin "+N produk lainnya" membuka slide tersembunyi ---------- */
	document.querySelectorAll('[data-bundle-more]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			var el = btn.closest('.swiper'), tile = btn.closest('[data-bundle-more-slide]');
			el.querySelectorAll('.swiper-slide[hidden]').forEach(function (s) { s.hidden = false; });
			if (tile) tile.parentNode.removeChild(tile);
			if (el.swiper) { el.swiper.update(); el.swiper.slideNext(); }
		});
	});

	/* ---------- chip brand mesin + urutkan ---------- */
	var grid = document.querySelector('[data-pk-grid]');
	if (grid) {
		var cards = [].slice.call(grid.querySelectorAll('[data-pk-card]')), chips = [].slice.call(document.querySelectorAll('[data-pk-brand]'));
		var sortEl = document.querySelector('[data-pk-sort]'), countEl = document.querySelector('[data-pk-count]'), brand = '';
		var empty = document.createElement('p'); empty.className = 'tf-pk-empty'; empty.textContent = 'Belum ada paket untuk brand ini.';
		function n(c, k) { return +c.getAttribute('data-' + k); }
		function render() {
			var s = sortEl.value, list = cards.slice();
			if (s === 'save') list.sort(function (a, b) { return n(b, 'save') - n(a, 'save') || n(a, 'price') - n(b, 'price'); });
			else if (s === 'price') list.sort(function (a, b) { return n(a, 'price') - n(b, 'price'); });
			else if (s === 'price_desc') list.sort(function (a, b) { return n(b, 'price') - n(a, 'price'); });
			else list.sort(function (a, b) { return n(a, 'order') - n(b, 'order'); });
			var shown = 0;
			list.forEach(function (c) { var on = !brand || c.getAttribute('data-brand') === brand; c.hidden = !on; if (on) shown++; grid.appendChild(c); });
			if (!shown) grid.appendChild(empty); else if (empty.parentNode) empty.remove();
			countEl.textContent = shown;
			chips.forEach(function (c) { c.classList.toggle('is-on', c.getAttribute('data-pk-brand') === brand); });
		}
		chips.forEach(function (c) { c.addEventListener('click', function () { brand = c.getAttribute('data-pk-brand'); render(); }); });
		sortEl.addEventListener('change', render);
	}
})();
