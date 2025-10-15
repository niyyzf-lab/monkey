/**
 * 价格验证工具函数
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * 验证止盈价
 * @param sellPrice 止盈价
 * @param costPrice 成本价
 * @param currentPrice 当前价
 * @returns 验证结果
 */
export function validateSellPrice(
  sellPrice: number,
  costPrice: number,
  currentPrice: number
): ValidationResult {
  // 检查是否为有效数字
  if (isNaN(sellPrice) || sellPrice === null || sellPrice === undefined) {
    return {
      isValid: false,
      error: '请输入有效的止盈价',
    };
  }

  // 检查是否为正数
  if (sellPrice <= 0) {
    return {
      isValid: false,
      error: '止盈价必须大于0',
    };
  }

  // 检查是否大于成本价
  if (sellPrice <= costPrice) {
    return {
      isValid: false,
      error: `止盈价必须大于成本价 ¥${costPrice.toFixed(2)}`,
    };
  }

  // 检查是否大于当前价
  if (sellPrice <= currentPrice) {
    return {
      isValid: false,
      error: `止盈价必须大于当前价 ¥${currentPrice.toFixed(2)}`,
    };
  }

  return {
    isValid: true,
  };
}

/**
 * 验证止损价
 * @param forceClosePrice 止损价
 * @param costPrice 成本价
 * @param currentPrice 当前价
 * @returns 验证结果
 */
export function validateForceClosePrice(
  forceClosePrice: number,
  costPrice: number,
  currentPrice: number
): ValidationResult {
  // 检查是否为有效数字
  if (
    isNaN(forceClosePrice) ||
    forceClosePrice === null ||
    forceClosePrice === undefined
  ) {
    return {
      isValid: false,
      error: '请输入有效的止损价',
    };
  }

  // 检查是否为正数
  if (forceClosePrice <= 0) {
    return {
      isValid: false,
      error: '止损价必须大于0',
    };
  }

  // 检查是否小于成本价
  if (forceClosePrice >= costPrice) {
    return {
      isValid: false,
      error: `止损价必须小于成本价 ¥${costPrice.toFixed(2)}`,
    };
  }

  // 检查是否小于当前价
  if (forceClosePrice >= currentPrice) {
    return {
      isValid: false,
      error: `止损价必须小于当前价 ¥${currentPrice.toFixed(2)}`,
    };
  }

  return {
    isValid: true,
  };
}

/**
 * 验证两个价格是否都有效
 * @param sellPrice 止盈价
 * @param forceClosePrice 止损价
 * @param costPrice 成本价
 * @param currentPrice 当前价
 * @returns 验证结果
 */
export function validatePrices(
  sellPrice: number,
  forceClosePrice: number,
  costPrice: number,
  currentPrice: number
): {
  sellPriceResult: ValidationResult;
  forceClosePriceResult: ValidationResult;
  isValid: boolean;
} {
  const sellPriceResult = validateSellPrice(sellPrice, costPrice, currentPrice);
  const forceClosePriceResult = validateForceClosePrice(
    forceClosePrice,
    costPrice,
    currentPrice
  );

  return {
    sellPriceResult,
    forceClosePriceResult,
    isValid: sellPriceResult.isValid && forceClosePriceResult.isValid,
  };
}


