import { HoldingsStatistics } from '../../types/holdings';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, JapaneseYen } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrencyValue, formatCurrencyDetail } from '../../lib/formatters';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import ClickSpark from '../ui/ClickSpark';
import FloatingText from '../FloatingText';

interface StatisticsCardsProps {
  statistics: HoldingsStatistics;
  todayTotalProfitLoss: number;
  displayMode: 'auto' | 'yuan';
}

export function StatisticsCards({ statistics, todayTotalProfitLoss, displayMode }: StatisticsCardsProps) {
  
  const profitLossPercentage = statistics.totalCost > 0
    ? ((statistics.totalProfitLoss / statistics.totalCost) * 100).toFixed(2)
    : '0.00';
  
  const todayProfitLossPercentage = statistics.totalMarketValue > 0
    ? ((todayTotalProfitLoss / statistics.totalMarketValue) * 100).toFixed(2)
    : '0.00';
  
  const isProfitable = statistics.totalProfitLoss >= 0;
  const isTodayProfitable = todayTotalProfitLoss >= 0;
  
  // 智能模式格式化
  const marketValue = formatCurrencyValue(statistics.totalMarketValue);
  const totalCost = formatCurrencyValue(statistics.totalCost);
  const profitLoss = formatCurrencyValue(statistics.totalProfitLoss);
  const todayProfitLoss = formatCurrencyValue(todayTotalProfitLoss);
  
  // 元模式格式化（始终显示为元，保留2位小数）
  const marketValueYuan = {
    value: Math.round(statistics.totalMarketValue * 100) / 100,
    unit: '元'
  };
  const totalCostYuan = {
    value: Math.round(statistics.totalCost * 100) / 100,
    unit: '元'
  };
  const profitLossYuan = {
    value: Math.round(statistics.totalProfitLoss * 100) / 100,
    unit: '元'
  };
  const todayProfitLossYuan = {
    value: Math.round(todayTotalProfitLoss * 100) / 100,
    unit: '元'
  };
  
  // 根据模式选择显示的值
  const displayMarketValue = displayMode === 'yuan' ? marketValueYuan : marketValue;
  const displayTotalCost = displayMode === 'yuan' ? totalCostYuan : totalCost;
  const displayProfitLoss = displayMode === 'yuan' ? profitLossYuan : profitLoss;
  const displayTodayProfitLoss = displayMode === 'yuan' ? todayProfitLossYuan : todayProfitLoss;
  
  // 格式化详细信息用于 Tooltip
  const marketValueDetail = formatCurrencyDetail(statistics.totalMarketValue);
  const totalCostDetail = formatCurrencyDetail(statistics.totalCost);
  const profitLossDetail = formatCurrencyDetail(statistics.totalProfitLoss);
  const todayProfitLossDetail = formatCurrencyDetail(todayTotalProfitLoss);

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
            whileHover={{ y: -4 }}
            className="@[1200px]:col-span-1 rounded-lg border border-border/60 dark:border-0 bg-gradient-to-br from-card via-card to-card/95 dark:from-muted dark:via-muted/80 dark:to-secondary p-3 shadow-sm hover:shadow-lg hover:border-blue-500/40 dark:hover:shadow-blue-500/10 transition-all cursor-pointer min-w-0 relative overflow-hidden"
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
              <div className="flex items-start justify-between mb-2 relative z-10">
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">总市值</div>
                <JapaneseYen className="h-3.5 w-3.5 text-blue-500/70 dark:text-blue-400 shrink-0" />
              </div>
              <div className="text-xl font-bold tabular-nums text-foreground relative z-10 flex items-baseline gap-1">
                <span className="text-base font-bold text-muted-foreground">¥</span>
                <FloatingText
                  text={displayMarketValue.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  staggerDuration={0.035}
                />
                <FloatingText
                  text={displayMarketValue.unit}
                  className="text-xs font-normal text-muted-foreground"
                  staggerDuration={0.025}
                  animationKey={`${displayMode}-${displayMarketValue.value}`}
                />
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Market Value</div>
            </ClickSpark>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <div className="font-semibold">{marketValueDetail.line1}</div>
            <div className="text-xs opacity-80 mt-0.5">{marketValueDetail.line2}</div>
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
            whileHover={{ y: -4 }}
            className="@[1200px]:col-span-1 rounded-lg border border-border/60 dark:border-0 bg-gradient-to-br from-card via-card to-card/95 dark:from-muted dark:via-muted/80 dark:to-secondary p-3 shadow-sm hover:shadow-lg hover:border-purple-500/40 dark:hover:shadow-purple-500/10 transition-all cursor-pointer min-w-0 relative overflow-hidden"
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
              <div className="flex items-start justify-between mb-2 relative z-10">
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">总成本</div>
                <JapaneseYen className="h-3.5 w-3.5 text-purple-500/70 dark:text-purple-400 shrink-0" />
              </div>
              <div className="text-xl font-bold tabular-nums text-foreground relative z-10 flex items-baseline gap-1">
                <span className="text-base font-bold text-muted-foreground">¥</span>
                <FloatingText
                  text={displayTotalCost.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  staggerDuration={0.035}
                />
                <FloatingText
                  text={displayTotalCost.unit}
                  className="text-xs font-normal text-muted-foreground"
                  staggerDuration={0.025}
                  animationKey={`${displayMode}-${displayTotalCost.value}`}
                />
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Total Cost</div>
            </ClickSpark>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <div className="font-semibold">{totalCostDetail.line1}</div>
            <div className="text-xs opacity-80 mt-0.5">{totalCostDetail.line2}</div>
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
            whileHover={{ y: -4 }}
            className={`@[1200px]:col-span-2 rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer min-w-0 ${
              isProfitable 
                ? 'bg-red-50 dark:bg-red-600/90' 
                : 'bg-green-50 dark:bg-green-600/90'
            }`}
          >
            <ClickSpark
              sparkColor='rgb(255 255 255)'
              sparkSize={10}
              sparkRadius={15}
              sparkCount={8}
              duration={400}
            >
            <div className="flex items-start justify-between mb-2">
              <div className={`text-[10px] font-medium uppercase tracking-wide ${
                isProfitable ? 'text-red-600/70 dark:text-red-50/80' : 'text-green-600/70 dark:text-green-50/80'
              }`}>总盈亏</div>
              {isProfitable ? (
                <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-50 shrink-0" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-50 shrink-0" />
              )}
            </div>
            <div className="flex items-end justify-between gap-2 flex-wrap">
              <div className="min-w-0">
                <div className={`text-2xl font-bold tabular-nums flex items-baseline gap-1 ${
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
                <div className={`text-[10px] mt-0.5 ${
                  isProfitable ? 'text-red-500/60 dark:text-red-100/70' : 'text-green-500/60 dark:text-green-100/70'
                }`}>Total P/L</div>
              </div>
              <Badge 
                className={`h-7 px-2.5 text-xs font-bold tabular-nums shrink-0 ${
                  isProfitable 
                    ? 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-800 dark:hover:bg-red-900 dark:text-red-50' 
                    : 'bg-green-600 hover:bg-green-700 text-white dark:bg-green-800 dark:hover:bg-green-900 dark:text-green-50'
                }`}
              >
                {isProfitable ? (
                  <TrendingUp className="h-3 w-3 mr-1 inline" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 inline" />
                )}
                {isProfitable ? '+' : ''}{profitLossPercentage}%
              </Badge>
            </div>
            </ClickSpark>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <div className="font-semibold">{profitLossDetail.line1}</div>
            <div className="text-xs opacity-80 mt-0.5">{profitLossDetail.line2}</div>
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
            whileHover={{ y: -4 }}
            className={`@[1200px]:col-span-2 rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer min-w-0 ${
              isTodayProfitable 
                ? 'bg-red-50 dark:bg-red-600/90' 
                : 'bg-green-50 dark:bg-green-600/90'
            }`}
          >
            <ClickSpark
              sparkColor='rgb(255 255 255)'
              sparkSize={10}
              sparkRadius={15}
              sparkCount={8}
              duration={400}
            >
            <div className="flex items-start justify-between mb-2">
              <div className={`text-[10px] font-medium uppercase tracking-wide ${
                isTodayProfitable ? 'text-red-600/70 dark:text-red-50/80' : 'text-green-600/70 dark:text-green-50/80'
              }`}>今日盈亏</div>
              {isTodayProfitable ? (
                <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-50 shrink-0" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-50 shrink-0" />
              )}
            </div>
            <div className="flex items-end justify-between gap-2 flex-wrap">
              <div className="min-w-0">
                <div className={`text-2xl font-bold tabular-nums flex items-baseline gap-1 ${
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
                <div className={`text-[10px] mt-0.5 ${
                  isTodayProfitable ? 'text-red-500/60 dark:text-red-100/70' : 'text-green-500/60 dark:text-green-100/70'
                }`}>Today P/L</div>
              </div>
              <Badge 
                className={`h-7 px-2.5 text-xs font-bold tabular-nums shrink-0 ${
                  isTodayProfitable 
                    ? 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-800 dark:hover:bg-red-900 dark:text-red-50' 
                    : 'bg-green-600 hover:bg-green-700 text-white dark:bg-green-800 dark:hover:bg-green-900 dark:text-green-50'
                }`}
              >
                {isTodayProfitable ? (
                  <TrendingUp className="h-3 w-3 mr-1 inline" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 inline" />
                )}
                {isTodayProfitable ? '+' : ''}{todayProfitLossPercentage}%
              </Badge>
            </div>
            </ClickSpark>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <div className="font-semibold">{todayProfitLossDetail.line1}</div>
            <div className="text-xs opacity-80 mt-0.5">{todayProfitLossDetail.line2}</div>
          </div>
        </TooltipContent>
      </Tooltip>
      </div>
    </TooltipProvider>
  );
}
