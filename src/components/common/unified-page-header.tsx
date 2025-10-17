import { ReactNode, useState, useEffect } from 'react'
import { Search, X, Menu } from 'lucide-react'
import { Input } from '../ui/input'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { useSidebar } from '../sidebar'
import { Button } from '../ui/button'

interface SearchConfig {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onClear?: () => void
}

interface UnifiedPageHeaderProps {
  /** 页面主标题 */
  title: string | ReactNode
  /** 页面副标题/描述 */
  subtitle?: string | ReactNode
  /** 右侧工具区域（自定义内容） */
  tools?: ReactNode
  /** 搜索框配置（可选） */
  searchConfig?: SearchConfig
  /** 自定义类名 */
  className?: string
}

/**
 * 统一的页面标题栏组件
 * 
 * 布局：左侧标题（上大下小） + 右侧工具 + 搜索
 * 支持插槽设计，外部可自定义工具和搜索功能
 */
export function UnifiedPageHeader({
  title,
  subtitle,
  tools,
  searchConfig,
  className,
}: UnifiedPageHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const { setIsOpen, isMobile } = useSidebar()

  // 监听滚动，动态调整悬浮样式
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className={cn(
        'sticky top-0 z-20 h-16 flex items-center justify-between gap-4 px-4  transition-all duration-300',
        'backdrop-blur-xl bg-background/80 supports-[backdrop-filter]:bg-background/60',
        isScrolled 
          ? 'shadow-md border-b border-border/80' 
          : 'border-b border-border/40',
        className
      )}
      data-tauri-drag-region
    >
      {/* 左侧：标题区域 */}
      <div className="flex items-center gap-3 min-w-0 flex-1" data-tauri-drag-region>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="min-w-0 flex-1"
          data-tauri-drag-region
        >
          <div className="space-y-0" data-tauri-drag-region>
            {/* 大标题 */}
            <h1 
              className="text-lg font-semibold whitespace-nowrap truncate leading-tight" 
              data-tauri-drag-region
            >
              {title}
            </h1>
            
            {/* 小副标题 - 始终显示 */}
            {subtitle && (
              <p
                className="text-xs text-muted-foreground/70 whitespace-nowrap truncate leading-tight mt-0.5"
                data-tauri-drag-region
              >
                {subtitle}
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* 右侧：工具 + 搜索 + 菜单按钮（移动端） */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex items-center gap-3 flex-shrink-0"
      >
        {/* 自定义工具插槽 */}
        {tools && (
          <>
            <div className="flex items-center gap-2">
              {tools}
            </div>
            
            {/* 如果有搜索框，添加分隔线 */}
            {searchConfig && (
              <div className="h-6 w-px bg-border/50" />
            )}
          </>
        )}

        {/* 搜索框插槽 */}
        {searchConfig && (
          <div className="relative w-[180px] @md:w-[220px] @lg:w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={searchConfig.placeholder || '搜索...'}
              value={searchConfig.value}
              onChange={(e) => searchConfig.onChange(e.target.value)}
              className="pl-9 pr-9 h-9 bg-secondary/60 border border-border/50 focus:bg-secondary focus:border-primary/30 focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {searchConfig.value && (
              <button
                onClick={() => {
                  searchConfig.onChange('')
                  searchConfig.onClear?.()
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 p-0.5 rounded-sm hover:bg-muted/30"
                aria-label="清除搜索"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* 移动端侧边栏打开按钮 - 放在最右侧 */}
        {isMobile && (
          <>
            {/* 如果有搜索框或工具，添加分隔线 */}
            {(tools || searchConfig) && (
              <div className="h-6 w-px bg-border/50" />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(true)}
              className="flex-shrink-0 h-9 w-9"
              aria-label="打开侧边栏"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </>
        )}
      </motion.div>
    </div>
  )
}

