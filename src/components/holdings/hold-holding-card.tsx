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

// 检测是否接近止损（当前价格低于止损价的5%以内）
const isNearStopLoss = (currentPrice: number, stopLoss?: number): boolean => {
  if (!stopLoss || stopLoss <= 0) return false;
  return currentPrice <= stopLoss * 1.05;
};

// 检测是否接近止盈（当前价格高于止盈价的95%以上）
const isNearTakeProfit = (currentPrice: number, takeProfit?: number): boolean => {
  if (!takeProfit || takeProfit <= 0) return false;
  return currentPrice >= takeProfit * 0.95;
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
  const nearStopLoss = isNearStopLoss(holding.currentPrice, holding.forceClosePrice);
  const nearTakeProfit = isNearTakeProfit(holding.currentPrice, holding.sellPrice);
  
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
          className="py-0 gap-0 @container group border border-border/30 dark:border-border/20 bg-card dark:bg-card shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_8px_16px_rgba(0,0,0,0.2),0_4px_8px_rgba(0,0,0,0.12)] transition-all duration-300 relative cursor-pointer overflow-hidden rounded-xl"
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
                    className="h-7 w-7 rounded-lg bg-background/95 backdrop-blur-sm hover:bg-muted shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] border border-border/40 dark:border-border/30 transition-all duration-200"
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
                    className="h-7 w-7 rounded-lg bg-background/95 backdrop-blur-sm hover:bg-muted shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] border border-border/40 dark:border-border/30 transition-all duration-200"
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
      <CardHeader className="pb-2.5 space-y-0 px-4 pt-3 relative">
        {/* CardHeader 底部渐变分隔线 */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
        <div className="flex items-start justify-between gap-2.5">
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

          <CardContent className="space-y-2.5 pt-2.5 px-4 pb-3">
            {/* 盈亏核心数据 */}
            <div className="px-3 py-2.5 rounded-xl bg-muted/40 dark:bg-muted/40 border border-border/20 dark:border-border/10 relative overflow-hidden">
              <div className="space-y-2 relative z-10">
                {/* 总盈亏行 - 增强视觉层级 */}
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">总盈亏</span>
                  <div className="flex-1 text-right min-w-0">
                    <span className={`text-2xl font-bold tabular-nums leading-none ${
                      isProfitable ? 'text-red-600 dark:text-rose-400' : 'text-green-600 dark:text-emerald-400'
                    }`}>
                      <FloatingText
                        text={profitLossFormatted.display}
                        staggerDuration={0.03}
                      />
                    </span>
                  </div>
                </div>
                
                {/* 今日盈亏行 - 提升字号和色彩 */}
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">今日</span>
                  <div className="flex-1 text-right min-w-0">
                    <span className={`text-base font-bold tabular-nums leading-none ${
                      holding.todayProfitLoss >= 0 ? 'text-red-600 dark:text-rose-400' : 'text-green-600 dark:text-emerald-400'
                    }`}>
                      <FloatingText
                        text={todayProfitFormatted.display}
                        staggerDuration={0.03}
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 价格信息 */}
            <div className="flex items-center justify-between @xs:justify-start @xs:gap-4 px-1 text-sm">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs text-muted-foreground/70">当前</span>
                <span className="font-semibold tabular-nums">
                  ¥<FloatingText
                    text={formatNumber(holding.currentPrice)}
                    staggerDuration={0.02}
                  />
                </span>
              </div>
              <div className="h-3 w-px bg-border/50 hidden @xs:block"></div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs text-muted-foreground/70">成本</span>
                <span className="font-semibold tabular-nums">¥{formatNumber(holding.costPrice)}</span>
              </div>
              {holdingDays > 0 && (
                <>
                  <div className="h-3 w-px bg-border/50 hidden @xs:block"></div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-muted-foreground/70">{holdingDays}天</span>
                  </div>
                </>
              )}
            </div>

            {/* 止损止盈可视化进度条 */}
            <>
              <div
                className={`px-3 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden ${
                  nearStopLoss 
                    ? 'bg-orange-50/80 dark:bg-orange-950/40 border-2 border-amber-500/40 dark:border-amber-400/30 shadow-[0_2px_12px_rgba(245,158,11,0.15),0_0_0_1px_rgba(245,158,11,0.05)]' 
                    : nearTakeProfit
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-2 border-blue-500/40 dark:border-blue-400/30 shadow-[0_2px_12px_rgba(59,130,246,0.15),0_0_0_1px_rgba(59,130,246,0.05)]'
                    : 'bg-muted/40 dark:bg-muted/40 border border-border/20 dark:border-border/10'
                }`}
              >
                {!hasStopLossOrTakeProfit ? (
                  // 空状态 - 未设置止盈止损，保持与有内容时相同的高度
                  <div className="flex items-center justify-center w-full relative z-10" style={{ minHeight: '52px' }}>
                    <span className="text-xs text-muted-foreground/50 italic">
                      未设置止盈止损
                    </span>
                  </div>
                ) : hasStopLoss && hasTakeProfit ? (
                  // 完整进度条：同时有止损和止盈
                  <div className="space-y-2 relative z-10">
                    {/* 警示徽章 + 顶部价格标签 */}
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-2">
                        {/* 止损警示徽章 */}
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
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 dark:bg-amber-600 text-white"
                          >
                            <TrendingDown className="h-2.5 w-2.5" />
                            止损预警
                          </motion.div>
                        )}
                        
                        {/* 止损价格 */}
                        <div className="flex items-center gap-1 text-orange-700 dark:text-orange-400">
                          <TrendingDown className="h-2.5 w-2.5" />
                          <span className="font-medium">¥{formatNumber(holding.forceClosePrice!)}</span>
                        </div>
                      </div>
                      
                      {/* 止盈价格 */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-blue-700 dark:text-blue-400">
                          <span className="font-medium">¥{formatNumber(holding.sellPrice!)}</span>
                          <TrendingUp className="h-2.5 w-2.5" />
                        </div>
                        
                        {/* 止盈警示徽章 */}
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
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500 dark:bg-blue-600 text-white"
                          >
                            <TrendingUp className="h-2.5 w-2.5" />
                            止盈提示
                          </motion.div>
                        )}
                      </div>
                    </div>
                    
                    {/* 简化进度条 - 垂直线指示器 */}
                    <div className="relative h-6">
                      {/* 进度条容器 */}
                      <div className="relative h-2 rounded-full overflow-hidden bg-gradient-to-r from-orange-200 via-amber-100 to-blue-200 dark:from-orange-600 dark:via-amber-500 dark:to-blue-600">
                        
                        {/* 成本价中心标记 - 简化为细线 */}
                        <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px bg-white/40 dark:bg-white/30"></div>
                        
                        {/* 当前价格指示器 - 横向白色小白条 */}
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 z-20 ${nearStopLoss || nearTakeProfit ? 'animate-pulse' : ''}`}
                          style={{
                            left: `${calculatePricePositionFromCost(
                              holding.currentPrice,
                              holding.costPrice,
                              holding.forceClosePrice,
                              holding.sellPrice
                            )}%`
                          }}
                        >
                          {/* 当前价格悬浮标签 */}
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            <div className="bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded shadow-xl">
                              ¥{formatNumber(holding.currentPrice)}
                            </div>
                          </div>
                          
                          {/* 横向白色圆角小白条 */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-1.5 bg-white rounded-full shadow-lg"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 底部距离提示 - 极简版 */}
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-orange-700 dark:text-orange-400 tabular-nums font-medium">
                        ↓{stopLossDistance!.percent.toFixed(1)}%
                      </span>
                      <span className="text-[8px] text-muted-foreground/50">成本 ¥{formatNumber(holding.costPrice)}</span>
                      <span className="text-blue-700 dark:text-blue-400 tabular-nums font-medium">
                        ↑{Math.abs(takeProfitDistance!.percent).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  // 单独显示止损或止盈 - 极简版
                  <div className="space-y-2 relative z-10">
                    {/* 警示徽章 */}
                    {hasWarning && (
                      <motion.div
                        animate={{
                          rotate: [-1.5, 1.5, -1.5, 1.5],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
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
                    )}
                    
                    {/* 价格信息 */}
                    <div className="flex items-center justify-between">
                      {hasTakeProfit && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          <div>
                            <div className="text-[9px] text-muted-foreground/60">止盈</div>
                            <div className="font-semibold text-sm tabular-nums">¥{formatNumber(holding.sellPrice!)}</div>
                          </div>
                          <div className="ml-2 text-[10px] tabular-nums text-blue-600 dark:text-blue-400 font-medium">
                            ↑{takeProfitDistance ? Math.abs(takeProfitDistance.percent).toFixed(1) : '0.0'}%
                          </div>
                        </div>
                      )}
                      {hasStopLoss && (
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                          <div>
                            <div className="text-[9px] text-muted-foreground/60">止损</div>
                            <div className="font-semibold text-sm tabular-nums">¥{formatNumber(holding.forceClosePrice!)}</div>
                          </div>
                          <div className="ml-2 text-[10px] tabular-nums text-orange-600 dark:text-orange-400 font-medium">
                            ↓{stopLossDistance ? stopLossDistance.percent.toFixed(1) : '0.0'}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>

            {/* 详细数据网格 */}
            <div className="grid grid-cols-1 @xs:grid-cols-2 gap-x-4 gap-y-1 text-[10px] px-1">
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground/50">市值/成本</span>
                <span className="font-medium tabular-nums">
                  {formatNumber(holding.marketValue / 10000, 1)}/{formatNumber(holding.totalCost / 10000, 1)}万
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground/50">首买价</span>
                <span className="font-medium tabular-nums">
                  ¥{formatNumber(holding.firstBuyPrice)}
                </span>
              </div>
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
