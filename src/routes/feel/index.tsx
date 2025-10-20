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
  Panel,
  ConnectionMode,
  ConnectionLineType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { UnifiedPageHeader } from '@/components/common/unified-page-header'
import { AnimatedGradientEdge } from '@/components/flow/animated-gradient-edge'
import { BezierEdge } from '@/components/flow/bezier-edge'
import { ModuleNode } from '@/components/flow/module-node'
import { FunctionNode } from '@/components/flow/function-node'
import { IfNode } from '@/components/flow/if-node'
import { IdleNode } from '@/components/flow/idle-node'
import { ToolAINode } from '@/components/flow/tool-ai-node'
import { Button } from '@/components/ui/button'
import { Download, Upload, Copy } from 'lucide-react'
import workflowData from '@/constants/ai-workflow.json'
export const Route = createFileRoute('/feel/')({
  component: FeelPage,
})

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
  'ai-agent': ModuleNode as any, // ai-agent 使用 ModuleNode
  'function': FunctionNode as any, // function 使用 FunctionNode
  'tool-ai': ToolAINode as any, // tool-ai 使用 ToolAINode
}

// 转换工作流数据为 React Flow 格式
const convertWorkflowData = () => {
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

  // 导出工作流配置
  const handleExport = useCallback(() => {
    const exportData = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type, // 保持原始类型
        position: node.position,
        data: node.data,
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        type: edge.type,
        animated: edge.animated,
        label: edge.data?.label || '',
      })),
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `workflow-${new Date().getTime()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    alert('导出成功：工作流配置已下载')
  }, [nodes, edges])

  // 复制到剪贴板
  const handleCopyToClipboard = useCallback(async () => {
    const exportData = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        type: edge.type,
        animated: edge.animated,
        label: edge.data?.label || '',
      })),
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    
    try {
      await navigator.clipboard.writeText(dataStr)
      alert('复制成功：工作流配置已复制到剪贴板')
    } catch (error) {
      console.error('复制失败:', error)
      alert('复制失败：无法访问剪贴板')
    }
  }, [nodes, edges])

  // 导入工作流配置
  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const importedData = JSON.parse(event.target?.result as string)
            console.log('导入的工作流数据:', importedData)
            // 这里可以添加数据验证和转换逻辑
            alert('导入成功：工作流导入成功！刷新页面查看新配置。')
          } catch (error) {
            console.error('导入失败:', error)
            alert('导入失败：文件格式错误')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }, [])

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
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={16} 
            size={1}
          />
          <Controls />
          
          {/* 工具面板 */}
          <Panel position="top-right" className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopyToClipboard}
              className="shadow-lg backdrop-blur-sm bg-card/95 hover:bg-card border"
            >
              <Copy className="w-4 h-4 mr-1.5" />
              复制配置
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleExport}
              className="shadow-lg backdrop-blur-sm bg-card/95 hover:bg-card border"
            >
              <Download className="w-4 h-4 mr-1.5" />
              导出工作流
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleImport}
              className="shadow-lg backdrop-blur-sm bg-card/95 hover:bg-card border"
            >
              <Upload className="w-4 h-4 mr-1.5" />
              导入工作流
            </Button>
          </Panel>

          {/* 信息面板 */}
          <Panel position="bottom-left" className="bg-card/95 backdrop-blur-sm rounded-lg border shadow-lg p-3">
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">节点数:</span>
                <span className="font-semibold text-foreground">{nodes.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">连接数:</span>
                <span className="font-semibold text-foreground">{edges.length}</span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  )
}
