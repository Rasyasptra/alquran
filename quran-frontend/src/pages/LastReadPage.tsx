import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Clock } from 'lucide-react';
import { useBookmarks } from '../contexts/BookmarkContext';

type LastReadMeta = {
  juz: number;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
};

const LastReadPage = () => {
  const { lastRead } = useBookmarks();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<LastReadMeta | null>(null);

  const key = useMemo(() => {
    if (!lastRead) return null;
    return `${lastRead.surahNumber}:${lastRead.ayahNumber}`;
  }, [lastRead]);

  useEffect(() => {
    const load = async () => {
      if (!lastRead) {
        setMeta(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`https://api.alquran.cloud/v1/ayah/${lastRead.surahNumber}:${lastRead.ayahNumber}`);
        const json = await res.json();

        if (!res.ok || !json?.data) {
          throw new Error('Invalid response');
        }

        setMeta({
          juz: json.data.juz,
          surahName: json.data.surah?.englishName ?? `Surah ${lastRead.surahNumber}`,
          surahNumber: lastRead.surahNumber,
          ayahNumber: lastRead.ayahNumber,
        });
      } catch (e) {
        console.error(e);
        setError('Gagal memuat info terakhir dibaca.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [key, lastRead]);

  return (
    <div className="h-full bg-[var(--islamic-background)] overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[var(--islamic-primary)] mb-6">Terakhir Dibaca</h1>

        {!lastRead ? (
          <div className="text-center py-12 text-[var(--islamic-text-muted)]">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Belum ada riwayat terakhir dibaca</p>
            <p className="text-sm mt-1">Putar audio atau scroll ayat untuk menyimpan terakhir dibaca</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12 text-[var(--islamic-text-muted)]">Loading...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">{error}</div>
        ) : (
          <div className="bg-[var(--islamic-card-bg)] border border-[var(--islamic-border)] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-[var(--islamic-accent)]" />
              <p className="text-lg font-semibold text-[var(--islamic-text)]">Informasi Bacaan Terakhir</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[var(--islamic-cream)] border border-[var(--islamic-border)]">
                <p className="text-xs text-[var(--islamic-text-muted)]">Surah</p>
                <p className="text-[var(--islamic-text)] font-semibold">{meta?.surahName}</p>
                <p className="text-xs text-[var(--islamic-text-muted)] mt-1">Surah ke-{meta?.surahNumber}</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--islamic-cream)] border border-[var(--islamic-border)]">
                <p className="text-xs text-[var(--islamic-text-muted)]">Ayat</p>
                <p className="text-[var(--islamic-text)] font-semibold">Ayat ke-{meta?.ayahNumber}</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--islamic-cream)] border border-[var(--islamic-border)]">
                <p className="text-xs text-[var(--islamic-text-muted)]">Juz</p>
                <p className="text-[var(--islamic-text)] font-semibold">Juz {meta?.juz}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LastReadPage;
