import { Search, X } from 'lucide-react';
import { Input } from '../ui/input';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Toolbar({
  searchQuery,
  onSearchChange,
}: ToolbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  // 监听滚动，动态调整悬浮样式
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`sticky top-0 z-20 flex items-center justify-between gap-4 py-3 px-4 -mx-4 transition-all duration-300 ${
      isScrolled 
        ? 'backdrop-blur-xl bg-background/98 shadow-md border-b border-border/80' 
        : 'backdrop-blur-md bg-background/80'
    }`}>
      {/* 左侧：标题 */}
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-lg font-semibold whitespace-nowrap">持仓管理</h1>
        </motion.div>
      </div>

      {/* 右侧：搜索 + 刷新 + 视图切换 */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex items-center gap-2"
      >
        {/* 搜索框 */}
        <div className="relative w-[180px] @md:w-[220px] @lg:w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="搜索..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-9 pr-9 h-9 bg-secondary/60 border border-border/50 focus:bg-secondary focus:border-primary/30 focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 p-0.5 rounded-sm hover:bg-muted/30"
              aria-label="清除搜索"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

      </motion.div>
    </div>
  );
}


