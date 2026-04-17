<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\JadwalSholatService;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;

class PrayerTimeController extends Controller
{
    public function __construct(private JadwalSholatService $service) {}

    /**
     * Jadwal sholat hari ini (diambil dari eQuran.id via cache)
     */
    public function today()
    {
        try {
            $schedule = $this->service->getTodaySchedule();

            if (!$schedule) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jadwal sholat hari ini tidak ditemukan.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data'    => [
                    'date'     => $schedule['tanggal_lengkap'],
                    'hari'     => $schedule['hari'],
                    'location' => [
                        'provinsi' => $this->service->getProvinsi(),
                        'kabkota'  => $this->service->getKabkota(),
                    ],
                    'fajr'    => $schedule['subuh'],
                    'dhuhr'   => $schedule['dzuhur'],
                    'asr'     => $schedule['ashar'],
                    'maghrib' => $schedule['maghrib'],
                    'isha'    => $schedule['isya'],
                    'imsak'   => $schedule['imsak'],
                ],
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 503);
        }
    }

    /**
     * Jadwal sholat bulanan (diambil dari eQuran.id via cache)
     * Route: GET /prayer-times/month/{month?}  →  month = "YYYY-MM"
     */
    public function month($month = null)
    {
        $monthParam = $month ?? now()->format('Y-m');
        $parts      = explode('-', $monthParam);

        if (count($parts) !== 2 || !is_numeric($parts[0]) || !is_numeric($parts[1])) {
            return response()->json([
                'success' => false,
                'message' => 'Format bulan tidak valid. Gunakan format YYYY-MM.',
            ], 422);
        }

        [$year, $mon] = [(int) $parts[0], (int) $parts[1]];

        try {
            $schedules = $this->service->getMonthSchedule($mon, $year);

            return response()->json([
                'success' => true,
                'data'    => collect($schedules)->map(fn ($s) => [
                    'id'      => $s['tanggal'] ?? 0,
                    'date'    => $s['tanggal_lengkap'],
                    'hari'    => $s['hari'],
                    'fajr'    => $s['subuh'],
                    'dhuhr'   => $s['dzuhur'],
                    'asr'     => $s['ashar'],
                    'maghrib' => $s['maghrib'],
                    'isha'    => $s['isya'],
                    'imsak'   => $s['imsak'],
                ])->values(),
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 503);
        }
    }

    /**
     * Countdown ke sholat berikutnya
     */
    public function countdown()
    {
        try {
            $schedule = $this->service->getTodaySchedule();

            if (!$schedule) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jadwal sholat hari ini tidak ditemukan.',
                ], 404);
            }

            $now       = now();
            $dateStr   = $schedule['tanggal_lengkap'];
            $prayers   = [
                ['key' => 'fajr',    'name' => 'Subuh',   'time' => $schedule['subuh']],
                ['key' => 'dhuhr',   'name' => 'Dzuhur',  'time' => $schedule['dzuhur']],
                ['key' => 'asr',     'name' => 'Ashar',   'time' => $schedule['ashar']],
                ['key' => 'maghrib', 'name' => 'Maghrib', 'time' => $schedule['maghrib']],
                ['key' => 'isha',    'name' => 'Isya',    'time' => $schedule['isya']],
            ];

            $nextPrayer    = null;
            $currentPrayer = null;

            foreach ($prayers as $prayer) {
                $prayerTime = Carbon::parse("{$dateStr} {$prayer['time']}");
                if ($prayerTime > $now) {
                    $diffSecs  = $prayerTime->diffInSeconds($now);
                    $nextPrayer = [
                        'name'                => $prayer['name'],
                        'time'                => $prayer['time'],
                        'countdown_seconds'   => $diffSecs,
                        'countdown_formatted' => $this->formatCountdown($diffSecs),
                    ];
                    break;
                }
                $currentPrayer = ['name' => $prayer['name'], 'time' => $prayer['time']];
            }

            return response()->json([
                'success' => true,
                'data'    => [
                    'current_time'   => $now->format('H:i:s'),
                    'current_prayer' => $currentPrayer,
                    'next_prayer'    => $nextPrayer,
                ],
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 503);
        }
    }

    private function formatCountdown(int $seconds): string
    {
        return sprintf('%02d:%02d:%02d', floor($seconds / 3600), floor(($seconds % 3600) / 60), $seconds % 60);
    }
}
