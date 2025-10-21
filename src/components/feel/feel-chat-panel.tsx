import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MessageCircle, X, Minus, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatPanelProps {
  className?: string
}

// 示例历史消息
const EXAMPLE_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: '你好！我是猴子的 AI 助手。我可以帮你分析工作流、解答问题。',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5分钟前
  },
  {
    id: '2',
    role: 'user',
    content: '这个工作流是做什么的？',
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
  },
  {
    id: '3',
    role: 'assistant',
    content: '这是一个 AI 炒股工作流系统。它包含了数据采集、分析、决策等多个模块，可以帮助猴子自动化交易决策流程。',
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
  },
  {
    id: '4',
    role: 'user',
    content: '能详细介绍一下各个节点的功能吗？',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
  },
  {
    id: '5',
    role: 'assistant',
    content: '当然！主要节点包括：\n- Spider：数据爬虫，负责采集市场数据\n- Analyze：数据分析，处理和分析采集的数据\n- Decision：决策引擎，基于分析结果做出交易决策\n- Database：数据存储，保存历史数据和决策记录',
    timestamp: new Date(Date.now() - 1000 * 60 * 1),
  },
]

/**
 * 悬浮聊天面板组件
 * 右下角悬浮，支持拖拽、最小化、关闭
 */
export function ChatPanel({ className }: ChatPanelProps) {
  // 默认关闭状态
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [messages, setMessages] = useState<ChatMessage[]>(EXAMPLE_MESSAGES)
  const [inputValue, setInputValue] = useState('')
  
  const panelRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到最新消息 - 使用 requestAnimationFrame 避免 ResizeObserver 警告
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages])

  // 开始拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = panelRef.current?.getBoundingClientRect()
    if (!rect) return
    
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  // 拖拽中 - 无过渡动画
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      
      const panelWidth = panelRef.current?.offsetWidth || 0
      const panelHeight = panelRef.current?.offsetHeight || 0
      
      // 计算面板左上角位置
      const newLeft = e.clientX - dragOffset.x
      const newTop = e.clientY - dragOffset.y
      
      // 限制在视窗内
      const constrainedLeft = Math.max(0, Math.min(newLeft, window.innerWidth - panelWidth))
      const constrainedTop = Math.max(0, Math.min(newTop, window.innerHeight - panelHeight))
      
      // 转换为 right 和 bottom 的值
      const newRight = window.innerWidth - constrainedLeft - panelWidth
      const newBottom = window.innerHeight - constrainedTop - panelHeight
      
      setPosition({
        x: newRight,
        y: newBottom,
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  // 发送消息
  const handleSend = () => {
    if (!inputValue.trim()) return
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    }
    
    setMessages([...messages, newMessage])
    setInputValue('')
    
    // 模拟 AI 回复
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '这是一个示例回复。聊天功能正在开发中，敬请期待！',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMessage])
    }, 1000)
  }

  // 按 Enter 发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 如果未打开，显示悬浮按钮
  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "w-14 h-14 rounded-full",
          "bg-primary hover:bg-primary/90",
          "text-primary-foreground",
          "shadow-lg hover:shadow-xl",
          "transition-all duration-200",
          "flex items-center justify-center",
          className
        )}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>
    )
  }

  // 最小化状态 - 显示为小标题栏
  if (isMinimized) {
    return (
      <motion.div
        ref={panelRef}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          position: 'fixed',
          bottom: position.y || 24,
          right: position.x || 24,
          zIndex: 50,
        }}
        className="w-80"
      >
        <div
          className={cn(
            "bg-card border shadow-lg rounded-lg overflow-hidden",
            "cursor-move select-none"
          )}
          onMouseDown={handleMouseDown}
        >
          {/* 最小化标题栏 */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">与猴聊</span>
            </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => setIsMinimized(false)}
            >
              <MessageCircle className="w-3 h-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // 正常状态
  const width = '400px'
  const height = '600px'
  const finalPosition = { bottom: position.y || 24, right: position.x || 24 }

  return (
    <motion.div
      ref={panelRef}
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: 20 }}
      style={{
        position: 'fixed',
        ...finalPosition,
        width,
        height,
        zIndex: 50,
        // 拖拽时禁用过渡动画
        transition: isDragging ? 'none' : undefined,
      }}
      className={cn(
        "flex flex-col bg-card border shadow-2xl rounded-lg overflow-hidden",
        className
      )}
    >
      {/* 标题栏 */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/10 to-primary/5 border-b cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <span className="font-semibold">与猴聊</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => setIsMinimized(true)}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-muted-foreground py-12"
            >
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">开始与猴子对话吧</p>
            </motion.div>
          ) : (
            messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-[10px] mt-1 opacity-60">
                    {message.timestamp.toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="border-t p-3">
        <div className="flex gap-2 items-end">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息... (Enter 发送)"
            className={cn(
              "flex-1 resize-none rounded-md border bg-background px-3 py-2",
              "text-sm placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              "max-h-[80px]"
            )}
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            size="sm"
            className="h-9"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          AI 聊天功能开发中，当前为演示版本
        </p>
      </div>
    </motion.div>
  )
}

