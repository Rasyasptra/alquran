import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import JadwalPetugasPage from './pages/admin/JadwalPetugas';
import PengaturanPage from './pages/admin/PengaturanPage';
import DashboardOverview from './pages/admin/DashboardOverview';

function AdminApp() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />}>
        <Route path="jadwal" element={<JadwalPetugasPage />} />
        <Route path="settings" element={<PengaturanPage />} />
        <Route index element={<DashboardOverview />} />
      </Route>
    </Routes>
  );
}

export default AdminApp;
