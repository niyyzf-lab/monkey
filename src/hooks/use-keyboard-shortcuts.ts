import { useEffect } from 'react';

interface KeyboardShortcutsConfig {
  onSearch?: () => void;
  onRefresh?: () => void;
  onViewMode1?: () => void;
  onViewMode2?: () => void;
  onViewMode3?: () => void;
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 检查是否在输入框中
      const target = event.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // Ctrl/Cmd + K: 聚焦搜索
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        config.onSearch?.();
        return;
      }

      // Ctrl/Cmd + R: 刷新数据
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        config.onRefresh?.();
        return;
      }

      // 如果在输入框中，不处理数字键
      if (isInput) return;

      // 1/2/3: 切换视图
      if (event.key === '1') {
        event.preventDefault();
        config.onViewMode1?.();
      } else if (event.key === '2') {
        event.preventDefault();
        config.onViewMode2?.();
      } else if (event.key === '3') {
        event.preventDefault();
        config.onViewMode3?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config]);
}



