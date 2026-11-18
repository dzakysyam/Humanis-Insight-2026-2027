# Instruksi Coding Agent

## Mulai dari konteks secukupnya

1. Baca `README.md` dan `source-of-truth.md`.
2. Baca hanya dokumen yang relevan dengan perubahan. Lihat daftar pemetaan di README.
3. Periksa struktur dan pola repository saat ini sebelum mengedit. Jangan menyalin repository sekolah lama secara utuh.

## Aturan produk

- Humanis Insight adalah pusat monitoring Kepala Sekolah. Sembilan modul bidang memberi ringkasan atau status ke dashboard. Nama final sembilan modul masih menunggu pengesahan.
- Prioritas sekolah: Humanis Insight, Tracer Study, lalu Tata Usaha terutama laporan keuangan siswa.
- Role Siswa akan tersedia. Haknya belum rinci; jangan menambahkan aksi atau akses melebihi data milik siswa sendiri.
- Sumber terbaru dan perubahan scope dicatat di `source-of-truth.md` serta `scope-alignment.md`.
- Proposal atau prototipe tidak membuktikan fitur sudah tersedia di produksi.

## Cara mengerjakan

- Kerjakan satu alur pengguna atau satu perubahan kecil per iterasi.
- Sebelum coding, sebutkan file dan alur yang akan terdampak. Pilih reuse kode yang ada sebelum menambah abstraksi.
- Gunakan `design.md` untuk seluruh keputusan UI. Bahasa UI Bahasa Indonesia dan hindari em dash.
- Gunakan Context7 untuk dokumentasi versi library terkini bila tersedia.
- Untuk perubahan UI, buka aplikasi dengan Playwright, periksa console, ambil screenshot, dan tinjau desktop serta mobile.
- Untuk perubahan backend, data, RBAC, atau pembayaran, cek akses positif dan negatif serta validasi sisi server.
- Jalankan hanya pemeriksaan yang relevan. Jangan menyatakan pemeriksaan lulus bila belum dijalankan.

## Keamanan dan data

- Semua otorisasi harus dicek di server untuk setiap endpoint, record, unduhan, dan ekspor.
- Rahasia hanya di environment server atau secret manager. Jangan pernah menulis ke source, prompt, screenshot, atau log.
- Validasi dan batasi semua input; gunakan query berparameter; terapkan rate limit dan batas biaya pada endpoint mahal.
- Jangan mengarang data produksi. Fixture harus sintetis dan diberi label demo.
- Jangan menandai pembayaran sebagai terverifikasi tanpa aksi petugas berwenang atau sumber tepercaya.
- Hanya uji Strix pada lokal atau staging yang pemiliknya izinkan.
- Waspadai credential dan dump data pribadi yang terlacak pada repository lama. Ikuti `repository-audit.md` dan `security.md`.

## Batas token

- Jangan memuat seluruh paket dokumen sekaligus. Ikuti rute baca dalam README.
- Ringkas temuan relevan, lalu tunjukkan perubahan dan pemeriksaan yang dilakukan.
- Hindari membuat file, framework, dependensi, abstraksi, atau refactor di luar kebutuhan task.
- Ikuti Ponytail jika terpasang, tetapi jangan memotong validasi, kontrol akses, aksesibilitas, keamanan, atau tes alur penting.
