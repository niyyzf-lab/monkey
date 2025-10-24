# PWA 部署快速开始

快速将 Watch Monkey PWA 部署到 1Panel + Nginx 服务器。

## 🚀 三种部署方式

### 方式 1：自动化 GitHub Actions 部署（推荐）⭐

**优点**：自动化、可追踪、支持回滚、适合团队协作

**步骤**：

1. **配置 GitHub Secrets**（一次性设置）

   在仓库设置中添加以下 Secrets：
   
   ```
   Settings → Secrets and variables → Actions → New repository secret
   ```
   
   | Secret 名称 | 值 | 说明 |
   |------------|-----|------|
   | `DEPLOY_HOST` | `your-server.com` | 服务器地址 |
   | `DEPLOY_USER` | `root` | SSH 用户名 |
   | `DEPLOY_SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----\n...` | SSH 私钥完整内容 |
   | `DEPLOY_PATH` | `/opt/1panel/apps/openresty/openresty/www/sites/watch-monkey` | 部署路径 |
   | `VITE_API_BASE_URL` | `https://api.your-domain.com` | API 地址 |

2. **生成 SSH 密钥**（如果没有）

   ```bash
   # 本地执行
   ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy
   
   # 复制公钥到服务器
   ssh-copy-id -i ~/.ssh/github_deploy.pub root@your-server.com
   
   # 复制私钥内容到 GitHub Secrets
   cat ~/.ssh/github_deploy
   ```

3. **在 1Panel 中配置网站**

   - 创建网站，设置域名
   - 申请 SSL 证书
   - 将 `nginx-pwa.conf` 内容复制到网站配置中

4. **触发部署**

   **自动触发**：推送代码到 `main` 分支
   
   ```bash
   git add .
   git commit -m "update: 部署 PWA"
   git push origin main
   ```
   
   **手动触发**：
   ```
   GitHub → Actions → Deploy PWA → Run workflow
   选择: custom-server 或 both
   ```

5. **查看部署状态**

   ```
   GitHub → Actions → 最新的 workflow 运行
   ```

✅ **完成！** 访问你的域名测试 PWA

---

### 方式 2：一键脚本部署（适合快速部署）⚡

**优点**：快速、交互式、本地控制

**步骤**：

1. **准备 SSH 访问**

   确保可以 SSH 连接到服务器：
   ```bash
   ssh root@your-server.com
   ```

2. **运行部署脚本**

   ```bash
   cd /path/to/watch-monkey-app
   ./scripts/deploy-pwa.sh
   ```

3. **按提示输入配置**

   ```
   SSH 服务器地址: your-server.com
   SSH 用户名 (默认: root): root
   部署路径: /opt/1panel/apps/openresty/openresty/www/sites/watch-monkey
   API 基础地址: https://api.your-domain.com
   ```

4. **确认并等待部署完成**

   脚本会自动：
   - ✅ 检查依赖
   - ✅ 构建 PWA
   - ✅ 测试 SSH 连接
   - ✅ 创建备份
   - ✅ 同步文件
   - ✅ 设置权限
   - ✅ 重载 Nginx
   - ✅ 验证部署

✅ **完成！** 脚本会显示详细的部署信息

---

### 方式 3：手动部署（完全控制）🔧

**优点**：最大灵活性、适合调试

**步骤**：

1. **本地构建**

   ```bash
   # 安装依赖
   bun install
   
   # 设置环境变量
   export VITE_PWA_PROMPT_ENABLED=true
   export VITE_API_BASE_URL=https://api.your-domain.com
   
   # 构建
   bun run build
   ```

2. **上传到服务器**

   ```bash
   # 使用 rsync
   rsync -avz --delete dist/ root@your-server.com:/path/to/site/
   
   # 或使用 scp
   scp -r dist/* root@your-server.com:/path/to/site/
   ```

3. **SSH 登录服务器设置权限**

   ```bash
   ssh root@your-server.com
   
   cd /path/to/site
   find . -type d -exec chmod 755 {} \;
   find . -type f -exec chmod 644 {} \;
   chown -R www:www .
   ```

4. **重载 Nginx**

   ```bash
   # 1Panel OpenResty
   /www/server/openresty/nginx/sbin/nginx -t
   /www/server/openresty/nginx/sbin/nginx -s reload
   
   # 或标准 Nginx
   nginx -t && nginx -s reload
   ```

✅ **完成！** 访问域名验证部署

---

## 📋 部署前检查清单

### 服务器端

- [ ] 1Panel 已安装
- [ ] OpenResty/Nginx 已运行
- [ ] 域名已解析到服务器
- [ ] SSL 证书已配置（必须！）
- [ ] SSH 访问正常
- [ ] 防火墙允许 HTTP/HTTPS 流量

### 本地端

- [ ] Node.js 18+ 或 Bun 已安装
- [ ] Git 已安装
- [ ] SSH 客户端可用
- [ ] rsync 已安装（Linux/Mac 默认有）

### 1Panel 配置

- [ ] 已创建网站
- [ ] 已配置域名
- [ ] 已申请并配置 SSL 证书
- [ ] 网站根目录权限正确
- [ ] Nginx 配置已更新（使用 `nginx-pwa.conf`）

---

## 🎯 推荐配置

### 环境变量配置

创建 `.env.deploy` 文件（不要提交到 Git）：

```bash
# 服务器配置
DEPLOY_HOST=your-server.com
DEPLOY_USER=root
DEPLOY_PORT=22
DEPLOY_PATH=/opt/1panel/apps/openresty/openresty/www/sites/watch-monkey

# 应用配置
VITE_API_BASE_URL=https://api.your-domain.com
VITE_PWA_PROMPT_ENABLED=true
```

### Nginx 配置要点

1. **强制 HTTPS**（PWA 必需）
2. **Service Worker 不缓存**
3. **Manifest 正确的 MIME 类型**
4. **SPA 路由支持**（try_files）
5. **静态资源缓存策略**

完整配置见 `nginx-pwa.conf`

---

## ✅ 验证部署

### 1. 基础访问测试

```bash
# 测试 HTTPS 访问
curl -I https://your-domain.com

# 检查 Service Worker
curl https://your-domain.com/sw.js

# 检查 Manifest
curl https://your-domain.com/manifest.webmanifest
```

### 2. 浏览器测试

1. 打开 `https://your-domain.com`
2. 打开开发者工具（F12）
3. 检查：
   - **Console**：无错误
   - **Network**：所有资源加载成功
   - **Application → Service Worker**：已注册
   - **Application → Manifest**：显示正确

### 3. PWA 安装测试

**桌面浏览器**：
- Chrome/Edge：地址栏显示安装图标
- 点击安装，应能成功安装

**移动浏览器**：
- iOS Safari：分享 → 添加到主屏幕
- Android Chrome：菜单 → 添加到主屏幕

### 4. Lighthouse 评分

```
开发者工具 → Lighthouse → 选择 PWA → 生成报告
```

目标：PWA 评分 > 90

---

## 🔄 更新部署

### GitHub Actions 自动更新

推送代码即可自动部署：

```bash
git add .
git commit -m "feat: 新功能"
git push origin main
```

### 脚本更新

```bash
./scripts/deploy-pwa.sh
```

脚本会自动创建备份，只保留最近 3 个版本。

### 手动更新

重复手动部署步骤即可。

---

## 🐛 故障排查

### Service Worker 未注册

1. 确保使用 HTTPS
2. 检查 `sw.js` 是否可访问
3. 清除浏览器缓存
4. 查看 Console 错误信息

```javascript
// 在浏览器控制台执行
navigator.serviceWorker.getRegistrations().then(console.log);
```

### 静态资源 404

1. 检查文件权限：
   ```bash
   ssh root@your-server.com
   cd /path/to/site
   find . -type f -exec chmod 644 {} \;
   find . -type d -exec chmod 755 {} \;
   ```

2. 查看 Nginx 错误日志：
   ```bash
   tail -f /path/to/logs/error.log
   ```

### 无法安装 PWA

检查清单：
- [ ] HTTPS 启用
- [ ] Manifest 可访问
- [ ] Service Worker 已注册
- [ ] 图标路径正确
- [ ] 浏览器支持 PWA

### 部署后显示旧版本

```bash
# 清除浏览器缓存并强制刷新
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)

# 或卸载 Service Worker
# 在浏览器控制台执行：
navigator.serviceWorker.getRegistrations().then(
  registrations => registrations.forEach(r => r.unregister())
);
```

---

## 📚 相关文档

- **完整部署指南**：`docs/PWA_DEPLOYMENT_GUIDE.md`
- **Nginx 配置**：`nginx-pwa.conf`
- **部署脚本**：`scripts/deploy-pwa.sh`
- **GitHub Actions**：`.github/workflows/deploy-pwa.yml`

---

## 💡 最佳实践

### 1. 使用自动化部署

- ✅ 推荐使用 GitHub Actions
- ✅ 代码审查后自动部署
- ✅ 保持部署历史记录

### 2. 监控和日志

```bash
# 实时查看访问日志
ssh root@server 'tail -f /path/to/logs/access.log'

# 查看错误日志
ssh root@server 'tail -f /path/to/logs/error.log'
```

### 3. 定期备份

脚本会自动创建备份，但建议：
- 定期备份整个网站目录
- 使用 1Panel 的备份功能
- 保存 Nginx 配置

### 4. 性能优化

- 启用 Gzip/Brotli 压缩
- 配置合理的缓存策略
- 使用 CDN（可选）
- 启用 HTTP/2

### 5. 安全加固

- 使用强 SSL 证书
- 配置安全响应头
- 定期更新系统和软件
- 使用防火墙限制访问

---

## 🆘 需要帮助？

1. 查看日志文件
2. 检查 Nginx 配置
3. 测试 SSH 连接
4. 在项目仓库提交 Issue
5. 查看完整部署指南

---

**祝你部署顺利！🎉**

如有问题，请参考完整文档：`docs/PWA_DEPLOYMENT_GUIDE.md`

