import { memo } from 'react'
import { motion } from 'motion/react'
import { Compass } from 'lucide-react'
import { CardContent, CardDescription } from '@/components/ui/card'
import { MotionCard } from '@/components/ui/motion-card'
import { ANIMATION_DELAYS, ANIMATION_DURATIONS } from '@/constants/market-config'
import type { FundFlow } from '@/types/market-data'

interface FundFlowCardProps {
  fundFlow: FundFlow
}

/**
 * 资金罗盘卡片 - 显示北向资金流入流出
 */
export const FundFlowCard = memo(({ fundFlow }: FundFlowCardProps) => {
  return (
    <MotionCard delay={ANIMATION_DELAYS.FUND_CARD}>
      <CardContent className="flex flex-col items-center justify-center text-center space-y-4 pt-6 pb-6 h-full min-h-[200px] lg:min-h-[240px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ 
            duration: ANIMATION_DURATIONS.COMPASS_ROTATE,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Compass className="w-16 h-16 lg:w-20 lg:h-20 text-muted-foreground/30" strokeWidth={1} />
        </motion.div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider">
          Northbound Funds
        </div>
        <div className="text-3xl lg:text-4xl font-bold text-foreground tabular-nums">
          {fundFlow.amount}
        </div>
        <CardDescription className="text-xs lg:text-sm">
          北向资金净{fundFlow.direction === 'inflow' ? '流入' : '流出'}
        </CardDescription>
      </CardContent>
    </MotionCard>
  )
})

FundFlowCard.displayName = 'FundFlowCard'

