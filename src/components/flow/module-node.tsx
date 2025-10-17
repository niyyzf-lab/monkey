import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface FunctionHandle {
  id: string
  label: string
}

interface ModuleNodeData extends Record<string, unknown> {
  label: string
  description?: string
  functions?: FunctionHandle[]
  icon?: string
}

type ModuleNodeType = Node<ModuleNodeData>

// 为功能徽章分配颜色
const getFunctionBadgeVariant = (index: number) => {
  const variants = ['default', 'secondary', 'outline'] as const
  return variants[index % variants.length]
}

/**
 * 模块节点 - shadcn 卡片风格
 * 上方：图标（96px）
 * 下方：精简信息卡片（220px 宽，标题、描述、功能徽章）
 * 选中效果：内部渐变光效 + 边框高亮 + 阴影增强
 * 连接点：卡片左右两侧居中 + 功能徽章底部（悬停显示）
 */
function ModuleNodeComponent({ data, selected }: NodeProps<ModuleNodeType>) {
  const functions = (data?.functions as FunctionHandle[] | undefined) || []
  const iconSrc = data?.icon as string | undefined
  const label = (data?.label as string) || ''
  const description = data?.description as string | undefined
  
  return (
    <div className="relative group/node animate-in fade-in duration-500">
      {/* 主容器 - 垂直布局 */}
      <div className="relative flex flex-col items-center gap-2.5">
        {/* 上方：缩小的图标 */}
        <div 
          className={cn(
            "relative w-24 h-24 transition-all duration-500 ease-out",
            "group-hover/node:scale-[1.03] group-hover/node:-translate-y-0.5",
            selected && "scale-105"
          )}
        >
          {/* 图标背景光晕 */}
          <div className={cn(
            "absolute inset-0 rounded-xl bg-gradient-radial from-primary/5 to-transparent opacity-0 transition-opacity duration-500",
            "group-hover/node:opacity-100"
          )} />
          
          {iconSrc ? (
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
          ) : (
            <div className="relative w-full h-full flex items-center justify-center text-5xl font-bold text-muted-foreground/50 bg-muted rounded-xl">
              {label.substring(0, 2)}
            </div>
          )}
        </div>

        {/* 下方：精简信息卡片容器 */}
        <div className="relative">
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
                "w-[220px] transition-all duration-500 !gap-0 !py-3 relative overflow-hidden",
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
              
              {functions.length > 0 && (
                <CardContent className="!pt-2 !pb-0 !px-3 relative z-10">
                  <div className="flex flex-wrap gap-1">
                    {functions.map((func, index) => (
                      <div 
                        key={func.id} 
                        className="relative group/badge animate-in fade-in slide-in-from-bottom-2"
                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                      >
                        <Badge 
                          variant={getFunctionBadgeVariant(index)}
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 h-5 transition-all duration-300",
                            "hover:scale-110 hover:shadow-md hover:-translate-y-0.5",
                            "active:scale-95",
                            selected && "ring-1 ring-primary/30 shadow-sm"
                          )}
                        >
                          {func.label}
                        </Badge>
                        
                        {/* 徽章悬浮光晕 */}
                        <div className="absolute inset-0 rounded-md bg-primary/10 opacity-0 group-hover/badge:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
                        
                        {/* 功能连接点 */}
                        <Handle
                          type="source"
                          position={Position.Bottom}
                          id={func.id}
                          className={cn(
                            "!absolute !w-2 !h-2 !border-2 !rounded-full !bg-background",
                            "!-bottom-1.5 !left-1/2 !-translate-x-1/2",
                            "transition-all duration-300 cursor-pointer opacity-0 group-hover/badge:opacity-100",
                            "hover:!w-2.5 hover:!h-2.5 hover:!-bottom-2 hover:!shadow-lg",
                            selected
                              ? "!border-primary !shadow-sm !shadow-primary/50"
                              : "!border-muted-foreground/50 hover:!border-primary hover:!shadow-primary/30"
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* 主连接手柄 - 黑边框白内圆样式 */}
          <Handle
            type="target"
            position={Position.Left}
            id="left"
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

          <Handle
            type="source"
            position={Position.Right}
            id="right"
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
      </div>
    </div>
  )
}

export const ModuleNode = memo(ModuleNodeComponent)
ModuleNode.displayName = 'ModuleNode'
