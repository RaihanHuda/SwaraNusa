# SwaraNusa Implementation Plan

> For agentic workers: implementation owner works inline with bounded content and backend subagents. Human explicitly authorized direct execution and subagents.

Goal: Ship a working local website at /Users/raii/Documents/SwaraNusa and provide a browser preview.
Architecture: Buildless HTML/CSS/ES modules; Node 24 HTTP server with SQLite for accounts, sessions and requests. No third-party npm dependencies. Serve on 127.0.0.1. Stage work in the chat workspace, copy the finished project to the explicitly requested folder, then run from there.
Spec: docs/konsep-dan-alur.md.

Constraints: Province-first, 10 provinces; four activity tabs; six content categories; browse without login; distinguish introduction from practice guide; sources on entries; actual missing-content states. No fabricated experts, prices, availability, videos or reviews. Clearly label demonstration accounts. Local preview only, no external publication requested.
Visual contract: warm ivory canvas, forest green and brown, expressive serif display with plain sans UI, large documented regional photography, magazine composition and numbered province rows. Reference SIGAP's action clarity and polish; preserve SwaraNusa's identity. Primary action is choosing a province. Targets 1440x900 and 390x844. Keyboard focus and reduced motion supported.

Tasks:
- [x] Backend: durable SQLite authentication, user/admin/expert scopes, request transitions, notifications, tests for authorization and reopen.
- [x] Content/assets: 10 province profiles and sourced seed entries; useful empty categories; local photos and attribution.
- [x] Frontend: landing, province/category, entry, request form, auth, account/request detail, admin/expert workflows, about/sources.
- [x] Review copy with stop-slop; inspect desktop/mobile; fix observed failures.
- [x] Sync to requested directory, run there, hand off localhost URL.

Review focus: direct deep links and unknown slugs; unauthorized access to other requests; cancellation/reopen while responses exist; empty content and failed images; form state after login and refresh.

Shared interface: public/data.json documented in docs/interfaces.md. Backend entry server.mjs and database in .data/. Frontend files public/index.html, styles.css, app.js, components.js. Backend owns server.mjs and tests/server.test.mjs; content owns public/data.json, public/assets photo files, docs/sources.md. Main owner integrates UI.

Final verification: 10/10 server checks pass from the requested final directory. Browser checked 1440x900 and 390x844, guest province/category navigation, sourced entry, absent content, request/auth/draft, demo approval/response/selection/reopen, invalid login and GitHub Mermaid ERD rendering. All external source files uploaded; operational SQLite files excluded.


## Publikasi dan perbaikan tampilan, 23 Oktober 2026

Pengguna menunda penambahan materi. Repo dijadikan publik atas permintaan pengguna. Situs GitHub Pages menerbitkan berkas statis dari cabang gh-pages, dengan jalur /SwaraNusa dan halaman index untuk semua provinsi serta artikel. Layanan akun, demo peran dan request tetap hanya berjalan di server lokal.

Tampilan menambahkan sudut membulat, dropdown provinsi dan kategori, menu seluler bertingkat, hover/press, serta scroll reveal. Gerak menghormati prefers-reduced-motion. Referensi SIGAP dibaca pada komponen site-header.tsx dan token motion.ts; implementasi SwaraNusa tetap HTML/CSS/JavaScript tanpa mengambil kode aplikasi SIGAP.


## Karusel beranda, 23 Oktober 2026

Sorotan provinsi berurutan Aceh sampai Lampung, interval 3 detik setelah gerakan selesai. Foto, teks dan href berada pada satu slide. Bacaan memakai 27 entri yang sudah ada, diacak per kunjungan dengan giliran antardaerah. Pengunjung dapat menggeser horizontal, memakai panah dan tombol jeda/mulai. Karusel memakai scroll snap; salinan di tepi menjaga putaran tetap berlanjut. Timer berhenti saat keluar layar, tab tersembunyi, atau pengguna berinteraksi. Pindah rute membersihkan timer, observer dan listener. Pengguna reduced motion memulai dengan putaran otomatis mati. Build publik memberi versi yang sama pada modul dan impor agar browser mengambil rilis terbaru.

Pemeriksaan: 40 susunan acak mempertahankan semua 27 entri dan memuat 10 provinsi pada 10 posisi awal; browser memeriksa perpindahan otomatis dan jeda lebih dari 3 detik, 11 langkah provinsi termasuk Lampung ke Aceh, serta kecocokan CTA dengan href. Tidak ada penambahan materi.


## Banner dan siluet, 23 Oktober 2026

Banner atas memakai putaran 10 daerah Aceh sampai Lampung dengan mesin karusel yang sama. Satu slide menyimpan foto dan tautan lokasi; judul utama tetap satu. Kontrol jeda, panah dan geser horizontal tersedia. Ilustrasi tanda tanya serta dua lingkaran diganti siluet Sumatra dari garis pantai Natural Earth 1:50m, domain publik, dengan kredit pada halaman sumber. Tidak ada penambahan materi budaya.

Pemeriksaan browser: banner berpindah Aceh ke Sumatera Utara sesudah 3,8 detik, jeda mempertahankan slide selama 3,8 detik, putaran mundur Aceh ke Lampung serta tautan menuju halaman Lampung sesuai. Lebar 1440, 390 dan 320 piksel diperiksa; pada ponsel kontrol, keterangan lokasi dan tombol utama terpisah tanpa luapan horizontal. Banner diberi ruang tambahan pada lebar 360 piksel ke bawah agar tombol tetap terpisah. Panah keyboard pada area geser juga diperiksa.


## Gradasi dan panel antarmuka, 23 Oktober 2026

Latar memakai radial gradient hijau, krem dan emas dengan background-attachment fixed, mengikuti prinsip warna menyebar pada referensi SIGAP. Tidak ada kode aplikasi SIGAP yang disalin. Aturan baru dipisahkan di public/atmosphere.css dan diberi versi bersama modul pada build publik.

Beranda menambahkan pengantar tiga tautan, header daftar provinsi, ikon kategori dan permukaan bacaan dengan border serta bayangan. Halaman Tentang memakai panel cara belajar di kiri dan dua panel koleksi/layanan di kanan; rujukan punya baris panel tersendiri. Judul bagian memakai DM Sans, sedangkan merek dan judul foto utama mempertahankan DM Serif Display. Ilustrasi Sumatra dan ketiga karusel tetap digunakan.

Pemeriksaan browser: lebar 1440, 768, 390 dan 320 piksel, tanpa luapan horizontal pada beranda, Tentang dan koleksi provinsi yang diperiksa. Dropdown memuat 10 daerah, menu ponsel buka/tutup, tautan pengantar menuju bagian bacaan, perpindahan otomatis serta manual pada bacaan dan sorotan provinsi, dan tujuan Sumatera Barat sesuai dengan slide. Tidak ada perubahan konten budaya, backend, atau ketersediaan request publik.


## Kontrol karusel dan banner otomatis, 23 Oktober 2026

Permintaan pengguna: hapus tombol play/pause serta panah pada ketiga karusel. Markup tombol, listener tombol, dan gaya yang tidak terpakai dihapus; penghitung dan petunjuk geser tetap ada. Hover tidak lagi menjeda putaran. Gestur pointer menunda timer hingga selesai; fokus keyboard menjeda sampai fokus keluar. Reduced motion, jeda di luar layar/tab tersembunyi, dan pembersihan timer saat berpindah rute tetap berlaku.

Diagnosis browser: tab pengguna memuat app.js revisi 104a84aa6c dengan dua karusel, sehingga banner atas pada tab tersebut masih statis. Pemeriksaan pratinjau baru: banner Aceh ke Sumatera Utara setelah 3,8 detik saat pointer tetap hover dan fokus pointer berada di track; nol tombol di ketiga karusel. Sorotan provinsi serta bacaan berpindah otomatis, panah keyboard menggeser, fokus keyboard mempertahankan slide selama 3,8 detik, lalu putaran berlanjut setelah fokus keluar. Lebar 390 piksel tanpa luapan horizontal.
