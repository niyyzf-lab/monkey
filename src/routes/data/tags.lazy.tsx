import RustTagAPI, { SelectedTag, CategoryListResult, TagListResult, StockListResult } from '@/api/rust-tag-api'
import { fetchStockDetails } from '@/api/stock-details-api'
import { EmptyState } from '@/components/common/empty-state'
import { SkeletonCategory, SkeletonTag, SkeletonCard } from '@/components/common/skeleton-card'
import { TagsHeader, StockDetailCard } from '@/components/data_tags'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from '@/components/ui/pagination'
import { Tooltip } from '@/components/ui/tooltip'
import { TagFormatValidationResult, validateTagStructureFormat } from '@/lib/tag-validation'
import { cn } from '@/lib/utils'
import { TooltipProvider, TooltipTrigger, TooltipContent } from '@radix-ui/react-tooltip'
import { createLazyFileRoute } from '@tanstack/react-router'
import { Sparkles, AlertCircle, Tag, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react'
import { useState, useEffect, useCallback, useMemo } from 'react'

export const Route = createLazyFileRoute('/data/tags')({
  component: TagsPage,
})

function TagsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rustInitialized, setRustInitialized] = useState(false)
  
  // 搜索状态
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  
  // 选中的分类和标签
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<SelectedTag | null>(null)
  const [tagSwitchLoading, setTagSwitchLoading] = useState(false)
  
  // 分页状态
  const [tagsPage, setTagsPage] = useState(1)
  const [stocksPage, setStocksPage] = useState(1)
  const TAGS_PER_PAGE = 200
  const STOCKS_PER_PAGE = 8
  
  // Rust 后端数据状态
  const [categoryListResult, setCategoryListResult] = useState<CategoryListResult | null>(null)
  const [tagListResult, setTagListResult] = useState<TagListResult | null>(null)
  const [stockListResult, setStockListResult] = useState<StockListResult | null>(null)
  const [categoryLoading, setCategoryLoading] = useState(false)
  const [tagLoading, setTagLoading] = useState(false)
  const [stockLoading, setStockLoading] = useState(false)

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])
  
  // 优化搜索输入处理
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
  }, [])

  // 搜索条件改变时重置状态并重新加载数据
  useEffect(() => {
    if (!rustInitialized) return
    
    setSelectedCategory(null)
    setSelectedTag(null)
    setTagsPage(1)
    setStocksPage(1)
    setTagListResult(null)
    setStockListResult(null)
    
    // 重新加载分类数据
    loadCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, rustInitialized])

  // 选中分类改变时重置标签和股票数据
  useEffect(() => {
    if (!selectedCategory) {
      setTagListResult(null)
      setSelectedTag(null)
      setStockListResult(null)
      return
    }
    
    setSelectedTag(null)
    setTagsPage(1)
    setStocksPage(1)
    setStockListResult(null)
    
    // 加载该分类下的标签
    loadTagsByCategory()
  }, [selectedCategory])
  
  // 标签分页改变时重新加载标签数据
  useEffect(() => {
    if (!selectedCategory) return
    loadTagsByCategory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagsPage])

  // 选中标签改变时重置股票分页并加载股票数据
  useEffect(() => {
    if (!selectedTag) {
      setStockListResult(null)
      return
    }
    
    setStocksPage(1)
    loadStocksByTag()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTag])
  
  // 股票分页改变时重新加载股票数据
  useEffect(() => {
    if (!selectedTag) return
    loadStocksByTag()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stocksPage])

  // 加载分类数据
  const loadCategories = useCallback(async () => {
    if (!rustInitialized) return
    
    setCategoryLoading(true)
    try {
      const result = await RustTagAPI.getCategories(debouncedSearchQuery || undefined)
      setCategoryListResult(result)
    } catch (error) {
      console.error('Failed to load categories:', error)
      setError(error instanceof Error ? error.message : '加载分类失败')
    } finally {
      setCategoryLoading(false)
    }
  }, [rustInitialized, debouncedSearchQuery])

  // 加载指定分类下的标签
  const loadTagsByCategory = useCallback(async () => {
    if (!selectedCategory || !rustInitialized) return
    
    setTagLoading(true)
    try {
      const params = {
        search_query: debouncedSearchQuery || undefined,
        category_name: selectedCategory,
        tags_page: tagsPage,
        stocks_page: 1, // 固定为1，因为此时不需要股票数据
        tags_per_page: TAGS_PER_PAGE,
        stocks_per_page: STOCKS_PER_PAGE,
      }
      const result = await RustTagAPI.getTagsByCategory(params)
      setTagListResult(result)
    } catch (error) {
      console.error('Failed to load tags:', error)
      setError(error instanceof Error ? error.message : '加载标签失败')
    } finally {
      setTagLoading(false)
    }
  }, [selectedCategory, rustInitialized, debouncedSearchQuery, tagsPage])

  // 加载指定标签下的股票
  const loadStocksByTag = useCallback(async () => {
    if (!selectedTag || !rustInitialized) return
    
    setStockLoading(true)
    try {
      const params = {
        tags_page: tagsPage,
        stocks_page: stocksPage,
        tags_per_page: TAGS_PER_PAGE,
        stocks_per_page: STOCKS_PER_PAGE,
      }
      const result = await RustTagAPI.getStocksByTag(selectedTag, params)
      setStockListResult(result)
    } catch (error) {
      console.error('Failed to load stocks:', error)
      setError(error instanceof Error ? error.message : '加载股票失败')
    } finally {
      setStockLoading(false)
    }
  }, [selectedTag, rustInitialized, tagsPage, stocksPage])

  // 处理分类选择
  const handleCategorySelect = useCallback((categoryName: string | null) => {
    setSelectedCategory(categoryName)
    setSelectedTag(null)
    setTagsPage(1)
    setStocksPage(1)
  }, [])

  // 优化的标签点击处理 - 使用 Rust 后端获取标签详情
  const handleTagClick = useCallback(async (categoryName: string, tagName: string, tagDetail: string | undefined) => {
    setTagSwitchLoading(true)
    
    try {
      const tagDetails = await RustTagAPI.getTagDetails(categoryName, tagName, tagDetail)
      setSelectedTag(tagDetails)
      setStocksPage(1)
    } catch (error) {
      console.error('Failed to get tag details:', error)
      setError(error instanceof Error ? error.message : '获取标签详情失败')
    } finally {
      setTagSwitchLoading(false)
    }
  }, [])

  // 清除搜索和重置状态
  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setDebouncedSearchQuery('')
    setSelectedCategory(null)
    setSelectedTag(null)
    setCategoryListResult(null)
    setTagListResult(null)
    setStockListResult(null)
  }, [])

  // 处理股票标签更新
  const handleStockTagsUpdate = useCallback((stockCode: string, newTags: string) => {
    // 更新 stockListResult 中对应股票的 custom_tags
    setStockListResult(prev => {
      if (!prev) return prev
      
      return {
        ...prev,
        stocks: prev.stocks.map(stock => 
          stock.stock_code === stockCode 
            ? { ...stock, custom_tags: newTags }
            : stock
        )
      }
    })
    
    // 标签更新成功
  }, [])

  // 验证标签格式（直接使用函数，无需 useCallback）
  const validateTag = (categoryName: string, tagName: string, tagDetail?: string): TagFormatValidationResult => {
    return validateTagStructureFormat(categoryName, tagName, tagDetail)
  }

  // 计算当前页面标签的格式验证状态（用于显示错误提示）
  const tagValidationMap = useMemo(() => {
    if (!tagListResult || !selectedCategory) return new Map<string, TagFormatValidationResult>()
    
    const map = new Map<string, TagFormatValidationResult>()
    tagListResult.tags.forEach(tag => {
      const key = `${tag.name}:${tag.detail || ''}`
      const validation = validateTag(selectedCategory, tag.name, tag.detail)
      map.set(key, validation)
    })
    
    return map
  }, [tagListResult, selectedCategory])

  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 1. 从现有 API 获取股票数据
        const response = await fetchStockDetails()
        
        // 2. 将数据传输到 Rust 后端
        await RustTagAPI.setStockData(response)
        
        // 3. 标记 Rust 后端已初始化
        setRustInitialized(true)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : '初始化数据失败')
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [])
  
  // Rust 初始化完成后加载分类数据
  useEffect(() => {
    if (rustInitialized) {
      loadCategories()
    }
  }, [rustInitialized, loadCategories])


  // 加载状态的骨架屏
  if (loading) {
    return (
      <div className="h-screen-safe flex flex-col bg-background">
        {/* 头部骨架 */}
        <div className="border-b bg-background/95 backdrop-blur">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between gap-6 mb-3">
              <div className="space-y-2">
                <div className="h-8 w-48 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/10 rounded-lg animate-pulse" />
                <div className="h-4 w-64 bg-muted-foreground/10 rounded animate-pulse" />
              </div>
              <div className="h-10 w-80 bg-muted-foreground/10 rounded-lg animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-6 w-20 bg-muted-foreground/10 rounded animate-pulse" />
              ))}
            </div>
          </div>
          {/* 分类栏骨架 */}
          <div className="px-6 py-2 border-t bg-muted/20">
            <div className="flex items-center gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCategory key={i} delay={i * 50} />
              ))}
            </div>
          </div>
        </div>

        {/* 内容区域骨架 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左侧标签列表骨架 */}
          <div className="w-80 border-r bg-muted/30">
            <div className="p-4 border-b bg-background/50">
              <div className="h-5 w-24 bg-muted-foreground/20 rounded animate-pulse mb-2" />
              <div className="h-3 w-32 bg-muted-foreground/10 rounded animate-pulse" />
            </div>
            <div className="p-3 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonTag key={i} delay={i * 50} />
              ))}
            </div>
          </div>
          
          {/* 右侧内容骨架 */}
          <div className="flex-1 bg-background p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="relative mx-auto w-16 h-16">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 animate-ping" />
                    <div className="relative rounded-full bg-gradient-to-r from-primary/40 to-primary/20 w-16 h-16 flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 w-40 bg-muted-foreground/20 rounded mx-auto animate-pulse" />
                    <div className="h-4 w-56 bg-muted-foreground/10 rounded mx-auto animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className="h-screen-safe flex flex-col">
        <TagsHeader
          searchQuery=""
          onSearchChange={() => {}}
          onSearchClear={() => {}}
          filteredCategoriesCount={0}
          totalTagsCount={0}
          currentPage={1}
          totalPages={1}
        />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {error}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen-safe flex flex-col bg-background">
      {/* 顶部导航栏 - 包含搜索和分类选择 */}
      <TagsHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchClear={clearSearch}
        filteredCategoriesCount={categoryListResult?.categories.length || 0}
        totalTagsCount={categoryListResult?.statistics.total_tags || 0}
        currentPage={1}
        totalPages={1}
        tagStatistics={{
          totalTags: categoryListResult?.statistics.total_tags || 0,
          currentPageTags: tagListResult?.tags.length || 0,
          errorTagsCount: 0,
          warningTagsCount: 0,
          validTagsCount: 0
        }}
        categories={categoryListResult?.categories || []}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        categoriesLoading={categoryLoading}
      />

      {/* 主要内容区域 - Grid 布局 */}
      <div className="flex-1 grid overflow-hidden" style={{
        gridTemplateColumns: selectedCategory ? '320px 1fr' : '0fr 1fr',
        transition: 'grid-template-columns 300ms'
      }}>
        {/* 左侧标签列表 */}
        <div className={cn(
          "border-r bg-muted/30 flex flex-col overflow-hidden",
          !selectedCategory && "border-0"
        )}>
          {selectedCategory && (
            <>
              {/* 标签列表标题 */}
              <div className="px-4 py-3 border-b bg-background/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      {selectedCategory}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tagLoading ? '加载中...' : `${tagListResult?.total_tags || 0} 个标签`}
                    </p>
                  </div>
                  {/* 格式验证统计 - 显示整个分类下的统计 */}
                  {!tagLoading && tagListResult && tagListResult.total_tags > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span>{tagListResult.valid_tags_count}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>格式正确的标签</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {tagListResult.error_tags_count > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 text-destructive">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                <span>{tagListResult.error_tags_count}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>格式错误的标签</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* 标签列表内容 */}
              <div className="flex-1 overflow-y-auto p-3">
                <div className="space-y-2">
                  {tagLoading ? (
                    // 加载骨架
                    Array.from({ length: 6 }).map((_, i) => (
                      <SkeletonTag key={i} delay={i * 50} />
                    ))
                  ) : tagListResult?.tags.length ? (
                    tagListResult.tags.map((tag, index) => {
                      const tagKey = `${tag.name}:${tag.detail || ''}`
                      const validation = tagValidationMap.get(tagKey)
                      const hasFormatError = validation && !validation.isValid
                      
                      return (
                        <TooltipProvider key={tagKey}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleTagClick(selectedCategory, tag.name, tag.detail)}
                                className={cn(
                                  "w-full text-left p-3 rounded-lg border transition-all duration-200",
                                  "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
                                  selectedTag?.tag_name === tag.name && selectedTag?.tag_detail === tag.detail
                                    ? "bg-primary/10 border-primary/50 shadow-sm"
                                    : hasFormatError
                                    ? "bg-destructive/5 border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50"
                                    : "bg-card hover:bg-accent hover:border-accent-foreground/20"
                                )}
                                style={{ animationDelay: `${index * 30}ms` }}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate flex items-center gap-2">
                                      {hasFormatError ? (
                                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                                      ) : (
                                        <Tag className="h-3.5 w-3.5 shrink-0 text-primary" />
                                      )}
                                      <span className={hasFormatError ? "text-destructive" : ""}>
                                        {tag.name}
                                      </span>
                                    </div>
                                    {tag.detail && (
                                      <div className={cn(
                                        "text-xs mt-1 truncate",
                                        hasFormatError ? "text-destructive/70" : "text-muted-foreground"
                                      )}>
                                        {tag.detail}
                                      </div>
                                    )}
                                  </div>
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "text-xs shrink-0",
                                      selectedTag?.tag_name === tag.name && selectedTag?.tag_detail === tag.detail
                                        ? "bg-primary/20 border-primary/50"
                                        : hasFormatError
                                        ? "bg-destructive/10 border-destructive/50 text-destructive"
                                        : ""
                                    )}
                                  >
                                    {tag.count}
                                  </Badge>
                                </div>
                              </button>
                            </TooltipTrigger>
                            {hasFormatError && validation && (
                              <TooltipContent className="max-w-xs">
                                <div className="space-y-1">
                                  <p className="font-semibold text-xs">格式错误：</p>
                                  <ul className="text-xs space-y-0.5">
                                    {validation.errors.map((error, i) => (
                                      <li key={i} className="text-destructive">• {error}</li>
                                    ))}
                                  </ul>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    正确格式: 分类:内容{'{补充}'}
                                  </p>
                                </div>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      )
                    })
                  ) : (
                    <EmptyState
                      icon={Tag}
                      title="没有找到标签"
                      description={debouncedSearchQuery ? '尝试修改搜索条件' : '该分类下暂无标签'}
                      className="py-12"
                    />
                  )}
                </div>
              </div>
              
              {/* 分页控件 */}
              {tagListResult && tagListResult.total_pages > 1 && (
                <div className="p-3 border-t bg-background/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      onClick={() => setTagsPage(prev => Math.max(1, prev - 1))}
                      disabled={tagsPage <= 1 || tagLoading}
                      className="px-3 py-1.5 rounded border transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一页
                    </button>
                    <div className="text-muted-foreground">
                      {tagsPage} / {tagListResult.total_pages}
                    </div>
                    <button
                      onClick={() => setTagsPage(prev => Math.min(tagListResult.total_pages, prev + 1))}
                      disabled={tagsPage >= tagListResult.total_pages || tagLoading}
                      className="px-3 py-1.5 rounded border transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 右侧股票详情 */}
        <div className="flex flex-col overflow-hidden bg-background">
          <div className="overflow-y-auto">
            <div className="max-w-7xl mx-auto px-6 py-6">
              {/* 未选择分类 */}
              {!selectedCategory && (
                <EmptyState
                  icon={Sparkles}
                  title="开始探索标签"
                  description="从顶部选择一个分类查看相关标签和股票"
                  className="h-full min-h-[500px]"
                />
              )}

              {/* 已选择分类但未选择标签 */}
              {selectedCategory && !selectedTag && !tagSwitchLoading && (
                <EmptyState
                  icon={Tag}
                  title="选择一个标签"
                  description="从左侧选择一个标签查看相关股票详情"
                  className="h-full min-h-[500px]"
                />
              )}

              {/* 标签切换加载状态 */}
              {tagSwitchLoading && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <SkeletonCard key={i} delay={i * 100} />
                    ))}
                  </div>
                </div>
              )}

              {/* 股票列表 */}
              {selectedTag && !tagSwitchLoading && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* 标签详情信息 */}
                  {selectedTag.tag_detail && (
                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {selectedTag.tag_detail}
                      </p>
                    </div>
                  )}

                  {/* 股票卡片网格 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        相关股票
                        <Badge variant="outline" className="ml-2">
                          {stockListResult?.total_stocks || selectedTag.stocks.length}
                        </Badge>
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                      {stockLoading ? (
                        // 加载骨架
                        Array.from({ length: 4 }).map((_, i) => (
                          <SkeletonCard key={i} delay={i * 100} />
                        ))
                      ) : (stockListResult?.stocks || selectedTag.stocks).length > 0 ? (
                        (stockListResult?.stocks || selectedTag.stocks).map((stock, index) => (
                          <div
                            key={stock.stock_code}
                            className="animate-in fade-in slide-in-from-bottom-2"
                            style={{ animationDelay: `${index * 50}ms`, animationDuration: '400ms' }}
                          >
                            <StockDetailCard 
                              stockInfo={stock} 
                              onTagsUpdate={handleStockTagsUpdate}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full">
                          <EmptyState
                            icon={AlertCircle}
                            title="没有股票数据"
                            description="该标签下暂无相关股票"
                            className="py-12"
                          />
                        </div>
                      )}
                    </div>

                    {/* 股票分页 */}
                    {stockListResult && stockListResult.total_pages > 1 && (
                      <div className="flex justify-center py-6">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                onClick={() => setStocksPage(prev => Math.max(1, prev - 1))}
                                className={stocksPage <= 1 || stockLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                size="default"
                              />
                            </PaginationItem>
                            
                            {(() => {
                              const totalPages = stockListResult.total_pages
                              const maxVisible = 5
                              const pages = Math.min(totalPages, maxVisible)
                              
                              return Array.from({ length: pages }, (_, i) => {
                                let pageNumber: number
                                
                                if (totalPages <= maxVisible) {
                                  pageNumber = i + 1
                                } else if (stocksPage <= 3) {
                                  pageNumber = i + 1
                                } else if (stocksPage >= totalPages - 2) {
                                  pageNumber = totalPages - 4 + i
                                } else {
                                  pageNumber = stocksPage - 2 + i
                                }
                                
                                return (
                                  <PaginationItem key={pageNumber}>
                                    <PaginationLink
                                      onClick={() => setStocksPage(pageNumber)}
                                      isActive={stocksPage === pageNumber}
                                      className={stockLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                      size="default"
                                    >
                                      {pageNumber}
                                    </PaginationLink>
                                  </PaginationItem>
                                )
                              })
                            })()}
                            
                            <PaginationItem>
                              <PaginationNext 
                                onClick={() => setStocksPage(prev => Math.min(stockListResult.total_pages, prev + 1))}
                                className={stocksPage >= stockListResult.total_pages || stockLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                size="default"
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}