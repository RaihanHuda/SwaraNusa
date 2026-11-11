# Direktori pengajar

Diperbarui 11 November 2026. Pengguna meminta kartu individu yang langsung membuka WhatsApp, tanpa menghubungi admin atau mengirim request pendamping.

## Alur

1. Buka materi tari, musik tradisional, atau kerajinan.
2. Pilih Lihat pengajar; URL menyimpan ID materi, misalnya `/pendamping?materi=saman`.
3. Baca profil beserta daftar materi yang diajarkan. Satu profil boleh mencakup beberapa materi. Maksimal dua profil cocok tampil untuk satu materi.
4. Pilih Hubungi via WhatsApp. Situs membuka `wa.me` dengan pesan berisi nama pengajar dan materi yang dipilih. Pengguna memeriksa dan mengirim pesannya sendiri di WhatsApp.

Wisata, kuliner, dan permainan tidak menampilkan ajakan pengajar pada halaman materi. Tautan lama `/request?tujuan=pendamping&...` membuka direktori dengan konteks yang sama. Formulir request lokal kini untuk usulan materi/informasi; data request lama tetap ada untuk demonstrasi proyek.

## Data dan gambar

Direktori memuat enam identitas latihan proyek: Rina dan Ayu untuk tari; Nadia dan Salsa untuk musik tradisional; Putri dan Lestari untuk kerajinan. Masing-masing memiliki daftar `entryIds` yang jelas. Seluruh 150 materi seni memiliki satu atau dua profil yang cocok, sedangkan wisata, kuliner, dan permainan tidak memperoleh profil. Semua profil memakai nomor demonstrasi yang diberikan pemilik proyek. Nama serta ilustrasi belum mewakili pengajar nyata dan tidak menyatakan kemitraan; informasi ini disimpan dalam dokumentasi serta `isDemo` pada data. Sesuai permintaan pemilik proyek, banner, badge, dan catatan contoh tidak tampil pada kartu.

Data profil berada di `public/mentors.json`. Setiap profil berisi nama, bidang, deskripsi, daftar materi, jalur gambar, dan nomor WhatsApp. Saat pengguna membuka materi tertentu, situs mencocokkan ID materi dengan `entryIds` dan menampilkan maksimal dua profil. Pesan WhatsApp menyebut nama yang dipilih serta judul materi. Semua nomor menuju kontak demonstrasi yang sama; tidak ada pesan yang dikirim untuk pengujian.

Gambar tetap berkas tersendiri, bukan gambar yang dibangun di komponen profil. Untuk saat ini, kartu memakai ilustrasi orisinal `public/assets/pengajar-rina.svg` sebagai gambar profil bersama. SVG merupakan format gambar; browser menampilkannya dengan elemen HTML yang sama seperti foto.

```html
<img src="/assets/pengajar-rina.svg" alt="Ilustrasi profil pengajar">
```

Renderer membaca lokasi gambar dari `profile.image`. Untuk mengganti dengan foto, simpan berkas JPG, PNG, atau WebP di `public/assets`, lalu ganti nilai `image` pada profil. Tidak perlu mengganti struktur kartu. Gunakan foto yang pemakaiannya sudah diizinkan dan sesuaikan `imageAlt`. Renderer menerima SVG, JPG/JPEG, PNG, dan WebP lokal di folder aset; alamat yang tidak sesuai memakai gambar bawaan. Pada GitHub Pages, situs menambahkan awalan `/SwaraNusa` otomatis.

## Pemeriksaan

Dua uji otomatis direktori memastikan cakupan kategori pada 300 materi, satu–dua hasil yang cocok, kesamaan nomor tujuan, format nomor, encoding pesan, escaping teks, penghapusan label contoh, serta dukungan berkas foto. Seluruh 12 pengujian proyek lulus. Pemeriksaan browser pada layar 360 piksel: kartu tidak meluap horizontal, tombol menunjuk nomor demonstrasi dan menyebut Saman, Congkak tidak memuat bagian pengajar, dan tautan request lama membuka profil tanpa formulir.
