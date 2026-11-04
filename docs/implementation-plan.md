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


## Kategori lintas provinsi dan tata letak HP, 26 Oktober 2026

Menu utama Belajar budaya tidak lagi memakai provinsi bawaan Sumatera Barat maupun konteks provinsi halaman. Enam pilihannya membuka /budaya/{kategori}, dengan /budaya sebagai koleksi semua bacaan. Daftar mengambil seluruh entri pada kategori yang dipilih. Label kartu tetap menyebut provinsi asal. Tab kategori di halaman provinsi tetap menyaring daerah tersebut. Build dan sitemap memuat tujuh rute baru agar tautan langsung serta muat ulang berfungsi pada GitHub Pages.

Di HP, kartu rujukan sebelumnya memakai flex dengan space-between sehingga teks bergeser mengikuti panjang kalimat. Tata letak diganti menjadi tiga kolom tetap untuk ikon, teks fleksibel, dan panah. Tombol panel koreksi dibatasi lebar kontainernya.

Pemeriksaan Safari: keenam kategori, jumlah 4 tari, 3 musik, 4 kerajinan, 9 wisata, 3 kuliner dan 4 permainan; tiap kategori menampilkan materi antardaerah. Menu HP dari halaman Aceh menuju empat materi tari seluruh Sumatra, sedangkan halaman seni Aceh tetap satu materi. Muat ulang rute tari berhasil. Pratinjau responsif 411 dan 360 piksel memeriksa kartu rujukan sejajar serta tombol panel bawah tetap muat. Materi tetap 27 entri dan layanan request publik tetap belum dibuka.


## Pengisian koleksi, 2 November 2026

Menambahkan 273 entri sehingga 10 provinsi memiliki tepat lima entri di enam kategori (300 total). Isi baru berupa pengenalan dengan sumber, komunitas, lokasi dan catatan singkat. Satu panduan Congkak dipertahankan. Sebelas foto dokumentasi objek ditambahkan; foto pengantar wilayah ditandai pada kartu dan caption. Sumber utama tujuh entri lama diganti dari domain kebudayaan lama ke rujukan yang dapat ditelusuri; atribusi Zapin Penyengat disesuaikan dengan penelitian penggantinya. Tiga perbaikan sumber dari audit utara juga disertakan.

Beranda membatasi bacaan campuran pada 20 item; halaman kategori memuat seluruh 50 item kategori, sementara semua bacaan memuat 300. Permintaan data publik mengikuti versi build agar materi lama tidak tertahan cache. Dokumentasi cakupan dan kredit dihasilkan ulang dari data. Validator memeriksa jumlah, ID, isi, bentuk sumber, keberadaan gambar dan kredit, serta penanda pengenalan/panduan.


## Modul belajar dan foto objek, 3 November 2026

Menambahkan 127 modul pada katalog 300 materi: 29 tari, 5 musik, 5 kerajinan, 50 kunjungan wisata, 4 kuliner, dan 34 permainan. Video dipisahkan sebagai tutorial, demonstrasi, atau pertunjukan. Modul permainan mencantumkan alat, persiapan, langkah, dan batas aturan yang didukung sumber. Video ABC Education dibuka melalui tautan; video YouTube memakai iframe youtube-nocookie dengan tautan alternatif. URL iframe dibatasi ke ID YouTube yang sah dan teks di-escape.

Sebanyak 51 foto objek tambahan melewati pemeriksaan visual dan lisensi, menyusul 11 foto pada rilis katalog. Beberapa foto benda merupakan ilustrasi lintas wilayah dan caption menyebutnya. Foto profil provinsi tidak lagi dipakai sebagai pengganti objek materi: kartu memakai foto objek, cuplikan video yang bersangkutan, atau ilustrasi kategori. Artikel tanpa foto khusus langsung membuka teks dan modul belajar.

Pemeriksaan browser: tutorial Tari Piring menampilkan poster pemutar GNP Music serta tiga langkah; layar 390px memuat video dan langkah Bedana tanpa luapan. Aturan Catur Melayu memuat pemain, papan, 24 kambing, rimau serta empat tahap. Ratoh Duek membuka tautan tutorial ABC tanpa iframe YouTube. Daftar tari menampilkan 50 kartu tanpa foto pengantar kota. Tidak ditemukan pesan galat aplikasi pada halaman yang diperiksa.

Pemeriksaan akhir YouTube oEmbed berhasil pada 39 video unik. Tiga tautan kandidat mengembalikan 404/403; modul Gordang Sambilan, Kadam, dan Padamaran yang bergantung pada tautan itu tidak diterbitkan. Catatan pengenalan dan foto objeknya tetap tersedia. Dua modul memakai satu tutorial ABC Education; total 43 penempatan video pada 127 modul. Judul serta kanal YouTube disesuaikan dengan metadata yang terbaca saat pemeriksaan akhir.


## Video setelah deskripsi dan panduan tertulis, 4 November 2026

Video dipisahkan dari panel latihan dan diletakkan langsung sesudah paragraf deskripsi. Pemutar tampil satu kali; langkah tertulis menyusul. Terdapat 238 materi nonwisata dengan video pendamping, dari 250 materi. Kandidat diperoleh dari hasil pencarian YouTube nyata, lalu judul/kanal serta ketersediaan diperiksa melalui oEmbed. Contoh teknik atau variasi umum memiliki catatan konteks. Dua belas materi belum memiliki video yang cocok, sehingga tidak dipasangi video budaya lain.

Seluruh 250 materi nonwisata memiliki 3–5 langkah tertulis yang tidak memerlukan menonton atau menjeda video. Lingkupnya mencakup latihan koordinasi yang dibuat untuk pemula, prototipe bahan pengganti, pemahaman bahan/proses, serta aturan permainan yang didukung sumber. Panduan yang terbatas tidak mengaku lengkap. Halaman wisata hanya membuka lokasi dan tombol Google Maps setelah deskripsi; panel latihan, video, dan pendamping dihilangkan untuk wisata.

Cakupan gambar 300/300 kartu. Menambahkan 12 foto Wikimedia berlisensi melalui tautan pratinjau, 12 sampul dokumentasi wisata yang dikreditkan, serta 17 ilustrasi tema/perlengkapan proyek. Foto, cuplikan variasi umum, dan ilustrasi diberi label/caption berbeda. Gambar ilustrasi tidak menjadi ukuran pembuatan, koreografi, atau denah baku.

Pemeriksaan akhir Safari/IAB pada lebar 320 piksel: Tari Piring memiliki urutan paragraf deskripsi → satu pemutar video → panduan teks, tanpa luapan horizontal. Museum Siginjei memuat satu tautan lokasi, nol pemutar, nol panel latihan. Bicau menampilkan ilustrasi berlabel serta empat langkah sumber. Halaman yang diperiksa tidak menghasilkan galat aplikasi. Validator katalog lulus; 250 modul tidak memiliki langkah yang meminta menonton, membuka, memutar, atau menjeda video.
