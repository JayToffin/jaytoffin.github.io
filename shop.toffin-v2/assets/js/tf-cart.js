/* =====================================================================
   Toffin v2 · tf-cart.js — halaman Keranjang.
   Semua angka dihitung dari markup: tiap [data-cart-item] punya data-price
   (harga satuan), data-old (harga coret, 0 bila tidak ada) dan input jumlah.
   - Checkbox: pilih semua ↔ per distributor ↔ per barang (indeterminate).
   - Stepper jumlah (di qty 1 tombol minus abu-abu, ditekan = hapus; qty 0 / kosong = hapus),
     hapus barang / distributor / yang terpilih (selalu lewat pop-up konfirmasi
     #cart-confirm; batal → qty kembali 1), keranjang kosong.
   - Ringkasan belanja + bar sticky ponsel + badge keranjang di header.
   - Barang .is-off (habis, varian kosong, atau paket berisi produk kosong) tidak bisa dipilih/di-checkout.
   - Isi paket bundling bisa dibuka-tutup; varian tiap isi paket tampil sebagai chip.
   - Flash sale (.is-fs): hitung mundur per barang (data-fs-end, detik), batas
     pembelian per akun (data-fs-limit → max stepper), saat sesi habis harga
     kembali normal (data-fs-normal). Catatan voucher di ringkasan. (Kode promo nanti di checkout.)
   Vanilla JS, tanpa jQuery; di Odoo nanti diganti data dari server.
   ===================================================================== */
(function () {
	'use strict';
	var root = document.querySelector('[data-tf-cart]');
	if (!root) return;
	var list = root.querySelector('.tf-cart__list');
	function $$(sel, el) { return [].slice.call((el || root).querySelectorAll(sel)); }
	function rupiah(n) { return 'Rp ' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
	function setText(sel, txt) { $$(sel).forEach(function (el) { el.textContent = txt; }); }
	function maxOf(inp) { return parseInt(inp.getAttribute('max'), 10) || 99; }   /* flash sale: batas per akun */

	/* ---------- data per baris ---------- */
	function rowData(row) {
		var off = row.classList.contains('is-off');
		var qtyEl = row.querySelector('[data-qty]');
		var qty = qtyEl ? Math.max(1, parseInt(qtyEl.value, 10) || 1) : 1;
		var price = parseInt(row.getAttribute('data-price'), 10) || 0;
		var old = parseInt(row.getAttribute('data-old'), 10) || 0;
		var chk = row.querySelector('[data-item-check]');
		return { off: off, qty: qty, price: price, old: old, checked: !off && chk && chk.checked, line: price * qty, disc: old ? (old - price) * qty : 0 };
	}

	/* ---------- hitung ulang semua ---------- */
	function recalc() {
		var groups = $$('[data-cart-group]');
		var gross = 0, disc = 0, count = 0, allItems = 0, allChecked = 0, badge = 0, fsCount = 0;
		groups.forEach(function (g) {
			var rows = $$('[data-cart-item]', g), gs = 0, gd = 0, gc = 0, enabled = 0, checked = 0;
			rows.forEach(function (row) {
				var d = rowData(row);
				var line = row.querySelector('[data-line]'); if (line) line.textContent = rupiah(d.line);
				var minus = row.querySelector('[data-qty-minus]');
				if (minus) {   /* qty 1: minus tetap aktif (abu-abu); ditekan = konfirmasi hapus, seperti Shopee */
					var del = d.qty <= 1;
					minus.disabled = false; minus.classList.toggle('is-del', del);
					minus.setAttribute('aria-label', del ? 'Kurangi jumlah (hapus barang)' : 'Kurangi jumlah');
				}
				var plus = row.querySelector('[data-qty-plus]'), qi = row.querySelector('[data-qty]'); if (plus && qi) plus.disabled = d.qty >= maxOf(qi);
				if (row.classList.contains('is-fs')) row.classList.toggle('is-limit', d.qty >= maxOf(qi));
				if (!d.off && d.checked && row.classList.contains('is-fs')) fsCount++;
				if (d.off) return;
				enabled++; badge += d.qty;
				if (d.checked) { checked++; gs += d.line; gd += d.disc; gc += d.qty; }
			});
			var gchk = g.querySelector('[data-group-check]');
			gchk.checked = enabled > 0 && checked === enabled;
			gchk.indeterminate = checked > 0 && checked < enabled;
			gchk.disabled = enabled === 0;
			g.querySelector('[data-group-count]').textContent = gc;
			g.querySelector('[data-group-sub]').textContent = rupiah(gs);
			g.querySelector('[data-group-disc]').textContent = '−' + rupiah(gd);
			g.querySelector('[data-group-disc-row]').hidden = gd === 0;
			gross += gs; disc += gd; count += gc; allItems += enabled; allChecked += checked;
		});
		$$('[data-all-check]').forEach(function (c) { c.checked = allItems > 0 && allChecked === allItems; c.indeterminate = allChecked > 0 && allChecked < allItems; c.disabled = allItems === 0; });
		setText('[data-all-count]', count);
		setText('[data-sum-count]', count);
		setText('[data-sum-gross]', rupiah(gross + disc));
		setText('[data-sum-disc]', '−' + rupiah(disc));
		setText('[data-sum-total]', rupiah(gross));
		setText('[data-sum-save-val]', rupiah(disc));
		setText('[data-sum-cta-count]', count);
		var save = root.querySelector('[data-sum-save]'); if (save) save.hidden = disc === 0;
		var fsn = root.querySelector('[data-sum-fs]'); if (fsn) { fsn.hidden = fsCount === 0; setText('[data-sum-fs-count]', fsCount); }
		$$('[data-sum-cta]').forEach(function (a) { a.setAttribute('aria-disabled', count === 0 ? 'true' : 'false'); });
		var del = root.querySelector('[data-del-selected]'); if (del) del.disabled = allChecked === 0;
		var head = root.querySelector('[data-cart-head-count]'); if (head) head.textContent = badge + ' barang dari ' + groups.length + ' distributor';
		var hb = document.querySelector('[data-tf-cart-badge]'); if (hb) hb.textContent = badge;
		root.classList.toggle('is-empty', groups.length === 0);
	}

	/* ---------- hapus ---------- */
	function removeRow(row) {
		var g = row.closest('[data-cart-group]');
		row.remove();
		if (g && !g.querySelector('[data-cart-item]')) g.remove();
	}

	/* ---------- konfirmasi hapus (#cart-confirm) ---------- */
	var dlg = document.getElementById('cart-confirm'), onOk = null, onCancel = null, lastTrigger = null;
	function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
	function confirmDel(o, ok, cancel) {
		if (!dlg) { ok(); return; }   /* tanpa markup dialog: langsung hapus */
		onOk = ok; onCancel = cancel || null; lastTrigger = o.trigger || null;
		dlg.querySelector('[data-cc-title]').textContent = o.title;
		dlg.querySelector('[data-cc-text]').textContent = o.text;
		dlg.querySelector('[data-cc-ok]').textContent = o.ok;
		var rows = o.rows || [], show = rows.slice(0, 3);
		dlg.querySelector('[data-cc-items]').innerHTML = show.map(function (r) {
			var img = r.querySelector('.tf-item__thumb img'), name = (r.querySelector('.tf-item__name') || {}).textContent || '', qty = r.querySelector('[data-qty]');
			return '<div class="tf-cdlg__item"><img src="' + (img ? img.getAttribute('src') : '') + '" alt=""><span>' + esc(name.trim()) + '</span>' + (qty && +qty.value > 1 ? '<b>×' + qty.value + '</b>' : '') + '</div>';
		}).join('') + (rows.length > 3 ? '<p class="tf-cdlg__more">+' + (rows.length - 3) + ' produk lainnya</p>' : '');
		dlg.hidden = false; document.body.classList.add('tf-lock');
		dlg.querySelector('[data-cc-cancel]').focus();
	}
	function askDeleteItem(it, trigger, cancel) {
		var bundle = !!it.querySelector('[data-bundle-toggle]'), fs = it.classList.contains('is-fs');
		confirmDel({
			title: bundle ? 'Hapus paket ini?' : 'Hapus barang ini?',
			text: (bundle ? 'Paket beserta seluruh isinya akan dihapus dari keranjang.' : 'Barang akan dihapus dari keranjang.') + (fs ? ' Harga flash sale belum tentu masih tersedia jika ditambahkan lagi.' : ''),
			rows: [it], ok: 'Hapus', trigger: trigger
		}, function () { removeRow(it); recalc(); }, cancel);
	}
	function closeConfirm(run) {
		if (!dlg || dlg.hidden) return;
		dlg.hidden = true; document.body.classList.remove('tf-lock');
		var fn = run ? onOk : onCancel; onOk = null; onCancel = null;
		if (fn) fn();
		if (lastTrigger && document.body.contains(lastTrigger)) lastTrigger.focus();   /* fokus kembali bila tombol masih ada */
	}
	if (dlg) {
		dlg.addEventListener('click', function (e) {
			if (e.target === dlg || e.target.closest('[data-cc-cancel]')) closeConfirm(false);
			else if (e.target.closest('[data-cc-ok]')) closeConfirm(true);
		});
		document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeConfirm(false); });
	}

	/* ---------- event (delegasi) ---------- */
	root.addEventListener('change', function (e) {
		var t = e.target;
		if (t.matches('[data-all-check]')) {
			$$('[data-item-check]:not(:disabled)').forEach(function (c) { c.checked = t.checked; });
		} else if (t.matches('[data-group-check]')) {
			$$('[data-item-check]:not(:disabled)', t.closest('[data-cart-group]')).forEach(function (c) { c.checked = t.checked; });
		} else if (t.matches('[data-qty]')) {
			var n = parseInt(t.value, 10);
			if (!(n > 0)) {   /* 0 atau kosong = hapus; batal → kembali ke 1 */
				t.value = 1; recalc();
				askDeleteItem(t.closest('[data-cart-item]'), t, function () { t.value = 1; recalc(); });
				return;
			}
			t.value = Math.min(maxOf(t), n);
		}
		recalc();
	});
	root.addEventListener('click', function (e) {
		var b;
		if ((b = e.target.closest('[data-qty-plus], [data-qty-minus]'))) {
			var inp = b.parentElement.querySelector('[data-qty]');
			var v = parseInt(inp.value, 10) || 1;
			if (b.hasAttribute('data-qty-minus') && v <= 1) { askDeleteItem(b.closest('[data-cart-item]'), b); return; }   /* 1 → 0 = hapus */
			v = b.hasAttribute('data-qty-plus') ? Math.min(maxOf(inp), v + 1) : v - 1;
			inp.value = v; recalc(); return;
		}
		if ((b = e.target.closest('[data-item-del]'))) { askDeleteItem(b.closest('[data-cart-item]'), b); return; }
		if ((b = e.target.closest('[data-group-del]'))) {
			var g = b.closest('[data-cart-group]'), rows = $$('[data-cart-item]', g), store = (g.querySelector('.tf-group__store') || {}).textContent || 'distributor ini';
			confirmDel({
				title: 'Hapus semua barang dari ' + store.trim() + '?',
				text: rows.length + ' produk dari distributor ini akan dihapus dari keranjang.',
				rows: rows, ok: 'Hapus semua', trigger: b
			}, function () { g.remove(); recalc(); });
			return;
		}
		if ((b = e.target.closest('[data-del-selected]'))) {
			var sel = $$('[data-item-check]:checked').map(function (c) { return c.closest('[data-cart-item]'); });
			if (!sel.length) return;
			confirmDel({
				title: 'Hapus ' + sel.length + ' produk terpilih?',
				text: 'Produk yang dicentang akan dihapus dari keranjang. Produk lain tetap tersimpan.',
				rows: sel, ok: 'Hapus ' + sel.length + ' produk', trigger: b
			}, function () { sel.forEach(removeRow); recalc(); });
			return;
		}
		if ((b = e.target.closest('[data-bundle-toggle]'))) {
			var row = b.closest('[data-cart-item]');
			var open = !row.classList.contains('is-open');
			row.classList.toggle('is-open', open);
			b.setAttribute('aria-expanded', open ? 'true' : 'false');
			b.firstChild.textContent = (open ? 'Sembunyikan isi paket' : 'Lihat isi paket') + b.firstChild.textContent.replace(/^[^(]*/, ' ');
			return;
		}
		if ((b = e.target.closest('[data-sum-cta]')) && b.getAttribute('aria-disabled') === 'true') e.preventDefault();
	});

	/* ---------- tidak bisa di-checkout: paket berisi produk kosong / varian kosong (.is-off) ---------- */
	$$('[data-cart-item]').forEach(function (row) {
		if (row.querySelector('.tf-sub.is-off')) row.classList.add('is-off');   /* satu isi paket kosong → paket tidak bisa dibeli */
		if (!row.classList.contains('is-off')) return;
		var c = row.querySelector('[data-item-check]'); if (c) { c.checked = false; c.disabled = true; }
		['.tf-item__total', '.tf-qty'].forEach(function (s) { var el = row.querySelector(s); if (el) el.remove(); });
	});

	/* ---------- flash sale: hitung mundur + sesi berakhir ---------- */
	/* contoh: data-fs-end = sisa detik sejak halaman dibuka. Produksi: waktu akhir sesi dari server (ISO), dibandingkan jam server. */
	var t0 = Date.now();
	function pad(n) { return (n < 10 ? '0' : '') + n; }
	function endFs(row) {
		var normal = parseInt(row.getAttribute('data-fs-normal'), 10) || parseInt(row.getAttribute('data-price'), 10);
		row.classList.remove('is-fs', 'is-limit'); row.classList.add('is-fs-ended');
		row.setAttribute('data-price', normal); row.setAttribute('data-old', '0');
		row.querySelector('[data-unit]').textContent = rupiah(normal);
		['[data-fs-old]', '[data-fs-off]', '[data-fs-cd]'].forEach(function (s) { var el = row.querySelector(s); if (el) el.remove(); });
		row.querySelector('[data-fs-label]').textContent = 'Flash sale berakhir';
		row.querySelector('[data-fs-note-txt]').textContent = 'Sesi sudah berakhir, harga kembali normal.';
		var qi = row.querySelector('[data-qty]'); if (qi) qi.setAttribute('max', '99');
		recalc();
	}
	function tickFs() {
		var live = 0, gone = (Date.now() - t0) / 1000;
		$$('.tf-item.is-fs').forEach(function (row) {
			var left = Math.max(0, Math.round((parseFloat(row.getAttribute('data-fs-end')) || 0) - gone));
			if (left <= 0) { endFs(row); return; }
			live++;
			var b = row.querySelector('[data-fs-cd] b'); if (b) b.textContent = pad(Math.floor(left / 3600)) + ':' + pad(Math.floor(left % 3600 / 60)) + ':' + pad(left % 60);
		});
		if (!live) clearInterval(fsTimer);
	}
	var fsTimer = setInterval(tickFs, 1000);
	tickFs();

	recalc();
})();
