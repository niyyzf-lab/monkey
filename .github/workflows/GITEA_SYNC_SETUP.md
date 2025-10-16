# Gitea Release 同步配置指南

本文档说明如何配置 GitHub Actions 以自动同步 Release 到 Gitea 仓库。

## 📋 前置要求

1. 一个 Gitea 仓库（可以是自托管或 Gitea Cloud）
2. Gitea 个人访问令牌（Personal Access Token）
3. GitHub 仓库的管理员权限（用于设置 Secrets）

## 🔑 步骤 1：创建 Gitea 访问令牌

1. 登录你的 Gitea 实例
2. 进入 **设置** → **应用** → **管理访问令牌**
3. 点击 **生成新令牌**
4. 设置令牌名称（例如：`github-release-sync`）
5. 选择以下权限：
   - ✅ `write:repository` - 写入仓库权限
   - ✅ `write:issue` - 创建 Release 需要
6. 点击 **生成令牌** 并**立即复制保存**（只显示一次）

## ⚙️ 步骤 2：配置 GitHub Secrets

在你的 GitHub 仓库中设置以下 Secrets：

### 导航路径
`GitHub 仓库` → `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

### 需要添加的 Secrets

#### 1. `GITEA_TOKEN`
- **值**: 在步骤 1 中生成的 Gitea 访问令牌
- **示例**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0`

#### 2. `GITEA_URL`
- **值**: 你的 Gitea 实例 URL（不包含尾部斜杠）
- **示例**: 
  - 自托管: `https://git.yourdomain.com`
  - Gitea Cloud: `https://gitea.com`

#### 3. `GITEA_REPO`
- **值**: Gitea 仓库的完整路径（格式：`owner/repo`）
- **示例**: `yourname/watch-monkey-app`

## 🎯 步骤 3：验证配置

完成上述配置后，你可以通过以下方式测试：

### 方法 1：手动触发工作流
1. 进入 GitHub 仓库的 **Actions** 页面
2. 选择 **publish** 工作流
3. 点击 **Run workflow** 按钮
4. 选择 `release` 分支并运行

### 方法 2：推送到 release 分支
```bash
git checkout release
git push origin release
```

## 📊 工作流程说明

当工作流触发时，它会：

1. **构建阶段** (`publish-tauri` job)
   - 为 macOS (ARM + Intel) 和 Windows 构建应用
   - 在 GitHub 上创建 Release
   - 上传所有构建产物

2. **同步阶段** (`sync-to-gitea` job)
   - 等待所有构建完成
   - 从 GitHub 获取最新的 Release 信息
   - 下载所有 Release Assets（.dmg, .msi, .exe 等）
   - 在 Gitea 上创建相同的 Release
   - 上传所有 Assets 到 Gitea

## 🔍 故障排查

### 问题 1：Gitea API 认证失败
**错误信息**: `401 Unauthorized`

**解决方案**:
- 检查 `GITEA_TOKEN` 是否正确设置
- 确认令牌没有过期
- 验证令牌拥有足够的权限

### 问题 2：找不到仓库
**错误信息**: `404 Not Found`

**解决方案**:
- 检查 `GITEA_URL` 格式是否正确（不要有尾部斜杠）
- 确认 `GITEA_REPO` 格式为 `owner/repo`
- 确保 Gitea 仓库已存在

### 问题 3：Release 已存在
**处理方式**: 工作流会自动删除旧的 Release 并创建新的

### 问题 4：Assets 上传失败
**可能原因**:
- 网络问题
- Assets 文件过大
- Gitea 存储空间不足

**查看日志**:
在 GitHub Actions 的工作流运行页面中查看详细日志

## 📝 配置示例

假设你的配置如下：
```yaml
GITEA_URL: https://git.example.com
GITEA_REPO: john/watch-monkey-app
GITEA_TOKEN: abc123xyz789...
```

同步后，你的 Release 将出现在：
```
https://git.example.com/john/watch-monkey-app/releases
```

## 🔐 安全建议

1. ✅ **不要**在代码中硬编码令牌
2. ✅ **定期轮换** Gitea 访问令牌
3. ✅ **最小权限原则**：只授予必要的权限
4. ✅ **使用组织级 Secrets**：如果管理多个仓库
5. ✅ **定期审查** GitHub Actions 日志

## 🎉 完成

配置完成后，每次发布新版本时，Release 将自动同步到你的 Gitea 仓库！

---

## 🆘 需要帮助？

如遇到问题，请检查：
1. GitHub Actions 工作流日志
2. Gitea API 文档：`https://your-gitea-url/api/swagger`
3. 提交 Issue 到项目仓库

