import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState, useCallback } from 'react';
import { fetchHoldings } from '../../api/holdings-api';
import { ApiStockHolding } from '../../types/holdings';
import { StatisticsCards } from '../../components/holdings/hold-statistics-cards';
import { VirtualizedGridNew } from '../../components/holdings/hold-virtualized-grid-new';
import { HoldingsSkeleton } from '../../components/holdings/hold-holdings-skeleton';
import { HoldingsCardSkeleton } from '../../components/holdings/hold-holdings-card-skeleton';
import { UnifiedPageHeader } from '../../components/common/unified-page-header';
import { ArrowLeftRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { FilterBarModern } from '../../components/holdings/filter-bar-modern';
import { TableView } from '../../components/holdings/hold-table-view';
import { Button } from '../../components/ui/button';
import { AlertCircle, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useScrollPauseFilter } from '../../hooks/use-scroll-pause-filter';
import { useViewPreferences } from '../../hooks/use-view-preferences';
import { useKeyboardShortcuts } from '../../hooks/use-keyboard-shortcuts';
import { useResizeSkeleton } from '../../hooks/use-resize-skeleton';
import { ViewModeDock } from '../../components/holdings/hold-view-mode-dock';
import { useStatisticsDisplayMode } from '../../hooks/use-statistics-display-mode';

export const Route = createFileRoute('/hold/')({
  component: HoldPage,
});

// 安全地解析数字，处理空值和无效值
const safeParseFloat = (value: string | undefined | null, defaultValue: number = 0): number => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

function HoldPage() {
  const [holdings, setHoldings] = useState<ApiStockHolding[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [autoRefreshKey, setAutoRefreshKey] = useState(0); // 用于重置自动刷新计时器

  // 视图偏好 - 必须在所有条件返回之前调用
  const { viewMode, setViewMode } = useViewPreferences();
  
  // 显示模式（万元切换）
  const { displayMode, setDisplayMode } = useStatisticsDisplayMode();
  
  // Resize 骨架屏（节流 300ms）
  const isResizing = useResizeSkeleton(300);
  
  // 检测容器宽度以决定是否显示 Dock
  const [showDock, setShowDock] = useState(false);
  
  useEffect(() => {
    const checkWidth = () => {
      // 使用 data 属性或 ID 来标识容器
      const container = document.querySelector('[data-holdings-container]');
      if (container) {
        const width = container.getBoundingClientRect().width;
        setShowDock(width < 600);
      }
    };
    
    checkWidth();
    window.addEventListener('resize', checkWidth);
    
    const container = document.querySelector('[data-holdings-container]');
    const resizeObserver = new ResizeObserver(checkWidth);
    if (container) {
      resizeObserver.observe(container);
    }
    
    return () => {
      window.removeEventListener('resize', checkWidth);
      resizeObserver.disconnect();
    };
  }, []);

  const loadData = useCallback(async (showRefreshing = false, isSilent = false) => {
    try {
      if (isSilent) {
        // 静默刷新：不显示任何加载状态
      } else if (showRefreshing) {
        setIsRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      setError(null);
      
      const data = await fetchHoldings();
      setHoldings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载数据失败');
    } finally {
      if (!isSilent) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 页面可见性检测
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // 自动刷新逻辑（每2.5秒）
  useEffect(() => {
    if (!isPageVisible) return;
    
    const intervalId = setInterval(() => {
      loadData(false, true); // 静默刷新
    }, 2500);
    
    return () => clearInterval(intervalId);
  }, [isPageVisible, loadData, autoRefreshKey]); // autoRefreshKey 变化时重置定时器

  const handleRefresh = useCallback(() => {
    loadData(true);
    // 重置自动刷新计时器
    setAutoRefreshKey(prev => prev + 1);
  }, [loadData]);

  // 准备数据 - 在所有 hooks 之前
  const holdingsList = holdings || [];
  const validHoldings = holdingsList.filter(h => h.stockcode && h.stockcode.trim() !== '');
  
  // 转换为组件所需的格式
  const convertedHoldings = validHoldings.map(h => ({
    stockCode: h.stockcode,
    stockName: h.stockname,
    totalQuantity: h.totalquantity,
    availableQuantity: h.availablequantity,
    costPrice: safeParseFloat(h.costprice),
    firstBuyPrice: safeParseFloat(h.firstbuyprice),
    currentPrice: safeParseFloat(h.currentprice),
    totalCost: safeParseFloat(h.totalcost),
    marketValue: safeParseFloat(h.marketvalue),
    totalProfitLoss: safeParseFloat(h.totalprofitloss),
    positionProfitLoss: safeParseFloat(h.positionprofitloss),
    todayProfitLoss: safeParseFloat(h.todayprofitloss),
    prevClosePrice: safeParseFloat(h.prevcloseprice),
    todayOpenPrice: safeParseFloat(h.todayopenprice),
    todayHighPrice: safeParseFloat(h.todayhighprice),
    todayLowPrice: safeParseFloat(h.todaylowprice),
    firstBuyDate: h.firstbuydate,
    lastUpdated: h.lastupdated,
    createdAt: h.createdat,
    sellPrice: safeParseFloat(h.shellprice),
    forceClosePrice: safeParseFloat(h.forcecloseprice),
  }));

  // 使用滚动暂停筛选 Hook - 必须在所有条件返回之前调用
  const {
    filteredHoldings,
    filterState,
    setSearchQuery,
    setProfitFilter,
    setRiskFilter,
    setSortBy,
    toggleSortOrder,
    resetFilters,
    stats,
    isScrollPaused,
    countdown, // 添加倒计时
  } = useScrollPauseFilter(convertedHoldings, {
    scrollPauseDelay: 2000, // 滚动停止2秒后恢复排序
    scrollElement: '[data-scroll-container]' // 监听真正的滚动容器
  });

  // 快捷键支持 - 必须在所有条件返回之前调用
  useKeyboardShortcuts({
    onSearch: () => {
      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      searchInput?.focus();
    },
    onRefresh: handleRefresh,
    onViewMode1: () => setViewMode('card'),
    onViewMode2: () => setViewMode('table'),
  });

  // 加载状态 - 使用精美的骨架屏
  if (isLoading) {
    return <HoldingsSkeleton />;
  }

  // 错误状态
  if (error) {
    return (
      <div className="h-full overflow-y-auto">
        <TooltipProvider>
          <UnifiedPageHeader
            title="猴の持仓"
            subtitle="查看猴子的持仓"
            tools={
              displayMode && setDisplayMode ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setDisplayMode(displayMode === 'yuan' ? 'auto' : 'yuan')}
                      className="h-9 px-2.5 flex items-center gap-1.5 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                    >
                      <ArrowLeftRight className="h-3.5 w-3.5" />
                      <span className="hidden @sm:inline text-xs">
                        {displayMode === 'yuan' ? '元' : '智能'}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{displayMode === 'yuan' ? '切换到智能模式（万/元）' : '切换到元模式'}</p>
                  </TooltipContent>
                </Tooltip>
              ) : null
            }
          />
        </TooltipProvider>

        <div className="max-w-[1800px] mx-auto p-4 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg border-2 border-destructive/30 bg-destructive/15 dark:shadow-destructive/10 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">{error}</p>
                <Button 
                  onClick={() => loadData()} 
                  variant="outline" 
                  size="sm"
                  className="mt-3"
                >
                  重新加载
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const hasHoldings = convertedHoldings.length > 0;
  
  // 计算统计数据
  const totalMarketValue = convertedHoldings.reduce((sum, h) => sum + h.marketValue, 0);
  const totalCost = convertedHoldings.reduce((sum, h) => sum + h.totalCost, 0);
  const totalProfitLoss = convertedHoldings.reduce((sum, h) => sum + h.totalProfitLoss, 0);
  const todayTotalProfitLoss = convertedHoldings.reduce((sum, h) => sum + h.todayProfitLoss, 0);

  return (
    <div className="h-full overflow-y-auto bg-background" data-scroll-container>
      {/* 顶部工具栏 - 统一标题栏（浮动） */}
      <TooltipProvider>
        <UnifiedPageHeader
          title="猴の持仓"
          subtitle="查看猴子的持仓"
            tools={
              displayMode && setDisplayMode ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setDisplayMode(displayMode === 'yuan' ? 'auto' : 'yuan')}
                      className="h-9 px-2.5 flex items-center gap-1.5 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                    >
                      <ArrowLeftRight className="h-3.5 w-3.5" />
                      <span className="hidden @sm:inline text-xs">
                        {displayMode === 'yuan' ? '元' : '智能'}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{displayMode === 'yuan' ? '切换到智能模式（万/元）' : '切换到元模式'}</p>
                  </TooltipContent>
                </Tooltip>
              ) : null
            }
            searchConfig={{
              value: filterState.searchQuery,
              onChange: setSearchQuery,
              placeholder: '搜索...',
            }}
          />
        </TooltipProvider>

      {/* 底部视图模式 Dock - 小屏显示 */}
      <AnimatePresence>
        {showDock && (
          <ViewModeDock viewMode={viewMode} onViewModeChange={setViewMode} />
        )}
      </AnimatePresence>
      
      <div className="@container max-w-[1850px] mx-auto px-4 pb-4 space-y-4" data-holdings-container>
        {/* 统计卡片 - 更紧凑 */}
        {hasHoldings && (
          <StatisticsCards 
            statistics={{
              totalStocks: convertedHoldings.length,
              totalMarketValue,
              totalCost,
              totalProfitLoss,
            }}
            todayTotalProfitLoss={todayTotalProfitLoss}
            displayMode={displayMode}
          />
        )}

        {/* 现代化筛选栏 */}
        {hasHoldings && (
          <FilterBarModern
            profitFilter={filterState.profitFilter}
            riskFilter={filterState.riskFilter}
            sortBy={filterState.sortBy}
            sortOrder={filterState.sortOrder}
            onProfitFilterChange={setProfitFilter}
            onRiskFilterChange={setRiskFilter}
            onSortByChange={setSortBy}
            onToggleSortOrder={toggleSortOrder}
            onResetFilters={resetFilters}
            stats={stats}
            filteredCount={filteredHoldings.length}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            isAutoRefreshing={isPageVisible}
            isScrollPaused={isScrollPaused}
            countdown={countdown}
          />
        )}

        {/* 持仓列表 - 根据视图模式渲染 */}
        <AnimatePresence mode="wait">
          {hasHoldings ? (
            isResizing ? (
              // Resize 时显示骨架屏（只显示卡片部分，使用实际数量）
              <HoldingsCardSkeleton count={filteredHoldings.length} />
            ) : (
              <motion.div
                key={`holdings-${viewMode}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="pb-4"
              >
                {viewMode === 'card' && (
                  <VirtualizedGridNew holdings={filteredHoldings} />
                )}
                {viewMode === 'table' && <TableView holdings={filteredHoldings} />}

                {/* 无筛选结果 */}
                {filteredHoldings.length === 0 && (
                  <div className="rounded-lg border bg-card p-12 text-center">
                    <p className="text-sm text-muted-foreground">没有符合条件的持仓</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetFilters}
                      className="mt-4"
                    >
                      重置筛选
                    </Button>
                  </div>
                )}
              </motion.div>
            )
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="rounded-lg border-2 border-border/50 bg-gradient-to-br from-card via-muted/10 to-card overflow-hidden min-h-[400px] flex items-center justify-center relative"
            >
              <div className="text-center px-8 relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, type: "spring" }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/30 mb-4"
                >
                  <Wallet className="h-8 w-8 text-muted-foreground/70" />
                </motion.div>
                <h3 className="text-base font-semibold text-foreground mb-2">暂无持仓</h3>
                <p className="text-sm text-muted-foreground">当前账户未持有任何股票</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
