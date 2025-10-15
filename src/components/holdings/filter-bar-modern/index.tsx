import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { ArrowUp, ArrowDown, ChevronUp, ChevronDown, Filter, Settings2, X } from 'lucide-react';
import { MobileDrawer } from './MobileDrawer';
import {
  ProfitFilter,
  RiskFilter,
  SortBy,
  SortOrder,
} from '../../../hooks/use-holdings-filter';

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
}

const sortOptions: { value: SortBy; label: string; shortLabel?: string }[] = [
  { value: 'profitRate', label: '收益率', shortLabel: '收益' },
  { value: 'marketValue', label: '市值', shortLabel: '市值' },
  { value: 'todayPL', label: '今日盈亏', shortLabel: '今日' },
  { value: 'stockCode', label: '代码', shortLabel: '代码' },
  { value: 'holdingDays', label: '持仓天数', shortLabel: '天数' },
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
}: FilterBarModernProps) {
  const hasActiveFilters = profitFilter !== 'all' || riskFilter !== 'all';
  
  // 折叠状态管理
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('filterBarModernCollapsed');
    return saved === 'true';
  });
  
  // 移动端抽屉状态
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  // 持久化折叠状态
  useEffect(() => {
    localStorage.setItem('filterBarModernCollapsed', String(isCollapsed));
  }, [isCollapsed]);


  // 获取排序标签
  const getSortLabel = (short = false) => {
    const option = sortOptions.find(opt => opt.value === sortBy);
    return short ? (option?.shortLabel || option?.label) : option?.label || '收益率';
  };

  // 获取筛选摘要
  const getFilterSummary = () => {
    const parts: string[] = [];
    if (profitFilter === 'profit') parts.push('盈利');
    if (profitFilter === 'loss') parts.push('亏损');
    if (riskFilter === 'nearStop') parts.push('止损');
    if (riskFilter === 'nearProfit') parts.push('止盈');
    return parts.length > 0 ? parts.join(' · ') : '全部';
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="backdrop-blur-md bg-background/80 border border-border/50 rounded-lg overflow-hidden"
      >
        {/* 折叠时的简化栏 */}
        {isCollapsed && (
          <div className="flex items-center justify-between gap-3 py-2 px-4">
            <div className="flex items-center gap-2 flex-1 min-w-0 text-sm">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">筛选:</span>
              <span className="font-medium text-foreground">{getFilterSummary()}</span>
              <span className="text-muted-foreground">·</span>
              <span className="font-medium text-foreground">{getSortLabel(true)}</span>
              {sortOrder === 'asc' ? 
                <ArrowUp className="h-3 w-3 text-muted-foreground" /> : 
                <ArrowDown className="h-3 w-3 text-muted-foreground" />
              }
              <span className="text-muted-foreground">·</span>
              <span className="font-semibold text-foreground">{filteredCount}</span>
              <span className="text-muted-foreground">/ {stats.total}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(false)}
              className="h-6 px-1.5 shrink-0"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* 完整的筛选栏 */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* 移动端：简化单行布局 */}
              <div className="block @md:hidden">
                <div className="flex items-center justify-between gap-2 py-2 px-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setShowMobileDrawer(true)}
                      className="h-8 px-3 text-sm bg-secondary/40 hover:bg-secondary/60"
                    >
                      <Settings2 className="h-3.5 w-3.5 mr-1.5" />
                      筛选
                      {hasActiveFilters && (
                        <div className="ml-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
                      )}
                    </Button>
                    
                    <span className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{filteredCount}</span>/{stats.total}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">{getSortLabel(true)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onToggleSortOrder}
                      className="h-7 px-1.5"
                    >
                      {sortOrder === 'asc' ? 
                        <ArrowUp className="h-3.5 w-3.5" /> : 
                        <ArrowDown className="h-3.5 w-3.5" />
                      }
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCollapsed(true)}
                      className="h-7 px-1.5"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* 桌面端：单行布局 */}
              <div className="hidden @md:block">
                <div className="flex items-center justify-between gap-3 py-2.5 px-4">
                  {/* 左侧：筛选器组 */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* 盈亏筛选 - 简化分段控制器 */}
                    <div className="relative flex bg-secondary/40 rounded-md p-0.5">
                      <motion.div
                        className="absolute inset-y-0.5 bg-background/90 rounded-sm shadow-sm"
                        layoutId="profit-segment-bg"
                        initial={false}
                        animate={{
                          x: profitFilter === 'all' ? '0%' : profitFilter === 'profit' ? '33.33%' : '66.66%',
                          width: '33.33%',
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                      
                      <button
                        onClick={() => onProfitFilterChange('all')}
                        className={`relative z-10 flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium transition-colors duration-150 rounded-sm ${
                          profitFilter === 'all' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'
                        }`}
                      >
                        全部
                        <span className="text-xs bg-muted/50 text-muted-foreground px-1 py-0 rounded">{stats.total}</span>
                      </button>
                      <button
                        onClick={() => onProfitFilterChange('profit')}
                        className={`relative z-10 flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium transition-colors duration-150 rounded-sm ${
                          profitFilter === 'profit' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'
                        }`}
                      >
                        盈利
                        <span className={`text-xs px-1 py-0 rounded ${
                          profitFilter === 'profit' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-950/80 dark:text-green-400'
                            : 'bg-muted/50 text-muted-foreground'
                        }`}>{stats.profitable}</span>
                      </button>
                      <button
                        onClick={() => onProfitFilterChange('loss')}
                        className={`relative z-10 flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium transition-colors duration-150 rounded-sm ${
                          profitFilter === 'loss' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'
                        }`}
                      >
                        亏损
                        <span className={`text-xs px-1 py-0 rounded ${
                          profitFilter === 'loss' 
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-400'
                            : 'bg-muted/50 text-muted-foreground'
                        }`}>{stats.losing}</span>
                      </button>
                    </div>

                    {/* 分隔线 */}
                    <div className="h-4 w-px bg-border/60" />

                    {/* 风险筛选 */}
                    {(stats.nearStop > 0 || stats.nearProfit > 0) && (
                      <>
                        <div className="flex items-center gap-2">
                          {stats.nearStop > 0 && (
                            <Button
                              variant={riskFilter === 'nearStop' ? 'secondary' : 'ghost'}
                              size="sm"
                              onClick={() => onRiskFilterChange(riskFilter === 'nearStop' ? 'all' : 'nearStop')}
                              className={`h-7 px-2.5 text-sm ${
                                riskFilter === 'nearStop' 
                                  ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                                  : 'hover:bg-secondary/50'
                              }`}
                            >
                              止损
                              <span className={`ml-1 text-xs px-1 py-0 rounded ${
                                riskFilter === 'nearStop'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-400'
                                  : 'bg-muted/50 text-muted-foreground'
                              }`}>{stats.nearStop}</span>
                            </Button>
                          )}
                          {stats.nearProfit > 0 && (
                            <Button
                              variant={riskFilter === 'nearProfit' ? 'secondary' : 'ghost'}
                              size="sm"
                              onClick={() => onRiskFilterChange(riskFilter === 'nearProfit' ? 'all' : 'nearProfit')}
                              className={`h-7 px-2.5 text-sm ${
                                riskFilter === 'nearProfit' 
                                  ? 'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400'
                                  : 'hover:bg-secondary/50'
                              }`}
                            >
                              止盈
                              <span className={`ml-1 text-xs px-1 py-0 rounded ${
                                riskFilter === 'nearProfit'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-950/80 dark:text-green-400'
                                  : 'bg-muted/50 text-muted-foreground'
                              }`}>{stats.nearProfit}</span>
                            </Button>
                          )}
                        </div>
                        <div className="h-3 w-px bg-border/50" />
                      </>
                    )}

                    {/* 重置按钮 */}
                    <AnimatePresence>
                      {hasActiveFilters && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={onResetFilters}
                            className="h-7 px-2.5 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-3 w-3 mr-1" />
                            重置
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 右侧：排序 + 统计 + 操作 */}
                  <div className="flex items-center gap-2">
                    {/* 统计信息 - 简化 */}
                    <span className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{filteredCount}</span>/{stats.total}
                    </span>

                    {/* 分隔线 */}
                    <div className="h-3 w-px bg-border/50" />

                    {/* 排序选择 - 简化 */}
                    <div className="flex items-center gap-0.5">
                      {sortOptions.slice(0, 3).map(option => (
                        <Button
                          key={option.value}
                          variant={sortBy === option.value ? 'secondary' : 'ghost'}
                          size="sm"
                          onClick={() => onSortByChange(option.value)}
                          className={`h-7 px-2.5 text-sm ${
                            sortBy === option.value 
                              ? 'bg-primary/15 text-primary' 
                              : 'hover:bg-secondary/50'
                          }`}
                        >
                          {option.shortLabel || option.label}
                        </Button>
                      ))}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleSortOrder}
                        className="h-7 px-1.5 hover:bg-secondary/50"
                        title={sortOrder === 'asc' ? '升序' : '降序'}
                      >
                        {sortOrder === 'asc' ? 
                          <ArrowUp className="h-3.5 w-3.5" /> : 
                          <ArrowDown className="h-3.5 w-3.5" />
                        }
                      </Button>
                    </div>

                    {/* 分隔线 */}
                    <div className="h-3 w-px bg-border/50" />

                    {/* 折叠按钮 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCollapsed(true)}
                      className="h-7 px-1.5"
                      title="折叠筛选栏"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 移动端抽屉 */}
      <MobileDrawer
        isOpen={showMobileDrawer}
        onClose={() => setShowMobileDrawer(false)}
        profitFilter={profitFilter}
        riskFilter={riskFilter}
        onProfitFilterChange={onProfitFilterChange}
        onRiskFilterChange={onRiskFilterChange}
        onResetFilters={onResetFilters}
        stats={stats}
      />
    </>
  );
}
