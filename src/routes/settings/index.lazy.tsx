import { UnifiedPageHeader } from '@/components/common/unified-page-header';
import { AdvancedTradingSettings } from '@/components/settings/advanced-trading-settings';
import { AppearanceSettings } from '@/components/settings/appearance-settings';
import { DataSettings } from '@/components/settings/data-settings';
import { AboutSettings } from '@/components/settings/about-settings';
import { SettingsNav } from '@/components/settings/settings-nav';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useSettings } from '@/hooks';
import { motion } from 'framer-motion';

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

  return (
    <div className="h-full overflow-y-auto">
      {/* 页面标题 - 统一标题栏（浮动） */}
      <UnifiedPageHeader
        title="设置"
        subtitle="管理应用的所有配置和偏好设置"
      />
      
      {/* 右侧悬浮导航 */}
      <SettingsNav />

      {/* 主内容区域 - 全宽布局 */}
      <div className="w-full pt-8 px-8 pb-12 xl:pr-[180px]">
        {/* 外观设置 */}
        <motion.section
          id="appearance"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-16 scroll-mt-24"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">外观设置</h2>
            <p className="text-sm text-muted-foreground">自定义应用的外观和视觉效果</p>
          </div>
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
        </motion.section>

        {/* 数据管理 */}
        <motion.section
          id="data"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="mb-16 scroll-mt-24"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">数据管理</h2>
            <p className="text-sm text-muted-foreground">管理本地数据、缓存和配置</p>
          </div>
          <DataSettings
            cacheStats={cacheStats}
            refreshCacheStats={refreshCacheStats}
            exportConfig={exportConfig}
            importConfig={importConfig}
            clearCache={clearCache}
            resetSettings={resetSettings}
            isLoading={isLoading}
          />
        </motion.section>

        {/* 交易设置 */}
        <motion.section
          id="system"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-16 scroll-mt-24"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">交易设置</h2>
            <p className="text-sm text-muted-foreground">高级交易配置和交易规则</p>
          </div>
          <AdvancedTradingSettings />
        </motion.section>

        {/* 关于 */}
        <motion.section
          id="about"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mb-16 scroll-mt-24"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">关于</h2>
            <p className="text-sm text-muted-foreground">应用信息和版本更新</p>
          </div>
          <AboutSettings />
        </motion.section>
      </div>
    </div>
  );
}
