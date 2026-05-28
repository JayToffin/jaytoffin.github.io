/* ============================================================
   DINAMICA PRO PAGE · Officine Allegra
   Page-specific interactions
   (Reveal animations + mobile drawer handled by main.js)
   ============================================================ */
(function () {

  // ---------- Smooth scroll for in-page anchors ----------
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const href = link.getAttribute('href');
    if (href === '#' || href.length < 2) return;
    link.addEventListener('click', e => {
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ---------- Detail-image lightbox tap (mobile UX) ----------
  // On small screens, tapping a product image briefly highlights the crosshair frame
  // for a satisfying tactile feedback. Pure CSS via :active doesn't work on iOS without -webkit-tap-highlight tweaks.
  document.querySelectorAll('.dp-detail-image, .dp-duo-image').forEach(frame => {
    frame.addEventListener('click', () => {
      frame.classList.add('is-tapped');
      setTimeout(() => frame.classList.remove('is-tapped'), 320);
    });
  });

})();
