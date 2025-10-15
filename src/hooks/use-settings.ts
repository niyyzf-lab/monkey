/**
 * 设置管理 Hook
 * 提供响应式的配置状态管理
 */

import { useState, useCallback, useEffect } from 'react';
import {
  SettingsConfig,
  loadSettings,
  saveSettings,
  resetSettings as resetSettingsManager,
  exportSettings,
  importSettings,
  clearAllCache,
  getCacheStats,
} from '@/lib/settings-manager';

export interface UseSettingsReturn {
  // 配置状态
  settings: SettingsConfig;
  
  // 更新配置
  updateSettings: (updates: Partial<SettingsConfig>) => void;
  
  // 更新单个配置项
  setTheme: (theme: 'light' | 'dark') => void;
  setViewMode: (mode: 'card' | 'table') => void;
  setStatisticsDisplayMode: (mode: 'auto' | 'yuan') => void;
  setChartSettings: (chart: Partial<SettingsConfig['chart']>) => void;
  setSidebarOpen: (open: boolean) => void;
  
  // 配置管理
  resetSettings: () => void;
  exportConfig: () => string;
  importConfig: (json: string) => void;
  clearCache: () => void;
  
  // 缓存统计
  cacheStats: ReturnType<typeof getCacheStats>;
  refreshCacheStats: () => void;
  
  // 状态
  isLoading: boolean;
  error: string | null;
}

/**
 * 设置管理 Hook
 */
export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<SettingsConfig>(() => loadSettings());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState(() => getCacheStats());

  // 刷新缓存统计
  const refreshCacheStats = useCallback(() => {
    setCacheStats(getCacheStats());
  }, []);

  // 更新配置
  const updateSettings = useCallback((updates: Partial<SettingsConfig>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newSettings: SettingsConfig = {
        ...settings,
        ...updates,
        chart: {
          ...settings.chart,
          ...(updates.chart || {}),
        },
      };
      
      saveSettings(newSettings);
      setSettings(newSettings);
      refreshCacheStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '保存配置失败';
      setError(errorMessage);
      console.error('Failed to update settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [settings, refreshCacheStats]);

  // 设置主题
  const setTheme = useCallback((theme: 'light' | 'dark') => {
    updateSettings({ theme });
  }, [updateSettings]);

  // 设置视图模式
  const setViewMode = useCallback((viewMode: 'card' | 'table') => {
    updateSettings({ viewMode });
  }, [updateSettings]);

  // 设置统计显示模式
  const setStatisticsDisplayMode = useCallback((statisticsDisplayMode: 'auto' | 'yuan') => {
    updateSettings({ statisticsDisplayMode });
  }, [updateSettings]);

  // 设置图表配置
  const setChartSettings = useCallback((chart: Partial<SettingsConfig['chart']>) => {
    updateSettings({
      chart: {
        ...settings.chart,
        ...chart,
      },
    });
  }, [settings.chart, updateSettings]);

  // 设置侧边栏状态
  const setSidebarOpen = useCallback((sidebarOpen: boolean) => {
    updateSettings({ sidebarOpen });
  }, [updateSettings]);

  // 重置配置
  const resetSettings = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      resetSettingsManager();
      setSettings(loadSettings());
      refreshCacheStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '重置配置失败';
      setError(errorMessage);
      console.error('Failed to reset settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [refreshCacheStats]);

  // 导出配置
  const exportConfig = useCallback(() => {
    try {
      return exportSettings();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '导出配置失败';
      setError(errorMessage);
      console.error('Failed to export settings:', err);
      return '';
    }
  }, []);

  // 导入配置
  const importConfig = useCallback((json: string) => {
    try {
      setIsLoading(true);
      setError(null);
      importSettings(json);
      setSettings(loadSettings());
      refreshCacheStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '导入配置失败';
      setError(errorMessage);
      console.error('Failed to import settings:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [refreshCacheStats]);

  // 清空缓存
  const clearCache = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      clearAllCache();
      refreshCacheStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '清空缓存失败';
      setError(errorMessage);
      console.error('Failed to clear cache:', err);
    } finally {
      setIsLoading(false);
    }
  }, [refreshCacheStats]);

  // 监听 localStorage 变化(跨标签页同步)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (
        e.key === 'theme' ||
        e.key === 'holdings-view-preferences' ||
        e.key === 'statistics-display-mode' ||
        e.key.startsWith('chart_') ||
        e.key === 'sidebar-state'
      )) {
        setSettings(loadSettings());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    settings,
    updateSettings,
    setTheme,
    setViewMode,
    setStatisticsDisplayMode,
    setChartSettings,
    setSidebarOpen,
    resetSettings,
    exportConfig,
    importConfig,
    clearCache,
    cacheStats,
    refreshCacheStats,
    isLoading,
    error,
  };
}

