/**
 * AI 分析数据类型定义 - 新格式
 */

/**
 * 单条分析记录
 */
export interface AIAnalysisRecord {
  id: number
  title: string
  type: string // "触发器" | "AI" | ...
  category: string // "财联社" | "新闻分析" | "选股分析" | "交易决策" | ...
  record_content: string
  additional_info: string
  created_at: string
  updated_at: string
  title_last_updated: string
  title_record_count: string
}

/**
 * 分组后的分析数据（按标题分组）
 */
export interface AIAnalysisGroup {
  title: string // 新闻标题
  titleLastUpdated: string
  recordCount: number
  records: AIAnalysisRecord[]
  trigger?: AIAnalysisRecord // 触发器记录（新闻采集）
  newsAnalyst?: AIAnalysisRecord // 新闻分析
  stockPicker?: AIAnalysisRecord // 选股分析
  tradingExecutor?: AIAnalysisRecord // 交易决策
}

// 保留旧的类型定义以兼容现有代码
export interface AIAnalysis {
  id: number
  article_title: string
  article_source: string
  news_analyst_output: string
  stock_picker_output: string | null
  trading_executor_output: string
  created_at: string
  updated_at: string
}

export interface AIAnalysisResponse {
  data: AIAnalysis
}

