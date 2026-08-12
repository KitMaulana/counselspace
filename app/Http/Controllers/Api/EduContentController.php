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
            'source' => 'nullable|string|max:255',
        ]);

        $content = EduContent::create($request->only(['title', 'description', 'content_type', 'content_url', 'thumbnail_url', 'category', 'source']));
        return response()->json(['success' => true, 'data' => $content], 201);
    }

    public function update(Request $request, $id)
    {
        $content = EduContent::findOrFail($id);
        $request->validate([
            'title' => 'required|string|max:255',
            'content_type' => 'required|in:video,poster,artikel',
            'content_url' => 'required|string',
            'source' => 'nullable|string|max:255',
        ]);

        $content->update($request->only(['title', 'description', 'content_type', 'content_url', 'thumbnail_url', 'category', 'source']));
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

    public function uploadImage(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // max 5MB
            ]);

            if ($request->file('image')) {
                $file = $request->file('image');
                $filename = 'edu_' . time() . '_' . rand(100, 999) . '.' . $file->getClientOriginalExtension();
                
                $path = public_path('uploads/edu');
                if (!file_exists($path)) {
                    mkdir($path, 0777, true);
                }
                
                $file->move($path, $filename);
                $url = '/uploads/edu/' . $filename;
                
                return response()->json([
                    'success' => true,
                    'url' => $url
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'File tidak ditemukan'
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
}
