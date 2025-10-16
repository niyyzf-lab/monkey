# GitHub Actions 工作流说明

## publish.yml - 发布工作流

此工作流用于自动构建和发布 Watch Monkey 应用的跨平台版本。

### 触发条件

- **自动触发**: 当代码推送到 `release` 分支时
- **手动触发**: 在 GitHub Actions 页面手动运行 workflow_dispatch

### 构建平台

工作流会并行构建以下平台的版本：

1. **macOS (Apple Silicon)** - `aarch64-apple-darwin`
   - 适用于 M1/M2/M3 等 Apple 芯片的 Mac
   - 生成 `.dmg` 和 `.app.tar.gz` 文件

2. **macOS (Intel)** - `x86_64-apple-darwin`
   - 适用于 Intel 芯片的 Mac
   - 生成 `.dmg` 和 `.app.tar.gz` 文件

3. **Windows** - `x86_64-pc-windows-msvc`
   - 适用于 64 位 Windows 系统
   - 生成 `.msi` 和 `.exe` 安装程序

### 缓存优化

#### Rust 缓存
- 使用 `swatinem/rust-cache@v2` 缓存 Rust 构建产物
- 每个目标架构使用独立的缓存键 (`matrix.target`)
- 避免不同架构之间的缓存冲突
- 启用 `cache-on-failure` 以在构建失败时也保存缓存

#### Bun 缓存
- 缓存 Bun 依赖以加速安装
- 使用多级回退策略：
  1. 精确匹配：`{OS}-{target}-bun-{lockfile-hash}`
  2. 目标匹配：`{OS}-{target}-bun-`
  3. 通用匹配：`{OS}-bun-`

### 发布配置

- **Tag 格式**: `v{VERSION}` (例如: v0.2.31)
- **发布名称**: `Watch Monkey v{VERSION}`
- **发布状态**: 自动发布（`releaseDraft: false`）
- **发布说明**: 自动从 git 提交记录生成
  - 自动获取从上一个 tag 到当前的所有提交
  - 按照 `- 提交信息` 格式列出
  - 包含安装说明和自动更新提示
- **Updater JSON**: 自动生成更新配置文件 (`includeUpdaterJson: true`)

### 所需 Secrets

在 GitHub 仓库设置中需要配置以下 secrets：

1. `GITHUB_TOKEN` - 自动提供，用于创建 release
2. `TAURI_SIGNING_PRIVATE_KEY` - Tauri 应用签名私钥
3. `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` - 签名私钥密码

### 使用步骤

1. **准备发布**:
   ```bash
   # 更新版本号
   bun run update-version 0.2.32
   
   # 提交更改
   git add .
   git commit -m "chore: bump version to 0.2.32"
   ```

2. **触发发布**:
   ```bash
   # 推送到 release 分支
   git push origin main:release
   
   # 或使用脚本
   ./scripts/sync-to-release.sh
   ```

3. **监控构建**:
   - 访问 GitHub Actions 页面查看构建状态
   - 三个平台会并行构建，通常需要 10-20 分钟

4. **发布完成**:
   - Release 会自动创建并发布
   - 所有平台的安装包都会上传到 Assets
   - updater JSON 文件会自动生成用于应用内更新

### 故障排除

#### 缓存问题
- ✅ 现已修复：不同架构使用独立缓存键，避免冲突
- 首次构建时可能会显示 "Cache not found"，这是正常的

#### 发布页无内容
- ✅ 现已修复：将 `releaseDraft` 设置为 `false`
- Release 会立即发布，无需手动从草稿发布

#### 构建失败
- 检查 Rust 和 Node.js 版本兼容性
- 确保所有依赖都在 `package.json` 和 `Cargo.toml` 中正确声明
- 查看 Actions 日志获取详细错误信息

### 最近的优化 (2025-10-16)

1. **修复缓存冲突**: 为每个目标架构使用唯一的缓存键
2. **改进发布体验**: 
   - 自动发布而非草稿
   - 自动从 git 提交记录生成发布说明
   - 获取完整 git 历史以生成准确的更新日志
3. **优化缓存策略**: 添加多级回退和失败时缓存
4. **规范 Tag 格式**: 统一使用 `v` 前缀

### 提交信息最佳实践

由于发布说明会自动从提交记录生成，建议遵循以下提交信息规范：

- `feat: 添加新功能` - 新功能
- `fix: 修复某个问题` - Bug 修复
- `perf: 优化性能` - 性能优化
- `style: 优化界面样式` - UI 改进
- `refactor: 重构代码` - 代码重构
- `docs: 更新文档` - 文档更新
- `chore: 更新构建配置` - 构建/工具链更新

示例发布说明输出：
```markdown
## 📝 更新内容

- feat: 添加股票实时数据刷新功能
- fix: 修复 macOS 上的窗口显示问题
- perf: 优化大数据量渲染性能
- style: 改进暗色模式下的图表显示

### 📦 安装说明
...
```

### 相关文件

- `package.json` - 前端版本号
- `src-tauri/tauri.conf.json` - Tauri 配置和版本号
- `src-tauri/Cargo.toml` - Rust 项目配置
- `scripts/update-version.sh` - 版本号更新脚本
- `scripts/sync-to-release.sh` - 发布分支同步脚本

