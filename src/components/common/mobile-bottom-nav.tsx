import { AnimatePresence, motion } from 'motion/react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { HatGlasses, Banana, HandMetal, MessageSquareHeart, Unlink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDeviceDetect } from '@/hooks/use-device-detect'

interface NavItem {
  id: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}

const navItems: NavItem[] = [
  { id: 'chat', path: '/chat', icon: MessageSquareHeart, label: '聊天' },
  { id: 'pick', path: '/pick', icon: Banana, label: '自选' },
  { id: 'feel', path: '/feel', icon: HatGlasses, label: '猴园儿' },
  { id: 'hold', path: '/hold', icon: HandMetal, label: '持仓' },
  { id: 'data', path: '/data', icon: Unlink, label: '数据' },
]

/**
 * 移动端底部导航栏组件
 * 
 * 特性：
 * - 仅在移动设备显示
 * - 固定在底部，适配安全区域
 * - 毛玻璃背景效果
 * - 激活状态高亮动画
 * - 点击反馈动画
 */
export function MobileBottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isMobileDevice } = useDeviceDetect()

  // 仅在移动设备显示
  if (!isMobileDevice) {
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

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pointer-events-none px-6"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)',
      }}
    >
      <motion.nav
        className={cn(
          'pointer-events-auto',
          'max-w-md w-full px-1 py-1 h-14 rounded-[20px]',
          'border border-border/40',
          'backdrop-blur-3xl bg-background/85 supports-[backdrop-filter]:bg-background/75',
          'shadow-[0_2px_16px_rgba(0,0,0,0.06),0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.3),0_8px_32px_rgba(0,0,0,0.2)]'
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

