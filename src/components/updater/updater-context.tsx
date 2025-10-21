import { createContext, useContext } from 'react';

// 更新状态枚举
export enum UpdateStatus {
  IDLE = 'idle',
  CHECKING = 'checking',
  AVAILABLE = 'available',
  DOWNLOADING = 'downloading',
  INSTALLING = 'installing',
  READY_TO_RELAUNCH = 'ready_to_relaunch',
  RELAUNCHING = 'relaunching',
}

// 创建更新器上下文
export interface UpdaterContextType {
  checkForUpdates: (silent?: boolean) => Promise<void>;
  isChecking: boolean;
  updateStatus: UpdateStatus;
  // 开发调试方法
  forceShowUpdateDialog: () => void;
  forceDownloadAndInstall: () => Promise<void>;
}

export const UpdaterContext = createContext<UpdaterContextType | null>(null);

// 导出 hook 供其他组件使用
export function useUpdater() {
  const context = useContext(UpdaterContext);
  if (!context) {
    throw new Error('useUpdater must be used within UpdaterProvider');
  }
  return context;
}

