/* =====================================================================
   Toffin v2 · tf-checkout.js — halaman Checkout (checkout.html)
   Semua angka dihitung dari markup:
   - [data-co-item]: data-price, data-old (0 = tanpa coret), data-qty,
     flash sale: data-fs-end (detik sejak halaman dibuka; produksi: waktu
     akhir sesi dari server) + data-fs-normal; .is-off = stok habis.
   - [data-co-ship]: tiap distributor punya alamat tujuan sendiri (beda gudang,
     strip "Kirim ke" di kepala kartu); pengiriman = satu baris ringkas di
     bawah barang yang membuka lembar pilihan #dlg-ship: jenis (Kurir Toffin/
     Regular/Express/Same Day/Cargo) lalu ekspedisi; tarif & ketersediaan dari data-ship-cfg + alamat (ADDR dari
     #co-addresses): Kurir Toffin hanya area gudang, Same Day hanya satu
     kota, Express/Same Day tidak untuk mesin berat, tarif ×0,5 bila satu
     wilayah. Asuransi 0,2% subtotal, catatan.
   - [name=payment] (va | cc | ovo): data-fee "flat:4000" | "pct:2.5", OVO data-max
     (dinonaktifkan bila total melebihi); pembayaran diproses di halaman Xendit;
     Virtual Account wajib memilih bank ([name=vabank], chip di bawah baris).
   - Faktur pajak: sakelar [data-tax-toggle]; NPWP belum lengkap → info +
     "Lengkapi NPWP" (dialog #dlg-npwp, 15/16 digit) dan pembayaran terkunci
     selama faktur diminta tanpa NPWP. Contoh: NPWP kosong (QA case=npwp: lengkap).
   - Voucher (VOUCHERS di bawah, contoh) hanya untuk barang non-flash sale.
   - Toffin Point: saldo data-balance (1 poin = Rp 1).
   - Biaya packing per distributor (contoh): ada mesin/grinder/equipment
     (data-machine) → packing kayu Rp 150.000, selainnya packing standar Rp 10.000.
   Tombol bayar aktif bila semua alamat tujuan ter-pinpoint, semua pengiriman
   punya jenis & ekspedisi, metode bayar valid, dan S&K disetujui; bila belum, daftar
   "yang perlu dilengkapi" muncul dan kartu terkait disorot.
   Simulasi kasus: checkout.html?qa=1 (panel kiri bawah). Vanilla JS.
   ===================================================================== */
(function () {
	'use strict';
	var root = document.querySelector('[data-tf-checkout]');
	if (!root) return;
	function $$(sel, el) { return [].slice.call((el || document).querySelectorAll(sel)); }
	function $(sel, el) { return (el || document).querySelector(sel); }
	function rupiah(n) { return 'Rp ' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
	function setText(sel, txt) { $$(sel).forEach(function (el) { el.textContent = txt; }); }
	function pad(n) { return (n < 10 ? '0' : '') + n; }
	function hms(s) { var h = Math.floor(s / 3600); return (h ? pad(h) + ':' : '') + pad(Math.floor(s % 3600 / 60)) + ':' + pad(s % 60); }

	/* ---------- simulasi QA (?qa=1&case=a,b) ---------- */
	var params = new URLSearchParams(location.search);
	var cases = (params.get('case') || '').split(',').filter(Boolean);
	function qa(c) { return cases.indexOf(c) > -1; }
	var panel = $('[data-qa-panel]');
	if (panel && params.get('qa') === '1') {
		panel.hidden = false;
		var ttl = $('p', panel); ttl.setAttribute('role', 'button'); ttl.tabIndex = 0;
		if (window.innerWidth < 992) panel.classList.add('is-min');   /* ponsel: panel diciutkan */
		ttl.addEventListener('click', function () { panel.classList.toggle('is-min'); });
		$$('[data-qa]', panel).forEach(function (cb) {
			cb.checked = qa(cb.getAttribute('data-qa'));
			cb.addEventListener('change', function () {
				var list = $$('[data-qa]', panel).filter(function (x) { return x.checked; }).map(function (x) { return x.getAttribute('data-qa'); });
				params.set('qa', '1'); if (list.length) params.set('case', list.join(',')); else params.delete('case');
				location.search = params.toString();
			});
		});
	}
	if (qa('small')) $$('[data-co-ship]').slice(1).forEach(function (s) { s.remove(); });
	if (qa('stock')) $$('[data-co-item]').forEach(function (it) { if (/Milk Pitcher/.test(it.textContent)) { it.classList.add('is-off'); } });
	if (qa('fsend')) $$('[data-fs-end]').forEach(function (it) { it.setAttribute('data-fs-end', '0'); });
	if (qa('shiperr')) { var bdg = $('#ship-bdg'); if (bdg) bdg.setAttribute('data-failed', '1'); }

	var ships = $$('[data-co-ship]');
	ships.forEach(function (s, i) { var sm = $('[data-ship-step]', s); if (sm) sm.textContent = 'Pengiriman ' + (i + 1) + ' dari ' + ships.length; });

	/* ---------- alamat tujuan & pengiriman per distributor ---------- */
	var ADDR = JSON.parse($('#co-addresses').textContent);
	if (qa('nopin')) ADDR[0].pin = false;
	function addrById(id) { return ADDR.filter(function (a) { return a.id === id; })[0]; }
	var TYPES = [
		{ id: 'toffin', name: 'Kurir Toffin' }, { id: 'reg', name: 'Regular' }, { id: 'exp', name: 'Express' },
		{ id: 'sd', name: 'Same Day' }, { id: 'cargo', name: 'Cargo' }
	];
	var SH = ships.map(function (s) {
		var cfg = JSON.parse(s.getAttribute('data-ship-cfg'));
		var main = ADDR.filter(function (a) { return a.main; })[0] || ADDR[0];
		var addr = (qa('split') && s.id === 'ship-bdg') ? addrById('a4') : main;
		return { el: s, sel: $('[data-ship-select]', s), cfg: cfg, addr: addr.id, type: null, courier: null, failed: s.getAttribute('data-failed') === '1' };
	});
	function shipSub(sh) { return activeItems(sh.el).reduce(function (t, it) { return t + line(it).net; }, 0); }
	/* daftar ekspedisi + alasan bila jenis tidak tersedia */
	function typeInfo(sh, type) {
		var a = addrById(sh.addr), cfg = sh.cfg, same = a.region === cfg.region, sub = shipSub(sh);
		if (type === 'toffin') {
			if (!same) return { off: 'Tidak menjangkau alamat ini' };
			var free = sub >= 500000;
			return { list: [{ name: 'Kurir Toffin ' + cfg.city, eta: 'Tiba 1–4 hari kerja', cost: free ? 0 : 150000, normal: 150000, note: free ? 'Gratis ongkir, min. belanja Rp 500rb terpenuhi' : 'Tambah ' + rupiah(500000 - sub) + ' untuk gratis ongkir' }] };
		}
		if (type === 'sd') {
			if (a.town !== cfg.city) return { off: 'Hanya alamat satu kota dengan gudang' };
			if (cfg.heavy) return { off: 'Tidak untuk mesin & barang besar' };
		}
		if (type === 'exp' && cfg.heavy) return { off: 'Tidak untuk mesin & barang besar' };
		var rates = cfg.rates[type] || [];
		if (!rates.length) return { off: 'Tidak tersedia' };
		return { list: rates.map(function (r) { return { name: r[0], eta: /^Tiba/.test(r[1]) ? r[1] : 'Estimasi tiba ' + r[1], cost: same ? Math.round(r[2] * 0.5 / 1000) * 1000 : r[2] }; }) };
	}
	function courierCost(sh) { if (!sh.type || sh.courier == null) return null; var inf = typeInfo(sh, sh.type); return inf.list && inf.list[sh.courier] ? inf.list[sh.courier].cost : null; }
	function addrHtml(a, compact) {
		var pin = a.pin ? '<span class="tf-chip tf-chip--ok"><svg class="tf-i" aria-hidden="true"><use href="#i-map-pin"/></svg> Sudah pinpoint</span>'
			: '<span class="tf-chip tf-chip--warn"><svg class="tf-i" aria-hidden="true"><use href="#i-alert-circle"/></svg> Belum pinpoint</span>' + (compact ? ' <button type="button" class="tf-co__link" data-pin-addr="' + a.id + '">Tandai lokasi</button>' : '');
		return '<p class="tf-coaddr__name">' + a.name + ' <span>· ' + a.phone + '</span> <span class="tf-chip">' + a.label + '</span>' + (a.main ? ' <span class="tf-chip tf-chip--main">Utama</span>' : '') + '</p>' +
			'<p class="tf-coaddr__line">' + a.line + ', ' + a.city + '</p><p class="tf-coaddr__pin">' + pin + '</p>';
	}
	function addrShort(a) {   /* ringkas: kepala kartu & blok alamat (usulan C) */
		return '<p class="tf-coaddr__name">' + a.name + ' <span class="tf-chip">' + a.label + '</span>' + (a.main ? ' <span class="tf-chip tf-chip--main">Utama</span>' : '') + '</p><p class="tf-coaddr__line">' + a.line + ', ' + a.city + '</p>' +
			(a.pin ? '' : '<p class="tf-coaddr__pin"><span class="tf-chip tf-chip--warn"><svg class="tf-i" aria-hidden="true"><use href="#i-alert-circle"/></svg> Belum pinpoint</span> <button type="button" class="tf-co__link" data-pin-addr="' + a.id + '">Tandai lokasi</button></p>');
	}
	function renderSummary(sh) {   /* baris ringkas pengiriman (usulan B) */
		var a = addrById(sh.addr), t = $('[data-ship-summary-t]', sh.el), pr = $('[data-ship-summary-p]', sh.el), btn = $('[data-ship-summary]', sh.el);
		var tn = sh.type ? TYPES.filter(function (x) { return x.id === sh.type; })[0].name : '', inf = sh.type ? typeInfo(sh, sh.type) : null, c = inf && inf.list && sh.courier != null ? inf.list[sh.courier] : null;
		btn.classList.toggle('is-done', !!c);
		if (!a.pin) { t.innerHTML = '<strong class="is-warn">Pinpoint alamat dulu</strong><small>Ongkir dihitung dari lokasi alamat tujuan</small>'; pr.textContent = ''; return; }
		if (c) { t.innerHTML = '<strong>' + (sh.type === 'toffin' ? c.name : tn + ' · ' + c.name) + '</strong><small>' + c.eta + '</small>'; pr.innerHTML = c.cost ? rupiah(c.cost) : '<span class="is-free">Gratis</span>'; return; }
		t.innerHTML = sh.type ? '<strong class="is-empty">' + tn + ' · pilih ekspedisi</strong><small>' + (sh.hint || 'Ketuk untuk memilih ekspedisi') + '</small>'
			: '<strong class="is-empty">Pilih pengiriman</strong><small>' + (sh.hint || 'Kurir Toffin, Regular, Express, Same Day, atau Cargo') + '</small>';
		pr.textContent = '';
	}
	function renderShip(sh) {
		var s = sh.el, a = addrById(sh.addr), sel = sh.sel;
		$('[data-ship-addr]', s).innerHTML = addrShort(a);
		renderSummary(sh);
		var hint = $('[data-ship-hint]', sel), types = $('[data-ship-types]', sel), row = $('[data-ship-courier-row]', sel);
		if (!a.pin) {
			types.innerHTML = ''; row.hidden = true; hint.hidden = false; hint.className = 'tf-ship__hint is-warn';
			hint.textContent = 'Pinpoint alamat tujuan dulu agar jenis pengiriman & ongkir bisa dihitung.';
			return;
		}
		hint.hidden = !sh.hint; hint.className = 'tf-ship__hint'; hint.textContent = sh.hint || '';
		types.innerHTML = TYPES.map(function (t) {
			var inf = typeInfo(sh, t.id), off = !!inf.off, min = off ? 0 : Math.min.apply(null, inf.list.map(function (c) { return c.cost; }));
			var price = off ? inf.off : (min === 0 ? 'Gratis' : (inf.list.length > 1 ? 'mulai ' : '') + rupiah(min));
			return '<label class="tf-stype' + (off ? ' is-disabled' : '') + (sh.type === t.id ? ' is-on' : '') + '"><input type="radio" name="stype-' + s.id + '" value="' + t.id + '"' + (off ? ' disabled' : '') + (sh.type === t.id ? ' checked' : '') + '><strong>' + t.name + '</strong><small' + (min === 0 && !off ? ' class="is-free"' : '') + '>' + price + '</small></label>';
		}).join('');
		row.hidden = !sh.type;
		var err = $('[data-ship-err]', sel), list = $('[data-ship-couriers]', sel);
		if (!sh.type) return;
		if (sh.failed && sh.type !== 'toffin') { list.innerHTML = ''; err.hidden = false; return; }
		err.hidden = true;
		var inf = typeInfo(sh, sh.type);
		list.innerHTML = inf.list.map(function (c, i) {
			var price = c.cost === 0 ? '<span class="tf-radio__p is-free">' + (c.normal ? '<s>' + rupiah(c.normal) + '</s>' : '') + 'Gratis</span>' : '<span class="tf-radio__p">' + rupiah(c.cost) + '</span>';
			return '<label class="tf-radio"><input type="radio" name="courier-' + s.id + '" value="' + i + '"' + (sh.courier === i ? ' checked' : '') + '><span class="tf-radio__t"><strong>' + c.name + '</strong><small>' + c.eta + '</small>' + (c.note ? '<em class="' + (c.cost ? '' : 'is-ok') + '">' + c.note + '</em>' : '') + '</span>' + price + '</label>';
		}).join('');
	}
	function renderShips() { SH.forEach(renderShip); }

	/* ---------- flash sale ---------- */
	var t0 = Date.now(), endedNames = [];
	function endFs(it) {
		var normal = parseInt(it.getAttribute('data-fs-normal'), 10) || parseInt(it.getAttribute('data-price'), 10);
		it.classList.remove('is-fs'); it.removeAttribute('data-fs-end');
		it.setAttribute('data-price', normal); it.setAttribute('data-old', '0');
		$('[data-unit]', it).textContent = rupiah(normal);
		['[data-old-txt]', '[data-off]', '[data-fs-cd]'].forEach(function (s) { var el = $(s, it); if (el) el.remove(); });
		var tag = $('[data-fs-tag]', it); tag.classList.add('tf-coi__tag--ended'); $('[data-fs-label]', it).textContent = 'Flash sale berakhir';
		var note = $('[data-fs-note]', it); note.classList.add('tf-coi__note--warn'); $('[data-fs-note-txt]', it).textContent = 'Sesi sudah berakhir, harga kembali normal.';
		endedNames.push($('.tf-coi__name', it).textContent);
		var b = $('[data-co-fsended]'); b.hidden = false; $('[data-co-fsended-list]', b).textContent = endedNames.join(', ');
	}
	function tickFs() {
		var gone = (Date.now() - t0) / 1000, min = Infinity, changed = false;
		$$('[data-co-item][data-fs-end]').forEach(function (it) {
			var left = Math.max(0, Math.round(parseFloat(it.getAttribute('data-fs-end')) - gone));
			if (left <= 0) { endFs(it); changed = true; return; }
			min = Math.min(min, left);
			var cd = $('[data-fs-cd]', it); if (cd) cd.textContent = hms(left);
		});
		var banner = $('[data-co-fsbanner]'), live = $$('[data-co-item].is-fs:not(.is-off)').length;
		banner.hidden = !live; setText('[data-co-fscount]', live); if (live) setText('[data-co-fscd]', hms(min));
		if (changed) recalc();
		if (!live) clearInterval(fsTimer);
	}

	/* ---------- voucher (contoh; produksi dari server) ---------- */
	var VOUCHERS = [
		{ code: 'HEMAT500', title: 'Potongan Rp 500.000', desc: 'Min. belanja Rp 10 juta (di luar flash sale)', calc: function (c) { return c.nonFs >= 10000000 ? 500000 : 0; }, why: 'Belanja non-flash sale belum Rp 10 juta' },
		{ code: 'MESIN5', title: 'Diskon 5% mesin & grinder', desc: 'Maks. Rp 2.500.000, di luar flash sale', calc: function (c) { return Math.min(2500000, Math.round(c.machine * 0.05)); }, why: 'Tidak ada mesin atau grinder non-flash sale' },
		{ code: 'ONGKIR100', title: 'Potongan ongkir Rp 100.000', desc: 'Berlaku setelah kurir dipilih', calc: function (c) { return Math.min(100000, c.ship); }, why: 'Pilih kurir dulu' },
		{ code: 'OKTOBER', title: 'Promo Oktober 10%', desc: 'Berakhir 10 Okt 2026', expired: true }
	];
	var applied = null;
	function vctx() {
		var nonFs = 0, machine = 0, ship = 0;
		activeItems().forEach(function (it) { if (it.classList.contains('is-fs')) return; var d = line(it); nonFs += d.net; if (it.hasAttribute('data-machine')) machine += d.net; });
		SH.forEach(function (sh) { var c = courierCost(sh); if (c) ship += c; });
		return { nonFs: nonFs, machine: machine, ship: ship };
	}

	/* ---------- data barang ---------- */
	function activeItems(scope) { return $$('[data-co-item]', scope).filter(function (it) { return !it.classList.contains('is-off'); }); }
	function line(it) {
		var p = +it.getAttribute('data-price'), o = +it.getAttribute('data-old'), q = +it.getAttribute('data-qty');
		return { qty: q, net: p * q, gross: (o || p) * q, disc: o ? (o - p) * q : 0 };
	}

	/* ---------- hitung ulang ---------- */
	var state = {};
	function recalc() {
		var gross = 0, disc = 0, net = 0, count = 0, ship = 0, ins = 0, pack = 0, shipTodo = [], chosen = 0;
		SH.forEach(function (sh) {
			var s = sh.el;
			var sn = 0, sc = 0;
			$$('[data-co-item]', s).forEach(function (it) {
				var d = line(it), lt = $('[data-line]', it); if (lt) lt.textContent = rupiah(d.net);
				var sn2 = $('[data-stock-note]', it); if (sn2) sn2.hidden = !it.classList.contains('is-off');
				if (it.classList.contains('is-off')) return;
				gross += d.gross; disc += d.disc; net += d.net; count += d.qty; sn += d.net; sc += d.qty;
			});
			$('[data-ship-sub]', s).textContent = rupiah(sn); $('[data-ship-count]', s).textContent = sc;
			var insFee = Math.ceil(sn * 0.002 / 100) * 100; $('[data-ship-ins-val]', s).textContent = rupiah(insFee);
			if ($('[data-ship-ins]', s).checked) ins += insFee;
			var act = activeItems(s), pk = !act.length ? 0 : act.some(function (it) { return it.hasAttribute('data-machine'); }) ? 150000 : 10000;
			pack += pk; $('[data-ship-pack]', s).textContent = rupiah(pk);
			$('[data-ship-pack]', s).title = pk === 150000 ? 'Packing kayu untuk mesin & equipment' : 'Packing standar';
			var c = courierCost(sh), store = s.getAttribute('data-store');
			$('[data-ship-cost]', s).textContent = c == null ? '–' : (c ? rupiah(c) : 'Gratis');
			if (c != null) { ship += c; chosen++; }
			else if (!addrById(sh.addr).pin) shipTodo.push({ t: 'Pinpoint alamat tujuan ' + store, el: s });
			else if (!sh.type) shipTodo.push({ t: 'Pilih jenis pengiriman ' + store, el: s });
			else shipTodo.push({ t: 'Pilih ekspedisi ' + store, el: s });
		});
		var stockOut = $$('[data-co-item].is-off'), so = $('[data-co-stockout]');
		so.hidden = !stockOut.length; if (stockOut.length) $('[data-co-stockout-list]', so).textContent = stockOut.map(function (it) { return $('.tf-coi__name', it).textContent; }).join(', ');

		/* voucher */
		var vAmt = 0, vBtn = $('[data-co-vbtn]'), vT = $('[data-co-vbtn-t]');
		if (applied) { vAmt = applied.calc(vctx()); }
		vBtn.classList.toggle('is-applied', !!(applied && vAmt));
		vT.innerHTML = applied
			? '<strong>' + applied.code + (vAmt ? ' · hemat ' + rupiah(vAmt) : '') + '</strong><small>' + (vAmt ? applied.title : 'Syarat belum terpenuhi: ' + applied.why) + '</small>'
			: '<strong>Pakai voucher atau kode promo</strong><small>' + VOUCHERS.filter(function (v) { return !v.expired; }).length + ' voucher tersedia untuk Anda</small>';
		$('[data-co-vfsnote]').hidden = !$$('[data-co-item].is-fs:not(.is-off)').length;

		var base = net + ship + ins + pack - vAmt;
		/* metode bayar: batas transaksi OVO */
		$$('[name=payment]').forEach(function (r) {
			var lbl = r.closest('label'), why = $('[data-pay-why]', lbl), msg = '';
			var max = +r.getAttribute('data-max') || 0;
			if (max && base > max) msg = 'Total melebihi batas transaksi OVO';
			r.disabled = !!msg; lbl.classList.toggle('is-disabled', !!msg); why.hidden = !msg; why.textContent = msg;
			if (msg && r.checked) r.checked = false;
		});
		var pay = $('[name=payment]:checked'), admin = 0, bank = $('[name=vabank]:checked');
		$$('[data-pm-item]').forEach(function (it) { it.classList.toggle('is-on', !!pay && pay.value === it.getAttribute('data-pm-item')); });
		if (pay) { var f = pay.getAttribute('data-fee').split(':'); admin = f[0] === 'pct' ? Math.round(base * parseFloat(f[1]) / 100) : +f[1]; }
		setText('[data-sum-admin-lbl]', pay ? 'Biaya admin · ' + (pay.value === 'va' ? 'VA ' + (bank ? bank.getAttribute('data-bank') : '') : pay.getAttribute('data-name')) : 'Biaya admin');
		var before = base + admin, pts = $('[data-co-points]'), ptsAmt = pts.checked ? Math.min(+pts.getAttribute('data-balance'), before) : 0;
		var total = before - ptsAmt;

		setText('[data-sum-count]', count);
		setText('[data-sum-gross]', rupiah(gross));
		setText('[data-sum-disc]', '−' + rupiah(disc)); $('[data-sum-disc-row]').hidden = !disc;
		setText('[data-sum-ship]', !chosen ? '–' : (ship ? rupiah(ship) : 'Gratis') + (chosen < SH.length ? ' (' + chosen + '/' + SH.length + ')' : ''));
		setText('[data-sum-ins]', rupiah(ins)); $('[data-sum-ins-row]').hidden = !ins;
		setText('[data-sum-pack]', rupiah(pack)); $('[data-sum-pack-row]').hidden = !pack;
		setText('[data-sum-admin]', rupiah(admin)); $('[data-sum-admin-row]').hidden = !pay;
		setText('[data-sum-voucher]', '−' + rupiah(vAmt)); setText('[data-sum-voucher-lbl]', applied ? 'Voucher ' + applied.code : 'Voucher'); $('[data-sum-voucher-row]').hidden = !vAmt;
		setText('[data-sum-points]', '−' + rupiah(ptsAmt)); $('[data-sum-points-row]').hidden = !ptsAmt;
		setText('[data-sum-total]', rupiah(total));
		var save = disc + vAmt + ptsAmt; setText('[data-sum-save-val]', rupiah(save)); $('[data-sum-save]').hidden = !save;
		setText('[data-sum-earn]', String(Math.floor((net - vAmt) / 1000)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
		setText('[data-co-headcount]', count + ' barang dari ' + ships.length + ' distributor');

		/* syarat bayar */
		var todo = [];
		todo = todo.concat(shipTodo);
		if (!pay) todo.push({ t: 'Pilih metode pembayaran', el: $('#co-payment') });
		else if (pay.value === 'va' && !bank) todo.push({ t: 'Pilih bank Virtual Account', el: $('#co-payment') });
		renderTax();
		if ($('[data-tax-toggle]').checked && !npwp) todo.push({ t: 'Lengkapi NPWP untuk faktur pajak', el: $('#co-payment') });
		if (!$('[data-co-agree]').checked) todo.push({ t: 'Setujui Syarat & Ketentuan', el: $('[data-co-agree-wrap]') });
		if (!count) todo.push({ t: 'Tidak ada barang yang bisa dibayar', el: null });
		state = { todo: todo, total: total, sum: { count: count, gross: gross, disc: disc, ship: ship, ins: ins, pack: pack, admin: admin, voucher: vAmt, vcode: applied ? applied.code : '', points: ptsAmt, total: total, save: save, earn: Math.floor((net - vAmt) / 1000) } };
		$$('[data-co-pay]').forEach(function (a) { a.setAttribute('aria-disabled', todo.length ? 'true' : 'false'); });
		renderTodo(false);
	}
	var showTodo = false;
	function renderTodo(force) {
		if (force) showTodo = true;
		var ul = $('[data-co-todo]');
		ul.hidden = !showTodo || !state.todo.length;
		ul.innerHTML = state.todo.map(function (t, i) { return '<li><button type="button" data-todo="' + i + '">' + t.t + '</button></li>'; }).join('');
		$$('.tf-co__card.is-invalid, .is-invalid[data-co-agree-wrap]').forEach(function (el) { el.classList.remove('is-invalid'); });
		if (showTodo) state.todo.forEach(function (t) { if (t.el) t.el.classList.add('is-invalid'); });
	}
	function goTo(el) {
		if (!el) return;
		el.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}

	/* ---------- event ---------- */
	SH.forEach(function (sh) {
		var s = sh.el;
		sh.sel.addEventListener('change', function (e) {   /* di kartu, atau di lembar pilihan (usulan B) */
			var t = e.target;
			if (t.name === 'stype-' + s.id) {
				sh.type = t.value; sh.hint = '';
				var inf = typeInfo(sh, sh.type); sh.courier = inf.list && inf.list.length === 1 ? 0 : null;   /* satu ekspedisi: langsung terpilih */
				renderShip(sh); recalc();
			} else if (t.name === 'courier-' + s.id) { sh.courier = +t.value; renderSummary(sh); recalc(); }
			updateShipDlg();
		});
		$('[data-ship-ins]', s).addEventListener('change', recalc);
		$('[data-ship-summary]', s).addEventListener('click', function () { if (!addrById(sh.addr).pin) { openAddr(sh); return; } openShipDlg(sh); });
		$('[data-ship-addr-change]', s).addEventListener('click', function () { openAddr(sh); });
		$('[data-ship-retry]', sh.sel).addEventListener('click', function () {
			var b = this; b.textContent = 'Memuat…';
			setTimeout(function () { sh.failed = false; b.textContent = 'Coba lagi'; renderShip(sh); }, 900);
		});
		var note = $('[data-ship-note]', s), cnt = $('[data-ship-note-count]', s);
		note.addEventListener('input', function () { cnt.textContent = note.value.length + '/200'; });
	});
	$$('[data-co-toggle]').forEach(function (b) {
		b.addEventListener('click', function () {
			var it = b.closest('[data-co-item]'), open = !it.classList.contains('is-open');
			it.classList.toggle('is-open', open); b.setAttribute('aria-expanded', open);
			b.querySelector('span').textContent = open ? 'Sembunyikan isi paket' : 'Lihat isi paket';
		});
	});
	document.addEventListener('change', function (e) {
		if (e.target.matches('[name=payment], [name=vabank], [data-tax-toggle], [data-co-points], [data-co-agree]')) recalc();
	});
	root.addEventListener('click', function (e) {
		var t = e.target.closest('[data-todo]');
		if (t) { goTo(state.todo[+t.getAttribute('data-todo')].el); return; }
		var p = e.target.closest('[data-co-pay]');
		if (!p) return;
		e.preventDefault();
		if (state.todo.length) { renderTodo(true); goTo(state.todo[0].el); return; }
		$$('[data-co-pay]').forEach(function (a) { a.classList.add('is-busy'); var s = a.querySelector('span') || a; s.textContent = 'Memproses…'; });
		saveOrder();
		setTimeout(function () { location.href = p.getAttribute('href'); }, 1000);   /* produksi: buat pesanan → halaman instruksi bayar */
	});

	/* ---------- dialog ---------- */
	var lastFocus = null;
	function openDlg(id) { var d = document.getElementById(id); if (!d) return; lastFocus = document.activeElement; d.classList.add('is-open'); document.body.classList.add('tf-lock'); var f = id === 'dlg-pin' ? d.querySelector('.tf-dlg__x') : d.querySelector('input:checked, input, button'); if (f) f.focus();   /* peta: jangan buka keyboard ponsel */ if (id === 'dlg-voucher') renderVouchers(); }
	function closeDlg(d) {
		d.classList.remove('is-open'); document.body.classList.remove('tf-lock');
		if (d.id === 'dlg-ship' && shipDlg) { $('[data-ship-summary]', shipDlg.el).after(shipDlg.sel); renderShip(shipDlg); shipDlg = null; }   /* kembalikan pilihan ke kartu */
		if (lastFocus) lastFocus.focus();
	}
	/* lembar pilihan pengiriman (usulan B): isi [data-ship-select] kartu dipindah ke dialog */
	var shipDlg = null;
	function openShipDlg(sh) {
		shipDlg = sh;
		$('#dlg-ship-t').textContent = 'Pengiriman · ' + sh.el.getAttribute('data-store');
		$('[data-dlg-ship-body]').appendChild(sh.sel);
		updateShipDlg(); openDlg('dlg-ship');
	}
	function updateShipDlg() { var b = $('[data-dlg-ship-save]'); if (b && shipDlg) b.disabled = courierCost(shipDlg) == null; }
	$('[data-dlg-ship-save]').addEventListener('click', function () { closeDlg($('#dlg-ship')); });
	document.addEventListener('click', function (e) {
		var o = e.target.closest('[data-dlg-open]'); if (o) { e.preventDefault(); openDlg(o.getAttribute('data-dlg-open')); return; }
		var c = e.target.closest('[data-dlg-close]'); if (c) { closeDlg(c.closest('.tf-dlg')); return; }
		if (e.target.classList.contains('tf-dlg')) closeDlg(e.target);
	});
	document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var d = $('.tf-dlg.is-open'); if (d) closeDlg(d); } });
	var addrTarget = null, addrList = $('[data-addr-list]');
	function openAddr(sh) {
		addrTarget = sh;
		$('[data-addr-for]').innerHTML = 'Untuk barang dari <b>' + sh.el.getAttribute('data-store') + '</b>. Tiap distributor bisa dikirim ke alamat berbeda.';
		addrList.innerHTML = ADDR.map(function (a) {
			return '<label class="tf-radio"><input type="radio" name="address" value="' + a.id + '"' + (a.id === sh.addr ? ' checked' : '') + '><span class="tf-radio__t">' + addrHtml(a, false) + '</span></label>';
		}).join('');
		$('[data-addr-all]').checked = false;
		syncAddrBtn();
		openDlg('dlg-address');
	}
	function syncAddrBtn() {   /* alamat belum pinpoint: tombol jadi "Tandai lokasi & pakai" */
		var r = $('[name=address]:checked', addrList), a = r && addrById(r.value);
		$('[data-addr-save-t]').textContent = a && !a.pin ? 'Tandai lokasi & pakai' : 'Pakai alamat ini';
	}
	addrList.addEventListener('change', syncAddrBtn);
	function applyAddr(id, targets) {
		targets.forEach(function (sh) {
			if (sh.addr === id) return;
			if (sh.type) sh.hint = 'Alamat tujuan berubah, pilih ulang jenis pengiriman & ekspedisi.';
			sh.addr = id; sh.type = null; sh.courier = null;
		});
		renderShips(); recalc();
	}
	$('[data-addr-save]').addEventListener('click', function () {
		var r = $('[name=address]:checked', addrList); if (!r || !addrTarget) return;
		var targets = $('[data-addr-all]').checked ? SH : [addrTarget];
		closeDlg($('#dlg-address'));
		if (!addrById(r.value).pin) { openPin(r.value, targets); return; }   /* pinpoint dulu, baru dipakai */
		applyAddr(r.value, targets);
	});

	/* ---------- pinpoint lokasi (tf-map.js; penyedia Leaflet, bisa diganti Google Maps) ---------- */
	var pin = { id: null, targets: null, picker: null }, pinName = $('[data-pin-name]'), pinPin = $('[data-pin-pin]');
	function openPin(id, targets) {
		var a = addrById(id); pin.id = id; pin.targets = targets || null;
		$('[data-pin-for]').textContent = a.label + ' · ' + a.city;
		pinName.textContent = a.line;
		$('[data-pin-save]').textContent = targets ? 'Simpan lokasi & pakai' : 'Simpan lokasi';
		openDlg('dlg-pin');
		if (!window.TFMap) return;
		if (!pin.picker) {
			pin.picker = TFMap.picker({
				el: $('[data-pin-map]'), lat: a.lat, lng: a.lng,
				onMoveStart: function () { pinPin.classList.add('is-moving'); },
				onMove: function () { pinPin.classList.remove('is-moving'); },
				onName: function (t) { pinName.textContent = t === null ? 'Mencari alamat…' : t; }
			});
		} else pin.picker.go(a.lat, a.lng);
		setTimeout(function () { pin.picker.resize(); }, 60);   /* dialog baru tampil: ukur ulang peta */
	}
	document.addEventListener('click', function (e) {
		var b = e.target.closest('[data-pin-addr]'); if (b) { e.preventDefault(); openPin(b.getAttribute('data-pin-addr'), null); }
	});
	$('[data-pin-search]').addEventListener('submit', function (e) {
		e.preventDefault(); var v = $('[data-pin-q]').value.trim(); if (!v || !pin.picker) return;
		pinName.textContent = 'Mencari…';
		pin.picker.search(v, function (ok) { if (!ok) pinName.textContent = 'Alamat tidak ditemukan, coba kata lain'; });
	});
	$('[data-pin-locate]').addEventListener('click', function () {
		var b = this; if (!pin.picker) return; b.disabled = true;
		pin.picker.locate(function (ok) { b.disabled = false; if (!ok) pinName.textContent = 'Lokasi perangkat tidak tersedia'; });
	});
	$('[data-pin-save]').addEventListener('click', function () {
		var a = addrById(pin.id); if (!a) return;
		var c = pin.picker ? pin.picker.center() : { lat: a.lat, lng: a.lng };
		a.pin = true; a.lat = +c.lat.toFixed(6); a.lng = +c.lng.toFixed(6);   /* produksi: simpan partner_latitude/longitude ke alamat (Odoo) */
		closeDlg($('#dlg-pin'));
		if (pin.targets) applyAddr(a.id, pin.targets); else { renderShips(); recalc(); }
	});

	/* ---------- faktur pajak & NPWP ---------- */
	var npwp = qa('npwp') ? { name: 'PT Kopi Nusantara', no: '012345678901000', addr: 'Jl. Pluit Permai No. 4, Penjaringan, Jakarta Utara' } : null;   /* contoh: data dari profil pelanggan */
	function fmtNpwp(d) { return d.length === 15 ? d.replace(/^(\d{2})(\d{3})(\d{3})(\d)(\d{3})(\d{3})$/, '$1.$2.$3.$4-$5.$6') : d.replace(/(\d{4})(?=\d)/g, '$1 '); }
	function renderTax() {
		var on = $('[data-tax-toggle]').checked;
		$('[data-tax-missing]').hidden = !on || !!npwp;
		$('[data-tax-ok]').hidden = !on || !npwp;
		if (npwp) { $('[data-tax-name]').textContent = npwp.name; $('[data-tax-npwp]').textContent = fmtNpwp(npwp.no); }
	}
	var nForm = $('[data-npwp-form]');
	document.addEventListener('click', function (e) {   /* isi ulang formulir saat dialog dibuka */
		if (!e.target.closest('[data-dlg-open="dlg-npwp"]')) return;
		nForm.npwp_name.value = npwp ? npwp.name : ''; nForm.npwp.value = npwp ? fmtNpwp(npwp.no) : ''; nForm.npwp_addr.value = npwp ? npwp.addr : '';
		$$('.tf-fld', nForm).forEach(function (f) { f.classList.remove('is-invalid'); });
	}, true);
	nForm.addEventListener('input', function (e) { var f = e.target.closest('.tf-fld'); if (f) f.classList.remove('is-invalid'); });
	$('[data-npwp-upload]').addEventListener('change', function () { $('[data-npwp-file]').textContent = this.files[0] ? this.files[0].name : 'Unggah foto NPWP'; });
	$('[data-npwp-save]').addEventListener('click', function () {
		var name = nForm.npwp_name.value.trim(), no = nForm.npwp.value.replace(/\D/g, ''), addr = nForm.npwp_addr.value.trim();
		var bad = [[nForm.npwp_name, !name], [nForm.npwp, !/^\d{15,16}$/.test(no)], [nForm.npwp_addr, !addr]];
		bad.forEach(function (b) { b[0].closest('.tf-fld').classList.toggle('is-invalid', b[1]); });
		if (bad.some(function (b) { return b[1]; })) { var first = bad.filter(function (b) { return b[1]; })[0][0]; first.focus(); return; }
		npwp = { name: name, no: no, addr: addr };   /* produksi: simpan ke profil (Odoo res.partner vat) */
		closeDlg($('#dlg-npwp')); recalc();
	});

	/* voucher */
	var vList = $('[data-v-list]'), vMsg = $('[data-v-msg]'), vForm = $('[data-v-form]'), vInput = $('[data-v-input]');
	function msg(t, ok) { vMsg.hidden = false; vMsg.textContent = t; vMsg.className = 'tf-vmsg ' + (ok ? 'is-ok' : 'is-err'); }
	function renderVouchers() {
		var c = vctx();
		vList.innerHTML = VOUCHERS.map(function (v) {
			var amt = v.expired ? 0 : v.calc(c), on = applied && applied.code === v.code, off = v.expired || !amt;
			return '<div class="tf-vcard' + (off && !on ? ' is-off' : '') + '"><span class="tf-vcard__ico"><svg class="tf-i" aria-hidden="true"><use href="#i-ticket"/></svg></span><div><p>' + v.title + '</p><small>' + v.desc + ' · <code>' + v.code + '</code></small>' +
				(v.expired ? '<em>Voucher sudah berakhir</em>' : (!amt ? '<em>' + v.why + '</em>' : '<small style="color:#15803d;font-weight:800">Hemat ' + rupiah(amt) + '</small>')) +
				'</div><button type="button" data-v-code="' + v.code + '"' + (off && !on ? ' disabled' : '') + '>' + (on ? 'Lepas' : 'Pakai') + '</button></div>';
		}).join('');
	}
	function applyCode(code) {
		code = code.trim().toUpperCase(); if (!code) { msg('Masukkan kode promo.', false); return; }
		var v = VOUCHERS.filter(function (x) { return x.code === code; })[0];
		if (!v) { msg('Kode "' + code + '" tidak ditemukan.', false); return; }
		if (v.expired) { msg('Voucher ' + code + ' sudah berakhir.', false); return; }
		var amt = v.calc(vctx()); if (!amt) { msg('Belum bisa dipakai: ' + v.why + '.', false); return; }
		applied = v; msg('Voucher ' + code + ' terpasang, hemat ' + rupiah(amt) + '.', true); recalc(); renderVouchers();
		setTimeout(function () { closeDlg($('#dlg-voucher')); vMsg.hidden = true; }, 700);
	}
	vForm.addEventListener('submit', function (e) { e.preventDefault(); applyCode(vInput.value); });
	vList.addEventListener('click', function (e) {
		var b = e.target.closest('[data-v-code]'); if (!b || b.disabled) return;
		var code = b.getAttribute('data-v-code');
		if (applied && applied.code === code) { applied = null; msg('Voucher ' + code + ' dilepas.', true); recalc(); renderVouchers(); return; }
		applyCode(code);
	});

	/* ---------- ringkasan pesanan untuk success-checkout.html (sessionStorage tfOrder; produksi: dari server) ---------- */
	function saveOrder() {
		var pay = $('[name=payment]:checked'), bank = $('[name=vabank]:checked');
		var order = {
			no: 'SO' + String(Date.now()).slice(-6), date: new Date().toISOString(), sum: state.sum,
			methodType: pay.value, bankName: bank ? bank.getAttribute('data-bank') : '',
			method: pay.value === 'va' ? 'Virtual Account ' + bank.getAttribute('data-bank') : pay.getAttribute('data-name'),
			methodLogo: pay.value === 'va' ? bank.value : pay.value === 'ovo' ? 'ovo' : pay.value === 'cc' ? 'visa' : '',
			tax: $('[data-tax-toggle]').checked && npwp ? { name: npwp.name, npwp: fmtNpwp(npwp.no) } : null,
			ships: SH.map(function (sh) {
				var a = addrById(sh.addr), inf = typeInfo(sh, sh.type), c = inf.list[sh.courier], tn = TYPES.filter(function (x) { return x.id === sh.type; })[0].name;
				return {
					store: sh.el.getAttribute('data-store'), city: sh.cfg.city, courier: sh.type === 'toffin' ? c.name : tn + ' · ' + c.name, eta: c.eta, cost: c.cost,
					qc: !!$('.tf-ship__qc', sh.el), addr: { name: a.name, label: a.label, line: a.line + ', ' + a.city },
					items: activeItems(sh.el).map(function (it) { return { name: $('.tf-coi__name', it).textContent, img: $('.tf-coi__thumb img', it).getAttribute('src'), qty: +it.getAttribute('data-qty'), fs: it.classList.contains('is-fs') }; })
				};
			})
		};
		try { sessionStorage.setItem('tfOrder', JSON.stringify(order)); } catch (err) {}
	}

	/* ---------- isi contoh untuk QA/review (?demo=partial|full) ---------- */
	var demo = params.get('demo');
	if (demo === 'partial' || demo === 'full') {
		SH[0].type = 'toffin'; SH[0].courier = 0;
		if (SH[1]) { SH[1].type = 'cargo'; if (demo === 'full') SH[1].courier = 1; }
		if (SH[2] && demo === 'full') { SH[2].type = 'reg'; SH[2].courier = 0; }
		if (demo === 'full') {
			if (SH[1]) $('[data-ship-ins]', SH[1].el).checked = true;
			var va = $('[name=payment][value=va]'); if (va) va.checked = true;
			var bca = $('[name=vabank][value=bca]'); if (bca) bca.checked = true;
			$('[data-co-agree]').checked = true;
		}
	}

	/* ---------- mulai ---------- */
	renderShips();
	var fsTimer = setInterval(tickFs, 1000);
	tickFs();
	recalc();
})();
