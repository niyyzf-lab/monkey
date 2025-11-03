import { SettingsSection } from '@/components/settings';
import { UpdateButton, UpdaterDebugPanel } from '@/components/updater';
import { Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getVersion } from '@tauri-apps/api/app';
import { MasonryLayout } from '@/components/common/masonry-layout';
import { useResponsiveColumns } from '@/hooks/use-responsive-columns';

export function AboutSettings() {
  const [appVersion, setAppVersion] = useState<string>('加载中...');
  const columns = useResponsiveColumns(2);

  useEffect(() => {
    getVersion()
      .then((version) => setAppVersion(version))
      .catch(() => setAppVersion('未知'));
  }, []);

  return (
    <MasonryLayout columns={columns} gap={32}>
      <SettingsSection
        title="应用信息"
        description="查看应用版本信息和更新状态"
      >
        <div className="space-y-0">
          <div className="flex items-center justify-between py-3 border-b border-border/10">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground mb-0.5">应用名称</div>
              <div className="text-[10px] text-muted-foreground/70 font-mono">Application Name</div>
            </div>
            <span className="text-sm font-semibold text-foreground">Watch Monkey App</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border/10">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground mb-0.5">当前版本</div>
              <div className="text-[10px] text-muted-foreground/70 font-mono">Current Version</div>
            </div>
            <span className="text-sm font-semibold text-foreground font-mono">{appVersion}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground mb-0.5">检查更新</div>
              <div className="text-[10px] text-muted-foreground/70 font-mono">Update Check</div>
            </div>
            <UpdateButton />
          </div>
        </div>

        <div className="mt-5 p-3.5 bg-background/60 rounded-md border border-border/15">
          <div className="flex items-start gap-2.5">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <div className="font-semibold text-foreground mb-1">自动更新机制</div>
              <div className="text-[10px] text-muted-foreground/70">
                应用会在启动后 3 秒自动检查更新，之后每 5 分钟自动检查一次。如果有新版本可用，将会提示您下载安装。
              </div>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* 开发调试面板 - 仅在开发环境显示 */}
      <UpdaterDebugPanel />
    </MasonryLayout>
  );
}
