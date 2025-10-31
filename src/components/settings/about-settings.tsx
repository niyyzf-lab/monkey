import { SettingsSection } from '@/components/settings';
import { UpdateButton, UpdaterDebugPanel } from '@/components/updater';
import { Info, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getVersion } from '@tauri-apps/api/app';

export function AboutSettings() {
  const [appVersion, setAppVersion] = useState<string>('加载中...');

  useEffect(() => {
    getVersion()
      .then((version) => setAppVersion(version))
      .catch(() => setAppVersion('未知'));
  }, []);

  return (
    <div className="space-y-4">
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
    </div>
  );
}
