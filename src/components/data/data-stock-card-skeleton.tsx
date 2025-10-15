import { memo } from 'react'

export const StockCardSkeleton = memo(function StockCardSkeleton() {
  return (
    <div className="rounded-lg border border-border/40 bg-card p-4 space-y-3 animate-pulse">
      {/* 股票代码和名称 */}
      <div className="space-y-2">
        <div className="h-5 bg-muted/50 rounded w-24" />
        <div className="h-4 bg-muted/40 rounded w-32" />
      </div>
      
      {/* 价格信息 */}
      <div className="space-y-2">
        <div className="h-6 bg-muted/50 rounded w-20" />
        <div className="h-4 bg-muted/40 rounded w-16" />
      </div>
      
      {/* 标签 */}
      <div className="flex gap-2 flex-wrap">
        <div className="h-5 bg-muted/40 rounded w-12" />
        <div className="h-5 bg-muted/40 rounded w-16" />
        <div className="h-5 bg-muted/40 rounded w-14" />
      </div>
      
      {/* 描述 */}
      <div className="space-y-1">
        <div className="h-3 bg-muted/30 rounded w-full" />
        <div className="h-3 bg-muted/30 rounded w-4/5" />
      </div>
    </div>
  )
})

interface MasonrySkeletonGridProps {
  count: number
  columns: number
}

export const MasonrySkeletonGrid = memo(function MasonrySkeletonGrid({ 
  count, 
  columns 
}: MasonrySkeletonGridProps) {
  return (
    <div 
      className="grid gap-3"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(300px, 1fr))`
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <StockCardSkeleton key={`skeleton-${index}`} />
      ))}
    </div>
  )
})

