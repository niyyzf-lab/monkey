import { createFileRoute } from '@tanstack/react-router'
import { UnifiedPageHeader } from '@/components/common/unified-page-header'
import { EmptyState } from '@/components/common/empty-state'
import { MessageCircle } from 'lucide-react'

export const Route = createFileRoute('/chat/')({
  component: ChatPage,
})

function ChatPage() {
  return (
    <div className="h-full overflow-y-auto flex flex-col">
      {/* 页面标题 - 统一标题栏（浮动） */}
      <UnifiedPageHeader
        title="与猴聊聊天"
        subtitle="与猴子聊天互动"
      />
      
      <div className="flex-1">
        <EmptyState
          icon={MessageCircle}
          title="功能开发中"
          description="AI 聊天功能即将上线，敬请期待"
        />
      </div>
    </div>
  )
}
