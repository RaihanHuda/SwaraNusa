# Direktori pengajar

Diperbarui 11 November 2026. Pengguna meminta kartu individu yang langsung membuka WhatsApp, tanpa menghubungi admin atau mengirim request pendamping.

## Alur

1. Buka materi tari, musik tradisional, atau kerajinan.
2. Pilih Lihat pengajar; URL menyimpan ID materi, misalnya `/pendamping?materi=saman`.
3. Baca profil beserta daftar materi yang diajarkan. Satu profil boleh mencakup beberapa materi. Maksimal dua profil cocok tampil untuk satu materi.
4. Pilih Hubungi via WhatsApp. Situs membuka `wa.me` dengan pesan berisi nama pengajar dan materi yang dipilih. Pengguna memeriksa dan mengirim pesannya sendiri di WhatsApp.

Wisata, kuliner, dan permainan tidak menampilkan ajakan pengajar pada halaman materi. Tautan lama `/request?tujuan=pendamping&...` membuka direktori dengan konteks yang sama. Formulir request lokal kini untuk usulan materi/informasi; data request lama tetap ada untuk demonstrasi proyek.

## Data saat ini

Satu profil contoh bernama Kak Rina memakai ilustrasi orisinal, bukan foto orang nyata. Seluruh kartu memuat label Profil contoh. Kontak demonstrasi diberikan pemilik proyek pada percakapan dan dipakai untuk mencoba tombol, bukan kontak pengajar yang sudah bermitra. Nomor berformat internasional Indonesia; situs tidak mengklaim telah mengonfirmasi kepemilikan atau status akun WhatsApp. Tidak ada pesan yang dikirim untuk pengujian.

`public/mentors.json` berisi objek `profiles`. Setiap profil memuat `id`, `name`, `role`, `image`, `imageAlt`, `isDemo`, `categories`, `entryIds`, `examples`, `description`, dan `whatsapp`. Kategori yang diterima: `tari`, `musik`, `kerajinan`. `entryIds` kosong menampilkan profil untuk materi dalam kategori tersebut; isi array dengan ID tertentu untuk membatasi pengajar sungguhan. Nomor kosong/tidak valid membuat tombol kontak tidak aktif.

Mengganti profil contoh membutuhkan nama, foto berizin, bidang/materi, dan nomor yang benar dari pengajar. Jangan mengganti label demo sebelum data nyata tersedia. Profil dapat ditambah tanpa menyalin semua halaman materi.

## Pemeriksaan

Dua uji otomatis direktori memastikan cakupan kategori pada 300 materi, kecocokan ID, format nomor, encoding pesan, dan escaping teks. Seluruh 12 pengujian proyek lulus. Pemeriksaan browser pada layar 360 piksel: kartu tidak meluap horizontal, tombol menunjuk nomor demonstrasi dan menyebut Saman, Congkak tidak memuat bagian pengajar, dan tautan request lama membuka profil tanpa formulir.
