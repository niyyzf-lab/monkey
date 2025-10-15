import { motion } from 'motion/react';

export function HoldingsSkeleton() {
  return (
    <div className="h-full overflow-y-auto bg-muted/10">
      <div className="max-w-[1800px] mx-auto p-4 space-y-4">
        {/* 工具栏骨架 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-4 flex-wrap"
        >
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="flex-1 min-w-[200px] max-w-md h-9 bg-muted rounded animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-32 bg-muted rounded animate-pulse" />
            <div className="h-9 w-20 bg-muted rounded animate-pulse" />
          </div>
        </motion.div>

        {/* 统计卡片骨架 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.3, 
                delay: i * 0.05,
              }}
              className="rounded-lg border bg-card p-4 space-y-3"
            >
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              <div className="h-6 w-24 bg-muted rounded animate-pulse" />
            </motion.div>
          ))}
        </div>

        {/* 筛选栏骨架 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="h-12 bg-muted/20 rounded-lg animate-pulse"
        />

        {/* 持仓卡片骨架 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.2,
                delay: 0.3 + i * 0.02,
              }}
              className="rounded-lg border bg-card overflow-hidden"
            >
              {/* 卡片头部 */}
              <div className="p-3 space-y-2 border-b">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-4 w-14 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>

              {/* 卡片内容 */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between p-2 rounded-md bg-muted/20">
                  <div className="space-y-1.5">
                    <div className="h-3 w-10 bg-muted rounded animate-pulse" />
                    <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-12 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-14 bg-muted rounded animate-pulse" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                </div>

                <div className="h-12 bg-muted/20 rounded-md animate-pulse" />

                <div className="grid grid-cols-2 gap-2">
                  <div className="h-3 w-full bg-muted rounded animate-pulse" />
                  <div className="h-3 w-full bg-muted rounded animate-pulse" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

