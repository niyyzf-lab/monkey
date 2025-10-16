import { useState, useEffect, useRef } from 'react'

export type ScrollDirection = 'up' | 'down' | null

interface UseScrollDirectionOptions {
  threshold?: number
  ref?: React.RefObject<HTMLElement>
}

/**
 * 检测滚动方向的自定义 Hook
 * @param options - 配置选项
 * @param options.threshold - 滚动阈值（像素），默认 10
 * @param options.ref - 滚动容器的 ref，默认为 window
 * @returns 当前滚动方向
 */
export function useScrollDirection({
  threshold = 10,
  ref,
}: UseScrollDirectionOptions = {}): ScrollDirection {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null)
  const lastScrollYRef = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const element = ref?.current || window

    const updateScrollDirection = () => {
      const scrollY = ref?.current
        ? ref.current.scrollTop
        : window.pageYOffset || document.documentElement.scrollTop

      if (Math.abs(scrollY - lastScrollYRef.current) < threshold) {
        ticking.current = false
        return
      }

      setScrollDirection(scrollY > lastScrollYRef.current ? 'down' : 'up')
      lastScrollYRef.current = scrollY > 0 ? scrollY : 0
      ticking.current = false
    }

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection)
        ticking.current = true
      }
    }

    element.addEventListener('scroll', onScroll, { passive: true })
    return () => element.removeEventListener('scroll', onScroll)
  }, [threshold, ref])

  return scrollDirection
}

