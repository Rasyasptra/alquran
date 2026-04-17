<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PrayerTimeController;
use App\Http\Controllers\Api\DailyPrayerController;
use App\Http\Controllers\Api\MosqueInfoController;
use App\Http\Controllers\Api\QuranController;
use App\Http\Controllers\Api\MosqueStaffScheduleController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PushController;

Route::get('/test-quran', function () {
    return response()->json([
        'message' => 'Koneksi API Al-Qur\'an Berhasil!',
        'data' => [
            ['id' => 1, 'name' => 'Al-Fatihah', 'verses' => 7]
        ]
    ]);
});

// Authentication Routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

// Mosque Info Routes
Route::get('/mosque-info', [MosqueInfoController::class, 'index']);
Route::post('/mosque-info', [MosqueInfoController::class, 'store']);
Route::put('/mosque-info', [MosqueInfoController::class, 'update']);

// Prayer Times Routes — data diambil dari eQuran.id (di-cache 1 hari)
Route::get('/prayer-times/today', [PrayerTimeController::class, 'today']);
Route::get('/prayer-times/month/{month?}', [PrayerTimeController::class, 'month']);
Route::get('/prayer-times/countdown', [PrayerTimeController::class, 'countdown']);

// Daily Prayers Routes
Route::get('/daily-prayers', [DailyPrayerController::class, 'index']);
Route::get('/daily-prayers/categories', [DailyPrayerController::class, 'categories']);
Route::get('/daily-prayers/category/{category}', [DailyPrayerController::class, 'byCategory']);
Route::get('/daily-prayers/random', [DailyPrayerController::class, 'random']);
Route::get('/daily-prayers/{id}', [DailyPrayerController::class, 'show']);

// Quran Routes
Route::get('/quran/surahs', [QuranController::class, 'index']);
Route::get('/quran/surahs/with-audio', [QuranController::class, 'withAudio']);
Route::get('/quran/surahs/{number}', [QuranController::class, 'show']);
Route::get('/quran/surahs/{number}/audio', [QuranController::class, 'stream']);
Route::get('/quran/surahs/{number}/audio/stream', [QuranController::class, 'streamProxy']);
Route::get('/quran/reciters', [QuranController::class, 'reciters']);
Route::get('/quran/reciters/{reciter}', [QuranController::class, 'byReciter']);
Route::get('/quran/search', [QuranController::class, 'search']);

// Staff Schedules — publik (baca saja untuk user dashboard)
Route::get('/staff-schedules', [MosqueStaffScheduleController::class, 'publicIndex']);

// Admin Routes — memerlukan autentikasi
Route::middleware('auth:sanctum')->group(function () {
    // Admin: Jadwal Petugas Masjid (CRUD)
    Route::get('/admin/staff-schedules', [MosqueStaffScheduleController::class, 'index']);
    Route::post('/admin/staff-schedules', [MosqueStaffScheduleController::class, 'store']);
    Route::get('/admin/staff-schedules/{date}', [MosqueStaffScheduleController::class, 'show']);
    Route::put('/admin/staff-schedules/{id}', [MosqueStaffScheduleController::class, 'update']);
    Route::delete('/admin/staff-schedules/{id}', [MosqueStaffScheduleController::class, 'destroy']);

    // CATATAN: Route CRUD jadwal sholat manual telah dihapus (2026-04-16).
    // Jadwal sholat kini diambil dari API eQuran.id melalui JadwalSholatService.
});

// Web Push Routes — publik (agar device bisa subscribe tanpa login)
Route::post('/push/subscribe', [PushController::class, 'subscribe']);
Route::post('/push/unsubscribe', [PushController::class, 'unsubscribe']);
Route::get('/push/vapid-public-key', [PushController::class, 'vapidPublicKey']);