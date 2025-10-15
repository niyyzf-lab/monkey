import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { StockHolding } from '../types/holdings';
import { useHoldingsFilter, FilterState, ProfitFilter, RiskFilter, SortBy } from './use-holdings-filter';

interface UseScrollPauseFilterOptions {
  scrollPauseDelay?: number; // 滚动停止后多少毫秒恢复排序，默认2000ms
  scrollElement?: string; // 滚动容器的选择器，默认为页面容器
}

interface UseScrollPauseFilterResult {
  filteredHoldings: StockHolding[];
  filterState: FilterState;
  setSearchQuery: (query: string) => void;
  setProfitFilter: (filter: ProfitFilter) => void;
  setRiskFilter: (filter: RiskFilter) => void;
  setSortBy: (sortBy: SortBy) => void;
  toggleSortOrder: () => void;
  resetFilters: () => void;
  stats: {
    total: number;
    profitable: number;
    losing: number;
    nearStop: number;
    nearProfit: number;
  };
  isScrollPaused: boolean;
  lastSortedHoldings: StockHolding[];
  countdown: number; // 倒计时秒数
}

export function useScrollPauseFilter(
  holdings: StockHolding[],
  options: UseScrollPauseFilterOptions = {}
): UseScrollPauseFilterResult {
  const { 
    scrollPauseDelay = 2000, // 改为2秒
    scrollElement = '[data-scroll-container]'
  } = options;

  // 使用原始的 filter hook
  const filterResult = useHoldingsFilter(holdings);
  
  // 滚动状态
  const [isScrollPaused, setIsScrollPaused] = useState(false);
  const [countdown, setCountdown] = useState(0); // 倒计时状态
  const lastSortedHoldingsRef = useRef<StockHolding[]>([]);
  const currentFilteredHoldingsRef = useRef<StockHolding[]>([]);
  
  // 更新当前筛选结果的引用
  useEffect(() => {
    currentFilteredHoldingsRef.current = filterResult.filteredHoldings;
  }, [filterResult.filteredHoldings]);
  
  // 计时器引用
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // 滚动处理函数 - 使用防抖优化，移除依赖避免循环更新
  const handleScroll = useCallback(() => {
    // 如果当前没有暂停，开始暂停
    setIsScrollPaused(prev => {
      if (!prev) {
        // 保存当前的排序结果作为暂停期间显示的数据
        lastSortedHoldingsRef.current = [...currentFilteredHoldingsRef.current];
        return true;
      }
      return prev;
    });
    
    // 清除之前的计时器
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    // 重置倒计时
    setCountdown(0);
    
    // 设置滚动停止后的延迟恢复计时器
    scrollTimeoutRef.current = setTimeout(() => {
      // 滚动停止后，开始倒计时
      const delayInSeconds = Math.ceil(scrollPauseDelay / 1000);
      setCountdown(delayInSeconds);
      
      // 开始倒计时
      let remainingTime = delayInSeconds;
      countdownIntervalRef.current = setInterval(() => {
        remainingTime -= 1;
        setCountdown(remainingTime);
        
        if (remainingTime <= 0) {
          // 倒计时结束，恢复排序
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          setIsScrollPaused(false);
          setCountdown(0);
        }
      }, 1000);
      
    }, 150); // 150ms 无滚动后认为滚动结束
  }, [scrollPauseDelay]); // 只依赖不变的配置项

  // 监听滚动事件
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 50; // 最多重试5秒
    
    // 延迟查找元素，确保 DOM 已经渲染
    const findElementAndAddListener = () => {
      const element = document.querySelector(scrollElement) as HTMLElement;
      
      if (!element) {
        retryCount++;
        if (retryCount < maxRetries) {
          // 如果没找到，再等一会儿重试
          setTimeout(findElementAndAddListener, 100);
        } else {
          // 作为备选方案，监听 window 滚动
          window.addEventListener('scroll', handleScroll, { passive: true });
        }
        return;
      }

      // 使用被动监听器优化性能
      element.addEventListener('scroll', handleScroll, { passive: true });
    };

    // 立即尝试查找，如果没找到会自动重试
    findElementAndAddListener();
    
    return () => {
      const element = document.querySelector(scrollElement) as HTMLElement;
      if (element) {
        element.removeEventListener('scroll', handleScroll);
      }
      // 也清理 window 监听器
      window.removeEventListener('scroll', handleScroll);
      
      // 清理所有计时器
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [handleScroll, scrollElement]);

  // 当不在暂停期时，更新保存的排序结果
  useEffect(() => {
    if (!isScrollPaused) {
      lastSortedHoldingsRef.current = [...filterResult.filteredHoldings];
    }
  }, [filterResult.filteredHoldings, isScrollPaused]);

  // 计算要显示的数据 - 使用 useMemo 避免不必要的重新计算
  const displayHoldings = useMemo(() => {
    if (isScrollPaused && lastSortedHoldingsRef.current.length > 0) {
      return lastSortedHoldingsRef.current;
    }
    return filterResult.filteredHoldings;
  }, [isScrollPaused, filterResult.filteredHoldings]);

  return {
    ...filterResult,
    filteredHoldings: displayHoldings,
    isScrollPaused,
    lastSortedHoldings: lastSortedHoldingsRef.current,
    countdown, // 添加倒计时
  };
}
