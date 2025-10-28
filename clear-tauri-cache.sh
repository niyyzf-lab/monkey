#!/bin/bash

echo "🧹 清理 Tauri 应用缓存..."

# 停止运行的应用
echo "1. 停止运行的应用..."
pkill -f "Watch Monkey" 2>/dev/null
pkill -f "watch-monkey" 2>/dev/null

# 清理 WebView 缓存 (macOS)
echo "2. 清理 WebView 缓存..."
rm -rf ~/Library/WebKit/watch-monkey-app 2>/dev/null
rm -rf ~/Library/Caches/watch-monkey-app 2>/dev/null
rm -rf ~/Library/Application\ Support/watch-monkey-app 2>/dev/null

# 清理构建缓存
echo "3. 清理构建缓存..."
rm -rf dist/
rm -rf src-tauri/target/debug
rm -rf src-tauri/target/release

# 重新构建
echo "4. 重新构建应用..."
bun run build

echo "✅ 缓存清理完成！"
echo ""
echo "现在运行以下命令启动应用："
echo "  bun run tauri dev"
