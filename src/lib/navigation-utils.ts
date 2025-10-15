import { NavigateOptions } from '@tanstack/react-router';
import { StockHolding } from '../types/holdings';

/**
 * 导航到持仓详情页面
 * @param navigate - TanStack Router 的 navigate 函数
 * @param holding - 持仓数据
 */
export function navigateToHoldingDetail(
  navigate: (options: NavigateOptions) => Promise<void>,
  holding: StockHolding
): void {
  navigate({
    to: '/hold/$stockCode',
    params: { stockCode: holding.stockCode },
    search: { holdingData: encodeURIComponent(JSON.stringify(holding)) },
  });
}

