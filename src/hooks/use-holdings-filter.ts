import { useMemo, useState } from 'react';
import { StockHolding } from '../types/holdings';

export type ProfitFilter = 'all' | 'profit' | 'loss';
export type RiskFilter = 'all' | 'nearStop' | 'nearProfit';
export type SortBy = 'profitRate' | 'marketValue' | 'todayPL' | 'stockCode' | 'holdingDays';
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
  searchQuery: string;
  profitFilter: ProfitFilter;
  riskFilter: RiskFilter;
  sortBy: SortBy;
  sortOrder: SortOrder;
}

interface UseHoldingsFilterResult {
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
}

// 检测是否接近止损（当前价格低于止损价的5%以内）
const isNearStopLoss = (holding: StockHolding): boolean => {
  if (!holding.forceClosePrice || holding.forceClosePrice <= 0) return false;
  return holding.currentPrice <= holding.forceClosePrice * 1.05;
};

// 检测是否接近止盈（当前价格高于止盈价的95%以上）
const isNearTakeProfit = (holding: StockHolding): boolean => {
  if (!holding.sellPrice || holding.sellPrice <= 0) return false;
  return holding.currentPrice >= holding.sellPrice * 0.95;
};

// 计算持仓天数
const getHoldingDays = (holding: StockHolding): number => {
  if (!holding.firstBuyDate) return 0;
  const firstBuyDate = new Date(holding.firstBuyDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - firstBuyDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export function useHoldingsFilter(holdings: StockHolding[]): UseHoldingsFilterResult {
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    profitFilter: 'all',
    riskFilter: 'all',
    sortBy: 'holdingDays',
    sortOrder: 'desc',
  });

  // 计算统计数据
  const stats = useMemo(() => {
    return {
      total: holdings.length,
      profitable: holdings.filter(h => h.totalProfitLoss >= 0).length,
      losing: holdings.filter(h => h.totalProfitLoss < 0).length,
      nearStop: holdings.filter(isNearStopLoss).length,
      nearProfit: holdings.filter(isNearTakeProfit).length,
    };
  }, [holdings]);

  // 筛选和排序
  const filteredHoldings = useMemo(() => {
    let result = [...holdings];

    // 搜索过滤
    if (filterState.searchQuery.trim()) {
      const query = filterState.searchQuery.toLowerCase().trim();
      result = result.filter(
        h =>
          h.stockCode.toLowerCase().includes(query) ||
          h.stockName.toLowerCase().includes(query)
      );
    }

    // 盈亏过滤
    if (filterState.profitFilter === 'profit') {
      result = result.filter(h => h.totalProfitLoss >= 0);
    } else if (filterState.profitFilter === 'loss') {
      result = result.filter(h => h.totalProfitLoss < 0);
    }

    // 风险过滤
    if (filterState.riskFilter === 'nearStop') {
      result = result.filter(isNearStopLoss);
    } else if (filterState.riskFilter === 'nearProfit') {
      result = result.filter(isNearTakeProfit);
    }

    // 排序
    result.sort((a, b) => {
      let compareValue = 0;

      switch (filterState.sortBy) {
        case 'profitRate':
          const rateA = a.totalCost > 0 ? (a.totalProfitLoss / a.totalCost) * 100 : 0;
          const rateB = b.totalCost > 0 ? (b.totalProfitLoss / b.totalCost) * 100 : 0;
          compareValue = rateA - rateB;
          break;
        case 'marketValue':
          compareValue = a.marketValue - b.marketValue;
          break;
        case 'todayPL':
          compareValue = a.todayProfitLoss - b.todayProfitLoss;
          break;
        case 'stockCode':
          compareValue = a.stockCode.localeCompare(b.stockCode);
          break;
        case 'holdingDays':
          compareValue = getHoldingDays(a) - getHoldingDays(b);
          break;
      }

      return filterState.sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return result;
  }, [holdings, filterState]);

  return {
    filteredHoldings,
    filterState,
    setSearchQuery: (query: string) =>
      setFilterState(prev => ({ ...prev, searchQuery: query })),
    setProfitFilter: (filter: ProfitFilter) =>
      setFilterState(prev => ({ ...prev, profitFilter: filter })),
    setRiskFilter: (filter: RiskFilter) =>
      setFilterState(prev => ({ ...prev, riskFilter: filter })),
    setSortBy: (sortBy: SortBy) =>
      setFilterState(prev => ({ ...prev, sortBy })),
    toggleSortOrder: () =>
      setFilterState(prev => ({
        ...prev,
        sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
      })),
    resetFilters: () =>
      setFilterState({
        searchQuery: '',
        profitFilter: 'all',
        riskFilter: 'all',
        sortBy: 'holdingDays',
        sortOrder: 'desc',
      }),
    stats,
  };
}



