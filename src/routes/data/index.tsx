import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { fetchStockDetails } from '@/api/stock-details-api'
import { StockInfoArray } from '@/types/stock_details'
import { Search, X, Database, ChevronDown, Tag } from 'lucide-react'
import { DataSearchHint } from '@/components/data'
import { DataMasonryContainer } from '@/components/data'
import { DataLoadingState, DataErrorState } from '@/components/data'
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

  // 搜索防抖效果 - 300ms延迟
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
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

  if (loading) {
    return <DataLoadingState />
  }

  if (error) {
    return <DataErrorState error={error} />
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
        <div className="px-6 py-3">
          {stockData && stockData.length > 0 ? (
            filteredData.length > 0 ? (
              <DataMasonryContainer 
                data={filteredData} 
                searchQuery={debouncedSearchQuery}
                scrollContainerRef={scrollContainerRef}
              />
            ) : (
              // 搜索无结果
              <div
                className="text-center py-16"
                style={{
                  opacity: 0,
                  animation: 'fadeIn 0.3s ease-out forwards'
                }}
              >
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-secondary/50 dark:bg-secondary/70 flex items-center justify-center shadow-sm">
                    <Search className="w-7 h-7 text-muted-foreground/60" />
                  </div>
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
              </div>
            )
          ) : (
            // 暂无数据
            <div
              className="text-center py-16"
              style={{
                opacity: 0,
                animation: 'fadeIn 0.3s ease-out forwards'
              }}
            >
              <div className="space-y-3">
                <div className="mx-auto w-16 h-16 rounded-full bg-secondary/50 dark:bg-secondary/70 flex items-center justify-center shadow-sm">
                  <Database className="w-7 h-7 text-muted-foreground/60" />
                </div>
                <p className="text-lg font-semibold text-foreground/80">暂无数据</p>
                <p className="text-sm text-muted-foreground/70">请稍后重试或检查网络连接</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
