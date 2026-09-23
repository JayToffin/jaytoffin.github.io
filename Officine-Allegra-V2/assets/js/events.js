/* Officine Allegra — Events page (vanilla JS)
   Builds the year-grouped sidebar from every <article class="event-detail">
   on the page and switches the detail panel on click / hash.

   Each article needs:  id, data-year, data-title
   Optional:            data-date, data-venue, data-status="upcoming"
   The <aside id="eventsList"> may carry data-next-placeholder / data-next-sub
   to show a dimmed "to be announced" row while no upcoming event exists. */
(function () {
  'use strict';

  const list = document.getElementById('eventsList');
  const articles = Array.from(document.querySelectorAll('.event-detail'));
  if (!list || !articles.length) return;

  const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];
  const numeral = (i) => ROMAN[i] || String(i + 1);
  const byId = (id) => articles.find((a) => a.id === id);

  // ---- group by year, newest year first, DOM order inside a year ----
  const groups = new Map();
  articles.forEach((a) => {
    const y = a.dataset.year || '—';
    if (!groups.has(y)) groups.set(y, []);
    groups.get(y).push(a);
  });
  const years = Array.from(groups.keys()).sort((a, b) => Number(b) - Number(a));

  // ---- render sidebar ----
  let idx = 0;
  const frag = document.createDocumentFragment();
  years.forEach((y) => {
    const items = groups.get(y);
    const upcoming = items.some((a) => a.dataset.status === 'upcoming');

    const yEl = document.createElement('div');
    yEl.className = 'events-year';
    yEl.innerHTML = y + ' <small>— ' + (upcoming ? 'Next' : 'Archive') + '</small>';
    frag.appendChild(yEl);

    items.forEach((a) => {
      const item = document.createElement('a');
      item.className = 'event-item';
      item.href = '#' + a.id;
      item.dataset.target = a.id;
      const sub = [a.dataset.date, a.dataset.venue].filter(Boolean).join(' · ');
      item.innerHTML =
        '<span class="ix">' + numeral(idx++) + '.</span>' +
        '<div><span class="ttl"></span><span class="sub"></span></div>';
      item.querySelector('.ttl').textContent = a.dataset.title || a.id;
      item.querySelector('.sub').textContent = sub;
      item.addEventListener('click', (e) => {
        e.preventDefault();
        select(a.id, true);
      });
      frag.appendChild(item);
    });
  });

  // ---- "to be announced" row while nothing is upcoming ----
  const hasUpcoming = articles.some((a) => a.dataset.status === 'upcoming');
  if (!hasUpcoming && list.dataset.nextPlaceholder) {
    const latest = Math.max(...years.map(Number).filter(Number.isFinite));
    const nextYear = Number.isFinite(latest) ? String(latest + 1) : '';
    const yEl = document.createElement('div');
    yEl.className = 'events-year events-year--next';
    yEl.innerHTML = nextYear + ' <small>— Next</small>';
    const soon = document.createElement('div');
    soon.className = 'event-item event-item--soon';
    soon.innerHTML =
      '<span class="ix">' + numeral(idx) + '.</span>' +
      '<div><span class="ttl"></span><span class="sub"></span></div>';
    soon.querySelector('.ttl').textContent = list.dataset.nextPlaceholder;
    soon.querySelector('.sub').textContent = list.dataset.nextSub || '';
    frag.appendChild(yEl);
    frag.appendChild(soon);
  }
  list.appendChild(frag);

  // ---- switching ----
  function select(id, fromUser) {
    const target = byId(id);
    if (!target) return;
    articles.forEach((a) => {
      const on = a === target;
      a.hidden = !on;
      if (on) a.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    });
    list.querySelectorAll('.event-item').forEach((el) => {
      el.classList.toggle('is-active', el.dataset.target === id);
    });
    if (fromUser) {
      if (history.replaceState) history.replaceState(null, '', '#' + id);
      if (window.matchMedia('(max-width: 1024px)').matches) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  function fromHash() {
    const id = decodeURIComponent(location.hash.replace(/^#/, ''));
    return byId(id) ? id : null;
  }

  // default: first event of the newest year (or the one named in the URL hash)
  select(fromHash() || groups.get(years[0])[0].id, false);
  window.addEventListener('hashchange', () => {
    const id = fromHash();
    if (id) select(id, false);
  });
})();
