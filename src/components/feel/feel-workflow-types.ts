import { type Node, type Edge } from '@xyflow/react'
import { AnimatedGradientEdge } from '@/components/flow/animated-gradient-edge'
import { BezierEdge } from '@/components/flow/bezier-edge'
import { ModuleNode } from '@/components/flow/module-node'
import { FunctionNode } from '@/components/flow/function-node'
import { IfNode } from '@/components/flow/if-node'
import { IdleNode } from '@/components/flow/idle-node'
import { ToolAINode } from '@/components/flow/tool-ai-node'
import workflowData from '@/constants/ai-workflow.json'

// 边类型映射
export const edgeTypes = {
  animatedGradient: AnimatedGradientEdge,
  bezier: BezierEdge,
}

// 节点类型映射
export const nodeTypes = {
  moduleNode: ModuleNode as any,
  functionNode: FunctionNode as any,
  'if-node': IfNode as any,
  'idle-node': IdleNode as any,
  'ai-agent': ModuleNode as any, // ai-agent 使用 ModuleNode
  'function': FunctionNode as any, // function 使用 FunctionNode
  'tool-ai': ToolAINode as any, // tool-ai 使用 ToolAINode
}

// 转换工作流数据为 React Flow 格式
export const convertWorkflowData = () => {
  const nodes: Node[] = workflowData.nodes.map((node) => ({
    id: node.id,
    type: node.type, // 直接使用 JSON 中的 type 字段
    position: node.position,
    data: node.data, // 直接使用原始数据，已经包含 label
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
    
    // 如果有 sourceHandle，添加它
    if (edge.sourceHandle) {
      edgeConfig.sourceHandle = edge.sourceHandle
    }
    
    return edgeConfig
  })

  return { nodes, edges }
}

