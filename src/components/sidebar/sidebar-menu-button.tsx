import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { useSidebar } from "./sidebar-context"

interface SidebarMenuButtonProps {
  className?: string
}

// 侧边栏控制按钮 - 精致设计，桌面端显示动态图标，支持深色模式
export const SidebarMenuButton = React.memo(React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className }, ref) => {
    const { isOpen, setIsOpen, isMobile } = useSidebar()

    const handleClick = () => {
      if (isMobile) {
        setIsOpen(true)
      } else {
        setIsOpen(!isOpen)
      }
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          "group relative inline-flex h-8 w-8 items-center justify-center rounded-md",
          "transition-all duration-200",
          "hover:bg-primary/10 dark:hover:bg-primary/20",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/30",
          className
        )}
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ 
          type: "spring",
          stiffness: 400,
          damping: 25
        }}
        aria-label={isMobile ? "打开侧边栏" : (isOpen ? "收起侧边栏" : "展开侧边栏")}
      >
        {/* 背景光晕效果 */}
        <motion.div
          className="absolute inset-0 rounded-md bg-primary/5 dark:bg-primary/10"
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        />
        
        {/* 图标 - 动态变化 */}
        <motion.div
          className="relative z-10 flex flex-col gap-[3px] w-4"
          animate={!isMobile && isOpen ? "open" : "closed"}
        >
          <motion.span
            className="h-[2px] w-full bg-current rounded-full"
            variants={{
              closed: { rotate: 0, y: 0, width: "100%" },
              open: { rotate: 45, y: 5, width: "100%" }
            }}
            transition={{ 
              type: "spring",
              stiffness: 400,
              damping: 28
            }}
            style={{ transformOrigin: "center" }}
          />
          <motion.span
            className="h-[2px] w-full bg-current rounded-full"
            variants={{
              closed: { opacity: 1, width: "100%" },
              open: { opacity: 0, width: "0%" }
            }}
            transition={{ 
              duration: 0.15,
              ease: [0.4, 0, 0.2, 1]
            }}
          />
          <motion.span
            className="h-[2px] w-full bg-current rounded-full"
            variants={{
              closed: { rotate: 0, y: 0, width: "100%" },
              open: { rotate: -45, y: -5, width: "100%" }
            }}
            transition={{ 
              type: "spring",
              stiffness: 400,
              damping: 28
            }}
            style={{ transformOrigin: "center" }}
          />
        </motion.div>
      </motion.button>
    )
  }
))
SidebarMenuButton.displayName = "SidebarMenuButton"


