import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { cn } from '@/lib/utils'

interface IdleNodeData extends Record<string, unknown> {
  label: string
  description?: string
  icon?: string
}

type IdleNodeType = Node<IdleNodeData>

/**
 * 无所事事节点 - 圆角矩形卡片风格
 * 正方形背景卡片 + 图标 + 说明文字
 * 左侧输入手柄，右侧输出手柄
 */
function IdleNodeComponent({ data, selected }: NodeProps<IdleNodeType>) {
  const label = (data?.label as string) || '无所事事'
  const description = data?.description as string | undefined
  const icon = data?.icon as string | undefined
  
  return (
    <div className="relative group/node animate-in fade-in duration-500">
      {/* 圆角矩形卡片主体 */}
      <div
        className={cn(
          "relative w-24 h-24 rounded-xl z-20",
          "flex flex-col items-center justify-center gap-0.5",
          "transition-all duration-500 ease-out cursor-pointer",
          "bg-gradient-to-br from-card via-card/95 to-card/90",
          "border-2 shadow-md backdrop-blur-sm",
          "group-hover/node:scale-105 group-hover/node:shadow-xl group-hover/node:z-50",
          "group-hover/node:border-foreground/20",
          selected 
            ? "border-primary/50 shadow-lg scale-[1.02]" 
            : "border-foreground/10"
        )}
      >
        {/* 左侧输入手柄定位父容器 */}
        <div
          className="absolute z-10"
          style={{
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          {/* 左侧输入手柄 */}
          <Handle
            type="target"
            position={Position.Left}
            className={cn(
              "!w-2.5 !h-2.5 !border-2 !rounded-full !bg-background",
              "transition-all duration-300",
              "hover:!w-3 hover:!h-3",
              selected 
                ? "!border-primary !shadow-lg !shadow-primary/50" 
                : "!border-foreground/60 hover:!border-primary"
            )}
          />
        </div>

        {/* 右侧输出手柄定位父容器 */}
        <div
          className="absolute z-10"
          style={{
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          {/* 右侧输出手柄 */}
          <Handle
            type="source"
            position={Position.Right}
            className={cn(
              "!w-2.5 !h-2.5 !border-2 !rounded-full !bg-background",
              "transition-all duration-300",
              "hover:!w-3 hover:!h-3",
              selected 
                ? "!border-primary !shadow-lg !shadow-primary/50" 
                : "!border-foreground/60 hover:!border-primary"
            )}
          />
        </div>

        {/* 选中时的外层光晕 */}
        {selected && (
          <div
            className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 via-accent/15 to-primary/20 blur-xl animate-pulse"
            style={{ animationDuration: '2s' }}
            aria-hidden="true"
          />
        )}
        
        {/* 内层高光效果 */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-background/40 via-transparent to-transparent pointer-events-none" />
        
        {/* 底部阴影效果 */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-foreground/[0.03] via-transparent to-transparent pointer-events-none" />
        
        {/* 选中时的内部光效 */}
        {selected && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/10 via-transparent to-accent/5 pointer-events-none" />
        )}

        {/* 图标 */}
        <div
          className={cn(
            "relative text-2xl transition-all duration-500",
            "group-hover/node:text-3xl",
            selected && "scale-105"
          )}
          style={{
            filter: selected
              ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))'
              : 'drop-shadow(0 2px 6px rgba(0,0,0,0.1))',
          }}
        >
          {icon || '😴'}
        </div>

        {/* 标题 - 始终显示 */}
        <div
          className={cn(
            "relative text-[10px] font-semibold text-center leading-tight px-2 max-w-[80px]",
            "transition-all duration-300",
            "group-hover/node:text-xs",
            selected
              ? "text-primary"
              : "text-foreground/90"
          )}
        >
          {label}
        </div>

        {/* 描述文本 - 仅悬浮时显示 */}
        {description && (
          <div 
            className={cn(
              "relative text-[9px] text-muted-foreground/60 text-center leading-tight px-2 max-w-[80px]",
              "opacity-0 max-h-0 overflow-hidden transition-all duration-300",
              "group-hover/node:opacity-100 group-hover/node:max-h-10 group-hover/node:mt-0.5"
            )}
          >
            {description}
          </div>
        )}

        {/* 悬浮时的微光扫过效果 */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-700",
            "bg-gradient-to-r from-transparent via-foreground/[0.03] to-transparent",
            "group-hover/node:opacity-100 pointer-events-none"
          )}
        />
      </div>
    </div>
  )
}

export const IdleNode = memo(IdleNodeComponent)
IdleNode.displayName = 'IdleNode'

