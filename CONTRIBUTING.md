# 贡献指南

感谢您对 Watch Monkey App 项目的关注！

## 📜 许可证要求

本项目采用 **GNU Affero General Public License v3.0 (AGPL-3.0)** 许可证。

### 重要声明

通过向本项目提交代码、文档或其他贡献，您同意：

1. **您的贡献将遵循 AGPL-3.0 许可证**
2. **您拥有您所贡献内容的版权，或有权按 AGPL-3.0 许可证分发该内容**
3. **您理解并接受 AGPL-3.0 的所有条款和条件**

### AGPL-3.0 关键要求

- ✅ 所有衍生作品必须也使用 AGPL-3.0 许可证
- ✅ 任何修改都必须公开源代码
- ✅ 通过网络提供服务时也必须提供源代码访问
- ✅ 必须保留原始版权声明和许可证信息
- ✅ 必须明确标注您所做的修改

## 🔧 如何贡献

### 1. Fork 项目

点击 GitHub 页面右上角的 "Fork" 按钮。

### 2. 克隆您的 Fork

```bash
git clone https://github.com/YOUR_USERNAME/watch-monkey-app.git
cd watch-monkey-app
```

### 3. 创建功能分支

```bash
git checkout -b feature/your-feature-name
```

### 4. 开发规范

#### 代码头部声明

所有新创建的源代码文件都应包含许可证头部。使用 `LICENSE_HEADER` 文件中的模板：

**TypeScript/JavaScript 文件：**
```typescript
/*
 * Copyright (C) 2025 Watch Monkey App Contributors
 *
 * This file is part of Watch Monkey App.
 *
 * Watch Monkey App is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Watch Monkey App is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Watch Monkey App. If not, see <https://www.gnu.org/licenses/>.
 */
```

**Rust 文件：**
```rust
/*
 * Copyright (C) 2025 Watch Monkey App Contributors
 *
 * This file is part of Watch Monkey App.
 *
 * Watch Monkey App is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Watch Monkey App is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Watch Monkey App. If not, see <https://www.gnu.org/licenses/>.
 */
```

#### 代码规范

- 遵循现有的代码风格
- 使用 TypeScript 严格模式
- 为新功能编写测试
- 确保代码通过 linting 检查
- 添加必要的注释和文档

### 5. 提交更改

```bash
git add .
git commit -m "feat: 描述您的更改"
```

提交信息应遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` 错误修复
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建或辅助工具的变动

### 6. 推送到您的 Fork

```bash
git push origin feature/your-feature-name
```

### 7. 创建 Pull Request

在 GitHub 上创建 Pull Request，并：

- 清晰描述您的更改
- 引用相关的 Issue（如果有）
- 确认您同意 AGPL-3.0 许可证条款

## 📋 Pull Request 检查清单

在提交 PR 之前，请确保：

- [ ] 代码遵循项目的编码规范
- [ ] 已添加适当的测试
- [ ] 所有测试都通过
- [ ] 文档已更新（如需要）
- [ ] 新文件包含许可证头部
- [ ] 提交信息清晰且遵循规范
- [ ] 已阅读并同意 AGPL-3.0 许可证条款

## ⚖️ 许可证兼容性

### 可以包含的代码

您可以贡献以下许可证下的代码：

- ✅ AGPL-3.0
- ✅ GPL-3.0
- ✅ LGPL-3.0
- ✅ MIT（将被转换为 AGPL-3.0）
- ✅ BSD（将被转换为 AGPL-3.0）
- ✅ Apache 2.0（将被转换为 AGPL-3.0）

### 不能包含的代码

❌ 以下许可证的代码不能包含在本项目中：

- 专有软件代码
- 禁止商业使用的代码
- 与 AGPL-3.0 不兼容的 Copyleft 许可证

## 🤝 行为准则

- 尊重所有贡献者
- 欢迎建设性的批评和讨论
- 专注于对项目最有利的事情
- 保持专业和友好的态度

## 📮 问题和讨论

- 报告 Bug：使用 GitHub Issues
- 功能请求：使用 GitHub Issues 并标记为 "enhancement"
- 一般讨论：使用 GitHub Discussions

## 📚 更多资源

- [AGPL-3.0 完整文本](LICENSE)
- [GNU AGPL-3.0 官方说明](https://www.gnu.org/licenses/agpl-3.0.html)
- [AGPL-3.0 常见问题解答](https://www.gnu.org/licenses/gpl-faq.html)

## 📄 版权声明

所有贡献的版权归属于各自的作者，但必须在 AGPL-3.0 许可证下发布。

---

**再次感谢您的贡献！** 🎉


