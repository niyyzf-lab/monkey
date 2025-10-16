# GitHub Secrets 配置清单

## ✅ 必需的 Secrets

在配置 Gitea Release 同步功能前，请确保以下 Secrets 已在 GitHub 仓库中设置：

### 位置
`仓库设置` → `Secrets and variables` → `Actions` → `Repository secrets`

---

## 🔑 Secrets 列表

### 1️⃣ GITEA_TOKEN
- **用途**: Gitea API 认证令牌
- **获取方式**: Gitea → 设置 → 应用 → 管理访问令牌 → 生成新令牌
- **所需权限**: 
  - `write:repository`
  - `write:issue`
- **示例**: `a1b2c3d4e5f6g7h8i9j0...`
- **状态**: ⬜ 未配置

### 2️⃣ GITEA_URL
- **用途**: Gitea 实例的完整 URL
- **格式**: `https://your-gitea-domain.com`（无尾部斜杠）
- **示例**: 
  - `https://gitea.com`
  - `https://git.yourdomain.com`
- **状态**: ⬜ 未配置

### 3️⃣ GITEA_REPO
- **用途**: 目标 Gitea 仓库的路径
- **格式**: `owner/repository`
- **示例**: `yourname/watch-monkey-app`
- **状态**: ⬜ 未配置

---

## 📋 已有的 Secrets（无需修改）

以下 Secrets 已经配置，用于 Tauri 应用构建：

✅ `GITHUB_TOKEN` - GitHub 自动提供，无需手动配置  
✅ `TAURI_SIGNING_PRIVATE_KEY` - Tauri 应用签名密钥  
✅ `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` - 签名密钥密码

---

## 🚀 快速配置命令

如果你有 GitHub CLI (`gh`)，可以使用以下命令快速添加 Secrets：

```bash
# 设置 GITEA_TOKEN
gh secret set GITEA_TOKEN

# 设置 GITEA_URL
gh secret set GITEA_URL

# 设置 GITEA_REPO
gh secret set GITEA_REPO
```

运行命令后，会提示你输入对应的值。

---

## 📖 详细配置指南

请查看 [GITEA_SYNC_SETUP.md](./GITEA_SYNC_SETUP.md) 获取完整的配置步骤说明。

