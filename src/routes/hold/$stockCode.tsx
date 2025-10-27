import { createFileRoute } from '@tanstack/react-router';

// 定义路由搜索参数类型
type HoldingDetailSearch = {
  holdingData?: string; // 序列化的持仓数据
};

export const Route = createFileRoute('/hold/$stockCode')({
  validateSearch: (search: Record<string, unknown>): HoldingDetailSearch => {
    return {
      holdingData: search.holdingData as string | undefined,
    };
  },
});
