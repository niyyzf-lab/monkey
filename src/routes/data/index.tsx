import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { fetchStockDetails } from '@/api/stock-details-api'
import { StockInfoArray } from '@/types/stock_details'
import { Search, X, Database, ChevronDown, Tag, Loader2, AlertCircle } from 'lucide-react'
import { DataSearchHint } from '@/components/data'
import { DataMasonryContainer } from '@/components/data'
import { LoadingState } from '@/components/common/loading-state'
import { EmptyState } from '@/components/common/empty-state'
import { useSearchParser } from '@/hooks/use-search-parser'
import { getSimplePinyin } from '@/lib/pinyin-utils'
import { UnifiedPageHeader } from '@/components/common/unified-page-header'
import { motion, AnimatePresence } from 'motion/react'

export const Route = createFileRoute('/data/')({
  component: DataPage,
  validateSearch: (search) => ({
    q: search.q as string | undefined,
  }),
})

function DataPage() {
  const navigate = useNavigate()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [stockData, setStockData] = useState<StockInfoArray | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // 导航下拉菜单状态
  const [showNavigationDropdown, setShowNavigationDropdown] = useState(false)
  
  // 搜索状态
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  
  // 分页状态
  const [displayCount, setDisplayCount] = useState(200)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const PAGE_SIZE = 200

  // 搜索防抖效果 - 300ms延迟
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      // 搜索变化时重置显示数量
      setDisplayCount(PAGE_SIZE)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // 可见性监听 - 优化性能
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
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

  // 过滤数据 - 优化性能，使用提前退出和缓存
  const filteredData = useMemo(() => {
    if (!stockData) return []
    
    // 无搜索条件时直接返回原数据
    const hasNoSearch = searchTerms.text.length === 0 && 
                        searchTerms.tags.length === 0 && 
                        searchTerms.letters.length === 0
    
    if (hasNoSearch) {
      return stockData
    }
    
    // 预处理搜索词（小写化）
    const lowerTextTerms = searchTerms.text.map(t => t.toLowerCase())
    const lowerTagTerms = searchTerms.tags.map(t => t.toLowerCase())
    const lowerLetterTerms = searchTerms.letters.map(t => t.toLowerCase())
    
    return stockData.filter((stock) => {
      // 文本搜索 - 提前退出优化
      if (lowerTextTerms.length > 0) {
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
        
        // 使用 every + 提前退出
        const textMatches = lowerTextTerms.every(term => searchFields.includes(term))
        if (!textMatches) return false
      }
      
      // 标签搜索 - 提前退出优化
      if (lowerTagTerms.length > 0) {
        const stockTags = [
          ...(stock.custom_tags ? stock.custom_tags.split(';').map(tag => tag.trim().toLowerCase()) : []),
          ...(stock.sectors_concepts ? stock.sectors_concepts.map(concept => concept.toLowerCase()) : [])
        ]
        
        const tagsMatch = lowerTagTerms.every(searchTag => 
          stockTags.some(stockTag => stockTag.includes(searchTag))
        )
        
        if (!tagsMatch) return false
      }
      
      // 简拼搜索 - 提前退出优化
      if (lowerLetterTerms.length > 0) {
        const stockNamePinyin = getSimplePinyin(stock.stock_name || '')
        const companyNamePinyin = getSimplePinyin(stock.company_name || '')
        
        const pinyinMatch = lowerLetterTerms.some(searchPinyin => 
          stockNamePinyin.includes(searchPinyin) || companyNamePinyin.includes(searchPinyin)
        )
        
        if (!pinyinMatch) return false
      }
      
      return true
    })
  }, [stockData, searchTerms.text, searchTerms.tags, searchTerms.letters])

  // 分页显示的数据
  const displayedData = useMemo(() => {
    return filteredData.slice(0, displayCount)
  }, [filteredData, displayCount])

  // 加载更多
  const loadMore = useCallback(() => {
    if (isLoadingMore) return
    
    setIsLoadingMore(true)
    
    // 保存当前滚动位置
    const currentScrollTop = scrollContainerRef.current?.scrollTop || 0
    
    // 使用 setTimeout 模拟平滑加载，让用户看到加载状态
    setTimeout(() => {
      setDisplayCount(prev => prev + PAGE_SIZE)
      setIsLoadingMore(false)
      
      // 在下一帧恢复滚动位置，避免跳动
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = currentScrollTop
        }
      })
    }, 100) // 短暂延迟以显示加载状态
  }, [isLoadingMore])

  // 是否还有更多数据
  const hasMore = displayCount < filteredData.length

  // 清除搜索
  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setDebouncedSearchQuery('')
    setDisplayCount(PAGE_SIZE)
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

  // 初始数据加载
  useEffect(() => {
    let mounted = true

    const loadStockData = async () => {
      try {
        if (!stockData || stockData.length === 0) {
          setLoading(true)
        }
        setError(null)
        
        if (stockData && stockData.length > 0 && isInitialized) {
          setLoading(false)
          return
        }
        
        const [data] = await Promise.all([
          fetchStockDetails(),
          new Promise(resolve => setTimeout(resolve, 300))
        ])
        
        if (!mounted) return
        
        setStockData(data)
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

  // 加载状态 - 使用通用组件
  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <UnifiedPageHeader
          title="猴の数据"
          subtitle="给猴子提供价值"
        />
        <LoadingState 
          title="正在加载数据" 
          description="初次加载可能需要几秒钟"
          className="min-h-[500px]"
        />
      </div>
    )
  }

  // 错误状态 - 使用通用空状态组件
  if (error) {
    return (
      <div className="h-full overflow-y-auto">
        <UnifiedPageHeader
          title="猴の数据"
          subtitle="给猴子提供价值"
        />
        <EmptyState
          icon={AlertCircle}
          title="加载失败"
          description={error}
          action={{
            label: "刷新页面",
            onClick: () => window.location.reload()
          }}
        />
      </div>
    )
  }

  const hasSearchTerms = searchTerms.text.length > 0 || searchTerms.tags.length > 0 || searchTerms.letters.length > 0
  const totalItems = stockData?.length || 0
  const filteredItems = filteredData.length

  return (
    <div className="@container h-screen-safe flex flex-col relative">
      {/* 顶部工具栏 - 统一标题栏（浮动） */}
      <UnifiedPageHeader
          title="猴の数据"
          subtitle="给猴子提供价值"
          tools={
            <div className="flex items-center gap-3 text-sm text-muted-foreground/70">
              {/* 统计信息 */}
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

              {/* 导航下拉菜单 */}
              <div className="relative" data-dropdown-container>
                <button
                  onClick={() => setShowNavigationDropdown(!showNavigationDropdown)}
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
                          onClick={() => handleNavigation('/data')}
                          className="w-full px-3 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground 
                                   transition-colors duration-150 flex items-center gap-2"
                        >
                          <Database className="w-3 h-3" />
                          <span>数据库</span>
                        </button>
                        <button
                          onClick={() => handleNavigation('/data/tags')}
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
            </div>
          }
          searchConfig={{
            value: searchQuery,
            onChange: setSearchQuery,
            onClear: clearSearch,
            placeholder: '搜索...',
          }}
        />
      
      {/* 搜索提示区域 */}
      {stockData && debouncedSearchQuery && (
        <DataSearchHint
          searchQuery={debouncedSearchQuery}
          searchTerms={searchTerms}
          totalItems={filteredItems}
        />
      )}
      
      {/* 主内容区域 - 使用原生滚动以支持 masonic 虚拟滚动 */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{
          // 优化滚动性能 - 不使用 smooth 以避免虚拟滚动冲突
          WebkitOverflowScrolling: 'touch',
          // GPU 加速
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      >
        <div className="pt-4 px-6 pb-3">
          {stockData && stockData.length > 0 ? (
            filteredData.length > 0 ? (
              <>
                <DataMasonryContainer 
                  data={displayedData} 
                  searchQuery={debouncedSearchQuery}
                  scrollContainerRef={scrollContainerRef}
                />
                
                {/* 加载更多按钮 */}
                {hasMore && (
                  <div className="flex justify-center py-8">
                    <button
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      className="group px-6 py-3 text-sm font-medium rounded-lg
                               bg-primary/10 hover:bg-primary/20 
                               text-primary hover:text-primary
                               border border-primary/30 hover:border-primary/50
                               transition-all duration-200
                               shadow-sm hover:shadow-md
                               flex items-center gap-2
                               disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary/10"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>加载中...</span>
                        </>
                      ) : (
                        <>
                          <span>加载更多</span>
                          <span className="text-xs opacity-70">
                            ({displayedData.length} / {filteredData.length})
                          </span>
                          <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                )}
                
                {/* 已全部加载提示 */}
                {!hasMore && filteredData.length > PAGE_SIZE && (
                  <div className="flex justify-center py-8">
                    <div className="text-sm text-muted-foreground/60 flex items-center gap-2">
                      <div className="h-px w-12 bg-border/40"></div>
                      <span>已显示全部 {filteredData.length} 条数据</span>
                      <div className="h-px w-12 bg-border/40"></div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // 搜索无结果 - 简约大气
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center py-16 px-6"
              >
                <div className="space-y-6 max-w-lg mx-auto">
                  {/* 图标 */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                    className="mx-auto relative"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center relative">
                      <Search className="w-9 h-9 text-muted-foreground/40" strokeWidth={1.5} />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full bg-primary/5"
                      />
                    </div>
                  </motion.div>

                  {/* 文字内容 */}
                  <div className="space-y-3">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-xl font-semibold text-foreground/90"
                    >
                      没有找到匹配的结果
                    </motion.p>
                    
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-sm text-muted-foreground/70 space-y-2"
                    >
                      <p className="font-medium text-foreground/70">当前搜索："{debouncedSearchQuery}"</p>
                      {(searchTerms.text.length > 0 || searchTerms.tags.length > 0 || searchTerms.letters.length > 0) && (
                        <div className="space-y-1">
                          {searchTerms.text.length > 0 && (
                            <p>关键词：{searchTerms.text.join(', ')}</p>
                          )}
                          {searchTerms.tags.length > 0 && (
                            <p>标签：{searchTerms.tags.map(tag => `@${tag}`).join(', ')}</p>
                          )}
                          {searchTerms.letters.length > 0 && (
                            <p>简拼：{searchTerms.letters.map(pinyin => `#${pinyin}`).join(', ')}</p>
                          )}
                        </div>
                      )}
                      <p className="pt-2 text-xs text-muted-foreground/60">
                        支持语法：@标签名 #简拼 普通关键词
                      </p>
                    </motion.div>
                  </div>

                  {/* 操作按钮 */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <button
                      onClick={clearSearch}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium 
                               text-primary hover:text-primary/80 transition-all duration-200
                               border border-border/50 rounded-lg 
                               hover:bg-accent hover:border-primary/40 shadow-sm hover:shadow-md"
                    >
                      <X className="w-4 h-4" />
                      清除搜索
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            )
          ) : (
            <EmptyState
              icon={Database}
              title="暂无数据"
              description="请稍后重试或检查网络连接"
            />
          )}
        </div>
      </div>
    </div>
  )
}
