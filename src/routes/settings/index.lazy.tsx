import { API_BASE_URL } from '@/api/api';
import { UnifiedPageHeader } from '@/components/common/unified-page-header';
import { SettingsSection, SettingsItem } from '@/components/settings';
import { Button } from '@/components/ui/button';
import { UpdateButton, UpdaterDebugPanel } from '@/components/updater';
import { useSettings } from '@/hooks';
import { Switch } from '@radix-ui/react-switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';
import { createLazyFileRoute } from '@tanstack/react-router';
import { getVersion } from '@tauri-apps/api/app';
import { Palette, LineChart, Database, Info, Wifi, Loader2, WifiOff, Check, AlertCircle, RefreshCw, Download, Upload, Trash2, RotateCcw } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
export const Route = createLazyFileRoute('/settings/')({
  component: SettingsPage,
});

function SettingsPage() {
  const {
    settings,
    setTheme,
    setViewMode,
    setStatisticsDisplayMode,
    setChartSettings,
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

  const [appVersion, setAppVersion] = useState<string>('加载中...');
  const [activeTab, setActiveTab] = useState('appearance');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 服务器测试状态
  const [serverStatus, setServerStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState<string>('');

  // 加载应用版本
  useState(() => {
    getVersion()
      .then((version) => setAppVersion(version))
      .catch(() => setAppVersion('未知'));
  });

  // 处理主题切换
  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
    toast.success(`已切换到${checked ? '深色' : '浅色'}模式`);
  };

  // 处理跟随系统切换
  const handleFollowSystemToggle = (checked: boolean) => {
    if (checked) {
      setTheme('system');
      toast.success('已启用跟随系统主题');
    } else {
      // 禁用跟随系统时,根据当前系统主题设置
      const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(systemIsDark ? 'dark' : 'light');
      toast.success(`已切换到${systemIsDark ? '深色' : '浅色'}模式`);
    }
  };

  // 获取当前是否为深色模式(用于开关显示)
  const isDarkMode = settings.theme === 'system' 
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : settings.theme === 'dark';

  // 是否跟随系统
  const isFollowingSystem = settings.theme === 'system';

  // 处理导出配置
  const handleExport = () => {
    try {
      const config = exportConfig();
      const blob = new Blob([config], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `watch-monkey-settings-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('配置已导出');
    } catch (error) {
      toast.error('导出配置失败');
    }
  };

  // 处理导入配置
  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      importConfig(text);
      toast.success('配置已导入');
      // 重新加载页面以应用新配置
      window.location.reload();
    } catch (error) {
      toast.error('导入配置失败,请检查文件格式');
    }

    // 清空文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 处理重置配置
  const handleReset = () => {
    if (confirm('确定要重置所有设置为默认值吗?此操作不可撤销。')) {
      resetSettings();
      toast.success('配置已重置');
    }
  };

  // 处理清空缓存
  const handleClearCache = () => {
    if (confirm('确定要清空所有临时缓存吗?这将清除页面折叠状态和分页位置。')) {
      clearCache();
      refreshCacheStats();
      toast.success('缓存已清空');
    }
  };

  // 格式化文件大小
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // 测试服务器连接
  const handleTestServer = async () => {
    setServerStatus('testing');
    setServerError('');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
      
      const response = await fetch(`${API_BASE_URL}/webhook/stock-details`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setServerStatus('success');
        toast.success('服务器连接成功！');
      } else {
        let errorText = '';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorJson = await response.json();
            errorText = JSON.stringify(errorJson, null, 2);
          } else {
            errorText = await response.text();
          }
        } catch {
          errorText = '';
        }
        
        setServerStatus('error');
        const errorMessage = `服务器返回错误: ${response.status} ${response.statusText}${errorText ? '\n\n响应内容:\n' + errorText : ''}`;
        setServerError(errorMessage);
        toast.error('服务器连接失败');
      }
    } catch (error) {
      setServerStatus('error');
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setServerError(`连接超时\n\n无法在 10 秒内连接到服务器\n服务器地址: ${API_BASE_URL}\n\n请检查:\n1. 服务器是否正在运行\n2. 服务器地址是否正确\n3. 网络连接是否正常`);
        } else {
          setServerError(`连接错误: ${error.message}\n\n服务器地址: ${API_BASE_URL}\n\n可能的原因:\n1. 服务器未启动\n2. 防火墙拦截\n3. 网络配置问题`);
        }
      } else {
        setServerError(`未知错误\n\n无法连接到服务器: ${API_BASE_URL}\n\n请检查服务器是否正常运行`);
      }
      toast.error('服务器连接失败');
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* 页面标题 - 统一标题栏（浮动） */}
      <UnifiedPageHeader
        title="倒腾"
        subtitle="管理应用的所有配置和偏好设置"
      />
      
      <div className="max-w-4xl mx-auto pt-8 px-6 pb-6 space-y-6">

        {/* 标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">外观</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="gap-2">
              <LineChart className="h-4 w-4" />
              <span className="hidden sm:inline">图表</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">数据</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-2">
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">关于</span>
            </TabsTrigger>
          </TabsList>

          {/* 外观设置 */}
          <TabsContent value="appearance" className="space-y-4">
            <SettingsSection
              title="主题设置"
              description="自定义应用的外观和视觉效果"
              icon={<Palette className="h-5 w-5" />}
            >
              <SettingsItem
                label="跟随系统主题"
                description="自动根据系统设置切换主题"
              >
                <Switch
                  checked={isFollowingSystem}
                  onCheckedChange={handleFollowSystemToggle}
                />
              </SettingsItem>
              
              <SettingsItem
                label="深色模式"
                description={isFollowingSystem ? '当前由系统控制' : '手动切换深色或浅色主题'}
              >
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={handleThemeToggle}
                  disabled={isFollowingSystem}
                />
              </SettingsItem>
            </SettingsSection>

            <SettingsSection
              title="视图偏好"
              description="设置数据的默认显示方式"
            >
              <SettingsItem
                label="持仓视图模式"
                description="选择卡片或列表视图"
              >
                <select
                  value={settings.viewMode}
                  onChange={(e) => {
                    setViewMode(e.target.value as 'card' | 'table');
                    toast.success(`已切换到${e.target.value === 'card' ? '卡片' : '列表'}视图`);
                  }}
                  className="px-3 py-1.5 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="card">卡片视图</option>
                  <option value="table">列表视图</option>
                </select>
              </SettingsItem>

              <SettingsItem
                label="统计数值显示"
                description="选择统计数字的显示格式"
              >
                <select
                  value={settings.statisticsDisplayMode}
                  onChange={(e) => {
                    setStatisticsDisplayMode(e.target.value as 'auto' | 'yuan');
                    toast.success(`统计显示已更新`);
                  }}
                  className="px-3 py-1.5 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="auto">自动格式化</option>
                  <option value="yuan">元为单位</option>
                </select>
              </SettingsItem>

              <SettingsItem
                label="侧边栏默认状态"
                description="设置侧边栏是否默认展开"
              >
                <Switch
                  checked={settings.sidebarOpen}
                  onCheckedChange={(checked) => {
                    setSidebarOpen(checked);
                    toast.success(`侧边栏默认${checked ? '展开' : '折叠'}`);
                  }}
                />
              </SettingsItem>
            </SettingsSection>

            <SettingsSection
              title="窗口控制"
              description="设置窗口控制按钮的位置"
            >
              <SettingsItem
                label="红绿灯位置"
                description="选择 macOS 风格窗口控制按钮的显示位置"
              >
                <select
                  value={settings.trafficLightsPosition}
                  onChange={(e) => {
                    const position = e.target.value as 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
                    setTrafficLightsPosition(position);
                    const positionNames: Record<string, string> = {
                      'top-left': '左上角',
                      'top-right': '右上角',
                      'bottom-left': '左下角',
                      'bottom-right': '右下角',
                    };
                    toast.success(`红绿灯位置已设置为${positionNames[position]},页面即将刷新...`);
                    // 延迟刷新页面以应用新位置
                    setTimeout(() => {
                      window.location.reload();
                    }, 800);
                  }}
                  className="px-3 py-1.5 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="top-left">左上角</option>
                  <option value="top-right">右上角</option>
                  <option value="bottom-left">左下角</option>
                  <option value="bottom-right">右下角</option>
                </select>
              </SettingsItem>
            </SettingsSection>
          </TabsContent>

          {/* 图表设置 */}
          <TabsContent value="charts" className="space-y-4">
            <SettingsSection
              title="图表默认配置"
              description="设置图表的默认显示参数"
              icon={<LineChart className="h-5 w-5" />}
            >
              <SettingsItem
                label="默认时间周期"
                description="K线图的默认时间粒度"
              >
                <select
                  value={settings.chart.interval}
                  onChange={(e) => {
                    setChartSettings({ interval: e.target.value as any });
                    toast.success('图表周期已更新');
                  }}
                  className="px-3 py-1.5 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="minute">分时</option>
                  <option value="5min">5分钟</option>
                  <option value="15min">15分钟</option>
                  <option value="30min">30分钟</option>
                  <option value="60min">60分钟</option>
                  <option value="day">日K</option>
                  <option value="week">周K</option>
                  <option value="month">月K</option>
                </select>
              </SettingsItem>

              <SettingsItem
                label="图表类型"
                description="K线或折线图"
              >
                <select
                  value={settings.chart.chartType}
                  onChange={(e) => {
                    setChartSettings({ chartType: e.target.value as any });
                    toast.success('图表类型已更新');
                  }}
                  className="px-3 py-1.5 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="candlestick">K线图</option>
                  <option value="line">折线图</option>
                </select>
              </SettingsItem>

              <SettingsItem
                label="复权方式"
                description="股价的复权计算方法"
              >
                <select
                  value={settings.chart.adjustType}
                  onChange={(e) => {
                    setChartSettings({ adjustType: e.target.value as any });
                    toast.success('复权方式已更新');
                  }}
                  className="px-3 py-1.5 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="none">不复权</option>
                  <option value="forward">前复权</option>
                  <option value="backward">后复权</option>
                </select>
              </SettingsItem>

              <SettingsItem
                label="显示 MA5 均线"
                description="5日移动平均线"
              >
                <Switch
                  checked={settings.chart.showMA5}
                  onCheckedChange={(checked) => {
                    setChartSettings({ showMA5: checked });
                  }}
                />
              </SettingsItem>

              <SettingsItem
                label="显示 MA10 均线"
                description="10日移动平均线"
              >
                <Switch
                  checked={settings.chart.showMA10}
                  onCheckedChange={(checked) => {
                    setChartSettings({ showMA10: checked });
                  }}
                />
              </SettingsItem>

              <SettingsItem
                label="显示成交量"
                description="在图表下方显示成交量柱状图"
              >
                <Switch
                  checked={settings.chart.showVolume}
                  onCheckedChange={(checked) => {
                    setChartSettings({ showVolume: checked });
                  }}
                />
              </SettingsItem>
            </SettingsSection>
          </TabsContent>

          {/* 数据管理 */}
          <TabsContent value="data" className="space-y-4">
            <SettingsSection
              title="服务器连接"
              description="测试与后端服务器的连接状态"
              icon={<Wifi className="h-5 w-5" />}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">服务器地址</div>
                    <div className="text-xs text-muted-foreground mt-1 font-mono">
                      {API_BASE_URL}
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {serverStatus === 'idle' && <Wifi className="h-5 w-5 text-muted-foreground" />}
                    {serverStatus === 'testing' && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
                    {serverStatus === 'success' && <Wifi className="h-5 w-5 text-green-500" />}
                    {serverStatus === 'error' && <WifiOff className="h-5 w-5 text-red-500" />}
                  </div>
                </div>

                <Button
                  onClick={handleTestServer}
                  disabled={serverStatus === 'testing'}
                  className="w-full gap-2"
                  variant={serverStatus === 'success' ? 'outline' : 'default'}
                >
                  {serverStatus === 'testing' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      测试中...
                    </>
                  ) : (
                    <>
                      <Wifi className="h-4 w-4" />
                      测试服务器连接
                    </>
                  )}
                </Button>

                {serverStatus === 'success' && (
                  <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg text-sm">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="text-green-900 dark:text-green-100">
                      <strong>连接成功!</strong> 服务器运行正常。
                    </div>
                  </div>
                )}

                {serverStatus === 'error' && serverError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg text-sm">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-red-900 dark:text-red-100 font-semibold mb-1">连接失败</div>
                      <div className="text-red-800 dark:text-red-200 whitespace-pre-wrap break-all font-mono text-xs">
                        {serverError}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </SettingsSection>

            <SettingsSection
              title="缓存统计"
              description="查看和管理本地存储的数据"
              icon={<Database className="h-5 w-5" />}
            >
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground">总项目数</div>
                  <div className="text-2xl font-bold text-foreground mt-1">
                    {cacheStats.totalItems}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">配置项</div>
                  <div className="text-2xl font-bold text-primary mt-1">
                    {cacheStats.settingsItems}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">临时缓存</div>
                  <div className="text-2xl font-bold text-orange-500 mt-1">
                    {cacheStats.temporaryItems}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">总大小</div>
                  <div className="text-2xl font-bold text-foreground mt-1">
                    {formatSize(cacheStats.totalSize)}
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={refreshCacheStats}
                className="w-full gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                刷新统计
              </Button>
            </SettingsSection>

            <SettingsSection title="配置管理" description="导入、导出或重置配置">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleExport}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  导出配置
                </Button>

                <Button
                  variant="outline"
                  onClick={handleImport}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  导入配置
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <Button
                  variant="outline"
                  onClick={handleClearCache}
                  disabled={isLoading}
                  className="gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950"
                >
                  <Trash2 className="h-4 w-4" />
                  清空临时缓存
                </Button>

                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isLoading}
                  className="gap-2 text-destructive hover:bg-destructive/10"
                >
                  <RotateCcw className="h-4 w-4" />
                  重置所有设置
                </Button>
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-blue-900 dark:text-blue-100">
                  <strong>提示:</strong> 临时缓存包括页面折叠状态、分页位置等会话级数据,清空后不影响主要配置。
                </div>
              </div>
            </SettingsSection>
          </TabsContent>

          {/* 关于 */}
          <TabsContent value="about" className="space-y-4">
            <SettingsSection
              title="应用信息"
              description="查看应用版本和更新"
              icon={<Info className="h-5 w-5" />}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">应用名称</span>
                  <span className="text-sm font-semibold text-foreground">Watch Monkey App</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">当前版本</span>
                  <span className="text-sm font-semibold text-foreground">{appVersion}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-muted-foreground">检查更新</span>
                  <UpdateButton />
                </div>
              </div>

              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    应用会在启动后 3 秒自动检查更新,之后每 5 分钟自动检查一次。如果有新版本可用,将会提示您下载安装。
                  </p>
                </div>
              </div>
            </SettingsSection>

            {/* 开发调试面板 - 仅在开发环境显示 */}
            <UpdaterDebugPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
