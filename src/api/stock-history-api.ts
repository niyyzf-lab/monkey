import { KLineData, KLineDataRaw, StockHistoryParams, MinuteData, MinuteDataParams } from '../types/stock-history';
import { get } from './api';

/**
 * 必应 API 基础 URL
 */
const BIYING_API_BASE_URL = 'https://api.biyingapi.com';

/**
 * 从环境变量获取 licence
 */
const getLicence = (): string => {
  const licence = import.meta.env.VITE_BIYING_LICENCE;
  if (!licence) {
    console.warn('未配置 VITE_BIYING_LICENCE 环境变量');
    return '28807C11-1C32-415A-AB32-115CA9B62FC3'; // 默认值，需要替换
  }
  return licence;
};

/**
 * 转换 API 原始数据为标准格式
 * @param raw 原始数据
 * @returns 标准格式数据
 */
function transformKLineData(raw: KLineDataRaw): KLineData {
  return {
    time: raw.t,
    open: raw.o,
    high: raw.h,
    low: raw.l,
    close: raw.c,
    volume: raw.v,
    amount: raw.a,
    preClose: raw.pc,
    suspend: raw.sf,
  };
}

/**
 * 获取股票历史数据（K线数据）
 * @param params 查询参数
 * @returns Promise<KLineData[]> K线数据数组
 */
export async function fetchStockHistory(
  params: StockHistoryParams
): Promise<KLineData[]> {
  try {
    const {
      stockCode,
      interval = 'd',
      adjustType,
      startTime,
      endTime,
      limit,
    } = params;

    // 根据级别自动设置除权方式
    // 分钟级别必须使用 'n' (不复权)
    const isMinuteLevel = ['5', '15', '30', '60'].includes(interval);
    const finalAdjustType = adjustType || (isMinuteLevel ? 'n' : 'f');

    // 构建 URL
    const licence = getLicence();
    let url = `${BIYING_API_BASE_URL}/hsstock/history/${stockCode}/${interval}/${finalAdjustType}/${licence}`;

    // 构建查询参数
    const queryParams = new URLSearchParams();
    if (startTime) {
      queryParams.append('st', startTime);
    }
    if (endTime) {
      queryParams.append('et', endTime);
    }
    if (limit) {
      queryParams.append('lt', limit.toString());
    }

    // 添加查询字符串
    const queryString = queryParams.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }

    console.log('请求股票历史数据:', url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // API 直接返回数组格式
    const rawData: KLineDataRaw[] = await response.json();

    // 转换为标准格式
    return rawData.map(transformKLineData);
  } catch (error) {
    console.error('获取股票历史数据失败:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : '无法获取股票历史数据，请检查网络连接或 API 配置'
    );
  }
}

/**
 * 获取股票日K线数据
 * @param stockCode 股票代码（如 000001.SZ）
 * @param limit 最新条数（默认 100）
 * @param adjustType 除权方式（默认 'f' 前复权）
 * @returns Promise<KLineData[]> 日K线数据
 */
export async function fetchDailyKLine(
  stockCode: string,
  limit: number = 100,
  adjustType: 'n' | 'f' | 'b' | 'fr' | 'br' = 'f'
): Promise<KLineData[]> {
  return fetchStockHistory({
    stockCode,
    interval: 'd',
    adjustType,
    limit,
  });
}

/**
 * 获取股票分钟K线数据
 * @param stockCode 股票代码（如 000001.SZ）
 * @param interval 分钟级别（5, 15, 30, 60）
 * @param limit 最新条数（默认 100）
 * @returns Promise<KLineData[]> 分钟K线数据
 */
export async function fetchMinuteKLine(
  stockCode: string,
  interval: '5' | '15' | '30' | '60' = '5',
  limit: number = 100
): Promise<KLineData[]> {
  return fetchStockHistory({
    stockCode,
    interval,
    adjustType: 'n', // 分钟级别必须使用不复权
    limit,
  });
}

/**
 * 获取指定时间范围的股票历史数据
 * @param stockCode 股票代码（如 000001.SZ）
 * @param startTime 开始时间（格式：YYYYMMDD 或 YYYYMMDDhhmmss）
 * @param endTime 结束时间（格式：YYYYMMDD 或 YYYYMMDDhhmmss）
 * @param interval 分时级别（默认 'd'）
 * @param adjustType 除权方式（可选，默认根据级别自动选择）
 * @returns Promise<KLineData[]> 历史K线数据
 */
export async function fetchStockHistoryByDateRange(
  stockCode: string,
  startTime: string,
  endTime: string,
  interval: '5' | '15' | '30' | '60' | 'd' | 'w' | 'm' | 'y' = 'd',
  adjustType?: 'n' | 'f' | 'b' | 'fr' | 'br'
): Promise<KLineData[]> {
  return fetchStockHistory({
    stockCode,
    interval,
    adjustType,
    startTime,
    endTime,
  });
}

/**
 * 转换股票代码为 API 所需格式
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
 * 获取股票 1 分钟分时数据
 * @param params 查询参数（股票代码和日期）
 * @returns Promise<MinuteData[]> 1分钟分时数据数组
 * @example
 * ```typescript
 * // 获取 2025年1月10日 的 000001.SZ 的 1 分钟分时数据
 * const data = await fetch1MinuteData({
 *   stockCode: '000001.SZ',
 *   date: '2025-01-10'
 * });
 * ```
 */
export async function fetch1MinuteData(
  params: MinuteDataParams
): Promise<MinuteData[]> {
  try {
    const { stockCode, date } = params;

    // 构建查询参数
    const queryParams = new URLSearchParams();
    queryParams.append('ts_code', stockCode);
    queryParams.append('date', date);

    // 构建完整的 endpoint
    const endpoint = `/webhook/StockHistory/1m?${queryParams.toString()}`;
    
    console.log('请求 1 分钟分时数据:', endpoint);

    // 使用通用 API 方法发送请求
    const data = await get<MinuteData[]>(endpoint);
    return data;
  } catch (error) {
    console.error('获取 1 分钟分时数据失败:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : '无法获取 1 分钟分时数据，请检查网络连接或 API 配置'
    );
  }
}

