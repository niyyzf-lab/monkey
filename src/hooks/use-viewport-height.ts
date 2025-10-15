import { useEffect, useState, useCallback } from 'react'
import { useWindowSize } from 'react-use'

/**
 * 视口高度 Hook
 * 解决移动端 100vh 问题（iOS Safari 地址栏导致的视口高度计算错误）
 * 
 * 工作原理：
 * 1. 监听窗口大小变化和屏幕方向变化
 * 2. 计算真实视口高度的 1%
 * 3. 设置 CSS 变量 --vh 到根元素
 * 4. 在 CSS 中使用 calc(var(--vh, 1vh) * 100) 替代 100vh
 * 
 * @returns viewportHeight - 当前视口高度（像素）
 * 
 * @example
 * ```tsx
 * // 在根组件中初始化
 * function App() {
 *   useViewportHeight()
 *   return <div>...</div>
 * }
 * 
 * // 在 CSS 中使用
 * .full-height {
 *   height: calc(var(--vh, 1vh) * 100);
 * }
 * ```
 */
export function useViewportHeight(): number {
  const { height } = useWindowSize()
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 0
  )

  const updateViewportHeight = useCallback(() => {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
    setViewportHeight(window.innerHeight)
  }, [])

  useEffect(() => {
    // 初始化设置
    updateViewportHeight()

    // 监听屏幕方向变化（移动端特有）
    const handleOrientationChange = () => {
      // 延迟执行，等待浏览器完成方向切换
      setTimeout(updateViewportHeight, 100)
    }

    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [updateViewportHeight])

  // 使用 react-use 的 useWindowSize 监听窗口大小变化
  useEffect(() => {
    updateViewportHeight()
  }, [height, updateViewportHeight])

  return viewportHeight
}

/**
 * 获取安全的视口高度值（用于内联样式）
 * 
 * @returns CSS 值字符串，优先使用 CSS 变量，降级到 vh 单位
 * 
 * @example
 * ```tsx
 * const height = useSafeViewportHeight()
 * <div style={{ height }}>...</div>
 * // 输出: <div style="height: calc(var(--vh, 1vh) * 100)">
 * ```
 */
export function useSafeViewportHeight(): string {
  useViewportHeight() // 确保 CSS 变量已设置
  return 'calc(var(--vh, 1vh) * 100)'
}

