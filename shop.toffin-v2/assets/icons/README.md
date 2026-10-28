# Ikon Toffin v2

Satu library: **Tabler Icons** v3.48.0 (MIT, https://tabler.io/icons), gaya outline 24 px stroke 2 px,
dipakai sebagai SVG sprite, tanpa webfont dan tanpa Font Awesome (FA 5/6 bentrok dengan FA 4.7 bawaan Odoo 12).

- **Satu sumber untuk halaman: `assets/js/tf-icons.js`** (84 simbol; 2026-10-15 ditambah i-motorbike untuk lacak instan, i-service = kunci pas bersilang obeng (gambar ulang, konsep seperti Flaticon customer-support 1086581) untuk layanan servis/purna jual, i-scredit = dompet Service Credit berwarna asli, i-tpoint = koin Toffin Point berwarna asli — i-tpoint & i-scredit ikon berwarna, warnanya tetap walau di dalam elemen berwarna). Dipanggil tepat setelah `<body>`:
  `<script src="assets/js/tf-icons.js"></script>`; skrip menyisipkan `<svg id="tf-icons">` di awal body, jadi
  `<use href="#i-…">` di HTML maupun JS tetap bekerja. Sebelumnya sprite disalin inline di 27 halaman dengan 6 versi
  berbeda (subset + ikon tambahan per halaman); kini satu file ter-cache. JS dipakai karena `<use href="file.svg#id">`
  diblokir Chrome pada file://, sedangkan `<script src>` tidak. Di Odoo: sisipkan sprite sekali di `website.layout` (t-call).
- `tf-icons.svg` = salinan referensi isi yang sama (untuk dibuka/diedit di editor SVG).
- Pakai: `<svg class="tf-i" aria-hidden="true"><use href="#i-heart"/></svg>`; ukuran ikut `font-size` (1em), `tf-i--2x` = 2em.
  Gaya stroke/fill ada di `.tf-i` (tf-base.css), simbol hanya berisi path.
- Menambah ikon: unduh SVG outline dari tabler.io, buang `<path d="M0 0h24v24H0z"/>`, bungkus jadi
  `<symbol id="i-nama" viewBox="0 0 24 24">…</symbol>`, tambahkan ke daftar di `assets/js/tf-icons.js` dan ke `tf-icons.svg`
  (urut abjad). Jangan menyalin sprite ke halaman lagi.

Simbol yang ada (80):

- `i-adjustments-horizontal`
- `i-alert-circle`
- `i-arrow-right`
- `i-arrows-horizontal`
- `i-award`
- `i-ban`
- `i-bell`
- `i-bell-ringing`
- `i-bolt`
- `i-box`
- `i-brand-facebook`
- `i-brand-instagram`
- `i-brand-linkedin`
- `i-brand-whatsapp`
- `i-brand-x`
- `i-brand-youtube`
- `i-building-bank`
- `i-building-store`
- `i-calendar`
- `i-camera`
- `i-check`
- `i-chevron-down`
- `i-chevron-left`
- `i-chevron-right`
- `i-circle`
- `i-circle-check`
- `i-clipboard-list`
- `i-clock`
- `i-coins`
- `i-copy`
- `i-credit-card`
- `i-crown`
- `i-download`
- `i-eye`
- `i-eye-off`
- `i-file-invoice`
- `i-gift`
- `i-headset`
- `i-heart`
- `i-home`
- `i-hourglass-high`
- `i-id`
- `i-info-circle`
- `i-info-small`
- `i-layout-grid`
- `i-link`
- `i-lock`
- `i-login`
- `i-logout`
- `i-mail`
- `i-map-2`
- `i-map-pin`
- `i-minus`
- `i-note`
- `i-package`
- `i-percentage`
- `i-phone`
- `i-player-play`
- `i-plus`
- `i-rotate`
- `i-search`
- `i-settings-check`
- `i-share`
- `i-shield`
- `i-shield-check`
- `i-shield-half`
- `i-shopping-bag`
- `i-shopping-cart`
- `i-shopping-cart-x`
- `i-star`
- `i-tag`
- `i-ticket`
- `i-tools`
- `i-trash`
- `i-truck`
- `i-user`
- `i-user-circle`
- `i-user-plus`
- `i-wallet`
- `i-x`
