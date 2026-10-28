/* =====================================================================
   Toffin v2 · tf-success.js — halaman Pesanan Berhasil (success-checkout.html)
   Pembayaran diproses di halaman Xendit; halaman ini = URL kembali setelah lunas.
   Sengaja ringkas; rincian pesanan ada di halaman detail belanja.
   Data: ringkasan dari checkout.html (sessionStorage "tfOrder", ditulis
   tf-checkout.js saat "Bayar sekarang"); bila kosong (halaman dibuka
   langsung) memakai SAMPLE. Produksi: data pesanan dari server (Odoo SO).
   Fitur produksi dipertahankan: nama pemesan, nomor Sales Order, total
   belanja, status "Pesanan diproses", tautan ke detail pesanan.
   Tampilan: struk (total besar, No. pesanan + Salin, status, pemesan, metode).
   ===================================================================== */
(function () {
	'use strict';
	var root = document.querySelector('[data-tf-success]');
	if (!root) return;
	function $(s) { return document.querySelector(s); }
	function rupiah(n) { return 'Rp ' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }

	var SAMPLE = {
		no: 'SO000021', date: null, method: 'Virtual Account BCA', methodLogo: 'bca',
		sum: { total: 403354800 }
	};
	var CUSTOMER = { name: 'Rendi Bagus' };   /* produksi: dari sesi login */

	var o = null;
	try { o = JSON.parse(sessionStorage.getItem('tfOrder') || 'null'); } catch (err) {}
	if (!o || !o.sum) o = SAMPLE;
	var d = o.date ? new Date(o.date) : new Date();
	var BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

	/* ---------- struk ---------- */
	function ico(id) { return '<svg class="tf-i" aria-hidden="true"><use href="#' + id + '"/></svg>'; }
	var date = d.getDate() + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear() + ', ' + ('0' + d.getHours()).slice(-2) + '.' + ('0' + d.getMinutes()).slice(-2) + ' WIB';
	var logo = o.methodLogo ? '<img src="images/payment/' + o.methodLogo + '.svg" alt="">' : '';
	document.title = 'Pesanan ' + o.no + ' berhasil - Toffin Indonesia';
	$('[data-ok-root]').innerHTML =
		'<section class="tf-rcpt"><div class="tf-rcpt__paper"><div class="tf-rcpt__top">' +
		'<div class="tf-okhero__badge" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12l5 5l9 -10"/></svg></div>' +
		'<p class="tf-okhero__eyebrow">Pembayaran berhasil</p><h1>Terima kasih, ' + CUSTOMER.name.split(' ')[0] + '!</h1>' +
		'<p class="tf-rcpt__lbl">Total dibayar</p><p class="tf-rcpt__total">' + rupiah(o.sum.total) + '</p><p class="tf-rcpt__date">' + date + '</p></div>' +
		'<dl class="tf-rcpt__rows">' +
		'<div><dt>No. pesanan</dt><dd><strong>' + o.no + '</strong><button type="button" class="tf-okcopy" data-ok-copy aria-label="Salin nomor pesanan">' + ico('i-copy') + '<span>Salin</span></button></dd></div>' +
		'<div><dt>Status</dt><dd><span class="tf-chip tf-chip--main">' + ico('i-clock') + ' Pesanan diproses</span></dd></div>' +
		'<div><dt>Pemesan</dt><dd>' + CUSTOMER.name + '</dd></div>' +
		'<div><dt>Metode</dt><dd>' + logo + '<span>' + o.method + '</span></dd></div>' +
		'</dl></div>' +
		'<div class="tf-okhero__act"><a href="detail-pembelian.html?so=' + encodeURIComponent(o.no) + '" class="tf-btn">' + ico('i-clipboard-list') + ' Lihat detail pesanan</a><a href="index.html" class="tf-okbtn">' + ico('i-shopping-bag') + ' Belanja lagi</a></div></section>';

	/* salin nomor pesanan */
	var copy = $('[data-ok-copy]');
	copy.addEventListener('click', function () {
		var lbl = copy.querySelector('span'), done = function () { copy.classList.add('is-done'); lbl.textContent = 'Tersalin'; setTimeout(function () { copy.classList.remove('is-done'); lbl.textContent = 'Salin'; }, 1600); };
		if (navigator.clipboard) navigator.clipboard.writeText(o.no).then(done, done); else done();
	});

})();
