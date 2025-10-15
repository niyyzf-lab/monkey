import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../ui/button';
import { X } from 'lucide-react';
import { FilterSegments } from './FilterSegments';
import { QuickPresets } from './QuickPresets';
import { ProfitFilter, RiskFilter } from '../../../hooks/use-holdings-filter';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profitFilter: ProfitFilter;
  riskFilter: RiskFilter;
  onProfitFilterChange: (filter: ProfitFilter) => void;
  onRiskFilterChange: (filter: RiskFilter) => void;
  onResetFilters: () => void;
  stats: {
    total: number;
    profitable: number;
    losing: number;
    nearStop: number;
    nearProfit: number;
  };
}

export function MobileDrawer({
  isOpen,
  onClose,
  profitFilter,
  riskFilter,
  onProfitFilterChange,
  onRiskFilterChange,
  onResetFilters,
  stats,
}: MobileDrawerProps) {
  const hasActiveFilters = profitFilter !== 'all' || riskFilter !== 'all';

  const handleApplyPreset = (newProfitFilter: ProfitFilter, newRiskFilter: RiskFilter) => {
    onProfitFilterChange(newProfitFilter);
    onRiskFilterChange(newRiskFilter);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* 抽屉内容 */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-xl border-t border-border/60 rounded-t-2xl shadow-2xl"
          >
            {/* 拖拽指示器 */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
            </div>
            
            {/* 头部 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
              <h3 className="text-lg font-semibold">筛选条件</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* 内容区域 */}
            <div className="max-h-[70vh] overflow-y-auto">
              <div className="p-4 space-y-6">
                {/* 快速预设 */}
                <QuickPresets
                  onApplyPreset={handleApplyPreset}
                  stats={stats}
                  currentProfitFilter={profitFilter}
                  currentRiskFilter={riskFilter}
                />
                
                {/* 详细筛选 */}
                <FilterSegments
                  profitFilter={profitFilter}
                  riskFilter={riskFilter}
                  onProfitFilterChange={onProfitFilterChange}
                  onRiskFilterChange={onRiskFilterChange}
                  stats={stats}
                />
              </div>
            </div>
            
            {/* 底部操作栏 */}
            <div className="flex items-center justify-between gap-3 p-4 border-t border-border/30 bg-background/60">
              <div className="text-sm text-muted-foreground">
                已筛选 <span className="font-semibold text-foreground">{stats.total}</span> 项
              </div>
              
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onResetFilters();
                      onClose();
                    }}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    重置
                  </Button>
                )}
                
                <Button
                  onClick={onClose}
                  className="px-6"
                >
                  完成
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
