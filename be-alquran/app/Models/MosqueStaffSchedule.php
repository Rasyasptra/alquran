<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MosqueStaffSchedule extends Model
{
    use HasFactory;

    protected $table = 'mosque_staff_schedules';

    protected $fillable = [
        'date',
        'imam',
        'bilal',
        'muadzin',
        'penceramah',
        'notes'
    ];

    protected $casts = [
        'date' => 'date'
    ];

    public function scopeByMonth($query, $month)
    {
        return $query->where('date', 'like', $month . '%');
    }

    public function scopeByDate($query, $date)
    {
        return $query->where('date', $date);
    }
}
