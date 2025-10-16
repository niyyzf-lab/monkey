import { createFileRoute } from '@tanstack/react-router'
import { UnifiedPageHeader } from '@/components/common/unified-page-header'

export const Route = createFileRoute('/pick/')({
  component: PickPage,
})

function PickPage() {
  return (
    <div className="h-full overflow-y-auto">
      {/* 页面标题 - 统一标题栏（浮动） */}
      <UnifiedPageHeader
        title="猴の自选"
        subtitle="猴子的自选股"
      />
      
      <div className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6">
        {/* 页面内容预留 */}
      </div>
    </div>
  )
}
