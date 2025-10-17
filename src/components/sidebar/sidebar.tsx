import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { CoolMode } from "@/components/ui/cool-mode"
import { MacTrafficLights } from "@/components/common/mac-traffic-lights"
import { useSidebar } from "./sidebar-context"
import { resetMenuItemCounter } from "./sidebar-menu"
import { useDeviceDetect } from "@/hooks/use-device-detect"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

// 侧边栏主组件 - 响应式宽度，支持深色模式
export const Sidebar = React.memo(React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, children }, ref) => {
    const { isOpen, isMobile } = useSidebar()
    const { isIOS, isAndroid } = useDeviceDetect()
    
    // 每次渲染时重置菜单项计数器
    React.useEffect(() => {
      resetMenuItemCounter()
    })
    
    // 检测是否为移动操作系统
    const isMobileOS = isIOS || isAndroid
    
    // 计算侧边栏宽度：大屏220px，中屏72px（仅图标），小屏220px（悬浮）
    const getWidth = () => {
      if (isMobile) return isOpen ? 220 : 0
      return isOpen ? 220 : 72 // 桌面端收缩时显示图标
    }

    return (
      <>
        {/* macOS 风格红绿灯按钮 */}
        <MacTrafficLights />
        
        <motion.div
          ref={ref}
          className={cn(
            "flex h-full flex-col bg-sidebar/95 backdrop-blur-xl",
            "overflow-hidden shadow-lg select-none relative",
            // 桌面端：左侧边框
            !isMobile && "border-r border-sidebar-border",
            // 移动端：固定在右侧，左侧边框
            isMobile && "fixed top-0 right-0 z-50 h-screen-safe border-l border-sidebar-border",
            className
          )}
          style={{
            paddingTop: isMobileOS && isMobile ? '20px' : '0'
          }}
          animate={{
            width: getWidth(),
            opacity: isMobile ? (isOpen ? 1 : 0) : 1,
            x: isMobile && !isOpen ? 220 : 0,
          }}
          transition={{
            width: {
              type: "spring",
              stiffness: 350,
              damping: 26,
              mass: 0.75
            },
            opacity: {
              duration: 0.2,
              ease: [0.32, 0.72, 0, 1]
            },
            x: {
              type: "spring",
              stiffness: 350,
              damping: 26,
              mass: 0.75
            }
          }}
        >
        {/* 头部区域 - 展开左对齐，收缩居中 */}
        <div className={cn(
          "h-16 border-b border-sidebar-border flex items-center relative overflow-hidden",
          isOpen ? "justify-start px-4" : "justify-center"
        )} data-tauri-drag-region>
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="header-open"
                initial={{ opacity: 0, x: -30, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } }}
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 28,
                  mass: 0.8
                }}
                className="flex items-center gap-3"
                data-tauri-drag-region
              >
                <CoolMode>
                  <motion.div 
                    className="w-8 h-8 select-none bg-sidebar-accent rounded-lg flex items-center justify-center text-lg shrink-0 cursor-pointer"
                    initial={{ rotate: -180, scale: 0.5 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 500, 
                      damping: 20,
                      delay: 0.05
                    }}
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    whileTap={{ scale: 0.9, rotate: -10 }}
                    data-tauri-drag-region={false}
                  >
                    🐒
                  </motion.div>
                </CoolMode>
                <motion.div 
                  className="flex flex-col overflow-hidden"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5, transition: { duration: 0.1 } }}
                  transition={{ 
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                    delay: 0.12
                  }}
                  data-tauri-drag-region
                >
                  <h1 className="text-sm font-semibold text-sidebar-foreground leading-tight whitespace-nowrap" data-tauri-drag-region>
                    观猴投研平台
                  </h1>
                  <span className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap" data-tauri-drag-region>
                    专业版
                  </span>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="header-closed"
                initial={{ opacity: 0, scale: 0.6, rotate: 180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                transition={{
                  type: "spring",
                  stiffness: 450,
                  damping: 22,
                  mass: 0.7
                }}
                data-tauri-drag-region
              >
                <CoolMode>
                  <motion.div 
                    className="select-none flex items-center justify-center text-3xl cursor-pointer"
                    whileHover={{ scale: 1.3, rotate: 15 }}
                    whileTap={{ scale: 0.9, rotate: -15 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    data-tauri-drag-region={false}
                  >
                    🐒
                  </motion.div>
                </CoolMode>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 菜单内容区域 - 逐级进入动画 */}
        <div className={cn(
          "flex-1 flex flex-col overflow-y-auto py-3 min-h-0",
          isOpen ? "px-2" : "px-1.5"
        )}>
          {children}
        </div>
      </motion.div>
      </>
    )
  }
))
Sidebar.displayName = "Sidebar"


