# Prompt 文件管理系统

## 概述

本项目已将 AI 工作流节点的 prompt 从 JSON 文件中分离出来，改为使用独立的 Markdown 文件管理。这样做的好处包括：

- 📝 更好的可读性和编辑体验
- 🔄 更容易进行版本控制和差异比较
- 🎯 支持更长的 prompt 内容而不影响 JSON 文件的可读性
- 🚀 支持动态加载，减少初始加载时间

## 文件结构

```
src/
├── prompts/                    # Prompt 文件目录
│   ├── news-analyzer.md        # 新闻分析 AI 的 prompt
│   ├── stock-selector-ai.md    # 选股 AI 的 prompt
│   ├── decision-ai.md          # 决策 AI 的 prompt
│   ├── data-processor.md       # 交易执行 AI 的 prompt
│   ├── ai-status-provider.md   # 现状分析 AI 的 prompt
│   ├── external-analysis-ai.md # 外部分析 AI 的 prompt
│   └── kline-analysis-ai.md    # K线分析 AI 的 prompt
├── constants/
│   └── ai-workflow.json        # AI 工作流配置（引用 prompt 文件）
└── components/
    └── flow/
        ├── prompt-dialog.tsx   # Prompt 弹窗组件（支持文件读取）
        ├── module-node.tsx     # 模块节点组件
        └── tool-ai-node.tsx    # 工具 AI 节点组件
```

## 使用方法

### 1. 创建新的 Prompt 文件

在 `src/prompts/` 目录下创建一个新的 `.md` 文件：

```bash
touch src/prompts/my-new-ai.md
```

编辑文件内容，使用 Markdown 格式编写 prompt。

### 2. 在 ai-workflow.json 中引用

在 `src/constants/ai-workflow.json` 的节点配置中添加 `promptFile` 字段：

```json
{
  "id": "my-new-ai",
  "type": "ai-agent",
  "data": {
    "label": "我的新 AI",
    "description": "AI 描述",
    "icon": "/monkey/MyIcon.png",
    "promptFile": "/src/prompts/my-new-ai.md"
  }
}
```

### 3. 自动加载

当用户点击节点的信息按钮时，`PromptDialog` 组件会自动加载并显示对应的 Markdown 文件内容。

## 技术实现

### Vite 配置

在 `vite.config.ts` 中添加了自定义插件来处理 `.md` 文件：

```typescript
const markdownPlugin = () => {
  return {
    name: 'vite-plugin-markdown',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.endsWith('.md')) {
          const filePath = path.join(__dirname, 'src', req.url)
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8')
            res.setHeader('Content-Type', 'text/plain; charset=utf-8')
            res.end(content)
            return
          }
        }
        next()
      })
    }
  }
}
```

### PromptDialog 组件

`PromptDialog` 组件现在支持 `promptFile` 属性：

```typescript
<PromptDialog
  open={isDialogOpen}
  onOpenChange={setIsDialogOpen}
  icon={iconSrc}
  label={label}
  description={description}
  promptFile="/src/prompts/my-prompt.md"
/>
```

组件会使用 `fetch` API 动态加载文件内容，并显示加载状态和错误信息。

### 节点组件

`ModuleNode` 和 `ToolAINode` 组件都已更新，支持从节点数据中读取 `promptFile` 字段。

## 兼容性

为了保持向后兼容，组件仍然支持旧的 `prompt` 字段（直接在 JSON 中包含 prompt 内容）。

优先级：`promptFile` > `prompt`

如果同时存在 `promptFile` 和 `prompt`，将使用 `promptFile`。

## 迁移指南

如果你有现有的使用 `prompt` 字段的节点：

1. 在 `src/prompts/` 目录下创建对应的 `.md` 文件
2. 将 `prompt` 内容复制到 `.md` 文件中
3. 在 JSON 中将 `prompt` 字段替换为 `promptFile` 字段
4. 测试确保一切正常

## 注意事项

- 🔒 Markdown 文件路径必须以 `/src/` 开头
- 📁 所有 prompt 文件建议统一放在 `src/prompts/` 目录下
- 🎨 支持在 Markdown 文件中使用任何格式，包括代码块、列表、表格等
- ⚡ 文件会在用户打开弹窗时动态加载，不会影响应用的初始加载速度

## 示例

查看现有的 prompt 文件作为参考：

- `src/prompts/stock-selector-ai.md` - 复杂的多步骤 prompt 示例
- `src/prompts/news-analyzer.md` - 简单的 prompt 示例
- `src/prompts/decision-ai.md` - 结构化的 prompt 示例


