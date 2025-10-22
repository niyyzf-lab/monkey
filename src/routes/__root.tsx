import { createRootRoute, Outlet, useNavigate, useLocation } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import {
  Sidebar,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '../components/sidebar'
import { Settings, HatGlasses, Banana, HandMetal, MessageSquareHeart, Brain, Unlink } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useViewportHeight } from '../hooks/use-viewport-height'
import { UpdaterProvider } from '../components/updater'
import { useDeviceDetect } from '../hooks/use-device-detect'
import { MobileBottomNav } from '../components/common/mobile-bottom-nav'

export const Route = createRootRoute({
  component: RootLayout,
})

// 自定义缓动曲线 - 流畅的进出效果
const customEase = [0.22, 0.61, 0.36, 1] as const

// 页面切换动画变体配置
const pageTransition = {
  initial: { 
    opacity: 0, 
    scale: 0.98,
    y: 10,
    filter: 'blur(4px)'
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: customEase,
      opacity: { duration: 0.3, ease: customEase },
      scale: { duration: 0.4, ease: customEase },
      y: { duration: 0.4, ease: customEase },
      filter: { duration: 0.35, ease: customEase }
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.96,
    y: -8,
    filter: 'blur(4px)',
    transition: {
      duration: 0.3,
      ease: customEase
    }
  }
}

// 内部布局组件，用于访问 sidebar context
function RootLayoutContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeItem, setActiveItem] = useState('/')
  const { isOpen, setIsOpen, isMobile } = useSidebar()
  const { isIOS } = useDeviceDetect()
  
  // 初始化视口高度监听，修复移动端 100vh 问题
  useViewportHeight()

  // 根据当前路径设置活跃状态
  useEffect(() => {
    const currentPath = location.pathname
    setActiveItem(currentPath)
  }, [location.pathname])

  const handleMenuClick = (path: string) => {
    setActiveItem(path)
    navigate({ to: path })
    // 移动端点击菜单后关闭侧边栏
    if (isMobile) {
      setIsOpen(false)
    }
  }

  const menuItems = [
    { id: 'feel', path: '/feel', icon: HatGlasses, label: '猴园儿', description: '观猴感主界面' },
    { id: 'pick', path: '/pick', icon: Banana, label: '猴の自选', description: '猴子的自选股' },
    { id: 'hold', path: '/hold', icon: HandMetal, label: '猴の持仓', description: '查看猴子的持仓' },
    { id: 'chat', path: '/chat', icon: MessageSquareHeart, label: '与猴聊聊天', description: '与猴子聊天互动' },
    { id: 'mind', path: '/mind', icon: Brain, label: '猴の觉悟', description: '猴子的历史记录' },
    { id: 'data', path: '/data', icon: Unlink, label: '猴の数据', description: '给猴子提供价值' },
  ]

  const settingsItem = { id: 'settings', path: '/settings', icon: Settings, label: '倒腾', description: '系统倒腾设置' }

  return (
      <motion.div 
        className="relative overflow-hidden h-full"
        style={{
          // 仅 iOS 需要顶部 padding 来适配安全区域（0.65 倍）
          paddingTop: isIOS ? 'calc(var(--safe-area-inset-top) * 0.65)' : '0',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ 
          duration: 0.5,
          ease: customEase
        }}
      >
        {/* <div className='absolute top-0 left-0 w-screen h-8 z-50 select-none' data-tauri-drag-region></div> */}
        
        <div 
          className="flex h-full relative"
        >
          {/* 侧边栏 */}
          <Sidebar>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem
                  key={item.id}
                  isActive={activeItem === item.path}
                  onClick={() => handleMenuClick(item.path)}
                  icon={item.icon}
                  label={item.label}
                />
              ))}
            </SidebarMenu>

            <SidebarFooter>
              <SidebarMenuItem
                isActive={activeItem === settingsItem.path}
                onClick={() => handleMenuClick(settingsItem.path)}
                icon={settingsItem.icon}
                label={settingsItem.label}
              />
            </SidebarFooter>
          </Sidebar>

          {/* 遮罩层 - 仅移动端显示，层级高于底部导航栏 */}
          <AnimatePresence>
            {isMobile && isOpen && (
              <motion.div
                className="fixed inset-0 bg-black/50 z-[55]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsOpen(false)}
              />
            )}
          </AnimatePresence>

          {/* 主内容区域 - 重新设计的页面切换动画 */}
          <motion.main 
            className="flex-1 relative overflow-hidden pb-0 md:pb-0"
            layout
            transition={{ 
              duration: 0.3,
              ease: customEase
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeItem}
                className="h-full"
                variants={pageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </motion.main>
        </div>

        {/* 移动端底部导航 */}
        <MobileBottomNav />
      </motion.div>
  )
}

function RootLayout() {
  return (
    <UpdaterProvider>
      <SidebarProvider>
        <RootLayoutContent />
      </SidebarProvider>
    </UpdaterProvider>
  )
}