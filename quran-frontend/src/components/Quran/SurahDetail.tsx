import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Share2, Play, Copy, ChevronLeft, 
  Pause, SkipBack, SkipForward, ScrollText, Bookmark, FileText
} from 'lucide-react';
import type { Surah } from '../../types';
import { useBookmarks } from '../../contexts/BookmarkContext';
import SettingsPanel from '../Layout/SettingsPanel';

type Verse = {
  numberInSurah: number;
  arabic: string;
  translation: string;
  audio?: string;
  audioDuration?: number;
};

interface SurahDetailProps {
  surah: Surah;
  onBack: () => void;
  onTafsirView?: (surahNumber: number, ayahNumber: number) => void;
}

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5] as const;
type PlaybackSpeed = typeof PLAYBACK_SPEEDS[number];

const SurahDetail = ({ surah, onBack, onTafsirView }: SurahDetailProps) => {
  // Audio states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentPlayingAyah, setCurrentPlayingAyah] = useState<number | null>(null);
  const [currentAyahAudio, setCurrentAyahAudio] = useState<HTMLAudioElement | null>(null);
  
  // Verses states
  const [verses, setVerses] = useState<Verse[]>([]);
  const [versesLoading, setVersesLoading] = useState(true);
  const [versesError, setVersesError] = useState<string | null>(null);
  
  // Bookmarks
  const { addBookmark, removeBookmark, isBookmarked, updateLastRead, saveSurah, removeSavedSurah, isSurahSaved } = useBookmarks();
  
  // Audio URL dengan fallback
  const audioUrl = surah.audio?.audio_url || `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surah.number}.mp3`;
  
  // Auto-scroll states
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [userScrolling, setUserScrolling] = useState(false);
  const userScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const verseRefs = useRef<(HTMLDivElement | null)[]>([]);
  const readerContainerRef = useRef<HTMLDivElement>(null);
  const versesLengthRef = useRef(0);

  // Fetch verses
  useEffect(() => {
    const fetchVerses = async () => {
      try {
        setVersesLoading(true);
        setVersesError(null);
        setCurrentAyahIndex(0);

        console.log(`[Fetch] Loading Surah ${surah.number} from API...`);
        const res = await fetch(
          `https://api.alquran.cloud/v1/surah/${surah.number}/editions/quran-uthmani,id.indonesian`
        );
        const json = await res.json();
        console.log(`[Fetch] Surah ${surah.number} API response:`, json);

        if (!res.ok || !json?.data || !Array.isArray(json.data)) {
          console.error('API Error:', { status: res.status, data: json });
          throw new Error('Invalid verses response');
        }

        if (json.data.length < 2) {
          console.error('Not enough editions in response:', json.data.length);
          throw new Error('Incomplete verses data');
        }

        const arabicAyahs = json.data[0]?.ayahs ?? [];
        const idAyahs = json.data[1]?.ayahs ?? [];

        if (!Array.isArray(arabicAyahs) || !Array.isArray(idAyahs)) {
          console.error('Invalid ayahs format:', { arabicAyahs, idAyahs });
          throw new Error('Invalid ayahs format');
        }

        const bismillah = 'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
        const decodeEscapedUnicode = (s: string) =>
          (s ?? '').replace(/\\u([0-9a-fA-F]{4})/g, (_m, hex) =>
            String.fromCharCode(parseInt(hex, 16))
          );
        const normalizeArabic = (s: string) =>
          (s ?? '')
            .replace(/[\u064B-\u065F\u0670\u0640\u200D]/g, '')
            .replace(/[ٱأإآ]/g, 'ا')
            .trim();

        const arabicFirstText = decodeEscapedUnicode(arabicAyahs?.[0]?.text ?? '');
        const arabicFirstNorm = normalizeArabic(arabicFirstText);
        const bismillahNorm = normalizeArabic(bismillah);
        
        const arabicHasStandaloneBismillah =
          surah.number !== 1 &&
          arabicAyahs?.[0]?.numberInSurah === 1 &&
          arabicFirstNorm === bismillahNorm;

        const idFirstText = decodeEscapedUnicode(idAyahs?.[0]?.text ?? '');
        const idLooksLikeBismillah = /Dengan nama Allah/i.test(idFirstText);

        let merged: Verse[];
        
        try {
          if (arabicHasStandaloneBismillah && !idLooksLikeBismillah) {
            const arabicEffective = arabicAyahs.slice(1);
            merged = arabicEffective.map((a: any, idx: number) => ({
              numberInSurah: idx + 1,
              arabic: decodeEscapedUnicode(a.text ?? ''),
              translation: decodeEscapedUnicode(idAyahs[idx]?.text ?? ''),
            }));
          } else {
            const idByNumber = new Map<number, string>();
            for (const t of idAyahs) {
              if (typeof t?.numberInSurah === 'number') {
                idByNumber.set(t.numberInSurah, decodeEscapedUnicode(t.text ?? ''));
              }
            }

            merged = arabicAyahs.map((a: any) => ({
              numberInSurah: a.numberInSurah,
              arabic: decodeEscapedUnicode(a.text ?? ''),
              translation: idByNumber.get(a.numberInSurah) ?? '',
            }));
          }
        } catch (mergeError) {
          console.error('Error merging verses:', mergeError);
          throw new Error('Failed to merge verse data');
        }

        if (surah.number !== 1 && merged.length > 0) {
          merged = merged.map((v) => {
            if (v.numberInSurah === 1) {
              const norm = normalizeArabic(v.arabic ?? '');
              if (norm.startsWith(bismillahNorm) && norm !== bismillahNorm) {
                const strippedArabic = (v.arabic ?? '').replace(bismillah, '').trim();
                const strippedTranslation = (v.translation ?? '')
                  .replace(/Dengan nama Allah.*?Yang Maha Pengasih.*?Maha Penyayang\.?\s*/i, '')
                  .trim();
                return {
                  ...v,
                  arabic: strippedArabic,
                  translation: strippedTranslation,
                };
              }
            }
            return v;
          }).filter(v => v.arabic.trim() !== '');
        }

        setVerses(merged);
        versesLengthRef.current = merged.length;
      } catch (e) {
        console.error(e);
        setVersesError('Gagal memuat ayat. Coba reload.');
      } finally {
        setVersesLoading(false);
      }
    };

    fetchVerses();
  }, [surah.number]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set audio source
    if (audio.src !== audioUrl) {
      audio.src = audioUrl;
    }

    setAudioError(null);
    setIsPlaying(false);
    setCurrentTime(0);

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setAudioError('Audio tidak bisa diputar.');
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [surah.number, audioUrl]);

  // Toggle play/pause
  const togglePlayPause = useCallback(async () => {
    if (!audioRef.current) return;

    // Ensure audio source is set
    if (audioRef.current.src !== audioUrl) {
      audioRef.current.src = audioUrl;
    }

    setAudioError(null);

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        console.error(e);
        setAudioError('Browser menolak memutar audio (format/CORS).');
        setIsPlaying(false);
      }
    }
  }, [isPlaying, audioUrl]);

  
  // Helper functions
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyVerse = (arabic: string, translation: string) => {
    navigator.clipboard.writeText(`${arabic}\n\n${translation}`);
  };

  const shareVerse = async (verse: Verse) => {
    const text = `${surah.name_id} (${surah.number}:${verse.numberInSurah})\n\n${verse.arabic}\n\n${verse.translation}`;

    try {
      if (typeof window !== 'undefined' && 'share' in window.navigator) {
        await (window.navigator as any).share({
          title: `${surah.name_id} ${surah.number}:${verse.numberInSurah}`,
          text,
        });
        return;
      }

      if (typeof window !== 'undefined' && window.navigator?.clipboard?.writeText) {
        await window.navigator.clipboard.writeText(text);
      }
      setShareNotice('Teks ayat berhasil disalin.');
      window.setTimeout(() => setShareNotice(null), 1800);
    } catch (e) {
      console.error(e);
      setShareNotice('Gagal membagikan ayat.');
      window.setTimeout(() => setShareNotice(null), 1800);
    }
  };

  const normalizeArabic = (s: string) =>
    (s ?? '')
      .replace(/[\u064B-\u065F\u0670\u0640\u200D]/g, '')
      .replace(/[ٱأإآ]/g, 'ا')
      .trim();

  const bismillahNorm = normalizeArabic('بسم الله الرحمن الرحيم');
  
  const stripBismillahPrefix = (arabic: string) => {
    const re = new RegExp(
      '^[\\s\\u200F\\u200E]*'
        + 'ب[\\s\\S]*?س[\\s\\S]*?م'
        + '[\\s\\S]*?(?:ٱ|ا)ل[\\s\\S]*?ل[\\s\\S]*?ه'
        + '[\\s\\S]*?(?:ٱ|ا)ل[\\s\\S]*?ر[\\s\\S]*?ح[\\s\\S]*?م[\\s\\S]*?ن'
        + '[\\s\\S]*?(?:ٱ|ا)ل[\\s\\S]*?ر[\\s\\S]*?ح[\\s\\S]*?ي[\\s\\S]*?م'
        + '[\\s\\u200F\\u200E]*',
      'u'
    );
    return (arabic ?? '').replace(re, '').trim();
  };

  // Process verses
  const processedVerses = verses
    .map((v) => {
      let arabic = v.arabic ?? '';
      let translation = v.translation ?? '';

      if (surah.number !== 1 && v.numberInSurah === 1) {
        const norm = normalizeArabic(arabic);

        if (norm === bismillahNorm) {
          return null;
        }

        if (norm.startsWith(bismillahNorm) && norm.length > bismillahNorm.length) {
          arabic = stripBismillahPrefix(arabic);
          translation = translation
            .replace(/Dengan nama Allah.*?Yang Maha Pengasih.*?Maha Penyayang\.?\s*/i, '')
            .trim();
        }
      }

      return { ...v, arabic, translation };
    })
    .filter((x): x is { numberInSurah: number; arabic: string; translation: string } => x !== null);

  // Update verses length ref
  versesLengthRef.current = processedVerses.length;

  // Auto-scroll functions
  const scrollToAyah = useCallback((index: number) => {
    console.log(`[Scroll] Attempting to scroll to ayat ${index + 1}. autoScrollEnabled: ${autoScrollEnabled}, userScrolling: ${userScrolling}`);
    
    if (!autoScrollEnabled || userScrolling) {
      console.log(`[Scroll] Blocked: autoScroll=${autoScrollEnabled}, userScrolling=${userScrolling}`);
      return;
    }
    
    const verseEl = verseRefs.current[index];
    console.log(`[Scroll] verseRefs[${index}]:`, verseEl ? 'found' : 'null');
    
    if (verseEl) {
      console.log(`[Scroll] Scrolling to ayat ${index + 1}`);
      verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      console.log(`[Scroll] ERROR: verse element not found for index ${index}`);
    }
  }, [autoScrollEnabled, userScrolling]);

  const goToNextAyah = useCallback(() => {
    setCurrentAyahIndex(prev => {
      const next = Math.min(prev + 1, versesLengthRef.current - 1);
      scrollToAyah(next);
      updateLastRead(surah.number, next + 1);
      return next;
    });
  }, [scrollToAyah, updateLastRead, surah.number]);

  const goToPrevAyah = useCallback(() => {
    setCurrentAyahIndex(prev => {
      const next = Math.max(prev - 1, 0);
      scrollToAyah(next);
      updateLastRead(surah.number, next + 1);
      return next;
    });
  }, [scrollToAyah, updateLastRead, surah.number]);

  // Play/pause specific ayah audio with individual ayah audio files
  const playFromAyah = useCallback(async (ayahIndex: number) => {
    if (!verses[ayahIndex]) return;

    const ayahNumber = verses[ayahIndex].numberInSurah;
    
    // Check if clicking on the same ayah that's currently playing
    if (currentPlayingAyah === ayahNumber && isPlaying && currentAyahAudio) {
      console.log(`[Ayah Audio] Pausing ayah ${ayahNumber}`);
      currentAyahAudio.pause();
      setIsPlaying(false);
      return;
    }
    
    // Check if clicking on the same ayah that's paused
    if (currentPlayingAyah === ayahNumber && !isPlaying && currentAyahAudio) {
      console.log(`[Ayah Audio] Resuming ayah ${ayahNumber}`);
      try {
        await currentAyahAudio.play();
        setIsPlaying(true);
        return;
      } catch (error) {
        console.error(`[Ayah Audio] Failed to resume ayah ${ayahNumber}:`, error);
      }
    }
    
    console.log(`[Ayah Audio] Playing ayah ${ayahNumber} (index ${ayahIndex}) from surah ${surah.number}`);

    try {
      // Stop any currently playing audio
      if (currentAyahAudio) {
        currentAyahAudio.pause();
        currentAyahAudio.currentTime = 0;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Generate ayah-specific audio URL using reliable sources
      const surahNum = surah.number.toString().padStart(3, '0');
      const ayahNum = ayahNumber.toString().padStart(3, '0');
      
      // Try multiple reliable sources for individual ayah audio
      const ayahAudioSources = [
        `https://everyayah.com/data/Alafasy_128kbps/${surahNum}${ayahNum}.mp3`,
        `https://download.quranicaudio.com/quran/mishaari_raad_alafasy/128kbps/${surahNum}${ayahNum}.mp3`,
        `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${surahNum}${ayahNum}.mp3`
      ];

      let audioPlayed = false;
      
      for (const audioUrl of ayahAudioSources) {
        try {
          console.log(`[Ayah Audio] Trying source: ${audioUrl}`);
          
          // Create new audio element for ayah-specific playback
          const ayahAudio = new Audio(audioUrl);
          
          // Wait for audio to load
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Audio load timeout')), 3000);
            
            ayahAudio.addEventListener('loadeddata', () => {
              clearTimeout(timeout);
              resolve();
            }, { once: true });
            
            ayahAudio.addEventListener('error', () => {
              clearTimeout(timeout);
              reject(new Error('Audio load error'));
            }, { once: true });
          });

          // Play the ayah audio
          await ayahAudio.play();
          
          // Set current ayah index and scroll to it
          setCurrentAyahIndex(ayahIndex);
          scrollToAyah(ayahIndex);
          updateLastRead(surah.number, ayahNumber);
          
          // Update states
          setIsPlaying(true);
          setCurrentPlayingAyah(ayahNumber);
          setCurrentAyahAudio(ayahAudio);
          setAudioError(null);
          
          // Handle audio end
          ayahAudio.addEventListener('ended', () => {
            console.log(`[Ayah Audio] Ayah ${ayahNumber} finished playing`);
            setIsPlaying(false);
            setCurrentPlayingAyah(null);
            setCurrentAyahAudio(null);
          });
          
          console.log(`[Ayah Audio] Successfully started playing ayah ${ayahNumber} from ${audioUrl}`);
          audioPlayed = true;
          break;
          
        } catch (error) {
          console.log(`[Ayah Audio] Source failed: ${audioUrl}`, error);
          continue; // Try next source
        }
      }

      if (!audioPlayed) {
        throw new Error(`All audio sources failed for ayah ${ayahNumber}`);
      }
      
    } catch (error) {
      console.error(`[Ayah Audio] Failed to play ayah ${ayahNumber}:`, error);
      setAudioError(`Tidak dapat memutar audio ayat ${ayahNumber}`);
      setIsPlaying(false);
      setCurrentPlayingAyah(null);
      setCurrentAyahAudio(null);
    }
  }, [verses, surah.number, scrollToAyah, currentPlayingAyah, isPlaying, currentAyahAudio]);
  
  const handleSpeedChange = useCallback(() => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
    const newSpeed = PLAYBACK_SPEEDS[nextIndex];
    setPlaybackSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  }, [playbackSpeed]);

  // Handle manual scroll detection
  const handleScroll = useCallback(() => {
    console.log(`[Scroll] Manual scroll detected, pausing auto-scroll for 3s`);
    setUserScrolling(true);
    if (userScrollTimeoutRef.current) {
      clearTimeout(userScrollTimeoutRef.current);
    }
    userScrollTimeoutRef.current = setTimeout(() => {
      console.log(`[Scroll] Auto-scroll re-enabled after 3s pause`);
      setUserScrolling(false);
    }, 3000);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        goToNextAyah();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        goToPrevAyah();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, goToNextAyah, goToPrevAyah]);

  // Calculate cumulative time for each verse with improved timing estimation
  const verseStartTimes = useRef<number[]>([]);
  const verseDurations = useRef<number[]>([]);
  
  useEffect(() => {
    if (duration === 0 || processedVerses.length === 0) return;
    
    // Calculate verse durations based on text length for better accuracy
    // Adjust charSpeed based on surah category (qori tends to recite faster in shorter surahs)
    
    // Special charSpeed adjustment for Al-Waqi'ah
    const getCharSpeed = () => {
      // Al-Waqi'ah (56) - use even higher char speed to reduce cumulative delay
      if (surah.number === 56) return 0.16;
      // Long surahs (>200 verses) - slower, more measured recitation
      if (processedVerses.length > 200) return 0.13;
      // Medium surahs (50-200 verses) - moderate speed
      if (processedVerses.length > 50) return 0.11;
      // Short surahs (<50 verses) - faster recitation
      return 0.09;
    };
    
    const charSpeed = getCharSpeed();
    const minVerseTime = surah.number === 56 ? 1.5 : 2.5; // very short min time for Al-Waqi'ah
    const maxVerseTime = 40; // maximum seconds for very long verses
    const pauseBetweenVerses = surah.number === 56 ? 0.0 : 1.2; // NO pause for Al-Waqi'ah
    
    // For Al-Waqi'ah, use simple linear distribution with aggressive offset
    const startTimes: number[] = [];
    const finalDurations: number[] = [];
    let bismillahOffset = 0;
    let scaleFactor = 1;
    
    if (surah.number === 56) {
      const avgDuration = (duration - 3.5) / processedVerses.length;
      for (let i = 0; i < processedVerses.length; i++) {
        startTimes.push(3.5 + (i * avgDuration * 0.75)); // 0.75 factor - scroll closer to audio time
        finalDurations.push(avgDuration);
      }
    } else {
      // Other surahs use character-based estimation
      const rawDurations = processedVerses.map(v => {
        const charCount = v.arabic.length;
        const estimatedTime = charCount * charSpeed;
        return Math.max(minVerseTime, Math.min(maxVerseTime, estimatedTime));
      });
      
      // Calculate total estimated time
      const totalEstimatedTime = rawDurations.reduce((a, b) => a + b, 0) + 
                                 (processedVerses.length * pauseBetweenVerses);
      
      // Adjust Bismillah offset based on surah type
      bismillahOffset = 0;
      if (surah.number !== 1) {
        if (processedVerses.length > 50 && processedVerses.length < 150) {
          bismillahOffset = 6; // ~6 seconds for medium surahs
        } else if (processedVerses.length >= 150) {
          bismillahOffset = 7; // ~7 seconds for long surahs
        } else {
          bismillahOffset = 5; // ~5 seconds for short surahs
        }
      }
      
      // Scale durations to match actual audio duration
      scaleFactor = (duration - bismillahOffset) / totalEstimatedTime;
      
      // Build cumulative start times
      let cumulativeTime = bismillahOffset;
      
      for (let i = 0; i < processedVerses.length; i++) {
        startTimes.push(cumulativeTime);
        const scaledDuration = Math.max(minVerseTime, rawDurations[i] * scaleFactor);
        finalDurations.push(scaledDuration);
        cumulativeTime += scaledDuration + pauseBetweenVerses;
      }
    }
    
    verseStartTimes.current = startTimes;
    verseDurations.current = finalDurations;
    
    // Debug logging
    console.log(`[Surah ${surah.number}] Duration: ${duration.toFixed(1)}s, Verses: ${processedVerses.length}`);
    console.log(`[Surah ${surah.number}] CharSpeed: ${charSpeed}, Bismillah: ${bismillahOffset}s`);
    console.log(`[Surah ${surah.number}] Scale factor: ${scaleFactor.toFixed(2)}`);
    console.log(`[Surah ${surah.number}] First 5 start times:`, startTimes.slice(0, 5).map(t => t.toFixed(1)));
  }, [duration, processedVerses, surah.number]);

  // Track current ayah based on scroll position
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !userScrolling) {
            const index = parseInt(entry.target.getAttribute('data-ayah-index') || '0');
            if (!isNaN(index) && index !== currentAyahIndex) {
              console.log(`[Scroll] Ayah in view: ${index + 1}, updating current ayah`);
              setCurrentAyahIndex(index);
              updateLastRead(surah.number, index + 1);
            }
          }
        });
      },
      {
        threshold: 0.5, // When 50% of the verse is visible
        rootMargin: '-20% 0px -60% 0px' // Center area of the screen
      }
    );

    // Observe all verse elements
    verseRefs.current.forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => observer.disconnect();
  }, [currentAyahIndex, userScrolling, updateLastRead, surah.number]);

  // Calculate current ayah based on audio time with improved timing
  useEffect(() => {
    if (!isPlaying || !duration || verseStartTimes.current.length === 0) return;
    
    // Find current verse based on start times
    let newAyahIndex = 0;
    for (let i = 0; i < verseStartTimes.current.length; i++) {
      if (currentTime >= verseStartTimes.current[i]) {
        newAyahIndex = i;
      } else {
        break;
      }
    }
    
    // Only update if we're at least 0.5 seconds into the new verse (avoid flickering)
    const timeIntoVerse = currentTime - verseStartTimes.current[newAyahIndex];
    if (newAyahIndex !== currentAyahIndex && timeIntoVerse > 0.5) {
      console.log(`[Time ${currentTime.toFixed(1)}s] Ayat changed: ${currentAyahIndex + 1} -> ${newAyahIndex + 1} (into verse: ${timeIntoVerse.toFixed(1)}s)`);
      setCurrentAyahIndex(newAyahIndex);
      scrollToAyah(newAyahIndex);
      updateLastRead(surah.number, newAyahIndex + 1);
    }
  }, [currentTime, duration, isPlaying, currentAyahIndex, scrollToAyah, updateLastRead, surah.number]);

  return (
    <>
    <div 
      ref={readerContainerRef}
      className="min-h-full bg-[var(--islamic-background)] pb-24"
      onScroll={handleScroll}
    >
      {shareNotice && (
        <div className="fixed top-4 right-4 z-50 bg-[var(--islamic-card-bg)] border border-[var(--islamic-border)] text-[var(--islamic-text)] text-sm px-4 py-2 rounded-xl shadow-lg">
          {shareNotice}
        </div>
      )}
      {/* Header with Back Button and Bismillah */}
      <div className="sticky top-0 z-10 bg-[var(--islamic-background)]/95 backdrop-blur-sm border-b border-[var(--islamic-border)] px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center text-[var(--islamic-primary)] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">Kembali</span>
          </button>
          
          <div className="flex items-center gap-4">
            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg border border-[var(--islamic-border)] transition-colors"
              title="Pengaturan"
            >
              <svg className="w-5 h-5 text-[var(--islamic-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            
            {/* Bismillah Header */}
            <div className="font-arabic-display text-2xl text-[var(--islamic-primary)]">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
          </div>
        </div>
      </div>

      {/* Surah Info Card */}
      <div className="px-6 py-6">
          <div className="bg-[var(--islamic-card-bg)] rounded-2xl border border-[var(--islamic-border)] p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-[var(--islamic-primary)] flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{surah.number}</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-[var(--islamic-primary)] uppercase tracking-wide">
                      {surah.name_id}
                    </h1>
                    <p className="text-sm text-[var(--islamic-text-muted)]">{surah.translation_id}</p>
                  </div>
                </div>
                <p className="text-xs text-[var(--islamic-text-muted)] mt-2">
                  {surah.number_of_verses} Ayat • {surah.revelation}
                </p>
              </div>
              
              <div className="font-arabic text-3xl text-[var(--islamic-primary)]">
                {surah.name_ar}
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => {
                  if (isSurahSaved(surah.number)) {
                    removeSavedSurah(surah.number);
                  } else {
                    saveSurah({
                      surahNumber: surah.number,
                      surahName: surah.name_id,
                      surahNameArabic: surah.name_ar,
                    });
                  }
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
                  isSurahSaved(surah.number)
                    ? 'bg-[var(--islamic-accent)] text-white border-[var(--islamic-accent)]'
                    : 'bg-transparent text-[var(--islamic-text)] border-[var(--islamic-border)]'
                }`}
                title={isSurahSaved(surah.number) ? 'Hapus simpan surah' : 'Simpan surah'}
              >
                <Bookmark className="w-4 h-4" fill={isSurahSaved(surah.number) ? 'currentColor' : 'none'} />
                <span className="text-sm font-medium">
                  {isSurahSaved(surah.number) ? 'Surah Tersimpan' : 'Simpan Surah'}
                </span>
              </button>
            </div>

          {/* Audio Player */}
          {surah.audio.has_audio && (
            <div className="mt-6 pt-6 border-t border-[var(--islamic-border)]">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlayPause}
                  className="w-12 h-12 rounded-full bg-[var(--islamic-accent)] flex items-center justify-center text-white transition-colors"
                >
                  {isPlaying ? (
                    <div className="flex gap-0.5">
                      <div className="w-1 h-4 bg-white rounded-full" />
                      <div className="w-1 h-4 bg-white rounded-full" />
                    </div>
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" fill="white" />
                  )}
                </button>
                
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-[var(--islamic-text-muted)] mb-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div className="h-1.5 bg-[var(--islamic-border)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--islamic-accent)] rounded-full transition-all duration-200"
                      style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                    />
                  </div>
                </div>
                
                <span className="text-xs text-[var(--islamic-text-muted)]">Qori: {surah.audio.reciter}</span>
              </div>
              
              {audioError && (
                <div className="text-xs text-red-400 mt-2">{audioError}</div>
              )}
            </div>
          )}
        </div>

        {/* Verses */}
        <div className="space-y-4">
          {versesLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--islamic-accent)]" />
            </div>
          )}

          {versesError && (
            <div className="text-red-600 bg-red-50 border border-red-200 rounded-xl p-4">
              {versesError}
            </div>
          )}

          {!versesLoading && !versesError && (
            <>
              {processedVerses.map((v, index) => {
                const isActive = index === currentAyahIndex;
                return (
                  <div 
                    key={v.numberInSurah}
                    ref={el => { verseRefs.current[index] = el; }}
                    data-ayah-index={index}
                    onClick={() => playFromAyah(index)}
                    className={`verse-card p-5 cursor-pointer transition-all duration-300 ${
                      isActive 
                        ? 'active-ayah border-l-4 border-l-[#BC832A] bg-[#FFFCED] scale-[1.005]' 
                        : 'border-l-4 border-l-transparent bg-white'
                    }`}
                  >
                    {/* Verse Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                          isActive 
                            ? 'bg-[#BC832A] text-white' 
                            : 'text-[var(--islamic-primary)]'
                        }`}>
                          {surah.number}:{index + 1}
                        </span>
                        <span className="text-xs text-[var(--islamic-accent)] uppercase tracking-wider font-medium">
                          Indonesia
                        </span>
                      </div>
                      <button className="text-xs text-[var(--islamic-accent)] font-medium italic">
                        See Tafsir →
                      </button>
                    </div>

                    {/* Translation */}
                    <p className="text-[var(--islamic-text)] verse-text mb-4">
                      {v.translation}
                    </p>

                    {/* Arabic Text */}
                    <div className="font-arabic-display text-right mb-4 text-[var(--islamic-primary)]">
                      {v.arabic}
                    </div>

                    {/* Action Icons */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--islamic-border)]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isBookmarked(surah.number, v.numberInSurah)) {
                            removeBookmark(surah.number, v.numberInSurah);
                          } else {
                            addBookmark({
                              surahNumber: surah.number,
                              surahName: surah.name_id,
                              ayahNumber: v.numberInSurah,
                              arabic: v.arabic,
                              translation: v.translation,
                            });
                          }
                        }}
                        className={`action-icon ${isBookmarked(surah.number, v.numberInSurah) ? 'text-[#BC832A]' : ''}`}
                        title={isBookmarked(surah.number, v.numberInSurah) ? 'Hapus Bookmark' : 'Tambah Bookmark'}
                      >
                        <Bookmark 
                          className="w-4 h-4" 
                          fill={isBookmarked(surah.number, v.numberInSurah) ? "currentColor" : "none"}
                        />
                      </button>
                      <button
                        className="action-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          void shareVerse(v);
                        }}
                        title="Bagikan"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        className="action-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTafsirView?.(surah.number, v.numberInSurah);
                        }}
                        title="Lihat Tafsir"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button 
                        className={`action-icon ${
                          currentPlayingAyah === v.numberInSurah 
                            ? 'text-[var(--islamic-accent)] bg-[var(--islamic-accent)]/10' 
                            : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          playFromAyah(index);
                        }}
                        title={
                          currentPlayingAyah === v.numberInSurah 
                            ? (isPlaying ? 'Pause ayat ini' : 'Lanjutkan ayat ini')
                            : 'Putar ayat ini'
                        }
                      >
                        {currentPlayingAyah === v.numberInSurah ? (
                          isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          copyVerse(v.arabic, v.translation);
                        }}
                        className="action-icon"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Sticky Audio Player Bar */}
      {surah.audio.has_audio && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0D5466] text-white h-16 flex items-center px-4 shadow-lg">
          <div className="flex items-center gap-4 w-full max-w-4xl mx-auto">
            {/* Previous Ayah */}
            <button 
              onClick={goToPrevAyah}
              className="p-2 rounded-full transition-colors"
              title="Previous Ayah (←)"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            {/* Play/Pause */}
            <button 
              onClick={togglePlayPause}
              className="w-12 h-12 bg-[#BC832A] rounded-full flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" fill="white" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" fill="white" />
              )}
            </button>

            {/* Next Ayah */}
            <button 
              onClick={goToNextAyah}
              className="p-2 rounded-full transition-colors"
              title="Next Ayah (→)"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Surah Info */}
            <div className="flex-1 min-w-0 px-4">
              <div className="text-sm font-medium truncate">
                {surah.name_id}
              </div>
              <div className="text-xs text-white/70">
                Ayat {currentAyahIndex + 1} / {processedVerses.length}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="hidden sm:flex flex-1 max-w-xs items-center gap-2">
              <span className="text-xs text-white/70">{formatTime(currentTime)}</span>
              <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#BC832A] rounded-full transition-all duration-200"
                  style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                />
              </div>
              <span className="text-xs text-white/70">{formatTime(duration)}</span>
            </div>

            {/* Speed Control */}
            <button 
              onClick={handleSpeedChange}
              className="px-2 py-1 text-xs font-medium bg-white/10 rounded transition-colors"
              title="Playback Speed"
            >
              {playbackSpeed}x
            </button>

            {/* Auto Scroll Toggle */}
            <button 
              onClick={() => setAutoScrollEnabled(!autoScrollEnabled)}
              className={`p-2 rounded-full transition-colors ${
                autoScrollEnabled ? 'text-[#BC832A]' : 'text-white/50'
              }`}
              title={autoScrollEnabled ? "Auto Scroll ON" : "Auto Scroll OFF"}
            >
              <ScrollText className="w-5 h-5" />
            </button>

            {/* Hidden Audio Element */}
            <audio
              ref={audioRef}
              src={audioUrl}
              preload="metadata"
            />
          </div>
        </div>
      )}
    </div>

    {/* Settings Panel */}
    <SettingsPanel 
      isOpen={isSettingsOpen} 
      onClose={() => setIsSettingsOpen(false)} 
    />
    </>
  );
};

export default SurahDetail;
