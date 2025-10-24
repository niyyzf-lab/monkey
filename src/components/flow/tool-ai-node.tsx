import { memo, useState } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { PromptDialog } from './prompt-dialog'
import { Info } from 'lucide-react'

interface FunctionHandle {
  id: string
  label: string
  icon?: string
  embedded?: boolean // 是否嵌入显示，false 则作为独立节点连接
}

interface ToolAINodeData extends Record<string, unknown> {
  label: string
  description?: string
  functions?: FunctionHandle[]
  icon?: string
  prompt?: string // 提示词内容（已废弃，使用 promptFile 代替）
  promptFile?: string // 提示词文件路径
  workflowStatus?: 'idle' | 'active' | 'completed' // 工作流状态
}

type ToolAINodeType = Node<ToolAINodeData>

/**
 * 工具AI节点 - shadcn 卡片风格
 * 上方：图标（96px）
 * 下方：精简信息卡片（220px 宽，标题、描述、小圆形功能图标）
 * 选中效果：内部渐变光效 + 边框高亮 + 阴影增强
 * 连接点：顶部输入（图标顶部或卡片顶部）
 * 功能图标：小圆形设计（28px），左对齐，显示 emoji 图标，悬停时显示标签
 * 配置：functions 中 embedded=false 的工具将作为独立节点连接，不显示在卡片内
 */
function ToolAINodeComponent({ data, selected }: NodeProps<ToolAINodeType>) {
  const allFunctions = (data?.functions as FunctionHandle[] | undefined) || []
  const iconSrc = data?.icon as string | undefined
  const label = (data?.label as string) || ''
  const description = data?.description as string | undefined
  const prompt = data?.prompt as string | undefined
  const promptFile = data?.promptFile as string | undefined
  const workflowStatus = (data?.workflowStatus as 'idle' | 'active' | 'completed') || 'idle'
  const hasIcon = !!iconSrc
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // 根据状态确定样式
  const getStatusStyles = () => {
    switch (workflowStatus) {
      case 'active':
        return {
          borderColor: 'border-blue-500/60',
          glowColor: 'from-blue-500/20 to-blue-400/15',
          cardGlow: 'shadow-blue-500/30',
          iconFilter: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.5))',
          pulse: true,
        }
      case 'completed':
        return {
          borderColor: 'border-green-500/60',
          glowColor: 'from-green-500/20 to-green-400/15',
          cardGlow: 'shadow-green-500/30',
          iconFilter: 'drop-shadow(0 0 12px rgba(34, 197, 94, 0.5))',
          pulse: false,
        }
      default: // idle
        return {
          borderColor: 'border-border',
          glowColor: 'from-primary/15 to-accent/10',
          cardGlow: '',
          iconFilter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))',
          pulse: false,
        }
    }
  }
  
  const statusStyles = getStatusStyles()
  
  return (
    <>
    <PromptDialog
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
      icon={iconSrc}
      label={label}
      description={description}
      promptFile={promptFile}
    >
      {/* 提示词内容 - 仅在使用旧的 prompt 字段时显示 */}
      {!promptFile && prompt ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold mb-2">系统提示词</h3>
            <div className="bg-muted/50 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap">
              {prompt}
            </div>
          </div>
        </div>
      ) : !promptFile && !prompt ? (
        <div className="text-center text-muted-foreground py-8">
          暂无提示词内容
        </div>
      ) : null}
    </PromptDialog>
    <div className="relative group/node animate-in fade-in duration-500">
      {/* 主容器 - 垂直布局 */}
      <div className="relative flex flex-col items-center gap-2.5">
        {/* 上方：缩小的图标（如果有的话） */}
        {hasIcon && (
          <div 
            className={cn(
              "relative w-24 h-24 transition-all duration-500 ease-out cursor-pointer",
              "group-hover/node:scale-[1.03] group-hover/node:-translate-y-0.5",
              selected && "scale-105",
              statusStyles.pulse && "animate-pulse"
            )}
            onClick={(e) => {
              e.stopPropagation()
              setIsDialogOpen(true)
            }}
            title="点击查看详情"
          >
            {/* 顶部输入手柄定位父容器 - 在图标顶部 */}
            <div
              className="absolute z-10"
              style={{
                left: '50%',
                top: 0,
                transform: 'translateX(-50%)',
              }}
            >
              <Handle
                type="target"
                position={Position.Top}
                id="top"
                className={cn(
                  "!w-3 !h-3 !border-2 !rounded-full transition-all duration-300 ease-out",
                  "hover:!w-4 hover:!h-4 hover:!scale-125",
                  workflowStatus === 'active' 
                    ? "!bg-blue-500 !border-blue-600 !shadow-lg !shadow-blue-500/50" 
                    : workflowStatus === 'completed'
                    ? "!bg-green-500 !border-green-600 !shadow-lg !shadow-green-500/50"
                    : "!bg-muted !border-border hover:!bg-primary/20 hover:!border-primary/60",
                  selected && "!shadow-xl !scale-110"
                )}
              />
            </div>

            {/* 图标背景光晕 */}
            <div className={cn(
              "absolute inset-0 rounded-xl bg-gradient-radial transition-opacity duration-500",
              workflowStatus === 'active' ? 'from-blue-400/10 to-transparent opacity-100' :
              workflowStatus === 'completed' ? 'from-green-400/10 to-transparent opacity-100' :
              'from-primary/5 to-transparent opacity-0 group-hover/node:opacity-100'
            )} />
            
            {/* 状态指示器 - Active时的呼吸环 */}
            {workflowStatus === 'active' && (
              <div className="absolute inset-0 rounded-xl border-2 border-blue-500/40 animate-ping" />
            )}
            
            {/* Completed时的勾选标记 */}
            {workflowStatus === 'completed' && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg z-10">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            <img 
              src={iconSrc} 
              alt={label}
              className="relative w-full h-full object-cover rounded-full transition-all duration-500"
              style={{
                filter: selected 
                  ? 'drop-shadow(0 8px 24px rgba(0,0,0,0.35)) brightness(1.05)'
                  : statusStyles.iconFilter,
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const parent = e.currentTarget.parentElement
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center text-5xl font-bold text-foreground/60 bg-muted rounded-full border-2 border-border">
                      ${label.substring(0, 2)}
                    </div>
                  `
                }
              }}
            />
          </div>
        )}

        {/* 下方：精简信息卡片容器 */}
        <div className="relative">
          {!hasIcon && (
            /* 顶部输入手柄定位父容器 - 在卡片顶部 */
            <div
              className="absolute z-10"
              style={{
                left: '50%',
                top: 0,
                transform: 'translateX(-50%)',
              }}
            >
              <Handle
                type="target"
                position={Position.Top}
                id="top"
                className={cn(
                  "!w-3 !h-3 !border-2 !rounded-full transition-all duration-300 ease-out",
                  "hover:!w-4 hover:!h-4 hover:!scale-125",
                  workflowStatus === 'active' 
                    ? "!bg-blue-500 !border-blue-600 !shadow-lg !shadow-blue-500/50" 
                    : workflowStatus === 'completed'
                    ? "!bg-green-500 !border-green-600 !shadow-lg !shadow-green-500/50"
                    : "!bg-muted !border-border hover:!bg-primary/20 hover:!border-primary/60",
                  selected && "!shadow-xl !scale-110"
                )}
              />
            </div>
          )}

          {/* 卡片装饰层 */}
          <div className="relative group/card">
            {/* 外层细微光晕 - 根据状态显示 */}
            <div className={cn(
              "absolute -inset-[1px] rounded-xl transition-all duration-500 blur-sm pointer-events-none",
              `bg-gradient-to-br ${statusStyles.glowColor}`,
              workflowStatus !== 'idle' ? "opacity-80 blur-md" : "opacity-0 group-hover/card:opacity-60",
              selected && "opacity-80 blur-md"
            )} />
            
            <Card 
              className={cn(
                "min-w-[220px] transition-all duration-500 !gap-0 !py-3 relative overflow-hidden",
                "bg-gradient-to-b from-card to-card/95",
                "border shadow-sm backdrop-blur-sm",
                "group-hover/card:shadow-lg group-hover/card:border-foreground/10",
                "group-hover/card:translate-y-[-2px]",
                statusStyles.borderColor,
                workflowStatus !== 'idle' && `shadow-lg ${statusStyles.cardGlow}`,
                selected && "border-primary/40 shadow-lg translate-y-[-1px]"
              )}
            >
              {/* 顶部高光 - 更细腻 */}
              <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-background/30 via-background/10 to-transparent pointer-events-none rounded-t-xl" />
              
              {/* 底部暗部 - 增加深度 */}
              <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-foreground/[0.02] to-transparent pointer-events-none rounded-b-xl" />
              
              {/* 悬浮时的微光扫过 - 更自然 */}
              <div className={cn(
                "absolute inset-0 opacity-0 transition-all duration-700",
                "bg-gradient-to-r from-transparent via-foreground/[0.03] to-transparent",
                "group-hover/card:opacity-100 group-hover/card:animate-shimmer pointer-events-none"
              )} />
              
              {/* 选中时的精致高亮 */}
              {selected && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-xl pointer-events-none" />
                  <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none" />
                </>
              )}
              
              <CardHeader className="!pb-0 !px-3 !gap-0 relative z-10">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className={cn(
                      "text-sm transition-colors duration-300",
                      selected && "text-primary"
                    )}>
                      {label}
                    </CardTitle>
                    {description && (
                      <CardDescription className="text-[10px] leading-tight mt-0.5">
                        {description}
                      </CardDescription>
                    )}
                  </div>
                  
                  {/* 没有图标时显示信息按钮 */}
                  {!hasIcon && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsDialogOpen(true)
                      }}
                      className={cn(
                        "flex-shrink-0 w-6 h-6 rounded-full",
                        "flex items-center justify-center",
                        "transition-all duration-200 ease-out cursor-pointer",
                        "bg-gradient-to-br from-primary/10 to-primary/5",
                        "border backdrop-blur-sm",
                        "hover:scale-110 hover:shadow-md hover:from-primary/20 hover:to-primary/10",
                        "active:scale-95",
                        selected 
                          ? "border-primary/40 shadow-sm ring-1 ring-primary/20" 
                          : "border-border/50 hover:border-primary/30"
                      )}
                      title="查看提示词"
                    >
                      <Info className="w-3.5 h-3.5 text-primary" />
                    </button>
                  )}
                </div>
              </CardHeader>
              
              {allFunctions.length > 0 && (
                <CardContent className="!pt-2 !pb-2 !px-3 relative z-10">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {/* 按原始顺序显示所有功能 */}
                    {allFunctions.map((func, index) => {
                      const isEmbedded = func.embedded !== false
                      
                      return isEmbedded ? (
                        // 嵌入式功能图标
                        <div 
                          key={func.id} 
                          className="relative group/func animate-in fade-in zoom-in flex-shrink-0"
                          style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'backwards' }}
                        >
                          {/* 圆形功能图标 - 缩小版 */}
                          <div
                            className={cn(
                              "relative w-7 h-7 rounded-full",
                              "flex items-center justify-center",
                              "transition-all duration-200 ease-out cursor-pointer",
                              "bg-gradient-to-br from-muted/80 to-muted/60",
                              "border backdrop-blur-sm",
                              "hover:scale-105 hover:shadow-md",
                              "active:scale-95",
                              selected 
                                ? "border-primary/30 shadow-sm" 
                                : "border-border/50 hover:border-border"
                            )}
                          >
                            {/* 选中时的内部光效 */}
                            {selected && (
                              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                            )}
                            
                            {/* 图标 */}
                            <div
                              className="relative text-sm leading-none"
                              style={{
                                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                              }}
                            >
                              {func.icon || '⚙️'}
                            </div>
                          </div>
                          
                          {/* 标签 - 悬浮时显示 */}
                          <div
                            className={cn(
                              "absolute top-full left-0 mt-1 z-50",
                              "text-[9px] font-medium whitespace-nowrap",
                              "px-1.5 py-0.5 rounded bg-popover border shadow-md",
                              "opacity-0 scale-95 transition-all duration-150 pointer-events-none",
                              "group-hover/func:opacity-100 group-hover/func:scale-100",
                              selected ? "text-primary" : "text-foreground"
                            )}
                          >
                            {func.label}
                          </div>
                        </div>
                      ) : (
                        // 非嵌入式功能 - 显示为可连接的小标签
                        <div 
                          key={func.id} 
                          className="relative group/ext-func animate-in fade-in zoom-in flex-shrink-0"
                          style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'backwards' }}
                        >
                          {/* 小标签样式 - 带连接点 */}
                          <div
                            className={cn(
                              "relative px-2 py-0.5 rounded-md text-[9px] font-medium",
                              "transition-all duration-200 ease-out cursor-pointer",
                              "bg-gradient-to-r from-accent/60 to-accent/40",
                              "border border-accent-foreground/20 backdrop-blur-sm",
                              "hover:scale-105 hover:shadow-md hover:from-accent/80 hover:to-accent/60",
                              "active:scale-95",
                              selected 
                                ? "border-primary/40 shadow-sm ring-1 ring-primary/20" 
                                : "hover:border-accent-foreground/30"
                            )}
                          >
                            {/* 选中时的内部光效 */}
                            {selected && (
                              <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
                            )}
                            
                            {/* 图标 + 文字 */}
                            <div className="relative flex items-center gap-1">
                              <span className="text-[10px]">{func.icon || '🔗'}</span>
                              <span className="opacity-80">{func.label}</span>
                            </div>
                            
                            {/* 连接手柄 - 在标签底部中心，悬停时显示 */}
                            <Handle
                              type="source"
                              position={Position.Bottom}
                              id={func.id}
                              className={cn(
                                "!w-2 !h-2 !border-2 !rounded-full !bg-background",
                                "!absolute !left-1/2 !bottom-0 !-translate-x-1/2 !translate-y-1/2",
                                "transition-all duration-300 cursor-pointer",
                                "opacity-0 group-hover/ext-func:opacity-100",
                                "hover:!w-2.5 hover:!h-2.5 hover:!shadow-lg",
                                selected
                                  ? "!border-primary !shadow-sm !shadow-primary/50"
                                  : "!border-accent-foreground/60 hover:!border-primary hover:!shadow-primary/30"
                              )}
                            />
                          </div>
                          
                          {/* 提示 - 悬浮时显示 */}
                          <div
                            className={cn(
                              "absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50",
                              "text-[8px] text-muted-foreground whitespace-nowrap",
                              "px-1.5 py-0.5 rounded bg-popover/95 border shadow-sm",
                              "opacity-0 scale-95 transition-all duration-150 pointer-events-none",
                              "group-hover/ext-func:opacity-100 group-hover/ext-func:scale-100"
                            )}
                          >
                            外部连接
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export const ToolAINode = memo(ToolAINodeComponent)
ToolAINode.displayName = 'ToolAINode'

