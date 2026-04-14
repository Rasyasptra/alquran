<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DailyPrayer;

class DailyPrayerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $prayers = [
            // Doa Adzan
            [
                'category' => 'doa_adzan',
                'title_ar' => 'اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ',
                'title_id' => 'Doa Setelah Adzan',
                'arabic_text' => 'اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ',
                'latin_text' => 'Allahumma rabba hadzihid da\'wati-t-tammati, was-shalati-l-qaimah, ati muhammadanil wasilata wal-fadilata, wab\'athu maqaman mahmudan-alladhi wa\'adtah',
                'translation_id' => 'Ya Allah, Tuhan yang menguasai seruan sempurna ini dan shalat yang didirikan, berikanlah kepada Muhammad wasilah (kedudukan yang mulia) dan keutamaan, dan bangkitkan dia di tempat yang terpuji yang telah Engkau janjikan',
                'source' => 'HR. Bukhari',
                'order' => 1,
                'is_active' => true
            ],
            
            // Doa Makan
            [
                'category' => 'doa_makan',
                'title_ar' => 'بِسْمِ اللَّهِ',
                'title_id' => 'Doa Sebelum Makan',
                'arabic_text' => 'بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ',
                'latin_text' => 'Bismillahi wa \'ala barakatillah',
                'translation_id' => 'Dengan menyebut nama Allah dan dengan berkah Allah',
                'source' => 'HR. Abu Dawud',
                'order' => 2,
                'is_active' => true
            ],
            
            [
                'category' => 'doa_makan',
                'title_ar' => 'الْحَمْدُ لِلَّهِ',
                'title_id' => 'Doa Sesudah Makan',
                'arabic_text' => 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
                'latin_text' => 'Alhamdulillahilladhi ath\'amani hadza wa razaqanihi min ghairi haulin minni wa la quwwah',
                'translation_id' => 'Segala puji bagi Allah yang telah memberiku makanan ini dan rezeki dari-Nya tanpa daya dan kekuatan dariku',
                'source' => 'HR. Tirmidzi',
                'order' => 3,
                'is_active' => true
            ],
            
            // Doa Pagi
            [
                'category' => 'doa_pagi',
                'title_ar' => 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ',
                'title_id' => 'Doa Pagi Hari',
                'arabic_text' => 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ، اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذَا الْيَوْمِ فَتْحَهُ وَنَصْرَهُ وَنُورَهُ وَبَرَكَتَهُ وَهُدَاهُ',
                'latin_text' => 'Ashbahna wa ashbal-mulku lillahi rabbil-\'alamin, Allahumma inni as\'aluka khairra hadzal-yawmi fathahu wa nashrahu wa nurahu wa barakatahu wa hadahu',
                'translation_id' => 'Kami memasuki waktu pagi dan kerajaan milik Allah, Tuhan semesta alam. Ya Allah, sesungguhnya aku memohon kepada-Mu kebaikan hari ini: pembukaannya, pertolongannya, cahayanya, keberkahannya, dan petunjuknya',
                'source' => 'HR. Muslim',
                'order' => 4,
                'is_active' => true
            ],
            
            // Doa Petang
            [
                'category' => 'doa_petang',
                'title_ar' => 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ',
                'title_id' => 'Doa Petang Hari',
                'arabic_text' => 'أَمْسَيْنَا وَأَمْسَى الْMُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ، اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذِهِ اللَّيْلَةِ فَتْحَهَا وَنَصْرَهَا وَنُورَهَا وَبَرَكَتَهَا وَهُدَاهَا',
                'latin_text' => 'Amsaina wa amsal-mulku lillahi rabbil-\'alamin, Allahumma inni as\'aluka khairra hadzihil-lailati fathaha wa nashraha wa nuraha wa barakataha wa hadaha',
                'translation_id' => 'Kami memasuki waktu petang dan kerajaan milik Allah, Tuhan semesta alam. Ya Allah, sesungguhnya aku memohon kepada-Mu kebaikan malam ini: pembukaannya, pertolongannya, cahayanya, keberkahannya, dan petunjuknya',
                'source' => 'HR. Muslim',
                'order' => 5,
                'is_active' => true
            ],
            
            // Doa Tidur
            [
                'category' => 'doa_tidur',
                'title_ar' => 'اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا',
                'title_id' => 'Doa Sebelum Tidur',
                'arabic_text' => 'اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا',
                'latin_text' => 'Allahumma bismika amutu wa ahya',
                'translation_id' => 'Ya Allah, dengan menyebut nama-Mu aku mati dan hidup',
                'source' => 'HR. Bukhari',
                'order' => 6,
                'is_active' => true
            ],
            
            // Doa Bangun Tidur
            [
                'category' => 'doa_bangun',
                'title_ar' => 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا',
                'title_id' => 'Doa Bangun Tidur',
                'arabic_text' => 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
                'latin_text' => 'Alhamdulillahilladhi ahyana ba\'da ma amatana wa ilayhin-nushur',
                'translation_id' => 'Segala puji bagi Allah yang telah menghidupkan kami setelah Dia mematikan kami, dan kepada-Nya kami akan dibangkitkan',
                'source' => 'HR. Bukhari',
                'order' => 7,
                'is_active' => true
            ],
            
            // Doa Wudhu
            [
                'category' => 'doa_wudhu',
                'title_ar' => 'اللَّهُمَّ اغْفِرْ لِي ذَنْبِي',
                'title_id' => 'Doa Sesudah Wudhu',
                'arabic_text' => 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
                'latin_text' => 'Ashhadu an la ilaha illallahu wahdahu la sharika lah wa ashhadu anna muhammadan \'abduhu wa rasuluh',
                'translation_id' => 'Aku bersaksi bahwa tidak ada ilah selain Allah, Dia sendiri, tidak ada sekutu bagi-Nya. Dan aku bersaksi bahwa Muhammad adalah hamba dan utusan-Nya',
                'source' => 'HR. Muslim',
                'order' => 8,
                'is_active' => true
            ]
        ];

        foreach ($prayers as $prayer) {
            DailyPrayer::create($prayer);
        }
    }
}
