import { createFileRoute } from '@tanstack/react-router'
import { User, Bell, Shield, Palette, Globe, Rocket } from 'lucide-react'
import { UpdateButton } from '@/components/updater'
import { getVersion } from '@tauri-apps/api/app'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/settings/')({
  component: SettingsPage,
})

function SettingsPage() {
  const [appVersion, setAppVersion] = useState<string>('加载中...')

  useEffect(() => {
    getVersion().then(version => setAppVersion(version)).catch(() => setAppVersion('未知'))
  }, [])

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">倒腾</h1>
        <p className="text-gray-600 mt-2">系统倒腾设置</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="text-blue-500" size={24} />
              <h2 className="text-xl font-semibold">账户设置</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                <input
                  type="text"
                  defaultValue="猴子投资者"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input
                  type="email"
                  defaultValue="monkey@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="text-green-500" size={24} />
              <h2 className="text-xl font-semibold">通知设置</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">价格提醒</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">新闻推送</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">交易提醒</span>
                <input type="checkbox" className="rounded" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="text-purple-500" size={24} />
              <h2 className="text-xl font-semibold">界面设置</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">主题</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>浅色主题</option>
                  <option>深色主题</option>
                  <option>自动</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">语言</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>中文简体</option>
                  <option>English</option>
                  <option>日本語</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-red-500" size={24} />
              <h2 className="text-xl font-semibold">安全设置</h2>
            </div>
            <div className="space-y-3">
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                修改密码
              </button>
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                双重验证
              </button>
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                登录记录
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="text-indigo-500" size={24} />
          <h2 className="text-xl font-semibold">数据源配置</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-2">API 密钥</h3>
            <input
              type="password"
              placeholder="输入 API 密钥"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-2">更新频率</h3>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>实时</option>
              <option>每分钟</option>
              <option>每5分钟</option>
              <option>每小时</option>
            </select>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-2">数据保存</h3>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>7天</option>
              <option>30天</option>
              <option>90天</option>
              <option>永久</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Rocket className="text-orange-500" size={24} />
          <h2 className="text-xl font-semibold">关于与更新</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-700 font-medium">应用名称</span>
            <span className="text-gray-600">Watch Monkey App</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-700 font-medium">当前版本</span>
            <span className="text-gray-600">{appVersion}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-700 font-medium">检查更新</span>
            <UpdateButton />
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              应用会在启动后 3 秒自动检查更新，之后每 5 分钟自动检查一次。如果有新版本可用，将会提示您下载安装。
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-4">
        <button className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
          重置
        </button>
        <button className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
          保存设置
        </button>
      </div>
    </div>
  )
}
