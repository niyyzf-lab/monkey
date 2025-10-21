import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  title?: string
  description?: string
  className?: string
}

export function LoadingState({ 
  title = "正在加载", 
  description = "请稍候...", 
  className 
}: LoadingStateProps) {
  return (
    <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center space-y-6"
      >
        {/* 简约旋转圆环 */}
        <div className="relative w-16 h-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="w-full h-full rounded-full border-3 border-muted/20 border-t-primary/80" />
          </motion.div>
          
          {/* 内圈脉动 */}
          <motion.div
            animate={{ scale: [0.8, 1, 0.8], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-primary/10"
          />
        </div>

        {/* 文字信息 */}
        <div className="text-center space-y-2">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base font-medium text-foreground/90"
          >
            {title}
          </motion.p>
          
          {/* 动态加载点 */}
          <div className="flex items-center justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.3, 1]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
                className="w-1.5 h-1.5 rounded-full bg-primary/70"
              />
            ))}
          </div>
          
          {description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-muted-foreground/60"
            >
              {description}
            </motion.p>
          )}
        </div>
      </motion.div>
    </div>
  )
}



