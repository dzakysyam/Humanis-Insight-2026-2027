# Humanis Insight - SMK Tiara Nusa One

Platform manajemen kinerja dan pusat monitoring Kepala Sekolah SMK Tiara Nusa One berbasis web dengan **SSO internal** dan **RBAC** per role.

## Fitur Tahap 1

- **Landing Page & Model 3D Ringan:** Profil 7 Nilai HUMANIS, daftar modul sekolah, dan model 3D interaktif sudut gedung & lapangan SMK Tiara Nusa (HTML5 Canvas murni, tanpa dependensi WebGL berat).
- **SSO Internal & RBAC 6 Role:** Login berbasis NIP (pegawai) dan NISN (siswa) dengan sesi cookie `HttpOnly` bertanda tangan HMAC-SHA256, rate limiting login, audit log, serta isolasi penuh untuk role **Siswa**.
- **Dashboard & Navbar Kepala Sekolah:** Ringkasan indeks kinerja (Mode Demo), grafik capaian per bidang, proporsi capaian, antrean persetujuan, dan 4 grup navigasi (Umum, Pengawasan & Evaluasi, Konfigurasi & Master Data, Sistem).
- **Modul Humanis Insight:** Pelaporan kinerja PIC/Guru (progres 25%/50%/75%/100%, 7 Nilai HUMANIS, refleksi, RTL), review dan validasi Kepala Sekolah, refleksi eksekutif, cetak laporan, serta CRUD Master Bidang, Master KPI, Periode Aktif, dan Profil Sekolah.
- **Kelola User & Akses:** Penambahan akun SSO baru, penugasan role, status aktif/nonaktif akun, dan matriks akses modul per role (khusus Kepala Sekolah & Admin).

## Prasyarat

- **Node.js** `>= 20.19.0`
- **npm** (bawaan Node.js)

## Cara Menjalankan di Lokal

1. **Install dependensi workspace:**
   ```bash
   npm install
   ```

2. **Generate Prisma Client (wajib sekali setelah install):**
   ```bash
   npm run prisma:generate
   ```

3. **Siapkan environment (opsional untuk lokal):**
   Salin `.env.example` menjadi `.env` bila ingin mengatur nilai environment sendiri. Tanpa `DATABASE_URL`, aplikasi otomatis berjalan menggunakan penyimpanan in-memory **Mode Demo**.
   ```bash
   cp .env.example .env
   ```

4. **Jalankan server pengembangan:**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` di browser Anda.

## Akun Demo Lokal (Mode Demo)

Hanya aktif di luar `NODE_ENV=production`. Kata sandi semua akun demo: **`DemoHumanis2026!`**

| Role | Identitas Login | Tujuan Default |
| --- | --- | --- |
| Kepala Sekolah | `9000000000000001` (NIP) | `/dashboard` |
| Admin | `9000000000000002` (NIP) | `/dashboard` |
| Bimbingan dan Konseling (BK) | `9000000000000003` (NIP) | `/dashboard` |
| Guru | `9000000000000004` (NIP) | `/dashboard` |
| Tata Usaha | `9000000000000005` (NIP) | `/dashboard` |
| Siswa | `9000000001` (NISN) | `/siswa` |

## Perintah Penting

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan Next.js (`http://localhost:3000`) |
| `npm run build` | Build produksi frontend Next.js |
| `npm run start` | Menjalankan hasil build produksi |
| `npm run lint` | Pemeriksaan ESLint seluruh workspace |
| `npm run typecheck` | Pemeriksaan TypeScript pada `backend` dan `frontend` |
| `npm run test` | Menjalankan seluruh unit & integration test (Vitest) |
| `npm run verify` | Menjalankan format check, lint, typecheck, test, dan build |

## Struktur Proyek

```text
.
├── backend/                  # Domain, application use cases, infrastructure, HTTP controllers, Prisma schema
│   ├── prisma/schema.prisma  # Skema database PostgreSQL (Prisma 7)
│   ├── src/                  # Clean Architecture (domain / application / infrastructure / interface)
│   └── tests/                # Tes unit, arsitektur lapisan, SSO, RBAC, dan alur Humanis Insight
├── frontend/                 # Next.js 16 App Router + Tailwind CSS v4
│   ├── src/app/              # Halaman UI dan route handler /api/v1/*
│   ├── src/components/       # Komponen UI (auth, layout, humanis, admin, landing 3D)
│   └── tests/                # Tes navigasi berbasis role
└── *.md                      # Dokumen acuan proyek (prd.md, design.md, rbac-matrix.md, security.md, dll.)
```

## Catatan Keamanan

- Jangan pernah meng-commit file `.env`, dump SQL, atau kredensial produksi ke repository.
- Pada mode lokal tanpa `DATABASE_URL`, seluruh perubahan data (bidang, KPI, laporan, role user) tersimpan in-memory dan akan kembali ke data demo saat server di-restart.