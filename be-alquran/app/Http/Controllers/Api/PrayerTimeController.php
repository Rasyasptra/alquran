<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PrayerTime;
use App\Models\MosqueInfo;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PrayerTimeController extends Controller
{
    /**
     * Get today's prayer times
     */
    public function today()
    {
        $today = PrayerTime::getToday();
        
        if (!$today) {
            return response()->json([
                'success' => false,
                'message' => 'Prayer times for today not found'
            ], 404);
        }

        $nextPrayer = $today->getNextPrayer();
        $mosque = MosqueInfo::getDefault();

        return response()->json([
            'success' => true,
            'data' => [
                'date' => $today->date,
                'hijri_date' => $today->hijri_date,
                'is_ramadan' => $today->is_ramadan,
                'prayer_times' => [
                    'fajr' => [
                        'time' => $today->fajr->format('H:i'),
                        'iqama' => $today->fajr_iqama?->format('H:i')
                    ],
                    'dhuhr' => [
                        'time' => $today->dhuhr->format('H:i'),
                        'iqama' => $today->dhuhr_iqama?->format('H:i')
                    ],
                    'asr' => [
                        'time' => $today->asr->format('H:i'),
                        'iqama' => $today->asr_iqama?->format('H:i')
                    ],
                    'maghrib' => [
                        'time' => $today->maghrib->format('H:i'),
                        'iqama' => $today->maghrib_iqama?->format('H:i')
                    ],
                    'isha' => [
                        'time' => $today->isha->format('H:i'),
                        'iqama' => $today->isha_iqama?->format('H:i')
                    ]
                ],
                'next_prayer' => $nextPrayer ? [
                    'name' => $nextPrayer['name'],
                    'time' => $nextPrayer['time']->format('H:i'),
                    'iqama' => $nextPrayer['iqama']?->format('H:i'),
                    'countdown' => $nextPrayer['time']->diffInSeconds(now())
                ] : null,
                'mosque' => $mosque ? [
                    'name' => $mosque->name,
                    'timezone' => $mosque->timezone
                ] : null
            ]
        ]);
    }

    /**
     * Get prayer times for a specific month
     */
    public function month($month = null)
    {
        $month = $month ?: now()->format('Y-m');
        $prayerTimes = PrayerTime::where('date', 'like', $month . '%')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $prayerTimes->map(function ($pt) {
                return [
                    'date' => $pt->date,
                    'hijri_date' => $pt->hijri_date,
                    'fajr' => $pt->fajr->format('H:i'),
                    'dhuhr' => $pt->dhuhr->format('H:i'),
                    'asr' => $pt->asr->format('H:i'),
                    'maghrib' => $pt->maghrib->format('H:i'),
                    'isha' => $pt->isha->format('H:i'),
                    'is_ramadan' => $pt->is_ramadan
                ];
            })
        ]);
    }

    /**
     * Get countdown to next prayer
     */
    public function countdown()
    {
        $today = PrayerTime::getToday();
        
        if (!$today) {
            return response()->json([
                'success' => false,
                'message' => 'Prayer times for today not found'
            ], 404);
        }

        $nextPrayer = $today->getNextPrayer();
        $currentPrayer = null;
        
        // Find current prayer
        $now = now();
        $prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        
        for ($i = count($prayers) - 1; $i >= 0; $i--) {
            if ($today->{$prayers[$i]} <= $now) {
                $currentPrayer = [
                    'name' => $prayers[$i],
                    'time' => $today->{$prayers[$i]}->format('H:i'),
                    'iqama' => $today->{$prayers[$i] . '_iqama'}?->format('H:i')
                ];
                break;
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'current_time' => $now->format('H:i:s'),
                'current_prayer' => $currentPrayer,
                'next_prayer' => $nextPrayer ? [
                    'name' => $nextPrayer['name'],
                    'time' => $nextPrayer['time']->format('H:i'),
                    'iqama' => $nextPrayer['iqama']?->format('H:i'),
                    'countdown_seconds' => $nextPrayer['time']->diffInSeconds($now),
                    'countdown_formatted' => $this->formatCountdown($nextPrayer['time']->diffInSeconds($now))
                ] : null
            ]
        ]);
    }

    private function formatCountdown($seconds)
    {
        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        $secs = $seconds % 60;
        
        return sprintf('%02d:%02d:%02d', $hours, $minutes, $secs);
    }
}
