/**
 * API 返回的原始持仓数据（蛇形命名）
 */
export interface ApiStockHolding {
  /** ID */
  id?: string;
  /** 股票代码 */
  stockcode: string;
  /** 股票名称 */
  stockname: string;
  /** 持仓总数量 */
  totalquantity: number;
  /** 可用数量 */
  availablequantity: number;
  /** 成本价 */
  costprice: string;
  /** 首次买入价 */
  firstbuyprice: string;
  /** 当前价格 */
  currentprice: string;
  /** 总成本 */
  totalcost: string;
  /** 市值 */
  marketvalue: string;
  /** 总盈亏 */
  totalprofitloss: string;
  /** 持仓盈亏 */
  positionprofitloss: string;
  /** 今日盈亏 */
  todayprofitloss: string;
  /** 前收盘价 */
  prevcloseprice?: string;
  /** 今日开盘价 */
  todayopenprice?: string;
  /** 今日最高价 */
  todayhighprice?: string;
  /** 今日最低价 */
  todaylowprice?: string;
  /** 首次买入日期 */
  firstbuydate?: string;
  /** 最后更新时间 */
  lastupdated?: string;
  /** 创建时间 */
  createdat?: string;
  /** 止盈价格 */
  shellprice?: string;
  /** 强制平仓价格（止损价） */
  forcecloseprice?: string;
}

/**
 * 股票持仓信息接口（驼峰命名，用于组件）
 */
export interface StockHolding {
  /** ID */
  id?: number;
  /** 股票代码 */
  stockCode: string;
  /** 股票名称 */
  stockName: string;
  /** 持仓总数量 */
  totalQuantity: number;
  /** 可用数量 */
  availableQuantity: number;
  /** 成本价 */
  costPrice: number;
  /** 首次买入价 */
  firstBuyPrice: number;
  /** 当前价格 */
  currentPrice: number;
  /** 总成本 */
  totalCost: number;
  /** 市值 */
  marketValue: number;
  /** 总盈亏 */
  totalProfitLoss: number;
  /** 持仓盈亏 */
  positionProfitLoss: number;
  /** 今日盈亏 */
  todayProfitLoss: number;
  /** 前收盘价 */
  prevClosePrice?: number;
  /** 今日开盘价 */
  todayOpenPrice?: number;
  /** 今日最高价 */
  todayHighPrice?: number;
  /** 今日最低价 */
  todayLowPrice?: number;
  /** 首次买入日期 */
  firstBuyDate?: string;
  /** 最后更新时间 */
  lastUpdated?: string;
  /** 创建时间 */
  createdAt?: string;
  /** 止盈价格 */
  sellPrice?: number;
  /** 强制平仓价格（止损价） */
  forceClosePrice?: number;
}

/**
 * 持仓响应接口 - 直接映射后端返回的数据结构
 */
export interface HoldingsResponse {
  /** 持仓列表 */
  holdings: StockHolding[];
  /** 持仓股票数量 */
  totalStocks: number;
  /** 总市值 */
  totalMarketValue: number;
  /** 总成本 */
  totalCost: number;
  /** 总盈亏 */
  totalProfitLoss: number;
  /** 总盈亏比率 */
  totalProfitLossRatio?: number;
  /** 查询时间 */
  queryTime?: string;
}

/**
 * 持仓统计信息接口 - 用于组件展示
 */
export interface HoldingsStatistics {
  /** 持仓股票数量 */
  totalStocks: number;
  /** 总市值 */
  totalMarketValue: number;
  /** 总成本 */
  totalCost: number;
  /** 总盈亏 */
  totalProfitLoss: number;
}
