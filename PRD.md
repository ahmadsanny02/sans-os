# PRODUCT REQUIREMENT DOCUMENT (PRD)
## Project Name: SansOS Workspace
## Author: Ahmad Sani Jabarulloh
## Date: June 2026

---

## 1. Project Overview & Objectives

### 1.1 Problem Statement
Sistem pelacakan berbasis spreadsheet dinilai terlalu kaku dan tidak fleksibel. Seluruh antarmuka terikat oleh formula statis pada level baris (*row*) dan sel (*cell*), sehingga menyulitkan proses kustomisasi. Selain itu, pengguna membutuhkan satu ekosistem terpadu yang tidak hanya mencatat aktivitas harian, melainkan juga memfasilitasi pengembangan karier, manajemen proyek, dan pembelajaran bahasa asing secara modular.

### 1.2 Vision & Goals
Membangun sebuah *Personal Operating System* (Personal OS) dan *Workspace* digital yang dinamis, adaptif, serta sepenuhnya dapat dikembangkan secara modular. Aplikasi ini mengintegrasikan manajemen kehidupan harian (*habit tracker*, *timetable*), pengembangan diri (*language learning*, *reading journal*), serta pengelolaan profesional (*project tracker*).

### 1.3 Success Criteria
- **Visualisasi Interaktif:** Grafik performa harian, mingguan, dan bulanan yang responsif dan interaktif.
- **Aksesibilitas Multi-device:** Tampilan antarmuka yang optimal dan nyaman digunakan di perangkat mobile maupun desktop.
- **Fleksibilitas Skala:** Kemudahan menambahkan fitur atau modul baru di masa mendatang tanpa merusak arsitektur data yang sudah ada.

### 1.4 User Management
- **Single-User Exclusive:** Sistem ini dirancang khusus untuk penggunaan pribadi (Ahmad Sani Jabarulloh). Tidak ada fitur registrasi akun untuk publik (*multi-tenant*).

---

## 2. Functional Requirements

### 2.1 Setup & Navigasi (⚙️ Home & Calendar)
- **Real-time Configuration:** Perubahan pada konfigurasi dasar (seperti bulan awal perencanaan atau hari pertama dalam seminggu) langsung memperbarui tata letak kalender dan halaman manajemen harian secara instan.
- **Quick Navigation:** Menyediakan tombol navigasi cepat seperti "Go To Current Month" dan "Go To Today" untuk memotong alur perpindahan antarkomponen waktu.

### 2.2 Pelacak Kebiasaan (Habit Tracker)
- **Grid Checklist View:** Penyajian kebiasaan harian dalam bentuk matriks/grid interaktif untuk mempermudah proses *check-in*.
- **Dual Automated Recaps:** 
  - *Weekly Recap:* Grafik tren konsistensi jangka pendek yang diperbarui otomatis setiap minggu.
  - *Monthly Recap:* Agregat bulanan yang menampilkan total hari sukses dan persentase keberhasilan secara menyeluruh.

### 2.3 Pengembangan Diri & Keinginan (Bucket, Reading & Language)
- **Conditional Reading Journal:** Input komponen *Rating* dan *Review* pada daftar buku hanya akan muncul di antarmuka jika status membaca diubah menjadi `Completed`.
- **Drag-and-Drop Vision Board:** Kanvas bebas yang memungkinkan pengguna mengunggah, menggeser, dan memposisikan gambar atau teks impian secara fleksibel.
- **Language Learning Engine:** Modul pencatatan kosakata bahasa Inggris kustom yang menyimpan kata, tipe kata (*part of speech*), definisi, terjemahan, contoh kalimat, serta tingkat penguasaan (*mastery level*).
- **Interactive Bucket List Board:** Papan keinginan visual untuk mendaftarkan dan memantau pencapaian hidup (*life milestones*). Dilengkapi dengan preset gambar latar belakang, fitur pencarian & filter, serta widget statistik tingkat keberhasilan (*completion rate*).

### 2.4 Manajemen Harian & Proyek (Daily & Projects)
- **Dynamic Timetable Timeline:** Penjadwalan aktivitas harian menggunakan durasi kustom yang fleksibel (bukan slot kaku per jam), misalnya blok `01.00 - 03.00` diikuti blok `03.00 - 04.00`.
- **Auto-Rollover Top 5 Priority:** Jika ada item pada daftar 5 prioritas utama harian yang belum selesai hingga hari berganti, sistem akan otomatis memindahkan (*rollover*) tugas tersebut ke daftar prioritas hari berikutnya.
- **Hierarchical Project Tracker:** Manajemen proyek kerja/pribadi dengan struktur dua tingkat (Proyek -> Tugas/Task) dilengkapi dengan status progres (*Planning, In Progress, On Hold, Completed*) dan tingkat prioritas.

### 2.5 Fokus & Produktivitas (Pomodoro)
- **Pomodoro Focus Timer:** Modul pengatur waktu fokus terintegrasi dengan fase kerja dan istirahat (*focus/break phases*) yang dapat diatur kustom durasinya.
- **Floating Drag Badge:** Tombol melayang interaktif yang dapat digeser bebas di layar serta berfungsi sebagai pemicu (*trigger*) cepat untuk menampilkan modal pengatur waktu dari halaman mana pun.
- **Picture-in-Picture (PiP) Controller:** Tampilan status pengukur waktu mini yang persisten agar durasi fokus tetap terpantau dengan jelas bahkan saat pengguna bernavigasi ke modul halaman lain.

---

## 3. Non-Functional Requirements

### 3.1 Responsivitas UI/UX
- **Mobile-First Approach:** Seluruh dasbor, diagram, grafik, dan tabel data wajib adaptif dan fungsional di layar ponsel tanpa kehilangan konteks informasi.
- **Styling Overhaul:** Dukungan adaptasi visual kerangka antarmuka murni agar siap didesain ulang dengan gaya visual premium (glassmorphism/minimalis).

### 3.2 Sinkronisasi & Ketahanan Data
- **Offline State Handling:** Sistem mendukung penyimpanan lokal sementara (*local caching*). Pengguna tetap bisa mencatat kosakata, mencentang habit, atau menulis jurnal saat offline, dan data akan disinkronisasikan ke database saat koneksi pulih.

### 3.3 Keamanan
- **Standard Authentication:** Hak akses masuk ke sistem workspace dikunci menggunakan pengamanan *Email* dan *Password*.

---

## 4. Integration & Data Reference

### 4.1 Mood & Emoji Management
- **Native Device Emoji Picker:** Sistem tidak menyimpan file gambar emoji secara kustom. Aplikasi memanfaatkan pustaka emoji bawaan dari sistem operasi perangkat (*native OS emoji library*) untuk mencatat indikator *mood* harian.

---

## 5. Spesifikasi Teknis & Arsitektur

### 5.1 Tech Stack
- **Bahasa Pemrograman:** TypeScript (Strict Mode)
- **Framework Aplikasi:** Next.js (App Router)
- **Pustaka Antarmuka (UI):** shadcn/ui + Framer Motion (untuk animasi layout)
- **Manajemen State Global:** Zustand (untuk mengelola status activeDate, userConfig, dan state Pomodoro)
- **Pengambilan Data (Data Fetching):** React Query (TanStack Query) + Supabase Client SDK
- **Database & ORM:** PostgreSQL melalui Supabase dengan Drizzle ORM
- **Autentikasi:** Supabase Auth (Email & Password)
- **Deployment:** Vercel (Frontend) & Supabase (Database)