<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\EduContentController;
use App\Http\Controllers\Api\ScreeningController;
use App\Http\Controllers\Api\ChatController;

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

// Admin routes
Route::prefix('admin')->group(function () {
    Route::get('/questions', [QuestionController::class, 'all']);
    Route::post('/questions', [QuestionController::class, 'store']);
    Route::put('/questions/{id}', [QuestionController::class, 'update']);
    Route::delete('/questions/{id}', [QuestionController::class, 'destroy']);
    Route::patch('/questions/{id}/toggle', [QuestionController::class, 'toggle']);

    Route::get('/edu', [EduContentController::class, 'all']);
    Route::post('/edu', [EduContentController::class, 'store']);
    Route::put('/edu/{id}', [EduContentController::class, 'update']);
    Route::delete('/edu/{id}', [EduContentController::class, 'destroy']);
    Route::patch('/edu/{id}/toggle', [EduContentController::class, 'toggle']);

    Route::get('/screenings', [ScreeningController::class, 'index']);
    Route::get('/screenings/{id}', [ScreeningController::class, 'show']);
    Route::get('/stats', [ScreeningController::class, 'stats']);
});
