<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Screening;
use Illuminate\Http\Request;

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
}
