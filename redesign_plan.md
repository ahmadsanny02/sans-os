# Rencana Redesain: Bento Grid + Minimalist Modern (Functional Glassmorphic Accents & Soft Depth)

Dokumen ini mendokumentasikan perencanaan penerapan gaya desain **Bento Grid + Minimalist Modern** dengan aksen **Functional Glassmorphism** (efek kaca kabur) dan kedalaman visual lembut (**Soft Depth**) pada **SansOS Workspace**.

---

## 1. Spesifikasi Token Desain & Variabel CSS

Konfigurasi tema dan warna diatur pada file `globals.css` menggunakan variabel HSL yang responsif terhadap mode gelap/terang.

### 1.1 Variabel Warna HSL
*   **Mode Terang (Warm Minimalist):**
    *   `--background`: `210 20% 98%` (Stone/Warm White halus)
    *   `--card`: `0 0% 100% / 80%` (Putih semi-transparan untuk efek kaca)
    *   `--border`: `214.3 31.8% 91.4%` (Garis tepi tipis/hairline)
    *   `--primary`: `250 85% 55%` (Indigo premium)
*   **Mode Gelap (Indigo Midnight Glass):**
    *   `--background`: `224 25% 6%` (Midnight space gelap pekat)
    *   `--card`: `224 25% 10% / 70%` (Obsidian semi-transparan)
    *   `--border`: `224 20% 18%` (Garis indigo redup)
    *   `--primary`: `250 85% 65%` (Violet terang bercahaya)

### 1.2 Kedalaman Lembut (Soft Depth & Shadows)
Konfigurasi shadow premium diatur pada `tailwind.config.js`:
*   `shadow-glass`: Bayangan halus dengan persebaran luas untuk mensimulasikan efek kartu melayang.
*   `shadow-glow`: Efek pendaran neon halus di sekitar border kartu aktif/hover.

---

## 2. Struktur Bento Grid pada Halaman Dashboard

Halaman utama (`DashboardView.tsx`) akan dirancang ulang menggunakan layout **Bento Grid** (asimetris modular) dengan susunan grid 12 kolom sebagai berikut:

```
+----------------------------------------------------------------------------------------+
|                                    Welcome Banner                                      |
|                                (Grid Span: 12 Cols)                                    |
+------------------------------------------+---------------------------------------------+
|               Top 5 Priorities           |                Daily Timetable              |
|              (Grid Span: 5 Cols)         |              (Grid Span: 7 Cols)            |
+---------------------+--------------------+---------------------------------------------+
|     Habit Grid      |     Memory Box     |             Quick Shortcut Bento            |
| (Grid Span: 4 Cols) |(Grid Span: 3 Cols) |             (Grid Span: 5 Cols Grid)        |
+---------------------+--------------------+---------------------------------------------+
```

### 2.1 Class Utility Desain Baru (globals.css)
*   `.bento-card`: Menerapkan border halus, background blur, rounded besar (`rounded-2xl`), dan shadow-glass.
*   `.bento-card-interactive`: Memberikan efek hover berupa pengangkatan posisi kartu (`-translate-y-0.5`), peningkatan pendaran shadow, dan transisi warna background.

---

## 3. Langkah Implementasi (Tahapan Kerja)

### Tahap 1: Konfigurasi Basis (CSS & Tailwind Config)
1.  Isi kembali `src/app/globals.css` dengan variabel HSL Bento Grid, konfigurasi scrollbar halus kustom, dan class utilitas `.bento-card`.
2.  Perbarui `tailwind.config.js` untuk mendukung properti kustom shadow kedalaman lembut (`shadow-glass` & `shadow-glow`).

### Tahap 2: Redesain Navigasi Utama (`AppLayout.tsx`)
1.  Ubah Sidebar Desktop dan Mobile Drawer agar menggunakan latar belakang semi-transparan glassmorphism.
2.  Desain ulang item menu navigasi agar menggunakan indikator aktif minimalis dengan transisi mikro-interaksi.

### Tahap 3: Restrukturisasi Halaman Dashboard (`DashboardView.tsx`)
1.  Ubah container widget menjadi layout grid asimetris (`grid grid-cols-12 gap-6`).
2.  Terapkan desain Bento pada setiap widget (`PrioritiesWidget`, `TodosWidget`, `TimetableWidget`, dan `MemoryBoxWidget`).
