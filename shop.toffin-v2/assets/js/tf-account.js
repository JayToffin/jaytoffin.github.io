/* =====================================================================
   Toffin v2 · tf-account.js — halaman Akun saya (my-account.html)
   - Tab per bagian lewat hash: #ringkasan (bawaan), #belanja, #favorit, #points,
     #service, #alamat, #pembayaran, #profil. Hash lama (#settings, #daftar-belanja,
     #daftar-alamat, #toffin-points, #service-credit, #metode-pembayaran, #favorite)
     tetap diarahkan ke bagian yang sama.
   - Daftar Belanja: chip status + pencarian; Toffin Points: chip riwayat.
   - Favorit: hapus dengan toast "Batalkan".
   - Alamat (data #acc-addresses): cari, tambah / ubah / hapus (konfirmasi) / jadikan utama /
     pinpoint lewat tf-map.js (dialog #dlg-pin).
   - Profil: simpan (validasi); verifikasi ID dua bagian KTP (NIK 16 digit, nama, alamat, foto) &
     NPWP (15/16 digit, nama, alamat, foto), minimal satu lengkap; keadaan per bagian isi / menunggu
     verifikasi / terverifikasi, tanpa ubah/batal (contoh: ?verif=none|pending|verified|mix);
     pratinjau foto (#dlg-photo); ubah sandi (kirim tautan); hapus akun
     (centang persetujuan dulu).
   Dialog = .tf-dlg (tf-layout.css). Semua data contoh; produksi dari Odoo.
   ===================================================================== */
(function () {
	'use strict';
	var root = document.querySelector('[data-tf-account]');
	if (!root) return;
	function $(s, el) { return (el || document).querySelector(s); }
	function $$(s, el) { return [].slice.call((el || document).querySelectorAll(s)); }
	function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
	function ico(id) { return '<svg class="tf-i" aria-hidden="true"><use href="#' + id + '"/></svg>'; }

	/* ---------- tab per bagian ---------- */
	var ALIAS = { settings: 'profil', 'daftar-belanja': 'belanja', 'daftar-alamat': 'alamat', 'toffin-points': 'points', 'service-credit': 'service', 'metode-pembayaran': 'pembayaran', favorite: 'favorit' };
	var panes = $$('[data-acc-pane]');
	function show(name, go) {
		name = ALIAS[name] || name;
		if (!panes.some(function (p) { return p.getAttribute('data-acc-pane') === name; })) name = 'ringkasan';
		panes.forEach(function (p) { p.hidden = p.getAttribute('data-acc-pane') !== name; });
		$$('[data-acc-tab]').forEach(function (a) { var on = a.getAttribute('data-acc-tab') === name && !a.classList.contains('tf-stat') && !a.closest('.tf-alert, .tf-asec__head, .tf-aprof__badges'); a.classList.toggle('is-on', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
		var mt = $('.tf-amtabs a.is-on'); if (mt) mt.scrollIntoView({ block: 'nearest', inline: 'center' });
		var target = go ? document.getElementById(go) : null;
		if (target) setTimeout(function () { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 30);
		else if (window.scrollY > 300) root.scrollIntoView({ block: 'start' });
	}
	root.addEventListener('click', function (e) {
		var a = e.target.closest('[data-acc-tab]'); if (!a) return;
		e.preventDefault();
		var name = a.getAttribute('data-acc-tab');
		if (history.replaceState) history.replaceState(null, '', '#' + name);
		show(name, a.getAttribute('data-go'));
		if (a.getAttribute('data-filter') === 'active') filterOrders('active');
	});
	window.addEventListener('hashchange', function () { show(location.hash.slice(1)); });
	show(location.hash.slice(1));

	/* ---------- toast ---------- */
	var toast = $('[data-toast]'), toastT = $('[data-toast-t]'), undoBtn = $('[data-toast-undo]'), toastTimer, undoFn = null;
	function say(text, undo) {
		toastT.textContent = text; undoFn = undo || null; undoBtn.hidden = !undo; toast.hidden = false;
		clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.hidden = true; undoFn = null; }, undo ? 5000 : 2600);
	}
	undoBtn.addEventListener('click', function () { if (undoFn) undoFn(); toast.hidden = true; undoFn = null; });

	/* ---------- dialog ---------- */
	var lastFocus = null;
	function openDlg(id) { var d = document.getElementById(id); if (!d) return; lastFocus = document.activeElement; d.classList.add('is-open'); document.body.classList.add('tf-lock'); var f = d.querySelector('.tf-dlg__x'); if (f) f.focus(); }
	function closeDlg(d) { if (!d) return; d.classList.remove('is-open'); if (!$('.tf-dlg.is-open')) document.body.classList.remove('tf-lock'); if (lastFocus && document.body.contains(lastFocus)) lastFocus.focus(); }
	document.addEventListener('click', function (e) {
		var o = e.target.closest('[data-dlg-open]'); if (o) { e.preventDefault(); openDlg(o.getAttribute('data-dlg-open')); return; }
		var c = e.target.closest('[data-dlg-close]'); if (c) { closeDlg(c.closest('.tf-dlg')); return; }
		if (e.target.classList && e.target.classList.contains('tf-dlg')) closeDlg(e.target);
	});
	document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var d = $$('.tf-dlg.is-open').pop(); if (d) closeDlg(d); } });

	/* ---------- daftar belanja ---------- */
	var oStatus = 'all', oq = $('[data-osearch]');
	function filterOrders(st) {
		if (st) oStatus = st;
		$$('[data-ofilter]').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-ofilter') === oStatus); });
		var q = (oq.value || '').trim().toLowerCase(), shown = 0;
		$$('[data-olist] [data-order]').forEach(function (o) {
			var s = o.getAttribute('data-status');
			var okS = oStatus === 'all' || s === oStatus || (oStatus === 'active' && /unpaid|process|ship/.test(s));
			var ok = okS && (!q || o.getAttribute('data-q').indexOf(q) > -1);
			o.hidden = !ok; if (ok) shown++;
		});
		$('[data-oempty]').hidden = !!shown;
	}
	$$('[data-ofilter]').forEach(function (b) { b.addEventListener('click', function () { filterOrders(b.getAttribute('data-ofilter')); }); });
	oq.addEventListener('input', function () { filterOrders(); });

	/* ---------- toffin points: tab Riwayat / Akan kedaluwarsa + filter (seperti my-account v1) ----------
	   Filter (dialog #dlg-pt-filter): jenis poin (diperoleh / ditukarkan) + tanggal (hari ini / bulan ini / tahun ini /
	   pilih tanggal sendiri). Berlaku untuk tab Riwayat; tanggal dibaca dari data-date tiap baris. */
	var plist = $('[data-plist]'), PT_TODAY = plist.getAttribute('data-today'), ptab = 'hist';
	var pf = { type: 'all', period: 'all', from: '', to: '' }, pfForm = $('[data-pf-form]');
	var PF_T = { plus: 'Poin diperoleh', min: 'Poin ditukarkan' }, PF_P = { today: 'Hari ini', month: 'Bulan ini', year: 'Tahun ini' };
	function fmtD(iso) { var d = iso.split('-'); return +d[2] + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][+d[1] - 1] + ' ' + d[0]; }
	function inPeriod(iso) {
		if (pf.period === 'today') return iso === PT_TODAY;
		if (pf.period === 'month') return iso.slice(0, 7) === PT_TODAY.slice(0, 7);
		if (pf.period === 'year') return iso.slice(0, 4) === PT_TODAY.slice(0, 4);
		if (pf.period === 'custom') return (!pf.from || iso >= pf.from) && (!pf.to || iso <= pf.to);
		return true;
	}
	function renderPoints() {
		var shown = 0;
		$$('[data-h]', plist).forEach(function (r) {
			var h = r.getAttribute('data-h'), ok = ptab === 'exp' ? h === 'exp' : h !== 'exp' && (pf.type === 'all' || h === pf.type) && inPeriod(r.getAttribute('data-date') || '');
			r.hidden = !ok; if (ok) shown++;
		});
		var n = (pf.type !== 'all' ? 1 : 0) + (pf.period !== 'all' ? 1 : 0), badge = $('[data-pf-badge]'), sum = $('[data-pf-sum]');
		badge.hidden = !n; badge.textContent = n;
		$('[data-pf-open]').hidden = ptab === 'exp'; $('[data-pf-open]').classList.toggle('is-on', !!n);
		var parts = [];
		if (pf.type !== 'all') parts.push(PF_T[pf.type]);
		if (pf.period === 'custom') parts.push((pf.from ? fmtD(pf.from) : '…') + ' – ' + (pf.to ? fmtD(pf.to) : '…')); else if (pf.period !== 'all') parts.push(PF_P[pf.period]);
		sum.hidden = !n || ptab === 'exp';
		sum.innerHTML = 'Filter: <b>' + parts.join(' · ') + '</b> · ' + shown + ' transaksi <button type="button" class="tf-alink" data-pf-clear>Hapus filter</button>';
		$('[data-pf-empty]').hidden = !!shown;
	}
	$$('[data-ptab]').forEach(function (b) {
		b.addEventListener('click', function () { ptab = b.getAttribute('data-ptab'); $$('[data-ptab]').forEach(function (x) { x.classList.toggle('is-on', x === b); }); renderPoints(); });
	});
	function pfFill() {   /* isi dialog dari filter aktif */
		pfForm.pf_type.value = pf.type; pfForm.pf_period.value = pf.period; pfForm.pf_from.value = pf.from; pfForm.pf_to.value = pf.to;
		$('[data-pf-dates]').classList.toggle('is-on', pf.period === 'custom'); $('[data-pf-err]').hidden = true;
	}
	$('[data-pf-open]').addEventListener('click', function () { pfFill(); openDlg('dlg-pt-filter'); });
	pfForm.addEventListener('change', function (e) {
		if (e.target.name === 'pf_from' || e.target.name === 'pf_to') pfForm.pf_period.value = 'custom';   /* isi tanggal = pilih tanggal sendiri */
		$('[data-pf-dates]').classList.toggle('is-on', pfForm.pf_period.value === 'custom'); $('[data-pf-err]').hidden = true;
	});
	$('[data-pf-reset]').addEventListener('click', function () { pf = { type: 'all', period: 'all', from: '', to: '' }; pfFill(); });
	$('[data-pf-apply]').addEventListener('click', function () {
		var f = pfForm.pf_from.value, t = pfForm.pf_to.value, period = pfForm.pf_period.value;
		if (period === 'custom' && f && t && f > t) { $('[data-pf-err]').hidden = false; return; }
		if (period === 'custom' && !f && !t) period = 'all';
		pf = { type: pfForm.pf_type.value, period: period, from: period === 'custom' ? f : '', to: period === 'custom' ? t : '' };
		closeDlg($('#dlg-pt-filter')); renderPoints();
	});
	document.addEventListener('click', function (e) { if (e.target.closest('[data-pf-clear]')) { pf = { type: 'all', period: 'all', from: '', to: '' }; renderPoints(); } });
	renderPoints();

	/* ---------- favorit ---------- */
	function favCount() { var n = $$('[data-favlist] [data-fav]').length; $$('[data-fav-count]').forEach(function (el) { el.textContent = n + ' produk'; }); $('[data-fav-empty]').hidden = !!n; }
	$('[data-favlist]').addEventListener('click', function (e) {
		var b = e.target.closest('[data-fav-del]'); if (!b) return;
		e.preventDefault(); e.stopPropagation();
		var card = b.closest('[data-fav]'), parent = card.parentNode, next = card.nextSibling, name = $('.fs-product-title', card).textContent;
		card.remove(); favCount();
		say('"' + name + '" dihapus dari favorit', function () { parent.insertBefore(card, next); favCount(); });
	}, true);

	/* ---------- alamat ---------- */
	var ADDR = JSON.parse($('#acc-addresses').textContent), addrBox = $('[data-addrs]'), editing = null, draftPin = null;
	var addrQ = $('[data-addr-q]'), addrCount = $('[data-addr-count]');
	function renderAddrs() {
		ADDR.sort(function (a, b) { return (b.main ? 1 : 0) - (a.main ? 1 : 0); });
		/* cari: label, nama, telepon, alamat, kota (spasi = semua kata harus cocok) */
		var words = (addrQ.value || '').toLowerCase().trim().split(/\s+/).filter(Boolean);
		var list = ADDR.filter(function (a) { var t = [a.label, a.name, a.phone, a.line, a.city].join(' ').toLowerCase(); return words.every(function (w) { return t.indexOf(w) > -1; }); });
		addrCount.textContent = words.length ? list.length + ' dari ' + ADDR.length + ' alamat cocok' : ADDR.length + ' alamat tersimpan';
		if (!list.length) { addrBox.innerHTML = '<div class="tf-aaddrs__empty">' + ico('i-map-pin') + '<strong>Alamat tidak ditemukan</strong><span>Coba kata kunci lain, misalnya nama outlet atau kota.</span><button type="button" class="tf-alink" data-addr-clear>Hapus pencarian</button></div>'; return; }
		addrBox.innerHTML = list.map(function (a) {
			return '<article class="tf-aaddr' + (a.main ? ' is-main' : '') + '"><div class="tf-aaddr__chips">' + (a.main ? '<span class="tf-abadge tf-abadge--member">' + ico('i-star') + ' Utama</span>' : '') + '<span class="tf-abadge">' + esc(a.label) + '</span></div>' +
				'<p class="tf-aaddr__name">' + esc(a.name) + ' <span>· ' + esc(a.phone) + '</span></p><p class="tf-aaddr__line">' + esc(a.line) + ', ' + esc(a.city) + '</p>' +
				(a.pin ? '<p class="tf-aaddr__pin is-ok">' + ico('i-circle-check') + ' Sudah pinpoint</p>' : '<p class="tf-aaddr__pin is-no">' + ico('i-alert-circle') + ' Belum pinpoint · <button type="button" class="tf-alink" data-a-pin="' + a.id + '">Tandai lokasi</button></p>') +
				'<div class="tf-aaddr__foot"><button type="button" class="tf-alink" data-a-edit="' + a.id + '">Ubah</button>' + (a.main ? '' : '<button type="button" class="tf-alink is-del" data-a-del="' + a.id + '">Hapus</button><button type="button" class="tf-abtn tf-abtn--ghost tf-abtn--sm" data-a-main="' + a.id + '">Jadikan utama</button>') + '</div></article>';
		}).join('');
	}
	addrQ.addEventListener('input', renderAddrs);
	document.addEventListener('click', function (e) { if (e.target.closest('[data-addr-clear]')) { addrQ.value = ''; renderAddrs(); addrQ.focus(); } });
	function byId(id) { return ADDR.filter(function (a) { return a.id === id; })[0]; }
	var aForm = $('[data-addr-form]');
	function setPinBox(p) {
		var box = $('[data-addr-pinbox]'); box.classList.toggle('is-ok', !!p);
		box.querySelector('use').setAttribute('href', p ? '#i-circle-check' : '#i-map-pin');
		$('[data-addr-pintxt]').textContent = p ? 'Lokasi sudah ditandai (' + p.lat.toFixed(5) + ', ' + p.lng.toFixed(5) + ')' : 'Belum ditandai di peta';
		$('[data-addr-pin]').textContent = p ? 'Ubah titik' : 'Tandai di peta';
	}
	function openAddrForm(a) {
		editing = a || null; draftPin = a && a.pin ? { lat: a.lat, lng: a.lng } : null;
		$('[data-addr-title]').textContent = a ? 'Ubah alamat' : 'Tambah alamat';
		['name', 'phone', 'label', 'city', 'line'].forEach(function (k) { aForm[k].value = a ? a[k] : ''; });
		aForm.main.checked = !!(a && a.main); aForm.main.disabled = !!(a && a.main);
		$$('.tf-afld', aForm).forEach(function (f) { f.classList.remove('is-invalid'); });
		setPinBox(draftPin); openDlg('dlg-addr');
	}
	root.addEventListener('click', function (e) {
		var b;
		if ((b = e.target.closest('[data-addr-new]'))) { openAddrForm(null); return; }
		if ((b = e.target.closest('[data-a-edit]'))) { openAddrForm(byId(b.getAttribute('data-a-edit'))); return; }
		if ((b = e.target.closest('[data-a-main]'))) { var m = byId(b.getAttribute('data-a-main')); ADDR.forEach(function (x) { x.main = x === m; }); renderAddrs(); say('Alamat ' + m.label + ' dijadikan utama'); return; }
		if ((b = e.target.closest('[data-a-del]'))) { var d = byId(b.getAttribute('data-a-del')); delId = d.id; $('[data-addr-del-txt]').textContent = 'Alamat "' + d.label + '" (' + d.name + ') akan dihapus dari akun Anda.'; openDlg('dlg-addr-del'); return; }
		if ((b = e.target.closest('[data-a-pin]'))) { var p = byId(b.getAttribute('data-a-pin')); openPin(p.label + ' · ' + p.city, { lat: p.lat || -6.2, lng: p.lng || 106.816, line: p.line }, function (c) { p.pin = true; p.lat = c.lat; p.lng = c.lng; renderAddrs(); say('Lokasi ' + p.label + ' tersimpan'); }); }
	});
	var delId = null;
	$('[data-addr-del-ok]').addEventListener('click', function () {
		var i = ADDR.indexOf(byId(delId)); if (i < 0) return;
		var gone = ADDR.splice(i, 1)[0]; renderAddrs(); closeDlg($('#dlg-addr-del'));
		say('Alamat ' + gone.label + ' dihapus', function () { ADDR.splice(i, 0, gone); renderAddrs(); });
	});
	$('[data-addr-pin]').addEventListener('click', function () {
		var c = draftPin || (editing && editing.lat ? { lat: editing.lat, lng: editing.lng } : { lat: -6.2, lng: 106.816 });
		openPin(aForm.city.value || 'Alamat baru', { lat: c.lat, lng: c.lng, line: aForm.line.value }, function (p) { draftPin = p; setPinBox(p); });
	});
	aForm.addEventListener('input', function (e) { var f = e.target.closest('.tf-afld'); if (f) f.classList.remove('is-invalid'); });
	$('[data-addr-save]').addEventListener('click', function () {
		var bad = ['name', 'phone', 'label', 'city', 'line'].filter(function (k) { var v = !aForm[k].value.trim(); aForm[k].closest('.tf-afld').classList.toggle('is-invalid', v); return v; });
		if (bad.length) { aForm[bad[0]].focus(); return; }
		var a = editing || { id: 'a' + Date.now(), pin: false };
		['name', 'phone', 'label', 'city', 'line'].forEach(function (k) { a[k] = aForm[k].value.trim(); });
		if (draftPin) { a.pin = true; a.lat = draftPin.lat; a.lng = draftPin.lng; }
		if (aForm.main.checked) ADDR.forEach(function (x) { x.main = false; });
		a.main = aForm.main.checked || !!(editing && editing.main) || !ADDR.length;
		if (!editing) ADDR.push(a);
		renderAddrs(); closeDlg($('#dlg-addr')); say(editing ? 'Alamat diperbarui' : 'Alamat baru ditambahkan');
	});
	renderAddrs();

	/* pinpoint (tf-map.js; penyedia Leaflet, bisa diganti Google Maps) */
	var pin = { picker: null, done: null }, pinName = $('[data-pin-name]'), pinPin = $('[data-pin-pin]');
	function openPin(label, a, done) {
		pin.done = done; $('[data-pin-for]').textContent = label; pinName.textContent = a.line || 'Geser peta';
		openDlg('dlg-pin');
		if (!window.TFMap) return;
		if (!pin.picker) pin.picker = TFMap.picker({
			el: $('[data-pin-map]'), lat: a.lat, lng: a.lng,
			onMoveStart: function () { pinPin.classList.add('is-moving'); },
			onMove: function () { pinPin.classList.remove('is-moving'); },
			onName: function (t) { pinName.textContent = t === null ? 'Mencari alamat…' : t; }
		}); else pin.picker.go(a.lat, a.lng);
		setTimeout(function () { pin.picker.resize(); }, 60);
	}
	$('[data-pin-search]').addEventListener('submit', function (e) { e.preventDefault(); var v = $('[data-pin-q]').value.trim(); if (v && pin.picker) { pinName.textContent = 'Mencari…'; pin.picker.search(v, function (ok) { if (!ok) pinName.textContent = 'Alamat tidak ditemukan'; }); } });
	$('[data-pin-locate]').addEventListener('click', function () { var b = this; if (!pin.picker) return; b.disabled = true; pin.picker.locate(function () { b.disabled = false; }); });
	$('[data-pin-save]').addEventListener('click', function () {
		var c = pin.picker ? pin.picker.center() : null; closeDlg($('#dlg-pin'));
		if (c && pin.done) pin.done({ lat: +c.lat.toFixed(6), lng: +c.lng.toFixed(6) });   /* produksi: partner_latitude/longitude */
	});

	/* ---------- profil & keamanan ---------- */
	var pForm = $('[data-prof-form]');
	pForm.addEventListener('input', function (e) { var f = e.target.closest('.tf-afld'); if (f) f.classList.remove('is-invalid'); });
	$('[data-prof-save]').addEventListener('click', function () {
		var bad = ['name', 'phone'].filter(function (k) { var v = !pForm[k].value.trim(); pForm[k].closest('.tf-afld').classList.toggle('is-invalid', v); return v; });
		if (bad.length) { pForm[bad[0]].focus(); return; }
		say('Perubahan profil disimpan');
	});
	/* ---------- verifikasi ID: KTP & NPWP (boleh salah satu) ----------
	   Keadaan per bagian: 'edit' (form) | 'pending' (menunggu verifikasi) | 'verified' (terverifikasi)
	   | 'rejected' (ditolak: alasan dari tim Toffin + "Perbaiki & kirim ulang").
	   Data yang menunggu / terverifikasi tidak bisa diubah atau dibatalkan dari halaman ini.
	   Kirim ulang: form terisi data lama, isian yang bermasalah (fix) ditandai merah dengan alasannya;
	   foto lama dipakai lagi kecuali foto termasuk yang harus diperbaiki.
	   Foto: pratinjau kecil di form & ringkasan, ketuk untuk melihat besar (#dlg-photo).
	   Contoh skenario: ?verif=none (bawaan) | pending | verified | mix (KTP terverifikasi, NPWP menunggu)
	   | rejected (KTP ditolak: foto buram; NPWP ditolak: nama tidak sesuai).
	   Produksi: keadaan, data & foto dari profil Odoo; dokumen dinilai tim Toffin. */
	var vForm = $('[data-verif-form]'), verifBtn = $('[data-verif-save]'), vErr = $('[data-verif-err]'), vAct = $('[data-verif-act]');
	var VSEC = {
		ktp: { label: 'KTP', no: 'ktp_no', name: 'ktp_name', addr: 'ktp_addr', img: 'ktp_img', ok: function (d) { return d.length === 16; },
			mask: function (d) { return d.slice(0, 4) + ' •••• •••• ' + d.slice(12); } },
		npwp: { label: 'NPWP', no: 'npwp_no', name: 'npwp_name', addr: 'npwp_addr', img: 'npwp_img', ok: function (d) { return d.length === 15 || d.length === 16; },
			mask: function (d) { return d.length === 15 ? d.slice(0, 2) + '.' + d.slice(2, 5) + '.•••.•-•••.' + d.slice(12) : d.slice(0, 4) + ' •••• •••• ' + d.slice(12); } }
	};
	var BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
	function tgl(d) { return d.getDate() + ' ' + BLN[d.getMonth()] + ' ' + d.getFullYear(); }
	function mockCard(kind, name) {   /* gambar tiruan kartu untuk skenario contoh (bukan dokumen asli) */
		var bg = kind === 'KTP' ? '#cfe3f7' : '#f3e5c7', ink = kind === 'KTP' ? '#1e3a5f' : '#5b4210';
		var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 214"><rect width="340" height="214" rx="14" fill="' + bg + '"/>' +
			'<text x="20" y="34" font-family="Arial" font-size="16" font-weight="700" fill="' + ink + '">' + (kind === 'KTP' ? 'KARTU TANDA PENDUDUK' : 'NPWP · DJP') + '</text>' +
			'<rect x="20" y="52" width="190" height="9" rx="4" fill="' + ink + '" opacity=".35"/><rect x="20" y="72" width="150" height="9" rx="4" fill="' + ink + '" opacity=".25"/>' +
			'<rect x="20" y="92" width="170" height="9" rx="4" fill="' + ink + '" opacity=".25"/><rect x="20" y="112" width="120" height="9" rx="4" fill="' + ink + '" opacity=".25"/>' +
			'<text x="20" y="176" font-family="Arial" font-size="14" font-weight="700" fill="' + ink + '">' + name + '</text>' +
			'<text x="20" y="196" font-family="Arial" font-size="10" fill="' + ink + '" opacity=".7">CONTOH · bukan dokumen asli</text>' +
			(kind === 'KTP' ? '<rect x="244" y="52" width="76" height="96" rx="8" fill="#fff" opacity=".7"/><circle cx="282" cy="86" r="18" fill="' + ink + '" opacity=".3"/><rect x="258" y="110" width="48" height="30" rx="14" fill="' + ink + '" opacity=".3"/>' : '') + '</svg>';
		return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
	}
	var SAMPLE = {
		ktp: { no: '3171012345678901', name: 'Rendi Bagus', addr: 'Jl. Pluit Permai No. 4, RT.9/RW.4, Pluit, Penjaringan, Jakarta Utara', img: 'ktp-rendi-bagus.jpg', url: mockCard('KTP', 'RENDI BAGUS') },
		npwp: { no: '012345678901000', name: 'PT Kopi Nusantara', addr: 'Jl. Pluit Permai No. 4, Penjaringan, Jakarta Utara 14450', img: 'npwp-pt-kopi-nusantara.jpg', url: mockCard('NPWP', 'PT KOPI NUSANTARA') }
	};
	var scen = new URLSearchParams(location.search).get('verif') || 'none';
	var REJECT = {   /* contoh alasan penolakan; produksi: catatan peninjau di Odoo */
		ktp: { reason: 'Foto KTP buram, nomor dan nama tidak terbaca. Unggah ulang foto yang jelas, tidak terpotong, tanpa pantulan cahaya.', fix: ['img'] },
		npwp: { reason: 'Nama tidak sesuai dengan yang tertera di kartu NPWP. Tulis nama persis seperti di kartu.', fix: ['name'] }
	};
	function preset(k, st) {
		if (st === 'edit') return { state: 'edit' };
		var v = { state: st, data: SAMPLE[k], date: st === 'verified' ? '02 Okt 2026' : st === 'rejected' ? '12 Okt 2026' : '13 Okt 2026' };
		if (st === 'rejected') { v.reason = REJECT[k].reason; v.fix = REJECT[k].fix; }
		return v;
	}
	var V = {
		ktp: preset('ktp', { pending: 'pending', verified: 'verified', mix: 'verified', rejected: 'rejected' }[scen] || 'edit'),
		npwp: preset('npwp', { pending: 'pending', verified: 'verified', mix: 'pending', rejected: 'rejected' }[scen] || 'edit')
	};
	function secEl(k) { return $('[data-vsec="' + k + '"]'); }
	function setBadge(el, kind, html) { el.className = 'tf-abadge' + (kind ? ' tf-abadge--' + kind : ''); el.innerHTML = html; }
	function renderSec(k) {
		var v = V[k], c = VSEC[k], sec = secEl(k), view = $('[data-vview]', sec), form = $('[data-vform]', sec), st = $('[data-vsec-state]', sec);
		sec.classList.toggle('is-verified', v.state === 'verified'); sec.classList.toggle('is-pending', v.state === 'pending'); sec.classList.toggle('is-rejected', v.state === 'rejected');
		var note = $('[data-vnote]', sec); if (note) note.remove();
		if (v.state === 'edit') {
			view.hidden = true; form.hidden = false;
			if (v.redo) form.insertAdjacentHTML('beforebegin', '<p class="tf-aver__msg is-bad" data-vnote>' + ico('i-alert-circle') + '<span><b>Perbaiki lalu kirim ulang.</b> ' + esc(v.redo.reason) + '</span></p>');
			secCheck(k, false); return;
		}
		form.hidden = true; view.hidden = false;
		var d = v.data, pend = v.state === 'pending', rej = v.state === 'rejected', fix = v.fix || [];
		if (pend) setBadge(st, 'warn', ico('i-clock') + ' Menunggu verifikasi');
		else if (rej) setBadge(st, 'bad', ico('i-alert-circle') + ' Ditolak');
		else setBadge(st, 'ok', ico('i-circle-check') + ' Terverifikasi');
		function row(key, dt, dd, cls) { return '<div' + (fix.indexOf(key) > -1 ? ' class="is-bad"' : '') + '><dt>' + dt + '</dt><dd' + (cls ? ' class="' + cls + '"' : '') + '>' + dd + '</dd></div>'; }
		view.innerHTML =
			'<p class="tf-aver__msg ' + (pend ? 'is-pending' : rej ? 'is-bad' : 'is-ok') + '">' + ico(pend ? 'i-hourglass-high' : rej ? 'i-alert-circle' : 'i-shield-check') +
			'<span>' + (pend ? 'Dikirim ' + v.date + '. Data tidak dapat diubah selama proses verifikasi.'
				: rej ? '<b>Ditolak ' + v.date + '.</b> Alasan: ' + esc(v.reason)
				: 'Terverifikasi ' + v.date + '.' + (k === 'npwp' ? ' Faktur pajak diterbitkan atas nama ini.' : '')) + '</span></p>' +
			'<dl class="tf-aver__dl">' +
			row('no', 'No. ' + c.label, c.mask(d.no), 'is-num') +
			row('name', 'Nama', esc(d.name)) +
			row('addr', 'Alamat', esc(d.addr)) +
			row('img', 'Foto', d.url ? '<button type="button" class="tf-aver__thumb" data-v-photo="' + k + '" aria-label="Lihat foto ' + c.label + '"><img src="' + d.url + '" alt=""><span>' + esc(d.img) + '<small>Ketuk untuk memperbesar</small></span></button>' : esc(d.img)) + '</dl>' +
			(rej ? '<div class="tf-aver__vact"><button type="button" class="tf-abtn tf-abtn--sm" data-v-redo="' + k + '">' + ico('i-rotate') + ' Perbaiki &amp; kirim ulang</button></div>' : '');
	}
	function renderOverall() {
		var states = [V.ktp.state, V.npwp.state], ver = states.indexOf('verified') > -1, pend = states.indexOf('pending') > -1,
			rej = ['ktp', 'npwp'].filter(function (k) { return V[k].state === 'rejected' || V[k].redo; });
		var head = $('[data-verif-state]'), badge = $('[data-verif-badge]'), al = $('[data-verif-alert]');
		if (ver) { setBadge(head, 'ok', ico('i-circle-check') + ' Terverifikasi'); if (badge) setBadge(badge, 'ok', ico('i-circle-check') + ' Terverifikasi'); }
		else if (pend) { setBadge(head, 'warn', ico('i-clock') + ' Menunggu verifikasi'); if (badge) setBadge(badge, '', ico('i-clock') + ' Menunggu verifikasi'); }
		else if (rej.length) { setBadge(head, 'bad', ico('i-alert-circle') + ' Ditolak'); if (badge) setBadge(badge, 'bad', ico('i-alert-circle') + ' Verifikasi ditolak'); }
		else { setBadge(head, 'warn', ico('i-clock') + ' Belum terverifikasi'); if (badge) setBadge(badge, 'warn', ico('i-clock') + ' Belum terverifikasi'); }
		if (al) {
			al.hidden = ver || pend;
			var lbl = rej.map(function (k) { return VSEC[k].label; }).join(' & ');
			al.classList.toggle('is-bad', !!rej.length);
			$('div', al).innerHTML = rej.length ? '<strong>Verifikasi ' + lbl + ' ditolak</strong>Lihat alasannya, perbaiki data lalu kirim ulang.' : '<strong>Verifikasi ID belum lengkap</strong>Unggah KTP atau NPWP agar faktur pajak bisa diterbitkan atas nama usaha Anda.';
			$('a', al).textContent = rej.length ? 'Lihat alasan' : 'Lengkapi sekarang';
		}
		var editing = states.indexOf('edit') > -1;
		var lead = $('.tf-aver__lead'); if (lead) lead.hidden = !editing;
		vAct.hidden = !editing; verifBtn.disabled = false; verifBtn.textContent = 'Kirim untuk verifikasi'; vErr.hidden = true;
	}
	function renderVerif() { renderSec('ktp'); renderSec('npwp'); renderOverall(); }

	function secCheck(key, mark) {
		var c = VSEC[key], f = vForm, digits = f[c.no].value.replace(/\D/g, ''), file = f[c.img].files[0], imgOk = file ? f[c.img].getAttribute('data-ok') === '1' : !!(V[key].redo && V[key].redo.keep);
		var bad = { no: !c.ok(digits), name: !f[c.name].value.trim(), addr: !f[c.addr].value.trim(), img: !imgOk };
		var started = !!(digits || f[c.name].value.trim() || f[c.addr].value.trim() || file), complete = !bad.no && !bad.name && !bad.addr && !bad.img;
		if (mark) ['no', 'name', 'addr', 'img'].forEach(function (k) { f[c[k]].closest('.tf-afld').classList.toggle('is-invalid', started && bad[k]); });
		if (V[key].state === 'edit') setBadge($('[data-vsec="' + key + '"] [data-vsec-state]'), complete ? 'ok' : started ? 'warn' : '', complete ? 'Lengkap' : started ? 'Belum lengkap' : 'Belum diisi');
		return { started: started, complete: complete, firstBad: ['no', 'name', 'addr', 'img'].filter(function (k) { return bad[k]; }).map(function (k) { return f[c[k]]; })[0] };
	}
	/* tampilan kotak unggah: kosong | foto baru | foto lama (kirim ulang) */
	function uplView(inp, url, name, meta) {
		var lbl = inp.closest('[data-upl]'), isK = inp.name === 'ktp_img';
		var old = lbl.querySelector('.tf-aupl__thumb'); if (old) old.remove();
		var icon = lbl.querySelector('.tf-i'); if (icon) icon.style.display = url ? 'none' : '';
		lbl.classList.toggle('is-set', !!url);
		if (url) lbl.insertAdjacentHTML('afterbegin', '<img class="tf-aupl__thumb" src="' + url + '" alt="">');
		lbl.querySelector('strong').textContent = url ? name : 'Unggah foto ' + (isK ? 'KTP' : 'NPWP');
		lbl.querySelector('small').innerHTML = url ? meta + ' · <a href="#" data-v-photo-form="' + inp.name + '">Lihat</a> · ketuk untuk mengganti' : (isK ? 'JPG/PNG maks. 2 MB, foto jelas' : 'Kartu NPWP / SKT, JPG/PNG maks. 2 MB');
	}
	/* ditolak → form terisi data lama, isian bermasalah ditandai dengan alasannya */
	function redo(k) {
		var v = V[k], c = VSEC[k], f = vForm, d = v.data, fix = v.fix || [], inp = f[c.img];
		f[c.no].value = d.no; f[c.name].value = d.name; f[c.addr].value = d.addr;
		inp.value = ''; inp.removeAttribute('data-ok'); if (inp._url) { URL.revokeObjectURL(inp._url); inp._url = null; }
		var keep = fix.indexOf('img') < 0 ? { img: d.img, url: d.url } : null;
		inp._keep = keep;
		uplView(inp, keep && keep.url, keep && keep.img, 'Foto sebelumnya');
		V[k] = { state: 'edit', redo: { reason: v.reason, fix: fix, keep: keep } };
		renderVerif();
		['no', 'name', 'addr', 'img'].forEach(function (key) {
			var fld = f[c[key]].closest('.tf-afld'), bad = fix.indexOf(key) > -1, em = fld.querySelector('em');
			fld.classList.toggle('is-invalid', bad);
			if (bad) { if (!em.hasAttribute('data-def')) em.setAttribute('data-def', em.textContent); em.textContent = key === 'img' ? 'Foto sebelumnya ditolak, unggah foto baru yang jelas.' : 'Perbaiki isian ini sesuai alasan penolakan.'; }
		});
		var first = fix.length ? f[c[fix[0]]] : f[c.no];
		(first.type === 'file' ? first.closest('.tf-afld') : first).scrollIntoView({ behavior: 'smooth', block: 'center' });
		if (first.type !== 'file') first.focus({ preventScroll: true });
	}
	/* pratinjau foto */
	function showPhoto(title, url, cap) {
		$('[data-photo-title]').textContent = title; $('[data-photo-img]').src = url; $('[data-photo-img]').alt = title; $('[data-photo-cap]').textContent = cap || '';
		openDlg('dlg-photo');
	}
	root.addEventListener('click', function (e) {
		var b = e.target.closest('[data-v-photo]'); if (b) { var k = b.getAttribute('data-v-photo'), d = V[k].data; showPhoto('Foto ' + VSEC[k].label, d.url, d.img); return; }
		var r = e.target.closest('[data-v-redo]'); if (r) { redo(r.getAttribute('data-v-redo')); return; }
		var f = e.target.closest('[data-v-photo-form]'); if (f) { e.preventDefault(); var inp = vForm[f.getAttribute('data-v-photo-form')]; var u = inp && (inp._url || (!inp.files[0] && inp._keep && inp._keep.url)); if (u) showPhoto('Foto ' + (inp.name === 'ktp_img' ? 'KTP' : 'NPWP'), u, inp.files[0] ? inp.files[0].name : inp._keep.img); }
	});
	vForm.addEventListener('input', function (e) {
		var fld = e.target.closest('.tf-afld'); if (fld) { fld.classList.remove('is-invalid'); var em = fld.querySelector('em[data-def]'); if (em) em.textContent = em.getAttribute('data-def'); }
		var sec = e.target.closest('[data-vsec]'); vErr.hidden = true;
		if (!secCheck(sec.getAttribute('data-vsec'), false).started) $$('.tf-afld.is-invalid', sec).forEach(function (x) { x.classList.remove('is-invalid'); });   /* bagian dikosongkan lagi: bersihkan tanda */
	});
	$$('[data-upl] input', vForm).forEach(function (inp) {
		inp.addEventListener('change', function () {
			var lbl = inp.closest('[data-upl]'), f = inp.files[0], fld = inp.closest('.tf-afld'), err = fld.querySelector('em'), isK = inp.name === 'ktp_img';
			var ok = !!f && /image\/(png|jpe?g)/.test(f.type) && f.size <= 2 * 1024 * 1024;
			inp.setAttribute('data-ok', ok ? '1' : '0');
			if (inp._url) { URL.revokeObjectURL(inp._url); inp._url = null; }
			if (ok) inp._url = URL.createObjectURL(f);
			lbl.classList.toggle('is-set', ok); fld.classList.toggle('is-invalid', !!f && !ok);
			err.textContent = f && !ok ? (f.size > 2 * 1024 * 1024 ? 'Ukuran foto lebih dari 2 MB.' : 'Format harus JPG atau PNG.') : 'Foto ' + (isK ? 'KTP' : 'NPWP') + ' wajib diunggah (JPG/PNG maks. 2 MB).';
			if (ok) uplView(inp, inp._url, f.name, Math.round(f.size / 1024) + ' KB');
			else if (inp._keep && !f) uplView(inp, inp._keep.url, inp._keep.img, 'Foto sebelumnya');
			else uplView(inp, null);
			vErr.hidden = true; secCheck(inp.closest('[data-vsec]').getAttribute('data-vsec'), false);
		});
	});
	verifBtn.addEventListener('click', function () {
		var keys = ['ktp', 'npwp'].filter(function (k) { return V[k].state === 'edit'; });
		var r = {}; keys.forEach(function (k) { r[k] = secCheck(k, true); });
		var partial = keys.filter(function (k) { return r[k].started && !r[k].complete; });
		var done = keys.filter(function (k) { return r[k].complete; });
		if (partial.length) { var first = r[partial[0]].firstBad; if (first) { (first.type === 'file' ? first.closest('.tf-afld') : first).scrollIntoView({ behavior: 'smooth', block: 'center' }); if (first.type !== 'file') first.focus({ preventScroll: true }); } return; }
		if (!done.length) { vErr.hidden = false; vErr.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
		verifBtn.disabled = true; verifBtn.textContent = 'Mengirim…';
		setTimeout(function () {   /* produksi: kirim ke Odoo (res.partner + lampiran) */
			done.forEach(function (k) {
				var c = VSEC[k], f = vForm, inp = f[c.img];
				var nf = inp.files[0], keep = V[k].redo && V[k].redo.keep;
				V[k] = { state: 'pending', date: tgl(new Date()), data: { no: f[c.no].value.replace(/\D/g, ''), name: f[c.name].value.trim(), addr: f[c.addr].value.trim(), img: nf ? nf.name : keep.img, url: nf ? inp._url : keep.url } };
			});
			renderVerif();
			say('Data ' + done.map(function (k) { return VSEC[k].label; }).join(' & ') + ' terkirim, menunggu verifikasi');
		}, 700);
	});
	renderVerif();
	document.addEventListener('click', function (e) {   /* dialog ubah sandi selalu mulai dari langkah 1 */
		if (!e.target.closest('[data-dlg-open="dlg-pass"]')) return;
		var b = $('[data-pass-send]'); $('[data-pass-step="1"]').hidden = false; $('[data-pass-step="2"]').hidden = true; b.textContent = 'Kirim tautan'; b.removeAttribute('data-dlg-close');
	}, true);
	$('[data-pass-send]').addEventListener('click', function () {
		var b = this; b.disabled = true; b.textContent = 'Mengirim…';
		setTimeout(function () { $('[data-pass-step="1"]').hidden = true; $('[data-pass-step="2"]').hidden = false; b.disabled = false; b.textContent = 'Selesai'; b.setAttribute('data-dlg-close', ''); }, 900);
	});
	var delAgree = $('[data-del-agree]'), delOk = $('[data-del-ok]');
	delAgree.addEventListener('change', function () { delOk.disabled = !delAgree.checked; });
	delOk.addEventListener('click', function () { delOk.disabled = true; delOk.textContent = 'Menghapus…'; setTimeout(function () { location.href = 'index.html'; }, 900); });   /* produksi: hapus akun di server */
	$$('[data-pay-del]').forEach(function (b) { b.addEventListener('click', function () { var row = b.closest('.tf-apay__row'), p = row.parentNode, n = row.nextSibling; row.remove(); say('Kartu dihapus', function () { p.insertBefore(row, n); }); }); });
})();
