import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Calendar, Clock, Bell, BellOff, User, Users, Volume2, Mic, MapPin, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { prayerApi, pushApi } from '../services/api';
import { jadwalService } from '../services/jadwalService';
import { useQuery } from '@tanstack/react-query';

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

function getNowWIB(): { timeStr: string; dateStr: string } {
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

function diffMinutes(a: string, b: string): number {
  const [aH, aM] = a.split(':').map(Number);
  const [bH, bM] = b.split(':').map(Number);
  return (aH * 60 + aM) - (bH * 60 + bM);
}

const isFriday = (dateString: string) => {
  if (!dateString) return false;
  // Use date string to avoid timezone issues with 'new Date()'
  const date = new Date(dateString);
  return date.getDay() === 5;
};

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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Prayer times state


  // Status notifikasi & notif permission
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const [lastAdzanFired, setLastAdzanFired] = useState<string | null>(null);

  const prayerTimesRef = useRef<JadwalSholat[]>([]);

  // New Jadwal Petugas fetching with React Query
  // New Jadwal Petugas fetching with React Query - Polling every 5 seconds
  const { data: jadwalPetugas, isLoading: isLoadingStaff, isError: staffError } = useQuery({
    queryKey: ['jadwalPublic', selectedMonth, selectedYear],
    queryFn: () => jadwalService.getPublic(selectedMonth, selectedYear),
    refetchInterval: 5000,
  });

  // Prayer times with React Query - Polling every 5 seconds
  const { 
    data: prayerTimes = [], 
    isLoading: isLoadingPrayer, 
    isError: isPrayerError 
  } = useQuery({
    queryKey: ['prayerTimes', selectedMonth, selectedYear],
    queryFn: async () => {
      const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
      const data = await prayerApi.getMonth(monthStr);
      return data.map((pt: any) => ({
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
    },
    refetchInterval: 5000,
  });

  prayerTimesRef.current = prayerTimes;

  const prayerError = isPrayerError ? 'Gagal memuat jadwal sholat.' : null;

  // Audio / Adzan
  const createAdzanSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
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
    } catch { }
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
      } catch { }
    }
    playAdzanSound();
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

  useEffect(() => {
    if (!('Notification' in window)) return;
    setNotifPermission(Notification.permission);
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(p => setNotifPermission(p));
    }
  }, []);

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
        const diff = diffMinutes(timeStr, prayer.time);
        const firedKey = `${dateStr}-${prayer.name}`;
        if (diff >= 0 && diff <= 1 && !alreadyFired(firedKey)) {
          markFired(firedKey);
          showAdzanNotification(prayer.name, prayer.time);
        }
      });
    };
    const interval = setInterval(check, 20000);
    check();
    return () => clearInterval(interval);
  }, []);

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
        }
      } catch (err) {
        console.error('Failed to subscribe to Web Push:', err);
      }
    }
  };

  return (
    <div className="flex-1 w-full h-full bg-[var(--islamic-background)] overflow-y-auto">
      <div className="w-full px-4 md:px-8 py-6 mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="flex items-center text-[var(--islamic-primary)] hover:underline">
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span className="text-sm font-bold">Kembali</span>
            </button>
            <h1 className="text-2xl font-bold text-[var(--islamic-text)]">Jadwal Masjid</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl px-4 py-2 shadow-sm border border-[var(--islamic-border)]">
              <button
                onClick={() => {
                  let m = selectedMonth - 1;
                  let y = selectedYear;
                  if (m === 0) { m = 12; y--; }
                  setSelectedMonth(m);
                  setSelectedYear(y);
                }}
                className="text-[var(--islamic-primary)] p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200 min-w-[140px] text-center">
                {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => {
                  let m = selectedMonth + 1;
                  let y = selectedYear;
                  if (m === 13) { m = 1; y++; }
                  setSelectedMonth(m);
                  setSelectedYear(y);
                }}
                className="text-[var(--islamic-primary)] p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>

            <button
              onClick={testNotification}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--islamic-accent)] text-white rounded-xl hover:opacity-90 transition-all font-bold shadow-sm"
            >
              <Bell className="w-4 h-4" />
              Test Adzan
            </button>
          </div>
        </div>

        {/* Banner: Permissions */}
        {notifPermission !== 'granted' && (
          <div className={`mb-6 flex items-center justify-between gap-3 p-4 rounded-2xl border text-sm shadow-sm ${
            notifPermission === 'denied'
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${notifPermission === 'denied' ? 'bg-red-100' : 'bg-amber-100'}`}>
                <BellOff className={`w-5 h-5 ${notifPermission === 'denied' ? 'text-red-600' : 'text-amber-600'}`} />
              </div>
              <p className="font-medium">
                {notifPermission === 'denied'
                  ? 'Notifikasi diblokir. Aktifkan izin notifikasi agar adzan bisa berbunyi otomatis.'
                  : 'Izinkan notifikasi agar adzan otomatis berbunyi tepat waktu.'}
              </p>
            </div>
            {notifPermission === 'default' && (
              <button
                onClick={requestNotifPermission}
                className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold shadow-sm hover:bg-amber-600 transition-colors"
              >
                Izinkan
              </button>
            )}
          </div>
        )}

        <audio ref={audioRef} preload="none">
          <source src="https://islamcan.com/audio/adhan/azan1.mp3" type="audio/mpeg" />
        </audio>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2 border border-[var(--islamic-border)] shadow-sm">
          <button
            onClick={() => setActiveTab('sholat')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'sholat'
                ? 'bg-[var(--islamic-primary)] text-white shadow-md'
                : 'text-gray-500 hover:bg-white dark:hover:bg-gray-800'
            }`}
          >
            <Clock className="w-5 h-5" />
            Jadwal Sholat
          </button>
          <button
            onClick={() => setActiveTab('petugas')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'petugas'
                ? 'bg-[var(--islamic-primary)] text-white shadow-md'
                : 'text-gray-500 hover:bg-white dark:hover:bg-gray-800'
            }`}
          >
            <Users className="w-5 h-5" />
            Jadwal Petugas
          </button>
        </div>

        {/* ─ Tab: Jadwal Sholat ─ */}
        {activeTab === 'sholat' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-[var(--islamic-border)] shadow-xl overflow-hidden p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[var(--islamic-accent)]/10 rounded-2xl">
                    <Calendar className="w-6 h-6 text-[var(--islamic-accent)]" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Jadwal Sholat 5 Waktu</h2>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400">
                  <MapPin className="w-4 h-4 text-[var(--islamic-primary)]" />
                  <span>Dikonfigurasi untuk Wilayah Anda</span>
                </div>
              </div>

              {isLoadingPrayer ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <RefreshCw className="w-10 h-10 text-[var(--islamic-primary)] animate-spin" />
                  <p className="text-gray-500 font-medium animate-pulse">Sinkronisasi dengan eQuran.id...</p>
                </div>
              ) : prayerError ? (
                <div className="flex items-center gap-4 p-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-3xl mb-8">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                  <p className="text-red-700 dark:text-red-400 font-medium">{prayerError}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {prayerTimes.map((jadwal) => {
                    const { dateStr } = getNowWIB();
                    const isToday = jadwal.tanggal === dateStr;
                    return (
                      <div
                        key={jadwal.id}
                        className={`rounded-3xl p-6 md:p-8 transition-all ${
                          isToday
                            ? 'bg-[var(--islamic-primary)]/5 dark:bg-[var(--islamic-primary)]/10 border-2 border-[var(--islamic-primary)] shadow-2xl shadow-[var(--islamic-primary)]/10 relative overflow-hidden'
                            : 'bg-white dark:bg-gray-800/10 border border-[var(--islamic-border)] hover:border-[var(--islamic-primary)]/30'
                        }`}
                      >
                         {isToday && <div className="absolute top-0 right-0 py-2 px-6 bg-[var(--islamic-primary)] text-white text-xs font-bold rounded-bl-3xl">HARI INI</div>}
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-2">
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            {formatTanggal(jadwal.tanggal)}
                          </h3>
                          <button
                            onClick={() => toggleNotifikasi(jadwal.id)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all shadow-sm ${
                              jadwal.notifikasi
                                ? 'bg-[var(--islamic-accent)] text-white hover:scale-105 active:scale-95'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                            }`}
                          >
                            {jadwal.notifikasi ? <Bell className="w-5 h-5 flex-shrink-0" /> : <BellOff className="w-5 h-5 flex-shrink-0" />}
                            <span>{jadwal.notifikasi ? 'Pengingat Aktif' : 'Matikan Pengingat'}</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
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
                                className={`flex flex-col items-center justify-center p-5 rounded-3xl transition-all ${
                                  isNext
                                    ? 'bg-[var(--islamic-accent)] text-white shadow-xl shadow-[var(--islamic-accent)]/20 scale-105 ring-4 ring-[var(--islamic-accent)]/10'
                                    : isPast
                                    ? 'bg-gray-50 dark:bg-gray-800/50 opacity-40'
                                    : 'bg-white dark:bg-gray-800 border border-[var(--islamic-border)]'
                                }`}
                              >
                                <p className={`text-xs font-bold uppercase tracking-widest ${isNext ? 'text-white/80' : 'text-gray-500'}`}>{prayer.name}</p>
                                <p className={`text-2xl font-black mt-2 ${isNext ? 'text-white' : 'text-gray-800 dark:text-white'}`}>
                                  {prayer.time}
                                </p>
                                {isNext && <span className="text-[10px] bg-white/20 px-3 py-1 rounded-full mt-2 font-black uppercase">Segera</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─ Tab: Jadwal Petugas ─ */}
        {activeTab === 'petugas' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-[var(--islamic-border)] shadow-xl p-6 md:p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-[var(--islamic-accent)]/10 rounded-2xl">
                  <Users className="w-6 h-6 text-[var(--islamic-accent)]" />
                </div>
                <h2 className="text-xl font-bold text-white">Informasi Petugas Harian</h2>
              </div>

              {isLoadingStaff ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <RefreshCw className="w-10 h-10 text-[var(--islamic-primary)] animate-spin" />
                  <p className="text-gray-500 font-medium">Memuat daftar petugas...</p>
                </div>
              ) : staffError ? (
                <div className="flex items-center gap-4 p-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-3xl">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                  <p className="text-red-700 dark:text-red-400 font-medium">Gagal memuat informasi petugas. Silakan muat ulang.</p>
                </div>
              ) : (jadwalPetugas?.length || 0) > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {jadwalPetugas?.map((jadwal) => (
                    <div key={jadwal.id} className="group bg-white dark:bg-gray-800/10 border border-[var(--islamic-border)] rounded-[2rem] p-6 hover:shadow-2xl transition-all hover:border-[var(--islamic-primary)]/50">
                      <div className="mb-6 pb-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
                        <h3 className="font-black text-gray-800 dark:text-white text-lg leading-tight uppercase tracking-tight">
                          {formatTanggal(jadwal.tanggal)}
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 w-full">
                        {[
                          { label: 'Imam',       value: jadwal.imam?.nama,       icon: User,    color: 'bg-[var(--islamic-primary)]', show: true },
                          { label: 'Muadzin',    value: jadwal.muadzin?.nama,    icon: Volume2, color: 'bg-blue-600', show: true },
                          { label: 'Bilal',      value: jadwal.bilal?.nama,      icon: Users,   color: 'bg-[var(--islamic-accent)]', show: isFriday(jadwal.tanggal) },
                          { label: 'Penceramah', value: jadwal.penceramah?.nama, icon: Mic,     color: 'bg-emerald-600', show: isFriday(jadwal.tanggal) },
                        ].filter(item => item.show).map(({ label, value, icon: Icon, color }) => (
                          <div key={label} className="flex flex-col items-center text-center p-2">
                             <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-3 shadow-lg shadow-black/5`}>
                                <Icon className="w-6 h-6 text-white" />
                             </div>
                             <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">{label}</span>
                             <span className="text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-1 px-1">
                                {value || <span className="text-gray-300 dark:text-gray-600 italic">Kosong</span>}
                             </span>
                          </div>
                        ))}
                      </div>
                      {jadwal.catatan && (
                        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium italic">
                            <span className="not-italic mr-2">📝</span> {jadwal.catatan}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-gray-50 dark:bg-gray-800/20 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                  <div className="bg-white dark:bg-gray-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Users className="w-10 h-10 text-gray-200" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Belum Ada Jadwal Petugas</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto px-6">
                    Halaman ini akan diperbarui segera setelah admin masjid mengisi daftar petugas untuk periode ini.
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
