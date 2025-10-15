import { HoldingsStatistics } from '../../types/holdings';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, Wallet, DollarSign, PieChart, ArrowLeftRight } from 'lucide-react';
import { motion } from 'motion/react';
import CountUp from './hold-count-up';
import { formatCurrencyValue, formatCurrencyDetail } from '../../lib/formatters';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useStatisticsDisplayMode } from '../../hooks/use-statistics-display-mode';
import ClickSpark from '../ui/ClickSpark';
import FloatingText from '../FloatingText';

interface StatisticsCardsProps {
  statistics: HoldingsStatistics;
}

export function StatisticsCards({ statistics }: StatisticsCardsProps) {
  // 显示模式：从 localStorage 读取和保存
  const { displayMode, setDisplayMode } = useStatisticsDisplayMode();
  
  const profitLossPercentage = statistics.totalCost > 0
    ? ((statistics.totalProfitLoss / statistics.totalCost) * 100).toFixed(2)
    : '0.00';
  
  const isProfitable = statistics.totalProfitLoss >= 0;
  
  // 智能模式格式化
  const marketValue = formatCurrencyValue(statistics.totalMarketValue);
  const totalCost = formatCurrencyValue(statistics.totalCost);
  const profitLoss = formatCurrencyValue(statistics.totalProfitLoss);
  
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
  
  // 根据模式选择显示的值
  const displayMarketValue = displayMode === 'yuan' ? marketValueYuan : marketValue;
  const displayTotalCost = displayMode === 'yuan' ? totalCostYuan : totalCost;
  const displayProfitLoss = displayMode === 'yuan' ? profitLossYuan : profitLoss;
  
  // 格式化详细信息用于 Tooltip
  const marketValueDetail = formatCurrencyDetail(statistics.totalMarketValue);
  const totalCostDetail = formatCurrencyDetail(statistics.totalCost);
  const profitLossDetail = formatCurrencyDetail(statistics.totalProfitLoss);

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 @[800px]:grid-cols-5 gap-2 @sm:gap-3">
      {/* 持仓支数 - 扁平化设计 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0 }}
        whileHover={{ y: -4 }}
        className="rounded-lg border border-border/60 dark:border-0 bg-gradient-to-br from-card via-card to-card/95 dark:from-muted dark:via-muted/80 dark:to-secondary p-3 shadow-sm hover:shadow-lg hover:border-primary/40 dark:hover:shadow-primary/10 transition-all cursor-pointer min-w-0 relative overflow-hidden"
      >
        {/* 顶部高光 */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 dark:via-white/30 to-transparent" />
        <ClickSpark
          sparkColor='hsl(var(--primary))'
          sparkSize={10}
          sparkRadius={15}
          sparkCount={8}
          duration={400}
        >
          <div className="flex items-start justify-between mb-2 relative z-10">
            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">持仓支数</div>
            <PieChart className="h-3.5 w-3.5 text-primary/70 dark:text-primary shrink-0" />
          </div>
          <div className="text-xl font-bold tabular-nums text-foreground relative z-10">
            <CountUp
              from={0}
              to={statistics.totalStocks}
              duration={0.3}
              separator=","
              className="tabular-nums"
            />
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Total Stocks</div>
        </ClickSpark>
      </motion.div>

      {/* 总市值 */}
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            whileHover={{ y: -4 }}
            className="rounded-lg border border-border/60 dark:border-0 bg-gradient-to-br from-card via-card to-card/95 dark:from-muted dark:via-muted/80 dark:to-secondary p-3 shadow-sm hover:shadow-lg hover:border-blue-500/40 dark:hover:shadow-blue-500/10 transition-all cursor-pointer min-w-0 relative overflow-hidden"
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
                <Wallet className="h-3.5 w-3.5 text-blue-500/70 dark:text-blue-400 shrink-0" />
              </div>
              <div className="text-xl font-bold tabular-nums text-foreground relative z-10 flex items-baseline gap-1">
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
            className="rounded-lg border border-border/60 dark:border-0 bg-gradient-to-br from-card via-card to-card/95 dark:from-muted dark:via-muted/80 dark:to-secondary p-3 shadow-sm hover:shadow-lg hover:border-purple-500/40 dark:hover:shadow-purple-500/10 transition-all cursor-pointer min-w-0 relative overflow-hidden"
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
                <DollarSign className="h-3.5 w-3.5 text-purple-500/70 dark:text-purple-400 shrink-0" />
              </div>
              <div className="text-xl font-bold tabular-nums text-foreground relative z-10 flex items-baseline gap-1">
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

      {/* 总盈亏 - 纯色背景版，小屏占满一行，大屏占2列 */}
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            whileHover={{ y: -4 }}
            className={`col-span-1 @[800px]:col-span-2 rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer min-w-0 ${
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
              <div className="flex items-center gap-1.5">
                <div className={`text-[10px] font-medium uppercase tracking-wide ${
                  isProfitable ? 'text-red-600/70 dark:text-red-50/80' : 'text-green-600/70 dark:text-green-50/80'
                }`}>总盈亏</div>
                {/* 切换按钮 - 控制全部4个卡片 */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDisplayMode(displayMode === 'yuan' ? 'auto' : 'yuan');
                      }}
                      className={`p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                        isProfitable ? 'text-red-600/60 dark:text-red-50/60' : 'text-green-600/60 dark:text-green-50/60'
                      }`}
                    >
                      <ArrowLeftRight className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{displayMode === 'yuan' ? '切换到智能模式（万/元）' : '切换到元模式'}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
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
      </div>
    </TooltipProvider>
  );
}
