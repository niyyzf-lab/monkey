import { useState } from 'react';
import { useUpdater } from './updater-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Rocket, PlayCircle, Bug } from 'lucide-react';

/**
 * 更新器调试面板
 * 仅在开发环境下显示
 * 提供强制测试更新功能
 */
export function UpdaterDebugPanel() {
  const { 
    checkForUpdates, 
    isChecking, 
    updateStatus,
    forceShowUpdateDialog,
    forceDownloadAndInstall 
  } = useUpdater();
  
  const [isForceUpdating, setIsForceUpdating] = useState(false);

  // 检查是否在开发环境
  const isDevelopment = import.meta.env.DEV;

  // 如果不是开发环境，不显示该面板
  if (!isDevelopment) {
    return null;
  }

  const handleForceUpdate = async () => {
    if (isForceUpdating) return;
    
    const confirmed = confirm(
      '⚠️ 强制更新警告\n\n' +
      '这将忽略版本检查，直接下载并安装最新版本。\n' +
      '如果当前版本已经是最新版本，这可能会导致重复安装。\n\n' +
      '确定要继续吗？'
    );
    
    if (!confirmed) return;
    
    setIsForceUpdating(true);
    try {
      await forceDownloadAndInstall();
    } finally {
      // 延迟重置状态，避免立即被重置
      setTimeout(() => {
        setIsForceUpdating(false);
      }, 2000);
    }
  };

  return (
    <Card className="border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-orange-900 dark:text-orange-100">
              更新器调试面板
            </CardTitle>
          </div>
          <Badge variant="outline" className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700">
            仅开发模式
          </Badge>
        </div>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          测试更新功能和界面，此面板仅在开发环境中可见
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 当前状态显示 */}
        <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
            当前状态
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={updateStatus === 'idle' ? 'secondary' : 'default'}>
              {updateStatus}
            </Badge>
            {isChecking && (
              <span className="text-xs text-muted-foreground">检查中...</span>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-2">
          <Button
            onClick={() => checkForUpdates(false)}
            disabled={isChecking}
            className="w-full gap-2"
            variant="outline"
          >
            <PlayCircle className="h-4 w-4" />
            正常检查更新
          </Button>

          <Button
            onClick={forceShowUpdateDialog}
            disabled={isChecking}
            className="w-full gap-2"
            variant="outline"
          >
            <Rocket className="h-4 w-4" />
            显示模拟更新弹窗
          </Button>

          <Button
            onClick={handleForceUpdate}
            disabled={isChecking || isForceUpdating}
            className="w-full gap-2 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <AlertCircle className="h-4 w-4" />
            {isForceUpdating ? '正在检查更新...' : '强制更新（跳过等待）'}
          </Button>
        </div>

        {/* 说明文字 */}
        <div className="space-y-2 text-xs text-orange-700 dark:text-orange-300">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <div>
              <strong>正常检查更新：</strong>按照常规流程检查是否有新版本（需要远程版本 &gt; 当前版本）
            </div>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <div>
              <strong>显示模拟更新弹窗：</strong>显示一个假的更新对话框，用于测试 UI 界面（不会真正下载）
            </div>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <div>
              <strong>强制更新：</strong>立即检查并自动下载安装（⚠️ 会真实下载，但仍需远程版本号 &gt; 当前版本）
            </div>
          </div>
        </div>

        {/* 警告提示 */}
        <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-lg border border-orange-300 dark:border-orange-700">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-orange-900 dark:text-orange-100 space-y-1">
              <div>
                <strong>重要说明：</strong>
              </div>
              <div>
                • 此面板仅在开发环境（npm run dev）中显示，生产构建时会自动隐藏
              </div>
              <div>
                • 根据 Tauri updater 的设计，只有当<strong>远程版本号大于当前版本号</strong>时才会执行下载
              </div>
              <div>
                • "强制更新"会跳过手动触发，自动下载，但<strong>无法绕过版本号检查</strong>
              </div>
              <div>
                • 如需测试更新，请在服务器上发布一个版本号更高的版本
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

