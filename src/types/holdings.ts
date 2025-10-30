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
  sellprice?: string;
  /** 强制平仓价格（止损价） */
  forcecloseprice?: string;
  /** 总买入金额 */
  totalbuyamount?: string;
  /** 总卖出金额 */
  totalsellamount?: string;
  /** 已卖出数量 */
  soldquantity?: number;
  /** 已实现盈亏（已卖出部分的盈亏）= 总卖出金额 - 对应的买入成本 */
  realizedpnl?: string;
  /** 未实现盈亏（当前持仓的盈亏）= 当前市值 - 当前持仓成本 */
  unrealizedpnl?: string;
  /** 假设市值（如果没卖，按当前价计算）= (当前持仓数量 + 已卖出数量) * 当前价 */
  hypotheticalmarketvalue?: string;
  /** 假设盈亏（如果一直没卖，总共能赚多少）= 假设市值 - 总买入金额 */
  hypotheticalpnl?: string;
  /** 错失利润（卖早了少赚的，或者卖对了避免的损失）= 假设盈亏 - (已实现盈亏 + 未实现盈亏) */
  missedprofit?: string;
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
  /** 总买入金额 */
  totalBuyAmount?: number;
  /** 总卖出金额 */
  totalSellAmount?: number;
  /** 已卖出数量 */
  soldQuantity?: number;
  /** 已实现盈亏（已卖出部分的盈亏）= 总卖出金额 - 对应的买入成本 */
  realizedPnl?: number;
  /** 未实现盈亏（当前持仓的盈亏）= 当前市值 - 当前持仓成本 */
  unrealizedPnl?: number;
  /** 假设市值（如果没卖，按当前价计算）= (当前持仓数量 + 已卖出数量) * 当前价 */
  hypotheticalMarketValue?: number;
  /** 假设盈亏（如果一直没卖，总共能赚多少）= 假设市值 - 总买入金额 */
  hypotheticalPnl?: number;
  /** 错失利润（卖早了少赚的，或者卖对了避免的损失）= 假设盈亏 - (已实现盈亏 + 未实现盈亏) */
  missedProfit?: number;
  /** 是否已清仓（totalQuantity === 0） */
  isSold?: boolean;
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
 * 持仓统计信息接口 - 用于组件展示（基于新的stats API）
 */
export interface HoldingsStatistics {
  /** 持仓股票数量 */
  totalStocks: number;
  /** 初始资金 */
  initialCapital: number;
  /** 可用现金 */
  currentCash: number;
  /** 冻结资金 */
  frozenCash?: number;
  /** 投入成本（已投入到股市的金额） */
  investedCost: number;
  /** 持仓市值 */
  marketValue: number;
  /** 总资产（现金 + 持仓市值） */
  totalEquity: number;
  /** 未实现盈亏（当前持仓的盈亏） */
  unrealizedPnl: number;
  /** 已实现盈亏（已卖出股票的盈亏） */
  realizedPnl: number;
  /** 总盈亏（已实现盈亏 + 未实现盈亏） */
  totalPnl?: number;
  /** 今日盈亏 */
  todayProfitLoss: number;
  /** 最大资产 */
  maxEquity?: number;
  /** 最大回撤金额 */
  maxDrawdownAmount?: number;
  /** 最大回撤比率 */
  maxDrawdownRatio?: number;
  /** 更新时间 */
  updatedAt?: string;
}
