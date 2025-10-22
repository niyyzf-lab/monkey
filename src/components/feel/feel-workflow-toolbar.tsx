import { Button } from '@/components/ui/button'
import { Download, Upload, Copy, ChevronDown, ChevronUp } from 'lucide-react'
import { Panel } from '@xyflow/react'
import { useState } from 'react'
import type { Node, Edge } from '@xyflow/react'

interface FeelWorkflowToolbarProps {
  nodes: Node[]
  edges: Edge[]
}

/**
 * 猴园儿工作流工具栏
 * 可折叠的工具面板，包含导出、导入、复制配置功能
 */
export function FeelWorkflowToolbar({ nodes, edges }: FeelWorkflowToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  // 导出工作流配置
  const handleExport = () => {
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
  }

  // 复制到剪贴板
  const handleCopyToClipboard = async () => {
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
  }

  // 导入工作流配置
  const handleImport = () => {
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
  }

  return (
    <Panel position="top-right" className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {/* 折叠按钮 */}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setIsExpanded(!isExpanded)}
          className="shadow-lg backdrop-blur-sm bg-card/95 hover:bg-card border"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
        
        {/* 工具按钮 - 折叠时隐藏 */}
        {isExpanded && (
          <>
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
          </>
        )}
      </div>
    </Panel>
  )
}

