import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ArrowUp, ArrowDown, Filter, X, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import {
  ProfitFilter,
  RiskFilter,
  SortBy,
  SortOrder,
} from '../../hooks/use-holdings-filter';

interface FilterBarProps {
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

const sortOptions: { value: SortBy; label: string }[] = [
  { value: 'profitRate', label: '收益率' },
  { value: 'marketValue', label: '市值' },
  { value: 'todayPL', label: '今日盈亏' },
  { value: 'stockCode', label: '代码' },
  { value: 'holdingDays', label: '持仓天数' },
];

export function FilterBar({
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
}: FilterBarProps) {
  const hasActiveFilters =
    profitFilter !== 'all' || riskFilter !== 'all';

  // 折叠状态管理，从 localStorage 读取初始值
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('filterBarCollapsed');
    return saved === 'true';
  });
  
  // 下拉菜单状态
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // 持久化折叠状态
  useEffect(() => {
    localStorage.setItem('filterBarCollapsed', String(isCollapsed));
  }, [isCollapsed]);

  // 获取排序标签
  const getSortLabel = () => {
    const option = sortOptions.find(opt => opt.value === sortBy);
    return option?.label || '收益率';
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
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg bg-secondary/40 border border-border/60 overflow-hidden relative"
    >
      {/* 顶部渐变高光 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {/* 折叠时的简化栏 */}
      {isCollapsed && (
        <div className="flex items-center justify-between gap-4 py-2 px-4 bg-secondary/50">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">
              筛选: <span className="font-medium text-foreground">{getFilterSummary()}</span>
            </span>
            <div className="h-3 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
            <span className="text-xs text-muted-foreground">
              排序: <span className="font-medium text-foreground">{getSortLabel()}</span>
            </span>
            <div className="h-3 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
            <span className="text-xs">
              <span className="font-semibold text-foreground">{filteredCount}</span>
              <span className="text-muted-foreground"> / {stats.total}</span>
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(false)}
            className="h-6 px-2 shrink-0"
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
            {/* 小屏：紧凑单行布局 */}
            <div className="@container block @md:hidden relative">
              <div className="flex items-center justify-between gap-2 py-2.5 px-4">
                {/* 左侧：筛选按钮 */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className="h-7 px-2.5 text-xs"
                  >
                    <Settings2 className="h-3.5 w-3.5 mr-1.5" />
                    筛选 {hasActiveFilters && <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[10px] bg-primary/15">{filteredCount}</Badge>}
                  </Button>
                  
                  {/* 下拉菜单 */}
                  <AnimatePresence>
                    {showFilterMenu && (
                      <>
                        {/* 遮罩层 */}
                        <div 
                          className="fixed inset-0 z-[100]"
                          onClick={() => setShowFilterMenu(false)}
                        />
                        
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 top-full mt-2 w-72 rounded-lg border-2 border-border/80 bg-popover backdrop-blur-sm shadow-2xl z-[101] overflow-hidden max-h-[calc(100vh-200px)] overflow-y-auto"
                        >
                          <div className="p-3 space-y-3">
                            {/* 盈亏筛选 */}
                            <div>
                              <div className="text-xs text-muted-foreground mb-2">盈亏状态</div>
                              <div className="flex items-center gap-1.5">
                                <Button
                                  variant={profitFilter === 'all' ? 'secondary' : 'ghost'}
                                  size="sm"
                                  onClick={() => onProfitFilterChange('all')}
                                  className={`h-7 px-2.5 text-xs flex-1 ${profitFilter === 'all' ? 'bg-primary/15 border-primary/40' : ''}`}
                                >
                                  全部 <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[10px]">{stats.total}</Badge>
                                </Button>
                                <Button
                                  variant={profitFilter === 'profit' ? 'secondary' : 'ghost'}
                                  size="sm"
                                  onClick={() => onProfitFilterChange('profit')}
                                  className={`h-7 px-2.5 text-xs flex-1 ${profitFilter === 'profit' ? 'bg-primary/15 border-primary/40' : ''}`}
                                >
                                  盈利 <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[10px] bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-400">{stats.profitable}</Badge>
                                </Button>
                                <Button
                                  variant={profitFilter === 'loss' ? 'secondary' : 'ghost'}
                                  size="sm"
                                  onClick={() => onProfitFilterChange('loss')}
                                  className={`h-7 px-2.5 text-xs flex-1 ${profitFilter === 'loss' ? 'bg-primary/15 border-primary/40' : ''}`}
                                >
                                  亏损 <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[10px] bg-green-100 text-green-700 dark:bg-green-950/80 dark:text-green-400">{stats.losing}</Badge>
                                </Button>
                              </div>
                            </div>

                            {/* 风险筛选 */}
                            {(stats.nearStop > 0 || stats.nearProfit > 0) && (
                              <div>
                                <div className="text-xs text-muted-foreground mb-2">风险提示</div>
                                <div className="flex items-center gap-1.5">
                                  {stats.nearStop > 0 && (
                                    <Button
                                      variant={riskFilter === 'nearStop' ? 'secondary' : 'ghost'}
                                      size="sm"
                                      onClick={() => onRiskFilterChange('nearStop')}
                                      className={`h-7 px-2.5 text-xs flex-1 ${riskFilter === 'nearStop' ? 'bg-primary/15 border-primary/40' : ''}`}
                                    >
                                      止损 <Badge variant="destructive" className="ml-1.5 px-1.5 py-0 text-[10px]">{stats.nearStop}</Badge>
                                    </Button>
                                  )}
                                  {stats.nearProfit > 0 && (
                                    <Button
                                      variant={riskFilter === 'nearProfit' ? 'secondary' : 'ghost'}
                                      size="sm"
                                      onClick={() => onRiskFilterChange('nearProfit')}
                                      className={`h-7 px-2.5 text-xs flex-1 ${riskFilter === 'nearProfit' ? 'bg-primary/15 border-primary/40' : ''}`}
                                    >
                                      止盈 <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[10px] bg-green-100 text-green-700 dark:bg-green-950/80 dark:text-green-400">{stats.nearProfit}</Badge>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* 排序选项 */}
                            <div>
                              <div className="text-xs text-muted-foreground mb-2">排序方式</div>
                              <div className="grid grid-cols-2 gap-1.5">
                                {sortOptions.map(option => (
                                  <Button
                                    key={option.value}
                                    variant={sortBy === option.value ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => onSortByChange(option.value)}
                                    className={`h-7 px-2.5 text-xs justify-start ${sortBy === option.value ? 'bg-primary/15 border-primary/40' : ''}`}
                                  >
                                    {option.label}
                                  </Button>
                                ))}
                              </div>
                            </div>

                            {/* 重置按钮 */}
                            {hasActiveFilters && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  onResetFilters();
                                  setShowFilterMenu(false);
                                }}
                                className="h-7 w-full text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              >
                                <X className="h-3.5 w-3.5 mr-1" />
                                重置筛选
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* 右侧：排序方向和结果 */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{filteredCount}</span> / {stats.total}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleSortOrder}
                    className="h-7 px-2 hover:bg-accent"
                    title={sortOrder === 'asc' ? '升序' : '降序'}
                  >
                    {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCollapsed(true)}
                    className="h-7 px-2"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* 大屏：原布局 */}
            <div className="hidden @md:block">
            <div className="flex items-center justify-between gap-2 @xs:gap-3 @md:gap-4 flex-wrap py-2.5 px-4">
              {/* 左侧：筛选器 */}
              <div className="flex items-center gap-2 @xs:gap-2.5 @md:gap-3 flex-wrap">
                {/* 盈亏筛选 */}
                <div className="flex items-center gap-1">
                  <Button
                    variant={profitFilter === 'all' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => onProfitFilterChange('all')}
                    className={`h-7 px-2 @xs:px-2.5 text-xs ${profitFilter === 'all' ? 'bg-primary/15 border-primary/40' : 'hover:bg-accent hover:border-border'}`}
                  >
                    全部 <Badge variant="secondary" className="ml-1 @xs:ml-1.5 px-1.5 py-0 text-[10px]">{stats.total}</Badge>
                  </Button>
                  <Button
                    variant={profitFilter === 'profit' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => onProfitFilterChange('profit')}
                    className={`h-7 px-2 @xs:px-2.5 text-xs ${profitFilter === 'profit' ? 'bg-primary/15 border-primary/40' : 'hover:bg-accent hover:border-border'}`}
                  >
                    盈利 <Badge variant="secondary" className="ml-1 @xs:ml-1.5 px-1.5 py-0 text-[10px] bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-400">{stats.profitable}</Badge>
                  </Button>
                  <Button
                    variant={profitFilter === 'loss' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => onProfitFilterChange('loss')}
                    className={`h-7 px-2 @xs:px-2.5 text-xs ${profitFilter === 'loss' ? 'bg-primary/15 border-primary/40' : 'hover:bg-accent hover:border-border'}`}
                  >
                    亏损 <Badge variant="secondary" className="ml-1 @xs:ml-1.5 px-1.5 py-0 text-[10px] bg-green-100 text-green-700 dark:bg-green-950/80 dark:text-green-400">{stats.losing}</Badge>
                  </Button>
                </div>

                {/* 短分隔线 */}
                <div className="h-3 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

                {/* 风险筛选 */}
                <div className="flex items-center gap-1">
                  {stats.nearStop > 0 && (
                    <Button
                      variant={riskFilter === 'nearStop' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => onRiskFilterChange('nearStop')}
                      className={`h-7 px-2 @xs:px-2.5 text-xs ${riskFilter === 'nearStop' ? 'bg-primary/15 border-primary/40' : 'hover:bg-accent hover:border-border'}`}
                    >
                      止损 <Badge variant="destructive" className="ml-1 @xs:ml-1.5 px-1.5 py-0 text-[10px]">{stats.nearStop}</Badge>
                    </Button>
                  )}
                  {stats.nearProfit > 0 && (
                    <Button
                      variant={riskFilter === 'nearProfit' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => onRiskFilterChange('nearProfit')}
                      className={`h-7 px-2 @xs:px-2.5 text-xs ${riskFilter === 'nearProfit' ? 'bg-primary/15 border-primary/40' : 'hover:bg-accent hover:border-border'}`}
                    >
                      止盈 <Badge variant="secondary" className="ml-1 @xs:ml-1.5 px-1.5 py-0 text-[10px] bg-green-100 text-green-700 dark:bg-green-950/80 dark:text-green-400">{stats.nearProfit}</Badge>
                    </Button>
                  )}
                </div>

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
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        重置
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 右侧：排序 + 结果计数 + 折叠按钮 */}
              <div className="flex items-center gap-2 @xs:gap-2.5 @md:gap-3">
                {/* 结果计数 */}
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{filteredCount}</span> / {stats.total}
                </div>

                {/* 短分隔线 */}
                <div className="h-3 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

                {/* 排序选择 */}
                <div className="flex items-center gap-1">
                  {sortOptions.slice(0, 2).map(option => (
                    <Button
                      key={option.value}
                      variant={sortBy === option.value ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => onSortByChange(option.value)}
                      className={`h-7 px-2 @xs:px-2.5 text-xs ${sortBy === option.value ? 'bg-primary/15 border-primary/40' : 'hover:bg-accent hover:border-border'}`}
                    >
                      {option.label}
                    </Button>
                  ))}
                  {sortOptions.slice(2).map(option => (
                    <Button
                      key={option.value}
                      variant={sortBy === option.value ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => onSortByChange(option.value)}
                      className={`hidden @sm:flex h-7 px-2 @xs:px-2.5 text-xs ${sortBy === option.value ? 'bg-primary/15 border-primary/40' : 'hover:bg-accent hover:border-border'}`}
                    >
                      {option.label}
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleSortOrder}
                    className="h-7 px-2 hover:bg-accent"
                    title={sortOrder === 'asc' ? '升序' : '降序'}
                  >
                    {sortOrder === 'asc' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* 短分隔线 */}
                <div className="h-3 w-px bg-gradient-to-r from-transparent via-border to-transparent" />

                {/* 折叠按钮 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(true)}
                  className="h-7 px-2"
                  title="折叠筛选栏"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

