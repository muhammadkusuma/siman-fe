
# Vue 3 + Vite + Tailwind CSS v4 Starter ⚡

Starter template minimalis dan super cepat untuk membangun aplikasi web modern menggunakan **Vue 3**, **Vite**, dan **Tailwind CSS v4**.

Template ini dirancang untuk memberikan pengalaman pengembangan (DX) terbaik dengan konfigurasi yang bersih dan performa tinggi.

## 🚀 Fitur

- **Vue 3**: Menggunakan `<script setup>` SFC untuk penulisan komponen yang ringkas.
- **Vite**: Build tool generasi terbaru yang sangat cepat (HMR instan).
- **Tailwind CSS v4**: Styling utility-first versi terbaru (Oxide engine) yang lebih cepat dan tanpa konfigurasi yang rumit.
- **PostCSS & Autoprefixer**: Sudah terkonfigurasi untuk kompatibilitas browser.

## 🛠️ Prasyarat

Pastikan kamu telah menginstal [Node.js](https://nodejs.org/) (versi 18+ direkomendasikan).

## 📦 Cara Menggunakan

### 1. Clone atau Gunakan Template ini
Jika repositori ini ada di GitHub, kamu bisa klik tombol **"Use this template"** atau clone manual:

```bash
git clone https://github.com/muhammadkusuma/my-project.git
cd my-project
```

### 2. Install Dependensi

```bash
npm install
```

### 3. Jalankan Server Development

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`.

### 4. Build untuk Production

```bash
npm run build
```

## 📂 Struktur Proyek

```text
├── public/              # Aset statis (favicon, dll)
├── src/
│   ├── assets/          # File CSS (Tailwind diimport di sini)
│   ├── components/      # Komponen Vue
│   ├── App.vue          # Root component
│   └── main.js          # Entry point aplikasi
├── index.html           # Entry point HTML
├── package.json         # Dependensi proyek
└── vite.config.js       # Konfigurasi Vite
```

## 🎨 Catatan Tailwind CSS v4

Template ini menggunakan **Tailwind CSS v4**. Berbeda dengan versi sebelumnya:

1. Konfigurasi utama dilakukan langsung di CSS menggunakan `@theme`.
2. Tidak lagi **wajib** menggunakan `tailwind.config.js` untuk pengaturan dasar.
3. Menggunakan plugin `@tailwindcss/vite` untuk integrasi yang mulus.

Contoh menambahkan font custom atau warna di CSS:

```css
@import "tailwindcss";

@theme {
  --font-display: "Satoshi", "sans-serif";
  --color-brand: #3b82f6;
}
```

## 📄 Lisensi

[MIT](https://www.google.com/search?q=LICENSE)