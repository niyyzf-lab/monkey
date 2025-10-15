import { motion } from 'motion/react'
import { memo, useMemo } from 'react'

/**
 * 观猴感页面标题组件 - 简洁版
 */
export const FeelPageHeader = memo(() => {
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }, [])

  const currentTime = useMemo(() => {
    return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
    >
      <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
        观猴感
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        {formattedDate} · {currentTime}
      </p>
    </motion.div>
  )
})

FeelPageHeader.displayName = 'FeelPageHeader'

