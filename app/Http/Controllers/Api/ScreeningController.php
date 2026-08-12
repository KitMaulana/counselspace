<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Screening;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ScreeningController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'student_name' => 'nullable|string|max:100',
            'student_class' => 'nullable|string|max:50',
            'answers' => 'required|array|min:1',
            'answers.*.question_id' => 'required|integer',
            'answers.*.answer_value' => 'required|integer|min:1|max:4',
        ]);

        $answers = $request->answers;
        $questionIds = collect($answers)->pluck('question_id')->toArray();
        $questions = Question::active()->whereIn('id', $questionIds)->get()->keyBy('id');

        $totalScore = 0;
        $maxScore = 0;
        $validatedAnswers = [];

        foreach ($answers as $answer) {
            $qId = $answer['question_id'];
            $ansVal = $answer['answer_value'];
            $weight = isset($questions[$qId]) ? $questions[$qId]->weight : 1;

            $totalScore += $ansVal * $weight;
            $maxScore += 4 * $weight;
            $validatedAnswers[] = [
                'question_id' => $qId,
                'answer_value' => $ansVal,
                'weight' => $weight,
            ];
        }

        $percentage = $maxScore > 0 ? round(($totalScore / $maxScore) * 100, 2) : 0;

        if ($percentage <= 40) {
            $category = 'aman';
        } elseif ($percentage <= 70) {
            $category = 'waspada';
        } else {
            $category = 'bahaya';
        }

        $user = null;
        $token = $request->bearerToken();
        if ($token) {
            $user = \App\Models\User::where('session_token', $token)->first();
        }

        $screening = Screening::create([
            'user_id' => $user ? $user->id : null,
            'student_name' => $user ? $user->name : ($request->student_name ?: 'Anonim'),
            'student_class' => $user ? $user->student_class : ($request->student_class ?: '-'),
            'total_score' => $totalScore,
            'max_score' => $maxScore,
            'percentage' => $percentage,
            'category' => $category,
            'answers_json' => $validatedAnswers,
            'created_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'screening_id' => $screening->id,
                'student_name' => $screening->student_name,
                'student_class' => $screening->student_class,
                'total_score' => $screening->total_score,
                'max_score' => $screening->max_score,
                'percentage' => $screening->percentage,
                'category' => $screening->category,
            ]
        ], 201);
    }

    // Admin: paginated list
    public function index(Request $request)
    {
        $page = max(1, intval($request->get('page', 1)));
        $limit = min(100, max(1, intval($request->get('limit', 15))));

        $query = Screening::query();

        if ($request->has('category') && $request->category) {
            $query->where('category', $request->category);
        }

        if ($request->has('search') && $request->search) {
            $query->where('student_name', 'like', '%' . $request->search . '%');
        }

        $total = $query->count();
        $screenings = $query->orderBy('created_at', 'desc')
            ->offset(($page - 1) * $limit)
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $screenings,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total_records' => $total,
                'total_pages' => ceil($total / $limit),
            ]
        ]);
    }

    // Admin: detail
    public function show($id)
    {
        $screening = Screening::findOrFail($id);
        return response()->json(['success' => true, 'data' => $screening]);
    }

    // Admin: stats
    public function stats()
    {
        $total = Screening::count();
        $perCategory = [
            'aman' => Screening::where('category', 'aman')->count(),
            'waspada' => Screening::where('category', 'waspada')->count(),
            'bahaya' => Screening::where('category', 'bahaya')->count(),
        ];
        $avgPercentage = Screening::avg('percentage') ?? 0;
        $avgScore = Screening::avg('total_score') ?? 0;
        $recent = Screening::orderBy('created_at', 'desc')->limit(5)->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_screenings' => $total,
                'avg_percentage' => round($avgPercentage, 2),
                'avg_score' => round($avgScore, 2),
                'per_category' => $perCategory,
                'recent_screenings' => $recent,
            ]
        ]);
    }

    public function generateAiAdvice(Request $request)
    {
        $request->validate([
            'category' => 'required|string',
            'score' => 'required|numeric',
            'answers' => 'nullable|array',
            'answers.*.question' => 'required_with:answers|string',
            'answers.*.answer' => 'required_with:answers|string',
        ]);

        $category = ucfirst($request->input('category'));
        $score = $request->input('score');
        $answers = $request->input('answers', []);

        $criticalAnswers = [];
        $moderateAnswers = [];
        $safeAnswers = [];

        foreach ($answers as $item) {
            $ans = strtolower($item['answer']);
            if (str_contains($ans, 'sangat setuju')) {
                $criticalAnswers[] = $item;
            } elseif (str_contains($ans, 'setuju')) {
                $moderateAnswers[] = $item;
            } else {
                $safeAnswers[] = $item;
            }
        }

        $chosenForPrompt = array_slice(array_merge($criticalAnswers, $moderateAnswers, $safeAnswers), 0, 8);

        $apiKey = env('GEMINI_API_KEY');

        $prompt = "Kamu adalah seorang Konselor Guru BK Virtual yang sangat empati, bersahabat, ramah, dan profesional bernama CounselSpace.Ai.\n";
        $prompt .= "Seorang siswa baru saja menyelesaikan skrining kesehatan mental mengenai kecenderungan kecanduan media sosial / FOMO.\n";
        $prompt .= "Kategori Hasil Akhir: **{$category}** dengan skor persentase **{$score}%**.\n\n";
        $prompt .= "Berikut adalah daftar beberapa pertanyaan beserta pilihan jawaban spesifik yang dipilih oleh siswa tersebut:\n";

        foreach ($chosenForPrompt as $item) {
            $prompt .= "- Pertanyaan: \"{$item['question']}\" -> Jawaban Siswa: \"{$item['answer']}\"\n";
        }

        $prompt .= "\nBerdasarkan jawaban spesifik di atas, berikanlah:\n";
        $prompt .= "1. Analisis singkat, hangat, dan penuh empati mengenai kondisi digital wellness siswa saat ini.\n";
        $prompt .= "2. Pesan motivasi yang menenangkan dan menyemangati.\n";
        $prompt .= "3. Minimal 3 langkah praktis/tips konkret kustom yang bisa langsung dipraktikkan siswa ini (sesuaikan dengan jawaban kritis yang dia pilih).\n\n";
        $prompt .= "Jawablah dalam Bahasa Indonesia yang santun, ramah, dan bersahabat. Gunakan format markdown yang rapi (bold, bullet points, gunakan emoji yang ramah). ";
        $prompt .= "Hindari memberikan diagnosa klinis medis, posisikan dirimu murni sebagai guru BK/konselor sekolah yang membimbing.";

        try {
            if (!$apiKey) {
                throw new \Exception('Gemini API key is not configured in .env file.');
            }
            $response = Http::withHeaders([
                'Content-Type' => 'application/json'
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'text' => $prompt
                            ]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'maxOutputTokens' => 1000
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $advice = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
                if ($advice) {
                    return response()->json([
                        'success' => true,
                        'advice' => trim($advice)
                    ]);
                }
            }

            throw new \Exception('Gemini API call failed: ' . $response->body());

        } catch (\Exception $e) {
            \Log::warning('Gemini API failed, using fallback advice: ' . $e->getMessage());

            $fallbackAdvice = "### 💡 Rekomendasi Mandiri untuk Digital Wellness-mu\n\n";
            if (strtolower($category) === 'aman') {
                $fallbackAdvice .= "Selamat! 🎉 Tingkat FOMO-mu tergolong rendah. Kamu sudah cukup bijak dalam menggunakan media sosial. Berikut beberapa tips kustom untukmu:\n\n";
                $fallbackAdvice .= "- **Jaga Keseimbangan**: Tetapkan waktu bebas layar (screen-free time) saat belajar atau sebelum tidur.\n";
                $fallbackAdvice .= "- **Eksplorasi Hobi Baru**: Gunakan waktu luangmu untuk melakukan kegiatan fisik seperti olahraga atau membaca buku.\n";
                $fallbackAdvice .= "- **Kunjungi Edu Corner**: Baca materi edukasi yang menarik di Edu Corner untuk tips digital wellness yang lebih lengkap.\n";
            } elseif (strtolower($category) === 'waspada') {
                $fallbackAdvice .= "Tingkat FOMO-mu berada di level sedang. ⚠️ Ada beberapa tanda bahwa media sosial mulai memengaruhi kehidupanmu. Berikut tips kustom untuk membantumu kembali fokus:\n\n";
                $fallbackAdvice .= "- **Detoks Digital Bertahap**: Mulailah batasi waktu penggunaan media sosial menggunakan pengingat aplikasi (misal, maks 1 jam sehari).\n";
                $fallbackAdvice .= "- **Matikan Notifikasi Non-Penting**: Kurangi godaan mengecek HP dengan mematikan notifikasi aplikasi sosial.\n";
                $fallbackAdvice .= "- **Temukan Aktivitas Seru Luar Jaringan**: Cobalah mengobrol langsung dengan teman atau lakukan olahraga ringan untuk mengalihkan pikiran.\n";
            } else {
                $fallbackAdvice .= "Tingkat FOMO-mu tergolong tinggi. 🚨 Media sosial tampaknya sangat memengaruhi emosi dan keseharianmu. Mari lakukan langkah berikut demi kesehatan mentalmu:\n\n";
                $fallbackAdvice .= "- **Ambil Jeda Penuh (Digital Detoks)**: Cobalah puasa media sosial selama 1-2 hari di akhir pekan.\n";
                $fallbackAdvice .= "- **Bicarakan dengan Ahli**: Sangat disarankan untuk berkonsultasi atau bercerita dengan Guru BK sekolah secara anonim melalui menu chat.\n";
                $fallbackAdvice .= "- **Tulis Jurnal Pikiran**: Alihkan rasa cemas ketinggalan info (*fear of missing out*) dengan menulis hal-hal positif yang kamu syukuri hari ini.\n";
            }
            $fallbackAdvice .= "\n*Tetap semangat! Perjalanan menuju keseimbangan digital dimulai dari satu langkah kecil.* 💚";

            return response()->json([
                'success' => true,
                'advice' => $fallbackAdvice
            ]);
        }
    }
}
