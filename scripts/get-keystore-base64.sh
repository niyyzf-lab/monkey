#!/bin/bash

# 获取 Android Keystore 的 Base64 编码
# 用于配置 GitHub Actions Secrets

echo "🔐 生成 Android Keystore Base64 编码..."
echo ""

KEYSTORE_PATH="/Users/wenbo/upload-keystore.jks"

if [ ! -f "$KEYSTORE_PATH" ]; then
    echo "❌ 错误: 找不到 keystore 文件: $KEYSTORE_PATH"
    exit 1
fi

echo "📦 Keystore 文件: $KEYSTORE_PATH"
echo ""
echo "🔄 正在生成 Base64 编码..."
echo ""

# 生成 Base64 并复制到剪贴板
base64 -i "$KEYSTORE_PATH" | pbcopy

echo "✅ Base64 编码已复制到剪贴板！"
echo ""
echo "📋 接下来的步骤："
echo "1. 打开 GitHub 仓库"
echo "2. 进入 Settings → Secrets and variables → Actions"
echo "3. 点击 'New repository secret'"
echo "4. Name: ANDROID_KEY_BASE64"
echo "5. Secret: 粘贴剪贴板内容 (Command+V)"
echo "6. 点击 'Add secret'"
echo ""
echo "🔒 需要配置的完整 Secrets 列表："
echo "   - ANDROID_KEY_ALIAS = upload"
echo "   - ANDROID_KEY_PASSWORD = 88888888"
echo "   - ANDROID_KEY_BASE64 = (已在剪贴板中)"
echo ""

