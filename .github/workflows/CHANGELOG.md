# Gitea Release 同步功能更新日志

## 📅 2025-10-16 - 初始实现与错误修复

### ✨ 新增功能

#### 1. 自动同步 GitHub Release 到 Gitea
在 `publish.yml` 工作流中添加了新的 `sync-to-gitea` job，实现以下功能：

- ✅ 等待所有平台构建完成（macOS ARM/Intel、Windows）
- ✅ 自动获取 GitHub 上最新创建的 Release 信息
- ✅ 下载所有 Release Assets（安装包、更新配置文件等）
- ✅ 在 Gitea 上创建相同的 Release
- ✅ 上传所有 Assets 到 Gitea Release
- ✅ 智能处理：如果 Release 已存在，自动删除旧版本并重新创建
- ✅ 详细的日志输出和错误处理

#### 2. 测试工作流
创建了 `test-gitea-connection.yml`，用于验证 Gitea 配置：

- ✅ 验证所有 Secrets 是否正确设置
- ✅ 测试 Gitea API 连接
- ✅ 验证认证令牌有效性
- ✅ 检查仓库访问权限

#### 3. 完整的配置文档
- **GITEA_SYNC_SETUP.md**: 详细的配置指南，包含故障排查
- **SECRETS_CHECKLIST.md**: 快速配置清单
- **CHANGELOG.md**: 更新日志（本文件）

---

### 🐛 Bug 修复

#### 修复多行文本输出错误
**问题**: GitHub Actions 在处理 Release Notes 的多行内容时报错：
```
Error: Invalid format '- chore: bump version to 0.2.32'
```

**原因**: 
- Release Notes 包含多行文本（提交历史、安装说明等）
- 使用简单的 `echo "key=value"` 无法处理多行内容
- 需要使用 EOF 分隔符的多行输出格式

**解决方案**:
```yaml
# ❌ 错误的做法
echo "body=$(echo $RELEASE_DATA | jq -r '.body')" >> $GITHUB_OUTPUT

# ✅ 正确的做法
echo "body<<EOF" >> $GITHUB_OUTPUT
echo "$RELEASE_DATA" | jq -r '.body' >> $GITHUB_OUTPUT
echo "EOF" >> $GITHUB_OUTPUT
```

**参考文档**: [GitHub Actions - Multiline strings](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#multiline-strings)

---

### 🔧 改进

#### 1. 增强的错误处理
- 所有 API 调用都检查 HTTP 状态码
- 失败时显示详细的错误信息
- 上传失败不会中断整个流程，会继续尝试上传其他文件

#### 2. 友好的日志输出
使用 emoji 和格式化输出，便于快速定位问题：
```
📦 Syncing release: Watch Monkey v0.2.32 (v0.2.32)
🎯 Target: https://git.example.com/yourname/watch-monkey-app
🚀 Creating new Gitea release...
✅ Created Gitea release with ID: 123
📤 Uploading assets...
  ⏳ Uploading watch-monkey_0.2.32_aarch64.dmg (45M)...
  ✅ Uploaded watch-monkey_0.2.32_aarch64.dmg
🎉 Successfully synced release to Gitea!
```

#### 3. 详细的摘要信息
同步完成后输出完整摘要：
- Release 名称和标签
- 成功上传的 Assets 数量
- Gitea Release 的完整 URL

---

### 📋 需要配置的 Secrets

| Secret 名称 | 说明 | 示例 |
|------------|------|------|
| `GITEA_TOKEN` | Gitea 个人访问令牌 | `a1b2c3d4...` |
| `GITEA_URL` | Gitea 实例 URL | `https://git.example.com` |
| `GITEA_REPO` | 仓库路径 | `yourname/watch-monkey-app` |

---

### 🧪 测试步骤

#### 1. 测试配置
```bash
# 在 GitHub Actions 页面手动触发
Actions → Test Gitea Connection → Run workflow
```

#### 2. 测试完整发布流程
```bash
# 方法 1: 推送到 release 分支
git checkout release
git push origin release

# 方法 2: 手动触发 publish 工作流
Actions → publish → Run workflow
```

---

### 📚 相关文档

- [Gitea API 文档](https://docs.gitea.com/api/1.20/)
- [GitHub Actions 工作流语法](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Gitea 仓库镜像文档](https://docs.gitea.com/zh-cn/usage/repo-mirror)（注意：镜像功能不包含 Releases）

---

### ⚠️ 重要提示

1. **Gitea 仓库镜像功能的局限性**
   - Gitea 的仓库镜像只能同步 Git 数据（分支、标签、提交）
   - **不能**同步 Releases、Issues、Pull Requests 等平台特定功能
   - 因此需要通过 API 方式单独同步 Releases

2. **版本要求**
   - Gitea: 1.18+ (支持 Release API)
   - GitHub Actions: 标准功能，无特殊要求
   - jq: 用于 JSON 处理（GitHub Actions runner 自带）

3. **权限要求**
   - Gitea Token 需要 `write:repository` 和 `write:issue` 权限
   - GitHub Token 自动提供，拥有仓库的读写权限

---

### 🎯 未来改进计划

- [ ] 支持增量同步（只上传新的 Assets）
- [ ] 支持多个 Gitea 实例同步
- [ ] 添加 Slack/Discord 通知
- [ ] 支持同步到其他平台（GitLab、Gitee 等）
- [ ] 添加同步统计和报告

---

### 🙏 致谢

感谢以下资源的帮助：
- [Gitea 官方文档](https://docs.gitea.com/)
- [GitHub Actions 文档](https://docs.github.com/actions)
- [Tauri 应用打包文档](https://tauri.app/v1/guides/distribution/publishing)

