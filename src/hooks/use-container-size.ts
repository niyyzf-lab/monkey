import { useEffect, useState, RefObject } from 'react'

interface ContainerSize {
  width: number
  height: number
}

/**
 * 监听容器尺寸变化的自定义 Hook
 * 使用 ResizeObserver API 实现高性能的尺寸监听
 * 
 * @param containerRef - 要监听的容器元素引用
 * @returns 容器的当前宽度和高度
 */
export function useContainerSize<T extends HTMLElement>(
  containerRef: RefObject<T | null>
): ContainerSize {
  const [size, setSize] = useState<ContainerSize>({ width: 0, height: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // 使用 ResizeObserver 监听尺寸变化
    const resizeObserver = new ResizeObserver((entries) => {
      // 使用 requestAnimationFrame 批量更新，避免强制同步布局
      requestAnimationFrame(() => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect
          setSize({ width, height })
        }
      })
    })

    resizeObserver.observe(container)
    
    // 初始化尺寸
    setSize({
      width: container.clientWidth,
      height: container.clientHeight,
    })

    return () => {
      resizeObserver.disconnect()
    }
  }, [containerRef])

  return size
}

