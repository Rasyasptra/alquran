import axios from '../lib/axios';
import type { Petugas, ApiResponse } from '../types';

export const petugasService = {
  getAll: async (jabatan?: string): Promise<Petugas[]> => {
    const response = await axios.get<ApiResponse<Petugas[]>>('/petugas', {
      params: { jabatan },
    });
    return response.data.data;
  },

  getById: async (id: number): Promise<Petugas> => {
    const response = await axios.get<ApiResponse<Petugas>>(`/petugas/${id}`);
    return response.data.data;
  },

  create: async (data: Omit<Petugas, 'id'>): Promise<Petugas> => {
    const response = await axios.post<ApiResponse<Petugas>>('/petugas', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<Petugas>): Promise<Petugas> => {
    const response = await axios.put<ApiResponse<Petugas>>(`/petugas/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`/petugas/${id}`);
  },
};
