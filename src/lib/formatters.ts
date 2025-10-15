/**
 * 数据格式化工具函数
 * 统一管理所有数据格式化逻辑，避免重复代码
 */

/**
 * 格式化数字，添加千位分隔符
 * @param num 要格式化的数字
 * @param decimals 小数位数，默认2位
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number, decimals: number = 2): string {
  // 处理 NaN、undefined、null 等异常值
  if (num === undefined || num === null || isNaN(num)) {
    return '0.00';
  }
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * 智能格式化金额，根据大小自动选择单位
 * @param amount 金额
 * @returns 格式化结果对象
 */
export function formatCurrency(amount: number): { display: string; unit: string; full: string } {
  // 处理 NaN、undefined、null 等异常值
  if (amount === undefined || amount === null || isNaN(amount)) {
    return {
      display: '0.00',
      unit: '',
      full: '+¥0.00'
    };
  }
  
  const absAmount = Math.abs(amount);
  const sign = amount >= 0 ? '+' : '';
  
  // 完整金额（元）
  const full = `${sign}¥${formatNumber(amount, 2)}`;
  
  if (absAmount >= 100000000) {
    // 大于等于1亿，显示亿
    return {
      display: `${sign}${formatNumber(amount / 100000000)}`,
      unit: '亿',
      full
    };
  } else if (absAmount >= 10000) {
    // 大于等于1万，显示万
    return {
      display: `${sign}${formatNumber(amount / 10000)}`,
      unit: '万',
      full
    };
  } else {
    // 小于1万，显示元
    return {
      display: `${sign}${formatNumber(amount, 2)}`,
      unit: '',
      full
    };
  }
}

/**
 * 格式化日期
 * @param dateString 日期字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  } catch {
    return dateString;
  }
}

/**
 * 格式化日期为图表格式 (yyyy-mm-dd)
 * @param dateString 日期字符串
 * @returns 图表格式的日期字符串
 */
export function formatDateForChart(dateString: string): string {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateString;
  }
}

/**
 * 格式化百分比
 * @param value 数值
 * @param decimals 小数位数，默认2位
 * @returns 格式化后的百分比字符串
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00%';
  }
  return `${formatNumber(value, decimals)}%`;
}

/**
 * 格式化成交量
 * @param volume 成交量
 * @returns 格式化后的成交量字符串
 */
export function formatVolume(volume: number): string {
  if (volume === undefined || volume === null || isNaN(volume)) {
    return '0';
  }
  
  if (volume >= 10000) {
    return `${formatNumber(volume / 10000)}万`;
  }
  
  return formatNumber(volume, 0);
}

/**
 * 格式化时间戳为可读时间
 * @param timestamp 时间戳（毫秒）
 * @returns 格式化后的时间字符串
 */
export function formatTimestamp(timestamp: number): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return '无效时间';
  }
}

/**
 * 格式化相对时间（如"2小时前"）
 * @param dateString 日期字符串
 * @returns 相对时间字符串
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) {
      return '刚刚';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return formatDate(dateString);
    }
  } catch {
    return dateString;
  }
}

/**
 * 格式化货币数值，用于统计卡片显示
 * 小于1万显示"元"，大于等于1万显示"万"
 * 所有数字四舍五入，最多保留2位小数
 * @param amount 金额
 * @returns 格式化结果对象 { value: 数值, unit: 单位 }
 */
export function formatCurrencyValue(amount: number): { value: number; unit: string } {
  // 处理 NaN、undefined、null 等异常值
  if (amount === undefined || amount === null || isNaN(amount)) {
    return { value: 0, unit: '元' };
  }
  
  const absAmount = Math.abs(amount);
  
  if (absAmount >= 10000) {
    // 大于等于1万，显示万，保留2位小数
    const value = Math.round((amount / 10000) * 100) / 100;
    return { value, unit: '万' };
  } else {
    // 小于1万，显示元，保留2位小数
    const value = Math.round(amount * 100) / 100;
    return { value, unit: '元' };
  }
}

/**
 * 格式化货币详细信息，用于 Tooltip 显示
 * 格式：第一行 a万b千c元，第二行 完整数字元
 * @param amount 金额
 * @returns 格式化后的详细信息对象
 */
export function formatCurrencyDetail(amount: number): { line1: string; line2: string } {
  // 处理 NaN、undefined、null 等异常值
  if (amount === undefined || amount === null || isNaN(amount)) {
    return { line1: '0元', line2: '0.00元' };
  }
  
  const absAmount = Math.abs(amount);
  const sign = amount >= 0 ? '+' : '-';
  
  // 第二行：完整数字 + 元
  const line2 = `${sign}${formatNumber(absAmount, 2)}元`;
  
  // 第一行：a万b千c元格式
  let line1 = sign;
  
  if (absAmount >= 10000) {
    const wan = Math.floor(absAmount / 10000);
    const remainder = absAmount % 10000;
    
    line1 += `${wan.toLocaleString('zh-CN')}万`;
    
    if (remainder >= 1000) {
      const qian = Math.floor(remainder / 1000);
      const yuan = Math.round(remainder % 1000);
      line1 += `${qian}千`;
      if (yuan > 0) {
        line1 += `${yuan}元`;
      }
    } else if (remainder > 0) {
      line1 += `${Math.round(remainder)}元`;
    }
  } else if (absAmount >= 1000) {
    const qian = Math.floor(absAmount / 1000);
    const yuan = Math.round(absAmount % 1000);
    line1 += `${qian}千`;
    if (yuan > 0) {
      line1 += `${yuan}元`;
    }
  } else {
    line1 += `${Math.round(absAmount * 100) / 100}元`;
  }
  
  return { line1, line2 };
}
