# 🚀 脚本快速使用指南

## 📋 完整发布流程

从版本更新到自动构建的完整工作流：

```bash
# 1️⃣ 更新版本号（交互式）
./scripts/update-version.sh

# 2️⃣ 提交版本更改
git add .
git commit -m "chore: bump version to x.y.z"

# 3️⃣ 推送到 main 分支
git push origin main

# 4️⃣ 同步到 release 分支（触发自动构建）
./scripts/sync-to-release.sh
```

完成！GitHub Actions 会自动：
- 构建所有平台（macOS ARM64/x64、Windows）
- 创建 Draft Release
- 上传构建产物

---

## 🛠️ 各脚本详细说明

### 1. 版本号更新 - `update-version.sh`

**适用场景**：准备发布新版本时

```bash
# 交互式（推荐）
./scripts/update-version.sh

# 直接指定版本
./scripts/update-version.sh 1.2.3
```

**交互示例**：
```
================================================
         📦 交互式版本号更新工具
================================================

📋 当前配置信息:

   当前版本: 0.1.0
   Tauri 配置: src-tauri/tauri.conf.json
   Package 配置: package.json

💡 版本升级选项:

   [1] 🐛 补丁版本 (Patch): 0.1.1
       └─ 用于: Bug 修复、小改进

   [2] ✨ 次版本 (Minor):  0.2.0
       └─ 用于: 新功能、向后兼容的更改

   [3] 🚀 主版本 (Major):  1.0.0
       └─ 用于: 重大更新、破坏性更改

   [0] ✏️  自定义版本

📦 请选择版本类型 (1/2/3/0) [默认: 1]: 
```

**功能**：
- ✅ 智能版本建议（遵循 SemVer）
- ✅ 同步更新多个配置文件
- ✅ 自动验证和备份
- ✅ 失败自动回滚

---

### 2. 分支同步 - `sync-to-release.sh`

**适用场景**：main 分支开发完成，准备触发构建

```bash
./scripts/sync-to-release.sh
```

**执行流程**：
```
=== 同步 main 到 release 分支 ===

[1/7] 检查工作目录状态...
✓ 工作目录干净

[2/7] 当前分支: main

[3/7] 拉取远程最新代码...
✓ 远程代码已更新

[4/7] 切换到 main 分支并更新...
✓ main 分支已更新

[5/7] 切换到 release 分支...
✓ release 分支已更新

[6/7] 合并 main 到 release...
✓ 合并成功

[7/7] 推送到远程 release 分支...
✓ 推送成功

==================================
✓ 同步完成！
==================================
main 分支已成功同步到 release 分支
GitHub Actions 将自动开始构建...

查看构建状态: https://github.com/xxx/actions
```

**功能**：
- ✅ 自动化 Git 操作
- ✅ 安全检查（工作目录状态）
- ✅ 冲突提示和处理建议
- ✅ 自动切换回原分支

**注意事项**：
- 确保本地没有未提交的更改
- 如果遇到冲突，脚本会提示手动解决

---

### 3. Release 管理 - `create-release-json.sh`

**适用场景**：
- 本地构建和发布到 Gitea
- 生成 Tauri 自动更新配置

```bash
# 交互式（推荐）
./scripts/create-release-json.sh

# 指定版本号
./scripts/create-release-json.sh 1.2.3

# 完整参数
./scripts/create-release-json.sh 1.2.3 https://gitea.example.com owner repo
```

**配置文件**：`.updater.config.json`

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

**功能**：
- ✅ 本地构建应用
- ✅ 生成 `latest.json` 更新配置
- ✅ 自动上传到 Gitea Release
- ✅ 多平台支持（macOS/Linux/Windows）

详细文档：[scripts/README.md](./README.md)

---

## 🔄 推荐工作流

### 方式一：GitHub Actions 自动构建（推荐）

```bash
# 1. 更新版本
./scripts/update-version.sh

# 2. 提交并推送
git add .
git commit -m "chore: bump version to x.y.z"
git push origin main

# 3. 触发构建
./scripts/sync-to-release.sh
```

**优点**：
- ✅ 自动构建所有平台
- ✅ 无需本地配置构建环境
- ✅ 构建速度快（使用 GitHub 服务器）
- ✅ 自动创建 GitHub Release

---

### 方式二：本地构建发布到 Gitea

```bash
# 1. 配置 .updater.config.json
cp .updater.config.example.json .updater.config.json
# 编辑配置文件，添加 Gitea token

# 2. 运行构建和发布脚本
./scripts/create-release-json.sh

# 脚本会：
# - 询问版本号
# - 更新配置文件
# - 本地构建应用
# - 生成 latest.json
# - 上传到 Gitea Release
```

**优点**：
- ✅ 完全控制构建过程
- ✅ 支持自定义 Gitea 服务器
- ✅ 适合内网或私有部署

---

## 🎯 常见使用场景

### 场景 1：修复紧急 Bug

```bash
# 1. 修复代码并测试
# 2. 更新补丁版本
./scripts/update-version.sh  # 选择 [1] 补丁版本

# 3. 提交
git add .
git commit -m "fix: 修复XXX问题"
git push origin main

# 4. 触发构建
./scripts/sync-to-release.sh
```

---

### 场景 2：发布新功能

```bash
# 1. 开发新功能并测试
# 2. 更新次版本
./scripts/update-version.sh  # 选择 [2] 次版本

# 3. 提交
git add .
git commit -m "feat: 新增XXX功能"
git push origin main

# 4. 触发构建
./scripts/sync-to-release.sh
```

---

### 场景 3：重大版本更新

```bash
# 1. 完成重大更新
# 2. 更新主版本
./scripts/update-version.sh  # 选择 [3] 主版本

# 3. 创建标签
git add .
git commit -m "feat!: 重大更新，破坏性变更"
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main
git push origin v1.0.0

# 4. 触发构建
./scripts/sync-to-release.sh
```

---

## ⚙️ CI/CD 配置说明

### GitHub Actions 工作流

文件：`.github/workflows/publish.yml`

**触发条件**：
- Push 到 `release` 分支
- 手动触发（workflow_dispatch）

**构建平台**：
- macOS ARM64 (Apple Silicon)
- macOS x64 (Intel)
- Windows x64

**优化特性**：
- ✅ Rust 缓存（加速编译）
- ✅ Bun 依赖缓存（加速安装）
- ✅ 代码签名支持
- ✅ 自动创建 Draft Release

**环境变量**：
```yaml
GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}  # 自动提供
TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}
```

---

## 🔑 密钥和 Token 管理

### GitHub Secrets

需要在 GitHub 仓库设置中添加：

1. **TAURI_SIGNING_PRIVATE_KEY**
   ```bash
   # 生成密钥对
   bun tauri signer generate -- -w .tauri/watch-monkey.key
   
   # 复制私钥内容到 GitHub Secrets
   cat .tauri/watch-monkey.key
   ```

2. **TAURI_SIGNING_PRIVATE_KEY_PASSWORD**（可选）
   - 如果密钥有密码保护，添加此 Secret

### Gitea Token

用于 `create-release-json.sh` 脚本上传：

1. 登录 Gitea
2. 设置 → 应用 → 生成新令牌
3. 权限：至少需要 `repo` 权限
4. 复制 Token 到 `.updater.config.json`

---

## 🐛 故障排除

### 问题 1：脚本没有执行权限

```bash
chmod +x scripts/*.sh
```

---

### 问题 2：版本号格式错误

确保版本号格式为 `x.y.z`，例如：`1.2.3`

---

### 问题 3：Git 合并冲突

```bash
# 手动解决冲突
git status
git add .
git commit
git push origin release
```

---

### 问题 4：GitHub Actions 构建失败

检查：
1. 是否配置了 `TAURI_SIGNING_PRIVATE_KEY`
2. 查看 Actions 日志定位具体错误
3. 确保 `bun.lock` 和 `Cargo.lock` 已提交

---

## 📚 更多资源

- [Tauri 文档](https://tauri.app/)
- [语义化版本规范](https://semver.org/lang/zh-CN/)
- [GitHub Actions 文档](https://docs.github.com/actions)
- [Gitea API 文档](https://docs.gitea.io/en-us/api-usage/)

---

## 💡 提示和技巧

### 技巧 1：快速查看当前版本

```bash
# 从 tauri.conf.json 读取
jq -r '.version' src-tauri/tauri.conf.json

# 从 package.json 读取
jq -r '.version' package.json
```

### 技巧 2：批量更新

```bash
# 一键完成版本更新 + 提交 + 同步
./scripts/update-version.sh 1.2.3 && \
  git add . && \
  git commit -m "chore: bump version to 1.2.3" && \
  git push origin main && \
  ./scripts/sync-to-release.sh
```

### 技巧 3：查看构建状态

```bash
# 在浏览器中打开 Actions 页面
open "https://github.com/$(git remote get-url origin | sed 's/.*github.com[:\/]\(.*\)\.git/\1/')/actions"
```

### 技巧 4：回滚版本

```bash
# 恢复到上一个版本
git revert HEAD
git push origin main
```

---

**祝你使用愉快！🎉**

