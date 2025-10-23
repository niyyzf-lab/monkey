import { HoldingsStatistics } from '../../types/holdings';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, JapaneseYen } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrencyValue, formatCurrencyDetail } from '../../lib/formatters';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import ClickSpark from '../ui/ClickSpark';
import FloatingText from '../FloatingText';
import * as React from 'react';

interface StatisticsCardsProps {
  statistics: HoldingsStatistics;
  displayMode: 'auto' | 'yuan';
}

export function StatisticsCards({ statistics, displayMode }: StatisticsCardsProps) {
  // 监听暗色模式
  const [isDark, setIsDark] = React.useState(false);
  
  React.useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    updateTheme();
    
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    
    return () => observer.disconnect();
  }, []);
  
  // 计算总盈亏（总资产 - 初始资金）
  const totalProfitLoss = statistics.totalEquity - statistics.initialCapital;
  const totalProfitLossRatio = statistics.initialCapital > 0
    ? ((totalProfitLoss / statistics.initialCapital) * 100).toFixed(2)
    : '0.00';
  
  // 计算今日盈亏比率
  const todayProfitLossRatio = statistics.totalEquity > 0
    ? ((statistics.todayProfitLoss / statistics.totalEquity) * 100).toFixed(2)
    : '0.00';
  
  const isProfitable = totalProfitLoss >= 0;
  const isTodayProfitable = statistics.todayProfitLoss >= 0;
  
  // 智能模式格式化 - 四个主要卡片
  const marketValue = formatCurrencyValue(statistics.marketValue);
  const investedCost = formatCurrencyValue(statistics.investedCost);
  const profitLoss = formatCurrencyValue(totalProfitLoss);
  const todayProfitLoss = formatCurrencyValue(statistics.todayProfitLoss);
  
  // 次要信息格式化
  const totalEquity = formatCurrencyValue(statistics.totalEquity);
  const currentCash = formatCurrencyValue(statistics.currentCash);
  const realizedPnl = formatCurrencyValue(statistics.realizedPnl);
  const unrealizedPnl = formatCurrencyValue(statistics.unrealizedPnl);
  
  // 元模式格式化
  const marketValueYuan = { value: Math.round(statistics.marketValue * 100) / 100, unit: '元' };
  const investedCostYuan = { value: Math.round(statistics.investedCost * 100) / 100, unit: '元' };
  const profitLossYuan = { value: Math.round(totalProfitLoss * 100) / 100, unit: '元' };
  const todayProfitLossYuan = { value: Math.round(statistics.todayProfitLoss * 100) / 100, unit: '元' };
  
  // 根据模式选择显示的值
  const displayMarketValue = displayMode === 'yuan' ? marketValueYuan : marketValue;
  const displayInvestedCost = displayMode === 'yuan' ? investedCostYuan : investedCost;
  const displayProfitLoss = displayMode === 'yuan' ? profitLossYuan : profitLoss;
  const displayTodayProfitLoss = displayMode === 'yuan' ? todayProfitLossYuan : todayProfitLoss;
  
  // 格式化详细信息用于 Tooltip
  const marketValueDetail = formatCurrencyDetail(statistics.marketValue);
  const investedCostDetail = formatCurrencyDetail(statistics.investedCost);
  const profitLossDetail = formatCurrencyDetail(totalProfitLoss);
  const todayProfitLossDetail = formatCurrencyDetail(statistics.todayProfitLoss);
  const totalEquityDetail = formatCurrencyDetail(statistics.totalEquity);
  const currentCashDetail = formatCurrencyDetail(statistics.currentCash);

  return (
    <TooltipProvider>
      {/* <800px: 2列2行, 800-1200px: 4列平分, >1200px: 1,1,2,2分配 */}
      <div className="grid grid-cols-2 @[800px]:grid-cols-4 @[1200px]:grid-cols-6 gap-2 @sm:gap-3 auto-rows-fr">

      {/* 总市值 */}
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            whileHover={{ y: -2 }}
            className="@[1200px]:col-span-1 rounded-xl border border-border/30 dark:border-border/20 bg-gradient-to-br from-card via-card to-card/95 dark:from-muted dark:via-muted/80 dark:to-secondary p-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] hover:border-blue-500/30 dark:hover:shadow-[0_4px_12px_rgba(59,130,246,0.08)] transition-all duration-300 cursor-pointer min-w-0 relative overflow-hidden flex flex-col"
          >
            {/* 顶部高光 */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 dark:via-white/30 to-transparent" />
            <ClickSpark
              sparkColor='rgb(59 130 246)'
              sparkSize={10}
              sparkRadius={15}
              sparkCount={8}
              duration={400}
            >
              <div className="flex items-start justify-between mb-1.5 relative z-10">
                <div className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">总市值</div>
                <JapaneseYen className="h-3 w-3 text-blue-500/70 dark:text-blue-400 shrink-0" />
              </div>
              <div className="text-lg font-bold tabular-nums text-foreground relative z-10 flex items-baseline gap-1 mb-1">
                <span className="text-sm font-bold text-muted-foreground">¥</span>
                <FloatingText
                  text={displayMarketValue.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  staggerDuration={0.035}
                />
                <FloatingText
                  text={displayMarketValue.unit}
                  className="text-[11px] font-normal text-muted-foreground"
                  staggerDuration={0.025}
                  animationKey={`${displayMode}-${displayMarketValue.value}`}
                />
              </div>
              
              {/* 次要信息：总资产 - 紧凑排列 */}
              <div className="mt-auto pt-1.5 border-t border-border/20 dark:border-border/15">
                <div className="flex items-center justify-between text-[8px]">
                  <span className="text-muted-foreground/60">总资产</span>
                  <span className="font-semibold text-foreground/70 tabular-nums">
                    ¥{totalEquity.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}{totalEquity.unit}
                  </span>
                </div>
              </div>
            </ClickSpark>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <div className="font-semibold">{marketValueDetail.line1}</div>
            <div className="text-xs opacity-80 mt-0.5">{marketValueDetail.line2}</div>
            <div className="mt-1.5 pt-1.5 border-t border-border/30">
              <div className="text-xs opacity-90">总资产: {totalEquityDetail.line1}</div>
              <div className="text-[10px] opacity-70 mt-0.5">现金: {currentCashDetail.line1}</div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>

      {/* 总成本 */}
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ y: -2 }}
            className="@[1200px]:col-span-1 rounded-xl border border-border/30 dark:border-border/20 bg-gradient-to-br from-card via-card to-card/95 dark:from-muted dark:via-muted/80 dark:to-secondary p-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] hover:border-purple-500/30 dark:hover:shadow-[0_4px_12px_rgba(168,85,247,0.08)] transition-all duration-300 cursor-pointer min-w-0 relative overflow-hidden flex flex-col"
          >
            {/* 顶部高光 */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 dark:via-white/30 to-transparent" />
            <ClickSpark
              sparkColor='rgb(168 85 247)'
              sparkSize={10}
              sparkRadius={15}
              sparkCount={8}
              duration={400}
            >
              <div className="flex items-start justify-between mb-1.5 relative z-10">
                <div className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">投入成本</div>
                <JapaneseYen className="h-3 w-3 text-purple-500/70 dark:text-purple-400 shrink-0" />
              </div>
              <div className="text-lg font-bold tabular-nums text-foreground relative z-10 flex items-baseline gap-1 mb-1">
                <span className="text-sm font-bold text-muted-foreground">¥</span>
                <FloatingText
                  text={displayInvestedCost.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  staggerDuration={0.035}
                />
                <FloatingText
                  text={displayInvestedCost.unit}
                  className="text-[11px] font-normal text-muted-foreground"
                  staggerDuration={0.025}
                  animationKey={`${displayMode}-${displayInvestedCost.value}`}
                />
              </div>
              
              {/* 次要信息：当前现金 - 紧凑排列 */}
              <div className="mt-auto pt-1.5 border-t border-border/20 dark:border-border/15">
                <div className="flex items-center justify-between text-[8px]">
                  <span className="text-muted-foreground/60">当前现金</span>
                  <span className="font-semibold text-foreground/70 tabular-nums">
                    ¥{currentCash.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}{currentCash.unit}
                  </span>
                </div>
              </div>
            </ClickSpark>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <div className="font-semibold">{investedCostDetail.line1}</div>
            <div className="text-xs opacity-80 mt-0.5">{investedCostDetail.line2}</div>
            <div className="mt-1.5 pt-1.5 border-t border-border/30">
              <div className="text-xs opacity-90">当前现金: {currentCashDetail.line1}</div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>

      {/* 总盈亏 */}
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            whileHover={{ y: -2 }}
            className={`@[1200px]:col-span-2 rounded-xl p-2.5 border transition-all duration-300 cursor-pointer min-w-0 flex flex-col ${
              isProfitable 
                ? 'bg-red-50 dark:bg-red-600/90 border-red-200/40 dark:border-red-500/20 shadow-[0_1px_3px_rgba(220,38,38,0.08),0_1px_2px_rgba(220,38,38,0.04)] hover:shadow-[0_4px_12px_rgba(220,38,38,0.12),0_2px_4px_rgba(220,38,38,0.06)]' 
                : 'bg-green-50 dark:bg-green-600/90 border-green-200/40 dark:border-green-500/20 shadow-[0_1px_3px_rgba(22,163,74,0.08),0_1px_2px_rgba(22,163,74,0.04)] hover:shadow-[0_4px_12px_rgba(22,163,74,0.12),0_2px_4px_rgba(22,163,74,0.06)]'
            }`}
          >
            <ClickSpark
              sparkColor={isDark ? 'rgb(255 255 255)' : (isProfitable ? 'rgb(220 38 38)' : 'rgb(22 163 74)')}
              sparkSize={10}
              sparkRadius={15}
              sparkCount={8}
              duration={400}
            >
            <div className="flex items-start justify-between mb-1.5">
              <div className={`text-[9px] font-medium uppercase tracking-wide ${
                isProfitable ? 'text-red-600/70 dark:text-red-50/80' : 'text-green-600/70 dark:text-green-50/80'
              }`}>总盈亏</div>
              {isProfitable ? (
                <TrendingUp className="h-3 w-3 text-red-600 dark:text-red-50 shrink-0" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-600 dark:text-green-50 shrink-0" />
              )}
            </div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="min-w-0">
                <div className={`text-lg font-bold tabular-nums flex items-baseline gap-1 ${
                  isProfitable ? 'text-red-700 dark:text-white' : 'text-green-700 dark:text-white'
                }`}>
                  <FloatingText
                    text={`${isProfitable ? '+' : ''}${displayProfitLoss.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
                    staggerDuration={0.035}
                  />
                  <FloatingText
                    text={displayProfitLoss.unit}
                    className={`text-sm font-normal ${
                      isProfitable ? 'text-red-600 dark:text-red-100' : 'text-green-600 dark:text-green-100'
                    }`}
                    staggerDuration={0.025}
                    animationKey={`${displayMode}-${displayProfitLoss.value}`}
                  />
                </div>
              </div>
              <Badge 
                className={`h-5 px-1.5 text-[10px] font-bold tabular-nums shrink-0 ${
                  isProfitable 
                    ? 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-800 dark:hover:bg-red-900 dark:text-red-50' 
                    : 'bg-green-600 hover:bg-green-700 text-white dark:bg-green-800 dark:hover:bg-green-900 dark:text-green-50'
                }`}
              >
                {isProfitable ? (
                  <TrendingUp className="h-2.5 w-2.5 mr-0.5 inline" />
                ) : (
                  <TrendingDown className="h-2.5 w-2.5 mr-0.5 inline" />
                )}
                {isProfitable ? '+' : ''}{totalProfitLossRatio}%
              </Badge>
            </div>
            
            {/* 次要信息：已实现盈亏和未实现盈亏 - 重新布局为单行 */}
            <div className="mt-auto pt-1.5 border-t border-white/20 dark:border-white/10 flex items-center justify-between text-[8px]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className={`${isProfitable ? 'text-red-600/60 dark:text-red-100/60' : 'text-green-600/60 dark:text-green-100/60'}`}>已实现</span>
                  <span className={`font-semibold tabular-nums ${isProfitable ? 'text-red-700 dark:text-red-50' : 'text-green-700 dark:text-green-50'}`}>
                    ¥{realizedPnl.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}{realizedPnl.unit}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`${isProfitable ? 'text-red-600/60 dark:text-red-100/60' : 'text-green-600/60 dark:text-green-100/60'}`}>未实现</span>
                  <span className={`font-semibold tabular-nums ${isProfitable ? 'text-red-700 dark:text-red-50' : 'text-green-700 dark:text-green-50'}`}>
                    ¥{unrealizedPnl.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}{unrealizedPnl.unit}
                  </span>
                </div>
              </div>
            </div>
            </ClickSpark>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <div className="font-semibold">{profitLossDetail.line1}</div>
            <div className="text-xs opacity-80 mt-0.5">{profitLossDetail.line2}</div>
            <div className="mt-1.5 pt-1.5 border-t border-border/30 text-left">
              <div className="text-xs opacity-90">已实现盈亏: ¥{formatCurrencyDetail(statistics.realizedPnl).line1}</div>
              <div className="text-xs opacity-90 mt-0.5">未实现盈亏: ¥{formatCurrencyDetail(statistics.unrealizedPnl).line1}</div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>

      {/* 今日盈亏 */}
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ y: -2 }}
            className={`@[1200px]:col-span-2 rounded-xl p-2.5 border transition-all duration-300 cursor-pointer min-w-0 flex flex-col ${
              isTodayProfitable 
                ? 'bg-red-50 dark:bg-red-600/90 border-red-200/40 dark:border-red-500/20 shadow-[0_1px_3px_rgba(220,38,38,0.08),0_1px_2px_rgba(220,38,38,0.04)] hover:shadow-[0_4px_12px_rgba(220,38,38,0.12),0_2px_4px_rgba(220,38,38,0.06)]' 
                : 'bg-green-50 dark:bg-green-600/90 border-green-200/40 dark:border-green-500/20 shadow-[0_1px_3px_rgba(22,163,74,0.08),0_1px_2px_rgba(22,163,74,0.04)] hover:shadow-[0_4px_12px_rgba(22,163,74,0.12),0_2px_4px_rgba(22,163,74,0.06)]'
            }`}
          >
            <ClickSpark
              sparkColor={isDark ? 'rgb(255 255 255)' : (isTodayProfitable ? 'rgb(220 38 38)' : 'rgb(22 163 74)')}
              sparkSize={10}
              sparkRadius={15}
              sparkCount={8}
              duration={400}
            >
            <div className="flex items-start justify-between mb-1.5">
              <div className={`text-[9px] font-medium uppercase tracking-wide ${
                isTodayProfitable ? 'text-red-600/70 dark:text-red-50/80' : 'text-green-600/70 dark:text-green-50/80'
              }`}>今日盈亏</div>
              {isTodayProfitable ? (
                <TrendingUp className="h-3 w-3 text-red-600 dark:text-red-50 shrink-0" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-600 dark:text-green-50 shrink-0" />
              )}
            </div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="min-w-0">
                <div className={`text-lg font-bold tabular-nums flex items-baseline gap-1 ${
                  isTodayProfitable ? 'text-red-700 dark:text-white' : 'text-green-700 dark:text-white'
                }`}>
                  <FloatingText
                    text={`${isTodayProfitable ? '+' : ''}${displayTodayProfitLoss.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
                    staggerDuration={0.035}
                  />
                  <FloatingText
                    text={displayTodayProfitLoss.unit}
                    className={`text-sm font-normal ${
                      isTodayProfitable ? 'text-red-600 dark:text-red-100' : 'text-green-600 dark:text-green-100'
                    }`}
                    staggerDuration={0.025}
                    animationKey={`${displayMode}-${displayTodayProfitLoss.value}`}
                  />
                </div>
              </div>
              <Badge 
                className={`h-5 px-1.5 text-[10px] font-bold tabular-nums shrink-0 ${
                  isTodayProfitable 
                    ? 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-800 dark:hover:bg-red-900 dark:text-red-50' 
                    : 'bg-green-600 hover:bg-green-700 text-white dark:bg-green-800 dark:hover:bg-green-900 dark:text-green-50'
                }`}
              >
                {isTodayProfitable ? (
                  <TrendingUp className="h-2.5 w-2.5 mr-0.5 inline" />
                ) : (
                  <TrendingDown className="h-2.5 w-2.5 mr-0.5 inline" />
                )}
                {isTodayProfitable ? '+' : ''}{todayProfitLossRatio}%
              </Badge>
            </div>
            
            {/* 次要信息：初始资金 - 紧凑排列 */}
            <div className="mt-auto pt-1.5 border-t border-white/20 dark:border-white/10">
              <div className="flex items-center justify-between text-[8px]">
                <span className={`${isTodayProfitable ? 'text-red-600/60 dark:text-red-100/60' : 'text-green-600/60 dark:text-green-100/60'}`}>初始资金</span>
                <span className={`font-semibold tabular-nums ${isTodayProfitable ? 'text-red-700 dark:text-red-50' : 'text-green-700 dark:text-green-50'}`}>
                  ¥{formatCurrencyValue(statistics.initialCapital).value.toLocaleString('en-US', { maximumFractionDigits: 2 })}{formatCurrencyValue(statistics.initialCapital).unit}
                </span>
              </div>
            </div>
            </ClickSpark>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <div className="font-semibold">{todayProfitLossDetail.line1}</div>
            <div className="text-xs opacity-80 mt-0.5">{todayProfitLossDetail.line2}</div>
            <div className="mt-1.5 pt-1.5 border-t border-border/30">
              <div className="text-xs opacity-90">初始资金: ¥{formatCurrencyDetail(statistics.initialCapital).line1}</div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
      </div>
    </TooltipProvider>
  );
}
