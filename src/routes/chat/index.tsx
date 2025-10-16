import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/chat/')({
  component: ChatPage,
})

function ChatPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b pb-4 mb-6 select-none" data-tauri-drag-region>
        <h1 className="text-3xl font-bold text-gray-900" data-tauri-drag-region>与猴聊天</h1>
        <p className="text-gray-600 mt-2" data-tauri-drag-region>与猴子聊天互动</p>
      </div>
    </div>
  )
}
