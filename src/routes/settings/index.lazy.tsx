import { UnifiedPageHeader } from '@/components/common/unified-page-header';
import { AdvancedSystemSettings } from '@/components/settings/advanced-system-settings';
import { AppearanceSettings } from '@/components/settings/appearance-settings';
import { DataSettings } from '@/components/settings/data-settings';
import { AboutSettings } from '@/components/settings/about-settings';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { createLazyFileRoute } from '@tanstack/react-router';
import { Palette, Database, Info, Settings as SettingsIcon } from 'lucide-react';
import { useState } from 'react';
import { useSettings } from '@/hooks';
import { motion, AnimatePresence } from 'framer-motion';

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
      <div className="w-full pt-6 px-4 pb-6 max-w-[1600px] mx-auto">
        {/* 标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex bg-muted/30 p-1 h-9">
            <TabsTrigger value="appearance" className="gap-1.5 px-3 h-7 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Palette className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">外观</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-1.5 px-3 h-7 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Database className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">数据</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-1.5 px-3 h-7 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <SettingsIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">系统</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-1.5 px-3 h-7 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Info className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">关于</span>
            </TabsTrigger>
          </TabsList>

          {/* 外观设置 */}
          <TabsContent value="appearance" className="mt-4">
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
          <TabsContent value="data" className="mt-4">
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
          <TabsContent value="system" className="mt-4">
            <AdvancedSystemSettings />
          </TabsContent>

          {/* 关于 */}
          <TabsContent value="about" className="mt-4">
            <AboutSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
