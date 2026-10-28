/* =====================================================================
   Toffin v2 · tf-product.js — halaman detail produk (MIGRASI.md langkah 23).
   - Galeri: Swiper utama + thumbnail; hover zoom (lensa) di desktop; klik foto → lightbox.
   - Varian (data-pid): foto, harga, ketersediaan, flash sale (data-fs) ikut berganti.
   - Jumlah utama mentok di stok lokal (tombol + nonaktif saat mentok); tambahan diambil manual
     lewat stepper cabang yang muncul saat mentok. Total & subtotal = lokal + cabang.
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
		/* lensa hanya saat kursor tepat di atas foto (bukan di panah / tombol aksi), supaya klik panah terlihat menggeser */
		var r = main.getBoundingClientRect(), inside = !!(e.target.closest && e.target.closest('[data-pd-main] .pd-gallery__zoom'));
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
			var lensEl = g.querySelector('[data-pd-lens]');
			new Swiper(main, { spaceBetween: 10, navigation: { nextEl: g.querySelector('.swiper-button-next'), prevEl: g.querySelector('.swiper-button-prev') }, thumbs: { swiper: ts }, on: { slideChange: function () { if (lensEl) lensEl.hidden = true; } } });   /* ganti foto → lensa disembunyikan dulu */
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
	/* lightbox foto besar: klik foto utama; panah, thumbnail, zoom 2× (klik foto / tombol, geser saat zoom), Esc, ←/→, swipe */
	var lb = document.querySelector('[data-pd-lb]'), lbImg = lb.querySelector('[data-pd-lb-img]'), lbCap = lb.querySelector('[data-pd-lb-cap]'), lbTh = lb.querySelector('[data-pd-lb-thumbs]'), lbZoom = lb.querySelector('[data-pd-lb-zoom]'), lbList = [], lbI = 0, lbRoot = null;
	function lbSetZoom(on) { lb.classList.toggle('is-zoom', on); lbZoom.setAttribute('aria-pressed', on); lbImg.style.transform = ''; lbPan = { x: 0, y: 0 }; }
	function lbShow(i) {
		lbI = (i + lbList.length) % lbList.length; lbSetZoom(false);
		lbImg.src = lbList[lbI].src; lbImg.alt = lbList[lbI].alt; lbCap.textContent = (lbI + 1) + ' / ' + lbList.length;
		lbTh.querySelectorAll('button').forEach(function (b, n) { b.classList.toggle('is-on', n === lbI); if (n === lbI && b.scrollIntoView) b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); });
	}
	function lbOpen(root, i) {
		lbRoot = root;
		lbList = [].slice.call(root.querySelectorAll('[data-pd-main] .swiper-slide img')).map(function (im) { return { src: im.getAttribute('src'), alt: im.getAttribute('alt') || '' }; });
		lbTh.innerHTML = lbList.map(function (im, n) { return '<button type="button" data-n="' + n + '" aria-label="Foto ' + (n + 1) + '"><img src="' + im.src + '" alt=""></button>'; }).join('');
		lb.hidden = false; document.body.classList.add('tf-lock'); lbShow(i);
	}
	function lbClose() { lb.hidden = true; lbSetZoom(false); document.body.classList.remove('tf-lock'); var main = lbRoot && lbRoot.querySelector('[data-pd-main]'); if (main && main.swiper) main.swiper.slideTo(lbI); }
	document.addEventListener('click', function (e) {
		var z = e.target.closest('[data-pd-zoom]'); if (z) { lbOpen(z.closest('.pd') || document, +z.getAttribute('data-pd-zoom')); return; }
		if (lb.hidden) return;
		if (e.target.closest('[data-pd-lb-close]')) { lbClose(); return; }
		if (e.target.closest('[data-pd-lb-zoom]')) { lbSetZoom(!lb.classList.contains('is-zoom')); return; }
		if (e.target.closest('[data-pd-lb-prev]')) { lbShow(lbI - 1); return; }
		if (e.target.closest('[data-pd-lb-next]')) { lbShow(lbI + 1); return; }
		var t = e.target.closest('[data-pd-lb-thumbs] button'); if (t) { lbShow(+t.getAttribute('data-n')); return; }
		if (e.target === lbImg) { if (!lbDragged) lbSetZoom(!lb.classList.contains('is-zoom')); return; }
		if (e.target.closest('[data-pd-lb-stage]') && !e.target.closest('.pd-lb__fig img')) lbClose();   /* klik area kosong panggung = tutup */
	});
	document.addEventListener('keydown', function (e) { if (lb.hidden) return; if (e.key === 'Escape') lbClose(); if (e.key === 'ArrowLeft') lbShow(lbI - 1); if (e.key === 'ArrowRight') lbShow(lbI + 1); });
	/* geser: saat zoom = pan foto; tanpa zoom = swipe ganti foto */
	var lbDown = null, lbDragged = false, lbPan = { x: 0, y: 0 };
	lbImg.addEventListener('pointerdown', function (e) { lbDown = { x: e.clientX, y: e.clientY, px: lbPan.x, py: lbPan.y }; lbDragged = false; lbImg.setPointerCapture(e.pointerId); if (lb.classList.contains('is-zoom')) lb.classList.add('is-drag'); });
	lbImg.addEventListener('pointermove', function (e) {
		if (!lbDown) return; var dx = e.clientX - lbDown.x, dy = e.clientY - lbDown.y;
		if (Math.abs(dx) > 4 || Math.abs(dy) > 4) lbDragged = true;
		if (lb.classList.contains('is-zoom')) { lbPan.x = lbDown.px + dx; lbPan.y = lbDown.py + dy; lbImg.style.transform = 'scale(2) translate(' + (lbPan.x / 2) + 'px,' + (lbPan.y / 2) + 'px)'; }
	});
	lbImg.addEventListener('pointerup', function (e) {
		if (!lbDown) return; var dx = e.clientX - lbDown.x; lb.classList.remove('is-drag');
		if (!lb.classList.contains('is-zoom') && Math.abs(dx) > 50) { lbShow(lbI + (dx < 0 ? 1 : -1)); lbDragged = true; }
		lbDown = null; if (!lb.classList.contains('is-zoom')) lbPan = { x: 0, y: 0 };
	});
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
		function showBranch(on) { root.querySelectorAll('.pd-branch').forEach(function (b) { b.hidden = !on; }); }   /* rekomendasi cabang hanya saat jumlah mentok di stok lokal / stok kosong */
		var plus = q.querySelector('button[data-q="1"]');
		function set(n) {
			var max = local(), want = Math.max(max > 0 ? 1 : 0, Math.min(max, n || 0));   /* mentok di stok lokal; tambahan lewat cabang */
			var atMax = max === 0 || want >= max;
			inp.value = want;
			if (plus) plus.disabled = atMax;
			if (!atMax) root.querySelectorAll('[data-pd-qty-branch] input').forEach(function (bi) { bi.value = 0; });   /* turun di bawah stok: cabang dikosongkan */
			if (atMax) root.querySelectorAll('[data-pd-branch]').forEach(function (b) { b.nextElementSibling.hidden = false; b.setAttribute('aria-expanded', 'true'); });
			if (hint) { hint.hidden = !(max > 0 && atMax); var hn = hint.querySelector('[data-pd-hint-n]'); if (hn) hn.textContent = max; }
			showBranch(atMax);
			root.querySelectorAll('[data-pd-local]').forEach(function (el) { el.hidden = !(max > 0 && atMax); });   /* angka stok lokal tampil saat mentok */
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
			root.querySelectorAll('[data-pd-clamp]').forEach(clamp);   /* panel yang baru tampil baru bisa diukur */
		}); });
	});
	/* potongan "Lihat selengkapnya" (pola Tokopedia): deskripsi dipotong ±7 baris dengan pudar, spesifikasi 6 baris pertama.
	   Hanya dipasang bila isinya memang lebih panjang; isi panel dibungkus .pd-clamp, tombol ikut di dalam panel sehingga
	   ikut tersembunyi saat tab berganti. */
	var SPEC_ROWS = 6;
	function clamp(p) {
		if (p.hidden || p._clamp) return;
		p._clamp = true;
		var spec = p.getAttribute('data-pd-clamp') === 'spec', body = document.createElement('div'), label;
		body.className = 'pd-clamp';
		while (p.firstChild) body.appendChild(p.firstChild);
		p.appendChild(body);
		if (spec) {
			var n = body.querySelectorAll('.pd-spec').length;
			if (n <= SPEC_ROWS) return;
			body.classList.add('is-rows'); label = 'Lihat semua spesifikasi (' + n + ')';
		} else {
			body.classList.add('is-clamp');
			if (body.scrollHeight <= body.clientHeight + 24) { body.classList.remove('is-clamp'); return; }   /* cuma lebih sedikit: tampilkan utuh */
			label = 'Lihat selengkapnya';
		}
		var btn = document.createElement('button');
		btn.type = 'button'; btn.className = 'pd-more'; btn.setAttribute('aria-expanded', 'false');
		btn.innerHTML = '<span>' + label + '</span><svg class="tf-i" aria-hidden="true"><use href="#i-chevron-down"/></svg>';
		p.appendChild(btn);
		btn.addEventListener('click', function () {
			var open = btn.getAttribute('aria-expanded') !== 'true';
			body.classList.toggle(spec ? 'is-rows' : 'is-clamp', !open);
			btn.setAttribute('aria-expanded', open);
			btn.querySelector('span').textContent = open ? 'Sembunyikan' : label;
			if (!open && p.getBoundingClientRect().top < 0) p.scrollIntoView({ behavior: 'smooth', block: 'start' });   /* tutup dari bawah: kembali ke awal panel */
		});
	}
	function clampAll() { root.querySelectorAll('[data-pd-clamp]').forEach(clamp); }
	if (document.readyState === 'complete') clampAll(); else window.addEventListener('load', clampAll);   /* tunggu font & gambar supaya tinggi tepat */
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
		jQuery('#pd-video').on('show.bs.modal', function () { var f = this.querySelector('iframe'); f.src = f.getAttribute('data-pd-video-src'); })
			.on('hidden.bs.modal', function () { this.querySelector('iframe').src = 'about:blank'; });
	}
	initGallery();
	var v0 = root.querySelector('input[name=variant_id]:checked'); if (v0) document.body.classList.toggle('is-fs', v0.getAttribute('data-fs') === '1');
}());
