import { createLazyFileRoute } from '@tanstack/react-router'
import { UnifiedPageHeader } from '@/components/common/unified-page-header'
import { EmptyState } from '@/components/common/empty-state'
import { History } from 'lucide-react'

export const Route = createLazyFileRoute('/mind/')({
  component: MindPage,
})

function MindPage() {
  return (
    <div className="h-full overflow-y-auto flex flex-col">
      {/* 页面标题 - 统一标题栏（浮动） */}
      <UnifiedPageHeader
        title="猴の觉悟"
        subtitle="猴子的历史记录"
      />
      
      <div className="flex-1">
        <EmptyState
          icon={History}
          title="功能开发中"
          description="历史记录功能即将上线，敬请期待"
        />
      </div>
    </div>
  )
}

