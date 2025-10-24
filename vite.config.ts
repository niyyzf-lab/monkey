import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import { VitePWA } from 'vite-plugin-pwa'


const host = process.env.TAURI_DEV_HOST;

// 读取环境变量，判断是否启用 PWA 安装提示（默认启用）
const isPWAPromptEnabled = process.env.VITE_PWA_PROMPT_ENABLED !== 'false';

// 自定义插件：处理 markdown 文件为纯文本
const markdownPlugin = () => {
  return {
    name: 'vite-plugin-markdown',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.endsWith('.md')) {
          const filePath = path.join(__dirname, 'src', req.url)
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8')
            res.setHeader('Content-Type', 'text/plain; charset=utf-8')
            res.end(content)
            return
          }
        }
        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig(async () => ({
  // 定义环境变量
  define: {
    __PWA_PROMPT_ENABLED__: JSON.stringify(isPWAPromptEnabled),
  },
  plugins: [
    react(), 
    tailwindcss(), 
    markdownPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa_icons/*.png', 'tauri.svg', 'monkey/*.png'],
      manifest: {
        name: 'Watch Monkey App',
        short_name: 'WatchMonkey',
        description: '股票监控和分析应用',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        // 启用窗口控件覆盖 - 允许在标题栏区域显示内容
        display_override: ['window-controls-overlay', 'standalone'],
        start_url: '/',
        scope: '/',
        orientation: 'any',
        // 添加分类，帮助应用商店正确分类
        categories: ['finance', 'business', 'productivity'],
        // 添加语言设置
        lang: 'zh-CN',
        // 添加方向偏好（支持PWA更好地适配移动设备）
        prefer_related_applications: false,
        icons: [
          {
            src: '/pwa_icons/32x32.png',
            sizes: '32x32',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa_icons/64x64.png',
            sizes: '64x64',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa_icons/128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa_icons/icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa_icons/icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB - 允许更大的 bundle 文件被缓存
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\..*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: isPWAPromptEnabled,
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // 配置静态资源处理，确保 .md 文件可以被访问
  assetsInclude: ['**/*.md'],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    // 启用局域网访问 - 允许通过 IP 地址访问（支持移动设备测试 PWA）
    host: '0.0.0.0',
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
