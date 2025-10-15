import { StockHolding } from '../../types/holdings';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Edit2, TrendingUp, TrendingDown, AlertTriangle, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { EditPriceDialog } from './hold-edit-price-dialog';
import { navigateToHoldingDetail } from '../../lib/navigation-utils';

interface CompactViewProps {
  holdings: StockHolding[];
}

// 格式化数字
const formatNumber = (num: number, decimals: number = 2): string => {
  if (num === undefined || num === null || isNaN(num)) {
    return '0.00';
  }
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// 检测是否接近止损
const isNearStopLoss = (currentPrice: number, stopLoss?: number): boolean => {
  if (!stopLoss || stopLoss <= 0) return false;
  return currentPrice <= stopLoss * 1.05;
};

// 检测是否接近止盈
const isNearTakeProfit = (currentPrice: number, takeProfit?: number): boolean => {
  if (!takeProfit || takeProfit <= 0) return false;
  return currentPrice >= takeProfit * 0.95;
};

export function CompactView({ holdings }: CompactViewProps) {
  const navigate = useNavigate();
  const [editingHolding, setEditingHolding] = useState<StockHolding | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleSavePrice = async (sellPrice: number, forceClosePrice: number) => {
    // TODO: 调用 API 保存价格
    console.log('Save prices:', { sellPrice, forceClosePrice });
  };

  return (
    <>
      <div className="@container space-y-2">
        {holdings.map((holding, index) => {
          const profitLossPercentage = holding.totalCost > 0
            ? ((holding.totalProfitLoss / holding.totalCost) * 100).toFixed(2)
            : '0.00';
          const isProfitable = holding.totalProfitLoss >= 0;
          const nearStop = isNearStopLoss(holding.currentPrice, holding.forceClosePrice);
          const nearProfit = isNearTakeProfit(holding.currentPrice, holding.sellPrice);

          return (
            <motion.div
              key={holding.stockCode}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
              onMouseEnter={() => setHoveredItem(holding.stockCode)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => navigateToHoldingDetail(navigate, holding)}
              className={`flex items-center gap-4 p-3 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer ${
                nearStop ? 'border-red-500/50 bg-red-50/30 dark:bg-red-950/10' : ''
              } ${nearProfit && !nearStop ? 'border-green-500/50 bg-green-50/30 dark:bg-green-950/10' : ''}`}
            >
              {/* 左侧：股票信息 */}
              <div className="flex-1 min-w-0 flex items-center gap-2 @xs:gap-3 @md:gap-3 flex-wrap @xs:flex-nowrap">
                {/* 股票名称和代码 */}
                <div className="min-w-0 flex-shrink-0 w-full @xs:w-auto @sm:w-[140px]">
                  <div className="font-semibold text-sm truncate flex items-center gap-1">
                    {holding.stockName}
                    {nearStop && (
                      <AlertTriangle className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                    )}
                    {nearProfit && !nearStop && (
                      <TrendingUp className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">{holding.stockCode}</div>
                </div>

                {/* 价格信息 */}
                <div className="flex items-center gap-2 @xs:gap-3 @md:gap-4 text-sm">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-muted-foreground">当前</span>
                    <span className="font-semibold tabular-nums">¥{formatNumber(holding.currentPrice)}</span>
                  </div>
                  <div className="hidden @xs:block h-3 w-px bg-border" />
                  <div className="hidden @xs:flex items-baseline gap-1">
                    <span className="text-xs text-muted-foreground">成本</span>
                    <span className="tabular-nums text-muted-foreground">¥{formatNumber(holding.costPrice)}</span>
                  </div>
                  <div className="hidden @md:block h-3 w-px bg-border" />
                  <div className="hidden @md:flex items-baseline gap-1">
                    <span className="text-xs text-muted-foreground">持仓</span>
                    <span className="tabular-nums">{formatNumber(holding.totalQuantity, 0)}</span>
                  </div>
                </div>
              </div>

              {/* 中间：盈亏信息 */}
              <div className="flex items-center gap-2 @xs:gap-3 @md:gap-4">
                {/* 市值 - 在小容器下隐藏 */}
                <div className="hidden @xl:block text-right" style={{ width: '80px' }}>
                  <div className="text-xs text-muted-foreground">市值</div>
                  <div className="font-medium text-sm tabular-nums">
                    {formatNumber(holding.marketValue / 10000, 1)}万
                  </div>
                </div>

                {/* 总盈亏 */}
                <div className="text-right w-auto @xs:w-[90px]">
                  <div className="text-xs text-muted-foreground hidden @xs:block">总盈亏</div>
                  <div
                    className={`font-bold text-sm tabular-nums ${
                      isProfitable ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {isProfitable ? '+' : ''}
                    {formatNumber(holding.totalProfitLoss / 10000, 2)}万
                  </div>
                </div>

                {/* 收益率徽章 */}
                <Badge
                  className={`tabular-nums font-bold text-white h-7 px-2 @xs:px-2.5 @md:px-3 ${
                    isProfitable
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isProfitable ? (
                    <TrendingUp className="h-3 w-3 mr-0.5 @xs:mr-1 inline" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-0.5 @xs:mr-1 inline" />
                  )}
                  {isProfitable ? '+' : ''}{profitLossPercentage}%
                </Badge>

                {/* 今日盈亏 - 在小容器下隐藏 */}
                <div className="hidden @lg:block text-right" style={{ width: '70px' }}>
                  <div className="text-xs text-muted-foreground">今日</div>
                  <div
                    className={`text-sm tabular-nums font-medium ${
                      holding.todayProfitLoss >= 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {holding.todayProfitLoss >= 0 ? '+' : ''}
                    {formatNumber(holding.todayProfitLoss, 0)}
                  </div>
                </div>
              </div>

              {/* 右侧：操作按钮 */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingHolding(holding);
                  }}
                  className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    opacity: hoveredItem === holding.stockCode ? 1 : 0,
                  }}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </motion.div>
          );
        })}

        {/* 空状态 */}
        {holdings.length === 0 && (
          <div className="text-center py-12 text-muted-foreground rounded-lg border bg-card">
            <p className="text-sm">暂无数据</p>
          </div>
        )}
      </div>

      {/* 编辑对话框 */}
      {editingHolding && (
        <EditPriceDialog
          holding={editingHolding}
          open={!!editingHolding}
          onOpenChange={open => !open && setEditingHolding(null)}
          onSave={handleSavePrice}
        />
      )}
    </>
  );
}

