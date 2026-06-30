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
}
