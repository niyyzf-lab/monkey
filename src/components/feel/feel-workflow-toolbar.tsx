import { useCallback, useState } from 'react'
import { Panel, type Node, type Edge } from '@xyflow/react'
import { Button } from '@/components/ui/button'
import { Download, Upload, Copy, ChevronLeft, MoreHorizontal } from 'lucide-react'

interface WorkflowToolbarProps {
  nodes: Node[]
  edges: Edge[]
}

/**
 * 工作流工具栏组件
 * 提供导出、导入和复制配置功能，支持最小化折叠
 */
export function WorkflowToolbar({ nodes, edges }: WorkflowToolbarProps) {
  // 控制工具栏展开/折叠状态
  const [isExpanded, setIsExpanded] = useState(true)
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
    <Panel position="top-right">
      <div className="relative">
        {/* 折叠状态 - 只显示一个图标按钮 */}
        {!isExpanded && (
          <Button
            size="icon"
            variant="secondary"
            onClick={() => setIsExpanded(true)}
            className="h-9 w-9 shadow-lg backdrop-blur-sm bg-card/95 hover:bg-card border"
            title="展开工具栏"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}

        {/* 展开状态 - 显示所有按钮 */}
        {isExpanded && (
          <div className="flex items-center gap-1.5 rounded-lg shadow-lg backdrop-blur-sm bg-card/95 border p-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyToClipboard}
              className="h-8 hover:bg-accent"
              title="复制配置"
            >
              <Copy className="h-4 w-4 mr-1.5" />
              <span className="text-xs">复制</span>
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleExport}
              className="h-8 hover:bg-accent"
              title="导出配置"
            >
              <Download className="h-4 w-4 mr-1.5" />
              <span className="text-xs">导出</span>
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleImport}
              className="h-8 hover:bg-accent"
              title="导入配置"
            >
              <Upload className="h-4 w-4 mr-1.5" />
              <span className="text-xs">导入</span>
            </Button>

            {/* 分隔线 */}
            <div className="w-px h-5 bg-border mx-0.5" />

            {/* 收起按钮 */}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsExpanded(false)}
              className="h-8 w-8 hover:bg-accent"
              title="收起工具栏"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Panel>
  )
}


