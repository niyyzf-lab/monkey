/**
 * 统一的应用配置管理系统
 * 管理所有持久化的用户偏好设置
 */

import { ChartInterval, AdjustType, ChartType } from '@/hooks/use-chart-controls';
import { ViewMode } from '@/hooks/use-view-preferences';
import { StatisticsDisplayMode } from '@/hooks/use-statistics-display-mode';

/**
 * 应用配置类型定义
 */
export interface SettingsConfig {
  // 主题设置
  theme: 'light' | 'dark' | 'system';
  
  // 视图偏好
  viewMode: ViewMode;
  
  // 统计显示模式
  statisticsDisplayMode: StatisticsDisplayMode;
  
  // 图表控制
  chart: {
    interval: ChartInterval;
    chartType: ChartType;
    adjustType: AdjustType;
    showMA5: boolean;
    showMA10: boolean;
    showVolume: boolean;
  };
  
  // 侧边栏状态
  sidebarOpen: boolean;
  
  // 红绿灯位置
  trafficLightsPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * 默认配置
 */
export const defaultSettings: SettingsConfig = {
  theme: 'system',
  viewMode: 'card',
  statisticsDisplayMode: 'auto',
  chart: {
    interval: 'day',
    chartType: 'candlestick',
    adjustType: 'forward',
    showMA5: true,
    showMA10: true,
    showVolume: true,
  },
  sidebarOpen: true,
  trafficLightsPosition: 'top-left',
};

/**
 * localStorage 键名映射
 */
const STORAGE_KEYS = {
  theme: 'theme',
  viewMode: 'holdings-view-preferences',
  statisticsDisplayMode: 'statistics-display-mode',
  chartInterval: 'chart_interval',
  chartType: 'chart_chartType',
  adjustType: 'chart_adjustType',
  showMA5: 'chart_showMA5',
  showMA10: 'chart_showMA10',
  showVolume: 'chart_showVolume',
  sidebarState: 'sidebar-state',
  trafficLightsPosition: 'traffic-lights-position',
} as const;

/**
 * 获取系统主题偏好
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  
  try {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    return mediaQuery.matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/**
 * 获取有效主题(将 'system' 解析为实际主题)
 */
export function getEffectiveTheme(theme: 'light' | 'dark' | 'system'): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

/**
 * 系统主题监听器
 */
let themeMediaQuery: MediaQueryList | null = null;
let themeChangeListener: ((e: MediaQueryListEvent) => void) | null = null;

/**
 * 初始化系统主题监听器
 */
export function initThemeListener(): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  try {
    themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    themeChangeListener = () => {
      const settings = loadSettings();
      if (settings.theme === 'system') {
        // 仅当主题设置为 'system' 时才响应系统变化
        applyTheme(settings.theme);
      }
    };

    themeMediaQuery.addEventListener('change', themeChangeListener);

    // 返回清理函数
    return () => {
      if (themeMediaQuery && themeChangeListener) {
        themeMediaQuery.removeEventListener('change', themeChangeListener);
      }
    };
  } catch {
    return () => {};
  }
}

/**
 * 应用主题到 DOM
 */
function applyTheme(theme: 'light' | 'dark' | 'system'): void {
  const effectiveTheme = getEffectiveTheme(theme);
  
  if (effectiveTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * 加载所有配置
 */
export function loadSettings(): SettingsConfig {
  try {
    const settings: SettingsConfig = { ...defaultSettings };

    // 加载主题
    const theme = localStorage.getItem(STORAGE_KEYS.theme);
    if (theme === 'dark' || theme === 'light' || theme === 'system') {
      settings.theme = theme;
    }

    // 加载视图模式
    const viewModeData = localStorage.getItem(STORAGE_KEYS.viewMode);
    if (viewModeData) {
      try {
        const parsed = JSON.parse(viewModeData);
        if (parsed.viewMode === 'card' || parsed.viewMode === 'table') {
          settings.viewMode = parsed.viewMode;
        }
      } catch {
        // 忽略解析错误
      }
    }

    // 加载统计显示模式
    const displayModeData = localStorage.getItem(STORAGE_KEYS.statisticsDisplayMode);
    if (displayModeData) {
      try {
        const parsed = JSON.parse(displayModeData);
        if (parsed.displayMode === 'auto' || parsed.displayMode === 'yuan') {
          settings.statisticsDisplayMode = parsed.displayMode;
        }
      } catch {
        // 忽略解析错误
      }
    }

    // 加载图表设置
    const chartInterval = localStorage.getItem(STORAGE_KEYS.chartInterval);
    if (chartInterval) {
      settings.chart.interval = chartInterval as ChartInterval;
    }

    const chartType = localStorage.getItem(STORAGE_KEYS.chartType);
    if (chartType) {
      settings.chart.chartType = chartType as ChartType;
    }

    const adjustType = localStorage.getItem(STORAGE_KEYS.adjustType);
    if (adjustType) {
      settings.chart.adjustType = adjustType as AdjustType;
    }

    const showMA5 = localStorage.getItem(STORAGE_KEYS.showMA5);
    if (showMA5) {
      settings.chart.showMA5 = JSON.parse(showMA5);
    }

    const showMA10 = localStorage.getItem(STORAGE_KEYS.showMA10);
    if (showMA10) {
      settings.chart.showMA10 = JSON.parse(showMA10);
    }

    const showVolume = localStorage.getItem(STORAGE_KEYS.showVolume);
    if (showVolume) {
      settings.chart.showVolume = JSON.parse(showVolume);
    }

    // 加载侧边栏状态
    const sidebarState = localStorage.getItem(STORAGE_KEYS.sidebarState);
    if (sidebarState !== null) {
      settings.sidebarOpen = JSON.parse(sidebarState);
    }

    // 加载红绿灯位置
    const trafficLightsPosition = localStorage.getItem(STORAGE_KEYS.trafficLightsPosition);
    if (trafficLightsPosition === 'top-left' || trafficLightsPosition === 'top-right' || 
        trafficLightsPosition === 'bottom-left' || trafficLightsPosition === 'bottom-right') {
      settings.trafficLightsPosition = trafficLightsPosition;
    }

    return settings;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return { ...defaultSettings };
  }
}

/**
 * 保存所有配置
 */
export function saveSettings(settings: SettingsConfig): void {
  try {
    // 保存主题
    localStorage.setItem(STORAGE_KEYS.theme, settings.theme);

    // 保存视图模式
    localStorage.setItem(
      STORAGE_KEYS.viewMode,
      JSON.stringify({ viewMode: settings.viewMode })
    );

    // 保存统计显示模式
    localStorage.setItem(
      STORAGE_KEYS.statisticsDisplayMode,
      JSON.stringify({ displayMode: settings.statisticsDisplayMode })
    );

    // 保存图表设置
    localStorage.setItem(STORAGE_KEYS.chartInterval, settings.chart.interval);
    localStorage.setItem(STORAGE_KEYS.chartType, settings.chart.chartType);
    localStorage.setItem(STORAGE_KEYS.adjustType, settings.chart.adjustType);
    localStorage.setItem(STORAGE_KEYS.showMA5, JSON.stringify(settings.chart.showMA5));
    localStorage.setItem(STORAGE_KEYS.showMA10, JSON.stringify(settings.chart.showMA10));
    localStorage.setItem(STORAGE_KEYS.showVolume, JSON.stringify(settings.chart.showVolume));

    // 保存侧边栏状态
    localStorage.setItem(STORAGE_KEYS.sidebarState, JSON.stringify(settings.sidebarOpen));

    // 保存红绿灯位置
    localStorage.setItem(STORAGE_KEYS.trafficLightsPosition, settings.trafficLightsPosition);

    // 应用主题
    applyTheme(settings.theme);
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw error;
  }
}

/**
 * 重置为默认配置
 */
export function resetSettings(): void {
  saveSettings(defaultSettings);
}

/**
 * 导出配置为 JSON
 */
export function exportSettings(): string {
  const settings = loadSettings();
  return JSON.stringify(settings, null, 2);
}

/**
 * 从 JSON 导入配置
 */
export function importSettings(jsonString: string): void {
  try {
    const settings = JSON.parse(jsonString) as SettingsConfig;
    
    // 验证配置的有效性
    if (!isValidSettings(settings)) {
      throw new Error('Invalid settings format');
    }
    
    saveSettings(settings);
  } catch (error) {
    console.error('Failed to import settings:', error);
    throw error;
  }
}

/**
 * 验证配置的有效性
 */
function isValidSettings(settings: any): settings is SettingsConfig {
  if (!settings || typeof settings !== 'object') return false;
  
  // 验证必需的字段
  if (!['light', 'dark', 'system'].includes(settings.theme)) return false;
  if (!['card', 'table'].includes(settings.viewMode)) return false;
  if (!['auto', 'yuan'].includes(settings.statisticsDisplayMode)) return false;
  
  // 验证图表配置
  if (!settings.chart || typeof settings.chart !== 'object') return false;
  if (typeof settings.chart.showMA5 !== 'boolean') return false;
  if (typeof settings.chart.showMA10 !== 'boolean') return false;
  if (typeof settings.chart.showVolume !== 'boolean') return false;
  
  // 验证侧边栏状态
  if (typeof settings.sidebarOpen !== 'boolean') return false;
  
  // 验证红绿灯位置
  if (!['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(settings.trafficLightsPosition)) return false;
  
  return true;
}

/**
 * 清空所有应用缓存(包括临时状态)
 */
export function clearAllCache(): void {
  try {
    // 获取所有键
    const keys = Object.keys(localStorage);
    
    // 清除所有以特定前缀开头的键
    const prefixesToClear = [
      'header-collapsed-',
      'filterBarCollapsed',
      'pagination_',
    ];
    
    keys.forEach(key => {
      if (prefixesToClear.some(prefix => key.startsWith(prefix))) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear cache:', error);
    throw error;
  }
}

/**
 * 获取缓存统计信息
 */
export function getCacheStats(): {
  totalItems: number;
  settingsItems: number;
  temporaryItems: number;
  totalSize: number;
} {
  try {
    const keys = Object.keys(localStorage);
    const settingsKeys = Object.values(STORAGE_KEYS);
    
    const temporaryPrefixes = [
      'header-collapsed-',
      'filterBarCollapsed',
      'pagination_',
    ];
    
    const settingsItems = keys.filter(key => settingsKeys.includes(key as any)).length;
    const temporaryItems = keys.filter(key => 
      temporaryPrefixes.some(prefix => key.startsWith(prefix))
    ).length;
    
    // 计算总大小(粗略估计)
    let totalSize = 0;
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += key.length + value.length;
      }
    });
    
    return {
      totalItems: keys.length,
      settingsItems,
      temporaryItems,
      totalSize,
    };
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    return {
      totalItems: 0,
      settingsItems: 0,
      temporaryItems: 0,
      totalSize: 0,
    };
  }
}

