import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { useSidebar } from "./sidebar-context"

interface SidebarMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

// 侧边栏菜单容器
export const SidebarMenu = React.memo(React.forwardRef<HTMLDivElement, SidebarMenuProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-1.5 px-2", className)}
        {...props}
      />
    )
  }
))
SidebarMenu.displayName = "SidebarMenu"

interface SidebarMenuItemProps {
  className?: string
  isActive?: boolean
  icon?: React.ComponentType<{ className?: string }>
  label?: string
  children?: React.ReactNode
  onClick?: () => void
  href?: string
  index?: number // 用于逐级动画的索引
}

// 计数器用于自动索引
let menuItemCounter = 0
export const resetMenuItemCounter = () => { menuItemCounter = 0 }

// 侧边栏菜单项 - 支持逐级进入动画和深色模式
export const SidebarMenuItem = React.memo(React.forwardRef<HTMLDivElement, SidebarMenuItemProps>(
  ({ isActive = false, icon: Icon, label, children, onClick, index }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false)
    const { isOpen } = useSidebar()
    
    // 使用传入的 index 或自动递增
    const itemIndex = index !== undefined ? index : menuItemCounter++

    const handleMouseEnter = React.useCallback(() => setIsHovered(true), [])
    const handleMouseLeave = React.useCallback(() => setIsHovered(false), [])

    return (
      <motion.div
        ref={ref}
        className="relative group cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="item-open"
              initial={{ opacity: 0, x: -30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -15, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 28,
                mass: 0.8,
                delay: itemIndex * 0.04
              }}
              className={cn(
                "flex items-center gap-2 rounded-lg h-10 px-2 w-full",
                "transition-colors duration-200",
                isActive 
                  ? "bg-sidebar-accent dark:bg-white" 
                  : isHovered 
                    ? "bg-sidebar-accent/50" 
                    : "bg-transparent"
              )}
              whileHover={{ scale: 1.03, x: 3 }}
              whileTap={{ scale: 0.97 }}
            >
              {Icon && (
                <motion.div 
                  className={cn(
                    "flex items-center justify-center w-5 h-5 shrink-0",
                    isActive ? "text-sidebar-accent-foreground dark:text-gray-900" : "text-muted-foreground"
                  )}
                  initial={{ scale: 0.7, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 500,
                    damping: 25,
                    delay: itemIndex * 0.04 + 0.08
                  }}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
              )}
              {label && (
                <motion.span 
                  className={cn(
                    "text-sm font-medium select-none flex-1 whitespace-nowrap overflow-hidden",
                    isActive ? "text-sidebar-accent-foreground dark:text-gray-900" : "text-sidebar-foreground"
                  )}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  transition={{ 
                    type: "spring",
                    stiffness: 450,
                    damping: 30,
                    delay: itemIndex * 0.04 + 0.12
                  }}
                >
                  {label}
                </motion.span>
              )}
              {!Icon && !label && children}
            </motion.div>
          ) : (
            <motion.div
              key="item-closed"
              initial={{ opacity: 0, scale: 0.7, rotate: -15 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
              transition={{
                type: "spring",
                stiffness: 450,
                damping: 25,
                mass: 0.7,
                delay: itemIndex * 0.035
              }}
              className={cn(
                "flex items-center justify-center rounded-lg h-10 w-full",
                "transition-colors duration-200",
                isActive 
                  ? "bg-sidebar-accent dark:bg-white" 
                  : isHovered 
                    ? "bg-sidebar-accent/50" 
                    : "bg-transparent"
              )}
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.9, rotate: -5 }}
            >
              {Icon && (
                <div className={cn(
                  "flex items-center justify-center w-5 h-5",
                  isActive ? "text-sidebar-accent-foreground dark:text-gray-900" : "text-muted-foreground"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
              )}
              {!Icon && children}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Tooltip for collapsed state */}
        {!isOpen && label && isHovered && (
          <motion.div
            className="fixed left-[72px] z-[60]"
            style={{
              top: `${ref && 'current' in ref && ref.current ? ref.current.getBoundingClientRect().top : 0}px`
            }}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.15 }}
          >
            <div className="bg-popover text-popover-foreground text-xs px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap ml-2">
              {label}
            </div>
          </motion.div>
        )}
      </motion.div>
    )
  }
))
SidebarMenuItem.displayName = "SidebarMenuItem"

