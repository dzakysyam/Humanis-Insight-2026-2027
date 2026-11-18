# Audit Stitch dan Prompt Perbaikan

## Ringkasan

Desain Stitch sudah punya identitas visual yang cocok untuk sekolah. Pertahankan navy, cream hangat, sidebar gelap, Plus Jakarta Sans, foto sekolah yang berizin, dan struktur modul.

Yang perlu diperbaiki:

1. Dashboard Kepala Sekolah terlalu padat. Utamakan laporan yang perlu ditindaklanjuti, progres Humanis Insight, dan status sembilan modul.
2. Semua angka contoh wajib diberi label Mode Demo dan Data Demo.
3. Hapus klaim real-time, sinkron otomatis, SSL, enkripsi, gateway, atau status produksi yang belum dibangun dan diverifikasi.
4. Pastikan nama modul dan label Release konsisten.
5. Empat halaman Rectangle pada ekspor PDF awal kosong. Abaikan halaman tersebut.
6. Ekspor yang diperiksa belum menunjukkan layar role Siswa.
7. Hindari ukuran teks seragam, label kapital penuh berulang, kartu identik, gradient neon, ikon roket, dan hiasan yang tidak menjelaskan data.

## Prompt untuk Google Stitch

Perbaiki layar Humanis Insight SMK Tiara Nusa yang saya lampirkan. Pertahankan identitas sekolah: navy, cream hangat, sidebar gelap, Plus Jakarta Sans, dan foto sekolah yang berizin. Jangan membuat ulang seluruh produk.

Dashboard Kepala Sekolah adalah pusat untuk memantau Humanis Insight dan sembilan modul bidang. Modul tetap memiliki halaman kerja masing-masing. Daftar final sembilan modul akan diberikan terpisah. Perlakukan Humas dan website publik sebagai modul terpisah sampai saya mengonfirmasi daftar tersebut.

Perbaiki Dashboard Kepala Sekolah:

- Kurangi kartu dan utamakan laporan yang perlu ditindaklanjuti, progres Humanis Insight, serta status modul.
- Tampilkan sumber modul, periode, waktu pembaruan, dan status pada setiap ringkasan.
- Beri label Mode Demo dan Data Demo pada angka simulasi.
- Hapus klaim real-time, sinkron otomatis, enkripsi, SSL, gateway, dan fitur produksi yang belum dikonfirmasi.
- Jika data kosong, tampilkan “Belum tersedia” beserta modul sumber. Jangan ganti dengan angka nol.

Tambahkan rancangan Dashboard Siswa:

- Siswa hanya melihat identitas dan data miliknya sendiri.
- Jangan tampilkan data siswa lain, kinerja guru, laporan internal, atau menu administrasi.
- Buat area tagihan dan riwayat pembayaran sebagai desain demo.
- Jangan aktifkan payment gateway, QRIS, VA, atau aksi bayar online.
- Unggah bukti pembayaran hanya menjadi pilihan desain yang menunggu konfirmasi sekolah.

Gunakan tiga grup sidebar yang sudah ditetapkan. Landing page Humas boleh memakai satu floating pill. Dashboard desktop boleh memakai command palette Ctrl+K untuk mencari menu dan laporan yang diizinkan. Web app ponsel memakai bottom tab bar dengan tiga sampai lima tujuan utama sesuai role.

Gunakan heading yang jelas, body 14 sampai 16 px, caption minimal 12 px, dan maksimal tiga tingkat heading per layar. Pakai Bahasa Indonesia sederhana. Hindari label generik, kapital penuh berulang, gradient neon, ikon roket, dekorasi tanpa informasi, dan kartu identik berlebihan. Pastikan fokus keyboard terlihat, kontras terbaca, dan tidak ada overflow horizontal.

Buat hanya layar yang diminta. Jangan menambah angka, nama, klaim, modul, atau fitur di luar brief. Tandai data simulasi sebagai Data Demo.

## Cara memakai

- Lampirkan screenshot layar target dari folder Stitch.
- Kerjakan satu layar per prompt agar perubahan tidak merusak layar lain.
- Review desktop dan mobile sebelum implementasi.
- Salin keputusan desain baru ke design.md. Output Stitch tidak menjadi kebijakan produk.
