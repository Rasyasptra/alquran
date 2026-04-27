import { useState } from 'react';
import IconSidebar from './components/Layout/IconSidebar';
import QuranPage from './pages/QuranPage';
import BookmarkPage from './pages/BookmarkPage';
import LastReadPage from './pages/LastReadPage';
import SettingsPage from './pages/SettingsPage';
import JadwalPage from './pages/JadwalPage';
import PrayerPage from './pages/PrayerPage';

function App() {
  const [activeSidebarItem, setActiveSidebarItem] = useState('home');

  const handleSidebarClick = (item: string) => {
    setActiveSidebarItem(item);
  };

  const renderContent = () => {
    switch (activeSidebarItem) {
      case 'bookmark':
        return <BookmarkPage />;
      case 'history':
        return <LastReadPage />;
      case 'settings':
        return <SettingsPage onBack={() => setActiveSidebarItem('home')} />;
      case 'jadwal':
        return <JadwalPage onBack={() => setActiveSidebarItem('home')} />;
      case 'prayer':
        return <PrayerPage />;
      case 'home':
      default:
        return <QuranPage />;
    }
  };

  return (
    <div className="app-layout">
      {/* Column 1: Icon Sidebar */}
      <IconSidebar
        activeItem={activeSidebarItem}
        onItemClick={handleSidebarClick}
      />

      {/* Column 2 & 3: Main Content */}
      {renderContent()}
    </div>
  );
}

export default App;