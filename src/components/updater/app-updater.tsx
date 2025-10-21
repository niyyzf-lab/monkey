import { useEffect, useState } from 'react';
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
import { UpdaterContext, UpdateStatus, useUpdater } from './updater-context';

// 日志前缀
const LOG_PREFIX = '[AppUpdater]';

// Provider 组件 - 提供全局更新功能
export function UpdaterProvider({ children }: { children: React.ReactNode }) {
  const [update, setUpdate] = useState<Update | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>(UpdateStatus.IDLE);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showDialog, setShowDialog] = useState(false);

  // 屏蔽对话框显示时的键盘快捷键
  useEffect(() => {
    if (!showDialog) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果正在处理更新，屏蔽所有快捷键
      const isProcessing = [
        UpdateStatus.DOWNLOADING,
        UpdateStatus.INSTALLING,
        UpdateStatus.READY_TO_RELAUNCH,
        UpdateStatus.RELAUNCHING
      ].includes(updateStatus);

      if (isProcessing) {
        // 屏蔽 ESC 键
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          console.log(`${LOG_PREFIX} 已阻止 ESC 键关闭更新对话框`);
          return;
        }

        // 屏蔽 Cmd/Ctrl + W (关闭窗口)
        if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
          e.preventDefault();
          e.stopPropagation();
          console.log(`${LOG_PREFIX} 已阻止 Cmd/Ctrl+W 快捷键`);
          return;
        }

        // 屏蔽 Cmd/Ctrl + Q (退出应用)
        if ((e.metaKey || e.ctrlKey) && e.key === 'q') {
          e.preventDefault();
          e.stopPropagation();
          console.log(`${LOG_PREFIX} 已阻止 Cmd/Ctrl+Q 快捷键`);
          return;
        }

        // 屏蔽 Alt + F4 (Windows 关闭)
        if (e.altKey && e.key === 'F4') {
          e.preventDefault();
          e.stopPropagation();
          console.log(`${LOG_PREFIX} 已阻止 Alt+F4 快捷键`);
          return;
        }
      }
    };

    // 在捕获阶段监听，确保优先级最高
    window.addEventListener('keydown', handleKeyDown, true);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [showDialog, updateStatus]);

  // 检查更新
  const checkForUpdates = async (silent = false) => {
    if (isChecking) {
      console.log(`${LOG_PREFIX} 正在检查更新中，跳过重复请求`);
      return;
    }

    console.log(`${LOG_PREFIX} ========== 开始检查更新 ==========`);
    console.log(`${LOG_PREFIX} 静默模式: ${silent}`);
    
    setIsChecking(true);
    setUpdateStatus(UpdateStatus.CHECKING);
    
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
        setUpdateStatus(UpdateStatus.AVAILABLE);
        setShowDialog(true);
        
        if (!silent) {
          toast.info(`发现新版本 ${updateInfo.version}`);
        }
      } else {
        console.log(`${LOG_PREFIX} ✅ 已是最新版本`);
        setUpdateStatus(UpdateStatus.IDLE);
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
      
      setUpdateStatus(UpdateStatus.IDLE);
      
      if (!silent) {
        toast.error(`检查更新失败: ${(error as Error).message}`);
      }
    } finally {
      setIsChecking(false);
      console.log(`${LOG_PREFIX} ========== 检查更新结束 ==========`);
    }
  };

  // 执行重启应用
  const executeRelaunch = async () => {
    try {
      console.log(`${LOG_PREFIX} 🚀 开始执行重启...`);
      setUpdateStatus(UpdateStatus.RELAUNCHING);
      
      // 直接调用 relaunch，不再延迟
      await relaunch();
      
      // 如果执行到这里，说明重启可能失败
      console.error(`${LOG_PREFIX} ⚠️ relaunch() 调用完成但应用仍在运行`);
    } catch (error) {
      console.error(`${LOG_PREFIX} ❌ 重启应用失败:`, error);
      console.error(`${LOG_PREFIX} 错误详情:`, {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      
      toast.error(`重启失败: ${(error as Error).message}，请手动重启应用`);
      setUpdateStatus(UpdateStatus.READY_TO_RELAUNCH);
    }
  };

  // 下载并安装更新
  const downloadAndInstall = async () => {
    if (!update) {
      console.error(`${LOG_PREFIX} 错误: 没有可用的更新信息`);
      return;
    }
    
    if (updateStatus === UpdateStatus.DOWNLOADING || updateStatus === UpdateStatus.INSTALLING) {
      console.log(`${LOG_PREFIX} 正在处理更新中，跳过重复请求`);
      return;
    }

    console.log(`${LOG_PREFIX} ========== 开始下载并安装更新 ==========`);
    console.log(`${LOG_PREFIX} 更新版本: ${update.version}`);
    console.log(`${LOG_PREFIX} 更新日期: ${update.date}`);
    
    setUpdateStatus(UpdateStatus.DOWNLOADING);
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
            setUpdateStatus(UpdateStatus.INSTALLING);
            setDownloadProgress(100);
            break;
        }
      });

      console.log(`${LOG_PREFIX} ✅ 更新安装完成！`);
      console.log(`${LOG_PREFIX} 🔄 准备重启应用...`);
      
      setUpdateStatus(UpdateStatus.READY_TO_RELAUNCH);
      toast.success('更新安装成功，正在重启应用...', { duration: 2000 });
      
      // 关闭对话框，让用户看到即将重启
      setShowDialog(false);
      
      // 延迟 500ms 后执行重启，让 toast 和状态更新完成
      setTimeout(() => {
        executeRelaunch();
      }, 500);
      
    } catch (error) {
      console.error(`${LOG_PREFIX} ❌ 下载/安装更新失败:`, error);
      console.error(`${LOG_PREFIX} 错误详情:`, {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      
      toast.error(`下载更新失败: ${(error as Error).message}`);
      setUpdateStatus(UpdateStatus.AVAILABLE);
    }
  };

  // 开发调试方法：强制显示更新对话框（模拟有更新）
  const forceShowUpdateDialog = () => {
    console.log(`${LOG_PREFIX} 🔧 [开发模式] 强制显示更新对话框`);
    
    // 创建一个模拟的更新对象
    const mockUpdate = {
      currentVersion: '0.0.0',
      version: '999.999.999',
      date: new Date().toISOString(),
      body: '这是一个开发调试模拟更新\n\n功能：\n- 测试更新弹窗显示\n- 测试下载进度\n- 测试重启功能\n\n⚠️ 注意：这是开发模式的模拟更新，不会真正下载或安装任何内容。',
      downloadAndInstall: async () => {
        console.log(`${LOG_PREFIX} 🔧 [开发模式] 这是模拟更新，不会实际下载`);
        throw new Error('这是开发模式的模拟更新，不支持实际下载');
      }
    } as unknown as Update;
    
    setUpdate(mockUpdate);
    setUpdateStatus(UpdateStatus.AVAILABLE);
    setShowDialog(true);
    toast.info('🔧 开发模式：已显示模拟更新对话框');
  };

  // 开发调试方法：强制执行下载和安装（绕过版本检查）
  const forceDownloadAndInstall = async () => {
    console.log(`${LOG_PREFIX} 🔧 [开发模式] 强制执行更新（绕过版本检查）`);
    
    try {
      setIsChecking(true);
      setUpdateStatus(UpdateStatus.CHECKING);
      
      // 注意：Tauri 的 check() 只会在有更新时返回 Update 对象
      // 如果当前版本已经是最新或更高，check() 会返回 null
      // 这是 Tauri updater 的内置行为，无法绕过
      
      const updateInfo = await check();
      
      if (updateInfo) {
        console.log(`${LOG_PREFIX} 🔧 [开发模式] 检测到可用更新`);
        console.log(`${LOG_PREFIX} 当前版本: ${updateInfo.currentVersion}`);
        console.log(`${LOG_PREFIX} 远程版本: ${updateInfo.version}`);
        console.log(`${LOG_PREFIX} 更新日期: ${updateInfo.date}`);
        
        setUpdate(updateInfo);
        setUpdateStatus(UpdateStatus.AVAILABLE);
        setShowDialog(true);
        
        toast.info(`🔧 强制更新模式：发现版本 ${updateInfo.version}`, { duration: 3000 });
        
        // 1秒后自动开始下载
        setTimeout(() => {
          console.log(`${LOG_PREFIX} 🔧 [开发模式] 自动开始下载安装`);
          downloadAndInstall();
        }, 1000);
      } else {
        // 这意味着远程版本不高于当前版本
        const currentVersion = await getVersion();
        console.log(`${LOG_PREFIX} 🔧 [开发模式] 无可用更新`);
        console.log(`${LOG_PREFIX} 当前版本: ${currentVersion}`);
        console.log(`${LOG_PREFIX} ⚠️ 注意：Tauri updater 只会在远程版本 > 当前版本时返回更新`);
        console.log(`${LOG_PREFIX} 💡 提示：如需测试，请确保服务器上的版本号高于 ${currentVersion}`);
        
        toast.warning(
          `当前版本 ${currentVersion} 已是最新或更高\n\n` +
          `Tauri updater 的内置行为：只有当远程版本号大于当前版本时才会下载。\n` +
          `如需测试强制更新，请在更新服务器上发布一个版本号更高的版本。`,
          { duration: 8000 }
        );
      }
    } catch (error) {
      console.error(`${LOG_PREFIX} 🔧 [开发模式] 强制更新检查失败:`, error);
      console.error(`${LOG_PREFIX} 错误详情:`, {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      toast.error(`强制更新失败: ${(error as Error).message}`);
    } finally {
      setIsChecking(false);
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

  // 根据状态获取显示文本
  const getStatusText = () => {
    switch (updateStatus) {
      case UpdateStatus.CHECKING:
        return '检查中...';
      case UpdateStatus.DOWNLOADING:
        return `下载中... (${downloadProgress}%)`;
      case UpdateStatus.INSTALLING:
        return '安装中...';
      case UpdateStatus.READY_TO_RELAUNCH:
        return '准备重启...';
      case UpdateStatus.RELAUNCHING:
        return '重启中...';
      default:
        return '立即更新';
    }
  };

  const isProcessing = [
    UpdateStatus.DOWNLOADING,
    UpdateStatus.INSTALLING,
    UpdateStatus.READY_TO_RELAUNCH,
    UpdateStatus.RELAUNCHING
  ].includes(updateStatus);

  return (
    <UpdaterContext.Provider value={{ 
      checkForUpdates, 
      isChecking, 
      updateStatus,
      forceShowUpdateDialog,
      forceDownloadAndInstall
    }}>
      {children}
      
      {/* 更新对话框 - 屏蔽键盘快捷键 */}
      <Dialog open={showDialog} onOpenChange={(open) => {
        // 如果正在处理更新，不允许关闭对话框
        if (!isProcessing) {
          setShowDialog(open);
        }
      }}>
        <DialogContent 
          className="sm:max-w-[425px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => {
            // 屏蔽 ESC 键
            if (isProcessing) {
              e.preventDefault();
            }
          }}
          onPointerDownOutside={(e) => {
            // 处理更新时阻止点击外部关闭
            if (isProcessing) {
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            // 处理更新时阻止任何外部交互
            if (isProcessing) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>发现新版本</DialogTitle>
            <DialogDescription>
              当前版本: {update?.currentVersion}
              <br />
              最新版本: {update?.version}
            </DialogDescription>
          </DialogHeader>

          {/* 显示下载/安装进度 */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{getStatusText()}</span>
                {updateStatus === UpdateStatus.DOWNLOADING && (
                  <span>{downloadProgress}%</span>
                )}
              </div>
              {updateStatus === UpdateStatus.DOWNLOADING && (
                <Progress value={downloadProgress} />
              )}
              {updateStatus === UpdateStatus.INSTALLING && (
                <div className="text-sm text-muted-foreground text-center py-2">
                  正在安装更新，请稍候...
                </div>
              )}
              {(updateStatus === UpdateStatus.READY_TO_RELAUNCH || updateStatus === UpdateStatus.RELAUNCHING) && (
                <div className="text-sm text-muted-foreground text-center py-2">
                  更新已完成，正在重启应用...
                </div>
              )}
            </div>
          )}

          {/* 显示更新说明 */}
          {update?.body && !isProcessing && (
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
              disabled={isProcessing}
            >
              稍后更新
            </Button>
            <Button
              onClick={downloadAndInstall}
              disabled={isProcessing}
            >
              {getStatusText()}
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


