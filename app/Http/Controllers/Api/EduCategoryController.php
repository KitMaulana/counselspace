<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EduCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EduCategoryController extends Controller
{
    // List all categories
    public function index()
    {
        $categories = EduCategory::orderBy('name', 'asc')->get();
        return response()->json(['success' => true, 'data' => $categories]);
    }

    // Add a category (Admin only)
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100|unique:edu_categories,name',
        ]);

        $slug = Str::slug($request->name);

        $originalSlug = $slug;
        $count = 1;
        while (EduCategory::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count;
            $count++;
        }

        $category = EduCategory::create([
            'name' => $request->name,
            'slug' => $slug,
        ]);

        return response()->json(['success' => true, 'data' => $category], 201);
    }

    // Delete a category (Admin only)
    public function destroy($id)
    {
        $category = EduCategory::findOrFail($id);
        $category->delete();

        return response()->json(['success' => true, 'message' => 'Kategori berhasil dihapus']);
    }
}
