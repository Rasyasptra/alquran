import { useState } from 'react';
import { MapPin, Mail } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { mosqueApi } from '../services/api';
import type { Surah } from '../types';
import SurahList from '../components/Quran/SurahList';
import SurahDetail from '../components/Quran/SurahDetail';
import TafsirPage from './TafsirPage';

const QuranPage = () => {
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tafsirView, setTafsirView] = useState<{ surahNumber: number; ayahNumber: number } | null>(null);
  // Use React Query for mosque info with polling (5 seconds)
  const { data: mosqueInfo } = useQuery({
    queryKey: ['mosque-info'],
    queryFn: () => mosqueApi.getInfo(),
    refetchInterval: 5000, // Automagically update every 5 seconds
  });

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
      <div className="reader-column overflow-y-auto">
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
            mosqueName={mosqueInfo?.name}
          />
        ) : (
          <div className="min-h-full flex flex-col bg-[var(--islamic-background)] relative overflow-x-hidden">
            {/* Background Pattern - subtle noise/dots */}
            <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.02] mix-blend-multiply pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%230D5466' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")` }}></div>

            {/* Giant Hero Banner */}
            <div className="relative pt-24 pb-20 px-8 w-full flex flex-col items-center justify-center bg-gradient-to-br from-[var(--islamic-primary)] via-[var(--islamic-primary-dark)] to-[#062c36] rounded-b-[3rem] shadow-2xl shrink-0 overflow-hidden border-b-4 border-[var(--islamic-accent)]">
              {/* Decorative lighting */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full mix-blend-overlay"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--islamic-accent)]/30 blur-[80px] rounded-full mix-blend-overlay"></div>
              
              <div className="relative z-10 text-center flex flex-col items-center max-w-4xl mx-auto">
                <div className="text-5xl md:text-7xl lg:text-8xl mb-8 font-arabic-display text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-300 drop-shadow-lg leading-relaxed py-2">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </div>
                <div className="h-1 w-24 bg-[var(--islamic-accent)] rounded-full mb-8"></div>
                <p className="text-gray-200 text-lg md:text-2xl font-light tracking-wider">
                  Temukan ketenangan dengan Al-Qur'an. <br className="hidden md:block"/>
                  Pilih surah untuk memulai.
                </p>
              </div>
            </div>

            {/* Content (Mosque Info) expands the rest */}
            <div className="flex-1 w-full max-w-[1400px] mx-auto p-6 md:p-10 flex flex-col justify-center">
              {mosqueInfo && (
                <div className="w-full opacity-0 animate-[fadeIn_0.8s_ease-out_0.2s_forwards]">
                  <style>
                    {`
                      @keyframes fadeIn {
                        0% { opacity: 0; transform: translateY(30px); }
                        100% { opacity: 1; transform: translateY(0); }
                      }
                    `}
                  </style>

                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full min-h-[400px]">
                    {/* Left Column: Mosque Identity Profile */}
                    <div className="xl:col-span-4 bg-white dark:bg-[#151b23] rounded-[2.5rem] p-8 lg:p-12 shadow-xl shadow-[var(--islamic-primary)]/5 border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                      {/* Subtle gradient accent instead of a hard banner */}
                      <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-[var(--islamic-primary-light)]/40 to-transparent dark:from-white/5 pointer-events-none"></div>
                      
                      <div className="flex flex-col flex-1 justify-center items-center z-10 w-full relative py-8">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white mb-6 tracking-tight leading-tight">
                          {mosqueInfo.name}
                        </h2>
                        {mosqueInfo.description && (
                          <div className="mt-2 text-[var(--islamic-text-muted)] text-lg md:text-[19px] italic font-medium leading-relaxed bg-[var(--islamic-primary)]/5 dark:bg-gray-800/30 p-8 rounded-[2rem] border border-[var(--islamic-primary)]/10 shadow-inner">
                            "{mosqueInfo.description}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Contact & Social Tiles */}
                    <div className="xl:col-span-8 flex flex-col gap-6">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                        
                        {/* Tile 1: Alamat */}
                        <div className="md:col-span-2 bg-white dark:bg-[#151b23] p-8 rounded-[2rem] shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 flex flex-row items-center gap-6 hover:-translate-y-2 transition-all duration-300 group/tile">
                           <div className="w-20 h-20 rounded-2xl bg-[var(--islamic-primary)]/10 flex items-center justify-center shrink-0 group-hover/tile:bg-[var(--islamic-primary)] transition-colors duration-300">
                              <MapPin className="w-10 h-10 text-[var(--islamic-primary)] group-hover/tile:text-white" />
                           </div>
                           <div className="flex flex-col flex-1">
                             <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Lokasi</h3>
                             <p className="text-gray-700 dark:text-gray-200 font-semibold text-xl leading-relaxed">
                               {mosqueInfo.address || '-'}
                             </p>
                           </div>
                        </div>

                        {/* Tile 2: Email */}
                        <div className="md:col-span-2 bg-white dark:bg-[#151b23] p-8 rounded-[2rem] shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 flex flex-row items-center gap-6 hover:-translate-y-2 transition-all duration-300 group/tile">
                           <div className="w-20 h-20 rounded-2xl bg-[var(--islamic-primary)]/10 flex items-center justify-center shrink-0 group-hover/tile:bg-[var(--islamic-primary)] transition-colors duration-300">
                              <Mail className="w-10 h-10 text-[var(--islamic-primary)] group-hover/tile:text-white" />
                           </div>
                           <div className="flex flex-col flex-1">
                             <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Email Masjid</h3>
                             <p className="text-gray-700 dark:text-gray-200 font-semibold text-xl break-all">
                               {mosqueInfo.email || '-'}
                             </p>
                           </div>
                        </div>

                      </div>


                      
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default QuranPage;
