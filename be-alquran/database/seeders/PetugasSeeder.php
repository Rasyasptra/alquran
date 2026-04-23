<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PetugasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $petugas = [
            ['nama' => 'Ustadz Ahmad', 'jabatan' => 'imam', 'no_telepon' => '081234567890'],
            ['nama' => 'Bapak Budi', 'jabatan' => 'imam', 'no_telepon' => '081234567891'],
            ['nama' => 'Cipto', 'jabatan' => 'bilal', 'no_telepon' => '081234567892'],
            ['nama' => 'Dedi', 'jabatan' => 'muadzin', 'no_telepon' => '081234567893'],
            ['nama' => 'Kyai Eko', 'jabatan' => 'penceramah', 'no_telepon' => '081234567894'],
        ];

        foreach ($petugas as $p) {
            \App\Models\Petugas::create($p);
        }
    }
}
