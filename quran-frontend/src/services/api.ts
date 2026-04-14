import axios from 'axios';
import type { ApiResponse, Surah, MosqueInfo, PrayerTime, DailyPrayer, PrayerCountdown } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000/api';
const QURAN_CLOUD_API = 'https://api.alquran.cloud/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Quran Cloud API for surah metadata
const quranCloudApi = axios.create({
  baseURL: QURAN_CLOUD_API,
  timeout: 10000,
});

// Quran API
export const quranApi = {
  getAllSurahs: async (): Promise<Surah[]> => {
    // Use alquran.cloud to get all 114 surahs
    const response = await quranCloudApi.get('/surah');
    const surahs = response.data.data;
    
    // Map to our Surah type with audio info
    return surahs.map((s: any) => ({
      number: s.number,
      name_ar: s.name,
      name_id: s.englishName,
      translation_id: s.englishNameTranslation,
      number_of_verses: s.numberOfAyahs,
      revelation: s.revelationType === 'Meccan' ? 'Makkiyah' : 'Madaniyah',
      audio: {
        has_audio: true,
        audio_url: `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${s.number}.mp3`,
        reciter: 'Mishary Rashid Al-Afasy'
      }
    }));
  },

  getSurahsWithAudio: async (): Promise<Surah[]> => {
    const response = await api.get<ApiResponse<Surah[]>>('/quran/surahs/with-audio');
    return response.data.data;
  },

  getSurahByNumber: async (number: number): Promise<Surah> => {
    const response = await api.get<ApiResponse<Surah>>(`/quran/surahs/${number}`);
    return response.data.data;
  },

  getAudioInfo: async (number: number): Promise<Surah['audio']> => {
    const response = await api.get<ApiResponse<Surah['audio']>>(`/quran/surahs/${number}/audio`);
    return response.data.data;
  },

  getReciters: async (): Promise<Record<string, string>> => {
    const response = await api.get<ApiResponse<Record<string, string>>>('/quran/reciters');
    return response.data.data;
  },

  getSurahsByReciter: async (reciter: string): Promise<Surah[]> => {
    const response = await api.get<ApiResponse<Surah[]>>(`/quran/reciters/${reciter}`);
    return response.data.data;
  },

  searchSurahs: async (query: string): Promise<Surah[]> => {
    const response = await api.get<ApiResponse<Surah[]>>('/quran/search', { params: { q: query } });
    return response.data.data;
  },
};

// Mosque Info API
export const mosqueApi = {
  getInfo: async (): Promise<MosqueInfo> => {
    const response = await api.get<ApiResponse<MosqueInfo>>('/mosque-info');
    return response.data.data;
  },

  updateInfo: async (data: Partial<MosqueInfo>): Promise<MosqueInfo> => {
    const response = await api.put<ApiResponse<MosqueInfo>>('/mosque-info', data);
    return response.data.data;
  },

  createInfo: async (data: Omit<MosqueInfo, 'id'>): Promise<MosqueInfo> => {
    const response = await api.post<ApiResponse<MosqueInfo>>('/mosque-info', data);
    return response.data.data;
  },
};

// Prayer Times API
export const prayerApi = {
  getToday: async (): Promise<PrayerTime> => {
    const response = await api.get<ApiResponse<PrayerTime>>('/prayer-times/today');
    return response.data.data;
  },

  getMonth: async (month?: string): Promise<PrayerTime[]> => {
    const response = await api.get<ApiResponse<PrayerTime[]>>('/prayer-times/month', { params: { month } });
    return response.data.data;
  },

  getCountdown: async (): Promise<PrayerCountdown> => {
    const response = await api.get<ApiResponse<PrayerCountdown>>('/prayer-times/countdown');
    return response.data.data;
  },
};

// Daily Prayers API
export const dailyPrayerApi = {
  getAll: async (category?: string): Promise<DailyPrayer[]> => {
    try {
      const response = await api.get<ApiResponse<DailyPrayer[]>>('/daily-prayers', { params: { category } });
      return response.data.data;
    } catch (error) {
      console.warn('getAll daily prayers failed, trying fallback:', error);
      // Fallback: try without category parameter
      const response = await api.get<ApiResponse<DailyPrayer[]>>('/daily-prayers');
      return response.data.data;
    }
  },

  getByCategory: async (category: string): Promise<DailyPrayer[]> => {
    // Use getAll with category parameter instead of separate endpoint
    return await dailyPrayerApi.getAll(category);
  },

  getRandom: async (): Promise<DailyPrayer> => {
    const response = await api.get<ApiResponse<DailyPrayer>>('/daily-prayers/random');
    return response.data.data;
  },

  getById: async (id: number): Promise<DailyPrayer> => {
    const response = await api.get<ApiResponse<DailyPrayer>>(`/daily-prayers/${id}`);
    return response.data.data;
  },

  getCategories: async (): Promise<Record<string, string>> => {
    const response = await api.get<ApiResponse<Record<string, string>>>('/daily-prayers/categories');
    return response.data.data;
  },
};
