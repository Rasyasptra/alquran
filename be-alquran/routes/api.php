<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PrayerTimeController;
use App\Http\Controllers\Api\DailyPrayerController;
use App\Http\Controllers\Api\MosqueInfoController;
use App\Http\Controllers\Api\QuranController;

// Cukup 'test-quran', bukan '/api/test-quran'
Route::get('/test-quran', function () {
    return response()->json([
        'message' => 'Koneksi API Al-Qur\'an Berhasil!',
        'data' => [
            ['id' => 1, 'name' => 'Al-Fatihah', 'verses' => 7]
        ]
    ]);
});

// Mosque Info Routes
Route::get('/mosque-info', [MosqueInfoController::class, 'index']);
Route::post('/mosque-info', [MosqueInfoController::class, 'store']);
Route::put('/mosque-info', [MosqueInfoController::class, 'update']);

// Prayer Times Routes
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