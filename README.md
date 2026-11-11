# SwaraNusa

Website pengenalan budaya Sumatra untuk proyek pemrograman web. Pengunjung memilih satu dari 10 provinsi, lalu membaca materi seni, wisata, kuliner, atau permainan. Pengguna dapat mengajukan request informasi maupun pendamping belajar.

## Situs publik

**https://raihanhuda.github.io/SwaraNusa/**

Repo ini publik. GitHub Pages menerbitkan cabang `gh-pages`, folder akar. Koleksi memuat 300 materi: lima per kategori di setiap provinsi. Seluruh 250 materi nonwisata memiliki panduan tertulis yang dapat dibaca tanpa video; 238 di antaranya memiliki video pendamping. Urutannya deskripsi, video, lalu panduan. Latihan dasar/adaptasi, prototipe, pengenalan bahan, serta panduan permainan menyebut lingkupnya dan tidak mengaku sebagai koreografi, resep, atau teknik adat yang lengkap. Sebanyak 50 halaman wisata menampilkan lokasi dan tautan Google Maps, tanpa pemutar video atau bagian latihan.

Seluruh kartu mempunyai gambar berupa foto, sampul dokumentasi, atau ilustrasi bertanda. Sebanyak 17 ilustrasi tema/perlengkapan dibuat untuk materi yang belum memiliki dokumentasi khusus. Foto dan cuplikan menyertakan sumber. Pengunjung dapat membuka profil pengajar dan menghubunginya melalui WhatsApp. Saat ini tersedia enam identitas latihan proyek dengan ilustrasi serta nomor demonstrasi bersama dari pemilik proyek. Akun dan pengiriman usulan materi publik belum dibuka; versi lokal tetap memakai SQLite.

Panduan nonwisata kini memuat 5–9 tahap sesuai prosesnya, seluruhnya 1.692 tahap. Rincian meliputi persiapan, tindakan bertahap, dan penilaian hasil; 151 materi menambahkan daftar pemeriksaan hasil dan 38 materi mempunyai petunjuk perbaikan. Contoh: Saman 7 tahap, Congkak 8, dan Tekwan 9. Banyaknya tahap mengikuti kebutuhan materi.

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
- Menu Belajar budaya membuka koleksi kategori dari seluruh Sumatra pada `/budaya/tari`, `/budaya/musik`, `/budaya/kerajinan`, `/budaya/wisata`, `/budaya/kuliner`, dan `/budaya/permainan`. `/budaya` menampilkan semua bacaan. Tab di dalam halaman provinsi tetap khusus daerah tersebut.
- 300 materi bersumber: lima tari, musik, kerajinan, wisata, kuliner, dan permainan pada setiap provinsi. Gambar bertanda cuplikan atau ilustrasi menyebut konteksnya; foto profil provinsi tidak menjadi pengganti objek materi.
- Banner atas, sorotan 10 provinsi berurutan, dan bacaan campuran memakai karusel 3 detik. Foto banner, nama tempat dan tautan provinsi berganti bersama; judul utama tetap. Pengunjung dapat menggeser melalui sentuhan atau mouse, atau memakai panah keyboard. Tombol play/pause dan panah pada layar dihapus. Putaran tetap berjalan saat kursor berada di atas gambar dan berlanjut setelah gestur pointer selesai. Fokus keyboard menjeda sampai fokus keluar. Saat tidak terlihat, tab tidak aktif, atau reduced motion aktif, karusel tidak berputar otomatis.
- Daftar dan masuk akun; password di-hash menggunakan scrypt dan sesi memakai cookie HttpOnly.
- Request, tinjauan pengelola, tanggapan ahli, pemilihan pendamping, pembatalan, penyelesaian, dan pencarian ulang.
- Riwayat dan notifikasi dalam akun. SQLite menyimpan perubahan setelah server berhenti.
- Layout untuk desktop dan ponsel; dukungan keyboard dan reduced motion.
- Latar gradasi hijau/krem/emas, panel berbayang, ikon kategori dan halaman Tentang dengan panel cara belajar, koleksi, serta pendamping. Aturan tampilannya berada di `public/atmosphere.css`.

Buka **Masuk > Coba alur proyek** untuk mencoba akun pengunjung, pendamping, atau pengelola demo. Pengelola dapat menyetujui request; pendamping demo dapat menanggapi request yang sudah disetujui. Ganti peran dari halaman akun untuk mengikuti seluruh alur.

## Batas versi pratinjau

Server hanya membuka loopback pada komputer lokal. Akun demo sengaja mempermudah pengujian peran; endpoint demo **tidak cocok untuk deployment publik**. Sebelum merilis layanan, nonaktifkan demo, tambahkan pemulihan dan verifikasi akun, siapkan HTTPS serta pengaturan cookie produksi, dan periksa kembali izin serta isi materi.

SwaraNusa belum memiliki mitra pengajar nyata. Direktori menampilkan identitas latihan proyek dengan kontak demonstrasi yang diberikan pemilik proyek. Tombol hanya membuka WhatsApp dengan pesan awal, tanpa mengirim pesan otomatis. Tidak ada pembayaran atau reservasi melalui situs. Latihan tari membahas koordinasi dasar dan konteks; ragam, syair, serta koreografi tradisi dipelajari bersama pelakunya. Notifikasi tersedia dalam akun dan diperbarui saat membuka/memuat ulang halaman. Terjemahan Inggris belum tersedia.

Data akun dan request lokal berada di `.data/` yang masuk `.gitignore`. Jangan mengunggah database ini ke GitHub. Materi budaya saat ini berada di `public/data.json`, terpisah dari database operasional SQLite.

## Dokumentasi

- [Konsep dan alur](docs/konsep-dan-alur.md)
- [ERD dan tabel database](docs/database.md)
- [Flowchart alur layanan](docs/flowchart.md)
- [Cakupan koleksi per provinsi](docs/content-coverage.md)
- [Sumber materi dan kredit foto](docs/sources.md)
- [Kontrak API](docs/interfaces.md)
- [Catatan pemeriksaan bahasa](docs/copy-review.md)

## Pemeriksaan

```sh
node --test tests/*.test.mjs
node --check server.mjs
node --check public/app.js
node scripts/validate-content.mjs --complete
node scripts/update-content-docs.mjs
node scripts/build-pages.mjs
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



## Profil pengajar dan WhatsApp

Alur baru: materi tari/musik/kerajinan → Lihat pengajar → kartu profil → Hubungi via WhatsApp. Halaman wisata, kuliner, dan permainan tidak menampilkan kartu ajakan belajar dengan pengajar. Tidak perlu login atau tinjauan pengelola untuk membuka kontak.

Data berada di `public/mentors.json`; ilustrasi profil berada di `public/assets/pengajar-rina.svg`. Nomor demonstrasi berasal dari pemilik proyek dan digunakan pada semua profil latihan. Nama serta ilustrasi bukan identitas pengajar nyata. Label contoh pada kartu disembunyikan sesuai permintaan pemilik proyek; dokumentasi dan data tetap mencatat statusnya. `categories` membatasi bidang, sedangkan `entryIds` dapat membatasi materi per profil; daftar kosong berarti seluruh materi pada kategori tersebut untuk contoh. Pada halaman materi, maksimal dua profil cocok ditampilkan. Gunakan identitas, foto berizin, bidang, dan nomor pengajar yang benar ketika mengganti data contoh. Rincian: [Profil pengajar](docs/teachers.md).
