import { motion } from 'motion/react';

export function HoldingsSkeleton() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1800px] mx-auto pt-4 px-4 pb-4 space-y-4">
        {/* 统计卡片骨架 - 简约风格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.4, 
                delay: i * 0.08,
                ease: "easeOut"
              }}
              className="rounded-xl border bg-card p-4 space-y-3 relative overflow-hidden"
            >
              {/* 渐变背景 */}
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/10 to-transparent"
              />
              
              <div className="relative space-y-3">
                <div className="h-3 w-20 bg-muted/30 rounded-md" />
                <div className="h-7 w-28 bg-muted/40 rounded-lg" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* 筛选栏骨架 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="h-12 bg-muted/10 rounded-xl relative overflow-hidden"
        >
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/10 to-transparent"
          />
        </motion.div>

        {/* 持仓卡片骨架 - 更简洁 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.5 + i * 0.05,
                ease: "easeOut"
              }}
              className="rounded-xl border bg-card overflow-hidden relative"
            >
              {/* 渐变动画 */}
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/5 to-transparent z-10"
              />
              
              {/* 卡片头部 */}
              <div className="p-3 space-y-2.5 border-b relative">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-muted/30 rounded-md" />
                    <div className="flex gap-2">
                      <div className="h-3 w-16 bg-muted/25 rounded" />
                      <div className="h-3 w-18 bg-muted/25 rounded" />
                    </div>
                  </div>
                  <div className="h-6 w-16 bg-muted/30 rounded-lg" />
                </div>
              </div>

              {/* 卡片内容 */}
              <div className="p-3 space-y-2.5 relative">
                <div className="p-2.5 rounded-lg bg-muted/10">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-3 w-12 bg-muted/25 rounded" />
                      <div className="h-5 w-20 bg-muted/30 rounded-md" />
                    </div>
                    <div className="space-y-2 text-right">
                      <div className="h-3 w-14 bg-muted/25 rounded" />
                      <div className="h-4 w-16 bg-muted/30 rounded-md" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="h-3 w-16 bg-muted/25 rounded" />
                  <div className="h-3 w-16 bg-muted/25 rounded" />
                </div>

                <div className="h-14 bg-muted/10 rounded-lg" />

                <div className="grid grid-cols-2 gap-2">
                  <div className="h-3 w-full bg-muted/25 rounded" />
                  <div className="h-3 w-full bg-muted/25 rounded" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

