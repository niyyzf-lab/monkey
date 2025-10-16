import { memo, useEffect, useState, useRef, useCallback } from 'react'
import { usePositioner, useContainerPosition, useResizeObserver, useMasonry } from 'masonic'
import { StockCompanyInfo } from '@/types/stock_details'
import { DataMasonryCard } from './data-masonry-card'

interface DataMasonryContainerProps {
  data: StockCompanyInfo[]
  searchQuery?: string
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>
}

// Masonry 项目组件
const MasonryItem = memo(({ data: stockInfo }: { data: StockCompanyInfo }) => {
  return <DataMasonryCard stockInfo={stockInfo} />
})
MasonryItem.displayName = 'MasonryItem'

export const DataMasonryContainer = memo<DataMasonryContainerProps>(
  function DataMasonryContainer({ data, searchQuery, scrollContainerRef }) {
    const containerRef = useRef<HTMLDivElement>(null)
    
    // 使用 useContainerPosition 来监听自定义滚动容器
    const { width } = useContainerPosition(containerRef, [data])
    
    // 配置 positioner (列布局)
    const positioner = usePositioner(
      {
        width,
        columnWidth: 350,
        columnGutter: 12,
        rowGutter: 12, // 行间距
      },
      [data]
    )
    
    // 监听滚动 - 优化滚动平滑度
    const [scrollTop, setScrollTop] = useState(0)
    const [isScrolling, setIsScrolling] = useState(false)
    const rafIdRef = useRef<number | null>(null)
    
    useEffect(() => {
      const scrollContainer = scrollContainerRef?.current
      if (!scrollContainer) return
      
      let scrollTimeout: NodeJS.Timeout
      
      const handleScroll = () => {
        // 取消之前的 RAF
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current)
        }
        
        // 使用 RAF 确保在下一帧更新，避免抖动
        rafIdRef.current = requestAnimationFrame(() => {
          setScrollTop(scrollContainer.scrollTop)
          
          // 标记正在滚动
          if (!isScrolling) {
            setIsScrolling(true)
          }
          
          // 清除之前的定时器
          clearTimeout(scrollTimeout)
          // 滚动停止后立即标记为非滚动状态
          scrollTimeout = setTimeout(() => {
            setIsScrolling(false)
          }, 100)
        })
      }
      
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
      
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll)
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current)
        }
        clearTimeout(scrollTimeout)
      }
    }, [scrollContainerRef, isScrolling])
    
    // 使用 resize observer 监听容器尺寸变化
    const resizeObserver = useResizeObserver(positioner)
    
    // 渲染函数
    const renderItem = useCallback(
      ({ data: item, width }: { index: number; data: StockCompanyInfo; width: number }) => (
        <div style={{ width }}>
          <MasonryItem data={item} />
        </div>
      ),
      []
    )
    
    // 使用 masonry hook - 优化虚拟滚动参数防止抖动
    const masonryItems = useMasonry({
      positioner,
      resizeObserver,
      scrollTop,
      isScrolling,
      height: scrollContainerRef?.current?.clientHeight || window.innerHeight,
      containerRef,
      items: data,
      // 增加 overscan 防止向上滚动时抖动
      overscanBy: 16, // 上下各预渲染 8 个项目，确保滚动流畅
      render: renderItem,
      itemKey: (item: StockCompanyInfo) => item.stock_code,
      role: 'list',
      itemHeightEstimate: 440, // 更新为新的紧凑卡片高度
      tabIndex: -1,
    })

    if (!data || data.length === 0) {
      return null
    }

    return (
      <div 
        ref={containerRef}
        key={`masonry-${searchQuery || 'all'}`}
        className="w-full"
        style={{
          animation: 'fadeIn 0.3s ease-out',
          position: 'relative',
          minHeight: positioner.size(),
          // 优化渲染性能
          contain: 'layout style paint',
          // GPU 加速 - 始终启用以避免切换导致的抖动
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      >
        {masonryItems}
      </div>
    )
  }
)

