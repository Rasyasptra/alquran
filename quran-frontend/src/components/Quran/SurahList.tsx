import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { quranApi } from '../../services/api';
import type { Surah } from '../../types';

interface SurahListProps {
  onSurahSelect: (surah: Surah) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedSurah?: Surah | null;
}

const SurahList = ({ 
  onSurahSelect, 
  searchQuery = '', 
  onSearchChange,
  selectedSurah 
}: SurahListProps) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let data: Surah[];
        if (searchQuery) {
          data = await quranApi.searchSurahs(searchQuery);
        } else {
          data = await quranApi.getAllSurahs();
        }
        
        setSurahs(data);
      } catch (err) {
        setError('Failed to load surahs');
        console.error('Error fetching surahs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSurahs();
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-[var(--islamic-background)]">
        <div className="p-4 border-b border-[var(--islamic-border)]">
          <div className="search-pill flex items-center px-4 py-3">
            <Search className="w-5 h-5 text-[var(--islamic-primary)] mr-3" />
            <span className="text-[var(--islamic-text-muted)]">Loading...</span>
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--islamic-accent)]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col p-4 bg-[var(--islamic-background)]">
        <div className="text-center py-8">
          <div className="text-red-400 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-[var(--islamic-accent)] text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[var(--islamic-background)]">
      {/* Search Bar */}
      <div className="p-4 border-b border-[var(--islamic-border)]">
        <div className="search-pill flex items-center px-4 py-3">
          <Search className="w-5 h-5 text-[var(--islamic-primary)] mr-3" />
          <input
            type="text"
            placeholder="Cari surah, ayat..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-[var(--islamic-text)]"
          />
        </div>
      </div>

      {/* Surah List */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {surahs.map((surah, index) => {
            const isActive = selectedSurah?.id === surah.id;
            
            return (
              <div
                key={`surah-${surah.id || index}`}
                onClick={() => onSurahSelect(surah)}
                className={`surah-item flex items-center p-3 cursor-pointer ${
                  isActive ? 'active' : ''
                }`}
              >
                {/* Number Badge */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                  isActive 
                    ? 'bg-[var(--islamic-accent)] text-white' 
                    : 'bg-[var(--islamic-primary)] text-white'
                }`}>
                  {surah.number}
                </div>
                
                {/* Surah Info */}
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm uppercase tracking-wide ${
                    isActive ? 'text-white' : 'text-[var(--islamic-text)]'
                  }`}>
                    {surah.name_id}
                  </div>
                  <div className={`text-xs mt-0.5 ${
                    isActive ? 'text-white/80' : 'text-[var(--islamic-text-muted)]'
                  }`}>
                    {surah.translation_id}
                  </div>
                </div>
                
                {/* Arabic Name */}
                <div className={`font-arabic text-lg mr-2 ${
                  isActive ? 'text-white' : 'text-[var(--islamic-primary)]'
                }`}>
                  {surah.name_ar}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SurahList;
