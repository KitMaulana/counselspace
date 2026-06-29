<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EduContent;
use Illuminate\Http\Request;

class EduContentController extends Controller
{
    // Public: active content with optional type/category filter
    public function index(Request $request)
    {
        $query = EduContent::active();
        if ($request->has('type')) {
            $query->where('content_type', $request->type);
        }
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        $content = $query->orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $content]);
    }

    // Admin: all content
    public function all()
    {
        $content = EduContent::orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $content]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content_type' => 'required|in:video,poster,artikel',
            'content_url' => 'required|string',
        ]);

        $content = EduContent::create($request->only(['title', 'description', 'content_type', 'content_url', 'thumbnail_url', 'category']));
        return response()->json(['success' => true, 'data' => $content], 201);
    }

    public function update(Request $request, $id)
    {
        $content = EduContent::findOrFail($id);
        $content->update($request->only(['title', 'description', 'content_type', 'content_url', 'thumbnail_url', 'category']));
        return response()->json(['success' => true, 'data' => $content]);
    }

    public function destroy($id)
    {
        $content = EduContent::findOrFail($id);
        $content->update(['is_active' => false]);
        return response()->json(['success' => true, 'message' => 'Konten dinonaktifkan']);
    }

    public function toggle($id)
    {
        $content = EduContent::findOrFail($id);
        $content->update(['is_active' => !$content->is_active]);
        return response()->json(['success' => true, 'data' => $content]);
    }
}
