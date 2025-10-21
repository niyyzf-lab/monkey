import { ReactNode } from 'react'
import { motion } from 'motion/react'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
  children?: ReactNode
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className,
  children
}: EmptyStateProps) {
  return (
    <div className={cn("flex items-center justify-center min-h-[600px] py-24 px-6", className)}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center space-y-10 max-w-2xl w-full"
      >
        {/* 图标容器 - 现代极简设计 */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            duration: 0.8, 
            type: "spring", 
            stiffness: 120,
            delay: 0.1 
          }}
          className="flex items-center justify-center"
        >
          <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-muted/50 via-muted/30 to-muted/10 shadow-2xl border border-border/40 flex items-center justify-center">
            <Icon size={80} className="text-muted-foreground/60" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* 文字内容 - 大气清晰 */}
        <div className="space-y-5">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl font-extrabold text-foreground tracking-tight"
          >
            {title}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-lg text-muted-foreground/70 leading-relaxed max-w-lg mx-auto"
          >
            {description}
          </motion.p>
        </div>

        {/* 操作按钮 - 精致醒目 */}
        {action && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="pt-4 flex items-center justify-center"
          >
            <Button 
              onClick={action.onClick} 
              size="lg"
              className="shadow-lg hover:shadow-2xl transition-all duration-300 px-10 rounded-full"
            >
              {action.label}
            </Button>
          </motion.div>
        )}
        
        {children && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="pt-4 flex items-center justify-center"
          >
            {children}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
