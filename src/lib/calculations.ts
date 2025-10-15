/**
 * 计算工具函数
 * 统一管理所有业务计算逻辑，避免重复代码
 */

/**
 * 计算价格在止损-止盈区间的位置百分比
 * @param currentPrice 当前价格
 * @param stopLoss 止损价格
 * @param takeProfit 止盈价格
 * @returns 位置百分比 (0-100)
 */
export function calculatePricePosition(
  currentPrice: number,
  stopLoss: number,
  takeProfit: number
): number {
  if (stopLoss >= takeProfit) return 50; // 无效区间，返回中间位置
  const range = takeProfit - stopLoss;
  const position = ((currentPrice - stopLoss) / range) * 100;
  // 限制在 0-100 之间
  return Math.max(0, Math.min(100, position));
}

/**
 * 计算盈亏金额
 * @param currentPrice 当前价格
 * @param costPrice 成本价格
 * @param quantity 数量
 * @returns 盈亏金额
 */
export function calculateProfitLoss(
  currentPrice: number,
  costPrice: number,
  quantity: number
): number {
  return (currentPrice - costPrice) * quantity;
}

/**
 * 计算盈亏率
 * @param currentPrice 当前价格
 * @param costPrice 成本价格
 * @returns 盈亏率 (小数形式，如 0.1 表示 10%)
 */
export function calculateProfitRate(
  currentPrice: number,
  costPrice: number
): number {
  if (costPrice === 0) return 0;
  return (currentPrice - costPrice) / costPrice;
}

/**
 * 检测是否接近止损（当前价格低于止损价的5%以内）
 * @param currentPrice 当前价格
 * @param stopLoss 止损价格
 * @returns 是否接近止损
 */
export function isNearStopLoss(currentPrice: number, stopLoss?: number): boolean {
  if (!stopLoss || stopLoss <= 0) return false;
  return currentPrice <= stopLoss * 1.05;
}

/**
 * 检测是否接近止盈（当前价格高于止盈价的5%以内）
 * @param currentPrice 当前价格
 * @param takeProfit 止盈价格
 * @returns 是否接近止盈
 */
export function isNearTakeProfit(currentPrice: number, takeProfit?: number): boolean {
  if (!takeProfit || takeProfit <= 0) return false;
  return currentPrice >= takeProfit * 0.95;
}

/**
 * 计算移动平均线
 * @param data K线数据数组
 * @param period 周期
 * @returns 移动平均线数据
 */
export function calculateMA(data: Array<{ close: number }>, period: number): Array<{ time: string; value: number }> {
  const result: Array<{ time: string; value: number }> = [];
  
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
      time: (data[i] as any).time,
      value: sum / period,
    });
  }
  
  return result;
}

/**
 * 计算总市值
 * @param price 股价
 * @param totalShares 总股本
 * @returns 总市值
 */
export function calculateMarketCap(price: number, totalShares: number): number {
  return price * totalShares;
}

/**
 * 计算市盈率
 * @param price 股价
 * @param earningsPerShare 每股收益
 * @returns 市盈率
 */
export function calculatePE(price: number, earningsPerShare: number): number {
  if (earningsPerShare <= 0) return 0;
  return price / earningsPerShare;
}

/**
 * 计算市净率
 * @param price 股价
 * @param bookValuePerShare 每股净资产
 * @returns 市净率
 */
export function calculatePB(price: number, bookValuePerShare: number): number {
  if (bookValuePerShare <= 0) return 0;
  return price / bookValuePerShare;
}

/**
 * 计算涨跌幅
 * @param currentPrice 当前价格
 * @param previousClose 昨收价
 * @returns 涨跌幅 (小数形式)
 */
export function calculateChangeRate(currentPrice: number, previousClose: number): number {
  if (previousClose <= 0) return 0;
  return (currentPrice - previousClose) / previousClose;
}

/**
 * 计算涨跌额
 * @param currentPrice 当前价格
 * @param previousClose 昨收价
 * @returns 涨跌额
 */
export function calculateChangeAmount(currentPrice: number, previousClose: number): number {
  return currentPrice - previousClose;
}

/**
 * 计算持仓成本
 * @param totalCost 总成本
 * @param quantity 持仓数量
 * @returns 平均成本
 */
export function calculateAverageCost(totalCost: number, quantity: number): number {
  if (quantity <= 0) return 0;
  return totalCost / quantity;
}

/**
 * 计算持仓市值
 * @param currentPrice 当前价格
 * @param quantity 持仓数量
 * @returns 持仓市值
 */
export function calculateHoldingValue(currentPrice: number, quantity: number): number {
  return currentPrice * quantity;
}

/**
 * 计算持仓盈亏
 * @param currentPrice 当前价格
 * @param costPrice 成本价格
 * @param quantity 持仓数量
 * @returns 持仓盈亏
 */
export function calculateHoldingProfitLoss(
  currentPrice: number,
  costPrice: number,
  quantity: number
): number {
  return (currentPrice - costPrice) * quantity;
}

/**
 * 计算持仓盈亏率
 * @param currentPrice 当前价格
 * @param costPrice 成本价格
 * @returns 持仓盈亏率 (小数形式)
 */
export function calculateHoldingProfitRate(
  currentPrice: number,
  costPrice: number
): number {
  if (costPrice <= 0) return 0;
  return (currentPrice - costPrice) / costPrice;
}
