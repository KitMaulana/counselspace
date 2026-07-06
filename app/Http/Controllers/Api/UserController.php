<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Screening;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function recap(Request $request)
    {
        // Ambil semua user selain admin (siswa dan guru bk)
        $users = User::whereIn('role', ['siswa', 'guru'])
            ->orderBy('role', 'asc')
            ->orderBy('name', 'asc')
            ->get();

        $result = [];
        foreach ($users as $user) {
            $screeningsCount = 0;
            $latestScore = null;
            $latestCategory = null;
            $latestDate = null;

            if ($user->role === 'siswa') {
                // Hitung jumlah skrining untuk siswa tersebut
                $screeningsCount = Screening::where('user_id', $user->id)->count();
                
                // Dapatkan data skrining terbaru
                $latest = Screening::where('user_id', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->first();
                
                if ($latest) {
                    $latestScore = $latest->total_score;
                    $latestCategory = $latest->category;
                    $latestDate = $latest->created_at ? $latest->created_at->toDateTimeString() : null;
                }
            }

            $result[] = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'student_class' => $user->student_class,
                'created_at' => $user->created_at ? $user->created_at->toDateTimeString() : null,
                'screenings_count' => $screeningsCount,
                'latest_score' => $latestScore,
                'latest_category' => $latestCategory,
                'latest_date' => $latestDate,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }

    public function counselorsPublic()
    {
        $counselors = User::where('role', 'guru')
            ->orderBy('name', 'asc')
            ->get();

        $result = [];
        foreach ($counselors as $c) {
            $isOnline = false;
            if ($c->last_seen) {
                $isOnline = now()->diffInSeconds($c->last_seen) <= 45;
            }

            $result[] = [
                'id' => $c->id,
                'name' => $c->name,
                'email' => $c->email,
                'photo_url' => $c->photo_url,
                'service_hours' => $c->service_hours,
                'is_online' => $isOnline,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }

    public function ping(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->last_seen = now();
            $user->save();
            return response()->json(['success' => true, 'message' => 'Ping success']);
        }
        return response()->json(['success' => false, 'message' => 'User not authenticated'], 401);
    }

    public function uploadPhoto(Request $request)
    {
        try {
            $request->validate([
                'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            if ($request->file('photo')) {
                $file = $request->file('photo');
                $filename = 'counselor_' . time() . '_' . rand(100, 999) . '.' . $file->getClientOriginalExtension();
                
                // Ensure path exists
                $path = public_path('uploads/guru');
                if (!file_exists($path)) {
                    if (!@mkdir($path, 0777, true)) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Gagal membuat direktori uploads/guru di server. Silakan buat folder public/uploads/guru secara manual melalui file manager Hostinger dan atur izin folder (permission) ke 777.'
                        ], 500);
                    }
                }
                
                if (!is_writable($path)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Folder public/uploads/guru di server tidak dapat ditulis (not writable). Silakan atur izin folder (permission) ke 777.'
                    ], 500);
                }
                
                $file->move($path, $filename);
                $url = '/uploads/guru/' . $filename;
                
                return response()->json([
                    'success' => true,
                    'url' => $url
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'File tidak ditemukan dalam request'
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function listCounselors()
    {
        $counselors = User::where('role', 'guru')
            ->orderBy('name', 'asc')
            ->get();
        return response()->json(['success' => true, 'data' => $counselors]);
    }

    public function storeCounselor(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|string|email|max:100|unique:users',
            'username' => 'required|string|max:50|unique:users',
            'password' => 'required|string|min:6',
            'photo_url' => 'nullable|string',
            'service_hours' => 'nullable|string|max:100',
        ]);

        $counselor = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'username' => $request->username,
            'password' => \Illuminate\Support\Facades\Hash::make($request->password),
            'role' => 'guru',
            'photo_url' => $request->photo_url,
            'service_hours' => $request->service_hours,
        ]);

        return response()->json(['success' => true, 'data' => $counselor], 201);
    }

    public function updateCounselor(Request $request, $id)
    {
        $counselor = User::where('role', 'guru')->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|string|email|max:100|unique:users,email,' . $id,
            'username' => 'required|string|max:50|unique:users,username,' . $id,
            'password' => 'nullable|string|min:6',
            'photo_url' => 'nullable|string',
            'service_hours' => 'nullable|string|max:100',
        ]);

        $data = $request->only(['name', 'email', 'username', 'photo_url', 'service_hours']);
        if ($request->password) {
            $data['password'] = \Illuminate\Support\Facades\Hash::make($request->password);
        }

        $counselor->update($data);

        return response()->json(['success' => true, 'data' => $counselor]);
    }

    public function destroyCounselor($id)
    {
        $counselor = User::where('role', 'guru')->findOrFail($id);
        $counselor->delete();
        return response()->json(['success' => true, 'message' => 'Guru BK berhasil dihapus']);
    }

    public function profile(Request $request)
    {
        $user = $request->user();
        if ($user) {
            return response()->json(['success' => true, 'data' => $user]);
        }
        return response()->json(['success' => false, 'message' => 'User not authenticated'], 401);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not authenticated'], 401);
        }

        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|string|email|max:100|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'photo_url' => 'nullable|string',
            'service_hours' => 'nullable|string|max:100',
        ]);

        $data = $request->only(['name', 'email', 'photo_url', 'service_hours']);
        if ($request->password) {
            $data['password'] = \Illuminate\Support\Facades\Hash::make($request->password);
        }

        $user->update($data);

        return response()->json(['success' => true, 'data' => $user]);
    }
}
