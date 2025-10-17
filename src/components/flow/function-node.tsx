import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { cn } from '@/lib/utils'

export interface FunctionNodeData {
  label: string
  description?: string
}

/**
 * 功能节点组件 - 类似 n8n 的工具/功能节点
 * 仅支持顶部手柄，用于连接到模块节点的底部插槽
 * 设计更小更紧凑专业
 */
function FunctionNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as FunctionNodeData
  
  return (
    <div
      className={cn(
        "relative min-w-[90px] max-w-[110px] rounded-md border bg-gradient-to-b from-muted/60 to-muted/40 backdrop-blur-sm shadow-sm transition-all duration-200",
        "hover:shadow-md hover:scale-105 hover:from-muted/70 hover:to-muted/50",
        selected ? "ring-2 ring-accent/60 border-accent/50 shadow-accent/10" : "border-border/30"
      )}
    >
      {/* 顶部连接点 - 连接到模块节点 */}
      <Handle
        type="target"
        position={Position.Top}
        className={cn(
          "!w-2.5 !h-2.5 !bg-gradient-to-br !from-accent !to-accent/80 !border-2 !border-background !rounded-full",
          "hover:!w-3 hover:!h-3 transition-all duration-200 !shadow-sm hover:!shadow-md hover:!shadow-accent/20"
        )}
        isConnectable={true}
      />

      {/* 节点内容 - 紧凑布局 */}
      <div className="px-2.5 py-1.5 space-y-0.5">
        <div className="font-medium text-[10px] leading-tight text-center text-foreground/80 tracking-tight">
          {nodeData.label}
        </div>
        {nodeData.description && (
          <div className="text-[8px] text-muted-foreground/60 leading-tight text-center line-clamp-1">
            {nodeData.description}
          </div>
        )}
      </div>
    </div>
  )
}

export const FunctionNode = memo(FunctionNodeComponent)
FunctionNode.displayName = 'FunctionNode'

