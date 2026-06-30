<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  ...$roles
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json(['success' => false, 'message' => 'Token otentikasi tidak ditemukan'], 401);
        }

        $user = User::where('session_token', $token)->first();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Sesi tidak valid atau kadaluarsa'], 401);
        }

        if (!empty($roles) && !in_array($user->role, $roles)) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak. Peran Anda tidak memiliki wewenang.'], 403);
        }

        // Simpan data user ke request
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        return $next($request);
    }
}
