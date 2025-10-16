import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pick/')({
  component: PickPage,
})

function PickPage() {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4 select-none" data-tauri-drag-region>
        <h1 className="text-3xl font-bold text-gray-900" data-tauri-drag-region>猴の自选</h1>
        <p className="text-gray-600 mt-2" data-tauri-drag-region>猴子的自选股</p>
      </div>
    </div>
  )
}
