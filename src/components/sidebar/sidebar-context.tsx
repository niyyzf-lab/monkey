import * as React from "react"

// 侧边栏上下文类型定义
interface SidebarContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  isMobile: boolean
}

// 创建上下文
export const SidebarContext = React.createContext<SidebarContextType | null>(null)

// 自定义 Hook：访问侧边栏上下文
export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

