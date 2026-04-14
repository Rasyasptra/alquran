import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Calendar, Clock, Bell, User, Users, Volume2, Mic } from 'lucide-react';

interface JadwalSholat {
  id: string;
  tanggal: string;
  subuh: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  notifikasi: boolean;
}

interface JadwalPetugas {
  id: string;
  tanggal: string;
  imam: string;
  bilal: string;
  muadzin: string;
  penceramah: string;
}

const JadwalPage = ({ onBack }: { onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState<'sholat' | 'petugas'>('sholat');
  const audioRef = useRef<HTMLAudioElement>(null);

  // Create simple adzan sound using Web Audio API
  const createAdzanSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Simple adzan-like melody
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Start with a clear tone
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
      oscillator.type = 'sine';
      
      // Create envelope for smooth sound
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime + 1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
      
      // Change pitch to simulate adzan melody
      oscillator.frequency.linearRampToValueAtTime(523, audioContext.currentTime + 0.5); // C5
      oscillator.frequency.linearRampToValueAtTime(440, audioContext.currentTime + 1); // A4
      oscillator.frequency.linearRampToValueAtTime(392, audioContext.currentTime + 1.5); // G4
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 2);
      
      console.log('Adzan sound playing successfully');
    } catch (error) {
      console.log('Adzan sound failed, trying simple beep');
      // Ultra-simple fallback
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch (fallbackError) {
        console.log('All audio failed');
      }
    }
  };

  // Play adzan sound
  const playAdzanSound = () => {
    if (audioRef.current) {
      // Reset audio to start
      audioRef.current.currentTime = 0;
      
      // Try authentic adzan MP3 first
      audioRef.current.play().then(() => {
        console.log('Authentic adzan playing');
      }).catch(() => {
        console.log('Authentic adzan failed, using generated adzan');
        // Fallback to generated adzan sound
        createAdzanSound();
      });
    }
  };

  // Show notification and play sound
  const showAdzanNotification = (sholatName: string, time: string) => {
    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`Waktu Sholat ${sholatName}`, {
        body: `Sekarang waktu sholat ${sholatName} pukul ${time}`,
        tag: `adzan-${sholatName}`,
        requireInteraction: true
      });

      // Auto close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      // Click to focus window
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }

    // Play adzan sound
    playAdzanSound();
  };

  // Test notification and sound
  const testNotification = () => {
    showAdzanNotification('Dzuhur', '11:56');
  };

  // Get realistic prayer times for today based on actual time
  const getTodayPrayerTimes = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    
    // For testing: set prayer time to current time + 1 minute
    const testTime = `${currentHour.toString().padStart(2, '0')}:${(currentMin + 1).toString().padStart(2, '0')}`;
    
    // Use realistic times for production, but override one for testing
    const subuh = '04:30';
    const dzuhur = testTime; // Test with current time + 1 minute
    const ashar = '15:00';
    const maghrib = '17:45';
    const isya = '19:00';
    
    console.log(`[TEST] Setting Dzuhur to ${dzuhur} for testing (current time: ${currentHour}:${currentMin})`);
    
    return {
      id: '1',
      tanggal: today,
      subuh,
      dzuhur,
      ashar,
      maghrib,
      isya,
      notifikasi: true
    };
  };

  const [jadwalSholat, setJadwalSholat] = useState<JadwalSholat[]>([
    getTodayPrayerTimes()
  ]);

  const [jadwalPetugas, setJadwalPetugas] = useState<JadwalPetugas[]>([
    {
      id: '1',
      tanggal: '2026-04-13',
      imam: 'Ustadz Ahmad',
      bilal: 'Bapak Budi',
      muadzin: 'Bapak Chandra',
      penceramah: 'Ustadzah Sarah'
    },
    {
      id: '2',
      tanggal: '2026-04-14',
      imam: 'Ustadz Rahman',
      bilal: 'Bapak Dodi',
      muadzin: 'Bapak Eko',
      penceramah: 'Ustadz Faisal'
    }
  ]);

  const toggleNotifikasi = (id: string) => {
    setJadwalSholat(prev => 
      prev.map(jadwal => {
        if (jadwal.id === id) {
          const newNotifikasi = !jadwal.notifikasi;
          // If turning ON, show test notification
          if (newNotifikasi) {
            // Find the first sholat time to test
            const sholatTimes = [
              { name: 'Subuh', time: jadwal.subuh },
              { name: 'Dzuhur', time: jadwal.dzuhur },
              { name: 'Ashar', time: jadwal.ashar },
              { name: 'Maghrib', time: jadwal.maghrib },
              { name: 'Isya', time: jadwal.isya }
            ];
            const firstSholat = sholatTimes[0];
            showAdzanNotification(firstSholat.name, firstSholat.time);
          }
          return { ...jadwal, notifikasi: newNotifikasi };
        }
        return jadwal;
      })
    );
  };

  const updatePetugas = (id: string, field: keyof JadwalPetugas, value: string) => {
    setJadwalPetugas(prev => 
      prev.map(jadwal => 
        jadwal.id === id ? { ...jadwal, [field]: value } : jadwal
      )
    );
  };

  const formatTanggal = (tanggal: string) => {
    const date = new Date(tanggal);
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      console.log('[Notification] Browser supports notifications');
      console.log('[Notification] Current permission:', Notification.permission);
      
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          console.log('[Notification] Permission requested:', permission);
        });
      }
    } else {
      console.log('[Notification] Browser does not support notifications');
    }
  }, []);

  // Real-time check for prayer times with improved accuracy
  useEffect(() => {
    const checkPrayerTimes = () => {
      const now = new Date();
      
      // Get current WIB time
      const wibTime = new Date(now.getTime() + (7 * 60 * 60 * 1000) + (now.getTimezoneOffset() * 60 * 1000));
      const currentTime = `${wibTime.getHours().toString().padStart(2, '0')}:${wibTime.getMinutes().toString().padStart(2, '0')}`;
      const today = wibTime.toISOString().split('T')[0];
      
      console.log(`[Adzan Check] WIB Time: ${currentTime}, Date: ${today}`);
      
      // Find today's schedule
      const todaySchedule = jadwalSholat.find(jadwal => jadwal.tanggal === today);
      
      if (!todaySchedule) {
        console.log(`[Adzan Check] No schedule found for ${today}, updating...`);
        setJadwalSholat([getTodayPrayerTimes()]);
        return;
      }
      
      if (!todaySchedule.notifikasi) {
        console.log(`[Adzan Check] Notifications disabled for ${today}`);
        return;
      }
      
      const prayerTimes = [
        { name: 'Subuh', time: todaySchedule.subuh },
        { name: 'Dzuhur', time: todaySchedule.dzuhur },
        { name: 'Ashar', time: todaySchedule.ashar },
        { name: 'Maghrib', time: todaySchedule.maghrib },
        { name: 'Isya', time: todaySchedule.isya }
      ];
      
      console.log(`[Adzan Check] Prayer times:`, prayerTimes);
      
      // Check if current time matches any prayer time (within 1 minute window)
      prayerTimes.forEach(prayer => {
        console.log(`[Adzan Check] Comparing ${currentTime} with ${prayer.name} at ${prayer.time}`);
        
        // Check exact match and within 1 minute window
        const [prayerHour, prayerMin] = prayer.time.split(':').map(Number);
        const [currentHour, currentMin] = currentTime.split(':').map(Number);
        
        const prayerMinutes = prayerHour * 60 + prayerMin;
        const currentMinutes = currentHour * 60 + currentMin;
        
        // Trigger if within 1 minute of prayer time
        if (Math.abs(currentMinutes - prayerMinutes) <= 1) {
          console.log(`[Adzan Check] MATCH! Triggering notification for ${prayer.name}`);
          showAdzanNotification(prayer.name, prayer.time);
        }
      });
    };

    // Check every 30 seconds for more reliable triggering
    const interval = setInterval(checkPrayerTimes, 30000);
    
    // Initial check
    checkPrayerTimes();
    
    return () => clearInterval(interval);
  }, [jadwalSholat]);

  return (
    <div className="h-full bg-[var(--islamic-background)] overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center text-[var(--islamic-primary)] transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">Kembali</span>
            </button>
            <h1 className="text-2xl font-bold text-[var(--islamic-text)]">Jadwal Masjid</h1>
          </div>
          <button
            onClick={testNotification}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--islamic-accent)] text-white rounded-lg transition-colors hover:bg-[var(--islamic-accent)]/90"
            title="Test Notifikasi Adzan"
          >
            <Bell className="w-4 h-4" />
            Test Adzan
          </button>
        </div>

        {/* Hidden Audio Element for Adzan Sound */}
        <audio ref={audioRef} preload="auto">
          <source src="http://www.islamcan.com/audio/adhan/azan1.mp3" type="audio/mpeg" />
          <source src="http://www.islamcan.com/audio/adhan/azan2.mp3" type="audio/mpeg" />
          <source src="http://www.islamcan.com/audio/adhan/azan3.mp3" type="audio/mpeg" />
          <source src="http://www.islamcan.com/audio/adhan/azan4.mp3" type="audio/mpeg" />
          <source src="http://www.islamcan.com/audio/adhan/azan5.mp3" type="audio/mpeg" />
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

        {/* Tab Content */}
        {activeTab === 'sholat' && (
          <div className="space-y-6">
            {/* Jadwal Sholat 5 Waktu */}
            <div className="bg-[var(--islamic-card-bg)] rounded-2xl border border-[var(--islamic-border)] p-6">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-5 h-5 text-[var(--islamic-accent)]" />
                <h2 className="text-lg font-semibold text-[var(--islamic-text)]">Jadwal Sholat 5 Waktu</h2>
              </div>

              <div className="space-y-4">
                {jadwalSholat.map((jadwal) => (
                  <div key={jadwal.id} className="border border-[var(--islamic-border)] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-[var(--islamic-text)]">
                        {formatTanggal(jadwal.tanggal)}
                      </h3>
                      <button
                        onClick={() => toggleNotifikasi(jadwal.id)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                          jadwal.notifikasi
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <Bell className="w-4 h-4" />
                        {jadwal.notifikasi ? 'Notifikasi ON' : 'Notifikasi OFF'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {[
                        { name: 'Subuh', time: jadwal.subuh, icon: ' dawn' },
                        { name: 'Dzuhur', time: jadwal.dzuhur, icon: ' sun' },
                        { name: 'Ashar', time: jadwal.ashar, icon: ' cloud-sun' },
                        { name: 'Maghrib', time: jadwal.maghrib, icon: ' sunset' },
                        { name: 'Isya', time: jadwal.isya, icon: ' moon' }
                      ].map((sholat) => (
                        <div key={sholat.name} className="text-center">
                          <div className="text-sm text-[var(--islamic-text-muted)] mb-1">
                            {sholat.name}
                          </div>
                          <div className="text-lg font-bold text-[var(--islamic-primary)]">
                            {sholat.time}
                          </div>
                          <div className="text-xs text-[var(--islamic-text-muted)] mt-1">
                            Adzan: {sholat.time}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'petugas' && (
          <div className="space-y-6">
            {/* Jadwal Imam, Bilal, Muadzin, Penceramah */}
            <div className="bg-[var(--islamic-card-bg)] rounded-2xl border border-[var(--islamic-border)] p-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-5 h-5 text-[var(--islamic-accent)]" />
                <h2 className="text-lg font-semibold text-[var(--islamic-text)]">Jadwal Petugas</h2>
              </div>

              <div className="space-y-4">
                {jadwalPetugas.map((jadwal) => (
                  <div key={jadwal.id} className="border border-[var(--islamic-border)] rounded-xl p-4">
                    <h3 className="font-semibold text-[var(--islamic-text)] mb-4">
                      {formatTanggal(jadwal.tanggal)}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--islamic-primary)] flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-[var(--islamic-text-muted)]">Imam</div>
                          <input
                            type="text"
                            value={jadwal.imam}
                            onChange={(e) => updatePetugas(jadwal.id, 'imam', e.target.value)}
                            className="w-full mt-1 px-2 py-1 border border-[var(--islamic-border)] rounded text-[var(--islamic-text)]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--islamic-accent)] flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-[var(--islamic-text-muted)]">Bilal</div>
                          <input
                            type="text"
                            value={jadwal.bilal}
                            onChange={(e) => updatePetugas(jadwal.id, 'bilal', e.target.value)}
                            className="w-full mt-1 px-2 py-1 border border-[var(--islamic-border)] rounded text-[var(--islamic-text)]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <Volume2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-[var(--islamic-text-muted)]">Muadzin</div>
                          <input
                            type="text"
                            value={jadwal.muadzin}
                            onChange={(e) => updatePetugas(jadwal.id, 'muadzin', e.target.value)}
                            className="w-full mt-1 px-2 py-1 border border-[var(--islamic-border)] rounded text-[var(--islamic-text)]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                          <Mic className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-[var(--islamic-text-muted)]">Penceramah</div>
                          <input
                            type="text"
                            value={jadwal.penceramah}
                            onChange={(e) => updatePetugas(jadwal.id, 'penceramah', e.target.value)}
                            className="w-full mt-1 px-2 py-1 border border-[var(--islamic-border)] rounded text-[var(--islamic-text)]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JadwalPage;
