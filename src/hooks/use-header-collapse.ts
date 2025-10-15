import { useState, useEffect, useCallback } from 'react'

/**
 * 管理页面标题头的展开/折叠状态
 * @param pageKey 页面唯一标识，用于本地存储
 * @param defaultCollapsed 默认是否折叠
 */
export function useHeaderCollapse(pageKey: string, defaultCollapsed: boolean = false) {
  const storageKey = `header-collapsed-${pageKey}`
  
  // 从 localStorage 读取初始状态
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored !== null ? stored === 'true' : defaultCollapsed
    } catch {
      return defaultCollapsed
    }
  })

  // 保存状态到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, String(isCollapsed))
    } catch (error) {
      console.warn('Failed to save header collapse state:', error)
    }
  }, [isCollapsed, storageKey])

  // 切换展开/折叠状态
  const toggle = useCallback(() => {
    setIsCollapsed(prev => !prev)
  }, [])

  return {
    isCollapsed,
    setIsCollapsed,
    toggle,
  }
}

