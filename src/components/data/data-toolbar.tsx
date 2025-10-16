import { Search, X, ChevronDown, Database, Tag } from 'lucide-react'
import { Input } from '../ui/input'
import { motion, AnimatePresence } from 'motion/react'
import { memo } from 'react'

interface DataToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onClearSearch: () => void
  totalItems: number
  filteredItems: number
  hasSearchTerms: boolean
  isScrolled: boolean
  showNavigationDropdown: boolean
  onToggleDropdown: () => void
  onNavigate: (path: string) => void
}

export const DataToolbar = memo(function DataToolbar({
  searchQuery,
  onSearchChange,
  onClearSearch,
  totalItems,
  filteredItems,
  hasSearchTerms,
  isScrolled,
  showNavigationDropdown,
  onToggleDropdown,
  onNavigate,
}: DataToolbarProps) {
  return (
    <div
      className={`sticky top-0 z-20 flex items-center justify-between gap-4 py-3 px-6 transition-all duration-300 ${
        isScrolled
          ? 'backdrop-blur-xl bg-background/98 shadow-md border-b border-border/80'
          : 'backdrop-blur-md bg-background/80'
      }`}
      data-tauri-drag-region
    >
      {/* 左侧：标题 + 搜索 */}
      <div className="flex items-center gap-3 flex-1 min-w-0" data-tauri-drag-region>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          data-tauri-drag-region
        >
          <div className="space-y-0.5" data-tauri-drag-region>
            <h1 className="text-lg font-semibold whitespace-nowrap" data-tauri-drag-region>
              猴の数据库
            </h1>
            <p
              className="text-xs text-muted-foreground/70 hidden @sm:block"
              data-tauri-drag-region
            >
              给猴子提供价值
            </p>
          </div>
        </motion.div>

        {/* 短分隔线 */}
        <div className="hidden @sm:block h-8 w-px bg-gradient-to-b from-border/40 via-border to-border/40" />

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
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-9 h-9 bg-secondary/60 border border-border/50 focus:bg-secondary focus:border-primary/30 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={onClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 
                         text-muted-foreground hover:text-foreground 
                         transition-colors duration-200 p-0.5 rounded-sm 
                         hover:bg-muted/30"
                aria-label="清除搜索"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* 右侧：统计信息 + 导航 */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex items-center gap-3 text-sm text-muted-foreground/70 flex-shrink-0"
      >
        <div className="hidden @lg:flex items-center gap-2">
          {hasSearchTerms ? (
            <>
              <span className="font-medium">显示</span>
              <span className="font-mono font-semibold text-primary">
                {filteredItems.toLocaleString()}
              </span>
              <span className="text-muted-foreground/50">/</span>
              <span className="font-mono text-muted-foreground/60">
                {totalItems.toLocaleString()}
              </span>
            </>
          ) : (
            <>
              <span className="font-medium">总计</span>
              <span className="font-mono font-medium text-foreground/70">
                {totalItems.toLocaleString()}
              </span>
            </>
          )}
        </div>

        {/* 短分隔线 */}
        <div className="h-4 w-px bg-gradient-to-b from-border/40 via-border to-border/40" />

        {/* 导航按钮 */}
        <div className="relative" data-dropdown-container>
          <button
            onClick={onToggleDropdown}
            className="p-1.5 rounded-md opacity-40 hover:opacity-80 transition-all duration-200 
                     hover:bg-secondary/60 focus:outline-none"
            aria-label="导航"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                showNavigationDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* 下拉菜单 */}
          <AnimatePresence>
            {showNavigationDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-40 bg-popover/98 border-2 border-border/80 
                         rounded-md shadow-2xl backdrop-blur-sm z-[100]"
              >
                <div className="py-1">
                  <button
                    onClick={() => onNavigate('/data')}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground 
                             transition-colors duration-150 flex items-center gap-2"
                  >
                    <Database className="w-3 h-3" />
                    <span>数据库</span>
                  </button>
                  <button
                    onClick={() => onNavigate('/data/tags')}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground 
                             transition-colors duration-150 flex items-center gap-2"
                  >
                    <Tag className="w-3 h-3" />
                    <span>标签</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
})

