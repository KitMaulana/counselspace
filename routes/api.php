<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\EduContentController;
use App\Http\Controllers\Api\ScreeningController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\UserController;

// Public Student API
Route::get('/questions', [QuestionController::class, 'index']);
Route::get('/edu', [EduContentController::class, 'index']);
Route::post('/screenings', [ScreeningController::class, 'store']);

// Chat (public - students use anonymously)
Route::get('/chats/sessions', [ChatController::class, 'sessions']);
Route::get('/chats/{sessionId}', [ChatController::class, 'messages']);
Route::post('/chats', [ChatController::class, 'store']);
Route::put('/chats/{sessionId}/read', [ChatController::class, 'markRead']);

// Auth
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// Admin & Guru BK routes (Memerlukan login)
Route::prefix('admin')->middleware('role:admin,guru')->group(function () {
    // 1. Data yang dapat dibaca oleh Admin maupun Guru BK
    Route::get('/questions', [QuestionController::class, 'all']);
    Route::get('/edu', [EduContentController::class, 'all']);
    Route::get('/screenings', [ScreeningController::class, 'index']);
    Route::get('/screenings/{id}', [ScreeningController::class, 'show']);
    Route::get('/stats', [ScreeningController::class, 'stats']);

    // 2. Data yang HANYA boleh dimodifikasi oleh Admin
    Route::middleware('role:admin')->group(function () {
        // Kelola Soal
        Route::post('/questions', [QuestionController::class, 'store']);
        Route::put('/questions/{id}', [QuestionController::class, 'update']);
        Route::delete('/questions/{id}', [QuestionController::class, 'destroy']);
        Route::patch('/questions/{id}/toggle', [QuestionController::class, 'toggle']);

        // Kelola Edukasi
        Route::post('/edu', [EduContentController::class, 'store']);
        Route::put('/edu/{id}', [EduContentController::class, 'update']);
        Route::delete('/edu/{id}', [EduContentController::class, 'destroy']);
        Route::patch('/edu/{id}/toggle', [EduContentController::class, 'toggle']);

        // Rekapitulasi Data Anggota (Siswa, Guru BK, & Aktivitasnya)
        Route::get('/users/recap', [UserController::class, 'recap']);
    });
});
