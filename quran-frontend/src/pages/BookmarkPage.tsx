import { Bookmark, Trash2, BookOpen } from 'lucide-react';
import { useBookmarks } from '../contexts/BookmarkContext';

interface BookmarkPageProps {
  onNavigateToSurah?: (surahNumber: number, ayahNumber?: number) => void;
}

const BookmarkPage = ({ onNavigateToSurah }: BookmarkPageProps) => {
  const { bookmarks, removeBookmark, savedSurahs, removeSavedSurah } = useBookmarks();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="h-full bg-[var(--islamic-background)] overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[var(--islamic-primary)] mb-6">Bookmark</h1>

        {/* Saved Surahs Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-[var(--islamic-accent)]" />
            <h2 className="text-lg font-semibold text-[var(--islamic-text)]">
              Surah Tersimpan ({savedSurahs.length})
            </h2>
          </div>

          {savedSurahs.length === 0 ? (
            <div className="text-center py-8 text-[var(--islamic-text-muted)]">
              <p>Belum ada surah tersimpan</p>
              <p className="text-sm mt-1">Klik tombol Simpan Surah di halaman surah</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedSurahs.map((s) => (
                <div
                  key={`surah-${s.surahNumber}`}
                  className="p-4 rounded-xl bg-[var(--islamic-card-bg)] border border-[var(--islamic-border)] transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={() => onNavigateToSurah?.(s.surahNumber)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-[var(--islamic-text)]">
                            {s.surahName}
                          </p>
                          <p className="text-xs text-[var(--islamic-text-muted)] mt-1">
                            Surah ke-{s.surahNumber}
                          </p>
                        </div>
                        <p className="font-arabic text-xl text-[var(--islamic-primary)]">
                          {s.surahNameArabic}
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => removeSavedSurah(s.surahNumber)}
                      className="p-2 text-red-500 rounded-full transition-colors"
                      title="Hapus surah tersimpan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bookmarks Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Bookmark className="w-5 h-5 text-[var(--islamic-accent)]" />
            <h2 className="text-lg font-semibold text-[var(--islamic-text)]">
              Ayat Tersimpan ({bookmarks.length})
            </h2>
          </div>

          {bookmarks.length === 0 ? (
            <div className="text-center py-12 text-[var(--islamic-text-muted)]">
              <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Belum ada bookmark</p>
              <p className="text-sm mt-1">Klik ikon bookmark saat membaca untuk menyimpan ayat</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((bookmark) => (
                <div
                  key={`${bookmark.surahNumber}-${bookmark.ayahNumber}`}
                  className="p-4 rounded-xl bg-[var(--islamic-card-bg)] border border-[var(--islamic-border)] transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <button
                      onClick={() => onNavigateToSurah?.(bookmark.surahNumber, bookmark.ayahNumber)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-[var(--islamic-accent)]">
                          {bookmark.surahName}
                        </span>
                        <span className="text-xs text-[var(--islamic-text-muted)]">
                          Ayat {bookmark.ayahNumber}
                        </span>
                      </div>
                      <p className="font-arabic-display text-lg text-right text-[var(--islamic-text)] mb-2 line-clamp-2">
                        {bookmark.arabic}
                      </p>
                      <p className="text-sm text-[var(--islamic-text-muted)] line-clamp-1">
                        {bookmark.translation}
                      </p>
                      <p className="text-xs text-[var(--islamic-text-muted)] mt-2">
                        {formatDate(bookmark.timestamp)}
                      </p>
                    </button>
                    <button
                      onClick={() => removeBookmark(bookmark.surahNumber, bookmark.ayahNumber)}
                      className="p-2 text-red-500 rounded-full transition-colors"
                      title="Hapus bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookmarkPage;
