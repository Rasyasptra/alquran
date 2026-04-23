import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import JadwalPetugasPage from './pages/admin/JadwalPetugas';

function AdminApp() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />}>
        <Route path="jadwal" element={<JadwalPetugasPage />} />
        <Route index element={
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Dashboard Overview</h1>
            <p className="text-gray-600 dark:text-gray-400">Selamat datang di Panel Admin Masjid. Gunakan sidebar untuk navigasi.</p>
          </div>
        } />
      </Route>
    </Routes>
  );
}

export default AdminApp;
