# QA Checkout · shop.toffin-v2

Daftar uji untuk `checkout.html` (prototipe statis, MIGRASI.md langkah 32). Isi keranjang mengikuti barang terpilih di `cart.html`: 12 barang dari 3 distributor (Toffin Jakarta, Surabaya, Bandung), berisi flash sale, paket bundling dengan varian, bonus produk, dan mesin yang melewati QC.

## Cara menjalankan simulasi

Buka `checkout.html?qa=1`. Tambahkan `&demo=partial` atau `&demo=full` untuk mengisi contoh pilihan pengiriman dan pembayaran. Panel **Simulasi QA** muncul di kiri bawah; di ponsel panel diciutkan, ketuk judulnya untuk membuka. Setiap centang memuat ulang halaman dengan kasus tersebut, dan beberapa kasus bisa digabung.

| Centang | URL langsung |
| --- | --- |
| Alamat belum pinpoint | `checkout.html?qa=1&case=nopin` |
| Sesi flash sale berakhir | `checkout.html?qa=1&case=fsend` |
| Stok Milk Pitcher habis | `checkout.html?qa=1&case=stock` |
| Ongkir Toffin Bandung gagal | `checkout.html?qa=1&case=shiperr` |
| Bandung dikirim ke Outlet Bandung | `checkout.html?qa=1&case=split` |
| NPWP sudah lengkap | `checkout.html?qa=1&case=npwp` |
| Hanya Toffin Jakarta (total kecil) | `checkout.html?qa=1&case=small` |

Data contoh untuk pengujian:

| Data | Nilai |
| --- | --- |
| Voucher valid | `HEMAT500`, `MESIN5`, `ONGKIR100` |
| Voucher kedaluwarsa | `OKTOBER` |
| Kode tidak dikenal | kode apa pun selain di atas |
| Saldo Toffin Point | 100.000 poin = Rp 100.000 |
| Batas OVO | Rp 10.000.000 |
| Biaya admin | Virtual Account Rp 4.000 · Kartu Kredit 2,5% · OVO Rp 0 |
| NPWP | Default belum lengkap. NPWP valid = 15 atau 16 digit angka, titik dan strip boleh diketik |
| Asuransi | 0,2% dari subtotal distributor, dibulatkan ke atas per Rp 100 |
| Biaya packing | Per distributor: ada mesin, grinder, atau equipment Rp 150.000 (packing kayu), selainnya Rp 10.000 (packing standar). Angka contoh |
| Alamat tersimpan | Kantor (Jakarta Selatan, utama), Outlet Pluit (Jakarta Utara), Gudang Cileungsi (Bogor, belum pinpoint), Outlet Bandung |
| Gudang distributor | Toffin Jakarta (wilayah Jabodetabek), Toffin Surabaya, Toffin Bandung |
| Aturan jenis pengiriman | Kurir Toffin hanya untuk alamat satu wilayah dengan gudang · Same Day hanya alamat satu kota · Express & Same Day tidak untuk mesin berat (Surabaya, Bandung) · tarif ekspedisi ×0,5 bila satu wilayah |

Status: **Prototipe** = bisa diuji di halaman ini. **Backend** = perilaku sudah dirancang, tetapi baru bisa diuji setelah terhubung ke Odoo.

## 1. Alamat tujuan per distributor

Setiap distributor dikirim dari gudang berbeda, jadi setiap kartu distributor punya alamat tujuan sendiri. Default-nya alamat utama.

| # | Skenario | Hasil yang diharapkan | Status |
| --- | --- | --- | --- |
| A1 | Alamat utama sudah pinpoint | Tiap kartu distributor menampilkan alamat Kantor dengan chip "Utama" dan "Sudah pinpoint" | Prototipe |
| A2 | Alamat belum pinpoint (`nopin`) | Chip kuning "Belum pinpoint" dan tombol "Tandai lokasi" di kartu, jenis pengiriman diganti pesan "Pinpoint alamat tujuan dulu…", tombol bayar terkunci. Tombol "Tandai lokasi" membuka peta; setelah "Simpan lokasi" chip hilang dan jenis pengiriman muncul | Prototipe |
| A2b | Pilih alamat belum pinpoint di dialog alamat | Alamat tetap bisa dipilih; tombol berubah "Tandai lokasi & pakai" → peta terbuka di sekitar alamat itu → "Simpan lokasi & pakai" memasang alamat ke distributor (atau semua) dan menandainya sudah pinpoint. Menutup peta tanpa simpan = alamat lama tetap dipakai | Prototipe |
| A2c | Peta: cari alamat & lokasi saya | Cari (Enter) memindahkan peta ke hasil pertama; "Lokasi saya" memakai GPS perangkat; nama jalan di bawah peta diperbarui setelah peta berhenti digeser | Prototipe (butuh internet) |
| A3 | "Ubah alamat" di satu distributor | Dialog berjudul "Untuk barang dari Toffin X". Hanya distributor itu yang berubah | Prototipe |
| A4 | Centang "Pakai untuk semua pengiriman" | Semua distributor memakai alamat yang dipilih | Prototipe |
| A5 | Alamat diganti setelah pengiriman dipilih | Jenis dan ekspedisi direset. Muncul catatan "Alamat tujuan berubah, pilih ulang…" karena tarif dan ketersediaan berbeda | Prototipe |
| A6 | Bandung ke Outlet Bandung (`split`) | Kurir Toffin tersedia dan gratis, tarif ekspedisi lebih murah, sedangkan Same Day tetap mati karena mesin berat | Prototipe |
| A7 | Alamat di luar jangkauan semua kurir | Pesan "Belum ada pengiriman ke alamat ini" dan tombol bayar terkunci | Backend |
| A8 | Pelanggan belum punya alamat | Ajakan "Tambah alamat" di tiap kartu, dan jenis pengiriman belum bisa dipilih | Backend |

## 2. Barang dan harga

| # | Skenario | Hasil yang diharapkan | Status |
| --- | --- | --- | --- |
| B1 | Barang biasa dengan harga coret | Tampil "qty × harga", harga coret, dan persen diskon. Selisihnya masuk "Diskon produk" | Prototipe |
| B2 | Paket bundling | Tag "Paket Bundling", "N produk dalam paket", dan isi paket bisa dibuka beserta chip varian warna | Prototipe |
| B3 | Bonus produk | Daftar bonus berlabel hijau "Gratis" dengan catatan "dikirim jika stok masih tersedia". Bonus tidak memengaruhi total | Prototipe |
| B4 | Stok habis saat checkout (`stock`) | Baris abu-abu dengan total dicoret, catatan "Stok habis…", dan banner merah berisi tautan ke keranjang. Barang tidak ikut dihitung | Prototipe |
| B5 | Harga berubah sejak dari keranjang | Banner "Harga X berubah", total diperbarui, dan pelanggan diminta mengonfirmasi ulang | Backend |
| B6 | Semua barang habis | Butir "Tidak ada barang yang bisa dibayar" dan tombol bayar terkunci | Prototipe (logika), Backend (data) |
| B7 | Varian paket tidak tersedia | Paket tidak bisa sampai checkout karena sudah dinonaktifkan di keranjang. Jika terjadi saat checkout, perlakuannya sama dengan B4 | Backend |

## 3. Flash sale

| # | Skenario | Hasil yang diharapkan | Status |
| --- | --- | --- | --- |
| F1 | Ada barang flash sale | Banner merah dengan jumlah barang dan hitung mundur sesi tercepat. Barang ditandai tag "Flash Sale" dan hitung mundur | Prototipe |
| F2 | Sesi berakhir saat di checkout (`fsend`) | Tag abu-abu "Flash sale berakhir", harga kembali normal, banner kuning menyebut nama barang, dan total dihitung ulang | Prototipe |
| F3 | Voucher dan flash sale | Catatan "Voucher tidak berlaku untuk barang flash sale". Nilai voucher hanya dihitung dari barang non-flash | Prototipe |
| F4 | Batas pembelian per akun terlampaui, misalnya karena pesanan lain | Server menolak dan menampilkan pesan batas. Jumlah yang diizinkan dipakai, atau pelanggan diminta kembali ke keranjang | Backend |
| F5 | Kuota flash sale habis sebelum bayar | Perlakuannya sama dengan B4 atau F2, sesuai kebijakan | Backend |

## 4. Jenis pengiriman dan ekspedisi

Di setiap kartu distributor, pengiriman tampil sebagai satu baris ringkas di bawah barang. Mengetuk baris itu membuka lembar **Pengiriman · Toffin X** dengan dua langkah, seperti di produksi. Pertama pilih jenis pengiriman: Kurir Toffin, Regular, Express, Same Day, atau Cargo. Setelah itu pilih ekspedisi di dalam jenis tersebut, lalu tekan **Simpan pengiriman**.

| # | Skenario | Hasil yang diharapkan | Status |
| --- | --- | --- | --- |
| S1 | Belum memilih apa pun | Baris oranye "Pilih pengiriman". Di lembar, lima pil jenis pengiriman dengan harga "mulai Rp X". Ongkir di ringkasan "–" atau "Rp X (1/3)" | Prototipe |
| S2 | Jenis dengan satu ekspedisi | Ekspedisi langsung terpilih, misalnya Kurir Toffin atau JNE REG, dan "Simpan pengiriman" langsung aktif | Prototipe |
| S3 | Jenis dengan beberapa ekspedisi | Daftar ekspedisi muncul dan harus dipilih. "Simpan pengiriman" terkunci sampai ada pilihan, dan butir "Pilih ekspedisi Toffin X" muncul bila belum | Prototipe |
| S3b | Lembar ditutup lalu dibuka lagi | Pilihan tetap tersimpan. Baris ringkas menampilkan "Jenis · Ekspedisi", estimasi, dan harga dengan ikon hijau | Prototipe |
| S4 | Jenis tidak tersedia | Pil abu-abu putus-putus dengan alasan: "Tidak menjangkau alamat ini", "Hanya alamat satu kota dengan gudang", atau "Tidak untuk mesin & barang besar" | Prototipe |
| S5 | Kurir Toffin, minimum belanja terpenuhi | Rp 150.000 dicoret menjadi "Gratis", dengan catatan hijau | Prototipe |
| S6 | Kurir Toffin, minimum belum terpenuhi | Rp 150.000 dengan catatan "Tambah Rp X untuk gratis ongkir" | Prototipe (logika), Backend (data) |
| S7 | Ongkir gagal dimuat (`shiperr`) | Setelah memilih jenis di Bandung muncul "Ongkir gagal dimuat" dan "Coba lagi", lalu daftar ekspedisi tampil. Kurir Toffin tidak terpengaruh | Prototipe |
| S8 | Mesin, grinder, atau equipment | Catatan biru "Quality Control 2–3 hari kerja" di distributor terkait | Prototipe |
| S8b | Biaya packing | Kaki kartu distributor menampilkan "Packing Rp X" di samping ongkir. Ringkasan punya baris "Biaya packing" berisi jumlah semua distributor, dan biaya ini ikut dihitung dalam biaya admin kartu kredit | Prototipe |
| S9 | Asuransi dicentang | 0,2% subtotal masuk baris "Asuransi pengiriman" | Prototipe |
| S10 | Catatan untuk distributor | Penghitung 0/200, berhenti di 200 karakter | Prototipe |
| S11 | Asuransi wajib untuk mesin, jika kebijakan menghendaki | Kotak asuransi tercentang dan terkunci | Backend, perlu keputusan |

## 5. Voucher dan Toffin Point

| # | Skenario | Hasil yang diharapkan | Status |
| --- | --- | --- | --- |
| V1 | Kode kosong | Pesan "Masukkan kode promo." | Prototipe |
| V2 | Kode tidak dikenal | Pesan "Kode … tidak ditemukan." | Prototipe |
| V3 | Kode kedaluwarsa (`OKTOBER`) | Pesan "sudah berakhir". Kartu di daftar tampil abu-abu | Prototipe |
| V4 | Syarat belum terpenuhi | `ONGKIR100` sebelum kurir dipilih tidak bisa dipakai dan menampilkan alasannya | Prototipe |
| V5 | Voucher valid | Pesan hijau, dialog tertutup, tombol berubah hijau dengan nilai hemat, dan baris "Voucher KODE" muncul | Prototipe |
| V6 | Syarat gugur setelah voucher terpasang | Tombol menampilkan "Syarat belum terpenuhi", dan nilai voucher menjadi Rp 0 tanpa dilepas | Prototipe |
| V7 | Lepas voucher | Tombol "Lepas" di dialog mengembalikan total | Prototipe |
| V8 | Kuota voucher habis atau sudah dipakai | Pesan dari server | Backend |
| P1 | Pakai Toffin Point | Baris "Toffin Point −Rp 100.000". Poin tidak pernah membuat total negatif | Prototipe |
| P2 | Poin yang didapat | "Dapat N Toffin Point", dihitung 1 poin per Rp 1.000 belanja setelah voucher. Aturan ini contoh dan perlu dikonfirmasi | Prototipe |

## 6. Metode pembayaran dan faktur pajak

Metode pembayaran tampil sebagai daftar ringkas berisi tiga baris: Virtual Account, Kartu Kredit, dan OVO. Pembeli memilih metode di checkout, lalu pembayaran diproses di halaman Xendit dan kembali ke success-checkout.html setelah lunas. Bank Virtual Account muncul sebagai chip setelah baris itu dipilih. Di bawah daftar ada sakelar **Minta faktur pajak**.

| # | Skenario | Hasil yang diharapkan | Status |
| --- | --- | --- | --- |
| M1 | Virtual Account dipilih tanpa bank | Chip BCA, Mandiri, Permata, BRI, dan BNI muncul. Butir "Pilih bank Virtual Account" muncul dan pembayaran terkunci | Prototipe |
| M2 | Bank dipilih | Baris "Biaya admin · VA Mandiri Rp 4.000" muncul di ringkasan | Prototipe |
| M3 | Kartu Kredit | "Biaya admin · Kartu Kredit", dihitung 2,5% dari total sebelum poin. Chip bank tersembunyi | Prototipe |
| M4 | OVO melebihi batas | Baris abu-abu bertuliskan "Total melebihi batas transaksi OVO" | Prototipe |
| M7 | Pembayaran tertunda atau VA kedaluwarsa di Xendit | Xendit menampilkan instruksi dan batas waktu. Pesanan dibatalkan jika lewat batas | Backend |
| M8 | Pembayaran gagal atau dibatalkan di Xendit | Kembali ke checkout dengan pesan dan pesanan tetap tersimpan | Backend |
| M9 | Pembayaran lunas di Xendit | Kembali ke success-checkout.html dengan data pesanan yang sama | Backend |
| T1 | Faktur pajak tidak diminta | Tidak ada info NPWP dan tidak memengaruhi pembayaran | Prototipe |
| T2 | Faktur diminta, NPWP belum lengkap | Kotak kuning "NPWP belum lengkap" dengan tombol "Lengkapi NPWP". Butir "Lengkapi NPWP untuk faktur pajak" muncul dan pembayaran terkunci sampai NPWP dilengkapi atau sakelar dimatikan | Prototipe |
| T3 | Lengkapi NPWP dengan data tidak valid | Nama atau alamat kosong, atau NPWP bukan 15/16 digit, menampilkan pesan merah per kolom dan dialog tetap terbuka | Prototipe |
| T4 | Lengkapi NPWP dengan data valid | Dialog tertutup. Kotak hijau menampilkan nama dan NPWP terformat, misalnya 01.234.567.8-901.000, dengan tautan "Ubah" | Prototipe |
| T5 | NPWP sudah ada di profil (`npwp`) | Saat sakelar dinyalakan, kotak hijau langsung tampil | Prototipe |
| T6 | NPWP disimpan ke profil, faktur terkirim ke email | Data tersimpan di Akun saya dan faktur dikirim setelah pembayaran terkonfirmasi | Backend |

## 7. Validasi dan tombol bayar

| # | Skenario | Hasil yang diharapkan | Status |
| --- | --- | --- | --- |
| K1 | Tombol bayar ditekan saat data belum lengkap | Daftar "yang perlu dilengkapi" muncul, kartu terkait bergaris merah, halaman bergulir ke butir pertama, dan daftar kurir terbuka otomatis | Prototipe |
| K2 | Butir di daftar diklik | Halaman bergulir ke kartu terkait | Prototipe |
| K3 | Semua syarat lengkap | Tombol aktif. Saat ditekan muncul "Memproses…", lalu halaman berpindah ke success-checkout.html | Prototipe |
| K4 | Tombol ditekan dua kali | Tombol terkunci setelah tekan pertama sehingga tidak ada pesanan ganda | Prototipe (UI), Backend (idempoten) |
| K5 | Sesi login berakhir | Diarahkan ke halaman masuk, lalu kembali ke checkout | Backend |
| K6 | Keranjang diubah di tab lain | Checkout memuat ulang data dan memberi tahu perubahan | Backend |

## 8. Tampilan dan aksesibilitas

| # | Skenario | Hasil yang diharapkan | Status |
| --- | --- | --- | --- |
| U1 | Desktop 1366 px | Dua kolom dengan ringkasan sticky di kanan. Header fokus berisi langkah 1–3 dan "Pembayaran aman" | Prototipe |
| U2 | Ponsel 390 px | Header berisi "← Checkout". Ringkasan di bawah dan bar sticky "Total tagihan" dengan tombol Bayar | Prototipe |
| U3 | Dialog di ponsel | Muncul sebagai lembar bawah. Bisa ditutup dengan ✕, klik latar, atau Esc | Prototipe |
| U4 | Navigasi papan ketik | Radio, checkbox, dan switch punya fokus terlihat. Fokus kembali ke pemicu setelah dialog ditutup | Prototipe |
| U5 | Nama barang sangat panjang | Teks turun baris tanpa mendorong kolom harga | Prototipe |

## Keputusan yang masih terbuka

1. Besaran biaya admin per metode, besaran biaya packing (per distributor, per barang, atau per berat), dan apakah biaya kartu kredit ditanggung pelanggan.
2. Rumus Toffin Point yang didapat dan apakah poin boleh digabung dengan voucher.
3. Apakah asuransi wajib untuk mesin.
4. Apakah pesanan boleh dibayar tanpa faktur jika NPWP belum lengkap (prototipe: boleh, asal sakelar faktur dimatikan), dan apakah foto NPWP wajib.
5. Apakah satu pesanan boleh memakai lebih dari satu voucher, misalnya voucher produk ditambah voucher ongkir.
6. Perlakuan barang yang stoknya habis saat checkout: dilewati otomatis seperti di prototipe, atau pembayaran diblokir sampai keranjang diperbarui.
