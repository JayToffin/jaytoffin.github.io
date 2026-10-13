/* =====================================================================
   Toffin v2 · tf-auth.js — halaman masuk: tampilkan/sembunyikan sandi,
   validasi ringan, status sibuk tombol, modal lupa sandi. Tanpa jQuery
   (modal dibuka Bootstrap lewat data-toggle). Pengiriman nyata = backend.
   ===================================================================== */
(function () {
	'use strict';
	document.querySelectorAll('[data-au-eye]').forEach(function (b) {
		b.addEventListener('click', function () {
			var inp = b.parentElement.querySelector('input'), show = inp.type === 'password';
			inp.type = show ? 'text' : 'password'; b.setAttribute('aria-pressed', show); b.setAttribute('aria-label', show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
			b.querySelector('use').setAttribute('href', show ? '#i-eye-off' : '#i-eye');
		});
	});
	function validate(form) {
		var ok = true;
		form.querySelectorAll('.au-field').forEach(function (f) {
			var inp = f.querySelector('input'), bad = !inp.value.trim() || (inp.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value));
			f.classList.toggle('is-invalid', bad); if (bad) ok = false;
		});
		return ok;
	}
	document.querySelectorAll('[data-au-form]').forEach(function (form) {
		form.addEventListener('input', function (e) { var f = e.target.closest('.au-field'); if (f) f.classList.remove('is-invalid'); form.querySelector('[data-au-alert]').hidden = true; });
		form.addEventListener('submit', function (e) {
			e.preventDefault(); if (!validate(form)) return;
			var btn = form.querySelector('.au-submit'); btn.classList.add('is-busy');
			/* contoh: tanpa backend, tampilkan pesan gagal setelah jeda */
			setTimeout(function () { btn.classList.remove('is-busy'); form.querySelector('[data-au-alert]').hidden = false; }, 900);
		});
	});
	document.querySelectorAll('[data-au-reset]').forEach(function (form) {
		form.addEventListener('submit', function (e) {
			e.preventDefault(); if (!validate(form)) return;
			var sent = form.querySelector('[data-au-sent]'); sent.querySelector('[data-au-sent-mail]').textContent = form.querySelector('input').value; sent.hidden = false;
			form.querySelector('button[type=submit]').disabled = true;
		});
	});
}());

/* ---------- daftar (register.html) ---------- */
(function () {
	'use strict';
	var form = document.querySelector('[data-au-register]');
	if (!form) return;
	/* tipe akun: tampilkan blok Individu / Korporat, kolom di blok tersembunyi tidak wajib */
	function syncType() {
		var t = form.querySelector('[data-au-type]:checked').value;
		form.querySelectorAll('[data-au-when]').forEach(function (g) {
			var on = g.getAttribute('data-au-when') === t; g.hidden = !on;
			g.querySelectorAll('input,select,textarea').forEach(function (i) { i.disabled = !on; });
		});
	}
	form.querySelectorAll('[data-au-type]').forEach(function (r) { r.addEventListener('change', syncType); }); syncType();
	/* wilayah berantai (contoh data; di backend dari Odoo) */
	var REG = { 'Jakarta': { 'Jakarta Utara': { 'Penjaringan': ['Pluit', 'Penjaringan', 'Kapuk Muara'], 'Kelapa Gading': ['Kelapa Gading Barat', 'Kelapa Gading Timur'] }, 'Jakarta Selatan': { 'Kebayoran Baru': ['Senayan', 'Gunung', 'Melawai'] } }, 'Jawa Barat': { 'Bandung': { 'Coblong': ['Dago', 'Lebak Gede'], 'Sukajadi': ['Pasteur', 'Sukawarna'] }, 'Bogor': { 'Bogor Tengah': ['Pabaton', 'Sempur'] } }, 'Jawa Timur': { 'Surabaya': { 'Gubeng': ['Airlangga', 'Gubeng'], 'Tegalsari': ['Tegalsari', 'Kedungdoro'] } } };
	var prov = form.querySelector('[data-au-prov]'), kab = form.querySelector('[data-au-kab]'), kec = form.querySelector('[data-au-kec]'), kel = form.querySelector('[data-au-kel]');
	function fill(sel, items, first) { sel.innerHTML = '<option value="">' + first + '</option>' + items.map(function (x) { return '<option value="' + x + '">' + x + '</option>'; }).join(''); sel.disabled = !items.length; }
	prov.addEventListener('change', function () { var d = REG[prov.value] || {}; fill(kab, Object.keys(d), Object.keys(d).length ? 'Pilih kota / kabupaten' : 'Pilih provinsi dulu'); fill(kec, [], 'Pilih kota dulu'); fill(kel, [], 'Pilih kecamatan dulu'); });
	kab.addEventListener('change', function () { var d = (REG[prov.value] || {})[kab.value] || {}; fill(kec, Object.keys(d), 'Pilih kecamatan'); fill(kel, [], 'Pilih kecamatan dulu'); });
	kec.addEventListener('change', function () { var d = ((REG[prov.value] || {})[kab.value] || {})[kec.value] || []; fill(kel, d, 'Pilih kelurahan'); });
	/* kekuatan sandi */
	var pw = form.querySelector('[data-au-strength]'), meter = form.querySelector('[data-au-meter]'), mtxt = form.querySelector('[data-au-meter-txt]');
	var LBL = ['Gunakan huruf besar, angka, dan simbol.', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat'];
	pw.addEventListener('input', function () {
		var v = pw.value, n = 0; if (v.length >= 8) n++; if (/[A-Z]/.test(v)) n++; if (/\d/.test(v)) n++; if (/[^\w\s]/.test(v)) n++;
		if (!v) n = 0; meter.setAttribute('data-level', n); mtxt.textContent = LBL[n];
	});
	/* dari alur Existing User (otp.html → register.html?existing=1): catatan hijau + isi data kontak contoh */
	if (/[?&]existing=1/.test(location.search)) {
		var note = form.parentElement.querySelector('[data-au-existing-note]'), link = form.parentElement.querySelector('a.au-notice'), ctc = {};
		try { ctc = JSON.parse(sessionStorage.getItem('tfExisting') || '{}'); } catch (err) {}
		if (note) note.hidden = false; if (link) link.hidden = true;
		if (ctc.type === 'company') { form.querySelector('[data-au-type][value=company]').checked = true; syncType(); }
		function set(n, v) { var i = form.querySelector('[name=' + n + ']'); if (i && v) i.value = v; }
		set(ctc.type === 'company' ? 'name2' : 'name', ctc.name); set('company_name', ctc.company_name); set('mobile', /•/.test(ctc.mobile || '') ? '' : ctc.mobile);   /* nomor tersamar tidak diisi; pengguna mengetik ulang */ set('street', ctc.street); set('zip_code', ctc.zip);
	}
	/* tooltip label */
	form.querySelectorAll('.au-tip__btn').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); b.parentElement.classList.toggle('is-open'); }); });
	document.addEventListener('click', function () { form.querySelectorAll('.au-tip.is-open').forEach(function (t) { t.classList.remove('is-open'); }); });
	/* peta: simpan koordinat contoh, tandai status */
	var mapBox = form.querySelector('[data-au-map]'), mapStatus = form.querySelector('[data-au-map-status]');
	/* peta Leaflet (OSM): dibuat saat modal pertama kali dibuka; pin tetap di tengah; alamat diperbarui saat peta berhenti digeser */
	var mapEl = document.querySelector('[data-au-leaflet]'), mapName = document.querySelector('[data-au-map-name]'), mapCoord = document.querySelector('[data-au-map-coord]'), pinEl = document.querySelector('.au-mapframe__pin');
	var map = null, cur = { lat: -6.1260, lng: 106.7920, name: 'Pluit, Penjaringan, Jakarta Utara' }, geoTimer = null, geoSeq = 0;
	function shortName(a) {   /* dari hasil Nominatim: jalan · kelurahan/kecamatan · kota */
		if (!a) return '';
		var kota = (a.city_district && /^Jakarta/.test(a.city_district)) ? a.city_district : (a.city || a.town || a.county || a.state);   /* Jakarta: pakai kota administrasi, bukan nama provinsi yang panjang */
		var parts = [a.road || a.pedestrian || a.building || a.amenity, a.village || a.suburb || a.neighbourhood, kota];
		return parts.filter(Boolean).filter(function (v, i, arr) { return arr.indexOf(v) === i; }).join(', ');
	}
	function photonName(p) {   /* fallback Photon (komoot): street · district · city */
		if (!p) return '';
		return [p.street || p.name, p.district || p.locality, p.city || p.county || p.state].filter(Boolean).filter(function (v, i, a) { return a.indexOf(v) === i; }).join(', ');
	}
	function reverse(lat, lng) {
		var seq = ++geoSeq; mapName.textContent = 'Mencari alamat…'; mapCoord.textContent = 'Geser peta sampai pin tepat di lokasi Anda';
		function done(name) { if (seq !== geoSeq) return; cur = { lat: lat, lng: lng, name: name || 'Titik dipilih' }; mapName.textContent = cur.name; }
		/* utama: Nominatim (OSM); bila 403/gagal → Photon (komoot), keduanya gratis tanpa kunci */
		fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + lat + '&lon=' + lng + '&zoom=18&accept-language=id&email=info@toffin.id', { headers: { 'Accept': 'application/json' } })
			.then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
			.then(function (d) { done(shortName(d.address) || d.display_name); })
			.catch(function () {
				fetch('https://photon.komoot.io/reverse?lon=' + lng + '&lat=' + lat)
					.then(function (r) { return r.json(); })
					.then(function (d) { done(photonName(d.features && d.features[0] && d.features[0].properties)); })
					.catch(function () { done(''); });
			});
	}
	function ensureMap() {
		if (map || !window.L || !mapEl) return;
		map = L.map(mapEl, { zoomControl: true, attributionControl: true }).setView([cur.lat, cur.lng], 16);
		/* ubin: Esri World Street Map (gratis, tanpa kunci, longgar soal Referer) sebagai utama; bila gagal (403/jaringan)
		   otomatis ganti ke tile.openstreetmap.org. CARTO tidak dipakai: kini butuh API key (watermark). */
		var tiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Tiles &copy; Esri' }).addTo(map), tileErr = 0;
		tiles.on('tileerror', function () { if (++tileErr === 3) { map.removeLayer(tiles); L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map); } });
		mapEl._auMap = map;   /* kait untuk pengujian */
		map.on('movestart', function () { if (pinEl) pinEl.classList.add('is-moving'); });
		map.on('moveend', function () { if (pinEl) pinEl.classList.remove('is-moving'); var c = map.getCenter(); clearTimeout(geoTimer); geoTimer = setTimeout(function () { reverse(+c.lat.toFixed(5), +c.lng.toFixed(5)); }, 350); });
	}
	function mapGo(lat, lng) { ensureMap(); if (map) map.setView([lat, lng], 17); }
	if (window.jQuery) { jQuery('#au-map').on('shown.bs.modal', function () { ensureMap(); if (map) map.invalidateSize(); }); }
	var loc = document.querySelector('[data-au-map-locate]');
	if (loc) loc.addEventListener('click', function () {
		if (!navigator.geolocation) return; loc.disabled = true;
		navigator.geolocation.getCurrentPosition(function (p) { loc.disabled = false; mapGo(p.coords.latitude, p.coords.longitude); }, function () { loc.disabled = false; }, { enableHighAccuracy: true, timeout: 8000 });
	});
	var q = document.querySelector('[data-au-map-q]');
	if (q) q.addEventListener('keydown', function (e) {
		if (e.key !== 'Enter') return; e.preventDefault(); var v = q.value.trim(); if (!v) return;
		fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=id&accept-language=id&email=info@toffin.id&q=' + encodeURIComponent(v), { headers: { 'Accept': 'application/json' } })
			.then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
			.then(function (d) { if (d && d[0]) mapGo(+d[0].lat, +d[0].lon); else mapName.textContent = 'Alamat tidak ditemukan'; })
			.catch(function () {   /* fallback Photon */
				fetch('https://photon.komoot.io/api/?limit=1&lat=-6.2&lon=106.8&q=' + encodeURIComponent(v)).then(function (r) { return r.json(); })
					.then(function (d) { var f = d.features && d.features[0]; if (f) mapGo(f.geometry.coordinates[1], f.geometry.coordinates[0]); else mapName.textContent = 'Alamat tidak ditemukan'; }).catch(function () {});
			});
	});
	document.querySelectorAll('[data-au-map-save]').forEach(function (b) { b.addEventListener('click', function () {
		if (map) { var c = map.getCenter(); cur.lat = +c.lat.toFixed(6); cur.lng = +c.lng.toFixed(6); }
		form.querySelector('[name=partner_latitude]').value = cur.lat; form.querySelector('[name=partner_longitude]').value = cur.lng;
		mapBox.classList.add('is-set'); mapBox.classList.remove('is-invalid'); mapStatus.textContent = cur.name;
	}); });
	/* validasi & kirim */
	function bad(f, isBad) { f.classList.toggle('is-invalid', isBad); return isBad; }
	form.addEventListener('input', function (e) { var f = e.target.closest('.au-field, .au-check'); if (f) f.classList.remove('is-invalid'); form.querySelector('[data-au-alert]').hidden = true; });
	form.addEventListener('submit', function (e) {
		e.preventDefault(); var ok = true, first = null;
		form.querySelectorAll('.au-field').forEach(function (f) {
			var i = f.querySelector('input,select,textarea'); if (!i || i.disabled || !i.required) { f.classList.remove('is-invalid'); return; }
			var v = i.value.trim(), isBad = !v || (i.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) || (i.minLength > 0 && v.length < i.minLength) || (i.name === 'npwp' && !/^\d{15,16}$/.test(v));
			if (i.hasAttribute('data-au-confirm') && v !== pw.value) isBad = true;
			if (bad(f, isBad)) { ok = false; first = first || f; }
		});
		/* tandai lokasi wajib */
		if (bad(mapBox, !form.querySelector('[name=partner_latitude]').value)) { ok = false; first = first || mapBox; }
		var agree = form.querySelector('[data-au-agree]'); if (bad(agree.closest('.au-check'), !agree.checked)) { ok = false; first = first || agree.closest('.au-check'); }
		form.querySelector('[data-au-alert]').hidden = ok;
		if (!ok) { first.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
		var btn = form.querySelector('.au-submit'); btn.classList.add('is-busy');
		setTimeout(function () { btn.classList.remove('is-busy'); location.href = 'check-email.html'; }, 900);   /* contoh: ke langkah aktivasi */
	});
}());

/* ---------- existing user (existing-user.html) ---------- */
(function () {
	'use strict';
	var form = document.querySelector('[data-au-existing]');
	if (!form) return;
	var card = form.closest('.au-card'), matches = document.querySelector('[data-au-matches]'), alert = form.querySelector('[data-au-alert]');
	var mail = form.querySelector('[name=email]'), field = mail.closest('.au-field'), branchBox = form.querySelector('[data-au-branch]');
	/* tooltip label (sama dengan daftar) */
	form.querySelectorAll('.au-tip__btn').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); b.parentElement.classList.toggle('is-open'); }); });
	document.addEventListener('click', function () { form.querySelectorAll('.au-tip.is-open').forEach(function (t) { t.classList.remove('is-open'); }); });
	form.addEventListener('input', function () { field.classList.remove('is-invalid'); branchBox.classList.remove('is-invalid'); alert.hidden = true; });
	form.addEventListener('change', function () { branchBox.classList.remove('is-invalid'); alert.hidden = true; });
	function show(step2) {
		form.hidden = step2; matches.hidden = !step2;
		card.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
	form.addEventListener('submit', function (e) {
		e.preventDefault();
		var v = mail.value.trim(), picked = form.querySelector('[name=instance_id]:checked');
		var badMail = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); field.classList.toggle('is-invalid', badMail);
		branchBox.classList.toggle('is-invalid', !picked);
		if (badMail || !picked) return;
		var btn = form.querySelector('.au-submit'); btn.classList.add('is-busy');
		/* contoh tanpa backend: email berisi "baru" dianggap tidak ditemukan; selainnya menampilkan kontak contoh.
		   Produksi: POST /apiv2/existing-user {instance_id, email, g-recaptcha-response} → daftar kontak. */
		setTimeout(function () {
			btn.classList.remove('is-busy');
			if (/baru/i.test(v)) { alert.hidden = false; return; }
			matches.querySelector('[data-au-match-mail]').textContent = v;
			matches.querySelector('[data-au-match-branch]').textContent = (function (n) { return /Toffin/i.test(n) ? n : 'Toffin ' + n; }(picked.nextElementSibling.textContent.trim()));
			matches.querySelectorAll('.au-match').forEach(function (m) { m.classList.remove('is-picked'); });
			show(true);
		}, 900);
	});
	matches.querySelectorAll('[data-au-match-pick]').forEach(function (b) {
		b.addEventListener('click', function () {
			var m = b.closest('.au-match'); matches.querySelectorAll('.au-match').forEach(function (x) { x.classList.remove('is-picked'); }); m.classList.add('is-picked');
			b.classList.add('is-busy'); b.textContent = 'Mengirim kode…';
			try { var ctc = JSON.parse(m.getAttribute('data-au-contact') || '{}'); ctc.email = mail.value.trim(); sessionStorage.setItem('tfExisting', JSON.stringify(ctc)); } catch (err) {}   /* dibawa ke otp.html & register.html (contoh) */
			setTimeout(function () { location.href = 'otp.html'; }, 900);   /* contoh: kode OTP dikirim → halaman OTP */
		});
	});
	var back = matches.querySelector('[data-au-match-back]');
	back.addEventListener('click', function (e) { e.preventDefault(); show(false); });
}());

/* ---------- OTP (otp.html) ---------- */
(function () {
	'use strict';
	var form = document.querySelector('[data-au-otp]');
	if (!form) return;
	var boxes = Array.prototype.slice.call(form.querySelectorAll('[data-au-otp-boxes] input')), wrap = form.querySelector('[data-au-otp-boxes]'), val = form.querySelector('[data-au-otp-val]');
	var btn = form.querySelector('.au-submit'), alert = form.querySelector('[data-au-alert]'), resend = form.querySelector('[data-au-otp-resend]'), timer = form.querySelector('[data-au-otp-timer]'), to = form.querySelector('[data-au-otp-to]');
	try { var c = JSON.parse(sessionStorage.getItem('tfExisting') || '{}'); if (c.email && to) to.textContent = c.email; } catch (err) {}
	function sync() { var v = boxes.map(function (b) { b.classList.toggle('is-filled', !!b.value); return b.value; }).join(''); val.value = v; btn.disabled = v.length < 6; wrap.classList.remove('is-invalid'); alert.hidden = true; }
	boxes.forEach(function (b, i) {
		b.addEventListener('input', function () {
			b.value = b.value.replace(/\D/g, '').slice(-1);
			if (b.value && boxes[i + 1]) boxes[i + 1].focus();
			sync(); if (val.value.length === 6) form.requestSubmit ? form.requestSubmit() : btn.click();
		});
		b.addEventListener('keydown', function (e) { if (e.key === 'Backspace' && !b.value && boxes[i - 1]) { boxes[i - 1].value = ''; boxes[i - 1].focus(); sync(); } });
		b.addEventListener('paste', function (e) {   /* tempel 6 digit sekaligus (mis. dari WhatsApp) */
			var d = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, ''); if (!d) return; e.preventDefault();
			boxes.forEach(function (x, k) { x.value = d[k] || ''; }); boxes[Math.min(d.length, 6) - 1].focus(); sync();
		});
	});
	form.addEventListener('submit', function (e) {
		e.preventDefault(); if (val.value.length < 6) return; btn.classList.add('is-busy');
		/* contoh tanpa backend: 123456 benar. Produksi: verifikasi ke server, lalu register.html?existing=1 */
		setTimeout(function () {
			btn.classList.remove('is-busy');
			if (val.value !== '123456') { wrap.classList.add('is-invalid'); alert.hidden = false; boxes.forEach(function (b) { b.value = ''; }); boxes[0].focus(); btn.disabled = true; return; }
			location.href = 'register.html?existing=1';
		}, 900);
	});
	var left = 60, tick;
	function countdown() { left = 60; resend.disabled = true; clearInterval(tick); tick = setInterval(function () { left--; timer.textContent = '(' + left + ')'; if (left <= 0) { clearInterval(tick); timer.textContent = ''; resend.disabled = false; } }, 1000); timer.textContent = '(' + left + ')'; }
	resend.addEventListener('click', function () { countdown(); boxes.forEach(function (b) { b.value = ''; }); sync(); boxes[0].focus(); });
	countdown(); boxes[0].focus();
}());
