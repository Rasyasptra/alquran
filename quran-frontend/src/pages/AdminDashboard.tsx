import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Shield 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/jadwal', label: 'Jadwal Petugas', icon: Users },
    { path: '/admin/settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#1a365d] text-white shadow-xl z-50">
        <div className="p-6 border-b border-[#2d3748]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#BC832A] rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Admin Masjid</h2>
              <p className="text-xs text-gray-400">Panel Kontrol</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#BC832A] text-white shadow-lg shadow-[#BC832A]/20'
                    : 'text-gray-300 hover:bg-[#2d3748] hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#2d3748] bg-[#1a365d]">
          <div className="flex items-center gap-3 mb-4 px-4">
            <div className="w-10 h-10 bg-[#2d3748] rounded-full flex items-center justify-center border border-[#BC832A]/30">
              <Shield className="w-5 h-5 text-[#BC832A]" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-bold text-sm truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;
