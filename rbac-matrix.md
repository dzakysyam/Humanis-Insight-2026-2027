# Matriks Role dan Hak Akses

## Role

| Role | Scope utama |
| --- | --- |
| Admin | Akun, role, konfigurasi, dan audit sesuai hak |
| Kepala Sekolah | Ringkasan lintas modul, Humanis Insight, keputusan, laporan |
| Guru | Pengajuan kinerja dan hasil milik sendiri |
| PIC/Petugas Bidang | Data serta laporan modul yang ditugaskan |
| Bendahara | Transaksi, tagihan, verifikasi, laporan keuangan sesuai penugasan |
| Tata Usaha | Dokumen dan proses TU yang ditugaskan |
| Siswa | Role baru. Akses hanya data milik sendiri; fungsi detail belum disahkan |
| Alumni | Responden Tracer Study. Akun alumni belum diputuskan |
| Pengunjung | Halaman publik yang disetujui |

Role orang tua tidak aktif sampai ditetapkan sekolah. Multi-role hanya diizinkan bila kebijakan sekolah menyetujuinya.

## Hak akses awal

Keterangan: Own berarti data sendiri. Assigned berarti data atau modul yang ditugaskan.

| Fitur | Admin | Kepala Sekolah | Guru | PIC | Bendahara/TU | Siswa | Alumni |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Dashboard lintas modul | Status operasional sesuai izin | Ringkasan lintas modul | Ringkasan yang diizinkan | Modul assigned | Modul assigned | Tidak | Tidak |
| Humanis Insight | Konfigurasi; detail nilai sesuai izin terpisah | Review dan keputusan | Own | Jika ditugaskan | Tidak default | Tidak | Tidak |
| Finance summary | Ringkasan sesuai kebijakan | Ringkasan yang disetujui | Tidak | Tidak | Finance assigned | Own only jika disetujui | Tidak |
| Finance transaction | Tidak default | Tidak default | Tidak | Tidak | Kelola/verifikasi sesuai role | Lihat own jika disetujui | Tidak |
| Tracer Study | Konfigurasi sesuai izin | Ringkasan agregat | Tidak default | Kelola sesuai penugasan | Tidak default | Tidak | Respons sendiri jika disetujui |
| Module report | Audit/config sesuai izin | Read sesuai kebijakan | Buat own jika diminta | Create/update assigned | Create/update assigned | Tidak | Tidak |
| Export | Sesuai izin minimum | Data yang boleh dilihat | Data own | Data assigned | Finance assigned | Data own jika disetujui | Respons own bila tersedia |

## Aturan wajib

- Backend memeriksa izin pada setiap request, bukan hanya menyembunyikan menu.
- Siswa hanya membaca record yang terhubung ke akun dan studentId miliknya.
- Admin tidak otomatis membaca bukti kinerja, kontak alumni, atau transaksi jika tidak diperlukan.
- Kepala Sekolah dapat memantau ringkasan lintas bidang. Detail transaksi tetap mengikuti kebijakan.
- Bendahara dan TU dapat dipisah bila sekolah menetapkan pembagian tugas.
- PIC dibatasi pada modul yang ditugaskan.
- Ekspor mengikuti izin halaman dan menulis audit event.
- Unduhan file memeriksa izin di endpoint dan memakai URL singkat.
- Respons penolakan tidak membocorkan keberadaan record pribadi.

## Pertanyaan terbuka

1. Apakah Siswa melihat tagihan dan riwayat pembayaran?
2. Apakah Siswa dapat mengunggah bukti pembayaran?
3. Apakah alumni mengisi Google Form saja atau perlu akun?
4. Apakah orang tua mendapat akun terpisah?
5. Apakah Admin boleh membaca nilai dan bukti kinerja?
6. Siapa mengelola indikator, periode, dan tarif?
7. Apakah Bendahara dan TU satu role atau terpisah?
8. Siapa yang dapat melihat kontak serta jawaban individu alumni?
