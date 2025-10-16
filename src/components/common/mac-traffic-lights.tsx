import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { useSettings } from "@/hooks/use-settings"

interface MacTrafficLightsProps {
  className?: string
}

type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

/**
 * macOS 风格的红绿灯按钮组件
 * 支持自动隐藏、悬停显示、按钮功能、位置配置
 */
export const MacTrafficLights = React.memo(({ className }: MacTrafficLightsProps) => {
  const { settings } = useSettings()
  const position: Position = settings.trafficLightsPosition || 'top-left'
  
  const [isVisible, setIsVisible] = React.useState(false)
  const [hoveredButton, setHoveredButton] = React.useState<string | null>(null)
  const timeoutRef = React.useRef<number | null>(null)

  // 监听鼠标移动
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 清除之前的定时器
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }

      // 根据位置判断是否显示 - 四个角落区域触发
      const cornerSize = 60 // 角落触发区域大小
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      let shouldShow = false

      // 计算鼠标位置
      const mouseX = e.clientX
      const mouseY = e.clientY

      switch (position) {
        case 'top-left':
          // 左上角：鼠标在左上角区域
          shouldShow = mouseY <= cornerSize && mouseX <= cornerSize
          break
        case 'top-right':
          // 右上角：鼠标在右上角区域
          shouldShow = mouseY <= cornerSize && mouseX >= windowWidth - cornerSize
          break
        case 'bottom-left':
          // 左下角：鼠标在左下角区域
          shouldShow = mouseY >= windowHeight - cornerSize && mouseX <= cornerSize
          break
        case 'bottom-right':
          // 右下角：鼠标在右下角区域
          shouldShow = mouseY >= windowHeight - cornerSize && mouseX >= windowWidth - cornerSize
          break
      }

      if (shouldShow) {
        setIsVisible(true)
        // 延迟隐藏
        timeoutRef.current = window.setTimeout(() => {
          setIsVisible(false)
        }, 2500)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [position])

  // 按钮点击处理
  const handleClose = async () => {
    try {
      await getCurrentWindow().close()
    } catch (err) {
      console.error("Failed to close window:", err)
    }
  }

  const handleMinimize = async () => {
    try {
      await getCurrentWindow().minimize()
    } catch (err) {
      console.error("Failed to minimize window:", err)
    }
  }

  const handleMaximize = async () => {
    try {
      const window = getCurrentWindow()
      const isMaximized = await window.isMaximized()
      if (isMaximized) {
        await window.unmaximize()
      } else {
        await window.maximize()
      }
    } catch (err) {
      console.error("Failed to toggle maximize:", err)
    }
  }

  // 根据位置计算初始和动画值
  const getPositionStyles = () => {
    const base = "fixed z-[9999]"
    switch (position) {
      case 'top-left':
        return `${base} top-[12px] left-[12px]`
      case 'top-right':
        return `${base} top-[12px] right-[12px]`
      case 'bottom-left':
        return `${base} bottom-[12px] left-[12px]`
      case 'bottom-right':
        return `${base} bottom-[12px] right-[12px]`
    }
  }

  const getAnimationValues = () => {
    const isTop = position.includes('top')
    const isLeft = position.includes('left')
    
    return {
      initial: {
        opacity: 0,
        y: isTop ? -24 : 24,
        x: isLeft ? -12 : 12,
        scale: 0.85,
      },
      visible: {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
      },
      hidden: {
        opacity: 0,
        y: isTop ? -24 : 24,
        x: isLeft ? -12 : 12,
        scale: 0.85,
      },
    }
  }

  const animValues = getAnimationValues()

  return (
    <motion.div
      initial={animValues.initial}
      animate={isVisible ? animValues.visible : animValues.hidden}
      transition={{ 
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
        opacity: { duration: 0.3 },
        scale: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] },
      }}
      className={cn(
        getPositionStyles(),
        "flex items-center gap-2 p-1.5 rounded-xl",
        // iPadOS 风格的毛玻璃效果
        "bg-white/85 dark:bg-black/70",
        "backdrop-blur-2xl backdrop-saturate-[180%]",
        // 悬浮阴影效果 - 更柔和细腻
        "shadow-[0_4px_20px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.12)]",
        "dark:shadow-[0_4px_24px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.3)]",
        // 边框 - 极致细腻的光泽效果
        "border border-white/60 dark:border-white/20",
        "ring-1 ring-white/20 dark:ring-white/10",
        "pointer-events-auto",
        className
      )}
      data-tauri-drag-region={false}
    >
      {/* 关闭按钮 - 红色 */}
      <motion.button
        onClick={handleClose}
        onMouseEnter={() => setHoveredButton("close")}
        onMouseLeave={() => setHoveredButton(null)}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 17 
        }}
        className={cn(
          "relative w-3.5 h-3.5 rounded-full transition-all duration-200",
          "bg-gradient-to-br from-[#FF6B6B] to-[#FF5252]",
          "hover:from-[#FF7B7B] hover:to-[#FF6262]",
          "shadow-[0_1px_3px_rgba(255,91,87,0.3),0_0_8px_rgba(255,91,87,0.2)]",
          "hover:shadow-[0_2px_8px_rgba(255,91,87,0.5),0_0_12px_rgba(255,91,87,0.3)]",
          "flex items-center justify-center",
          "group backdrop-blur-sm",
          "ring-1 ring-black/10"
        )}
        aria-label="关闭窗口"
      >
        <AnimatePresence>
          {hoveredButton === "close" && (
            <motion.svg
              initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
              transition={{ 
                duration: 0.25, 
                ease: [0.16, 1, 0.3, 1],
                scale: { type: "spring", stiffness: 500, damping: 20 }
              }}
              className="w-2 h-2 text-[#4C0000] drop-shadow-sm"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="3" y1="3" x2="9" y2="9" />
              <line x1="9" y1="3" x2="3" y2="9" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* 最小化按钮 - 黄色 */}
      <motion.button
        onClick={handleMinimize}
        onMouseEnter={() => setHoveredButton("minimize")}
        onMouseLeave={() => setHoveredButton(null)}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 17 
        }}
        className={cn(
          "relative w-3.5 h-3.5 rounded-full transition-all duration-200",
          "bg-gradient-to-br from-[#FFC940] to-[#FFB300]",
          "hover:from-[#FFD050] hover:to-[#FFC010]",
          "shadow-[0_1px_3px_rgba(255,189,46,0.3),0_0_8px_rgba(255,189,46,0.2)]",
          "hover:shadow-[0_2px_8px_rgba(255,189,46,0.5),0_0_12px_rgba(255,189,46,0.3)]",
          "flex items-center justify-center",
          "group backdrop-blur-sm",
          "ring-1 ring-black/10"
        )}
        aria-label="最小化窗口"
      >
        <AnimatePresence>
          {hoveredButton === "minimize" && (
            <motion.svg
              initial={{ opacity: 0, scale: 0.5, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 4 }}
              transition={{ 
                duration: 0.25, 
                ease: [0.16, 1, 0.3, 1],
                scale: { type: "spring", stiffness: 500, damping: 20 }
              }}
              className="w-2 h-2 text-[#6A5000] drop-shadow-sm"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="3" y1="6" x2="9" y2="6" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* 最大化/全屏按钮 - 绿色 */}
      <motion.button
        onClick={handleMaximize}
        onMouseEnter={() => setHoveredButton("maximize")}
        onMouseLeave={() => setHoveredButton(null)}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 17 
        }}
        className={cn(
          "relative w-3.5 h-3.5 rounded-full transition-all duration-200",
          "bg-gradient-to-br from-[#34D058] to-[#28A745]",
          "hover:from-[#44E068] hover:to-[#38B755]",
          "shadow-[0_1px_3px_rgba(40,200,64,0.3),0_0_8px_rgba(40,200,64,0.2)]",
          "hover:shadow-[0_2px_8px_rgba(40,200,64,0.5),0_0_12px_rgba(40,200,64,0.3)]",
          "flex items-center justify-center",
          "group backdrop-blur-sm",
          "ring-1 ring-black/10"
        )}
        aria-label="最大化窗口"
      >
        <AnimatePresence>
          {hoveredButton === "maximize" && (
            <motion.svg
              initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
              transition={{ 
                duration: 0.25, 
                ease: [0.16, 1, 0.3, 1],
                scale: { type: "spring", stiffness: 500, damping: 20 }
              }}
              className="w-2 h-2 text-[#004C00] drop-shadow-sm"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="3" y1="5" x2="9" y2="5" />
              <line x1="3" y1="7" x2="9" y2="7" />
              <line x1="5" y1="3" x2="5" y2="9" />
              <line x1="7" y1="3" x2="7" y2="9" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  )
})

MacTrafficLights.displayName = "MacTrafficLights"

