# Alur penggunaan SwaraNusa

Diagram ini mengikuti konsep provinsi sebagai pintu masuk dan aturan API dalam [`server.mjs`](../server.mjs). Pengunjung dapat membaca materi tanpa akun. Akun diperlukan untuk mengirim dan melacak request. Pendamping serta pengelola memakai ruang akun sesuai perannya.

## Menjelajah dan mengirim kebutuhan

```mermaid
flowchart TD
    A[Pengunjung membuka beranda] --> B[Memilih satu dari 10 provinsi]
    B --> C{Memilih kegiatan}
    C --> D[Belajar Seni: tari, musik, kerajinan]
    C --> E[Wisata dan Ikon]
    C --> F[Kuliner]
    C --> G[Permainan Tradisional]
    D --> H[Melihat daftar materi]
    E --> H
    F --> H
    G --> H
    H --> I{Materi tersedia?}
    I -->|Ya| J[Membaca pengenalan atau panduan beserta sumber]
    I -->|Belum| K[Melihat keterangan koleksi kosong]
    J --> L{Perlu materi tambahan atau pendamping?}
    L -->|Tidak| M[Kembali ke koleksi atau mengganti provinsi]
    M --> C
    L -->|Ya| N[Membuka form request]
    K --> N
    N --> O[Memilih tujuan, provinsi, kategori, topik dan kebutuhan]
    O --> P{Tujuan pendamping?}
    P -->|Ya| Q[Mengisi kota dan bentuk pendampingan]
    P -->|Tidak| R[Memberikan persetujuan pembagian ringkasan]
    Q --> R
    R --> S{Sudah masuk sebagai pengguna?}
    S -->|Belum| T[Menyimpan draf pada browser dan membuka masuk atau daftar]
    T --> U{Masuk berhasil?}
    U -->|Belum| T
    U -->|Ya| V[Kembali ke form dengan draf sebelumnya]
    V --> W[Mengirim request]
    S -->|Ya| W
    W --> X{Server menerima isian dan persetujuan?}
    X -->|Belum| Y[Menampilkan kesalahan agar pengguna memperbaiki isian]
    Y --> O
    X -->|Ya| Z[SQLite menyimpan request berstatus pending]
    Z --> AA[Pengguna melihat ringkasan, riwayat dan status]
    Z --> AB[Pengelola menerima notifikasi di akun]
```

Pengguna dapat membuka form dari halaman umum maupun dari konteks provinsi atau materi. Browser mempertahankan draf pada `sessionStorage` saat pengguna perlu masuk. Server tetap memeriksa sesi, peran, persetujuan, dan isian sebelum menyimpan request.

## Tinjauan, tanggapan dan penyelesaian

```mermaid
flowchart TD
    A[pending: menunggu tinjauan] --> B{Pengelola memeriksa request}
    B -->|Tolak dengan alasan| C[rejected: ditolak]
    B -->|Setujui| D[open: terbuka]
    D --> E{Tujuan request}
    E -->|informasi| F[Pengelola memeriksa kebutuhan materi]
    F -->|Memberi jawaban| G[responded: ada tanggapan pengelola]
    G -->|Jawaban tambahan| G
    G -->|Pengelola menyelesaikan setelah jawaban tersimpan| H[completed: informasi selesai]
    E -->|pendamping| I[Ahli contoh melihat ringkasan request terbuka]
    I --> J{Ada tanggapan ahli?}
    J -->|Belum| K[Status tetap open; tanpa janji waktu pemenuhan]
    K --> I
    J -->|Ada| L[responded: pengguna membaca tanggapan]
    L -->|Tanggapan tambahan| L
    L --> M{Pengguna memilih tanggapan?}
    M -->|Belum| L
    M -->|Ya| N[connected: menyimpan ID tanggapan pilihan]
    N --> O[Penerimaan tanggapan baru berhenti]
    O --> P{Keputusan pengguna}
    P -->|Kebutuhan terpenuhi| Q[Pengguna menandai completed]
    P -->|Cari pendamping lain| R[reopen: status kembali open]
    R --> S[Mengosongkan pilihan; menyimpan tanggapan dan riwayat lama]
    S -->|Memilih tanggapan yang sudah ada| M
    S -->|Menunggu tanggapan tambahan| I
    A -->|Pemilik membatalkan| T[cancelled: dibatalkan]
    D -->|Pemilik membatalkan| T
    G -->|Pemilik membatalkan| T
    L -->|Pemilik membatalkan| T
    N -->|Pemilik membatalkan| T
```

Ahli contoh memiliki cakupan simulasi untuk seluruh kategori dan sepuluh provinsi. Pengelola hanya memberi tanggapan pada request informasi, sedangkan ahli hanya memberi tanggapan pada request pendamping yang terbuka atau sudah menerima tanggapan. Setelah request terhubung, selesai, ditolak, atau dibatalkan, server menolak tanggapan baru.

Pada versi ini belum ada nomor kontak atau pemesanan pendamping nyata. Pemilihan tanggapan contoh memperagakan perubahan status. Dalam konsep layanan dengan mitra nyata, pengguna dan pendamping melanjutkan pembicaraan melalui kontak yang telah disetujui pemiliknya; biaya serta jadwal memerlukan kesepakatan kedua pihak.

## Ringkasan perubahan status

| Status awal | Tindakan | Pelaku | Syarat | Status sesudahnya |
| --- | --- | --- | --- | --- |
| Belum ada | Mengirim request | Pengguna | Sesi valid, isian sesuai, persetujuan benar | `pending` |
| `pending` | `approve` | Pengelola | Request belum ditinjau | `open` |
| `pending` | `reject` | Pengelola | Menyertakan alasan | `rejected` |
| `open`, `responded` | Menambah tanggapan | Ahli | Tujuan `pendamping` | `responded` |
| `open`, `responded` | Menambah tanggapan | Pengelola | Tujuan `informasi` | `responded` |
| `open`, `responded` | `select` | Pemilik | Tujuan `pendamping`; memilih tanggapan yang sudah ada dari ahli dan request yang sama | `connected` |
| `connected` | `reopen` | Pemilik | Tujuan `pendamping` | `open` |
| `connected` | `complete` | Pemilik | Tujuan `pendamping`; kebutuhan telah terpenuhi menurut pemilik | `completed` |
| `responded` | `complete` | Pengelola | Tujuan `informasi`; setidaknya satu jawaban pengelola telah tersimpan | `completed` |
| `pending`, `open`, `responded`, `connected` | `cancel` | Pemilik | Request milik akun tersebut | `cancelled` |

Reopen menghapus `selected_response_id`, tetapi mempertahankan tanggapan dan riwayat. Pada status `open`, pengguna dapat memilih tanggapan yang sudah ada tanpa menunggu tanggapan baru. Pengguna juga dapat menunggu tanggapan tambahan. Versi ini belum menyediakan penyuntingan request yang ditolak atau pembukaan kembali request selesai; pengguna dapat membuat request baru.

Pengelola harus menyimpan jawaban sebelum menyelesaikan request informasi. Server menolak tindakan `complete` pada request informasi yang masih `open` tanpa jawaban, sehingga pemilik tidak menerima status selesai tanpa penjelasan yang dapat dibaca.

## Hak akses dan notifikasi

| Peran | Akses request |
| --- | --- |
| Pengunjung tanpa akun | Membaca provinsi dan materi; belum dapat membaca daftar request atau mengirim kebutuhan. |
| Pengguna | Membaca request sendiri, melihat tanggapan, serta menjalankan tindakan pemilik sesuai status. |
| Ahli | Membaca request pendamping aktif yang telah disetujui. Setelah memberi tanggapan, ahli masih dapat melihat request tersebut saat statusnya berubah. Hasil API hanya menampilkan tanggapan milik ahli itu sendiri. |
| Pengelola | Membaca semua request, meninjau request baru, serta menjawab dan menyelesaikan request informasi. |

Server membuat notifikasi dalam akun saat ada request baru, persetujuan request pendamping, tanggapan, pilihan pendamping, atau perubahan status terkait. Pengguna membuka atau memuat ulang halaman akun untuk membacanya. Versi ini belum mengirim email, WhatsApp otomatis, atau notifikasi langsung. Payload request tidak memuat email pemohon. Alur ini memakai skema yang dijelaskan dalam [`database.md`](database.md).
