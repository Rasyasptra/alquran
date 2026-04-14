import { useState } from 'react';
import type { Surah } from '../types';
import SurahList from '../components/Quran/SurahList';
import SurahDetail from '../components/Quran/SurahDetail';
import TafsirPage from './TafsirPage';

const QuranPage = () => {
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tafsirView, setTafsirView] = useState<{ surahNumber: number; ayahNumber: number } | null>(null);

  const handleSurahSelect = (surah: Surah) => {
    setSelectedSurah(surah);
    setTafsirView(null);
  };

  const handleTafsirView = (surahNumber: number, ayahNumber: number) => {
    setTafsirView({ surahNumber, ayahNumber });
  };

  const handleBackFromTafsir = () => {
    setTafsirView(null);
  };

  return (
    <>
      {/* Column 2: Surah List */}
      <div className="surah-list-column">
        <SurahList 
          onSurahSelect={handleSurahSelect} 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedSurah={selectedSurah}
        />
      </div>

      {/* Column 3: Reader Panel */}
      <div className="reader-column">
        {tafsirView ? (
          <TafsirPage
            surahNumber={tafsirView.surahNumber}
            ayahNumber={tafsirView.ayahNumber}
            onBack={handleBackFromTafsir}
          />
        ) : selectedSurah ? (
          <SurahDetail 
            surah={selectedSurah} 
            onBack={() => setSelectedSurah(null)} 
            onTafsirView={handleTafsirView}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-[var(--islamic-background)]">
            <div className="text-center">
              <div className="text-6xl mb-4 font-arabic-display text-[var(--islamic-primary)]">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
              <p className="text-[var(--islamic-text-muted)] text-lg">
                Pilih surah untuk memulai membaca
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default QuranPage;
