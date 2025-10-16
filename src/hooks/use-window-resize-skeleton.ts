import { useEffect, useState, useRef } from 'react'

/**
 * Hook to show skeleton during window resize
 * 使用 requestAnimationFrame 节流优化性能
 * @param delay - Delay in ms before hiding skeleton after resize stops
 * @returns isResizing - Whether the window is currently being resized
 */
export function useWindowResizeSkeleton(delay: number = 300): boolean {
  const [isResizing, setIsResizing] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout|null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const handleResize = () => {
      // 取消之前的 RAF 和超时
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // 使用 RAF 节流状态更新
      rafRef.current = requestAnimationFrame(() => {
        setIsResizing(true)
        
        // 设置延迟隐藏
        timeoutRef.current = setTimeout(() => {
          setIsResizing(false)
        }, delay)
      })
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [delay])

  return isResizing
}

