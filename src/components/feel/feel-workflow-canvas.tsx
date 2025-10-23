import { useCallback, useEffect, useState } from 'react'
import {
  ReactFlow,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
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
import { useFeelWorkflow } from './feel-workflow-context'
import type { Node } from '@xyflow/react'
import workflowData from '@/constants/ai-workflow.json'
import { fetchLatestAIAnalysisGroup } from '@/api/ai-analyses-api'

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
 * React Flow 内部组件 - 用于访问 useReactFlow hook
 */
function FlowContent({ nodes, edges }: { 
  nodes: Node[]
  edges: Edge[]
}) {
  const { setCenter, getNode } = useReactFlow()
  const { registerFocusHandler, updateWorkflowStatus } = useFeelWorkflow()
  const [hasLoadedData, setHasLoadedData] = useState(false)

  // 加载 AI 分析数据
  useEffect(() => {
    if (hasLoadedData) return

    const loadData = async () => {
      try {
        const latestGroup = await fetchLatestAIAnalysisGroup()
        if (latestGroup) {
          // 更新工作流状态
          updateWorkflowStatus(latestGroup)
          setHasLoadedData(true)
        }
      } catch (error) {
        console.error('加载 AI 分析数据失败:', error)
      }
    }

    loadData()
  }, [hasLoadedData, updateWorkflowStatus])

  // 注册节点聚焦处理器
  useEffect(() => {
    registerFocusHandler((nodeId: string) => {
      const node = getNode(nodeId)
      if (node) {
        setCenter(node.position.x + 100, node.position.y + 50, { 
          zoom: 1.2, 
          duration: 1500  // 增加到 1.5 秒，让聚焦动画更慢更平滑
        })
      }
    })
  }, [registerFocusHandler, setCenter, getNode])

  return (
    <>
      <Background 
        variant={BackgroundVariant.Dots} 
        gap={16} 
        size={1}
      />
      
      {/* 工具栏 - 可折叠 */}
      <FeelWorkflowToolbar nodes={nodes} edges={edges} />
    </>
  )
}

/**
 * 猴园儿工作流画布
 * React Flow 可视化画布组件
 */
export function FeelWorkflowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [latestGroup, setLatestGroup] = useState<any>(null)

  // 直接在Canvas加载AI数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const group = await fetchLatestAIAnalysisGroup()
        if (group) {
          console.log('📊 加载最新分析数据:', group.title)
          setLatestGroup(group)
        }
      } catch (error) {
        console.error('加载 AI 分析数据失败:', error)
      }
    }
    loadData()
  }, [])

  // 根据最新数据更新节点和边状态
  useEffect(() => {
    if (!latestGroup) return

    console.log('🔍 更新工作流状态:', {
      title: latestGroup.title,
      trigger: !!latestGroup.trigger,
      newsAnalyst: !!latestGroup.newsAnalyst,
      stockPicker: !!latestGroup.stockPicker,
      tradingExecutor: !!latestGroup.tradingExecutor,
    })

    // 计算完成步骤
    const completedSteps = [
      !!latestGroup.trigger,
      !!latestGroup.newsAnalyst,
      !!latestGroup.stockPicker,
      !!latestGroup.tradingExecutor,
    ]
    const firstIncompleteIndex = completedSteps.findIndex(c => !c)
    const actualIndex = firstIncompleteIndex === -1 ? 4 : firstIncompleteIndex

    console.log('📊 第一个未完成索引:', actualIndex)

    // 更新节点状态 - 只修改 data，不修改 style
    setNodes((nds) => nds.map((node) => {
      const nodeIndex = ['news-trigger', 'news-analyzer', 'stock-selector-ai', 'decision-ai'].indexOf(node.id)
      let status: 'idle' | 'active' | 'completed' = 'idle'
      
      if (nodeIndex !== -1) {
        if (nodeIndex < actualIndex) status = 'completed'
        else if (nodeIndex === actualIndex) status = 'active'
        else status = 'idle'
      }

      return {
        ...node,
        data: { 
          ...node.data, 
          workflowStatus: status 
        }
      }
    }))

    // 更新边状态 - 只修改 data，不修改 style 和 animated
    setEdges((eds) => eds.map((edge) => {
      let status: 'idle' | 'animating' | 'completed' = 'idle'
      let dataText: string | undefined

      // e1: news-trigger -> news-analyzer
      if (edge.id === 'e1') {
        if (actualIndex >= 2) {
          status = 'completed'
          dataText = latestGroup.title?.substring(0, 20) + (latestGroup.title.length > 20 ? '...' : '')
        } else if (actualIndex === 1) {
          status = 'animating'
        }
        console.log(`✅ e1 (trigger->analyzer): actualIndex=${actualIndex}, status=${status}`)
      }
      
      // e2: news-analyzer -> news-quality-check
      else if (edge.id === 'e2') {
        if (actualIndex >= 2) {
          status = 'completed'
          dataText = '新闻分析完成'
        } else if (actualIndex === 1) {
          status = 'animating'
        }
        console.log(`✅ e2 (analyzer->quality): actualIndex=${actualIndex}, status=${status}`)
      }
      
      // e3: news-quality-check -> stock-selector
      else if (edge.id === 'e3') {
        if (actualIndex >= 3) {
          status = 'completed'
          const stockMatch = latestGroup.stockPicker?.record_content?.match(/([A-Z]{2,6}|\d{6})/g)
          dataText = stockMatch ? `推荐: ${stockMatch.slice(0, 2).join(', ')}` : '选股完成'
        } else if (actualIndex === 2) {
          status = 'animating'
        }
        console.log(`✅ e3 (quality->selector): actualIndex=${actualIndex}, status=${status}`)
      }
      
      // e5: stock-selector -> decision
      else if (edge.id === 'e5') {
        if (actualIndex >= 4) {
          status = 'completed'
          const decisionMatch = latestGroup.tradingExecutor?.record_content?.match(/(买入|卖出|持有|观望)/g)
          dataText = decisionMatch ? `决策: ${decisionMatch[0]}` : '交易决策完成'
        } else if (actualIndex === 3) {
          status = 'animating'
        }
        console.log(`✅ e5 (selector->decision): actualIndex=${actualIndex}, status=${status}`)
      }
      
      // 其他边保持 idle 状态
      else {
        console.log(`⚪ ${edge.id} (其他): status=idle`)
      }

      // 只更新 data，让边组件自己根据 workflowStatus 决定样式
      return {
        ...edge,
        data: {
          ...edge.data,
          workflowStatus: status,
          dataText,
        }
      }
    }))
  }, [latestGroup, setNodes, setEdges])

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
      <FlowContent 
        nodes={nodes}
        edges={edges}
      />
    </ReactFlow>
  )
}

