import { Search, RefreshCw, LayoutGrid, Table2, List, MoreVertical, Keyboard } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { motion } from 'motion/react';
import { ViewMode } from '../../hooks/use-view-preferences';
import { useState, useEffect } from 'react';

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  isAutoRefreshing?: boolean;
  isScrollPaused?: boolean; // 新增滚动暂停状态
  countdown?: number; // 新增倒计时
}

export function Toolbar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  isRefreshing,
  onRefresh,
  isAutoRefreshing = true,
  isScrollPaused = false, // 默认为 false
  countdown = 0, // 默认为 0
}: ToolbarProps) {
  const [showToolMenu, setShowToolMenu] = useState(false);
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
      {/* 左侧：标题 + 搜索 */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-lg font-semibold whitespace-nowrap">持仓管理</h1>
        </motion.div>

        {/* 短分隔线 */}
        <div className="hidden @sm:block h-4 w-px bg-gradient-to-b from-border/40 via-border to-border/40" />

        {/* 搜索框 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex-1 max-w-[200px] @xs:max-w-xs @md:max-w-sm @lg:max-w-md"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="搜索..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="pl-9 h-9 bg-secondary/60 border border-border/50 focus:bg-secondary focus:border-primary/30 focus:ring-2 focus:ring-primary/20 transition-all @md:placeholder:content-['搜索股票代码或名称...']"
            />
          </div>
        </motion.div>
      </div>

      {/* 右侧：工具栏 */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex items-center gap-2"
      >
        {/* 视图切换器 - 无边框，小屏隐藏 */}
        <div className="hidden @[600px]:flex items-center gap-0.5 p-0.5 rounded-lg bg-secondary/60">
          <Button
            variant={viewMode === 'card' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('card')}
            className={`h-9 px-2.5 ${viewMode === 'card' ? 'bg-primary/15 border-primary/30' : ''}`}
            title="卡片视图 (1)"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('table')}
            className={`h-9 px-2.5 ${viewMode === 'table' ? 'bg-primary/15 border-primary/30' : ''}`}
            title="表格视图 (2)"
          >
            <Table2 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'compact' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('compact')}
            className={`h-9 px-2.5 ${viewMode === 'compact' ? 'bg-primary/15 border-primary/30' : ''}`}
            title="紧凑视图 (3)"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* 短分隔线 */}
        <div className="h-4 w-px bg-gradient-to-b from-border/40 via-border to-border/40" />

        {/* 刷新按钮 - 简化 */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="h-9 px-2.5 relative"
              >
                <motion.div
                  animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                  transition={
                    isRefreshing
                      ? { duration: 1, repeat: Infinity, ease: 'linear' }
                      : { duration: 0.3 }
                  }
                >
                  <RefreshCw className="h-4 w-4" />
                </motion.div>
                {/* 自动刷新指示器 */}
                {isAutoRefreshing && !isRefreshing && !isScrollPaused && (
                  <motion.div
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full"
                    animate={{ 
                      scale: [1, 1.2, 1], 
                      opacity: [1, 0.6, 1] 
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
                {/* 滚动暂停指示器 */}
                {isScrollPaused && (
                  <motion.div
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full"
                    animate={{ 
                      scale: [1, 1.1, 1], 
                      opacity: [1, 0.7, 1] 
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
                {/* 倒计时显示 */}
                {isScrollPaused && countdown > 0 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap font-medium"
                  >
                    {countdown}s
                  </motion.div>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">
                刷新 (Ctrl+R)
                {isAutoRefreshing && !isScrollPaused && (
                  <span className="block text-[10px] text-muted-foreground mt-0.5">自动更新: 每2.5秒</span>
                )}
                {isScrollPaused && (
                  <span className="block text-[10px] text-amber-600 mt-0.5">
                    排序已暂停 - {countdown > 0 ? `${countdown}秒后恢复` : '等待滚动停止'}
                  </span>
                )}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* 更多工具 - 下拉菜单，小屏隐藏 */}
        <div className="relative hidden @[600px]:block">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowToolMenu(!showToolMenu)}
                  className="h-9 px-2.5"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">更多工具</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* 下拉菜单 */}
          {showToolMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-48 rounded-lg border-2 border-border/80 bg-popover/98 p-1 shadow-2xl z-50"
              onMouseLeave={() => setShowToolMenu(false)}
            >
              <button
                className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => {
                  setShowToolMenu(false);
                }}
              >
                <Keyboard className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="font-medium">快捷键</div>
                  <div className="text-xs text-muted-foreground">查看所有快捷键</div>
                </div>
              </button>
              <div className="my-1 border-t" />
              <div className="px-3 py-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between mb-1">
                  <span>搜索</span>
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Ctrl+K</kbd>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span>刷新</span>
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Ctrl+R</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>切换视图</span>
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">1/2/3</kbd>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}


