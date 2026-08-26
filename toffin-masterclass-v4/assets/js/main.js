// ===== Toffin Masterclass 4.0 =====

// Navbar: solid saat scroll + progress bar posisi halaman
const navbar = document.getElementById('navbar');
const navProgress = document.getElementById('navProgress');
const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    navProgress.style.transform = 'scaleX(' + Math.min(window.scrollY / Math.max(maxScroll(), 1), 1) + ')';
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu (overlay fullscreen)
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const setMenu = open => {
    navToggle.classList.toggle('open', open);
    navLinks.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (typeof lenis !== 'undefined' && lenis) open ? lenis.stop() : lenis.start();
};
navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

// ===== Smooth scroll (Lenis) =====
// Library yang sama dengan situs-situs awwwards — inertia halus dengan respons tetap enak.
// Hanya aktif di desktop pointer halus; touch & reduced-motion tetap native.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;
let lenis = null;
if (finePointer && !reducedMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    const rafLenis = t => { lenis.raf(t); requestAnimationFrame(rafLenis); };
    requestAnimationFrame(rafLenis);
}
// Glide ala awwwards: mulai lembut → meluncur cepat → mendarat sangat halus,
// bisa diinterupsi oleh scroll user, dengan efek pendaratan di judul section.
const easeInOutExpo = t =>
    t === 0 ? 0 : t === 1 ? 1 :
    t < .5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
const animateScrollTo = (targetY, onDone) => {
    targetY = Math.max(0, Math.min(maxScroll(), targetY));
    if (reducedMotion) { window.scrollTo(0, targetY); if (onDone) onDone(); return; }
    const startY = window.scrollY;
    const dist = targetY - startY;
    if (Math.abs(dist) < 2) { if (onDone) onDone(); return; }
    const duration = 700 + Math.min(900, Math.abs(dist) * 0.09);
    const start = performance.now();
    const html = document.documentElement;
    let cancelled = false;
    const cleanup = () => {
        html.style.scrollBehavior = '';
        html.classList.remove('is-gliding');
        window.removeEventListener('wheel', interrupt);
        window.removeEventListener('touchstart', interrupt);
    };
    const interrupt = () => { cancelled = true; cleanup(); }; // user mengambil alih
    html.style.scrollBehavior = 'auto';
    html.classList.add('is-gliding');
    window.addEventListener('wheel', interrupt, { passive: true });
    window.addEventListener('touchstart', interrupt, { passive: true });
    const step = now => {
        if (cancelled) return;
        const p = Math.min((now - start) / duration, 1);
        window.scrollTo(0, startY + dist * easeInOutExpo(p));
        if (p < 1) { requestAnimationFrame(step); return; }
        cleanup();
        if (onDone) onDone();
    };
    requestAnimationFrame(step);
};
const landingSweep = target => {
    // efek pendaratan: sapuan garis oranye di judul section tujuan
    const title = target.querySelector('.section-title');
    if (!title) return;
    title.classList.remove('landed');
    void title.offsetWidth; // restart animasi
    title.classList.add('landed');
    setTimeout(() => title.classList.remove('landed'), 1500);
};
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const target = document.getElementById(a.getAttribute('href').slice(1));
        if (!target) return;
        e.preventDefault();
        history.replaceState(null, '', a.getAttribute('href'));
        const targetY = target.getBoundingClientRect().top + window.scrollY - 24;
        const html = document.documentElement;
        html.classList.add('is-gliding');
        const finish = () => { html.classList.remove('is-gliding'); landingSweep(target); };
        if (lenis) {
            lenis.scrollTo(targetY, { duration: 1.35, easing: easeInOutExpo, onComplete: finish });
            setTimeout(() => html.classList.remove('is-gliding'), 1600); // jaga-jaga bila diinterupsi
        } else {
            animateScrollTo(targetY, finish);
        }
    });
});

// Nav pill: indikator meluncur (hover) + scrollspy (section aktif)
const navPill = document.getElementById('navPill');
const navIndicator = document.getElementById('navIndicator');
const pillLinks = [...navPill.querySelectorAll('a')];
let activeLink = null;
const moveIndicator = el => {
    navIndicator.style.left = el.offsetLeft + 'px';
    navIndicator.style.width = el.offsetWidth + 'px';
    navIndicator.classList.add('visible');
};
const restIndicator = () => {
    if (activeLink) moveIndicator(activeLink);
    else navIndicator.classList.remove('visible');
};
pillLinks.forEach(a => a.addEventListener('mouseenter', () => moveIndicator(a)));
navPill.addEventListener('mouseleave', restIndicator);
window.addEventListener('resize', restIndicator);

const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
        if (!en.isIntersecting) return;
        const link = pillLinks.find(a => a.getAttribute('href') === '#' + en.target.id) || null;
        pillLinks.forEach(a => a.classList.remove('active'));
        activeLink = link;
        if (link) link.classList.add('active');
        restIndicator();
    });
}, { rootMargin: '-45% 0px -50% 0px' });
['home', 'konsep', 'jadwal', 'mentor', 'venue', 'tiket'].forEach(id => {
    const s = document.getElementById(id);
    if (s) spy.observe(s);
});

// Reveal on scroll
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Animasi counter statistik
const animateCount = el => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const start = performance.now();
    const tick = now => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString('id-ID');
        if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
};
const statObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCount(entry.target);
            statObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.6 });
document.querySelectorAll('.stat-num').forEach(el => statObserver.observe(el));

// Countdown dinamis — otomatis mengarah ke kota terdekat yang belum berlangsung.
// Target = jam mulai kelas pagi (10.00 waktu setempat; Bali WITA).
const cities = [
    { name: 'Semarang', label: 'Selasa, 22 September 2026', start: '2026-09-22T10:00:00+07:00' },
    { name: 'Bali', label: 'Rabu, 30 September 2026', start: '2026-09-30T10:00:00+08:00' },
    { name: 'Surabaya', label: 'Senin, 5 Oktober 2026', start: '2026-10-05T10:00:00+07:00' },
    { name: 'Bogor', label: 'Senin, 12 Oktober 2026', start: '2026-10-12T10:00:00+07:00' }
].map(c => ({ ...c, time: new Date(c.start).getTime() }));

const pad = n => String(n).padStart(2, '0');
const cd = {
    label: document.getElementById('countdownLabel'),
    days: document.getElementById('cdDays'),
    hours: document.getElementById('cdHours'),
    mins: document.getElementById('cdMins'),
    secs: document.getElementById('cdSecs')
};
const updateCountdown = () => {
    const now = Date.now();
    const idx = cities.findIndex(c => c.time > now);
    if (idx === -1) {
        cd.label.textContent = 'Toffin Masterclass 4.0 telah selesai — sampai jumpa di edisi berikutnya!';
        cd.days.textContent = cd.hours.textContent = cd.mins.textContent = cd.secs.textContent = '00';
        return;
    }
    const city = cities[idx];
    cd.label.textContent = (idx === 0 ? 'Kota pertama — ' : 'Kota berikutnya — ') +
        city.name + ', ' + city.label;
    const diff = city.time - now;
    cd.days.textContent = pad(Math.floor(diff / 86400000));
    cd.hours.textContent = pad(Math.floor(diff / 3600000) % 24);
    cd.mins.textContent = pad(Math.floor(diff / 60000) % 60);
    cd.secs.textContent = pad(Math.floor(diff / 1000) % 60);
};
updateCountdown();
setInterval(updateCountdown, 1000);

// Galeri Co-Creation: auto-scroll + free drag (mouse/sentuh) dengan momentum
const galMarquee = document.querySelector('.gallery-marquee');
const galTrack = document.querySelector('.gallery-track');
if (galMarquee && galTrack) {
    const AUTO = reducedMotion ? 0 : 0.6; // px per frame saat idle
    let offset = 0, velocity = 0, dragging = false, hovering = false, lastX = 0, lastT = 0;
    const apply = () => { galTrack.style.transform = 'translateX(' + (-offset) + 'px)'; };
    const wrap = () => {
        const half = galTrack.scrollWidth / 2; // konten diduplikasi 2× untuk loop tak berujung
        if (half > 0) offset = ((offset % half) + half) % half;
    };
    const loop = () => {
        if (!dragging) {
            if (Math.abs(velocity) > 0.1) { offset += velocity; velocity *= 0.95; } // momentum
            else if (!hovering) offset += AUTO;
        }
        wrap();
        apply();
        requestAnimationFrame(loop);
    };
    galMarquee.addEventListener('mouseenter', () => { hovering = true; });
    galMarquee.addEventListener('mouseleave', () => { hovering = false; });
    galMarquee.addEventListener('pointerdown', e => {
        dragging = true;
        velocity = 0;
        lastX = e.clientX;
        lastT = performance.now();
        galMarquee.setPointerCapture(e.pointerId);
        galMarquee.classList.add('dragging');
    });
    galMarquee.addEventListener('pointermove', e => {
        if (!dragging) return;
        const now = performance.now();
        const dx = e.clientX - lastX;
        offset -= dx;
        velocity = -dx / Math.max(now - lastT, 1) * 16; // konversi ke px/frame
        lastX = e.clientX;
        lastT = now;
        wrap();
        apply();
    });
    const endDrag = () => {
        dragging = false;
        galMarquee.classList.remove('dragging');
    };
    galMarquee.addEventListener('pointerup', endDrag);
    galMarquee.addEventListener('pointercancel', endDrag);
    requestAnimationFrame(loop);
}

// Beli tiket: mobile view → redirect ke store sesuai device; desktop view → popup QR untuk di-scan
const qrModal = document.getElementById('qrModal');
const buyBtn = document.getElementById('buyTicketBtn');
const STORE_LINKS = {
    android: 'https://play.google.com/store/apps/details?id=id.toffin.app',
    ios: 'https://apps.apple.com/id/app/toffin-app/id6449521024',
    fallback: 'https://qrco.de/bdBvQn' // dynamic link (sama dengan isi QR)
};
// Deteksi perangkat mobile ASLI (bukan dari lebar jendela — Mac/PC jendela sempit tetap desktop)
const getMobileOS = () => {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'android';
    // iPhone/iPad/iPod; iPadOS 13+ menyamar sebagai "Macintosh" → bedakan lewat layar sentuh
    if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1))
        return 'ios';
    return null;
};

const openQr = () => {
    qrModal.hidden = false;
    requestAnimationFrame(() => qrModal.classList.add('open'));
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
};
const closeQr = () => {
    qrModal.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { qrModal.hidden = true; }, 300);
    if (lenis) lenis.start();
};

buyBtn.addEventListener('click', e => {
    e.preventDefault();
    const os = getMobileOS();
    if (os) {
        window.location.href = STORE_LINKS[os]; // Android → Play Store, iOS → App Store
        return;
    }
    openQr(); // desktop (termasuk Mac): tampilkan QR untuk di-scan
});
qrModal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeQr));
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !qrModal.hidden) closeQr();
});

// ===== Parallax gambar berbasis scroll (ala data-parallax-gallery Umano) =====
const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
if (parallaxEls.length && !reducedMotion) {
    const updateParallax = () => {
        const vh = window.innerHeight;
        parallaxEls.forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.bottom < 0 || r.top > vh) return;
            const speed = parseFloat(el.dataset.parallax) || 0.1;
            const centerDelta = (r.top + r.height / 2) - vh / 2;
            el.style.transform = 'translateY(' + (-centerDelta * speed).toFixed(1) + 'px) scale(1.14)';
        });
    };
    window.addEventListener('scroll', () => requestAnimationFrame(updateParallax), { passive: true });
    window.addEventListener('resize', updateParallax);
    updateParallax();
}

// ===== Hero: tilt paralaks mengikuti kursor =====
const heroSection = document.querySelector('.hero');
const heroWrap = document.querySelector('.hero-img-wrap');
if (heroSection && heroWrap && finePointer && !reducedMotion) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    heroSection.addEventListener('mousemove', e => {
        const r = heroSection.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - .5) * -24;
        ty = ((e.clientY - r.top) / r.height - .5) * -16;
    }, { passive: true });
    heroSection.addEventListener('mouseleave', () => { tx = ty = 0; });
    const tiltLoop = () => {
        cx += (tx - cx) * 0.06;
        cy += (ty - cy) * 0.06;
        heroWrap.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px,0)';
        requestAnimationFrame(tiltLoop);
    };
    requestAnimationFrame(tiltLoop);
}
