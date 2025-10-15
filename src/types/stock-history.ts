/**
 * 股票历史数据类型定义
 */

/**
 * K线数据项（API 原始格式）
 */
export interface KLineDataRaw {
  /** 交易时间 */
  t: string;
  /** 开盘价 */
  o: number;
  /** 最高价 */
  h: number;
  /** 最低价 */
  l: number;
  /** 收盘价 */
  c: number;
  /** 成交量 */
  v: number;
  /** 成交额 */
  a: number;
  /** 前收盘价 */
  pc: number;
  /** 停牌状态（1停牌，0不停牌） */
  sf: number;
}

/**
 * K线数据项（标准格式）
 */
export interface KLineData {
  /** 交易时间 */
  time: string;
  /** 开盘价 */
  open: number;
  /** 最高价 */
  high: number;
  /** 最低价 */
  low: number;
  /** 收盘价 */
  close: number;
  /** 成交量 */
  volume: number;
  /** 成交额 */
  amount: number;
  /** 前收盘价 */
  preClose: number;
  /** 停牌状态（1停牌，0不停牌） */
  suspend: number;
}

/**
 * 股票历史数据查询参数
 */
export interface StockHistoryParams {
  /** 股票代码（如 000001.SZ） */
  stockCode: string;
  /** 
   * 分时级别
   * - 5: 5分钟
   * - 15: 15分钟
   * - 30: 30分钟
   * - 60: 60分钟
   * - d: 日线
   * - w: 周线
   * - m: 月线
   * - y: 年线
   */
  interval?: '5' | '15' | '30' | '60' | 'd' | 'w' | 'm' | 'y';
  /** 
   * 除权方式
   * - n: 不复权
   * - f: 前复权
   * - b: 后复权
   * - fr: 等比前复权
   * - br: 等比后复权
   * 注意：分钟级无除权数据，必须使用 n
   */
  adjustType?: 'n' | 'f' | 'b' | 'fr' | 'br';
  /** 开始时间（格式：YYYYMMDD 或 YYYYMMDDhhmmss，如 20240601 或 20240601000000） */
  startTime?: string;
  /** 结束时间（格式：YYYYMMDD 或 YYYYMMDDhhmmss，如 20250430 或 20250430235959） */
  endTime?: string;
  /** 最新条数（限制返回最新的 N 条数据） */
  limit?: number;
}

/**
 * 1分钟分时数据项
 */
export interface MinuteData {
  /** 股票代码 */
  ts_code?: string;
  code?: string;
  /** 交易时间 */
  trade_time?: string;
  time?: string;
  /** 开盘价 */
  open: number;
  /** 收盘价 */
  close: number;
  /** 最高价 */
  high: number;
  /** 最低价 */
  low: number;
  /** 成交量 */
  vol?: number;
  volume?: number;
  /** 成交金额 */
  amount: number;
}

/**
 * 1分钟分时数据查询参数
 */
export interface MinuteDataParams {
  /** 股票代码（如 000001.SZ） */
  stockCode: string;
  /** 日期（格式：YYYY-MM-DD，如 2025-01-01） */
  date: string;
}

