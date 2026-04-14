interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const tabs = [
    { id: 'surah', label: 'Surah', icon: '📖' },
    { id: 'page', label: 'Halaman', icon: '📄' },
    { id: 'juz', label: 'Juz', icon: '📚' },
    { id: 'hizb', label: 'Hizb', icon: '🔖' },
    { id: 'prayer', label: 'Sholat', icon: '🙏' },
    { id: 'mosque', label: 'Masjid', icon: '🕌' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-amber-50 border-b border-amber-200">
      <div className="container mx-auto px-4">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              type="button"
              className={`px-4 md:px-6 py-3 font-medium whitespace-nowrap transition-colors duration-200 border-b-2 ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'text-teal-700 border-transparent hover:bg-amber-100 hover:text-teal-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
