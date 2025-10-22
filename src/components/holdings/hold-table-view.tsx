import { StockHolding } from '../../types/holdings';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Edit2, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { EditPriceDialog } from './hold-edit-price-dialog';
import { navigateToHoldingDetail } from '../../lib/navigation-utils';

interface TableViewProps {
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

export function TableView({ holdings }: TableViewProps) {
  const navigate = useNavigate();
  const [editingHolding, setEditingHolding] = useState<StockHolding | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleSavePrice = async (sellPrice: number, forceClosePrice: number) => {
    // TODO: 调用 API 保存价格
    console.log('Save prices:', { sellPrice, forceClosePrice });
  };

  return (
    <>
      <div className="@container rounded-xl border border-border/30 dark:border-border/20 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* 表头 */}
            <thead className="bg-muted/30 border-b border-border/30 dark:border-border/20 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">
                  股票
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">
                  当前价
                </th>
                <th className="hidden @xs:table-cell text-right text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">
                  成本价
                </th>
                <th className="hidden @md:table-cell text-right text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">
                  持仓量
                </th>
                <th className="hidden @xl:table-cell text-right text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">
                  市值
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">
                  总盈亏
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">
                  收益率
                </th>
                <th className="hidden @lg:table-cell text-right text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">
                  今日盈亏
                </th>
                <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">
                  操作
                </th>
              </tr>
            </thead>

            {/* 表体 */}
            <tbody>
              {holdings.map((holding, index) => {
                const profitLossPercentage = holding.totalCost > 0
                  ? ((holding.totalProfitLoss / holding.totalCost) * 100).toFixed(2)
                  : '0.00';
                const isProfitable = holding.totalProfitLoss >= 0;
                const nearStop = isNearStopLoss(holding.currentPrice, holding.forceClosePrice);
                const nearProfit = isNearTakeProfit(holding.currentPrice, holding.sellPrice);

                return (
                  <motion.tr
                    key={holding.stockCode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    onMouseEnter={() => setHoveredRow(holding.stockCode)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => navigateToHoldingDetail(navigate, holding)}
                    className={`border-b border-border/20 dark:border-border/10 transition-all duration-200 cursor-pointer ${
                      hoveredRow === holding.stockCode ? 'bg-muted/40 shadow-[inset_0_1px_0_rgba(0,0,0,0.02)]' : ''
                    } ${nearStop ? 'bg-red-50/50 dark:bg-red-950/10 border-red-200/30 dark:border-red-900/20' : ''} ${
                      nearProfit && !nearStop ? 'bg-green-50/50 dark:bg-green-950/10 border-green-200/30 dark:border-green-900/20' : ''
                    }`}
                  >
                    {/* 股票信息 */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium text-sm flex items-center gap-1.5">
                            {holding.stockName}
                            {nearStop && (
                              <AlertTriangle className="h-3.5 w-3.5 text-red-600"  />
                            )}
                            {nearProfit && !nearStop && (
                              <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {holding.stockCode}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 当前价 */}
                    <td className="px-4 py-3 text-right">
                      <div className="font-semibold text-sm tabular-nums">
                        ¥{formatNumber(holding.currentPrice)}
                      </div>
                    </td>

                    {/* 成本价 */}
                    <td className="hidden @xs:table-cell px-4 py-3 text-right">
                      <div className="text-sm tabular-nums text-muted-foreground">
                        ¥{formatNumber(holding.costPrice)}
                      </div>
                    </td>

                    {/* 持仓量 */}
                    <td className="hidden @md:table-cell px-4 py-3 text-right">
                      <div className="text-sm tabular-nums">
                        {formatNumber(holding.totalQuantity, 0)}
                      </div>
                    </td>

                    {/* 市值 */}
                    <td className="hidden @xl:table-cell px-4 py-3 text-right">
                      <div className="font-medium text-sm tabular-nums">
                        ¥{formatNumber(holding.marketValue / 10000, 2)}万
                      </div>
                    </td>

                    {/* 总盈亏 */}
                    <td className="px-4 py-3 text-right">
                      <div
                        className={`font-bold text-sm tabular-nums ${
                          isProfitable ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {isProfitable ? '+' : ''}¥{formatNumber(holding.totalProfitLoss / 10000, 2)}万
                      </div>
                    </td>

                    {/* 收益率 */}
                    <td className="px-4 py-3 text-right">
                      <Badge
                        className={`tabular-nums font-bold text-white ${
                          isProfitable
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {isProfitable ? (
                          <TrendingUp className="h-3 w-3 mr-0.5 inline" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-0.5 inline" />
                        )}
                        {isProfitable ? '+' : ''}{profitLossPercentage}%
                      </Badge>
                    </td>

                    {/* 今日盈亏 */}
                    <td className="hidden @lg:table-cell px-4 py-3 text-right">
                      <div
                        className={`text-sm tabular-nums ${
                          holding.todayProfitLoss >= 0 ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {holding.todayProfitLoss >= 0 ? '+' : ''}
                        {formatNumber(holding.todayProfitLoss, 2)}
                      </div>
                    </td>

                    {/* 操作 */}
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingHolding(holding);
                        }}
                        className="h-7 px-2"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 空状态 */}
        {holdings.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
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

