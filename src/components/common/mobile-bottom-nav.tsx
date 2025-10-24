import { AnimatePresence, motion } from 'motion/react'
import { useNavigate, useLocation, useRouter } from '@tanstack/react-router'
import { HatGlasses, Banana, HandMetal, MessageSquareHeart, Unlink, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface NavItem {
  id: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}

const navItems: NavItem[] = [
  { id: 'feel', path: '/feel', icon: HatGlasses, label: '猴园儿' },
  { id: 'pick', path: '/pick', icon: Banana, label: '自选' },
  { id: 'hold', path: '/hold', icon: HandMetal, label: '持仓' },
  { id: 'chat', path: '/chat', icon: MessageSquareHeart, label: '聊天' },
  { id: 'data', path: '/data', icon: Unlink, label: '数据' },
]

/**
 * 移动端底部导航栏组件
 * 
 * 特性：
 * - 仅在屏幕宽度 <= 720px 且竖屏时显示（与侧边栏断点保持一致）
 * - 横屏时隐藏，因为侧边栏会显示
 * - 固定在底部，适配安全区域
 * - 毛玻璃背景效果
 * - 激活状态高亮动画
 * - 点击反馈动画
 * - 智能返回按钮（在子页面或有历史记录时显示）
 */
export function MobileBottomNav() {
  const navigate = useNavigate()
  const router = useRouter()
  const location = useLocation()
  const [isPortrait, setIsPortrait] = useState(true)
  const [isMobileWidth, setIsMobileWidth] = useState(false)
  const [canGoBack, setCanGoBack] = useState(false)

  // 监听屏幕尺寸和方向变化
  useEffect(() => {
    const checkDisplay = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      // 宽度断点：与侧边栏保持一致 (720px)
      setIsMobileWidth(width <= 720)
      
      // 竖屏：高度大于宽度
      setIsPortrait(height > width)
    }

    // 初始检测
    checkDisplay()

    // 监听窗口大小变化（包括旋转）
    window.addEventListener('resize', checkDisplay)
    // 监听方向变化事件
    window.addEventListener('orientationchange', checkDisplay)

    return () => {
      window.removeEventListener('resize', checkDisplay)
      window.removeEventListener('orientationchange', checkDisplay)
    }
  }, [])

  // 检测是否可以返回（检查历史记录）
  useEffect(() => {
    // 检查是否在子页面（路径中有多个斜杠）
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const isSubPage = pathSegments.length > 1
    
    // 检查是否有历史记录可以返回
    const hasHistory = window.history.length > 1
    
    setCanGoBack(isSubPage || hasHistory)
  }, [location.pathname])

  // 仅在宽度 <= 720px 且竖屏时显示
  if (!isMobileWidth || !isPortrait) {
    return null
  }

  // 判断当前激活的导航项
  const getActiveItem = () => {
    const currentPath = location.pathname
    // 精确匹配或路径前缀匹配（用于子页面）
    const activeItem = navItems.find(item => 
      currentPath === item.path || currentPath.startsWith(item.path + '/')
    )
    return activeItem?.id || null
  }

  const activeItemId = getActiveItem()

  const handleNavClick = (path: string) => {
    navigate({ to: path })
  }

  const handleBack = () => {
    router.history.back()
  }

  return (
    <div
      className="fixed left-0 right-0 bottom-0 z-50 flex justify-center pointer-events-none px-6 pb-4"
    >
      {/* 底部导航栏 */}
      <motion.nav
        className={cn(
          'pointer-events-auto relative',
          'max-w-md w-full px-1 py-1 h-14 rounded-[20px]',
          'border border-border/20',
          'backdrop-blur-xl bg-background/50 supports-[backdrop-filter]:bg-background/40',
          'shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.3)]'
        )}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 32,
          mass: 0.7,
        }}
      >
        {/* 返回按钮 - 融入底栏右上角 */}
        <AnimatePresence>
          {canGoBack && (
            <motion.button
              onClick={handleBack}
              className={cn(
                'absolute -top-[6px] -right-[6px] z-10',
                'w-6 h-6 rounded-full',
                'border border-border/25',
                'backdrop-blur-xl bg-background/60 supports-[backdrop-filter]:bg-background/50',
                'shadow-[0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]',
                'flex items-center justify-center',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                'active:opacity-70'
              )}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileTap={{ scale: 0.80 }}
              transition={{
                type: 'spring',
                stiffness: 600,
                damping: 25,
                mass: 0.3,
              }}
            >
              <ChevronLeft className="w-3.5 h-3.5 text-foreground/75" strokeWidth={2.5} />
            </motion.button>
          )}
        </AnimatePresence>
        <div className="h-full flex items-center justify-between gap-0.5">
          {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItemId === item.id

          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className={cn(
                'relative flex flex-col items-center justify-center',
                'min-w-[50px] flex-1 h-full gap-[3px] px-1.5 py-0.5 rounded-[16px]',
                'transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                'active:opacity-70'
              )}
              whileTap={{ scale: 0.90 }}
              transition={{ 
                type: 'spring', 
                stiffness: 700, 
                damping: 30,
                mass: 0.4
              }}
            >
              {/* 背景高亮效果 - iOS 风格柔和背景 */}
              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-primary/[0.08] dark:bg-primary/[0.15] rounded-[16px]"
                    layoutId="activeBackground"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 35,
                      mass: 0.5,
                    }}
                  />
                )}
              </AnimatePresence>

              {/* 图标 */}
              <motion.div
                className="relative z-10"
                animate={{
                  scale: isActive ? 1.06 : 1,
                  y: isActive ? -0.5 : 0,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 550,
                  damping: 32,
                  mass: 0.5,
                }}
              >
                <Icon
                  className={cn(
                    'w-[19px] h-[19px] transition-all duration-200',
                    isActive
                      ? 'text-primary [stroke-width:2.5] drop-shadow-[0_1px_2px_rgba(var(--primary),0.15)]'
                      : 'text-muted-foreground/70 [stroke-width:2]'
                  )}
                />
              </motion.div>

              {/* 标签 */}
              <motion.span
                className={cn(
                  'text-[9.5px] font-medium whitespace-nowrap leading-tight z-10',
                  'transition-all duration-200',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground/60'
                )}
                animate={{
                  opacity: isActive ? 1 : 0.85,
                  scale: isActive ? 1.02 : 1,
                  fontWeight: isActive ? 600 : 500,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 550,
                  damping: 32,
                  mass: 0.5,
                }}
              >
                {item.label}
              </motion.span>
            </motion.button>
          )
        })}
        </div>
      </motion.nav>
    </div>
  )
}

