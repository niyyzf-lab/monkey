# 清理应用缓存指南

## 适用场景
- 应用显示空白页面
- 更新后功能异常
- 需要清除所有本地数据

## macOS 用户

### 方法 1: 完全重置（推荐）
1. **退出应用**
   - 右键点击 Dock 中的应用图标
   - 选择"退出"
   
2. **删除应用数据**
   打开终端，执行以下命令：
   ```bash
   # 删除 WebView 缓存
   rm -rf ~/Library/WebKit/watch-monkey-app
   
   # 删除应用缓存
   rm -rf ~/Library/Caches/watch-monkey-app
   rm -rf ~/Library/Caches/com.watch-monkey.app
   
   # 删除应用数据（包括设置）
   rm -rf ~/Library/Application\ Support/watch-monkey-app
   rm -rf ~/Library/Application\ Support/com.watch-monkey.app
   
   # 删除偏好设置
   rm -rf ~/Library/Preferences/watch-monkey-app.plist
   rm -rf ~/Library/Preferences/com.watch-monkey.app.plist
   ```

3. **重新启动应用**
   - 从应用程序文件夹启动
   - 应用将使用全新状态

### 方法 2: 仅清除缓存（保留设置）
```bash
# 只删除缓存，保留用户设置
rm -rf ~/Library/Caches/watch-monkey-app
rm -rf ~/Library/WebKit/watch-monkey-app
```

### 方法 3: 使用脚本
创建一个快捷脚本：
```bash
#!/bin/bash
echo "清理 Watch Monkey App 缓存..."
pkill -f "Watch Monkey" 2>/dev/null
rm -rf ~/Library/WebKit/watch-monkey-app
rm -rf ~/Library/Caches/watch-monkey-app
echo "✅ 缓存清理完成！请重新启动应用。"
```

保存为 `clear-cache.sh`，执行：
```bash
chmod +x clear-cache.sh
./clear-cache.sh
```

## Windows 用户

### 方法 1: 通过文件管理器
1. **退出应用**
   - 右键任务栏图标
   - 选择"退出"

2. **删除应用数据**
   按 `Win + R`，依次打开并删除以下文件夹：
   ```
   %APPDATA%\watch-monkey-app
   %LOCALAPPDATA%\watch-monkey-app
   ```

3. **清除 WebView 缓存**
   ```
   %LOCALAPPDATA%\Microsoft\Edge\User Data
   ```
   （找到与应用相关的配置文件夹）

### 方法 2: 使用命令行
打开 PowerShell（管理员），执行：
```powershell
# 停止应用
taskkill /F /IM "Watch Monkey.exe" 2>$null

# 删除应用数据
Remove-Item -Recurse -Force "$env:APPDATA\watch-monkey-app" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\watch-monkey-app" -ErrorAction SilentlyContinue

Write-Host "✅ 缓存清理完成！请重新启动应用。"
```

## Linux 用户

### 方法 1: 命令行清理
```bash
# 停止应用
pkill -f "watch-monkey" 2>/dev/null

# 删除应用数据
rm -rf ~/.config/watch-monkey-app
rm -rf ~/.cache/watch-monkey-app
rm -rf ~/.local/share/watch-monkey-app

echo "✅ 缓存清理完成！请重新启动应用。"
```

### 方法 2: 使用文件管理器
1. 显示隐藏文件（Ctrl + H）
2. 删除以下文件夹：
   - `~/.config/watch-monkey-app`
   - `~/.cache/watch-monkey-app`
   - `~/.local/share/watch-monkey-app`

## 开发者清理（在项目目录）

如果你是开发者，需要清理开发环境：

```bash
# 进入项目目录
cd /path/to/watch-monkey-app

# 执行清理脚本
./clear-tauri-cache.sh

# 或手动清理
rm -rf dist/
rm -rf src-tauri/target/
bun run build
bun run tauri dev
```

## 验证清理成功

重新启动应用后，检查：
1. ✅ 应用正常显示界面（不是空白）
2. ✅ 主题设置恢复默认
3. ✅ 数据重新加载
4. ✅ Network 面板显示新文件加载

## 常见问题

### Q: 清理后数据会丢失吗？
A: 取决于你选择的方法：
- **仅清除缓存**：不会丢失设置
- **完全重置**：所有本地设置会丢失，服务器数据不受影响

### Q: 为什么更新后还是显示旧版本？
A: Tauri 的 WebView 会缓存资源文件，需要清理缓存后才能加载新文件。

### Q: 如何确认应用版本？
A: 打开应用 > 设置 > 关于，查看当前版本号。

### Q: 清理后应用还是空白？
A: 检查：
1. 应用是否完全退出（检查任务管理器/活动监视器）
2. 是否删除了正确的文件夹
3. 尝试重新安装应用

## 预防措施

为避免需要频繁清理缓存：
1. 使用应用内的自动更新功能
2. 定期重启应用
3. 关注更新日志中的破坏性更改

## 技术原理

Tauri 应用使用系统 WebView（macOS 的 WKWebView，Windows 的 Edge WebView2）。这些 WebView 会缓存：
- HTML/CSS/JS 文件
- Service Worker
- LocalStorage 数据
- IndexedDB 数据

清理缓存会删除这些数据，强制 WebView 重新加载资源。

