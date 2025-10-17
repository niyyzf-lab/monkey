import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { cn } from '@/lib/utils'

interface FunctionNodeData extends Record<string, unknown> {
  label: string
  description?: string
  icon?: string
}

type FunctionNodeType = Node<FunctionNodeData>

/**
 * 功能节点 - Mac Dock 风格
 * 纯图标 + 极简文字，悬浮放大效果
 */
function FunctionNodeComponent({ data, selected }: NodeProps<FunctionNodeType>) {
  const label = (data?.label as string) || ''
  const description = data?.description as string | undefined
  const icon = data?.icon as string | undefined
  
  return (
    <div className="relative group/node flex flex-col items-center">
      {/* 顶部手柄 */}
      <Handle
        type="target"
        position={Position.Top}
        className={cn(
          "!w-2 !h-2 !border-2 !rounded-full !bg-background",
          "transition-all duration-300",
          "hover:!w-2.5 hover:!h-2.5",
          selected 
            ? "!border-primary !shadow-lg !shadow-primary/50" 
            : "!border-muted-foreground/30 hover:!border-primary/50"
        )}
        style={{ top: '-4px' }}
      />

      {/* 选中时的发光效果 */}
      {selected && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-r from-primary/20 via-accent/15 to-primary/20 blur-2xl animate-pulse"
          style={{ animationDuration: '2s' }}
          aria-hidden="true"
        />
      )}

      {/* 主图标容器 - Mac Dock 风格 */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        {/* 图标 */}
        <div
          className={cn(
            "relative w-14 h-14 flex items-center justify-center",
            "transition-all duration-500 ease-out cursor-pointer",
            "group-hover/node:scale-125 group-hover/node:-translate-y-2",
            selected && "scale-110 -translate-y-1"
          )}
        >
          {/* 图标底座反光 */}
          <div
            className={cn(
              "absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full",
              "transition-all duration-500",
              "bg-gradient-to-r from-transparent via-foreground/10 to-transparent",
              "group-hover/node:w-14 group-hover/node:via-foreground/20",
              selected && "via-primary/30"
            )}
          />

          {/* 图标内容 */}
          <div
            className={cn(
              "relative w-full h-full flex items-center justify-center text-3xl",
              "transition-all duration-500",
              "rounded-2xl",
              selected && "drop-shadow-2xl"
            )}
            style={{
              filter: selected
                ? 'drop-shadow(0 8px 20px rgba(0,0,0,0.3))'
                : 'drop-shadow(0 4px 10px rgba(0,0,0,0.15))',
            }}
          >
            {icon || '📦'}
          </div>

          {/* 选中时的光环 */}
          {selected && (
            <div className="absolute inset-0 rounded-2xl border-2 border-primary/40 animate-ping" style={{ animationDuration: '2s' }} />
          )}
        </div>

        {/* 标题标签 - 极简设计 */}
        <div
          className={cn(
            "px-2.5 py-1 rounded-md text-[11px] font-semibold text-center leading-tight",
            "transition-all duration-300 backdrop-blur-sm border whitespace-nowrap max-w-[100px] truncate",
            selected
              ? "bg-primary/10 border-primary/40 text-primary shadow-md"
              : "bg-background/80 border-border/40 text-foreground/80",
            "group-hover/node:bg-primary/5 group-hover/node:border-primary/30 group-hover/node:scale-105"
          )}
        >
          {label}
        </div>

        {/* 描述（可选，很小） */}
        {description && (
          <div className="text-[9px] text-muted-foreground/50 text-center max-w-[90px] leading-tight truncate">
            {description}
          </div>
        )}
      </div>

      {/* 底部手柄 */}
      <Handle
        type="source"
        position={Position.Bottom}
        className={cn(
          "!w-2 !h-2 !border-2 !rounded-full !bg-background",
          "transition-all duration-300",
          "hover:!w-2.5 hover:!h-2.5",
          selected 
            ? "!border-primary !shadow-lg !shadow-primary/50" 
            : "!border-muted-foreground/30 hover:!border-primary/50"
        )}
        style={{ bottom: '-4px' }}
      />
    </div>
  )
}

export const FunctionNode = memo(FunctionNodeComponent)
FunctionNode.displayName = 'FunctionNode'
