import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle, X, Bot } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchLatestAIAnalysisGroup } from '@/api/ai-analyses-api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useFeelWorkflow } from './feel-workflow-context'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  groupTitle?: string      // 分组标题（新闻标题）
  aiType?: AIMessageType   // AI 代理类型
  articleTitle?: string    // 文章标题（仅用于 article 类型）
  articleSource?: string   // 文章来源（仅用于 article 类型）
  additionalInfo?: string  // 附加信息
  isToolCall?: boolean     // 是否是工具调用
  toolName?: string        // 工具名称
  isExpanded?: boolean     // 是否展开显示完整内容
  isLoading?: boolean      // 是否是加载状态提示
  nextAgentName?: string   // 下一个要处理的AI代理名称
}

/**
 * AI 消息类型
 */
type AIMessageType = 'article' | 'news_analyst' | 'stock_picker' | 'trading_executor' | 'tool_call'

interface AIMessageMeta {
  type: AIMessageType
  agentName: string
  avatarPath: string       // 头像图片路径
  color: string
  bgColor: string
  borderColor: string
  alignRight: boolean      // 是否右对齐
}

/**
 * 获取 AI 代理的元信息
 */
function getAIAgentMeta(type: AIMessageType): AIMessageMeta {
  switch (type) {
    case 'article':
      return {
        type,
        agentName: '新闻采集',
        avatarPath: '/monkey/Spider.png',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-muted',
        borderColor: 'border-l-blue-500',
        alignRight: false,
      }
    case 'news_analyst':
      return {
        type,
        agentName: '新闻分析',
        avatarPath: '/monkey/Analyze.png',
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-muted',
        borderColor: 'border-l-purple-500',
        alignRight: false,
      }
    case 'stock_picker':
      return {
        type,
        agentName: '选股分析',
        avatarPath: '/monkey/Choose.png',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-muted',
        borderColor: 'border-l-green-500',
        alignRight: false,
      }
    case 'trading_executor':
      return {
        type,
        agentName: '交易决策',
        avatarPath: '/monkey/Decision.png',
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-primary',
        borderColor: 'border-l-orange-500',
        alignRight: true,
      }
    case 'tool_call':
      return {
        type,
        agentName: '工具调用',
        avatarPath: '/monkey/Database.png',
        color: 'text-cyan-600 dark:text-cyan-400',
        bgColor: 'bg-muted/50',
        borderColor: 'border-l-cyan-500',
        alignRight: false,
      }
  }
}

/**
 * 获取 AI 消息类型对应的节点 ID
 */
function getNodeIdFromAIType(type: AIMessageType): string | null {
  switch (type) {
    case 'article':
      return 'news-trigger'
    case 'news_analyst':
      return 'news-analyzer'
    case 'stock_picker':
      return 'stock-selector-ai'
    case 'trading_executor':
      return 'decision-ai'
    default:
      return null
  }
}

/**
 * 猴园儿工作流进度展示面板
 * 悬浮在右下角的进度展示界面 - shadcn 风格
 * 实时显示 AI 工作流的各个阶段进度
 */
export function FeelWorkflowChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const { focusNode, updateWorkflowStatus } = useFeelWorkflow()

  // 处理消息气泡点击 - 聚焦到对应节点
  const handleMessageClick = (aiType?: AIMessageType) => {
    if (!aiType) return
    const nodeId = getNodeIdFromAIType(aiType)
    if (nodeId) {
      focusNode(nodeId)
    }
  }

  // 切换消息展开/折叠状态
  const toggleMessageExpand = (messageId: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  // 自动滚动到底部 - 使用 instant 模式避免空白问题
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant' })
    })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 监听滚动，实时聚焦可见的节点（带节流，降低频率）
  useEffect(() => {
    if (!isOpen) return

    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (!scrollContainer) return

    let timeoutId: NodeJS.Timeout | null = null

    const handleScroll = () => {
      // 节流：500ms 才执行一次聚焦
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        const containerRect = scrollContainer.getBoundingClientRect()
        const centerY = containerRect.top + containerRect.height / 2

        // 找到最靠近中心的消息
        let closestAiType: AIMessageType | null = null
        let closestDistance = Infinity

        messageRefs.current.forEach((element, messageId) => {
          const rect = element.getBoundingClientRect()
          const messageCenter = rect.top + rect.height / 2
          const distance = Math.abs(messageCenter - centerY)

          if (rect.top < containerRect.bottom && rect.bottom > containerRect.top) {
            if (distance < closestDistance) {
              const message = messages.find(m => m.id === messageId)
              if (message?.aiType) {
                closestAiType = message.aiType
                closestDistance = distance
              }
            }
          }
        })

        // 聚焦最近的节点
        if (closestAiType) {
          const nodeId = getNodeIdFromAIType(closestAiType)
          if (nodeId) {
            focusNode(nodeId)
          }
        }
      }, 500)
    }

    scrollContainer.addEventListener('scroll', handleScroll)
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [isOpen, messages, focusNode])

  // 加载 AI 分析数据
  useEffect(() => {
    if (isOpen && !hasLoadedOnce) {
      setHasLoadedOnce(true)
      loadAIAnalyses()
    }
  }, [isOpen, hasLoadedOnce])

  const loadAIAnalyses = async () => {
    setIsLoading(true)
    try {
      const group = await fetchLatestAIAnalysisGroup()
      
      if (group) {
        // 更新工作流状态
        updateWorkflowStatus(group)
        
        const groupTitle = group.title
        
        // 收集该组的所有消息（按时间顺序）
        const groupMessages: Message[] = []
        
        // 按时间排序所有记录
        const sortedRecords = [...group.records].sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        
        // 分析工作流进度 - 判断下一步应该是什么
        // 工作流顺序：触发器 -> 新闻选股(需要工具) -> 决策AI(需要工具，可能多次)
        const completedAI = sortedRecords.filter(r => r.type === 'AI')
        const lastRecord = sortedRecords[sortedRecords.length - 1]
        
        let currentStep: string | null = null
        
        // 判断逻辑：
        // 1. 如果最后一条是工具调用，说明正在等待对应的AI响应（工具后必然有AI）
        if (lastRecord?.type === '工具') {
          // 根据工具类型判断即将执行的AI
          if (lastRecord.category === '关键字选股查询') {
            currentStep = '新闻选股'
          } else if (['买入工具', '查询持仓', '卖出工具'].includes(lastRecord.category)) {
            currentStep = '交易决策'
          }
        }
        // 2. 如果最后一条是新闻选股AI，检查是否需要生成决策
        else if (lastRecord?.type === 'AI' && lastRecord.category === '新闻选股') {
          // 从选股结果中提取推荐股票数量
          let recommendedStockCount = 0
          try {
            if (lastRecord.additional_info && lastRecord.additional_info.startsWith('[')) {
              const stockList = JSON.parse(lastRecord.additional_info)
              recommendedStockCount = Array.isArray(stockList) ? stockList.length : 0
            }
          } catch (e) {
            // 如果解析失败，尝试从文本中匹配
            const matches = lastRecord.record_content.match(/股票\s*\d+：/g)
            recommendedStockCount = matches ? matches.length : 1
          }
          
          // 统计已生成的决策数量
          const decisionCount = completedAI.filter(r => r.category === '决策AI').length
          
          // 如果决策数量少于推荐股票数量，说明还需要继续生成决策
          if (decisionCount < recommendedStockCount) {
            // 检查是否有决策相关的工具调用
            const hasDecisionTools = sortedRecords.some(r => 
              r.type === '工具' && ['买入工具', '查询持仓', '卖出工具'].includes(r.category)
            )
            if (hasDecisionTools) {
              currentStep = '交易决策'
            }
          }
        }
        // 3. 如果最后一条是交易决策AI，检查是否还有更多股票需要决策
        else if (lastRecord?.type === 'AI' && lastRecord.category === '决策AI') {
          // 找到选股AI的结果
          const stockPickerAI = completedAI.find(r => r.category === '新闻选股')
          if (stockPickerAI) {
            let recommendedStockCount = 0
            try {
              if (stockPickerAI.additional_info && stockPickerAI.additional_info.startsWith('[')) {
                const stockList = JSON.parse(stockPickerAI.additional_info)
                recommendedStockCount = Array.isArray(stockList) ? stockList.length : 0
              }
            } catch (e) {
              const matches = stockPickerAI.record_content.match(/股票\s*\d+：/g)
              recommendedStockCount = matches ? matches.length : 1
            }
            
            const decisionCount = completedAI.filter(r => r.category === '决策AI').length
            
            // 如果还有股票未决策，且最后有工具调用，继续等待决策
            if (decisionCount < recommendedStockCount) {
              const lastTools = sortedRecords.filter(r => r.type === '工具')
              if (lastTools.length > 0) {
                currentStep = '交易决策'
              }
            }
          }
        }
        
        // 遍历所有记录，创建对应的消息
        sortedRecords.forEach((record) => {
          // 根据 type 判断记录类型
          if (record.type === '触发器') {
            // 新闻触发器
            groupMessages.push({
              id: `trigger-${record.id}`,
              text: record.record_content || record.title,
              sender: 'ai' as const,
              timestamp: new Date(record.created_at),
              groupTitle,
              aiType: 'article',
              articleTitle: record.title,
              articleSource: record.category,
              additionalInfo: record.additional_info,
            })
          } else if (record.type === '工具') {
            // 工具调用 - 显示简要信息
            // 从 additional_info 提取关键信息（如果是JSON格式）
            let briefInfo = ''
            try {
              // 过滤掉 undefined, null, 空字符串
              if (
                record.additional_info && 
                record.additional_info !== 'undefined' && 
                record.additional_info.trim() !== ''
              ) {
                if (record.additional_info.startsWith('{')) {
                  const info = JSON.parse(record.additional_info)
                  // 提取股票代码/名称作为简要信息
                  if (info.StockCode || info.StockName) {
                    briefInfo = `${info.StockCode || ''} ${info.StockName || ''}`.trim()
                  } else if (info.Quantity) {
                    briefInfo = `数量: ${info.Quantity}`
                  }
                } else {
                  // 如果不是JSON，截取前20个字符
                  briefInfo = record.additional_info.substring(0, 20)
                  if (record.additional_info.length > 20) {
                    briefInfo += '...'
                  }
                }
              }
            } catch (e) {
              // JSON解析失败，忽略
              console.debug('解析工具信息失败:', e)
            }
            
            groupMessages.push({
              id: `tool-call-${record.id}`,
              text: briefInfo, // 可能为空字符串
              sender: 'ai' as const,
              timestamp: new Date(record.created_at),
              groupTitle,
              aiType: 'tool_call',
              isToolCall: true,
              toolName: record.category, // "买入工具", "查询持仓" 等
            })
          } else if (record.type === 'AI') {
            // AI 输出
            let aiType: AIMessageType = 'news_analyst'
            
            // 根据 category 确定 AI 类型
            if (record.category === '新闻选股') {
              aiType = 'stock_picker'
            } else if (record.category === '决策AI') {
              aiType = 'trading_executor'
              // 交易决策消息 - 按 ;;;; 切分为多个气泡
              const tradingParts = record.record_content.split(';;;;').filter(part => part.trim())
              if (tradingParts.length > 1) {
                tradingParts.forEach((part, idx) => {
                  groupMessages.push({
                    id: `trading-executor-${record.id}-${idx}`,
                    text: part.trim(),
                    sender: 'ai' as const,
                    timestamp: new Date(new Date(record.created_at).getTime() + idx * 500),
                    groupTitle,
                    aiType: 'trading_executor',
                  })
                })
                return // 跳过下面的 push
              }
            } else {
              // 其他 AI 类型
              aiType = 'news_analyst'
            }
            
            groupMessages.push({
              id: `ai-${record.id}`,
              text: record.record_content,
              sender: 'ai' as const,
              timestamp: new Date(record.created_at),
              groupTitle,
              aiType,
              additionalInfo: record.additional_info,
            })
          }
        })
        
        // 如果推断出当前正在执行的步骤，添加加载提示
        if (currentStep && sortedRecords.length > 0) {
          const lastRecord = sortedRecords[sortedRecords.length - 1]
          groupMessages.push({
            id: `loading-current-step`,
            text: `正在调用 ${currentStep} AI...`,
            sender: 'ai' as const,
            timestamp: new Date(new Date(lastRecord.created_at).getTime() + 200),
            groupTitle,
            isLoading: true,
            nextAgentName: currentStep,
          })
        }
        
        // 逐个添加消息，带动画延迟
        for (const msg of groupMessages) {
          await addMessageWithDelay(msg, 800)
        }
      } else {
        // 如果没有数据，添加提示消息
        setMessages(prev => [...prev, {
          id: 'no-data',
          text: '暂时没有 AI 分析数据',
          sender: 'ai',
          timestamp: new Date(),
        }])
      }
    } catch (error) {
      console.error('加载 AI 分析数据失败:', error)
      setMessages(prev => [...prev, {
        id: 'error',
        text: '加载 AI 分析数据失败，请稍后重试',
        sender: 'ai',
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  // 辅助函数：延迟添加消息
  const addMessageWithDelay = (message: Message, delay: number): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(() => {
        setMessages(prev => [...prev, message])
        resolve()
      }, delay)
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* 聊天窗口 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="w-[500px] max-w-[90vw] h-[700px] max-h-[80vh] bg-card/95 backdrop-blur-sm border rounded-lg shadow-lg flex flex-col overflow-hidden"
            initial={{ 
              opacity: 0,
              scale: 0.8,
              y: 50,
              rotateX: -15
            }}
            animate={{ 
              opacity: 1,
              scale: 1,
              y: 0,
              rotateX: 0
            }}
            exit={{ 
              opacity: 0,
              scale: 0.8,
              y: 50,
              transition: { duration: 0.2 }
            }}
            transition={{ 
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1]
            }}
          >
          {/* 头部 */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI 工作流进度</h3>
                <p className="text-xs text-muted-foreground">
                  实时展示
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* 进度展示列表 */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {messages.map((message) => {
                  const meta = message.aiType ? getAIAgentMeta(message.aiType) : null
                  const isUser = message.sender === 'user'
                  const alignRight = isUser || (meta?.alignRight ?? false)
                  const isExpanded = expandedMessages.has(message.id)
                  
                  // 如果是加载状态，显示特殊的加载指示器
                  if (message.isLoading) {
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 py-2 px-3 my-1 max-w-full"
                      >
                        <div className="flex gap-1 flex-shrink-0">
                          <motion.div
                            className="w-1.5 h-1.5 rounded-full bg-primary"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0, ease: "easeInOut" }}
                          />
                          <motion.div
                            className="w-1.5 h-1.5 rounded-full bg-primary"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2, ease: "easeInOut" }}
                          />
                          <motion.div
                            className="w-1.5 h-1.5 rounded-full bg-primary"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4, ease: "easeInOut" }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground italic truncate overflow-hidden">
                          {message.text}
                        </span>
                      </motion.div>
                    )
                  }
                  
                  // 如果是工具调用，显示 shadcn 风格的简洁徽章
                  if (message.isToolCall) {
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="flex justify-center my-1.5"
                      >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/50 border border-border/50 shadow-sm max-w-full overflow-hidden">
                          <div className="w-1 h-1 rounded-full bg-muted-foreground/60 flex-shrink-0 animate-pulse" />
                          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                            <span className="text-[10px] font-medium text-muted-foreground flex-shrink-0">
                              {message.toolName || '工具'}
                            </span>
                            {message.text && message.text.trim() !== '' && (
                              <>
                                <span className="text-[10px] text-muted-foreground/50 flex-shrink-0">·</span>
                                <span className="text-[10px] text-muted-foreground/70 font-mono max-w-[120px] truncate overflow-hidden">
                                  {message.text}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  }
                  
                  return (
                    <div 
                      key={message.id}
                      ref={(el) => {
                        if (el && message.aiType) {
                          messageRefs.current.set(message.id, el)
                        } else {
                          messageRefs.current.delete(message.id)
                        }
                      }}
                    >
                      {/* 进度气泡 */}
                      <motion.div
                        initial={{ 
                          opacity: 0, 
                          y: 10,
                        }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                        }}
                        exit={{ 
                          opacity: 0,
                          y: -10,
                          transition: { duration: 0.15 }
                        }}
                        transition={{ 
                          duration: 0.3,
                          ease: "easeOut"
                        }}
                        className={cn(
                          'flex gap-2 w-full mb-1.5',
                          alignRight ? 'flex-row-reverse' : 'flex-row'
                        )}
                      >
                        {/* 头像 */}
                        {meta ? (
                          <img 
                            src={meta.avatarPath} 
                            alt={meta.agentName}
                            className="w-7 h-7 shrink-0 rounded-md object-cover"
                          />
                        ) : (
                          <div 
                            className="w-7 h-7 shrink-0 rounded-md flex items-center justify-center bg-muted"
                          >
                            <Bot className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                        )}

                        {/* 内容容器 */}
                        <div 
                          className={cn(
                            'flex flex-col flex-1 min-w-0',
                            alignRight ? 'items-end' : 'items-start'
                          )}
                        >
                          {/* AI 代理名称标签 */}
                          {meta && (
                            <div 
                              className={cn(
                                'text-[11px] mb-0.5 font-medium',
                                meta.color
                              )}
                            >
                              {meta.agentName}
                            </div>
                          )}
                          
                          {/* 进度内容气泡 */}
                          <motion.div 
                            className={cn(
                              'group relative rounded-lg px-3 py-2 max-w-[85%] shadow-sm overflow-hidden transition-transform will-change-transform',
                              message.aiType && 'cursor-pointer hover:scale-[1.01]',
                              meta?.alignRight
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ 
                              duration: 0.3,
                              ease: "easeOut",
                            }}
                            onClick={() => handleMessageClick(message.aiType)}
                          >
                            {message.aiType === 'article' ? (
                              // 新闻采集 - 不使用 ReactMarkdown
                              <div className="space-y-0.5">
                                <h4 className="font-medium text-sm leading-tight break-words line-clamp-2">
                                  {message.articleTitle}
                                </h4>
                                {message.articleSource && (
                                  <p className="text-xs opacity-50 break-words line-clamp-1">
                                    {message.articleSource}
                                  </p>
                                )}
                              </div>
                            ) : (
                              // 其他阶段 - 使用 ReactMarkdown，带展开/折叠
                              <div className="overflow-hidden w-full">
                                <motion.div 
                                  className={cn(
                                    'text-sm leading-relaxed break-words overflow-hidden overflow-wrap-anywhere'
                                  )}
                                  style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                                  animate={{ 
                                    height: isExpanded ? 'auto' : '4.5em',
                                  }}
                                  initial={{ height: '4.5em' }}
                                  transition={{ 
                                    duration: 0.2,
                                    ease: "easeOut"
                                  }}
                                >
                                  <div className="markdown-content overflow-x-auto max-w-full">
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      components={{
                                        p: ({ children }) => <p className="my-0.5 first:mt-0 last:mb-0 break-words overflow-wrap-anywhere">{children}</p>,
                                        strong: ({ children }) => <strong className="font-semibold break-words">{children}</strong>,
                                        em: ({ children }) => <em className="italic break-words">{children}</em>,
                                        code: ({ children }) => (
                                          <code className={cn(
                                            'px-1 py-0.5 rounded text-xs font-mono break-all',
                                            meta?.alignRight 
                                              ? 'bg-primary-foreground/20' 
                                              : 'bg-background/60'
                                          )}>
                                            {children}
                                          </code>
                                        ),
                                        ul: ({ children }) => <ul className="list-disc list-inside my-0.5 space-y-0.5 break-words">{children}</ul>,
                                        ol: ({ children }) => <ol className="list-decimal list-inside my-0.5 space-y-0.5 break-words">{children}</ol>,
                                        li: ({ children }) => <li className="break-words overflow-wrap-anywhere text-sm">{children}</li>,
                                        a: ({ children, href }) => (
                                          <a 
                                            href={href} 
                                            className="underline break-all hover:opacity-70 transition-opacity" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                          >
                                            {children}
                                          </a>
                                        ),
                                        table: ({ children }) => (
                                          <div className="overflow-x-auto my-2 max-w-full">
                                            <table className="min-w-full text-xs border-collapse">
                                              {children}
                                            </table>
                                          </div>
                                        ),
                                        thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
                                        tbody: ({ children }) => <tbody>{children}</tbody>,
                                        tr: ({ children }) => <tr className="border-b border-border/50">{children}</tr>,
                                        th: ({ children }) => (
                                          <th className="px-2 py-1 text-left font-semibold border-r border-border/30 last:border-r-0 whitespace-nowrap">
                                            {children}
                                          </th>
                                        ),
                                        td: ({ children }) => (
                                          <td className="px-2 py-1 border-r border-border/30 last:border-r-0 break-words max-w-[150px]">
                                            {children}
                                          </td>
                                        ),
                                      }}
                                    >
                                      {message.text}
                                    </ReactMarkdown>
                                  </div>
                                </motion.div>
                                
                                {/* 展开/折叠按钮 */}
                                {message.text.length > 150 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleMessageExpand(message.id)
                                    }}
                                    className={cn(
                                      'mt-1 text-xs opacity-60 hover:opacity-100 transition-opacity',
                                      meta?.alignRight ? 'text-primary-foreground' : 'text-muted-foreground'
                                    )}
                                  >
                                    {isExpanded ? '收起 ▲' : '展开 ▼'}
                                  </button>
                                )}
                              </div>
                            )}
                          </motion.div>
                          
                          {/* 时间戳 */}
                          <span 
                            className="text-[10px] text-muted-foreground/50 mt-0.5 px-1"
                          >
                            {message.timestamp.toLocaleTimeString('zh-CN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  )
                })}
              </AnimatePresence>

              {/* 数据加载指示器 - 骨架屏 */}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ 
                    duration: 0.3,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  className="space-y-4"
                >
                  {/* 骨架屏消息 1 - 左对齐 */}
                  <div className="flex gap-2">
                    <Skeleton className="w-7 h-7 rounded-md flex-shrink-0" />
                    <div className="flex flex-col gap-1 flex-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-20 w-[75%] rounded-lg" />
                    </div>
                  </div>
                  
                  {/* 骨架屏消息 2 - 左对齐 */}
                  <div className="flex gap-2">
                    <Skeleton className="w-7 h-7 rounded-md flex-shrink-0" />
                    <div className="flex flex-col gap-1 flex-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-16 w-[80%] rounded-lg" />
                    </div>
                  </div>
                  
                  {/* 骨架屏消息 3 - 右对齐 */}
                  <div className="flex gap-2 flex-row-reverse">
                    <Skeleton className="w-7 h-7 rounded-md flex-shrink-0" />
                    <div className="flex flex-col gap-1 items-end flex-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-24 w-[70%] rounded-lg" />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 悬浮按钮 - 打开时隐藏 */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1
            }}
            exit={{ 
              scale: 0, 
              opacity: 0,
              transition: { duration: 0.2 }
            }}
            transition={{ 
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1]
            }}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.15 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="icon"
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 rounded-full shadow-lg"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

