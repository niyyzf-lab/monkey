import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { fetchStockDetails } from '@/api/stock-details-api'
import { StockInfoArray, StockCompanyInfo } from '@/types/stock_details'
import { Search, X, Database } from 'lucide-react'
import { Masonry } from 'masonic'
import { motion } from 'motion/react'
import { DataPageToolbar } from '@/components/data/data-page-toolbar'
import { SearchHintBar } from '@/components/data/data-search-hint-bar'
import { DataPagination } from '@/components/data/data-pagination'
import { LazyStockCard } from '@/components/data/data-lazy-stock-card'
import { MasonrySkeletonGrid } from '@/components/data/data-stock-card-skeleton'
import { DataPageLoadingState, DataPageErrorState } from '@/components/data/data-loading-state'
import { useSearchParser } from '@/hooks/use-search-parser'
import { useWindowResizeSkeleton } from '@/hooks/use-window-resize-skeleton'
import { getSimplePinyin } from '@/lib/pinyin-utils'

// Masonic Stock Card Component with Lazy Loading
interface MasonryStockCardProps {
  index: number
  data: StockCompanyInfo
}

const MasonryStockCard = ({ index, data }: MasonryStockCardProps) => {
  return <LazyStockCard index={index} data={data} />
}

export const Route = createFileRoute('/data/')({
  component: DataPage,
  validateSearch: (search) => ({
    q: search.q as string | undefined,
  }),
})

function DataPage() {
  const navigate = useNavigate()
  const [stockData, setStockData] = useState<StockInfoArray | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // 导航下拉菜单状态
  const [showNavigationDropdown, setShowNavigationDropdown] = useState(false)
  
  // 搜索状态
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  
  // 滚动状态
  const [isScrolled, setIsScrolled] = useState(false)
  
  // 窗口调整状态 - 显示骨架屏
  const isResizing = useWindowResizeSkeleton(300)
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 50

  // 搜索截流效果 - 300ms延迟
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // 监听滚动，动态调整悬浮样式
  useEffect(() => {
    const scrollContainer = document.getElementById('main-scroll-container')
    if (!scrollContainer) return

    const handleScroll = () => {
      setIsScrolled(scrollContainer.scrollTop > 10)
    }
    
    scrollContainer.addEventListener('scroll', handleScroll)
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [])

  // 监听页面可见性，确保返回时正确显示内容
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 页面变为可见时，如果有数据但loading为true，重置loading状态
        if (stockData && stockData.length > 0 && loading) {
          setLoading(false)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [stockData, loading])

  // 解析当前搜索查询
  const searchTerms = useSearchParser(debouncedSearchQuery)

  // 过滤数据
  const filteredData = useMemo(() => {
    if (!stockData) return []
    
    if (searchTerms.text.length === 0 && searchTerms.tags.length === 0 && searchTerms.letters.length === 0) {
      return stockData
    }
    
    return stockData.filter((stock) => {
      let matches = true
      
      // 文本搜索
      if (searchTerms.text.length > 0) {
        const searchFields = [
          stock.stock_code || '',
          stock.stock_name || '',
          stock.company_name || '',
          stock.business_scope || '',
          stock.company_description || '',
          stock.custom_tags || '',
          stock.exchange || '',
          ...(stock.sectors_concepts || [])
        ].join(' ').toLowerCase()
        
        const textMatches = searchTerms.text.every(term => 
          searchFields.includes(term.toLowerCase())
        )
        
        if (!textMatches) matches = false
      }
      
      // 标签搜索
      if (searchTerms.tags.length > 0) {
        const stockTags = [
          ...(stock.custom_tags ? stock.custom_tags.split(';').map(tag => tag.trim().toLowerCase()) : []),
          ...(stock.sectors_concepts ? stock.sectors_concepts.map(concept => concept.toLowerCase()) : [])
        ]
        
        const tagsMatch = searchTerms.tags.every(searchTag => 
          stockTags.some(stockTag => 
            stockTag.includes(searchTag.toLowerCase())
          )
        )
        
        if (!tagsMatch) matches = false
      }
      
      // 简拼搜索
      if (searchTerms.letters.length > 0) {
        const pinyinMatch = searchTerms.letters.some(searchPinyin => {
          const stockNamePinyin = getSimplePinyin(stock.stock_name || '')
          const companyNamePinyin = getSimplePinyin(stock.company_name || '')
          
          return stockNamePinyin.includes(searchPinyin) || companyNamePinyin.includes(searchPinyin)
        })
        
        if (!pinyinMatch) matches = false
      }
      
      return matches
    })
  }, [stockData, searchTerms])

  // 分页计算
  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  
  // 当前页数据
  const currentPageData = useMemo(() => {
    if (!filteredData.length) return []
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, ITEMS_PER_PAGE])

  // Masonic 渲染函数
  const MasonryCard = useMemo(
    () => ({ index, data }: { index: number; data: StockCompanyInfo }) => {
      return <MasonryStockCard index={index} data={data} />
    },
    []
  )

  // 获取响应式列数
  const getColumns = useCallback(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      if (width >= 1536) return 6
      if (width >= 1280) return 5
      if (width >= 1024) return 4
      if (width >= 768) return 3
      if (width >= 640) return 2
      return 1
    }
    return 4
  }, [])

  const [columns, setColumns] = useState(getColumns)

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setColumns(getColumns())
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [getColumns])

  // 搜索条件改变时重置分页
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery])

  // 清除搜索
  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setDebouncedSearchQuery('')
  }, [])

  // 导航处理函数
  const handleNavigation = useCallback((path: string) => {
    setShowNavigationDropdown(false)
    navigate({ to: path })
  }, [navigate])

  // 关闭下拉菜单（点击外部）
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showNavigationDropdown && !target.closest('[data-dropdown-container]')) {
        setShowNavigationDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNavigationDropdown])

  // 分页处理函数
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      
      setTimeout(() => {
        const scrollContainer = document.getElementById('main-scroll-container')
        
        if (scrollContainer) {
          scrollContainer.scrollTop = 0
          scrollContainer.scrollTo({ 
            top: 0, 
            behavior: 'smooth' 
          })
        } else {
          window.scrollTo({ 
            top: 0, 
            behavior: 'smooth' 
          })
        }
      }, 50)
    }
  }, [totalPages])

  // 初始数据加载 - 优化加载流程，确保每次进入页面都会正确加载
  useEffect(() => {
    let mounted = true

    const loadStockData = async () => {
      try {
        // 只在没有数据时设置loading
        if (!stockData || stockData.length === 0) {
          setLoading(true)
        }
        setError(null)
        
        // 如果已经有数据，不需要重新加载
        if (stockData && stockData.length > 0 && isInitialized) {
          setLoading(false)
          return
        }
        
        // 添加最小加载时间，避免闪烁
        const [data] = await Promise.all([
          fetchStockDetails(),
          new Promise(resolve => setTimeout(resolve, 300))
        ])
        
        if (!mounted) return
        
        setStockData(data)
        setCurrentPage(1)
        setIsInitialized(true)
      } catch (err) {
        if (!mounted) return
        setError(err instanceof Error ? err.message : '获取数据失败')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadStockData()

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return <DataPageLoadingState />
  }

  if (error) {
    return <DataPageErrorState error={error} />
  }

  const hasSearchTerms = searchTerms.text.length > 0 || searchTerms.tags.length > 0 || searchTerms.letters.length > 0

  return (
    <div id="main-scroll-container" className="@container overflow-y-auto h-screen-safe relative scroll-smooth" style={{ scrollBehavior: 'smooth' }}>
      {/* 优化的顶部工具栏 - 始终显示 */}
      <DataPageToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={clearSearch}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        hasSearchTerms={hasSearchTerms}
        isScrolled={isScrolled}
        showNavigationDropdown={showNavigationDropdown}
        onToggleDropdown={() => setShowNavigationDropdown(!showNavigationDropdown)}
        onNavigate={handleNavigation}
      />
      
      {/* 搜索提示区域 */}
      {stockData && debouncedSearchQuery && (
        <SearchHintBar
          searchQuery={debouncedSearchQuery}
          searchTerms={searchTerms}
          totalItems={totalItems}
        />
      )}
      
      {/* 内容区域 */}
      <div className="px-6 py-6">
        {stockData && stockData.length > 0 ? (
          filteredData.length > 0 ? (
            <div className="w-full space-y-8">
              {isResizing ? (
                // 窗口调整时显示骨架屏
                <MasonrySkeletonGrid count={currentPageData.length} columns={columns} />
              ) : (
                <motion.div
                  key={`page-${currentPage}-${debouncedSearchQuery}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Masonry
                    items={currentPageData}
                    render={MasonryCard}
                    columnGutter={6}
                    columnWidth={300}
                    maxColumnCount={columns}
                    overscanBy={5}
                    key={`${currentPage}-${debouncedSearchQuery}`}
                  />
                </motion.div>
              )}
            
            {/* 分页组件 */}
            <DataPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>  
        ) : (
          // 搜索无结果
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-16"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, type: "spring" }}
                className="mx-auto w-16 h-16 rounded-full bg-secondary/50 dark:bg-secondary/70 flex items-center justify-center shadow-sm"
              >
                <Search className="w-7 h-7 text-muted-foreground/60" />
              </motion.div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground/80">
                  没有找到匹配的结果
                </p>
                <div className="text-sm text-muted-foreground/70 space-y-1 max-w-md mx-auto">
                  <p className="font-medium">当前搜索："{debouncedSearchQuery}"</p>
                  {searchTerms.text.length > 0 && (
                    <p>• 关键词：{searchTerms.text.join(', ')}</p>
                  )}
                  {searchTerms.tags.length > 0 && (
                    <p>• 标签搜索：{searchTerms.tags.map(tag => `@${tag}`).join(', ')}</p>
                  )}
                  {searchTerms.letters.length > 0 && (
                    <p>• 简拼搜索：{searchTerms.letters.map(pinyin => `#${pinyin}`).join(', ')}</p>
                  )}
                  <p className="pt-2 text-muted-foreground/60">
                    尝试修改搜索条件或使用其他关键词<br/>
                    <span className="text-xs">
                      支持语法：@标签名 #简拼 普通关键词（如：#PAYH 搜索平安银行）
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={clearSearch}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium 
                         text-primary hover:text-primary/80 transition-all duration-200
                         border border-border/40 dark:border-border/60 rounded-md 
                         hover:bg-accent hover:border-primary/40 shadow-sm"
              >
                <X className="w-4 h-4" />
                清除搜索
              </button>
            </div>
          </motion.div>
        )
      ) : (
        // 暂无数据
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-16"
        >
          <div className="space-y-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, type: "spring" }}
              className="mx-auto w-16 h-16 rounded-full bg-secondary/50 dark:bg-secondary/70 flex items-center justify-center shadow-sm"
            >
              <Database className="w-7 h-7 text-muted-foreground/60" />
            </motion.div>
            <p className="text-lg font-semibold text-foreground/80">暂无数据</p>
            <p className="text-sm text-muted-foreground/70">请稍后重试或检查网络连接</p>
          </div>
        </motion.div>
      )}
      </div>
    </div>
  )
}
