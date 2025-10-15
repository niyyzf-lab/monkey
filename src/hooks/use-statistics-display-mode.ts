import { useState } from 'react';

export type StatisticsDisplayMode = 'auto' | 'yuan';

interface StatisticsDisplayModePreferences {
  displayMode: StatisticsDisplayMode;
  setDisplayMode: (mode: StatisticsDisplayMode) => void;
}

const STORAGE_KEY = 'statistics-display-mode';

export function useStatisticsDisplayMode(): StatisticsDisplayModePreferences {
  const [displayMode, setDisplayModeState] = useState<StatisticsDisplayMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.displayMode || 'auto';
      }
    } catch (error) {
      console.error('Failed to load statistics display mode:', error);
    }
    return 'auto';
  });

  const setDisplayMode = (mode: StatisticsDisplayMode) => {
    setDisplayModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ displayMode: mode }));
    } catch (error) {
      console.error('Failed to save statistics display mode:', error);
    }
  };

  return {
    displayMode,
    setDisplayMode,
  };
}

