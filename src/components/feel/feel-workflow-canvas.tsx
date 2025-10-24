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
import type { AIAnalysisRecord } from '@/types/ai-analyses'

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
  const [animationStep, setAnimationStep] = useState(0) // 当前动画步骤 (0-4)
  const [targetStep, setTargetStep] = useState(0) // 目标步骤（根据数据确定）
  const [isNewsSkipped, setIsNewsSkipped] = useState(false) // 是否跳过新闻

  // 直接在Canvas加载AI数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const group = await fetchLatestAIAnalysisGroup()
        if (group) {
          setLatestGroup(group)
        }
      } catch (error) {
        console.error('加载 AI 分析数据失败:', error)
      }
    }
    loadData()
  }, [])

  // 分析数据并确定目标步骤
  useEffect(() => {
    if (!latestGroup) return
    
    // latestGroup 是 AIAnalysisGroup 对象，包含 records 数组
    const records = latestGroup.records || []
    
    console.log('📊 工作流数据解析:', {
      title: latestGroup.title,
      recordsCount: records.length,
      records: records.map((r: AIAnalysisRecord) => ({ id: r.id, type: r.type, category: r.category }))
    })
    
    // 根据 category 字段判断各阶段是否完成
    const hasTrigger = records.some((r: AIAnalysisRecord) => r.type === '触发器' || r.category === 'undefined')
    const newsAnalysisRecord = records.find((r: AIAnalysisRecord) => r.category === '新闻分析')
    const hasNewsAnalysis = !!newsAnalysisRecord
    
    // 检查新闻分析是否被跳过（additional_info 有内容表示跳过）
    const skipped = newsAnalysisRecord?.additional_info && newsAnalysisRecord.additional_info.trim() !== ''
    
    const hasStockPicking = records.some((r: AIAnalysisRecord) => 
      r.category === '新闻选股' || 
      r.category === '选股分析' || 
      r.category === '关键字选股查询'
    )
    const hasDecision = records.some((r: AIAnalysisRecord) => 
      r.category === '决策AI' || 
      r.category === '交易决策'
    )
    
    console.log('✅ 工作流完成状态:', {
      hasTrigger,
      hasNewsAnalysis,
      isNewsSkipped: skipped,
      hasStockPicking,
      hasDecision
    })
    
    // 计算目标步骤 (step 映射到实际工作流节点)
    let target: number
    if (!hasTrigger) {
      target = 0 // 还没开始
    } else if (!hasNewsAnalysis) {
      target = 1 // 触发器→新闻分析
    } else if (skipped) {
      // 新闻被跳过，走 false 分支到 idle-node
      target = 4 // 播放到 step 4 让 idle-node 从 active(step3) → completed(step4)
      console.log('⏭️ 新闻分析判断跳过，走向 false 分支（idle-node）')
    } else if (!hasStockPicking) {
      target = 2 // 新闻分析→质量检查（但没有选股）
    } else if (!hasDecision) {
      target = 3 // 质量检查→选股
    } else {
      target = 4 // 选股→决策，全部完成
    }
    
    console.log('🎯 目标执行索引:', target, '(0=触发, 1=分析, 2=检查, 3=选股/idle, 4=决策)')
    
    // 设置目标步骤和跳过状态
    setTargetStep(target)
    setIsNewsSkipped(skipped)
    // 重置动画步骤，从0开始播放
    setAnimationStep(0)
  }, [latestGroup])
  
  // 动画播放：逐步推进到目标步骤
  useEffect(() => {
    if (animationStep >= targetStep) return
    
    // 根据不同阶段设置不同的延迟时间
    let delay: number
    
    if (isNewsSkipped && animationStep >= 2) {
      // 跳过流程：quality-check 判断完成后快速结束
      delay = 1500 // 1.5秒快速结束
    } else {
      // 正常流程：给足时间看小火车动画
      delay = 4000 // 4秒，可以看完小火车主体动画
    }
    
    const timer = setTimeout(() => {
      setAnimationStep(prev => prev + 1)
      console.log('🎬 动画步骤:', animationStep + 1, '/', targetStep, isNewsSkipped ? '(跳过模式)' : '')
    }, delay)
    
    return () => clearTimeout(timer)
  }, [animationStep, targetStep, isNewsSkipped])
  
  // 根据当前动画步骤更新节点和边状态
  useEffect(() => {
    if (!latestGroup) return
    
    const records = latestGroup.records || []

    // 更新节点状态 - 根据animationStep
    setNodes((nds) => nds.map((node) => {
      const nodeIndex = ['news-trigger', 'news-analyzer', 'stock-selector-ai', 'decision-ai'].indexOf(node.id)
      let status: 'idle' | 'active' | 'completed' = 'idle'
      
      if (nodeIndex !== -1) {
        // 如果新闻被跳过，选股AI(index=2)和决策AI(index=3)保持idle
        if (isNewsSkipped && nodeIndex >= 2) {
          status = 'idle'
        } else {
          if (nodeIndex < animationStep) status = 'completed'
          else if (nodeIndex === animationStep) status = 'active'
          else status = 'idle'
        }
      }
      
      // 特殊处理：news-quality-check 和 idle-node
      if (node.id === 'news-quality-check') {
        // step 2 时: quality-check active
        // step > 2: quality-check completed
        if (animationStep > 2) {
          status = 'completed'
        } else if (animationStep === 2) {
          status = 'active'
        } else {
          status = 'idle'
        }
      } else if (node.id === 'idle-node') {
        // 如果新闻被跳过:
        // step 3: idle-node active（接收e4数据）
        // step > 3: idle-node completed
        if (isNewsSkipped) {
          if (animationStep > 3) {
            status = 'completed'
          } else if (animationStep === 3) {
            status = 'active'
          } else {
            status = 'idle'
          }
        } else {
          status = 'idle'
        }
      }

      return {
        ...node,
        data: { 
          ...node.data, 
          workflowStatus: status 
        }
      } 
    }))

    // 更新边状态 - 根据animationStep
    setEdges((eds) => eds.map((edge) => {
      let status: 'idle' | 'animating' | 'completed' = 'idle'
      let dataText: string | undefined

      // 获取各阶段记录数据
      const triggerRecord = records.find((r: AIAnalysisRecord) => r.type === '触发器')
      const newsAnalysisRec = records.find((r: AIAnalysisRecord) => r.category === '新闻分析')
      const stockPickingRecord = records.find((r: AIAnalysisRecord) => 
        r.category === '新闻选股' || r.category === '选股分析'
      )
      const decisionRecord = records.find((r: AIAnalysisRecord) => 
        r.category === '决策AI' || r.category === '交易决策'
      )

      // e1: news-trigger -> news-analyzer
      // step 0: 开始时就 animating
      // step >= 1: analyzer激活时，e1完成
      if (edge.id === 'e1') {
        if (animationStep >= 1) {
          status = 'completed'
          const title = triggerRecord?.title || ''
          dataText = title.substring(0, 30) + (title.length > 30 ? '...' : '')
        } else if (animationStep === 0) {
          status = 'animating'
          const title = triggerRecord?.title || '新闻数据正在传输中'
          dataText = title.substring(0, 25) + (title.length > 25 ? '...' : '')
        }
      }
      
      // e2: news-analyzer -> news-quality-check
      // step 1: analyzer激活时，e2开始 animating
      // step >= 2: quality-check激活时，e2完成
      else if (edge.id === 'e2') {
        if (animationStep >= 2) {
          status = 'completed'
          // 如果新闻被跳过，显示跳过原因
          if (isNewsSkipped && newsAnalysisRec?.additional_info) {
            const skipReason = newsAnalysisRec.additional_info
            dataText = skipReason.substring(0, 30) + (skipReason.length > 30 ? '...' : '')
          } else {
            dataText = '新闻分析报告已生成完成'
          }
        } else if (animationStep === 1) {
          status = 'animating'
          dataText = '正在分析新闻内容和市场影响'
        }
      }
      
      // e3: news-quality-check -> stock-selector (true分支)
      // step 2: quality-check判断时，e3开始 animating
      // step >= 3: stock-selector激活时，e3完成
      else if (edge.id === 'e3') {
        // 只有不跳过时才走这条边
        if (!isNewsSkipped) {
          if (animationStep >= 3) {
            status = 'completed'
            // 从选股记录中提取股票代码
            const content = stockPickingRecord?.additional_info || stockPickingRecord?.record_content || ''
            const stockMatch = content.match(/([A-Z]{2,6}|[0-9]{6})/g)
            dataText = stockMatch ? `已选出${stockMatch.slice(0, 3).join('、')}等目标股票` : '股票筛选已完成'
          } else if (animationStep === 2) {
            status = 'animating'
            dataText = '正在筛选优质股票和分析基本面'
          }
          // animationStep < 2: 保持 idle
        }
      }
      
      // e4: news-quality-check -> idle-node (false分支)
      // step 2: quality-check判断时，e4开始 animating
      // step >= 3: idle-node激活时，e4完成
      else if (edge.id === 'e4') {
        // 只有跳过时才走这条边
        if (isNewsSkipped) {
          if (animationStep >= 3) {
            status = 'completed'
            if (newsAnalysisRec?.additional_info) {
              const skipReason = newsAnalysisRec.additional_info
              dataText = skipReason.substring(0, 30) + (skipReason.length > 30 ? '...' : '')
            } else {
              dataText = '新闻质量不符合要求已跳过'
            }
          } else if (animationStep === 2) {
            status = 'animating'
            if (newsAnalysisRec?.additional_info) {
              const skipReason = newsAnalysisRec.additional_info
              dataText = skipReason.substring(0, 30) + (skipReason.length > 30 ? '...' : '')
            } else {
              dataText = '质量检查判断为跳过'
            }
          }
          // animationStep < 2: 保持 idle
        }
      }
      
      // e5: stock-selector -> decision
      // step 3: stock-selector激活时，e5开始 animating
      // step >= 4: decision激活时，e5完成
      else if (edge.id === 'e5') {
        // 如果新闻被跳过，这条边保持 idle
        if (!isNewsSkipped) {
          if (animationStep >= 4) {
            status = 'completed'
            // 从决策记录中提取决策结果
            const content = decisionRecord?.record_content || ''
            const decisionMatch = content.match(/(买入|卖出|持有|观望|拒绝)/g)
            dataText = decisionMatch ? `决策结果为${decisionMatch[0]}策略` : '交易决策已完成'
          } else if (animationStep === 3) {
            status = 'animating'
            dataText = '正在进行交易决策和风险评估'
          }
        }
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
  }, [animationStep, isNewsSkipped, latestGroup, setNodes, setEdges])

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

