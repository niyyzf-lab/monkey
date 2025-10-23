import { createContext, useContext, useRef, useCallback, ReactNode, useState } from 'react'
import { AIAnalysisGroup } from '@/types/ai-analyses'

// 节点状态类型
export type NodeStatus = 'idle' | 'active' | 'completed'

// 边状态类型
export type EdgeStatus = 'idle' | 'animating' | 'completed'

// 边数据信息
export interface EdgeDataInfo {
  status: EdgeStatus
  dataText?: string  // 显示在边上的数据文本
}

interface FeelWorkflowContextType {
  // 聚焦到指定节点
  focusNode: (nodeId: string) => void
  // 注册聚焦处理器
  registerFocusHandler: (handler: (nodeId: string) => void) => void
  // 更新工作流状态（新格式）
  updateWorkflowStatus: (latestGroup: AIAnalysisGroup | null) => void
  // 获取节点状态
  getNodeStatus: (nodeId: string) => NodeStatus
  // 获取边状态
  getEdgeStatus: (edgeId: string) => EdgeStatus
  // 获取边数据文本
  getEdgeData: (edgeId: string) => string | undefined
  // 当前活跃的节点ID
  activeNodeId: string | null
  // 节点状态Map（用于监听变化）
  nodeStatusMap: Map<string, NodeStatus>
  // 边状态Map（用于监听变化）
  edgeStatusMap: Map<string, EdgeStatus>
  // 状态版本号（用于触发React更新）
  statusVersion: number
}

const FeelWorkflowContext = createContext<FeelWorkflowContextType | undefined>(undefined)

export function FeelWorkflowProvider({ children }: { children: ReactNode }) {
  const focusHandlerRef = useRef<((nodeId: string) => void) | null>(null)
  const [nodeStatusMap, setNodeStatusMap] = useState<Map<string, NodeStatus>>(new Map())
  const [edgeStatusMap, setEdgeStatusMap] = useState<Map<string, EdgeStatus>>(new Map())
  const [edgeDataMap, setEdgeDataMap] = useState<Map<string, string>>(new Map())
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)
  const [statusVersion, setStatusVersion] = useState(0) // 用于触发React更新

  const focusNode = useCallback((nodeId: string) => {
    if (focusHandlerRef.current) {
      focusHandlerRef.current(nodeId)
    }
  }, [])

  const registerFocusHandler = useCallback((handler: (nodeId: string) => void) => {
    focusHandlerRef.current = handler
  }, [])

  const updateWorkflowStatus = useCallback((latestGroup: AIAnalysisGroup | null) => {
    if (!latestGroup) {
      setNodeStatusMap(new Map())
      setEdgeStatusMap(new Map())
      setActiveNodeId(null)
      return
    }

    const newNodeStatus = new Map<string, NodeStatus>()
    const newEdgeStatus = new Map<string, EdgeStatus>()
    const newEdgeData = new Map<string, string>()

    // 工作流节点顺序
    const nodeSequence = [
      'news-trigger',      // 新闻采集
      'news-analyzer',     // 新闻分析
      'stock-selector-ai', // 选股分析
      'decision-ai',       // 交易决策
    ]

    // 判断每个节点是否已完成
    const completedSteps: boolean[] = [
      !!latestGroup.trigger, // 有触发器记录
      !!latestGroup.newsAnalyst,
      !!latestGroup.stockPicker,
      !!latestGroup.tradingExecutor,
    ]

    console.log('🔍 工作流状态调试:', {
      title: latestGroup.title,
      completedSteps,
      trigger: !!latestGroup.trigger,
      newsAnalyst: !!latestGroup.newsAnalyst,
      stockPicker: !!latestGroup.stockPicker,
      tradingExecutor: !!latestGroup.tradingExecutor,
    })

    // 找到第一个未完成的节点索引
    let firstIncompleteIndex = completedSteps.findIndex((completed) => !completed)
    if (firstIncompleteIndex === -1) {
      firstIncompleteIndex = nodeSequence.length // 全部完成
    }

    console.log('📊 第一个未完成节点索引:', firstIncompleteIndex)

    // 设置节点状态
    nodeSequence.forEach((nodeId, index) => {
      if (index < firstIncompleteIndex) {
        newNodeStatus.set(nodeId, 'completed')
      } else if (index === firstIncompleteIndex) {
        newNodeStatus.set(nodeId, 'active')
        setActiveNodeId(nodeId)
      } else {
        newNodeStatus.set(nodeId, 'idle')
      }
    })

    // 设置边状态
    // e1: news-trigger -> news-analyzer
    // e2, e3: news-analyzer -> stock-selector-ai (经过quality-check节点)
    // e5: stock-selector-ai -> decision-ai
    
    // e1的状态和数据
    if (firstIncompleteIndex >= 2) {
      // news-analyzer已完成（索引1完成）
      newEdgeStatus.set('e1', 'completed')
      console.log('✅ e1: completed')
      // 提取新闻标题的前20个字符作为数据
      const newsTitle = latestGroup.title?.substring(0, 20) || '新闻分析'
      newEdgeData.set('e1', newsTitle + (latestGroup.title.length > 20 ? '...' : ''))
    } else if (firstIncompleteIndex === 1) {
      // news-trigger完成，news-analyzer进行中
      newEdgeStatus.set('e1', 'animating')
      console.log('🔄 e1: animating')
    } else {
      // news-trigger都还没完成（不太可能）
      newEdgeStatus.set('e1', 'idle')
      console.log('⚪ e1: idle')
    }
    
    // e2, e3的状态和数据（news-analyzer -> quality-check -> stock-selector）
    if (firstIncompleteIndex >= 3) {
      // stock-selector已完成（索引2完成）
      newEdgeStatus.set('e2', 'completed')
      newEdgeStatus.set('e3', 'completed')
      console.log('✅ e2, e3: completed')
      // 尝试从record_content中提取股票代码
      const stockMatch = latestGroup.stockPicker?.record_content?.match(/([A-Z]{2,6}|\d{6})/g)
      const stockText = stockMatch ? `推荐: ${stockMatch.slice(0, 2).join(', ')}` : '选股完成'
      newEdgeData.set('e2', stockText)
      newEdgeData.set('e3', stockText)
    } else if (firstIncompleteIndex === 2) {
      // news-analyzer完成，stock-selector进行中
      newEdgeStatus.set('e2', 'animating')
      newEdgeStatus.set('e3', 'animating')
      console.log('🔄 e2, e3: animating')
    } else {
      // news-analyzer还没完成
      newEdgeStatus.set('e2', 'idle')
      newEdgeStatus.set('e3', 'idle')
      console.log('⚪ e2, e3: idle')
    }
    
    // e5的状态和数据
    if (firstIncompleteIndex >= 4) {
      // decision已完成（全部完成）
      newEdgeStatus.set('e5', 'completed')
      console.log('✅ e5: completed')
      // 尝试从record_content中提取决策信息
      const decisionMatch = latestGroup.tradingExecutor?.record_content?.match(/(买入|卖出|持有|观望)/g)
      const decisionText = decisionMatch ? `决策: ${decisionMatch[0]}` : '交易决策完成'
      newEdgeData.set('e5', decisionText)
    } else if (firstIncompleteIndex === 3) {
      // stock-selector完成，decision进行中
      newEdgeStatus.set('e5', 'animating')
      console.log('🔄 e5: animating')
    } else {
      // stock-selector还没完成
      newEdgeStatus.set('e5', 'idle')
      console.log('⚪ e5: idle')
    }

    console.log('📝 最终边状态:', {
      e1: newEdgeStatus.get('e1'),
      e2: newEdgeStatus.get('e2'),
      e3: newEdgeStatus.get('e3'),
      e5: newEdgeStatus.get('e5'),
    })

    setNodeStatusMap(newNodeStatus)
    setEdgeStatusMap(newEdgeStatus)
    setEdgeDataMap(newEdgeData)
    setStatusVersion(v => v + 1) // 强制触发更新
    
    console.log('✨ 状态已更新，版本:', statusVersion + 1)
  }, [])

  const getNodeStatus = useCallback((nodeId: string): NodeStatus => {
    return nodeStatusMap.get(nodeId) || 'idle'
  }, [nodeStatusMap])

  const getEdgeStatus = useCallback((edgeId: string): EdgeStatus => {
    return edgeStatusMap.get(edgeId) || 'idle'
  }, [edgeStatusMap])
  
  const getEdgeData = useCallback((edgeId: string): string | undefined => {
    return edgeDataMap.get(edgeId)
  }, [edgeDataMap])

  return (
    <FeelWorkflowContext.Provider value={{ 
      focusNode, 
      registerFocusHandler, 
      updateWorkflowStatus,
      getNodeStatus,
      getEdgeStatus,
      getEdgeData,
      activeNodeId,
      nodeStatusMap,
      edgeStatusMap,
      statusVersion,
    }}>
      {children}
    </FeelWorkflowContext.Provider>
  )
}

export function useFeelWorkflow() {
  const context = useContext(FeelWorkflowContext)
  if (!context) {
    throw new Error('useFeelWorkflow must be used within FeelWorkflowProvider')
  }
  return context
}

