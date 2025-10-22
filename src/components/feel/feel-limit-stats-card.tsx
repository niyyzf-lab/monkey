import { memo } from 'react'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import { CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MotionCard } from '@/components/ui/motion-card'
import { ANIMATION_DELAYS } from '@/constants/market-config'
import type { LimitStats } from '@/types/market-data'

interface LimitStatsCardProps {
  stats: LimitStats
}

/**
 * 涨跌停统计卡片 - 显示涨停、跌停和强势股数据
 */
export const LimitStatsCard = memo(({ stats }: LimitStatsCardProps) => {
  return (
    <>
      {/* 涨停家数 */}
      <MotionCard delay={ANIMATION_DELAYS.LIMIT_UP}>
        <CardContent className="flex flex-col items-center justify-center text-center space-y-3 lg:space-y-4 pt-6 pb-6 min-h-[180px] lg:min-h-[200px]">
          <TrendingUp className="w-7 h-7 lg:w-8 lg:h-8 text-muted-foreground" />
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Limit Up
          </div>
          <div className="text-5xl lg:text-6xl font-bold text-foreground tabular-nums">
            {stats.limitUp}
          </div>
          <Badge variant="default" className="text-xs lg:text-sm">
            较昨日 {stats.limitUpChange > 0 ? '+' : ''}{stats.limitUpChange}
          </Badge>
        </CardContent>
      </MotionCard>

      {/* 跌停家数 */}
      <MotionCard delay={ANIMATION_DELAYS.LIMIT_DOWN}>
        <CardContent className="flex flex-col items-center justify-center text-center space-y-3 lg:space-y-4 pt-6 pb-6 min-h-[180px] lg:min-h-[200px]">
          <TrendingDown className="w-7 h-7 lg:w-8 lg:h-8 text-muted-foreground" />
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Limit Down
          </div>
          <div className="text-5xl lg:text-6xl font-bold text-foreground tabular-nums">
            {stats.limitDown}
          </div>
          <Badge variant="secondary" className="text-xs lg:text-sm">
            较昨日 {stats.limitDownChange > 0 ? '+' : ''}{stats.limitDownChange}
          </Badge>
        </CardContent>
      </MotionCard>

      {/* 强势股 */}
      <MotionCard delay={ANIMATION_DELAYS.STRONG_STOCKS}>
        <CardContent className="flex flex-col items-center justify-center text-center space-y-3 lg:space-y-4 pt-6 pb-6 min-h-[180px] lg:min-h-[200px]">
          <BarChart3 className="w-7 h-7 lg:w-8 lg:h-8 text-muted-foreground" />
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Strong Stocks
          </div>
          <div className="text-5xl lg:text-6xl font-bold text-foreground tabular-nums">
            {stats.strongStocks}
          </div>
          <CardDescription className="text-xs lg:text-sm">涨幅 &gt; 5%</CardDescription>
        </CardContent>
      </MotionCard>
    </>
  )
})

LimitStatsCard.displayName = 'LimitStatsCard'

