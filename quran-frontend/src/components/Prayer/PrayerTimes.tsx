import { useState, useEffect } from 'react';
import { prayerApi } from '../../services/api';
import type { PrayerTime, PrayerCountdown } from '../../types';

const PrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime | null>(null);
  const [countdown, setCountdown] = useState<PrayerCountdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [todayData, countdownData] = await Promise.all([
          prayerApi.getToday(),
          prayerApi.getCountdown()
        ]);
        
        setPrayerTimes(todayData);
        setCountdown(countdownData);
      } catch (err) {
        setError('Failed to load prayer times');
        console.error('Error fetching prayer times:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Update countdown every minute
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  const prayerNames = {
    fajr: 'Subuh',
    dhuhr: 'Dzuhur',
    asr: 'Ashar',
    maghrib: 'Maghrib',
    isha: 'Isya'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-teal-900 mb-6">Waktu Sholat Hari Ini</h2>
      
      {/* Date Display */}
      {prayerTimes && (
        <div className="bg-teal-50 rounded-lg p-4 mb-6 text-center">
          <div className="text-lg font-semibold text-teal-900">
            {new Date(prayerTimes.date).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <div className="text-sm text-gray-600">
            Hijri: {prayerTimes.hijri_date} {prayerTimes.is_ramadan ? '(Ramadan)' : ''}
          </div>
        </div>
      )}

      {/* Countdown */}
      {countdown && countdown.next_prayer && (
        <div className="bg-amber-50 rounded-lg p-4 mb-6 text-center">
          <div className="text-sm text-gray-600 mb-2">Menuju sholat</div>
          <div className="text-2xl font-bold text-amber-600">
            {prayerNames[countdown.next_prayer.name as keyof typeof prayerNames]}
          </div>
          <div className="text-lg text-teal-900">
            {countdown.next_prayer.time}
            {countdown.next_prayer.iqama && ` (Iqama: ${countdown.next_prayer.iqama})`}
          </div>
          <div className="text-sm text-gray-600 mt-2">
            {countdown.next_prayer.countdown_formatted}
          </div>
        </div>
      )}

      {/* Prayer Times Grid */}
      {prayerTimes && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(prayerNames).map(([key, name]) => {
            const time = prayerTimes[key as keyof typeof prayerNames] as string;
            const iqama = prayerTimes[`${key}_iqama` as keyof typeof prayerTimes] as string;
            const isNext = countdown?.next_prayer?.name === key;
            
            return (
              <div
                key={key}
                className={`border rounded-lg p-4 ${
                  isNext
                    ? 'border-amber-600 bg-amber-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-teal-900">{name}</h3>
                  {isNext && (
                    <span className="bg-amber-600 text-white text-xs px-2 py-1 rounded-full">
                      Berikutnya
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-teal-900 mb-1">
                  {time}
                </div>
                {iqama && (
                  <div className="text-sm text-gray-600">
                    Iqama: {iqama}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Current Prayer */}
      {countdown && countdown.current_prayer && (
        <div className="mt-6 text-center text-sm text-gray-600">
          Sholat {prayerNames[countdown.current_prayer.name as keyof typeof prayerNames]} sedang berlangsung
        </div>
      )}
    </div>
  );
};

export default PrayerTimes;
