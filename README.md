# Humanis Insight: Paket Vibe Coding v3

Paket ini menjadi konteks kerja Claude Code dan Codex untuk Humanis Insight SMK Tiara Nusa. Dokumen dibuat terpisah agar agent hanya membaca bagian yang diperlukan untuk tugas saat itu.

## Baca sesuai pekerjaan

1. Selalu mulai dari AGENTS.md atau CLAUDE.md, lalu README ini dan source-of-truth.md.
2. Fitur baru: baca prd.md, scope-alignment.md, rbac-matrix.md, lalu domain yang terkait di database-design.md dan api-contract.md.
3. Perubahan tampilan: baca design.md dan stitch-audit.md.
4. Perubahan auth, data, upload, export, endpoint, atau deployment: baca security.md.
5. Sebelum release: baca delivery-plan.md dan test-plan.md.
6. Periksa kondisi kode lama hanya lewat repository-audit.md. Jangan menyalin dump database atau konfigurasi rahasia.

Jangan memasukkan semua dokumen ke setiap prompt. Baca hanya dokumen yang relevan, kutip keputusan terkait, lalu kerjakan satu alur pengguna per perubahan.

## Isi paket

| Dokumen | Isi |
| --- | --- |
| source-of-truth.md | Urutan acuan, sumber yang tersedia, dan hal yang belum diterima |
| prd.md | Tujuan produk, prioritas, role, fitur, batasan, dan kriteria sukses |
| scope-alignment.md | Penyelarasan SRS, Proposal, catatan sekolah, Stitch, serta perubahan scope |
| design.md | Arah visual anti-template, layar, navigasi, data demo, dan perilaku responsif |
| stitch-audit.md | Temuan dari ekspor Stitch dan prompt revisi layar |
| architecture.md | Arsitektur modular dan cara modul menyuplai laporan ke dashboard |
| rbac-matrix.md | Matriks akses minimum setiap role |
| database-design.md | Model data domain, keuangan, Humanis Insight, alumni, dan agregasi laporan |
| api-contract.md | Kontrak minimum untuk dashboard, modul, role, dan laporan |
| security.md | Aturan keamanan dan temuan awal pada repository lama |
| test-plan.md | Pemeriksaan fungsi, akses, tampilan, data, dan keamanan |
| delivery-plan.md | Urutan kerja, dependency, dan gate release |
| skills.md | Playwright, Supabase, Strix, Context7, desain, dan Ponytail |
| repository-audit.md | Hasil pemeriksaan read-only atas dua repository yang diberikan |
| AGENTS.md | Instruksi ringkas lintas coding agent |
| CLAUDE.md | Entry point Claude Code |

## Batas keputusan

Catatan sekolah tanggal 7 November 2026 menetapkan urutan prioritas Humanis Insight, Tracer Study, lalu Tata Usaha terutama laporan keuangan. Pemilik proyek menambahkan role Siswa dan menjelaskan Humanis Insight sebagai pusat monitoring laporan dari sembilan modul. Beberapa detail operasional dan persetujuan scope masih terbuka. Jangan mengubah asumsi menjadi fitur aktif tanpa keputusan tertulis.

Repository tim yang diperiksa baru berisi README. Paket ini adalah spesifikasi kerja, bukan klaim bahwa seluruh modul telah dibangun.
