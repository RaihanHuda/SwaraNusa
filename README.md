# SwaraNusa

Website belajar budaya Sumatra: 10 provinsi, 300 materi, panduan tertulis dan video pada 250 materi nonwisata, serta lokasi/peta pada 50 tempat wisata. Video pendamping dapat berupa tutorial, demonstrasi, pengenalan, atau pembanding teknik yang dijelaskan pada keterangannya. Gambar, sumber materi, dan kredit tersedia di website.

Situs publik: https://raihanhuda.github.io/SwaraNusa/

## Menjalankan di laptop

Jalankan `./start.sh`, atau gunakan Node.js 24+ dengan `npm start`. Buka `http://127.0.0.1:4173/SwaraNusa/`.

Pratinjau laptop menampilkan hasil yang sama dengan situs publik. Tidak ada akun, database, formulir usulan, sistem request, atau panel admin pada versi final ini. Kontak pengajar langsung membuka WhatsApp.

## Susunan folder

| Bagian | Fungsi |
| --- | --- |
| `public/` | Kode dan data website: HTML, CSS, JavaScript, JSON, serta gambar/font pada `assets/`. Ini sumber utama yang diedit. |
| `scripts/` | Alat bantu membuat hasil publikasi, membuka pratinjau lokal, serta memeriksa data. |
| `_site/` | Hasil otomatis dari `public/`, siap ditampilkan di laptop maupun diterbitkan. Jangan mengeditnya langsung. |
| `package.json` | Nama proyek dan perintah menjalankan/membangun website. |
| `start.sh` | Pintasan menjalankan proyek di laptop. |
| `README.md` | Petunjuk proyek; tidak dijalankan sebagai bagian website. |

Bangun ulang dengan `npm run build:pages`. Periksa isi dengan `npm run check`.

## Data dan pengajar

Materi disimpan di `public/data.json`, bukan database. Profil pengajar disimpan di `public/mentors.json`; satu profil dapat memiliki beberapa materi. Enam nama dan ilustrasi merupakan data latihan proyek dengan nomor bersama yang disediakan pemilik proyek, bukan kemitraan pengajar nyata. Tombol WhatsApp menyiapkan pesan dengan nama dan materi terpilih; situs tidak mengirim pesan otomatis.

Gambar profil ditampilkan dengan elemen `<img>`. Nilai `image` di data dapat menunjuk SVG, JPG/JPEG, PNG, atau WebP dalam `public/assets/`.

## Versi GitHub

Cabang `main` menyimpan sumber proyek. Cabang `gh-pages` menyimpan isi `_site/` untuk situs publik. Setiap perubahan perlu dibangun dan diunggah agar situs publik ikut berubah. Mengedit folder laptop tidak otomatis mengubah GitHub.

Dokumentasi perancangan, kode fitur lama, dan data uji telah dikeluarkan dari proyek final. Cadangannya disimpan terpisah oleh pemilik proyek; tidak ikut diterbitkan.
