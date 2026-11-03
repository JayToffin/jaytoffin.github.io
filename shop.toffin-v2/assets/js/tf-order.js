/* =====================================================================
   Toffin v2 · tf-order.js — halaman Detail pesanan (detail-pembelian.html)
   Data: <script id="od-data"> (alamat, NPWP, pesanan contoh); pesanan dipilih
   lewat ?so=… (tautan dari Akun saya › Daftar Belanja & success-checkout).
   Nomor tak dikenal → contoh "Diproses" dengan nomor tsb. Produksi: sale.order Odoo.
   Isi: kepala (No. SO + salin, tanggal, distributor, status, progres 5 langkah),
   banner per status (belum dibayar + hitung mundur / diproses + QC / dikirim +
   resi / kedaluwarsa; selesai tanpa banner), kartu pengiriman (alamat, ekspedisi,
   resi, catatan), produk (flash sale, isi paket, bonus, diskon),
   rincian pembayaran (pola checkout), faktur pajak, aksi (bayar, lacak, invoice,
   beli lagi). Tanpa jQuery. Tanpa rating produk (fitur rating sudah tidak ada).
   ===================================================================== */
(function () {
	'use strict';
	var root = document.querySelector('[data-tf-order]');
	if (!root) return;
	function $(s, c) { return (c || document).querySelector(s); }
	function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }
	function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
	function ico(id) { return '<svg class="tf-i" aria-hidden="true"><use href="#' + id + '"/></svg>'; }
	function num(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
	function rp(n) { return 'Rp ' + num(n); }

	var DATA = JSON.parse($('#od-data').textContent);
	var so = new URLSearchParams(location.search).get('so');
	var o = DATA.orders.filter(function (x) { return x.no === so; })[0];
	if (!o) { o = JSON.parse(JSON.stringify(DATA.orders[1])); if (so) o.no = so; }
	/* keadaan yang diubah pelanggan di prototipe (batal / klaim) disimpan per nomor pesanan supaya bertahan saat muat ulang. Produksi: dari server */
	var LOCAL = {}; try { LOCAL = JSON.parse(sessionStorage.getItem('tfOrderLocal') || '{}'); } catch (err) {}
	var L = LOCAL[o.no] || {};
	if (L.cancelled) { o.st = 'cancelled'; o.cancel = L.cancelled; }
	var A = DATA.addr[o.addr], f = o.fees, sum = o.sum, st = o.st;
	var ST = { unpaid: 'Belum dibayar', process: 'Diproses', ship: 'Dikirim', done: 'Selesai', expired: 'Kedaluwarsa', cancelled: 'Dibatalkan' };
	function saveLocal() { LOCAL[o.no] = L; try { sessionStorage.setItem('tfOrderLocal', JSON.stringify(LOCAL)); } catch (err) {} }
	document.title = 'Pesanan ' + o.no + ' - Toffin Indonesia';
	$('[data-od-crumb]').textContent = o.no;

	/* ---------- toast & salin ---------- */
	var toast = $('[data-od-toast]'), toastT = $('[data-od-toast-t]'), tTimer;
	function say(t) { toastT.textContent = t; toast.hidden = false; clearTimeout(tTimer); tTimer = setTimeout(function () { toast.hidden = true; }, 2400); }
	function copyBtn(text, label) { return '<button type="button" class="tf-od__copy" data-od-copy="' + esc(text) + '" data-od-copy-l="' + esc(label) + '" aria-label="Salin ' + esc(label) + '">' + ico('i-copy') + '<span>Salin</span></button>'; }

	/* ---------- progres ---------- */
	var STEPS = [['i-clipboard-list', 'Pesanan dibuat'], ['i-wallet', 'Pembayaran diterima'], ['i-settings-check', 'Diproses & QC'], ['i-truck', 'Dikirim'], ['i-circle-check', 'Selesai']];
	var cur = { unpaid: 1, process: 2, ship: 3, done: 4, expired: 1, cancelled: 1 }[st];
	function steps() {
		return '<ol class="tf-od__steps' + (st === 'expired' || st === 'cancelled' ? ' is-fail' : '') + '" aria-label="Status pesanan">' + STEPS.map(function (s, i) {
			var cls = i < cur ? 'is-done' : i > cur ? '' : st === 'done' ? 'is-done' : (st === 'expired' || st === 'cancelled') ? 'is-fail' : 'is-on';
			var lbl = s[1], time = o.steps[i];
			if (i === cur && st === 'unpaid') { lbl = 'Menunggu pembayaran'; time = 'Sebelum ' + o.deadline_t.replace(' 2026', '').replace(' WIB', ''); }
			if (i === cur && st === 'expired') { lbl = 'Pembayaran kedaluwarsa'; }
			if (i === cur && st === 'cancelled') { lbl = 'Dibatalkan oleh Anda'; time = (o.cancel || {}).at; }
			var dot = cls === 'is-done' ? ico('i-check') : cls === 'is-fail' ? ico('i-x') : ico(s[0]);
			return '<li class="' + cls + '"' + (cls === 'is-on' ? ' aria-current="step"' : '') + '><span class="tf-od__dot">' + dot + '</span><span class="tf-od__st"><b>' + lbl + '</b>' + (time ? '<small>' + time + '</small>' : '') + '</span></li>';
		}).join('') + '</ol>';
	}

	/* ---------- banner per status ---------- */
	function banner() {
		var b = {
			unpaid: ['warn', 'i-hourglass-high', 'Selesaikan pembayaran dalam <b class="tf-od__cd" data-od-cd>--:--:--</b>', 'Bayar sebelum ' + o.deadline_t + ' lewat ' + esc(o.pay.method) + '. Pembayaran diproses di halaman Xendit.',
				'<a href="success-checkout.html" class="tf-btn tf-btn--sm">' + ico('i-lock') + ' Bayar sekarang</a>'],
			process: ['info', 'i-settings-check', 'Pesanan sedang diproses', esc(o.qc || 'Pesanan disiapkan gudang ' + o.city + '. Nomor resi muncul setelah barang dikirim.'), ''],
			ship: ['ship', 'i-truck', 'Pesanan dalam perjalanan', esc(o.courier.name) + ' · ' + esc(o.courier.eta) + '. Resi <b>' + esc(o.resi) + '</b>',
				'<a href="tracking-order.html?resi=' + encodeURIComponent(o.resi) + '" class="tf-btn tf-btn--sm">' + ico('i-map-pin') + ' Lacak</a>'],
			expired: ['mute', 'i-ban', 'Pesanan dibatalkan', 'Pembayaran melewati batas waktu (' + o.deadline_t + '), pesanan dibatalkan otomatis. Tidak ada dana yang ditagih.',
				'<a href="cart.html" class="tf-btn tf-btn--sm">' + ico('i-shopping-cart') + ' Beli lagi</a>'],
			cancelled: ['mute', 'i-ban', 'Pesanan dibatalkan oleh Anda', 'Dibatalkan ' + esc((o.cancel || {}).at || '') + ' · alasan: ' + esc((o.cancel || {}).reason || '') + '. Tagihan ' + esc(o.pay.method) + ' tidak perlu dibayar; bila sudah terlanjur bayar, dana dikembalikan 3–7 hari kerja.',
				'<a href="cart.html" class="tf-btn tf-btn--sm">' + ico('i-shopping-cart') + ' Beli lagi</a>']
		}[st];
		if (!b) return claimCard();   /* selesai: tanpa banner status, tetapi ada kartu masa klaim */
		return '<div class="tf-od__banner tf-od__banner--' + b[0] + '"><span class="tf-od__bico">' + ico(b[1]) + '</span><div class="tf-od__bt"><strong>' + b[2] + '</strong><p>' + b[3] + '</p></div>' + (b[4] ? '<div class="tf-od__bact">' + b[4] + '</div>' : '') + '</div>';
	}

	/* ---------- masa klaim 1x24 jam setelah diterima (kebijakan pembatalan-transaksi.html) ----------
	   Contoh: waktu terima dari o.steps[4] ("03 Okt, 14.20"); produksi: stock.picking date_done + 24 jam dari server. */
	var BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
	function parseStep(t) { var m = /^(\d{1,2}) (\w{3}), (\d{2})\.(\d{2})$/.exec(t || ''); if (!m) return null; return new Date(2026, BLN.indexOf(m[2]), +m[1], +m[3], +m[4]); }
	function fmtD(d) { return d.getDate() + ' ' + BLN[d.getMonth()] + ' ' + d.getFullYear() + ', ' + ('0' + d.getHours()).slice(-2) + '.' + ('0' + d.getMinutes()).slice(-2) + ' WIB'; }
	var forceClaim = new URLSearchParams(location.search).get('klaim') === '1';
	function claimWindow() {
		var got = parseStep(o.steps[4]); if (!got) return null;
		var until = new Date(got.getTime() + 24 * 3600 * 1000);
		return { got: got, until: until, open: forceClaim || Date.now() <= until.getTime() };
	}
	function claimCard() {
		if (st !== 'done') return '';
		if (L.claim) {
			return '<div class="tf-od__banner tf-od__banner--info"><span class="tf-od__bico">' + ico('i-clipboard-list') + '</span><div class="tf-od__bt"><strong>Klaim ' + esc(L.claim.no) + ' sedang diverifikasi</strong><p>' + esc(L.claim.type) + ' · diajukan ' + esc(L.claim.at) + '. Tim Toffin menghubungi Anda via WhatsApp maksimal 1x24 jam.</p></div></div>';
		}
		var w = claimWindow(); if (!w) return '';
		if (!w.open) return '<div class="tf-od__banner tf-od__banner--mute"><span class="tf-od__bico">' + ico('i-circle-check') + '</span><div class="tf-od__bt"><strong>Pesanan selesai</strong><p>Masa pengajuan klaim (1x24 jam setelah diterima) berakhir ' + fmtD(w.until) + '. Ada kendala? Hubungi tim Toffin lewat WhatsApp di bawah.</p></div></div>';
		return '<div class="tf-od__banner tf-od__banner--warn"><span class="tf-od__bico">' + ico('i-hourglass-high') + '</span><div class="tf-od__bt"><strong>Periksa paket Anda sekarang</strong><p>Klaim barang rusak, kurang, atau tidak sesuai diterima <b>maksimal 1x24 jam</b> sejak diterima, yaitu sampai <b>' + fmtD(w.until) + '</b>. Siapkan video unboxing tanpa jeda.</p></div><div class="tf-od__bact"><button type="button" class="tf-btn tf-btn--sm" data-od-claim>' + ico('i-camera') + ' Ajukan klaim</button></div></div>';
	}
	function openClaim() {
		var w = claimWindow();
		if (!w || !w.open) { window.tfUI.toast('Masa pengajuan klaim sudah berakhir. Hubungi tim Toffin via WhatsApp.', { kind: 'warn', link: { href: 'https://wa.me/6281199833780', label: 'Chat' } }); return; }
		var opt = function (v, l) { return '<option value="' + v + '">' + l + '</option>'; };
		window.tfUI.confirm({
			title: 'Ajukan klaim pesanan', icon: 'i-camera', ok: 'Kirim klaim', wide: true,
			text: 'Pesanan <b>' + esc(o.no) + '</b> · diterima ' + fmtD(w.got),
			html: '<label class="tf-ufld"><span>Jenis klaim</span><select data-cl-type><option value="">Pilih jenis klaim</option>' + opt('Barang rusak', 'Barang rusak / cacat') + opt('Jumlah kurang', 'Jumlah kurang dari pesanan') + opt('Barang tidak sesuai', 'Barang tidak sesuai pesanan') + opt('Lainnya', 'Lainnya') + '</select></label>' +
				'<label class="tf-ufld"><span>Keterangan</span><textarea data-cl-desc maxlength="500" placeholder="Jelaskan kondisi barang, nomor seri bila ada, dan bagian yang bermasalah"></textarea></label>' +
				'<label class="tf-uupl" data-cl-upl>' + ico('i-camera') + '<span><strong data-cl-upl-t>Unggah video unboxing</strong><small data-cl-upl-s>MP4/MOV maks. 200 MB, direkam utuh tanpa jeda</small></span><input type="file" accept="video/mp4,video/quicktime" data-cl-video hidden></label>' +
				'<div class="tf-unote">' + ico('i-alert-circle') + '<span>Klaim tanpa video unboxing berpotensi tidak dapat diproses. Video harus dimulai dari paket tersegel sampai barang diperiksa.</span></div>',
			onOk: function (body, api) {
				var type = body.querySelector('[data-cl-type]').value, desc = body.querySelector('[data-cl-desc]').value.trim(), vid = body.querySelector('[data-cl-video]').files[0];
				if (!type) { api.error('Pilih jenis klaim.'); return false; }
				if (desc.length < 10) { api.error('Tulis keterangan minimal 10 karakter.'); return false; }
				if (!vid) { api.error('Unggah video unboxing.'); return false; }
				if (vid.size > 200 * 1024 * 1024) { api.error('Ukuran video lebih dari 200 MB.'); return false; }
				L.claim = { no: 'CL-' + String(Date.now()).slice(-6), type: type, desc: desc, video: vid.name, at: fmtD(new Date()) }; saveLocal();
				render();   /* produksi: POST klaim + unggah video → nomor klaim dari server, email tanda terima klaim */
				window.tfUI.toast('Klaim <b>' + L.claim.no + '</b> diterima. Tim Toffin menghubungi Anda via WhatsApp maksimal 1x24 jam.', { ms: 5000 });
			}
		});
		var upl = document.querySelector('[data-cl-upl]'), vin = upl && upl.querySelector('[data-cl-video]');
		if (vin) vin.addEventListener('change', function () { var f = vin.files[0]; upl.classList.toggle('is-set', !!f); upl.querySelector('[data-cl-upl-t]').textContent = f ? f.name : 'Unggah video unboxing'; upl.querySelector('[data-cl-upl-s]').textContent = f ? Math.round(f.size / 1048576) + ' MB · ganti berkas' : 'MP4/MOV maks. 200 MB, direkam utuh tanpa jeda'; });
	}

	/* ---------- batalkan pesanan (hanya belum dibayar; sesudah bayar lewat CS, kebijakan pembatalan-transaksi.html) ---------- */
	function openCancel() {
		var opt = function (v, chk) { return '<label class="tf-uopt"><input type="radio" name="why" value="' + v + '"' + (chk ? ' checked' : '') + '><span>' + v + '</span></label>'; };
		window.tfUI.confirm({
			title: 'Batalkan pesanan ' + o.no + '?', danger: true, icon: 'i-ban', ok: 'Batalkan pesanan', cancel: 'Kembali',
			text: 'Pesanan belum dibayar, jadi bisa dibatalkan tanpa biaya. Setelah dibatalkan, tagihan ' + esc(o.pay.method) + ' tidak berlaku dan barang kembali ke stok.',
			html: opt('Ingin mengubah produk atau jumlah', true) + opt('Ingin mengganti alamat atau pengiriman') + opt('Ingin mengganti metode pembayaran') + opt('Berubah pikiran') + opt('Lainnya') +
				'<label class="tf-ufld" style="margin-top:6px"><span>Catatan (opsional)</span><input type="text" data-cx-note maxlength="140" placeholder="Misal: akan pesan ulang dengan varian lain"></label>',
			onOk: function (body) {
				var why = body.querySelector('[name=why]:checked');
				L.cancelled = { at: fmtD(new Date()), reason: why ? why.value : 'Lainnya', note: body.querySelector('[data-cx-note]').value.trim() }; saveLocal();
				o.st = 'cancelled'; o.cancel = L.cancelled; st = 'cancelled'; cur = 1;
				render();   /* produksi: action_cancel sale.order + batalkan VA/invoice di Xendit, kirim email "pesanan dibatalkan" */
				window.scrollTo({ top: 0, behavior: 'smooth' });
				window.tfUI.toast('Pesanan <b>' + esc(o.no) + '</b> dibatalkan', { kind: 'info', link: { href: 'cart.html', label: 'Beli lagi' } });
			}
		});
	}

	/* ---------- barang ---------- */
	function item(it, i) {
		var tag = it.fs ? '<span class="tf-coi__tag tf-coi__tag--fs">' + ico('i-bolt') + ' Harga Flash Sale</span>'
			: it.bundle ? '<span class="tf-coi__tag">' + ico('i-package') + ' Paket Bundling</span>'
			: it.gift ? '<span class="tf-coi__tag tf-od__tag--gift">' + ico('i-gift') + ' Dapat bonus</span>'
			: it.old ? '<span class="tf-coi__tag tf-od__tag--disc">' + ico('i-tag') + ' Diskon</span>' : '';   /* produk biasa: tanpa label */
		var unit = '<span>' + it.qty + ' ×</span> <span data-unit>' + rp(it.price) + '</span>' + (it.old ? '<s>' + rp(it.old) + '</s><span class="tf-coi__off">' + Math.round((it.old - it.price) * 100 / it.old) + '%</span>' : '');
		var v = it.bundle ? '<p class="tf-coi__var">' + it.bundle.length + ' produk dalam paket</p>' : it.var ? '<p class="tf-coi__var">' + esc(it.var) + '</p>' : '';
		var toggle = '', subs = '';
		if (it.bundle) {
			toggle = '<button type="button" class="tf-coi__toggle" data-od-toggle aria-expanded="false"><span>Lihat isi paket</span> ' + ico('i-chevron-down') + '</button>';
			subs = '<div class="tf-coi__subs">' + it.bundle.map(function (b) { return '<div class="tf-cosub"><img src="' + b[1] + '" alt="" loading="lazy"><div><p>' + esc(b[0]) + '</p><small>' + (b[2] ? '<span class="tf-cosub__var">' + esc(b[2]) + '</span>' : '') + rp(b[3]) + ' · 1 pcs</small></div></div>'; }).join('') + '</div>';
		}
		if (it.gift) subs = '<div class="tf-coi__subs tf-coi__subs--gift"><p class="tf-coi__giftlbl">' + ico('i-gift') + ' Bonus produk</p>' + it.gift.map(function (g) { return '<div class="tf-cosub"><img src="' + g[1] + '" alt="" loading="lazy"><div><p>' + esc(g[0]) + '</p><small>1 pcs</small></div><span class="tf-cosub__free">Gratis</span></div>'; }).join('') + '</div>';
		var href = it.href || 'detail-produk.html';
		return '<article class="tf-coi' + (it.fs ? ' is-fs' : '') + '"><a href="' + href + '" class="tf-coi__thumb"><img src="' + it.img + '" alt="' + esc(it.name) + '" loading="lazy"></a>' +
			'<div class="tf-coi__info">' + tag + '<h3 class="tf-coi__name"><a href="' + href + '">' + esc(it.name) + '</a></h3>' + v + '<p class="tf-coi__unit">' + unit + '</p>' + toggle + '</div>' +
			'<div class="tf-coi__total">' + rp(it.price * it.qty) + '</div>' + subs + '</article>';
	}

	/* ---------- rincian pembayaran ---------- */
	function payment() {
		var paid = st !== 'unpaid' && st !== 'expired';
		var row = function (l, v, cls) { return '<div class="tf-cosum__row' + (cls ? ' ' + cls : '') + '"><span>' + l + '</span><span>' + v + '</span></div>'; };
		var rows = row('Total harga (' + sum.count + ' barang)', rp(sum.gross)) +
			(sum.disc ? row('Diskon produk', '−' + rp(sum.disc), 'is-disc') : '') +
			row('Ongkos kirim', f.ship ? rp(f.ship) : 'Gratis') +
			(f.ins ? row('Asuransi pengiriman', rp(f.ins)) : '') +
			row('Biaya packing', rp(f.pack)) +
			(f.admin ? row('Biaya admin', rp(f.admin)) : '') +
			(f.voucher ? row('Voucher <b class="tf-od__code">' + esc(f.voucher.code) + '</b>', '−' + rp(f.voucher.amt), 'is-disc') : '') +
			(f.points ? row('Toffin Point', '−' + rp(f.points), 'is-disc') : '');
		var save = sum.disc + (f.voucher ? f.voucher.amt : 0) + f.points;
		var tax = o.tax ? '<div class="tf-od__tax">' + ico('i-file-invoice') + '<span><strong>Faktur pajak</strong><small>' + esc(DATA.tax.name) + ' · NPWP ' + DATA.tax.npwp + '</small><em>' +
			(st === 'done' ? 'Sudah dikirim ke email' : paid ? 'Dikirim ke email setelah pesanan selesai' : st === 'unpaid' ? 'Diterbitkan setelah pembayaran' : 'Tidak diterbitkan') + '</em></span></div>' : '';
		var earn = (st === 'expired' || st === 'cancelled') ? '' : '<p class="tf-cosum__earn">' + ico('i-tpoint') + (st === 'done' ? ' <b>' + num(sum.earn) + '</b> Toffin Point sudah masuk ke akun' : ' Dapat <b>' + num(sum.earn) + '</b> Toffin Point setelah pesanan selesai') + '</p>';
		var acts = {
			unpaid: '<a href="success-checkout.html" class="tf-btn">' + ico('i-lock') + ' Bayar sekarang</a><button type="button" class="tf-od__btn tf-od__btn--danger" data-od-cancel>' + ico('i-ban') + ' Batalkan pesanan</button>',
			process: '<a href="invoice.html?so=' + encodeURIComponent(o.no) + '" class="tf-od__btn">' + ico('i-download') + ' Unduh invoice</a>',
			ship: '<a href="tracking-order.html?resi=' + encodeURIComponent(o.resi) + '" class="tf-btn">' + ico('i-map-pin') + ' Lacak pesanan</a><a href="invoice.html?so=' + encodeURIComponent(o.no) + '" class="tf-od__btn">' + ico('i-download') + ' Unduh invoice</a>',
			done: '<a href="cart.html" class="tf-btn">' + ico('i-shopping-cart') + ' Beli lagi</a><a href="invoice.html?so=' + encodeURIComponent(o.no) + '" class="tf-od__btn">' + ico('i-download') + ' Unduh invoice</a>',
			expired: '<a href="cart.html" class="tf-btn">' + ico('i-shopping-cart') + ' Beli lagi</a>',
			cancelled: '<a href="cart.html" class="tf-btn">' + ico('i-shopping-cart') + ' Beli lagi</a>'
		}[st];
		return '<div class="tf-co__card tf-cosum"><h2 class="tf-cosum__title">Rincian pembayaran</h2>' +
			'<div class="tf-od__pm"><img src="images/payment/' + o.pay.logo + '.svg" alt=""><span><strong>' + esc(o.pay.method) + '</strong><small>' + (paid ? 'Dibayar ' + o.pay.paid : (st === 'unpaid' ? 'Bayar sebelum ' : st === 'cancelled' ? 'Dibatalkan, batas bayar ' : 'Batas bayar ') + o.deadline_t.replace(' 2026', '').replace(' WIB', '')) + '</small></span></div>' +
			'<div class="tf-cosum__rows">' + rows + '</div>' +
			'<div class="tf-cosum__total"><span>' + (paid ? 'Total dibayar' : 'Total tagihan') + '</span><strong>' + rp(sum.total) + '</strong></div>' +
			(save && st !== 'expired' && st !== 'cancelled' ? '<div class="tf-cosum__save"><span>' + ico('i-bolt') + ' Anda hemat</span><strong>' + rp(save) + '</strong></div>' : '') + earn + tax +
			'<div class="tf-od__acts">' + acts + '</div></div>' +
			'<a href="https://wa.me/6281199833780?text=' + encodeURIComponent('Halo Toffin, saya butuh bantuan untuk pesanan ' + o.no) + '" target="_blank" rel="noopener noreferrer" class="tf-co__card tf-co__help">' + ico('i-brand-whatsapp') + '<span><strong>Ada kendala dengan pesanan?</strong> Chat tim Toffin via WhatsApp.</span></a>';
	}

	/* ---------- rakit ---------- */
	function render() {
		var resi = o.resi ? '<b class="tf-od__mono">' + esc(o.resi) + '</b>' + copyBtn(o.resi, 'nomor resi') : '<span class="tf-od__muted">' + (st === 'expired' || st === 'cancelled' ? '–' : 'Muncul setelah pesanan dikirim') + '</span>';
		$('[data-od-root]', root).innerHTML =
			'<section class="tf-co__card tf-od__top">' +
				'<div class="tf-od__head"><div class="tf-od__id"><small>No. pesanan</small><h1><span>' + esc(o.no) + '</span>' + copyBtn(o.no, 'nomor pesanan') + '</h1>' +
				'<p>Dipesan ' + o.created + ' WIB · Distributor <b>' + esc(o.dist) + '</b></p></div><span class="tf-ostat tf-ostat--' + st + '">' + ST[st] + '</span></div>' +
				steps() +
			'</section>' + banner() +
			'<div class="tf-co__grid"><div class="tf-co__main">' +
				'<section class="tf-co__card tf-od__ship">' +
					'<header class="tf-co__chead"><span class="tf-ship__store">' + ico('i-building-store') + esc(o.dist) + '</span></header>' +
					'<div class="tf-ship__dest"><span class="tf-ship__destico">' + ico('i-map-pin') + '</span><div class="tf-ship__destt"><small>Kirim ke · ' + esc(A.label) + '</small>' +
						'<div class="tf-od__addr"><strong>' + esc(A.name) + '</strong> <span>' + esc(A.phone) + '</span><p>' + esc(A.line) + ', ' + esc(A.city) + '</p></div></div></div>' +
					'<dl class="tf-od__info">' +
						'<div><dt>' + ico('i-truck') + ' Ekspedisi</dt><dd><b>' + esc(o.courier.name) + '</b> <span class="tf-od__muted">· ' + esc(o.courier.type) + ' · ' + esc(o.courier.eta) + '</span></dd></div>' +
						'<div><dt>' + ico('i-package') + ' No. resi</dt><dd>' + resi + (o.resi && st === 'ship' ? '<a href="tracking-order.html?resi=' + encodeURIComponent(o.resi) + '" class="tf-co__link">Lacak</a>' : '') + '</dd></div>' +
						(o.note ? '<div><dt>' + ico('i-note') + ' Catatan</dt><dd>' + esc(o.note) + '</dd></div>' : '') +
					'</dl>' +
				'</section>' +
				'<section class="tf-co__card"><header class="tf-co__chead"><h2>' + ico('i-shopping-bag') + ' Produk dipesan</h2><small>' + sum.count + ' barang</small></header>' +
					'<div class="tf-ship__items">' + o.items.map(item).join('') + '</div>' +
					'<footer class="tf-ship__foot"><span>Subtotal produk</span><strong>' + rp(sum.sub) + '</strong></footer></section>' +
			'</div><aside class="tf-co__aside">' + payment() + '</aside></div>';
		tick();
	}

	/* hitung mundur batas bayar */
	var cdTimer;
	function tick() {
		var el = $('[data-od-cd]'); clearTimeout(cdTimer);
		if (!el || !o.deadline) return;
		var s = Math.max(0, Math.floor((new Date(o.deadline) - new Date()) / 1000));
		el.textContent = [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(function (n) { return ('0' + n).slice(-2); }).join(':');
		if (s > 0) cdTimer = setTimeout(tick, 1000);
	}

	document.addEventListener('click', function (e) {
		var c = e.target.closest('[data-od-copy]');
		if (c) {
			var lbl = c.querySelector('span'), done = function () { c.classList.add('is-done'); lbl.textContent = 'Tersalin'; say(c.getAttribute('data-od-copy-l').replace(/^./, function (m) { return m.toUpperCase(); }) + ' disalin'); setTimeout(function () { c.classList.remove('is-done'); lbl.textContent = 'Salin'; }, 1600); };
			if (navigator.clipboard) navigator.clipboard.writeText(c.getAttribute('data-od-copy')).then(done, done); else done();
			return;
		}
		if (e.target.closest('[data-od-cancel]')) { openCancel(); return; }
		if (e.target.closest('[data-od-claim]')) { openClaim(); return; }
		var t = e.target.closest('[data-od-toggle]');
		if (t) { var it = t.closest('.tf-coi'), open = it.classList.toggle('is-open'); t.setAttribute('aria-expanded', open); t.querySelector('span').textContent = open ? 'Sembunyikan isi paket' : 'Lihat isi paket'; return; }
	});

	render();
	if (forceClaim && st === 'done' && !L.claim) setTimeout(openClaim, 300);   /* dari lacak pesanan: tracking-order.html → ?klaim=1 */
})();
