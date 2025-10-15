# Windows 远程构建环境配置指南

## 问题诊断

您遇到的错误:
```
'rsync' 不是内部或外部命令,也不是可运行的程序或批处理文件
```

**原因**: Windows 默认不支持 rsync，需要使用 `tar + scp` 方式同步。

## ✅ 已修复

配置文件已更新为:
```json
{
  "syncMethod": "scp",                                    // ✅ 改用 scp
  "remoteProjectPath": "C:/Users/yinfax/Desktop/watch-monkey-app",  // ✅ Windows 路径
  "buildCommand": "cd C:/Users/yinfax/Desktop/watch-monkey-app && set TAURI_SIGNING_PRIVATE_KEY_PATH=.tauri/watch-monkey.key && set TAURI_SIGNING_PRIVATE_KEY_PASSWORD=88888888 && bun run tauri build"  // ✅ Windows CMD 命令
}
```

## 🖥️ Windows 远程机器环境要求

### 1. 安装 OpenSSH Server

Windows 10/11 自带，需要启用:

```powershell
# PowerShell (管理员)
# 安装 OpenSSH Server
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0

# 启动服务
Start-Service sshd

# 设置自动启动
Set-Service -Name sshd -StartupType 'Automatic'

# 确认防火墙规则
Get-NetFirewallRule -Name *ssh*

# 如果没有规则,添加防火墙规则
New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
```

### 2. 安装开发环境

在 Windows 上需要安装:

#### a) Bun
```powershell
# PowerShell
irm bun.sh/install.ps1 | iex
```

#### b) Rust
```powershell
# 下载并安装: https://rustup.rs/
# 或者使用 winget
winget install Rustlang.Rustup
```

#### c) Node.js (如果需要)
```powershell
winget install OpenJS.NodeJS
```

#### d) Git Bash 或 MSYS2 (可选，用于 tar 命令)

**选项 1: Git for Windows**
```powershell
winget install Git.Git
```

**选项 2: MSYS2**
```
https://www.msys2.org/
```

### 3. 检查 tar 命令

SSH 连接后需要能执行 `tar` 命令:

```cmd
# 测试 tar 是否可用
tar --version

# Windows 10 1809+ 自带 tar
# 如果没有,安装 Git Bash 或 MSYS2
```

### 4. 准备项目目录

```powershell
# 在 Windows 上创建项目目录
New-Item -ItemType Directory -Force -Path "C:\Users\yinfax\Desktop\watch-monkey-app"
cd "C:\Users\yinfax\Desktop\watch-monkey-app"

# 首次需要手动同步并安装依赖 (之后自动同步)
# 可以先手动 git clone 或等待自动同步
```

## 🧪 测试连接

在 Mac 上测试 SSH 连接:

```bash
# 1. 测试基本连接
ssh yinfax@192.168.31.218

# 2. 测试密码认证 (使用 sshpass)
brew install sshpass
sshpass -p '88888888' ssh yinfax@192.168.31.218 'echo "连接成功"'

# 3. 测试 tar 命令
ssh yinfax@192.168.31.218 'tar --version'

# 4. 测试创建目录
ssh yinfax@192.168.31.218 'mkdir -p C:/Users/yinfax/Desktop/watch-monkey-app'

# 5. 测试上传文件
echo "test" > /tmp/test.txt
scp /tmp/test.txt yinfax@192.168.31.218:C:/Users/yinfax/Desktop/test.txt
```

## 📋 完整工作流程

### 步骤 1: 确保 Windows 环境就绪

```powershell
# 在 Windows PowerShell 中
cd C:\Users\yinfax\Desktop\watch-monkey-app

# 检查环境
bun --version
cargo --version
rustc --version
tar --version

# 如果是首次,可能需要手动安装依赖
# bun install  # 首次可能需要手动运行
```

### 步骤 2: 在 Mac 上运行构建脚本

```bash
cd /Users/wenbo/RiderProjects/watch-monkey-app

# 运行发布脚本
./scripts/create-release-json.sh

# 当询问版本时,输入版本号
# 当询问是否构建时,选择 Y
# 当询问是否远程构建 Windows 版本时,选择 Y
```

### 步骤 3: 自动执行流程

1. ✅ **本地 macOS 构建** (生成 .app.tar.gz)
2. 📦 **打包项目文件** (排除 node_modules, target)
3. 📤 **上传到 Windows** (通过 SCP)
4. 📦 **解压到项目目录**
5. 🔨 **远程构建** (bun run tauri build)
6. 📥 **下载构建产物** (.nsis.zip 和 .sig)
7. 📤 **上传到 Gitea Release**

## ⚠️ 常见问题

### Q1: SSH 连接超时
```bash
# 检查防火墙
# 检查 Windows Defender 防火墙是否允许 22 端口

# 在 Windows 上检查 SSH 服务
Get-Service sshd
```

### Q2: tar 命令不存在
```bash
# 方案 1: 安装 Git for Windows (推荐)
winget install Git.Git

# 方案 2: 使用 Windows 自带 tar (Windows 10 1809+)
where tar  # 应该显示 C:\Windows\System32\tar.exe
```

### Q3: 权限被拒绝
```powershell
# 确保用户有写入权限
icacls "C:\Users\yinfax\Desktop\watch-monkey-app" /grant yinfax:F
```

### Q4: 构建失败 - 找不到依赖
```bash
# 首次需要在 Windows 上手动安装依赖
cd C:\Users\yinfax\Desktop\watch-monkey-app
bun install

# 或者修改 buildCommand 添加 bun install
"buildCommand": "cd C:/Users/yinfax/Desktop/watch-monkey-app && bun install && set TAURI_SIGNING_PRIVATE_KEY_PATH=.tauri/watch-monkey.key && set TAURI_SIGNING_PRIVATE_KEY_PASSWORD=88888888 && bun run tauri build"
```

### Q5: 签名密钥找不到
```bash
# 确保 .tauri 目录和密钥文件被同步
# 脚本会自动同步,但首次可能需要检查

# Windows 上检查
dir C:\Users\yinfax\Desktop\watch-monkey-app\.tauri\
```

## 🚀 优化建议

### 1. 使用 SSH 密钥认证 (而非密码)

```bash
# Mac 上生成密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 复制公钥到 Windows
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh yinfax@192.168.31.218 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# 然后配置文件中可以移除密码
"password": "",
"privateKeyPath": "/Users/wenbo/.ssh/id_ed25519"
```

### 2. 保留 node_modules (加速构建)

由于脚本排除了 node_modules,首次构建后可以在 Windows 保留它:

```bash
# Windows 上首次手动安装
cd C:\Users\yinfax\Desktop\watch-monkey-app
bun install

# 之后构建会使用已有的 node_modules
```

### 3. 使用增量构建

```bash
# 不要每次都清理 target 目录
# Rust 会自动做增量编译
```

## 📝 最终配置示例

```json
{
  "build": {
    "remoteBuilds": [
      {
        "enabled": true,
        "platform": "windows",
        "host": "192.168.31.218",
        "port": 22,
        "username": "yinfax",
        "password": "88888888",
        "privateKeyPath": "",
        "remoteProjectPath": "C:/Users/yinfax/Desktop/watch-monkey-app",
        "buildCommand": "cd C:/Users/yinfax/Desktop/watch-monkey-app && set TAURI_SIGNING_PRIVATE_KEY_PATH=.tauri/watch-monkey.key && set TAURI_SIGNING_PRIVATE_KEY_PASSWORD=88888888 && bun run tauri build",
        "syncMethod": "scp"
      }
    ]
  }
}
```

## 🎯 总结

- ✅ **syncMethod 改为 `scp`** - 不依赖 rsync
- ✅ **使用 Windows 路径格式** - `C:/Users/...`
- ✅ **使用 Windows CMD 命令** - `set` 而非 `export`
- ✅ **确保 Windows 有 tar 命令** - Git Bash 或系统自带
- ✅ **安装 sshpass** - 支持密码认证: `brew install sshpass`

现在重新运行脚本应该可以正常工作了! 🎉

