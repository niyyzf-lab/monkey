import { memo, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { StockCompanyInfo } from '@/types/stock_details'
import { Tags, Globe, ExternalLink } from 'lucide-react'

interface DataMasonryCardProps {
  stockInfo: StockCompanyInfo
  onTagsUpdate?: (stockCode: string, newTags: string) => void
  parsedTags?: Record<string, Array<{ name: string; detail?: string }>> // 预解析的标签数据
}


// 解析自定义标签 - 提取到组件外部避免重复创建
// 导出以便在父组件中使用，实现预计算优化
export const parseCustomTags = (tags: string) => {
  if (!tags) return {}
  const sections = tags.split(';').map(s => s.trim()).filter(s => s)
  const parsedData: Record<string, Array<{ name: string; detail?: string }>> = {}

  sections.forEach(section => {
    const colonIndex = section.indexOf(':')
    if (colonIndex > 0) {
      const category = section.substring(0, colonIndex).trim()
      const valueWithDetail = section.substring(colonIndex + 1).trim()

      if (!parsedData[category]) {
        parsedData[category] = []
      }

      const match = valueWithDetail.match(/^(.+?)\{(.+?)\}$/)
      if (match) {
        const tagName = match[1].trim()
        const detail = match[2].trim()
        parsedData[category].push({ name: tagName, detail: detail })
      } else if (valueWithDetail) {
        parsedData[category].push({ name: valueWithDetail })
      }
    }
  })

  return parsedData
}


// 带 Popover 的标签列表组件
interface TagListWithPopoverProps {
  tags: string[]
  containerWidth?: number // 容器宽度（px）
  variant?: 'outline' | 'secondary'
  keyPrefix: string
}

// 估算标签宽度（像素）
const estimateTagWidth = (text: string): number => {
  // 中文字符约 12px，英文字符约 7px，加上 padding (16px) 和 border (2px)
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const otherChars = text.length - chineseChars
  return chineseChars * 12 + otherChars * 7 + 18
}

// 计算可以显示的标签数量
const calculateVisibleCount = (tags: string[], maxWidth: number): number => {
  let totalWidth = 0
  const gap = 4 // gap-1 = 4px
  const plusBadgeWidth = 40 // "+n" badge 的宽度
  
  for (let i = 0; i < tags.length; i++) {
    const tagWidth = estimateTagWidth(tags[i])
    const currentWidth = totalWidth + tagWidth + (i > 0 ? gap : 0)
    
    // 如果还有剩余标签，需要预留 +n badge 的空间
    if (i < tags.length - 1) {
      if (currentWidth + gap + plusBadgeWidth > maxWidth) {
        return Math.max(1, i) // 至少显示1个标签
      }
    } else {
      // 最后一个标签，不需要预留 +n 空间
      if (currentWidth > maxWidth) {
        return Math.max(1, i)
      }
    }
    
    totalWidth = currentWidth
  }
  
  return tags.length
}

const TagListWithPopover = memo<TagListWithPopoverProps>(
  function TagListWithPopover({ tags, containerWidth = 280, variant = 'outline', keyPrefix }) {
    const [isOpen, setIsOpen] = useState(false)
    
    // 根据容器宽度和标签内容动态计算可见数量
    const visibleCount = useMemo(
      () => calculateVisibleCount(tags, containerWidth),
      [tags, containerWidth]
    )
    
    const visibleTags = useMemo(() => tags.slice(0, visibleCount), [tags, visibleCount])
    const remainingTags = useMemo(() => tags.slice(visibleCount), [tags, visibleCount])
    const remainingCount = remainingTags.length

    if (tags.length === 0) return null

    return (
      <div className="flex items-center gap-1 overflow-hidden">
        {visibleTags.map((tag, index) => (
          <Badge
            key={`${keyPrefix}-${index}`}
            variant={variant}
            className="text-xs px-2 py-0.5 h-5 font-normal border-border/60 shrink-0"
          >
            {tag}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Badge
                variant={variant}
                className="text-xs px-2 py-0.5 h-5 font-normal border-dashed cursor-pointer hover:bg-accent/70 transition-colors shrink-0"
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
              >
                +{remainingCount}
              </Badge>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto max-w-xs p-2"
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
            >
              <div className="flex flex-wrap gap-1">
                {isOpen && remainingTags.map((tag, index) => (
                  <Badge
                    key={`${keyPrefix}-remaining-${index}`}
                    variant={variant}
                    className="text-xs px-2 py-0.5 h-5 font-normal"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    )
  }
)

export const DataMasonryCard = memo<DataMasonryCardProps>(
  function DataMasonryCard({ stockInfo, parsedTags: propsParsedTags }) {
    // 优先使用父组件传递的预解析标签，否则在本地解析（降级方案）
    const parsedTags = useMemo(() => {
      return propsParsedTags || parseCustomTags(stockInfo.custom_tags)
    }, [propsParsedTags, stockInfo.custom_tags])

    return (
      <Card 
        data-stock-card={stockInfo.stock_code}
        className="border-border/50 w-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/40 group"
        style={{ 
          // 性能优化 - 防止滚动时的重排和重绘
          contentVisibility: 'auto',
          containIntrinsicSize: '350px 320px', // 减小预估高度
          // GPU 加速
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
          // 限制绘制范围
          contain: 'layout paint style',
        }}>
        {/* 头部 - 紧凑布局 */}
        <CardHeader className="pb-2 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-semibold leading-tight truncate">
                {stockInfo.company_name}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5 flex items-center gap-1">
                <span className="font-medium">{stockInfo.stock_name}</span>
                <span className="text-muted-foreground/50">·</span>
                <span className="font-mono">{stockInfo.stock_code}</span>
              </CardDescription>
            </div>
            <Badge
              variant="secondary"
              className="text-xs px-1.5 py-0.5 h-5 bg-primary/10 text-primary shrink-0"
            >
              {stockInfo.exchange}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-2">
          {/* 业务范围 - 简化，直接显示 */}
          <p className="text-xs text-muted-foreground/75 leading-relaxed line-clamp-2">
            {stockInfo.business_scope}
          </p>

          {/* 板块概念 - 带 Popover，单行显示 */}
          {stockInfo.sectors_concepts.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Tags className="w-3 h-3 text-purple-600 dark:text-purple-500" />
                <span className="text-xs font-medium text-muted-foreground/80">板块</span>
              </div>
              <TagListWithPopover
                tags={stockInfo.sectors_concepts}
                containerWidth={310}
                variant="outline"
                keyPrefix={`${stockInfo.stock_code}-concept`}
              />
            </div>
          )}

          {/* 公司描述 - 压缩行数 */}
          <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-3">
            {stockInfo.company_description}
          </p>

          {/* 自定义标签 - 简化布局，单行显示，始终显示分类占位 */}
          <div className="pt-1.5 border-t border-border/30 space-y-1.5">
            <div className="flex items-center gap-1">
              <Tags className="w-3 h-3 text-amber-600 dark:text-amber-500" />
              <span className="text-xs font-medium text-muted-foreground/80">标签</span>
            </div>
            {Object.entries(parsedTags).map(([category, items]) => {
              const tagNames = items.map(item => item.name)
              // 计算分类标签的可用宽度：总宽度 - 分类名宽度 - gap
              const categoryWidth = estimateTagWidth(category + ':')
              const availableWidth = 310 - categoryWidth - 6
              return (
                <div key={category} className="flex items-center gap-1.5 overflow-hidden">
                  <span className="text-xs font-medium text-muted-foreground/70 shrink-0">
                    {category}:
                  </span>
                  <div className="flex-1 min-w-0">
                    {tagNames.length > 0 ? (
                      <TagListWithPopover
                        tags={tagNames}
                        containerWidth={availableWidth}
                        variant="secondary"
                        keyPrefix={`${stockInfo.stock_code}-${category}`}
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground/50">-</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* 底部信息 - 简化 */}
          <div className="flex items-center justify-between pt-1.5 border-t border-border/30">
            <a
              href={stockInfo.official_website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
            >
              <Globe className="w-3 h-3" />
              <span>官网</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
            <span className="text-xs text-muted-foreground/60 font-mono">
              {new Date(stockInfo.updated_at).toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    )
  },
  (prev, next) => {
    // 精确的比较函数 - 只在关键数据改变时重新渲染
    return prev.stockInfo.stock_code === next.stockInfo.stock_code &&
           prev.stockInfo.updated_at === next.stockInfo.updated_at &&
           prev.stockInfo.custom_tags === next.stockInfo.custom_tags &&
           prev.stockInfo.sectors_concepts.length === next.stockInfo.sectors_concepts.length
  }
)


