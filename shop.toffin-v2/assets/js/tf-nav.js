/* =====================================================================
   Toffin v2 · tf-nav.js
   Perilaku chrome bersama: dropdown & mega menu desktop,
   sheet navigasi mobile, widget chat. Pencarian: tf-search.js.
   Vanilla JS, tanpa jQuery dan tanpa Bootstrap.

   Menyediakan tiga global untuk kompatibilitas dengan mobile-nav.js,
   yang memanggil openBottomSheet(menuSheet) dan closeAllBottomSheets().
   ===================================================================== */
(function () {
	'use strict';

	var doc = document;

	/* ------------------------------------------------------------------
	   Header ponsel: tombol kembali menggantikan logo di semua halaman
	   selain beranda. Kembali ke halaman sebelumnya bila datang dari situs
	   ini; dibuka langsung (tanpa riwayat) → ke beranda.
	   Di Odoo: render di template header dengan t-if bukan homepage.
	   ------------------------------------------------------------------ */
	(function () {
		var brand = doc.querySelector('.tf-header__mobile .tf-brand--mobile');
		var home = /(^|\/)(index\.html)?$/.test(location.pathname);
		if (!brand || home) return;
		var back = doc.createElement('a');
		back.href = 'index.html'; back.className = 'tf-hback'; back.setAttribute('aria-label', 'Kembali');
		back.innerHTML = '<svg class="tf-i" aria-hidden="true"><use href="#i-chevron-left"/></svg>';
		back.addEventListener('click', function (e) {
			var ref = doc.referrer, same = false;
			try { same = !!ref && new URL(ref).origin === location.origin; } catch (err) {}
			if ((same || (!ref && location.protocol === 'file:')) && history.length > 1) { e.preventDefault(); history.back(); }
		});
		brand.parentNode.insertBefore(back, brand);
		var header = brand.closest('.tf-header'); if (header) header.classList.add('has-back');
	})();

	/* ------------------------------------------------------------------
	   Dropdown generik.
	   Struktur: .tf-dd > [data-tf-toggle="dropdown"] + .tf-dd__panel
	   Buka/tutup lewat kelas .is-open di .tf-dd dan di panelnya.
	   ------------------------------------------------------------------ */
	function setDropdown(dd, open) {
		dd.classList.toggle('is-open', open);
		var btn = dd.querySelector('[data-tf-toggle="dropdown"]');
		if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
		var panel = dd.querySelector('.tf-dd__panel');
		if (panel) panel.classList.toggle('is-open', open);
	}
	function closeDropdowns(except) {
		doc.querySelectorAll('.tf-dd.is-open').forEach(function (dd) {
			if (dd !== except) setDropdown(dd, false);
		});
	}

	doc.addEventListener('click', function (e) {
		var btn = e.target.closest('[data-tf-toggle="dropdown"]');
		if (btn) {
			e.preventDefault();
			var dd = btn.closest('.tf-dd');
			if (!dd) return;
			var willOpen = !dd.classList.contains('is-open');
			closeDropdowns(dd);
			setDropdown(dd, willOpen);
			return;
		}
		/* klik di luar dropdown mana pun menutup semuanya */
		if (!e.target.closest('.tf-dd')) closeDropdowns();
	});

	/* ------------------------------------------------------------------
	   Mega menu: tab di kiri mengganti panel di kanan.
	   ------------------------------------------------------------------ */
	doc.querySelectorAll('.tf-mega').forEach(function (mega) {
		var tabs = mega.querySelectorAll('.tf-mega__tab');
		var panels = mega.querySelectorAll('.tf-mega__panel');
		function activate(tab) {
			var id = tab.getAttribute('data-tf-mega');
			tabs.forEach(function (t) { t.classList.toggle('is-active', t === tab); });
			panels.forEach(function (p) { p.classList.toggle('is-active', p.id === id); });
		}
		tabs.forEach(function (tab) {
			tab.addEventListener('mouseenter', function () { activate(tab); });
			tab.addEventListener('focus', function () { activate(tab); });
			tab.addEventListener('click', function () { activate(tab); });
		});
	});

	/* Pencarian (desktop & ponsel) ada di tf-search.js. */

	/* ------------------------------------------------------------------
	   Sheet navigasi mobile + backdrop.
	   ------------------------------------------------------------------ */
	var sheet = doc.getElementById('tf-sheet');
	var backdrop = doc.querySelector('.tf-backdrop');

	function openSheet() {
		if (!sheet) return;
		sheet.classList.add('is-open');
		sheet.setAttribute('aria-hidden', 'false');
		if (backdrop) {
			backdrop.hidden = false;
			void backdrop.offsetWidth; /* paksa reflow agar transisi opacity berjalan */
			backdrop.classList.add('is-open');
		}
		doc.body.classList.add('tf-lock');
	}
	function closeSheet() {
		if (!sheet) return;
		sheet.classList.remove('is-open');
		sheet.setAttribute('aria-hidden', 'true');
		if (backdrop) {
			backdrop.classList.remove('is-open');
			setTimeout(function () { backdrop.hidden = true; }, 220);
		}
		doc.body.classList.remove('tf-lock');
	}

	doc.addEventListener('click', function (e) {
		if (e.target.closest('[data-tf-open="sheet"]')) { e.preventDefault(); openSheet(); }
		else if (e.target.closest('[data-tf-close="sheet"]')) { e.preventDefault(); closeSheet(); }
	});
	window.addEventListener('resize', function () {
		if (window.innerWidth >= 992) closeSheet();
	});

	/* kompatibilitas: mobile-nav.js memanggil ketiga nama ini */
	window.menuSheet = sheet;
	window.openBottomSheet = function () { openSheet(); };
	window.closeAllBottomSheets = closeSheet;

	/* ------------------------------------------------------------------
	   Widget chat.
	   ------------------------------------------------------------------ */
	var chatPanel = doc.getElementById('tf-chat-panel');
	var chatBtn = doc.querySelector('[data-tf-toggle="chat"]');
	function setChat(open) {
		if (!chatPanel) return;
		chatPanel.hidden = !open;
		if (chatBtn) chatBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
	}
	doc.addEventListener('click', function (e) {
		if (e.target.closest('[data-tf-toggle="chat"]')) setChat(chatPanel && chatPanel.hidden);
		else if (e.target.closest('[data-tf-close="chat"]')) setChat(false);
	});

	/* ESC menutup apa pun yang sedang terbuka */
	doc.addEventListener('keydown', function (e) {
		if (e.key !== 'Escape') return;
		closeDropdowns();
		closeSheet();
		setChat(false);
	});
})();

/* Kartu produk global: nama produk tampil satu baris dengan "…"; nama lengkap muncul sebagai tooltip
   saat kursor di atas judul (delegasi, jadi berlaku juga untuk kartu yang dimuat belakangan). */
document.addEventListener('mouseover', function (e) {
	var a = e.target.closest && e.target.closest('.fs-product-title a');
	if (a && !a.title) a.title = a.textContent.trim();
});

/* =====================================================================
   Umpan balik bersama (MIGRASI langkah 47): window.tfUI
   - tfUI.toast(html, {kind: 'ok'|'warn'|'info', link: {href, label}, undo: fn, ms})
   - tfUI.confirm({title, text, html, ok, cancel, danger, icon, onOk(box) → false = tetap buka, onCancel})
   - tfUI.badge(n): naikkan angka keranjang di header + animasi
   Dipakai tf-account, tf-checkout, tf-order, tf-flash, tf-cart, tf-product, tf-auth.
   Produksi: tetap sisi klien; isi pesan datang dari respons server.
   ===================================================================== */
(function () {
	'use strict';
	function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
	function ico(id) { return '<svg class="tf-i" aria-hidden="true"><use href="#' + id + '"/></svg>'; }

	/* ---------- toast ---------- */
	var toastEl = null, toastTimer, undoFn = null;
	function toast(html, o) {
		o = o || {};
		if (!toastEl) {
			toastEl = document.createElement('div'); toastEl.className = 'tf-utoast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite');
			document.body.appendChild(toastEl);
			toastEl.addEventListener('click', function (e) {
				if (e.target.closest('[data-ut-undo]')) { if (undoFn) undoFn(); undoFn = null; hide(); }
			});
		}
		var kind = o.kind || 'ok', icon = { ok: 'i-circle-check', warn: 'i-alert-circle', info: 'i-info-circle' }[kind] || 'i-circle-check';
		undoFn = o.undo || null;
		toastEl.className = 'tf-utoast tf-utoast--' + kind;
		toastEl.innerHTML = ico(icon) + '<span>' + html + '</span>' +
			(o.link ? '<a href="' + esc(o.link.href) + '">' + esc(o.link.label) + '</a>' : '') +
			(o.undo ? '<button type="button" data-ut-undo>Batalkan</button>' : '');
		toastEl.classList.remove('is-on'); void toastEl.offsetWidth; toastEl.classList.add('is-on');
		clearTimeout(toastTimer); toastTimer = setTimeout(hide, o.ms || (o.undo ? 5000 : 3200));
	}
	function hide() { if (toastEl) toastEl.classList.remove('is-on'); }

	/* ---------- dialog konfirmasi ---------- */
	var dlg = null, cur = null, lastFocus = null;
	function build() {
		dlg = document.createElement('div'); dlg.className = 'tf-udlg'; dlg.setAttribute('role', 'alertdialog'); dlg.setAttribute('aria-modal', 'true'); dlg.setAttribute('aria-labelledby', 'tf-udlg-t'); dlg.hidden = true;
		dlg.innerHTML = '<div class="tf-udlg__box"><span class="tf-udlg__ico" data-ud-ico></span><h3 id="tf-udlg-t" data-ud-title></h3><p data-ud-text></p><div class="tf-udlg__body" data-ud-body></div>' +
			'<p class="tf-udlg__err" data-ud-err hidden></p><div class="tf-udlg__act"><button type="button" class="tf-udlg__cancel" data-ud-cancel>Batal</button><button type="button" class="tf-udlg__ok" data-ud-ok>OK</button></div></div>';
		document.body.appendChild(dlg);
		dlg.addEventListener('click', function (e) {
			if (e.target === dlg || e.target.closest('[data-ud-cancel]')) close(false);
			else if (e.target.closest('[data-ud-ok]')) close(true);
		});
		dlg.addEventListener('input', function () { var er = dlg.querySelector('[data-ud-err]'); er.hidden = true; });
		document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && cur) close(false); });
	}
	function confirm(o) {
		if (!dlg) build();
		cur = o; lastFocus = document.activeElement;
		var box = dlg.querySelector('.tf-udlg__box');
		box.classList.toggle('is-danger', !!o.danger); box.classList.toggle('is-wide', !!o.wide);
		dlg.querySelector('[data-ud-ico]').innerHTML = ico(o.icon || (o.danger ? 'i-alert-circle' : 'i-info-circle'));
		dlg.querySelector('[data-ud-title]').textContent = o.title || '';
		var t = dlg.querySelector('[data-ud-text]'); t.innerHTML = o.text || ''; t.hidden = !o.text;
		var b = dlg.querySelector('[data-ud-body]'); b.innerHTML = o.html || ''; b.hidden = !o.html;
		dlg.querySelector('[data-ud-err]').hidden = true;
		var c = dlg.querySelector('[data-ud-cancel]'); c.textContent = o.cancel || 'Batal'; c.hidden = o.cancel === false;
		var k = dlg.querySelector('[data-ud-ok]'); k.textContent = o.ok || 'OK'; k.disabled = false;
		dlg.hidden = false; document.body.classList.add('tf-lock');
		var f = b.querySelector('input, select, textarea'); (f || c.hidden ? k : c).focus();
		if (f) f.focus();
	}
	function error(msg) { var er = dlg.querySelector('[data-ud-err]'); er.textContent = msg; er.hidden = false; }
	function close(ok) {
		if (!cur) return;
		var o = cur;
		if (ok && o.onOk) {
			var r = o.onOk(dlg.querySelector('[data-ud-body]'), { error: error, button: dlg.querySelector('[data-ud-ok]') });
			if (r === false) return;   /* validasi gagal: dialog tetap terbuka */
		}
		cur = null; dlg.hidden = true; document.body.classList.remove('tf-lock');
		if (!ok && o.onCancel) o.onCancel();
		if (lastFocus && document.body.contains(lastFocus)) lastFocus.focus();
	}

	/* ---------- badge keranjang ---------- */
	function badge(n) {
		document.querySelectorAll('.tf-util__badge').forEach(function (b) {
			b.textContent = (parseInt(b.textContent, 10) || 0) + (n || 1);
			b.classList.remove('is-bump'); void b.offsetWidth; b.classList.add('is-bump');
		});
	}

	window.tfUI = { toast: toast, confirm: confirm, badge: badge, esc: esc };

	/* ---------- Logout: konfirmasi dulu (keranjang tamu akan hilang) ---------- */
	document.addEventListener('click', function (e) {
		var a = e.target.closest('.tf-acc__item--danger, .tf-mnav__acc-danger, .tf-mnav__link--danger, [data-tf-logout]');
		if (!a) return;
		e.preventDefault();
		confirm({
			title: 'Keluar dari akun?', icon: 'i-logout',
			text: 'Keranjang dan daftar favorit tetap tersimpan di akun Anda. Anda perlu masuk lagi untuk melanjutkan belanja.',
			ok: 'Keluar', cancel: 'Tetap masuk',
			onOk: function () { location.href = 'index.html?keluar=1'; }   /* produksi: /web/session/logout */
		});
	});
	/* ---------- Status login contoh (menu akun, widget beranda): [data-auth="out|in"] ----------
	   Belum ada sesi di prototipe: DEFAULT BELUM LOGIN (Rendi 2026-11-06). Tombol Masuk bertanda [data-tf-login]
	   (kartu beranda, dropdown akun, sheet Akun) langsung menampilkan desain sudah login di tempat, tanpa pindah
	   halaman. Status tidak disimpan: refresh atau pindah halaman kembali ke belum login. Halaman akun selalu dianggap login.
	   Produksi: template Odoo merender keadaan menurut sesi, blok ini dibuang. */
	/* status TIDAK disimpan (Rendi 2026-11-06: refresh harus kembali ke belum login): hanya variabel selama halaman terbuka */
	var authOn = false;
	try { sessionStorage.removeItem('tfDemoAuth'); } catch (err) { /* sisa versi lama yang menyimpan status */ }
	function authGet() { return authOn; }
	function authSet(on) { authOn = !!on; }
	function authApply(on) {
		document.querySelectorAll('[data-auth="out"]').forEach(function (el) { el.hidden = on; });
		document.querySelectorAll('[data-auth="in"]').forEach(function (el) { el.hidden = !on; });
	}
	/* pratinjau cepat tanpa harus Keluar/Masuk: tambahkan ?auth=out (belum login) atau ?auth=in (sudah login) di URL */
	var authQ = /[?&]auth=(out|in)\b/.exec(location.search);
	if (authQ) authSet(authQ[1] === 'in');
	else if (/[?&]keluar=1/.test(location.search)) authSet(false);
	else if (/(my-account|detail-pembelian|tracking-order)\.html$/.test(location.pathname)) authSet(true);
	document.addEventListener('click', function (e) {
		var b = e.target.closest('[data-tf-login]');
		if (!b) return;
		if (b.tagName === 'A') e.preventDefault();   /* contoh: tidak pindah ke login.html; produksi: tautan login sungguhan */
		authSet(true); authApply(true);
	});
	function authInit() { authApply(authGet()); }
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', authInit); else authInit();

	if (/[?&]keluar=1/.test(location.search)) {
		toast('Anda sudah keluar dari akun', { kind: 'info', link: { href: 'login.html', label: 'Masuk lagi' } });
		if (history.replaceState) history.replaceState(null, '', location.pathname);
	}

	/* ---------- Add to cart dari kartu produk (homepage, daftar produk, flash sale, rekomendasi) ----------
	   Kartu paket bundling (data-bundle-cta) punya alur sendiri di tf-bundle.js. */
	document.addEventListener('click', function (e) {
		var btn = e.target.closest('.product .fs-btn-primary, .tf-cards .fs-btn-primary, .tf-favlist .fs-btn-primary');   /* .tf-favlist: popup Pesan produk favorit di beranda */
		if (!btn || btn.hasAttribute('data-bundle-cta') || btn.closest('[data-tf-bundle]')) return;
		if (btn.tagName === 'A' && btn.getAttribute('href') && btn.getAttribute('href') !== '#') return;   /* tautan sungguhan (mis. ke detail) */
		e.preventDefault();
		if (btn.classList.contains('is-added')) return;
		var card = btn.closest('.product, .fs-card, article') || btn.parentNode, tEl = card.querySelector('.fs-product-title');
		var name = tEl ? tEl.textContent.trim() : 'Produk';
		badge(1);
		toast('<b>' + esc(name) + '</b> masuk keranjang', { link: { href: 'cart.html', label: 'Lihat keranjang' } });
		var html = btn.innerHTML; btn.classList.add('is-added'); btn.innerHTML = ico('i-check') + ' Masuk keranjang';
		setTimeout(function () { btn.classList.remove('is-added'); btn.innerHTML = html; }, 1800);
	});

	/* ---------- Pesan semua favorit (beranda, popup #fav-modal): BULK — semua produk favorit masuk keranjang sekaligus,
	   masing-masing 1 (Rendi 2026-11-06). Produksi: satu POST berisi seluruh wishlist ke keranjang Odoo. ---------- */
	document.addEventListener('click', function (e) {
		var btn = e.target.closest('[data-fav-bulk]');
		if (!btn || btn.classList.contains('is-added')) return;
		var n = parseInt(btn.getAttribute('data-fav-bulk'), 10) || 1;
		badge(n);
		toast('<b>' + n + ' produk favorit</b> masuk keranjang', { link: { href: 'cart.html', label: 'Lihat keranjang' } });
		var html = btn.innerHTML; btn.classList.add('is-added'); btn.innerHTML = ico('i-check') + ' Masuk keranjang';
		setTimeout(function () {
			btn.classList.remove('is-added'); btn.innerHTML = html;
			var modal = btn.closest('.modal'); if (modal && window.jQuery) window.jQuery(modal).modal('hide');
		}, 900);
	});
})();
