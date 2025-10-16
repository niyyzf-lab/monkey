# Tauri 文件格式修复说明

## 问题描述

远程 Windows 构建成功，但脚本错误地报告"下载失败"。原因是脚本使用了错误的文件命名格式。

## 根本原因

脚本原本尝试下载 `.nsis.zip` 格式的文件，但 Tauri 实际生成的文件格式如下：

### Tauri 官方文件命名规范

#### Linux
- `myapp.AppImage` - 标准应用包，被更新器重用
- `myapp.AppImage.sig` - 更新包签名

#### macOS
- `myapp.app` - 标准应用包
- `myapp.app.tar.gz` - 更新器包
- `myapp.app.tar.gz.sig` - 更新包签名

#### Windows
- `myapp-setup.exe` - NSIS 安装器，被更新器重用
- `myapp-setup.exe.sig` - 更新包签名
- `myapp.msi` - MSI 安装器，被更新器重用
- `myapp.msi.sig` - 更新包签名

## 修复内容

### 1. 构建产物检测（第 226-248 行）
**修改前:**
- 检查 `*.AppImage.tar.gz`
- 检查 `*.nsis.zip`

**修改后:**
- 检查 `*.AppImage` (正确格式)
- 检查 `*-setup.exe` (NSIS)
- 检查 `*.msi` (MSI)
- 同时支持 NSIS 和 MSI 两种 Windows 安装包格式

### 2. 构建文件显示（第 255-289 行）
**修改前:**
- 显示 `.AppImage.tar.gz`
- 显示 `.nsis.zip`

**修改后:**
- 显示 `.AppImage`
- 显示 `-setup.exe` (NSIS)
- 显示 `.msi` (MSI)
- 清晰标注 Windows NSIS 和 MSI 格式

### 3. 远程文件下载（第 604-666 行）
**修改前:**
- 仅尝试下载 NSIS 目录的 `.nsis.zip` 文件
- 单一错误提示

**修改后:**
- 同时下载 NSIS 和 MSI 两个目录的文件
- 添加路径转换函数 `convert_windows_path()`
- 分别显示 NSIS 和 MSI 的下载状态
- 只要有一个成功就算成功
- 详细的错误提示，包含两个路径

### 4. 文件重命名（第 876-916 行）
**修改前:**
- 重命名 `.AppImage.tar.gz` → `*_amd64.AppImage.tar.gz`
- 重命名 `.nsis.zip` → `*_x64-setup.nsis.zip`

**修改后:**
- 重命名 `.AppImage` → `*_amd64.AppImage`
- 重命名 `-setup.exe` → `*_x64-setup.exe` (NSIS)
- 重命名 `.msi` → `*_x64.msi` (MSI)
- 同时处理对应的 `.sig` 签名文件

### 5. 签名文件读取（第 990-1047 行）
**修改前:**
- 查找 `.AppImage.tar.gz.sig`
- 查找 `.nsis.zip.sig`

**修改后:**
- 查找 `.AppImage.sig`
- 查找 `-setup.exe.sig` (NSIS，用于自动更新)
- 查找 `.msi.sig` (MSI，作为额外选项)
- 优先使用 NSIS 格式（Tauri 更新器推荐）

### 6. 文件上传（第 1317-1327 行）
**修改前:**
- 仅上传 NSIS 文件

**修改后:**
- 上传 NSIS 文件（用于自动更新）
- 上传 MSI 文件（作为额外下载选项）
- 清晰的注释标注用途

### 7. 文件路径显示（第 1140-1145 行）
**新增:**
- 显示 Windows MSI 文件的路径
- 区分 NSIS 和 MSI 两种格式

## 技术改进

1. **路径转换函数**: 创建 `convert_windows_path()` 函数统一处理 Windows 路径转换
2. **分离式下载**: NSIS 和 MSI 分别下载，互不影响
3. **容错机制**: 只要一个 Windows 格式成功就算成功
4. **向后兼容**: 保留对旧版本文件格式的检测（带版本号的文件名）
5. **清晰的错误信息**: 失败时提供 NSIS 和 MSI 两个路径用于排查

## 测试建议

1. 测试远程 Windows 构建下载
2. 验证 NSIS 和 MSI 文件都能正确识别
3. 测试文件重命名功能
4. 验证 latest.json 生成的正确性
5. 测试自动上传到 Gitea Release

## 注意事项

- Tauri 更新器优先使用 **NSIS** 格式 (`*-setup.exe`)
- MSI 格式作为额外的下载选项提供给用户
- `latest.json` 中的 `windows-x86_64` 平台指向 NSIS 格式
- Linux 使用 `.AppImage` 格式，不是 `.AppImage.tar.gz`
- macOS 使用 `.app.tar.gz` 格式（压缩包）

## 相关文件

- `/Users/wenbo/RiderProjects/watch-monkey-app/scripts/create-release-json.sh`
- 文档参考：Tauri 官方文档 - Updater 章节

