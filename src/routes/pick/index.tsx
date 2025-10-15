import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pick/')({
  component: PickPage,
})

function PickPage() {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">猴の自选</h1>
        <p className="text-gray-600 mt-2">猴子的自选股</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">自选股票列表</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">股票代码</span>
              <span className="font-medium">当前价格</span>
              <span className="font-medium">涨跌幅</span>
            </div>
            <p className="text-gray-600 text-center py-8">暂无自选股票数据</p>
          </div>
        </div>
      </div>
    </div>
  )
}
