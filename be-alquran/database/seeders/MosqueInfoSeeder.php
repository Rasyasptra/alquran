<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MosqueInfo;

class MosqueInfoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        MosqueInfo::create([
            'name' => 'Masjid Jami\' Al-Ikhlas Kantor Pusat',
            'address' => 'Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta 10110',
            'phone' => '+62 21 1234 5678',
            'email' => 'info@masjid-alikhlas.com',
            'latitude' => -6.2088,
            'longitude' => 106.8456,
            'timezone' => 'Asia/Jakarta',
            'description' => 'Masjid Jami\' Al-Ikhlas adalah masjid utama yang melayani kebutuhan spiritual para karyawan dan pengunjung kantor pusat. Dilengkapi dengan fasilitas modern dan program keagamaan rutin.',
            'logo_url' => 'https://example.com/logo-masjid.png',
            'website_url' => 'https://masjid-alikhlas.com',
            'social_media' => json_encode([
                'instagram' => 'https://instagram.com/masjid_alikhlas',
                'youtube' => 'https://youtube.com/@masjid_alikhlas',
                'facebook' => 'https://facebook.com/masjid.alikhlas'
            ]),
            'is_active' => true
        ]);
    }
}
