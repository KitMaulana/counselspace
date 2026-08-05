# CounselSpace — Panduan untuk Claude Code

## Tentang Proyek
CounselSpace adalah aplikasi bimbingan konseling sekolah berbasis **Laravel** (Blade + Vite), dibuat untuk lomba penelitian siswa Indonesia. Aplikasi berjalan lokal via XAMPP di `C:\xampp\htdocs\counselspace`.

**Status: aplikasi SUDAH BERFUNGSI PENUH.** Tugas saat ini hanyalah **redesign tampilan (UI)**.

## Referensi Desain
Desain baru ada di folder `design baru/` (perhatikan: nama folder mengandung spasi) berisi 12 file PNG (`1.png` s.d. `12.png`) hasil export dari Canva. **Selalu lihat dan analisis gambar-gambar ini sebelum mengubah tampilan halaman apa pun.** Cocokkan:
- Palet warna dan gradasi
- Tipografi (jenis, ukuran, ketebalan font)
- Gaya komponen: tombol, card, form, navbar, sidebar, tabel, modal
- Layout dan spacing tiap halaman
- Ikon dan ilustrasi (gunakan padanan dari library ikon gratis seperti Heroicons/Lucide/Font Awesome jika perlu)

## Aturan WAJIB
1. **JANGAN mengubah logika backend**: controller, model, migration, seeder, middleware, route, validasi, dan fungsi apa pun harus tetap sama.
2. Yang boleh diubah: file di `resources/views/`, `resources/css/`, `resources/js/`, dan `public/` (aset tampilan).
3. Semua form, tombol, dan link **harus tetap terhubung** ke route/action yang sama seperti sebelumnya — hanya tampilannya yang berganti.
4. Jangan menghapus file view lama sebelum penggantinya terbukti berfungsi.
5. Buat **Blade components** reusable (tombol, card, input, dsb.) agar konsisten di semua halaman.
6. Semua halaman harus **responsive** (mobile & desktop).
7. Jika ada elemen di desain Canva yang tidak punya padanan fitur di aplikasi, improvisasi tampilannya saja — **jangan membuat fitur backend baru**.
8. Bahasa antarmuka mengikuti yang sudah ada di aplikasi (Bahasa Indonesia).

## Alur Kerja
1. Pelajari dulu struktur proyek dan cek framework CSS yang dipakai (`package.json`, `vite.config.js`, `resources/css/`).
2. Buat design system dulu (warna, font, komponen dasar) berdasarkan analisis 12 PNG.
3. Kerjakan bertahap per halaman: layout utama → landing → login/register → dashboard → halaman fitur lainnya.
4. Setelah tiap halaman selesai, laporkan halaman apa yang berubah agar bisa dicek di browser (server: XAMPP / `php artisan serve`).
5. Jalankan `npm run build` (atau pastikan `npm run dev` aktif) setelah mengubah aset Vite agar perubahan terlihat.

## Lingkungan
- OS: Windows + XAMPP (Apache + MySQL)
- Akses lokal: biasanya `http://localhost/counselspace/public` atau via `php artisan serve`
