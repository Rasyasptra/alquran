import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, Plus, Minus, UserPlus } from 'lucide-react';
import type { Petugas, JadwalPetugas } from '../../types';
import { petugasService } from '../../services/petugasService';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface ModalJadwalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: JadwalPetugas | null;
}

const isFriday = (dateString: string) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date.getDay() === 5;
};

const ModalJadwal: React.FC<ModalJadwalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    tanggal: '',
    imam_id: '',
    bilal_id: '',
    muadzin_id: '',
    penceramah_id: '',
    catatan: '',
  });

  const [isAddingNew, setIsAddingNew] = useState({
    imam: false,
    bilal: false,
    muadzin: false,
    penceramah: false,
  });

  const [newNames, setNewNames] = useState({
    imam: '',
    bilal: '',
    muadzin: '',
    penceramah: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch petugas using react-query
  const { data: imams } = useQuery({ queryKey: ['petugas', 'imam'], queryFn: () => petugasService.getAll('imam') });
  const { data: bilals } = useQuery({ queryKey: ['petugas', 'bilal'], queryFn: () => petugasService.getAll('bilal') });
  const { data: muadzins } = useQuery({ queryKey: ['petugas', 'muadzin'], queryFn: () => petugasService.getAll('muadzin') });
  const { data: penceramahs } = useQuery({ queryKey: ['petugas', 'penceramah'], queryFn: () => petugasService.getAll('penceramah') });

  useEffect(() => {
    if (initialData) {
      setFormData({
        tanggal: initialData.tanggal,
        imam_id: initialData.imam_id?.toString() || '',
        bilal_id: initialData.bilal_id?.toString() || '',
        muadzin_id: initialData.muadzin_id?.toString() || '',
        penceramah_id: initialData.penceramah_id?.toString() || '',
        catatan: initialData.catatan || '',
      });
    } else {
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        imam_id: '',
        bilal_id: '',
        muadzin_id: '',
        penceramah_id: '',
        catatan: '',
      });
    }
    // Reset adding new state on open or change
    setIsAddingNew({
      imam: false,
      bilal: false,
      muadzin: false,
      penceramah: false,
    });
    setNewNames({
      imam: '',
      bilal: '',
      muadzin: '',
      penceramah: '',
    });
  }, [initialData, isOpen]);

  // Logic to clear Bilal/Penceramah if not Friday
  useEffect(() => {
    if (formData.tanggal && !isFriday(formData.tanggal)) {
      setFormData(prev => ({
        ...prev,
        bilal_id: '',
        penceramah_id: '',
      }));
      setIsAddingNew(prev => ({
        ...prev,
        bilal: false,
        penceramah: false,
      }));
    }
  }, [formData.tanggal]);

  if (!isOpen) return null;

  const toggleAddNew = (role: keyof typeof isAddingNew) => {
    setIsAddingNew(prev => ({ ...prev, [role]: !prev[role] }));
    if (!isAddingNew[role]) {
      // Clear ID if switched to new name
      setFormData(prev => ({ ...prev, [`${role}_id`]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const finalData = { ...formData };
      
      // Handle the "Quick Add" logic for any role that is in "New Name" mode
      const roles = ['imam', 'bilal', 'muadzin', 'penceramah'] as const;
      
      for (const role of roles) {
        if (isAddingNew[role] && newNames[role].trim()) {
          // 1. Create the new Petugas in the backend
          const newPetugas = await petugasService.create({
            nama: newNames[role].trim(),
            jabatan: role,
            aktif: true
          });
          
          // 2. Assign the new ID to our final form payload
          const fieldName = `${role}_id` as 'imam_id' | 'bilal_id' | 'muadzin_id' | 'penceramah_id';
          finalData[fieldName] = newPetugas.id.toString();
          
          // 3. Invalidate the query for this role so the dropdown refreshes for next time
          queryClient.invalidateQueries({ queryKey: ['petugas', role] });
        }
      }

      await onSave(finalData);
      onClose();
    } catch (error) {
      console.error('Failed to save jadwal:', error);
      alert('Gagal menyimpan jadwal. Silakan cek validasi atau koneksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (label: string, role: 'imam' | 'bilal' | 'muadzin' | 'penceramah', options: Petugas[] | undefined) => {
    const isEditing = isAddingNew[role];
    const fieldName = `${role}_id` as 'imam_id' | 'bilal_id' | 'muadzin_id' | 'penceramah_id';

    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            {isEditing ? <UserPlus className="w-4 h-4 text-[#BC832A]" /> : null}
            {label}
          </label>
          <button
            type="button"
            onClick={() => toggleAddNew(role)}
            className={`text-[10px] font-black uppercase px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
              isEditing 
                ? 'bg-red-50 text-red-600 border border-red-100' 
                : 'bg-green-50 text-green-600 border border-green-100'
            }`}
          >
            {isEditing ? <><Minus className="w-3 h-3" /> Batal</> : <><Plus className="w-3 h-3" /> Tambah Baru</>}
          </button>
        </div>

        {isEditing ? (
          <input
            type="text"
            value={newNames[role]}
            onChange={(e) => setNewNames({ ...newNames, [role]: e.target.value })}
            placeholder={`Ketik nama ${label.toLowerCase()} baru...`}
            className="w-full px-4 py-3 border-2 border-dashed border-[#BC832A]/50 bg-[#BC832A]/5 rounded-xl focus:ring-2 focus:ring-[#BC832A] focus:border-transparent dark:text-white transition-all outline-none animate-in fade-in slide-in-from-top-1 duration-200"
            required
            autoFocus
          />
        ) : (
          <div className="relative group">
            <select
              value={formData[fieldName]}
              onChange={(e) => setFormData({ ...formData, [fieldName]: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#BC832A] focus:border-transparent dark:bg-gray-700 dark:text-white transition-all outline-none appearance-none group-hover:border-[#BC832A]/50"
            >
              <option value="">Pilih {label}</option>
              {options?.map((p) => (
                <option key={p.id} value={p.id}>{p.nama}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#BC832A]">
              <Plus className="w-4 h-4 rotate-45" />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">
        <div className="flex items-center justify-between p-8 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div>
            <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
              {initialData ? 'EDIT JADWAL' : 'TAMBAH JADWAL'}
            </h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Sistem Manajemen Petugas Masjid</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-red-50 hover:text-red-500 text-gray-400 rounded-2xl transition-all active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-sm font-black uppercase text-gray-400 tracking-widest mb-3">Pilih Tanggal</label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-[#BC832A] rounded-2xl dark:text-white transition-all outline-none font-bold"
                  required
                />
              </div>
            </div>

            {renderField('Imam', 'imam', imams)}
            {renderField('Muadzin', 'muadzin', muadzins)}
            
            {isFriday(formData.tanggal) && (
              <>
                <div className="md:col-span-2 border-t dark:border-gray-700 pt-4 mt-2">
                  <p className="text-[10px] font-black uppercase text-[#BC832A] tracking-[0.3em]">Khusus Hari Jumat</p>
                </div>
                {renderField('Bilal', 'bilal', bilals)}
                {renderField('Penceramah (Khatib)', 'penceramah', penceramahs)}
              </>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-black uppercase text-gray-400 tracking-widest mb-3">Catatan Khusus</label>
              <textarea
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-[#BC832A] rounded-2xl dark:text-white transition-all outline-none min-h-[100px] font-medium"
                placeholder="Misal: Kajian rutin, ganti imam sementara..."
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all font-black uppercase tracking-widest text-xs"
            >
              Batalkan
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] px-8 py-4 bg-[#BC832A] text-white rounded-2xl hover:bg-[#A07220] hover:shadow-xl hover:shadow-[#BC832A]/30 transition-all font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
            >
              {isSubmitting ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isSubmitting ? 'MEMPROSES...' : 'SIMPAN JADWAL'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalJadwal;
