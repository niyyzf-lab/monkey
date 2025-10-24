import { useState, useEffect, useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface UsePWAReturn {
  // 安装相关
  isInstallable: boolean;
  isInstalled: boolean;
  promptInstall: () => Promise<void>;
  
  // 更新相关
  needRefresh: boolean;
  offlineReady: boolean;
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  
  // 状态
  isOnline: boolean;
  isStandalone: boolean;
  
  // 环境配置
  isPromptEnabled: boolean;
}

export function usePWA(): UsePWAReturn {
  // 检查环境变量是否启用 PWA 提示，默认启用
  const isPromptEnabled = import.meta.env.VITE_PWA_PROMPT_ENABLED !== 'false';
  
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // 使用 vite-plugin-pwa 提供的 hook
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      console.log('✅ Service Worker 已注册:', registration);
    },
    onRegisterError(error) {
      console.error('❌ Service Worker 注册失败:', error);
    },
  });

  // 检测是否在独立模式（已安装）
  const isStandalone = 
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://');

  // 监听 beforeinstallprompt 事件（仅在启用时）
  useEffect(() => {
    if (!isPromptEnabled) {
      console.log('ℹ️ PWA 安装提示已通过环境变量禁用');
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
      console.log('💡 PWA 可以安装');
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [isPromptEnabled]);

  // 监听 appinstalled 事件
  useEffect(() => {
    const handler = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('🎉 PWA 已成功安装');
    };

    window.addEventListener('appinstalled', handler);

    return () => {
      window.removeEventListener('appinstalled', handler);
    };
  }, []);

  // 监听在线/离线状态
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 已恢复网络连接');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('📡 网络连接已断开');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 提示用户安装
  const promptInstall = useCallback(async () => {
    if (!isPromptEnabled) {
      console.warn('⚠️ PWA 安装提示已被环境变量禁用');
      return;
    }

    if (!deferredPrompt) {
      console.warn('⚠️ 没有可用的安装提示');
      return;
    }

    try {
      // 显示安装提示
      await deferredPrompt.prompt();
      
      // 等待用户响应
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ 用户接受安装');
      } else {
        console.log('❌ 用户拒绝安装');
      }
      
      // 清除提示（每个提示只能使用一次）
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('❌ 安装提示失败:', error);
    }
  }, [deferredPrompt, isPromptEnabled]);

  return {
    // 安装相关
    isInstallable: isPromptEnabled && isInstallable,
    isInstalled,
    promptInstall,
    
    // 更新相关
    needRefresh,
    offlineReady,
    updateServiceWorker,
    
    // 状态
    isOnline,
    isStandalone,
    
    // 环境配置
    isPromptEnabled,
  };
}

