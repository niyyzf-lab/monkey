import { useMemo } from 'react';
import { MinuteData } from '@/types/stock-history';
import { Card } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface MinuteChartTradeMarker {
  time: string; // 交易时间 (HH:mm 或 HH:mm:ss)
  type: string; // 操作类型（买入/卖出）
  price: number; // 交易价格
  quantity: number; // 交易数量
}

interface MinuteChartProps {
  data: MinuteData[];
  height?: number;
  /** 当天的交易标记 */
  tradeMarkers?: MinuteChartTradeMarker[];
}

// 图表配置
const chartConfig = {
  price: {
    label: '价格',
    color: 'hsl(var(--chart-1))',
  },
};

export function MinuteChart(props: MinuteChartProps) {
  const {
    data,
    height = 400,
    tradeMarkers = [],
  } = props;

  // 转换数据格式
  const chartData = useMemo(() => {
    const result = data
      .map(item => {
        const timeString = item.trade_time || item.time;
        if (!timeString) {
          console.error('Missing time field in data:', item);
          return null;
        }

        // 提取时间部分 (HH:mm)
        const timePart = timeString.split(' ')[1] || timeString;
        const [hour, minute] = timePart.split(':');
        const formattedTime = `${hour}:${minute}`;

        return {
          time: formattedTime,
          fullTime: timeString, // 保留完整时间用于标记匹配
          price: Number(item.close),
          open: Number(item.open),
          high: Number(item.high),
          low: Number(item.low),
          volume: Number(item.vol || item.volume || 0),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => {
        // 按时间升序排序
        const [aHour, aMinute] = a.time.split(':').map(Number);
        const [bHour, bMinute] = b.time.split(':').map(Number);
        const aMinutes = aHour * 60 + aMinute;
        const bMinutes = bHour * 60 + bMinute;
        return aMinutes - bMinutes;
      });
    
    // 调试信息
    console.log('📊 图表数据:', {
      dataLength: result.length,
      firstPoint: result[0],
      lastPoint: result[result.length - 1],
      sampleData: result.slice(0, 5)
    });
    
    return result;
  }, [data]);

  // 处理交易标记 - 将标记数据合并到图表数据中
  const enhancedChartData = useMemo(() => {
    if (tradeMarkers.length === 0 || chartData.length === 0) {
      return chartData;
    }

    const markersMap = new Map();
    const processedMarkers: any[] = [];

    tradeMarkers.forEach((marker, markerIndex) => {
      const markerPrice = typeof marker.price === 'number' ? marker.price : parseFloat(marker.price);
      
      console.log(`\n🔍 处理交易标记 #${markerIndex + 1}:`, {
        原始标记: marker,
        标记类型: marker.type,
        标记时间原始值: marker.time,
        标记价格: markerPrice,
      });
      
      // 统一使用时间匹配数据点
      if (!marker.time) {
        console.warn('❌ 交易标记缺少时间信息，跳过:', marker);
        return;
      }

      // 提取标记时间 (HH:mm)
      // marker.time 可能的格式: "HH:mm:ss" 或 "HH:mm"
      const timeParts = marker.time.split(':');
      const targetHour = Number(timeParts[0]);
      const targetMinute = Number(timeParts[1]);
      const targetTimeStr = `${String(targetHour).padStart(2, '0')}:${String(targetMinute).padStart(2, '0')}`;
      
      console.log(`⏰ 解析后的目标时间:`, {
        原始时间: marker.time,
        解析小时: targetHour,
        解析分钟: targetMinute,
        格式化后: targetTimeStr,
      });
      
      // 查找精确匹配的时间点
      let matchedDataPoint = chartData.find(d => d.time === targetTimeStr);
      
      if (matchedDataPoint) {
        console.log(`✅ 找到精确匹配的时间点:`, {
          匹配时间: matchedDataPoint.time,
          匹配价格: matchedDataPoint.price,
        });
      }
      
      // 如果没找到精确匹配，找时间最接近的数据点
      if (!matchedDataPoint && chartData.length > 0) {
        const targetMinutes = targetHour * 60 + targetMinute;
        let minDiff = Infinity;
        
        console.log(`🔎 未找到精确匹配，开始查找最接近时间点...`);
        console.log(`📋 图表数据时间范围:`, {
          第一个点: chartData[0]?.time,
          最后一个点: chartData[chartData.length - 1]?.time,
          总数据点: chartData.length,
          前5个时间点: chartData.slice(0, 5).map(d => d.time),
        });
        
        for (const d of chartData) {
          const [h, m] = d.time.split(':').map(Number);
          const dataMinutes = h * 60 + m;
          const diff = Math.abs(dataMinutes - targetMinutes);
          
          if (diff < minDiff) {
            minDiff = diff;
            matchedDataPoint = d;
          }
        }
        
        if (matchedDataPoint) {
          console.log(`⚠️ 使用最接近的时间点:`, {
            标记时间: marker.time,
            目标时间字符串: targetTimeStr,
            目标分钟数: targetMinutes,
            匹配时间: matchedDataPoint.time,
            匹配价格: matchedDataPoint.price,
            时间差分钟: minDiff,
          });
        } else {
          console.error(`❌ 无法找到匹配的数据点！`);
        }
      }

      if (matchedDataPoint) {
        const isBuy = marker.type.includes('买');
        const markerData = {
          time: matchedDataPoint.time,
          price: markerPrice,
          type: marker.type,
          quantity: marker.quantity,
          isBuy,
          color: isBuy ? '#ef4444' : '#22c55e', // 红色买入，绿色卖出
        };
        markersMap.set(matchedDataPoint.time, markerData);
        processedMarkers.push(markerData);
        
        console.log(`✅ 标记添加成功:`, {
          显示位置: markerData.time,
          标记类型: markerData.type,
          是否买入: isBuy,
        });
      }
    });

    // 增强图表数据，添加标记信息
    const enhanced = chartData.map(point => ({
      ...point,
      marker: markersMap.get(point.time) || null,
    }));

    console.log('📍 交易标记:', {
      markersCount: processedMarkers.length,
      markers: processedMarkers
    });

    return enhanced;
  }, [tradeMarkers, chartData]);

  // 计算价格范围，添加一些边距
  const priceRange = useMemo(() => {
    if (enhancedChartData.length === 0) return { min: 0, max: 100 };
    
    const prices = enhancedChartData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const padding = (maxPrice - minPrice) * 0.15; // 15% 边距，留出标记空间
    
    return {
      min: Math.floor((minPrice - padding) * 100) / 100,
      max: Math.ceil((maxPrice + padding) * 100) / 100,
    };
  }, [enhancedChartData]);

  if (enhancedChartData.length === 0) {
    return (
      <Card className="w-full p-6">
        <p className="text-center text-muted-foreground">暂无数据</p>
      </Card>
    );
  }

  // 自定义标记渲染函数
  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    
    if (!payload?.marker) {
      return <></>;
    }
    
    const marker = payload.marker;
    const isBuy = marker.isBuy;
    
    // 买入向上的三角形，卖出向下的三角形
    if (isBuy) {
      return (
        <g>
          <polygon
            points={`${cx},${cy - 8} ${cx - 6},${cy + 4} ${cx + 6},${cy + 4}`}
            fill={marker.color}
            stroke="#fff"
            strokeWidth={1.5}
          />
          <text
            x={cx}
            y={cy - 12}
            textAnchor="middle"
            fill={marker.color}
            fontSize={10}
            fontWeight="bold"
          >
            买
          </text>
        </g>
      );
    } else {
      return (
        <g>
          <polygon
            points={`${cx},${cy + 8} ${cx - 6},${cy - 4} ${cx + 6},${cy - 4}`}
            fill={marker.color}
            stroke="#fff"
            strokeWidth={1.5}
          />
          <text
            x={cx}
            y={cy + 20}
            textAnchor="middle"
            fill={marker.color}
            fontSize={10}
            fontWeight="bold"
          >
            卖
          </text>
        </g>
      );
    }
  };

  return (
    <Card className="w-full p-4">
      <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
        <LineChart data={enhancedChartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={50}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          
          <YAxis
            domain={[priceRange.min, priceRange.max]}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.toFixed(2)}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(label) => `时间: ${label}`}
                formatter={(value) => [
                  `¥${Number(value).toFixed(2)}`,
                  '价格'
                ]}
              />
            }
          />
          
          <Line
            type="monotone"
            dataKey="price"
            stroke="#2563eb"
            strokeWidth={2}
            dot={renderCustomDot}
            activeDot={{ r: 4, fill: "#2563eb" }}
            isAnimationActive={false}
          />
        </LineChart>
      </ChartContainer>
    </Card>
  );
}

