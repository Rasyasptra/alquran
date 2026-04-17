import { useState, useEffect } from 'react';
import { ChevronLeft, Users, Save, Trash2, Plus, LogOut, Lock, User, Volume2, Mic } from 'lucide-react';
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

const AdminPage = ({ onBack }: { onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'staff'>('login');
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [user, setUser] = useState<any>(null);
  
  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Staff schedules
  const [staffSchedules, setStaffSchedules] = useState<StaffSchedule[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [editingStaff, setEditingStaff] = useState<StaffSchedule | null>(null);

  useEffect(() => {
    if (token) {
      loadUserData();
      setActiveTab('staff');
    }
  }, [token]);

  const loadUserData = async () => {
    try {
      const userData = await adminAuthApi.me(token!);
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user data:', error);
      handleLogout();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const response = await adminAuthApi.login(email, password);
      localStorage.setItem('admin_token', response.token);
      setToken(response.token);
      setUser(response.user);
      setActiveTab('staff');
    } catch (error: any) {
      setLoginError('Login gagal. Periksa email dan password.');
      console.error('Login error:', error);
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
    setActiveTab('login');
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
    if (token && activeTab === 'staff') {
      loadStaffSchedules();
    }
  }, [token, activeTab, selectedMonth]);

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
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;
    try {
      await adminStaffApi.delete(token, id);
      loadStaffSchedules();
    } catch (error) {
      console.error('Failed to delete staff schedule:', error);
      alert('Gagal menghapus jadwal petugas');
    }
  };

  // Login View
  if (activeTab === 'login') {
    return (
      <div className="h-full bg-[var(--islamic-background)] overflow-y-auto">
        <div className="max-w-md mx-auto p-6">
          <div className="flex items-center gap-3 mb-8">
            <button onClick={onBack} className="text-[var(--islamic-primary)]">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-[var(--islamic-text)]">Admin Login</h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#BC832A] rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#BC832A] dark:bg-gray-700 dark:text-white"
                  placeholder="admin@alquran.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#BC832A] dark:bg-gray-700 dark:text-white"
                  placeholder="••••••••"
                  required
                />
              </div>

              {loginError && (
                <div className="text-red-500 text-sm">{loginError}</div>
              )}

              <button
                type="submit"
                className="w-full bg-[#BC832A] text-white py-2 rounded-lg hover:bg-[#A07220] transition-colors"
              >
                Login
              </button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-500">
              <p>Default credentials:</p>
              <p className="font-mono">admin@alquran.com / admin123</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[var(--islamic-background)] overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-[var(--islamic-primary)]">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-[var(--islamic-text)]">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">{user?.name}</span>
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Month Filter */}
        <div className="mb-6">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Staff Schedules Tab */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#BC832A]" />
              Jadwal Petugas Masjid
            </h2>
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
              className="flex items-center gap-2 bg-[#BC832A] text-white px-4 py-2 rounded-lg hover:bg-[#A07220]"
            >
              <Plus className="w-4 h-4" />
              Tambah
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Imam</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Bilal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Muadzin</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Penceramah</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Catatan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {staffSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      Belum ada jadwal petugas untuk bulan ini
                    </td>
                  </tr>
                ) : (
                  staffSchedules.map((staff) => (
                    <tr key={staff.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {new Date(staff.date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{staff.imam || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{staff.bilal || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{staff.muadzin || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{staff.penceramah || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{staff.notes || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => setEditingStaff(staff)}
                          className="text-blue-500 hover:text-blue-700 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteStaffSchedule(staff.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Staff Modal */}
        {editingStaff && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                {editingStaff.id ? 'Edit Jadwal Petugas' : 'Tambah Jadwal Petugas'}
              </h3>
              <form onSubmit={(e) => { e.preventDefault(); saveStaffSchedule(editingStaff); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={editingStaff.date}
                    onChange={(e) => setEditingStaff({ ...editingStaff, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { field: 'imam', label: 'Imam', icon: User },
                    { field: 'bilal', label: 'Bilal', icon: Users },
                    { field: 'muadzin', label: 'Muadzin', icon: Volume2 },
                    { field: 'penceramah', label: 'Penceramah', icon: Mic },
                  ].map(({ field, label }) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                      <input
                        type="text"
                        value={(editingStaff as any)[field] || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, [field]: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                        placeholder={`Nama ${label.toLowerCase()}...`}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan</label>
                  <textarea
                    value={editingStaff.notes || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingStaff(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#BC832A] text-white rounded-lg hover:bg-[#A07220]"
                  >
                    <Save className="w-4 h-4 inline mr-2" />
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
