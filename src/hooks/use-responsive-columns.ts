import { useState, useEffect } from 'react';

/**
 * 响应式列数 Hook
 * 根据窗口宽度返回合适的列数
 */
export function useResponsiveColumns(defaultColumns: number = 2) {
  const [columns, setColumns] = useState(defaultColumns);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      setColumns(width >= 1280 ? 2 : 1);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  return columns;
}

