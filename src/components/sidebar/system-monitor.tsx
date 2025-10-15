import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

// 简洁的帧率显示组件 - 小清新风格，支持深色模式
export const SystemMonitor = React.memo(() => {
  const [fps, setFps] = React.useState(60)

  // 简化的FPS模拟
  React.useEffect(() => {
    const updateFPS = () => {
      // 模拟帧率波动
      const baseFps = 60 + Math.random() * 10 - 5 // 55-65之间波动
      setFps(Math.round(baseFps))
    }

    updateFPS()
    const interval = setInterval(updateFPS, 3000) // 3秒更新一次
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="px-4 py-3 border-t border-sidebar-border/50">
      <motion.div 
        className="flex items-center justify-between text-xs"
        initial={{ opacity: 0, y: 6, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 350,
          damping: 25,
          delay: 0.05
        }}
      >
        <span className="text-muted-foreground font-medium">帧率</span>
        <motion.span 
          className={cn(
            "font-mono font-medium transition-colors duration-300",
            fps >= 58 
              ? "text-green-600 dark:text-green-400" 
              : "text-sidebar-foreground"
          )}
          key={fps}
          initial={{ scale: 1.08, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 380,
            damping: 26
          }}
        >
          {fps} FPS
        </motion.span>
      </motion.div>
    </div>
  )
})
SystemMonitor.displayName = "SystemMonitor"

