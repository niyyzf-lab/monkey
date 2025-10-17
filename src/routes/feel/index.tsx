import { createFileRoute } from '@tanstack/react-router'
import { useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  BackgroundVariant,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { UnifiedPageHeader } from '@/components/common/unified-page-header'
import { WorkflowNode } from '@/components/flow/workflow-node'
import { AnimatedGradientEdge } from '@/components/flow/animated-gradient-edge'
import workflowData from '@/constants/ai-workflow.json'

export const Route = createFileRoute('/feel/')({
  component: FeelPage,
})

// 节点类型映射
const nodeTypes = {
  workflowNode: WorkflowNode,
}

// 边类型映射
const edgeTypes = {
  animatedGradient: AnimatedGradientEdge,
}

// 转换工作流数据为 React Flow 格式
const convertWorkflowData = () => {
  const nodes: Node[] = workflowData.nodes.map((node) => ({
    id: node.id,
    type: 'workflowNode',
    position: node.position,
    data: { 
      label: node.data.label,
      description: node.data.description,
      type: node.type,
    },
  }))

  const edges: Edge[] = workflowData.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.type,
    animated: edge.animated,
    data: { label: edge.label },
  }))

  return { nodes, edges }
}

const { nodes: initialNodes, edges: initialEdges } = convertWorkflowData()

/**
 * 猴园儿页面 - AI 工作流可视化
 * 展示 AI 炒股系统的工作流程
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
        subtitle="AI 炒股工作流演示"
      />
      
      {/* React Flow 画布 */}
      <div className="flex-1 w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          fitViewOptions={{
            padding: 0.2,
          }}
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={16} 
            size={1}
          />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}
