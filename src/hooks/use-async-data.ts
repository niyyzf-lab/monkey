/**
 * 异步数据加载 Hook
 * 统一的异步数据加载状态管理，loading、error、data 状态封装
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 异步数据状态
 */
export interface AsyncDataState<T> {
  /** 数据 */
  data: T | null;
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 是否已初始化 */
  initialized: boolean;
}

/**
 * 异步数据操作
 */
export interface AsyncDataActions<T> {
  /** 设置数据 */
  setData: (data: T | null) => void;
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void;
  /** 设置错误 */
  setError: (error: string | null) => void;
  /** 重新加载数据 */
  reload: () => Promise<void>;
  /** 重置状态 */
  reset: () => void;
}

/**
 * 异步数据 Hook 返回值
 */
export interface AsyncDataReturn<T> extends AsyncDataState<T>, AsyncDataActions<T> {
  /** 是否成功加载 */
  isSuccess: boolean;
  /** 是否失败 */
  isError: boolean;
  /** 是否为空数据 */
  isEmpty: boolean;
}

/**
 * 异步数据加载配置
 */
export interface AsyncDataOptions {
  /** 是否在组件挂载时自动加载，默认true */
  autoLoad?: boolean;
  /** 是否在错误时自动重试，默认false */
  autoRetry?: boolean;
  /** 最大重试次数，默认3 */
  maxRetries?: number;
  /** 重试延迟时间（毫秒），默认1000 */
  retryDelay?: number;
  /** 是否在数据变化时保持加载状态，默认false */
  keepLoadingOnDataChange?: boolean;
}

/**
 * 基础异步数据 Hook
 * @param asyncFunction 异步函数
 * @param options 配置选项
 * @returns 异步数据状态和操作
 */
export function useAsyncData<T>(
  asyncFunction: () => Promise<T>,
  options: AsyncDataOptions = {}
): AsyncDataReturn<T> {
  const {
    autoLoad = true,
    autoRetry = false,
    maxRetries = 3,
    retryDelay = 1000,
    keepLoadingOnDataChange = false
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  // 清理函数
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 执行异步函数
  const executeAsync = useCallback(async () => {
    if (!isMountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction();
      
      if (isMountedRef.current) {
        setData(result);
        setInitialized(true);
        retryCountRef.current = 0;
      }
    } catch (err) {
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : '未知错误';
        setError(errorMessage);
        
        // 自动重试
        if (autoRetry && retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          setTimeout(() => {
            if (isMountedRef.current) {
              executeAsync();
            }
          }, retryDelay);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [asyncFunction, autoRetry, maxRetries, retryDelay]);

  // 重新加载
  const reload = useCallback(async () => {
    retryCountRef.current = 0;
    await executeAsync();
  }, [executeAsync]);

  // 重置状态
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
    setInitialized(false);
    retryCountRef.current = 0;
  }, []);

  // 自动加载
  useEffect(() => {
    if (autoLoad && !initialized) {
      executeAsync();
    }
  }, [autoLoad, initialized, executeAsync]);

  // 数据变化时的加载状态处理
  useEffect(() => {
    if (keepLoadingOnDataChange && data !== null) {
      setLoading(false);
    }
  }, [data, keepLoadingOnDataChange]);

  // 计算状态
  const isSuccess = !loading && !error && data !== null;
  const isError = !loading && error !== null;
  const isEmpty = !loading && !error && data === null;

  return {
    data,
    loading,
    error,
    initialized,
    isSuccess,
    isError,
    isEmpty,
    setData,
    setLoading,
    setError,
    reload,
    reset
  };
}

/**
 * 高级异步数据 Hook（支持更多功能）
 * @param asyncFunction 异步函数
 * @param options 配置选项
 * @returns 高级异步数据状态和操作
 */
export function useAdvancedAsyncData<T>(
  asyncFunction: () => Promise<T>,
  options: AsyncDataOptions & {
    /** 依赖数组，当依赖变化时重新加载 */
    deps?: React.DependencyList;
    /** 是否启用缓存 */
    enableCache?: boolean;
    /** 缓存键名 */
    cacheKey?: string;
    /** 缓存过期时间（毫秒） */
    cacheExpiry?: number;
    /** 是否启用乐观更新 */
    enableOptimisticUpdate?: boolean;
  } = {}
) {
  const {
    deps = [],
    enableCache = false,
    cacheKey,
    cacheExpiry = 5 * 60 * 1000, // 5分钟
    enableOptimisticUpdate = false,
    ...asyncOptions
  } = options;

  const asyncData = useAsyncData(asyncFunction, asyncOptions);
  const cacheRef = useRef<{ data: T; timestamp: number } | null>(null);

  // 缓存逻辑
  const getCachedData = useCallback((): T | null => {
    if (!enableCache || !cacheKey) return null;
    
    const cached = cacheRef.current;
    if (cached && Date.now() - cached.timestamp < cacheExpiry) {
      return cached.data;
    }
    
    return null;
  }, [enableCache, cacheKey, cacheExpiry]);

  const setCachedData = useCallback((data: T) => {
    if (enableCache && cacheKey) {
      cacheRef.current = {
        data,
        timestamp: Date.now()
      };
    }
  }, [enableCache, cacheKey]);

  // 依赖变化时重新加载
  useEffect(() => {
    if (deps.length > 0) {
      asyncData.reload();
    }
  }, deps);

  // 缓存数据设置
  useEffect(() => {
    if (asyncData.data && enableCache) {
      setCachedData(asyncData.data);
    }
  }, [asyncData.data, enableCache, setCachedData]);

  // 乐观更新
  const optimisticUpdate = useCallback((newData: T) => {
    if (enableOptimisticUpdate) {
      asyncData.setData(newData);
    }
  }, [enableOptimisticUpdate, asyncData]);

  return {
    ...asyncData,
    optimisticUpdate,
    getCachedData
  };
}

/**
 * 多个异步数据 Hook
 * @param asyncFunctions 异步函数数组
 * @param options 配置选项
 * @returns 多个异步数据状态和操作
 */
export function useMultipleAsyncData<T extends Record<string, any>>(
  asyncFunctions: { [K in keyof T]: () => Promise<T[K]> },
  options: AsyncDataOptions = {}
) {
  const results = {} as { [K in keyof T]: AsyncDataReturn<T[K]> };

  for (const key in asyncFunctions) {
    results[key] = useAsyncData(asyncFunctions[key], options);
  }

  const allLoading = Object.values(results).some(result => result.loading);
  const hasError = Object.values(results).some(result => result.isError);
  const allSuccess = Object.values(results).every(result => result.isSuccess);

  const reloadAll = useCallback(async () => {
    await Promise.all(Object.values(results).map(result => result.reload()));
  }, [results]);

  const resetAll = useCallback(() => {
    Object.values(results).forEach(result => result.reset());
  }, [results]);

  return {
    results,
    allLoading,
    hasError,
    allSuccess,
    reloadAll,
    resetAll
  };
}
