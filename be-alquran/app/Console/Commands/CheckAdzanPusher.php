<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\JadwalSholatService;
use App\Models\PushSubscription;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class CheckAdzanPusher extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'adzan:check';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check prayer times and send Web Push notifications if it is time.';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(JadwalSholatService $jadwalService)
    {
        $now = Carbon::now('Asia/Jakarta');
        $dateStr = $now->format('Y-m-d');
        $timeStr = $now->format('H:i');

        // Fetch prayer times
        $schedules = $jadwalService->getMonth($now->format('Y-m'));
        $todaySchedule = null;
        
        foreach ($schedules as $schedule) {
            if ($schedule['date'] === $dateStr) {
                $todaySchedule = $schedule;
                break;
            }
        }

        if (!$todaySchedule) {
            $this->info("No prayer schedule found for today ($dateStr).");
            return 0;
        }

        $prayers = [
            'Subuh' => $todaySchedule['fajr'],
            'Dzuhur' => $todaySchedule['dhuhr'],
            'Ashar' => $todaySchedule['asr'],
            'Maghrib' => $todaySchedule['maghrib'],
            'Isya' => $todaySchedule['isha'],
        ];

        $matchedPrayer = null;

        foreach ($prayers as $name => $time) {
            // Check if current time matches prayer time
            if ($time === $timeStr) {
                $matchedPrayer = [
                    'name' => $name,
                    'time' => $time
                ];
                break;
            }
        }

        if (!$matchedPrayer) {
            $this->info("No matching prayer time right now. Current time: $timeStr WIB.");
            return 0;
        }

        // Prevent duplicate trigger for the same minute
        $cacheKey = "adzan_pushed_{$dateStr}_{$matchedPrayer['name']}";
        if (Cache::has($cacheKey)) {
            $this->info("Adzan {$matchedPrayer['name']} has already been pushed today.");
            return 0;
        }

        $this->info("Time for {$matchedPrayer['name']}! Sending pushes...");
        
        $subscriptions = PushSubscription::all();

        if ($subscriptions->isEmpty()) {
            $this->info('No web push subscribers found.');
            // Still set cache so we don't spam logs
            Cache::put($cacheKey, true, now()->addHours(12));
            return 0;
        }

        // Setup WebPush
        $auth = [
            'VAPID' => [
                'subject' => env('APP_URL', 'http://localhost'),
                'publicKey' => env('VAPID_PUBLIC_KEY'),
                'privateKey' => env('VAPID_PRIVATE_KEY'),
            ],
        ];

        $webPush = new WebPush($auth);
        
        $payload = json_encode([
            'title' => "Waktu Sholat {$matchedPrayer['name']}",
            'body' => "Saatnya sholat {$matchedPrayer['name']} pukul {$matchedPrayer['time']} WIB",
            'url' => env('FRONTEND_URL', 'http://localhost:5173') . '/jadwal'
        ]);

        $sentCount = 0;

        foreach ($subscriptions as $sub) {
            $webpushSubscription = Subscription::create([
                'endpoint' => $sub->endpoint,
                'publicKey' => $sub->public_key,
                'authToken' => $sub->auth_token,
            ]);

            $webPush->queueNotification($webpushSubscription, $payload);
            $sentCount++;
        }

        // Flush notifications
        foreach ($webPush->flush() as $report) {
            $endpoint = $report->getRequest()->getUri()->__toString();

            if ($report->isSuccess()) {
                $this->info("[v] Message sent successfully for $endpoint.");
            } else {
                $this->error("[x] Message failed to sent for $endpoint: {$report->getReason()}");
                
                // If endpoint is invalid/expired, we should remove it from DB
                if ($report->isSubscriptionExpired()) {
                    PushSubscription::where('endpoint', $endpoint)->delete();
                    $this->info("Deleted expired subscription: $endpoint");
                }
            }
        }

        // Mark as pushed
        Cache::put($cacheKey, true, now()->addHours(12));
        $this->info("Finished sending $sentCount push notifications.");

        return 0;
    }
}
