<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $table = 'announcements';

    protected $fillable = [
        'title',
        'content',
        'priority',
        'start_date',
        'end_date',
        'image_url',
        'link_url',
        'is_active',
        'views'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
        'views' => 'integer'
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCurrent($query)
    {
        $today = now()->format('Y-m-d');
        return $query->where('start_date', '<=', $today)
                    ->where(function ($q) use ($today) {
                        $q->whereNull('end_date')->orWhere('end_date', '>=', $today);
                    });
    }

    public function scopeByPriority($query, $priority = null)
    {
        if ($priority) {
            return $query->where('priority', $priority);
        }
        return $query->orderByRaw("FIELD(priority, 'high', 'medium', 'low')");
    }

    public function incrementViews()
    {
        $this->increment('views');
    }

    public static function getPriorities()
    {
        return [
            'high' => 'Penting',
            'medium' => 'Sedang',
            'low' => 'Biasa'
        ];
    }
}
