import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';

export function ContainerDebug() {
  const [isVisible, setIsVisible] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    let resizeTimer: NodeJS.Timeout | null = null;

    const updateWidth = () => {
      // 查找页面中带有 data-holdings-container 属性的主容器
      const container = document.querySelector('[data-holdings-container]');
      if (container) {
        const width = container.getBoundingClientRect().width;
        setContainerWidth(Math.round(width));
      }
    };

    const handleResize = () => {
      setIsResizing(true);
      updateWidth();

      // 清除之前的定时器
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }

      // 300ms 后标记 resize 结束
      resizeTimer = setTimeout(() => {
        setIsResizing(false);
      }, 300);
    };

    // 初始测量
    updateWidth();

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
    
    // 使用 ResizeObserver 监听容器自身大小变化
    const container = document.querySelector('.\\@container');
    const resizeObserver = new ResizeObserver(handleResize);
    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
    };
  }, []);

  // 获取当前激活的断点
  const getActiveBreakpoint = () => {
    if (containerWidth < 400) return 'base (< 400px)';
    if (containerWidth < 640) return '@xs (400-640px)';
    if (containerWidth < 768) return '@sm (640-768px)';
    if (containerWidth < 1024) return '@md (768-1024px)';
    if (containerWidth < 1280) return '@lg (1024-1280px)';
    if (containerWidth < 1600) return '@xl (1280-1600px)';
    return '@2xl (≥ 1600px)';
  };

  const getBreakpointColor = () => {
    if (containerWidth < 400) return 'bg-red-500';
    if (containerWidth < 640) return 'bg-orange-500';
    if (containerWidth < 768) return 'bg-yellow-500';
    if (containerWidth < 1024) return 'bg-green-500';
    if (containerWidth < 1280) return 'bg-blue-500';
    if (containerWidth < 1600) return 'bg-indigo-500';
    return 'bg-purple-500';
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 px-3 py-2 bg-black/80 text-white text-xs rounded-lg hover:bg-black transition-colors"
      >
        显示调试信息
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-black/90 backdrop-blur-md text-white rounded-lg shadow-2xl border border-white/20 overflow-hidden"
    >
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/10 border-b border-white/20">
        <h3 className="text-sm font-bold">容器查询调试</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="h-6 w-6 p-0 hover:bg-white/20 text-white"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* 内容区 */}
      <div className="p-4 space-y-3">
        {/* 容器宽度 */}
        <div>
          <div className="text-xs text-white/60 mb-1">容器宽度</div>
          <div className="text-2xl font-bold tabular-nums">{containerWidth}px</div>
        </div>

        {/* 当前断点 */}
        <div>
          <div className="text-xs text-white/60 mb-2">当前断点</div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getBreakpointColor()}`}></div>
            <div className="font-mono text-sm">{getActiveBreakpoint()}</div>
          </div>
        </div>

        {/* 断点列表 */}
        <div>
          <div className="text-xs text-white/60 mb-2">断点配置</div>
          <div className="space-y-1 text-xs font-mono">
            <div className={`flex justify-between ${containerWidth < 400 ? 'text-red-400 font-bold' : 'text-white/40'}`}>
              <span>base</span>
              <span>&lt; 400px</span>
            </div>
            <div className={`flex justify-between ${containerWidth >= 400 && containerWidth < 640 ? 'text-orange-400 font-bold' : 'text-white/40'}`}>
              <span>@xs</span>
              <span>≥ 400px</span>
            </div>
            <div className={`flex justify-between ${containerWidth >= 640 && containerWidth < 768 ? 'text-yellow-400 font-bold' : 'text-white/40'}`}>
              <span>@sm</span>
              <span>≥ 640px</span>
            </div>
            <div className={`flex justify-between ${containerWidth >= 768 && containerWidth < 1024 ? 'text-green-400 font-bold' : 'text-white/40'}`}>
              <span>@md</span>
              <span>≥ 768px</span>
            </div>
            <div className={`flex justify-between ${containerWidth >= 1024 && containerWidth < 1280 ? 'text-blue-400 font-bold' : 'text-white/40'}`}>
              <span>@lg</span>
              <span>≥ 1024px</span>
            </div>
            <div className={`flex justify-between ${containerWidth >= 1280 && containerWidth < 1600 ? 'text-indigo-400 font-bold' : 'text-white/40'}`}>
              <span>@xl</span>
              <span>≥ 1280px</span>
            </div>
            <div className={`flex justify-between ${containerWidth >= 1600 ? 'text-purple-400 font-bold' : 'text-white/40'}`}>
              <span>@2xl</span>
              <span>≥ 1600px</span>
            </div>
          </div>
        </div>

        {/* 视口宽度 */}
        <div>
          <div className="text-xs text-white/60 mb-1">视口宽度（参考）</div>
          <div className="text-sm font-mono">{window.innerWidth}px</div>
        </div>
        
        {/* Dock 显示状态 */}
        <div>
          <div className="text-xs text-white/60 mb-1">底部 Dock</div>
          <div className="text-sm">
            {containerWidth < 600 ? (
              <span className="text-green-400">✓ 显示中（＜600px）</span>
            ) : (
              <span className="text-muted-foreground">隐藏（≥ 600px）</span>
            )}
          </div>
        </div>

        {/* Resize 状态 */}
        <div>
          <div className="text-xs text-white/60 mb-1">Resize 状态</div>
          <div className="text-sm flex items-center gap-2">
            {isResizing ? (
              <>
                <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                <span className="text-yellow-400">正在调整大小...</span>
              </>
            ) : (
              <>
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                <span className="text-green-400">稳定</span>
              </>
            )}
          </div>
        </div>

        {/* 容器查询支持检测 */}
        <div>
          <div className="text-xs text-white/60 mb-1">容器查询支持</div>
          <div className="text-sm">
            {CSS.supports('container-type: inline-size') ? (
              <span className="text-green-400">✓ 浏览器支持</span>
            ) : (
              <span className="text-red-400">✗ 浏览器不支持</span>
            )}
          </div>
        </div>

        {/* 说明 */}
        <div className="text-xs text-white/40 pt-2 border-t border-white/10">
          💡 提示：调整窗口宽度或侧边栏来查看断点变化
        </div>
        
        {/* 警告信息 */}
        {containerWidth === 0 && (
          <div className="text-xs text-yellow-400 pt-2 border-t border-white/10">
            ⚠️ 未找到容器元素，请确保页面包含 @container 类
          </div>
        )}
      </div>
    </div>
  );
}

