# Perangkat Kerja Agent

Dokumen ini mencatat alat yang disarankan untuk pengembangan Humanis Insight. Periksa kompatibilitas dan instruksi versi terbaru sebelum instalasi. Jangan menginstal paket global, mengubah konfigurasi akun, atau menghubungkan database produksi tanpa persetujuan pemilik proyek.

## Urutan dasar

| Urutan | Alat | Kegunaan | Aturan pemakaian |
| --- | --- | --- | --- |
| 1 | Playwright CLI | Buka aplikasi, ambil screenshot, snapshot DOM, periksa alur dan ukuran layar | Screenshot membantu review visual. Kerapian tetap perlu dinilai dengan kriteria atau review manusia |
| 2 | Supabase Plugin | Dokumentasi, skill, dan MCP untuk proyek yang memang memakai Supabase | Jangan menganggap Supabase sebagai keputusan database. Proposal menyebut PostgreSQL; provider final belum disahkan |
| 3 | Frontend Design dari Anthropic | Arahkan proses desain yang spesifik pada konteks produk | Gunakan bersama design.md. Hindari menyalin output generik |
| 4 | Strix | Pengujian keamanan aplikasi web dan API | Hanya pada aplikasi lokal atau staging yang pemiliknya mengizinkan |
| 5 | Context7 | Ambil dokumentasi library dan API yang sesuai versi terbaru | Gunakan saat menyentuh framework, database client, autentikasi, atau library |

## Instalasi dan referensi

### Playwright CLI

Panduan resmi: [Playwright CLI](https://playwright.dev/agent-cli/installation) dan [Microsoft Playwright](https://github.com/microsoft/playwright).

```bash
npm install -g @playwright/cli@latest
playwright-cli install-browser
playwright-cli --help
```

Gunakan perintah `open`, `screenshot`, `snapshot`, dan interaksi yang tersedia pada versi terpasang. Periksa `playwright-cli --help` jika nama opsi berubah. Untuk automated regression suite, gunakan Playwright Test sebagai paket terpisah. Screenshot otomatis tidak dengan sendirinya mendeteksi semua masalah desain. Tambahkan assertions untuk overflow, elemen penting, console error, serta tinjau screenshot desktop dan mobile.

### Supabase Plugin

Sumber: [Supabase Plugin](https://github.com/supabase-community/supabase-plugin), [panduan plugin](https://supabase.com/docs/guides/ai-tools/plugins), [Supabase Agent Skills](https://supabase.com/docs/guides/ai-tools/ai-skills).

```bash
npx plugins add supabase-community/supabase-plugin
```

Pasang hanya bila keputusan arsitektur memilih Supabase. Sebelum menyambungkan MCP, pastikan proyek, akun, izin, dan environment yang dipakai benar. Gunakan proyek lokal atau staging untuk migrasi dan eksperimen. Jangan memberi agent akses tulis ke produksi untuk membuat skema atau mengubah data.

### Frontend Design

Sumber: [Anthropic frontend-design skill](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md).

Skill ini menjadi cara kerja untuk merencanakan, membuat, lalu mengkritik hasil desain. `design.md` tetap memegang token, navigasi, dan aturan khusus Humanis Insight. Keputusan produk tidak boleh diganti hanya karena skill menyarankan pola visual lain.

### Strix

Sumber: [Strix](https://github.com/usestrix/strix), [quick start](https://github.com/usestrix/strix/blob/main/docs/quickstart.mdx).

```bash
curl -sSL https://strix.ai/install | bash
```

Strix memerlukan Docker yang aktif dan API key provider model. Jalankan hanya terhadap aplikasi milik tim pada lokal atau staging. Contoh target lokal:

```bash
strix --target ./path-to-app
```

Jangan menjalankan scan aktif terhadap domain sekolah, vendor, atau sistem pihak ketiga tanpa izin tertulis. Tinjau temuan satu per satu, reproduksi dengan aman, lalu catat hasil dan perbaikannya. Scan otomatis bukan sertifikasi keamanan.

### Context7

Sumber: [Context7](https://github.com/upstash/context7), [panduan Codex](https://github.com/upstash/context7/blob/master/docs/clients/codex.mdx), [panduan Claude Code](https://github.com/upstash/context7/blob/master/docs/clients/claude-code.mdx).

Claude Code:

```bash
npx ctx7 setup --claude
```

Codex:

```bash
npx ctx7 setup --codex
```

Ikuti alur autentikasi yang muncul. Bila setup CLI tidak sesuai lingkungan, gunakan konfigurasi manual terbaru dari dokumentasi resmi. Jangan menaruh API key ke repository.

## Alat desain tambahan

| Alat | Sumber | Gunakan untuk | Batas |
| --- | --- | --- | --- |
| SkillUI | [kachamo/SkillUI](https://github.com/kachamo/SkillUI) | Membaca token dan pola visual dari situs referensi yang diizinkan | Pastikan hak akses dan lisensi aset. Ambil pola, jangan menyalin merek atau konten |
| UI UX Pro Max | [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Ide pola UI lintas platform | Pilih satu rekomendasi yang sesuai design.md, bukan mengikuti semua output |
| 21st.dev MCP | [21st.dev MCP](https://21st.dev/mcp) | Menemukan atau menghasilkan komponen UI | Periksa lisensi, dependensi, aksesibilitas, dan kecocokan visual sebelum menambahkan |
| Taste | [Taste Skill](https://github.com/Leonxlnx/taste-skill) | Arahan art direction dan review tampilan lewat browser | Berorientasi website; pakai sebagai tambahan dan cocokkan dengan design.md |
| Anti-slop | [miqdadbadjuber/anti-slop](https://github.com/miqdadbadjuber/anti-slop) | Filter pola UI, copy, dan kode yang terasa generik | Skill UI bernama `antislop-ui`; perintah `/antislop` bukan perintah universal |
| Awesome DESIGN.md | [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) | Referensi design system terbuka untuk mempelajari cara dokumentasi visual | Referensi pola dan struktur saja. Humanis Insight tetap memakai token dan identitasnya sendiri |
| Vibecoders Checklist | [vibecoderscheck](https://vibecoderscheck.com/) | Pemeriksaan tambahan pada hasil yang dapat diakses | Jangan jadikan pengganti pengujian autentikasi, backend, atau security review |

Instalasi skill anti-slop melalui Skills CLI, sesuai petunjuk repository:

```bash
npx skills add miqdadbadjuber/anti-slop --skill antislop-ui -a claude-code
```

Nama opsi CLI dapat berubah. Periksa README upstream jika perintah ditolak. Untuk review UI di agent lain, pasang skill ke agent yang sesuai atau baca aturan `antislop-ui` secara langsung. Ikuti `design.md` sebagai arah visual dan pakai anti-slop sebagai pemeriksaan kualitas, bukan sebagai pengganti brief produk.

Tidak perlu memasang semua skill desain sekaligus. Mulai dari `design.md` dan satu skill frontend; tambahkan alat lain hanya untuk kebutuhan konkret. Banyak skill desain yang sama-sama aktif dapat memberi arahan bertentangan dan menambah konteks tanpa memperbaiki hasil.

## Ponytail untuk Claude Code dan Codex

Sumber resmi proyek: [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail). Periksa petunjuk host agent di [INSTALL.md](https://github.com/DietrichGebert/ponytail/blob/main/INSTALL.md). Instal hanya dari repository atau paket npm yang ditautkan repository tersebut.

Ponytail dipakai untuk mencari solusi terkecil yang lengkap, memakai ulang kode yang sudah ada, dan menghindari abstraksi atau dependensi tanpa alasan. Terapkan prinsipnya tanpa menghapus validasi input, pemeriksaan akses backend, audit log, aksesibilitas, test keamanan, atau pengujian kritis. Hemat token dengan membaca dokumen sesuai task, bukan dengan melewatkan pemeriksaan penting.

## Skill di repo ini

Folder `.claude/skills/` pada repo ini berisi dua kelompok skill.

### Skill teknis proyek

Ditulis khusus untuk Humanis Insight dan mengikuti stack baseline (Next.js, TypeScript, Prisma, PostgreSQL, Nginx) serta aturan keamanan pada `security.md`. Setiap skill memuat pemicu, langkah, contoh, perintah verifikasi, dan jebakan khas proyek ini.

Pintu masuknya adalah `.claude/skills/humanis-stack-guide/SKILL.md`. Skill itu memetakan setiap topik teknis ke skill pengalahnya dan menjelaskan urutan prioritas antar skill. Baca itu dulu, baru pilih skill yang sempit.

Kelompok skill yang tersedia:

| Kelompok | Skill |
| --- | --- |
| Batas masuk dan protective | `rate-limiting`, `throttling`, `api-gateway`, `ssl-tls`, `ddos-mitigation`, `payload-limits`, `jwt-auth`, `config-and-secrets` |
| Kinerja dan sumber daya | `caching`, `load-balancing`, `reverse-proxy`, `timeouts`, `retry-backoff`, `memory-leaks-oom`, `disk-io-performance`, `tcp-port-exhaustion` |
| Data dan query | `n-plus-one-queries`, `sql-injection-defense`, `query-builder`, `missing-indexes`, `index-fragmentation`, `db-connection-pool`, `database-seeding` |
| Kebenaran dan keamanan data | `idempotency`, `distributed-transactions`, `deadlock-race-condition`, `db-deadlock-storm`, `concurrent-safety`, `type-safety-checks`, `json-handling` |
| Operasional | `cicd-pipeline`, `docker-containerization`, `kubernetes-deployment`, `health-checks`, `logging-monitoring`, `message-queues` |
| Protokol lanjutan | `grpc-services`, `websockets-realtime` |

Tiga di antaranya (`grpc-services` dan `websockets-realtime`, serta sebagian `kubernetes-deployment`) menjawab kebutuhan yang belum ada di release awal. Isinya menjelaskan kondisi, biaya, dan syaratnya, bukan anjuran memasang.

### Skill pihak ketiga

Dipasang dari registry skill pihak ketiga dengan `npx skills add <owner/repo> -a claude-code`. Semuanya berjalan dengan izin agent penuh, jadi baca SKILL.md-nya sebelum dipakai.

| Paket | Skill yang terpasang | Catatan |
| --- | --- | --- |
| `dietrichgebert/ponytail` | `ponytail`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help`, `ponytail-review` | Prinsip solusi terkecil yang lengkap |
| `obra/superpowers` | `brainstorming`, `writing-plans`, `executing-plans`, `subagent-driven-development`, `dispatching-parallel-agents`, `systematic-debugging`, `test-driven-development`, `verification-before-completion`, `writing-skills`, `using-git-worktrees`, `using-superpowers`, `requesting-code-review`, `receiving-code-review`, `finishing-a-development-branch`, `diagnosing-superpowers` | Alur kerja terstruktur |
| `addyosmani/agent-skills` | `code-review-and-quality`, `security-and-hardening`, `frontend-ui-engineering`, `performance-optimization`, `ci-cd-and-automation`, `test-driven-development`, `observability-and-instrumentation`, `api-and-interface-design`, `spec-driven-development`, `source-driven-development`, `constraint-driven-development`, `context-engineering`, `debugging-and-error-recovery`, `deprecation-and-migration`, `documentation-and-adrs`, `code-simplification`, `doubt-driven-development`, `git-workflow-and-versioning`, `idea-refine`, `incremental-implementation`, `interview-me`, `planning-and-task-breakdown`, `shipping-and-launch`, `browser-testing-with-devtools`, `using-agent-skills` | Review multi-dimensi |
| `juliusbrussee/caveman` | `caveman` beserta varian `caveman-commit`, `caveman-review`, `caveman-compress`, `caveman-stats`, `caveman-help`, `caveman-setup`, `caveman-discover`, `caveman-evidence-review`, `caveman-explore`, `caveman-learn`, `caveman-manage`, `caveman-optimize`, `cavecrew`, `investigate-first`, `lean-build`, `megacave`, `migration`, `safe-refactor`, `surgical-patch`, `ultracave`, `verify-and-stop` | Gaya ringkas dan commit ringkas |
| `pbakaus/impeccable` | `impeccable` | Review kualitas UI |
| `nextlevelbuilder/ui-ux-pro-max-skill` | `ui-ux-pro-max` | Ide pola UI lintas platform |
| `tt-a1i/archify` | `archify` | Arsitektur dan diagram |
| `graphify-labs/graphify` | `graphify` | Graph dan visualisasi |
| `egonex-ai/understand-anything` | `understand` | Memahami codebase yang sudah ada |
| `composiohq/awesome-claude-skills` | `artifacts-builder`, `brand-guidelines`, `canvas-design`, `changelog-generator`, `internal-comms`, `mcp-builder`, `template-skill`, `theme-factory`, `webapp-testing` | Hanya subset yang relevan |

Daftar panjang `awesome-claude-skills` juga memuat `raffle-winner-picker`, `youtube-downloader`, `twitter-algorithm-optimizer`, `competitive-ads-extractor`, `domain-name-brainstormer`, `slack-gif-creator`, `tailored-resume-generator`, `invoice-organizer`, `lead-research-assistant`, `meeting-insights-analyzer`, `file-organizer`, `developer-growth-analysis`, `content-research-writer`, `image-enhancer`, `connect`, `connect-apps`, `langsmith-fetch`, `skill-share`, dan `skill-creator`. Semuanya tidak dipasang karena tidak relevan dengan platform sekolah, dan `skill-creator` sengaja tidak dipasang agar tidak bentrok dengan skill resmi.

### Aturan memakai banyak skill sekaligus

- Untuk satu tugas UI, pakai satu skill desain saja. `design.md` tetap menentukan token, navigasi, dan copy.
- Untuk satu tugas coding, pilih skill teknis dari `.claude/skills/` yang paling dekat dengan gejala, bukan skill yang paling banyak.
- `ponytail` dan `superpowers` boleh aktif bersama karena keduanya soal proses, bukan isi domain.
- Skill yang mengulang isi skill teknis proyek (misalnya `ci-cd-and-automation` dari Addy Osmani dan `cicd-pipeline` milik kita) dipakai berbeda: yang milik kita terikat pada gate rilis dan route Humanis Insight, yang dari pihak ketiga dipakai sebagai checklist umum.

### Peringatan keselamatan skill

- `caveman-compress` mengirim isi berkas ke penyedia model eksternal. Jangan menjalankannya pada berkas berisi data siswa, data keuangan, `.env`, dump, atau `audit_events`.
- `webapp-testing` dan `browser-testing-with-devtools` menjalankan browser. Pastikan target lokal atau staging yang diizinkan dan memakai data sintetis.
- `mcp-builder` menulis konfigurasi MCP. Periksa server yang ditunjuk dan jangan pernah menunjuk ke produksi.

## Kriteria alat siap dipakai

- Versi dan sumber instalasi dicatat.
- Tidak ada secret di prompt, output, screenshot, log, commit, atau file dokumentasi.
- Screenshot dan laporan security tidak memuat data pribadi produksi.
- Semua scan aktif dibatasi pada target lokal atau staging yang disetujui.
- Hasil tool adalah masukan untuk review, bukan bukti otomatis bahwa aplikasi aman atau desainnya baik.