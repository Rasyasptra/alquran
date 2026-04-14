import { useState } from 'react';
import { X, BookOpen, AlignLeft, RotateCcw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
  const { readingSettings, updateReadingSettings, resetReadingSettings } = useTheme();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleFontSizeChange = (type: 'arabic' | 'translation', value: number) => {
    if (type === 'arabic') {
      updateReadingSettings({ arabicFontSize: value });
    } else {
      updateReadingSettings({ translationFontSize: value });
    }
  };

  const handleLineSpacingChange = (value: number) => {
    updateReadingSettings({ lineSpacing: value });
  };

  const handleNightModeToggle = () => {
    updateReadingSettings({ nightMode: !readingSettings.nightMode });
  };

  const handleReset = () => {
    resetReadingSettings();
    setShowResetConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--islamic-background)] shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--islamic-card-bg)] border-b border-[var(--islamic-border)] p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--islamic-text)]">Pengaturan</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[var(--islamic-text)]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Reading Experience */}
          <div className="bg-[var(--islamic-card-bg)] rounded-2xl border border-[var(--islamic-border)] p-6">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-5 h-5" />
              <h3 className="text-lg font-semibold text-[var(--islamic-text)]">Pengalaman Membaca</h3>
            </div>

            <div className="space-y-6">
              {/* Arabic Font Size */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-[var(--islamic-text)]">Ukuran Font Arab</p>
                    <p className="text-sm text-[var(--islamic-text-muted)]">Atur ukuran teks Arab</p>
                  </div>
                  <span className="text-sm font-medium text-[var(--islamic-accent)]">
                    {readingSettings.arabicFontSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="40"
                  value={readingSettings.arabicFontSize}
                  onChange={(e) => handleFontSizeChange('arabic', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--islamic-accent)]"
                />
                <div className="flex justify-between text-xs text-[var(--islamic-text-muted)] mt-1">
                  <span>Kecil</span>
                  <span>Sedang</span>
                  <span>Besar</span>
                </div>
              </div>

              {/* Translation Font Size */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-[var(--islamic-text)]">Ukuran Font Terjemahan</p>
                    <p className="text-sm text-[var(--islamic-text-muted)]">Atur ukuran teks terjemahan</p>
                  </div>
                  <span className="text-sm font-medium text-[var(--islamic-accent)]">
                    {readingSettings.translationFontSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={readingSettings.translationFontSize}
                  onChange={(e) => handleFontSizeChange('translation', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--islamic-accent)]"
                />
                <div className="flex justify-between text-xs text-[var(--islamic-text-muted)] mt-1">
                  <span>Kecil</span>
                  <span>Sedang</span>
                  <span>Besar</span>
                </div>
              </div>

              {/* Line Spacing */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlignLeft className="w-4 h-4" />
                    <div>
                      <p className="font-medium text-[var(--islamic-text)]">Jarak Baris</p>
                      <p className="text-sm text-[var(--islamic-text-muted)]">Atur jarak antar baris</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-[var(--islamic-accent)]">
                    {readingSettings.lineSpacing.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1.2"
                  max="3.0"
                  step="0.1"
                  value={readingSettings.lineSpacing}
                  onChange={(e) => handleLineSpacingChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--islamic-accent)]"
                />
                <div className="flex justify-between text-xs text-[var(--islamic-text-muted)] mt-1">
                  <span>Rapat</span>
                  <span>Normal</span>
                  <span>Renggang</span>
                </div>
              </div>

              {/* Night Reading Mode */}
              <div className="border-t border-[var(--islamic-border)] pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-900 to-blue-700"></div>
                    <div>
                      <p className="font-medium text-[var(--islamic-text)]">Mode Baca Malam</p>
                      <p className="text-sm text-[var(--islamic-text-muted)]">Tema khusus untuk baca malam hari</p>
                    </div>
                  </div>
                  <button
                    onClick={handleNightModeToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      readingSettings.nightMode ? 'bg-[var(--islamic-accent)]' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        readingSettings.nightMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-[var(--islamic-card-bg)] rounded-2xl border border-[var(--islamic-border)] p-6">
            <h3 className="text-lg font-semibold text-[var(--islamic-text)] mb-4">Preview</h3>
            <div className="space-y-4">
              <div 
                className="font-arabic-display text-right"
                style={{
                  fontSize: `${readingSettings.arabicFontSize}px`,
                  lineHeight: readingSettings.lineSpacing
                }}
              >
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
              <p 
                className="text-[var(--islamic-text)]"
                style={{
                  fontSize: `${readingSettings.translationFontSize}px`,
                  lineHeight: readingSettings.lineSpacing
                }}
              >
                Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.
              </p>
            </div>
          </div>

          {/* Reset Settings */}
          <div className="bg-[var(--islamic-card-bg)] rounded-2xl border border-[var(--islamic-border)] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[var(--islamic-text)]">Reset Pengaturan</p>
                <p className="text-sm text-[var(--islamic-text-muted)]">Kembalikan ke pengaturan default</p>
              </div>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 text-red-500 border border-red-200 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Reset Pengaturan
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Apakah Anda yakin ingin mengembalikan semua pengaturan ke nilai default? 
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
                >
                  Batal
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SettingsPanel;
