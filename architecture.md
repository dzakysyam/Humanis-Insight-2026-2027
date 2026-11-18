# Arsitektur Kerja Humanis Insight

## Prinsip

Mulai dengan modular monolith: satu aplikasi web, satu identitas pengguna, dan batas domain yang jelas. Jangan membangun banyak microservice sebelum skala atau kebutuhan teknis membenarkannya.

## Stack kerja

Proposal v1.1 menyebut Node.js LTS, Next.js, Prisma, PostgreSQL, dan Nginx. Ini baseline sementara sampai hosting sekolah dan PRD lengkap dikonfirmasi.

- Frontend dan server web: Next.js dengan TypeScript.
- Basis data: PostgreSQL.
- Pilih Prisma atau migrasi Supabase sebagai alur migrasi utama. Jangan memelihara dua sumber migrasi yang bersaing.
- Autentikasi: satu penyedia identitas pusat.
- Penyimpanan file: object storage privat dengan URL bertanda tangan dan masa berlaku pendek.
- Background task hanya untuk pekerjaan yang memang perlu, misalnya ekspor, impor, atau sinkronisasi.

Supabase dapat dipakai jika sekolah menyetujui hosting dan kontrol datanya. Plugin Supabase membantu agent menggunakan produk dan dokumentasi, tetapi tidak menentukan arsitektur produksi.

## Alur data

1. Pengguna login melalui penyedia identitas platform.
2. Server memuat identitas, role, dan penugasan modul.
3. Server memeriksa izin untuk setiap halaman, API, file, ekspor, dan record.
4. Petugas memperbarui data pada modul sumber.
5. Modul menghasilkan ringkasan untuk periode tertentu.
6. Dashboard Kepala Sekolah membaca ringkasan dengan sumber, periode, status, dan waktu pembaruan.
7. Saat pengguna membuka detail, server memeriksa izin lagi sebelum mengirim data.

## Domain dan pemilik data

| Domain | Data utama |
| --- | --- |
| Identity | Akun, role, status akun, penugasan modul |
| Humanis Insight | Periode, indikator, pengajuan, bukti, review, skor, keberatan, keputusan |
| Finance | Jenis biaya, tagihan, pembayaran, verifikasi, laporan |
| Alumni/Tracer | Alumni, angkatan, respons, persetujuan, ringkasan |
| Tata Usaha | Surat, arsip, kepegawaian, laporan yang disepakati |
| Modul lain | Data operasional sesuai domain dan owner |
| Dashboard Kepala Sekolah | Status dan ringkasan dari modul sumber |

Dashboard tidak menjadi tempat menulis ulang seluruh data sumber. Ringkasan dapat dihitung ketika diminta atau disimpan sebagai snapshot terkontrol.

## SSO dan RBAC

SSO dalam platform berarti satu login/session untuk modul yang berada di aplikasi. Integrasi login Google atau sistem eksternal sekolah belum otomatis termasuk.

- Role disimpan dan diverifikasi di server.
- Penugasan modul dipisahkan dari role umum bila PIC hanya mengelola bidang tertentu.
- Menu adalah navigasi, bukan lapisan keamanan.
- Data Siswa dibatasi ke identitas Siswa yang telah dipetakan.
- Kepala Sekolah membaca ringkasan lintas domain sesuai kebijakan. Detail sensitif tetap mengikuti izin khusus.

## Kontrak ringkasan dashboard

Setiap ringkasan memuat moduleId, nama sumber, periode, waktu pembaruan, status data, nilai, definisi metrik, dan tujuan detail yang diizinkan. Status data dapat berupa tersedia, kosong, usang, tidak tersedia, atau segera hadir.

Kegagalan satu modul tidak boleh membuat data modul lain hilang. Jangan menyebut integrasi real-time jika mekanisme refresh tidak mendukungnya.

## Repository lama

Repository lama berisi beberapa aplikasi PHP/MySQL yang terpisah. Gunakan untuk memahami proses dan nama data. Jangan gabungkan source code atau database langsung. Petakan skema, cek kepemilikan kode, sanitasi data, dan port hanya komponen yang disetujui.

## Lingkungan

- Local memakai data sintetis.
- Staging meniru produksi tanpa data pribadi nyata.
- Secret berada di server atau secret manager, bukan Git dan bukan browser.
- Perubahan database memakai migration versioned.
- Uji backup dan restore sebelum pemindahan data atau rilis.
