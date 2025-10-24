import { useEffect, useState } from 'react';
import { usePWA } from '@/hooks';
import { Button } from '@/components/ui/button';
import { X, Download, RefreshCw } from 'lucide-react';

/**
 * PWA 安装和更新提示组件
 * 根据环境变量 VITE_PWA_PROMPT_ENABLED 控制是否显示
 */
export function PWAPrompt() {
  const {
    isInstallable,
    promptInstall,
    needRefresh,
    offlineReady,
    updateServiceWorker,
    isPromptEnabled,
  } = usePWA();

  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  // 调试日志
  useEffect(() => {
    console.log('🔍 PWA Prompt 状态:', {
      isPromptEnabled,
      isInstallable,
      needRefresh,
      offlineReady,
      showInstallPrompt,
      showUpdatePrompt,
    });
  }, [isPromptEnabled, isInstallable, needRefresh, offlineReady, showInstallPrompt, showUpdatePrompt]);

  // 显示安装提示（延迟显示，避免打扰用户）
  useEffect(() => {
    if (isInstallable && isPromptEnabled) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000); // 3秒后显示

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isPromptEnabled]);

  // 显示更新提示
  useEffect(() => {
    if (needRefresh) {
      setShowUpdatePrompt(true);
    }
  }, [needRefresh]);

  // 处理安装
  const handleInstall = async () => {
    await promptInstall();
    setShowInstallPrompt(false);
  };

  // 处理更新
  const handleUpdate = async () => {
    await updateServiceWorker(true); // 重载页面
  };

  // 不显示任何提示
  if (!isPromptEnabled) {
    return null;
  }

  return (
    <>
      {/* 安装提示 */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5">
          <div className="bg-background border border-border rounded-lg shadow-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Download className="w-5 h-5 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold mb-1">
                  安装 Watch Monkey App
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  安装应用到主屏幕，获得更好的使用体验
                </p>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleInstall}
                    className="flex-1"
                  >
                    安装
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowInstallPrompt(false)}
                  >
                    暂不
                  </Button>
                </div>
              </div>
              
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="关闭"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 更新提示 */}
      {showUpdatePrompt && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-top-5">
          <div className="bg-background border border-border rounded-lg shadow-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-blue-500" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold mb-1">
                  发现新版本
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  {offlineReady 
                    ? '应用已准备好离线使用' 
                    : '点击更新以获取最新功能'}
                </p>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleUpdate}
                    className="flex-1"
                  >
                    立即更新
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowUpdatePrompt(false)}
                  >
                    稍后
                  </Button>
                </div>
              </div>
              
              <button
                onClick={() => setShowUpdatePrompt(false)}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="关闭"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

