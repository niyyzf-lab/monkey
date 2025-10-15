import { motion } from 'motion/react';

interface HoldingsCardSkeletonProps {
  count: number;
}

function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className="rounded-lg border bg-card p-3 space-y-2"
    >
      {/* 头部：股票名称和徽章 */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          {/* 股票名称 */}
          <div className="h-4 w-24 bg-muted/50 rounded animate-pulse"></div>
          {/* 代码和持仓 */}
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 bg-muted/50 rounded animate-pulse"></div>
            <div className="h-3 w-20 bg-muted/50 rounded animate-pulse"></div>
          </div>
        </div>
        {/* 收益率徽章 */}
        <div className="h-7 w-20 bg-muted/50 rounded animate-pulse"></div>
      </div>

      {/* 盈亏数据 */}
      <div className="flex items-center justify-between px-2 py-1.5 rounded-md">
        <div className="space-y-1">
          <div className="h-6 w-16 bg-muted/50 rounded animate-pulse"></div>
          <div className="h-3 w-12 bg-muted/50 rounded animate-pulse"></div>
        </div>
        <div className="space-y-1 text-right">
          <div className="h-3 w-8 bg-muted/50 rounded animate-pulse ml-auto"></div>
          <div className="h-4 w-12 bg-muted/50 rounded animate-pulse ml-auto"></div>
        </div>
      </div>

      {/* 分割线 */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

      {/* 价格信息 */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="h-3 w-8 bg-muted/50 rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-muted/50 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-8 bg-muted/50 rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-muted/50 rounded animate-pulse"></div>
        </div>
      </div>

      {/* 分割线 */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

      {/* 详细数据 */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-1">
        <div className="flex justify-between">
          <div className="h-3 w-16 bg-muted/50 rounded animate-pulse"></div>
          <div className="h-3 w-20 bg-muted/50 rounded animate-pulse"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-3 w-12 bg-muted/50 rounded animate-pulse"></div>
          <div className="h-3 w-16 bg-muted/50 rounded animate-pulse"></div>
        </div>
      </div>
    </motion.div>
  );
}

export function HoldingsCardSkeleton({ count }: HoldingsCardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 @xs:grid-cols-2 @sm:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4 @xl:grid-cols-5 @2xl:grid-cols-6 gap-4 pb-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} index={index} />
      ))}
    </div>
  );
}

