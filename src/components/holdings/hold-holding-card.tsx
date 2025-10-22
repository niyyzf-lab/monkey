import { useState, memo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { StockHolding } from '../../types/holdings';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, Calendar, Edit2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EditPriceDialog } from './hold-edit-price-dialog';
import { Button } from '../ui/button';
import { navigateToHoldingDetail } from '../../lib/navigation-utils';
import FloatingText from '../FloatingText';

interface HoldingCardProps {
  holding: StockHolding;
  onUpdate?: (holding: StockHolding) => void;
}

// 格式化数字，添加千位分隔符
const formatNumber = (num: number, decimals: number = 2): string => {
  // 处理 NaN、undefined、null 等异常值
  if (num === undefined || num === null || isNaN(num)) {
    return '0.00';
  }
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// 格式化金额，始终显示完整数值
const formatCurrency = (amount: number): { display: string; unit: string; full: string } => {
  // 处理 NaN、undefined、null 等异常值
  if (amount === undefined || amount === null || isNaN(amount)) {
    return {
      display: '0.00',
      unit: '',
      full: '+¥0.00'
    };
  }
  
  const sign = amount >= 0 ? '+' : '';
  
  // 完整金额（元），统一显示完整数值
  const full = `${sign}¥${formatNumber(amount, 2)}`;
  
  return {
    display: `${sign}${formatNumber(amount, 2)}`,
    unit: '',
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

// 计算价格在止损-止盈区间的位置百分比（以成本价为中心）
const calculatePricePositionFromCost = (
  currentPrice: number,
  costPrice: number,
  stopLoss?: number,
  takeProfit?: number
): number => {
  // 成本价固定在 50% 位置（中心点）
  const centerPosition = 50;
  
  if (currentPrice === costPrice) return centerPosition;
  
  if (currentPrice < costPrice) {
    // 当前价格在成本价左侧（止损区域）
    if (!stopLoss || stopLoss >= costPrice) return centerPosition;
    
    // 映射到 0%-50% 区间
    const leftRange = costPrice - stopLoss;
    const offset = costPrice - currentPrice;
    const leftPercent = (offset / leftRange) * centerPosition;
    
    // 限制在 0-50% 之间
    return Math.max(0, centerPosition - leftPercent);
  } else {
    // 当前价格在成本价右侧（止盈区域）
    if (!takeProfit || takeProfit <= costPrice) return centerPosition;
    
    // 映射到 50%-100% 区间
    const rightRange = takeProfit - costPrice;
    const offset = currentPrice - costPrice;
    const rightPercent = (offset / rightRange) * centerPosition;
    
    // 限制在 50-100% 之间
    return Math.min(100, centerPosition + rightPercent);
  }
};

// 检测是否接近止损（智能预警逻辑）
const isNearStopLoss = (currentPrice: number, costPrice: number, stopLoss?: number): boolean => {
  if (!stopLoss || stopLoss <= 0 || costPrice <= 0) return false;
  
  // 计算成本价到止损价的距离（绝对值）
  const rangeToStopLoss = Math.abs(costPrice - stopLoss);
  
  // 如果止损价高于成本价（设置错误），不预警
  if (stopLoss >= costPrice) return false;
  
  // 计算预警阈值：取 rangeToStopLoss 的 20% 和 当前价格的 2% 中的较小值
  // 这样既考虑了设置范围，又不会太敏感
  const warningThreshold = Math.min(rangeToStopLoss * 0.2, currentPrice * 0.02);
  
  // 当前价格在止损价到止损价+阈值之间，且低于成本价时预警
  return currentPrice < costPrice && 
         currentPrice >= stopLoss && 
         currentPrice <= stopLoss + warningThreshold;
};

// 检测是否接近止盈（智能提示逻辑）
const isNearTakeProfit = (currentPrice: number, costPrice: number, takeProfit?: number): boolean => {
  if (!takeProfit || takeProfit <= 0 || costPrice <= 0) return false;
  
  // 计算成本价到止盈价的距离（绝对值）
  const rangeToTakeProfit = Math.abs(takeProfit - costPrice);
  
  // 如果止盈价低于成本价（设置错误），不提示
  if (takeProfit <= costPrice) return false;
  
  // 计算提示阈值：取 rangeToTakeProfit 的 20% 和 当前价格的 2% 中的较小值
  const warningThreshold = Math.min(rangeToTakeProfit * 0.2, currentPrice * 0.02);
  
  // 当前价格在止盈价-阈值到止盈价之间，且高于成本价时提示
  return currentPrice > costPrice && 
         currentPrice >= takeProfit - warningThreshold && 
         currentPrice <= takeProfit;
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

// 计算止损/止盈距离
const calculateDistance = (current: number, target: number): { percent: number; amount: number } => {
  const amount = target - current;
  const percent = current > 0 ? (amount / current) * 100 : 0;
  return { percent, amount };
};

// 计算持仓时长类型
const getHoldingDurationType = (days: number): { type: string; color: string } => {
  if (days < 30) return { type: '短期', color: 'text-orange-600 dark:text-orange-400' };
  if (days < 90) return { type: '中期', color: 'text-blue-600 dark:text-blue-400' };
  return { type: '长期', color: 'text-green-600 dark:text-green-400' };
};

// 计算盈亏比率
const getProfitLossRatio = (profitLoss: number, totalCost: number): string => {
  if (totalCost === 0) return '0.00';
  return ((profitLoss / totalCost) * 100).toFixed(2);
};

// 使用 memo 优化渲染性能，只在 holding 数据真正变化时才重新渲染
export const HoldingCard = memo(function HoldingCard({ holding, onUpdate }: HoldingCardProps) {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // 计算总涨幅（以成本价计算）
  const totalGainPercentage = holding.costPrice > 0 
    ? (((holding.currentPrice - holding.costPrice) / holding.costPrice) * 100).toFixed(2)
    : '0.00';
  
  // 计算今日涨幅（真实股票涨跌幅，使用前收盘价）
  const todayGainPercentage = holding.prevClosePrice && holding.prevClosePrice > 0
    ? (((holding.currentPrice - holding.prevClosePrice) / holding.prevClosePrice) * 100).toFixed(2)
    : '0.00';
  
  const isProfitable = holding.totalProfitLoss >= 0;
  const isTodayGainPositive = parseFloat(todayGainPercentage) >= 0;
  const isTotalGainPositive = parseFloat(totalGainPercentage) >= 0;
  
  const profitLossFormatted = formatCurrency(holding.totalProfitLoss);
  const todayProfitFormatted = formatCurrency(holding.todayProfitLoss);

  // 计算持仓天数
  const holdingDays = calculateHoldingDays(holding.firstBuyDate);

  // 计算止盈止损相关数据
  const hasStopLoss = holding.forceClosePrice && holding.forceClosePrice > 0;
  const hasTakeProfit = holding.sellPrice && holding.sellPrice > 0;
  const hasStopLossOrTakeProfit = hasStopLoss || hasTakeProfit;
  
  // 计算止损止盈距离
  const stopLossDistance = hasStopLoss 
    ? calculateDistance(holding.currentPrice, holding.forceClosePrice!) 
    : null;
  const takeProfitDistance = hasTakeProfit 
    ? calculateDistance(holding.currentPrice, holding.sellPrice!) 
    : null;
  
  // 警告状态检测
  const nearStopLoss = isNearStopLoss(holding.currentPrice, holding.costPrice, holding.forceClosePrice);
  const nearTakeProfit = isNearTakeProfit(holding.currentPrice, holding.costPrice, holding.sellPrice);
  
  // 警告状态样式
  const hasWarning = nearStopLoss || nearTakeProfit;
  
  // 保存价格编辑
  const handleSavePrice = async (sellPrice: number, forceClosePrice: number) => {
    // 这里应该调用 API 保存价格
    // 暂时先更新本地状态
    if (onUpdate) {
      onUpdate({
        ...holding,
        sellPrice,
        forceClosePrice,
      });
    }
  };

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
      onMouseEnter={() => {
        setShowActions(true);
      }}
      onMouseLeave={() => {
        setShowActions(false);
      }}
    >
        <Card 
          className="py-0 gap-0 @container group relative cursor-pointer overflow-hidden rounded-xl border border-border/30 dark:border-border/20 bg-gradient-to-br from-card via-card to-card/95 dark:from-card dark:via-card dark:to-card/95 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03),inset_0_0.5px_1px_rgba(255,255,255,0.08)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.1),inset_0_0.5px_1px_rgba(255,255,255,0.03)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.04),inset_0_0.5px_1px_rgba(255,255,255,0.12)] dark:hover:shadow-[0_8px_16px_rgba(0,0,0,0.25),0_4px_8px_rgba(0,0,0,0.15),inset_0_0.5px_1px_rgba(255,255,255,0.05)] transition-all duration-300 before:absolute before:inset-[0.5px] before:rounded-xl before:border before:border-white/5 dark:before:border-white/[0.02] before:pointer-events-none"
          onClick={() => navigateToHoldingDetail(navigate, holding)}
        >
          
          {/* 操作按钮 - 右下角 */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, x: 10, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 10, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-2 right-2 z-20 flex gap-1.5"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded-lg bg-background/95 backdrop-blur-md hover:bg-muted shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_0.5px_1px_rgba(255,255,255,0.15)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12),inset_0_0.5px_1px_rgba(255,255,255,0.2)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15),inset_0_0.5px_1px_rgba(255,255,255,0.08)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_0.5px_1px_rgba(255,255,255,0.12)] border border-border/40 dark:border-border/30 border-t-white/10 dark:border-t-white/5 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditDialogOpen(true);
                    }}
                    title="编辑止盈止损"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded-lg bg-background/95 backdrop-blur-md hover:bg-muted shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_0.5px_1px_rgba(255,255,255,0.15)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12),inset_0_0.5px_1px_rgba(255,255,255,0.2)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15),inset_0_0.5px_1px_rgba(255,255,255,0.08)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_0.5px_1px_rgba(255,255,255,0.12)] border border-border/40 dark:border-border/30 border-t-white/10 dark:border-t-white/5 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToHoldingDetail(navigate, holding);
                    }}
                    title="查看详情"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="relative z-10 overflow-hidden">
      <CardHeader className="pb-1 space-y-0 px-4 pt-4 relative">
        {/* CardHeader 底部渐变分隔线 - 增强拟物效果 */}
        <div className="absolute bottom-0 left-0 right-0 h-px">
          <div className="h-full bg-gradient-to-r from-transparent via-border/60 to-transparent" />
          <div className="absolute inset-0 top-[-1px] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-semibold text-sm leading-tight truncate">
                {holding.stockName}
              </h3>
              {holding.firstBuyDate && (
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-3.5 gap-0.5 text-muted-foreground/70 border-muted-foreground/20">
                  <Calendar className="h-2 w-2" />
                  {formatDate(holding.firstBuyDate)}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0 h-4 bg-secondary text-secondary-foreground border-0 hover:bg-secondary">
                {holding.stockCode}
              </Badge>
              <span className="text-[10px] text-muted-foreground/60">
                持仓 {formatNumber(holding.totalQuantity, 0)}
              </span>
            </div>
          </div>
          
          {/* 右上角涨幅徽章组 */}
          <div className="shrink-0 flex flex-col gap-0.5 items-end">
            {/* 总涨幅 */}
            <Badge 
              className={`h-6 px-2 text-xs font-bold tabular-nums text-white shadow-sm ${
                isTotalGainPositive 
                  ? 'bg-red-600 hover:bg-red-700 dark:bg-rose-600 dark:hover:bg-rose-700' 
                  : 'bg-green-600 hover:bg-green-700 dark:bg-emerald-600 dark:hover:bg-emerald-700'
              }`}
            >
              {isTotalGainPositive ? (
                <TrendingUp className="h-3 w-3 mr-0.5 inline" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-0.5 inline" />
              )}
              {isTotalGainPositive ? '+' : ''}{totalGainPercentage}%
            </Badge>
            
            {/* 今日涨幅 - 小字文本 */}
            <span 
              className={`text-[9px] font-medium tabular-nums ${
                isTodayGainPositive 
                  ? 'text-red-600/80 dark:text-rose-400' 
                  : 'text-green-600/80 dark:text-emerald-400'
              }`}
            >
              今{isTodayGainPositive ? '+' : ''}{todayGainPercentage}%
            </span>
          </div>
        </div>
      </CardHeader>

          <CardContent className="space-y-2 pt-3 px-4 pb-3.5">
            {/* 盈亏核心数据 */}
            <div className="px-3 py-2 rounded-xl bg-gradient-to-br from-muted/50 via-muted/40 to-muted/30 dark:from-muted/50 dark:via-muted/40 dark:to-muted/30 border border-border/20 dark:border-border/10 border-t-white/5 dark:border-t-white/[0.02] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04),0_0.5px_1px_rgba(255,255,255,0.03)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.1),0_0.5px_1px_rgba(255,255,255,0.02)] relative overflow-hidden">
              <div className="space-y-1.5 relative z-10">
                {/* 总盈亏行 - 增强视觉层级 */}
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">总盈亏</span>
                  <div className="flex-1 text-right min-w-0">
                    <span className={`text-xl font-bold tabular-nums leading-none ${
                      isProfitable ? 'text-red-600 dark:text-rose-400' : 'text-green-600 dark:text-emerald-400'
                    }`}>
                      <FloatingText
                        text={profitLossFormatted.display}
                        staggerDuration={0.03}
                      />
                    </span>
                  </div>
                </div>
                
                {/* 盈亏比率细节 */}
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="text-[9px] text-muted-foreground/60">盈亏比率</span>
                  <span className={`text-[10px] font-semibold tabular-nums ${
                    isProfitable ? 'text-red-600/80 dark:text-rose-400/80' : 'text-green-600/80 dark:text-emerald-400/80'
                  }`}>
                    {isProfitable ? '+' : ''}{getProfitLossRatio(holding.totalProfitLoss, holding.totalCost)}%
                  </span>
                </div>
                
                {/* 今日盈亏行 - 提升字号和色彩 */}
                <div className="flex items-baseline justify-between gap-2 pt-0.5 border-t border-border/10 dark:border-border/5">
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">今日</span>
                  <div className="flex-1 text-right min-w-0 flex items-baseline justify-end gap-1.5">
                    <span className={`text-sm font-bold tabular-nums leading-none ${
                      holding.todayProfitLoss >= 0 ? 'text-red-600 dark:text-rose-400' : 'text-green-600 dark:text-emerald-400'
                    }`}>
                      <FloatingText
                        text={todayProfitFormatted.display}
                        staggerDuration={0.03}
                      />
                    </span>
                    {holding.todayProfitLoss !== 0 && (
                      <span className={`text-[9px] ${
                        holding.todayProfitLoss >= 0 ? 'text-red-600/60 dark:text-rose-400/60' : 'text-green-600/60 dark:text-emerald-400/60'
                      }`}>
                        {holding.todayProfitLoss >= 0 ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 价格信息 - 简洁版 */}
            <div className="flex items-center justify-between @xs:justify-start @xs:gap-4 px-1 py-1.5 text-sm">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10px] text-muted-foreground/70">当前</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="font-semibold tabular-nums text-[13px]">
                    ¥<FloatingText
                      text={formatNumber(holding.currentPrice)}
                      staggerDuration={0.02}
                    />
                  </span>
                  {holding.currentPrice !== holding.costPrice && (
                    <span className={`text-[9px] ml-0.5 ${
                      holding.currentPrice > holding.costPrice 
                        ? 'text-red-600/60 dark:text-rose-400/60' 
                        : 'text-green-600/60 dark:text-emerald-400/60'
                    }`}>
                      {holding.currentPrice > holding.costPrice ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </div>
              <div className="h-3 w-px bg-gradient-to-b from-transparent via-border/50 to-transparent hidden @xs:block"></div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10px] text-muted-foreground/70">成本</span>
                <span className="font-semibold tabular-nums text-[13px]">¥{formatNumber(holding.costPrice)}</span>
              </div>
              {holdingDays > 0 && (
                <>
                  <div className="h-3 w-px bg-gradient-to-b from-transparent via-border/50 to-transparent hidden @xs:block"></div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] text-muted-foreground/70">{holdingDays}天</span>
                    <span className={`text-[8px] font-medium ${getHoldingDurationType(holdingDays).color}`}>
                      {getHoldingDurationType(holdingDays).type}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* 止损止盈可视化进度条 */}
            <>
              <div
                className={`px-2.5 py-2 rounded-xl transition-all duration-300 relative overflow-hidden ${
                  nearStopLoss 
                    ? 'bg-gradient-to-br from-orange-50/90 via-orange-50/80 to-orange-100/70 dark:from-orange-950/50 dark:via-orange-950/40 dark:to-orange-900/30 border-2 border-amber-500/40 dark:border-amber-400/30 border-t-amber-300/20 dark:border-t-amber-200/10 shadow-[0_2px_12px_rgba(245,158,11,0.15),0_0_0_1px_rgba(245,158,11,0.05),inset_0_1px_2px_rgba(245,158,11,0.08),0_0_20px_rgba(245,158,11,0.1)] dark:shadow-[0_2px_12px_rgba(245,158,11,0.25),0_0_0_1px_rgba(245,158,11,0.1),inset_0_1px_2px_rgba(0,0,0,0.15),0_0_20px_rgba(245,158,11,0.15)]' 
                    : nearTakeProfit
                    ? 'bg-gradient-to-br from-blue-50/90 via-blue-50/80 to-blue-100/70 dark:from-blue-950/50 dark:via-blue-950/40 dark:to-blue-900/30 border-2 border-blue-500/40 dark:border-blue-400/30 border-t-blue-300/20 dark:border-t-blue-200/10 shadow-[0_2px_12px_rgba(59,130,246,0.15),0_0_0_1px_rgba(59,130,246,0.05),inset_0_1px_2px_rgba(59,130,246,0.08),0_0_20px_rgba(59,130,246,0.1)] dark:shadow-[0_2px_12px_rgba(59,130,246,0.25),0_0_0_1px_rgba(59,130,246,0.1),inset_0_1px_2px_rgba(0,0,0,0.15),0_0_20px_rgba(59,130,246,0.15)]'
                    : 'bg-gradient-to-br from-muted/50 via-muted/40 to-muted/30 dark:from-muted/50 dark:via-muted/40 dark:to-muted/30 border border-border/20 dark:border-border/10 border-t-white/5 dark:border-t-white/[0.02] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04),0_0.5px_1px_rgba(255,255,255,0.03)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.1),0_0.5px_1px_rgba(255,255,255,0.02)]'
                }`}
              >
                {!hasStopLossOrTakeProfit ? (
                  // 空状态 - 未设置止盈止损
                  <div className="flex items-center justify-center w-full relative z-10 py-0.5">
                    <span className="text-[10px] text-muted-foreground/50 italic">
                      未设置止盈止损
                    </span>
                  </div>
                ) : hasStopLoss && hasTakeProfit ? (
                  // 完整进度条：同时有止损和止盈
                  <div className="space-y-1 relative z-10">
                    {/* 顶部：警示徽章区域 */}
                    {(nearStopLoss || nearTakeProfit) && (
                      <div className="flex items-center justify-center gap-2">
                        {nearStopLoss && (
                          <motion.div
                            animate={{
                              rotate: [-1.5, 1.5, -1.5, 1.5, -1.5],
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "easeInOut",
                              repeatType: "loop"
                            }}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 dark:bg-amber-600 text-white shadow-sm"
                          >
                            <TrendingDown className="h-2.5 w-2.5" />
                            止损预警
                          </motion.div>
                        )}
                        {nearTakeProfit && (
                          <motion.div
                            animate={{
                              rotate: [-1.5, 1.5, -1.5, 1.5, -1.5],
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "easeInOut",
                              repeatType: "loop"
                            }}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-500 dark:bg-blue-600 text-white shadow-sm"
                          >
                            <TrendingUp className="h-2.5 w-2.5" />
                            止盈提示
                          </motion.div>
                        )}
                      </div>
                    )}
                    
                    {/* 价格标签行 */}
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1 text-orange-700 dark:text-orange-400">
                        <TrendingDown className="h-2.5 w-2.5" />
                        <span className="font-semibold tabular-nums">¥{formatNumber(holding.forceClosePrice!)}</span>
                        <span className="text-[8px] opacity-60">止损</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-blue-700 dark:text-blue-400">
                        <span className="text-[8px] opacity-60">止盈</span>
                        <span className="font-semibold tabular-nums">¥{formatNumber(holding.sellPrice!)}</span>
                        <TrendingUp className="h-2.5 w-2.5" />
                      </div>
                    </div>
                    
                    {/* 进度条容器 - 压缩高度 */}
                    <div className="relative h-3 px-1">
                      {/* 当前价格悬浮标签 - 移到进度条上方 */}
                      <div
                        className="absolute bottom-full mb-0.5 -translate-x-1/2 whitespace-nowrap z-30"
                        style={{
                          left: `${calculatePricePositionFromCost(
                            holding.currentPrice,
                            holding.costPrice,
                            holding.forceClosePrice,
                            holding.sellPrice
                          )}%`
                        }}
                      >
                        <div className="bg-foreground text-background text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg">
                          ¥{formatNumber(holding.currentPrice)}
                        </div>
                        {/* 小三角箭头 */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-[2.5px] border-l-transparent border-r-[2.5px] border-r-transparent border-t-[2.5px] border-t-foreground"></div>
                      </div>
                      
                      {/* 进度条主体 */}
                      <div className="relative h-2 rounded-full overflow-hidden bg-gradient-to-r from-orange-200 via-amber-100 to-blue-200 dark:from-orange-600 dark:via-amber-500 dark:to-blue-600 shadow-inner">
                        
                        {/* 成本价中心标记 */}
                        <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-0.5 bg-white/50 dark:bg-white/40 shadow-sm"></div>
                        
                        {/* 当前价格指示器 */}
                        <motion.div
                          className={`absolute top-1/2 -translate-y-1/2 z-20`}
                          style={{
                            left: `${calculatePricePositionFromCost(
                              holding.currentPrice,
                              holding.costPrice,
                              holding.forceClosePrice,
                              holding.sellPrice
                            )}%`
                          }}
                          animate={nearStopLoss || nearTakeProfit ? {
                            scale: [1, 1.15, 1],
                          } : {}}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-1.5 bg-white dark:bg-slate-100 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.25)] border border-border/20"></div>
                        </motion.div>
                      </div>
                      
                      {/* 刻度标记 */}
                      <div className="absolute top-2 left-0 right-0 flex items-center justify-between text-[8px] text-muted-foreground/40 px-0.5">
                        <div className="w-px h-0.5 bg-orange-400/30"></div>
                        <div className="w-px h-1 bg-foreground/20"></div>
                        <div className="w-px h-0.5 bg-blue-400/30"></div>
                      </div>
                    </div>
                    
                    {/* 底部信息行 - 极简单行 */}
                    <div className="flex items-center justify-between text-[9px]">
                      {/* 左侧：止损距离 */}
                      <div className="flex items-center gap-1">
                        <span className="text-orange-700 dark:text-orange-400 tabular-nums font-bold">
                          ↓{stopLossDistance!.percent.toFixed(1)}%
                        </span>
                        <span className="text-[8px] text-muted-foreground/40 tabular-nums">
                          {stopLossDistance!.amount >= 0 ? '+' : ''}{formatNumber(stopLossDistance!.amount, 2)}
                        </span>
                      </div>
                      
                      {/* 中间：成本价 */}
                      <span className="text-[8px] text-muted-foreground/50 font-medium tabular-nums">
                        COST ¥{formatNumber(holding.costPrice)}
                      </span>
                      
                      {/* 右侧：止盈距离 */}
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] text-muted-foreground/40 tabular-nums">
                          {takeProfitDistance!.amount >= 0 ? '+' : ''}{formatNumber(takeProfitDistance!.amount, 2)}
                        </span>
                        <span className="text-blue-700 dark:text-blue-400 tabular-nums font-bold">
                          ↑{Math.abs(takeProfitDistance!.percent).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // 单独显示止损或止盈 - 超紧凑版
                  <div className="space-y-1 relative z-10">
                    {/* 警示徽章 */}
                    {hasWarning && (
                      <div className="flex items-center justify-center">
                        <motion.div
                          animate={{
                            rotate: [-1.5, 1.5, -1.5, 1.5],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold shadow-sm ${
                            nearStopLoss
                              ? 'bg-amber-500 dark:bg-amber-600 text-white'
                              : 'bg-blue-500 dark:bg-blue-600 text-white'
                          }`}
                        >
                          {nearStopLoss ? (
                            <>
                              <TrendingDown className="h-2.5 w-2.5" />
                              止损预警
                            </>
                          ) : (
                            <>
                              <TrendingUp className="h-2.5 w-2.5" />
                              止盈提示
                            </>
                          )}
                        </motion.div>
                      </div>
                    )}
                    
                    {/* 价格信息 - 单行紧凑布局 */}
                    <div className="flex items-center justify-between px-0.5">
                      {hasTakeProfit && (
                        <>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span className="text-[8px] text-muted-foreground/50">止盈</span>
                            <span className="font-bold text-[13px] tabular-nums text-blue-700 dark:text-blue-400">
                              ¥{formatNumber(holding.sellPrice!)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] tabular-nums text-blue-600 dark:text-blue-400 font-bold">
                              ↑{takeProfitDistance ? Math.abs(takeProfitDistance.percent).toFixed(1) : '0.0'}%
                            </span>
                            <span className="text-[8px] text-muted-foreground/40 tabular-nums">
                              {takeProfitDistance ? (takeProfitDistance.amount >= 0 ? '+' : '') + formatNumber(takeProfitDistance.amount, 2) : '¥0.00'}
                            </span>
                          </div>
                        </>
                      )}
                      {hasStopLoss && (
                        <>
                          <div className="flex items-center gap-1">
                            <TrendingDown className="h-2.5 w-2.5 text-orange-600 dark:text-orange-400 shrink-0" />
                            <span className="text-[8px] text-muted-foreground/50">止损</span>
                            <span className="font-bold text-[13px] tabular-nums text-orange-700 dark:text-orange-400">
                              ¥{formatNumber(holding.forceClosePrice!)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] tabular-nums text-orange-600 dark:text-orange-400 font-bold">
                              ↓{stopLossDistance ? stopLossDistance.percent.toFixed(1) : '0.0'}%
                            </span>
                            <span className="text-[8px] text-muted-foreground/40 tabular-nums">
                              {stopLossDistance ? (stopLossDistance.amount >= 0 ? '+' : '') + formatNumber(stopLossDistance.amount, 2) : '¥0.00'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* 成本价参考 - 压缩 */}
                    <div className="flex items-center justify-center pt-0.5 border-t border-border/10">
                      <span className="text-[8px] text-muted-foreground/50 font-medium tabular-nums">
                        COST ¥{formatNumber(holding.costPrice)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>

            {/* 详细数据网格 - 精简版 */}
            <div className="flex items-center justify-between text-[10px] px-1 pt-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-muted-foreground/50">市值/成本</span>
                <span className="font-medium tabular-nums">
                  {formatNumber(holding.marketValue / 10000, 1)}/{formatNumber(holding.totalCost / 10000, 1)}万
                </span>
              </div>
              {holding.firstBuyPrice > 0 && (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-muted-foreground/50">首买</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-medium tabular-nums">¥{formatNumber(holding.firstBuyPrice)}</span>
                    <span className={`text-[8px] font-medium tabular-nums ${
                      holding.currentPrice >= holding.firstBuyPrice 
                        ? 'text-red-600/70 dark:text-rose-400/70' 
                        : 'text-green-600/70 dark:text-emerald-400/70'
                    }`}>
                      {holding.currentPrice >= holding.firstBuyPrice ? '+' : ''}{((holding.currentPrice - holding.firstBuyPrice) / holding.firstBuyPrice * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>

          </CardContent>
        </div>
      </Card>
      
      {/* 编辑价格对话框 */}
      <EditPriceDialog
        holding={holding}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSavePrice}
      />
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数：只在关键数据变化时才重新渲染
  return (
    prevProps.holding.stockCode === nextProps.holding.stockCode &&
    prevProps.holding.currentPrice === nextProps.holding.currentPrice &&
    prevProps.holding.totalProfitLoss === nextProps.holding.totalProfitLoss &&
    prevProps.holding.todayProfitLoss === nextProps.holding.todayProfitLoss &&
    prevProps.holding.sellPrice === nextProps.holding.sellPrice &&
    prevProps.holding.forceClosePrice === nextProps.holding.forceClosePrice
  );
});
