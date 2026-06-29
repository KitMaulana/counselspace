<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    // Public: active questions only
    public function index()
    {
        $questions = Question::active()->orderBy('id')->get();
        return response()->json(['success' => true, 'data' => $questions]);
    }

    // Admin: all questions
    public function all()
    {
        $questions = Question::orderBy('id')->get();
        return response()->json(['success' => true, 'data' => $questions]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'question_text' => 'required|string',
            'category' => 'string|max:50',
            'weight' => 'integer|min:1|max:10',
        ]);

        $question = Question::create($request->only(['question_text', 'category', 'weight']));
        return response()->json(['success' => true, 'data' => $question], 201);
    }

    public function update(Request $request, $id)
    {
        $question = Question::findOrFail($id);
        $question->update($request->only(['question_text', 'category', 'weight']));
        return response()->json(['success' => true, 'data' => $question]);
    }

    public function destroy($id)
    {
        $question = Question::findOrFail($id);
        $question->update(['is_active' => false]);
        return response()->json(['success' => true, 'message' => 'Soal dinonaktifkan']);
    }

    public function toggle($id)
    {
        $question = Question::findOrFail($id);
        $question->update(['is_active' => !$question->is_active]);
        return response()->json(['success' => true, 'data' => $question]);
    }
}
