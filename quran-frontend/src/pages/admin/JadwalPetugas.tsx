import React, { useState } from 'react';
import { Users, Plus, Trash2, Edit, Search, RefreshCw, Filter } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jadwalService } from '../../services/jadwalService';
import type { JadwalPetugas } from '../../types';
import ModalJadwal from '../../components/admin/ModalJadwal';

const isFriday = (dateString: string) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date.getDay() === 5;
};

const JadwalPetugasPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<JadwalPetugas | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch jadwals
  const { data: jadwals, isLoading, isError, refetch } = useQuery({
    queryKey: ['jadwal', selectedMonth, selectedYear],
    queryFn: () => jadwalService.getAll(selectedMonth, selectedYear),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => jadwalService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jadwal'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => jadwalService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jadwal'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => jadwalService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jadwal'] });
    },
  });

  const handleSave = async (data: any) => {
    if (editingJadwal) {
      await updateMutation.mutateAsync({ id: editingJadwal.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setEditingJadwal(null);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const openEditModal = (jadwal: JadwalPetugas) => {
    setEditingJadwal(jadwal);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingJadwal(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-[#BC832A]" />
            Jadwal Petugas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Kelola jadwal imam, bilal, muadzin, dan penceramah harian.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-[#BC832A] text-white px-6 py-3 rounded-xl hover:bg-[#A07220] transition-all font-semibold shadow-lg shadow-[#BC832A]/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Tambah Jadwal
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b dark:border-gray-700 flex flex-col md:flex-row md:items-center gap-4 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Filter className="w-5 h-5 text-[#BC832A]" />
            <span className="font-semibold">Filter:</span>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 border rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#BC832A] outline-none border-gray-200 dark:border-gray-600"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1).toLocaleString('id-ID', { month: 'long' })}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-24 px-4 py-2 border rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#BC832A] outline-none border-gray-200 dark:border-gray-600"
            />
          </div>
          <div className="md:ml-auto">
            <button
               onClick={() => refetch()}
               className="p-2 text-[#BC832A] hover:bg-[#BC832A]/10 rounded-lg transition-colors"
               title="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Imam</th>
                <th className="px-6 py-4">Bilal</th>
                <th className="px-6 py-4">Muadzin</th>
                <th className="px-6 py-4">Penceramah</th>
                <th className="px-6 py-4">Catatan</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <RefreshCw className="w-8 h-8 text-[#BC832A] animate-spin" />
                      <p className="text-gray-500 animate-pulse">Memuat data...</p>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-red-500">
                    <p className="font-bold">Gagal memuat data.</p>
                    <button onClick={() => refetch()} className="text-[#BC832A] underline mt-2">Coba lagi</button>
                  </td>
                </tr>
              ) : jadwals?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-400">
                      <Search className="w-12 h-12 opacity-20" />
                      <p className="text-lg">Belum ada jadwal petugas untuk bulan ini</p>
                    </div>
                  </td>
                </tr>
              ) : (
                jadwals?.map((jadwal) => (
                  <tr key={jadwal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 dark:text-white">
                          {new Date(jadwal.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(jadwal.tanggal).toLocaleDateString('id-ID', { weekday: 'long' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-medium">
                      {jadwal.imam?.nama || <span className="text-gray-300 dark:text-gray-600 italic">Kosong</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-medium">
                      {isFriday(jadwal.tanggal) ? (
                        jadwal.bilal?.nama || <span className="text-gray-300 dark:text-gray-600 italic">Kosong</span>
                      ) : (
                        <span className="text-gray-200 dark:text-gray-700 italic">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-medium">
                      {jadwal.muadzin?.nama || <span className="text-gray-300 dark:text-gray-600 italic">Kosong</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-medium">
                      {isFriday(jadwal.tanggal) ? (
                        jadwal.penceramah?.nama || <span className="text-gray-300 dark:text-gray-600 italic">Kosong</span>
                      ) : (
                        <span className="text-gray-200 dark:text-gray-700 italic">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate" title={jadwal.catatan}>
                      {jadwal.catatan || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(jadwal)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(jadwal.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalJadwal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingJadwal}
      />
    </div>
  );
};

export default JadwalPetugasPage;
