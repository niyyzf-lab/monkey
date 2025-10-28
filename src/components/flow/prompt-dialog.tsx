import { memo, type ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { X, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export interface PromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  icon?: string
  label: string
  description?: string
  // 支持 prompt 文件路径
  promptFile?: string
  // 支持插槽 - 自定义右侧内容
  children?: ReactNode
}

/**
 * 提示词弹窗组件 - 手动实现
 * 左侧：巨大的图片悬浮在遮罩上
 * 右侧：内容卡片弹窗
 */
function PromptDialogComponent({
  open,
  onOpenChange,
  icon,
  label,
  description,
  promptFile,
  children,
}: PromptDialogProps) {
  const [promptContent, setPromptContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 加载 prompt 文件内容
  useEffect(() => {
    if (!open || !promptFile) {
      return
    }

    const loadPromptFile = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // 使用 fetch 从 public 目录或 src 目录加载文件
        // Vite 在开发模式下会自动处理 src 目录下的文件
        const filePath = promptFile.startsWith('/src') 
          ? promptFile.substring(4) // 移除 /src 前缀
          : promptFile
        
        const response = await fetch(filePath)
        
        if (!response.ok) {
          throw new Error(`无法加载文件 (${response.status}): ${response.statusText}`)
        }
        
        const content = await response.text()
        setPromptContent(content)
      } catch (err) {
        console.error('加载 prompt 文件失败:', err)
        setError(err instanceof Error ? err.message : '加载文件失败')
      } finally {
        setIsLoading(false)
      }
    }

    loadPromptFile()
  }, [open, promptFile])

  // 处理 ESC 键关闭
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }
    
    if (open) {
      document.addEventListener('keydown', handleEscape)
      // 禁止body滚动
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onOpenChange])
  
  // 使用 Portal 渲染到 body
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* 遮罩层 */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/80"
            onClick={() => onOpenChange(false)}
          />
          
          {/* 悬浮的巨大图片 - 在遮罩上方 */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, x: -100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -100 }}
            transition={{ 
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="fixed left-[15%] top-1/2 -translate-y-1/2 z-[51] pointer-events-none"
          >
            <div className="relative group/image">
              {/* 外层光晕 */}
              <motion.div 
                animate={{ 
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -inset-12 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/30 rounded-[3rem] blur-3xl"
              />
              
              {/* 图片主体 - 去掉背景色块 */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="relative w-96 h-96 rounded-[3rem] shadow-2xl"
              >
                {icon ? (
                  <img
                    src={icon}
                    alt={label}
                    className="w-full h-full object-contain p-10"
                    style={{
                      filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.3))',
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const parent = e.currentTarget.parentElement
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center text-9xl font-bold text-foreground/50">
                            ${label.substring(0, 2)}
                          </div>
                        `
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-9xl font-bold text-foreground/50">
                    {label.substring(0, 2)}
                  </div>
                )}
              </motion.div>
              
              {/* 底部标签 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full text-center"
              >
                <div className="inline-block px-5 py-2.5 rounded-full bg-background/90 backdrop-blur-md border-2 shadow-xl">
                  <p className="text-base font-semibold">{label}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
          
          {/* 右侧内容卡片 */}
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ 
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="fixed right-[10%] top-1/2 -translate-y-1/2 z-[52] w-[40%] max-w-2xl h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className={cn(
              "h-full flex flex-col overflow-hidden",
              "shadow-2xl border-2"
            )}>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">{label}</CardTitle>
                {description && (
                  <CardDescription className="text-base leading-relaxed mt-2">
                    {description}
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent className="flex-1 overflow-hidden pb-6">
                <ScrollArea className="h-full">
                  <div className="pr-4">
                    {children || (
                      <div className="space-y-4">
                        {isLoading ? (
                          <div className="flex flex-col items-center justify-center h-60 text-muted-foreground gap-3">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                              <FileText className="h-10 w-10 opacity-50" />
                            </motion.div>
                            <p>加载中...</p>
                          </div>
                        ) : error ? (
                          <div className="flex flex-col items-center justify-center h-60 text-destructive gap-3">
                            <div className="text-4xl opacity-50">⚠️</div>
                            <p>{error}</p>
                          </div>
                        ) : promptContent ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-muted/50 p-4 rounded-lg border">
                              {promptContent}
                            </pre>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-60 text-muted-foreground gap-3">
                            <div className="text-4xl opacity-20">📝</div>
                            <p>暂无内容</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
              
              {/* 关闭按钮 */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onOpenChange(false)}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">关闭</span>
              </motion.button>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

export const PromptDialog = memo(PromptDialogComponent)
PromptDialog.displayName = 'PromptDialog'

