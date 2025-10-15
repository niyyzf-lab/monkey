import { useEffect, useState, createContext, useContext } from 'react';
import { check, type Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { getVersion } from '@tauri-apps/api/app';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

// 日志前缀
const LOG_PREFIX = '[AppUpdater]';

// 创建更新器上下文
interface UpdaterContextType {
  checkForUpdates: (silent?: boolean) => Promise<void>;
  isChecking: boolean;
}

const UpdaterContext = createContext<UpdaterContextType | null>(null);

// 导出 hook 供其他组件使用
export function useUpdater() {
  const context = useContext(UpdaterContext);
  if (!context) {
    throw new Error('useUpdater must be used within UpdaterProvider');
  }
  return context;
}

// Provider 组件 - 提供全局更新功能
export function UpdaterProvider({ children }: { children: React.ReactNode }) {
  const [update, setUpdate] = useState<Update | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showDialog, setShowDialog] = useState(false);

  // 检查更新
  const checkForUpdates = async (silent = false) => {
    if (isChecking) {
      console.log(`${LOG_PREFIX} 正在检查更新中，跳过重复请求`);
      return;
    }

    console.log(`${LOG_PREFIX} ========== 开始检查更新 ==========`);
    console.log(`${LOG_PREFIX} 静默模式: ${silent}`);
    
    setIsChecking(true);
    
    try {
      // 获取当前版本
      const currentVersion = await getVersion();
      console.log(`${LOG_PREFIX} 当前应用版本: ${currentVersion}`);
      console.log(`${LOG_PREFIX} 正在请求更新信息...`);
      console.log(`${LOG_PREFIX} 更新端点: https://gitea.watchmonkey.icu/niyyzf/watch-monkey-app/releases/download/latest/latest.json`);
      
      const updateInfo = await check();
      
      console.log(`${LOG_PREFIX} 更新检查响应:`, updateInfo);
      
      if (updateInfo) {
        console.log(`${LOG_PREFIX} ✅ 发现新版本！`);
        console.log(`${LOG_PREFIX} 当前版本: ${updateInfo.currentVersion}`);
        console.log(`${LOG_PREFIX} 最新版本: ${updateInfo.version}`);
        console.log(`${LOG_PREFIX} 更新日期: ${updateInfo.date}`);
        console.log(`${LOG_PREFIX} 更新说明: ${updateInfo.body}`);
        
        setUpdate(updateInfo);
        setShowDialog(true);
        
        if (!silent) {
          toast.info(`发现新版本 ${updateInfo.version}`);
        }
      } else {
        console.log(`${LOG_PREFIX} ✅ 已是最新版本`);
        if (!silent) {
          toast.success('已是最新版本');
        }
      }
    } catch (error) {
      console.error(`${LOG_PREFIX} ❌ 检查更新失败:`, error);
      console.error(`${LOG_PREFIX} 错误详情:`, {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      
      if (!silent) {
        toast.error(`检查更新失败: ${(error as Error).message}`);
      }
    } finally {
      setIsChecking(false);
      console.log(`${LOG_PREFIX} ========== 检查更新结束 ==========`);
    }
  };

  // 下载并安装更新
  const downloadAndInstall = async () => {
    if (!update) {
      console.error(`${LOG_PREFIX} 错误: 没有可用的更新信息`);
      return;
    }
    
    if (isDownloading) {
      console.log(`${LOG_PREFIX} 正在下载中，跳过重复请求`);
      return;
    }

    console.log(`${LOG_PREFIX} ========== 开始下载并安装更新 ==========`);
    console.log(`${LOG_PREFIX} 更新版本: ${update.version}`);
    console.log(`${LOG_PREFIX} 更新日期: ${update.date}`);
    
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      let downloaded = 0;
      let contentLength = 0;
      let startTime = Date.now();

      // 下载更新
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength || 0;
            const sizeMB = (contentLength / (1024 * 1024)).toFixed(2);
            console.log(`${LOG_PREFIX} 📥 开始下载更新...`);
            console.log(`${LOG_PREFIX} 文件大小: ${contentLength} bytes (${sizeMB} MB)`);
            toast.info(`开始下载更新... (${sizeMB} MB)`);
            break;
            
          case 'Progress':
            downloaded += event.data.chunkLength;
            if (contentLength > 0) {
              const progress = Math.round((downloaded / contentLength) * 100);
              const downloadedMB = (downloaded / (1024 * 1024)).toFixed(2);
              const totalMB = (contentLength / (1024 * 1024)).toFixed(2);
              const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
              const speed = downloaded / (Date.now() - startTime) * 1000 / 1024; // KB/s
              
              setDownloadProgress(progress);
              
              // 每10%记录一次日志，避免日志过多
              if (progress % 10 === 0) {
                console.log(`${LOG_PREFIX} 📊 下载进度: ${progress}% (${downloadedMB}/${totalMB} MB) - 速度: ${speed.toFixed(2)} KB/s - 用时: ${elapsed}s`);
              }
            }
            break;
            
          case 'Finished':
            const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`${LOG_PREFIX} ✅ 下载完成！总用时: ${totalTime}s`);
            console.log(`${LOG_PREFIX} 🔧 开始安装更新...`);
            setDownloadProgress(100);
            break;
        }
      });

      console.log(`${LOG_PREFIX} ✅ 更新安装完成`);
      console.log(`${LOG_PREFIX} 🔄 准备重启应用...`);
      toast.success('更新安装成功，即将重启应用...');
      
      // 等待一秒后重启应用
      setTimeout(async () => {
        console.log(`${LOG_PREFIX} 🚀 正在重启应用...`);
        await relaunch();
      }, 1000);
    } catch (error) {
      console.error(`${LOG_PREFIX} ❌ 下载/安装更新失败:`, error);
      console.error(`${LOG_PREFIX} 错误详情:`, {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      
      toast.error(`下载更新失败: ${(error as Error).message}`);
      setIsDownloading(false);
    }
  };

  // 组件挂载时自动检查更新（静默），并每5分钟检查一次
  useEffect(() => {
    console.log(`${LOG_PREFIX} 组件已挂载，将在 3 秒后自动检查更新...`);
    
    // 延迟 3 秒后首次检查更新，避免影响应用启动
    const initialTimer = setTimeout(() => {
      console.log(`${LOG_PREFIX} 触发首次自动更新检查（静默模式）`);
      checkForUpdates(true);
    }, 3000);

    // 设置定期检查：每5分钟检查一次
    console.log(`${LOG_PREFIX} 设置定期更新检查：每 5 分钟一次`);
    const intervalTimer = setInterval(() => {
      console.log(`${LOG_PREFIX} 触发定期更新检查（静默模式）`);
      checkForUpdates(true);
    }, 5 * 60 * 1000); // 5分钟 = 5 * 60 * 1000 毫秒

    return () => {
      console.log(`${LOG_PREFIX} 组件已卸载，清除所有更新检查定时器`);
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  return (
    <UpdaterContext.Provider value={{ checkForUpdates, isChecking }}>
      {children}
      
      {/* 更新对话框 */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>发现新版本</DialogTitle>
            <DialogDescription>
              当前版本: {update?.currentVersion}
              <br />
              最新版本: {update?.version}
            </DialogDescription>
          </DialogHeader>

          {isDownloading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>下载进度</span>
                <span>{downloadProgress}%</span>
              </div>
              <Progress value={downloadProgress} />
            </div>
          )}

          {update?.body && !isDownloading && (
            <div className="max-h-[300px] overflow-y-auto rounded-md border p-4">
              <h4 className="mb-2 font-semibold">更新内容：</h4>
              <div className="whitespace-pre-wrap text-sm text-muted-foreground">
                {update.body}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isDownloading}
            >
              稍后更新
            </Button>
            <Button
              onClick={downloadAndInstall}
              disabled={isDownloading}
            >
              {isDownloading ? '下载中...' : '立即更新'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UpdaterContext.Provider>
  );
}

// 检查更新按钮组件 - 供设置页面使用
export function UpdateButton() {
  const { checkForUpdates, isChecking } = useUpdater();
  
  return (
    <Button
      onClick={() => checkForUpdates(false)}
      disabled={isChecking}
      variant="outline"
      size="sm"
    >
      {isChecking ? '检查中...' : '检查更新'}
    </Button>
  );
}


