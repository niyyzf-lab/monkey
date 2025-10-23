import { memo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { StockHolding } from '../../types/holdings';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, Calendar, Archive } from 'lucide-react';
import { motion } from 'motion/react';
import { navigateToHoldingDetail } from '../../lib/navigation-utils';
import FloatingText from '../FloatingText';

interface SoldCardProps {
  holding: StockHolding;
}

// 格式化数字，添加千位分隔符
const formatNumber = (num: number, decimals: number = 2): string => {
  if (num === undefined || num === null || isNaN(num)) {
    return '0.00';
  }
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// 格式化金额
const formatCurrency = (amount: number): { display: string; full: string } => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return {
      display: '0.00',
      full: '+¥0.00'
    };
  }
  
  const sign = amount >= 0 ? '+' : '';
  const full = `${sign}¥${formatNumber(amount, 2)}`;
  
  return {
    display: `${sign}${formatNumber(amount, 2)}`,
    full
  };
};

// 格式化日期
const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return dateString;
  }
};

// 计算持仓天数
const calculateHoldingDays = (firstBuyDate?: string): number => {
  if (!firstBuyDate) return 0;
  try {
    const buyDate = new Date(firstBuyDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - buyDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return 0;
  }
};

// 计算持仓时长类型
const getHoldingDurationType = (days: number): { type: string; color: string } => {
  if (days < 30) return { type: '短期', color: 'text-orange-600/50 dark:text-orange-400/50' };
  if (days < 90) return { type: '中期', color: 'text-blue-600/50 dark:text-blue-400/50' };
  return { type: '长期', color: 'text-green-600/50 dark:text-green-400/50' };
};

// 格式化错失利润的文案
const getMissedProfitText = (missedProfit: number): { text: string; color: string } => {
  if (missedProfit > 0) {
    return { 
      text: `卖早了少赚 ¥${formatNumber(missedProfit, 2)}`, 
      color: 'text-orange-600/70 dark:text-orange-400/70' 
    };
  } else if (missedProfit < 0) {
    return { 
      text: `及时止损避免损失 ¥${formatNumber(Math.abs(missedProfit), 2)}`, 
      color: 'text-blue-600/70 dark:text-blue-400/70' 
    };
  }
  return { text: '', color: '' };
};

// 使用 memo 优化渲染性能
export const SoldCard = memo(function SoldCard({ holding }: SoldCardProps) {
  const navigate = useNavigate();
  
  // 对于已清仓股票，使用已实现盈亏（realizedPnl）
  const actualProfitLoss = holding.realizedPnl || 0;
  
  // 计算实际盈亏比率（基于总买入金额）
  const totalBuyAmount = holding.totalBuyAmount || holding.totalCost || 0;
  const actualProfitLossRatio = totalBuyAmount > 0 
    ? ((actualProfitLoss / totalBuyAmount) * 100).toFixed(2)
    : '0.00';
  
  const isProfitable = actualProfitLoss >= 0;
  const profitLossFormatted = formatCurrency(actualProfitLoss);
  
  // 错失利润（可能是正值表示卖早了，负值表示卖对了）
  const missedProfit = holding.missedProfit || 0;
  const hasMissedProfit = Math.abs(missedProfit) > 0.01;

  // 计算持仓天数
  const holdingDays = calculateHoldingDays(holding.firstBuyDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{ 
        y: -2,
        transition: { duration: 0.2 }
      }}
    >
      <Card 
        className="py-0 gap-0 @container group relative cursor-pointer overflow-hidden rounded-xl border-dashed border-2 border-border/25 dark:border-border/15 bg-gradient-to-br from-card/70 via-card/60 to-card/50 dark:from-card/50 dark:via-card/40 dark:to-card/30 shadow-[0_2px_4px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.03),inset_0_0_0_1px_rgba(255,255,255,0.03)] dark:shadow-[0_2px_4px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.02)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.06),0_4px_8px_rgba(0,0,0,0.04),inset_0_0_0_1px_rgba(255,255,255,0.05)] dark:hover:shadow-[0_8px_16px_rgba(0,0,0,0.25),0_4px_8px_rgba(0,0,0,0.15),inset_0_0_0_1px_rgba(255,255,255,0.04)] transition-all duration-300 opacity-80 hover:opacity-95 hover:border-border/35 dark:hover:border-border/25"
        onClick={() => navigateToHoldingDetail(navigate, holding)}
      >
        {/* 已清仓水印 - 增强视觉效果 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-60 group-hover:opacity-80 transition-opacity duration-300">
          <Archive className="w-28 h-28 text-muted-foreground/[0.06] dark:text-muted-foreground/[0.04]" strokeWidth={1.5} />
        </div>
        
        {/* 柔和的背景渐变装饰 */}
        <div className="absolute inset-0 bg-gradient-to-tr from-muted/5 via-transparent to-muted/10 dark:from-muted/10 dark:via-transparent dark:to-muted/15 pointer-events-none z-0" />
        
        <div className="relative z-10 overflow-hidden">
          <CardHeader className="pb-2 space-y-0 px-4 pt-4 relative">
            {/* CardHeader 底部精致分隔线 */}
            <div className="absolute bottom-0 left-0 right-0 h-px">
              <div className="h-full bg-gradient-to-r from-transparent via-border/40 dark:via-border/30 to-transparent" />
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-semibold text-sm leading-tight truncate text-muted-foreground/85 dark:text-muted-foreground/80">
                    {holding.stockName}
                  </h3>
                  {/* 已清仓徽章 - 优化样式 */}
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 h-4 gap-0.5 text-muted-foreground/65 border-muted-foreground/25 bg-muted/60 shadow-sm">
                    <Archive className="h-2 w-2" />
                    已清仓
                  </Badge>
                  {holding.firstBuyDate && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 h-4 gap-0.5 text-muted-foreground/55 border-muted-foreground/20 bg-background/40">
                      <Calendar className="h-2 w-2" />
                      {formatDate(holding.firstBuyDate)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="font-mono text-[10px] px-2 py-0.5 h-4.5 bg-secondary/60 text-secondary-foreground/75 border-0 shadow-sm">
                    {holding.stockCode}
                  </Badge>
                </div>
              </div>
              
              {/* 右上角盈亏比率徽章 - 显示实际盈亏比率 */}
              <div className="shrink-0 flex flex-col gap-0.5 items-end">
                <Badge 
                  className={`h-6 px-2.5 text-xs font-bold tabular-nums shadow-md opacity-65 group-hover:opacity-75 transition-opacity duration-300 ${
                    isProfitable 
                      ? 'bg-red-600/50 hover:bg-red-700/55 dark:bg-rose-600/55 dark:hover:bg-rose-700/60 text-white/85 dark:text-white/90' 
                      : 'bg-green-600/50 hover:bg-green-700/55 dark:bg-emerald-600/55 dark:hover:bg-emerald-700/60 text-white/85 dark:text-white/90'
                  }`}
                >
                  {isProfitable ? (
                    <TrendingUp className="h-3 w-3 mr-0.5 inline" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-0.5 inline" />
                  )}
                  {isProfitable ? '+' : ''}{actualProfitLossRatio}%
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-2.5 pt-3 px-4 pb-4">
            {/* 盈亏核心数据 - 优化视觉层次 */}
            <div className="px-3.5 py-2.5 rounded-xl bg-gradient-to-br from-muted/35 via-muted/30 to-muted/25 dark:from-muted/35 dark:via-muted/30 dark:to-muted/25 border border-border/20 dark:border-border/15 shadow-[inset_0_1px_3px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.08)] relative overflow-hidden">
              {/* 微妙的高光效果 */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />
              
              <div className="space-y-2 relative z-10">
                {/* 已实现盈亏行 */}
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[11px] font-medium text-muted-foreground/75 dark:text-muted-foreground/70 whitespace-nowrap shrink-0">已实现盈亏</span>
                  <div className="flex-1 text-right min-w-0">
                    <span className={`text-xl font-bold tabular-nums leading-none ${
                      isProfitable ? 'text-red-600/75 dark:text-rose-400/75' : 'text-green-600/75 dark:text-emerald-400/75'
                    }`}>
                      <FloatingText
                        text={profitLossFormatted.display}
                        staggerDuration={0.03}
                      />
                    </span>
                  </div>
                </div>
                
                {/* 盈亏比率细节 */}
                <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-border/10 dark:border-border/5">
                  <span className="text-[9px] font-medium text-muted-foreground/55 dark:text-muted-foreground/50">盈亏比率</span>
                  <span className={`text-[10px] font-semibold tabular-nums ${
                    isProfitable ? 'text-red-600/65 dark:text-rose-400/65' : 'text-green-600/65 dark:text-emerald-400/65'
                  }`}>
                    {isProfitable ? '+' : ''}{actualProfitLossRatio}%
                  </span>
                </div>
                
                {/* 错失利润提示 */}
                {hasMissedProfit && (
                  <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-border/10 dark:border-border/5">
                    <span className="text-[9px] font-medium text-muted-foreground/55 dark:text-muted-foreground/50">错失利润</span>
                    <span className={`text-[9px] font-semibold tabular-nums ${getMissedProfitText(missedProfit).color}`}>
                      {missedProfit > 0 ? '+' : ''}{formatNumber(missedProfit, 2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 价格信息 - 优化灰化处理 */}
            <div className="flex items-center justify-between @xs:justify-start @xs:gap-4 px-1.5 py-2 text-sm opacity-65 group-hover:opacity-75 transition-opacity duration-300">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10px] font-medium text-muted-foreground/65">成本</span>
                <span className="font-semibold tabular-nums text-[13px] text-muted-foreground/85">¥{formatNumber(holding.costPrice)}</span>
              </div>
              {holding.firstBuyPrice > 0 && (
                <>
                  <div className="h-3.5 w-px bg-gradient-to-b from-transparent via-border/35 to-transparent hidden @xs:block"></div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] font-medium text-muted-foreground/65">首买</span>
                    <span className="font-semibold tabular-nums text-[13px] text-muted-foreground/85">¥{formatNumber(holding.firstBuyPrice)}</span>
                  </div>
                </>
              )}
              {holdingDays > 0 && (
                <>
                  <div className="h-3.5 w-px bg-gradient-to-b from-transparent via-border/35 to-transparent hidden @xs:block"></div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] font-medium text-muted-foreground/65">{holdingDays}天</span>
                    <span className={`text-[9px] font-semibold ${getHoldingDurationType(holdingDays).color}`}>
                      {getHoldingDurationType(holdingDays).type}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* 详细数据 - 优化版 */}
            <div className="flex items-center justify-between text-[10px] px-1.5 pt-1 opacity-55 group-hover:opacity-65 transition-opacity duration-300">
              <div className="flex items-baseline gap-1.5">
                <span className="text-muted-foreground/65 font-medium">买入</span>
                <span className="font-semibold tabular-nums text-muted-foreground/85">
                  ¥{formatNumber(totalBuyAmount, 2)}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-muted-foreground/65 font-medium">卖出</span>
                <span className="font-semibold tabular-nums text-muted-foreground/85">
                  ¥{formatNumber(holding.totalSellAmount || 0, 2)}
                </span>
              </div>
            </div>
            
            {/* 更新时间 */}
            {holding.lastUpdated && (
              <div className="flex items-center justify-center text-[9px] px-1.5 opacity-45 group-hover:opacity-55 transition-opacity duration-300">
                <span className="text-muted-foreground/65 font-medium">更新于 {formatDate(holding.lastUpdated)}</span>
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数 - 对于已清仓股票，比较已实现盈亏
  return (
    prevProps.holding.stockCode === nextProps.holding.stockCode &&
    prevProps.holding.realizedPnl === nextProps.holding.realizedPnl &&
    prevProps.holding.missedProfit === nextProps.holding.missedProfit
  );
});

