import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { fetchOperationsByStockCode } from '../../api/operation-api';
import { normalizeStockCode, fetchStockHistoryByDateRange, fetchStockHistory } from '../../api/stock-history-api';
import { Operation } from '../../types/operation';
import { StockHolding } from '../../types/holdings';
import { KLineData } from '../../types/stock-history';
import { Button } from '../../components/ui/button';
import {
  ArrowLeft,
  AlertCircle,
  Receipt,
  ShoppingCart,
  Package,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StockChart, TradeMarker, ChartInterval, ChartType, AdjustType } from '../../components/charts/chart-stock-chart';
import { ChartControls } from '../../components/charts/chart-controls';
import { MinuteDataDialog } from '../../components/charts/chart-minute-data-dialog';
import CountUp from '../../components/holdings/hold-count-up';
import { OperationsList } from '../../components/holdings/hold-operations-list';
import { StockInfoCard } from '../../components/holdings/hold-stock-info-card';
import { chartIntervalToApiInterval, getDefaultDataLimit } from '../../lib/chart-utils';

// 定义路由搜索参数类型
type HoldingDetailSearch = {
  holdingData?: string; // 序列化的持仓数据
};

export const Route = createFileRoute('/hold/$stockCode')({
  component: HoldingDetailPage,
  validateSearch: (search: Record<string, unknown>): HoldingDetailSearch => {
    return {
      holdingData: search.holdingData as string | undefined,
    };
  },
});

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

// 格式化日期为图表格式 (yyyy-mm-dd)
const formatDateForChart = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateString;
  }
};

// 转换复权类型为 API 格式
const adjustTypeToApi = (adjustType: AdjustType): 'n' | 'f' | 'b' => {
  switch (adjustType) {
    case 'none':
      return 'n';
    case 'forward':
      return 'f';
    case 'backward':
      return 'b';
    default:
      return 'f';
  }
};

function HoldingDetailPage() {
  const navigate = useNavigate();
  const { stockCode } = Route.useParams();
  const search = Route.useSearch();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [holding, setHolding] = useState<StockHolding | null>(null);
  const [klineData, setKlineData] = useState<KLineData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreData, setHasMoreData] = useState(true);
  
  // 图表控制状态
  const [chartInterval, setChartInterval] = useState<ChartInterval>('day');
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  
  // 从 localStorage 读取复权类型，默认为前复权
  const [adjustType, setAdjustType] = useState<AdjustType>(() => {
    try {
      const saved = localStorage.getItem('chart_adjust_type');
      return (saved as AdjustType) || 'forward';
    } catch {
      return 'forward';
    }
  });
  
  // 分时图对话框状态
  const [minuteDialogOpen, setMinuteDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTradeMarkers, setSelectedTradeMarkers] = useState<TradeMarker[]>([]);

  // 保存复权类型到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chart_adjust_type', adjustType);
    } catch (error) {
      console.error('保存复权类型失败:', error);
    }
  }, [adjustType]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 从路由参数中获取持仓数据
        if (search.holdingData) {
          try {
            const parsedHolding = JSON.parse(decodeURIComponent(search.holdingData));
            setHolding(parsedHolding);
          } catch (e) {
            console.error('解析持仓数据失败:', e);
          }
        }
        
        // 只需要获取交易记录
        const operationsData = await fetchOperationsByStockCode(stockCode);
        setOperations(operationsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载数据失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [stockCode, search.holdingData]);

  // 加载K线数据（响应时间周期和复权类型变化）
  useEffect(() => {
    const loadKLineData = async () => {
      if (!stockCode) return;
      
      try {
        setIsChartLoading(true);
        
        // 转换股票代码为 API 所需格式
        const normalizedCode = normalizeStockCode(stockCode);
        
        // 根据时间周期获取对应的数据，使用用户选择的复权类型
        const apiInterval = chartIntervalToApiInterval(chartInterval);
        const limit = getDefaultDataLimit(chartInterval);
        
        const data = await fetchStockHistory({
          stockCode: normalizedCode,
          interval: apiInterval,
          adjustType: adjustTypeToApi(adjustType), // 转换为 API 格式
          limit,
        });
        
        setKlineData(data);
        setHasMoreData(data.length >= limit); // 如果返回的数据达到limit，说明可能还有更多数据
      } catch (err) {
        console.error('获取K线数据失败:', err);
        // K线数据加载失败不影响页面其他部分
      } finally {
        setIsChartLoading(false);
      }
    };

    loadKLineData();
  }, [stockCode, chartInterval, adjustType]);

  // 加载更多历史数据
  const handleLoadMore = async () => {
    if (!stockCode || !hasMoreData || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      
      // 获取当前最早的数据时间
      if (klineData.length === 0) return;
      
      const earliestTime = klineData[0].time;
      const normalizedCode = normalizeStockCode(stockCode);
      
      // 请求更早的500条数据
      const endTime = earliestTime.replace(/-/g, '').split(' ')[0]; // 转换为 YYYYMMDD 格式
      
      // 计算开始时间（往前推500个交易日，约2年）
      const endDate = new Date(earliestTime);
      endDate.setDate(endDate.getDate() - 700); // 往前推700天确保能获取到500个交易日
      const startTime = endDate.toISOString().split('T')[0].replace(/-/g, '');
      
      const moreData = await fetchStockHistoryByDateRange(
        normalizedCode,
        startTime,
        endTime,
        'd',
        'f'
      );
      
      if (moreData.length > 0) {
        // 合并数据并去重（使用时间作为唯一键）
        setKlineData(prev => {
          const allData = [...moreData, ...prev];
          // 使用 Map 去重，保留第一次出现的数据
          const uniqueMap = new Map();
          allData.forEach(item => {
            if (!uniqueMap.has(item.time)) {
              uniqueMap.set(item.time, item);
            }
          });
          // 转换回数组并按时间排序
          return Array.from(uniqueMap.values()).sort((a, b) => {
            return new Date(a.time).getTime() - new Date(b.time).getTime();
          });
        });
        setHasMoreData(moreData.length >= 100); // 如果返回少于100条，说明已经到头了
      } else {
        setHasMoreData(false);
      }
    } catch (err) {
      console.error('加载更多K线数据失败:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // 计算统计数据
  const stats = {
    totalBuyAmount: operations
      .filter((op) => op.OperationType.toLowerCase().includes('买'))
      .reduce((sum, op) => sum + op.Amount, 0),
    totalSellAmount: operations
      .filter((op) => op.OperationType.toLowerCase().includes('卖'))
      .reduce((sum, op) => sum + op.Amount, 0),
    totalBuyQuantity: operations
      .filter((op) => op.OperationType.toLowerCase().includes('买'))
      .reduce((sum, op) => sum + op.Quantity, 0),
    totalSellQuantity: operations
      .filter((op) => op.OperationType.toLowerCase().includes('卖'))
      .reduce((sum, op) => sum + op.Quantity, 0),
    totalOperations: operations.length,
  };

  // 转换K线数据为图表数据（包含成交量）
  const chartData = (() => {
    // 使用 Map 去重（保留最新的数据）
    const dataMap = new Map();
    
    klineData.forEach(item => {
      const formattedTime = formatDateForChart(item.time);
      dataMap.set(formattedTime, {
        time: formattedTime,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume, // 添加成交量数据
      });
    });
    
    // 转换为数组并按时间升序排序
    return Array.from(dataMap.values()).sort((a, b) => {
      return a.time.localeCompare(b.time);
    });
  })();

  // 转换交易记录为图表标记
  const tradeMarkers: TradeMarker[] = operations.map(op => ({
    date: formatDateForChart(op.OperationDate),
    type: op.OperationType,
    price: typeof op.Price === 'number' ? op.Price : parseFloat(String(op.Price)),
    quantity: typeof op.Quantity === 'number' ? op.Quantity : parseFloat(String(op.Quantity)),
    amount: typeof op.Amount === 'number' ? op.Amount : parseFloat(String(op.Amount)),
    createdAt: op.OperationDate, // 保存完整的时间信息
  }));

  // 处理图表标记点击
  const handleMarkerClick = (date: string, markers: TradeMarker[]) => {
    setSelectedDate(date);
    setSelectedTradeMarkers(markers);
    setMinuteDialogOpen(true);
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto bg-background">
        <div className="max-w-[1400px] mx-auto px-4 py-4 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: '/hold' })}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* 图表骨架 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3 space-y-3"
            >
              <div className="h-12 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 rounded-lg animate-pulse" />
              <div className="h-[600px] bg-gradient-to-br from-muted/50 via-muted/30 to-muted/50 rounded-xl animate-pulse" />
            </motion.div>
            {/* 侧边栏骨架 */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-gradient-to-br from-muted/50 via-muted/30 to-muted/50 rounded-lg animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="h-full overflow-y-auto bg-background">
        <div className="max-w-[1400px] mx-auto px-4 py-4 space-y-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: '/hold' })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg border-2 border-destructive/30 bg-destructive/15 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">{error}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const isProfitable = holding ? holding.totalProfitLoss >= 0 : true;

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-[1800px] mx-auto px-4 py-4 space-y-4">
        {/* 顶部导航 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: '/hold' })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回持仓列表
          </Button>
        </motion.div>

        {/* 主要内容区域 - 不对称网格布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* 左侧：K线图（占3列，更大空间） */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
            className="lg:col-span-3 space-y-3"
          >
            {/* 图表控制面板 - 独立卡片 */}
            <ChartControls
              interval={chartInterval}
              chartType={chartType}
              adjustType={adjustType}
              onIntervalChange={setChartInterval}
              onChartTypeChange={setChartType}
              onAdjustTypeChange={setAdjustType}
              isLoading={isChartLoading}
              dataCount={klineData.length}
            />
            
            {/* 图表卡片 - 独立卡片 */}
            <motion.div 
              layout
              className="rounded-xl border border-border/60 dark:border-0 bg-gradient-to-br from-card via-card to-card/95 dark:from-muted dark:via-muted/80 dark:to-secondary shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <AnimatePresence mode="wait" initial={false}> 
                {isChartLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(4px)" }}
                    transition={{ 
                      duration: 0.2,
                      ease: "easeInOut"
                    }}
                    className="h-[600px] flex items-center justify-center"
                  >
                    <div className="text-center">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"
                      />
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.2 }}
                        className="text-sm text-muted-foreground"
                      >
                        加载图表数据中...
                      </motion.p>
                    </div>
                  </motion.div>
                ) : chartData.length > 0 ? (
                  <motion.div
                    key={`chart-${chartInterval}-${chartType}`}
                    initial={{ opacity: 0, filter: "blur(6px)", scale: 0.98 }}
                    animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                    exit={{ opacity: 0, filter: "blur(6px)", scale: 0.98 }}
                    transition={{ 
                      duration: 0.35,
                      ease: [0.25, 0.1, 0.25, 1]
                    }}
                    className="h-[600px]"
                  >
                    <StockChart
                      data={chartData}
                      height={600}
                      interval={chartInterval}
                      chartType={chartType}
                      onLoadMore={handleLoadMore}
                      isLoadingMore={isLoadingMore}
                      tradeMarkers={tradeMarkers}
                      onMarkerClick={handleMarkerClick}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(4px)" }}
                    transition={{ 
                      duration: 0.2,
                      ease: "easeInOut"
                    }}
                    className="h-[600px] flex items-center justify-center"
                  >
                    <p className="text-sm text-muted-foreground">暂无图表数据</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
        </motion.div>

          {/* 右侧：股票信息 + 交易统计 */}
          <div className="space-y-4">
            {/* 股票信息卡片 */}
            {holding && (
              <StockInfoCard holding={holding} isProfitable={isProfitable} />
            )}

            {/* 交易统计卡片组 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              {/* 总交易次数 */}
              <div className="rounded-lg border border-border/60 dark:border-0 bg-gradient-to-br from-card via-card to-card/95 dark:from-muted dark:via-muted/80 dark:to-secondary p-3 shadow-sm hover:shadow-lg hover:border-primary/40 dark:hover:shadow-primary/10 transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 dark:via-white/30 to-transparent" />
                <div className="flex items-start justify-between mb-2 relative z-10">
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">总交易次数</div>
                  <Receipt className="h-3.5 w-3.5 text-primary/70 dark:text-primary shrink-0" />
                </div>
                <div className="text-2xl font-bold tabular-nums text-foreground relative z-10">
                  <CountUp
                    from={0}
                    to={stats.totalOperations}
                    duration={1}
                    separator=","
                    className="tabular-nums"
                  />
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Total Operations</div>
              </div>

              {/* 买入金额/数量 */}
              <div className="rounded-lg border border-border/60 dark:border-0 bg-gradient-to-br from-card via-card to-card/95 dark:from-muted dark:via-muted/80 dark:to-secondary p-3 shadow-sm hover:shadow-lg hover:border-red-500/40 dark:hover:shadow-red-500/10 transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 dark:via-white/30 to-transparent" />
                <div className="flex items-start justify-between mb-2 relative z-10">
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">买入金额</div>
                  <ShoppingCart className="h-3.5 w-3.5 text-red-500/70 dark:text-red-400 shrink-0" />
                </div>
                <div className="text-xl font-bold tabular-nums text-red-600 dark:text-red-400 relative z-10">
                  <CountUp
                    from={0}
                    to={stats.totalBuyAmount / 10000}
                    duration={1.2}
                    separator=","
                    className="tabular-nums"
                  />
                  <span className="text-xs font-normal text-muted-foreground ml-1">万</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {formatNumber(stats.totalBuyQuantity, 0)} 股
                </div>
              </div>

              {/* 卖出金额/数量 */}
              <div className="rounded-lg border border-border/60 dark:border-0 bg-gradient-to-br from-card via-card to-card/95 dark:from-muted dark:via-muted/80 dark:to-secondary p-3 shadow-sm hover:shadow-lg hover:border-green-500/40 dark:hover:shadow-green-500/10 transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 dark:via-white/30 to-transparent" />
                <div className="flex items-start justify-between mb-2 relative z-10">
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">卖出金额</div>
                  <Package className="h-3.5 w-3.5 text-green-500/70 dark:text-green-400 shrink-0" />
                </div>
                <div className="text-xl font-bold tabular-nums text-green-600 dark:text-green-400 relative z-10">
                  <CountUp
                    from={0}
                    to={stats.totalSellAmount / 10000}
                    duration={1.2}
                    separator=","
                    className="tabular-nums"
                  />
                  <span className="text-xs font-normal text-muted-foreground ml-1">万</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                {formatNumber(stats.totalSellQuantity, 0)} 股
                </div>
              </div>
        </motion.div>
          </div>
        </div>

        {/* 交易记录列表（全宽） */}
        <OperationsList operations={operations} animationDelay={0.25} />
      </div>

      {/* 分时图对话框 */}
      <MinuteDataDialog
        open={minuteDialogOpen}
        onOpenChange={setMinuteDialogOpen}
        stockCode={normalizeStockCode(stockCode)}
        stockName={holding?.stockName}
        date={selectedDate}
        tradeMarkers={selectedTradeMarkers}
      />
    </div>
  );
}

