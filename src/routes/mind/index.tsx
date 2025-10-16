import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/mind/')({
  component: MindPage,
})

function MindPage() {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4 select-none" data-tauri-drag-region>
        <h1 className="text-3xl font-bold text-gray-900">猴の觉悟</h1>
        <p className="text-gray-600 mt-2">猴子的历史记录</p>
      </div>
    </div>
  )
}
