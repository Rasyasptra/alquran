<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PrayerTime extends Model
{
    use HasFactory;

    protected $table = 'prayer_times';

    protected $fillable = [
        'date',
        'fajr',
        'dhuhr',
        'asr',
        'maghrib',
        'isha',
        'fajr_iqama',
        'dhuhr_iqama',
        'asr_iqama',
        'maghrib_iqama',
        'isha_iqama',
        'hijri_date',
        'month',
        'year',
        'is_ramadan'
    ];

    protected $casts = [
        'date' => 'date',
        'fajr' => 'datetime',
        'dhuhr' => 'datetime',
        'asr' => 'datetime',
        'maghrib' => 'datetime',
        'isha' => 'datetime',
        'fajr_iqama' => 'datetime',
        'dhuhr_iqama' => 'datetime',
        'asr_iqama' => 'datetime',
        'maghrib_iqama' => 'datetime',
        'isha_iqama' => 'datetime',
        'is_ramadan' => 'boolean'
    ];

    public function getNextPrayer()
    {
        $now = now();
        $prayers = [
            'fajr' => $this->fajr,
            'dhuhr' => $this->dhuhr,
            'asr' => $this->asr,
            'maghrib' => $this->maghrib,
            'isha' => $this->isha
        ];

        foreach ($prayers as $name => $time) {
            if ($time > $now) {
                return [
                    'name' => $name,
                    'time' => $time,
                    'iqama' => $this->{$name . '_iqama'}
                ];
            }
        }

        return null;
    }

    public static function getToday()
    {
        return self::where('date', now()->format('Y-m-d'))->first();
    }
}
