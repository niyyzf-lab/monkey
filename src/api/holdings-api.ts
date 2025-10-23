import { HoldingsStatistics, StockHolding, ApiStockHolding } from '../types/holdings';
import { get } from './api';

/**
 * 安全地将字符串解析为数字
 */
function safeParseNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * 获取持仓统计数据
 * @returns Promise<HoldingsStatistics> 持仓统计信息
 */
export async function fetchStats(): Promise<HoldingsStatistics> {
  try {
    const response = await get<any>('/webhook/api/v1/stats');
    
    // 如果是数组，取第一个元素
    const data = Array.isArray(response) ? response[0] : response;
    
    // 转换蛇形命名为驼峰命名，并将字符串转换为数字
    return {
      totalStocks: data.total_stocks || 0,
      initialCapital: safeParseNumber(data.initial_capital),
      currentCash: safeParseNumber(data.current_cash),
      investedCost: safeParseNumber(data.invested_cost),
      marketValue: safeParseNumber(data.market_value || data.stock_market_value),
      totalEquity: safeParseNumber(data.total_equity),
      unrealizedPnl: safeParseNumber(data.unrealized_pnl),
      realizedPnl: safeParseNumber(data.realized_pnl),
      todayProfitLoss: safeParseNumber(data.today_profit_loss),
      maxEquity: safeParseNumber(data.max_equity),
      maxDrawdownAmount: safeParseNumber(data.max_drawdown_amount),
      maxDrawdownRatio: safeParseNumber(data.max_drawdown_ratio),
      updatedAt: data.updated_at,
    };
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
