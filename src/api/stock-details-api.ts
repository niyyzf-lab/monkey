import { StockInfoArray } from '../types/stock_details';
import { get, put } from './api';

/**
 * 获取股票详情数据
 * @returns Promise<StockInfoArray> 股票信息数组
 */
export async function fetchStockDetails(): Promise<StockInfoArray> {
  try {
    return await get<StockInfoArray>('/webhook/stock-details');
  } catch (error) {
    console.error('获取股票详情数据失败:', error);
    throw new Error('无法获取股票详情数据，请检查网络连接或服务器状态');
  }
}

/**
 * 更新股票自定义标签
 * @param stock_code 股票代码
 * @param custom_tags 自定义标签内容
 * @returns Promise<void>
 */
export async function updateStockCustomTags(
  stock_code: string,
  custom_tags: string
): Promise<void> {
  try {
    await put<void>('/webhook/update-stock-custom-tags', {
      stock_code,
      custom_tags,
    });
  } catch (error) {
    console.error('更新股票自定义标签失败:', error);
    throw new Error('无法更新股票自定义标签，请检查网络连接或服务器状态');
  }
}
