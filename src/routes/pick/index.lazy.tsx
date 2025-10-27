import { createLazyFileRoute } from '@tanstack/react-router'
import { UnifiedPageHeader } from '@/components/common/unified-page-header'
import { EmptyState } from '@/components/common/empty-state'
import { Star } from 'lucide-react'

export const Route = createLazyFileRoute('/pick/')({
  component: PickPage,
})

function PickPage() {
  return (
    <div className="h-full overflow-y-auto flex flex-col">
      {/* 页面标题 - 统一标题栏（浮动） */}
      <UnifiedPageHeader
        title="猴の自选"
        subtitle="猴子的自选股"
      />
      
      <div className="flex-1">
        <EmptyState
          icon={Star}
          title="功能开发中"
          description="自选股功能即将上线，敬请期待"
        />
      </div>
    </div>
  )
}

