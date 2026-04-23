<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class JadwalPetugas extends Model
{
    use HasFactory;

    protected $fillable = [
        'tanggal',
        'imam_id',
        'bilal_id',
        'muadzin_id',
        'penceramah_id',
        'catatan',
    ];

    public function imam()
    {
        return $this->belongsTo(Petugas::class, 'imam_id');
    }

    public function bilal()
    {
        return $this->belongsTo(Petugas::class, 'bilal_id');
    }

    public function muadzin()
    {
        return $this->belongsTo(Petugas::class, 'muadzin_id');
    }

    public function penceramah()
    {
        return $this->belongsTo(Petugas::class, 'penceramah_id');
    }
}
