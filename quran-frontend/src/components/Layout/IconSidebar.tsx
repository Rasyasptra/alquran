import { Home, Bookmark, History, Settings, BookOpen, Calendar, Users } from 'lucide-react';

interface IconSidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
}

const IconSidebar = ({ activeItem = 'home', onItemClick }: IconSidebarProps) => {

  const menuItems = [
    { id: 'home', icon: Home, label: 'Beranda' },
    { id: 'bookmark', icon: Bookmark, label: 'Bookmark' },
    { id: 'history', icon: History, label: 'Riwayat' },
    { id: 'jadwal', icon: Calendar, label: 'Jadwal' },
    { id: 'prayer', icon: Users, label: 'Doa' },
    { id: 'settings', icon: Settings, label: 'Pengaturan' },
  ];

  return (
    <div className="sidebar-column">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-10 h-10 rounded-lg bg-[#BC832A] flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Navigation Icons */}
      <div className="flex flex-col gap-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              className={`sidebar-icon ${isActive ? 'active' : ''}`}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default IconSidebar;
