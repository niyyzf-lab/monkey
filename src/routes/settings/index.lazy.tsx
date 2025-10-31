import { UnifiedPageHeader } from '@/components/common/unified-page-header';
import { AdvancedSystemSettings } from '@/components/settings/advanced-system-settings';
import { AppearanceSettings } from '@/components/settings/appearance-settings';
import { DataSettings } from '@/components/settings/data-settings';
import { AboutSettings } from '@/components/settings/about-settings';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';
import { createLazyFileRoute } from '@tanstack/react-router';
import { Palette, Database, Info, Settings as SettingsIcon } from 'lucide-react';
import { useState } from 'react';
import { useSettings } from '@/hooks';

export const Route = createLazyFileRoute('/settings/')({
  component: SettingsPage,
});

function SettingsPage() {
  const {
    settings,
    setTheme,
    setViewMode,
    setStatisticsDisplayMode,
    setSidebarOpen,
    setTrafficLightsPosition,
    resetSettings,
    exportConfig,
    importConfig,
    clearCache,
    cacheStats,
    refreshCacheStats,
    isLoading,
  } = useSettings();

  const [activeTab, setActiveTab] = useState('appearance');

  return (
    <div className="h-full overflow-y-auto">
      {/* 页面标题 - 统一标题栏（浮动） */}
      <UnifiedPageHeader
        title="倒腾"
        subtitle="管理应用的所有配置和偏好设置"
      />
      
      {/* 全宽布局 */}
      <div className="w-full pt-8 px-6 pb-6 space-y-6">
        {/* 标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">外观</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">数据</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <SettingsIcon className="h-4 w-4" />
              <span className="hidden sm:inline">系统</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-2">
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">关于</span>
            </TabsTrigger>
          </TabsList>

          {/* 外观设置 */}
          <TabsContent value="appearance" className="space-y-4">
            <AppearanceSettings
              settings={{
                theme: settings.theme,
                viewMode: settings.viewMode,
                statisticsDisplayMode: settings.statisticsDisplayMode,
                sidebarOpen: settings.sidebarOpen,
                trafficLightsPosition: settings.trafficLightsPosition,
              }}
              setTheme={setTheme}
              setViewMode={setViewMode}
              setStatisticsDisplayMode={setStatisticsDisplayMode}
              setSidebarOpen={setSidebarOpen}
              setTrafficLightsPosition={setTrafficLightsPosition}
            />
          </TabsContent>

          {/* 数据管理 */}
          <TabsContent value="data" className="space-y-4">
            <DataSettings
              cacheStats={cacheStats}
              refreshCacheStats={refreshCacheStats}
              exportConfig={exportConfig}
              importConfig={importConfig}
              clearCache={clearCache}
              resetSettings={resetSettings}
              isLoading={isLoading}
            />
          </TabsContent>

          {/* 系统设置 */}
          <TabsContent value="system" className="space-y-4">
            <AdvancedSystemSettings />
          </TabsContent>

          {/* 关于 */}
          <TabsContent value="about" className="space-y-4">
            <AboutSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
