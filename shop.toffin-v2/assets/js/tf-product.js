/* =====================================================================
   Toffin v2 · tf-product.js — halaman detail produk (MIGRASI.md langkah 23).
   - Galeri: Swiper utama + thumbnail; hover zoom (lensa) di desktop; klik foto → lightbox.
   - Varian (data-pid): foto, harga, ketersediaan, flash sale (data-fs) ikut berganti.
   - Jumlah bebas: kelebihan di atas stok lokal otomatis dialokasikan ke cabang terdekat;
     total & subtotal dihitung dari lokal + cabang; stok lokal hanya ditampilkan saat terlampaui.
   - Tab deskripsi/spesifikasi, tooltip info cabang, countdown flash sale, bar beli bawah (ponsel), salin link.
   Vanilla JS; modal video & bagikan dibuka Bootstrap 4 lewat data-toggle.
   ===================================================================== */

(function () {
	'use strict';
	var root = document.querySelector('[data-pd-page]');
	if (!root) return;
	/* hover zoom: lensa menampilkan foto 2,2× mengikuti kursor (desktop) */
	document.addEventListener('mousemove', function (e) {
		if (window.matchMedia('(hover: none)').matches) return;
		var main = root.querySelector('[data-pd-main]'), lens = root.querySelector('[data-pd-lens]'); if (!main || !lens) return;
		var r = main.getBoundingClientRect(), inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
		lens.hidden = !inside; if (!inside) return;
		var img = main.querySelector('.swiper-slide-active img') || main.querySelector('img');
		lens.style.backgroundImage = 'url("' + img.getAttribute('src') + '")';
		lens.style.backgroundPosition = ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%';
	});
	/* galeri: Swiper utama + thumbnail */
	function initGallery() {
		root.querySelectorAll('[data-pd-gallery]').forEach(function (g) {
			var main = g.querySelector('[data-pd-main]'), th = g.querySelector('[data-pd-thumbs]');
			if (main.swiper) { main.swiper.update(); th.swiper.update(); return; }
			var ts = new Swiper(th, { slidesPerView: 5, spaceBetween: 8, watchSlidesProgress: true, breakpoints: { 576: { slidesPerView: 6 } } });
			new Swiper(main, { spaceBetween: 10, navigation: { nextEl: g.querySelector('.swiper-button-next'), prevEl: g.querySelector('.swiper-button-prev') }, thumbs: { swiper: ts } });
		});
	}
	/* varian (seperti produksi: data-pid): ganti nama, harga, foto utama, dan ketersediaan */
	document.querySelectorAll('[data-pd-variant]').forEach(function (v) { v.addEventListener('change', function (e) {
		var inp = e.target, pid = inp.value, ok = inp.getAttribute('data-avail') === 'true';
		document.body.classList.toggle('is-fs', inp.getAttribute('data-fs') === '1');   /* flash sale berlaku per varian */
		root.querySelectorAll('[data-pd-varname]').forEach(function (el) { el.textContent = inp.getAttribute('data-name'); });
		root.querySelectorAll('[data-pd-price]').forEach(function (el) { el.textContent = inp.getAttribute('data-price-text'); });
		var main = root.querySelector('[data-pd-main]');
		if (main && main.swiper) { var slides = [].slice.call(main.querySelectorAll('.swiper-slide')); var i = slides.findIndex(function (sl) { return sl.getAttribute('data-pid') === pid; }); if (i >= 0) main.swiper.slideTo(i); }
		var first = root.querySelector('[data-pd-main] .swiper-slide[data-pid="' + pid + '"] img'); if (first) root.querySelectorAll('[data-pd-thumb]').forEach(function (im) { im.src = first.getAttribute('src'); });
		root.querySelectorAll('[data-pd-buybox], .pdb-buy').forEach(function (box) { box.classList.toggle('is-soldout', !ok); });
		root.querySelectorAll('[data-pd-local]').forEach(function (el) { el.setAttribute('data-n', ok ? '8' : '0'); el.querySelector('b').textContent = ok ? '8' : '0'; });
		root.querySelectorAll('[data-pd-qty] input').forEach(function (i) { i.dispatchEvent(new Event('change')); });
	}); });
	/* lightbox foto besar: klik foto utama; panah, thumbnail, Esc, ←/→ */
	var lb = document.querySelector('[data-pd-lb]'), lbImg = lb.querySelector('[data-pd-lb-img]'), lbCap = lb.querySelector('[data-pd-lb-cap]'), lbTh = lb.querySelector('[data-pd-lb-thumbs]'), lbList = [], lbI = 0;
	function lbShow(i) { lbI = (i + lbList.length) % lbList.length; lbImg.src = lbList[lbI].src; lbImg.alt = lbList[lbI].alt; lbCap.textContent = (lbI + 1) + ' / ' + lbList.length + (lbList[lbI].alt ? ' · ' + lbList[lbI].alt : ''); lbTh.querySelectorAll('button').forEach(function (b, n) { b.classList.toggle('is-on', n === lbI); }); }
	function lbOpen(root, i) {
		lbList = [].slice.call(root.querySelectorAll('[data-pd-main] .swiper-slide img')).map(function (im) { return { src: im.getAttribute('src'), alt: im.getAttribute('alt') || '' }; });
		lbTh.innerHTML = lbList.map(function (im, n) { return '<button type="button" data-n="' + n + '"><img src="' + im.src + '" alt=""></button>'; }).join('');
		lb.hidden = false; document.body.classList.add('tf-lock'); lbShow(i);
	}
	function lbClose() { lb.hidden = true; document.body.classList.remove('tf-lock'); var main = root.querySelector('[data-pd-main]'); if (main && main.swiper) main.swiper.slideTo(lbI); }
	document.addEventListener('click', function (e) {
		var z = e.target.closest('[data-pd-zoom]'); if (z) { lbOpen(root, +z.getAttribute('data-pd-zoom')); return; }
		if (e.target.closest('[data-pd-lb-close]') || e.target === lb) { lbClose(); return; }
		if (e.target.closest('[data-pd-lb-prev]')) lbShow(lbI - 1);
		if (e.target.closest('[data-pd-lb-next]')) lbShow(lbI + 1);
		var t = e.target.closest('[data-pd-lb-thumbs] button'); if (t) lbShow(+t.getAttribute('data-n'));
	});
	document.addEventListener('keydown', function (e) { if (lb.hidden) return; if (e.key === 'Escape') lbClose(); if (e.key === 'ArrowLeft') lbShow(lbI - 1); if (e.key === 'ArrowRight') lbShow(lbI + 1); });
	/* qty + subtotal */
	document.querySelectorAll('[data-pd-qty]').forEach(function (q) {
		var inp = q.querySelector('input'), sub = root.querySelector('[data-pd-subtotal]');
		function price() { var r = root.querySelector('input[name=variant_id]:checked'); return r ? +r.getAttribute('data-price') : 32000000; }
		var hint = root.querySelector('[data-pd-hint]'), tot = root.querySelector('[data-pd-total]');
		function local() { var el = root.querySelector('[data-pd-local]'); return el ? +el.getAttribute('data-n') : 99; }
		function branchQty() { var n = 0; root.querySelectorAll('[data-pd-qty-branch] input').forEach(function (i) { n += parseInt(i.value, 10) || 0; }); return n; }
		var short = root.querySelector('[data-pd-short]');
		function refresh() {
			var want = parseInt(inp.value, 10) || 0, max = local(), l = Math.min(want, max), b = branchQty(), n = l + b;
			if (sub) sub.textContent = 'Rp ' + (price() * n).toLocaleString('id-ID');
			if (tot) { tot.hidden = b === 0; tot.querySelector('[data-pd-total-n]').textContent = n; tot.querySelector('[data-pd-total-local]').textContent = l; tot.querySelector('[data-pd-total-branch]').textContent = b; }
			if (short) { var miss = want - n; short.hidden = miss <= 0; if (miss > 0) short.textContent = miss + ' unit belum terpenuhi dari cabang mana pun. Kurangi jumlah atau tanya tim Toffin.'; }
		}
		function set(n) {
			var max = local(), want = Math.max(max > 0 ? 1 : 0, Math.min(999, n || 0));
			if (max === 0) {   /* varian habis: jumlah lokal 0, tanpa hint & alokasi otomatis; cabang dibuka manual */
				inp.value = 0; if (hint) hint.hidden = true; root.querySelectorAll('[data-pd-local]').forEach(function (el) { el.hidden = true; }); refresh(); return;
			}
			inp.value = want;   /* bebas melebihi stok lokal: sisanya ditutup cabang */
			var over = Math.max(0, want - max);
			root.querySelectorAll('[data-pd-qty-branch]').forEach(function (q) { var bi = q.querySelector('input'), mx = +q.getAttribute('data-max') || 99, take = Math.min(over, mx); bi.value = take; over -= take; });
			if (want > max) root.querySelectorAll('[data-pd-branch]').forEach(function (b) { b.nextElementSibling.hidden = false; b.setAttribute('aria-expanded', 'true'); });
			if (hint) hint.hidden = !(want > max);
			root.querySelectorAll('[data-pd-local]').forEach(function (el) { el.hidden = !(want > max); });   /* angka stok lokal hanya tampil saat permintaan melebihi stok */
			refresh();
		}
		root.querySelectorAll('[data-pd-qty-branch]').forEach(function (q) { var bi = q.querySelector('input'), mx = +q.getAttribute('data-max') || 99; q.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { bi.value = Math.max(0, Math.min(mx, (parseInt(bi.value, 10) || 0) + parseInt(b.getAttribute('data-q'), 10))); refresh(); }); }); bi.addEventListener('change', function () { bi.value = Math.max(0, Math.min(mx, parseInt(bi.value, 10) || 0)); refresh(); }); });
		root.addEventListener('change', function (e) { if (e.target.name === 'variant_id') set(parseInt(inp.value, 10)); });
		q.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { set(parseInt(inp.value, 10) + parseInt(b.getAttribute('data-q'), 10)); }); });
		inp.addEventListener('change', function () { set(parseInt(inp.value, 10)); });
	});
	/* rekomendasi cabang: buka/tutup; stepper per cabang */
	document.querySelectorAll('[data-pd-branch]').forEach(function (b) { b.addEventListener('click', function () { var pnl = b.nextElementSibling, open = pnl.hidden; pnl.hidden = !open; b.setAttribute('aria-expanded', open); }); });
	/* tooltip info: ketuk untuk buka/tutup (ponsel), klik di luar menutup */
	document.querySelectorAll('.pd-tip__btn').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); var t = b.parentElement, open = !t.classList.contains('is-open'); document.querySelectorAll('.pd-tip.is-open').forEach(function (x) { x.classList.remove('is-open'); }); t.classList.toggle('is-open', open); b.setAttribute('aria-expanded', open); }); });
	document.addEventListener('click', function () { document.querySelectorAll('.pd-tip.is-open').forEach(function (x) { x.classList.remove('is-open'); x.querySelector('.pd-tip__btn').setAttribute('aria-expanded', 'false'); }); });
	/* tab (usulan A) */
	document.querySelectorAll('[data-pd-tabs]').forEach(function (t) {
		t.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () {
			t.querySelectorAll('button').forEach(function (x) { x.classList.toggle('is-active', x === b); });
			root.querySelectorAll('[data-panel]').forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== b.getAttribute('data-tab'); });
		}); });
	});
	/* countdown flash sale */
	function tick() {
		document.querySelectorAll('[data-pd-count]').forEach(function (c) {
			var d = Math.max(0, (new Date(c.getAttribute('data-end')) - Date.now()) / 1000 | 0), b = c.querySelectorAll('b');
			var v = [d / 86400 | 0, d / 3600 % 24 | 0, d / 60 % 60 | 0, d % 60];
			b.forEach(function (el, i) { el.textContent = String(v[i]).padStart(2, '0'); });
		});
	}
	tick(); setInterval(tick, 1000);
	/* bar beli bawah: tampil bila tombol Beli utama sudah tidak terlihat */
	function stickyBar() {
		var bar = root.querySelector('[data-pd-sticky]'), cta = root.querySelector('.pd-cta__cart');
		if (!bar || !cta) return;
		var r = cta.getBoundingClientRect();
		bar.classList.toggle('is-on', r.bottom < 0 || r.top > window.innerHeight);
	}
	window.addEventListener('scroll', stickyBar, { passive: true }); window.addEventListener('resize', stickyBar); stickyBar();
	/* favorit: tandai terpilih (seperti ikon hati kartu produk) */
	document.querySelectorAll('[data-pd-fav]').forEach(function (b) { b.addEventListener('click', function () { var on = !b.classList.contains('is-on'); b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); }); });
	/* salin link */
	document.querySelectorAll('[data-pd-copy]').forEach(function (b) { b.addEventListener('click', function () {
		var s = b.querySelector('span'), inp = document.querySelector('[data-pd-share-url]'), url = inp ? inp.value : location.href;
		try { navigator.clipboard.writeText(url); } catch (e) { if (inp) { inp.select(); document.execCommand('copy'); } }
		b.classList.add('is-done'); s.textContent = 'Tersalin'; setTimeout(function () { b.classList.remove('is-done'); s.textContent = 'Salin'; }, 1600);
	}); });
	/* video: iframe diisi saat modal dibuka (autoplay), dikosongkan saat ditutup supaya suara berhenti */
	if (window.jQuery) {
		jQuery('#pd-video').on('show.bs.modal', function () { var f = this.querySelector('iframe'); f.src = f.getAttribute('data-pd-video-src'); document.body.classList.add('pd-video-open'); })
			.on('hidden.bs.modal', function () { this.querySelector('iframe').src = 'about:blank'; document.body.classList.remove('pd-video-open'); });
	}
	initGallery();
	var v0 = root.querySelector('input[name=variant_id]:checked'); if (v0) document.body.classList.toggle('is-fs', v0.getAttribute('data-fs') === '1');
}());
