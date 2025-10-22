import { 
  ColorType, 
  createChart, 
  IChartApi, 
  ISeriesApi,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
  LogicalRangeChangeEventHandler,
  Time,
  LineData,
  HistogramData,
  LogicalRange,
} from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ChartLoadingAnimation } from './chart-loading-animation';

interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface TradeMarker {
  date: string; // 交易日期 (YYYY-MM-DD) 或时间 (HH:mm)
  type: string; // 操作类型（买入/卖出）
  price: number; // 交易价格
  quantity: number; // 交易数量
  amount: number; // 交易金额
  createdAt?: string; // 完整的创建时间（含时分秒）
}

/**
 * 图表时间周期类型
 * - minute: 分时图（1分钟）
 * - 5min: 5分钟K线
 * - 15min: 15分钟K线
 * - 30min: 30分钟K线
 * - 60min: 60分钟K线
 * - day: 日K线
 * - week: 周K线
 * - month: 月K线
 * - year: 年K线
 */
export type ChartInterval = 'minute' | '5min' | '15min' | '30min' | '60min' | 'day' | 'week' | 'month' | 'year';

/**
 * 复权类型
 * - none: 不复权
 * - forward: 前复权
 * - backward: 后复权
 */
export type AdjustType = 'none' | 'forward' | 'backward';

/**
 * 图表显示类型
 * - candlestick: K线图（蜡烛图）
 * - line: 折线图
 */
export type ChartType = 'candlestick' | 'line';

interface StockChartProps {
  /** K线/分时数据 */
  data: CandlestickData[];
  /** 图表高度 */
  height?: number;
  /** 时间周期类型 */
  interval?: ChartInterval;
  /** 图表显示类型（K线图或折线图） */
  chartType?: ChartType;
  /** 加载更多历史数据的回调 */
  onLoadMore?: () => void;
  /** 是否正在加载更多 */
  isLoadingMore?: boolean;
  /** 交易标记数据 */
  tradeMarkers?: TradeMarker[];
  /** 点击交易标记的回调 */
  onMarkerClick?: (date: string, markers: TradeMarker[]) => void;
  /** 是否显示 MA5 */
  showMA5?: boolean;
  /** 是否显示 MA10 */
  showMA10?: boolean;
}

export function StockChart(props: StockChartProps) {
  const {
    data,
    height = 400,
    interval = 'day',
    chartType = 'candlestick',
    onLoadMore,
    isLoadingMore,
    tradeMarkers = [],
    onMarkerClick,
    showMA5 = true,
    showMA10 = true,
  } = props;

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const ma5SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ma10SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const hasLoadedMoreRef = useRef(false);
  const savedRangeRef = useRef<LogicalRange | null>(null);
  const isLoadingMoreRef = useRef(false); // 追踪是否正在加载更多
  const hasPlayedAnimationRef = useRef(false); // 追踪动画是否已播放
  const [isInternalLoading, setIsInternalLoading] = useState(true);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [internalShowMA5, setInternalShowMA5] = useState(showMA5);
  const [internalShowMA10, setInternalShowMA10] = useState(showMA10);
  const [customMarkers, setCustomMarkers] = useState<Array<{
    date: string;
    type: 'buy' | 'sell';
    count: number;
    x: number;
    y: number;
  }>>([]);

  // 同步外部 props 变化
  useEffect(() => {
    setInternalShowMA5(showMA5);
  }, [showMA5]);

  useEffect(() => {
    setInternalShowMA10(showMA10);
  }, [showMA10]);

  // 计算移动平均线
  const calculateMA = (data: CandlestickData[], period: number): LineData[] => {
    const result: LineData[] = [];
    
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        // 数据不足时跳过
        continue;
      }
      
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      
      result.push({
        time: data[i].time as Time,
        value: sum / period,
      });
    }
    
    return result;
  };

  // 第一个 useEffect: 创建和管理图表实例（不依赖 data）
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 只在首次加载时显示动画
    if (!hasPlayedAnimationRef.current) {
      setIsInternalLoading(true);
    }

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight || height,
        });
      }
    };

    // 判断是否使用折线图（分时图默认用折线，其他周期可选）
    const useLineChart = chartType === 'line';
    const isMinuteInterval = interval === 'minute';

    // 创建图表
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#71717a',
        fontSize: 11,
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || height,
      grid: {
        vertLines: {
          color: 'rgba(197, 203, 206, 0.12)',
          style: 1, // 虚线
          visible: true,
        },
        horzLines: {
          color: 'rgba(197, 203, 206, 0.12)',
          style: 1, // 虚线
          visible: true,
        },
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.25)',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 10,
        barSpacing: isMinuteInterval ? 4 : 6,
        minBarSpacing: 2,
        fixLeftEdge: false,
        fixRightEdge: false,
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.25)',
        scaleMargins: {
          top: 0.08,
          bottom: 0.28, // 为底部成交量预留空间
        },
      },
      crosshair: {
        vertLine: {
          color: 'rgba(124, 58, 237, 0.5)',
          width: 1,
          style: 3, // 点线
          labelBackgroundColor: '#7c3aed',
        },
        horzLine: {
          color: 'rgba(124, 58, 237, 0.5)',
          width: 1,
          style: 3, // 点线
          labelBackgroundColor: '#7c3aed',
        },
      },
    });

    chartRef.current = chart;

    // 根据图表类型选择渲染方式
    let series: ISeriesApi<any>;
    
    if (useLineChart) {
      series = chart.addSeries(LineSeries, {
        color: '#2563eb',
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 5,
        crosshairMarkerBorderColor: '#2563eb',
        crosshairMarkerBackgroundColor: '#ffffff',
        crosshairMarkerBorderWidth: 2,
        lastValueVisible: true,
        priceLineVisible: true,
        priceLineWidth: 1,
        priceLineColor: '#2563eb',
        priceLineStyle: 3, // 点线
      });
    } else {
      series = chart.addSeries(CandlestickSeries, {
        upColor: '#ef4444',
        downColor: '#22c55e',
        borderUpColor: '#ef4444',
        borderDownColor: '#22c55e',
        wickUpColor: '#ef4444',
        wickDownColor: '#22c55e',
        borderVisible: true,
        wickVisible: true,
      });
    }

    seriesRef.current = series;

    // 添加成交量柱状图（半透明，底部显示）
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // 使用右侧价格刻度的叠加
    });

    // 配置成交量的价格刻度（占据底部25%空间，与主图协调）
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.72, // 成交量从72%处开始
        bottom: 0, // 底部不留边距，充分利用空间
      },
    });

    volumeSeriesRef.current = volumeSeries;

    // 添加 MA5 均线（紫色虚线）
    const ma5Series = chart.addSeries(LineSeries, {
      color: '#8b5cf6',
      lineWidth: 1,
      lineStyle: 2, // 虚线
      crosshairMarkerVisible: false,
      lastValueVisible: true,
      priceLineVisible: false,
      title: 'MA5',
    });
    ma5SeriesRef.current = ma5Series;

    // 添加 MA10 均线（橙色虚线）
    const ma10Series = chart.addSeries(LineSeries, {
      color: '#f97316',
      lineWidth: 1,
      lineStyle: 2, // 虚线
      crosshairMarkerVisible: false,
      lastValueVisible: true,
      priceLineVisible: false,
      title: 'MA10',
    });
    ma10SeriesRef.current = ma10Series;

    // 监听可见范围变化，实现无限加载
    const handleVisibleLogicalRangeChange: LogicalRangeChangeEventHandler = (newRange) => {
      if (!newRange || !onLoadMore || isLoadingMore) return;
      
      // 始终保存当前范围（即使不触发加载）
      savedRangeRef.current = newRange;
      
      // 当用户滚动到最左边时触发加载
      if (newRange.from < 20 && !hasLoadedMoreRef.current && !isLoadingMoreRef.current) {
        hasLoadedMoreRef.current = true;
        isLoadingMoreRef.current = true; // 标记正在加载更多
        onLoadMore();
        
        setTimeout(() => {
          hasLoadedMoreRef.current = false;
        }, 1000);
      }
    };

    chart.timeScale().subscribeVisibleLogicalRangeChange(handleVisibleLogicalRangeChange);

    // 添加十字线移动事件监听，实现 tooltip
    const handleCrosshairMove = (param: any) => {
      if (!tooltipRef.current || !chartContainerRef.current) return;

      if (
        !param.time ||
        param.point === undefined ||
        param.point.x < 0 ||
        param.point.y < 0
      ) {
        tooltipRef.current.style.display = 'none';
        return;
      }

      // 获取各系列数据
      const mainData = param.seriesData.get(series);
      const volumeData = param.seriesData.get(volumeSeries);
      const ma5Data = param.seriesData.get(ma5Series);
      const ma10Data = param.seriesData.get(ma10Series);

      if (!mainData) {
        tooltipRef.current.style.display = 'none';
        return;
      }

      // 构建 tooltip 内容
      let tooltipContent = '';
      
      // 时间
      tooltipContent += `<div class="text-xs text-muted-foreground mb-1.5">${param.time}</div>`;
      
      // K线数据或折线数据
      if (useLineChart) {
        tooltipContent += `<div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-medium text-blue-500">价格:</span>
          <span class="text-xs font-semibold">${mainData.value?.toFixed(2)}</span>
        </div>`;
      } else {
        tooltipContent += `<div class="grid grid-cols-2 gap-x-3 gap-y-1 mb-1.5">
          <div class="flex items-center gap-1.5">
            <span class="text-xs text-muted-foreground">开:</span>
            <span class="text-xs font-medium">${mainData.open?.toFixed(2)}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-xs text-muted-foreground">收:</span>
            <span class="text-xs font-medium">${mainData.close?.toFixed(2)}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-xs text-muted-foreground">高:</span>
            <span class="text-xs font-medium text-red-500">${mainData.high?.toFixed(2)}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-xs text-muted-foreground">低:</span>
            <span class="text-xs font-medium text-green-500">${mainData.low?.toFixed(2)}</span>
          </div>
        </div>`;
      }

      // 成交量
      if (volumeData) {
        const volume = volumeData.value || 0;
        const volumeStr = volume >= 10000 ? `${(volume / 10000).toFixed(2)}万` : volume.toFixed(0);
        tooltipContent += `<div class="flex items-center gap-2 mb-1">
          <span class="text-xs text-muted-foreground">量:</span>
          <span class="text-xs font-medium">${volumeStr}</span>
        </div>`;
      }

      // MA 均线（仅在显示时展示）
      if ((ma5Data && internalShowMA5) || (ma10Data && internalShowMA10)) {
        tooltipContent += `<div class="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-border/50">`;
        if (ma5Data && internalShowMA5) {
          tooltipContent += `<div class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full" style="background: #8b5cf6"></div>
            <span class="text-xs font-medium text-muted-foreground">MA5:</span>
            <span class="text-xs font-semibold">${ma5Data.value?.toFixed(2)}</span>
          </div>`;
        }
        if (ma10Data && internalShowMA10) {
          tooltipContent += `<div class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full" style="background: #f97316"></div>
            <span class="text-xs font-medium text-muted-foreground">MA10:</span>
            <span class="text-xs font-semibold">${ma10Data.value?.toFixed(2)}</span>
          </div>`;
        }
        tooltipContent += `</div>`;
      }

      tooltipRef.current.innerHTML = tooltipContent;
      tooltipRef.current.style.display = 'block';

      // 定位 tooltip
      const containerRect = chartContainerRef.current.getBoundingClientRect();
      const tooltipWidth = tooltipRef.current.offsetWidth;
      const tooltipHeight = tooltipRef.current.offsetHeight;
      
      let left = param.point.x + 15;
      let top = param.point.y + 15;

      // 防止 tooltip 超出右边界
      if (left + tooltipWidth > containerRect.width) {
        left = param.point.x - tooltipWidth - 15;
      }

      // 防止 tooltip 超出底部边界
      if (top + tooltipHeight > containerRect.height) {
        top = param.point.y - tooltipHeight - 15;
      }

      tooltipRef.current.style.left = `${left}px`;
      tooltipRef.current.style.top = `${top}px`;
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);

    // 不再延迟设置加载状态，由动画控制器负责

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      seriesRef.current = null;
    };
  }, [height, interval, chartType, onLoadMore, isLoadingMore]);

  // 第二个 useEffect: 更新数据和标记（保持滚动位置）
  useEffect(() => {
    if (!chartRef.current || !seriesRef.current || data.length === 0) return;

    const series = seriesRef.current;
    const volumeSeries = volumeSeriesRef.current;
    const chart = chartRef.current;
    const useLineChart = chartType === 'line';

    // 保存当前的可见范围（在更新数据前）
    const currentRange = chart.timeScale().getVisibleLogicalRange();
    const isLoadingMoreData = isLoadingMoreRef.current;
    const shouldPreserveRange = isLoadingMoreData && !!currentRange;

    // 更新主图数据
    if (useLineChart) {
      const lineData: LineData[] = data.map(item => ({
        time: item.time as Time,
        value: item.close,
      }));
      series.setData(lineData);
    } else {
      series.setData(data);
    }

    // 更新成交量数据（根据涨跌着色）
    if (volumeSeries) {
      const volumeData: HistogramData[] = data.map((item, index) => {
        // 判断是涨还是跌（红涨绿跌）
        const prevClose = index > 0 ? data[index - 1].close : item.open;
        const isUp = item.close >= prevClose;
        
        return {
          time: item.time as Time,
          value: item.volume || 0,
          color: isUp ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)', // 半透明红/绿
        };
      });
      volumeSeries.setData(volumeData);
    }

    // 更新 MA5 和 MA10 均线数据（根据显示状态）
    if (ma5SeriesRef.current) {
      if (internalShowMA5) {
        const ma5Data = calculateMA(data, 5);
        ma5SeriesRef.current.setData(ma5Data);
      } else {
        ma5SeriesRef.current.setData([]);
      }
    }

    if (ma10SeriesRef.current) {
      if (internalShowMA10) {
        const ma10Data = calculateMA(data, 10);
        ma10SeriesRef.current.setData(ma10Data);
      } else {
        ma10SeriesRef.current.setData([]);
      }
    }

    // 处理交易标记 - 计算位置并更新自定义标记
    const markersByDate = new Map<string, TradeMarker[]>();
    tradeMarkers.forEach(marker => {
      const existing = markersByDate.get(marker.date) || [];
      existing.push(marker);
      markersByDate.set(marker.date, existing);
    });

    // 更新自定义标记位置
    const updateMarkersPosition = () => {
      if (!chart || !series) return;

      const newMarkers: Array<{
        date: string;
        type: 'buy' | 'sell';
        count: number;
        x: number;
        y: number;
      }> = [];

      markersByDate.forEach((trades, date) => {
        const buyTrades = trades.filter(t => t.type.includes('买'));
        const sellTrades = trades.filter(t => t.type.includes('卖'));
        const buyCount = buyTrades.length;
        const sellCount = sellTrades.length;

        // 获取该时间点的价格数据
        const timeScale = chart.timeScale();
        const coordinate = timeScale.timeToCoordinate(date as Time);
        
        if (coordinate === null) return;

        // 获取该时间点的价格
        const priceData = data.find(d => d.time === date);
        if (!priceData) return;

        if (buyCount > 0) {
          const yCoordinate = series.priceToCoordinate(priceData.low);
          if (yCoordinate !== null) {
            newMarkers.push({
              date,
              type: 'buy',
              count: buyCount,
              x: coordinate,
              y: yCoordinate + 25, // 在K线下方
            });
          }
        }

        if (sellCount > 0) {
          const yCoordinate = series.priceToCoordinate(priceData.high);
          if (yCoordinate !== null) {
            newMarkers.push({
              date,
              type: 'sell',
              count: sellCount,
              x: coordinate,
              y: yCoordinate - 25, // 在K线上方
            });
          }
        }
      });

      setCustomMarkers(newMarkers);
    };

    updateMarkersPosition();

    // 监听时间轴变化，更新标记位置
    const handleVisibleRangeChange = () => {
      updateMarkersPosition();
    };

    chart.timeScale().subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

    // 恢复或设置可见范围
    if (shouldPreserveRange && currentRange) {
      // 保持当前滚动位置（加载更多时的关键）
      chart.timeScale().setVisibleLogicalRange(currentRange);
    } else {
      // 首次加载，显示最近的100根K线
      const visibleBars = Math.min(100, data.length);
      const from = Math.max(0, data.length - visibleBars);
      const to = data.length - 1;
      
      chart.timeScale().setVisibleLogicalRange({
        from: from,
        to: to,
      });
    }

    // 添加点击事件处理
    const handleChartClick = (param: any) => {
      if (!param.time || !onMarkerClick) return;
      
      const clickedTime = param.time as string;
      const markersAtTime = markersByDate.get(clickedTime);
      if (markersAtTime && markersAtTime.length > 0) {
        onMarkerClick(clickedTime, markersAtTime);
      }
    };

    chart.subscribeClick(handleChartClick);

    return () => {
      chart.unsubscribeClick(handleChartClick);
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
    };
  }, [data, tradeMarkers, chartType, onMarkerClick, internalShowMA5, internalShowMA10]);

  return (
    <div className="relative w-full h-full">
      {/* K线加载动画 */}
      {isInternalLoading && (
        <ChartLoadingAnimation 
          height={height} 
          onComplete={() => {
            setIsInternalLoading(false);
            hasPlayedAnimationRef.current = true; // 标记动画已播放
          }}
          realData={data} // 传递真实股票数据
        />
      )}

      {/* MA 均线控制面板 - 小徽章样式 */}
      {!isInternalLoading && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5">
          <button
            onClick={() => setInternalShowMA5(!internalShowMA5)}
            className="px-1.5 py-0.5 text-[10px] font-medium rounded transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: internalShowMA5 ? '#8b5cf6' : 'rgba(139, 92, 246, 0.1)',
              color: internalShowMA5 ? 'white' : '#8b5cf6',
              border: `1px solid ${internalShowMA5 ? '#8b5cf6' : 'rgba(139, 92, 246, 0.3)'}`,
            }}
          >
            MA5
          </button>
          <button
            onClick={() => setInternalShowMA10(!internalShowMA10)}
            className="px-1.5 py-0.5 text-[10px] font-medium rounded transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: internalShowMA10 ? '#f97316' : 'rgba(249, 115, 22, 0.1)',
              color: internalShowMA10 ? 'white' : '#f97316',
              border: `1px solid ${internalShowMA10 ? '#f97316' : 'rgba(249, 115, 22, 0.3)'}`,
            }}
          >
            MA10
          </button>
        </div>
      )}

      {/* 加载更多提示器 */}
      {isLoadingMore && !isInternalLoading && (
        <div className="absolute top-4 left-4 z-20 bg-background/95 backdrop-blur-md border border-primary/30 rounded-lg px-3 py-2 animate-in fade-in slide-in-from-left-5 duration-300">
          <div className="flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            <span className="text-xs font-medium text-foreground">加载更多历史数据...</span>
          </div>
        </div>
      )}

      {/* 图表容器 */}
      <div
        ref={chartContainerRef}
        className="w-full h-full overflow-hidden bg-transparent transition-all duration-500"
        style={{ 
          opacity: isInternalLoading ? 0 : 1,
        }}
      />

      {/* Tooltip 提示框 */}
      <div
        ref={tooltipRef}
        className="absolute hidden z-30 bg-background/95 backdrop-blur-md border border-border/60 rounded-lg px-3 py-2 pointer-events-none"
        style={{
          maxWidth: '280px',
        }}
      />

      {/* 自定义买卖标记 - DOM 元素 */}
      {!isInternalLoading && customMarkers.map((marker, index) => (
        <div
          key={`${marker.date}-${marker.type}-${index}`}
          className="absolute z-25 cursor-pointer group"
          style={{
            left: `${marker.x}px`,
            top: `${marker.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
          onClick={() => {
            const markersAtTime = tradeMarkers.filter(t => t.date === marker.date);
            if (onMarkerClick && markersAtTime.length > 0) {
              onMarkerClick(marker.date, markersAtTime);
            }
          }}
        >
          {marker.type === 'buy' ? (
            // 买入标记 - 精致红色圆点 + 数字徽章
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-red-500 ring-2 ring-red-500/30 group-hover:ring-4 group-hover:ring-red-500/40 transition-all duration-200" />
              {marker.count > 1 && (
                <div className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[8px] font-bold shadow-sm border border-white/20">
                  {marker.count}
                </div>
              )}
            </div>
          ) : (
            // 卖出标记 - 精致绿色圆点 + 数字徽章
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-green-500 ring-2 ring-green-500/30 group-hover:ring-4 group-hover:ring-green-500/40 transition-all duration-200" />
              {marker.count > 1 && (
                <div className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-1 flex items-center justify-center rounded-full bg-green-500 text-white text-[8px] font-bold shadow-sm border border-white/20">
                  {marker.count}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

