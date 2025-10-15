import { motion } from 'motion/react';
import { Badge } from '../../ui/badge';
import { ProfitFilter, RiskFilter } from '../../../hooks/use-holdings-filter';

interface FilterSegmentsProps {
  profitFilter: ProfitFilter;
  riskFilter: RiskFilter;
  onProfitFilterChange: (filter: ProfitFilter) => void;
  onRiskFilterChange: (filter: RiskFilter) => void;
  stats: {
    total: number;
    profitable: number;
    losing: number;
    nearStop: number;
    nearProfit: number;
  };
}

interface SegmentOption {
  value: string;
  label: string;
  count: number;
  variant?: 'default' | 'profit' | 'loss' | 'warning' | 'destructive';
}

export function FilterSegments({
  profitFilter,
  riskFilter,
  onProfitFilterChange,
  onRiskFilterChange,
  stats,
}: FilterSegmentsProps) {
  const profitOptions: SegmentOption[] = [
    { value: 'all', label: '全部', count: stats.total, variant: 'default' },
    { value: 'profit', label: '盈利', count: stats.profitable, variant: 'profit' },
    { value: 'loss', label: '亏损', count: stats.losing, variant: 'loss' },
  ];

  const riskOptions: SegmentOption[] = [
    ...(stats.nearStop > 0 ? [{ value: 'nearStop', label: '止损', count: stats.nearStop, variant: 'destructive' as const }] : []),
    ...(stats.nearProfit > 0 ? [{ value: 'nearProfit', label: '止盈', count: stats.nearProfit, variant: 'profit' as const }] : []),
  ];

  const SegmentedControl = ({ 
    options, 
    value, 
    onChange, 
    className = '' 
  }: {
    options: SegmentOption[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
  }) => (
    <div className={`relative flex bg-secondary/40 backdrop-blur-sm rounded-lg p-1 ${className}`}>
      {/* 背景滑块 */}
      <motion.div
        className="absolute inset-y-1 bg-background/80 backdrop-blur-sm rounded-md shadow-sm border border-border/60"
        layoutId={`segment-bg-${options[0]?.value || 'default'}`}
        initial={false}
        animate={{
          x: options.findIndex(opt => opt.value === value) * (100 / options.length) + '%',
          width: `${100 / options.length}%`,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
      
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              relative z-10 flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium
              transition-colors duration-200 rounded-md
              ${isActive 
                ? 'text-foreground' 
                : 'text-muted-foreground hover:text-foreground/80'
              }
            `}
          >
            <span className="whitespace-nowrap">{option.label}</span>
            <Badge 
              variant={isActive ? 'default' : 'secondary'}
              className={`
                px-1.5 py-0 text-xs transition-colors duration-200
                ${isActive 
                  ? getBadgeActiveClass(option.variant) 
                  : 'bg-muted/60 text-muted-foreground'
                }
              `}
            >
              {option.count}
            </Badge>
          </button>
        );
      })}
    </div>
  );

  const getBadgeActiveClass = (variant?: string) => {
    switch (variant) {
      case 'profit':
        return 'bg-green-100 text-green-700 dark:bg-green-950/80 dark:text-green-400';
      case 'loss':
        return 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-400';
      case 'destructive':
        return 'bg-destructive text-destructive-foreground';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/80 dark:text-yellow-400';
      default:
        return 'bg-primary/15 text-primary';
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 盈亏筛选 */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground font-medium">盈亏状态</div>
        <SegmentedControl
          options={profitOptions}
          value={profitFilter}
          onChange={(value) => onProfitFilterChange(value as ProfitFilter)}
        />
      </div>

      {/* 风险筛选 - 仅在有数据时显示 */}
      {riskOptions.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground font-medium">风险提示</div>
          <div className="flex gap-2">
            {riskOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  const newValue = riskFilter === option.value ? 'all' : option.value;
                  onRiskFilterChange(newValue as RiskFilter);
                }}
                className={`
                  relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200 border
                  ${riskFilter === option.value
                    ? 'bg-background/80 border-border text-foreground shadow-sm'
                    : 'bg-secondary/40 border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  }
                `}
              >
                <span>{option.label}</span>
                <Badge 
                  variant={riskFilter === option.value ? 'default' : 'secondary'}
                  className={`
                    px-1.5 py-0 text-xs
                    ${riskFilter === option.value 
                      ? getBadgeActiveClass(option.variant)
                      : 'bg-muted/60 text-muted-foreground'
                    }
                  `}
                >
                  {option.count}
                </Badge>
                
                {/* 选中状态指示器 */}
                {riskFilter === option.value && (
                  <motion.div
                    className="absolute inset-0 rounded-lg border-2 border-primary/30"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
