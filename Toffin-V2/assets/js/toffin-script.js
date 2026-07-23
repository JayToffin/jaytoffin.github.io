/* ============================================
   TOFFIN.ID — Main Vanilla JS Script
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
    let currentLang = localStorage.getItem('toffin-lang') || 'id';
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
  id: {
    'hero-label': 'Mitra HORECA Terpercaya sejak 2007',
    'hero-h1': 'Satu Mitra untuk Semua<br/>Kebutuhan <em>Kafe & Restoran</em> Anda',
    'hero-sub': 'Dari mesin espresso kelas dunia hingga bahan baku berkualitas tinggi — Toffin menyediakan semua yang dibutuhkan bisnis F&B Anda untuk beroperasi di level terbaik, setiap hari.',
    'hero-cta1': 'Lihat Katalog Produk', 'hero-cta2': 'Toffin App',
    'nav-home': 'Beranda', 'nav-about': 'Tentang', 'nav-products': 'Produk',
    'nav-support': 'Support', 'nav-app': 'Toffin App', 'nav-contact': 'Kontak'
  },
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
// Indonesian mobile: +62xxx, 62xxx, 0xxx, atau 8xxx (mobile prefix 8).
// Toleransi spasi/dash/paren di input — di-strip dulu sebelum cek pattern.
function isValidIDPhone(value) {
  const cleaned = String(value || '').replace(/[\s\-()]/g, '');
  return /^(\+62|62|0)?8\d{7,12}$/.test(cleaned);
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
  if (!phone || !phone.value.trim()) fail('phone', 'No. telepon wajib diisi.');
  else if (!isValidIDPhone(phone.value)) fail('phone');
  if (!email || !email.value.trim()) fail('reply_to', 'Email wajib diisi.');
  else if (!isValidEmail(email.value)) fail('reply_to');
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
      errorMsgEl.textContent = 'Layanan email belum siap. Refresh halaman atau hubungi kami via WhatsApp.';
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
        const status = err && err.status ? ` (kode ${err.status})` : '';
        errorMsgEl.textContent =
          'Silakan coba lagi atau hubungi kami via WhatsApp' + status + '.';
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
        <p>Scan QR code di bawah ini menggunakan kamera smartphone Anda.</p>
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
  { name: 'Toffin Jakarta',      address: 'Jl. Pluit Permai No.4, RT.1/RW.7, Pluit, Kec. Penjaringan, Kota Jakarta Utara, DKI Jakarta 14450', lat: -6.115727592238671, lng: 106.7864420677443, phone: '+62 21 6669-0166' },
  { name: 'Toffin Bogor',        address: 'Jl. Villa Duta Raya Jl. Permata No.42, RT.09/RW.14, Baranangsiang, Kec. Bogor Tim., Kota Bogor, Jawa Barat 16143', lat: -6.605390335419985, lng: 106.8177477995421, phone: '+62 811-849-567' },
  { name: 'Toffin Bandung',      address: 'Jl. Pajajaran No.68C, Pamoyanan, Kec. Cicendo, Kota Bandung, Jawa Barat 40173', lat: -6.906186599558803, lng: 107.59635610491048, phone: '+62 891-2260-056' },
  { name: 'Toffin Cirebon',      address: 'Jl. Veteran No. 43, Kejaksan, Cirebon, Jawa Barat 45123', lat: -6.709789543528458, lng: 108.56093497028672, phone: '+62 813-9522-7589' },
  { name: 'Toffin Semarang',     address: 'Jl. Papandayan No.28, Gajahmungkur, Kec. Gajahmungkur, Kota Semarang, Jawa Tengah 50232', lat: -7.012752913433678, lng: 110.40540084575913, phone: '+62 812-1551-2097' },
  { name: 'Toffin Jogja',        address: 'Jl. Kranji No.16, Wonorejo, Sariharjo, Kec. Ngaglik, Kabupaten Sleman, DI Yogyakarta 55581', lat: -7.732913026323054, lng: 110.3831690702546, phone: '+62 812-4612-3366' },
  { name: 'Toffin Surabaya',     address: 'Jl. Tanjung Anom No.16, Genteng, Kec. Genteng, Surabaya, Jawa Timur 60275', lat: -7.257295006971162, lng: 112.73667129652691, phone: '+62 31 532-3453' },
  { name: 'Toffin Malang',       address: 'Ruko Green Sulfat Residence No 5, Jl. Simpang LA Sucipto, Kel. Pandanwangi, Kec. Blimbing, Kota Malang, Jawa Timur', lat: -7.956293206664148, lng: 112.65673714662576, phone: '+62 851-6102-1600' },
  { name: 'Toffin Bali',         address: 'Jl. Mudu Taki 99, Gatsu Barat, Bali', lat: -8.636510814818966, lng: 115.18234399660805, phone: '+62 361 907-9364' },
  { name: 'Toffin NTB',          address: 'Jl. Pejanggik No 47 C, Lingkungan Pajang Barat, Mataram, Nusa Tenggara Barat', lat: -8.584183090935, lng: 116.11375124972982, phone: '+62 822-3306-9962' },
  { name: 'Toffin Medan',        address: 'Jl. Pemuda No.24A, Medan, Sumatera Utara', lat: 3.581727505281227, lng: 98.68221635420402, phone: '+62 853-7077-7171' },
  { name: 'Toffin Pekanbaru',    address: 'Jl. Tuanku Tambusai / Nangka, Komp. Ruko Atria Nangka Blok A3, Pekanbaru, Riau', lat: 0.500212799643461, lng: 101.4125569677015, phone: '+62 811-6909-994' },
  { name: 'Toffin Batam',        address: 'Komp. Ruko Orchard Walk I Blok D No.19, Kel. Berlian, Kec. Batam, Kepulauan Riau 29464', lat: 1.1147794693285376, lng: 104.06559391049325, phone: '+62 853-6253-6655' },
  { name: 'Toffin Palembang',    address: 'Jl. Radial No.18 Ruko Transmart 29B, Palembang, Sumatera Selatan 30134', lat: -2.9873398240530844, lng: 104.7539930288222, phone: '+62 821-6855-1313' },
  { name: 'Toffin Lampung',      address: 'Jl. Rasuna Said No.28 (Samping Gg. Perkutut), Kel. Pengajaran, Kec. Teluk Betung Utara, Bandar Lampung 35215', lat: -5.429675692573548, lng: 105.25590046773782, phone: '+62 721 560-3083' },
  { name: 'Toffin Pontianak',    address: 'Depan Kantor KPU, Jl. Johar (Gedung Hitam) No.8 8A, Darat Sekip, Kec. Pontianak Kota, Kalimantan Barat 78117', lat: -0.02658883373979566, lng: 109.33142252883583, phone: '+62 852-4566-6866' },
  { name: 'Toffin Banjarmasin',  address: 'Jl. Ahmad Yani km 8,4 No Rukan 34A, Perumahan Persada Mas Estate, Kab. Banjar, Banjarmasin, Kalimantan Selatan', lat: -3.3655126363241186, lng: 114.63536445257856, phone: '+62 811-5022-017' },
  { name: 'Toffin Samarinda',    address: 'Jl. DI Panjaitan RT 07, Kel. Sungai Dalam, Kec. Sungai Pinang, Kota Samarinda, Kalimantan Timur', lat: -0.4677217287803714, lng: 117.17206009654065, phone: '+62 541 208-3517' },
  { name: 'Toffin Makassar',     address: 'Jl. DR. Ratulangi No.121, Bonto Lebang, Kec. Mamajang, Kota Makassar, Sulawesi Selatan 90133', lat: -5.164973859150786, lng: 119.41901976619326, phone: '+62 822-4001-0009' },
];

// Dipanggil otomatis oleh script tag callback=initToffinMap
function initToffinMap() {
  const mapEl = document.querySelector('[data-toffin-map]');
  if (!mapEl || !window.google || !window.google.maps) return;

  const map = new google.maps.Map(mapEl, {
    center: { lat: -2.5, lng: 117.5 },  // Pusat geografis Indonesia
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
          <span class="map-popup-eyebrow">Cabang Toffin</span>
          <h5 class="map-popup-title">${shortName}</h5>
          <p class="map-popup-addr">${branch.address}</p>
          <div class="map-popup-actions">
            <a href="tel:${telHref}" class="map-popup-link map-popup-link--ghost">${ICON_PHONE}<span>Telepon</span></a>
            <a href="${dirUrl}" target="_blank" rel="noopener" class="map-popup-link map-popup-link--primary">${ICON_DIR}<span>Petunjuk Arah</span></a>
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

/* ════════════════════════════════════════════════════════════════════
   ══ INSIGHT FEED — WordPress REST API integration                  ══
   Fetch 3 artikel terbaru dari insight.toffin.id dan render ke
   .insight-grid. Kalau fetch gagal (offline / CORS / WP down),
   static fallback cards tetap tampil (tidak di-replace).
════════════════════════════════════════════════════════════════════ */
(function initInsightFeed() {
  const grid = document.querySelector('.insight-grid[data-insight-feed]');
  if (!grid) return;

  const endpoint = grid.getAttribute('data-insight-endpoint')
    || 'https://insight.toffin.id/wp-json/wp/v2/posts?_embed&per_page=3';

  const MONTHS_ID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    return (tmp.textContent || tmp.innerText || '').trim();
  };

  const truncate = (text, max) => {
    if (!text || text.length <= max) return text || '';
    return text.slice(0, max).replace(/\s+\S*$/, '') + '…';
  };

  const escapeAttr = (str) => String(str || '').replace(/"/g, '&quot;');

  const formatDateId = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return `${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
  };

  const estimateReadMin = (html) => {
    const text = stripHtml(html);
    const words = text ? text.split(/\s+/).length : 0;
    return Math.max(1, Math.round(words / 200));
  };

  const getFeaturedImg = (post) => {
    const media = post._embedded && post._embedded['wp:featuredmedia'];
    if (!media || !media[0]) return null;
    // Prefer medium_large size kalau ada (lebih ringan), fallback ke full source_url
    const sizes = media[0].media_details && media[0].media_details.sizes;
    if (sizes && sizes.medium_large && sizes.medium_large.source_url) {
      return sizes.medium_large.source_url;
    }
    return media[0].source_url || null;
  };

  const getCategory = (post) => {
    const terms = post._embedded && post._embedded['wp:term'];
    if (!Array.isArray(terms)) return '';
    for (const group of terms) {
      if (Array.isArray(group) && group[0] && group[0].taxonomy === 'category') {
        return group[0].name;
      }
    }
    return '';
  };

  const renderCard = (post) => {
    const title = stripHtml(post.title && post.title.rendered);
    const excerpt = truncate(stripHtml(post.excerpt && post.excerpt.rendered), 110);
    const img = getFeaturedImg(post);
    const cat = getCategory(post) || 'Insight';
    const min = estimateReadMin(
      (post.content && post.content.rendered) || (post.excerpt && post.excerpt.rendered)
    );
    const date = formatDateId(post.date);

    return `
      <a href="${escapeAttr(post.link)}" target="_blank" rel="noopener" class="insight-card">
        ${img ? `<div class="insight-img"><img src="${escapeAttr(img)}" alt="${escapeAttr(title)}" loading="lazy" /></div>` : ''}
        <div class="insight-body">
          <div class="insight-cat">${cat}</div>
          <h4>${title}</h4>
          <p>${excerpt}</p>
          <div class="insight-meta">${min} min baca · ${date}</div>
        </div>
      </a>
    `;
  };

  // Skeleton placeholder selama fetch in-flight
  const renderSkeleton = () => `
    ${[1, 2, 3].map(() => `
      <div class="insight-card is-skeleton">
        <div class="insight-img"></div>
        <div class="insight-body">
          <div class="sk sk-line w-30"></div>
          <div class="sk sk-line w-90"></div>
          <div class="sk sk-line w-70"></div>
          <div class="sk sk-line w-100" style="margin-top:0.5rem;"></div>
          <div class="sk sk-line w-40" style="margin-top:auto;"></div>
        </div>
      </div>
    `).join('')}
  `;

  // Simpan static fallback dulu, baru replace dengan skeleton
  const fallbackHtml = grid.innerHTML;
  grid.innerHTML = renderSkeleton();

  fetch(endpoint, { headers: { Accept: 'application/json' } })
    .then((res) => {
      if (!res.ok) throw new Error('WP fetch failed: ' + res.status);
      return res.json();
    })
    .then((posts) => {
      if (!Array.isArray(posts) || posts.length === 0) {
        // Tidak ada artikel — restore static fallback
        grid.innerHTML = fallbackHtml;
        return;
      }
      grid.innerHTML = posts.map(renderCard).join('');
    })
    .catch((err) => {
      // Network / CORS / WP down — restore static fallback supaya section tidak kosong
      console.warn('[Insight] Falling back to static cards:', err.message);
      grid.innerHTML = fallbackHtml;
    });
})();

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
    burger.setAttribute('aria-label', isOpen ? 'Tutup menu' : 'Buka menu');
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

/* ════════════════════════════════════════════════════════════════════
   ══ CO-CREATION PAGE — image slider per card + filter + reveal      ══
   Hanya jalan di co-creation.html (guard: cek .cc-grid). Butuh Swiper
   (di-load via CDN di page). Tiap card punya slider gambar sendiri,
   filter chip menyaring card by data-category, dan card muncul dengan
   reveal saat masuk viewport.
════════════════════════════════════════════════════════════════════ */
(function initCoCreation() {
  const grid = document.querySelector('.cc-grid');
  if (!grid) return;

  const start = () => {
    // 1. Init slider gambar tiap card. Pagination el di-scope per container
    //    (di-pass sebagai node, bukan selector string yang global).
    if (typeof window.Swiper !== 'undefined') {
      document.querySelectorAll('.cc-swiper').forEach((el) => {
        new Swiper(el, {
          loop: true,
          slidesPerView: 1,
          grabCursor: true,
          pagination: {
            el: el.querySelector('.swiper-pagination'),
            clickable: true,
          },
        });
      });
    }

    // 2. Filter by ingredient category
    const buttons = document.querySelectorAll('.cc-filter-btn');
    const cards = Array.from(grid.querySelectorAll('.cc-card'));
    const emptyEl = document.getElementById('ccEmpty');

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        let visible = 0;
        cards.forEach((card) => {
          const match = filter === 'all' || card.getAttribute('data-category') === filter;
          card.classList.toggle('is-hidden', !match);
          if (match) visible++;
        });
        if (emptyEl) emptyEl.classList.toggle('show', visible === 0);
      });
    });

    // 3. Scroll reveal (progressive enhancement — fallback: langsung tampil)
    const revealCards = document.querySelectorAll('.cc-card.reveal');
    if ('IntersectionObserver' in window && revealCards.length) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      revealCards.forEach((c) => io.observe(c));
    } else {
      revealCards.forEach((c) => c.classList.add('is-visible'));
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
