import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { cn } from '@/lib/utils'

export interface ModuleNodeData {
  label: string
  description?: string
  functions?: Array<{ id: string; label: string }>
}

/**
 * 模块节点组件 - 类似 n8n 的主要工作流节点
 * 支持左右手柄（工作流连接）和动态底部手柄（功能插槽）
 * 优化设计：更美观、紧凑、专业
 */
function ModuleNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as ModuleNodeData
  const functions = nodeData.functions || []
  
  return (
    <div
      className={cn(
        "relative min-w-[200px] max-w-[240px] rounded-lg border bg-card text-card-foreground shadow-lg transition-all duration-200",
        "hover:shadow-xl hover:-translate-y-0.5",
        "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-primary/5 before:to-transparent before:pointer-events-none",
        selected ? "ring-2 ring-primary/60 border-primary/40 shadow-primary/20" : "border-border/50"
      )}
    >
      {/* 左侧连接点 - 输入 */}
      <Handle
        type="target"
        position={Position.Left}
        className={cn(
          "!w-3 !h-3 !bg-gradient-to-br !from-primary !to-primary/80 !border-2 !border-background !rounded-full",
          "hover:!w-3.5 hover:!h-3.5 transition-all duration-200 !shadow-md hover:!shadow-lg hover:!shadow-primary/30"
        )}
        isConnectable={true}
      />

      {/* 节点主体内容 */}
      <div className="relative px-4 py-3 space-y-2">
        {/* 标题区域 */}
        <div className="space-y-1">
          <div className="font-semibold text-sm leading-tight text-foreground tracking-tight">
            {nodeData.label}
          </div>
          {nodeData.description && (
            <div className="text-[11px] text-muted-foreground/80 leading-snug line-clamp-2">
              {nodeData.description}
            </div>
          )}
        </div>
        
        {/* 功能插槽标签 */}
        {functions.length > 0 && (
          <div className="pt-2 border-t border-border/30">
            <div className="flex gap-1 flex-wrap">
              {functions.map((func) => (
                <span
                  key={func.id}
                  className="inline-flex items-center text-[9px] font-medium px-1.5 py-0.5 rounded bg-accent/10 text-accent-foreground/70 border border-accent/20 transition-colors hover:bg-accent/20"
                >
                  {func.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 右侧连接点 - 输出 */}
      <Handle
        type="source"
        position={Position.Right}
        className={cn(
          "!w-3 !h-3 !bg-gradient-to-br !from-primary !to-primary/80 !border-2 !border-background !rounded-full",
          "hover:!w-3.5 hover:!h-3.5 transition-all duration-200 !shadow-md hover:!shadow-lg hover:!shadow-primary/30"
        )}
        isConnectable={true}
      />

      {/* 底部动态手柄 - 功能插槽 */}
      {functions.map((func, index) => {
        const totalSlots = functions.length + 1
        const leftPosition = (100 / totalSlots) * (index + 1)
        
        return (
          <Handle
            key={func.id}
            type="source"
            position={Position.Bottom}
            id={func.id}
            style={{ left: `${leftPosition}%` }}
            className={cn(
              "!w-2.5 !h-2.5 !bg-gradient-to-br !from-accent !to-accent/80 !border-2 !border-background !rounded-full",
              "hover:!w-3 hover:!h-3 transition-all duration-200 !shadow-sm hover:!shadow-md hover:!shadow-accent/30"
            )}
            isConnectable={true}
          />
        )
      })}
    </div>
  )
}

export const ModuleNode = memo(ModuleNodeComponent)
ModuleNode.displayName = 'ModuleNode'

