import { AIAnalysisRecord, AIAnalysisGroup } from '../types/ai-analyses';
import { get } from './api';

/**
 * 获取 AI 分析记录列表（新格式）
 * 接口返回的是最后一次更新的分组的所有内容
 * @returns Promise<AIAnalysisRecord[]> AI 分析记录数组
 */
export async function fetchAIAnalysisRecords(): Promise<AIAnalysisRecord[]> {
  try {
    return await get<AIAnalysisRecord[]>('/webhook/api/v1/ai-analyses');
  } catch (error) {
    console.error('获取 AI 分析数据失败:', error);
    throw new Error('无法获取 AI 分析数据，请检查网络连接或服务器状态');
  }
}

/**
 * 将记录列表转换为分析组（接口已按标题分组，这里只需分类）
 */
export function parseAIAnalysisGroup(records: AIAnalysisRecord[]): AIAnalysisGroup | null {
  if (records.length === 0) {
    return null
  }
  
  // 所有记录共享同一个标题
  const firstRecord = records[0]
  const group: AIAnalysisGroup = {
    title: firstRecord.title,
    titleLastUpdated: firstRecord.title_last_updated,
    recordCount: parseInt(firstRecord.title_record_count) || 0,
    records: records,
  }
  
  // 根据type和category分类记录（支持多种category命名）
  records.forEach(record => {
    if (record.type === '触发器') {
      group.trigger = record
    } else if (record.type === 'AI') {
      if (record.category === '新闻分析') {
        group.newsAnalyst = record
      } else if (record.category === '选股分析' || record.category === '新闻选股') {
        group.stockPicker = record
      } else if (record.category === '交易决策' || record.category === '决策AI') {
        group.tradingExecutor = record
      }
    }
  })
  
  return group
}

/**
 * 获取最新的 AI 分析分组数据
 */
export async function fetchLatestAIAnalysisGroup(): Promise<AIAnalysisGroup | null> {
  const records = await fetchAIAnalysisRecords()
  return parseAIAnalysisGroup(records)
}

