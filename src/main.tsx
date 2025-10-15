import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { Toaster } from 'sonner';
import './index.css';

// 创建路由实例
const router = createRouter({ routeTree });

// 注册路由实例类型
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <Toaster 
      position="top-right"
      closeButton
      richColors
      expand
      visibleToasts={5}
      toastOptions={{
        style: { fontSize: '14px' },
        className: 'sonner-toast',
        duration: 3000,
      }}
    />
  </React.StrictMode>,
);
