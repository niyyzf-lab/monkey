#!/bin/bash

# 测试远程 Windows 构建环境

echo "================================================"
echo "  测试远程 Windows 构建环境"
echo "================================================"
echo ""

# 从配置文件读取参数
CONFIG_FILE=".updater.config.json"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ 未找到配置文件: $CONFIG_FILE"
    exit 1
fi

# 读取配置
if command -v jq &> /dev/null; then
    REMOTE_HOST=$(jq -r '.build.remoteBuilds[0].host' "$CONFIG_FILE")
    REMOTE_PORT=$(jq -r '.build.remoteBuilds[0].port' "$CONFIG_FILE")
    REMOTE_USER=$(jq -r '.build.remoteBuilds[0].username' "$CONFIG_FILE")
    REMOTE_PASSWORD=$(jq -r '.build.remoteBuilds[0].password' "$CONFIG_FILE")
    REMOTE_PROJECT_PATH=$(jq -r '.build.remoteBuilds[0].remoteProjectPath' "$CONFIG_FILE")
    REMOTE_GIT_REMOTE=$(jq -r '.build.remoteBuilds[0].gitRemote // "origin"' "$CONFIG_FILE")
else
    echo "❌ 需要安装 jq: brew install jq"
    exit 1
fi

echo "配置信息:"
echo "  主机: $REMOTE_HOST:$REMOTE_PORT"
echo "  用户: $REMOTE_USER"
echo "  项目路径: $REMOTE_PROJECT_PATH"
echo ""

# 构建 SSH 命令
if [ -n "$REMOTE_PASSWORD" ] && [ "$REMOTE_PASSWORD" != "null" ]; then
    if ! command -v sshpass &> /dev/null; then
        echo "⚠️  需要安装 sshpass: brew install sshpass"
        SSH_CMD="ssh -p $REMOTE_PORT"
    else
        SSH_CMD="sshpass -p '$REMOTE_PASSWORD' ssh -p $REMOTE_PORT"
    fi
else
    SSH_CMD="ssh -p $REMOTE_PORT"
fi

# 测试 1: SSH 连接
echo "================================================"
echo "测试 1: SSH 基本连接"
echo "================================================"
eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"echo SSH 连接成功\""
if [ $? -eq 0 ]; then
    echo "✅ SSH 连接正常"
else
    echo "❌ SSH 连接失败"
    exit 1
fi
echo ""

# 测试 2: 检查远程系统信息
echo "================================================"
echo "测试 2: 远程系统信息"
echo "================================================"
echo "系统版本:"
eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"ver\""
echo ""
echo "当前用户:"
eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"echo %USERNAME%\""
echo ""

# 测试 3: 检查 Git
echo "================================================"
echo "测试 3: Git 环境检查"
echo "================================================"
eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"git --version\""
if [ $? -eq 0 ]; then
    echo "✅ Git 已安装"
else
    echo "❌ Git 未安装或不在 PATH 中"
fi
echo ""

# 测试 4: 检查项目目录
echo "================================================"
echo "测试 4: 项目目录检查"
echo "================================================"
echo "检查目录: $REMOTE_PROJECT_PATH"
REMOTE_DIR_CHECK="if exist \"$REMOTE_PROJECT_PATH\" (echo exists) else (echo not_exists)"
DIR_STATUS=$(eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"$REMOTE_DIR_CHECK\"" 2>/dev/null | tr -d '\r\n ')
echo "目录状态: [$DIR_STATUS]"

if [ "$DIR_STATUS" = "exists" ]; then
    echo "✅ 项目目录存在"
    
    # 使用 git 命令检查是否是仓库 (更可靠)
    echo ""
    echo "检查是否为 Git 仓库..."
    REMOTE_GIT_CHECK="cd \"$REMOTE_PROJECT_PATH\" 2>nul && git rev-parse --git-dir 2>nul && echo exists || echo not_exists"
    GIT_STATUS=$(eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"$REMOTE_GIT_CHECK\"" 2>/dev/null | grep -o "exists\|not_exists" | head -1)
    echo "Git 仓库状态: [$GIT_STATUS]"
    
    if [ "$GIT_STATUS" = "exists" ]; then
        echo "✅ 是 Git 仓库"
        
        # 显示当前分支和状态
        echo ""
        echo "当前分支和状态:"
        REMOTE_GIT_STATUS="cd \"$REMOTE_PROJECT_PATH\" && git branch && git status -s"
        eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"$REMOTE_GIT_STATUS\""
        
        # 显示远程 URL
        echo ""
        echo "远程仓库 URL:"
        REMOTE_GET_URL="cd \"$REMOTE_PROJECT_PATH\" && git remote get-url $REMOTE_GIT_REMOTE"
        eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"$REMOTE_GET_URL\""
    else
        echo "⚠️  不是 Git 仓库"
    fi
    
    # 列出目录内容
    echo ""
    echo "目录内容:"
    eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"dir \\\"$REMOTE_PROJECT_PATH\\\" /b\""
else
    echo "⚠️  项目目录不存在"
fi
echo ""

# 测试 5: 检查 Bun
echo "================================================"
echo "测试 5: Bun 环境检查"
echo "================================================"
eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"bun --version\""
if [ $? -eq 0 ]; then
    echo "✅ Bun 已安装"
else
    echo "❌ Bun 未安装或不在 PATH 中"
fi
echo ""

# 测试 6: 检查 Rust
echo "================================================"
echo "测试 6: Rust 环境检查"
echo "================================================"
eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"rustc --version\""
if [ $? -eq 0 ]; then
    echo "✅ Rust 已安装"
else
    echo "❌ Rust 未安装或不在 PATH 中"
fi
echo ""

# 测试 7: 测试 Git Pull (如果仓库存在)
if [ "$GIT_STATUS" = "exists" ]; then
    echo "================================================"
    echo "测试 7: 测试 Git Pull"
    echo "================================================"
    REMOTE_GIT_PULL="cd \"$REMOTE_PROJECT_PATH\" && git fetch $REMOTE_GIT_REMOTE && git status"
    eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"$REMOTE_GIT_PULL\""
    if [ $? -eq 0 ]; then
        echo "✅ Git Pull 测试成功"
    else
        echo "❌ Git Pull 测试失败"
    fi
    echo ""
fi

# 测试 8: 检查签名密钥目录
echo "================================================"
echo "测试 8: 签名密钥目录检查"
echo "================================================"
REMOTE_TAURI_CHECK="if exist \"$REMOTE_PROJECT_PATH\\.tauri\" (echo exists) else (echo not_exists)"
TAURI_STATUS=$(eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"$REMOTE_TAURI_CHECK\"" 2>/dev/null | tr -d '\r\n ')
echo ".tauri 目录状态: [$TAURI_STATUS]"

if [ "$TAURI_STATUS" = "exists" ]; then
    echo "✅ .tauri 目录存在"
    echo ""
    echo "目录内容:"
    eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"dir \\\"$REMOTE_PROJECT_PATH\\.tauri\\\" /b\""
else
    echo "⚠️  .tauri 目录不存在"
fi
echo ""

# 总结
echo "================================================"
echo "  测试总结"
echo "================================================"
echo ""
echo "✅ = 通过  ❌ = 失败  ⚠️ = 警告"
echo ""
echo "建议:"
echo "1. 如果 Git 仓库已存在，可以直接运行构建脚本"
echo "2. 如果 .tauri 目录不存在，脚本会自动创建并上传密钥"
echo "3. 确保所有必需的工具都已安装 (Git, Bun, Rust)"
echo ""

