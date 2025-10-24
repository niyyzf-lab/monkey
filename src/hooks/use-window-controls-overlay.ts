import { useState, useEffect, useCallback } from 'react';

interface TitleBarRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WindowControlsOverlayGeometry {
  titlebarAreaRect: DOMRect;
}

interface NavigatorWithWindowControlsOverlay extends Navigator {
  windowControlsOverlay?: {
    visible: boolean;
    getTitlebarAreaRect(): DOMRect;
    addEventListener(type: 'geometrychange', listener: (event: WindowControlsOverlayGeometry) => void): void;
    removeEventListener(type: 'geometrychange', listener: (event: WindowControlsOverlayGeometry) => void): void;
  };
}

export interface UseWindowControlsOverlayReturn {
  isSupported: boolean;
  isVisible: boolean;
  titleBarRect: TitleBarRect | null;
}

/**
 * 窗口控件覆盖 Hook
 * 根据 Microsoft Edge PWA 窗口控件覆盖 API
 * @see https://learn.microsoft.com/zh-cn/microsoft-edge/progressive-web-apps/how-to/window-controls-overlay
 */
export function useWindowControlsOverlay(): UseWindowControlsOverlayReturn {
  const nav = navigator as NavigatorWithWindowControlsOverlay;
  const isSupported = 'windowControlsOverlay' in nav;

  const [isVisible, setIsVisible] = useState(
    isSupported ? nav.windowControlsOverlay?.visible ?? false : false
  );

  const [titleBarRect, setTitleBarRect] = useState<TitleBarRect | null>(() => {
    if (isSupported && nav.windowControlsOverlay) {
      const rect = nav.windowControlsOverlay.getTitlebarAreaRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      };
    }
    return null;
  });

  // 防抖函数 - 避免频繁触发布局更新
  const debounce = useCallback(<T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }, []);

  useEffect(() => {
    if (!isSupported || !nav.windowControlsOverlay) {
      console.log('ℹ️ 窗口控件覆盖 API 不受支持');
      return;
    }

    const handleGeometryChange = debounce((event: WindowControlsOverlayGeometry) => {
      // 更新可见性
      const visible = nav.windowControlsOverlay?.visible ?? false;
      setIsVisible(visible);

      // 更新标题栏区域尺寸
      const rect = event.titlebarAreaRect;
      setTitleBarRect({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      });

      console.log(
        `窗口控件覆盖: ${visible ? '可见' : '隐藏'}, 标题栏宽度: ${rect.width}px`
      );
    }, 200);

    nav.windowControlsOverlay.addEventListener('geometrychange', handleGeometryChange);

    return () => {
      nav.windowControlsOverlay?.removeEventListener('geometrychange', handleGeometryChange);
    };
  }, [isSupported, nav, debounce]);

  return {
    isSupported,
    isVisible,
    titleBarRect,
  };
}

