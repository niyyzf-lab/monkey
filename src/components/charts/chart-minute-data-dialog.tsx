import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MinuteChart } from './chart-minute-chart';
import { fetch1MinuteData } from '@/api/stock-history-api';
import { MinuteData } from '@/types/stock-history';
import { TradeMarker } from './chart-stock-chart';
import { Loader2 } from 'lucide-react';

interface MinuteDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stockCode: string;
  stockName?: string;
  date: string; // YYYY-MM-DD 格式
  tradeMarkers: TradeMarker[]; // 当天的所有交易记录
}

export function MinuteDataDialog(props: MinuteDataDialogProps) {
  const { open, onOpenChange, stockCode, stockName, date, tradeMarkers } = props;
  
  const [minuteData, setMinuteData] = useState<MinuteData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      // 关闭时重置状态
      setMinuteData([]);
      setError(null);
      return;
    }

    // 加载1分钟数据
    const loadMinuteData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // API 需要 YYYY-MM-DD 格式，保持原格式不变
        console.log(`📥 开始加载1分钟数据:`, { stockCode, date });
        const data = await fetch1MinuteData({
          stockCode,
          date: date, // 直接使用 YYYY-MM-DD 格式
        });
        
        if (data.length === 0) {
          setError('该日期没有分时数据，可能不是交易日');
        } else {
          console.log(`✅ 1分钟数据加载成功:`, {
            数据条数: data.length,
            第一条: data[0],
            最后一条: data[data.length - 1],
            前5条时间: data.slice(0, 5).map(d => d.trade_time || d.time),
          });
          setMinuteData(data);
        }
      } catch (err) {
        console.error('加载1分钟数据失败:', err);
        setError(err instanceof Error ? err.message : '加载数据失败');
      } finally {
        setLoading(false);
      }
    };

    loadMinuteData();
  }, [open, stockCode, date]);

  // 转换交易标记格式
  const chartTradeMarkers = tradeMarkers.map((marker, index) => {
    // 如果有 createdAt，提取时间部分（HH:mm:ss）
    let timeStr = '';
    if (marker.createdAt) {
      // createdAt 可能是以下格式之一：
      // 1. ISO 8601 UTC: "2025-10-09T01:28:17.363Z"
      // 2. ISO 8601 本地: "2025-10-09T13:28:17.363"
      // 3. 时间戳（毫秒）
      const date = new Date(marker.createdAt);
      
      // 使用 toLocaleString 明确指定东8区时区
      const chinaTimeString = date.toLocaleString('zh-CN', { 
        timeZone: 'Asia/Shanghai',
        hour12: false,
      });
      
      // 从格式化字符串中提取时间部分
      // 格式: "2025/10/9 13:28:17"
      const timePart = chinaTimeString.split(' ')[1] || '';
      const [hours, minutes, seconds] = timePart.split(':');
      
      timeStr = `${hours}:${minutes}:${seconds}`;
      
      console.log(`🕐 交易标记 #${index + 1} 时间转换:`, {
        原始createdAt类型: typeof marker.createdAt,
        原始createdAt值: marker.createdAt,
        Date对象toString: date.toString(),
        Date对象UTC: date.toISOString(),
        Date对象getHours: date.getHours(),
        中国时区字符串: chinaTimeString,
        提取的时间部分: timePart,
        最终小时: hours,
        最终分钟: minutes,
        最终秒: seconds,
        最终时间字符串: timeStr,
        交易类型: marker.type,
        交易价格: marker.price,
      });
    } else {
      console.warn(`⚠️ 交易标记 #${index + 1} 缺少 createdAt:`, marker);
    }
    
    return {
      time: timeStr, // 格式: HH:mm:ss
      type: marker.type,
      price: typeof marker.price === 'number' ? marker.price : parseFloat(String(marker.price)),
      quantity: marker.quantity,
    };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {stockName ? `${stockName} (${stockCode})` : stockCode} - {date} 分时图
          </DialogTitle>
          <DialogDescription>
            1分钟K线数据，红色箭头表示买入，绿色箭头表示卖出
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 图表区域 */}
          {loading && (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">加载分时数据中...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-destructive mb-2">加载失败</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && minuteData.length > 0 && (
            <>
              <MinuteChart 
                data={minuteData} 
                height={400}
                tradeMarkers={chartTradeMarkers}
              />

              {/* 交易详情列表 */}
              {tradeMarkers.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">当日交易记录</h3>
                  <div className="space-y-2">
                    {tradeMarkers.map((marker, index) => {
                      const price = typeof marker.price === 'number' ? marker.price : parseFloat(String(marker.price));
                      const amount = typeof marker.amount === 'number' ? marker.amount : parseFloat(String(marker.amount));
                      
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded bg-muted/50"
                        >
                          <div className="flex items-center gap-4">
                            <span
                              className={`font-medium ${
                                marker.type.includes('买')
                                  ? 'text-red-500'
                                  : 'text-green-500'
                              }`}
                            >
                              {marker.type}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              价格: ¥{price.toFixed(2)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              数量: {marker.quantity}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              金额: ¥{amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

