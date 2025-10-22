import { memo } from 'react'
import { motion } from 'motion/react'
import { TrendingUp } from 'lucide-react'
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MotionCard } from '@/components/ui/motion-card'
import { ANIMATION_DELAYS } from '@/constants/market-config'
import type { MarketIndex } from '@/types/market-data'

interface MarketPulseCardProps {
  mainIndex: MarketIndex
  subIndices: readonly MarketIndex[]
}

/**
 * 市场脉搏卡片 - 显示主要指数和子指数
 */
export const MarketPulseCard = memo(({ mainIndex, subIndices }: MarketPulseCardProps) => {
  return (
    <div className="lg:col-span-3 flex">
      <MotionCard delay={ANIMATION_DELAYS.MAIN_CARD}>
        <div className="flex flex-col h-full">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              市场脉搏
            </CardTitle>
            <CardDescription className="text-xs lg:text-sm">
              实时追踪主要市场指数动态
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 lg:space-y-8 flex-1 flex flex-col justify-center">
            {/* 主指数 */}
            <div className="space-y-3">
              <div className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
                {mainIndex.name}
              </div>
              <div className="flex items-end gap-3 lg:gap-4">
                <motion.div 
                  className="text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground tabular-nums"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: ANIMATION_DELAYS.MAIN_CARD + 0.2 }}
                >
                  {mainIndex.value}
                </motion.div>
                <motion.div 
                  className="mb-1 lg:mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: ANIMATION_DELAYS.MAIN_CARD + 0.3 }}
                >
                  <Badge 
                    variant={mainIndex.isUp ? "default" : "destructive"} 
                    className="text-base lg:text-lg px-2.5 lg:px-3 py-0.5 lg:py-1"
                  >
                    {mainIndex.isUp && <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />}
                    {mainIndex.change}
                  </Badge>
                </motion.div>
              </div>
            </div>
            
            {/* 其他指数 */}
            <div className="grid grid-cols-2 gap-4 lg:gap-6 pt-4 lg:pt-6 border-t border-border">
              {subIndices.map((item, idx) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: ANIMATION_DELAYS.MAIN_CARD + 0.4 + idx * 0.1 }}
                  className="space-y-2"
                >
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    {item.name}
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-foreground tabular-nums">
                    {item.value}
                  </div>
                  <Badge 
                    variant={item.isUp ? "default" : "destructive"} 
                    className="tabular-nums text-xs lg:text-sm"
                  >
                    {item.change}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </div>
      </MotionCard>
    </div>
  )
})

MarketPulseCard.displayName = 'MarketPulseCard'

