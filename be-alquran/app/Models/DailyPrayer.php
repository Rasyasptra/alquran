<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyPrayer extends Model
{
    use HasFactory;

    protected $table = 'daily_prayers';

    protected $fillable = [
        'category',
        'title_ar',
        'title_id',
        'arabic_text',
        'latin_text',
        'translation_id',
        'source',
        'audio_url',
        'order',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer'
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order', 'asc');
    }

    public static function getRandom()
    {
        return self::active()->inRandomOrder()->first();
    }

    public static function getCategories()
    {
        return [
            'doa_adzan' => 'Doa Setelah Adzan',
            'doa_makan' => 'Doa Sebelum & Sesudah Makan',
            'doa_pagi' => 'Doa Pagi Hari',
            'doa_petang' => 'Doa Petang Hari',
            'doa_tidur' => 'Doa Sebelum Tidur',
            'doa_bangun' => 'Doa Bangun Tidur',
            'doa_wudhu' => 'Doa Sebelum & Sesudah Wudhu',
            'doa_sholat' => 'Doa Setelah Sholat',
            'doa_safar' => 'Doa Bepergian',
            'doa_pakaian' => 'Doa Memakai Pakaian'
        ];
    }
}
