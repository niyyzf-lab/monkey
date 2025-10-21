import {
  ReactFlow,
  Background,
  BackgroundVariant,
  ConnectionMode,
  ConnectionLineType,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Connection,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { edgeTypes, nodeTypes } from './feel-workflow-types'
import { WorkflowToolbar } from './feel-workflow-toolbar'

interface WorkflowCanvasProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  isValidConnection: (connection: Connection | Edge) => boolean
}

/**
 * 工作流画布组件
 * React Flow 的主渲染容器
 */
export function WorkflowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  isValidConnection,
}: WorkflowCanvasProps) {
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
        // 缩放范围限制，避免过度缩放导致模糊
        minZoom: 0.5,
        maxZoom: 1.5,
      }}
      // 缩放范围设置 - 防止过度缩放
      minZoom={0.3}
      maxZoom={2}
      // 确保所有连接都能正确渲染
      defaultEdgeOptions={{
        style: { strokeWidth: 2 },
      }}
      // 连接线验证
      isValidConnection={isValidConnection}
      // 连接配置
      connectionMode={ConnectionMode.Loose}
      // 连接线类型
      connectionLineType={ConnectionLineType.Bezier}
      // 连接线样式
      connectionLineStyle={{ stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
      // 优化渲染性能和清晰度
      elevateNodesOnSelect={true}
      // 平移范围限制
      translateExtent={[
        [-2000, -2000],
        [4000, 4000],
      ]}
      // 节点拖拽范围
      nodeExtent={[
        [-2000, -2000],
        [4000, 4000],
      ]}
    >
      <Background 
        variant={BackgroundVariant.Dots} 
        gap={16} 
        size={1}
        // 背景颜色与主题保持一致
        style={{
          opacity: 0.5,
        }}
      />
      
      {/* 工具面板 */}
      <WorkflowToolbar nodes={nodes} edges={edges} />
    </ReactFlow>
  )
}

