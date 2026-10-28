/* =====================================================================
   Toffin v2 · tf-voucher.js — halaman Voucher (voucher.html, pengganti coupon.html)
   Fitur sama dengan halaman lama: tombol "Syarat & Ketentuan" di kartu membuka
   modal Detail Voucher (judul voucher + S&K). ?v=KODE membuka S&K voucher itu.
   Data contoh: <script id="vp-data">. Tanpa jQuery.
   ===================================================================== */
(function () {
	'use strict';
	if (!document.querySelector('[data-tf-voucher]')) return;
	function $(s, c) { return (c || document).querySelector(s); }
	function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
	function ico(id) { return '<svg class="tf-i" aria-hidden="true"><use href="#' + id + '"/></svg>'; }

	var D = JSON.parse($('#vp-data').textContent), ALL = [];
	Object.keys(D.groups).forEach(function (k) { ALL = ALL.concat(D.groups[k]); });
	var dlg = $('#dlg-voucher'), lastFocus = null;

	function open(code) {
		var v = ALL.filter(function (x) { return x.code === code; })[0]; if (!v) return;
		$('[data-v-detail]').innerHTML =
			'<div class="tf-vc tf-vc--' + v.type + ' tf-vc--hero"><div class="tf-vc__stub"><strong>' + esc(v.big) + '</strong><span>' + esc(v.unit) + '</span></div>' +
			'<div class="tf-vc__body"><h3 class="tf-vc__title">' + esc(v.title) + '</h3><p class="tf-vc__terms">' + esc(v.desc) + '</p>' +
			'<div class="tf-vc__foot"><span class="tf-vc__date">' + ico('i-calendar') + 'Berakhir ' + esc(v.end) + '</span></div></div></div>' +
			'<h4 class="tf-vd__h">Syarat dan Ketentuan Voucher</h4><ol class="tf-vd__tnc">' +
			D.tnc.map(function (t) { return '<li><b>' + t[0] + ':</b> ' + t[1] + '</li>'; }).join('') + '</ol>';
		lastFocus = document.activeElement; dlg.classList.add('is-open'); document.body.classList.add('tf-lock'); $('.tf-dlg__x', dlg).focus();
	}
	function close() { dlg.classList.remove('is-open'); document.body.classList.remove('tf-lock'); if (lastFocus) lastFocus.focus(); }
	document.addEventListener('click', function (e) {
		var o = e.target.closest('[data-v-open]'); if (o) { open(o.getAttribute('data-v-open')); return; }
		if (e.target.closest('[data-v-close]') || e.target === dlg) close();
	});
	document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && dlg.classList.contains('is-open')) close(); });

	var q = new URLSearchParams(location.search).get('v');
	if (q) open(q.toUpperCase());
})();
