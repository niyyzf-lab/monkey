import { memo } from 'react'
import { motion } from 'motion/react'
import { Zap, ArrowUpRight } from 'lucide-react'
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MotionCard } from '@/components/ui/motion-card'
import { ANIMATION_DELAYS } from '@/constants/market-config'
import type { HotSector } from '@/types/market-data'

interface HotSectorsCardProps {
  sectors: readonly HotSector[]
}

/**
 * 热门板块卡片 - 显示今日活跃板块
 */
export const HotSectorsCard = memo(({ sectors }: HotSectorsCardProps) => {
  return (
    <MotionCard delay={ANIMATION_DELAYS.HOT_SECTORS}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
            <Zap className="h-5 w-5 text-muted-foreground" />
            热门板块
          </CardTitle>
          <Badge variant="outline" className="text-xs">TODAY'S ACTIVE SECTORS</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
          {sectors.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: ANIMATION_DELAYS.HOT_SECTORS + 0.05 + idx * 0.1 }}
              className="flex items-center gap-4 lg:gap-6 p-4 lg:p-6 bg-muted rounded-lg hover:bg-accent transition-colors cursor-pointer group"
            >
              <Badge 
                variant="outline" 
                className="text-xl lg:text-2xl py-1.5 lg:py-2 px-3 lg:px-4 tabular-nums group-hover:border-primary transition-colors"
              >
                {String(item.rank).padStart(2, '0')}
              </Badge>
              <div className="flex-1 min-w-0">
                <div className="text-base lg:text-xl font-semibold text-foreground truncate">
                  {item.name}
                </div>
                <div className="text-xs lg:text-sm text-muted-foreground mt-0.5 lg:mt-1">
                  成交额 {item.volume}
                </div>
              </div>
              <Badge 
                variant="default" 
                className="text-sm lg:text-base px-2.5 lg:px-3 py-0.5 lg:py-1 tabular-nums shrink-0"
              >
                {item.change}
              </Badge>
              <ArrowUpRight className="w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </motion.div>
          ))}
        </div>
      </CardContent>
    </MotionCard>
  )
})

HotSectorsCard.displayName = 'HotSectorsCard'

