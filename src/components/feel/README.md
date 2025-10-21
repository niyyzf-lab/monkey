# Feel 页面组件说明

## 组件列表

### 1. WorkflowCanvas（工作流画布）
- **文件**: `feel-workflow-canvas.tsx`
- **功能**: React Flow 主画布容器
- **特性**: 
  - 渲染工作流节点和连接线
  - 支持拖拽、缩放、连接
  - 集成工具栏

### 2. WorkflowToolbar（工作流工具栏）
- **文件**: `feel-workflow-toolbar.tsx`
- **功能**: 工作流配置管理
- **特性**:
  - 导出工作流配置（JSON 文件）
  - 导入工作流配置
  - 复制配置到剪贴板

### 3. ChatPanel（聊天面板）✨
- **文件**: `feel-chat-panel.tsx`
- **功能**: 悬浮 AI 聊天界面
- **特性**:
  - 🎈 **悬浮按钮**: 默认显示为右下角圆形按钮
  - 📏 **可拖拽**: 可自由移动位置（拖拽标题栏）
  - ➖ **最小化**: 折叠为小标题栏
  - ⬜ **最大化**: 全屏显示
  - ❌ **关闭**: 收起为悬浮按钮
  - 💬 **消息记录**: 保存对话历史
  - ⌨️ **快捷键**: Enter 发送，Shift+Enter 换行

### 4. WorkflowTypes（类型定义）
- **文件**: `feel-workflow-types.ts`
- **功能**: 类型映射和数据转换
- **导出**:
  - `edgeTypes`: 边类型映射
  - `nodeTypes`: 节点类型映射
  - `convertWorkflowData()`: 数据转换函数

## 使用示例

```tsx
import { WorkflowCanvas, ChatPanel, convertWorkflowData } from '@/components/feel'

function FeelPage() {
  const { nodes, edges } = convertWorkflowData()
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative">
        <WorkflowCanvas
          nodes={nodes}
          edges={edges}
          // ... 其他 props
        />
        
        {/* 悬浮聊天面板 */}
        <ChatPanel />
      </div>
    </div>
  )
}
```

## ChatPanel 交互指南

1. **打开聊天**: 点击右下角悬浮按钮
2. **发送消息**: 输入文本后按 Enter 或点击发送按钮
3. **换行**: 按 Shift + Enter
4. **最小化**: 点击标题栏的 `-` 按钮
5. **最大化**: 点击标题栏的 `⬜` 按钮
6. **移动位置**: 拖拽标题栏
7. **关闭**: 点击标题栏的 `×` 按钮

## 技术栈

- React + TypeScript
- React Flow (工作流可视化)
- Framer Motion (动画)
- shadcn/ui (UI 组件)
- Lucide Icons (图标)

## 开发计划

- [ ] 集成真实的 AI 聊天 API
- [ ] 添加聊天历史持久化
- [ ] 支持多轮对话上下文
- [ ] 添加语音输入功能
- [ ] 支持发送工作流截图

