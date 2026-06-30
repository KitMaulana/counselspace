<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // Cari user berdasarkan email atau username
        $user = User::where('email', $request->username)
            ->orWhere('username', $request->username)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['success' => false, 'message' => 'Email/Username atau password salah'], 401);
        }

        $token = hash('sha256', $user->id . '|' . time() . '|' . bin2hex(random_bytes(16)));

        // Simpan token ke database untuk validasi otentikasi di backend
        $user->session_token = $token;
        $user->save();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'name' => $user->name,
                'role' => $user->role,
                'student_class' => $user->student_class,
                'token' => $token,
            ]
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|string|email|max:100|unique:users',
            'password' => 'required|string|min:6',
            'student_class' => 'required|string|max:50',
        ]);

        // Buat user baru dengan role siswa
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'username' => explode('@', $request->email)[0],
            'password' => Hash::make($request->password),
            'role' => 'siswa',
            'student_class' => $request->student_class,
        ]);

        $token = hash('sha256', $user->id . '|' . time() . '|' . bin2hex(random_bytes(16)));

        // Simpan token ke database
        $user->session_token = $token;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil!',
            'data' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'name' => $user->name,
                'role' => $user->role,
                'student_class' => $user->student_class,
                'token' => $token,
            ]
        ], 201);
    }
}
