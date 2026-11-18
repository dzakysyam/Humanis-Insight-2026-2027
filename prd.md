# PRD Kerja: Humanis Insight SMK Tiara Nusa

**Status:** baseline kerja yang memuat permintaan terbaru sekolah dan pemilik proyek. Revisi formal SRS/Proposal masih perlu disahkan sekolah.  
**Tanggal pembaruan:** 16 November 2026.

## 1. Ringkasan produk

Humanis Insight adalah platform manajemen sekolah berbasis web dengan SSO dan RBAC. Dashboard Kepala Sekolah menjadi pusat monitoring. Humanis Insight juga menjadi modul pengelolaan kinerja guru. Modul bidang tetap mengelola tugas masing-masing dan mengirim status atau ringkasan laporan ke dashboard pusat.

## 2. Prioritas sekolah

1. **Humanis Insight:** input, pemeriksaan, penilaian, monitoring, keputusan, dan laporan kinerja guru.
2. **Tracer Study:** kumpulkan dan rangkum kondisi lulusan untuk membantu sekolah melihat hasil pendidikan dan masukan dari alumni.
3. **Tata Usaha, khususnya laporan keuangan siswa:** pantau pembayaran SPP, biaya SPMB, dan biaya tahunan.

Sekolah meminta total pembayaran dan kekurangan biaya tiap siswa serta laporan bulanan atau semester dengan persentase. Ekspor laporan Humanis Insight ke PowerPoint menjadi opsi tambahan bila waktu dan teknologi memungkinkan.

Urutan di atas adalah urutan prioritas, bukan jadwal release yang sudah disetujui.

## 3. Hasil yang ingin dicapai

- Kepala Sekolah dapat melihat status laporan dari sembilan modul bidang dalam satu dashboard.
- Pengguna bekerja dengan satu sesi login pada platform dan hanya mendapat akses sesuai role serta penugasan.
- Guru mengisi laporan kinerja sendiri, Kepala Sekolah menilai dan mengambil keputusan.
- Bendahara atau petugas TU dapat menelusuri nilai tagihan, pembayaran yang sudah diverifikasi, dan kekurangan biaya per siswa.
- Laporan keuangan dapat difilter menurut jenis biaya, periode, kelas atau jurusan setelah parameter tersebut disepakati.
- Hasil tracer study dapat diringkas menurut angkatan dan indikator yang benar-benar dikumpulkan.
- Data kosong dan data yang belum tersambung ditampilkan sebagai belum tersedia, bukan nol atau klaim sinkron.

## 4. Modul dan integrasi

DESIGN.md menyebut sepuluh modul sekolah selain fungsi inti Humanis Insight. Pemilik proyek menjelaskan bahwa sembilan modul bidang terintegrasi ke dashboard Kepala Sekolah. Daftar final sembilan modul harus disahkan. Interpretasi kerja dari blueprint adalah Humas/website publik menjadi modul terpisah, sementara sembilan modul operasional mengirim laporan ke dashboard.

| Domain | Prioritas / status |
| --- | --- |
| Humanis Insight dan Dashboard Kepala Sekolah | Prioritas utama, Release 1 |
| Alumni dan Tracer Study | Prioritas sekolah kedua, rancangan Release 2 |
| Keuangan Terpadu | Prioritas sekolah ketiga, rancangan Release 2 |
| Tata Usaha | Release 3, dengan laporan keuangan sebagai fokus yang diminta |
| Kurikulum dan Sarana Prasarana | Desain Release 3 |
| Humas dan website publik | Desain Release 3; status penggantian situs lama perlu dicocokkan dengan proposal |
| Akademik, Kesiswaan, Absensi, Perpustakaan | Release 4 placeholder “Segera Hadir” |

Dashboard mengambil status dan ringkasan dari modul sumber. Setiap kartu laporan menampilkan nama sumber, periode, waktu pembaruan, status integrasi, dan tautan ke detail yang diizinkan. Modul yang belum siap tetap berstatus Segera Hadir atau Belum tersedia.

## 5. Role

Role yang menjadi dasar kerja:

- Kepala Sekolah: memantau laporan lintas modul, mengelola keputusan Humanis Insight, melihat laporan sesuai kewenangan.
- Guru: mengisi dan melihat penilaian kinerjanya sendiri.
- Admin: mengelola akun, role, konfigurasi, dan audit sesuai izin.
- PIC atau petugas bidang: mengirim laporan untuk modul yang ditugaskan.
- Bendahara/TU: mengelola tugas administrasi keuangan yang disetujui.
- Siswa: role baru yang diminta pemilik proyek. Akses wajib dibatasi ke data milik sendiri. Fungsi lengkap belum disahkan.
- Alumni: sumber responden Tracer Study. Akun alumni tidak diasumsikan; mekanisme formulir masih perlu keputusan.
- Pengunjung publik: hanya untuk halaman publik bila Humas disetujui.

Role orang tua tidak dianggap aktif sampai sekolah menetapkan kebutuhan dan kebijakannya.

## 6. Kebutuhan minimum

| ID | Kebutuhan |
| --- | --- |
| AUTH | Login platform, pengelolaan sesi, logout, pemulihan akun sesuai kanal yang disetujui |
| RBAC | Periksa hak akses pada server untuk halaman, API, file, ekspor, dan record |
| HUB | Tampilkan ringkasan sembilan modul, status sinkronisasi, sumber data, periode, dan waktu pembaruan |
| HUMANIS | Kelola periode, indikator, bobot, bukti, review, skor, keberatan, dan keputusan sesuai keputusan sekolah |
| FIN-STUDENT | Tampilkan ringkasan total pembayaran terverifikasi dan kekurangan per siswa untuk SPP, SPMB, dan biaya tahunan |
| FIN-REPORT | Sajikan ringkasan bulanan dan semester dengan definisi persentase yang disahkan |
| TRACER | Sajikan ringkasan hasil Tracer Study berdasarkan data yang disetujui dan sumber respons yang ditetapkan |
| REPORT | Ekspor PDF/Excel sesuai role; PowerPoint Humanis Insight opsional |
| ADMIN | Kelola akun, role, konfigurasi, serta audit sesuai kewenangan |
| PRIVACY | Minimalkan data pribadi dan tampilkan hanya kepada role yang memerlukannya |

## 7. Batas fitur pembayaran

Permintaan sekolah saat ini memastikan pemantauan dan pelaporan pembayaran. Alur menerima uang secara online, payment gateway, VA, QRIS, pengingat WhatsApp, dan rekonsiliasi bank belum dikonfirmasi oleh catatan pertemuan. SRS v1.0 memuat unggah bukti dan verifikasi manual, tetapi Proposal v1.1 mengecualikan pembayaran. Perlakukan alur tersebut sebagai usulan sampai revisi scope disahkan.

Jangan membuat pembayaran seolah berhasil sebelum petugas berwenang memverifikasi atau sumber transaksi tepercaya mengonfirmasi statusnya.

## 8. Syarat sukses

- Kepala Sekolah melihat laporan lintas modul tanpa membuka data yang tidak berhak diakses.
- Role Siswa tidak bisa melihat data siswa lain dengan mengganti URL, ID, atau request.
- Total pembayaran hanya memakai transaksi yang sudah disetujui menurut kebijakan.
- Kekurangan biaya dapat ditelusuri ke jenis biaya dan periode asal.
- Persentase punya rumus, pembagi, periode, dan sumber yang tertulis.
- Tracer Study menyatakan jumlah responden dan pembagi untuk setiap persentase.
- Data demo diberi label; angka demo tidak dipakai sebagai baseline produksi.
- Tidak ada kredensial atau data siswa nyata dalam source code, test fixtures, atau laporan demo.
- Setiap keputusan scope, konfigurasi keuangan, perubahan role, verifikasi pembayaran, dan ekspor sensitif memiliki audit trail.

## 9. Di luar scope kecuali disetujui

- Payment gateway, QRIS, VA, pembayaran otomatis, dan biaya transaksi.
- Aplikasi native.
- Akun orang tua.
- Pengambilan keputusan kinerja otomatis atau perubahan status pegawai otomatis.
- Integrasi real-time tanpa kontrak teknis dan mekanisme refresh yang disepakati.
- Klaim sertifikasi, enkripsi, keamanan gateway, atau compliance yang belum diuji.
