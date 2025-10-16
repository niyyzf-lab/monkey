import { Tag, AlertTriangle, CheckCircle2, Layers, ChevronDown } from 'lucide-react'
import { SearchInput } from '@/components/common/search-input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useState } from 'react'

interface TagsHeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  onSearchClear: () => void
  filteredCategoriesCount: number
  totalTagsCount: number
  currentPage: number
  totalPages: number
  tagStatistics?: {
    totalTags: number
    currentPageTags: number
    errorTagsCount?: number
    warningTagsCount?: number
    validTagsCount?: number
  }
  // 新增分类相关属性
  categories?: string[]
  selectedCategory?: string | null
  onCategorySelect?: (category: string | null) => void
  categoriesLoading?: boolean
}

export function TagsHeader({
  searchQuery,
  onSearchChange,
  onSearchClear,
  filteredCategoriesCount,
  totalTagsCount,
  tagStatistics,
  categories = [],
  selectedCategory,
  onCategorySelect,
  categoriesLoading = false
}: TagsHeaderProps) {
  const hasProblems = (tagStatistics?.errorTagsCount || 0) + (tagStatistics?.warningTagsCount || 0) > 0
  const [dialogOpen, setDialogOpen] = useState(false)
  
  const handleCategoryClick = (category: string | null) => {
    onCategorySelect?.(category)
    setDialogOpen(false)
  }
  
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b" data-tauri-drag-region>
      <div className="px-6 py-3" data-tauri-drag-region>
        {/* 主标题行 */}
        <div className="flex items-center justify-between gap-4" data-tauri-drag-region>
          <div className="flex items-center gap-3 flex-1 min-w-0" data-tauri-drag-region>
            {/* 标题和图标 */}
            <div className="flex items-center gap-2" data-tauri-drag-region>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10" data-tauri-drag-region>
                <Tag className="h-4 w-4 text-primary" data-tauri-drag-region />
              </div>
              <div data-tauri-drag-region>
                <div className="flex items-center gap-2" data-tauri-drag-region>
                  <h1 className="text-lg font-semibold tracking-tight" data-tauri-drag-region>
                    标签分类管理
                  </h1>
                  {hasProblems && (
                    <AlertTriangle className="h-4 w-4 text-amber-500 animate-pulse" data-tauri-drag-region />
                  )}
                </div>
              </div>
            </div>
            
            {/* 统计信息 - 紧凑徽章 */}
            <div className="hidden md:flex items-center gap-1.5 ml-2" data-tauri-drag-region>
              <Badge variant="secondary" className="gap-1 h-6 text-xs font-medium" data-tauri-drag-region>
                <Layers className="h-3 w-3" data-tauri-drag-region />
                {filteredCategoriesCount}
              </Badge>
              
              <Badge variant="secondary" className="gap-1 h-6 text-xs font-medium border-emerald-200/50 bg-emerald-50/50 text-emerald-700" data-tauri-drag-region>
                <CheckCircle2 className="h-3 w-3" data-tauri-drag-region />
                {totalTagsCount}
              </Badge>

              {/* 问题标签统计 */}
              {tagStatistics?.errorTagsCount && tagStatistics.errorTagsCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="gap-1 h-6 text-xs font-medium bg-destructive/10 text-destructive border-destructive/20"
                  data-tauri-drag-region
                >
                  <AlertTriangle className="h-3 w-3" data-tauri-drag-region />
                  {tagStatistics.errorTagsCount}
                </Badge>
              )}
              
              {tagStatistics?.warningTagsCount && tagStatistics.warningTagsCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="gap-1 h-6 text-xs font-medium bg-amber-50/50 text-amber-700 border-amber-200/50"
                  data-tauri-drag-region
                >
                  <AlertTriangle className="h-3 w-3" data-tauri-drag-region />
                  {tagStatistics.warningTagsCount}
                </Badge>
              )}
            </div>
          </div>
          
          {/* 搜索框 */}
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            onClear={onSearchClear}
            placeholder="搜索标签..."
            className="w-56 lg:w-64"
          />
        </div>

        {/* 搜索结果提示 */}
        {searchQuery && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium">
                找到 <span className="text-primary">{filteredCategoriesCount}</span> 个分类中的 <span className="text-primary">{totalTagsCount}</span> 个标签
              </span>
              {hasProblems && (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  包含 {(tagStatistics?.errorTagsCount || 0) + (tagStatistics?.warningTagsCount || 0)} 个问题
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 分类选择栏 - 弹出框方案 */}
      <div className="border-t bg-muted/20">
        <div className="px-6 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">当前分类:</span>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <button
                  disabled={categoriesLoading}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                    "border inline-flex items-center gap-2 min-w-[200px] justify-between",
                    "bg-background hover:bg-muted border-border hover:border-primary/50",
                    categoriesLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Layers className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {selectedCategory || '全部分类'}
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>选择分类</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto max-h-[60vh] pr-2">
                  <div className="grid grid-cols-1 gap-2">
                    {/* 全部分类按钮 */}
                    <button
                      onClick={() => handleCategoryClick(null)}
                      className={cn(
                        "px-4 py-3 rounded-md text-sm font-medium transition-all text-left",
                        "border inline-flex items-center gap-2",
                        !selectedCategory
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background hover:bg-muted border-border"
                      )}
                    >
                      <Layers className="h-4 w-4 shrink-0" />
                      <span>全部分类</span>
                      {!selectedCategory && (
                        <Badge variant="secondary" className="ml-auto">当前</Badge>
                      )}
                    </button>

                    {/* 分类列表 */}
                    {categoriesLoading ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <div 
                          key={i} 
                          className="h-12 bg-muted-foreground/10 rounded-md animate-pulse"
                        />
                      ))
                    ) : categories.length > 0 ? (
                      categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategoryClick(category)}
                          title={category}
                          className={cn(
                            "px-4 py-3 rounded-md text-sm font-medium transition-all text-left",
                            "border inline-flex items-center gap-2",
                            selectedCategory === category
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "bg-background hover:bg-muted border-border"
                          )}
                        >
                          <Tag className="h-4 w-4 shrink-0" />
                          <span className="flex-1 truncate">{category}</span>
                          {selectedCategory === category && (
                            <Badge variant="secondary" className="ml-auto shrink-0">当前</Badge>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        暂无分类数据
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* 分类统计 */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>共 {categories.length} 个分类</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}