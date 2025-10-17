import { createFileRoute } from '@tanstack/react-router'
import { useCallback } from 'react'
import {
  ReactFlow,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { UnifiedPageHeader } from '@/components/common/unified-page-header'

export const Route = createFileRoute('/feel/')({
  component: FeelPage,
})

// 初始节点
const initialNodes = [
  {
    id: '1',
    type: 'default',
    position: { x: 250, y: 100 },
    data: { label: '猴园儿画布' },
    style: {
      background: 'hsl(var(--card))',
      color: 'hsl(var(--card-foreground))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '8px',
      padding: '12px 24px',
      fontSize: '14px',
      fontWeight: '500',
    },
  },
]

// 初始边
const initialEdges: Edge[] = []

/**
 * 猴园儿页面 - React Flow 画布
 * 提供一个基础的可视化编辑画布，完美支持暗黑模式
 */
function FeelPage() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds))
    },
    [setEdges]
  )

  return (
    <div className="h-full flex flex-col bg-background">
      {/* 页面标题 - 统一标题栏（浮动） */}
      <UnifiedPageHeader
        title="猴园儿"
        subtitle="可视化画布"
      />
      
      {/* React Flow 画布 */}
      <div className="flex-1 w-full react-flow-dark-mode">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          className="bg-background"
          defaultEdgeOptions={{
            style: { 
              stroke: 'hsl(var(--primary))',
              strokeWidth: 2,
            },
            animated: true,
          }}
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={16} 
            size={1}
            className="bg-background [&>*]:stroke-muted-foreground/20"
          />
        </ReactFlow>
      </div>
      
      <style>{`
        /* React Flow 暗黑模式优化 */
        .react-flow-dark-mode .react-flow__node {
          background: hsl(var(--card));
          color: hsl(var(--card-foreground));
          border: 1px solid hsl(var(--border));
        }
        
        .react-flow-dark-mode .react-flow__node.selected {
          box-shadow: 0 0 0 2px hsl(var(--ring));
        }
        
        .react-flow-dark-mode .react-flow__edge-path {
          stroke: hsl(var(--primary));
        }
        
        .react-flow-dark-mode .react-flow__edge.selected .react-flow__edge-path {
          stroke: hsl(var(--ring));
        }
        
        .react-flow-dark-mode .react-flow__handle {
          background: hsl(var(--primary));
          border: 2px solid hsl(var(--background));
        }
        
        .react-flow-dark-mode .react-flow__handle-connecting {
          background: hsl(var(--ring));
        }
        
        .react-flow-dark-mode .react-flow__handle-valid {
          background: hsl(var(--primary));
        }
        
        /* 选择框优化 */
        .react-flow-dark-mode .react-flow__selection {
          background: hsl(var(--primary) / 0.1);
          border: 1px solid hsl(var(--primary));
        }
        
        /* 节点工具栏优化 */
        .react-flow-dark-mode .react-flow__nodesselection-rect {
          fill: hsl(var(--primary) / 0.05);
          stroke: hsl(var(--primary));
        }
      `}</style>
    </div>
  )
}
