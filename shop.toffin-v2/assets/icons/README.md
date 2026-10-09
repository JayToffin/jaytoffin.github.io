# Ikon Toffin v2

Satu library: **Tabler Icons** v3.48.0 (MIT, https://tabler.io/icons), gaya outline 24 px stroke 2 px,
dipakai sebagai SVG sprite, tanpa webfont dan tanpa Font Awesome (FA 5/6 bentrok dengan FA 4.7 bawaan Odoo 12).

- `tf-icons.svg` = sprite lengkap (68 simbol; +share, link, player-play, brand-x untuk detail produk 2026-10-09). Blok yang sama disisipkan inline tepat setelah `<body>` di tiap halaman
  (blok `<svg id="tf-icons">`), karena `<use href="file.svg#id">` diblokir Chrome pada file://. Di Odoo, sisipkan sekali di
  `website.layout` lewat `t-call`.
- Pakai: `<svg class="tf-i" aria-hidden="true"><use href="#i-heart"/></svg>`; ukuran ikut `font-size` (1em), `tf-i--2x` = 2em.
  Gaya stroke/fill ada di `.tf-i` (tf-base.css), simbol hanya berisi path.
- Menambah ikon: unduh SVG outline dari tabler.io, buang `<path d="M0 0h24v24H0z"/>`, bungkus jadi
  `<symbol id="i-nama" viewBox="0 0 24 24">…</symbol>`, tambahkan ke sprite file dan ke blok inline di halaman.

Simbol yang ada:

- `i-adjustments-horizontal`
- `i-alert-circle`
- `i-arrow-right`
- `i-arrows-horizontal`
- `i-ban`
- `i-bolt`
- `i-brand-facebook`
- `i-brand-instagram`
- `i-brand-linkedin`
- `i-brand-whatsapp`
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
- `i-credit-card`
- `i-crown`
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
- `i-login`
- `i-logout`
- `i-mail`
- `i-map-2`
- `i-map-pin`
- `i-minus`
- `i-package`
- `i-percentage`
- `i-phone`
- `i-plus`
- `i-rotate`
- `i-search`
- `i-shield`
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
