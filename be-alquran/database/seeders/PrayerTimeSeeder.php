<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PrayerTime;
use Carbon\Carbon;

class PrayerTimeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Generate prayer times for current month
        $startDate = now()->startOfMonth();
        $endDate = now()->endOfMonth();
        
        while ($startDate <= $endDate) {
            // Simple prayer time calculation (in real app, use proper calculation library)
            $date = $startDate->format('Y-m-d');
            $month = $startDate->format('m');
            $year = $startDate->format('Y');
            
            // Basic prayer times (you should use proper calculation based on coordinates)
            $prayerTimes = $this->calculatePrayerTimes($startDate);
            
            // Hijri date calculation (simplified)
            $hijriDate = $this->calculateHijriDate($startDate);
            
            PrayerTime::create([
                'date' => $date,
                'fajr' => $prayerTimes['fajr'],
                'dhuhr' => $prayerTimes['dhuhr'],
                'asr' => $prayerTimes['asr'],
                'maghrib' => $prayerTimes['maghrib'],
                'isha' => $prayerTimes['isha'],
                'fajr_iqama' => $prayerTimes['fajr_iqama'],
                'dhuhr_iqama' => $prayerTimes['dhuhr_iqama'],
                'asr_iqama' => $prayerTimes['asr_iqama'],
                'maghrib_iqama' => $prayerTimes['maghrib_iqama'],
                'isha_iqama' => $prayerTimes['isha_iqama'],
                'hijri_date' => $hijriDate['day'],
                'month' => $hijriDate['month'],
                'year' => $hijriDate['year'],
                'is_ramadan' => $this->isRamadan($hijriDate['month']),
            ]);
            
            $startDate->addDay();
        }
    }
    
    private function calculatePrayerTimes($date)
    {
        // Simplified prayer times - in production use proper calculation
        $baseHour = 12; // Dhuhr at noon
        
        return [
            'fajr' => Carbon::createFromTime($baseHour - 6, 30, 0),
            'dhuhr' => Carbon::createFromTime($baseHour, 1, 0),
            'asr' => Carbon::createFromTime($baseHour + 3, 30, 0),
            'maghrib' => Carbon::createFromTime($baseHour + 6, 15, 0),
            'isha' => Carbon::createFromTime($baseHour + 7, 30, 0),
            'fajr_iqama' => Carbon::createFromTime($baseHour - 6, 45, 0),
            'dhuhr_iqama' => Carbon::createFromTime($baseHour + 15, 0),
            'asr_iqama' => Carbon::createFromTime($baseHour + 3, 45, 0),
            'maghrib_iqama' => Carbon::createFromTime($baseHour + 6, 20, 0),
            'isha_iqama' => Carbon::createFromTime($baseHour + 7, 45, 0),
        ];
    }
    
    private function calculateHijriDate($date)
    {
        // Simplified Hijri calculation - in production use proper library
        $day = $date->format('d');
        $month = $date->format('m');
        $year = $date->format('Y');
        
        // Very basic approximation
        $hijriYear = $year - 579;
        $hijriMonth = $month;
        
        return [
            'day' => $day,
            'month' => $hijriMonth,
            'year' => $hijriYear
        ];
    }
    
    private function isRamadan($month)
    {
        return $month == 9; // Ramadan is 9th month in Hijri calendar
    }
}
