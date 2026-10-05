/* =====================================================================
   Toffin v2 · tf-cart.js — halaman Keranjang.
   Semua angka dihitung dari markup: tiap [data-cart-item] punya data-price
   (harga satuan), data-old (harga coret, 0 bila tidak ada) dan input jumlah.
   - Checkbox: pilih semua ↔ per distributor ↔ per barang (indeterminate).
   - Stepper jumlah, hapus barang / distributor / yang terpilih, keranjang kosong.
   - Ringkasan belanja + bar sticky ponsel + badge keranjang di header.
   - Isi paket bundling bisa dibuka-tutup. (Kode promo nanti di checkout.)
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
		var gross = 0, disc = 0, count = 0, allItems = 0, allChecked = 0, badge = 0;
		groups.forEach(function (g) {
			var rows = $$('[data-cart-item]', g), gs = 0, gd = 0, gc = 0, enabled = 0, checked = 0;
			rows.forEach(function (row) {
				var d = rowData(row);
				var line = row.querySelector('[data-line]'); if (line) line.textContent = rupiah(d.line);
				var minus = row.querySelector('[data-qty-minus]'); if (minus) minus.disabled = d.qty <= 1;
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

	/* ---------- event (delegasi) ---------- */
	root.addEventListener('change', function (e) {
		var t = e.target;
		if (t.matches('[data-all-check]')) {
			$$('[data-item-check]:not(:disabled)').forEach(function (c) { c.checked = t.checked; });
		} else if (t.matches('[data-group-check]')) {
			$$('[data-item-check]:not(:disabled)', t.closest('[data-cart-group]')).forEach(function (c) { c.checked = t.checked; });
		} else if (t.matches('[data-qty]')) {
			var v = Math.min(99, Math.max(1, parseInt(t.value, 10) || 1)); t.value = v;
		}
		recalc();
	});
	root.addEventListener('click', function (e) {
		var b;
		if ((b = e.target.closest('[data-qty-plus], [data-qty-minus]'))) {
			var inp = b.parentElement.querySelector('[data-qty]');
			var v = parseInt(inp.value, 10) || 1;
			v = b.hasAttribute('data-qty-plus') ? Math.min(99, v + 1) : Math.max(1, v - 1);
			inp.value = v; recalc(); return;
		}
		if ((b = e.target.closest('[data-item-del]'))) { removeRow(b.closest('[data-cart-item]')); recalc(); return; }
		if ((b = e.target.closest('[data-group-del]'))) { b.closest('[data-cart-group]').remove(); recalc(); return; }
		if ((b = e.target.closest('[data-del-selected]'))) {
			$$('[data-item-check]:checked').forEach(function (c) { removeRow(c.closest('[data-cart-item]')); });
			recalc(); return;
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

	recalc();
})();
