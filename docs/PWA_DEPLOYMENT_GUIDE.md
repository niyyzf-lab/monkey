# PWA 部署指南 - 1Panel + Nginx

本指南将帮助你将 Watch Monkey PWA 应用部署到使用 1Panel 管理的服务器上。

## 📋 目录

- [前置要求](#前置要求)
- [快速开始](#快速开始)
- [详细配置步骤](#详细配置步骤)
- [GitHub Actions 自动部署](#github-actions-自动部署)
- [常见问题](#常见问题)
- [PWA 测试清单](#pwa-测试清单)

## 前置要求

### 服务器要求

- ✅ 已安装 1Panel 面板
- ✅ OpenResty/Nginx 已安装并运行
- ✅ 已配置域名并指向服务器
- ✅ 已配置 SSL 证书（PWA 强制要求 HTTPS）
- ✅ SSH 访问权限
- ✅ 足够的磁盘空间（至少 100MB）

### 本地要求（如果手动部署）

- ✅ Node.js 18+ 或 Bun
- ✅ Git
- ✅ SSH 客户端

## 🚀 快速开始

### 方案一：GitHub Actions 自动部署（推荐）

1. **配置 GitHub Secrets**

   在你的 GitHub 仓库设置中添加以下 Secrets：

   ```
   Settings → Secrets and variables → Actions → New repository secret
   ```

   需要配置的 Secrets：

   | Secret 名称 | 说明 | 示例 |
   |------------|------|------|
   | `DEPLOY_HOST` | SSH 服务器地址 | `123.45.67.89` 或 `server.example.com` |
   | `DEPLOY_PORT` | SSH 端口（可选） | `22`（默认） |
   | `DEPLOY_USER` | SSH 用户名 | `root` 或其他有权限的用户 |
   | `DEPLOY_SSH_KEY` | SSH 私钥 | 完整的私钥内容（见下方） |
   | `DEPLOY_PATH` | 部署目标路径 | `/opt/1panel/apps/openresty/openresty/www/sites/watch-monkey` |
   | `NGINX_RELOAD` | 是否自动重载 Nginx | `true` 或 `false`（可选） |
   | `DEPLOY_VERIFY_URL` | 验证 URL | `https://your-domain.com`（可选） |
   | `VITE_API_BASE_URL` | API 基础地址 | `https://api.your-domain.com` |

2. **生成 SSH 密钥对**

   如果还没有 SSH 密钥，在本地生成：

   ```bash
   # 生成新的 SSH 密钥对
   ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy
   
   # 查看公钥（需要添加到服务器）
   cat ~/.ssh/github_deploy.pub
   
   # 查看私钥（需要添加到 GitHub Secrets）
   cat ~/.ssh/github_deploy
   ```

3. **在服务器上添加公钥**

   ```bash
   # SSH 登录到服务器
   ssh user@your-server
   
   # 添加公钥到 authorized_keys
   echo "your-public-key-content" >> ~/.ssh/authorized_keys
   
   # 设置正确的权限
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```

4. **在 1Panel 中创建网站**

   - 登录 1Panel
   - 网站 → 创建网站
   - 网站类型：静态网站
   - 域名：`your-domain.com`
   - 网站目录：`/opt/1panel/apps/openresty/openresty/www/sites/watch-monkey`
   - SSL：启用 SSL（申请 Let's Encrypt 证书）

5. **配置 Nginx**

   在 1Panel 的网站设置中，将 `nginx-pwa.conf` 的内容复制到 Nginx 配置中，注意修改：
   - `server_name`：你的域名
   - `root`：网站根目录
   - SSL 证书路径（1Panel 通常自动配置）

6. **触发部署**

   方式 1 - 手动触发：
   ```
   GitHub → Actions → Deploy PWA → Run workflow
   选择 deployment_target: custom-server
   ```

   方式 2 - 自动触发：
   推送代码到 `main` 分支会自动触发部署

7. **验证部署**

   - 访问你的域名：`https://your-domain.com`
   - 检查 PWA 是否可以安装
   - 在浏览器开发者工具中检查 Service Worker

### 方案二：手动部署

1. **构建 PWA**

   ```bash
   # 克隆仓库
   git clone https://github.com/your-username/watch-monkey-app.git
   cd watch-monkey-app
   
   # 安装依赖
   bun install
   
   # 配置环境变量
   export VITE_PWA_PROMPT_ENABLED=true
   export VITE_API_BASE_URL=https://api.your-domain.com
   
   # 构建
   bun run build
   ```

2. **上传到服务器**

   ```bash
   # 使用 rsync 上传
   rsync -avz --delete \
     dist/ \
     user@your-server:/opt/1panel/apps/openresty/openresty/www/sites/watch-monkey/
   ```

3. **设置权限**

   ```bash
   # SSH 登录到服务器
   ssh user@your-server
   
   # 设置权限
   cd /opt/1panel/apps/openresty/openresty/www/sites/watch-monkey
   find . -type d -exec chmod 755 {} \;
   find . -type f -exec chmod 644 {} \;
   chown -R www:www .
   ```

4. **重载 Nginx**

   ```bash
   # 测试配置
   /www/server/openresty/nginx/sbin/nginx -t
   
   # 重载配置
   /www/server/openresty/nginx/sbin/nginx -s reload
   ```

## 📝 详细配置步骤

### 1. 1Panel 网站配置

#### 1.1 创建网站目录结构

```bash
/opt/1panel/apps/openresty/openresty/www/sites/watch-monkey/
├── index.html              # 主页面
├── assets/                 # 静态资源
├── sw.js                   # Service Worker
├── registerSW.js           # Service Worker 注册脚本
├── manifest.webmanifest    # PWA Manifest
├── pwa_icons/              # PWA 图标
└── logs/                   # 日志目录
    ├── access.log
    └── error.log
```

#### 1.2 配置 Nginx

关键配置点：

1. **强制 HTTPS**
   ```nginx
   # 将所有 HTTP 流量重定向到 HTTPS
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$server_name$request_uri;
   }
   ```

2. **Service Worker 配置**
   ```nginx
   # Service Worker 必须从根路径访问，且不能缓存
   location ~ ^/(sw\.js|registerSW\.js|workbox-.*\.js)$ {
       add_header Cache-Control "no-cache, no-store, must-revalidate";
       add_header Content-Type "application/javascript; charset=utf-8";
       try_files $uri =404;
   }
   ```

3. **SPA 路由支持**
   ```nginx
   # 所有路由都返回 index.html
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```

4. **缓存策略**
   ```nginx
   # 静态资源长期缓存
   location ~* \.(png|jpg|jpeg|gif|ico|svg|woff2)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   
   # HTML 不缓存
   location ~ \.html$ {
       add_header Cache-Control "no-cache";
   }
   ```

### 2. SSL 证书配置

在 1Panel 中：

1. 网站设置 → SSL
2. 选择 "Let's Encrypt"
3. 填写邮箱，申请证书
4. 1Panel 会自动配置证书路径

或者手动配置：

```nginx
ssl_certificate /opt/1panel/apps/openresty/openresty/ssl/your-domain.com.pem;
ssl_certificate_key /opt/1panel/apps/openresty/openresty/ssl/your-domain.com.key;
```

### 3. API 代理配置（可选）

如果后端 API 在同一服务器：

```nginx
location /api/ {
    proxy_pass http://localhost:5678/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## 🔄 GitHub Actions 自动部署

### Workflow 说明

`.github/workflows/deploy-pwa.yml` 提供了完整的自动化部署流程：

1. **构建阶段**
   - 安装依赖
   - 构建 PWA
   - 验证构建输出
   - 生成部署信息

2. **部署阶段**
   - SSH 连接测试
   - 创建备份
   - 使用 rsync 同步文件
   - 设置文件权限
   - 重载 Nginx
   - 验证部署

3. **回滚支持**
   - 自动保留最近 3 个备份
   - 如果部署失败，可以手动回滚

### 触发方式

1. **自动触发**
   - 推送到 `main` 分支
   - 修改前端相关文件时触发

2. **手动触发**
   - GitHub Actions 页面
   - 选择部署目标：
     - `github-pages`: 只部署到 GitHub Pages
     - `custom-server`: 只部署到自定义服务器
     - `both`: 同时部署到两个目标

### 部署日志

在 GitHub Actions 页面查看详细的部署日志：

```
Actions → Deploy PWA → 选择运行记录 → 查看日志
```

## 🐛 常见问题

### Q1: Service Worker 注册失败

**症状**：浏览器控制台显示 Service Worker 注册失败

**解决方案**：
1. 确保网站使用 HTTPS
2. 检查 `sw.js` 是否可以从根路径访问
3. 检查 Nginx 配置中的 Service Worker 路径
4. 清除浏览器缓存和 Service Worker

```javascript
// 在浏览器控制台执行
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
});
```

### Q2: PWA 无法安装

**症状**：浏览器没有显示"安装"按钮

**检查清单**：
- [ ] 网站使用 HTTPS
- [ ] `manifest.webmanifest` 可访问
- [ ] Service Worker 注册成功
- [ ] 图标路径正确
- [ ] 浏览器支持 PWA（Chrome、Edge、Safari 等）

**验证 Manifest**：
```bash
curl https://your-domain.com/manifest.webmanifest
```

### Q3: 静态资源 404

**症状**：CSS、JS 或图片无法加载

**解决方案**：
1. 检查文件权限：
   ```bash
   find /path/to/site -type f -exec chmod 644 {} \;
   find /path/to/site -type d -exec chmod 755 {} \;
   ```

2. 检查 Nginx 配置中的 `root` 路径

3. 检查 Nginx 错误日志：
   ```bash
   tail -f /opt/1panel/apps/openresty/openresty/www/sites/watch-monkey/logs/error.log
   ```

### Q4: 部署后显示旧版本

**症状**：部署成功但网站仍显示旧内容

**解决方案**：
1. 清除浏览器缓存
2. 强制刷新（Ctrl+Shift+R 或 Cmd+Shift+R）
3. 卸载并重新注册 Service Worker
4. 检查 CDN 缓存（如果使用了 CDN）

### Q5: SSH 部署失败

**症状**：GitHub Actions 部署时 SSH 连接失败

**解决方案**：
1. 验证 SSH 密钥格式正确
2. 检查服务器防火墙是否允许 SSH
3. 确认用户有访问目标目录的权限
4. 测试 SSH 连接：
   ```bash
   ssh -i ~/.ssh/deploy_key -p 22 user@server "echo 'Connected!'"
   ```

### Q6: Nginx 重载失败

**症状**：部署时 Nginx 重载报错

**解决方案**：
1. 测试 Nginx 配置：
   ```bash
   /www/server/openresty/nginx/sbin/nginx -t
   ```

2. 检查配置文件语法错误

3. 查看 Nginx 错误日志：
   ```bash
   tail -f /www/server/openresty/nginx/logs/error.log
   ```

## ✅ PWA 测试清单

部署完成后，使用此清单验证 PWA 功能：

### 基础功能

- [ ] HTTPS 正常访问
- [ ] 页面正常加载
- [ ] 所有资源正常加载（无 404 错误）
- [ ] API 请求正常（如果有）

### PWA 功能

- [ ] Service Worker 注册成功
  ```javascript
  navigator.serviceWorker.getRegistrations().then(console.log);
  ```

- [ ] Manifest 正常加载
  - 打开 DevTools → Application → Manifest

- [ ] 可以安装 PWA
  - 桌面浏览器显示安装图标
  - 移动设备显示"添加到主屏幕"

- [ ] 离线功能正常
  - 断开网络连接
  - 刷新页面仍可访问缓存内容

- [ ] 更新提示正常
  - 部署新版本后
  - 刷新页面显示更新提示

### 性能测试

- [ ] Lighthouse PWA 评分 > 90
  - 打开 DevTools → Lighthouse → 选择 PWA

- [ ] 页面加载速度 < 3秒

- [ ] 静态资源正确缓存

### 移动端测试

- [ ] iOS Safari 可以添加到主屏幕
- [ ] Android Chrome 可以安装
- [ ] 独立窗口模式正常运行
- [ ] 状态栏样式正确
- [ ] 图标显示正确

## 📚 参考资源

- [PWA 官方文档](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [1Panel 官方文档](https://1panel.cn/docs/)
- [Nginx 配置指南](https://nginx.org/en/docs/)

## 🤝 需要帮助？

如果遇到问题：

1. 查看 [常见问题](#常见问题) 部分
2. 检查 GitHub Actions 日志
3. 查看服务器 Nginx 错误日志
4. 在项目仓库提交 Issue

---

**祝你部署顺利！🎉**

