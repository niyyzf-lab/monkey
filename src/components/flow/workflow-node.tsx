import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { cn } from '@/lib/utils'

export interface WorkflowNodeData {
  label: string
  description?: string
  type?: string
}

/**
 * 自定义工作流节点组件
 * 使用 shadcn 设计风格
 */
function WorkflowNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as WorkflowNodeData
  
  return (
    <div
      className={cn(
        "relative min-w-[160px] rounded-lg border-2 bg-card text-card-foreground shadow-lg transition-all",
        "hover:shadow-xl hover:scale-105",
        selected ? "ring-2 ring-ring ring-offset-2 ring-offset-background" : "border-border"
      )}
    >
      {/* 左侧连接点 */}
      <Handle
        type="target"
        position={Position.Left}
        className={cn(
          "!w-3 !h-3 !bg-primary !border-2 !border-background",
          "hover:!w-4 hover:!h-4 transition-all"
        )}
      />

      {/* 节点内容 */}
      <div className="px-4 py-3">
        <div className="font-semibold text-sm leading-tight">
          {nodeData.label}
        </div>
        {nodeData.description && (
          <div className="text-xs text-muted-foreground mt-1 leading-tight">
            {nodeData.description}
          </div>
        )}
      </div>

      {/* 右侧连接点 */}
      <Handle
        type="source"
        position={Position.Right}
        className={cn(
          "!w-3 !h-3 !bg-primary !border-2 !border-background",
          "hover:!w-4 hover:!h-4 transition-all"
        )}
      />
    </div>
  )
}

export const WorkflowNode = memo(WorkflowNodeComponent)
WorkflowNode.displayName = 'WorkflowNode'
