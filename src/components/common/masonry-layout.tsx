import { ReactNode, useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface MasonryLayoutProps {
  children: ReactNode[];
  columns?: number;
  gap?: number;
}

/**
 * 瀑布流布局组件
 * 将子元素按顺序分配到多列中，模拟瀑布流效果
 */
export function MasonryLayout({ 
  children, 
  columns = 2, 
  gap = 16 
}: MasonryLayoutProps) {
  const [columnItems, setColumnItems] = useState<ReactNode[][]>([]);

  useEffect(() => {
    // 初始化列数组
    const cols: ReactNode[][] = Array.from({ length: columns }, () => []);
    
    // 按顺序将子元素分配到列中（轮询分配）
    children.forEach((child, index) => {
      const colIndex = index % columns;
      cols[colIndex].push(child);
    });

    setColumnItems(cols);
  }, [children, columns]);

  if (columns === 1) {
    return (
      <div className="flex flex-col" style={{ gap: `${gap}px` }}>
        {children.map((child, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ 
              type: "spring",
              stiffness: 350,
              damping: 35,
              mass: 0.7,
              delay: index * 0.04,
            }}
          >
            {child}
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex" style={{ gap: `${gap}px` }}>
      {columnItems.map((items, colIndex) => (
        <div 
          key={colIndex}
          className="flex-1 flex flex-col"
          style={{ gap: `${gap}px` }}
        >
          {items.map((item, itemIndex) => {
            const globalIndex = colIndex + itemIndex * columns;
            return (
              <motion.div
                key={globalIndex}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ 
                  type: "spring",
                  stiffness: 350,
                  damping: 35,
                  mass: 0.7,
                  delay: itemIndex * 0.04,
                }}
                className="w-full"
              >
                {item}
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

