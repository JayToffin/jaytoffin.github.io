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
  serviceId: 'service_x9y58zb', // EmailJS service Toffin Pakistan (toffinpakistan@gmail.com)
  templateId: 'template_piuwdiq', // template contact form Toffin Pakistan
  publicKey: 'KUZiLiY2TWosGWTJU', // Public Key akun EmailJS Toffin Pakistan
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
  if (document.querySelector('.brand-swiper')) {
    // Satu baris brand. loop:true => infinite mulus, maju SATU-SATU dari logo
    // terakhir ke logo pertama; tombol prev/next = navigation bawaan Swiper.
    new Swiper('.brand-swiper', {
      slidesPerView: 2,
      slidesPerGroup: 1,
      loop: true,
      spaceBetween: 12,
      autoplay: {
        delay: 2500,
        disableOnInteraction: false,
      },
      navigation: {
        prevEl: '.brand-swiper-prev',
        nextEl: '.brand-swiper-next',
      },
      breakpoints: {
        640: { slidesPerView: 3, spaceBetween: 12 },
        1024: { slidesPerView: 6, spaceBetween: 14 },
      },
    });
  }
});


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

/* Elfsight Translate dinonaktifkan untuk toffin.pk (hemat kuota views). */

/* Galeri Co-Creation dihapus untuk toffin.pk. */
