<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Petugas extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama',
        'jabatan',
        'no_telepon',
        'aktif',
    ];
}
