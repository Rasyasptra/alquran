<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Surah;

class SurahSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $surahs = [
            // Juz 1 - Al-Fatihah to Al-Baqarah 141
            [
                'number' => 1,
                'name_ar' => 'الفاتحة',
                'name_id' => 'Al-Fatihah',
                'translation_id' => 'Pembukaan',
                'numberOfVerses' => 7,
                'revelation' => 'Meccan',
                'audio_url' => 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/1.mp3',
                'reciter' => 'mishari_rashid',
                'audio_duration' => '00:04:35',
                'file_size' => 1085440,
                'audio_format' => 'mp3',
                'has_audio' => true
            ],
            [
                'number' => 2,
                'name_ar' => 'البقرة',
                'name_id' => 'Al-Baqarah',
                'translation_id' => 'Sapi',
                'numberOfVerses' => 286,
                'revelation' => 'Madinan',
                'audio_url' => 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/2.mp3',
                'reciter' => 'mishari_rashid',
                'audio_duration' => '02:35:45',
                'file_size' => 37153280,
                'audio_format' => 'mp3',
                'has_audio' => true
            ],
            // Surat-surat pendek populer dengan audio
            [
                'number' => 36,
                'name_ar' => 'يس',
                'name_id' => 'Yasin',
                'translation_id' => 'Yasin',
                'numberOfVerses' => 83,
                'revelation' => 'Meccan',
                'audio_url' => 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/36.mp3',
                'reciter' => 'mishari_rashid',
                'audio_duration' => '00:15:20',
                'file_size' => 2191360,
                'audio_format' => 'mp3',
                'has_audio' => true
            ],
            [
                'number' => 55,
                'name_ar' => 'الرحمن',
                'name_id' => 'Ar-Rahman',
                'translation_id' => 'Yang Maha Pemurah',
                'numberOfVerses' => 78,
                'revelation' => 'Meccan',
                'audio_url' => 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/55.mp3',
                'reciter' => 'mishari_rashid',
                'audio_duration' => '00:08:45',
                'file_size' => 1269760,
                'audio_format' => 'mp3',
                'has_audio' => true
            ],
            [
                'number' => 56,
                'name_ar' => 'الواقعة',
                'name_id' => 'Al-Waqi\'ah',
                'translation_id' => 'Hari Kiamat',
                'numberOfVerses' => 96,
                'revelation' => 'Meccan',
                'audio_url' => 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/56.mp3',
                'reciter' => 'mishari_rashid',
                'audio_duration' => '00:12:30',
                'file_size' => 1802240,
                'audio_format' => 'mp3',
                'has_audio' => true
            ],
            [
                'number' => 67,
                'name_ar' => 'الملك',
                'name_id' => 'Al-Mulk',
                'translation_id' => 'Kerajaan',
                'numberOfVerses' => 30,
                'revelation' => 'Meccan',
                'audio_url' => 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/67.mp3',
                'reciter' => 'mishari_rashid',
                'audio_duration' => '00:07:15',
                'file_size' => 1044480,
                'audio_format' => 'mp3',
                'has_audio' => true
            ],
            [
                'number' => 110,
                'name_ar' => 'النصر',
                'name_id' => 'An-Nasr',
                'translation_id' => 'Pertolongan',
                'numberOfVerses' => 3,
                'revelation' => 'Madinan',
                'audio_url' => 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/110.mp3',
                'reciter' => 'mishari_rashid',
                'audio_duration' => '00:01:05',
                'file_size' => 151040,
                'audio_format' => 'mp3',
                'has_audio' => true
            ],
            [
                'number' => 111,
                'name_ar' => 'المسد',
                'name_id' => 'Al-Lahab',
                'translation_id' => 'Gejolak Api',
                'numberOfVerses' => 5,
                'revelation' => 'Meccan',
                'audio_url' => 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/111.mp3',
                'reciter' => 'mishari_rashid',
                'audio_duration' => '00:00:45',
                'file_size' => 104448,
                'audio_format' => 'mp3',
                'has_audio' => true
            ],
            [
                'number' => 112,
                'name_ar' => 'الإخلاص',
                'name_id' => 'Al-Ikhlas',
                'translation_id' => 'Ikhlas',
                'numberOfVerses' => 4,
                'revelation' => 'Meccan',
                'audio_url' => 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/112.mp3',
                'reciter' => 'mishari_rashid',
                'audio_duration' => '00:00:35',
                'file_size' => 81408,
                'audio_format' => 'mp3',
                'has_audio' => true
            ],
            [
                'number' => 113,
                'name_ar' => 'الفلق',
                'name_id' => 'Al-Falaq',
                'translation_id' => 'Waktu Subuh',
                'numberOfVerses' => 5,
                'revelation' => 'Meccan',
                'audio_url' => 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/113.mp3',
                'reciter' => 'mishari_rashid',
                'audio_duration' => '00:00:40',
                'file_size' => 92160,
                'audio_format' => 'mp3',
                'has_audio' => true
            ],
            [
                'number' => 114,
                'name_ar' => 'الناس',
                'name_id' => 'An-Nas',
                'translation_id' => 'Manusia',
                'numberOfVerses' => 6,
                'revelation' => 'Meccan',
                'audio_url' => 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/114.mp3',
                'reciter' => 'mishari_rashid',
                'audio_duration' => '00:00:45',
                'file_size' => 103424,
                'audio_format' => 'mp3',
                'has_audio' => true
            ]
        ];

        foreach ($surahs as $surah) {
            Surah::create($surah);
        }
    }
}
