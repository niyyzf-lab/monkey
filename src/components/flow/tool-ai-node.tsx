import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

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
  const hasIcon = !!iconSrc
  
  return (
    <div className="relative group/node animate-in fade-in duration-500">
      {/* 主容器 - 垂直布局 */}
      <div className="relative flex flex-col items-center gap-2.5">
        {/* 上方：缩小的图标（如果有的话） */}
        {hasIcon && (
          <div 
            className={cn(
              "relative w-24 h-24 transition-all duration-500 ease-out",
              "group-hover/node:scale-[1.03] group-hover/node:-translate-y-0.5",
              selected && "scale-105"
            )}
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
                  "!w-4 !h-4 !border-2 !rounded-full !bg-background",
                  "transition-all duration-300 ease-out",
                  "hover:!w-5 hover:!h-5",
                  selected 
                    ? "!border-foreground !shadow-lg !shadow-foreground/30" 
                    : "!border-foreground/80 hover:!border-foreground hover:!shadow-md hover:!shadow-foreground/20"
                )}
                style={{
                  boxShadow: selected 
                    ? '0 0 8px rgba(0, 0, 0, 0.3), inset 0 0 0 2px white'
                    : 'inset 0 0 0 2px white'
                }}
              />
            </div>

            {/* 图标背景光晕 */}
            <div className={cn(
              "absolute inset-0 rounded-xl bg-gradient-radial from-primary/5 to-transparent opacity-0 transition-opacity duration-500",
              "group-hover/node:opacity-100"
            )} />
            
            <img 
              src={iconSrc} 
              alt={label}
              className="relative w-full h-full object-contain transition-all duration-500"
              style={{
                filter: selected 
                  ? 'drop-shadow(0 8px 24px rgba(0,0,0,0.35)) brightness(1.05)'
                  : 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const parent = e.currentTarget.parentElement
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center text-5xl font-bold text-foreground/60 bg-muted rounded-xl">
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
                  "!w-4 !h-4 !border-2 !rounded-full !bg-background",
                  "transition-all duration-300 ease-out",
                  "hover:!w-5 hover:!h-5",
                  selected 
                    ? "!border-foreground !shadow-lg !shadow-foreground/30" 
                    : "!border-foreground/80 hover:!border-foreground hover:!shadow-md hover:!shadow-foreground/20"
                )}
                style={{
                  boxShadow: selected 
                    ? '0 0 8px rgba(0, 0, 0, 0.3), inset 0 0 0 2px white'
                    : 'inset 0 0 0 2px white'
                }}
              />
            </div>
          )}

          {/* 卡片装饰层 */}
          <div className="relative group/card">
            {/* 外层细微光晕 - 仅悬浮和选中时显示 */}
            <div className={cn(
              "absolute -inset-[1px] rounded-xl opacity-0 transition-all duration-500 blur-sm pointer-events-none",
              "bg-gradient-to-br from-primary/15 to-accent/10",
              "group-hover/card:opacity-60",
              selected && "opacity-80 blur-md"
            )} />
            
            <Card 
              className={cn(
                "min-w-[220px] transition-all duration-500 !gap-0 !py-3 relative overflow-hidden",
                "bg-gradient-to-b from-card to-card/95",
                "border shadow-sm backdrop-blur-sm",
                "group-hover/card:shadow-lg group-hover/card:border-foreground/10",
                "group-hover/card:translate-y-[-2px]",
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
  )
}

export const ToolAINode = memo(ToolAINodeComponent)
ToolAINode.displayName = 'ToolAINode'

