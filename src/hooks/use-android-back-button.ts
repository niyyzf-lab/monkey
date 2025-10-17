import { useEffect } from 'react';
import { useRouter, useLocation } from '@tanstack/react-router';
import { toast } from 'sonner';

/**
 * Hook to handle Android back button
 * 监听 Android 返回键事件，使用 TanStack Router 处理导航返回
 * 
 * 行为说明：
 * - 当有路由历史记录时：执行 router.history.back() 返回上一页
 * - 当在首页且无历史记录时：双击退出应用
 * - 当在其他页面且无历史记录时：导航到首页
 */
export function useAndroidBackButton() {
  const router = useRouter();
  const location = useLocation();

  useEffect(() => {
    let lastBackTime = 0;
    const DOUBLE_BACK_INTERVAL = 2000; // 2秒内双击退出

    const handleBackButton = (event: Event) => {
      event.preventDefault();
      
      const currentPath = location.pathname;
      console.log('[React] Back button event received, current path:', currentPath);
      console.log('[React] Router history length:', router.history.length);
      
      // 检查 TanStack Router 是否可以返回
      // TanStack Router 使用 history API，检查 history.length
      const canGoBack = router.history.length > 1;
      
      if (canGoBack) {
        // 有历史记录，执行 router 返回
        console.log('[React] Navigating back using router.history.back()');
        router.history.back();
      } else if (currentPath === '/' || currentPath === '/feel') {
        // 在首页，双击退出应用
        const currentTime = Date.now();
        console.log('[React] On home page, checking double back');
        
        if (currentTime - lastBackTime < DOUBLE_BACK_INTERVAL) {
          // 双击退出：设置退出标志，让 Android 处理
          console.log('[React] Double back detected, allowing app to exit');
          (window as any).__androidShouldExit = true;
          toast.info('正在退出应用...');
          // 触发返回键让 Android 退出
          setTimeout(() => {
            (window as any).__androidShouldExit = false;
          }, 100);
        } else {
          // 第一次点击，提示用户
          lastBackTime = currentTime;
          console.log('[React] First back press, showing toast');
          toast.info('再按一次退出应用', { duration: 2000 });
        }
      } else {
        // 在其他页面且无历史记录，返回首页
        console.log('[React] Not on home page, navigating to /feel');
        router.navigate({ to: '/feel' });
      }
    };

    // 监听自定义的 Android 返回键事件
    console.log('[React] Setting up android-back-button listener');
    window.addEventListener('android-back-button', handleBackButton);

    return () => {
      console.log('[React] Cleaning up android-back-button listener');
      window.removeEventListener('android-back-button', handleBackButton);
    };
  }, [router, location.pathname]);
}

