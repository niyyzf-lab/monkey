import { Operation, OperationQueryParams } from '../types/operation';
import { get } from './api';

/**
 * 获取操作记录列表
 * @param params 查询参数（可选）
 * @returns Promise<Operation[]> 操作记录数组
 */
export async function fetchOperations(
  params?: OperationQueryParams
): Promise<Operation[]> {
  try {
    // 构建查询字符串
    let endpoint = '/webhook/api/v1/operation';
    
    if (params?.stock_code) {
      const queryParams = new URLSearchParams({
        stock_code: params.stock_code,
      });
      endpoint = `${endpoint}?${queryParams.toString()}`;
    }

    return await get<Operation[]>(endpoint);
  } catch (error) {
    console.error('获取操作记录失败:', error);
    throw new Error('无法获取操作记录，请检查网络连接或服务器状态');
  }
}

/**
 * 根据股票代码获取操作记录
 * @param stockCode 股票代码
 * @returns Promise<Operation[]> 操作记录数组
 */
export async function fetchOperationsByStockCode(
  stockCode: string
): Promise<Operation[]> {
  return fetchOperations({ stock_code: stockCode });
}

/**
 * 获取所有操作记录
 * @returns Promise<Operation[]> 操作记录数组
 */
export async function fetchAllOperations(): Promise<Operation[]> {
  return fetchOperations();
}

