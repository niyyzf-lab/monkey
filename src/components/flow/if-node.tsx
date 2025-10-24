import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { cn } from '@/lib/utils'

interface IfNodeData extends Record<string, unknown> {
  label: string
  description?: string
  icon?: string
  condition?: string
  workflowStatus?: 'idle' | 'active' | 'completed' // 工作流状态
}

type IfNodeType = Node<IfNodeData>

/**
 * If条件节点 - 圆角矩形卡片风格
 * 正方形背景卡片 + 图标 + 说明文字
 * 左侧输入手柄，右上输出手柄（true），右下输出手柄（false）
 */
function IfNodeComponent({ data, selected }: NodeProps<IfNodeType>) {
  const label = (data?.label as string) || 'IF'
  const description = data?.description as string | undefined
  const icon = data?.icon as string | undefined
  const condition = data?.condition as string | undefined
  
  return (
    <div className="relative group/node animate-in fade-in duration-500">
      {/* 圆角矩形卡片主体 */}
      <div
        className={cn(
          "relative w-28 h-28 rounded-xl z-20",
          "flex flex-col items-center justify-center gap-0.5",
          "transition-all duration-500 ease-out cursor-pointer",
          "bg-gradient-to-br from-amber-50/90 via-amber-100/80 to-amber-50/90 dark:from-amber-950/40 dark:via-amber-900/30 dark:to-amber-950/40",
          "border-2 shadow-md backdrop-blur-sm",
          "group-hover/node:scale-105 group-hover/node:shadow-xl group-hover/node:z-50",
          "group-hover/node:border-amber-400/30 dark:group-hover/node:border-amber-600/30",
          selected 
            ? "border-amber-500/60 dark:border-amber-500/50 shadow-lg scale-[1.02]" 
            : "border-amber-300/20 dark:border-amber-700/20"
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
                ? "!border-amber-500 !shadow-lg !shadow-amber-500/50" 
                : "!border-foreground/60 hover:!border-amber-500"
            )}
          />
        </div>

        {/* 右上输出手柄定位父容器 (True) */}
        <div
          className="absolute z-10"
          style={{
            right: 0,
            top: '30%',
            transform: 'translateY(-50%)',
          }}
        >
          {/* 右上输出手柄 - True */}
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            className={cn(
              "!w-2.5 !h-2.5 !border-2 !rounded-full",
              "transition-all duration-300",
              "hover:!w-3 hover:!h-3",
              "!bg-green-100 dark:!bg-green-900/50",
              selected 
                ? "!border-green-500 !shadow-lg !shadow-green-500/50" 
                : "!border-green-600/60 dark:!border-green-500/60 hover:!border-green-500"
            )}
          />
          {/* True 标签 */}
          <div 
            className={cn(
              "absolute left-full ml-1 top-1/2 -translate-y-1/2",
              "text-[9px] font-semibold px-1 py-0.5 rounded",
              "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300",
              "opacity-0 group-hover/node:opacity-100 transition-opacity duration-300",
              "whitespace-nowrap pointer-events-none"
            )}
          >
            True
          </div>
        </div>

        {/* 右下输出手柄定位父容器 (False) */}
        <div
          className="absolute z-10"
          style={{
            right: 0,
            top: '70%',
            transform: 'translateY(-50%)',
          }}
        >
          {/* 右下输出手柄 - False */}
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            className={cn(
              "!w-2.5 !h-2.5 !border-2 !rounded-full",
              "transition-all duration-300",
              "hover:!w-3 hover:!h-3",
              "!bg-red-100 dark:!bg-red-900/50",
              selected 
                ? "!border-red-500 !shadow-lg !shadow-red-500/50" 
                : "!border-red-600/60 dark:!border-red-500/60 hover:!border-red-500"
            )}
          />
          {/* False 标签 */}
          <div 
            className={cn(
              "absolute left-full ml-1 top-1/2 -translate-y-1/2",
              "text-[9px] font-semibold px-1 py-0.5 rounded",
              "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300",
              "opacity-0 group-hover/node:opacity-100 transition-opacity duration-300",
              "whitespace-nowrap pointer-events-none"
            )}
          >
            False
          </div>
        </div>

        {/* 选中时的外层光晕 */}
        {selected && (
          <div
            className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400/20 via-amber-500/15 to-amber-400/20 blur-xl animate-pulse"
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
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400/10 via-transparent to-amber-500/5 pointer-events-none" />
        )}

        {/* 菱形装饰 - 表示条件判断 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <div 
            className="w-16 h-16 border-2 border-amber-600 dark:border-amber-400"
            style={{ transform: 'rotate(45deg)' }}
          />
        </div>

        {/* 图标 */}
        <div
          className={cn(
            "relative text-2xl transition-all duration-500",
            "group-hover/node:text-3xl",
            selected && "scale-105"
          )}
          style={{
            filter: selected
              ? 'drop-shadow(0 4px 12px rgba(251, 191, 36, 0.3))'
              : 'drop-shadow(0 2px 6px rgba(0,0,0,0.1))',
          }}
        >
          {icon || '🔀'}
        </div>

        {/* 标题 - 始终显示 */}
        <div
          className={cn(
            "relative text-[10px] font-bold text-center leading-tight px-2 max-w-[90px]",
            "transition-all duration-300",
            "group-hover/node:text-xs",
            selected
              ? "text-amber-600 dark:text-amber-400"
              : "text-amber-700 dark:text-amber-300"
          )}
        >
          {label}
        </div>

        {/* 条件文本 - 始终显示 */}
        {condition && (
          <div 
            className={cn(
              "relative text-[9px] text-amber-600/80 dark:text-amber-400/70 text-center leading-tight px-2 max-w-[90px]",
              "transition-all duration-300 font-medium"
            )}
          >
            {condition}
          </div>
        )}

        {/* 描述文本 - 仅悬浮时显示 */}
        {description && (
          <div 
            className={cn(
              "relative text-[8px] text-amber-600/60 dark:text-amber-400/50 text-center leading-tight px-2 max-w-[90px]",
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
            "bg-gradient-to-r from-transparent via-amber-400/[0.05] to-transparent",
            "group-hover/node:opacity-100 pointer-events-none"
          )}
        />
      </div>
    </div>
  )
}

export const IfNode = memo(IfNodeComponent)
IfNode.displayName = 'IfNode'

