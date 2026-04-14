import { useEffect, useState } from 'react';
import { ChevronLeft, BookOpen, Volume2, AlertCircle } from 'lucide-react';
import { useBookmarks } from '../contexts/BookmarkContext';

interface TafsirData {
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    numberOfAyahs: number;
  };
  numberInSurah: number;
  text: string;
  audio: string;
  tafsir?: {
    id?: string;
    en?: string;
  };
}

interface TafsirPageProps {
  surahNumber: number;
  ayahNumber: number;
  onBack: () => void;
}

const TafsirPage = ({ surahNumber, ayahNumber, onBack }: TafsirPageProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tafsirData, setTafsirData] = useState<TafsirData | null>(null);
  const { updateLastRead } = useBookmarks();

  useEffect(() => {
    const fetchTafsir = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`[Tafsir] Fetching ayah ${surahNumber}:${ayahNumber}...`);
        
        // Try multiple API endpoints for tafsir
        let response;
        let apiUsed = '';
        
        try {
          // First try: alquran.cloud with tafsir
          response = await fetch(
            `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/editions/quran-uthmani,id.indonesian,ar.tafsir_ibn_kathir`
          );
          apiUsed = 'alquran.cloud-tafsir';
          
          if (!response.ok) {
            throw new Error(`API ${apiUsed} failed: ${response.status}`);
          }
        } catch (err) {
          console.log(`[Tafsir] ${apiUsed} failed, trying fallback...`);
          
          // Fallback: alquran.cloud without tafsir
          response = await fetch(
            `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/editions/quran-uthmani,id.indonesian`
          );
          apiUsed = 'alquran.cloud-basic';
          
          if (!response.ok) {
            throw new Error(`All APIs failed. Last: ${response.status}`);
          }
        }
        
        if (!response.ok) {
          console.error('Tafsir API Error:', response.status, response.statusText);
          throw new Error(`Gagal memuat data tafsir (${response.status})`);
        }

        const data = await response.json();
        console.log('[Tafsir] API Response:', data);
        
        if (!data || !Array.isArray(data.data) || data.data.length === 0) {
          throw new Error('Tidak ada data yang ditemukan');
        }

        const quranEdition = data.data.find((ed: any) => ed.edition?.identifier === 'quran-uthmani');
        const tafsirEdition = data.data.find((ed: any) => ed.edition?.identifier === 'ar.tafsir_ibn_kathir');
        
        console.log('[Tafsir] Editions found:', { 
          quran: !!quranEdition, 
          tafsir: !!tafsirEdition, 
          apiUsed,
          totalEditions: data.data.length 
        });
        console.log('[Tafsir] Available editions:', data.data.map((ed: any) => ed.edition?.identifier));
        console.log('[Tafsir] Quran edition structure:', quranEdition);

        // If no tafsir found, try multiple tafsir sources
        let separateTafsirData = undefined;
        if (!tafsirEdition) {
          console.log('[Tafsir] No tafsir found, trying multiple sources...');
          
          // Try 1: Separate alquran.cloud tafsir
          try {
            const tafsirResponse = await fetch(
              `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/ar.tafsir_ibn_kathir`
            );
            if (tafsirResponse.ok) {
              const tafsirJson = await tafsirResponse.json();
              console.log('[Tafsir] Separate tafsir response:', tafsirJson);
              if (tafsirJson.data && tafsirJson.data.text) {
                separateTafsirData = {
                  id: tafsirJson.data.text,
                  en: ''
                };
              }
            }
          } catch (tafsirErr) {
            console.log('[Tafsir] Separate tafsir API failed:', tafsirErr);
          }
          
          // Try 2: quran-api.com for Indonesian tafsir
          if (!separateTafsirData) {
            try {
              const indoTafsirResponse = await fetch(
                `https://quran-api.santrikoding.com/api/surah/${surahNumber}/ayah/${ayahNumber}`
              );
              if (indoTafsirResponse.ok) {
                const indoTafsirJson = await indoTafsirResponse.json();
                console.log('[Tafsir] Indonesian tafsir response:', indoTafsirJson);
                if (indoTafsirJson.tafsir) {
                  separateTafsirData = {
                    id: indoTafsirJson.tafsir,
                    en: ''
                  };
                }
              }
            } catch (indoErr) {
              console.log('[Tafsir] Indonesian tafsir API failed:', indoErr);
            }
          }
        }
        
        if (!quranEdition) {
          throw new Error('Data Quran tidak ditemukan');
        }

        // Handle different API response structures
        let ayahData;
        if (quranEdition.ayah) {
          ayahData = quranEdition.ayah;
        } else if (quranEdition.text && quranEdition.numberInSurah) {
          // Direct ayah data in edition
          ayahData = {
            text: quranEdition.text,
            numberInSurah: quranEdition.numberInSurah,
            number: quranEdition.number,
            audio: quranEdition.audio,
            surah: quranEdition.surah
          };
        } else {
          console.error('Unexpected Quran edition structure:', quranEdition);
          throw new Error('Struktur data Quran tidak sesuai');
        }
        
        // Validate required fields
        if (!ayahData.surah || ayahData.numberInSurah === undefined || !ayahData.text) {
          console.error('Invalid ayah data:', ayahData);
          throw new Error('Data ayat tidak lengkap');
        }

        // Handle tafsir data
        let finalTafsirData = undefined;
        if (tafsirEdition) {
          if (tafsirEdition.ayah && tafsirEdition.ayah.text) {
            finalTafsirData = {
              id: tafsirEdition.ayah.text,
              en: ''
            };
          } else if (tafsirEdition.text) {
            finalTafsirData = {
              id: tafsirEdition.text,
              en: ''
            };
          }
        } else if (separateTafsirData) {
          finalTafsirData = separateTafsirData;
        }

        setTafsirData({
          surah: ayahData.surah,
          numberInSurah: ayahData.numberInSurah,
          text: ayahData.text || '',
          audio: ayahData.audio || '',
          tafsir: finalTafsirData
        });
        
        console.log('[Tafsir] Data loaded successfully:', { 
          hasText: !!ayahData.text, 
          hasTafsir: !!finalTafsirData,
          tafsirLength: finalTafsirData?.id?.length || 0
        });
      } catch (err) {
        console.error('Error fetching tafsir:', err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    fetchTafsir();
  }, [surahNumber, ayahNumber]);

  useEffect(() => {
    // Update last read when viewing tafsir
    updateLastRead(surahNumber, ayahNumber);
  }, [surahNumber, ayahNumber, updateLastRead]);

  const playAudio = () => {
    if (tafsirData?.audio) {
      const audio = new Audio(tafsirData.audio);
      audio.play();
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-[var(--islamic-background)] overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--islamic-accent)]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-[var(--islamic-background)] overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl text-red-400 mb-2">Error</h2>
            <p className="text-[var(--islamic-text-muted)]">{error}</p>
            <button
              onClick={onBack}
              className="mt-4 px-4 py-2 bg-[var(--islamic-accent)] text-white rounded-xl transition-colors"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[var(--islamic-background)] overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[var(--islamic-background)]/95 backdrop-blur-sm border-b border-[var(--islamic-border)] px-6 py-4 -mx-6 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center text-[var(--islamic-primary)] transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">Kembali</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-lg font-semibold text-[var(--islamic-primary)]">
                {tafsirData?.surah?.englishName || 'Surah'} {tafsirData?.numberInSurah}
              </h1>
              <p className="text-xs text-[var(--islamic-text-muted)]">Tafsir</p>
            </div>
            
            <div className="w-20" /> {/* Spacer for balance */}
          </div>
        </div>

        {/* Ayat Card */}
        <div className="bg-[var(--islamic-card-bg)] rounded-2xl border border-[var(--islamic-border)] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--islamic-primary)] flex items-center justify-center">
                <span className="text-white font-bold">{tafsirData?.numberInSurah}</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--islamic-text)]">
                  {tafsirData?.surah?.englishName || 'Surah'}
                </h2>
                <p className="text-sm text-[var(--islamic-text-muted)]">
                  Ayat {tafsirData?.numberInSurah} dari {tafsirData?.surah?.numberOfAyahs || '?'}
                </p>
              </div>
            </div>
            
            <button
              onClick={playAudio}
              className="p-2 rounded-lg bg-[var(--islamic-accent)] text-white transition-colors"
              title="Putar audio"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="font-arabic-display text-right text-[var(--islamic-primary)] mb-4">
            {tafsirData?.text}
          </div>
          
          <div className="text-sm text-[var(--islamic-text-muted)]">
            <p>Surah ke-{tafsirData?.surah?.number || '?'} | {tafsirData?.surah?.revelationType || 'Unknown'}</p>
          </div>
        </div>

        {/* Tafsir Sections */}
        <div className="space-y-6">
          {/* Hukum Bacaan */}
          <div className="bg-[var(--islamic-card-bg)] rounded-2xl border border-[var(--islamic-border)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-[var(--islamic-accent)]" />
              <h3 className="text-lg font-semibold text-[var(--islamic-text)]">Hukum Bacaan</h3>
            </div>
            <div className="space-y-3 text-[var(--islamic-text)]">
              <div className="p-3 bg-[var(--islamic-cream)] rounded-lg border border-[var(--islamic-border)]">
                <p className="font-medium mb-1">Tajwid Ayat {tafsirData?.numberInSurah}</p>
                <p className="text-sm text-[var(--islamic-text-muted)]">
                  Perhatikan hukum bacaan tajwid pada ayat ini, termasuk:
                  - Ghunnah (dengung) pada huruf nun dan mim yang bertasydid
                  - Mad (panjang) pada huruf-huruf mad dalam ayat ini
                  - Qalqalah pada huruf-huruf qalqalah yang ada
                  - Idgham dan Ikhfa sesuai konteks ayat
                </p>
              </div>
              <div className="p-3 bg-[var(--islamic-cream)] rounded-lg border border-[var(--islamic-border)]">
                <p className="font-medium mb-1">Makhraj Huruf</p>
                <p className="text-sm text-[var(--islamic-text-muted)]">
                  Pastikan setiap huruf dalam ayat ini keluar dari makhraj yang benar 
                  untuk mendapatkan bacaan yang fasih dan sesuai dengan kaidah ilmu tajwid.
                </p>
              </div>
              <div className="p-3 bg-[var(--islamic-cream)] rounded-lg border border-[var(--islamic-border)]">
                <p className="font-medium mb-1">Waqaf dan Ibtida'</p>
                <p className="text-sm text-[var(--islamic-text-muted)]">
                  Ayat {tafsirData?.numberInSurah} memiliki tempat waqaf yang disarankan 
                  untuk memberikan jeda yang baik dalam membaca dan memahami makna.
                </p>
              </div>
            </div>
          </div>

          {/* Cara Baca */}
          <div className="bg-[var(--islamic-card-bg)] rounded-2xl border border-[var(--islamic-border)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Volume2 className="w-5 h-5 text-[var(--islamic-accent)]" />
              <h3 className="text-lg font-semibold text-[var(--islamic-text)]">Cara Baca</h3>
            </div>
            <div className="space-y-3 text-[var(--islamic-text)]">
              <div className="p-3 bg-[var(--islamic-cream)] rounded-lg border border-[var(--islamic-border)]">
                <p className="font-medium mb-1">Tempat Waqaf</p>
                <p className="text-sm text-[var(--islamic-text-muted)]">
                  Ayat {tafsirData?.numberInSurah} memiliki tempat waqaf yang disarankan 
                  untuk memberikan jeda yang baik dalam membaca dan merenungkan makna.
                </p>
              </div>
              <div className="p-3 bg-[var(--islamic-cream)] rounded-lg border border-[var(--islamic-border)]">
                <p className="font-medium mb-1">I'rab dan Harakat</p>
                <p className="text-sm text-[var(--islamic-text-muted)]">
                  Perhatikan harakat dan i'rab setiap kata dalam ayat ini untuk 
                  memahami makna gramatikal dan struktur kalimat yang tepat.
                </p>
              </div>
              <div className="p-3 bg-[var(--islamic-cream)] rounded-lg border border-[var(--islamic-border)]">
                <p className="font-medium mb-1">Tarannum (Melodi)</p>
                <p className="text-sm text-[var(--islamic-text-muted)]">
                  Ayat ini cocok dibaca dengan tarannum yang sesuai dengan 
                  konteks maknanya untuk meningkatkan kekhusyukan dalam membaca.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TafsirPage;
