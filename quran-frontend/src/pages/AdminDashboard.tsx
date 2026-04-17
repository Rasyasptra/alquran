import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Shield, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X,
  Search,
  RefreshCw,
  User,
  Volume2,
  Mic
} from 'lucide-react';
import { adminAuthApi, adminStaffApi } from '../services/api';

interface StaffSchedule {
  id: number;
  date: string;
  imam?: string;
  bilal?: string;
  muadzin?: string;
  penceramah?: string;
  notes?: string;
}

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<'login' | 'dashboard' | 'staff'>('login');
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [user, setUser] = useState<any>(null);
  
  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Staff schedules
  const [staffSchedules, setStaffSchedules] = useState<StaffSchedule[]>([]);
  const [editingStaff, setEditingStaff] = useState<StaffSchedule | null>(null);
  const [searchStaff, setSearchStaff] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const userData = await adminAuthApi.me(token!);
      setUser(userData);
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
    } catch (error) {
      console.error('Token verification failed:', error);
      handleLogout();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    
    try {
      const response = await adminAuthApi.login(email, password);
      localStorage.setItem('admin_token', response.token);
      setToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
    } catch (error: any) {
      setLoginError('Login gagal. Periksa email dan password Anda.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await adminAuthApi.logout(token);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('admin_token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  const loadStaffSchedules = async () => {
    if (!token) return;
    
    try {
      const data = await adminStaffApi.getAll(token, selectedMonth);
      setStaffSchedules(data);
    } catch (error) {
      console.error('Failed to load staff schedules:', error);
    }
  };

  useEffect(() => {
    if (token && currentPage === 'staff') {
      loadStaffSchedules();
    }
  }, [token, currentPage, selectedMonth]);

  const saveStaffSchedule = async (staff: StaffSchedule) => {
    if (!token) return;

    try {
      const staffData = {
        date: staff.date,
        imam: staff.imam,
        bilal: staff.bilal,
        muadzin: staff.muadzin,
        penceramah: staff.penceramah,
        notes: staff.notes,
      };

      if (staff.id) {
        await adminStaffApi.update(token, staff.id, staffData);
      } else {
        await adminStaffApi.create(token, staffData);
      }

      setEditingStaff(null);
      loadStaffSchedules();
    } catch (error) {
      console.error('Failed to save staff schedule:', error);
      alert('Gagal menyimpan jadwal petugas');
    }
  };

  const deleteStaffSchedule = async (id: number) => {
    if (!token) return;

    if (!confirm('Apakah Anda yakin ingin menghapus jadwal petugas ini?')) return;

    try {
      await adminStaffApi.delete(token, id);
      loadStaffSchedules();
    } catch (error) {
      console.error('Failed to delete staff schedule:', error);
      alert('Gagal menghapus jadwal petugas');
    }
  };

  const filteredStaffSchedules = staffSchedules.filter(ss =>
    ss.date.includes(searchStaff) ||
    ss.imam?.toLowerCase().includes(searchStaff.toLowerCase()) ||
    ss.bilal?.toLowerCase().includes(searchStaff.toLowerCase()) ||
    ss.muadzin?.toLowerCase().includes(searchStaff.toLowerCase()) ||
    ss.penceramah?.toLowerCase().includes(searchStaff.toLowerCase())
  );

  // ─── Login Page ────────────────────────────────────────────────────────────
  if (!isAuthenticated || currentPage === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a365d] to-[#2d3748] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[#BC832A] rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Masjid</h1>
            <p className="text-gray-600 mt-2">Masuk untuk mengelola jadwal petugas</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BC832A] focus:border-transparent transition-all"
                placeholder="admin@alquran.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BC832A] focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#BC832A] text-white py-3 rounded-lg hover:bg-[#A07220] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Memuat...
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Kredensial default:</p>
            <p className="font-mono text-gray-700">admin@alquran.com / admin123</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Admin Layout ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#1a365d] text-white shadow-xl z-50">
        <div className="p-6 border-b border-[#2d3748]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#BC832A] rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Admin Masjid</h2>
              <p className="text-xs text-gray-400">Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentPage === 'dashboard'
                ? 'bg-[#BC832A] text-white'
                : 'text-gray-300 hover:bg-[#2d3748]'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>

          <button
            onClick={() => setCurrentPage('staff')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentPage === 'staff'
                ? 'bg-[#BC832A] text-white'
                : 'text-gray-300 hover:bg-[#2d3748]'
            }`}
          >
            <Users className="w-5 h-5" />
            Jadwal Petugas
          </button>

          <button
            onClick={() => setCurrentPage('dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-[#2d3748] transition-colors"
          >
            <Settings className="w-5 h-5" />
            Pengaturan
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#2d3748]">
          <div className="flex items-center gap-3 mb-4 px-4">
            <div className="w-10 h-10 bg-[#2d3748] rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#BC832A]" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Dashboard Page */}
        {currentPage === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Jadwal Petugas</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{staffSchedules.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#BC832A] rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Sumber Jadwal Sholat</p>
                    <p className="text-base font-semibold text-gray-800 mt-2">eQuran.id API</p>
                    <p className="text-xs text-green-600 mt-1">● Otomatis & selalu ter-update</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <LayoutDashboard className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Selamat Datang, {user?.name}</h2>
              <p className="text-gray-600">
                Gunakan menu <strong>Jadwal Petugas</strong> di sebelah kiri untuk mengelola imam, bilal, muadzin, dan penceramah.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Jadwal sholat 5 waktu kini diambil otomatis dari <strong>eQuran.id</strong> berdasarkan lokasi yang dikonfigurasi di server.
              </p>
            </div>
          </div>
        )}

        {/* Staff Schedules Page */}
        {currentPage === 'staff' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Jadwal Petugas</h1>
                <p className="text-gray-600 mt-2">Kelola jadwal imam, bilal, muadzin, dan penceramah</p>
              </div>
              <button
                onClick={() => setEditingStaff({
                  id: 0,
                  date: selectedMonth + '-01',
                  imam: '',
                  bilal: '',
                  muadzin: '',
                  penceramah: '',
                  notes: '',
                })}
                className="flex items-center gap-2 bg-[#BC832A] text-white px-6 py-3 rounded-lg hover:bg-[#A07220] transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Tambah Jadwal
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-md mb-6">
              <div className="p-4 border-b border-gray-200 flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Cari petugas..."
                      value={searchStaff}
                      onChange={(e) => setSearchStaff(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BC832A] focus:border-transparent"
                    />
                  </div>
                </div>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BC832A] focus:border-transparent"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> Imam</span>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Bilal</span>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Volume2 className="w-3 h-3" /> Muadzin</span>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Mic className="w-3 h-3" /> Penceramah</span>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Catatan</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStaffSchedules.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          Belum ada jadwal petugas untuk bulan ini
                        </td>
                      </tr>
                    ) : (
                      filteredStaffSchedules.map((staff) => (
                        <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                            {new Date(staff.date).toLocaleDateString('id-ID', { 
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{staff.imam || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{staff.bilal || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{staff.muadzin || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{staff.penceramah || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{staff.notes || '-'}</td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => setEditingStaff(staff)}
                              className="text-blue-600 hover:text-blue-800 mr-3 transition-colors"
                            >
                              <Edit className="w-5 h-5 inline" />
                            </button>
                            <button
                              onClick={() => deleteStaffSchedule(staff.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 className="w-5 h-5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {editingStaff.id ? 'Edit Jadwal Petugas' : 'Tambah Jadwal Petugas'}
              </h3>
              <button
                onClick={() => setEditingStaff(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); saveStaffSchedule(editingStaff); }} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
                <input
                  type="date"
                  value={editingStaff.date}
                  onChange={(e) => setEditingStaff({ ...editingStaff, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BC832A] focus:border-transparent"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <User className="w-4 h-4" /> Imam
                  </label>
                  <input
                    type="text"
                    value={editingStaff.imam || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, imam: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BC832A] focus:border-transparent"
                    placeholder="Nama imam..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Users className="w-4 h-4" /> Bilal
                  </label>
                  <input
                    type="text"
                    value={editingStaff.bilal || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, bilal: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BC832A] focus:border-transparent"
                    placeholder="Nama bilal..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Volume2 className="w-4 h-4" /> Muadzin
                  </label>
                  <input
                    type="text"
                    value={editingStaff.muadzin || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, muadzin: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BC832A] focus:border-transparent"
                    placeholder="Nama muadzin..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Mic className="w-4 h-4" /> Penceramah
                  </label>
                  <input
                    type="text"
                    value={editingStaff.penceramah || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, penceramah: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BC832A] focus:border-transparent"
                    placeholder="Nama penceramah..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catatan</label>
                <textarea
                  value={editingStaff.notes || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BC832A] focus:border-transparent"
                  rows={3}
                  placeholder="Catatan tambahan..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#BC832A] text-white rounded-lg hover:bg-[#A07220] transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
