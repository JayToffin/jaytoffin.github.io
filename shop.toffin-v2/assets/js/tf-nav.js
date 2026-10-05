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
