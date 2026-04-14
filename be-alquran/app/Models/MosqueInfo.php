<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MosqueInfo extends Model
{
    use HasFactory;

    protected $table = 'mosque_info';

    protected $fillable = [
        'name',
        'address',
        'phone',
        'email',
        'latitude',
        'longitude',
        'timezone',
        'description',
        'logo_url',
        'website_url',
        'social_media',
        'is_active'
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'social_media' => 'array',
        'is_active' => 'boolean'
    ];

    public static function getDefault()
    {
        return self::where('is_active', true)->first();
    }
}
