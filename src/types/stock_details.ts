// 股票信息接口定义
export interface StockCompanyInfo {
  /** 股票代码 */
  stock_code: string;
  /** 股票名称 */
  stock_name: string;
  /** 公司名称 */
  company_name: string;
  /** 交易所 */
  exchange: string;
  /** 业务范围 */
  business_scope: string;
  /** 自定义标签 */
  custom_tags: string;
  /** 官方网站 */
  official_website: string;
  /** 公司描述 */
  company_description: string;
  /** 承销方式 */
  underwriting_method: string;
  /** 创建时间 */
  created_at: string;
  /** 更新时间 */
  updated_at: string;
  /** 板块概念 */
  sectors_concepts: string[];
}

/** 股票信息数组类型 */
export type StockInfoArray = StockCompanyInfo[];

