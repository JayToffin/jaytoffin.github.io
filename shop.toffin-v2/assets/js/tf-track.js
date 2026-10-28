/* =====================================================================
   Toffin v2 · tf-track.js — Lacak pesanan, pengiriman instan (tracking-order.html)
   Data contoh: <script id="trk-data"> (GoSend Instant, Toffin Indonesia → Tebet).
   Asal ditampilkan umum "Toffin Indonesia": nama & alamat gudang tidak diperlihatkan ke pembeli.
   Skenario ?st=cari | jemput | antar (bawaan) | tiba.
   Peta: Leaflet 1.9.4 (unpkg) + ubin Esri World Street Map (seperti tf-map.js), cadangan OpenStreetMap; tanpa API key.
   Posisi driver disimulasikan bergerak di rute. Produksi: posisi & status dari API/webhook
   kurir (GoSend/Grab) lewat Odoo, diperbarui berkala (polling/websocket).
   Ganti ke Google Maps: ganti fungsi map*() di bawah (marker, polyline, fitBounds).
   ===================================================================== */
(function () {
	'use strict';
	var root = document.querySelector('[data-tf-track]');
	if (!root) return;
	function $(s, c) { return (c || document).querySelector(s); }
	function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
	function ico(id) { return '<svg class="tf-i" aria-hidden="true"><use href="#' + id + '"/></svg>'; }

	var D = JSON.parse($('#trk-data').textContent);
	var st = new URLSearchParams(location.search).get('st');
	if (['cari', 'jemput', 'antar', 'tiba'].indexOf(st) < 0) st = 'antar';
	var KM = 16.2;   /* panjang rute contoh */
	var sim = { p: st === 'antar' ? 0.55 : st === 'tiba' ? 1 : 0, q: 0.15 };   /* p: posisi di rute antar, q: di rute jemput */

	/* ---------- teks per keadaan ---------- */
	var CUR = { cari: 1, jemput: 2, antar: 4, tiba: 5 }[st];
	var BAR = { cari: 12, jemput: 35, antar: 70, tiba: 100 }[st];
	var S = {
		cari: { t: 'Mencari driver terdekat', s: 'Paket sudah dikemas dan siap diambil. Biasanya driver ditemukan kurang dari 5 menit.', eta: '14.30 – 14.50', note: 'setelah driver ditemukan' },
		jemput: { t: 'Driver menuju lokasi pengambilan', s: D.driver.name + ' akan mengambil paket dari ' + D.origin.name + '.', eta: '14.30 – 14.45', note: '' },
		antar: { t: 'Pesanan dalam perjalanan', s: 'Driver sudah mengambil paket dan menuju alamat Anda.', eta: '14.35 – 14.50', note: '' },
		tiba: { t: 'Pesanan tiba', s: 'Diterima 15 Okt 2026, 14.41 WIB oleh ' + D.dest.name + '.', eta: '14.41', note: '' }
	}[st];

	function minsLeft() {
		if (st === 'jemput') return Math.max(1, Math.round((1 - sim.q) * 7));
		if (st === 'antar') return Math.max(1, Math.round((1 - sim.p) * 27));
		return 0;
	}
	function kmLeft() { return (st === 'jemput' ? (1 - sim.q) * 2.1 : (1 - sim.p) * KM).toFixed(1).replace('.', ','); }

	/* ---------- panel ---------- */
	function statusCard() {
		var right = st === 'tiba' ? '<div class="tf-trk__etam is-done">' + ico('i-circle-check') + '<small>Selesai</small></div>'
			: st === 'cari' ? '<div class="tf-trk__etam is-wait"><span class="tf-trk__spin"></span><small>Menunggu driver</small></div>'
			: '<div class="tf-trk__etam"><b data-trk-min>' + minsLeft() + '</b> menit<small data-trk-km>' + (st === 'jemput' ? 'ke titik ambil · ' : '') + kmLeft() + ' km lagi</small></div>';
		var phases = ['Dikemas', 'Dapat driver', 'Diambil', 'Tiba'];
		var on = { cari: 1, jemput: 2, antar: 3, tiba: 4 }[st];
		return '<section class="tf-trk__card tf-trk__status tf-trk__status--' + st + '">' +
			'<div class="tf-trk__svc"><span>' + ico('i-motorbike') + '</span><b>' + esc(D.service) + '</b>' + (st === 'tiba' ? '' : '<em class="tf-trk__livetag"><i></i>LIVE</em>') + '</div>' +
			'<h1 class="tf-trk__title">' + S.t + '</h1><p class="tf-trk__sub">' + esc(S.s) + '</p>' +
			'<div class="tf-trk__eta"><div><small>' + (st === 'tiba' ? 'Tiba pukul' : 'Perkiraan tiba') + '</small><strong>' + S.eta + (st === 'tiba' ? '' : ' <span>WIB</span>') + '</strong>' + (S.note ? '<em>' + S.note + '</em>' : '') + '</div>' + right + '</div>' +
			'<div class="tf-trk__bar" role="progressbar" aria-valuenow="' + BAR + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + BAR + '%"></i></div>' +
			'<ol class="tf-trk__phases">' + phases.map(function (p, i) { return '<li class="' + (i < on ? 'is-done' : '') + '">' + p + '</li>'; }).join('') + '</ol>' +
			'</section>';
	}
	function driverCard() {
		var d = D.driver;
		if (st === 'cari') return '<section class="tf-trk__card tf-trk__driver is-search"><span class="tf-trk__radar">' + ico('i-motorbike') + '</span><div><strong>Mencari driver…</strong><p>Kami cocokkan driver ' + esc(D.service.replace(' Instant', '')) + ' terdekat untuk mengambil paket. Halaman ini diperbarui otomatis.</p></div></section>';
		var wa = 'https://wa.me/62' + d.phone.replace(/^0/, '') + '?text=' + encodeURIComponent('Halo Pak ' + d.name.split(' ')[0] + ', saya penerima pesanan Toffin ' + D.so + '.');
		return '<section class="tf-trk__card tf-trk__driver">' +
			'<div class="tf-trk__dhead"><span class="tf-trk__avatar">' + d.initials + '<i>' + ico('i-motorbike') + '</i></span>' +
			'<div class="tf-trk__dinfo"><small>Driver Anda</small><strong>' + esc(d.name) + '</strong><p><span class="tf-trk__star">' + ico('i-star') + d.rating.toFixed(1) + '</span> · ' + d.trips + ' perjalanan</p></div>' +
			'<div class="tf-trk__veh"><span class="tf-trk__plate">' + esc(d.plate) + '</span><small>' + esc(d.vehicle) + ' · ' + esc(d.color) + '</small></div></div>' +
			(st === 'tiba' ? '' : '<div class="tf-trk__dact"><a href="tel:' + d.phone + '" class="tf-trk__btn">' + ico('i-phone') + ' Telepon</a><a href="' + wa + '" target="_blank" rel="noopener noreferrer" class="tf-trk__btn">' + ico('i-brand-whatsapp') + ' Chat</a></div>' +
			'<p class="tf-trk__safe">' + ico('i-shield-check') + ' Pastikan plat nomor sesuai sebelum menerima paket.</p>') +
			'</section>';
	}
	function proofCard() {
		if (st !== 'tiba') return '';
		var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#e9e4dc"/><rect x="0" y="150" width="320" height="50" fill="#cfc6b8"/><rect x="190" y="20" width="90" height="140" rx="4" fill="#8b6b4a"/><circle cx="268" cy="95" r="4" fill="#e7c27a"/><rect x="70" y="92" width="96" height="66" rx="4" fill="#c99a5b"/><rect x="70" y="92" width="96" height="14" fill="#b88647"/><rect x="108" y="92" width="20" height="66" fill="#e8d3a8" opacity=".7"/><rect x="84" y="120" width="40" height="22" rx="2" fill="#fff" opacity=".85"/><text x="12" y="24" font-family="Arial" font-size="12" fill="#6b5b45">FOTO CONTOH · 14.41</text></svg>';
		var url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
		return '<section class="tf-trk__card tf-trk__proof"><h2 class="tf-trk__h">' + ico('i-camera') + ' Bukti serah terima</h2>' +
			'<img src="' + url + '" alt="Foto paket di alamat tujuan (contoh)">' +
			'<dl><div><dt>Diterima oleh</dt><dd>' + esc(D.dest.name) + ' <span>(yang bersangkutan)</span></dd></div><div><dt>Waktu</dt><dd>15 Okt 2026, 14.41 WIB</dd></div></dl></section>';
	}
	function routeCard() {
		var o = D.origin, d = D.dest;
		return '<section class="tf-trk__card"><h2 class="tf-trk__h">' + ico('i-map-pin') + ' Rute pengiriman</h2><ol class="tf-trk__route">' +
			'<li class="is-from"><span class="tf-trk__rdot">' + ico('i-building-store') + '</span><div><small>Dari</small><strong>' + esc(o.name) + '</strong><p>Paket dikemas dan diserahkan oleh tim Toffin</p></div></li>' +
			'<li class="is-to"><span class="tf-trk__rdot">' + ico('i-home') + '</span><div><small>Ke · ' + esc(d.label) + '</small><strong>' + esc(d.name) + ' <span>' + esc(d.phone) + '</span></strong><p>' + esc(d.addr) + '</p></div></li></ol>' +
			(d.note ? '<p class="tf-trk__note">' + ico('i-note') + '<span><b>Catatan untuk driver:</b> ' + esc(d.note) + '</span></p>' : '') + '</section>';
	}
	function timeline() {
		return '<section class="tf-trk__card"><h2 class="tf-trk__h">' + ico('i-clock') + ' Riwayat pengiriman</h2><ol class="tf-trk__tl">' +
			D.steps.map(function (s, i) {
				var cls = i < CUR || (st === 'tiba') ? 'is-done' : i === CUR ? 'is-on' : '';
				var time = cls ? (i === 5 ? '14.41' : s[3]) : '';
				return '<li class="' + cls + '"><span class="tf-trk__tdot">' + ico(cls === 'is-done' ? 'i-check' : s[0]) + '</span><div><strong>' + s[1] + '</strong><p>' + (i === 2 && st !== 'cari' ? esc(D.driver.name) + ' menerima pesanan' : s[2]) + '</p></div><time>' + (time || '') + '</time></li>';
			}).reverse().join('') + '</ol></section>';
	}
	function helpCard() {
		return '<a href="https://wa.me/6281199833780?text=' + encodeURIComponent('Halo Toffin, saya butuh bantuan pengiriman pesanan ' + D.so + ' (' + D.booking + ')') + '" target="_blank" rel="noopener noreferrer" class="tf-trk__card tf-trk__help">' + ico('i-headset') + '<span><strong>Ada kendala pengiriman?</strong> Chat tim Toffin via WhatsApp</span>' + ico('i-chevron-right') + '</a>';
	}
	$('[data-trk-panel]').innerHTML = statusCard() + proofCard() + driverCard() + routeCard() + timeline() + helpCard();
	if (st === 'tiba') { var lv = $('[data-trk-live]'); if (lv) lv.hidden = true; }
	if (st === 'cari') { var lv2 = $('[data-trk-live] span'); if (lv2) lv2.textContent = 'Mencari driver terdekat…'; }

	/* ---------- peta ---------- */
	var mapEl = $('[data-trk-map]'), map = null, driver = null, lineDone = null, lineLeft = null;
	function along(path, t) {   /* titik di polyline pada fraksi t (0..1), jarak euclid lat/lng cukup untuk jarak pendek */
		var seg = [], total = 0, i;
		for (i = 1; i < path.length; i++) { var d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); seg.push(d); total += d; }
		var want = Math.max(0, Math.min(1, t)) * total, acc = 0, done = [path[0]];
		for (i = 0; i < seg.length; i++) {
			if (acc + seg[i] >= want) { var k = seg[i] ? (want - acc) / seg[i] : 0, pt = [path[i][0] + (path[i + 1][0] - path[i][0]) * k, path[i][1] + (path[i + 1][1] - path[i][1]) * k]; done.push(pt); return { pt: pt, done: done, left: [pt].concat(path.slice(i + 1)) }; }
			acc += seg[i]; done.push(path[i + 1]);
		}
		var last = path[path.length - 1]; return { pt: last, done: path.slice(), left: [last] };
	}
	function pin(kind, icon) { return L.divIcon({ className: 'tf-trk-pin tf-trk-pin--' + kind, html: '<span>' + ico(icon) + '</span>', iconSize: [40, 40], iconAnchor: [20, 20] }); }
	function drawProgress() {
		if (!map) return;
		var path = st === 'jemput' ? D.approach : D.route, t = st === 'jemput' ? sim.q : sim.p, a = along(path, t);
		if (driver) driver.setLatLng(a.pt);
		if (lineDone) lineDone.setLatLngs(a.done);
		if (lineLeft) lineLeft.setLatLngs(a.left);
	}
	function initMap() {
		map = L.map(mapEl, { zoomControl: false, attributionControl: true, scrollWheelZoom: false });
		var tiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Tiles &copy; Esri' }).addTo(map), err = 0;   /* sama dengan tf-map.js */
		tiles.on('tileerror', function () { if (++err === 3) { map.removeLayer(tiles); L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map); } });
		L.control.zoom({ position: 'bottomright' }).addTo(map);
		var R = D.route;
		if (st === 'cari') L.polyline(R, { color: '#9ca3af', weight: 4, dashArray: '2 9', lineCap: 'round' }).addTo(map);
		else if (st === 'jemput') {
			L.polyline(R, { color: '#9ca3af', weight: 4, dashArray: '2 9', lineCap: 'round' }).addTo(map);
			lineLeft = L.polyline([], { color: '#16a34a', weight: 4, dashArray: '2 9', lineCap: 'round' }).addTo(map);
			lineDone = L.polyline([], { color: '#16a34a', weight: 5, opacity: .35 }).addTo(map);
		} else {
			lineLeft = L.polyline([], { color: '#f8941f', weight: 5, dashArray: '1 10', lineCap: 'round' }).addTo(map);
			lineDone = L.polyline([], { color: '#16a34a', weight: 6, lineCap: 'round' }).addTo(map);
		}
		L.marker([D.origin.lat, D.origin.lng], { icon: pin('store', 'i-building-store'), title: D.origin.name }).addTo(map);
		L.marker([D.dest.lat, D.dest.lng], { icon: pin('home', 'i-home'), title: D.dest.name }).addTo(map);
		if (st !== 'cari' && st !== 'tiba') driver = L.marker([0, 0], { icon: pin('driver', 'i-motorbike'), title: D.driver.name, zIndexOffset: 500 }).addTo(map);
		drawProgress(); fit();
	}
	function fit() {
		if (!map) return;
		var pts = D.route.slice(); if (st === 'jemput') pts = pts.concat(D.approach);
		map.fitBounds(pts, { padding: [36, 36] });
	}
	$('[data-trk-fit]').addEventListener('click', fit);
	function mapOff() {
		mapEl.classList.add('is-off');
		mapEl.innerHTML = '<div class="tf-trk__mapoff">' + ico('i-map-2') + '<strong>Peta belum bisa dimuat</strong><span>Status dan estimasi tiba tetap diperbarui.</span></div>';
	}
	(function load() {
		if (window.L) { initMap(); return; }
		var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(css);
		var js = document.createElement('script'), to = setTimeout(mapOff, 9000);
		js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
		js.onload = function () { clearTimeout(to); if (!mapEl.classList.contains('is-off')) initMap(); };
		js.onerror = function () { clearTimeout(to); mapOff(); };
		document.head.appendChild(js);
	})();

	/* ---------- simulasi gerak driver (contoh; produksi: data dari API kurir) ---------- */
	if (st === 'antar' || st === 'jemput') setInterval(function () {
		if (st === 'antar') sim.p = Math.min(0.97, sim.p + 0.006); else sim.q = Math.min(0.92, sim.q + 0.02);
		drawProgress();
		var m = $('[data-trk-min]'), k = $('[data-trk-km]');
		if (m) m.textContent = minsLeft();
		if (k) k.textContent = (st === 'jemput' ? 'ke titik ambil · ' : '') + kmLeft() + ' km lagi';
	}, 3000);
})();
