# Rencana Delivery

## Tahap 0: Validasi sumber dan keamanan

- Minta PRD lengkap v1.0 dan revisi formal SRS/Proposal.
- Sahkan daftar sembilan modul yang melapor ke Dashboard Kepala Sekolah.
- Tangani credential dan dump SQL dari repository lama, termasuk rotasi serta pembersihan history.
- Tetapkan hosting, DB, identitas, owner data, dan staging.
- Setujui role Siswa serta batas laporan keuangan.

## Tahap 1: Fondasi

- Susun monorepo tim, aturan branch, secret scanning, CI, env example tanpa credential, dan README.
- Buat theme token, app shell, navigasi tiga grup, session, identity, RBAC, audit log.
- Buat registry modul dan kontrak ringkasan laporan.
- Siapkan data sintetis dan harness screenshot Playwright.

## Tahap 2: Release 1

- Implementasi Humanis Insight: periode, indikator, pengajuan guru, bukti, review, skor, rekomendasi, keputusan, keberatan.
- Implementasi Dashboard Kepala Sekolah dengan status laporan lintas modul.
- Pastikan modul yang belum terintegrasi tampil sebagai Belum tersedia atau Segera Hadir.
- Kunci aturan keputusan dan indikator sebelum menghitung skor produksi.

## Tahap 3: Release 2

Urutan prioritas sekolah: Tracer Study terlebih dahulu, lalu Keuangan Terpadu.

- Tracer Study: sumber respons, deduplikasi, consent, ringkasan per angkatan, ekspor berizin.
- Keuangan: jenis tagihan, student ledger, total pembayaran terverifikasi, kekurangan, laporan bulanan/semester.
- Jangan mengaktifkan gateway sebelum persetujuan dan integrasi.

## Tahap 4: Release 3

- Tata Usaha, Kurikulum, Sarana dan Prasarana, Humas sesuai scope yang disetujui.
- Rinci pemilik proses, formulir, status, dan laporan tiap bidang.
- Hubungkan ringkasan modul ke dashboard pusat.

## Tahap 5: Release 4 placeholder

- Akademik, Kesiswaan, Absensi, dan Perpustakaan menampilkan “Segera Hadir”.
- Tidak ada formulir atau tindakan yang tampak aktif tanpa fitur yang tersedia.

## Gate rilis

1. Scope dan acceptance criteria disetujui.
2. Security gate pada security.md lulus.
3. Test plan dan UAT per role selesai.
4. Backup, restore, observability, biaya, dan dukungan operasional siap.
5. Demo dan data produksi terpisah.
