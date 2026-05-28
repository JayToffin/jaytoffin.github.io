/* ============================================================
   CONTACT PAGE · Officine Allegra
   Form validation · Lazy-loaded global map (Leaflet)
   ============================================================ */
(function () {

  // ---------- Form: validation + fake submit ----------
  const form = document.getElementById('contactForm');
  if (form) {
    const submitBtn = form.querySelector('.form-submit');
    const success = form.querySelector('.form-success');

    const validators = {
      name: v => v.trim().length >= 2,
      email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      message: v => v.trim().length >= 5,
      consent: (v, el) => el.checked,
    };

    function validateField(input) {
      const fn = validators[input.name];
      if (!fn) return true;
      const ok = fn(input.value, input);
      const wrap = input.closest('.field') || input.closest('.field-check');
      if (wrap) wrap.classList.toggle('has-error', !ok);
      return ok;
    }

    // inline validation: blur to validate, input to clear errors
    form.querySelectorAll('input, select, textarea').forEach(el => {
      el.addEventListener('blur', () => validateField(el));
      el.addEventListener('input', () => {
        const wrap = el.closest('.field') || el.closest('.field-check');
        if (wrap && wrap.classList.contains('has-error')) validateField(el);
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      let allOk = true;
      form.querySelectorAll('[required]').forEach(el => {
        if (!validateField(el)) allOk = false;
      });
      if (!allOk) {
        const firstErr = form.querySelector('.has-error');
        if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;

      // simulate request — replace with real fetch() to your endpoint
      setTimeout(() => {
        form.classList.add('is-submitted');
        success.classList.add('is-visible');
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 1100);
    });
  }

  // ---------- Map: lazy-load Leaflet + render world markers on click ----------
  const locations = [
    { lat: 45.4364, lng: 9.3500, name: 'Milan', country: 'Italy', primary: true },
    { lat: -6.2000, lng: 106.8167, name: 'Indonesia' },
    { lat: 14.0583, lng: 108.2772, name: 'Vietnam' },
    { lat: 28.3949, lng: 84.1240, name: 'Nepal' },
    { lat: -30.5595, lng: 22.9375, name: 'South Africa' },
    { lat: 39.0742, lng: 21.8243, name: 'Greece' },
    { lat: 35.1264, lng: 33.4299, name: 'Cyprus' },
    { lat: 38.9637, lng: 35.2433, name: 'Turkey' },
    { lat: 48.0196, lng: 66.9237, name: 'Kazakhstan' },
    { lat: 23.6345, lng: -102.5528, name: 'Mexico' },
    { lat: -9.1900, lng: -75.0152, name: 'Peru' },
    { lat: -35.6751, lng: -71.5430, name: 'Chile' },
    { lat: 55.3781, lng: -3.4360, name: 'United Kingdom' },
    { lat: 23.8859, lng: 45.0792, name: 'Saudi Arabia' },
    { lat: 46.8182, lng: 8.2275, name: 'Switzerland' },
  ];

  const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

  const loadStylesheet = href => new Promise((resolve, reject) => {
    if (document.querySelector(`link[href="${href}"]`)) return resolve();
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });

  const loadScript = src => new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });

  const initMap = (container) => {
    const L = window.L;
    const map = L.map(container, {
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true,
      worldCopyJump: true,
    }).setView([22, 10], 2);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 18,
    }).addTo(map);

    const workshopIcon = L.divIcon({
      className: 'oa-pin oa-pin--workshop',
      html: '<span class="pin-ring"></span><span class="pin-dot"></span>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    const marketIcon = L.divIcon({
      className: 'oa-pin oa-pin--market',
      html: '<span class="pin-dot"></span>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    const markers = [];
    locations.forEach(loc => {
      const icon = loc.primary ? workshopIcon : marketIcon;
      const subtitle = loc.primary ? 'Workshop · Officine Allegra' : 'Market presence';
      const popup = `
        <div class="oa-popup">
          <span class="oa-popup-eyebrow">${loc.primary ? '— Workshop' : '— Presence'}</span>
          <h5>${loc.name}${loc.country ? ` <span class="oa-popup-country">· ${loc.country}</span>` : ''}</h5>
          <p>${subtitle}</p>
        </div>`;
      const m = L.marker([loc.lat, loc.lng], { icon })
        .addTo(map)
        .bindPopup(popup, { closeButton: false, offset: [0, -4] });
      markers.push(m);
    });

    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds(), { padding: [40, 40], maxZoom: 4 });
  };

  const loadMapBtn = document.getElementById('loadMapBtn');
  const mapPlaceholder = document.getElementById('mapPlaceholder');
  const mapFrame = document.getElementById('globalMap');

  if (loadMapBtn && mapPlaceholder && mapFrame) {
    let loaded = false;
    const loadMap = async () => {
      if (loaded) return;
      loaded = true;
      loadMapBtn.disabled = true;
      loadMapBtn.textContent = 'Loading…';
      try {
        await loadStylesheet(LEAFLET_CSS);
        await loadScript(LEAFLET_JS);
        const mapContainer = document.createElement('div');
        mapContainer.className = 'leaflet-container-oa';
        mapPlaceholder.replaceWith(mapContainer);
        initMap(mapContainer);
      } catch (err) {
        loaded = false;
        loadMapBtn.disabled = false;
        loadMapBtn.textContent = 'Retry';
      }
    };
    loadMapBtn.addEventListener('click', e => { e.stopPropagation(); loadMap(); });
    mapPlaceholder.addEventListener('click', loadMap);
  }

})();
