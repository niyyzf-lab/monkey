import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { useSidebar } from "./sidebar-context"

interface SidebarTriggerProps {
  className?: string
}

// 侧边栏触发按钮 - 简洁版，支持深色模式
export const SidebarTrigger = React.memo(React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  ({ className }, ref) => {
    const { isOpen, setIsOpen } = useSidebar()

    return (
      <motion.button
        ref={ref}
        className={cn(
          "inline-flex h-6 w-6 items-center justify-center rounded-full",
          "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md dark:shadow-gray-950/50",
          "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:shadow-lg",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30 transition-all duration-200",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ 
          scale: 1.1,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ 
          type: "spring",
          stiffness: 400,
          damping: 25
        }}
      >
        <motion.svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotateZ: isOpen ? 0 : 180 }}
          transition={{ 
            type: "spring",
            stiffness: 380,
            damping: 26
          }}
        >
          <polyline points="15,18 9,12 15,6" />
        </motion.svg>
      </motion.button>
    )
  }
))
SidebarTrigger.displayName = "SidebarTrigger"


