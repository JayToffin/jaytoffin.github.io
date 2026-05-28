/* Officine Allegra — Tweaks panel (vanilla, host-protocol compatible) */
(function () {
  'use strict';

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "temp": "bottega",
    "typo": "manifesto",
    "bottega": "on"
  }/*EDITMODE-END*/;

  const state = Object.assign({}, TWEAK_DEFAULTS);

  const panel = document.getElementById('tweaksPanel');
  const pill = document.getElementById('tweaksTogglePill');
  const closeBtn = document.getElementById('tweaksClose');
  const resetBtn = document.getElementById('tweaksReset');
  if (!panel || !pill) return;

  // ---- apply state to body
  function apply() {
    document.body.setAttribute('data-temp', state.temp);
    document.body.setAttribute('data-typo', state.typo);
    document.body.setAttribute('data-bottega', state.bottega);
    // sync segment buttons
    panel.querySelectorAll('.tweaks-segment').forEach((seg) => {
      const key = seg.dataset.tweak;
      seg.querySelectorAll('button').forEach((b) => {
        b.classList.toggle('is-active', b.dataset.value === state[key]);
      });
    });
  }

  // ---- persistence via host protocol
  function persist(edits) {
    try {
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
    } catch (e) { /* no-op */ }
  }

  // ---- segment clicks
  panel.querySelectorAll('.tweaks-segment').forEach((seg) => {
    const key = seg.dataset.tweak;
    seg.querySelectorAll('button').forEach((b) => {
      b.addEventListener('click', () => {
        const v = b.dataset.value;
        if (state[key] === v) return;
        state[key] = v;
        apply();
        persist({ [key]: v });
      });
    });
  });

  // ---- reset
  resetBtn && resetBtn.addEventListener('click', () => {
    Object.assign(state, TWEAK_DEFAULTS);
    apply();
    persist(TWEAK_DEFAULTS);
  });

  // ---- panel show/hide
  function showPanel() {
    panel.removeAttribute('hidden');
    panel.classList.add('is-open');
    pill.style.opacity = '0';
    pill.style.pointerEvents = 'none';
  }
  function hidePanel() {
    panel.classList.remove('is-open');
    panel.setAttribute('hidden', '');
    pill.style.opacity = '';
    pill.style.pointerEvents = '';
  }

  pill.addEventListener('click', showPanel);
  closeBtn && closeBtn.addEventListener('click', () => {
    hidePanel();
    try {
      window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
    } catch (e) {}
  });

  // ---- host protocol: register listener FIRST, then announce availability
  window.addEventListener('message', (ev) => {
    const d = ev.data;
    if (!d || typeof d !== 'object') return;
    if (d.type === '__activate_edit_mode') {
      pill.classList.add('is-shown');
      showPanel();
    } else if (d.type === '__deactivate_edit_mode') {
      hidePanel();
      pill.classList.remove('is-shown');
    }
  });

  // initial apply
  apply();

  try {
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
  } catch (e) {}
})();
