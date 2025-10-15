import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"
import { useSidebar } from "./sidebar-context"
import { useSettings } from "@/hooks/use-settings"

// 主题切换器组件 - 独立设计，完美融合侧边栏风格，支持深色模式
export const ThemeToggler = React.memo(() => {
  const { isOpen } = useSidebar()
  const { settings } = useSettings()
  const [isHovered, setIsHovered] = React.useState(false)
  const [isDark, setIsDark] = React.useState(false)
  const buttonRef = React.useRef<HTMLDivElement>(null)
  
  // 检查是否跟随系统主题
  const isFollowingSystem = settings.theme === 'system'
  
  // 监听主题变化
  React.useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"))
    }
    updateTheme()
    
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    
    return () => observer.disconnect()
  }, [])
  
  // 主题切换函数，带有圆形扩散动画
  const toggleTheme = React.useCallback(async () => {
    // 如果跟随系统主题，则禁用切换
    if (isFollowingSystem || !buttonRef.current) return

    // 检查浏览器是否支持 View Transitions API
    if (!document.startViewTransition) {
      // 不支持则直接切换
      flushSync(() => {
        setIsDark(!isDark)
        document.documentElement.classList.toggle("dark")
        localStorage.setItem("theme", !isDark ? "dark" : "light")
      })
      return
    }

    await document.startViewTransition(() => {
      flushSync(() => {
        const newTheme = !isDark
        setIsDark(newTheme)
        document.documentElement.classList.toggle("dark")
        localStorage.setItem("theme", newTheme ? "dark" : "light")
      })
    }).ready

    const { top, left, width, height } = buttonRef.current.getBoundingClientRect()
    const x = left + width / 2
    const y = top + height / 2
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top)
    )

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 500,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        pseudoElement: "::view-transition-new(root)",
      }
    )
  }, [isDark, isFollowingSystem])
  
  return (
    <div
      ref={buttonRef}
      className={cn(
        "relative group",
        isFollowingSystem ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      )}
      onMouseEnter={() => !isFollowingSystem && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={toggleTheme}
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="theme-open"
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -15, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 28,
              mass: 0.8,
              delay: 0.28
            }}
            className={cn(
              "flex items-center gap-2 rounded-lg h-10 px-2 w-full",
              "transition-all duration-300 ease-out",
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
                delay: 0.36
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isDark ? "sun" : "moon"}
                  initial={{ scale: 0.5, rotate: -180, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0.5, rotate: 180, opacity: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 350,
                    damping: 25,
                    mass: 0.8
                  }}
                >
                  {isDark ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </motion.div>
              </AnimatePresence>
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
                delay: 0.4
              }}
            >
              {isFollowingSystem ? "跟随系统" : (isDark ? "浅色模式" : "深色模式")}
            </motion.span>
          </motion.div>
        ) : (
          <motion.div
            key="theme-closed"
            initial={{ opacity: 0, scale: 0.7, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
            transition={{
              type: "spring",
              stiffness: 450,
              damping: 25,
              mass: 0.7,
              delay: 0.2
            }}
            className={cn(
              "flex items-center justify-center rounded-lg h-10 w-full",
              "transition-all duration-300 ease-out",
              isHovered ? "bg-sidebar-accent/50" : "bg-transparent"
            )}
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.9, rotate: -5 }}
          >
            <div className="flex items-center justify-center w-5 h-5 text-muted-foreground">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isDark ? "sun-icon" : "moon-icon"}
                  initial={{ scale: 0.5, rotate: -180, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0.5, rotate: 180, opacity: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 350,
                    damping: 25,
                    mass: 0.8
                  }}
                >
                  {isDark ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </motion.div>
              </AnimatePresence>
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
            {isFollowingSystem ? "跟随系统主题" : (isDark ? "切换到浅色" : "切换到深色")}
          </div>
        </motion.div>
      )}
    </div>
  )
})
ThemeToggler.displayName = "ThemeToggler"


