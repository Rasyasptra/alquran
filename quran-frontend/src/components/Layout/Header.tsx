import { useState } from 'react';

const Header = ({ onSearch }: { onSearch?: (query: string) => void }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header className="bg-teal-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
            <h1 className="text-xl font-bold">Al Quran</h1>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari surah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-teal-800 text-white placeholder-teal-300 px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-64"
              />
              <svg
                className="absolute right-3 top-2.5 w-5 h-5 text-teal-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
};

export default Header;
