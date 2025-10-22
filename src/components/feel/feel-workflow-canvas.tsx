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
  ConnectionMode,
  ConnectionLineType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { AnimatedGradientEdge } from '@/components/flow/animated-gradient-edge'
import { BezierEdge } from '@/components/flow/bezier-edge'
import { ModuleNode } from '@/components/flow/module-node'
import { FunctionNode } from '@/components/flow/function-node'
import { IfNode } from '@/components/flow/if-node'
import { IdleNode } from '@/components/flow/idle-node'
import { ToolAINode } from '@/components/flow/tool-ai-node'
import { FeelWorkflowToolbar } from './feel-workflow-toolbar'
import type { Node } from '@xyflow/react'
import workflowData from '@/constants/ai-workflow.json'

// 边类型映射
const edgeTypes = {
  animatedGradient: AnimatedGradientEdge,
  bezier: BezierEdge,
}

// 节点类型映射
const nodeTypes = {
  moduleNode: ModuleNode as any,
  functionNode: FunctionNode as any,
  'if-node': IfNode as any,
  'idle-node': IdleNode as any,
  'ai-agent': ModuleNode as any,
  'function': FunctionNode as any,
  'tool-ai': ToolAINode as any,
}

// 转换工作流数据为 React Flow 格式
const convertWorkflowData = () => {
  const nodes: Node[] = workflowData.nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.data,
  }))

  const edges: Edge[] = workflowData.edges.map((edge: any) => {
    const edgeConfig: Edge = {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      animated: edge.animated,
      data: { label: edge.label },
    }
    
    if (edge.sourceHandle) {
      edgeConfig.sourceHandle = edge.sourceHandle
    }
    
    return edgeConfig
  })

  return { nodes, edges }
}

const { nodes: initialNodes, edges: initialEdges } = convertWorkflowData()

/**
 * 猴园儿工作流画布
 * React Flow 可视化画布组件
 */
export function FeelWorkflowCanvas() {
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
    return true
  }, [])

  return (
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
      defaultEdgeOptions={{
        style: { strokeWidth: 2 },
      }}
      isValidConnection={isValidConnection}
      connectionMode={ConnectionMode.Loose}
      connectionLineType={ConnectionLineType.Bezier}
      connectionLineStyle={{ stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
    >
      <Background 
        variant={BackgroundVariant.Dots} 
        gap={16} 
        size={1}
      />
      
      {/* 工具栏 - 可折叠 */}
      <FeelWorkflowToolbar nodes={nodes} edges={edges} />
    </ReactFlow>
  )
}

