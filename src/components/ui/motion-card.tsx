import { motion, type HTMLMotionProps } from 'motion/react'
import { memo } from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { ANIMATION_DURATIONS, HOVER_EFFECTS } from '@/constants/market-config'

interface MotionCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
  delay?: number
  enableHover?: boolean
}

/**
 * 带动画效果的卡片组件
 * 支持淡入动画和悬停效果
 */
export const MotionCard = memo(({ 
  children, 
  className, 
  delay = 0,
  enableHover = true,
  ...motionProps 
}: MotionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay,
        duration: ANIMATION_DURATIONS.FADE_IN,
      }}
      whileHover={enableHover ? { y: HOVER_EFFECTS.Y_OFFSET } : undefined}
      className="w-full"
      {...motionProps}
    >
      <Card 
        className={cn(
          "w-full h-full border border-border transition-shadow duration-300",
          enableHover && "hover:shadow-md",
          className
        )}
      >
        {children}
      </Card>
    </motion.div>
  )
})

MotionCard.displayName = 'MotionCard'

