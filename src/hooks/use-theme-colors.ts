import { useState, useEffect } from 'react'

/**
 * 主题颜色 Hook
 * 监听主题变化并返回计算后的实际颜色值，供 SVG 等需要具体颜色值的场景使用
 * 使用 shadcn 灰度色彩系统
 */
export function useThemeColors() {
  const [colors, setColors] = useState({
    primary: '',
    secondary: '',
    accent: '',
  })

  useEffect(() => {
    const updateColors = () => {
      // 检查当前主题
      const isDark = document.documentElement.classList.contains('dark')
      
      // 使用 shadcn 风格的灰度系统配色
      // 亮色模式：深灰色主色，中灰色辅助色
      // 暗色模式：浅灰色主色，中灰色辅助色
      if (isDark) {
        setColors({
          primary: 'rgb(228, 228, 231)',    // zinc-200 - 主色
          secondary: 'rgb(161, 161, 170)',  // zinc-400 - 辅助色
          accent: 'rgb(250, 250, 250)',     // zinc-50 - 强调色
        })
      } else {
        setColors({
          primary: 'rgb(39, 39, 42)',       // zinc-800 - 主色
          secondary: 'rgb(113, 113, 122)',  // zinc-500 - 辅助色
          accent: 'rgb(24, 24, 27)',        // zinc-900 - 强调色
        })
      }
    }

    // 初始化颜色
    updateColors()

    // 监听主题变化（通过 MutationObserver 监听 class 变化）
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          updateColors()
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    // 同时监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleMediaChange = () => {
      // 添加小延迟确保 CSS 变量已更新
      setTimeout(updateColors, 50)
    }
    
    mediaQuery.addEventListener('change', handleMediaChange)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener('change', handleMediaChange)
    }
  }, [])

  return colors
}

