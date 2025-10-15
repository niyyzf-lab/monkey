import { motion } from 'motion/react';
import { ShoppingCart, Package, Receipt } from 'lucide-react';
import { Operation } from '../../types/operation';

interface OperationTimelineItemProps {
  operation: Operation;
  index: number;
  isLast: boolean;
  maxAmount: number;
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

// 格式化时间（HH:MM）
const formatTime = (dateString?: string): string => {
  if (!dateString) return '--:--';
  try {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return '--:--';
  }
};

// 获取操作类型的样式
const getOperationTypeStyle = (type: string) => {
  const typeLower = type.toLowerCase();
  if (typeLower.includes('买') || typeLower.includes('buy')) {
    return {
      color: 'text-red-600 dark:text-red-400',
      lightBg: 'bg-red-50',
      darkBg: 'dark:bg-red-950/30',
      nodeColor: 'bg-red-500',
      icon: ShoppingCart,
    };
  } else if (typeLower.includes('卖') || typeLower.includes('sell')) {
    return {
      color: 'text-green-600 dark:text-green-400',
      lightBg: 'bg-green-50',
      darkBg: 'dark:bg-green-950/30',
      nodeColor: 'bg-green-500',
      icon: Package,
    };
  }
  return {
    color: 'text-blue-600 dark:text-blue-400',
    lightBg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-950/30',
    nodeColor: 'bg-blue-500',
    icon: Receipt,
  };
};

export function OperationTimelineItem({ 
  operation, 
  index, 
  isLast,
}: OperationTimelineItemProps) {
  const typeStyle = getOperationTypeStyle(operation.OperationType);
  const Icon = typeStyle.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className="relative flex gap-2 group"
    >
      {/* 左侧：时间轴 */}
      <div className="flex flex-col items-center flex-shrink-0 w-12">
        {/* 时间 */}
        <div className="text-[10px] font-medium tabular-nums text-muted-foreground mb-1">
          {formatTime(operation.OperationDate)}
        </div>
        
        {/* 节点 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.03 + 0.1, type: 'spring', stiffness: 300 }}
          className={`w-2 h-2 rounded-full ${typeStyle.nodeColor} z-10`}
        />
        
        {/* 连接线 */}
        {!isLast && (
          <div className="w-px flex-1 bg-border/40 dark:bg-border/30 mt-1" />
        )}
      </div>

      {/* 右侧：交易信息 */}
      <div className="flex-1 pb-3">
        <div className={`flex items-center gap-2 px-2 py-1.5 rounded ${typeStyle.lightBg} ${typeStyle.darkBg} hover:shadow-sm transition-shadow`}>
          {/* 图标 */}
          <Icon className={`h-3.5 w-3.5 ${typeStyle.color} flex-shrink-0`} />
          
          {/* 数据 */}
          <div className="flex items-center gap-3 flex-1 text-xs">
            <div className={`font-semibold ${typeStyle.color} min-w-[2.5rem]`}>
              {operation.OperationType}
            </div>
            
            <div className="flex items-center gap-3 flex-1 tabular-nums text-foreground/80">
              <span>¥{formatNumber(operation.Price)}</span>
              <span className="text-muted-foreground">×</span>
              <span>{formatNumber(operation.Quantity, 0)}</span>
              <span className="text-muted-foreground">=</span>
              <span className={`font-semibold ${typeStyle.color}`}>
                ¥{formatNumber(operation.Amount)}
              </span>
            </div>
            
            {/* 状态 */}
            <div className="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-background/50 rounded">
              {operation.Status}
            </div>
          </div>
          
          {/* ID */}
          <div className="text-[9px] text-muted-foreground/40 font-mono">
            #{operation.Id}
          </div>
        </div>
        
        {/* 备注（如果有） */}
        {operation.Remarks && (
          <div className="text-[10px] text-muted-foreground/60 mt-1 ml-2 line-clamp-1 group-hover:line-clamp-none">
            {operation.Remarks}
          </div>
        )}
      </div>
    </motion.div>
  );
}
