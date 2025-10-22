import { memo } from 'react'
import { motion } from 'motion/react'
import { Activity, Circle } from 'lucide-react'
import { CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MotionCard } from '@/components/ui/motion-card'
import { ANIMATION_DELAYS, ANIMATION_DURATIONS } from '@/constants/market-config'
import type { MarketSentiment } from '@/types/market-data'

interface MarketSentimentCardProps {
  sentiment: MarketSentiment
}

/**
 * 市场温度卡片 - 显示市场情绪和热度
 */
export const MarketSentimentCard = memo(({ sentiment }: MarketSentimentCardProps) => {
  return (
    <MotionCard delay={ANIMATION_DELAYS.SENTIMENT_CARD}>
      <CardContent className="flex flex-col items-center justify-center text-center space-y-4 pt-6 pb-6 h-full min-h-[200px] lg:min-h-[240px]">
        <Activity className="w-7 h-7 lg:w-8 lg:h-8 text-muted-foreground" />
        <div className="text-xs text-muted-foreground uppercase tracking-wider">
          Market Sentiment
        </div>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ 
            duration: ANIMATION_DURATIONS.PULSE,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-5xl lg:text-6xl font-bold text-foreground tabular-nums"
        >
          {sentiment.temperature}°
        </motion.div>
        <div className="text-sm font-medium text-muted-foreground">市场热度</div>
        <Badge variant="default" className="gap-1.5 text-xs lg:text-sm">
          <Circle className="w-1.5 h-1.5 fill-current animate-pulse" />
          {sentiment.status}
        </Badge>
      </CardContent>
    </MotionCard>
  )
})

MarketSentimentCard.displayName = 'MarketSentimentCard'

