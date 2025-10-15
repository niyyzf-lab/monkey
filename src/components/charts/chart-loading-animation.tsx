import { useEffect, useRef, useState } from 'react';

// ==================== 配置参数 ====================
const ANIMATION_CONFIG = {
  MIN_BAR_WIDTH: 8,        // 每根K线最小宽度（像素）
  MAX_PARTICLE_COUNT: 100, // 最大粒子数量 - 与真实图表一致
  MIN_PARTICLE_COUNT: 30,  // 最小粒子数量
  DEFAULT_COUNT: 100,      // 默认显示数量 - 与真实图表一致
  PARTICLE_SIZE: 3,
  PARTICLE_GLOW: 4,
  GROW_DURATION: 1200,     // 生长动画时长（增加以展示弹性效果）
  COLOR_DURATION: 600,     // 颜色过渡时长（缩短，更快速）
  DISPLAY_DURATION: 300,   // 展示时长（缩短）
  FADE_OUT: 400,           // 淡出时长
  WAVE_DELAY: 12,          // 波浪延迟（减少，更紧凑）
};

// 根据容器宽度和数据量计算合适的K线数量
const calculateParticleCount = (width: number, dataLength: number): number => {
  // 如果有真实数据，优先使用100根（与图表一致）
  if (dataLength > 0) {
    return Math.min(ANIMATION_CONFIG.DEFAULT_COUNT, dataLength);
  }
  
  // 否则根据容器宽度计算
  const count = Math.floor(width / ANIMATION_CONFIG.MIN_BAR_WIDTH);
  return Math.max(
    ANIMATION_CONFIG.MIN_PARTICLE_COUNT,
    Math.min(ANIMATION_CONFIG.MAX_PARTICLE_COUNT, count)
  );
};

// ==================== 类型定义 ====================
interface CandlestickData {
  open: number;
  high: number;
  low: number;
  close: number;
  isUp: boolean;
}

interface BarState {
  open: number;
  high: number;
  low: number;
  close: number;
  color: string;
  opacity: number;
  glow: number;
  scale?: number;  // 缩放比例（用于弹出效果）
}

interface VolumeState {
  height: number;  // 成交量柱的高度（百分比）
  color: string;   // 颜色
  opacity: number; // 透明度
  scale?: number;  // 缩放比例
}

// ==================== 颜色常量 ====================
const GRAY_COLOR: [number, number, number] = [113, 113, 122];  // #71717a
const RED_COLOR: [number, number, number] = [239, 68, 68];     // #ef4444
const GREEN_COLOR: [number, number, number] = [34, 197, 94];   // #22c55e

// ==================== 工具函数 ====================

// 颜色插值
const interpolateColor = (
  from: [number, number, number],
  to: [number, number, number],
  progress: number
): string => {
  const r = Math.round(from[0] + (to[0] - from[0]) * progress);
  const g = Math.round(from[1] + (to[1] - from[1]) * progress);
  const b = Math.round(from[2] + (to[2] - from[2]) * progress);
  return `rgb(${r}, ${g}, ${b})`;
};

// easeInOutCubic 缓动函数
const easeInOutCubic = (x: number): number => {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

// easeOutBack 缓动函数（带回弹效果，用于K线生长）
const easeOutBack = (x: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

// easeOutElastic 缓动函数（弹性效果，用于成交量）
const easeOutElastic = (x: number): number => {
  const c4 = (2 * Math.PI) / 3;
  return x === 0
    ? 0
    : x === 1
    ? 1
    : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
};

// 生成价格走势线（真实股市波动算法）
const generatePriceLine = (count: number): number[] => {
  const prices: number[] = [];
  let currentPrice = 50; // 起始价格（百分比位置）
  
  // 随机选择主趋势类型
  const trendType = Math.random();
  let mainTrend: number;
  if (trendType < 0.35) {
    mainTrend = 0.15; // 上涨趋势
  } else if (trendType < 0.70) {
    mainTrend = -0.15; // 下跌趋势
  } else {
    mainTrend = 0; // 震荡
  }
  
  // 趋势转折点（随机2-4个转折点）
  const reversalCount = Math.floor(Math.random() * 3) + 2;
  const reversalPoints = new Set<number>();
  for (let i = 0; i < reversalCount; i++) {
    reversalPoints.add(Math.floor(Math.random() * count));
  }
  
  // 突发事件点（跳空、剧烈波动）
  const eventCount = Math.floor(Math.random() * 3) + 1;
  const eventPoints = new Set<number>();
  for (let i = 0; i < eventCount; i++) {
    eventPoints.add(Math.floor(Math.random() * count));
  }
  
  let currentTrend = mainTrend;
  
  for (let i = 0; i < count; i++) {
    // 趋势转折
    if (reversalPoints.has(i)) {
      currentTrend = -currentTrend * (0.8 + Math.random() * 0.4); // 反转趋势
    }
    
    // 基础波动
    let volatility = (Math.random() - 0.5) * 1.5;
    
    // 突发事件：跳空或剧烈波动
    if (eventPoints.has(i)) {
      const eventType = Math.random();
      if (eventType < 0.4) {
        // 跳空（gap）
        volatility += (Math.random() - 0.5) * 8; // ±4的跳空
      } else if (eventType < 0.7) {
        // 剧烈波动
        volatility *= 3; // 3倍波动
      } else {
        // 极端长影线（后续K线会体现）
        volatility *= 2;
      }
    }
    
    // 偶尔的小波动放大（模拟盘中突然拉升或下跌）
    if (Math.random() < 0.1) {
      volatility *= 2;
    }
    
    const change = volatility + currentTrend;
    currentPrice += change;
    currentPrice = Math.max(25, Math.min(75, currentPrice)); // 限制范围
    
    prices.push(currentPrice);
  }
  
  return prices;
};

// 基于价格线生成单根K线（增强版：更大实体，更多随机性）
const generateCandlestickFromPrice = (price: number, prevPrice: number): CandlestickData => {
  const isUp = price >= prevPrice;
  
  // 价格变化
  const priceChange = Math.abs(price - prevPrice);
  
  // 随机决定K线类型
  const candleType = Math.random();
  let open, close, high, low;
  
  if (candleType < 0.15) {
    // 15%概率：长实体大阳线/大阴线
    const bodySize = Math.max(3, priceChange * 2 + Math.random() * 4);
    const upperShadow = Math.random() * 2;
    const lowerShadow = Math.random() * 2;
    
    if (isUp) {
      open = price - bodySize;
      close = price;
      high = close + upperShadow;
      low = open - lowerShadow;
    } else {
      open = price + bodySize;
      close = price;
      high = open + upperShadow;
      low = close - lowerShadow;
    }
  } else if (candleType < 0.25) {
    // 10%概率：十字星（小实体，长影线）
    const bodySize = Math.random() * 0.5;
    const shadowSize = 2 + Math.random() * 4;
    
    open = price + (Math.random() - 0.5) * bodySize;
    close = price;
    high = Math.max(open, close) + shadowSize;
    low = Math.min(open, close) - shadowSize;
  } else if (candleType < 0.35) {
    // 10%概率：锤子线/倒锤子线（长下影线或长上影线）
    const bodySize = 1 + Math.random() * 2;
    const longShadow = 3 + Math.random() * 5;
    const shortShadow = Math.random() * 1;
    
    if (Math.random() < 0.5) {
      // 锤子线（长下影线）
      if (isUp) {
        open = price - bodySize;
        close = price;
        high = close + shortShadow;
        low = open - longShadow;
      } else {
        open = price + bodySize;
        close = price;
        high = open + shortShadow;
        low = close - longShadow;
      }
    } else {
      // 倒锤子线（长上影线）
      if (isUp) {
        open = price - bodySize;
        close = price;
        high = close + longShadow;
        low = open - shortShadow;
      } else {
        open = price + bodySize;
        close = price;
        high = open + longShadow;
        low = close - shortShadow;
      }
    }
  } else {
    // 65%概率：普通K线（中等实体）
    const bodySize = Math.max(1.5, priceChange * 1.5 + Math.random() * 3);
    const upperShadow = Math.random() * 3;
    const lowerShadow = Math.random() * 3;
    
    if (isUp) {
      open = price - bodySize + (Math.random() - 0.5) * bodySize * 0.3;
      close = price;
      high = close + upperShadow;
      low = Math.min(open, close) - lowerShadow;
    } else {
      open = price + bodySize + (Math.random() - 0.5) * bodySize * 0.3;
      close = price;
      high = Math.max(open, close) + upperShadow;
      low = close - lowerShadow;
    }
  }
  
  return {
    open: Math.max(20, Math.min(80, open)),
    high: Math.max(20, Math.min(80, high)),
    low: Math.max(20, Math.min(80, low)),
    close: Math.max(20, Math.min(80, close)),
    isUp,
  };
};

// 生成真实的K线数据（带趋势和连续性）
const generateRealisticCandlesticks = (count: number): CandlestickData[] => {
  // 1. 生成价格走势线
  const priceLine = generatePriceLine(count);
  
  // 2. 基于价格线生成K线
  const candlesticks: CandlestickData[] = [];
  
  for (let i = 0; i < count; i++) {
    const prevPrice = i > 0 ? priceLine[i - 1] : priceLine[0];
    const currentPrice = priceLine[i];
    
    candlesticks.push(generateCandlestickFromPrice(currentPrice, prevPrice));
  }
  
  return candlesticks;
};

// 将真实股票数据转换为动画数据（归一化到0-100范围）
const convertRealDataToAnimationData = (
  realData: RealCandlestickData[], 
  _maxCount: number
): CandlestickData[] => {
  // 取最后100根K线（与真实图表保持一致）或全部数据（如果不足100根）
  const visibleCount = Math.min(100, realData.length);
  const dataToUse = realData.slice(-visibleCount);
  
  // 找出价格范围
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  
  dataToUse.forEach(candle => {
    minPrice = Math.min(minPrice, candle.low);
    maxPrice = Math.max(maxPrice, candle.high);
  });
  
  // 添加10%的上下边距
  const priceRange = maxPrice - minPrice;
  const margin = priceRange * 0.1;
  minPrice -= margin;
  maxPrice += margin;
  const totalRange = maxPrice - minPrice;
  
  // 归一化到20-80范围（与随机数据保持一致）
  const normalize = (price: number): number => {
    return 20 + ((price - minPrice) / totalRange) * 60;
  };
  
  return dataToUse.map((candle) => ({
    open: normalize(candle.open),
    high: normalize(candle.high),
    low: normalize(candle.low),
    close: normalize(candle.close),
    isUp: candle.close >= candle.open,
  }));
};

// ==================== 主组件 ====================
interface RealCandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface ChartLoadingAnimationProps {
  height?: number;
  onComplete?: () => void;
  realData?: RealCandlestickData[]; // 可选：真实股票数据
}

export function ChartLoadingAnimation({ height = 400, onComplete, realData }: ChartLoadingAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const candlesticksRef = useRef<CandlestickData[]>([]);
  const volumeHeightsRef = useRef<number[]>([]); // 存储每根成交量柱的目标高度
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  
  const [barStates, setBarStates] = useState<BarState[]>([]);
  const [volumeStates, setVolumeStates] = useState<VolumeState[]>([]);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;

    // 根据容器宽度和数据量动态计算K线数量
    const dataLength = realData?.length || 0;
    const particleCount = calculateParticleCount(width, dataLength);

    // 🔍 数据量过滤：如果数据点太少（<40个），直接跳过动画
    if (particleCount < 40) {
      onComplete?.();
      return;
    }

    // 生成K线数据：优先使用真实数据，否则使用随机生成
    if (realData && realData.length > 0) {
      candlesticksRef.current = convertRealDataToAnimationData(realData, particleCount);
    } else {
      candlesticksRef.current = generateRealisticCandlesticks(particleCount);
    }

    const candles = candlesticksRef.current;
    
    // 映射函数：将数据范围映射到显示范围
    const mapToFullRange = (value: number) => {
      return ((value - 20) / 60) * 80 + 10;
    };

    // 生成初始状态（所有K线从基准线开始，高度为0）
    const initialBars: BarState[] = candles.map((candle) => {
      const finalOpen = mapToFullRange(candle.open);
      const finalClose = mapToFullRange(candle.close);
      
      // 基准线位置（open和close的中点）
      const baseline = (finalOpen + finalClose) / 2;
      
      return {
        open: baseline,
        high: baseline,
        low: baseline,
        close: baseline,
        color: interpolateColor(GRAY_COLOR, GRAY_COLOR, 1),
        opacity: 0,
        glow: 0,
      };
    });

    // 生成成交量目标高度
    if (realData && realData.length > 0) {
      // 使用真实成交量数据
      const visibleCount = Math.min(100, realData.length);
      const volumeData = realData.slice(-visibleCount);
      
      // 找出成交量的最大值和最小值
      const volumes = volumeData.map(d => d.volume || 0);
      const maxVolume = Math.max(...volumes);
      const minVolume = Math.min(...volumes);
      const volumeRange = maxVolume - minVolume;
      
      // 归一化成交量到 20-100% 范围
      volumeHeightsRef.current = volumes.map(vol => {
        if (volumeRange === 0) return 60; // 如果都相同，使用中间值
        const normalized = (vol - minVolume) / volumeRange;
        return 20 + normalized * 80; // 映射到 20-100%
      });
    } else {
      // 没有真实数据时使用随机值
      volumeHeightsRef.current = candles.map(() => 20 + Math.random() * 80);
    }
    
    // 生成成交量初始状态（高度为0，灰色）
    const initialVolumes: VolumeState[] = candles.map(() => ({
      height: 0,
      color: interpolateColor(GRAY_COLOR, GRAY_COLOR, 1),
      opacity: 0,
    }));

    setBarStates(initialBars);
    setVolumeStates(initialVolumes);
    setOpacity(1);
    startTimeRef.current = Date.now();

    // 动画循环
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      
      // 阶段1: 从下往上生长 + 灰色淡入 (0-1000ms)
      if (elapsed < ANIMATION_CONFIG.GROW_DURATION) {
        const newBars: BarState[] = candles.map((candle, index) => {
          const finalOpen = mapToFullRange(candle.open);
          const finalHigh = mapToFullRange(candle.high);
          const finalLow = mapToFullRange(candle.low);
          const finalClose = mapToFullRange(candle.close);
          
          // 基准线位置
          const baseline = (finalOpen + finalClose) / 2;
          
          // 计算波浪延迟效果
          const waveDelay = index * ANIMATION_CONFIG.WAVE_DELAY;
          const adjustedElapsed = Math.max(0, elapsed - waveDelay);
          const progress = Math.min(1, adjustedElapsed / ANIMATION_CONFIG.GROW_DURATION);
          const easedProgress = easeOutBack(progress); // 使用回弹效果
          
          // 从基准线向目标位置生长（带回弹）
          const currentHigh = baseline + (finalHigh - baseline) * easedProgress;
          const currentLow = baseline + (finalLow - baseline) * easedProgress;
          const currentOpen = baseline + (finalOpen - baseline) * easedProgress;
          const currentClose = baseline + (finalClose - baseline) * easedProgress;
          
          // 添加微妙的缩放效果（0.95 → 1.0）
          const scale = 0.95 + progress * 0.05;
          
          return {
            open: currentOpen,
            high: currentHigh,
            low: currentLow,
            close: currentClose,
            color: interpolateColor(GRAY_COLOR, GRAY_COLOR, 1),
            opacity: easedProgress * 0.8,
            glow: 0,
            scale: scale,
          };
        });
        
        // 成交量同步生长动画
        const newVolumes: VolumeState[] = candles.map((_candle, index) => {
          // 使用预先生成的目标高度
          const maxVolumeHeight = volumeHeightsRef.current[index];
          
          // 计算波浪延迟效果（与K线同步）
          const waveDelay = index * ANIMATION_CONFIG.WAVE_DELAY;
          const adjustedElapsed = Math.max(0, elapsed - waveDelay);
          const progress = Math.min(1, adjustedElapsed / ANIMATION_CONFIG.GROW_DURATION);
          const easedProgress = easeOutElastic(progress); // 使用弹性效果
          
          // 限制弹性效果不超过110%（允许轻微超出）
          const clampedProgress = Math.max(0, Math.min(1.1, easedProgress));
          
          // 添加缩放效果（0.9 → 1.0）
          const scale = 0.9 + Math.min(progress, 1) * 0.1;
          
          return {
            height: maxVolumeHeight * clampedProgress,
            color: interpolateColor(GRAY_COLOR, GRAY_COLOR, 1),
            opacity: Math.min(progress, 1) * 0.5, // 透明度使用线性进度
            scale: scale,
          };
        });
        
        setBarStates(newBars);
        setVolumeStates(newVolumes);
      }
      // 阶段2: 灰色到彩色的平滑过渡 (1000-1800ms)
      else if (elapsed < ANIMATION_CONFIG.GROW_DURATION + ANIMATION_CONFIG.COLOR_DURATION) {
        const colorProgress = (elapsed - ANIMATION_CONFIG.GROW_DURATION) / ANIMATION_CONFIG.COLOR_DURATION;
        const easedProgress = easeInOutCubic(colorProgress);
        
        const newBars: BarState[] = candles.map((candle) => {
          const finalOpen = mapToFullRange(candle.open);
          const finalHigh = mapToFullRange(candle.high);
          const finalLow = mapToFullRange(candle.low);
          const finalClose = mapToFullRange(candle.close);
          
          const targetColor = candle.isUp ? RED_COLOR : GREEN_COLOR;
          
          return {
            open: finalOpen,
            high: finalHigh,
            low: finalLow,
            close: finalClose,
            color: interpolateColor(GRAY_COLOR, targetColor, easedProgress),
            opacity: 0.8 + easedProgress * 0.2,
            glow: 0,
          };
        });
        
        // 成交量颜色过渡
        const newVolumes: VolumeState[] = candles.map((candle, index) => {
          const maxVolumeHeight = volumeHeightsRef.current[index];
          const targetColor = candle.isUp ? RED_COLOR : GREEN_COLOR;
          
          return {
            height: maxVolumeHeight,
            color: interpolateColor(GRAY_COLOR, targetColor, easedProgress),
            opacity: 0.3, // 成交量保持半透明
          };
        });
        
        setBarStates(newBars);
        setVolumeStates(newVolumes);
      }
      // 阶段3: 短暂停留展示 (1800-2200ms)
      else if (elapsed < ANIMATION_CONFIG.GROW_DURATION + ANIMATION_CONFIG.COLOR_DURATION + ANIMATION_CONFIG.DISPLAY_DURATION) {
        // 保持最终状态
        const finalBars: BarState[] = candles.map((candle) => ({
          open: mapToFullRange(candle.open),
          high: mapToFullRange(candle.high),
          low: mapToFullRange(candle.low),
          close: mapToFullRange(candle.close),
          color: interpolateColor(
            candle.isUp ? RED_COLOR : GREEN_COLOR,
            candle.isUp ? RED_COLOR : GREEN_COLOR,
            1
          ),
          opacity: 1,
          glow: 0,
        }));
        
        // 成交量最终状态
        const finalVolumes: VolumeState[] = candles.map((candle, index) => {
          const maxVolumeHeight = volumeHeightsRef.current[index];
          const targetColor = candle.isUp ? RED_COLOR : GREEN_COLOR;
          
          return {
            height: maxVolumeHeight,
            color: interpolateColor(targetColor, targetColor, 1),
            opacity: 0.3,
          };
        });
        
        setBarStates(finalBars);
        setVolumeStates(finalVolumes);
      }
      // 阶段4: 淡出 (2200-2600ms)
      else if (elapsed < ANIMATION_CONFIG.GROW_DURATION + ANIMATION_CONFIG.COLOR_DURATION + ANIMATION_CONFIG.DISPLAY_DURATION + ANIMATION_CONFIG.FADE_OUT) {
        const fadeProgress = (elapsed - ANIMATION_CONFIG.GROW_DURATION - ANIMATION_CONFIG.COLOR_DURATION - ANIMATION_CONFIG.DISPLAY_DURATION) / ANIMATION_CONFIG.FADE_OUT;
        setOpacity(1 - fadeProgress);
      }
      // 动画结束
      else {
        onComplete?.();
        return;
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // 清理函数
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [height, onComplete, realData]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-10 bg-background/98 backdrop-blur-sm rounded-lg border border-border/60 overflow-hidden transition-opacity duration-400"
      style={{ height: `${height}px`, opacity }}
    >
      {/* K线渲染 */}
      {barStates.length > 0 && (
        <div 
          className="absolute flex items-stretch justify-around gap-[1px]"
          style={{
            left: '8px',       // 左侧留少量边距
            right: '58px',     // 右侧价格轴宽度
            top: '8%',         // 顶部边距 8% (对应 scaleMargins.top: 0.08)
            bottom: 'calc(28% + 28px)',  // 底部：28%成交量区域 + 28px时间轴高度
          }}
        >
          {barStates.map((bar, i) => {
            // 将数据范围映射到显示范围
            const mapToFullRange = (value: number) => {
              return ((value - 20) / 60) * 80 + 10;
            };
            
            const mappedHigh = mapToFullRange(bar.high);
            const mappedLow = mapToFullRange(bar.low);
            const mappedOpen = mapToFullRange(bar.open);
            const mappedClose = mapToFullRange(bar.close);
            
            const topPercent = 100 - mappedHigh;
            const bottomPercent = 100 - mappedLow;
            const openPercent = 100 - mappedOpen;
            const closePercent = 100 - mappedClose;

            const bodyTop = Math.min(openPercent, closePercent);
            const bodyBottom = Math.max(openPercent, closePercent);
            const bodyHeight = bodyBottom - bodyTop || 0.5;

            return (
              <div 
                key={i} 
                className="flex-1 relative" 
                style={{ 
                  minWidth: '1px', 
                  opacity: bar.opacity,
                  transform: bar.scale ? `scaleX(${bar.scale})` : undefined,
                  transformOrigin: 'center',
                  transition: 'transform 0.1s ease-out',
                }}
              >
                {/* 上影线 */}
                <div
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{
                    top: `${topPercent}%`,
                    height: `${bodyTop - topPercent}%`,
                    width: '1px',
                    backgroundColor: bar.color,
                    filter: bar.glow > 0 ? `drop-shadow(0 0 ${bar.glow}px ${bar.color})` : 'none',
                  }}
                />

                {/* K线实体 */}
                <div
                  className="absolute left-0 right-0 rounded-[1px]"
                  style={{
                    top: `${bodyTop}%`,
                    height: `${bodyHeight}%`,
                    backgroundColor: bar.color,
                    filter: bar.glow > 0 ? `drop-shadow(0 0 ${bar.glow}px ${bar.color})` : 'none',
                  }}
                />

                {/* 下影线 */}
                <div
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{
                    top: `${bodyBottom}%`,
                    height: `${bottomPercent - bodyBottom}%`,
                    width: '1px',
                    backgroundColor: bar.color,
                    filter: bar.glow > 0 ? `drop-shadow(0 0 ${bar.glow}px ${bar.color})` : 'none',
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* 成交量渲染 */}
      {volumeStates.length > 0 && (
        <div 
          className="absolute flex justify-around gap-[1px]"
          style={{
            left: '8px',       // 左侧留少量边距
            right: '58px',     // 右侧价格轴宽度
            bottom: '28px',    // 底部时间轴高度
            height: '28%',     // 成交量区域高度（对应 scaleMargins）
          }}
        >
          {volumeStates.map((volume, i) => (
            <div 
              key={i} 
              className="flex-1 relative h-full"
              style={{ 
                minWidth: '1px',
                transform: volume.scale ? `scaleX(${volume.scale})` : undefined,
                transformOrigin: 'center bottom',
                transition: 'transform 0.1s ease-out',
              }}
            >
              {/* 成交量柱 */}
              <div
                className="absolute bottom-0 left-0 right-0 rounded-t-[1px]"
                style={{
                  height: `${volume.height}%`,
                  backgroundColor: volume.color,
                  opacity: volume.opacity,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
