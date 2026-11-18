# Rancangan Basis Data

Dokumen ini menetapkan batas domain dan aturan data. Nama tabel final dibuat melalui migration setelah stack dan kebijakan sekolah disahkan. Jangan mengimpor dump database lama sebagai seed.

## Model inti

| Entitas | Fungsi |
| --- | --- |
| users | Akun login dan identitas internal |
| roles | Admin, Kepala Sekolah, Guru, PIC, Bendahara/TU, Siswa |
| user_roles | Relasi akun dengan role bila multi-role disetujui |
| module_assignments | Relasi pengguna dengan modul yang ditugaskan |
| students | Identitas siswa minimum dengan studentId internal |
| academic_years | Tahun ajaran dan status aktif |
| modules | Registry nama, release, owner, status, dan navigasi |
| module_report_snapshots | Ringkasan modul per periode, sumber, status, dan waktu |
| audit_events | Aktor, aksi, target, waktu, requestId, metadata aman |

Jangan memakai nama lengkap atau NISN sebagai primary key. Simpan field identitas seperlunya dan batasi role yang dapat membacanya.

## Humanis Insight

Entitas konseptual: performance_periods, indicators, indicator_weights, performance_submissions, evidence_files, reviews, scores, recommendations, final_decisions, appeals.

Simpan versi indikator dan bobot yang digunakan agar skor lama dapat dijelaskan. Rekomendasi sistem dan keputusan Kepala Sekolah adalah record serta status yang berbeda.

## Keuangan siswa

Entitas konseptual:

- fee_types: SPP, biaya SPMB, biaya tahunan, dan kategori yang disetujui.
- fee_schedules: tarif berdasarkan tahun ajaran atau ketentuan lain.
- student_charges: kewajiban tagihan siswa untuk satu periode.
- payment_transactions: nominal, tanggal, metode, referensi, status, pembuat.
- payment_allocations: alokasi pembayaran ke tagihan.
- payment_verifications: verifikator, keputusan, alasan, waktu.
- receipts: nomor kwitansi dan referensi transaksi bila kwitansi termasuk scope.

Aturan hitung awal:

- Total dibayar menghitung alokasi dari transaksi yang sudah terverifikasi.
- Kekurangan dihitung dari tagihan pada periode laporan dikurangi alokasi terverifikasi, minimum nol.
- Pembayaran sebagian mengurangi sisa secara proporsional.
- Status menunggu verifikasi tidak dihitung sebagai lunas.
- Pembayaran lebih, pembatalan, refund, tanggal jatuh tempo, dan alokasi lintas tagihan perlu keputusan sekolah.
- Definisi persentase laporan harus menetapkan pembagi, periode, dan pembulatan. Pilihan yang perlu diputuskan: nominal terbayar dibagi total tagihan, atau jumlah siswa lunas dibagi jumlah siswa yang ditagih.

Jangan aktifkan gateway, VA, QRIS, notifikasi tagihan, dan rekonsiliasi bank tanpa persetujuan serta integrasi resmi.

## Tracer Study

Entitas konseptual: alumni_profiles, tracer_campaigns, tracer_responses, tracer_consents, tracer_metrics.

- Hubungkan profil alumni dengan studentId dan tahun lulus bila dasar pemetaan disetujui.
- Deduplicasi respons membutuhkan pengenal yang disetujui. Jangan menjadikan email sebagai kunci utama.
- Simpan persetujuan, waktu persetujuan, dan tujuan penggunaan data.
- Batasi kontak dan jawaban individu terpisah dari laporan agregat.
- Google Forms/Sheets dapat menjadi sumber sementara hanya bila sekolah menyetujui. Credential tidak boleh masuk browser atau Git.

Formula minimum:

- Tingkat respons = responden unik dibagi total lulusan angkatan yang sama.
- Persentase status = responden valid pada status tersebut dibagi seluruh responden valid.
- Jika pembagi tidak tersedia, tampilkan Belum tersedia.

## Ringkasan dashboard

Snapshot laporan menyimpan moduleId, periodStart, periodEnd, generatedAt, sourceVersion, dataStatus, metricDefinitions, dan metrics. Hindari menyalin identitas siswa ke snapshot dashboard.

Gunakan foreign key, unique constraint, indeks pada periode/status/moduleId, transaksi untuk perubahan atomik, dan audit event untuk tindakan yang berdampak. Penghapusan atau koreksi mengikuti kebijakan retensi sekolah.

## Seed dan migrasi

- Seed memakai nama, nomor, dan file sintetis yang jelas fiktif.
- Jangan commit .env, dump berisi data nyata, upload bukti, jawaban alumni, atau hash password produksi.
- Perubahan skema memakai migration versioned.
- Dokumentasikan transformasi dari skema lama dan lakukan rekonsiliasi sebelum pemindahan data.
- Persetujuan pemilik data diperlukan sebelum data produksi dipindahkan.
