import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Zap, TrendingUp, AlertTriangle, Star, Sparkles } from 'lucide-react';
import { ProfitFilter, RiskFilter } from '../../../hooks/use-holdings-filter';

interface QuickPresetsProps {
  onApplyPreset: (profitFilter: ProfitFilter, riskFilter: RiskFilter) => void;
  stats: {
    total: number;
    profitable: number;
    losing: number;
    nearStop: number;
    nearProfit: number;
  };
  currentProfitFilter: ProfitFilter;
  currentRiskFilter: RiskFilter;
}

interface PresetConfig {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  profitFilter: ProfitFilter;
  riskFilter: RiskFilter;
  variant: 'default' | 'profit' | 'warning' | 'destructive';
  getCount: (stats: QuickPresetsProps['stats']) => number;
}

export function QuickPresets({ 
  onApplyPreset, 
  stats, 
  currentProfitFilter, 
  currentRiskFilter 
}: QuickPresetsProps) {
  const presets: PresetConfig[] = [
    {
      id: 'high-risk',
      label: '高风险',
      description: '亏损且接近止损',
      icon: AlertTriangle,
      profitFilter: 'loss',
      riskFilter: 'nearStop',
      variant: 'profit',
      getCount: (stats) => Math.min(stats.losing, stats.nearStop),
    },
    {
      id: 'high-profit',
      label: '高收益',
      description: '盈利且表现优异',
      icon: TrendingUp,
      profitFilter: 'profit',
      riskFilter: 'all',
      variant: 'profit',
      getCount: (stats) => stats.profitable,
    },
    {
      id: 'take-profit',
      label: '止盈机会',
      description: '接近止盈目标',
      icon: Star,
      profitFilter: 'all',
      riskFilter: 'nearProfit',
      variant: 'destructive',
      getCount: (stats) => stats.nearProfit,
    },
    {
      id: 'all-positions',
      label: '全部持仓',
      description: '查看所有股票',
      icon: Sparkles,
      profitFilter: 'all',
      riskFilter: 'all',
      variant: 'default',
      getCount: (stats) => stats.total,
    },
  ];

  // 过滤掉数量为0的预设
  const availablePresets = presets.filter(preset => preset.getCount(stats) > 0);

  const isPresetActive = (preset: PresetConfig) => {
    return currentProfitFilter === preset.profitFilter && currentRiskFilter === preset.riskFilter;
  };

  const getVariantClass = (variant: string, isActive: boolean) => {
    if (isActive) {
      switch (variant) {
        case 'profit':
          return 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/50 dark:border-green-800 dark:text-green-400';
        case 'warning':
          return 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950/50 dark:border-yellow-800 dark:text-yellow-400';
        case 'destructive':
          return 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/50 dark:border-red-800 dark:text-red-400';
        default:
          return 'bg-primary/10 border-primary/30 text-primary';
      }
    }
    return 'bg-secondary/40 border-transparent text-muted-foreground hover:bg-secondary/60 hover:text-foreground';
  };

  const getIconClass = (variant: string, isActive: boolean) => {
    if (isActive) {
      switch (variant) {
        case 'profit':
          return 'text-green-600 dark:text-green-400';
        case 'warning':
          return 'text-yellow-600 dark:text-yellow-400';
        case 'destructive':
          return 'text-red-600 dark:text-red-400';
        default:
          return 'text-primary';
      }
    }
    return 'text-muted-foreground';
  };

  if (availablePresets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Zap className="h-3.5 w-3.5 text-muted-foreground" />
        <div className="text-xs text-muted-foreground font-medium">快速筛选</div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <AnimatePresence>
          {availablePresets.map((preset) => {
            const isActive = isPresetActive(preset);
            const count = preset.getCount(stats);
            const Icon = preset.icon;
            
            return (
              <motion.div
                key={preset.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => onApplyPreset(preset.profitFilter, preset.riskFilter)}
                  className={`
                    h-auto w-full p-3 flex flex-col items-start gap-2 border transition-all duration-200
                    ${getVariantClass(preset.variant, isActive)}
                  `}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${getIconClass(preset.variant, isActive)}`} />
                      <span className="text-sm font-medium">{preset.label}</span>
                    </div>
                    <Badge 
                      variant={isActive ? 'default' : 'secondary'}
                      className={`
                        px-1.5 py-0 text-xs
                        ${isActive 
                          ? (preset.variant === 'profit' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-950/80 dark:text-green-400'
                              : preset.variant === 'warning'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/80 dark:text-yellow-400'
                              : preset.variant === 'destructive'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-400'
                              : 'bg-primary/15 text-primary'
                            )
                          : 'bg-muted/60 text-muted-foreground'
                        }
                      `}
                    >
                      {count}
                    </Badge>
                  </div>
                  
                  <div className="text-xs opacity-75 text-left">
                    {preset.description}
                  </div>
                  
                  {/* 选中状态指示器 */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-lg border-2 border-primary/40"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

