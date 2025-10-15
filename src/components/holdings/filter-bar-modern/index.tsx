import { motion } from 'motion/react';
import { Button } from '../../ui/button';
import { ArrowUp, ArrowDown, Filter, X, LayoutGrid, Table2, RefreshCw } from 'lucide-react';
import { ViewMode } from '../../../hooks/use-view-preferences';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../ui/popover';
import {
  ProfitFilter,
  RiskFilter,
  SortBy,
  SortOrder,
} from '../../../hooks/use-holdings-filter';
import { useEffect, useRef, useState } from 'react';

interface FilterBarModernProps {
  profitFilter: ProfitFilter;
  riskFilter: RiskFilter;
  sortBy: SortBy;
  sortOrder: SortOrder;
  onProfitFilterChange: (filter: ProfitFilter) => void;
  onRiskFilterChange: (filter: RiskFilter) => void;
  onSortByChange: (sortBy: SortBy) => void;
  onToggleSortOrder: () => void;
  onResetFilters: () => void;
  stats: {
    total: number;
    profitable: number;
    losing: number;
    nearStop: number;
    nearProfit: number;
  };
  filteredCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  isAutoRefreshing?: boolean;
  isScrollPaused?: boolean;
  countdown?: number;
}

const sortOptions: { value: SortBy; label: string; shortLabel?: string }[] = [
  { value: 'holdingDays', label: '购入时间', shortLabel: '购入时间' },
  { value: 'todayPL', label: '今日盈亏', shortLabel: '今日收益' },
];

export function FilterBarModern({
  profitFilter,
  riskFilter,
  sortBy,
  sortOrder,
  onProfitFilterChange,
  onRiskFilterChange,
  onSortByChange,
  onToggleSortOrder,
  onResetFilters,
  stats,
  filteredCount,
  viewMode,
  onViewModeChange,
  isRefreshing,
  onRefresh,
  isAutoRefreshing = true,
  isScrollPaused = false,
  countdown = 0,
}: FilterBarModernProps) {
  const hasActiveFilters = profitFilter !== 'all' || riskFilter !== 'all';
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);

  // 监听容器宽度变化
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        // 小于 800px 时收缩,显示紧凑模式
        setIsCompact(width < 400);
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="backdrop-blur-md bg-background/80 border border-border/50 rounded-lg overflow-hidden"
    >
          <div className="flex items-center justify-between gap-2 py-1.5 px-3">
            {/* 左侧：排序快捷按钮 + 筛选 Popover */}
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              {/* 购入时间排序按钮 - 容器宽度 >= 800px 时显示 */}
              {!isCompact && (
                <Button
                  variant={sortBy === 'holdingDays' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    if (sortBy === 'holdingDays') {
                      onToggleSortOrder();
                    } else {
                      onSortByChange('holdingDays');
                    }
                  }}
                  className={`h-7 px-2.5 text-xs ${
                    sortBy === 'holdingDays' 
                      ? 'bg-primary/15 text-primary border-primary/30' 
                      : 'hover:bg-secondary/50'
                  }`}
                >
                  购入时间
                  {sortBy === 'holdingDays' && (
                    sortOrder === 'asc' ? 
                      <ArrowUp className="h-3 w-3 ml-1" /> : 
                      <ArrowDown className="h-3 w-3 ml-1" />
                  )}
                </Button>
              )}

              {/* 今日收益排序按钮 - 容器宽度 >= 800px 时显示 */}
              {!isCompact && (
                <Button
                  variant={sortBy === 'todayPL' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    if (sortBy === 'todayPL') {
                      onToggleSortOrder();
                    } else {
                      onSortByChange('todayPL');
                    }
                  }}
                  className={`h-7 px-2.5 text-xs ${
                    sortBy === 'todayPL' 
                      ? 'bg-primary/15 text-primary border-primary/30' 
                      : 'hover:bg-secondary/50'
                  }`}
                >
                  今日收益
                  {sortBy === 'todayPL' && (
                    sortOrder === 'asc' ? 
                      <ArrowUp className="h-3 w-3 ml-1" /> : 
                      <ArrowDown className="h-3 w-3 ml-1" />
                  )}
                </Button>
              )}

              {/* 筛选 + 排序 Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 px-2.5 text-xs ${hasActiveFilters ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/50'}`}
                  >
                    <Filter className="h-3 w-3 mr-1" />
                    {isCompact ? '筛选&排序' : '筛选'}
                    {hasActiveFilters && (
                      <div className="ml-1 w-1.5 h-1.5 bg-primary rounded-full" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3 bg-popover/98 backdrop-blur-sm" align="start">
                  {/* 排序方式 - 仅在紧凑模式显示 */}
                  {isCompact && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-muted-foreground mb-2">排序方式</div>
                      <div className="flex flex-col gap-1">
                        {sortOptions.map(option => (
                          <button
                            key={option.value}
                            onClick={() => {
                              if (sortBy === option.value) {
                                onToggleSortOrder();
                              } else {
                                onSortByChange(option.value);
                              }
                            }}
                            className={`px-2.5 py-1.5 text-sm rounded-md text-left transition-all flex items-center justify-between ${
                              sortBy === option.value
                                ? 'bg-primary/15 text-primary font-medium'
                                : 'bg-secondary/20 hover:bg-secondary/50 text-muted-foreground'
                            }`}
                          >
                            <span>{option.label}</span>
                            {sortBy === option.value && (
                              sortOrder === 'asc' ? 
                                <ArrowUp className="h-3 w-3" /> : 
                                <ArrowDown className="h-3 w-3" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 分隔线 - 仅在紧凑模式显示 */}
                  {isCompact && (
                    <div className="mb-3 border-t border-border/50" />
                  )}

                  {/* 盈亏筛选 */}
                  <div className="mb-3">
                    <div className="text-xs font-medium text-muted-foreground mb-2">盈亏筛选</div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => onProfitFilterChange('all')}
                        className={`flex-1 px-2.5 py-1.5 text-sm rounded-md transition-all ${
                          profitFilter === 'all'
                            ? 'bg-primary/15 text-primary font-medium'
                            : 'bg-secondary/40 hover:bg-secondary/60 text-muted-foreground'
                        }`}
                      >
                        全部 <span className="text-xs opacity-70">({stats.total})</span>
                      </button>
                      <button
                        onClick={() => onProfitFilterChange('profit')}
                        className={`flex-1 px-2.5 py-1.5 text-sm rounded-md transition-all ${
                          profitFilter === 'profit'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-400 font-medium'
                            : 'bg-secondary/40 hover:bg-secondary/60 text-muted-foreground'
                        }`}
                      >
                        盈利 <span className="text-xs opacity-70">({stats.profitable})</span>
                      </button>
                      <button
                        onClick={() => onProfitFilterChange('loss')}
                        className={`flex-1 px-2.5 py-1.5 text-sm rounded-md transition-all ${
                          profitFilter === 'loss'
                            ? 'bg-green-100 text-green-700 dark:bg-green-950/80 dark:text-green-400 font-medium'
                            : 'bg-secondary/40 hover:bg-secondary/60 text-muted-foreground'
                        }`}
                      >
                        亏损 <span className="text-xs opacity-70">({stats.losing})</span>
                      </button>
                    </div>
                  </div>

                  {/* 风险筛选 */}
                  {(stats.nearStop > 0 || stats.nearProfit > 0) && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-muted-foreground mb-2">风险筛选</div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onRiskFilterChange('all')}
                          className={`flex-1 px-2.5 py-1.5 text-sm rounded-md transition-all ${
                            riskFilter === 'all'
                              ? 'bg-primary/15 text-primary font-medium'
                              : 'bg-secondary/40 hover:bg-secondary/60 text-muted-foreground'
                          }`}
                        >
                          全部
                        </button>
                        {stats.nearStop > 0 && (
                          <button
                            onClick={() => onRiskFilterChange('nearStop')}
                            className={`flex-1 px-2.5 py-1.5 text-sm rounded-md transition-all ${
                              riskFilter === 'nearStop'
                                ? 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-400 font-medium'
                                : 'bg-secondary/40 hover:bg-secondary/60 text-muted-foreground'
                            }`}
                          >
                            止损 <span className="text-xs opacity-70">({stats.nearStop})</span>
                          </button>
                        )}
                        {stats.nearProfit > 0 && (
                          <button
                            onClick={() => onRiskFilterChange('nearProfit')}
                            className={`flex-1 px-2.5 py-1.5 text-sm rounded-md transition-all ${
                              riskFilter === 'nearProfit'
                                ? 'bg-green-100 text-green-700 dark:bg-green-950/80 dark:text-green-400 font-medium'
                                : 'bg-secondary/40 hover:bg-secondary/60 text-muted-foreground'
                            }`}
                          >
                            止盈 <span className="text-xs opacity-70">({stats.nearProfit})</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 重置按钮 */}
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onResetFilters}
                      className="w-full h-8 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-3.5 w-3.5 mr-1.5" />
                      重置所有筛选
                    </Button>
                  )}
                </PopoverContent>
              </Popover>

              {/* 统计信息 */}
              <span className="text-xs text-muted-foreground ml-1.5">
                <span className="font-semibold text-foreground">{filteredCount}</span>
                <span className="opacity-60">/{stats.total}</span>
              </span>
            </div>

            {/* 右侧：刷新 + 布局切换 */}
            <div className="flex items-center gap-1.5">
              {/* 刷新按钮 */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onRefresh}
                      disabled={isRefreshing}
                      className="h-7 px-2 relative hover:bg-secondary/80"
                    >
                      <motion.div
                        animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                        transition={
                          isRefreshing
                            ? { duration: 1, repeat: Infinity, ease: 'linear' }
                            : { duration: 0.3 }
                        }
                      >
                        <RefreshCw className="h-3 w-3" />
                      </motion.div>
                      {/* 自动刷新指示器 */}
                      {isAutoRefreshing && !isRefreshing && !isScrollPaused && (
                        <motion.div
                          className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full"
                          animate={{ 
                            scale: [1, 1.2, 1], 
                            opacity: [1, 0.6, 1] 
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      )}
                      {/* 滚动暂停指示器 */}
                      {isScrollPaused && (
                        <motion.div
                          className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-amber-500 rounded-full"
                          animate={{ 
                            scale: [1, 1.1, 1], 
                            opacity: [1, 0.7, 1] 
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">
                      刷新
                      {isAutoRefreshing && !isScrollPaused && (
                        <span className="block text-[10px] text-muted-foreground mt-0.5">自动更新: 每2.5秒</span>
                      )}
                      {isScrollPaused && (
                        <span className="block text-[10px] text-amber-600 mt-0.5">
                          排序已暂停 - {countdown > 0 ? `${countdown}秒后恢复` : '等待滚动停止'}
                        </span>
                      )}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* 布局切换 - 重新设计 */}
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewModeChange('card')}
                  className={`h-7 px-2 transition-all ${
                    viewMode === 'card' 
                      ? 'bg-primary/10 text-primary hover:bg-primary/15' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                  }`}
                  title="卡片视图"
                >
                  <LayoutGrid className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewModeChange('table')}
                  className={`h-7 px-2 transition-all ${
                    viewMode === 'table' 
                      ? 'bg-primary/10 text-primary hover:bg-primary/15' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                  }`}
                  title="表格视图"
                >
                  <Table2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
    </motion.div>
  );
}
