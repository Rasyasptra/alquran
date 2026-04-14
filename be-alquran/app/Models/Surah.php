<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Surah extends Model
{
    use HasFactory;

    protected $fillable = [
        'number',
        'name_ar',
        'name_id',
        'translation_id',
        'numberOfVerses',
        'revelation',
        'audio_url',
        'reciter',
        'audio_duration',
        'file_size',
        'audio_format',
        'has_audio'
    ];

    protected $casts = [
        'numberOfVerses' => 'integer',
        'file_size' => 'integer',
        'has_audio' => 'boolean'
    ];

    public function scopeWithAudio($query)
    {
        return $query->where('has_audio', true);
    }

    public function scopeByRevelation($query, $type)
    {
        return $query->where('revelation', ucfirst($type));
    }

    public function getFormattedDurationAttribute()
    {
        return $this->audio_duration ?: 'N/A';
    }

    public function getFormattedFileSizeAttribute()
    {
        if (!$this->file_size) return 'N/A';
        
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function getAudioTypeAttribute()
    {
        return $this->revelation === 'Meccan' ? 'Meccan' : 'Madinan';
    }

    public static function getReciters()
    {
        return [
            'mishari_rashid' => 'Mishari Rashid Alafasy',
            'abdul_rahman_al_sudais' => 'Abdul Rahman Al-Sudais',
            'saad_al_ghamdi' => 'Saad Al-Ghamdi',
            'mahmoud_khalil' => 'Mahmoud Khalil Al-Husary',
            'ali_jaber' => 'Ali Jaber'
        ];
    }
}
