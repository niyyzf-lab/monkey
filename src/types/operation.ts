/**
 * 操作记录类型定义
 */

/**
 * 操作记录接口
 */
export interface Operation {
  /** 操作 ID */
  Id: number;
  /** 股票名称 */
  StockName: string;
  /** 股票代码 */
  StockCode: string;
  /** 操作日期 */
  OperationDate: string;
  /** 操作类型（如：买入、卖出等） */
  OperationType: string;
  /** 价格 */
  Price: number;
  /** 数量 */
  Quantity: number;
  /** 金额 */
  Amount: number;
  /** 状态 */
  Status: string;
  /** 备注 */
  Remarks: string | null;
  /** 创建时间 */
  CreatedAt: string;
}

/**
 * 操作记录查询参数
 */
export interface OperationQueryParams {
  /** 股票代码（可选） */
  stock_code?: string;
}

