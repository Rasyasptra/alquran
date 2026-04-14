import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface Bookmark {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  arabic: string;
  translation: string;
  timestamp: number;
}

export interface SavedSurah {
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  timestamp: number;
}

interface BookmarkContextType {
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Omit<Bookmark, 'timestamp'>) => void;
  removeBookmark: (surahNumber: number, ayahNumber: number) => void;
  isBookmarked: (surahNumber: number, ayahNumber: number) => boolean;
  savedSurahs: SavedSurah[];
  saveSurah: (surah: Omit<SavedSurah, 'timestamp'>) => void;
  removeSavedSurah: (surahNumber: number) => void;
  isSurahSaved: (surahNumber: number) => boolean;
  lastRead: { surahNumber: number; ayahNumber: number } | null;
  updateLastRead: (surahNumber: number, ayahNumber: number) => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

const BOOKMARKS_KEY = 'quran-bookmarks';
const SAVED_SURAHS_KEY = 'quran-saved-surahs';
const LAST_READ_KEY = 'quran-last-read';

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem(BOOKMARKS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [savedSurahs, setSavedSurahs] = useState<SavedSurah[]>(() => {
    const saved = localStorage.getItem(SAVED_SURAHS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [lastRead, setLastRead] = useState<{ surahNumber: number; ayahNumber: number } | null>(() => {
    const saved = localStorage.getItem(LAST_READ_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem(SAVED_SURAHS_KEY, JSON.stringify(savedSurahs));
  }, [savedSurahs]);

  useEffect(() => {
    if (lastRead) {
      localStorage.setItem(LAST_READ_KEY, JSON.stringify(lastRead));
    }
  }, [lastRead]);

  const addBookmark = useCallback((bookmark: Omit<Bookmark, 'timestamp'>) => {
    const newBookmark: Bookmark = { ...bookmark, timestamp: Date.now() };
    setBookmarks(prev => {
      const filtered = prev.filter(
        b => !(b.surahNumber === bookmark.surahNumber && b.ayahNumber === bookmark.ayahNumber)
      );
      return [newBookmark, ...filtered];
    });
  }, []);

  const removeBookmark = useCallback((surahNumber: number, ayahNumber: number) => {
    setBookmarks(prev =>
      prev.filter(b => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber))
    );
  }, []);

  const isBookmarked = useCallback((surahNumber: number, ayahNumber: number) => {
    return bookmarks.some(b => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber);
  }, [bookmarks]);

  const saveSurah = useCallback((surah: Omit<SavedSurah, 'timestamp'>) => {
    const newItem: SavedSurah = { ...surah, timestamp: Date.now() };
    setSavedSurahs(prev => {
      const filtered = prev.filter(s => s.surahNumber !== surah.surahNumber);
      return [newItem, ...filtered];
    });
  }, []);

  const removeSavedSurah = useCallback((surahNumber: number) => {
    setSavedSurahs(prev => prev.filter(s => s.surahNumber !== surahNumber));
  }, []);

  const isSurahSaved = useCallback((surahNumber: number) => {
    return savedSurahs.some(s => s.surahNumber === surahNumber);
  }, [savedSurahs]);

  const updateLastRead = useCallback((surahNumber: number, ayahNumber: number) => {
    setLastRead({ surahNumber, ayahNumber });
  }, []);

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        addBookmark,
        removeBookmark,
        isBookmarked,
        savedSurahs,
        saveSurah,
        removeSavedSurah,
        isSurahSaved,
        lastRead,
        updateLastRead,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) throw new Error('useBookmarks must be used within BookmarkProvider');
  return context;
};
