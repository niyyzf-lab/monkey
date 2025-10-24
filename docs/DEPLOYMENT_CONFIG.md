# 部署配置指南

## 🎯 你的服务器配置

根据你提供的信息，这是你的部署配置：

### 基本信息

- **网站目录**: `/opt/1panel/apps/openresty/openresty/www/sites/monkey.watchmonkey.icu/index`
- **FTP 用户名**: `monkey`
- **FTP 密码**: `MpWXkKpbidXwkTPa`
- **域名**: `monkey.watchmonkey.icu` (推测)

---

## 📋 配置步骤

### 方案 1：使用 GitHub Actions 自动部署（推荐）⭐

#### 步骤 1：配置 GitHub Secrets

在你的 GitHub 仓库中添加以下 Secrets：

```
仓库 → Settings → Secrets and variables → Actions → New repository secret
```

根据你选择的部署方式，配置对应的 Secrets：

#### 选项 A：SSH 部署（更快、更可靠）

| Secret 名称 | 值 | 说明 |
|------------|-----|------|
| `DEPLOY_HOST` | `你的服务器 IP 或域名` | 服务器地址 |
| `DEPLOY_USER` | `root` 或其他有权限的用户 | SSH 用户名 |
| `DEPLOY_SSH_KEY` | `你的 SSH 私钥内容` | 完整的私钥 |
| `DEPLOY_PATH` | `/opt/1panel/apps/openresty/openresty/www/sites/monkey.watchmonkey.icu/index` | 部署路径 |
| `NGINX_RELOAD` | `true` | 自动重载 Nginx |
| `DEPLOY_VERIFY_URL` | `https://monkey.watchmonkey.icu` | 验证 URL |
| `VITE_API_BASE_URL` | `你的 API 地址` | API 基础地址 |

**SSH 密钥生成方法**：
```bash
# 生成 SSH 密钥对
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy

# 将公钥添加到服务器
ssh-copy-id -i ~/.ssh/github_deploy.pub root@your-server

# 复制私钥内容（完整复制，包括 BEGIN 和 END 行）
cat ~/.ssh/github_deploy
```

#### 选项 B：FTP 部署（简单但较慢）

| Secret 名称 | 值 |
|------------|-----|
| `DEPLOY_FTP_HOST` | `你的服务器 IP 或域名` |
| `DEPLOY_FTP_PORT` | `21` |
| `DEPLOY_FTP_USER` | `monkey` |
| `DEPLOY_FTP_PASSWORD` | `MpWXkKpbidXwkTPa` |
| `DEPLOY_FTP_PATH` | `/www/sites/monkey.watchmonkey.icu/index` 或根据 FTP 根目录调整 |
| `VITE_API_BASE_URL` | `你的 API 地址` |

#### 步骤 2：触发部署

**自动部署**：推送到 main 分支
```bash
git add .
git commit -m "deploy: 更新 PWA"
git push origin main
```

**手动部署**：
```
GitHub → Actions → Deploy PWA → Run workflow
选择: custom-server
```

---

### 方案 2：使用部署脚本（快速便捷）⚡

#### 步骤 1：创建配置文件

创建 `.env.deploy` 文件（不会被提交到 Git）：

**SSH 部署配置**：
```bash
# 复制示例文件
cp .env.deploy.example .env.deploy

# 编辑配置文件
nano .env.deploy
```

填入以下内容：
```env
# SSH 配置
DEPLOY_HOST=你的服务器IP或域名
DEPLOY_USER=root
DEPLOY_PORT=22
DEPLOY_PATH=/opt/1panel/apps/openresty/openresty/www/sites/monkey.watchmonkey.icu/index
NGINX_RELOAD=true
DEPLOY_VERIFY_URL=https://monkey.watchmonkey.icu

# 应用配置
VITE_API_BASE_URL=你的API地址
VITE_PWA_PROMPT_ENABLED=true
```

**或 FTP 部署配置**：
```env
# FTP 配置
DEPLOY_FTP_HOST=你的服务器IP或域名
DEPLOY_FTP_PORT=21
DEPLOY_FTP_USER=monkey
DEPLOY_FTP_PASSWORD=MpWXkKpbidXwkTPa
DEPLOY_FTP_PATH=/www/sites/monkey.watchmonkey.icu/index

# 应用配置
VITE_API_BASE_URL=你的API地址
VITE_PWA_PROMPT_ENABLED=true
```

#### 步骤 2：运行部署脚本

```bash
# 确保脚本有执行权限
chmod +x scripts/deploy-pwa.sh

# 运行部署
./scripts/deploy-pwa.sh
```

脚本会：
1. ✅ 读取 `.env.deploy` 配置
2. ✅ 构建 PWA
3. ✅ 连接到服务器
4. ✅ 创建备份
5. ✅ 上传文件
6. ✅ 设置权限
7. ✅ 重载 Nginx
8. ✅ 验证部署

---

### 方案 3：FTP 客户端手动部署（图形化界面）

如果你更喜欢使用 FTP 客户端：

#### 推荐 FTP 客户端

- **Windows**: [FileZilla](https://filezilla-project.org/)
- **macOS**: [Cyberduck](https://cyberduck.io/)
- **Linux**: FileZilla 或 gFTP

#### 步骤

1. **本地构建**
   ```bash
   # 设置环境变量
   export VITE_PWA_PROMPT_ENABLED=true
   export VITE_API_BASE_URL=你的API地址
   
   # 构建
   bun install
   bun run build
   ```

2. **连接 FTP**
   - 主机: 你的服务器地址
   - 用户名: `monkey`
   - 密码: `MpWXkKpbidXwkTPa`
   - 端口: `21`

3. **上传文件**
   - 远程目录: `/opt/1panel/apps/openresty/openresty/www/sites/monkey.watchmonkey.icu/index`
   - 将 `dist/` 目录中的所有内容上传到远程目录

4. **设置权限**（通过 SSH）
   ```bash
   ssh root@your-server
   cd /opt/1panel/apps/openresty/openresty/www/sites/monkey.watchmonkey.icu/index
   find . -type d -exec chmod 755 {} \;
   find . -type f -exec chmod 644 {} \;
   chown -R www:www .
   ```

---

## 🔧 1Panel 网站配置

### 1. 在 1Panel 中配置网站

1. **登录 1Panel**
   - 访问你的 1Panel 管理面板

2. **找到网站**
   - 网站 → 找到 `monkey.watchmonkey.icu`

3. **更新 Nginx 配置**
   - 点击网站 → 配置 → Nginx 配置
   - 将 `nginx-pwa.conf` 的内容复制进去
   - **重要修改**：
     ```nginx
     server_name monkey.watchmonkey.icu www.monkey.watchmonkey.icu;
     root /opt/1panel/apps/openresty/openresty/www/sites/monkey.watchmonkey.icu/index;
     ```

4. **配置 SSL**
   - 网站 → SSL
   - 申请 Let's Encrypt 证书（免费）
   - 或上传自己的证书

5. **保存并重载**
   - 保存配置
   - 重载 Nginx

### 2. 关键 Nginx 配置点

确保你的 Nginx 配置包含以下内容：

```nginx
# PWA Service Worker - 不缓存
location ~ ^/(sw\.js|registerSW\.js|workbox-.*\.js)$ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Content-Type "application/javascript; charset=utf-8";
    try_files $uri =404;
}

# PWA Manifest
location ~ ^/manifest\.(json|webmanifest)$ {
    add_header Content-Type "application/manifest+json; charset=utf-8";
    add_header Cache-Control "public, max-age=86400";
    try_files $uri =404;
}

# SPA 路由支持
location / {
    try_files $uri $uri/ /index.html;
}

# 强制 HTTPS
server {
    listen 80;
    server_name monkey.watchmonkey.icu;
    return 301 https://$server_name$request_uri;
}
```

---

## ✅ 部署验证

部署完成后，按以下步骤验证：

### 1. 基础访问测试

```bash
# 测试 HTTPS 访问
curl -I https://monkey.watchmonkey.icu

# 检查 Service Worker
curl https://monkey.watchmonkey.icu/sw.js

# 检查 Manifest
curl https://monkey.watchmonkey.icu/manifest.webmanifest
```

### 2. 浏览器测试

1. 访问 `https://monkey.watchmonkey.icu`
2. 打开开发者工具（F12）
3. 检查：
   - **Console**: 无错误
   - **Network**: 所有资源加载成功（200）
   - **Application → Service Workers**: 已激活
   - **Application → Manifest**: 显示正确

### 3. PWA 功能测试

**桌面浏览器**：
- Chrome/Edge: 地址栏应显示安装图标 ⊕
- 点击安装，测试是否能成功安装

**移动浏览器**：
- iOS Safari: 分享 → 添加到主屏幕
- Android Chrome: 菜单 → 添加到主屏幕

### 4. 离线测试

1. 访问网站，等待 Service Worker 激活
2. 打开开发者工具 → Network → Offline 模式
3. 刷新页面，应该能看到缓存的内容

---

## 🔐 安全建议

### 1. 保护敏感信息

- ❌ **不要**将 FTP 密码提交到 Git
- ✅ 使用 `.env.deploy`（已在 `.gitignore` 中）
- ✅ 使用 GitHub Secrets 存储敏感信息

### 2. FTP 账号安全

当前你的 FTP 账号信息：
- 用户名: `monkey`
- 密码: `MpWXkKpbidXwkTPa`

建议：
- ✅ 定期更换密码
- ✅ 如果可能，切换到 SSH/SFTP（更安全）
- ✅ 限制 FTP 访问 IP（在 1Panel 中配置）

### 3. 服务器安全

```bash
# 设置正确的文件权限
find /path/to/site -type d -exec chmod 755 {} \;
find /path/to/site -type f -exec chmod 644 {} \;

# 设置正确的所有者
chown -R www:www /path/to/site
```

---

## 🐛 常见问题

### Q1: FTP 上传失败

**可能原因**：
- 密码错误
- 路径不正确
- 权限不足
- 防火墙阻止

**解决方案**：
1. 在 1Panel 中确认 FTP 账号状态
2. 测试 FTP 连接：
   ```bash
   ftp your-server
   # 输入用户名: monkey
   # 输入密码: MpWXkKpbidXwkTPa
   ```
3. 检查防火墙是否开放 21 端口

### Q2: 部署后显示 403 错误

**原因**: 文件权限问题

**解决**：
```bash
ssh root@your-server
cd /opt/1panel/apps/openresty/openresty/www/sites/monkey.watchmonkey.icu/index
chmod -R 755 .
chown -R www:www .
```

### Q3: Service Worker 注册失败

**原因**: 没有 HTTPS 或路径不对

**解决**：
1. 确保使用 HTTPS
2. 检查 Nginx 配置中的 Service Worker 路径
3. 清除浏览器缓存重试

---

## 📞 需要帮助？

如果遇到问题：

1. 查看部署脚本输出的错误信息
2. 检查 Nginx 错误日志：
   ```bash
   tail -f /opt/1panel/apps/openresty/openresty/www/sites/monkey.watchmonkey.icu/logs/error.log
   ```
3. 查看 1Panel 日志
4. 在项目仓库提交 Issue

---

**祝部署成功！🚀**

