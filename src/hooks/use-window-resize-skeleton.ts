import { useEffect, useState, useCallback } from 'react'

/**
 * Hook to show skeleton during window resize
 * @param delay - Delay in ms before hiding skeleton after resize stops
 * @returns isResizing - Whether the window is currently being resized
 */
export function useWindowResizeSkeleton(delay: number = 300): boolean {
  const [isResizing, setIsResizing] = useState(false)

  const handleResize = useCallback(() => {
    setIsResizing(true)
  }, [])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleResizeEnd = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setIsResizing(false)
      }, delay)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('resize', handleResizeEnd)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('resize', handleResizeEnd)
      clearTimeout(timeoutId)
    }
  }, [handleResize, delay])

  return isResizing
}

