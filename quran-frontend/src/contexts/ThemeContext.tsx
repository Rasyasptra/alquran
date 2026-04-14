import React, { createContext, useContext, useEffect, useState } from 'react';

type ReadingMode = 'normal' | 'night';

interface ReadingSettings {
  arabicFontSize: number;
  translationFontSize: number;
  lineSpacing: number;
  nightMode: boolean;
  readingMode: ReadingMode;
}

interface ThemeContextType {
  readingSettings: ReadingSettings;
  updateReadingSettings: (settings: Partial<ReadingSettings>) => void;
  resetReadingSettings: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultReadingSettings: ReadingSettings = {
  arabicFontSize: 24,
  translationFontSize: 16,
  lineSpacing: 1.8,
  nightMode: false,
  readingMode: 'normal'
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [readingSettings, setReadingSettings] = useState<ReadingSettings>(() => {
    const saved = localStorage.getItem('quran-reading-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaultReadingSettings,
          arabicFontSize:
            typeof parsed?.arabicFontSize === 'number'
              ? parsed.arabicFontSize
              : defaultReadingSettings.arabicFontSize,
          translationFontSize:
            typeof parsed?.translationFontSize === 'number'
              ? parsed.translationFontSize
              : defaultReadingSettings.translationFontSize,
          lineSpacing:
            typeof parsed?.lineSpacing === 'number'
              ? parsed.lineSpacing
              : defaultReadingSettings.lineSpacing,
          nightMode:
            typeof parsed?.nightMode === 'boolean'
              ? parsed.nightMode
              : defaultReadingSettings.nightMode,
          readingMode:
            parsed?.readingMode === 'normal' || parsed?.readingMode === 'night'
              ? parsed.readingMode
              : defaultReadingSettings.readingMode,
        };
      } catch {
        return defaultReadingSettings;
      }
    }
    return defaultReadingSettings;
  });

  useEffect(() => {
    localStorage.setItem('quran-reading-settings', JSON.stringify(readingSettings));
    
    // Apply CSS custom properties for reading settings
    const root = document.documentElement;
    root.style.setProperty('--arabic-font-size', `${readingSettings.arabicFontSize}px`);
    root.style.setProperty('--translation-font-size', `${readingSettings.translationFontSize}px`);
    root.style.setProperty('--line-spacing', readingSettings.lineSpacing.toString());
    
    // Apply night mode
    if (readingSettings.nightMode) {
      root.classList.add('night-reading');
    } else {
      root.classList.remove('night-reading');
    }
  }, [readingSettings]);

  const updateReadingSettings = (newSettings: Partial<ReadingSettings>) => {
    setReadingSettings((prev: ReadingSettings) => ({ ...prev, ...newSettings }));
  };

  const resetReadingSettings = () => {
    setReadingSettings(defaultReadingSettings);
  };

  return (
    <ThemeContext.Provider value={{ 
      readingSettings,
      updateReadingSettings,
      resetReadingSettings
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
