# 脚本工具集

本目录包含项目开发和发布相关的自动化脚本。

## 脚本列表

### 1. update-version.sh - 交互式版本号更新脚本

智能更新项目版本号，支持语义化版本控制（SemVer）。

**使用方法**:
```bash
# 交互式选择版本号（推荐）
bash scripts/update-version.sh

# 或直接指定版本号
bash scripts/update-version.sh 1.2.3

# 添加执行权限后直接运行
./scripts/update-version.sh
```

**功能特性**:
- ✅ 自动读取当前版本号
- ✅ 智能建议版本升级选项（补丁/次版本/主版本）
- ✅ 支持自定义版本号
- ✅ 同步更新 `tauri.conf.json` 和 `package.json`
- ✅ 版本号格式验证
- ✅ 更新后自动验证
- ✅ 失败自动恢复备份
- ✅ 彩色输出和友好提示
- ✅ 提供后续操作建议

**版本类型说明**:
- **补丁版本 (Patch)**: `0.1.0` → `0.1.1` - 用于 Bug 修复、小改进
- **次版本 (Minor)**: `0.1.0` → `0.2.0` - 用于新功能、向后兼容的更改
- **主版本 (Major)**: `0.1.0` → `1.0.0` - 用于重大更新、破坏性更改

**推荐工作流**:
```bash
# 1. 更新版本号
./scripts/update-version.sh

# 2. 提交更改
git add .
git commit -m "chore: bump version to 1.2.3"

# 3. 创建标签（可选）
git tag -a v1.2.3 -m "Release v1.2.3"

# 4. 推送到远程
git push origin main
git push origin v1.2.3

# 5. 同步到 release 分支触发构建
./scripts/sync-to-release.sh
```

---

### 2. sync-to-release.sh - 版本发布脚本（推荐）

**一键完成版本更新和发布**，融合版本号更新、Git 标签创建、分支同步等所有发布流程。

**使用方法**:
```bash
# 交互式运行（推荐）
bash scripts/sync-to-release.sh

# 或指定版本号直接运行
bash scripts/sync-to-release.sh 1.2.3

# 添加执行权限后直接运行
./scripts/sync-to-release.sh
```

**功能特性**:
- ✅ **版本管理**: 自动读取当前版本，提供升级建议（补丁/次版本/主版本）
- ✅ **版本更新**: 同步更新 `tauri.conf.json` 和 `package.json`
- ✅ **Git 提交**: 自动提交版本更新
- ✅ **Git 标签**: 自动创建版本标签
- ✅ **分支同步**: 自动合并 main 到 release
- ✅ **自动推送**: 推送代码和标签到远程仓库
- ✅ **触发构建**: 自动触发 GitHub Actions CI/CD
- ✅ **错误处理**: 完善的错误检查和恢复机制
- ✅ **友好交互**: 彩色输出、进度显示、操作确认

**完整工作流程**:
1. 检查工作目录是否干净
2. 切换到 main 分支并更新
3. 读取当前版本号
4. 交互式选择新版本号（或使用命令行参数）
5. 更新版本号文件（tauri.conf.json、package.json）
6. 提交版本更新
7. 创建 Git 标签
8. 推送到 main 分支
9. 合并 main 到 release 分支
10. 推送到 release 分支触发构建

**版本类型说明**:
- **补丁版本 (Patch)**: `0.1.0` → `0.1.1` - Bug 修复、小改进
- **次版本 (Minor)**: `0.1.0` → `0.2.0` - 新功能、向后兼容的更改
- **主版本 (Major)**: `0.1.0` → `1.0.0` - 重大更新、破坏性更改

**推荐发布流程**:
```bash
# 一键完成所有发布流程（推荐！）
./scripts/sync-to-release.sh

# 脚本会自动完成：
# ✓ 版本号更新
# ✓ Git 提交和打标签
# ✓ 推送到 main 分支
# ✓ 同步到 release 分支
# ✓ 触发自动构建
```

**使用示例**:
```bash
# 示例 1: 交互式发布（推荐）
$ ./scripts/sync-to-release.sh

================================================
  📦 版本发布工具 (版本更新 + 同步到 Release)
================================================

[1/10] 检查工作目录状态...
✓ 工作目录干净

[2/10] 当前分支: main

[3/10] 读取当前版本号...
📋 当前版本: 0.1.0

[4/10] 选择新版本号...

💡 版本升级选项:

   [1] 🐛 补丁版本 (Patch): 0.1.1
       └─ 用于: Bug 修复、小改进
   
   [2] ✨ 次版本 (Minor):  0.2.0
       └─ 用于: 新功能、向后兼容的更改
   
   [3] 🚀 主版本 (Major):  1.0.0
       └─ 用于: 重大更新、破坏性更改
   
   [0] ✏️  自定义版本

📦 请选择版本类型 (1/2/3/0) [默认: 1]: 2

================================================
📝 发布预览
================================================

   旧版本: 0.1.0
   新版本: 0.2.0
   
   将执行以下操作:
   1. 更新版本号文件
   2. 提交版本更新
   3. 创建 Git 标签 v0.2.0
   4. 推送到 main 分支
   5. 同步到 release 分支触发构建

确认发布新版本？(Y/n): y

[后续自动完成所有步骤...]

================================================
🎉 版本发布完成！
================================================

📊 发布摘要:

   • 版本号: 0.1.0 → 0.2.0
   • Git 标签: v0.2.0
   • 已推送到 main 分支
   • 已同步到 release 分支

✓ GitHub Actions 将自动开始构建...

🔗 查看构建状态:
   https://github.com/your-org/your-repo/actions

# 示例 2: 直接指定版本号
$ ./scripts/sync-to-release.sh 1.0.0
✓ 使用命令行参数指定的版本: 1.0.0
[自动完成所有步骤...]
```

**与 update-version.sh 的区别**:
- `update-version.sh`: 仅更新版本号文件，需手动提交、打标签、推送
- `sync-to-release.sh`: **一键完成**所有发布流程，包括版本更新、提交、打标签、同步分支等

**注意事项**:
1. 执行前确保工作目录干净（已提交所有改动）
2. 脚本会自动推送到远程仓库，请确认版本号正确
3. 推送到 release 分支后会自动触发 CI/CD 构建
4. 如果遇到合并冲突，脚本会提供解决建议

---

### 3. create-release-json.sh - Release 管理脚本

自动化 Tauri 应用的构建、打包和发布流程，支持自动上传到 Gitea Release。

## 功能特性

- ✅ **智能版本管理**: 自动读取当前版本，提供补丁/次版本/主版本升级建议
- ✅ **自动构建**: 可选择是否重新构建应用
- ✅ **文件重命名**: 自动将构建产物重命名为包含版本号和架构的格式
- ✅ **生成 latest.json**: 为 Tauri 更新器生成配置文件
- ✅ **自动上传**: 支持自动上传到 Gitea Release
- ✅ **自动更新版本号**: 完成后自动更新 `tauri.conf.json` 和 `package.json` 中的版本号
- ✅ **多平台支持**: 支持 macOS (ARM64/x64)、Linux (x64)、Windows (x64)

## 快速开始

### 1. 创建配置文件

复制示例配置文件并修改：

```bash
cp .updater.config.example.json .updater.config.json
```

编辑 `.updater.config.json`:

```json
{
  "gitea": {
    "url": "http://gitea.watchmonkey.icu",
    "owner": "niyyzf",
    "repo": "watch-monkey-app",
    "token": "your-gitea-token-here",
    "autoUpload": true
  },
  "app": {
    "name": "watch-monkey-app"
  },
  "build": {
    "command": "bun run tauri build",
    "privateKeyPath": ".tauri/watch-monkey.key",
    "privateKeyPassword": ""
  }
}
```

### 2. 获取 Gitea Personal Access Token

1. 登录 Gitea
2. 点击右上角头像 → 设置
3. 左侧菜单选择"应用"
4. 在"管理访问令牌"部分，点击"生成新令牌"
5. 选择权限（至少需要 `repo` 权限）
6. 复制生成的 token 到配置文件

### 3. 运行脚本

```bash
# 交互式运行（推荐）
bash scripts/create-release-json.sh

# 或指定版本号
bash scripts/create-release-json.sh 0.2.0

# 完整参数
bash scripts/create-release-json.sh <version> <gitea-url> <owner> <repo>
```

## 使用流程

### 交互式流程

1. **选择版本号**
   - 脚本会读取当前版本并提供升级建议
   - 可以选择补丁版本、次版本、主版本或自定义版本

2. **检查构建产物**
   - 如果存在构建产物，会显示列表并询问是否重新构建
   - 如果不存在，会询问是否现在构建

3. **构建应用**（如果选择）
   - 自动设置签名环境变量
   - 执行构建命令
   - 检查构建结果

4. **重命名构建文件**
   - 自动将文件重命名为包含版本号和架构的格式
   - 例如: `watch-monkey-app.app.tar.gz` → `watch-monkey-app_0.2.0_aarch64.app.tar.gz`

5. **输入更新说明**
   - 输入本次更新的说明（支持多行）
   - 按 `Ctrl+D` 完成输入

6. **生成 latest.json**
   - 自动扫描构建产物
   - 生成包含所有平台的更新配置文件

7. **上传到 Gitea**（可选）
   - 如果配置了 token，会询问是否上传
   - 自动创建 Release
   - 上传所有构建产物和签名文件
   - 上传 latest.json

8. **更新版本号**
   - 自动更新 `src-tauri/tauri.conf.json` 中的版本号
   - 自动更新 `package.json` 中的版本号
   - 确保下次构建使用新版本

## 配置说明

### gitea 配置

| 字段 | 说明 | 必需 |
|------|------|------|
| `url` | Gitea 服务器地址 | ✅ |
| `owner` | 仓库所有者 | ✅ |
| `repo` | 仓库名称 | ✅ |
| `token` | Personal Access Token | 上传时必需 |
| `autoUpload` | 是否自动上传（不询问） | ❌ |

### app 配置

| 字段 | 说明 | 必需 |
|------|------|------|
| `name` | 应用名称 | ✅ |

### build 配置

| 字段 | 说明 | 必需 |
|------|------|------|
| `command` | 构建命令 | ✅ |
| `privateKeyPath` | 签名私钥路径 | 自动更新必需 |
| `privateKeyPassword` | 私钥密码 | ❌ |

## 文件命名规则

构建产物会被重命名为以下格式：

- **macOS ARM64**: `{app-name}_{version}_aarch64.app.tar.gz`
- **macOS x64**: `{app-name}_{version}_x64.app.tar.gz`
- **Linux x64**: `{app-name}_{version}_amd64.AppImage.tar.gz`
- **Windows x64**: `{app-name}_{version}_x64-setup.nsis.zip`

每个文件都会有对应的 `.sig` 签名文件。

## Gitea API 使用

脚本使用以下 Gitea API 端点：

1. **检查 Release**: `GET /api/v1/repos/{owner}/{repo}/releases/tags/{tag}`
2. **创建 Release**: `POST /api/v1/repos/{owner}/{repo}/releases`
3. **删除 Release**: `DELETE /api/v1/repos/{owner}/{repo}/releases/{id}`
4. **上传附件**: `POST /api/v1/repos/{owner}/{repo}/releases/{id}/assets`

## 常见问题

### 1. 没有找到构建产物

**原因**: 未运行构建或签名密钥未配置

**解决**:
```bash
# 设置签名密钥
export TAURI_SIGNING_PRIVATE_KEY=$(cat .tauri/watch-monkey.key)

# 运行构建
bun run tauri build
```

### 2. 上传失败

**原因**: Token 权限不足或网络问题

**解决**:
- 确保 Token 有 `repo` 权限
- 检查网络连接
- 查看错误响应信息

### 3. 签名文件不存在

**原因**: 未配置签名密钥

**解决**:
```bash
# 生成签名密钥对
bun tauri signer generate -- -w .tauri/watch-monkey.key

# 在配置文件中设置路径
"privateKeyPath": ".tauri/watch-monkey.key"
```

## 安全建议

1. **不要提交配置文件**: 将 `.updater.config.json` 添加到 `.gitignore`
2. **保护 Token**: 不要在代码中硬编码 token
3. **保护私钥**: 签名私钥应该安全存储，不要提交到仓库
4. **定期更新 Token**: 定期轮换 Personal Access Token

## 示例输出

```
================================================
  Tauri 自动更新 - Gitea Release JSON 生成器
================================================

📄 读取配置文件: .updater.config.json
   ✅ 已加载配置

💡 当前版本: 0.1.0

   建议版本:
   [1] 补丁版本 (Patch): 0.1.1  - 修复 bug
   [2] 次版本 (Minor):   0.2.0  - 新增功能
   [3] 主版本 (Major):   1.0.0  - 重大更新
   [0] 自定义版本

📦 请选择版本类型 (1/2/3/0) 或直接输入版本号 [默认: 1]: 2

📋 配置信息:
   版本: 0.2.0
   应用: watch-monkey-app
   服务器: http://gitea.watchmonkey.icu
   仓库: niyyzf/watch-monkey-app

✅ 找到现有构建产物 (1 个平台)

   已有构建:
   • macOS: watch-monkey-app_0.1.1_aarch64.app.tar.gz

🔄 是否重新构建应用？(y/N): n

🔍 正在扫描构建产物...

📝 重命名 macOS 构建文件:
   watch-monkey-app.app.tar.gz → watch-monkey-app_0.2.0_aarch64.app.tar.gz
   watch-monkey-app.app.tar.gz.sig → watch-monkey-app_0.2.0_aarch64.app.tar.gz.sig

📝 请输入更新说明 (输入完成后按 Ctrl+D):
- 新增功能 A
- 修复 bug B
- 性能优化
^D

  ✅ 找到 macOS ARM64 构建: watch-monkey-app_0.2.0_aarch64.app.tar.gz

================================================
✅ latest.json 已成功创建！
================================================

📊 包含 1 个平台的更新信息

================================================
🚀 自动上传已启用
================================================

开始上传到 Gitea...

🔍 检查 Release v0.2.0 是否存在...
📦 创建 Release v0.2.0...
   ✅ Release 创建成功 (ID: 123)

📤 上传构建产物...

   📤 上传: watch-monkey-app_0.2.0_aarch64.app.tar.gz
      ✅ 成功
   📤 上传: watch-monkey-app_0.2.0_aarch64.app.tar.gz.sig
      ✅ 成功
   📤 上传: latest.json
      ✅ 成功

================================================
✅ 上传完成！成功上传 3 个文件
================================================

🔗 Release 地址:
   http://gitea.watchmonkey.icu/niyyzf/watch-monkey-app/releases/tag/v0.2.0

🔗 更新检查地址:
   http://gitea.watchmonkey.icu/niyyzf/watch-monkey-app/releases/download/v0.2.0/latest.json
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT

