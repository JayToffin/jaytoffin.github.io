/* =====================================================================
   Toffin v2 · tf-map.js — pemilih titik lokasi (pinpoint) yang bisa ganti penyedia peta.
   Dipakai checkout.html (dialog #dlg-pin). Pin tetap di tengah; pengguna menggeser peta.

   API (tidak bergantung penyedia):
     var p = TFMap.picker({ el, lat, lng, onMove(lat, lng), onName(text) });
     p.go(lat, lng)      pindah ke titik
     p.center()          { lat, lng } titik di bawah pin
     p.search(text)      cari alamat → pindah (hasil pertama)
     p.locate(cb)        pakai lokasi perangkat
     p.resize()          panggil setelah wadah peta tampil (dialog dibuka)

   Penyedia sekarang: 'leaflet' (OpenStreetMap; ubin Esri, cadangan OSM; geocoding Nominatim,
   cadangan Photon; semua tanpa API key). Leaflet baru dimuat saat peta pertama kali dibuka.

   Ganti ke Google Maps: isi PROVIDERS.google dengan fungsi yang sama (load / create / go / center /
   onMoveEnd / resize), pakai Maps JavaScript API + Geocoder (reverse) + Places/Geocoder (cari),
   lalu set TFMap.provider = 'google' dan TFMap.googleKey = '<API key>'. Kunci di produksi Odoo:
   Website › Settings › Google Maps API Key (checkout lama sudah memuat maps.googleapis.com).
   ===================================================================== */
(function () {
	'use strict';
	function loadOnce(id, tag, attrs, cb) {
		var ex = document.getElementById(id);
		if (ex) { if (ex.getAttribute('data-ready')) cb(); else ex.addEventListener('load', cb); return; }
		var el = document.createElement(tag); el.id = id;
		Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
		el.addEventListener('load', function () { el.setAttribute('data-ready', '1'); cb(); });
		document.head.appendChild(el);
	}

	/* ---------- geocoding gratis (dipakai penyedia leaflet) ---------- */
	function shortName(a) {   /* Nominatim: jalan · kelurahan/kecamatan · kota */
		if (!a) return '';
		var kota = (a.city_district && /^Jakarta/.test(a.city_district)) ? a.city_district : (a.city || a.town || a.county || a.state);
		return [a.road || a.pedestrian || a.building || a.amenity, a.village || a.suburb || a.neighbourhood, kota].filter(Boolean).filter(function (v, i, arr) { return arr.indexOf(v) === i; }).join(', ');
	}
	function photonName(p) {
		if (!p) return '';
		return [p.street || p.name, p.district || p.locality, p.city || p.county || p.state].filter(Boolean).filter(function (v, i, a) { return a.indexOf(v) === i; }).join(', ');
	}
	var OSM_GEO = {
		reverse: function (lat, lng, cb) {
			fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + lat + '&lon=' + lng + '&zoom=18&accept-language=id&email=info@toffin.id', { headers: { Accept: 'application/json' } })
				.then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
				.then(function (d) { cb(shortName(d.address) || d.display_name || ''); })
				.catch(function () {
					fetch('https://photon.komoot.io/reverse?lon=' + lng + '&lat=' + lat).then(function (r) { return r.json(); })
						.then(function (d) { cb(photonName(d.features && d.features[0] && d.features[0].properties)); }).catch(function () { cb(''); });
				});
		},
		search: function (text, cb) {
			fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=id&accept-language=id&email=info@toffin.id&q=' + encodeURIComponent(text), { headers: { Accept: 'application/json' } })
				.then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
				.then(function (d) { cb(d && d[0] ? { lat: +d[0].lat, lng: +d[0].lon } : null); })
				.catch(function () {
					fetch('https://photon.komoot.io/api/?limit=1&lat=-6.2&lon=106.8&q=' + encodeURIComponent(text)).then(function (r) { return r.json(); })
						.then(function (d) { var f = d.features && d.features[0]; cb(f ? { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] } : null); }).catch(function () { cb(null); });
				});
		}
	};

	/* ---------- penyedia peta ---------- */
	var PROVIDERS = {
		leaflet: {
			geo: OSM_GEO,
			load: function (cb) {
				if (window.L) { cb(); return; }
				loadOnce('tf-leaflet-css', 'link', { rel: 'stylesheet', href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', crossorigin: '' }, function () {});
				loadOnce('tf-leaflet-js', 'script', { src: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', crossorigin: '' }, cb);
			},
			create: function (el, lat, lng) {
				var map = L.map(el, { zoomControl: true, attributionControl: true }).setView([lat, lng], 17);
				/* ubin Esri World Street Map (gratis, tanpa kunci); 3x gagal → tile.openstreetmap.org */
				var tiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Tiles &copy; Esri' }).addTo(map), err = 0;
				tiles.on('tileerror', function () { if (++err === 3) { map.removeLayer(tiles); L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map); } });
				return map;
			},
			go: function (map, lat, lng) { map.setView([lat, lng], 17); },
			center: function (map) { var c = map.getCenter(); return { lat: c.lat, lng: c.lng }; },
			onMoveStart: function (map, fn) { map.on('movestart', fn); },
			onMoveEnd: function (map, fn) { map.on('moveend', fn); },
			resize: function (map) { map.invalidateSize(); }
		},
		google: null   /* lihat catatan di kepala berkas */
	};

	window.TFMap = {
		provider: 'leaflet',
		picker: function (o) {
			var P = PROVIDERS[this.provider] || PROVIDERS.leaflet, map = null, queue = [], timer = null, seq = 0;
			function when(fn) { if (map) fn(); else queue.push(fn); }
			function name(lat, lng) {
				var s = ++seq; if (o.onName) o.onName(null);
				P.geo.reverse(lat, lng, function (t) { if (s === seq && o.onName) o.onName(t || 'Titik dipilih'); });
			}
			P.load(function () {
				map = P.create(o.el, o.lat, o.lng);
				P.onMoveStart(map, function () { if (o.onMoveStart) o.onMoveStart(); });
				P.onMoveEnd(map, function () {
					var c = P.center(map); if (o.onMove) o.onMove(c.lat, c.lng);
					clearTimeout(timer); timer = setTimeout(function () { name(+c.lat.toFixed(5), +c.lng.toFixed(5)); }, 350);
				});
				queue.splice(0).forEach(function (fn) { fn(); });
			});
			return {
				go: function (lat, lng) { when(function () { P.go(map, lat, lng); }); },
				center: function () { return map ? P.center(map) : { lat: o.lat, lng: o.lng }; },
				search: function (text, cb) { P.geo.search(text, function (r) { if (r) when(function () { P.go(map, r.lat, r.lng); }); if (cb) cb(!!r); }); },
				locate: function (cb) {
					if (!navigator.geolocation) { if (cb) cb(false); return; }
					navigator.geolocation.getCurrentPosition(function (p) { when(function () { P.go(map, p.coords.latitude, p.coords.longitude); }); if (cb) cb(true); },
						function () { if (cb) cb(false); }, { enableHighAccuracy: true, timeout: 8000 });
				},
				resize: function () { when(function () { P.resize(map); }); }
			};
		}
	};
})();
