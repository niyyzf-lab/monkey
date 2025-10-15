import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { useSidebar } from "./sidebar-context"
import { ThemeToggler } from "./theme-toggler"
import { SystemMonitor } from "./system-monitor"

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

// 侧边栏底部组件 - 包含主题切换、折叠按钮和系统监控
export const SidebarFooter = React.memo(React.forwardRef<HTMLDivElement, SidebarFooterProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen, setIsOpen, isMobile } = useSidebar()
    const [isHovered, setIsHovered] = React.useState(false)
    
    return (
      <div
        ref={ref}
        className={cn(
          "mt-auto",
          className
        )}
        {...props}
      >
        {/* 主题切换器 - 独立组件 */}
        <div className="pb-2 px-2">
          <ThemeToggler />
        </div>
        
        {/* 折叠按钮 - 作为菜单项 */}
        {!isMobile && (
          <div className="pb-3 px-2">
            <div
              className="relative group cursor-pointer"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => setIsOpen(!isOpen)}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="collapse-open"
                    initial={{ opacity: 0, x: -30, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -15, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 28,
                      mass: 0.8,
                      delay: 0.3
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-lg h-10 px-2 w-full",
                      "transition-colors duration-200",
                      isHovered ? "bg-sidebar-accent/50" : "bg-transparent"
                    )}
                    whileHover={{ scale: 1.03, x: 3 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <motion.div 
                      className="flex items-center justify-center w-5 h-5 text-muted-foreground shrink-0"
                      initial={{ scale: 0.7, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 500,
                        damping: 25,
                        delay: 0.38
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="15,18 9,12 15,6" />
                      </svg>
                    </motion.div>
                    <motion.span 
                      className="text-sm font-medium select-none text-sidebar-foreground flex-1 whitespace-nowrap overflow-hidden"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.1 } }}
                      transition={{ 
                        type: "spring",
                        stiffness: 450,
                        damping: 30,
                        delay: 0.42
                      }}
                    >
                      收起侧边栏
                    </motion.span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="collapse-closed"
                    initial={{ opacity: 0, scale: 0.7, rotate: -15 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                    transition={{
                      type: "spring",
                      stiffness: 450,
                      damping: 25,
                      mass: 0.7,
                      delay: 0.25
                    }}
                    className={cn(
                      "flex items-center justify-center rounded-lg h-10 w-full",
                      "transition-colors duration-200",
                      isHovered ? "bg-sidebar-accent/50" : "bg-transparent"
                    )}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.9, rotate: -5 }}
                  >
                    <div className="flex items-center justify-center w-5 h-5 text-muted-foreground">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ transform: 'rotate(180deg)' }}
                      >
                        <polyline points="15,18 9,12 15,6" />
                      </svg>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Tooltip for collapsed state */}
              {!isOpen && isHovered && (
                <motion.div
                  className="fixed left-[72px] z-[60]"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="bg-popover text-popover-foreground text-xs px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap ml-2">
                    展开侧边栏
                  </div>
                </motion.div>
              )}
            </div>
          </div>
          
        )}
        
        {/* 系统监控显示 - 快速进入动画 */}
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", y: 0, scale: 1 }}
              exit={{ opacity: 0, height: 0, y: -5, transition: { duration: 0.15 } }}
              transition={{ 
                type: "spring",
                stiffness: 400,
                damping: 28,
                mass: 0.8,
                delay: 0.45
              }}
            >
              <SystemMonitor />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 其他footer内容 */}
        {children && (
          <div className="border-t border-sidebar-border p-3">
            {children}
          </div>
        )}
      </div>
    )
  }
))
SidebarFooter.displayName = "SidebarFooter"


