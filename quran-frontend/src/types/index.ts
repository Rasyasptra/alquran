export interface Surah {
  id: number;
  number: number;
  name_ar: string;
  name_id: string;
  translation_id: string;
  number_of_verses: number;
  revelation: string;
  audio: {
    has_audio: boolean;
    audio_url?: string;
    reciter?: string;
    duration?: string;
    file_size?: string;
    format?: string;
  };
}

export interface MosqueInfo {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  timezone: string;
  description: string;
  logo_url?: string;
  website_url?: string;
  social_media?: {
    instagram?: string;
    youtube?: string;
    facebook?: string;
  };
  is_active: boolean;
}

export interface PrayerTime {
  id: number;
  date: string;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  fajr_iqama: string;
  dhuhr_iqama: string;
  asr_iqama: string;
  maghrib_iqama: string;
  isha_iqama: string;
  hijri_date: string;
  is_ramadan: boolean;
}

export interface DailyPrayer {
  id: number;
  category: string;
  category_name: string;
  title_ar: string;
  title_id: string;
  arabic_text: string;
  latin_text: string;
  translation_id: string;
  source: string;
  audio_url?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin';
}

export interface Petugas {
  id: number;
  nama: string;
  jabatan: 'imam' | 'bilal' | 'muadzin' | 'penceramah';
  no_telepon?: string;
  aktif: boolean;
}

export interface JadwalPetugas {
  id: number;
  tanggal: string;
  catatan?: string;
  imam_id?: number;
  bilal_id?: number;
  muadzin_id?: number;
  penceramah_id?: number;
  imam?: Petugas;
  bilal?: Petugas;
  muadzin?: Petugas;
  penceramah?: Petugas;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PrayerCountdown {
  current_time: string;
  current_prayer?: {
    name: string;
    time: string;
    iqama: string;
  };
  next_prayer?: {
    name: string;
    time: string;
    iqama?: string;
    countdown_seconds: number;
    countdown_formatted: string;
  };
}
