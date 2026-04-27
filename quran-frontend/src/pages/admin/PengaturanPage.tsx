import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  Users,
  Mail,
   Globe,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  CheckCircle,
  AlertCircle,
  User,
  Mic,
  Volume2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../lib/axios';
import { petugasService } from '../../services/petugasService';
import type { Petugas, MosqueInfo, ApiResponse } from '../../types';

// ─── Mosque Info API helpers ───────────────────────────────────────────────────
const fetchMosqueInfo = async (): Promise<MosqueInfo> => {
  const res = await axiosInstance.get<ApiResponse<MosqueInfo>>('/mosque-info');
  return res.data.data;
};

const updateMosqueInfo = async (data: Partial<MosqueInfo>): Promise<MosqueInfo> => {
  const res = await axiosInstance.put<ApiResponse<MosqueInfo>>('/mosque-info', data);
  return res.data.data;
};

// ─── Password Change API ───────────────────────────────────────────────────────
const changePassword = async (data: { current_password: string; new_password: string; new_password_confirmation: string }) => {
  const res = await axiosInstance.put('/profile/password', data);
  return res.data;
};

// ─── Jabatan config ────────────────────────────────────────────────────────────
const jabatanConfig = {
  imam:       { label: 'Imam',       icon: User,    color: 'bg-[#1a365d]' },
  muadzin:    { label: 'Muadzin',    icon: Volume2, color: 'bg-blue-600' },
  bilal:      { label: 'Bilal',      icon: Users,   color: 'bg-[#BC832A]' },
  penceramah: { label: 'Penceramah', icon: Mic,     color: 'bg-emerald-600' },
} as const;

// ─── Toast Component ──────────────────────────────────────────────────────────
const Toast = ({ message, type }: { message: string; type: 'success' | 'error' }) => (
  <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white font-bold animate-in slide-in-from-bottom-4 duration-300 ${type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
    {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
    {message}
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const PengaturanPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'masjid' | 'petugas' | 'akun'>('masjid');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const tabs = [
    { key: 'masjid',  label: 'Informasi Masjid',    icon: Building2 },
    { key: 'petugas', label: 'Master Data Petugas',  icon: Users },
    { key: 'akun',    label: 'Akun & Keamanan',      icon: Settings },
  ] as const;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-[#BC832A]" />
          Pengaturan
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola konfigurasi masjid, data petugas, dan akun admin.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
                isActive
                  ? 'bg-white dark:bg-gray-700 text-[#BC832A] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#BC832A]' : ''}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'masjid' && <MasjidTab showToast={showToast} />}
      {activeTab === 'petugas' && <PetugasTab showToast={showToast} />}
      {activeTab === 'akun' && <AkunTab showToast={showToast} />}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Tab 1: Informasi Masjid
// ═══════════════════════════════════════════════════════════════════════════════
const MasjidTab: React.FC<{ showToast: (m: string, t?: 'success' | 'error') => void }> = ({ showToast }) => {
  const queryClient = useQueryClient();

  const { data: mosqueInfo, isLoading } = useQuery({
    queryKey: ['mosque-info'],
    queryFn: fetchMosqueInfo,
    retry: 1,
  });

  const [form, setForm] = useState({
    name: '', address: '', phone: '', email: '',
    description: '', website_url: '', logo_url: '',
    social_media: { instagram: '', youtube: '', facebook: '' },
  });

  // Populate form once data loads
  React.useEffect(() => {
    if (mosqueInfo) {
      setForm({
        name:        mosqueInfo.name        || '',
        address:     mosqueInfo.address     || '',
        phone:       mosqueInfo.phone       || '',
        email:       mosqueInfo.email       || '',
        description: mosqueInfo.description || '',
        website_url: mosqueInfo.website_url || '',
        logo_url:    mosqueInfo.logo_url    || '',
        social_media: {
          instagram: mosqueInfo.social_media?.instagram || '',
          youtube:   mosqueInfo.social_media?.youtube   || '',
          facebook:  mosqueInfo.social_media?.facebook  || '',
        },
      });
    }
  }, [mosqueInfo]);

  const mutation = useMutation({
    mutationFn: updateMosqueInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mosque-info'] });
      showToast('Informasi masjid berhasil disimpan!');
    },
    onError: () => showToast('Gagal menyimpan. Cek koneksi atau validasi.', 'error'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  const inputClass = "w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#BC832A] focus:border-transparent dark:text-white transition-all font-medium";
  const labelClass = "block text-xs font-black uppercase tracking-widest text-gray-400 mb-2";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-[#BC832A] animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Identitas Masjid */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <h3 className="font-black text-gray-800 dark:text-white text-lg mb-6 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#BC832A]" />
          Identitas Masjid
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className={labelClass}>Nama Masjid *</label>
            <input type="text" className={inputClass} value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Masjid Jami' Al-Ikhlas" required />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Alamat Lengkap</label>
            <textarea className={inputClass} value={form.address} rows={3}
              onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="Jl. Masjid No. 1, Kelurahan, Kecamatan, Kota" />
          </div>

          <div>
            <label className={labelClass}>Email Masjid</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" className={`${inputClass} pl-11`} value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="masjid@email.com" />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Deskripsi Singkat</label>
            <textarea className={inputClass} value={form.description} rows={3}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Masjid kami melayani jemaah sejak tahun..." />
          </div>
        </div>
      </div>


      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex items-center gap-3 px-8 py-4 bg-[#BC832A] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#A07220] transition-all shadow-lg shadow-[#BC832A]/20 disabled:opacity-60 active:scale-95"
        >
          {mutation.isPending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {mutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Tab 2: Master Data Petugas
// ═══════════════════════════════════════════════════════════════════════════════
type PetugasFormState = { nama: string; jabatan: Petugas['jabatan']; no_telepon: string; aktif: boolean };

const emptyForm: PetugasFormState = { nama: '', jabatan: 'imam', no_telepon: '', aktif: true };

const PetugasTab: React.FC<{ showToast: (m: string, t?: 'success' | 'error') => void }> = ({ showToast }) => {
  const queryClient = useQueryClient();
  const [filterJabatan, setFilterJabatan] = useState<string>('all');
  const [form, setForm] = useState<PetugasFormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: petugas, isLoading } = useQuery({
    queryKey: ['petugas-all'],
    queryFn: () => petugasService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Petugas, 'id'>) => petugasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petugas-all'] });
      queryClient.invalidateQueries({ queryKey: ['petugas'] });
      showToast('Petugas berhasil ditambahkan!');
      setIsFormOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    },
    onError: () => showToast('Gagal menambahkan petugas.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Petugas> }) => petugasService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petugas-all'] });
      queryClient.invalidateQueries({ queryKey: ['petugas'] });
      showToast('Petugas berhasil diperbarui!');
      setIsFormOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    },
    onError: () => showToast('Gagal memperbarui petugas.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => petugasService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petugas-all'] });
      queryClient.invalidateQueries({ queryKey: ['petugas'] });
      showToast('Petugas berhasil dihapus.');
    },
    onError: () => showToast('Gagal menghapus petugas.', 'error'),
  });

  const handleEdit = (p: Petugas) => {
    setForm({ nama: p.nama, jabatan: p.jabatan, no_telepon: p.no_telepon || '', aktif: p.aktif });
    setEditingId(p.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleDelete = (id: number, nama: string) => {
    if (window.confirm(`Hapus petugas "${nama}"? Data yang terkait pada jadwal masih tersimpan.`)) {
      deleteMutation.mutate(id);
    }
  };

  const filtered = (petugas || []).filter(p => filterJabatan === 'all' || p.jabatan === filterJabatan);

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          {[{ key: 'all', label: 'Semua' }, ...Object.entries(jabatanConfig).map(([k, v]) => ({ key: k, label: v.label }))].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterJabatan(f.key)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterJabatan === f.key ? 'bg-[#BC832A] text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditingId(null); setIsFormOpen(true); }}
          className="flex items-center gap-2 px-5 py-3 bg-[#BC832A] text-white rounded-xl font-bold text-sm hover:bg-[#A07220] transition-all shadow-lg shadow-[#BC832A]/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tambah Petugas
        </button>
      </div>

      {/* Inline Form */}
      {isFormOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-[#BC832A]/30 p-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="font-black text-gray-800 dark:text-white mb-5 text-base">
            {editingId ? '✏️ Edit Petugas' : '➕ Tambah Petugas Baru'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Nama Petugas</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#BC832A] dark:bg-gray-700 dark:text-white font-medium"
                  placeholder="Nama lengkap petugas..."
                  value={form.nama}
                  onChange={e => setForm({ ...form, nama: e.target.value })}
                  required autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Jabatan</label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#BC832A] dark:bg-gray-700 dark:text-white font-medium appearance-none"
                  value={form.jabatan}
                  onChange={e => setForm({ ...form, jabatan: e.target.value as Petugas['jabatan'] })}
                >
                  {Object.entries(jabatanConfig).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

            </div>
            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-[#BC832A]" checked={form.aktif} onChange={e => setForm({ ...form, aktif: e.target.checked })} />
                <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Petugas Aktif</span>
              </label>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setIsFormOpen(false); setEditingId(null); setForm(emptyForm); }}
                  className="flex items-center gap-2 px-5 py-3 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-sm transition-all">
                  <X className="w-4 h-4" /> Batal
                </button>
                <button type="submit" disabled={isPending}
                  className="flex items-center gap-2 px-5 py-3 bg-[#BC832A] text-white rounded-xl font-bold text-sm hover:bg-[#A07220] transition-all disabled:opacity-60">
                  {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {editingId ? 'Perbarui' : 'Tambahkan'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Petugas List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-[#BC832A] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Users className="w-16 h-16 mx-auto opacity-20 mb-4" />
            <p className="font-bold text-lg">Belum ada petugas terdaftar</p>
            <p className="text-sm mt-1">Klik "Tambah Petugas" untuk mulai menambahkan</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-black tracking-wider">
              <tr>
                <th className="px-6 py-4">Nama Petugas</th>
                <th className="px-6 py-4">Jabatan</th>

                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((p) => {
                const config = jabatanConfig[p.jabatan];
                const IconComp = config.icon;
                return (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0`}>
                          <IconComp className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-gray-800 dark:text-white">{p.nama}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1.5 rounded-lg text-white text-xs font-black uppercase tracking-widest ${config.color}`}>
                        {config.label}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {p.aktif ? (
                        <span className="flex items-center gap-1.5 text-emerald-500 font-bold text-sm">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Aktif
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-gray-400 font-bold text-sm">
                          <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" /> Non-Aktif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(p)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id, p.nama)} disabled={deleteMutation.isPending}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Tab 3: Akun & Keamanan
// ═══════════════════════════════════════════════════════════════════════════════
const AkunTab: React.FC<{ showToast: (m: string, t?: 'success' | 'error') => void }> = ({ showToast }) => {
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    } catch { /* nothing */ }
  }, []);


  const [passForm, setPassForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.new_password !== passForm.new_password_confirmation) {
      showToast('Password baru dan konfirmasi tidak cocok.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await changePassword(passForm);
      showToast('Password berhasil diubah!');
      setPassForm({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch {
      showToast('Gagal mengubah password. Pastikan password lama benar.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#BC832A] dark:text-white font-medium transition-all";
  const labelClass = "block text-xs font-black uppercase tracking-widest text-gray-400 mb-2";

  return (
    <div className="space-y-6 max-w-lg">
      {/* Profile Info (read-only) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <h3 className="font-black text-gray-800 dark:text-white text-base mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-[#BC832A]" />
          Profil Admin
        </h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Nama</label>
            <p className="text-gray-800 dark:text-white font-bold text-base">{user?.name || '-'}</p>
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <p className="text-gray-600 dark:text-gray-300 font-medium">{user?.email || '-'}</p>
          </div>
          <div>
            <label className={labelClass}>Role</label>
            <span className="inline-block px-3 py-1 bg-[#BC832A]/10 text-[#BC832A] rounded-lg text-xs font-black uppercase tracking-widest">
              {user?.role || 'Admin'}
            </span>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <h3 className="font-black text-gray-800 dark:text-white text-base mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#BC832A]" />
          Ganti Password
        </h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Password Saat Ini</label>
            <input type="password" className={inputClass} placeholder="••••••••"
              value={passForm.current_password}
              onChange={e => setPassForm({ ...passForm, current_password: e.target.value })} required />
          </div>
          <div>
            <label className={labelClass}>Password Baru</label>
            <input type="password" className={inputClass} placeholder="Min. 8 karakter"
              value={passForm.new_password} minLength={8}
              onChange={e => setPassForm({ ...passForm, new_password: e.target.value })} required />
          </div>
          <div>
            <label className={labelClass}>Konfirmasi Password Baru</label>
            <input type="password" className={inputClass} placeholder="Ulangi password baru"
              value={passForm.new_password_confirmation}
              onChange={e => setPassForm({ ...passForm, new_password_confirmation: e.target.value })} required />
          </div>
          <div className="pt-2">
            <button type="submit" disabled={isSubmitting}
              className="flex items-center gap-3 px-6 py-3 bg-[#1a365d] text-white rounded-xl font-bold text-sm hover:bg-[#2d3748] transition-all disabled:opacity-60">
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSubmitting ? 'Menyimpan...' : 'Perbarui Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PengaturanPage;
