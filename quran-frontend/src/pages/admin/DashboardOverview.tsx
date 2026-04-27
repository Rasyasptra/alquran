import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Building2, 
  Users, 
  Calendar, 
  Settings, 
  ArrowRight,
  UserCheck,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../lib/axios';
import { petugasService } from '../../services/petugasService';

const fetchMosqueInfo = async () => {
  const res = await axiosInstance.get('/mosque-info');
  return res.data.data;
};

const DashboardOverview = () => {
  // Fetch stats to show on the dashboard
  const { data: mosqueInfo } = useQuery({
    queryKey: ['mosque-info'],
    queryFn: fetchMosqueInfo,
  });

  const { data: petugas } = useQuery({
    queryKey: ['petugas-all'],
    queryFn: () => petugasService.getAll(),
  });

  const activePetugasCount = petugas?.filter(p => p.aktif).length || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-br from-[#1a365d] to-[#0a2342] rounded-3xl p-8 md:p-10 overflow-hidden shadow-2xl border border-[#1a365d]/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl mix-blend-overlay pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                <ShieldCheck className="w-6 h-6 text-[#BC832A]" />
             </div>
             <span className="text-white/80 font-bold uppercase tracking-widest text-xs">Admin Sistem</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
            Ahlan wa Sahlan, <br/>
            <span className="text-[#BC832A]">Pengurus Masjid</span>
          </h1>
          <p className="text-gray-300 md:text-lg max-w-xl leading-relaxed">
            Ini adalah pusat kendali untuk mengelola informasi dan jadwal kegiatan harian {mosqueInfo?.name || 'masjid Anda'}.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Identitas Masjid */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Building2 className="w-8 h-8" />
            </div>
            <Link to="/admin/settings" className="text-gray-400 hover:text-[#BC832A] transition-colors">
              <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform" />
            </Link>
          </div>
          <h3 className="font-bold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-widest mb-1">Status Profil Masjid</h3>
          <div className="text-2xl font-black text-gray-800 dark:text-white mb-4">
            {mosqueInfo?.name ? 'Lengkap' : 'Belum Diisi'}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
            <MapPin className="w-4 h-4 text-[#BC832A]" />
            <span className="truncate">{mosqueInfo?.address || 'Alamat belum diatur'}</span>
          </div>
        </div>

        {/* Card 2: Jumlah Petugas */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <UserCheck className="w-8 h-8" />
            </div>
            <Link to="/admin/settings" className="text-gray-400 hover:text-blue-500 transition-colors">
              <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform" />
            </Link>
          </div>
          <h3 className="font-bold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-widest mb-1">Total Petugas Aktif</h3>
          <div className="text-4xl font-black text-gray-800 dark:text-white mb-2 flex items-baseline gap-2">
            {activePetugasCount} <span className="text-lg font-bold text-gray-400">Orang</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-2">
            Dari total {petugas?.length || 0} petugas yang terdaftar di sistem.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-black text-gray-800 dark:text-white mb-4 ml-2">Aksi Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/admin/jadwal" className="flex items-center gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-[#BC832A] shadow-sm hover:shadow-md transition-all group">
             <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center group-hover:bg-[#BC832A] transition-colors shrink-0">
                <Calendar className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
             </div>
             <div>
                <h4 className="font-bold text-gray-800 dark:text-white">Kelola Jadwal Harian</h4>
                <p className="text-xs font-medium text-gray-400 mt-0.5">Atur imam, muadzin, dan khatib</p>
             </div>
          </Link>
          <Link to="/admin/settings" className="flex items-center gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-gray-400 shadow-sm hover:shadow-md transition-all group">
             <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center group-hover:bg-gray-800 dark:group-hover:bg-gray-600 transition-colors shrink-0">
                <Settings className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
             </div>
             <div>
                <h4 className="font-bold text-gray-800 dark:text-white">Pengaturan Sistem</h4>
                <p className="text-xs font-medium text-gray-400 mt-0.5">Ubah profil, keamanan, & master data</p>
             </div>
          </Link>
        </div>
      </div>

    </div>
  );
};

export default DashboardOverview;
