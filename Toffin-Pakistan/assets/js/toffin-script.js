/* ============================================
   TOFFIN.PK — Main Vanilla JS Script
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Navigation Scroll Effect
  const nav = document.getElementById('mainNav');
  if (nav) {
    const logoImg = nav.querySelector('.nav-logo img');
    const isDarkHero = nav.classList.contains('nav-dark-hero');

    // Natively set white logo on page load for dark hero header (top state)
    if (isDarkHero && window.scrollY <= 60) {
      if (logoImg) logoImg.src = 'assets/img/root/logo-white.png';
    }

    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY > 60;
      nav.classList.toggle('scrolled', scrolled);

      // Dynamically swap logo asset for dark hero headers
      if (isDarkHero && logoImg) {
        if (scrolled) {
          logoImg.src = 'assets/img/root/logo-black.png';
        } else {
          logoImg.src = 'assets/img/root/logo-white.png';
        }
      }
    });
  }

  // 2. Initialize Language (index.html)
  const langBtns = document.querySelectorAll('.lang-btn');
  if (langBtns.length > 0) {
    langBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        if (this.dataset.lang) setLang(this.dataset.lang);
      });
    });
    let currentLang = 'en';   // toffin.pk: English only
    setLang(currentLang);
  }

  // 3. Brand Filter Interaction (products.html)
  const brandFilters = document.querySelectorAll('.brand-filter');
  if (brandFilters.length > 0) {
    brandFilters.forEach(btn => {
      btn.addEventListener('click', function () {
        const row = this.closest('.brand-filter-row');
        if (row) {
          row.querySelectorAll('.brand-filter').forEach(b => b.classList.remove('active'));
        }
        this.classList.add('active');
      });
    });
  }
});

// ============================================
// GLOBAL FUNCTIONS (For inline event handlers)
// ============================================

// --- index.html: Language Toggle ---
const COPY = {
  en: {
    'hero-label': 'Trusted HORECA Partner since 2007',
    'hero-h1': 'One Partner for All Your<br/><em>Café & Restaurant</em> Needs',
    'hero-sub': 'From world-class espresso machines to premium ingredients — Toffin provides everything your F&B business needs to operate at its best, every single day.',
    'hero-cta1': 'Explore Products', 'hero-cta2': 'Toffin App',
    'nav-home': 'Home', 'nav-about': 'About', 'nav-products': 'Products',
    'nav-support': 'Support', 'nav-app': 'Toffin App', 'nav-contact': 'Contact'
  }
};

function setLang(lang) {
  localStorage.setItem('toffin-lang', lang);

  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`.lang-btn[data-lang="${lang}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  const copy = COPY[lang];
  if (copy) {
    Object.entries(copy).forEach(([id, text]) => {
      const el = document.querySelector(`[data-id="${id}"]`);
      if (el) el.innerHTML = text;
    });
  }
}

// --- support.html: FAQ Toggle ---
function toggleFaq(el) {
  const item = el.closest('.faq-item');
  if (!item) return;
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!wasOpen) item.classList.add('open');
}

// ════════════════════════════════════════════════════════════════════
// ══ CONTACT FORM — EmailJS integration                              ══
// Form data dikirim via EmailJS SDK (client-side, no backend).
// Anti-spam: honeypot field (bot isi → silent drop, manusia tidak).
// ════════════════════════════════════════════════════════════════════

const TOFFIN_EMAILJS_CONFIG = {
  serviceId: 'service_t7sec4k',
  templateId: 'template_d5gndpp',
  publicKey: '8qrCSYqiAgwBvOZvj',
};

// Init EmailJS sekali saat load (idempotent — aman dipanggil berulang)
if (typeof window !== 'undefined' && window.emailjs) {
  window.emailjs.init({ publicKey: TOFFIN_EMAILJS_CONFIG.publicKey });
}

// ── Validators ──
// Pakistani mobile: +92 3xx xxxxxxx, 92 3xx..., 03xx-xxxxxxx, atau 3xx xxxxxxx (10 digit diawali 3).
// Toleransi spasi/dash/paren di input — di-strip dulu sebelum cek pattern.
function isValidIDPhone(value) {
  const cleaned = String(value || '').replace(/[\s\-()]/g, '');
  return /^(\+92|92|0)?3\d{9}$/.test(cleaned);
}
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

// Mark satu field invalid (tambah class + tampilkan inline error)
function markFieldInvalid(form, fieldName, customMsg) {
  const group = form.querySelector('[data-field="' + fieldName + '"]');
  if (!group) return;
  group.classList.add('is-invalid');
  if (customMsg) {
    const errEl = group.querySelector('.field-error');
    if (errEl) errEl.textContent = customMsg;
  }
}
function clearFieldError(group) {
  if (!group) return;
  group.classList.remove('is-invalid');
}

// Validasi keseluruhan form. Return true kalau valid.
function validateContactForm(form) {
  // Reset state dulu
  form.querySelectorAll('.is-invalid').forEach(clearFieldError);

  let firstInvalid = null;
  const fail = (name, msg) => {
    markFieldInvalid(form, name, msg);
    if (!firstInvalid) firstInvalid = form.querySelector('[data-field="' + name + '"]');
  };

  const name = form.querySelector('[name="from_name"]');
  const business = form.querySelector('[name="business_name"]');
  const phone = form.querySelector('[name="phone"]');
  const email = form.querySelector('[name="reply_to"]');
  const message = form.querySelector('[name="message"]');
  const consent = form.querySelector('#consent1');

  if (!name || !name.value.trim()) fail('from_name');
  if (!business || !business.value.trim()) fail('business_name');
  if (!phone || !phone.value.trim()) fail('phone', 'Phone number is required.');
  else if (!isValidIDPhone(phone.value)) fail('phone', 'Please enter a valid Pakistani mobile number (format: 03xx-xxxxxxx or +92 3xx xxxxxxx).');
  if (!email || !email.value.trim()) fail('reply_to', 'Email is required.');
  else if (!isValidEmail(email.value)) fail('reply_to', 'Please enter a valid email address.');
  if (!message || !message.value.trim()) fail('message');
  if (!consent || !consent.checked) fail('consent');

  if (firstInvalid) {
    const focusable = firstInvalid.querySelector('input, textarea');
    if (focusable) focusable.focus({ preventScroll: false });
    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return false;
  }
  return true;
}

// Live error clearing — saat user mulai mengetik di field invalid, hapus error
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('input', (e) => {
    const group = e.target.closest('.form-group, .form-checkbox');
    if (group && group.classList.contains('is-invalid')) clearFieldError(group);
  });
  // Checkbox change handler (input event tidak fire reliable di checkbox lama)
  const consent = form.querySelector('#consent1');
  if (consent) consent.addEventListener('change', () => {
    const group = consent.closest('.form-checkbox');
    if (consent.checked && group) clearFieldError(group);
  });
});

function submitForm(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = document.getElementById('contactSubmitBtn');
  const errorEl = document.getElementById('formError');
  const errorMsgEl = document.getElementById('formErrorMsg');
  const successEl = document.getElementById('formSuccess');

  // Honeypot check — kalau field "website" terisi, kemungkinan besar bot.
  // Diam-diam tampilkan success (biar bot pikir berhasil) tapi tidak kirim.
  const honeypot = form.querySelector('input[name="website"]');
  if (honeypot && honeypot.value.trim() !== '') {
    form.style.display = 'none';
    if (successEl) successEl.style.display = 'block';
    return;
  }

  // Validasi form — kalau gagal, fokus ke field pertama yang invalid & return
  if (!validateContactForm(form)) return;

  // Guard: SDK loaded?
  if (typeof window.emailjs === 'undefined') {
    if (errorEl && errorMsgEl) {
      errorMsgEl.textContent = 'The email service is not ready yet. Please refresh the page or contact us via WhatsApp.';
      errorEl.style.display = 'block';
    }
    return;
  }

  // Hide error state kalau ada dari attempt sebelumnya
  if (errorEl) errorEl.style.display = 'none';

  // Loading state
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');
  }

  // Kirim via EmailJS. sendForm() otomatis baca semua input[name] di form.
  window.emailjs
    .sendForm(TOFFIN_EMAILJS_CONFIG.serviceId, TOFFIN_EMAILJS_CONFIG.templateId, form)
    .then(() => {
      form.style.display = 'none';
      if (successEl) successEl.style.display = 'block';
    })
    .catch((err) => {
      console.error('[EmailJS] Send failed:', err);
      if (errorEl && errorMsgEl) {
        const status = err && err.status ? ` (code ${err.status})` : '';
        errorMsgEl.textContent =
          'Please try again or contact us via WhatsApp' + status + '.';
        errorEl.style.display = 'block';
      }
    })
    .finally(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-loading');
      }
    });
}

function resetForm() {
  const successEl = document.getElementById('formSuccess');
  if (successEl) successEl.style.display = 'none';

  const errorEl = document.getElementById('formError');
  if (errorEl) errorEl.style.display = 'none';

  const form = document.querySelector('.contact-form-block form');
  if (form) {
    form.reset();
    form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
    form.style.display = 'block';
  }
}


document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.brand-swiper--top')) {
    // Dua baris brand sebagai DUA slider terpisah (top & bottom) yang dikontrol
    // SATU navigation + satu autoplay. Karena tiap baris hanya 1 baris penuh,
    // tidak pernah ada sel kosong — berapapun jumlah brand-nya (ganjil/genap).
    var topWrap = document.querySelector('.brand-swiper--top .swiper-wrapper');
    var botWrap = document.querySelector('.brand-swiper--bottom .swiper-wrapper');

    // Semua slide awalnya ada di baris atas; pindahkan indeks ganjil ke baris
    // bawah supaya urutan brand tetap berpasangan kolom demi kolom.
    Array.prototype.slice.call(topWrap.children).forEach(function (slide, i) {
      if (i % 2 === 1) botWrap.appendChild(slide);
    });

    // loop:true => infinite mulus, lanjut SATU-SATU dari logo terakhir ke logo
    // pertama (bukan rewind yang menggulung balik banyak logo). Tiap baris hanya
    // 1 baris penuh, jadi tak pernah ada sel kosong (ganjil/genap).
    function makeBrandRow(selector) {
      return new Swiper(selector, {
        slidesPerView: 2,
        slidesPerGroup: 1,
        loop: true,
        spaceBetween: 12,
        autoplay: {
          delay: 2500,
          disableOnInteraction: false,
        },
        breakpoints: {
          640: { slidesPerView: 3, spaceBetween: 12 },
          1024: { slidesPerView: 6, spaceBetween: 14 },
        },
      });
    }

    var brandTop = makeBrandRow('.brand-swiper--top');
    var brandBottom = makeBrandRow('.brand-swiper--bottom');

    // SATU navigation menggerakkan KEDUA baris. Sengaja TANPA Swiper controller
    // karena kombinasi loop + controller di Swiper 11 bisa memunculkan slide
    // ganda. Tombol prev/next memanggil slide di dua baris sekaligus.
    var brandPrev = document.querySelector('.brand-swiper-prev');
    var brandNext = document.querySelector('.brand-swiper-next');
    if (brandPrev) brandPrev.addEventListener('click', function () {
      brandTop.slidePrev();
      brandBottom.slidePrev();
    });
    if (brandNext) brandNext.addEventListener('click', function () {
      brandTop.slideNext();
      brandBottom.slideNext();
    });
  }
});


// --- Dynamic Download Modal ---
function openDownloadModal() {
  let modal = document.getElementById('downloadModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'downloadModal';
    modal.className = 'download-modal-overlay';
    modal.innerHTML = `
      <div class="download-modal-content">
        <button class="download-modal-close" onclick="closeDownloadModal()">&times;</button>
        <h3>Download Toffin App</h3>
        <p>Scan the QR code below with your smartphone camera.</p>
        <img src="assets/img/qr-toffin-app.png" alt="QR Code Toffin App" />

      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeDownloadModal();
      }
    });
  }
  
  setTimeout(() => {
    modal.classList.add('active');
  }, 10);
}

function closeDownloadModal() {
  const modal = document.getElementById('downloadModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.dynamic-download-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobile = /android|ipad|iphone|ipod/i.test(userAgent.toLowerCase());
      
      if (isMobile) {
        window.location.href = 'https://qrco.de/bdBvQn';
      } else {
        openDownloadModal();
      }
    });
  });
});


// ════════════════════════════════════════════════════════════════
//  TOFFIN BRANCH MAP — Google Maps with custom marker pin
//  Dipakai di contact.html; dipanggil oleh callback Google Maps script
// ════════════════════════════════════════════════════════════════
const TOFFIN_BRANCHES = [
  /* koordinat perkiraan Sector E-11/2 — cek ulang pin di Google Maps */
  { name: 'Toffin Pakistan', address: 'Plot #34, Puran Arcade, SCHS, Sector E-11/2, Islamabad', lat: 33.6992, lng: 72.9766, phone: '+92 309 1115951' }
];

// Dipanggil otomatis oleh script tag callback=initToffinMap
function initToffinMap() {
  const mapEl = document.querySelector('[data-toffin-map]');
  if (!mapEl || !window.google || !window.google.maps) return;

  const map = new google.maps.Map(mapEl, {
    center: { lat: 33.6992, lng: 72.9766 },  // Islamabad (toffin.pk)
    zoom: 5,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
    gestureHandling: 'cooperative',
    // Editorial map style — muted/clean (match brand mood)
    styles: [
      { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
      { featureType: 'landscape', stylers: [{ saturation: -30 }, { lightness: 5 }] },
      { featureType: 'water', stylers: [{ color: '#dde4ea' }] },
    ],
  });

  // marker.png aslinya 512×512 square — scale proporsional 1:1 supaya gak distorsi.
  // anchor pakai CENTER (bukan bottom-center) karena pin design square, visual center
  // = koordinat target. Hasilnya: pin presisi di lat/lng tanpa offset.
  const PIN_SIZE = 36;
  const customIcon = {
    url: 'assets/img/marker.png',
    scaledSize: new google.maps.Size(PIN_SIZE, PIN_SIZE),
    anchor: new google.maps.Point(PIN_SIZE / 2, PIN_SIZE / 2),
  };

  // SVG icon untuk popup actions (lebih clean dari emoji)
  const ICON_PHONE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 015 .82h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L9.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z"/></svg>';
  const ICON_DIR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>';

  const infoWindow = new google.maps.InfoWindow({ maxWidth: 320 });

  TOFFIN_BRANCHES.forEach((branch) => {
    const marker = new google.maps.Marker({
      position: { lat: branch.lat, lng: branch.lng },
      map: map,
      icon: customIcon,
      title: branch.name,
      optimized: true,
    });

    marker.addListener('click', () => {
      const telHref = branch.phone.replace(/[^0-9+]/g, '');
      const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`;
      const shortName = branch.name.replace(/^Toffin\s+/, '');
      infoWindow.setContent(`
        <article class="map-popup">
          <img class="map-popup-logo" src="assets/img/root/logo-black.png" alt="Toffin" />
          <h5 class="map-popup-title">${shortName}</h5>
          <p class="map-popup-addr">${branch.address}</p>
          <div class="map-popup-actions">
            <a href="tel:${telHref}" class="map-popup-link map-popup-link--ghost">${ICON_PHONE}<span>Call</span></a>
            <a href="${dirUrl}" target="_blank" rel="noopener" class="map-popup-link map-popup-link--primary">${ICON_DIR}<span>Get Directions</span></a>
          </div>
        </article>
      `);
      infoWindow.open({ anchor: marker, map: map });
    });
  });

  // Auto-fit map ke semua marker — adaptif untuk semua viewport (mobile/desktop).
  // Padding lebih besar di mobile supaya marker tepi tidak nempel edge.
  const bounds = new google.maps.LatLngBounds();
  TOFFIN_BRANCHES.forEach((b) => bounds.extend({ lat: b.lat, lng: b.lng }));
  const isMobile = window.innerWidth <= 768;
  map.fitBounds(bounds, isMobile
    ? { top: 30, right: 20, bottom: 30, left: 20 }
    : { top: 50, right: 50, bottom: 50, left: 50 });

  // Re-fit kalau window di-resize (rotate device / desktop resize)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const isMobileNow = window.innerWidth <= 768;
      map.fitBounds(bounds, isMobileNow
        ? { top: 30, right: 20, bottom: 30, left: 20 }
        : { top: 50, right: 50, bottom: 50, left: 50 });
    }, 200);
  });
}

// Expose ke window karena Google Maps script callback memerlukan global
window.initToffinMap = initToffinMap;

/* Feed Insight dihapus untuk toffin.pk (section Insight tidak dipakai). */

/* ════════════════════════════════════════════════════════════════════
   ══ MODAL — reusable overlay (Privacy Policy, dll)                  ══
   Trigger:  <a data-modal-trigger="privacy">Buka</a>
   Modal:    <div class="modal-overlay" data-modal="privacy" hidden>
   Close:    <button data-modal-close> atau klik overlay / ESC
════════════════════════════════════════════════════════════════════ */
(function initModal() {
  let lastFocused = null;

  function openModal(name) {
    const modal = document.querySelector('.modal-overlay[data-modal="' + name + '"]');
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    // Trigger reflow agar transition jalan
    void modal.offsetHeight;
    modal.classList.add('is-open');
    // Focus ke tombol close untuk a11y
    const closeBtn = modal.querySelector('[data-modal-close]');
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    setTimeout(() => {
      modal.hidden = true;
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus({ preventScroll: true });
      }
    }, 220);
  }

  document.addEventListener('click', (e) => {
    // Trigger
    const trigger = e.target.closest('[data-modal-trigger]');
    if (trigger) {
      e.preventDefault();
      openModal(trigger.getAttribute('data-modal-trigger'));
      return;
    }
    // Close button
    const closeBtn = e.target.closest('[data-modal-close]');
    if (closeBtn) {
      e.preventDefault();
      closeModal(closeBtn.closest('.modal-overlay'));
      return;
    }
    // Click di overlay (di luar modal-box) → close
    if (e.target.classList.contains('modal-overlay')) {
      closeModal(e.target);
    }
  });

  // ESC key tutup modal yang sedang terbuka
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const openOne = document.querySelector('.modal-overlay.is-open');
    if (openOne) closeModal(openOne);
  });
})();

/* ════════════════════════════════════════════════════════════════════
   ══ MOBILE NAV BURGER — toggle off-canvas drawer di mobile          ══
   - Klik burger → toggle drawer + body scroll lock
   - Klik nav link → auto-close drawer (smooth navigation)
   - ESC key → close
   - Resize ke desktop → reset state
════════════════════════════════════════════════════════════════════ */
(function initMobileNav() {
  const burger = document.querySelector('.nav-burger');
  const navLinks = document.querySelector('.nav-links');
  if (!burger || !navLinks) return;

  function setOpen(isOpen) {
    burger.classList.toggle('is-open', isOpen);
    navLinks.classList.toggle('is-open', isOpen);
    document.body.classList.toggle('nav-drawer-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }

  burger.addEventListener('click', () => {
    setOpen(!burger.classList.contains('is-open'));
  });

  // Klik link di drawer → close (kecuali external link target=_blank)
  navLinks.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      // Tetap close walaupun external — user butuh visual confirmation
      setOpen(false);
    });
  });

  // ESC tutup drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger.classList.contains('is-open')) {
      setOpen(false);
    }
  });

  // Resize ke desktop → close + reset
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 768 && burger.classList.contains('is-open')) {
        setOpen(false);
      }
    }, 150);
  });
})();

/* ════════════════════════════════════════════════════════════════════
   ══ ELFSIGHT WIDGET LOADER — auto-inject platform.js               ══
   Kalau ada markup .elfsight-app-* di page (saat ini: translator
   widget di nav semua page), load platform.js sekali. Idempotent
   — aman kalau script sudah ada (mis. di-include manual di HTML).
════════════════════════════════════════════════════════════════════ */
(function initElfsightLoader() {
  const PLATFORM_URL = 'https://elfsightcdn.com/platform.js';

  function injectPlatform() {
    // Cek apakah ada widget markup di page
    const hasWidget = document.querySelector('[class*="elfsight-app-"]');
    if (!hasWidget) return;

    // Cek apakah script sudah ada (idempotent guard)
    const alreadyLoaded = Array.from(document.scripts).some(
      (s) => s.src && s.src.indexOf('elfsightcdn.com/platform.js') !== -1
    );
    if (alreadyLoaded) return;

    // Inject script async ke body
    const script = document.createElement('script');
    script.src = PLATFORM_URL;
    script.async = true;
    script.setAttribute('data-injected-by', 'toffin-script');
    document.body.appendChild(script);
  }

  // toffin-script.js di-load setelah </body> tapi sebelum DOMContentLoaded
  // di sebagian browser, jadi defensive: tunggu DOM ready kalau perlu.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectPlatform, { once: true });
  } else {
    injectPlatform();
  }
})();

/* Galeri Co-Creation dihapus untuk toffin.pk. */
