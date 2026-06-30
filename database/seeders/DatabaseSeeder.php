<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Users (Admin, Guru BK, Siswa)
        DB::table('users')->insert([
            [
                'name' => 'Admin Utama',
                'email' => 'admin@counselspace.ai',
                'username' => 'admin',
                'password' => Hash::make('smancir123'),
                'role' => 'admin',
                'student_class' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Guru BK',
                'email' => 'guru@counselspace.ai',
                'username' => 'guru',
                'password' => Hash::make('smancir123'),
                'role' => 'guru',
                'student_class' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Siswa Uji Coba',
                'email' => 'siswa@counselspace.ai',
                'username' => 'siswa',
                'password' => Hash::make('smancir123'),
                'role' => 'siswa',
                'student_class' => 'XII IPA 1',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 10 FOMO Questions
        $questions = [
            ['question_text' => 'Saya merasa cemas ketika tidak bisa mengakses media sosial', 'category' => 'fomo', 'weight' => 1],
            ['question_text' => 'Saya sering membandingkan hidup saya dengan kehidupan orang lain di media sosial', 'category' => 'fomo', 'weight' => 1],
            ['question_text' => 'Saya merasa tertinggal ketika melihat teman-teman bersenang-senang tanpa saya', 'category' => 'fomo', 'weight' => 1],
            ['question_text' => 'Saya sulit berkonsentrasi belajar karena terus memeriksa ponsel', 'category' => 'fomo', 'weight' => 2],
            ['question_text' => 'Saya merasa gelisah jika tidak update status atau story di media sosial', 'category' => 'fomo', 'weight' => 1],
            ['question_text' => 'Saya sering begadang untuk scrolling media sosial', 'category' => 'fomo', 'weight' => 2],
            ['question_text' => 'Saya merasa tidak puas dengan kehidupan saya setelah melihat postingan orang lain', 'category' => 'fomo', 'weight' => 2],
            ['question_text' => 'Saya merasa perlu selalu online agar tidak ketinggalan informasi', 'category' => 'fomo', 'weight' => 1],
            ['question_text' => 'Saya merasa mood saya dipengaruhi oleh jumlah like/komentar di postingan saya', 'category' => 'fomo', 'weight' => 1],
            ['question_text' => 'Saya lebih memilih bermain HP daripada berinteraksi langsung dengan orang di sekitar', 'category' => 'fomo', 'weight' => 2],
        ];
        foreach ($questions as $q) {
            DB::table('questions')->insert(array_merge($q, ['created_at' => now(), 'updated_at' => now()]));
        }

        // 3 Edu Contents
        DB::table('edu_contents')->insert([
            [
                'title' => 'Apa Itu FOMO dan Cara Mengatasinya',
                'description' => 'Video penjelasan tentang Fear of Missing Out (FOMO) dan tips praktis untuk mengatasinya bagi pelajar.',
                'content_type' => 'video',
                'content_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                'thumbnail_url' => 'https://placehold.co/400x225/14B8A6/white?text=Video+FOMO',
                'category' => 'fomo',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Tips Digital Detox untuk Pelajar',
                'description' => 'Artikel lengkap tentang cara melakukan digital detox yang sehat dan efektif untuk pelajar.',
                'content_type' => 'artikel',
                'content_url' => '<h2>Tips Digital Detox untuk Pelajar</h2><p>Digital detox adalah proses mengurangi penggunaan perangkat digital secara sengaja untuk meningkatkan kesehatan mental. Berikut beberapa tips yang bisa kamu coba:</p><ol><li><strong>Tetapkan Jam Bebas HP</strong> — Tentukan waktu tertentu setiap hari di mana kamu tidak menyentuh ponsel.</li><li><strong>Matikan Notifikasi Non-Esensial</strong> — Nonaktifkan notifikasi media sosial.</li><li><strong>Gunakan Aplikasi Screen Time</strong> — Pantau berapa lama kamu menggunakan ponsel.</li><li><strong>Cari Hobi Offline</strong> — Temukan kegiatan yang menyenangkan tanpa layar.</li><li><strong>Praktikkan Mindfulness</strong> — Luangkan waktu 5-10 menit untuk meditasi.</li></ol><p><em>Ingat, media sosial adalah alat — bukan tuan. Kamu yang memegang kendali!</em></p>',
                'thumbnail_url' => 'https://placehold.co/400x225/6366F1/white?text=Artikel+Detox',
                'category' => 'detox',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Infografis Dampak Media Sosial',
                'description' => 'Poster infografis yang menjelaskan dampak positif dan negatif media sosial terhadap kesehatan mental remaja.',
                'content_type' => 'poster',
                'content_url' => 'https://placehold.co/400x600/14B8A6/white?text=Poster+FOMO',
                'thumbnail_url' => 'https://placehold.co/400x225/14B8A6/white?text=Thumbnail+Poster',
                'category' => 'fomo',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
