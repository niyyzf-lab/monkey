import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '../ui/badge';
import { Receipt, TrendingUp, TrendingDown } from 'lucide-react';
import { Operation } from '../../types/operation';
import { OperationTimelineItem } from './hold-operation-timeline-item';
import { OperationsEmptyState } from './hold-operations-empty-state';
import { useMemo } from 'react';

interface OperationsListProps {
  operations: Operation[];
  /** 延迟动画时间（秒） */
  animationDelay?: number;
}

// 格式化日期为分组键 (YYYY-MM-DD)
const formatDateKey = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateString;
  }
};

// 格式化日期显示（简洁版）
const formatDateDisplay = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) return '今天';
    if (isYesterday) return '昨天';
    
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  } catch {
    return dateString;
  }
};

// 安全数字转换
const toSafeNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

// 格式化数字（简洁版，包含容错）
const formatNumber = (value: unknown): string => {
  const num = toSafeNumber(value);
  if (Math.abs(num) >= 10000) {
    return (num / 10000).toFixed(2) + '万';
  }
  return num.toFixed(2);
};

// 日期分组数据结构
interface DateGroup {
  date: string;
  displayDate: string;
  operations: Operation[];
  buyCount: number;
  sellCount: number;
  buyAmount: number;
  sellAmount: number;
}

export function OperationsList({ operations, animationDelay = 0.25 }: OperationsListProps) {
  // 按日期分组并计算统计数据
  const dateGroups = useMemo(() => {
    const groupMap = new Map<string, DateGroup>();
    
    operations.forEach(op => {
      const dateKey = formatDateKey(op.OperationDate);
      
      if (!groupMap.has(dateKey)) {
        groupMap.set(dateKey, {
          date: dateKey,
          displayDate: formatDateDisplay(op.OperationDate),
          operations: [],
          buyCount: 0,
          sellCount: 0,
          buyAmount: 0,
          sellAmount: 0,
        });
      }
      
      const group = groupMap.get(dateKey)!;
      group.operations.push(op);
      
      const isBuy = op.OperationType.toLowerCase().includes('买');
      if (isBuy) {
        group.buyCount++;
        group.buyAmount += toSafeNumber(op.Amount);
      } else if (op.OperationType.toLowerCase().includes('卖')) {
        group.sellCount++;
        group.sellAmount += toSafeNumber(op.Amount);
      }
    });
    
    // 转换为数组并按日期倒序排序（最新的在前）
    return Array.from(groupMap.values()).sort((a, b) => {
      return b.date.localeCompare(a.date);
    });
  }, [operations]);

  // 计算所有交易中的最大金额（用于进度条计算）
  const maxAmount = useMemo(() => {
    return Math.max(...operations.map(op => toSafeNumber(op.Amount)), 0);
  }, [operations]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
    >
      <div className="rounded-lg border border-border/60 bg-card dark:bg-muted/50 p-3 shadow-sm">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">交易记录</h3>
            <Badge variant="secondary" className="text-[10px] h-5">
              {operations.length}
            </Badge>
          </div>
          
          {operations.length > 0 && (
            <div className="flex items-center gap-2 text-[10px]">
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <TrendingDown className="h-3 w-3" />
                <span>{operations.filter(op => op.OperationType.toLowerCase().includes('买')).length}</span>
              </div>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3" />
                <span>{operations.filter(op => op.OperationType.toLowerCase().includes('卖')).length}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* 内容区域 */}
        <div>
          {operations.length === 0 ? (
            <OperationsEmptyState />
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {dateGroups.map((group, groupIndex) => (
                  <motion.div
                    key={group.date}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: groupIndex * 0.05 }}
                    className="space-y-1"
                  >
                    {/* 日期标签 */}
                    <div className="flex items-center gap-2 px-2 py-0.5">
                      <div className="text-xs font-semibold text-foreground/70">
                        {group.displayDate}
                      </div>
                      <div className="h-px flex-1 bg-border/30" />
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        {group.buyCount > 0 && (
                          <span className="text-red-600 dark:text-red-400">
                            买{group.buyCount} ¥{formatNumber(group.buyAmount)}
                          </span>
                        )}
                        {group.sellCount > 0 && (
                          <span className="text-green-600 dark:text-green-400">
                            卖{group.sellCount} ¥{formatNumber(group.sellAmount)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* 该日期的交易记录 */}
                    <div>
                      {group.operations.map((operation, opIndex) => (
                        <OperationTimelineItem
                          key={operation.Id}
                          operation={operation}
                          index={opIndex}
                          isLast={opIndex === group.operations.length - 1 && groupIndex === dateGroups.length - 1}
                          maxAmount={maxAmount}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
