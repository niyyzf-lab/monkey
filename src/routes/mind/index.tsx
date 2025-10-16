import { createFileRoute } from '@tanstack/react-router'
import { UnifiedPageHeader } from '@/components/common/unified-page-header'

export const Route = createFileRoute('/mind/')({
  component: MindPage,
})

function MindPage() {
  return (
    <div className="h-full overflow-y-auto">
      {/* 页面标题 - 统一标题栏（浮动） */}
      <UnifiedPageHeader
        title="猴の觉悟"
        subtitle="猴子的历史记录"
      />
      
      <div className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6">
        {/* 页面内容预留 */}
      </div>
    </div>
  )
}
