import { ChevronRight, AlertTriangle, CheckCircle2, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { StockCompanyInfo } from '@/types/stock_details'
import { cn } from '@/lib/utils'
import { validateTagFormat, getTagValidationResult } from '@/lib/tag-validation'
import { memo, useMemo, useCallback } from 'react'

interface TagInfo {
  name: string
  detail?: string
  count: number
  stocks: StockCompanyInfo[]
}

interface TagCategoryCardProps {
  categoryName: string
  tags: TagInfo[]
  onTagClick: (categoryName: string, tagName: string, tagDetail: string | undefined, stocks: StockCompanyInfo[]) => void
}

// 优化的单个标签项组件
const TagItem = memo(({ tag, categoryName, onTagClick }: {
  tag: TagInfo
  categoryName: string
  onTagClick: (categoryName: string, tagName: string, tagDetail: string | undefined, stocks: StockCompanyInfo[]) => void
}) => {
  // 缓存验证结果
  const validationData = useMemo(() => {
    const status = validateTagFormat(tag.name, tag.detail)
    const result = getTagValidationResult(tag.name, tag.detail)
    return { status, result }
  }, [tag.name, tag.detail])

  // 获取状态图标
  const statusIcon = useMemo(() => {
    switch (validationData.status) {
      case 'error':
        return <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
      case 'warning':
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
      case 'special':
        return <Star className="h-3.5 w-3.5 text-blue-500 fill-blue-500" />
      case 'valid':
      default:
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/60" />
    }
  }, [validationData.status])

  // 获取状态样式
  const statusStyles = useMemo(() => {
    switch (validationData.status) {
      case 'error':
        return {
          container: 'border-destructive/20 border-l-destructive hover:bg-destructive/5 hover:border-destructive/30',
          text: 'text-destructive',
          subtext: 'text-destructive/70'
        }
      case 'warning':
        return {
          container: 'border-amber-200/50 border-l-amber-500 hover:bg-amber-50/50 hover:border-amber-300/50 dark:border-amber-800/50 dark:hover:bg-amber-950/20 dark:hover:border-amber-700/50',
          text: 'text-amber-700 dark:text-amber-400',
          subtext: 'text-amber-600/70 dark:text-amber-400/70'
        }
      case 'special':
        return {
          container: 'border-blue-200/50 border-l-blue-500 hover:bg-blue-50/50 hover:border-blue-300/50 dark:border-blue-800/50 dark:hover:bg-blue-950/20 dark:hover:border-blue-700/50',
          text: 'text-blue-700 dark:text-blue-400 font-medium',
          subtext: 'text-blue-600/70 dark:text-blue-400/70'
        }
      case 'valid':
      default:
        return {
          container: 'border-border border-l-muted-foreground/20 hover:bg-accent/30 hover:border-border',
          text: 'text-foreground',
          subtext: 'text-muted-foreground'
        }
    }
  }, [validationData.status])

  const handleClick = useCallback(() => {
    onTagClick(categoryName, tag.name, tag.detail, tag.stocks)
  }, [categoryName, tag.name, tag.detail, tag.stocks, onTagClick])

  return (
    <div
      className={cn(
        "group flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all duration-200 bg-card hover:shadow-sm border-l-2",
        statusStyles.container
      )}
      onClick={handleClick}
    >
      {/* 状态图标 */}
      {statusIcon}
      
      {/* 标签内容 */}
      <div className="flex-1 min-w-0">
        <div className={cn("text-sm font-medium truncate", statusStyles.text)}>
          {tag.name}
        </div>
        
        {tag.detail && (
          <div className={cn("text-xs mt-0.5 truncate", statusStyles.subtext)}>
            {tag.detail}
          </div>
        )}
        
        {/* 验证消息 */}
        {validationData.result.message && validationData.status !== 'valid' && (
          <div className="text-xs mt-0.5 opacity-75">
            {validationData.result.message}
          </div>
        )}
      </div>
      
      {/* 计数和箭头 */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge variant="outline" className="text-xs">
          {tag.count}
        </Badge>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </div>
  )
})

TagItem.displayName = 'TagItem'

export const TagCategoryCard = memo(({ categoryName, tags, onTagClick }: TagCategoryCardProps) => {
  return (
    <div className="space-y-3">
      {/* 分类标题 - 简洁的标题栏 */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-medium text-muted-foreground">
          {categoryName}
        </h3>
        <Badge variant="secondary" className="text-xs">
          {tags.length}
        </Badge>
      </div>

      {/* 标签列表 - 扁平化设计 */}
      <div className="space-y-1">
        {tags.map((tag, index) => (
          <TagItem
            key={`${tag.name}-${tag.detail || ''}-${index}`}
            tag={tag}
            categoryName={categoryName}
            onTagClick={onTagClick}
          />
        ))}
      </div>
    </div>
  )
})

TagCategoryCard.displayName = 'TagCategoryCard'
