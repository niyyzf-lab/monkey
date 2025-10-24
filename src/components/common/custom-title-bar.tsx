import { useWindowControlsOverlay } from '@/hooks';
import { cn } from '@/lib/utils';

interface CustomTitleBarProps {
  title?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * 自定义标题栏组件
 * 使用窗口控件覆盖 API 在标题栏区域显示内容
 * @see https://learn.microsoft.com/zh-cn/microsoft-edge/progressive-web-apps/how-to/window-controls-overlay
 */
export function CustomTitleBar({ title = 'Watch Monkey', className, children }: CustomTitleBarProps) {
  const { isSupported, isVisible, titleBarRect } = useWindowControlsOverlay();

  // 如果不支持或未启用，不显示自定义标题栏
  if (!isSupported || !isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'custom-title-bar',
        'fixed z-50',
        'flex items-center',
        'bg-background/80 backdrop-blur-md',
        'border-b border-border',
        className
      )}
      style={{
        left: titleBarRect ? `${titleBarRect.x}px` : 'env(titlebar-area-x, 0)',
        top: titleBarRect ? `${titleBarRect.y}px` : 'env(titlebar-area-y, 0)',
        width: titleBarRect ? `${titleBarRect.width}px` : 'env(titlebar-area-width, 100%)',
        height: titleBarRect ? `${titleBarRect.height}px` : 'env(titlebar-area-height, 50px)',
        // 设置为可拖动区域
        // @ts-ignore - app-region 是非标准属性
        appRegion: 'drag',
        WebkitAppRegion: 'drag',
      }}
    >
      {/* 标题 */}
      <div className="px-4 select-none">
        <h1 className="text-sm font-semibold truncate">
          {title}
        </h1>
      </div>

      {/* 自定义内容区域 - 不可拖动 */}
      {children && (
        <div
          className="flex-1 flex items-center gap-2 px-2"
          style={{
            // @ts-ignore
            appRegion: 'no-drag',
            WebkitAppRegion: 'no-drag',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

