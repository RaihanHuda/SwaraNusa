# SwaraNusa

Website pengenalan budaya Sumatra untuk proyek pemrograman web. Pengunjung memilih satu dari 10 provinsi, lalu membaca materi seni, wisata, kuliner, atau permainan. Pengguna dapat mengajukan request informasi maupun pendamping belajar.

## Situs publik

**https://raihanhuda.github.io/SwaraNusa/**

Repo ini publik. GitHub Pages menerbitkan cabang `gh-pages`, folder akar. Situs publik menampilkan bacaan, foto, kategori dan rujukan; akun serta pengiriman request belum dibuka. Versi lokal tetap memiliki alur akun dan request dengan SQLite. Materi masih 27 entri; pengisian lima per kategori ditunda.

Bangun situs publik dengan `npm run build:pages`. Hasil `_site/` memakai awalan `/SwaraNusa`, menyiapkan halaman langsung untuk setiap provinsi dan artikel, dan hanya memuat berkas publik. Terbitkan isi folder itu ke akar cabang `gh-pages`. Setiap perubahan materi perlu build dan penerbitan ulang. Tidak ada database akun, server, atau kredensial dalam situs publik.

## Menjalankan

Gunakan **Node.js 24 atau lebih baru**. Proyek tidak memerlukan instalasi paket npm.

```sh
node server.mjs
```

Buka alamat yang muncul di terminal, biasanya **http://127.0.0.1:4173**. Pada komputer tempat proyek dibuat, `./start.sh` juga dapat memakai Node bawaan Codex jika Node belum masuk PATH.

Untuk memilih port:

```sh
PORT=4300 node server.mjs
```

## Yang sudah berfungsi

- Beranda dan pilihan 10 provinsi; kategori Belajar Seni, Wisata & Ikon, Kuliner, Permainan Tradisional.
- 27 materi bersumber, 1 panduan permainan, serta kredit foto.
- Banner atas, sorotan 10 provinsi berurutan, dan bacaan campuran memakai karusel 3 detik. Foto banner, nama tempat dan tautan provinsi berganti bersama; judul utama tetap. Pengunjung dapat menggeser, memakai panah, atau menjeda. Karusel berhenti saat tidak terlihat, saat tab tidak aktif, dan setelah interaksi manual. Pengaturan reduced motion menonaktifkan putaran otomatis saat halaman dimuat.
- Daftar dan masuk akun; password di-hash menggunakan scrypt dan sesi memakai cookie HttpOnly.
- Request, tinjauan pengelola, tanggapan ahli, pemilihan pendamping, pembatalan, penyelesaian, dan pencarian ulang.
- Riwayat dan notifikasi dalam akun. SQLite menyimpan perubahan setelah server berhenti.
- Layout untuk desktop dan ponsel; dukungan keyboard dan reduced motion.

Buka **Masuk > Coba alur proyek** untuk mencoba akun pengunjung, pendamping, atau pengelola demo. Pengelola dapat menyetujui request; pendamping demo dapat menanggapi request yang sudah disetujui. Ganti peran dari halaman akun untuk mengikuti seluruh alur.

## Batas versi pratinjau

Server hanya membuka loopback pada komputer lokal. Akun demo sengaja mempermudah pengujian peran; endpoint demo **tidak cocok untuk deployment publik**. Sebelum merilis layanan, nonaktifkan demo, tambahkan pemulihan dan verifikasi akun, siapkan HTTPS serta pengaturan cookie produksi, dan periksa kembali izin serta isi materi.

SwaraNusa belum memiliki mitra pendamping nyata. Profil demo tidak menyediakan kontak, pembayaran, atau reservasi. Materi pengenalan tari tidak mengaku sebagai tutorial praktik. Notifikasi tersedia dalam akun dan diperbarui saat membuka/memuat ulang halaman. Terjemahan Inggris belum tersedia.

Data akun dan request lokal berada di `.data/` yang masuk `.gitignore`. Jangan mengunggah database ini ke GitHub. Materi budaya saat ini berada di `public/data.json`, terpisah dari database operasional SQLite.

## Dokumentasi

- [Konsep dan alur](docs/konsep-dan-alur.md)
- [ERD dan tabel database](docs/database.md)
- [Flowchart alur layanan](docs/flowchart.md)
- [Sumber materi dan kredit foto](docs/sources.md)
- [Kontrak API](docs/interfaces.md)
- [Catatan pemeriksaan bahasa](docs/copy-review.md)

## Pemeriksaan

```sh
node --test tests/*.test.mjs
node --check server.mjs
node --check public/app.js
```

## Struktur

```text
public/             HTML, CSS, JavaScript, konten JSON, foto
server.mjs          HTTP, autentikasi, SQLite, dan API
.data/              Database lokal (tidak masuk Git)
tests/              Pengujian perilaku server
docs/               Konsep, ERD, flowchart, rujukan, dan pemeriksaan
.agents/skills/     Pedoman bahasa khusus proyek
```

Referensi mutu tampilan dan gaya bahasa: [SIGAP](https://sigap-murex-seven.vercel.app/). Identitas, susunan, dan materi SwaraNusa dikembangkan untuk tema budaya. Foto memiliki lisensi masing-masing; lihat kredit. Logo berasal dari pemilik proyek, haknya mengikuti pemilik logo.
