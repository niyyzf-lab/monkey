/**
 * 数据转换工具函数
 * 统一管理所有数据转换逻辑，避免重复代码
 */

import { KLineData } from '../types/stock-history';
import { TradeMarker } from '../components/charts/chart-stock-chart';
import { Operation } from '../types/operation';
import { formatDateForChart } from './formatters';

/**
 * K线数据接口
 */
export interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/**
 * 转换K线数据为图表格式
 * @param klineData K线数据数组
 * @returns 图表格式的K线数据
 */
export function transformKLineDataForChart(klineData: KLineData[]): CandlestickData[] {
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
      volume: item.volume,
    });
  });
  
  // 转换为数组并按时间升序排序
  return Array.from(dataMap.values()).sort((a, b) => {
    return a.time.localeCompare(b.time);
  });
}

/**
 * 转换交易记录为图表标记
 * @param operations 交易记录数组
 * @returns 图表标记数组
 */
export function transformOperationsToMarkers(operations: Operation[]): TradeMarker[] {
  return operations.map(op => ({
    date: formatDateForChart(op.OperationDate),
    type: op.OperationType,
    price: typeof op.Price === 'number' ? op.Price : parseFloat(String(op.Price)),
    quantity: typeof op.Quantity === 'number' ? op.Quantity : parseFloat(String(op.Quantity)),
    amount: typeof op.Amount === 'number' ? op.Amount : parseFloat(String(op.Amount)),
    createdAt: op.OperationDate, // 保存完整的时间信息
  }));
}

/**
 * K线数据去重
 * @param data K线数据数组
 * @returns 去重后的K线数据数组
 */
export function deduplicateKLineData(data: KLineData[]): KLineData[] {
  // 使用 Map 去重，保留第一次出现的数据
  const uniqueMap = new Map();
  data.forEach(item => {
    if (!uniqueMap.has(item.time)) {
      uniqueMap.set(item.time, item);
    }
  });
  // 转换回数组并按时间排序
  return Array.from(uniqueMap.values()).sort((a, b) => {
    return new Date(a.time).getTime() - new Date(b.time).getTime();
  });
}

/**
 * K线数据按时间排序
 * @param data K线数据数组
 * @param ascending 是否升序，默认true
 * @returns 排序后的K线数据数组
 */
export function sortKLineDataByTime(data: KLineData[], ascending: boolean = true): KLineData[] {
  return [...data].sort((a, b) => {
    const timeA = new Date(a.time).getTime();
    const timeB = new Date(b.time).getTime();
    return ascending ? timeA - timeB : timeB - timeA;
  });
}

/**
 * 合并K线数据（用于加载更多历史数据）
 * @param existingData 现有数据
 * @param newData 新数据
 * @returns 合并后的去重数据
 */
export function mergeKLineData(existingData: KLineData[], newData: KLineData[]): KLineData[] {
  const allData = [...newData, ...existingData];
  return deduplicateKLineData(allData);
}

/**
 * 转换股票代码为API所需格式
 * @param stockCode 股票代码（支持 000001 或 000001.SZ 格式）
 * @returns 标准格式的股票代码（如 000001.SZ）
 */
export function normalizeStockCode(stockCode: string): string {
  // 如果已经包含市场后缀，直接返回
  if (stockCode.includes('.')) {
    return stockCode;
  }

  // 根据股票代码判断市场
  // 6 开头：上海（SH）
  // 0/3 开头：深圳（SZ）
  if (stockCode.startsWith('6')) {
    return `${stockCode}.SH`;
  } else if (stockCode.startsWith('0') || stockCode.startsWith('3')) {
    return `${stockCode}.SZ`;
  }

  // 默认返回原代码
  return stockCode;
}

/**
 * 转换复权类型为API格式
 * @param adjustType 复权类型
 * @returns API格式的复权类型
 */
export function adjustTypeToApi(adjustType: 'none' | 'forward' | 'backward'): 'n' | 'f' | 'b' {
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
}

/**
 * 转换图表周期为API格式
 * @param interval 图表周期
 * @returns API格式的周期
 */
export function chartIntervalToApiInterval(interval: string): string {
  const intervalMap: Record<string, string> = {
    'minute': '1',
    '5min': '5',
    '15min': '15',
    '30min': '30',
    '60min': '60',
    'day': 'd',
    'week': 'w',
    'month': 'm',
    'year': 'y'
  };
  
  return intervalMap[interval] || 'd';
}

/**
 * 获取默认数据限制
 * @param interval 图表周期
 * @returns 默认数据条数
 */
export function getDefaultDataLimit(interval: string): number {
  const limitMap: Record<string, number> = {
    'minute': 240,    // 4小时交易时间
    '5min': 200,      // 约16小时
    '15min': 100,     // 约25小时
    '30min': 100,     // 约50小时
    '60min': 100,     // 约100小时
    'day': 100,       // 约100个交易日
    'week': 50,       // 约50周
    'month': 24,      // 约24个月
    'year': 5         // 约5年
  };
  
  return limitMap[interval] || 100;
}

/**
 * 转换时间戳为日期字符串
 * @param timestamp 时间戳（毫秒）
 * @returns 日期字符串 (YYYY-MM-DD)
 */
export function timestampToDateString(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 转换日期字符串为时间戳
 * @param dateString 日期字符串 (YYYY-MM-DD)
 * @returns 时间戳（毫秒）
 */
export function dateStringToTimestamp(dateString: string): number {
  return new Date(dateString).getTime();
}

/**
 * 计算时间范围
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @param interval 时间间隔（天）
 * @returns 时间范围数组
 */
export function calculateTimeRange(startTime: string, endTime: string, interval: number = 1): string[] {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const result: string[] = [];
  
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + interval)) {
    result.push(date.toISOString().split('T')[0]);
  }
  
  return result;
}

/**
 * 过滤K线数据
 * @param data K线数据数组
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @returns 过滤后的K线数据
 */
export function filterKLineDataByTimeRange(
  data: KLineData[], 
  startTime: string, 
  endTime: string
): KLineData[] {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  
  return data.filter(item => {
    const itemTime = new Date(item.time).getTime();
    return itemTime >= start && itemTime <= end;
  });
}
