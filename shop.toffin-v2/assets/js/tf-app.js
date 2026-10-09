/* =====================================================================
   Toffin v2 · tf-app.js
   Perilaku konten halaman yang sebelumnya ada di js/custom.js, dikurangi
   semua logika header/nav (kini di tf-nav.js) dan tanpa jQuery.
   Isi: hitung mundur flash sale, ikon kartu produk, tab, filter alamat.
   Slider Swiper ada di tf-sliders.js.
   js/custom.js dibiarkan utuh untuk halaman lama yang masih memakainya.
   ===================================================================== */
(function () {
	'use strict';

	/* ------------------------------------------------------------------
	   Hitung mundur Flash Sale.
	   Waktu akhir dibaca dari <div class="fs-countdown" data-end="...">;
	   bila tidak ada, dianggap hari ini pukul 23:59:59.
	   ------------------------------------------------------------------ */
	(function countdown() {
		var pad2 = function (n) { return String(Math.max(0, n)).padStart(2, '0'); };
		var cdWrap = document.querySelector('.fs-countdown');

		function resolveEndTime() {
			var endAttr = cdWrap ? cdWrap.getAttribute('data-end') : null;
			if (endAttr) {
				var t = new Date(endAttr).getTime();
				if (!Number.isNaN(t)) return t;
			}
			var now = new Date();
			return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 0).getTime();
		}

		var elDays = document.getElementById('fsDays');
		var elHours = document.getElementById('fsHours');
		var elMinutes = document.getElementById('fsMinutes');
		var elSeconds = document.getElementById('fsSeconds');
		var legacyHours = document.getElementById('hours');
		var legacyMinutes = document.getElementById('minutes');
		var legacySeconds = document.getElementById('seconds');
		var daysGroup = elDays ? elDays.closest('.fs-count') : null;

		if (!elDays && !elHours && !elMinutes && !elSeconds && !legacyHours) return;

		var endTime = resolveEndTime();

		function render(msLeft) {
			var totalSec = Math.floor(msLeft / 1000);
			var days = Math.floor(totalSec / 86400);
			var hours = Math.floor((totalSec % 86400) / 3600);
			var minutes = Math.floor((totalSec % 3600) / 60);
			var seconds = totalSec % 60;

			if (elDays) elDays.textContent = pad2(days);
			if (elHours) elHours.textContent = pad2(hours);
			if (elMinutes) elMinutes.textContent = pad2(minutes);
			if (elSeconds) elSeconds.textContent = pad2(seconds);
			/* grup "Hari" disembunyikan bila 0, seperti Tokopedia/Shopee */
			if (daysGroup) daysGroup.style.display = days > 0 ? '' : 'none';

			if (legacyHours) legacyHours.textContent = hours + days * 24;
			if (legacyMinutes) legacyMinutes.textContent = minutes;
			if (legacySeconds) legacySeconds.textContent = seconds;
		}

		function markEnded() {
			if (cdWrap) cdWrap.classList.add('fs-countdown--ended');
			var countdownEl = document.getElementById('countdown');
			var contentEl = document.getElementById('content');
			if (countdownEl) countdownEl.style.display = 'none';
			if (contentEl) contentEl.style.display = 'block';
		}

		function tick() {
			var diff = endTime - Date.now();
			if (diff <= 0) {
				render(0);
				markEnded();
				var n = new Date();
				endTime = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, 23, 59, 59, 0).getTime();
				if (cdWrap) cdWrap.classList.remove('fs-countdown--ended');
				return;
			}
			render(diff);
		}

		tick();
		setInterval(tick, 1000);
	}());

	/* ------------------------------------------------------------------
	   Datepicker filter poin: hanya bila jQuery + plugin + elemennya ada.
	   Halaman v2 tanpa jQuery cukup melewati blok ini.
	   ------------------------------------------------------------------ */
	if (window.jQuery && window.jQuery.fn && window.jQuery.fn.datepicker &&
		document.querySelector('#point-date, #datePicker')) {
		window.jQuery('#point-date, #datePicker')
			.datepicker({ dateFormat: 'dd/mm/yy' })
			.datepicker('setDate', null)
			.attr('placeholder', 'dd/mm/yyyy');
	}

	/* ------------------------------------------------------------------
	   Ikon di kartu produk (favorit, bandingkan): jangan lompat ke "#",
	   cukup tandai terpilih.
	   ------------------------------------------------------------------ */
	document.addEventListener('click', function (e) {
		var a = e.target.closest('.product__list__item--icons a');
		if (!a) return;
		e.preventDefault();
		a.classList.toggle('selected');
	});

	/* ------------------------------------------------------------------
	   Tab (Rekomendasi, Toffin Rewards): tandai aktif; bila tab punya
	   data-panel, tampilkan .tf-rpanel yang cocok.
	   ------------------------------------------------------------------ */
	document.querySelectorAll('.js-tabs').forEach(function (group) {
		group.addEventListener('click', function (e) {
			var t = e.target.closest('.js-tab');
			if (!t) return;
			group.querySelectorAll('.js-tab').forEach(function (b) { b.classList.remove('is-active'); });
			t.classList.add('is-active');
			var key = t.getAttribute('data-panel');
			if (!key) return;
			group.parentElement.querySelectorAll('.tf-rpanel').forEach(function (p) {
				p.classList.toggle('is-active', p.getAttribute('data-panel') === key);
			});
		});
	});

	/* ------------------------------------------------------------------
	   Toffin Rewards (homepage): default tampilan belum login; tombol Masuk
	   (data-tf-login) menampilkan versi sudah login. Contoh saja, di backend
	   versi dipilih menurut sesi.
	   ------------------------------------------------------------------ */
	document.addEventListener('click', function (e) {
		if (!e.target.closest('[data-tf-login]')) return;
		document.querySelectorAll('[data-auth="out"]').forEach(function (el) { el.hidden = true; });
		document.querySelectorAll('[data-auth="in"]').forEach(function (el) { el.hidden = false; });
	});

	/* ------------------------------------------------------------------
	   Modal pilih alamat: kolom pencarian menyaring kartu berdasarkan teks
	   (nama, nomor, alamat). Kartu yang tidak cocok disembunyikan.
	   ------------------------------------------------------------------ */
	var addrFilter = document.querySelector('[data-tf-addr-filter]');
	if (addrFilter) {
		addrFilter.addEventListener('input', function () {
			var q = addrFilter.value.trim().toLowerCase();
			var any = false;
			document.querySelectorAll('[data-tf-addr-list] .tf-addr').forEach(function (card) {
				var hit = !q || card.textContent.toLowerCase().indexOf(q) !== -1;
				card.hidden = !hit;
				any = any || hit;
			});
			var empty = document.querySelector('.tf-addr-empty');
			if (empty) empty.hidden = any;
		});
	}
})();
