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
      <div className="flex-1 pb-2 md:pb-3">
        <div className={`flex flex-col md:flex-row md:items-center gap-1.5 md:gap-2 px-2 py-1.5 rounded ${typeStyle.lightBg} ${typeStyle.darkBg} hover:shadow-sm transition-shadow`}>
          {/* 移动端：上层 - 类型、价格和状态 */}
          <div className="flex items-center gap-2 md:flex-1">
            {/* 图标 */}
            <Icon className={`h-3 w-3 md:h-3.5 md:w-3.5 ${typeStyle.color} flex-shrink-0`} />
            
            {/* 操作类型 */}
            <div className={`font-semibold ${typeStyle.color} text-[11px] md:text-xs min-w-[2rem] md:min-w-[2.5rem]`}>
              {operation.OperationType}
            </div>
            
            {/* 交易数据 */}
            <div className="flex items-center gap-1.5 md:gap-3 flex-1 tabular-nums text-foreground/80 text-[11px] md:text-xs overflow-x-auto">
              <span className="whitespace-nowrap">¥{formatNumber(operation.Price)}</span>
              <span className="text-muted-foreground">×</span>
              <span className="whitespace-nowrap">{formatNumber(operation.Quantity, 0)}</span>
              <span className="text-muted-foreground hidden xs:inline">=</span>
              <span className={`font-semibold ${typeStyle.color} whitespace-nowrap hidden xs:inline`}>
                ¥{formatNumber(operation.Amount)}
              </span>
            </div>
            
            {/* 状态 - 桌面端 */}
            <div className="hidden md:block text-[10px] text-muted-foreground px-1.5 py-0.5 bg-background/50 rounded whitespace-nowrap">
              {operation.Status}
            </div>
            
            {/* ID - 桌面端 */}
            <div className="hidden md:block text-[9px] text-muted-foreground/40 font-mono whitespace-nowrap">
              #{operation.Id}
            </div>
          </div>
          
          {/* 移动端：下层 - 总金额和ID（仅在小屏显示） */}
          <div className="flex items-center justify-between xs:hidden text-[10px] pl-5">
            <span className={`font-semibold ${typeStyle.color} tabular-nums`}>
              总额: ¥{formatNumber(operation.Amount)}
            </span>
            <span className="text-muted-foreground/40 font-mono">
              #{operation.Id}
            </span>
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
