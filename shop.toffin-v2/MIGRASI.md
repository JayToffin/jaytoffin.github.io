# Rencana migrasi v2

Tujuan akhir: **Odoo 12, modul web kustom** (dikonfirmasi Rendi 29 September 2026).
Semua keputusan teknis di bawah mengikuti itu. Audit dilakukan pada `index.html`.

## Yang disediakan Odoo 12 di frontend, jadi tidak perlu dihilangkan

| Komponen | Versi di Odoo 12 | Konsekuensi untuk mockup ini |
| --- | --- | --- |
| Bootstrap | 4.1 | markup kita sudah Bootstrap 4.2, **tidak perlu naik ke 5**; `data-toggle` tetap benar |
| jQuery | 3.3 | selalu ada di `web.assets_frontend`; melepasnya dari mockup hanya meringankan mockup, bukan Odoo |
| Stylesheet | SCSS | tulis CSS baru sebagai SCSS ber-prefix `tf-`, taruh di `static/src/scss/` |
| Ikon | Font Awesome **4.7** | mockup sudah lepas dari FA: sprite Tabler `assets/icons/tf-icons.svg` + `.tf-i`, tidak bentrok dengan FA 4.7 Odoo (langkah 8) |
| Grid snippet | `.container` > `.row` > `.col-lg-*` | editor website Odoo membutuhkannya untuk mengatur kolom. **Kelas grid Bootstrap di konten harus dipertahankan**, bukan dihapus |
| Carousel | Bootstrap carousel | Swiper tidak dibundel; tambahkan sebagai aset modul bila tetap dipakai |
| JS perilaku | `website.content.snippets.animation` | skrip vanilla `tf-nav.js` tetap jalan sebagai aset biasa; bungkus sebagai widget Odoo hanya bila perlu ikut hidup di editor |

## Keputusan teknologi

| Hal | Keputusan | Alasan |
| --- | --- | --- |
| Framework JS | **Tidak pakai** | Halaman Odoo dirender server-side lewat QWeb. SPA akan dibuang saat porting. |
| Bootstrap | **Tetap versi 4** | Odoo 12 memakai Bootstrap 4.1. Markup sekarang sudah 4.2, porting ke QWeb nyaris mekanis. |
| Grid kustom | **Jangan** | Editor snippet Odoo bergantung pada grid Bootstrap. |
| Stylesheet | **SCSS dengan prefix `tf-`** | Odoo 12 memakai SCSS. Prefix mencegah tabrakan dengan kelas `o_*` Odoo. |
| jQuery | **Tidak dipakai kode baru** | Kode `tf-*` vanilla supaya tidak bergantung urutan muat; jQuery Odoo tetap ada di samping tanpa konflik. |
| Ikon | **Tabler Icons, SVG sprite** | Satu library; tidak bentrok dengan FA 4.7 Odoo 12; 10 KB, tanpa webfont. |
| Struktur halaman | **Per blok, bukan halaman utuh** | Odoo merakit halaman dari snippet. Satu blok jadi satu snippet. |

## Pemisahan aset

```
assets/          <- stack baru, tumbuh seiring migrasi
  css/  tf-base.css        token warna/font + .tf-container (dipakai semua halaman)
        tf-layout.css      chrome bersama: header, mega menu, pencarian, akun,
                           sheet mobile, bottom nav, chat, delivery bar, footer
        tf-products.css    kartu produk, flash sale, panah Swiper (dari custom/flashsale.css)
        home-modern.css    section khusus homepage
        my-account.css · info-page.css
  js/   tf-nav.js          perilaku chrome (vanilla, tanpa jQuery/Bootstrap)
        mobile-nav.js      isi sheet mobile (vanilla)
        tf-app.js          konten homepage: countdown, Swiper, ikon produk
  icons/ tf-icons.svg       sprite Tabler (56 simbol) + README.md
  vendor/                  (disiapkan untuk self-host Swiper & Font Awesome)
css/  js/        <- stack lama, menyusut sampai habis
  css/bootstrap.min.css   Bootstrap 4.1.3 murni, tiruan bundle Odoo 12 (bukan bagian tema lama)
```

Urutan muat di halaman v2: `tf-base.css` → `tf-layout.css` → `tf-products.css` → stylesheet halaman.
Halaman baru cukup menyalin blok `<header>`, sheet, chat, bottom nav, dan `<footer>`
dari `index.html` lalu memuat ketiga berkas itu.

## Peta ketergantungan (diperbarui 30 September 2026, sesudah langkah 7)

`index.html` sekarang memuat (halaman info: hanya `bootstrap.min.css` + `tf-base` + `tf-layout` +
`info-page.css` + `tf-nav.js` + `mobile-nav.js`; `my-account.html`: seperti index, ditambah
`my-account.css` dan `bootstrap-datepicker`):

| Berkas | Status | Alasan masih ada |
| --- | --- | --- |
| `assets/*` (123 KB) | stack v2 | header, chrome, kartu produk, konten homepage |
| `css/bootstrap.min.css` (137 KB) | tiruan Odoo | Bootstrap 4.1.3 murni: grid `.container` / `.row` / `.col-*`, reboot, `.img-fluid`; di Odoo 12 sudah ada di `web.assets_frontend` |
| `js/jquery.min.js` + `popper` + `bootstrap.min.js` (364 KB) | tiruan Odoo | menjalankan dua modal Bootstrap 4; di Odoo 12 digantikan bundle `web.assets_frontend` |

Yang sudah lepas dari `index.html`: `css/style.css` (tema lama 331 KB, langkah 5), `css/custom.css` + `css/flashsale.css` (langkah 6), Font Awesome 6 CDN (langkah 8), `main.js`, `custom.js` (diganti `tf-app.js`),
owl carousel, AOS, magnific popup, stellar, scrollax, waypoints, animateNumber,
datepicker, timepicker, jquery-migrate, google-map, animate.css, flaticon,
icomoon, ionicons, open-iconic, Material Design Icons.

`js/main.js` dan `js/custom.js` **tidak diubah** dan tetap dipakai halaman lama.
Catatan bug lama di `main.js` baris 1031: `document.getElementById('test').onclick`
melempar error di setiap halaman yang tidak punya `#test`, dan menghentikan sisa
skrip di bawahnya. Tidak berpengaruh pada `index.html` karena `main.js` sudah tidak dimuat.

## Urutan pengerjaan (direvisi untuk Odoo 12)

1. ~~Rombak header, nav, sidebar, dan footer.~~ **Selesai** di `index.html`:
   `tf-layout.css` + `tf-nav.js`, tanpa bergantung tema lama, jQuery, maupun ikon-font lama.
   Posisi tiap section halaman tetap sama (selisih ≤ 1 px), semua panel diuji terbuka/tertutup.
2. ~~Lepaskan `custom.js` dari jQuery.~~ **Selesai** untuk homepage lewat `tf-app.js`.
3. ~~Buang `main.js` beserta 8 library-nya.~~ **Selesai** di `index.html`.
4. ~~Dua modal (`#contact-modal`, `#fs-info-modal`).~~ **Selesai, opsi A** (keputusan Rendi):
   struktur Bootstrap 4 dan pemicu `data-toggle` dipertahankan karena Odoo 12 memakainya juga.
   Bagian MODAL di `tf-layout.css` kini menjadi **desain default untuk semua `.modal`**:
   berlaku otomatis pada markup Bootstrap 4 apa adanya, termasuk `<a class="close">×</a>` dan
   `.btn-primary` di halaman lama; di layar sempit modal tetap kartu di tengah layar. Varian
   `.tf-modal--dialog` untuk konfirmasi terpusat tanpa ×. Semua varian ada di `demo/modal.html`.
   Desainnya **Fusion**, dipilih Rendi 2026-09-29 setelah membandingkan sembilan arah
   (referensi Dribbble, Awwwards, marketplace, Airbnb, Material 3, Apple HIG): kerangka alert
   & sheet Apple HIG (kaca hangat berblur, sudut 26 px, judul terpusat, tombol tutup bulat abu,
   label kapital kecil) dengan aksi Material 3 (rata kanan, tombol teks + pil oranye 40 px).
   File tema `tf-modal-themes.css` dan `demo/modal-themes-preview.png` sudah dihapus. Tombol
   sekunder masih memakai `!important` untuk mengalahkan `style.css`; lepas setelah langkah 5.
   Markup mati ikut dibuang: modal `#upselling`, `<aside class="social">`, dan wrapper
   `#bottom-sheet` kosong. jQuery + Popper + Bootstrap JS tetap dimuat sebagai tiruan bundle Odoo.
5. ~~Ganti `style.css` (tema lama 331 KB) dengan Bootstrap 4.1 murni.~~ **Selesai** 2026-09-30
   di `index.html`: `css/style.css` → `css/bootstrap.min.css` (4.1.3 asli dari jsDelivr, 137 KB).
   Kelas grid `.container` / `.row` / `.col-*` di konten dipertahankan untuk snippet Odoo.
   Inventaris kelas: dari 288 kelas yang dipakai `index.html`, hanya `.text` (wrapper ikon
   wishlist) dan 6 kelas `fs-*` yang masih bergantung pada CSS lama; sisanya sudah `tf-`.
   Diff computed style 1564 elemen (sebelum vs sesudah, 1440 & 500 px) menemukan lima
   warisan tema lama yang dipindahkan: `a { color: oranye }` + hover (`:where(.tf-home) a`,
   spesifisitas sama dengan aslinya), ikon wishlist abu/merah, `line-height: 1.5` pada
   `.tf-wtitle` dan `.tf-fcol__title` (tema lama menimpa 1.2 Bootstrap), dan
   `var(--orange-toffin)` yang dulu didefinisikan `style.css` → `var(--tf-orange)`.
   Hasil akhir identik piksel kecuali slide hero (autoplay) dan angka countdown.
   `css/style.css` masih ada untuk 50-an halaman lama sampai langkah 7.
6. ~~Pindahkan aturan kartu produk & flash sale ke `tf-products.css`, lepas `custom.css` dan
   `flashsale.css`.~~ **Selesai** 2026-09-30. Dari 430 aturan `custom.css` dan 205 aturan
   `flashsale.css`, hanya 49 yang cocok dengan DOM `index.html` (diuji `querySelectorAll` di
   headless Chrome): panah Swiper, section & kartu flash sale, countdown. Semuanya disalin
   apa adanya ke `assets/css/tf-products.css` (7 KB) beserta 7 variabel `:root` yang dirujuk.
   Dua aturan global dipindah ke tempat yang semestinya: `html, body { overflow-x: clip }` ke
   `tf-base.css`, `body { padding-bottom: 70px }` (<1200 px, ruang bottom nav) ke `tf-layout.css`.
   Diff computed style 1564 elemen: nol perbedaan; pixel diff identik kecuali slide hero dan
   countdown. Kedua berkas lama tetap ada untuk halaman lama sampai langkah 7. Kelas `fs-*`,
   `.product`, `.img-prod` sengaja belum di-rename supaya markup tidak berubah; ganti ke `tf-`
   saat blok flash sale dijadikan snippet Odoo.
7. ~~Terapkan chrome yang sama ke halaman v2 lain.~~ **Selesai** 2026-09-30 untuk `my-account.html`
   dan lima halaman info (`faq`, `informasi-pengiriman`, `kebijakan-privasi`, `pembatalan-transaksi`,
   `syarat-dan-ketentuan`). Blok chat, sheet, header, footer, dan bottom nav disalin utuh dari
   `index.html` (skrip `p7info.py` di sesi ini, satu sumber kebenaran tetap `index.html`).
   Dilepas dari tiap halaman: 12 CSS tema lama + `style.css`, 15 JS tema lama (`main.js`,
   `custom.js`, owl, aos, magnific, waypoints, stellar, scrollax, easing, migrate,
   animateNumber, google-map), loader `#ftco-loader`, Google Maps API, dan tag gtag UA lama;
   `body.goto-here` dan `.ftco-animate` dibuang. Halaman info kini tanpa jQuery sama sekali
   (212 KB aset lokal, 75 KB di antaranya stack v2). `my-account.html` tetap memuat
   jQuery/Popper/Bootstrap JS untuk tab, 11 modal (otomatis bergaya Fusion), dan
   bootstrap-datepicker; chat lama `#chat-widget` diganti `.tf-chat`.
   Warisan tema lama yang dipindahkan: heading `line-height: 1.5` (`:where(.ip)` /
   `:where(.ta)`), tautan oranye di `.ta`, `.ftco-section` → `.ta-section` (9em / 2em di
   ponsel), `.hero-wrap.hero-bread` → `.ta-hero` (10em / 6em / 3em), kelas `custom.css`
   (`.tab-myaccount`, `.point-datepicker`, `.text-orange`, `.text-red`, `.reset-fil`) ke
   `my-account.css`, dan kartu produk tab Favorit (`.product-card`, `.pl-*`, `.product-grid`)
   ke `tf-products.css`. Verifikasi: diff computed style area konten sebelum/sesudah = nol
   di 1440 & 500 px (my-account juga 800 px), kecuali lebar ikon `fa-crown` 1 px karena
   FA 5.13 → 6.5.2; nol error JS (sebelumnya 2 per halaman dari `main.js`/`custom.js`);
   tab, modal, dan datepicker diuji lewat probe. Efek samping yang disengaja: judul hero
   "My Account" dan isi tab kini tampil sejak awal, dulu tersembunyi oleh `.ftco-animate`
   yang menunggu `main.js`. 42 halaman lama lain masih memuat `style.css`.
8. ~~Ikon: satu library.~~ **Selesai** 2026-09-30, keputusan Rendi: **Tabler Icons** (MIT, v3.48.0,
   outline 24 px) sebagai SVG sprite, menggantikan Font Awesome 6 CDN (bentrok dengan FA 4.7 bawaan
   Odoo 12) dan 14 SVG buatan tangan di chrome. 295 `<i class="fas fa-*">` di 7 halaman → 
   `<svg class="tf-i"><use href="#i-nama"/></svg>` lewat tabel pemetaan (53 ikon FA → 56 simbol);
   sprite 10 KB disisipkan inline setelah `<body>` di tiap halaman (`<use>` ke file terpisah diblokir
   Chrome pada file://; di Odoo cukup sekali di `website.layout`). Sumber & daftar simbol:
   `assets/icons/README.md`, sprite lengkap `assets/icons/tf-icons.svg`. Gaya `.tf-i` (kotak 1.25em, karena
   glyph Tabler hanya mengisi ±16–20/24 kotaknya sedangkan glyph FA memenuhi 1em; stroke
   currentColor) di `tf-base.css`; 25 selektor `… i {}` di CSS jadi `… .tf-i {}`; `mobile-nav.js`
   membuat `<svg>` untuk chevron dan logout. Verifikasi: nol `fa-` tersisa, semua `<use>` menunjuk
   simbol yang ada, nol error JS, jumlah ikon per halaman sama, tidak ada ikon 0×0; beda ukuran
   hanya kotak glyph (FA lebar bervariasi, SVG 1em persegi). Bobot: minus ±360 KB CDN FA per
   halaman. Stub `.addWish` (ASP.NET) di my-account ikut dibuang.
   Ikutan langkah 5 yang baru ketahuan di sini: Bootstrap 4.1 murni memberi `button:focus` cincin biru
   bawaan browser (tampil juga saat klik mouse) dan glow biru `.btn`/`.form-control:focus`; tema lama tidak
   punya. `tf-base.css` kini: klik mouse tanpa cincin, keyboard (`:focus-visible`) cincin oranye 2 px.
9. ~~Pecah jadi snippet Odoo 12.~~ **Dibatalkan** 2026-09-30, keputusan Rendi: v2 tetap **static HTML**,
   tidak dibuat modul Odoo. Batasan Odoo di atas tetap dijaga (Bootstrap 4, grid, tanpa FA 5/6) supaya
   porting masih mungkin kalau suatu saat dibutuhkan.
10. **Halaman daftar produk** (`product-list.html`) ditulis ulang 2026-09-30 di atas chrome v2: filter
    kategori/brand/harga (sidebar di ≥992 px, drawer di ponsel), urutkan, chip filter aktif, grid
    5/4/3/2 kolom memakai kartu produk yang sama dengan homepage (`.product` + `.fs-*` lewat kelas
    section `.product-slider-section`; keputusan Rendi supaya konsisten — blok `.tf-card` gaya
    Tokopedia yang tidak terpakai dihapus dari CSS), 20 kartu tampil dulu lalu auto-load per 20 setelah
    pengguna menggulir (IntersectionObserver + cadangan event scroll) dengan
    skeleton dan tombol cadangan "Muat lebih banyak". Katalog 60 produk contoh ada di `tf-plp.js`;
    filter/urut berjalan di klien. Tanpa jQuery, tanpa CSS tema lama. Diuji 1440/1100/900/500 px,
    auto-load sampai habis, filter brand, urut harga, reset, drawer.
    Ukuran sidebar filter disamakan dengan Tokopedia (diukur langsung dari tokopedia.com/search di
    viewport 1440 lewat CDP, 30 Sep 2026): lebar 215 px, jarak 34 px ke grid, judul "Filter" 14/800 di
    luar kotak, kotak radius 8 padding 0 12, judul grup 14/800 lh 18 padding 16 atas, opsi 12/400 tinggi
    baris 31, kotak centang 20×20 garis 2 radius 4 jarak 6 ke teks, kolom harga 38 px berprefiks "Rp"
    43 px, jarak kartu 16 px. Sub-kategori tampil hanya bila induknya dicentang.
    2026-10-02: judul kartu satu baris + "…", tombol Add to cart bobot 600 tanpa garis bawah saat hover
    (global `.fs-btn` di tf-products.css), dan foto kartu bisa digeser seperti homepage: slider `.tf-pg`
    (CSS dipindah dari home-modern.css ke tf-products.css jadi global; Swiper 11 CDN dimuat di halaman ini;
    `tf-plp.js` memberi tiap produk 3 foto contoh dan menginisialisasi Swiper bersarang per batch) dengan
    dot pagination lebih kecil (bullet 4 px, aktif 12 px) lewat product-list.css.
11. **Halaman paket bundling** (`product-bundle.html`) ditulis ulang 2026-10-01 di atas chrome v2.
    Konten = halaman lama (`static-e-commerce/product-bundle.html`): judul "Paket Bundling", tiga paket
    "Bundle Toffin for Home/Cafe/Office" (Rp 150/320/120 juta, 5/6/4 produk contoh "Nuova Simonelli
    Appia Life 2 group" Rp 230.000.000), ikon paket + "Promo Bundling" + "Harga paket" + "Add to cart",
    hint "Geser untuk lihat semua produk dalam paket", modal "Pilih varian produk" (label "Varian warna",
    opsi Merah/Hitam/Putih/Hijau/Silver, tombol "Add to cart"). Tata letak baru: kartu `.tf-bundle` dengan
    ringkasan terpusat di kiri (250 px, seperti kotak harga lama) dan isi paket di kanan sebagai slider
    Swiper 11 (CDN yang sama dengan homepage; 4 kartu di ≥1200, 3 di ≥768, 2,2 di ponsel, panah kaca
    gaya homepage muncul saat hover, tanpa panah bila semua produk muat). Kartu produk = kartu homepage
    apa adanya (`.product` + `.fs-*`: hati, foto persegi, nama 2 baris 13,5 px, harga 16 px, tombol
    Add to cart 50 px, radius 14). Ponsel/tablet < 768: ringkasan ringkas seperti halaman lama (judul,
    lalu harga + tombol sebaris). Chip navigasi sticky; modal Bootstrap 4 default (Fusion) diisi
    `tf-bundle.js` dari atribut `data-*` produk paket yang diklik. Ikon `arrows-horizontal` ditambahkan ke
    sprite (59 simbol). Diuji 1440/1024/700/500 px + modal; nol error JS.
12. **Halaman keranjang** (`cart.html`) didesain ulang 2026-10-02 di atas chrome v2 (`assets/css/cart.css`,
    `assets/js/tf-cart.js`). Referensi: pola keranjang Tokopedia/H&M dan panduan UX keranjang (daftar
    barang di kiri, ringkasan belanja sticky di kanan dengan rincian harga–diskon–total, CTA selalu
    terlihat; di ponsel ringkasan jadi bar sticky). Isi mengikuti halaman lama: barang dikelompokkan per
    distributor (checkbox per kelompok & per barang, hapus per kelompok), paket bundling dengan isi paket
    yang bisa dibuka (item tidak tersedia / Add to cart satuan), bonus produk gratis di bawah barang induk,
    barang tidak tersedia (abu-abu, tak bisa dipilih), distributor yang hanya berisi satu paket bundling
    (Toffin Bali), diskon per kelompok, total + "Anda hemat", tombol "Lanjut ke Pembayaran"
    (kode promo nanti di checkout) → `checkout.html`, keadaan kosong. Angka contoh dibuat realistis
    (bukan Rp 88.000.000.000 seperti halaman lama). Semua total dihitung `tf-cart.js` dari `data-price` /
    `data-old` / jumlah; badge keranjang di header ikut terisi. Ikon trash, minus, gift, building-store,
    ticket, alert-circle, shopping-cart-x ditambahkan ke sprite (64 simbol). Diuji 1440/500 px lewat CDP:
    tambah jumlah, uncheck distributor, buka isi paket, hapus barang/kelompok/terpilih, keranjang kosong;
    nol error JS.
13. **Perbaikan homepage** (audit 2026-10-02): (3) section "Produk Bundle": satu kartu = satu banner promo
    bundling dari backend (bisa lebih dari satu; tiap promo berisi beberapa paket, mis. Home/Cafe/Office,
    masing-masing dengan produknya seperti product-bundle.html). Kartu dibangun dari KARTU PRODUK GLOBAL
    (`.product.tf-bcard` + `.fs-body`), jadi garis, radius, judul, harga, dan tombol sama dengan kartu produk.
    Khas bundle (home-modern.css): banner 4:5 di `.img-prod`, foto mini produk 34 px 3 + ubin "+N" datar
    (99+ bila sisa > 99), nama promo 1 baris, baris "Mulai dari" + pil "Hemat X%", harga paket termurah (info jumlah/nama paket dihapus), tombol "Lihat paket" → product-bundle.html. Slider preset
    "bundles". Contoh 5 promo memakai poster hero sebagai pengganti banner.
14. **Rapikan struktur JS/CSS** (2026-10-05). (a) Semua inisialisasi Swiper disatukan di
    `assets/js/tf-sliders.js`: elemen diberi `data-tf-slider="hero|flash|products|bundles|bundle-items"`,
    galeri foto kartu tetap `data-tf-pg`; script inline di bawah index.html, blok Swiper di tf-app.js, serta
    salinan di tf-plp.js dan tf-bundle.js dihapus (tf-plp memanggil `window.tfSliders.init(grid)` per batch).
    Empat konfigurasi tanpa elemen di halaman v2 (flashsale lama, upsell, kelebihan, `.swiper-container`)
    dibuang. Kode tab pindah ke tf-app.js. Diuji 1440/500 px: semua slider aktif dengan jumlah kartu, jarak,
    panah, dan autoplay sama; galeri 30/30 di homepage, 60/60 di daftar produk setelah digulir; nol error.
    (b) `home-modern.css` 1.277 → 791 baris (50 → 31 KB): 119 aturan mati dibuang (varian hero bento/peek/
    ambient/banner, promo mini, kartu flash lama `.tf-fcard`, layanan, kategori lama, promo, feature, header
    flash sale lama), komentar historis tentang CSS tema lama dihapus, dua blok `.tf-home` digabung.
    Dibuktikan identik: computed style 2.168 elemen + pseudo-elemen di 1440/768/500 px, nol perbedaan.
15. **Kartu produk serasi** (2026-10-05). Tombol Add to cart satu ukuran global di tf-products.css: tinggi
    36 px, teks 13/600, tanpa glow oranye, hover = garis oranye (dulu 50 px dengan bayangan tebal; override
    di home-modern.css, product-bundle.css, product-list.css dihapus). Kartu `.product` + `.fs-body` kini
    kolom flex setinggi sel: tombol selalu di dasar kartu, sejajar walau ada/tidaknya harga coret (galeri
    `.tf-pg` dikunci selebar kartu supaya Swiper tidak mengukur dari isi slide). Garis "lipatan" abu tipis
    di tengah ubin countdown flash sale dihapus. Diuji 1440/500 px di homepage, daftar produk, bundling:
    0 baris tombol meleset, nol error.
16. **Kartu produk global** (2026-10-05). Satu blok "KARTU PRODUK GLOBAL" di tf-products.css (selektor
    `.product:has(> .fs-body)` + `.fs-*`) menentukan seluruh tampilan kartu: radius `--tf-card-radius` 14 px,
    garis `--tf-card-line`, latar putih, foto/galeri persegi tanpa zoom, label diskon, hati kanan atas,
    nama maks. 2 baris 13,5 px + "…" dengan tinggi tetap 2 baris (nama lengkap jadi tooltip lewat tf-nav.js), harga 16/900, harga coret 12, tombol 36 px di dasar kartu. Perbedaan per section
    hanya lewat kelas varian di pembungkus: `.tf-cards--flash` (bingkai flash sale, border 0) dan
    `.tf-cards--compact` (grid daftar produk: nama 12,5 px, harga 14/11, dot galeri kecil). Aturan
    kartu di home-modern.css, product-list.css, product-bundle.css dihapus; CSS kartu lama `pl-*` /
    `.product-card` / `.fs-section .product` dibuang dan 8 kartu tab Favorit my-account diganti markup
    global. Penyelarasan: flash sale radius 18 → 14, padding 10 → 12; daftar produk radius 15 → 14 dan
    nama 12 → 12,5 px. Halaman yang didesain ulang nanti cukup memakai markup kartu yang sama.
17. **Rekomendasi Untukmu berfungsi** (2026-10-05, `assets/js/tf-reco.js`). Tab Untuk Kamu / Terlaris /
    Promo / Terbaru / Ulasan mengganti isi grid dari katalog contoh 16 produk: 10 campuran, 5 terlaris,
    7 promo (diskon saja), 8 terbaru, 4 rating tertinggi; tiap tab campuran diskon & harga normal kecuali
    Promo. Kartu = kartu produk global tanpa rating/terjual (rating hanya di detail produk; data rating & terjual
    hanya dipakai untuk urutan tab). "Lihat Semua Produk" ikut tab (`product-list.html?sort=terlaris` /
    `?sort=terbaru`); tf-plp.js membaca `?sort=`. Di backend: tiap tab = satu query, markup kartu sama.
    2026-10-05: chip "Semua Kategori" di baris kategori homepage dihapus.
18. **Pencarian lanjutan di header** (2026-10-05, `assets/js/tf-search.js`, CSS `.tf-sx` di tf-layout.css).
    Dipilih dari pratinjau `preview-search.html` (opsi 1: kolom + panel lebar). Satu komponen
    `[data-tf-search]` dipakai di desktop (kolom 420 px di header, panel 720 px, pintasan "/", panah ↑↓,
    Enter, Esc) dan di ponsel (view `#mobile-search-browser` di sheet mobile, hasil selalu tampil).
    Cakupan Semua / Produk / Kategori / Brand. Sebelum mengetik: riwayat (localStorage, maks 6, hapus per
    item / semua) + kategori populer (daftar "Populer" sengaja tidak dipakai). Saat mengetik: Produk (foto,
    nama dengan sorotan, brand · kategori, harga), Kategori, Brand. Brand & kategori diturunkan dari produk
    yang cocok ("grinder" → Eureka, Victoria Arduino) dengan baris "Semua brand/kategori".
    Tujuan: produk → product-single.html; lainnya → `product-list.html?q=…&brand=…&cat=…` yang kini dibaca
    tf-plp.js (judul "Hasil untuk …", chip kata kunci bisa dihapus, filter brand/kategori tercentang).
    Markup pencarian lama (form `.tf-search.tf-dd`, overlay `.tf-msearch`), JS-nya di tf-nav.js, dan CSS-nya
    dibuang dari 10 halaman v2. Diuji 1440/500 px: "/", ketik, ganti cakupan, klik brand → daftar produk
    tersaring, Enter, riwayat, ponsel buka/tutup; nol error di semua halaman v2.
19. **Section Kategori + Toffin Rewards** (2026-10-05, dipilih dari `preview-kategori.html` usulan A).
    Judul "Kategori Populer" di atas banner promo dihapus; banner "Yuk, belanja di Toffin" berdiri sendiri.
    Baris chip di bawahnya berjudul "Kategori", tiap chip → `product-list.html?cat=…` (tersaring).
    Toffin Rewards: default tampilan belum login (`.tf-rguest`: ajakan masuk, tombol Masuk & Daftar);
    tombol Masuk (`data-tf-login`, tf-app.js) menampilkan versi sudah login (`data-auth="in"`): tab Poin /
    Voucher / Service Credit; "Gunakan" → cart.html, "Pakai" & "Lihat Semua" → my-account.html. Di backend
    versi dipilih menurut sesi. Catatan: chip Hot Kitchen & Cold Kitchen belum punya kategori di filter
    daftar produk (klik = semua produk).
    Gambar chip kategori kini di folder sendiri `images/kategori/` (coffee-machine, ingredients,
    coffee-grinder, water-treatment, manual-brew, gelato-soft-ice, hot-kitchen, cold-kitchen,
    other-equipment .png): dipotong rapat ke objek (bayangan & ruang kosong dibuang), persegi dengan
    margin tipis, 128×128 px. File asli di `images/` tidak diubah karena sebagian dipakai di tempat lain.
20. **Toffin Rewards → tab Voucher berisi daftar voucher** (2026-10-06). Gaya tiket seperti coupon.html
    (gambar kiri, judul + syarat singkat + link "Syarat & Ketentuan" → coupon.html, tanggal berakhir merah di
    kanan dengan garis putus-putus dan lekukan), 5 contoh voucher, bisa digeser: preset `vouchers` di
    tf-sliders.js (1,12 kartu per layar, `observer`/`observeParents` karena panel tersembunyi sampai tab
    dibuka); panah kecil di bawah lewat pembungkus `[data-tf-slider-wrap]` + `[data-tf-prev]`/`[data-tf-next]`
    (dukungan baru di `navFor`). Gambar voucher `images/voucher/voucher-default.jpg` (240 px, 8 KB) dibuat
    dari images/coupon.png (2,4 MB, tidak diubah). CSS `.tf-voucher*`/`.tf-vslider*` di home-modern.css.
    Revisi: tiket dipadatkan (gambar 36 px, judul + syarat + "S&K" sebaris, tanggal kanan) supaya tab Voucher
    setinggi tab Poin & Service Credit; ketiga panel ditumpuk dalam `.tf-rpanels` (grid satu sel,
    `minmax(0,1fr)`, panel nonaktif `visibility:hidden`) sehingga kotak Rewards tidak melompat saat ganti tab.
    Opsi desain voucher lain (stub nilai, kartu gradien, minimal) ada di `preview-voucher.html`.
    Revisi 2: kartu lebih lebar (1,05 per layar), teks lebih kecil (judul 12,5 px, syarat 11 px), kolom kanan
    berisi "s/d <tanggal>" + tombol "Gunakan" → cart.html (voucher dipakai saat checkout).
    Revisi 3: kartu setinggi kotak "Poin Kamu" (60 px); kiri 3 baris (judul / syarat / "s/d <tanggal> · S&K"),
    kanan hanya tombol "Gunakan" (`.tf-voucher__act`, menggantikan `.tf-voucher__exp`).
    Revisi 4 (opsi F di preview-voucher.html, gabungan "stub nilai" + "kartu gradien"): gambar diganti stub
    nilai `.tf-voucher__stub` (gradien oranye, tepi berlubang, mis. "25% / OFF", "500rb / POTONGAN" — butuh
    field nilai & satuan dari Odoo), badan rona oranye tipis, tombol "Gunakan" gaya tombol tema (oranye solid,
    sudut 8 px). `.tf-vslider__foot` margin 4 px supaya tab Voucher tetap 88 px = tab Poin.
    `images/voucher/voucher-default.jpg` tidak dipakai lagi.

21. **Halaman Brand: tiga usulan desain** (2026-10-09, `preview-brand.html`). Draf `brand.html` +
    `assets/css/brand-modern.css` dari Codex (header/footer sendiri `.brand-header`, hero kotak + panel statistik,
    grid 4 kolom berhuruf) **tidak dipakai**: keputusan Rendi, header & footer harus tema utama dan desainnya tidak
    disukai. Ketiga usulan berdiri di atas chrome v2 asli (sprite, chat, sheet, header, footer, bottom nav disalin
    dari `index.html`; menu "Brand" diberi `is-active`), tanpa jQuery; cari + filter kategori berfungsi di tiap
    usulan; pengalih A/B/C di atas dan mengambang (hash `#a` / `#b` / `#c`).
    **A Direktori**: judul + kolom cari, chip kategori sticky di bawah header (67 / 95 px), baris "Brand unggulan"
    (4 kartu logo + tagline + foto produk; geser di ponsel), grid kartu logo 6/4/3/2 kolom (nama, kategori, jumlah
    produk). **B Spotlight**: panel hero gelap radius 20 (judul, cari, statistik, marquee logo dua baris murni CSS,
    berhenti saat hover / `prefers-reduced-motion`), chip kategori, bento 4 kartu spotlight berfoto produk
    (Victoria Arduino, Nuova Simonelli, Eversys, Moccamaster), brand dikelompokkan per kategori (tile logo; baris
    geser di ponsel), pita CTA WhatsApp. **C Katalog A–Z**: tata letak daftar produk (sidebar 215 px sticky:
    kategori + abjad, jadi chip di < 992 px), baris brand dikelompokkan per huruf (logo · nama + tagline · pil
    kategori · jumlah produk · chevron), 2 kolom hanya ≥ 1200 px.
    Data = contoh dan perlu field backend: 24 brand (22 dari brand.html + DaVinci Gourmet & Unox yang logonya
    sudah ada, `images/brand/32.png` & `33.png`; `31.png` Simonelli Group tidak dipakai karena grup induk, bukan
    brand), negara asal, tagline, jumlah produk. Tautan kartu → `brand/*.html` (22 halaman lama) atau
    `product-list.html?brand=…`. Grup kategori: Mesin Kopi & Grinder 6 · Brewer & Manual Brew 3 · Ingredients 6 ·
    Kitchen & Gelato Equipment 8 · Water Treatment 1. Logo dipotong rapat ke `images/brand/trim/` (bbox alpha
    > 16 + margin 3 %, sisi terpanjang 400 px, total 688 KB; file asli tidak diubah) supaya ukuran tampak seragam
    di kartu; PNG asli 500×500 menyisakan logo kecil di tengah kotak. Diuji 1440/1024/500 px, nol error JS.
    **Keputusan Rendi 2026-10-09: hero usulan B + grid "Semua brand" usulan A, tanpa "Brand unggulan".**
    Diterapkan hari itu juga: `brand.html` ditulis ulang di atas chrome v2 (memuat hanya `bootstrap.min.css`,
    `tf-base`, `tf-layout`, `brand-modern.css`; skrip `tf-nav`, `tf-search`, `mobile-nav`, `tf-brand.js`; tanpa
    jQuery, tanpa Swiper). Susunan: hero gelap (remah roti, eyebrow, H1, lead, kolom cari, marquee
    logo) → chip kategori sticky → "Semua brand" (judul + jumlah tampil + "Urut A–Z", grid 6/4/3/2) → keadaan
    kosong dengan tombol Reset. `assets/css/brand-modern.css` diganti seluruhnya (isi Codex dibuang), semua kelas
    berprefix **`tf-brands`** (bukan `tf-brand`: itu kelas link logo di header, `.tf-brand { display:inline-flex }`
    + disembunyikan < 1200 px di tf-layout.css, sehingga percobaan pertama membuat hero & grid berjajar dan konten
    hilang di ponsel), 10 KB, mandiri dari home-modern/tf-products. `assets/js/tf-brands.js` (2 KB): cari + filter
    kategori di klien, angka total & tampil dihitung dari DOM, membaca `?q=` dan `?cat=mesin|brew|bahan|dapur|air`.
    Diuji 1440/500 px + `?q=ta&cat=dapur` (hasil: Ta Chung Ho & Vitamix), nol error JS. `preview-brand.html`
    dibiarkan sebagai arsip seperti preview lain. Tiga statistik hero (brand resmi, negara asal, garansi resmi) dihapus
    atas permintaan Rendi (setelah push pertama).

22. **Paket Bundling: tiga usulan desain ulang** (2026-10-09, `preview-bundle.html`). Versi product-bundle.html yang
    ada (hero + panel statistik, chip, baris ringkasan gelap + slider 4 kartu Appia yang sama) dinilai kurang; di ponsel
    ringkasannya malah menimpa kartu. Usulan baru di atas chrome v2, kartu produk = kartu global (tanpa tombol & hati;
    baris "1 unit · pilih varian"), tanpa Swiper (scroll-snap), data paket realistis dihitung dari isi: Home 5 produk
    satuan 35,9 jt → paket 32,9 jt (hemat 8 %), Cafe 6 produk 300,8 jt → 279 jt (7 %), Office 4 produk 196,7 jt →
    182,5 jt (7 %); ikon paket memakai `images/tfn-for-home|cafe|office.png`. **A Pilih paket**: tiga kartu paket
    berdampingan gaya pricing table (ikon, untuk siapa, tagline, kotak harga + satuan dicoret + pil Hemat hijau, CTA
    penuh, daftar isi paket berfoto kecil; Cafe ditandai "Paling laris" dengan bingkai oranye & tombol gelap), strip
    3 keunggulan (instalasi & training, garansi, cicilan). **B Tab per paket**: tab kartu sticky (ikon, nama, harga),
    satu paket tampil: ringkasan (fakta, kotak harga + CTA) lalu grid kartu produk 4/3/2 kolom, ditutup tabel
    "Bandingkan paket" (produk, satuan, paket, hemat, tombol Lihat). **C Baris paket**: semua paket terlihat, tiap
    paket satu kartu: header (ikon, nama, tagline, harga + hemat + CTA) dan baris produk yang digeser (5/4/3/2 kartu),
    chip lompat Home/Cafe/Office mengikuti scroll. Diuji 1440/500 px.
    Umpan balik Rendi: A & C oke tapi mau yang lebih menarik; halaman harus langsung belanja (tanpa deskripsi ala
    company profile) dan bisa memuat 10+ paket. Pratinjau ke-2 `preview-bundle-2.html` (12 paket contoh, 5 kategori
    Home/Cafe/Office/Gelato/Kitchen, chip filter + urutkan Harga/Hemat berfungsi, mosaik foto 2×2 + "+N" per paket,
    kartu produk global tanpa tombol): **D Grid katalog** (4/3/2 kolom; kartu = mosaik, label Terlaris/Baru, nama,
    harga, pil Hemat %, satuan dicoret, tombol Tambah paket + "Isi paket" lipat), **E Daftar + detail** (daftar paket
    sticky 340 px di kiri, kanan = bar beli + grid produk paket terpilih; di < 992 daftar jadi kartu geser), **F Baris
    lipat** (satu baris per paket: 4 foto mini, nama, harga, Hemat, tombol, chevron; klik membuka baris produk).
    Rendi: D–F terlalu ramai. Pratinjau ke-3 `preview-bundle-3.html` versi tenang (satu foto, satu harga, satu tombol;
    tab teks): **G Grid tenang**, **H Daftar bersih**, **I Kartu lebar**.
    **Keputusan Rendi 2026-10-09: tetap model baris + slider yang sudah ada (ringkasan kiri, isi paket digeser kanan),
    dirapikan.** Diterapkan di `product-bundle.html` + `product-bundle.css` (bagian halaman ditulis ulang, blok modal
    varian `.bv-*` dipertahankan) + `tf-bundle.js`: hero/statistik/chip dibuang → judul + tab kategori sticky (teks
    bergaris bawah, Semua/Home/Cafe/Office/Gelato/Kitchen, menyaring baris, `data-tf-bundle-cat`); baris paket radius
    16 dengan ringkasan 260 px (kategori · N produk, nama, "Harga paket", harga 22/900, "Satuan … · hemat N%", tombol
    Tambah paket → modal varian yang lama) dan slider Swiper preset `bundle-items` berisi kartu produk global tanpa
    tombol & hati ("1 unit · pilih varian"); panah kaca saat hover. < 992 px ringkasan jadi grid di atas slider
    (nama kiri, harga + tombol kanan; di < 768 harga kiri, tombol kanan) sehingga bug ringkasan menimpa kartu hilang.
    12 paket contoh. Diuji 1440/900/500 px.
    Lanjutan: `preview-bundle-2.html` dan `preview-bundle-3.html` dihapus; `preview-bundle.html` ditulis ulang sebagai
    **pembanding** tiga tata letak dengan data & gaya tenang yang sama: "Kini" (versi terpasang, ringkasan kiri + slider
    Swiper), **C** (ringkasan di atas: nama kiri, harga + tombol kanan; produk digeser scroll-snap), **F** (baris lipat:
    4 foto mini, nama, harga, tombol; chevron membuka baris produk). Pengalih `#now` / `#c` / `#f`.
    **Keputusan akhir Rendi: versi "Kini".** Revisi terakhir di product-bundle.html: (a) header halaman ter-highlight
    sebagai penanda bundling (`.tf-bundle-head`: pita gradien oranye lembut radius 16, ikon paket di kotak oranye 52 px,
    judul + jumlah paket, satu kalimat, tiga pil poin: hemat sampai 27 %, instalasi & training, garansi resmi);
    (b) ringkasan tiap baris diberi aksen: latar hangat tipis + garis oranye 3 px di kiri (di atas saat < 992 px), label
    kategori oranye kapital; (c) **tab kategori dibuang** (Rendi: tidak perlu); (d) kasus paket > 10 produk: slide
    ke-11 dst. `hidden`, ubin putus-putus "+N produk lainnya · Lihat semua N produk" di posisi ke-11 membukanya
    (`data-bundle-more`, tf-bundle.js: tampilkan slide, hapus ubin, `swiper.update()` + `slideNext()`); contoh
    "Cafe Premium 3 Group" diisi 14 produk. Diuji 1440/500 px.
    Revisi Rendi: pita (ikon + pil) terlalu ramai → header jadi **blok berlatar lembut saja** (judul + jumlah + satu
    kalimat, gradien #fff4e7 → #fffcf8, radius 16, tanpa ikon/pil); slider isi paket **5 kartu per baris** di ≥ 1200 px
    (preset `bundle-items` di tf-sliders.js: 992 → 4, 1200 → 5), sisanya digeser. `preview-bundle.html` kini hanya
    membandingkan dua varian header: A latar blok (terpasang) vs B latar penuh lebar di belakang remah roti + judul
    (`.tf-bundle-page--band`). **Rendi memilih A**; CSS varian B dan `preview-bundle.html` dihapus. Halaman selesai.

23. **Detail produk: dua usulan** (2026-10-09, `preview-product.html`). `product-single.html` dan
    `product-single-flashsale.html` masih tema Winkel penuh (style.css, main.js, FA 6, owl, jQuery). Isi yang dibawa:
    galeri + thumbnail (Swiper utama + thumbs), brand, judul, rating/terjual, harga + coret + Hemat %, varian warna,
    produk gratis, jumlah, stok cabang lain (details), Tambah ke keranjang / Beli sekarang, tanya via WhatsApp,
    deskripsi / spesifikasi / pengiriman & garansi, modal video & bagikan (WhatsApp, X, salin link), slider Aksesoris
    & Alternatif (kartu produk global, preset `products`). Flash Sale = keadaan `body.is-fs` yang menampilkan
    `[data-fs]`: badge merah di galeri, kotak harga rona merah, countdown + bar sisa stok, pil kedaluwarsa; selebihnya
    identik dengan reguler (satu template, dua keadaan). **A 3 kolom + kotak beli**: galeri sticky 420 px · info
    (judul, harga, varian, gratis, tab) · kotak beli sticky 320 px (ringkasan produk, jumlah, subtotal, dua tombol,
    stok cabang); < 1200 kotak beli turun ke bawah. **B 2 kolom + akordeon**: galeri sticky setengah lebar · info +
    kotak jumlah & tombol + akordeon. Ikon baru hanya di halaman ini (share, link, player-play, brand-x) ditambahkan ke
    sprite halaman. Hash `#a` `#a-fs` `#b` `#b-fs`. Diuji 1440/500 px.
    **Rendi memilih A** dan minta kotak beli tetap menempel. Perbaikan: (1) kolom grid harus `align-items: stretch`
    (bukan start) supaya `position: sticky` di dalamnya punya ruang; (2) kolom kanan direntang dua baris
    (`grid-row: 1 / 3`, kolom eksplisit; Aksesoris & Alternatif masuk grid sebagai baris 2 kolom 1–2, lebar 852 px =
    4 kartu) sehingga kotak beli menempel sepanjang halaman, diukur: top 84 px pada scroll 1400; (3) < 1200 px kotak
    beli turun ke bawah dan muncul **bar beli menempel di bawah** (`.pd-stickybar`: harga, varian, ikon keranjang,
    Beli sekarang; tampil hanya saat tombol Beli utama tidak terlihat; di atas bottom nav). Pelajaran: `grid-row`
    tanpa `grid-column` membuat item dilempar ke kolom pertama yang kosong.
    Revisi Rendi: foto penuh tanpa padding (object-fit cover), panah galeri = panah global tf-products, spesifikasi satu
    kolom, Aksesoris/Alternatif 4 kartu (preset baru `related` di tf-sliders.js: 2/3/4/4), "Beli sekarang" dihapus →
    satu tombol "Add to cart" (mengikuti kartu), bar bawah ponsel juga.
    **Disamakan dengan produksi** (shop.toffin.id/product/…/41046, diambil 2026-10-09): galeri = foto per varian
    (`data-pid`), ganti varian → foto utama, harga, dan ketersediaan ikut (`data-avail=false` → chip coret "habis",
    tombol nonaktif + pesan); wishlist & share (X, WhatsApp, salin link); deskripsi = paragraf + daftar fitur,
    spesifikasi = baris "Kunci : Nilai" (Brand, Dimensions, Boiler, Power, Voltage, Frequency, Net Weight, Group
    Height; di backend dipecah dari deskripsi); Quantity; Aksesoris Produk & Alternatif Produk. Rating/ulasan dan tab
    pengiriman dibuang karena tidak ada di produksi. Ditambah **lightbox foto besar** (klik foto utama: overlay gelap,
    foto maksimal, panah, strip thumbnail, Esc / ← →, posisi slider ikut saat ditutup).
    Revisi Rendi: (a) **Rekomendasi cabang disamakan dengan fitur lama** (produksi tanpa login tidak menampilkannya;
    acuan = mockup v1): judul "Rekomendasi Cabang", tombol "Rekomendasi stok cabang lain" membuka catatan (tambahan
    ongkir, harga ikut cabang) + baris "Stok Toffin Bandung : 10+" / "Stok Toffin Bogor : 4" masing-masing dengan
    stepper jumlah sendiri; ditaruh di kotak beli. (b) **Panah slider = homepage**: blok panah kaca `.tf-home
    .tf-carousel` (muncul saat hover, chevron dari border, sembunyi di ujung) dipindah dari home-modern.css ke
    tf-products.css sebagai `.tf-carousel` global tanpa perubahan nilai; home-modern hanya menyisakan versi hero.
    Galeri detail (`.pd-gallery__main.tf-carousel`) dan baris Aksesoris/Alternatif memakainya. Homepage dicek tetap sama.
    Revisi lanjutan: varian habis hanya dicoret (tanpa teks); baris cabang hanya nama (Toffin Bandung/Surabaya/Bogor) +
    stepper; saat varian habis blok Rekomendasi Cabang naik ke atas tombol Add to cart (stepper utama nonaktif, "Stok
    Jakarta: 0", pesan singkat) tapi **tetap tertutup**, pengguna membukanya sendiri.
    Logika jumlah = produksi (screenshot + penjelasan Rendi 2026-10-09): angka stok **tidak ditampilkan** (aturan
    internal), kecuali saat permintaan melebihi stok lokal → tampil "Stok yang tersedia: N", jumlah utama dipangkas ke N,
    **sisanya otomatis dialokasikan** ke stepper cabang terdekat berurutan (Bandung → Surabaya → Bogor, masing-masing
    sampai batasnya), panel Rekomendasi Cabang terbuka, hint oranye "Sebagian pesanan dipenuhi dari cabang lain", dan
    baris "Total quantity: N (Jakarta a + cabang lain b)"; subtotal dari total; pengguna masih bisa mengubah stepper
    cabang manual. Varian habis: stok lokal 0, panel tetap tertutup. Stok cabang ditampilkan untuk awam (pilihan dari
    tiga opsi: "10+", "Lebih dari 10", "Stok tersedia/Sisa N"): **"Lebih dari 10"** bila > 10 (redup) dan **"Sisa N"**
    bila ≤ 10 (oranye), di bawah nama cabang.
    Revisi Rendi: jumlah utama **bebas** melebihi stok lokal (tidak dipangkas); kelebihannya otomatis diisi ke stepper
    cabang terdekat, total = min(jumlah, stok lokal) + cabang, dan bila semua cabang pun kurang muncul "N unit belum
    terpenuhi". Catatan panjang di panel dihapus; diganti **ikon info di sebelah judul "Rekomendasi Cabang" dengan
    tooltip** (hover/fokus di desktop, ketuk di ponsel; klik di luar menutup). Tooltip dipilih atas modal karena teksnya
    satu kalimat dan tidak boleh memutus alur mengisi jumlah.
    Opsi galeri foto (pengalih 1–4 di pratinjau, tersimpan di localStorage): **1 Thumb bawah** (sekarang), **2 Thumb
    kiri** (strip vertikal 64 px, foto utama lebih lebar; di ponsel kembali horizontal), **3 Grid foto** (1 besar +
    4 kecil, ubin ke-5 "+N foto", klik → lightbox; tanpa slider), **4 Hover zoom** (lensa 2,2× mengikuti kursor di
    desktop, thumbnail tetap). **Rendi memilih 1 + hover zoom.**
    **Diterapkan 2026-10-09**: `product-single.html` dan `product-single-flashsale.html` ditulis ulang di atas chrome v2
    (memuat Swiper CDN, bootstrap.min.css, tf-base, tf-layout, tf-products, `product-detail.css`; skrip jQuery/Popper/
    Bootstrap untuk modal video & bagikan, tf-nav, tf-search, mobile-nav, Swiper, tf-sliders, `tf-product.js`). Satu
    template: **flash sale berlaku per varian** lewat `data-fs="1"` pada radio varian (mengikuti produksi) → `body.is-fs`
    menyalakan badge, kotak harga merah, countdown, bar sisa stok, pil kedaluwarsa; di halaman flash sale varian Hitam
    ber-flash, Stainless/Merah reguler (ganti varian → flash padam, diuji). Hover zoom: lensa 2,2× di desktop, dimatikan
    pada perangkat `(hover: none)`. Kepala section Aksesoris/Alternatif (.tf-head/.tf-title/.tf-viewall) disalin ke
    product-detail.css karena home-modern.css tidak dimuat. 4 ikon baru masuk sprite sumber `assets/icons/tf-icons.svg`
    (68 simbol) dan inline di kedua halaman. Diuji 1440/500 px, nol error JS. `preview-product.html` dibiarkan sebagai
    arsip (pengalih A/B, Reguler/Flash, galeri 1–4).
    Revisi Rendi: teks "Varian ini dipenuhi dari cabang lain…" dibuang; kotak beli memakai **satu urutan tetap** di semua
    keadaan: Jumlah → Rekomendasi Cabang (tertutup) → Total/Subtotal → Add to cart → Tanya produk (input di atas tombol
    utama, tombol tidak melompat saat varian berganti). Varian habis: stepper utama redup, tombol cabang diberi cincin
    oranye tipis sebagai petunjuk.

## Bobot aset lokal `index.html`

| | Sebelum | Sesudah langkah 1–3 | Sesudah langkah 5 | Sesudah langkah 6 |
| --- | --- | --- | --- | --- |
| Template lama (CSS + JS) | 1112 KB | 364 KB (jQuery/Popper/Bootstrap, untuk 2 modal) | 0 KB | 0 KB |
| Tiruan bundle Odoo (jQuery/Popper/Bootstrap JS + Bootstrap CSS) | — | — | 490 KB** | 490 KB** |
| Custom Toffin lama | 143 KB | 423 KB* | 89 KB (`custom.css` + `flashsale.css`) | 0 KB |
| Stack v2 | 58 KB | 108 KB | 115 KB | 123 KB |
| **Total** | **1313 KB** | **876 KB** | **694 KB** | **613 KB** |

\* `style.css` 331 KB dihitung di sini karena satu-satunya alasan ia dimuat adalah
kelas Bootstrap di konten, bukan header.
\*\* Tidak ikut ke Odoo: `web.assets_frontend` sudah membawa jQuery, Popper, dan Bootstrap 4.1.
Yang benar-benar dibawa ke modul hanya stack v2 (123 KB); CSS lama sudah nol di homepage.

Gambar ditangani terpisah oleh Rendi: 6,5 MB dimuat homepage, nol WebP,
250 PNG dan 93 JPG, beberapa PNG dipakai untuk foto.
