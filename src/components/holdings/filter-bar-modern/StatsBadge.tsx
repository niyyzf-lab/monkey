
interface StatsBadgeProps {
  filteredCount: number;
  totalCount: number;
  profitableCount: number;
  losingCount: number;
  className?: string;
}

export function StatsBadge({
  filteredCount,
  totalCount,
  profitableCount,
  losingCount,
  className = '',
}: StatsBadgeProps) {
  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <span className="text-muted-foreground">
        <span className="font-semibold text-foreground">{filteredCount}</span>
        {filteredCount !== totalCount && (
          <span className="text-muted-foreground"> / {totalCount}</span>
        )}
      </span>
      
      {/* 盈亏比例 - 简化显示 */}
      {totalCount > 0 && (profitableCount > 0 || losingCount > 0) && (
        <>
          <span className="text-muted-foreground">·</span>
          <div className="flex items-center gap-1">
            {profitableCount > 0 && (
              <span className="text-xs text-green-600 dark:text-green-400">
                ↗{profitableCount}
              </span>
            )}
            {losingCount > 0 && (
              <span className="text-xs text-red-600 dark:text-red-400">
                ↘{losingCount}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
