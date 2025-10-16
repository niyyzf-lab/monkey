import { createFileRoute } from '@tanstack/react-router'
import { UnifiedPageHeader } from '@/components/common/unified-page-header'

export const Route = createFileRoute('/chat/')({
  component: ChatPage,
})

function ChatPage() {
  return (
    <div className="h-full overflow-y-auto">
      {/* 页面标题 - 统一标题栏（浮动） */}
      <UnifiedPageHeader
        title="与猴聊聊天"
        subtitle="与猴子聊天互动"
      />
      
      <div className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6">
        {/* 页面内容预留 */}
      </div>
    </div>
  )
}
