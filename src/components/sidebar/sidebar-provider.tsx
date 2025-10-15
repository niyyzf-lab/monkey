import * as React from "react"
import { SidebarContext } from "./sidebar-context"

interface SidebarProviderProps {
  children: React.ReactNode
  defaultOpen?: boolean
}

const STORAGE_KEY = "sidebar-state"

// 侧边栏状态提供者组件 - 支持本地存储
export const SidebarProvider = React.memo<SidebarProviderProps>(({ children, defaultOpen = true }) => {
  const [isMobile, setIsMobile] = React.useState(false)
  
  // 从本地存储读取初始状态
  const getInitialState = React.useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved !== null) {
        return JSON.parse(saved) as boolean
      }
    } catch (error) {
      console.warn('Failed to read sidebar state from localStorage:', error)
    }
    return defaultOpen
  }, [defaultOpen])
  
  const [isOpen, setIsOpenState] = React.useState(getInitialState)
  
  // 包装 setIsOpen 以自动保存到本地存储
  const setIsOpen = React.useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setIsOpenState((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value
      
      // 只在非移动端保存状态
      if (!isMobile) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue))
        } catch (error) {
          console.warn('Failed to save sidebar state to localStorage:', error)
        }
      }
      
      return newValue
    })
  }, [isMobile])
  
  // 检测屏幕宽度并设置响应式状态
  React.useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth
      const mobile = width <= 720
      setIsMobile(mobile)
      
      // 小屏：关闭侧边栏
      if (mobile) {
        setIsOpenState(false)
      }
      // 大屏且没有保存的状态：自动打开
      else if (width > 720) {
        const saved = localStorage.getItem(STORAGE_KEY)
        // 只有在没有保存状态时才自动打开
        if (saved === null) {
          setIsOpenState(true)
        }
      }
      // 中屏：从本地存储恢复状态
      else {
        setIsOpenState(getInitialState())
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [getInitialState])
  
  const contextValue = React.useMemo(() => ({
    isOpen,
    setIsOpen,
    isMobile,
  }), [isOpen, setIsOpen, isMobile])

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  )
})
SidebarProvider.displayName = "SidebarProvider"

