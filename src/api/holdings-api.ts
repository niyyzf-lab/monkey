import { HoldingsStatistics, StockHolding, ApiStockHolding } from '../types/holdings';
import { get } from './api';

/**
 * 获取持仓统计数据
 * @returns Promise<HoldingsStatistics> 持仓统计信息
 */
export async function fetchStats(): Promise<HoldingsStatistics> {
  try {
    return await get<HoldingsStatistics>('/webhook/api/v1/stats');
  } catch (error) {
    console.error('获取统计数据失败:', error);
    throw new Error('无法获取统计数据，请检查网络连接或服务器状态');
  }
}

/**
 * 获取持仓数据
 * @returns Promise<ApiStockHolding[]> 持仓信息数组
 */
export async function fetchHoldings(): Promise<ApiStockHolding[]> {
  try {
    return await get<ApiStockHolding[]>('/webhook/api/v1/holdings');
  } catch (error) {
    console.error('获取持仓数据失败:', error);
    throw new Error('无法获取持仓数据，请检查网络连接或服务器状态');
  }
}

/**
 * 根据股票代码获取持仓信息
 * @param stockCode 股票代码
 * @returns Promise<StockHolding | null> 持仓信息
 */
export async function fetchHoldingByStockCode(
  stockCode: string
): Promise<StockHolding | null> {
  try {
    return await get<StockHolding>(`/webhook/api/v1/holdings/${stockCode}`);
  } catch (error: any) {
    // 如果是 404 错误，返回 null
    if (error.status === 404) {
      return null;
    }
    console.error(`获取股票 ${stockCode} 持仓数据失败:`, error);
    throw new Error('无法获取持仓数据，请检查网络连接或服务器状态');
  }
}
