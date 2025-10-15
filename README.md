# Watch Monkey App 📈

一款基于 Tauri 的现代化股票监控桌面应用，提供实时市场数据、持仓管理、标签分析等功能。

## ✨ 功能特性

- 🎯 **持仓管理 (Hold)** - 管理和追踪您的股票持仓，支持实时数据更新
- 📊 **数据分析 (Data)** - 浏览股票数据和标签分类，智能搜索和过滤
- 💭 **市场感知 (Feel)** - 查看市场情绪、热门板块、资金流向等
- 🤖 **智能助手 (Chat)** - AI 助手对话功能
- 🧠 **思维导图 (Mind)** - 投资思路整理和可视化
- 🎲 **选股工具 (Pick)** - 智能选股辅助工具
- ⚙️ **个性化设置 (Settings)** - 自定义应用配置

## 🛠️ 技术栈

### 前端
- **框架**: React 19 + TypeScript
- **路由**: TanStack Router
- **UI 组件**: Radix UI + Tailwind CSS 4
- **图表**: Lightweight Charts + Recharts
- **动画**: Motion (Framer Motion fork)
- **状态管理**: React Hooks + Custom Hooks
- **构建工具**: Vite 7

### 后端
- **桌面框架**: Tauri 2
- **语言**: Rust
- **功能**: 股票数据处理、标签过滤、系统 API

### 工具链
- **包管理器**: Bun
- **样式**: Tailwind CSS + PostCSS
- **类型检查**: TypeScript 5.8
- **虚拟化**: React Window + Masonic

## 📋 前置要求

- **Node.js**: >= 18.x
- **Bun**: >= 1.0.0 (推荐) 或 npm/yarn/pnpm
- **Rust**: >= 1.70.0
- **操作系统**: macOS / Windows / Linux

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd watch-monkey-app
```

### 2. 安装依赖

```bash
bun install
```

### 3. 配置环境变量

复制环境变量示例文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置必要的 API 密钥和数据源。

### 4. 运行开发服务器

```bash
bun run dev
```

这将同时启动 Vite 开发服务器和 Tauri 应用。

### 5. 构建生产版本

```bash
bun run build
bun run tauri build
```

构建产物将输出到 `src-tauri/target/release/` 目录。

## 📁 项目结构

```
watch-monkey-app/
├── src/                          # 前端源代码
│   ├── api/                      # API 接口层
│   │   ├── holdings-api.ts       # 持仓相关 API
│   │   ├── stock-details-api.ts  # 股票详情 API
│   │   └── rust-tag-api.ts       # 标签处理 API
│   ├── components/               # React 组件
│   │   ├── charts/               # 图表组件
│   │   ├── holdings/             # 持仓管理组件
│   │   ├── sidebar/              # 侧边栏组件
│   │   └── ui/                   # 基础 UI 组件
│   ├── hooks/                    # 自定义 Hooks
│   │   ├── use-async-data.ts     # 异步数据加载
│   │   ├── use-debounced-search.ts # 防抖搜索
│   │   └── use-pagination.ts     # 分页逻辑
│   ├── lib/                      # 工具函数库
│   │   ├── formatters.ts         # 格式化工具
│   │   ├── calculations.ts       # 计算工具
│   │   └── chart-utils.ts        # 图表工具
│   ├── routes/                   # 路由页面
│   │   ├── hold/                 # 持仓页面
│   │   ├── data/                 # 数据页面
│   │   ├── feel/                 # 市场感知页面
│   │   └── ...
│   └── types/                    # TypeScript 类型定义
├── src-tauri/                    # Tauri/Rust 后端
│   ├── src/
│   │   ├── main.rs               # 主程序入口
│   │   ├── stock_data.rs         # 股票数据处理
│   │   ├── tag_processor.rs      # 标签处理逻辑
│   │   └── tauri_commands.rs     # Tauri 命令定义
│   └── tauri.conf.json           # Tauri 配置
├── public/                       # 静态资源
└── package.json                  # 依赖配置
```

## 🎨 核心特性详解

### 持仓管理
- 实时持仓数据展示
- 支持自定义排序和筛选
- 盈亏计算和统计分析
- 股票详情图表查看

### 智能搜索
- 支持拼音搜索（pinyin-pro）
- 正则表达式高级搜索
- 实时搜索建议
- 标签黑名单过滤

### 数据可视化
- K线图和分时图
- 市场资金流向图表
- 板块热度分析
- 自定义图表控件

### 性能优化
- 虚拟列表渲染（React Window）
- 瀑布流布局（Masonic）
- 懒加载和无限滚动
- 防抖和节流优化

## 📦 主要依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| `@tauri-apps/api` | ^2.8.0 | Tauri API |
| `react` | ^19.1.0 | UI 框架 |
| `@tanstack/react-router` | ^1.132.7 | 路由管理 |
| `lightweight-charts` | ^5.0.9 | 金融图表 |
| `tailwindcss` | ^4.1.13 | CSS 框架 |
| `motion` | ^12.23.24 | 动画库 |
| `pinyin-pro` | ^3.27.0 | 拼音转换 |

## 🔧 开发工具

### 推荐 IDE 设置

- [VS Code](https://code.visualstudio.com/)
  - [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
  - [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

### 可用脚本

```bash
# 开发模式
bun run dev

# 构建前端
bun run build

# 预览构建结果
bun run preview

# Tauri 命令
bun run tauri dev
bun run tauri build

# 生成路由类型
bun run routes:generate
```

## 🌐 环境变量

创建 `.env` 文件并配置以下变量：

```env
# API 配置
VITE_API_BASE_URL=your_api_url
VITE_API_KEY=your_api_key

# 功能开关
VITE_ENABLE_CHAT=true
VITE_ENABLE_ANALYTICS=true
```

## 📝 代码规范

项目使用 TypeScript 严格模式，遵循以下规范：
- 使用函数式组件和 Hooks
- 组件文件使用 `.tsx` 扩展名
- 工具函数使用 `.ts` 扩展名
- 使用 Tailwind CSS 进行样式编写
- 遵循文件命名约定（kebab-case）

## 🐛 调试

### 前端调试
在浏览器中打开开发者工具（开发模式下自动启用）

### Rust 后端调试
```bash
# 查看 Tauri 控制台输出
bun run tauri dev
```

## 📄 许可证

[MIT License](LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 [Issue](https://github.com/your-repo/issues)
- 发送邮件至：your-email@example.com

---

**注意**: 本项目仅供学习和研究使用，不构成任何投资建议。投资有风险，入市需谨慎。
