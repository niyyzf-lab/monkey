import { BarChart3, LineChart as LineChartIcon, Database, MoreHorizontal } from 'lucide-react';
import { ChartInterval, ChartType, AdjustType } from './chart-stock-chart';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useState } from 'react';

interface ChartControlsProps {
  /** 当前时间周期 */
  interval: ChartInterval;
  /** 当前图表类型 */
  chartType: ChartType;
  /** 当前复权类型 */
  adjustType?: AdjustType;
  /** 时间周期改变回调 */
  onIntervalChange: (interval: ChartInterval) => void;
  /** 图表类型改变回调 */
  onChartTypeChange: (chartType: ChartType) => void;
  /** 复权类型改变回调 */
  onAdjustTypeChange?: (adjustType: AdjustType) => void;
  /** 是否显示加载状态 */
  isLoading?: boolean;
  /** 数据条数显示 */
  dataCount?: number;
}

// 时间周期选项
const intervals: { value: ChartInterval; label: string }[] = [
  { value: 'minute', label: '分时' },
  { value: '5min', label: '5分' },
  { value: '15min', label: '15分' },
  { value: '60min', label: '60分' },
  { value: 'day', label: '日K' },
  { value: 'week', label: '周K' },
  { value: 'month', label: '月K' },
  { value: 'year', label: '年K' },
];

// 移动端常用时间周期（显示在外面）
const mobileCommonIntervals: ChartInterval[] = ['day', 'week', 'month'];

// 移动端更多时间周期（折叠在 Popover 中）
const mobileMoreIntervals: ChartInterval[] = ['minute', '5min', '15min', '60min', 'year'];

// 复权类型选项
const adjustTypes: { value: AdjustType; label: string }[] = [
  { value: 'none', label: '不复权' },
  { value: 'forward', label: '前复权' },
  { value: 'backward', label: '后复权' },
];

/**
 * 图表控制面板组件
 * 提供时间周期切换和图表类型切换功能
 */
export function ChartControls(props: ChartControlsProps) {
  const {
    interval,
    chartType,
    adjustType = 'forward',
    onIntervalChange,
    onChartTypeChange,
    onAdjustTypeChange,
    isLoading = false,
    dataCount,
  } = props;
  
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1], // 自定义贝塞尔曲线，更优雅的缓动
      }}
      className="rounded-lg border border-border/40 bg-card px-2 md:px-3 py-2"
    >
      {/* 桌面端：完整布局 */}
      <div className="hidden md:flex items-center justify-between gap-3">
        {/* 左侧：时间周期切换器 */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-md p-0.5">
          {intervals.map((item) => (
            <motion.button
              key={item.value}
              onClick={() => onIntervalChange(item.value)}
              disabled={isLoading}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 17 
              }}
              className={cn(
                "px-2.5 py-1 text-[11px] font-medium rounded transition-all duration-200",
                "hover:bg-background/80",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                interval === item.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </motion.button>
          ))}
        </div>
        
        {/* 右侧控制器 */}
        <div className="flex items-center gap-2">
          {/* 复权类型 */}
          {onAdjustTypeChange && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground">复权:</span>
              <div className="flex items-center gap-1 bg-muted/50 rounded-md p-0.5">
                {adjustTypes.map((item) => (
                  <motion.button
                    key={item.value}
                    onClick={() => onAdjustTypeChange(item.value)}
                    disabled={isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 17 
                    }}
                    className={cn(
                      "px-2 py-0.5 text-[10px] font-medium rounded transition-all duration-200",
                      "hover:bg-background/80",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      adjustType === item.value
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* 数据条数 */}
          {dataCount !== undefined && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.85, x: -5 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ 
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex items-center gap-1.5 px-2 py-1 bg-muted/30 rounded"
            >
              <Database className="h-3 w-3 text-muted-foreground" />
              <span className={cn(
                "text-[10px] font-medium tabular-nums",
                isLoading ? "text-primary animate-pulse" : "text-muted-foreground"
              )}>
                {isLoading ? '加载中...' : `${dataCount.toLocaleString()}`}
              </span>
            </motion.div>
          )}
          
          {/* 图表类型切换 */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-md p-0.5">
            <motion.button
              onClick={() => onChartTypeChange('candlestick')}
              disabled={isLoading}
              whileHover={{ scale: 1.1, rotate: -3 }}
              whileTap={{ scale: 0.9 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 17 
              }}
              className={cn(
                "p-1.5 rounded transition-all duration-200",
                "hover:bg-background/80",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                chartType === 'candlestick'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
              title="K线图"
            >
              <BarChart3 className="h-3.5 w-3.5" />
            </motion.button>
            <motion.button
              onClick={() => onChartTypeChange('line')}
              disabled={isLoading}
              whileHover={{ scale: 1.1, rotate: 3 }}
              whileTap={{ scale: 0.9 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 17 
              }}
              className={cn(
                "p-1.5 rounded transition-all duration-200",
                "hover:bg-background/80",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                chartType === 'line'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
              title="折线图"
            >
              <LineChartIcon className="h-3.5 w-3.5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* 移动端：折叠布局 */}
      <div className="flex md:hidden items-center justify-between gap-2">
        {/* 左侧：常用时间周期 + 更多按钮 */}
        <div className="flex items-center gap-1">
          {/* 常用时间周期 */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-md p-0.5">
            {mobileCommonIntervals.map((value) => {
              const item = intervals.find(i => i.value === value)!;
              return (
                <motion.button
                  key={item.value}
                  onClick={() => onIntervalChange(item.value)}
                  disabled={isLoading}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 17 
                  }}
                  className={cn(
                    "px-2 py-1 text-[10px] font-medium rounded transition-all duration-200",
                    "hover:bg-background/80",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    interval === item.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </motion.button>
              );
            })}
          </div>
          
          {/* 更多选项 Popover */}
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "p-1.5 rounded-md transition-all duration-200",
                  "bg-muted/50 hover:bg-muted",
                  "text-muted-foreground",
                  popoverOpen && "bg-primary text-primary-foreground"
                )}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </motion.button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <div className="space-y-3">
                {/* 更多时间周期 */}
                <div className="space-y-2">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    更多周期
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {mobileMoreIntervals.map((value) => {
                      const item = intervals.find(i => i.value === value)!;
                      return (
                        <button
                          key={item.value}
                          onClick={() => {
                            onIntervalChange(item.value);
                            setPopoverOpen(false);
                          }}
                          disabled={isLoading}
                          className={cn(
                            "px-2 py-1.5 text-[10px] font-medium rounded transition-all duration-200",
                            "hover:bg-muted",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            interval === item.value
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground bg-muted/50"
                          )}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 复权类型 */}
                {onAdjustTypeChange && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                      复权类型
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {adjustTypes.map((item) => (
                        <button
                          key={item.value}
                          onClick={() => {
                            onAdjustTypeChange(item.value);
                          }}
                          disabled={isLoading}
                          className={cn(
                            "px-2 py-1.5 text-[10px] font-medium rounded transition-all duration-200",
                            "hover:bg-muted",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            adjustType === item.value
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground bg-muted/50"
                          )}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 数据条数 */}
                {dataCount !== undefined && (
                  <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-muted-foreground">
                        数据条数
                      </span>
                      <span className={cn(
                        "text-[11px] font-semibold tabular-nums",
                        isLoading ? "text-primary animate-pulse" : "text-foreground"
                      )}>
                        {isLoading ? '加载中...' : dataCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* 右侧：图表类型切换 */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-md p-0.5">
          <motion.button
            onClick={() => onChartTypeChange('candlestick')}
            disabled={isLoading}
            whileHover={{ scale: 1.1, rotate: -3 }}
            whileTap={{ scale: 0.9 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 17 
            }}
            className={cn(
              "p-1.5 rounded transition-all duration-200",
              "hover:bg-background/80",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              chartType === 'candlestick'
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground"
            )}
            title="K线图"
          >
            <BarChart3 className="h-3.5 w-3.5" />
          </motion.button>
          <motion.button
            onClick={() => onChartTypeChange('line')}
            disabled={isLoading}
            whileHover={{ scale: 1.1, rotate: 3 }}
            whileTap={{ scale: 0.9 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 17 
            }}
            className={cn(
              "p-1.5 rounded transition-all duration-200",
              "hover:bg-background/80",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              chartType === 'line'
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground"
            )}
            title="折线图"
          >
            <LineChartIcon className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

