import { useState, useEffect, useRef } from 'react';

/**
 * 监听窗口 resize 事件，在调整大小时显示骨架屏
 * @param delay 节流延迟（毫秒）
 * @returns isResizing - 是否正在调整大小
 */
export function useResizeSkeleton(delay: number = 300) {
  const [isResizing, setIsResizing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let resizeTimer: NodeJS.Timeout | null = null;

    const handleResizeStart = () => {
      // 开始 resize，立即显示骨架屏
      setIsResizing(true);

      // 清除之前的定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 节流：延迟后隐藏骨架屏
      timeoutRef.current = setTimeout(() => {
        setIsResizing(false);
      }, delay);
    };

    // 监听 resize 事件
    window.addEventListener('resize', handleResizeStart);

    return () => {
      window.removeEventListener('resize', handleResizeStart);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
    };
  }, [delay]);

  return isResizing;
}

