# Keamanan dan Gate Deployment

## Temuan yang sudah diketahui

Repository sumber yang diberikan dapat di-clone dan memuat file environment terlacak serta dump SQL dengan data akun dan informasi sekolah/siswa. Lihat repository-audit.md. Nilai sensitif tidak disalin ke dokumen ini.

Anggap credential yang pernah tercommit sudah terekspos:

1. Rotasi password database, encryption key, OAuth/API token, email, dan layanan terkait yang mungkin dipakai.
2. Hapus rahasia dari file kerja dan history Git. Menghapus file di commit terbaru tidak menghapus commit lama.
3. Pastikan repository baru tidak menerima .env, data dump produksi, upload bukti, atau data responden.
4. Ganti dump dengan migration skema dan seed sintetis.
5. Aktifkan secret scanning sebelum push.

## Kontrol wajib

### Auth dan akses

- Validasi sesi dan role di server pada setiap halaman, action, endpoint, file, dan ekspor.
- Gunakan least privilege dan pembatasan berdasarkan kepemilikan record.
- Siswa tidak boleh membaca data siswa lain dengan mengganti ID atau URL.
- Jangan menyimpan service-role key, database password, encryption key, atau private API key pada frontend, source map, log, atau prompt publik.
- Regenerasi session identifier setelah login. Terapkan cookie Secure, HttpOnly, SameSite yang sesuai, masa sesi, logout server, dan perlindungan CSRF.
- Batasi percobaan login dan reset akun dengan rate limiting.

### Input dan file

- Validasi semua input di server dengan schema allowlist dan batas ukuran.
- Escape output; jangan membangun query dari string pengguna.
- Untuk upload, periksa ekstensi, MIME, magic bytes, ukuran, nama file, hak akses, dan lokasi penyimpanan.
- Simpan bukti pembayaran serta dokumen kinerja pada storage privat.
- File dibuka melalui endpoint yang memeriksa izin dan URL bertanda tangan singkat.
- Hindari menulis data pribadi atau token ke log.

### API, biaya, dan ketersediaan

- Semua endpoint privat membutuhkan auth dan RBAC.
- Terapkan rate limit, timeout, pagination, batas payload, dan batas concurrency.
- Beri kuota dan alert biaya untuk layanan cloud, email, WhatsApp, storage, dan AI.
- Batasi request yang menjalankan ekspor besar, sinkronisasi, atau integrasi berbayar.
- Jangan mengandalkan frontend untuk validasi atau pembatasan akses.
- Gunakan allowlist CORS dan proteksi SSRF bila server mengambil URL dari input.

### Data pribadi

- Kumpulkan data minimum sesuai fungsi.
- Tentukan tujuan, dasar penggunaan, role yang dapat melihat, retensi, dan cara penghapusan.
- Data tracer individu dan kontak alumni dibatasi; ringkasan Kepala Sekolah sebaiknya agregat.
- Gunakan data sintetis untuk development dan screenshot.
- Ekspor sensitif menulis audit log dan memiliki akses serta masa simpan yang jelas.
- Jangan menampilkan NISN, nomor telepon, atau email penuh pada layar ringkasan bila tidak diperlukan.

### Operasional

- Simpan secrets di environment server atau secret manager.
- Pisahkan local, staging, dan production.
- Matikan debug dan pesan stack trace pada production.
- Tampilkan pesan error umum ke pengguna dan simpan detail aman di log server.
- Backup dienkripsi, akses dibatasi, serta proses restore diuji.
- Dependency dipin dan diperiksa sebelum upgrade.

## Gate wajib sebelum deploy

Deployment ditahan bila salah satu kondisi ini gagal:

- Endpoint privat tanpa autentikasi atau rate limit yang sesuai.
- Batas biaya cloud, kuota, atau alert belum dikonfigurasi.
- Secret key berada di browser atau repository.
- Input pengguna tidak divalidasi di server.
- Hak akses hanya dibatasi oleh UI dan belum diperiksa backend.
- Pengguna dapat membaca data milik role atau siswa lain.
- Dump produksi, file .env, atau credential berada pada commit.
- Export atau file bukti dapat diakses tanpa permission.
- Data demo terlihat sebagai data produksi.

## Security testing

- Jalankan pemeriksaan dependency, secret scan, dan static analysis pada branch.
- Pakai Playwright untuk alur role dan akses negatif.
- Jalankan Strix hanya pada aplikasi local/staging atau target yang dimiliki/diizinkan secara tertulis. Tetapkan scope dan batas request sebelum scan.
- Jangan menjalankan penetration test otomatis pada website sekolah live tanpa persetujuan eksplisit dan waktu yang disepakati.
- Catat severity, reproduksi aman, perbaikan, dan hasil retest.
