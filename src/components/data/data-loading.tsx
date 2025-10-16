import { motion } from 'motion/react'
import { Database } from 'lucide-react'
import { memo } from 'react'

export const DataLoadingState = memo(function DataLoadingState() {
  return (
    <div className="h-screen-safe flex flex-col">
      {/* 简化的头部 */}
      <div className="backdrop-blur-md bg-background/80 border-b border-border/40">
        <div className="px-6 py-3">
          <div className="space-y-0.5">
            <h1 className="text-lg font-semibold">猴の数据库</h1>
            <p className="text-xs text-muted-foreground/70">给猴子提供价值</p>
          </div>
        </div>
      </div>

      {/* 加载内容区 */}
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center space-y-6"
        >
          {/* 加载图标组 */}
          <div className="relative">
            {/* 外圈旋转 */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="w-20 h-20 rounded-full border-2 border-primary/20 border-t-primary/60" />
            </motion.div>
            
            {/* 中心图标 */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <Database className="w-6 h-6 text-primary" />
              </motion.div>
            </div>
          </div>

          {/* 加载文本 */}
          <div className="text-center space-y-2">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-base font-medium text-foreground/90"
            >
              正在加载数据
            </motion.p>
            
            {/* 动态点点点 */}
            <div className="flex items-center justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    opacity: [0.3, 1, 0.3],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 1.2, 
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                />
              ))}
            </div>
          </div>

          {/* 提示文本 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xs text-muted-foreground/60"
          >
            初次加载可能需要几秒钟
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
})

export const DataErrorState = memo(function DataErrorState({ 
  error 
}: { 
  error: string 
}) {
  return (
    <div className="h-screen-safe flex flex-col">
      {/* 简化的头部 */}
      <div className="backdrop-blur-md bg-background/80 border-b border-border/40">
        <div className="px-6 py-3">
          <div className="space-y-0.5">
            <h1 className="text-lg font-semibold">猴の数据库</h1>
            <p className="text-xs text-muted-foreground/70">给猴子提供价值</p>
          </div>
        </div>
      </div>

      {/* 错误内容区 */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full"
        >
          <div className="rounded-lg border-2 border-destructive/40 bg-destructive/10 p-6 space-y-4">
            {/* 错误图标 */}
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                <svg 
                  className="w-6 h-6 text-destructive" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
            </div>

            {/* 错误信息 */}
            <div className="text-center space-y-2">
              <h3 className="text-base font-semibold text-foreground/90">加载失败</h3>
              <p className="text-sm text-muted-foreground/80">{error}</p>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm font-medium text-primary-foreground 
                         bg-primary hover:bg-primary/90 rounded-md 
                         transition-colors duration-200 shadow-sm"
              >
                刷新页面
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
})

