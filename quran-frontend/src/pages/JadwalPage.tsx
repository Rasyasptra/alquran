import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Calendar, Clock, Bell, BellOff, User, Users, Volume2, Mic, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { prayerApi, staffApi, pushApi } from '../services/api';

interface JadwalSholat {
  id: string | number;
  tanggal: string;
  hari: string;
  subuh: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  imsak?: string;
  notifikasi: boolean;
}

interface JadwalPetugas {
  id: string | number;
  date: string;
  imam?: string;
  bilal?: string;
  muadzin?: string;
  penceramah?: string;
  notes?: string;
}

// ─── Kunci cache "sudah berbunyi" disimpan di sessionStorage ─────────────────
const FIRED_KEY = 'adzan_fired';

function getFiredSet(): Set<string> {
  try {
    const raw = sessionStorage.getItem(FIRED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function markFired(key: string) {
  try {
    const s = getFiredSet();
    s.add(key);
    // Bersihkan entry lama (beda tanggal)
    const today = new Date().toISOString().split('T')[0];
    const filtered = [...s].filter(k => k.startsWith(today));
    sessionStorage.setItem(FIRED_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

function alreadyFired(key: string): boolean {
  return getFiredSet().has(key);
}

// ─── Waktu lokal WIB yang benar ─────────────────────────────────────────────
function getNowWIB(): { timeStr: string; dateStr: string } {
  // Gunakan Intl.DateTimeFormat agar selalu WIB tanpa asumsi timezone browser
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '00';

  const dateStr = `${get('year')}-${get('month')}-${get('day')}`;
  const timeStr = `${get('hour').padStart(2, '0')}:${get('minute').padStart(2, '0')}`;

  return { timeStr, dateStr };
}

// ─── Selisih menit antara dua string "HH:MM" ─────────────────────────────────
function diffMinutes(a: string, b: string): number {
  const [aH, aM] = a.split(':').map(Number);
  const [bH, bM] = b.split(':').map(Number);
  return (aH * 60 + aM) - (bH * 60 + bM);
}

// ─── Konversi VAPID public key ───────────────────────────────────────────────
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const JadwalPage = ({ onBack }: { onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState<'sholat' | 'petugas'>('sholat');
  const audioRef = useRef<HTMLAudioElement>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Prayer times state
  const [prayerTimes, setPrayerTimes] = useState<JadwalSholat[]>([]);
  const [isLoadingPrayer, setIsLoadingPrayer] = useState(false);
  const [prayerError, setPrayerError] = useState<string | null>(null);

  // Staff schedules state
  const [jadwalPetugas, setJadwalPetugas] = useState<JadwalPetugas[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);

  // Status notifikasi & notif permission
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const [lastAdzanFired, setLastAdzanFired] = useState<string | null>(null);

  // Ref agar interval selalu punya prayerTimes terbaru tanpa restart
  const prayerTimesRef = useRef<JadwalSholat[]>([]);
  prayerTimesRef.current = prayerTimes;

  // ─── Audio / Adzan ─────────────────────────────────────████──────────────
  const createAdzanSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Buat 3 nada pendek menyerupai tanbih
      const notes = [440, 523, 440, 392, 440];
      let startTime = ctx.currentTime;
      notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
        gain.gain.setValueAtTime(0.45, startTime + 0.35);
        gain.gain.linearRampToValueAtTime(0, startTime + 0.45);
        osc.start(startTime);
        osc.stop(startTime + 0.5);
        startTime += 0.55;
      });
    } catch {
      // audio tidak didukung
    }
  };

  const playAdzanSound = () => {
    if (!audioRef.current) {
      createAdzanSound();
      return;
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => createAdzanSound());
  };

  const showAdzanNotification = (sholatName: string, time: string) => {
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const n = new Notification(`🕌 Waktu Sholat ${sholatName}`, {
          body: `Saatnya sholat ${sholatName} pukul ${time} WIB`,
          tag: `adzan-${sholatName}-${time}`,
          requireInteraction: true,
          icon: '/mosque-icon.png',
        });
        setTimeout(() => n.close(), 30000);
        n.onclick = () => { window.focus(); n.close(); };
      } catch {
        // Notification API tidak didukung
      }
    }

    // Bunyi
    playAdzanSound();

    // Update status UI
    setLastAdzanFired(`${sholatName} pukul ${time}`);
    setTimeout(() => setLastAdzanFired(null), 10000);
  };

  const testNotification = () => {
    const { timeStr } = getNowWIB();
    showAdzanNotification('Dzuhur (Test)', timeStr);
  };

  const toggleNotifikasi = (id: string | number) => {
    setPrayerTimes(prev =>
      prev.map(j => j.id === id ? { ...j, notifikasi: !j.notifikasi } : j)
    );
  };

  // ─── Minta izin notifikasi ─────────────────────────────────────────────────
  useEffect(() => {
    if (!('Notification' in window)) return;

    setNotifPermission(Notification.permission);

    if (Notification.permission === 'default') {
      Notification.requestPermission().then(p => setNotifPermission(p));
    }
  }, []);

  // ─── Load Prayer Times ─────────────────────────────────────────────────────
  const loadPrayerTimes = async () => {
    setIsLoadingPrayer(true);
    setPrayerError(null);
    try {
      const data = await prayerApi.getMonth(selectedMonth);
      const formatted: JadwalSholat[] = data.map((pt: any) => ({
        id: pt.id ?? pt.date,
        tanggal: pt.date,
        hari: pt.hari ?? '',
        subuh: pt.fajr,
        dzuhur: pt.dhuhr,
        ashar: pt.asr,
        maghrib: pt.maghrib,
        isya: pt.isha,
        imsak: pt.imsak,
        notifikasi: true,
      }));
      setPrayerTimes(formatted);
    } catch (error: any) {
      setPrayerError(
        error?.response?.data?.message ||
        'Gagal memuat jadwal sholat. Periksa koneksi internet Anda.'
      );
    } finally {
      setIsLoadingPrayer(false);
    }
  };

  // ─── Load Staff Schedules ──────────────────────────────────────────────────
  const loadStaffSchedules = async () => {
    setIsLoadingStaff(true);
    setStaffError(null);
    try {
      const data = await staffApi.getPublic(selectedMonth);
      setJadwalPetugas(data);
    } catch {
      setStaffError('Gagal memuat jadwal petugas.');
    } finally {
      setIsLoadingStaff(false);
    }
  };

  useEffect(() => {
    loadPrayerTimes();
    loadStaffSchedules();
  }, [selectedMonth]);

  // ─── Pengecekan Adzan Otomatis — DIPERBAIKI ────────────────────────────────
  //
  // Perbaikan:
  //  1. Interval 20 detik (lebih presisi, kurang dari window 1 menit)
  //  2. Gunakan Intl.DateTimeFormat untuk timezone WIB yang benar
  //  3. sessionStorage sebagai penjaga "sudah berbunyi" → tidak spam
  //  4. Ref dipakai agar interval tidak perlu di-restart saat data berubah
  //  5. Window trigger: 0–1 menit setelah waktu sholat (bukan ±1 menit)
  //
  useEffect(() => {
    const check = () => {
      const { timeStr, dateStr } = getNowWIB();
      const schedules = prayerTimesRef.current;

      const todaySchedule = schedules.find(j => j.tanggal === dateStr);
      if (!todaySchedule || !todaySchedule.notifikasi) return;

      const prayers = [
        { name: 'Subuh',   time: todaySchedule.subuh },
        { name: 'Dzuhur',  time: todaySchedule.dzuhur },
        { name: 'Ashar',   time: todaySchedule.ashar },
        { name: 'Maghrib', time: todaySchedule.maghrib },
        { name: 'Isya',    time: todaySchedule.isya },
      ];

      prayers.forEach(prayer => {
        const diff = diffMinutes(timeStr, prayer.time); // positif = sudah lewat
        const firedKey = `${dateStr}-${prayer.name}`;

        // Trigger jika 0–1 menit setelah waktu sholat & belum dibunyikan hari ini
        if (diff >= 0 && diff <= 1 && !alreadyFired(firedKey)) {
          console.log(`[Adzan] ${prayer.name} tiba! (${prayer.time} WIB, sekarang ${timeStr})`);
          markFired(firedKey);
          showAdzanNotification(prayer.name, prayer.time);
        }
      });
    };

    // Cek tiap 20 detik — lebih presisi dari sebelumnya (30 detik)
    const interval = setInterval(check, 20000);
    // Langsung cek sekali saat halaman dibuka
    check();

    return () => clearInterval(interval);
  }, []); // ← dependency array KOSONG, pakai ref agar tidak restart

  const formatTanggal = (tanggal: string) =>
    new Date(tanggal).toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

  const requestNotifPermission = async () => {
    if (!('Notification' in window)) return;
    const p = await Notification.requestPermission();
    setNotifPermission(p);

    if (p === 'granted') {
      try {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('SW Registered:', registration);
          
          const publicKey = await pushApi.getVapidPublicKey();
          
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey)
          });
          
          const subJSON = subscription.toJSON();
          await pushApi.subscribe({
            endpoint: subJSON.endpoint,
            keys: {
              p256dh: subJSON.keys?.p256dh || '',
              auth: subJSON.keys?.auth || ''
            }
          } as any);
          console.log('Web Push Subscription Successful!');
        }
      } catch (err) {
        console.error('Failed to subscribe to Web Push:', err);
      }
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-full bg-[var(--islamic-background)] overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="flex items-center text-[var(--islamic-primary)]">
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">Kembali</span>
            </button>
            <h1 className="text-2xl font-bold text-[var(--islamic-text)]">Jadwal Masjid</h1>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-md">
            <button
              onClick={() => {
                const d = new Date(selectedMonth);
                d.setMonth(d.getMonth() - 1);
                setSelectedMonth(d.toISOString().slice(0, 7));
              }}
              className="text-[var(--islamic-primary)]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[120px] text-center">
              {new Date(selectedMonth).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => {
                const d = new Date(selectedMonth);
                d.setMonth(d.getMonth() + 1);
                setSelectedMonth(d.toISOString().slice(0, 7));
              }}
              className="text-[var(--islamic-primary)]"
            >
              <ChevronLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>

          <button
            onClick={testNotification}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--islamic-accent)] text-white rounded-lg hover:bg-[var(--islamic-accent)]/90 transition-colors"
            title="Test Notifikasi Adzan"
          >
            <Bell className="w-4 h-4" />
            Test Adzan
          </button>
        </div>

        {/* Banner: Notifikasi diizinkan? */}
        {notifPermission !== 'granted' && (
          <div className={`mb-4 flex items-center justify-between gap-3 p-3 rounded-xl border text-sm ${
            notifPermission === 'denied'
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
          }`}>
            <div className="flex items-center gap-2">
              <BellOff className="w-4 h-4 flex-shrink-0" />
              {notifPermission === 'denied'
                ? 'Notifikasi diblokir. Aktifkan izin notifikasi di pengaturan browser Anda agar adzan bisa berbunyi otomatis.'
                : 'Izinkan notifikasi agar adzan otomatis berbunyi saat waktu sholat tiba.'}
            </div>
            {notifPermission === 'default' && (
              <button
                onClick={requestNotifPermission}
                className="flex-shrink-0 px-3 py-1 bg-amber-500 text-white rounded-lg text-xs font-medium"
              >
                Izinkan
              </button>
            )}
          </div>
        )}

        {/* Notif berhasil berbunyi */}
        {lastAdzanFired && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            🕌 Adzan {lastAdzanFired} telah berbunyi!
          </div>
        )}

        {/* Audio element — gunakan HTTPS agar tidak diblokir browser */}
        <audio ref={audioRef} preload="none">
          <source src="https://islamcan.com/audio/adhan/azan1.mp3" type="audio/mpeg" />
          <source src="https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/1.mp3" type="audio/mpeg" />
        </audio>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-[var(--islamic-card-bg)] rounded-xl p-1">
          <button
            onClick={() => setActiveTab('sholat')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'sholat'
                ? 'bg-[var(--islamic-primary)] text-white'
                : 'text-[var(--islamic-text-muted)] hover:text-[var(--islamic-text)]'
            }`}
          >
            <Clock className="w-4 h-4" />
            Jadwal Sholat
          </button>
          <button
            onClick={() => setActiveTab('petugas')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'petugas'
                ? 'bg-[var(--islamic-primary)] text-white'
                : 'text-[var(--islamic-text-muted)] hover:text-[var(--islamic-text)]'
            }`}
          >
            <Users className="w-4 h-4" />
            Jadwal Petugas
          </button>
        </div>

        {/* ─ Tab: Jadwal Sholat ─ */}
        {activeTab === 'sholat' && (
          <div className="space-y-6">
            <div className="bg-[var(--islamic-card-bg)] rounded-2xl border border-[var(--islamic-border)] p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[var(--islamic-accent)]" />
                  <h2 className="text-lg font-semibold text-[var(--islamic-text)]">Jadwal Sholat 5 Waktu</h2>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin className="w-3 h-3" />
                  <span>Jawa Barat, Kota Bandung</span>
                </div>
              </div>

              {isLoadingPrayer ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--islamic-primary)]"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat jadwal sholat dari eQuran.id...</p>
                </div>
              ) : prayerError ? (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 dark:text-red-400 text-sm">{prayerError}</p>
                </div>
              ) : prayerTimes.length > 0 ? (
                <div className="space-y-4">
                  {prayerTimes.map((jadwal) => {
                    const { dateStr } = getNowWIB();
                    const isToday = jadwal.tanggal === dateStr;
                    return (
                      <div
                        key={jadwal.id}
                        className={`rounded-xl p-6 shadow-md ${
                          isToday
                            ? 'bg-[var(--islamic-primary)]/5 dark:bg-[var(--islamic-primary)]/10 border-2 border-[var(--islamic-primary)]/30'
                            : 'bg-white dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                              {formatTanggal(jadwal.tanggal)}
                              {isToday && (
                                <span className="text-xs font-medium px-2 py-0.5 bg-[var(--islamic-primary)] text-white rounded-full">
                                  Hari ini
                                </span>
                              )}
                            </h3>
                            {jadwal.imsak && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Imsak: {jadwal.imsak}</p>
                            )}
                          </div>
                          <button
                            onClick={() => toggleNotifikasi(jadwal.id)}
                            title={jadwal.notifikasi ? 'Nonaktifkan notifikasi' : 'Aktifkan notifikasi'}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                              jadwal.notifikasi
                                ? 'bg-[var(--islamic-accent)] text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {jadwal.notifikasi
                              ? <Bell className="w-4 h-4" />
                              : <BellOff className="w-4 h-4" />}
                            <span className="hidden sm:inline">
                              {jadwal.notifikasi ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {[
                            { name: 'Subuh',   time: jadwal.subuh },
                            { name: 'Dzuhur',  time: jadwal.dzuhur },
                            { name: 'Ashar',   time: jadwal.ashar },
                            { name: 'Maghrib', time: jadwal.maghrib },
                            { name: 'Isya',    time: jadwal.isya },
                          ].map((prayer) => {
                            const { timeStr } = getNowWIB();
                            const diff = diffMinutes(timeStr, prayer.time);
                            const isPast = isToday && diff > 0;
                            const isNext = isToday && diff >= -1 && diff <= 0;
                            return (
                              <div
                                key={prayer.name}
                                className={`flex flex-col items-center p-3 rounded-lg text-center transition-all ${
                                  isNext
                                    ? 'bg-[var(--islamic-accent)]/10 border-2 border-[var(--islamic-accent)] scale-105'
                                    : isPast
                                    ? 'bg-gray-100 dark:bg-gray-700/50 opacity-60'
                                    : 'bg-gray-50 dark:bg-gray-700'
                                }`}
                              >
                                <Clock className={`w-4 h-4 mb-1 ${isNext ? 'text-[var(--islamic-accent)]' : 'text-[var(--islamic-primary)]'}`} />
                                <p className="text-xs text-gray-500 dark:text-gray-400">{prayer.name}</p>
                                <p className={`text-base font-bold mt-0.5 ${isNext ? 'text-[var(--islamic-accent)]' : 'text-gray-800 dark:text-white'}`}>
                                  {prayer.time}
                                </p>
                                {isNext && <span className="text-xs text-[var(--islamic-accent)] mt-0.5 font-medium">Berikutnya</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">Tidak ada jadwal sholat untuk bulan ini</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─ Tab: Jadwal Petugas ─ */}
        {activeTab === 'petugas' && (
          <div className="space-y-6">
            <div className="bg-[var(--islamic-card-bg)] rounded-2xl border border-[var(--islamic-border)] p-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-5 h-5 text-[var(--islamic-accent)]" />
                <h2 className="text-lg font-semibold text-[var(--islamic-text)]">Jadwal Petugas Masjid</h2>
              </div>

              {isLoadingStaff ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--islamic-primary)]"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat jadwal petugas...</p>
                </div>
              ) : staffError ? (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 dark:text-red-400 text-sm">{staffError}</p>
                </div>
              ) : jadwalPetugas.length > 0 ? (
                <div className="space-y-4">
                  {jadwalPetugas.map((jadwal) => (
                    <div key={jadwal.id} className="border border-[var(--islamic-border)] rounded-xl p-4">
                      <h3 className="font-semibold text-[var(--islamic-text)] mb-4">
                        {formatTanggal(jadwal.date)}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { label: 'Imam',       value: jadwal.imam,       icon: User,    color: 'bg-[var(--islamic-primary)]' },
                          { label: 'Bilal',      value: jadwal.bilal,      icon: Users,   color: 'bg-[var(--islamic-accent)]' },
                          { label: 'Muadzin',    value: jadwal.muadzin,    icon: Volume2, color: 'bg-blue-500' },
                          { label: 'Penceramah', value: jadwal.penceramah, icon: Mic,     color: 'bg-green-500' },
                        ].map(({ label, value, icon: Icon, color }) => (
                          <div key={label} className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-xs text-[var(--islamic-text-muted)]">{label}</div>
                              <div className="text-sm font-medium text-[var(--islamic-text)]">
                                {value || <span className="text-gray-400 italic">Belum ditentukan</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {jadwal.notes && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400">📝 {jadwal.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Belum ada jadwal petugas</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                    Admin masjid belum menambahkan jadwal petugas untuk bulan ini.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JadwalPage;
