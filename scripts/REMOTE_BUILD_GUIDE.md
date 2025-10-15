# 远程构建配置指南

## 配置说明

`.updater.config.json` 中有两种 `privateKeyPath`:

### 1️⃣ **build.privateKeyPath** (Tauri 签名密钥)
```json
"build": {
  "privateKeyPath": ".tauri/watch-monkey.key",
  "privateKeyPassword": "88888888"
}
```
- **用途**: Tauri 应用更新签名
- **位置**: 项目根目录下的 `.tauri/watch-monkey.key`
- **必需**: ✅ 是 (用于自动更新功能)

### 2️⃣ **remoteBuilds[].privateKeyPath** (SSH 密钥)
```json
"remoteBuilds": [{
  "privateKeyPath": "",  // 或 "/Users/wenbo/.ssh/id_rsa"
  "password": ""
}]
```
- **用途**: SSH 远程登录认证
- **位置**: 通常在 `~/.ssh/id_rsa` 或 `~/.ssh/id_ed25519`
- **必需**: ⚠️ 二选一 (SSH密钥 或 密码)

## 当前配置分析

您的配置:
```json
{
  "build": {
    "privateKeyPath": ".tauri/watch-monkey.key",        // ✅ Tauri签名密钥
    "remoteBuilds": [{
      "privateKeyPath": "",                             // SSH密钥(可选)
      "password": "",                                   // SSH密码(可选)
      "remoteProjectPath": "/cygdrive/c/Users/yinfax/Desktop/watch-monkey-app"
    }]
  }
}
```

## SSH 认证配置选项

### 选项 1: 使用默认 SSH 密钥 (推荐) ✨
```json
"privateKeyPath": "",
"password": ""
```
- 脚本会使用系统默认的 SSH 配置 (`~/.ssh/config`)
- 如果已经能够 `ssh yinfax@192.168.31.218` 免密登录,则无需配置

### 选项 2: 指定 SSH 密钥路径
```json
"privateKeyPath": "/Users/wenbo/.ssh/id_rsa",
"password": ""
```

### 选项 3: 使用密码认证
```json
"privateKeyPath": "",
"password": "your-ssh-password"
```
- ⚠️ 需要安装 `sshpass`: `brew install sshpass`

## Windows 远程路径说明

如果 Windows 上使用 **Cygwin/MSYS2/Git Bash**:
```json
"remoteProjectPath": "/cygdrive/c/Users/yinfax/Desktop/watch-monkey-app"
```

如果 Windows 上使用 **WSL**:
```json
"remoteProjectPath": "/mnt/c/Users/yinfax/Desktop/watch-monkey-app"
```

如果 Windows 上使用 **PowerShell/CMD** (通过 OpenSSH):
```json
"remoteProjectPath": "C:/Users/yinfax/Desktop/watch-monkey-app"
```

## 远程构建命令说明

当前配置会将 Tauri 签名密钥同步到远程,并在远程执行构建:

```bash
export TAURI_SIGNING_PRIVATE_KEY='$(cat .tauri/watch-monkey.key)' && \
export TAURI_SIGNING_PRIVATE_KEY_PASSWORD='88888888' && \
bun run tauri build
```

这样可以确保远程构建的产物也包含签名文件 (`.sig`)。

## 测试 SSH 连接

在运行脚本前,先测试 SSH 连接:

```bash
# 测试连接
ssh -p 22 yinfax@192.168.31.218

# 测试执行命令
ssh -p 22 yinfax@192.168.31.218 "cd /cygdrive/c/Users/yinfax/Desktop && pwd"
```

## 使用流程

1. **首次使用**: 在远程 Windows 机器上准备好项目目录
   ```bash
   # 远程机器上
   mkdir -p /cygdrive/c/Users/yinfax/Desktop/watch-monkey-app
   ```

2. **运行构建脚本**:
   ```bash
   ./scripts/create-release-json.sh
   ```

3. **构建流程**:
   - ✅ 本地构建 (macOS/Linux)
   - 🪟 询问是否远程构建 Windows 版本
   - 📤 同步项目文件到远程
   - 🔨 远程执行构建
   - 📥 下载构建产物

## 常见问题

### Q1: 需要在远程 Windows 机器上安装什么?
- ✅ Bun
- ✅ Rust + Tauri CLI
- ✅ Node.js
- ✅ SSH Server (OpenSSH)
- ⚠️ Rsync (可选,用于增量同步)

### Q2: 如何设置 SSH 免密登录?
```bash
# 在本地 Mac 上生成密钥
ssh-keygen -t ed25519

# 复制公钥到远程
ssh-copy-id yinfax@192.168.31.218

# 测试免密登录
ssh yinfax@192.168.31.218
```

### Q3: 远程构建失败怎么办?
- 检查远程环境是否正确安装依赖
- 检查远程项目路径是否正确
- 查看远程构建日志
- 可以先手动 SSH 到远程机器测试构建命令

### Q4: 不想每次都同步所有文件?
- 使用 `rsync` (已配置): 只同步变更的文件
- 首次同步较慢,后续会很快

## 最佳实践

1. **使用 SSH 密钥认证** (而非密码)
2. **使用 rsync 同步** (而非 scp)
3. **在远程机器上保留 node_modules** (加快构建速度)
4. **定期清理远程构建缓存**: `rm -rf target/`

