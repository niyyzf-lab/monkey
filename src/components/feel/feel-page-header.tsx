import { motion } from 'motion/react'
import { memo } from 'react'

/**
 * 观猴感页面标题组件 - 简洁版
 */
export const FeelPageHeader = memo(() => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 select-none"
      data-tauri-drag-region
    >
      <h1 className="text-3xl lg:text-4xl font-bold tracking-tight" data-tauri-drag-region>
        猴园儿 <small className='text-lg'>(其实就是一般软件的主页 )</small>
      </h1>
      <p className="text-sm text-muted-foreground mt-1 ml-0.5" data-tauri-drag-region>
        猴园儿，开启一段与AI猴群的互动与探索之旅，在这里感受生态多样，深入了解猴类行为、社交及生态环境。
      </p>
    </motion.div>
  )
})

FeelPageHeader.displayName = 'FeelPageHeader'

