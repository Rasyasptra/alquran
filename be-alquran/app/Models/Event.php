<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $table = 'events';

    protected $fillable = [
        'title',
        'description',
        'speaker_name',
        'speaker_title',
        'start_datetime',
        'end_datetime',
        'location',
        'type',
        'is_recurring',
        'recurring_day',
        'poster_url',
        'streaming_url',
        'max_participants',
        'is_active'
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
        'is_recurring' => 'boolean',
        'is_active' => 'boolean',
        'max_participants' => 'integer'
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('start_datetime', '>', now());
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('start_datetime', 'asc');
    }

    public function getFormattedDateAttribute()
    {
        return $this->start_datetime->format('d M Y');
    }

    public function getFormattedTimeAttribute()
    {
        return $this->start_datetime->format('H:i') . ' - ' . 
               ($this->end_datetime ? $this->end_datetime->format('H:i') : 'Selesai');
    }

    public static function getTypes()
    {
        return [
            'kajian' => 'Kajian Islam',
            'pengajian' => 'Pengajian Rutin',
            'tarawih' => 'Sholat Tarawih',
            'idul_fitri' => 'Idul Fitri',
            'idul_adha' => 'Idul Adha',
            'lainnya' => 'Lainnya'
        ];
    }
}
