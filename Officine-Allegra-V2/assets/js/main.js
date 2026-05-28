/* Officine Allegra — Homepage interactions (vanilla JS) */
(function () {
  'use strict';

  // ============ STICKY HEADER ============
  const header = document.querySelector('.site-header');
  let lastY = 0;
  function updateHeaderBottom() {
    if (!header) return;
    const r = header.getBoundingClientRect();
    document.documentElement.style.setProperty('--header-bottom', r.bottom + 'px');
  }
  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 20);
    updateHeaderBottom();
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateHeaderBottom);
  updateHeaderBottom();
  onScroll();

  // ============ MEGA MENU (hover desktop / click mobile) ============
  const navItems = document.querySelectorAll('.nav-item.has-mega');
  let activeTimer;
  navItems.forEach((item) => {
    const link = item.querySelector('.nav-link');
    item.addEventListener('mouseenter', () => {
      clearTimeout(activeTimer);
      navItems.forEach(i => i.classList.remove('is-active'));
      item.classList.add('is-active');
    });
    item.addEventListener('mouseleave', () => {
      activeTimer = setTimeout(() => {
        item.classList.remove('is-active');
      }, 120);
    });
    link.addEventListener('click', (e) => {
      if (window.matchMedia('(max-width: 1024px)').matches) {
        e.preventDefault();
        item.classList.toggle('is-active');
      }
    });
  });
  // Close mega when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item.has-mega')) {
      navItems.forEach(i => i.classList.remove('is-active'));
    }
  });

  // ============ MOBILE DRAWER ============
  const toggle = document.querySelector('.menu-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    if (toggle) toggle.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('is-open');
    if (toggle) toggle.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  if (toggle && drawer) {
    toggle.addEventListener('click', () => {
      if (drawer.classList.contains('is-open')) closeDrawer();
      else openDrawer();
    });
  }
  document.querySelectorAll('.mobile-drawer .nav-list > li > a').forEach((a) => {
    a.addEventListener('click', (e) => {
      const li = a.parentElement;
      if (li.querySelector('.submenu')) {
        e.preventDefault();
        li.classList.toggle('is-open');
      } else {
        closeDrawer();
      }
    });
  });
  document.querySelectorAll('.mobile-drawer .submenu a, .mobile-drawer .drawer-cta').forEach((a) => {
    a.addEventListener('click', () => closeDrawer());
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) closeDrawer();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && drawer && drawer.classList.contains('is-open')) closeDrawer();
  });

  // ============ COLOR FINISH PICKER ============
  document.querySelectorAll('.product-finishes').forEach((group) => {
    const finishes = group.querySelectorAll('.finish');
    const name = group.querySelector('.finish-name');
    const FINISH_NAMES = {
      artico: 'Artico — Pure White',
      notturno: 'Notturno — Deep Black',
      bronzo: 'Bronzo — Warm Bronze',
      navy: 'Navy — Midnight Blue',
      terracotta: 'Terracotta — Brand Orange'
    };
    finishes.forEach((f) => {
      f.addEventListener('click', () => {
        finishes.forEach(x => x.classList.remove('is-active'));
        f.classList.add('is-active');
        const k = f.dataset.finish;
        if (name) name.textContent = FINISH_NAMES[k] || k;
      });
    });
  });

  // ============ NOTIFY FORM ============
  document.querySelectorAll('.notify-form, .nl-form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      const btn = form.querySelector('button');
      if (!input.value) return;
      form.classList.add('is-success');
      input.value = '';
      input.placeholder = 'Thank you — we’ll be in touch';
      if (btn) btn.textContent = '✓ Subscribed';
      setTimeout(() => {
        form.classList.remove('is-success');
        input.placeholder = form.dataset.placeholder || 'your@email.com';
        if (btn) btn.textContent = btn.dataset.label || 'Notify me';
      }, 3500);
    });
    const btn = form.querySelector('button');
    if (btn && !btn.dataset.label) btn.dataset.label = btn.textContent.trim();
    const inp = form.querySelector('input');
    if (inp && !form.dataset.placeholder) form.dataset.placeholder = inp.placeholder;
  });

  // ============ REVEAL ON SCROLL ============
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
  }

})();

