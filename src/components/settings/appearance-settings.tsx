import { SettingsSection, SettingsItem } from '@/components/settings';
import { Switch } from '@/components/ui/switch';
import { Palette } from 'lucide-react';
import { toast } from 'sonner';

interface AppearanceSettingsProps {
  settings: {
    theme: 'light' | 'dark' | 'system';
    viewMode: 'card' | 'table';
    statisticsDisplayMode: 'auto' | 'yuan';
    sidebarOpen: boolean;
    trafficLightsPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setViewMode: (mode: 'card' | 'table') => void;
  setStatisticsDisplayMode: (mode: 'auto' | 'yuan') => void;
  setSidebarOpen: (open: boolean) => void;
  setTrafficLightsPosition: (position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => void;
}

export function AppearanceSettings({
  settings,
  setTheme,
  setViewMode,
  setStatisticsDisplayMode,
  setSidebarOpen,
  setTrafficLightsPosition,
}: AppearanceSettingsProps) {
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

  return (
    <div className="space-y-4">
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
    </div>
  );
}

