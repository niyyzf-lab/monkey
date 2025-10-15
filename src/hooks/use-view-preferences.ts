import { useState } from 'react';

export type ViewMode = 'card' | 'table' | 'compact';

interface ViewPreferences {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const STORAGE_KEY = 'holdings-view-preferences';

export function useViewPreferences(): ViewPreferences {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    // 从 localStorage 读取保存的偏好
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.viewMode || 'card';
      }
    } catch (error) {
      console.error('Failed to load view preferences:', error);
    }
    return 'card';
  });

  // 保存到 localStorage
  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ viewMode: mode }));
    } catch (error) {
      console.error('Failed to save view preferences:', error);
    }
  };

  return {
    viewMode,
    setViewMode,
  };
}



