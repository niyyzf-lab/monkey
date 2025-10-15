/**
 * 防抖搜索 Hook
 * 统一的搜索防抖逻辑，自动管理搜索状态和防抖值
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * 防抖搜索配置选项
 */
export interface DebouncedSearchOptions {
  /** 防抖延迟时间（毫秒），默认300ms */
  delay?: number;
  /** 是否在组件挂载时立即触发搜索，默认false */
  immediate?: boolean;
  /** 最小搜索长度，默认0 */
  minLength?: number;
}

/**
 * 防抖搜索返回值
 */
export interface DebouncedSearchReturn {
  /** 当前搜索查询 */
  searchQuery: string;
  /** 防抖后的搜索查询 */
  debouncedSearchQuery: string;
  /** 设置搜索查询 */
  setSearchQuery: (query: string) => void;
  /** 清除搜索查询 */
  clearSearch: () => void;
  /** 是否正在防抖中 */
  isDebouncing: boolean;
}

/**
 * 防抖搜索 Hook
 * @param initialValue 初始搜索值
 * @param options 配置选项
 * @returns 防抖搜索状态和方法
 */
export function useDebouncedSearch(
  initialValue: string = '',
  options: DebouncedSearchOptions = {}
): DebouncedSearchReturn {
  const {
    delay = 300,
    immediate = false,
    minLength = 0
  } = options;

  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialValue);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // 防抖效果
  useEffect(() => {
    // 如果查询长度小于最小长度，直接清除防抖值
    if (searchQuery.length < minLength) {
      setDebouncedSearchQuery('');
      setIsDebouncing(false);
      return;
    }

    // 如果立即执行且查询长度足够
    if (immediate && searchQuery.length >= minLength) {
      setDebouncedSearchQuery(searchQuery);
      setIsDebouncing(false);
      return;
    }

    // 设置防抖状态
    setIsDebouncing(true);

    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setIsDebouncing(false);
    }, delay);

    return () => {
      clearTimeout(timer);
      setIsDebouncing(false);
    };
  }, [searchQuery, delay, immediate, minLength]);

  // 清除搜索
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setIsDebouncing(false);
  }, []);

  return {
    searchQuery,
    debouncedSearchQuery,
    setSearchQuery,
    clearSearch,
    isDebouncing
  };
}

/**
 * 高级防抖搜索 Hook（支持更多功能）
 * @param initialValue 初始搜索值
 * @param options 配置选项
 * @returns 高级防抖搜索状态和方法
 */
export function useAdvancedDebouncedSearch(
  initialValue: string = '',
  options: DebouncedSearchOptions & {
    /** 搜索历史记录 */
    enableHistory?: boolean;
    /** 历史记录最大数量 */
    maxHistoryItems?: number;
  } = {}
) {
  const {
    enableHistory = false,
    maxHistoryItems = 10,
    ...searchOptions
  } = options;

  const searchHook = useDebouncedSearch(initialValue, searchOptions);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // 添加到搜索历史
  const addToHistory = useCallback((query: string) => {
    if (!enableHistory || !query.trim()) return;

    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== query);
      const newHistory = [query, ...filtered].slice(0, maxHistoryItems);
      return newHistory;
    });
  }, [enableHistory, maxHistoryItems]);

  // 清除历史记录
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  // 从历史记录中选择
  const selectFromHistory = useCallback((query: string) => {
    searchHook.setSearchQuery(query);
  }, [searchHook]);

  // 当防抖搜索完成时，添加到历史记录
  useEffect(() => {
    if (searchHook.debouncedSearchQuery && !searchHook.isDebouncing) {
      addToHistory(searchHook.debouncedSearchQuery);
    }
  }, [searchHook.debouncedSearchQuery, searchHook.isDebouncing, addToHistory]);

  return {
    ...searchHook,
    searchHistory,
    addToHistory,
    clearHistory,
    selectFromHistory
  };
}
