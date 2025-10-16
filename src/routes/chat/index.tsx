import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Send } from 'lucide-react'

export const Route = createFileRoute('/chat/')({
  component: ChatPage,
})

function ChatPage() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{id: number, text: string, sender: 'user' | 'monkey'}>>([])

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages(prev => [...prev, { id: Date.now(), text: message, sender: 'user' }])
      setMessage('')
      // 模拟猴子回复
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now() + 1, text: '🐒 猴子正在思考中...', sender: 'monkey' }])
      }, 1000)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">与猴聊天</h1>
        <p className="text-gray-600 mt-2">与猴子聊天互动</p>
      </div>
      
      <div className="flex-1 bg-white rounded-lg shadow-sm border flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>🐒 猴子在这里等你聊天呢！</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="输入消息..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
