# Design System dan Spesifikasi UI

Gunakan DESIGN.md v2.1 sebagai acuan visual dan interaksi. PRD serta keputusan terbaru menjadi acuan kebutuhan. Produk melayani sekolah, bukan dashboard SaaS generik.

## Review visual

Rancangan Stitch sudah memiliki identitas yang lebih kuat dari template generik: foto lapangan sekolah, navy, cream, sidebar gelap, Plus Jakarta Sans, tabel keuangan sekolah, dan komponen tracer study.

Perbaikan:

- Kurangi kepadatan kartu pada Dashboard Kepala Sekolah. Utamakan laporan yang perlu ditindaklanjuti, progres Humanis Insight, dan status sembilan modul.
- Beri label Mode Demo dan Data Demo pada setiap angka contoh.
- Hapus klaim real-time, sinkron otomatis, keamanan server, SSL, atau gateway aktif sampai benar-benar dibuat dan diverifikasi.
- Sediakan layar khusus role Siswa. Belum ada mockup siswa pada ekspor yang diperiksa.
- Abaikan empat halaman Rectangle dari PDF awal karena tampil kosong.
- Samakan nama modul, status release, ejaan, dan nama role pada setiap layar.

## Token visual

| Token | Nilai | Penggunaan |
| --- | --- | --- |
| Navy | #123568 | Identitas, judul, aksi utama |
| Sidebar | #171717 | Navigasi internal |
| Sidebar Surface | #222222 | Hover dan pilihan |
| Orange | #E88A2E | Aksen selektif |
| Cream | #F8F3E8 | Kanvas utama |
| Surface | #FFFDF8 | Latar tabel, form, panel |
| Yellow | #F5DF79 | Informasi umum |
| Pink | #EFAED1 | Humanis Insight dan kinerja |
| Green | #B3CA8A | Pembayaran terverifikasi |
| Blue | #B5D0EA | Monitoring |
| Lavender | #D3C7E8 | Dokumen dan rekomendasi |
| Border | #E5DFD4 | Pemisah |
| Text | #2B3446 | Isi utama |
| Muted | #5E5A56 | Label dan keterangan |

Letakkan token pada satu theme. Jangan membuat nilai warna baru di komponen. Pastel membedakan kategori, bukan menggantikan label status. Kontras teks normal minimum 4,5:1.

## Tipografi

- Font utama Plus Jakarta Sans. Inter hanya fallback teknis. Jangan memakai Roboto.
- Page title 28 sampai 32 px, section 20 sampai 24 px, judul panel 16 sampai 18 px, body 14 sampai 16 px, caption 12 sampai 13 px.
- Angka dan nominal memakai tabular numerals.
- Gunakan sentence case. Kapital penuh hanya pada label pendek yang membantu pemindaian.
- Jangan menyeragamkan semua ukuran. Maksimal tiga tingkat heading per layar.
- Hindari label all-caps berulang dan dekorasi tipografi tanpa fungsi.

## Layout dan navigasi

Sidebar memakai tiga grup:

| Grup | Isi |
| --- | --- |
| UMUM | Dashboard, Portal Modul |
| SUMBER DAYA MANUSIA | Humanis Insight |
| SISTEM | Pusat Laporan, Pengumuman Internal, Pengaturan & RBAC |

Pengaturan & RBAC hanya untuk Admin. Modul sekolah dibuka dari Portal Modul, status modul pada dashboard, atau tautan yang diizinkan. Jangan menambahkan grup MANAJEMEN SEKOLAH ke sidebar tanpa keputusan pemilik proyek.

Dashboard Kepala Sekolah adalah pusat monitoring. Ringkasan modul menampilkan status, sumber, periode, waktu pembaruan, dan aksi yang diizinkan. Daftar sembilan modul pelaporan menunggu konfirmasi final; interpretasi sementara memisahkan Humas sebagai website publik.

### Pola pilihan pemilik proyek

- Landing page Humas boleh memakai satu floating pill sebagai ajakan utama.
- Web app ponsel memakai bottom tab bar dengan tiga sampai lima tujuan yang paling sering digunakan sesuai role.
- Dashboard desktop menyediakan command palette Ctrl+K untuk mencari modul, laporan, periode, dan navigasi yang diizinkan.
- Command palette tidak menjalankan perubahan role, transaksi, atau keputusan final tanpa konfirmasi.

## Layar utama

### Dashboard Kepala Sekolah

- Utamakan laporan yang butuh tindakan, progres Humanis Insight, dan status integrasi.
- Setiap ringkasan memuat sumber, periode, waktu pembaruan, dan status data.
- Angka contoh diberi label demo. Jangan mengarang jumlah siswa, guru, presensi, pembayaran, atau aktivitas.
- Bila data belum ada, tampilkan “Belum tersedia” dan nama modul sumber, bukan nol.

### Humanis Insight

- Rekomendasi memakai lavender dengan batas putus-putus dan label Rekomendasi.
- Keputusan final memakai navy solid, alasan, penentu, dan tanggal.
- Jangan menyiratkan rekomendasi otomatis mengubah status kerja guru.

### Keuangan

- Fokus pada total pembayaran terverifikasi, kekurangan, dan rincian SPP, biaya SPMB, serta biaya tahunan.
- Tabel berisi periode, tagihan, jumlah terverifikasi, sisa, status, dan sumber transaksi.
- Format rupiah Rp 1.250.000. Status selalu memiliki label teks.
- Aksi Bayar Sekarang, Kirim Tagihan, VA, QRIS, dan rekonsiliasi hanya aktif setelah scope dan integrasi disetujui.
- Laporan bulanan atau semester menampilkan rumus persentase yang telah disepakati.

### Tracer Study

- Filter tahun lulus memperbarui semua ringkasan.
- Tingkat respons butuh jumlah total lulusan sebagai pembagi. Jika belum ada, tampilkan “Belum tersedia”.
- Kontak alumni disamarkan kecuali role berwenang.
- Jangan buat kutipan alumni atau angka penyerapan kerja sebagai data nyata.

### Role Siswa

- Akses hanya untuk identitas dan data milik sendiri.
- Tagihan dan unggah bukti menunggu konfirmasi scope.
- Jangan tampilkan data teman, kinerja guru, laporan internal, atau menu administrasi.

## Copy dan state

Setiap layar utama mendukung loading, tersedia, kosong, gagal memuat, akses ditolak, dan data usang bila relevan.

- Lingkungan simulasi menampilkan Mode Demo dan Data Demo.
- Data lama mencantumkan waktu pembaruan terakhir.
- Pesan error menyebut bagian yang gagal dan langkah berikutnya.
- Tombol menyatakan hasilnya: Simpan Draf, Kirim Laporan, Verifikasi Pembayaran, Minta Revisi, Unduh Excel.
- Gunakan Bahasa Indonesia. Tanggal 15 November 2026, waktu 14.30 WIB, persentase 87,5%.
- Jangan memakai em dash pada prompt maupun copy UI.

## Responsif dan aksesibilitas

- Sidebar berubah menjadi drawer pada layar kecil.
- Tabel menjadi kartu atau scroll di dalam wadah yang jelas. Halaman tidak boleh overflow horizontal.
- Fokus keyboard terlihat; label form terhubung; ikon tanpa teks memiliki label aksesibel.
- Toast memakai aria-live. Status tidak hanya dibedakan dengan warna.
- Hormati prefers-reduced-motion. Animasi merespons aksi pengguna.
- Review pada 1440, 1024, 768, 390, dan 360 CSS pixel.

## Batas teknologi

Prototipe Stitch menggunakan Tailwind Play CDN dan Alpine.js. Itu cara prototipe dirender, bukan keputusan stack produksi. Stack produksi mengikuti architecture.md dan hosting yang disetujui. Bila sumber prototipe Python masih dipakai, edit src dan compile ulang; jangan edit index.html hasil build.
