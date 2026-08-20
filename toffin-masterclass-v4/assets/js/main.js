// ===== Toffin Masterclass 4.0 =====

// Navbar: solid saat scroll
const navbar = document.getElementById('navbar');
const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navLinks.classList.remove('open');
    })
);

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
    { name: 'Palembang', label: 'Kamis, 8 Oktober 2026', start: '2026-10-08T10:00:00+07:00' },
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
