import { ChevronRight, AlertTriangle, Star, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { StockCompanyInfo } from '@/types/stock_details'
import { cn } from '@/lib/utils'
import { validateTagFormat, getTagValidationResult } from '@/lib/tag-validation'

interface SimilarTagCardProps {
  categoryName: string
  tagName: string
  tagDetail?: string
  similarity: number
  count: number
  stocks: StockCompanyInfo[]
  onClick: (categoryName: string, tagName: string, tagDetail: string | undefined, stocks: StockCompanyInfo[]) => void
}

export function SimilarTagCard({ 
  categoryName, 
  tagName, 
  tagDetail, 
  similarity, 
  count, 
  stocks, 
  onClick 
}: SimilarTagCardProps) {
  const validationStatus = validateTagFormat(tagName, tagDetail)
  const validationResult = getTagValidationResult(tagName, tagDetail)
  
  // 获取状态图标
  const getStatusIcon = () => {
    switch (validationStatus) {
      case 'error':
        return <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
      case 'warning':
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
      case 'special':
        return <Star className="h-3.5 w-3.5 text-blue-500 fill-blue-500" />
      case 'valid':
      default:
        return <TrendingUp className="h-3.5 w-3.5 text-emerald-500/60" />
    }
  }

  // 获取相似度徽章样式
  const getSimilarityBadgeStyle = () => {
    if (similarity >= 0.8) return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-800"
    if (similarity >= 0.6) return "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/50 dark:border-blue-800"
    if (similarity >= 0.4) return "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-800"
    return "text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-950/50 dark:border-slate-800"
  }

  // 获取状态样式
  const getStatusStyles = () => {
    switch (validationStatus) {
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
  }

  const statusStyles = getStatusStyles()
  
  return (
    <div
      className={cn(
        "group flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all duration-200 bg-card hover:shadow-sm border-l-2",
        statusStyles.container
      )}
      onClick={() => onClick(categoryName, tagName, tagDetail, stocks)}
    >
      {/* 状态图标 */}
      {getStatusIcon()}
      
      {/* 标签内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("text-sm font-medium truncate", statusStyles.text)}>
            {tagName}
          </span>
          
          {/* 相似度徽章 */}
          <Badge 
            variant="outline" 
            className={cn("text-xs", getSimilarityBadgeStyle())}
          >
            {Math.round(similarity * 100)}%
          </Badge>
        </div>
        
        <div className={cn("text-xs", statusStyles.subtext)}>
          {categoryName} • {count}个股票
        </div>
        
        {tagDetail && (
          <div className={cn("text-xs mt-0.5 truncate opacity-80", statusStyles.subtext)}>
            {tagDetail}
          </div>
        )}
        
        {/* 验证消息 */}
        {validationResult.message && validationStatus !== 'valid' && (
          <div className="text-xs mt-0.5 opacity-75">
            {validationResult.message}
          </div>
        )}
      </div>
      
      {/* 箭头 */}
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
    </div>
  )
}
