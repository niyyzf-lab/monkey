# 远程构建签名问题修复

## 问题
```
A public key has been found, but no private key. 
Make sure to set `TAURI_SIGNING_PRIVATE_KEY` environment variable.
```

## 原因
Tauri 需要的是 `TAURI_SIGNING_PRIVATE_KEY` 环境变量（密钥**内容**），而不是 `TAURI_SIGNING_PRIVATE_KEY_PATH`（密钥路径）。

## 解决方案
在 Windows 远程构建时，使用 PowerShell 读取密钥文件内容并设置为环境变量：

```powershell
powershell -Command "$key = Get-Content -Raw -Path '.tauri/watch-monkey.key'; $env:TAURI_SIGNING_PRIVATE_KEY = $key; $env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = '88888888'; bun run tauri build"
```

## 修改的文件
- `.updater.config.json` - 第 25 行的 `buildCommand`

## 测试
运行以下命令测试远程构建：
```bash
sh scripts/create-release-json.sh
```

选择重新构建并启用远程 Windows 构建。
