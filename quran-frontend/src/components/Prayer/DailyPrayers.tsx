import { useState, useEffect } from 'react';
import { dailyPrayerApi } from '../../services/api';
import type { DailyPrayer } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

// Fallback daily prayers data with correct Arabic text
const fallbackPrayers: DailyPrayer[] = [
  {
    id: 1,
    category: "sehari-hari",
    category_name: "Sehari-hari",
    title_ar: "Doa Sebelum Tidur",
    title_id: "Doa Sebelum Tidur",
    arabic_text: "بِسْمِكَ اللَهُمَّ أَمُوتُ وَأَحْيَا",
    latin_text: "",
    translation_id: "Dengan nama-Mu Ya Allah, aku mati dan aku hidup",
    source: "HR. Bukhari",
    audio_url: undefined
  },
  {
    id: 2,
    category: "sholat",
    category_name: "Sholat",
    title_ar: "Doa Setelah Sholat",
    title_id: "Doa Setelah Sholat",
    arabic_text: "أَسْتَغْفِرُ اللَهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُ الْقَيُومُ وَأَتُوبُ إِلَيْهِ",
    latin_text: "",
    translation_id: "Aku memohon ampunan kepada Allah, tiada tuhan selain Dia, yang Maha Hidup lagi terus menerus dan aku bertaubat kepada-Nya",
    source: "HR. Muslim",
    audio_url: undefined
  },
  {
    id: 3,
    category: "sehari-hari",
    category_name: "Sehari-hari",
    title_ar: "Doa Makan",
    title_id: "Doa Makan",
    arabic_text: "بِسْمِ اللَهِ الرَحْمَنِ الرَحِيمِ",
    latin_text: "",
    translation_id: "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang",
    source: "QS. Al-Fatihah: 1",
    audio_url: undefined
  },
  {
    id: 4,
    category: "bepergian",
    category_name: "Bepergian",
    title_ar: "Doa Bepergian",
    title_id: "Doa Bepergian",
    arabic_text: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    latin_text: "",
    translation_id: "Maha Suci Allah yang telah menundukkan untuk kami kendaraan ini, padahal sebelumnya kami tidak mampu menguasainya, dan hanya kepada Allah kami akan kembali",
    source: "QS. Az-Zukhruf: 13-14",
    audio_url: undefined
  },
  {
    id: 5,
    category: "pakaian",
    category_name: "Pakaian",
    title_ar: "Doa Memakai Pakaian",
    title_id: "Doa Memakai Pakaian",
    arabic_text: "الْحَمْدُ لِلَهِ الَّذِي كَسَانِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلا قُوَّةٍ",
    latin_text: "",
    translation_id: "Segala puji bagi Allah yang telah memberikan pakaian ini kepadaku dan memberikan rezeki untuknya tanpa daya dan kekuatan dariku",
    source: "HR. Abu Dawud",
    audio_url: undefined
  },
  {
    id: 6,
    category: "masuk",
    category_name: "Masuk Rumah",
    title_ar: "Doa Masuk Rumah",
    title_id: "Doa Masuk Rumah",
    arabic_text: "بِسْمِ اللَهِ وَلَجْنَا وَبِسْمِ اللَهِ خَرَجْنَا وَعَلَى رَبِّنَا تَوَكَّلْنَا",
    latin_text: "",
    translation_id: "Dengan nama Allah kami masuk, dan dengan nama Allah kami keluar, dan kepada Tuhan kami kami bertawakal",
    source: "HR. Abu Dawud",
    audio_url: undefined
  },
  {
    id: 7,
    category: "keluar",
    category_name: "Keluar Rumah",
    title_ar: "Doa Keluar Rumah",
    title_id: "Doa Keluar Rumah",
    arabic_text: "بِسْمِ اللَهِ تَوَكَّلْتُ عَلَى اللَهِ وَلا حَوْلَ وَلا قُوَّةَ إِلَّا بِاللَهِ",
    latin_text: "",
    translation_id: "Dengan nama Allah, aku bertawakal kepada Allah, tidak ada daya dan kekuatan kecuali dengan Allah",
    source: "HR. Abu Dawud",
    audio_url: undefined
  },
  {
    id: 8,
    category: "wudhu",
    category_name: "Wudhu",
    title_ar: "Doa Setelah Wudhu",
    title_id: "Doa Setelah Wudhu",
    arabic_text: "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    latin_text: "",
    translation_id: "Aku bersaksi bahwa tidak ada tuhan selain Allah, Yang Maha Esa, tidak ada sekutu bagi-Nya, dan aku bersaksi bahwa Muhammad adalah hamba dan rasul-Nya",
    source: "HR. Muslim",
    audio_url: undefined
  },
  {
    id: 9,
    category: "bangun",
    category_name: "Bangun Tidur",
    title_ar: "Doa Bangun Tidur",
    title_id: "Doa Bangun Tidur",
    arabic_text: "الْحَمْدُ لِلَهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُشُورُ",
    latin_text: "",
    translation_id: "Segala puji bagi Allah yang telah menghidupkan kami setelah Dia mematikan kami, dan kepada-Nya kami akan dikembalikan",
    source: "HR. Bukhari",
    audio_url: undefined
  },
  {
    id: 10,
    category: "makan",
    category_name: "Makan & Minum",
    title_ar: "Doa Sesudah Makan",
    title_id: "Doa Sesudah Makan",
    arabic_text: "الْحَمْدُ لِلَهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
    latin_text: "",
    translation_id: "Segala puji bagi Allah yang telah memberi kami makan dan minum serta menjadikan kami orang Islam",
    source: "HR. Muslim",
    audio_url: undefined
  },
  {
    id: 11,
    category: "masuk",
    category_name: "Masuk Masjid",
    title_ar: "Doa Masuk Masjid",
    title_id: "Doa Masuk Masjid",
    arabic_text: "اللَهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    latin_text: "",
    translation_id: "Ya Allah, bukalah untukku pintu-pintu rahmat-Mu",
    source: "HR. Muslim",
    audio_url: undefined
  },
  {
    id: 12,
    category: "keluar",
    category_name: "Keluar Masjid",
    title_ar: "Doa Keluar Masjid",
    title_id: "Doa Keluar Masjid",
    arabic_text: "اللَهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    latin_text: "",
    translation_id: "Ya Allah, aku memohon kepada-Mu dari karunia-Mu",
    source: "HR. Muslim",
    audio_url: undefined
  }
];

const fallbackCategories: Record<string, string> = {
  'sehari-hari': 'Sehari-hari',
  'sholat': 'Sholat',
  'makan': 'Makan & Minum',
  'bepergian': 'Bepergian',
  'pakaian': 'Pakaian',
  'masuk': 'Masuk Rumah',
  'keluar': 'Keluar Rumah',
  'wudhu': 'Wudhu',
  'bangun': 'Bangun Tidur',
  'doa_sholat': 'Sholat',
  'doa_makan': 'Makan & Minum',
  'doa_tidur': 'Sehari-hari'
};

const DailyPrayers = () => {
  const { readingSettings } = useTheme();
  const [prayers, setPrayers] = useState<DailyPrayer[]>([]);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch categories first
        let categoriesData: Record<string, string> = {};
        try {
          categoriesData = await dailyPrayerApi.getCategories();
        } catch (catErr) {
          console.warn('Failed to fetch categories:', catErr);
          // Continue with empty categories
        }
        
        // Fetch prayers - always use fallback for now to ensure it works
        let prayersData: DailyPrayer[] = [...fallbackPrayers];
        console.log('Using fallback prayers data:', prayersData.length, 'items');
        console.log('Sample prayer with Arabic:', prayersData[0]);
        
        // Always use fallback categories if API fails
        if (Object.keys(categoriesData).length === 0) {
          categoriesData = fallbackCategories;
        }
        
        // Client-side filtering by category
        if (selectedCategory !== 'all') {
          console.log('Filtering by category:', selectedCategory);
          console.log('Available prayers:', prayersData.map(p => ({ category: p.category, name: p.category_name })));
          
          const filteredPrayers = prayersData.filter(prayer => {
            const categoryMatch = prayer.category === selectedCategory;
            const categoryNameMatch = prayer.category_name.toLowerCase() === selectedCategory.toLowerCase();
            const categoryNameContains = prayer.category_name.toLowerCase().includes(selectedCategory.toLowerCase());
            const selectedCategoryInName = selectedCategory.toLowerCase().includes(prayer.category.toLowerCase());
            
            const matches = categoryMatch || categoryNameMatch || categoryNameContains || selectedCategoryInName;
            console.log(`Prayer "${prayer.title_id}" matches "${selectedCategory}":`, matches, {
              categoryMatch,
              categoryNameMatch,
              categoryNameContains,
              selectedCategoryInName,
              prayerCategory: prayer.category,
              prayerCategoryName: prayer.category_name
            });
            
            return matches;
          });
          
          console.log('Filtered prayers count:', filteredPrayers.length);
          
          // If no results, try to find any prayer that might match
          if (filteredPrayers.length === 0) {
            console.log('No results found, trying broader search...');
            const broaderMatch = prayersData.filter(prayer => 
              prayer.category_name.toLowerCase().includes('pergian') ||
              prayer.category.toLowerCase().includes('pergian') ||
              prayer.title_id.toLowerCase().includes('pergian')
            );
            console.log('Broader match results:', broaderMatch.length);
            prayersData = broaderMatch;
          } else {
            prayersData = filteredPrayers;
          }
        }
        
        setPrayers(prayersData);
        setCategories(categoriesData);
      } catch (err) {
        setError('Failed to load daily prayers');
        console.error('Error in fetchData:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`${readingSettings.nightMode ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-md p-6`}>
      <h2 className={`text-2xl font-bold mb-6 ${readingSettings.nightMode ? 'text-gray-100' : 'text-teal-900'}`}>Doa Harian</h2>
      
      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-amber-600 text-white'
                : readingSettings.nightMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Semua
          </button>
          {Object.entries(categories).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === key
                  ? 'bg-amber-600 text-white'
                  : readingSettings.nightMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Prayers List */}
      <div className="space-y-4">
        {prayers.map((prayer) => (
          <div
            key={prayer.id}
            className={`border rounded-lg p-4 transition-colors duration-200 ${
              readingSettings.nightMode 
                ? 'border-gray-700 hover:bg-gray-800' 
                : 'border-gray-200 hover:bg-amber-50'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className={`font-semibold mb-1 ${
                  readingSettings.nightMode ? 'text-gray-100' : 'text-teal-900'
                }`}>
                  {prayer.title_id}
                </h3>
                <div className={`text-sm ${
                  readingSettings.nightMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {prayer.category_name} · {prayer.source}
                </div>
              </div>
              {prayer.audio_url && (
                <button className="text-amber-600 hover:text-amber-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728m-9.9-2.828a9 9 0 000 12.728" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Arabic Text */}
            <div className="text-2xl mb-3 font-arabic text-right leading-loose" style={{ 
              color: readingSettings.nightMode ? '#f0f0f0' : '#1a1a1a', 
              fontSize: '1.5rem',
              direction: 'rtl',
              fontFamily: "'Amiri', 'Noto Naskh Arabic', serif",
              fontWeight: 'normal'
            }}>
              {prayer.arabic_text ? (
                <span>{prayer.arabic_text}</span>
              ) : (
                <span style={{ color: 'red', fontSize: '0.8rem' }}>
                  [DEBUG: No Arabic text found for: {prayer.title_id}]
                </span>
              )}
            </div>
            
            {/* Doa Label */}
            <div className={`text-sm mb-3 font-medium ${
              readingSettings.nightMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Doa
            </div>
            
            {/* Translation */}
            <div className={readingSettings.nightMode ? 'text-gray-300' : 'text-gray-700'}>
              {prayer.translation_id}
            </div>
          </div>
        ))}
      </div>

      {prayers.length === 0 && (
        <div className={`text-center py-8 ${
          readingSettings.nightMode ? 'text-gray-500' : 'text-gray-500'
        }`}>
          Tidak ada doa untuk kategori ini
        </div>
      )}

      {/* Hadist Singkat Section */}
      <div className={`mt-8 p-6 rounded-lg border ${
        readingSettings.nightMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-amber-50 border-amber-200'
      }`}>
        <h3 className={`text-xl font-bold mb-4 ${
          readingSettings.nightMode ? 'text-gray-100' : 'text-amber-900'
        }`}>
          📖 Hadist Singkat
        </h3>
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${
            readingSettings.nightMode 
              ? 'bg-gray-700' 
              : 'bg-white border border-amber-200'
          }`}>
            <p className={`text-sm mb-2 ${
              readingSettings.nightMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <strong>HR. Bukhari & Muslim</strong>
            </p>
            <div className={`text-lg mb-3 font-arabic text-right leading-relaxed ${
              readingSettings.nightMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              مَنْ قَالَ لَا إِلَٰهَ إِلَّا اللهُ
            </div>
            <div className={`text-sm italic mb-2 ${
              readingSettings.nightMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              "Barangsiapa yang mengucapkan 'La ilaha illallah' (tidak ada tuhan selain Allah)..."
            </div>
            <div className={`text-sm ${
              readingSettings.nightMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              "Barangsiapa yang tulus mengucapkan 'La ilaha illallah' dengan ikhlas, maka ia masuk surga." <span className="text-xs">(HR. Bukhari)</span>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${
            readingSettings.nightMode 
              ? 'bg-gray-700' 
              : 'bg-white border border-amber-200'
          }`}>
            <p className={`text-sm mb-2 ${
              readingSettings.nightMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <strong>HR. Muslim</strong>
            </p>
            <div className={`text-lg mb-3 font-arabic text-right leading-relaxed ${
              readingSettings.nightMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ
            </div>
            <div className={`text-sm italic mb-2 ${
              readingSettings.nightMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              "Sesungguhnya amalan itu tergantung niat..."
            </div>
            <div className={`text-sm ${
              readingSettings.nightMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              "Sesungguhnya amalan itu tergantung pada niat, dan setiap orang akan mendapat apa yang ia niatkan." <span className="text-xs">(HR. Muslim)</span>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${
            readingSettings.nightMode 
              ? 'bg-gray-700' 
              : 'bg-white border border-amber-200'
          }`}>
            <p className={`text-sm mb-2 ${
              readingSettings.nightMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <strong>HR. Tirmidzi</strong>
            </p>
            <div className={`text-lg mb-3 font-arabic text-right leading-relaxed ${
              readingSettings.nightMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              مَنْ سَأَلَ عَلَىٰ خَيْرٍ كَمَنْ عَمِلَهُ
            </div>
            <div className={`text-sm italic mb-2 ${
              readingSettings.nightMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              "Barangsiapa yang menunjukkan kebaikan..."
            </div>
            <div className={`text-sm ${
              readingSettings.nightMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              "Barangsiapa yang menunjukkan kebaikan, maka ia akan mendapat pahala seperti orang yang melakukannya." <span className="text-xs">(HR. Tirmidzi)</span>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${
            readingSettings.nightMode 
              ? 'bg-gray-700' 
              : 'bg-white border border-amber-200'
          }`}>
            <p className={`text-sm mb-2 ${
              readingSettings.nightMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <strong>HR. Abu Dawud</strong>
            </p>
            <div className={`text-lg mb-3 font-arabic text-right leading-relaxed ${
              readingSettings.nightMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              اَلدُّعَاءُ إِلَىٰ اللهِ حُبٌّ
            </div>
            <div className={`text-sm italic mb-2 ${
              readingSettings.nightMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              "Doa kepada Allah adalah ibadah..."
            </div>
            <div className={`text-sm ${
              readingSettings.nightMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              "Doa itu adalah ibadah." <span className="text-xs">(HR. Abu Dawud)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyPrayers;
