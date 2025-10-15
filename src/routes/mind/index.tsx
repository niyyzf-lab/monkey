import { createFileRoute } from '@tanstack/react-router'
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react'

export const Route = createFileRoute('/mind/')({
  component: MindPage,
})

function MindPage() {
  const historyData = [
    { date: '2024-01-15', action: '买入', stock: 'AAPL', price: 185.50, result: '盈利', profit: '+5.2%' },
    { date: '2024-01-12', action: '卖出', stock: 'TSLA', price: 248.30, result: '亏损', profit: '-2.1%' },
    { date: '2024-01-10', action: '买入', stock: 'MSFT', price: 412.80, result: '盈利', profit: '+3.8%' },
  ]

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">猴の觉悟</h1>
        <p className="text-gray-600 mt-2">猴子的历史记录</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500">总交易次数</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">127</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500">胜率</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">68.5%</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500">累计收益</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">+23.4%</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar size={20} />
            交易历史
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-6 gap-4 p-3 bg-gray-50 rounded-lg font-medium text-sm text-gray-600">
              <span>日期</span>
              <span>操作</span>
              <span>股票</span>
              <span>价格</span>
              <span>结果</span>
              <span>收益</span>
            </div>
            {historyData.map((item, index) => (
              <div key={index} className="grid grid-cols-6 gap-4 p-3 border-b border-gray-100">
                <span className="text-gray-600">{item.date}</span>
                <span className={`font-medium ${item.action === '买入' ? 'text-green-600' : 'text-red-600'}`}>
                  {item.action}
                </span>
                <span className="font-medium">{item.stock}</span>
                <span>${item.price}</span>
                <span className={`flex items-center gap-1 ${item.result === '盈利' ? 'text-green-600' : 'text-red-600'}`}>
                  {item.result === '盈利' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {item.result}
                </span>
                <span className={`font-medium ${item.profit.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {item.profit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
