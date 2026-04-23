import axios from '../lib/axios';
import type { JadwalPetugas, ApiResponse } from '../types';

export const jadwalService = {
  getAll: async (bulan?: number, tahun?: number): Promise<JadwalPetugas[]> => {
    const response = await axios.get<ApiResponse<JadwalPetugas[]>>('/jadwal', {
      params: { bulan, tahun },
    });
    return response.data.data;
  },

  getPublic: async (bulan?: number, tahun?: number): Promise<JadwalPetugas[]> => {
    const response = await axios.get<ApiResponse<JadwalPetugas[]>>('/jadwal/public', {
      params: { bulan, tahun },
    });
    return response.data.data;
  },

  getById: async (id: number): Promise<JadwalPetugas> => {
    const response = await axios.get<ApiResponse<JadwalPetugas>>(`/jadwal/${id}`);
    return response.data.data;
  },

  create: async (data: Omit<JadwalPetugas, 'id' | 'imam' | 'bilal' | 'muadzin' | 'penceramah'>): Promise<JadwalPetugas> => {
    const response = await axios.post<ApiResponse<JadwalPetugas>>('/jadwal', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<JadwalPetugas>): Promise<JadwalPetugas> => {
    const response = await axios.put<ApiResponse<JadwalPetugas>>(`/jadwal/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`/jadwal/${id}`);
  },
};
