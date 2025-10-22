import { createFileRoute } from '@tanstack/react-router'
import { UnifiedPageHeader } from '@/components/common/unified-page-header'
import { FeelWorkflowCanvas, FeelWorkflowChat } from '@/components/feel'

export const Route = createFileRoute('/feel/')({
  component: FeelPage,
})

/**
 * 猴园儿页面 - AI 工作流可视化
 * 展示 AI 炒股系统的工作流程
 */
function FeelPage() {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* 页面标题 - 统一标题栏（浮动） */}
      <UnifiedPageHeader
        title="猴园儿"
        subtitle="AI 炒股工作流演示"
      />
      
      {/* React Flow 画布 */}
      <div className="flex-1 w-full pt-4">
        <FeelWorkflowCanvas />
      </div>

      {/* 悬浮聊天面板 */}
      <FeelWorkflowChat />
    </div>
  )
}
