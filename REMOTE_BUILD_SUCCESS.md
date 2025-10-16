# 远程 Windows 构建修复完成 ✅

## 修复时间
2025-10-15

## 成功解决的问题

### 1. ✅ Git 凭证管理器问题
- **问题**: Windows Git 凭证管理器尝试弹出交互式窗口
- **解决**: 使用 `git -c credential.helper=` 禁用凭证管理器，并在 URL 中嵌入 Token

### 2. ✅ Git 分支已存在错误
- **问题**: `fatal: a branch named 'main' already exists`
- **解决**: 使用 `git show-ref` 先检查分支是否存在

### 3. ✅ Windows 目录创建命令
- **问题**: Unix `mkdir -p` 在 Windows 上不工作
- **解决**: 使用 `if not exist ... mkdir ...`

### 4. ✅ Tauri 签名密钥环境变量问题（核心问题）
- **错误信息**: 
  ```
  A public key has been found, but no private key. 
  Make sure to set `TAURI_SIGNING_PRIVATE_KEY` environment variable.
  ```

- **根本原因**: 
  - Tauri 需要 `TAURI_SIGNING_PRIVATE_KEY` 环境变量（密钥**内容**）
  - 而不是 `TAURI_SIGNING_PRIVATE_KEY_PATH`（密钥路径）
  - 通过 SSH 执行时，bash 会解析 `$` 符号

- **解决方案**:
  1. 在配置文件中使用 PowerShell 读取密钥内容：
     ```powershell
     powershell -Command "$env:TAURI_SIGNING_PRIVATE_KEY = Get-Content -Raw '.tauri/watch-monkey.key'; $env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = '88888888'; bun run tauri build"
     ```
  
  2. 在脚本中转义 `$` 符号防止被 bash 解析：
     ```bash
     ESCAPED_BUILD_CMD="${ESCAPED_BUILD_CMD//\$/\\\$}"
     ```

### 5. ✅ Windows 构建产物下载路径问题
- **问题**: SCP 无法识别 Windows `C:/` 路径格式
- **解决**: 
  - 将 `C:/Users/...` 转换为 `/cygdrive/c/Users/...` 格式
  - 正确处理通配符和路径引号

## 最终配置

### .updater.config.json
```json
{
  "build": {
    "remoteBuilds": [
      {
        "buildCommand": "cd C:/Users/yinfax/Desktop/watch-monkey-app && bun install && powershell -Command \"$env:TAURI_SIGNING_PRIVATE_KEY = Get-Content -Raw '.tauri/watch-monkey.key'; $env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = '88888888'; bun run tauri build\""
      }
    ]
  }
}
```

### 关键修改点
1. **scripts/create-release-json.sh**:
   - 第 451 行: 禁用 Git 凭证管理器
   - 第 460 行: Git fetch 禁用交互式提示
   - 第 464 行: 分支检出前先检查是否存在
   - 第 524 行: Git clone 禁用凭证管理器
   - 第 556 行: Windows 目录创建命令
   - 第 575 行: 转义 `$` 符号
   - 第 597-620 行: Windows 路径转换和下载逻辑

## 测试结果
✅ 远程构建成功
⚠️  下载构建产物需要进一步测试路径转换

## 使用方法
```bash
sh scripts/create-release-json.sh
# 选择版本号
# 选择重新构建
# 选择启用远程 Windows 构建
```

## 注意事项
1. 确保远程 Windows 机器上：
   - 已安装 Git, Bun, PowerShell
   - SSH 服务正常运行
   - 签名密钥已同步到 `.tauri/watch-monkey.key`

2. 如果下载失败：
   - 检查远程机器是否使用 Cygwin/Git Bash
   - 验证构建产物路径：`C:/Users/yinfax/Desktop/watch-monkey-app/src-tauri/target/release/bundle/nsis/`
   - 手动 SCP 测试：`scp user@host:/cygdrive/c/path/to/file ./`

## 下一步优化
- [ ] 验证并修复 SCP 下载路径问题
- [ ] 添加更详细的错误日志
- [ ] 支持其他远程平台（Linux）

