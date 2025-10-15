import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHeaderCollapse } from '@/hooks/use-header-collapse'

interface CollapsiblePageHeaderProps {
  /** 页面唯一标识，用于状态持久化 */
  pageKey: string
  /** 标题内容 */
  title: ReactNode
  /** 副标题/描述 */
  subtitle?: ReactNode
  /** 展开时显示的额外内容 */
  expandedContent?: ReactNode
  /** 折叠时显示的精简内容 */
  collapsedContent?: ReactNode
  /** 右侧操作区域（始终显示） */
  actions?: ReactNode
  /** 自定义类名 */
  className?: string
  /** 默认是否折叠 */
  defaultCollapsed?: boolean
  /** 是否显示折叠按钮 */
  showToggleButton?: boolean
}

export function CollapsiblePageHeader({
  pageKey,
  title,
  subtitle,
  expandedContent,
  collapsedContent,
  actions,
  className,
  defaultCollapsed = false,
  showToggleButton = true,
}: CollapsiblePageHeaderProps) {
  const { isCollapsed, toggle } = useHeaderCollapse(pageKey, defaultCollapsed)

  return (
    <motion.div
      className={cn(
        'sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b',
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 sm:px-6">
        {/* 主标题行 - 始终显示 */}
        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* 标题 */}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight truncate">
                {title}
              </h1>
              
              {/* 折叠时显示的内容 */}
              <AnimatePresence mode="wait">
                {isCollapsed && collapsedContent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {collapsedContent}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 折叠/展开按钮 */}
            {showToggleButton && (
              <motion.button
                onClick={toggle}
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-lg',
                  'bg-muted/50 hover:bg-muted transition-colors',
                  'text-muted-foreground hover:text-foreground'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={isCollapsed ? '展开标题' : '折叠标题'}
              >
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </motion.button>
            )}
          </div>

          {/* 操作区域 - 始终显示 */}
          {actions && (
            <div className="flex items-center gap-2 shrink-0">
              {actions}
            </div>
          )}
        </div>

        {/* 展开时显示的内容 */}
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
            >
              <div className="pb-3 space-y-3">
                {/* 副标题 */}
                {subtitle && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="text-sm text-muted-foreground"
                  >
                    {subtitle}
                  </motion.p>
                )}

                {/* 额外的展开内容 */}
                {expandedContent && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2, delay: 0.15 }}
                  >
                    {expandedContent}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

