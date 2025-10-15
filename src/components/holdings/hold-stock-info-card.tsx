import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '../ui/badge';
import { StockHolding } from '../../types/holdings';

interface StockInfoCardProps {
  holding: StockHolding;
  isProfitable: boolean;
}

// 格式化数字
const formatNumber = (num: number, decimals: number = 2): string => {
  if (num === undefined || num === null || isNaN(num)) {
    return '0.00';
  }
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export function StockInfoCard({ holding, isProfitable }: StockInfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className={`rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden ${
        isProfitable 
          ? 'bg-gradient-to-br from-red-500 via-red-500 to-red-600 dark:from-red-600 dark:via-red-600 dark:to-red-700' 
          : 'bg-gradient-to-br from-green-500 via-green-500 to-green-600 dark:from-green-600 dark:via-green-600 dark:to-green-700'
      }`}
    >
      {/* 背景装饰图标 - 多层次设计 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 主图标 - 右下角 */}
        <div className="absolute -right-8 -bottom-8 opacity-15">
          {isProfitable ? (
            <TrendingUp className="h-56 w-56 text-white" strokeWidth={1.5} />
          ) : (
            <TrendingDown className="h-56 w-56 text-white" strokeWidth={1.5} />
          )}
        </div>
        
        {/* 辅助图标 - 左上角 */}
        <div className="absolute -left-6 -top-6 opacity-8 rotate-12">
          {isProfitable ? (
            <TrendingUp className="h-32 w-32 text-white" strokeWidth={1} />
          ) : (
            <TrendingDown className="h-32 w-32 text-white" strokeWidth={1} />
          )}
        </div>
        
        {/* 辅助图标 - 右上角 */}
        <div className="absolute -right-4 top-12 opacity-8 -rotate-12">
          {isProfitable ? (
            <TrendingUp className="h-24 w-24 text-white" strokeWidth={1} />
          ) : (
            <TrendingDown className="h-24 w-24 text-white" strokeWidth={1} />
          )}
        </div>
      </div>

      {/* 顶部光泽效果 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      
      <div className="space-y-4 relative z-10">
        {/* 头部：股票名称 + 代码 */}
        <div>
          <h2 className="text-xl font-bold text-white mb-2 tracking-wide drop-shadow-sm">
            {holding.stockName}
          </h2>
          <Badge 
            variant="secondary" 
            className="font-mono text-xs bg-white/25 text-white border-white/40 hover:bg-white/35 transition-colors shadow-sm"
          >
            {holding.stockCode}
          </Badge>
        </div>

        {/* 总盈亏 - 突出显示 */}
        <div className="py-4">
          <div className="flex items-center gap-2 text-white/90 text-xs font-medium uppercase tracking-wider mb-2">
            {isProfitable ? (
              <TrendingUp className="h-4 w-4" strokeWidth={2.5} />
            ) : (
              <TrendingDown className="h-4 w-4" strokeWidth={2.5} />
            )}
            总盈亏
          </div>
          <div className="text-4xl font-bold text-white tabular-nums drop-shadow-md">
            {isProfitable ? '+' : ''}
            {formatNumber(holding.totalProfitLoss)}
          </div>
        </div>

        {/* 详细信息网格 - 无背景，直接文字 */}
        <div className="grid grid-cols-2 gap-3 text-sm pt-2">
          <div className="space-y-1">
            <div className="text-xs text-white/80 font-medium uppercase tracking-wide">
              当前价格
            </div>
            <div className="text-lg font-bold text-white tabular-nums drop-shadow-sm">
              ¥{formatNumber(holding.currentPrice)}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-white/80 font-medium uppercase tracking-wide">
              成本价
            </div>
            <div className="text-lg font-bold text-white tabular-nums drop-shadow-sm">
              ¥{formatNumber(holding.costPrice)}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-white/80 font-medium uppercase tracking-wide">
              持仓数量
            </div>
            <div className="text-lg font-bold text-white tabular-nums drop-shadow-sm">
              {formatNumber(holding.totalQuantity, 0)}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-white/80 font-medium uppercase tracking-wide">
              市值
            </div>
            <div className="text-lg font-bold text-white tabular-nums drop-shadow-sm">
              ¥{formatNumber(holding.marketValue)}
            </div>
          </div>
        </div>
      </div>

      {/* 底部装饰线 */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </motion.div>
  );
}

