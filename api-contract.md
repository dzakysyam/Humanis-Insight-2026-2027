# Kontrak API Kerja

Kontrak ini adalah batas awal untuk diskusi backend. Nama route final mengikuti framework yang disetujui. Semua route privat memeriksa autentikasi dan izin di server.

## Respons ringkasan dashboard

Setiap kartu modul mengembalikan:

| Field | Arti |
| --- | --- |
| moduleId | ID modul |
| moduleName | Label untuk pengguna |
| period | Periode laporan |
| status | available, empty, stale, unavailable, coming_soon |
| metrics | Nilai ringkasan dengan definisi |
| source | Sistem atau modul asal |
| refreshedAt | Waktu sumber terakhir diperbarui |
| detailHref | Tautan detail yang tetap diperiksa backend |

Data kosong tidak diserialisasi menjadi nilai nol tanpa definisi. Bila status empty, tampilkan pesan kosong. Bila status stale, sertakan waktu terakhir dan berikan aksi refresh hanya jika diizinkan.

## Route inti

| Route konseptual | Akses | Fungsi |
| --- | --- | --- |
| GET /api/v1/me | Semua pengguna login | Identitas, role, penugasan yang boleh ditampilkan |
| GET /api/v1/dashboard/headmaster | Kepala Sekolah dan role yang disetujui | Ringkasan lintas modul |
| GET /api/v1/modules | Pengguna login | Daftar modul yang dapat diakses dan statusnya |
| GET /api/v1/modules/{moduleId}/reports | Role berizin | Daftar laporan untuk modul/periode |
| POST /api/v1/modules/{moduleId}/reports | PIC assigned | Kirim atau perbarui laporan |
| GET /api/v1/students/me | Siswa | Data diri minimum |
| GET /api/v1/students/me/charges | Siswa jika disetujui | Tagihan milik sendiri |
| GET /api/v1/finance/students/{studentId}/summary | Bendahara/TU dan Kepala Sekolah sesuai kebijakan | Total terverifikasi dan kekurangan |
| GET /api/v1/finance/reports | Role finance berizin | Laporan per bulan atau semester |
| GET /api/v1/tracer/summary | Admin Alumni, PIC, Kepala Sekolah sesuai kebijakan | Agregasi tracer |
| POST /api/v1/humanis/submissions | Guru | Kirim kinerja milik sendiri |

## Validasi API

- Validasi tipe, rentang, format, dan ukuran input di server.
- Gunakan pagination dan batas maksimum untuk daftar serta ekspor.
- Filter periode dan moduleId harus divalidasi terhadap scope pengguna.
- POST/PUT/DELETE sensitif memerlukan perlindungan CSRF atau mekanisme setara untuk sesi cookie.
- Respons error tidak membocorkan stack trace, credential, keberadaan record privat, atau query database.
- Rate limit diterapkan pada login, reset sandi, upload, pencarian, ekspor, dan endpoint yang menimbulkan biaya.
- Audit event dibuat untuk perubahan role, konfigurasi indikator/tarif, keputusan, verifikasi pembayaran, dan ekspor sensitif.
- Jangan mempercayai nilai role, studentId, amount, atau verificationStatus dari browser tanpa validasi server.

## Ekspor

Ekspor menggunakan filter dan permission yang sama seperti layar. Untuk file sensitif, buat file privat dan tautan unduh sementara. Ekspor PowerPoint Humanis Insight berstatus opsional sampai isi dan template disetujui.
