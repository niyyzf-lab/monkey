/**
 * 图表控制 Hook
 * 图表周期、类型、复权方式状态管理，localStorage 持久化
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * 图表时间周期类型
 */
export type ChartInterval = 'minute' | '5min' | '15min' | '30min' | '60min' | 'day' | 'week' | 'month' | 'year';

/**
 * 复权类型
 */
export type AdjustType = 'none' | 'forward' | 'backward';

/**
 * 图表显示类型
 */
export type ChartType = 'candlestick' | 'line';

/**
 * 图表控制状态
 */
export interface ChartControlsState {
  /** 时间周期 */
  interval: ChartInterval;
  /** 图表类型 */
  chartType: ChartType;
  /** 复权类型 */
  adjustType: AdjustType;
  /** 是否显示MA5 */
  showMA5: boolean;
  /** 是否显示MA10 */
  showMA10: boolean;
  /** 是否显示成交量 */
  showVolume: boolean;
}

/**
 * 图表控制操作
 */
export interface ChartControlsActions {
  /** 设置时间周期 */
  setInterval: (interval: ChartInterval) => void;
  /** 设置图表类型 */
  setChartType: (chartType: ChartType) => void;
  /** 设置复权类型 */
  setAdjustType: (adjustType: AdjustType) => void;
  /** 设置MA5显示状态 */
  setShowMA5: (show: boolean) => void;
  /** 设置MA10显示状态 */
  setShowMA10: (show: boolean) => void;
  /** 设置成交量显示状态 */
  setShowVolume: (show: boolean) => void;
  /** 重置所有设置 */
  reset: () => void;
}

/**
 * 图表控制配置
 */
export interface ChartControlsOptions {
  /** 是否启用localStorage持久化，默认true */
  enablePersistence?: boolean;
  /** localStorage键名前缀，默认'chart_' */
  storagePrefix?: string;
  /** 初始值 */
  initialValues?: Partial<ChartControlsState>;
}

/**
 * 图表控制 Hook 返回值
 */
export interface ChartControlsReturn extends ChartControlsState, ChartControlsActions {
  /** 是否已初始化 */
  initialized: boolean;
}

/**
 * 基础图表控制 Hook
 * @param options 配置选项
 * @returns 图表控制状态和操作
 */
export function useChartControls(
  options: ChartControlsOptions = {}
): ChartControlsReturn {
  const {
    enablePersistence = true,
    storagePrefix = 'chart_',
    initialValues = {}
  } = options;

  const [state, setState] = useState<ChartControlsState>(() => {
    const defaultState: ChartControlsState = {
      interval: 'day',
      chartType: 'candlestick',
      adjustType: 'forward',
      showMA5: true,
      showMA10: true,
      showVolume: true,
      ...initialValues
    };

    if (enablePersistence && typeof window !== 'undefined') {
      try {
        const savedInterval = localStorage.getItem(`${storagePrefix}interval`);
        const savedChartType = localStorage.getItem(`${storagePrefix}chartType`);
        const savedAdjustType = localStorage.getItem(`${storagePrefix}adjustType`);
        const savedShowMA5 = localStorage.getItem(`${storagePrefix}showMA5`);
        const savedShowMA10 = localStorage.getItem(`${storagePrefix}showMA10`);
        const savedShowVolume = localStorage.getItem(`${storagePrefix}showVolume`);

        return {
          interval: (savedInterval as ChartInterval) || defaultState.interval,
          chartType: (savedChartType as ChartType) || defaultState.chartType,
          adjustType: (savedAdjustType as AdjustType) || defaultState.adjustType,
          showMA5: savedShowMA5 ? JSON.parse(savedShowMA5) : defaultState.showMA5,
          showMA10: savedShowMA10 ? JSON.parse(savedShowMA10) : defaultState.showMA10,
          showVolume: savedShowVolume ? JSON.parse(savedShowVolume) : defaultState.showVolume,
        };
      } catch (error) {
        console.warn('Failed to load chart controls from localStorage:', error);
        return defaultState;
      }
    }

    return defaultState;
  });

  const [initialized, setInitialized] = useState(false);

  // 持久化到localStorage
  useEffect(() => {
    if (enablePersistence && typeof window !== 'undefined' && initialized) {
      try {
        localStorage.setItem(`${storagePrefix}interval`, state.interval);
        localStorage.setItem(`${storagePrefix}chartType`, state.chartType);
        localStorage.setItem(`${storagePrefix}adjustType`, state.adjustType);
        localStorage.setItem(`${storagePrefix}showMA5`, JSON.stringify(state.showMA5));
        localStorage.setItem(`${storagePrefix}showMA10`, JSON.stringify(state.showMA10));
        localStorage.setItem(`${storagePrefix}showVolume`, JSON.stringify(state.showVolume));
      } catch (error) {
        console.warn('Failed to save chart controls to localStorage:', error);
      }
    }
  }, [state, enablePersistence, storagePrefix, initialized]);

  // 标记为已初始化
  useEffect(() => {
    setInitialized(true);
  }, []);

  // 设置时间周期
  const setInterval = useCallback((interval: ChartInterval) => {
    setState(prev => ({ ...prev, interval }));
  }, []);

  // 设置图表类型
  const setChartType = useCallback((chartType: ChartType) => {
    setState(prev => ({ ...prev, chartType }));
  }, []);

  // 设置复权类型
  const setAdjustType = useCallback((adjustType: AdjustType) => {
    setState(prev => ({ ...prev, adjustType }));
  }, []);

  // 设置MA5显示状态
  const setShowMA5 = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showMA5: show }));
  }, []);

  // 设置MA10显示状态
  const setShowMA10 = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showMA10: show }));
  }, []);

  // 设置成交量显示状态
  const setShowVolume = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showVolume: show }));
  }, []);

  // 重置所有设置
  const reset = useCallback(() => {
    const defaultState: ChartControlsState = {
      interval: 'day',
      chartType: 'candlestick',
      adjustType: 'forward',
      showMA5: true,
      showMA10: true,
      showVolume: true,
      ...initialValues
    };
    setState(defaultState);
  }, [initialValues]);

  return {
    ...state,
    initialized,
    setInterval,
    setChartType,
    setAdjustType,
    setShowMA5,
    setShowMA10,
    setShowVolume,
    reset
  };
}

/**
 * 高级图表控制 Hook（支持更多功能）
 * @param options 配置选项
 * @returns 高级图表控制状态和操作
 */
export function useAdvancedChartControls(
  options: ChartControlsOptions & {
    /** 是否启用URL同步 */
    enableUrlSync?: boolean;
    /** URL参数名称映射 */
    urlParamNames?: {
      interval?: string;
      chartType?: string;
      adjustType?: string;
      showMA5?: string;
      showMA10?: string;
      showVolume?: string;
    };
    /** 是否启用预设配置 */
    enablePresets?: boolean;
    /** 预设配置 */
    presets?: Record<string, Partial<ChartControlsState>>;
  } = {}
) {
  const {
    enableUrlSync = false,
    urlParamNames = {
      interval: 'interval',
      chartType: 'chartType',
      adjustType: 'adjustType',
      showMA5: 'showMA5',
      showMA10: 'showMA10',
      showVolume: 'showVolume'
    },
    enablePresets = false,
    presets = {},
    ...chartOptions
  } = options;

  const chartControls = useChartControls(chartOptions);

  // URL同步
  useEffect(() => {
    if (enableUrlSync && typeof window !== 'undefined' && chartControls.initialized) {
      const url = new URL(window.location.href);
      
      // 从URL读取参数
      const urlInterval = urlParamNames.interval ? url.searchParams.get(urlParamNames.interval) : null;
      const urlChartType = urlParamNames.chartType ? url.searchParams.get(urlParamNames.chartType) : null;
      const urlAdjustType = urlParamNames.adjustType ? url.searchParams.get(urlParamNames.adjustType) : null;
      const urlShowMA5 = urlParamNames.showMA5 ? url.searchParams.get(urlParamNames.showMA5) : null;
      const urlShowMA10 = urlParamNames.showMA10 ? url.searchParams.get(urlParamNames.showMA10) : null;
      const urlShowVolume = urlParamNames.showVolume ? url.searchParams.get(urlParamNames.showVolume) : null;

      if (urlInterval) chartControls.setInterval(urlInterval as ChartInterval);
      if (urlChartType) chartControls.setChartType(urlChartType as ChartType);
      if (urlAdjustType) chartControls.setAdjustType(urlAdjustType as AdjustType);
      if (urlShowMA5) chartControls.setShowMA5(urlShowMA5 === 'true');
      if (urlShowMA10) chartControls.setShowMA10(urlShowMA10 === 'true');
      if (urlShowVolume) chartControls.setShowVolume(urlShowVolume === 'true');
    }
  }, [enableUrlSync, urlParamNames, chartControls]);

  // 同步到URL
  useEffect(() => {
    if (enableUrlSync && typeof window !== 'undefined' && chartControls.initialized) {
      const url = new URL(window.location.href);
      
      if (urlParamNames.interval) url.searchParams.set(urlParamNames.interval, chartControls.interval);
      if (urlParamNames.chartType) url.searchParams.set(urlParamNames.chartType, chartControls.chartType);
      if (urlParamNames.adjustType) url.searchParams.set(urlParamNames.adjustType, chartControls.adjustType);
      if (urlParamNames.showMA5) url.searchParams.set(urlParamNames.showMA5, chartControls.showMA5.toString());
      if (urlParamNames.showMA10) url.searchParams.set(urlParamNames.showMA10, chartControls.showMA10.toString());
      if (urlParamNames.showVolume) url.searchParams.set(urlParamNames.showVolume, chartControls.showVolume.toString());
      
      window.history.replaceState({}, '', url.toString());
    }
  }, [chartControls, enableUrlSync, urlParamNames]);

  // 预设配置
  const applyPreset = useCallback((presetName: string) => {
    const preset = presets[presetName];
    if (preset) {
      if (preset.interval) chartControls.setInterval(preset.interval);
      if (preset.chartType) chartControls.setChartType(preset.chartType);
      if (preset.adjustType) chartControls.setAdjustType(preset.adjustType);
      if (preset.showMA5 !== undefined) chartControls.setShowMA5(preset.showMA5);
      if (preset.showMA10 !== undefined) chartControls.setShowMA10(preset.showMA10);
      if (preset.showVolume !== undefined) chartControls.setShowVolume(preset.showVolume);
    }
  }, [presets, chartControls]);

  return {
    ...chartControls,
    applyPreset,
    availablePresets: Object.keys(presets)
  };
}
