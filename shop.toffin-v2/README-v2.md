# Static E-Commerce · v2

Dipisahkan dari `static-e-commerce` pada 29 September 2026.
Folder ini adalah salinan penuh, lalu halaman hasil redesign dinaikkan ke nama file final.

## Halaman yang sudah versi baru

| File | Stylesheet | Catatan |
| --- | --- | --- |
| `index.html` | `assets/css/tf-base.css` + `tf-layout.css` + `tf-products.css` + `home-modern.css` | sebelumnya `index-new.html`. Header, nav, sheet mobile, chat, bottom nav, dan footer sudah mandiri (`tf-layout.css` + `tf-nav.js`). CSS lama sudah nol: memuat `css/bootstrap.min.css` (4.1.3 murni, tiruan bundle Odoo 12) + `tf-base` / `tf-layout` / `tf-products` / `home-modern`, serta jQuery + Bootstrap JS untuk dua modal. Rincian di `MIGRASI.md` |
| `my-account.html` | `tf-base` + `tf-layout` + `tf-products` + `assets/css/my-account.css` | sebelumnya `my-account-new.html`. Chrome v2 penuh; CSS tema lama nol; jQuery + Bootstrap JS + datepicker tetap untuk tab, 11 modal, dan tanggal |
| `product-list.html` | `tf-base` + `tf-layout` + `tf-products` + `assets/css/product-list.css` + Swiper 11 (CDN) + `assets/js/tf-plp.js` | ditulis ulang 2026-09-30: sidebar filter (drawer di ponsel), urutkan, chip filter aktif, grid 5/4/3/2 kolom memakai kartu produk homepage (`.product` + `.fs-*`), 20 kartu tampil dulu, sisanya auto-load per 20 saat digulir (IntersectionObserver + cadangan scroll, skeleton). Katalog contoh 60 produk di `tf-plp.js`; tanpa jQuery; 2026-10-02: judul kartu satu baris + "…", tombol Add to cart tidak bold, foto kartu bisa digeser (slider `.tf-pg` seperti homepage, dot pagination lebih kecil) |
| `product-bundle.html` | `tf-base` + `tf-layout` + `tf-products` + `assets/css/product-bundle.css` + Swiper 11 (CDN) + `assets/js/tf-bundle.js` | ditulis ulang 2026-10-01: konten sama dengan halaman lama (tiga paket Home/Cafe/Office, ikon + Promo Bundling + Harga paket + Add to cart, hint geser, modal Pilih varian produk), tata letak baru: ringkasan terpusat di kiri, isi paket slider Swiper di kanan memakai kartu produk homepage apa adanya, chip navigasi sticky, modal Bootstrap 4/Fusion diisi dari paket yang diklik |
| `cart.html` | `tf-base` + `tf-layout` + `tf-products` + `assets/css/cart.css` + `assets/js/tf-cart.js` | didesain ulang 2026-10-02: daftar per distributor (checkbox, paket bundling dengan isi paket, bonus gratis, barang tidak tersedia, diskon) + ringkasan belanja sticky (bar sticky di ponsel), semua total dihitung `tf-cart.js`; CTA ke `checkout.html` |
| `faq.html` | `tf-base` + `tf-layout` + `assets/css/info-page.css` | chrome v2 penuh, tanpa jQuery; CSS tema lama nol |
| `informasi-pengiriman.html` | `tf-base` + `tf-layout` + `assets/css/info-page.css` | chrome v2 penuh, tanpa jQuery; CSS tema lama nol |
| `kebijakan-privasi.html` | `tf-base` + `tf-layout` + `assets/css/info-page.css` | chrome v2 penuh, tanpa jQuery; CSS tema lama nol |
| `pembatalan-transaksi.html` | `tf-base` + `tf-layout` + `assets/css/info-page.css` | chrome v2 penuh, tanpa jQuery; CSS tema lama nol |
| `syarat-dan-ketentuan.html` | `tf-base` + `tf-layout` + `assets/css/info-page.css` | chrome v2 penuh, tanpa jQuery; CSS tema lama nol |

Gambar baru untuk hero di homepage:
`images/hero-black-sesame-base.jpg`, `images/hero-dinamica-pro.jpg`, `images/hero-eureka-zeus.jpg`

## Struktur aset v2

```
assets/css/tf-base.css      token, .tf-container, .tf-btn; dimuat pertama di setiap halaman
assets/css/tf-layout.css    chrome bersama (header … footer) + desain default semua .modal (Fusion)
demo/modal.html             halaman referensi: lima varian modal desain default, boleh dihapus
assets/css/tf-products.css  KARTU PRODUK GLOBAL (.product + .fs-*, varian .tf-cards--flash / .tf-cards--compact), galeri .tf-pg, ikon favorit, label diskon, countdown
assets/css/home-modern.css  khusus homepage
assets/css/product-list.css tata letak halaman daftar produk (filter, toolbar, grid, skeleton, drawer)
assets/js/tf-plp.js         daftar produk: katalog contoh, filter, urutkan, auto-load, drawer
assets/css/product-bundle.css tata letak halaman paket bundling
assets/css/cart.css         tata letak halaman keranjang
assets/js/tf-bundle.js      paket bundling: isi modal varian dari paket yang diklik, chip navigasi
assets/js/tf-cart.js        keranjang: checkbox pilih semua/distributor/barang, stepper jumlah, hapus, ringkasan & badge header
assets/js/tf-nav.js         perilaku chrome, vanilla
assets/js/mobile-nav.js     isi sheet navigasi mobile, vanilla
assets/js/tf-search.js      pencarian lanjutan header (desktop + sheet ponsel): cakupan, riwayat, hasil Produk/Kategori/Brand → product-list.html?q=…
assets/js/tf-reco.js        homepage: tab Rekomendasi Untukmu (isi grid per tab dari katalog contoh)
assets/js/tf-app.js         konten homepage: countdown flash sale, ikon favorit, tab, filter alamat
assets/js/tf-sliders.js     SEMUA slider Swiper: preset lewat data-tf-slider="hero|flash|products|bundles|bundle-items", galeri foto kartu lewat data-tf-pg; konten yang dimuat belakangan panggil window.tfSliders.init(el)
assets/icons/tf-icons.svg   sprite ikon Tabler (satu library, tanpa Font Awesome); cara pakai di assets/icons/README.md
css/bootstrap.min.css       Bootstrap 4.1.3 murni (grid + reboot + utilitas), pengganti css/style.css di halaman v2
assets/css/tf-products.css  kartu produk & flash sale bersama; termasuk gaya global ikon favorit (hati berisi 22 px, abu → merah saat .selected)
```

Untuk halaman baru: muat `tf-base.css` → `tf-layout.css` → stylesheet halaman, salin
blok `<header>`, sheet, chat, bottom nav, dan `<footer>` dari `index.html`, lalu muat
`tf-nav.js` + `mobile-nav.js` di akhir body.

Status ketergantungan ke template lama dan urutan migrasi selengkapnya ada di
`MIGRASI.md`.

## Tidak ikut dibawa ke sini

- `backup *.html`, lima berkas. Snapshot manual halaman info sebelum ditulis ulang. Tetap di folder v1.
- `odoo-*.html`, lima berkas. Halaman mandiri dengan CSS inline untuk ditempel ke Odoo CMS. Bukan bagian situs statik.
- `backup-TBC3-index.html` dan `product-single-copy.html`. Sisa file kerja lama.

## Sebelum deploy

Pastikan permission file benar sebelum dizip, karena permission 600 pernah membuat upload gagal:

```sh
find . -type f -exec chmod 644 {} +
find . -type d -exec chmod 755 {} +
```

Naikkan juga nomor versi cache pada `href="css/....css?v=..."` bila stylesheet berubah.
