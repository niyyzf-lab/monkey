/**
 * 图表工具函数
 */

import { ChartInterval } from '@/components/charts/chart-stock-chart';

/**
 * 将图表时间周期转换为 API 所需的 interval 参数
 * @param chartInterval 图表时间周期
 * @returns API interval 参数
 */
export function chartIntervalToApiInterval(
  chartInterval: ChartInterval
): '5' | '15' | '30' | '60' | 'd' | 'w' | 'm' | 'y' {
  const mapping: Record<ChartInterval, '5' | '15' | '30' | '60' | 'd' | 'w' | 'm' | 'y'> = {
    'minute': '5',    // 1分钟暂时映射到5分钟（如果API不支持1分钟）
    '5min': '5',
    '15min': '15',
    '30min': '30',
    '60min': '60',
    'day': 'd',
    'week': 'w',
    'month': 'm',
    'year': 'y',
  };
  
  return mapping[chartInterval];
}

/**
 * 获取图表周期的显示名称
 * @param interval 图表时间周期
 * @returns 显示名称
 */
export function getChartIntervalLabel(interval: ChartInterval): string {
  const labels: Record<ChartInterval, string> = {
    'minute': '分时',
    '5min': '5分钟',
    '15min': '15分钟',
    '30min': '30分钟',
    '60min': '60分钟',
    'day': '日K',
    'week': '周K',
    'month': '月K',
    'year': '年K',
  };
  
  return labels[interval];
}

/**
 * 获取默认的数据条数（根据时间周期）
 * @param interval 图表时间周期
 * @returns 默认数据条数
 */
export function getDefaultDataLimit(interval: ChartInterval): number {
  const limits: Record<ChartInterval, number> = {
    'minute': 240,    // 1分钟：4小时数据
    '5min': 240,      // 5分钟：20小时数据
    '15min': 200,     // 15分钟：约2天数据
    '30min': 200,     // 30分钟：约4天数据
    '60min': 200,     // 60分钟：约8天数据
    'day': 500,       // 日K：约2年数据
    'week': 300,      // 周K：约6年数据
    'month': 200,     // 月K：约17年数据
    'year': 50,       // 年K：50年数据
  };
  
  return limits[interval];
}

/**
 * 判断是否需要使用不复权（分钟级别必须不复权）
 * @param interval 图表时间周期
 * @returns 是否需要不复权
 */
export function shouldUseNoAdjust(interval: ChartInterval): boolean {
  return ['minute', '5min', '15min', '30min', '60min'].includes(interval);
}

/**
 * 获取推荐的复权方式
 * @param interval 图表时间周期
 * @returns 复权方式
 */
export function getRecommendedAdjustType(
  interval: ChartInterval
): 'n' | 'f' | 'b' | 'fr' | 'br' {
  return shouldUseNoAdjust(interval) ? 'n' : 'f';
}

