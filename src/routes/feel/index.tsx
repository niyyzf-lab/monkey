import { createFileRoute } from '@tanstack/react-router'
import { useCallback } from 'react'
import {
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { UnifiedPageHeader } from '@/components/common/unified-page-header'
import { WorkflowCanvas, ChatPanel, convertWorkflowData } from '@/components/feel'

export const Route = createFileRoute('/feel/')({
  component: FeelPage,
})

const { nodes: initialNodes, edges: initialEdges } = convertWorkflowData()

// 调试：打印连接信息
console.log('=== 工作流调试信息 ===')
console.log('节点数量:', initialNodes.length)
console.log('边数量:', initialEdges.length)
console.log('节点详情:', initialNodes.map(n => ({
  id: n.id,
  type: n.type,
  label: n.data.label
})))
console.log('所有边:', initialEdges.map(e => ({
  id: e.id,
  source: e.source,
  target: e.target,
  sourceHandle: e.sourceHandle,
  type: e.type
})))

/**
 * 猴园儿页面 - AI 工作流可视化
 * 展示 AI 炒股系统的工作流程
 */
function FeelPage() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (connection: Connection) => {
      console.log('新建连接:', connection)
      setEdges((eds) => addEdge(connection, eds))
    },
    [setEdges]
  )

  // 验证连接 - 允许所有有效连接
  const isValidConnection = useCallback((connection: Connection | Edge) => {
    console.log('验证连接:', connection)
    // 允许所有连接
    return true
  }, [])

  return (
    <div className="h-full flex flex-col bg-background">
      {/* 页面标题 - 统一标题栏（浮动） */}
      <UnifiedPageHeader
        title="猴园儿"
        subtitle="AI 炒股工作流演示"
      />
      
      {/* React Flow 画布 */}
      <div className="flex-1 w-full pt-4 relative">
        <WorkflowCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
        />
        
        {/* 悬浮聊天面板 */}
        <ChatPanel />
      </div>
    </div>
  )
}
