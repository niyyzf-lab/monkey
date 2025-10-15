#!/bin/bash

# 将 app 文件复制到应用程序目录并赋权的脚本

echo "================================================"
echo "  macOS 应用安装脚本"
echo "================================================"
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 定义颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 查找同级目录下的 .app 文件
echo "🔍 查找同级目录下的 .app 文件..."
echo ""

APP_FILES=()
for app in "$SCRIPT_DIR"/*.app; do
    if [ -d "$app" ]; then
        APP_FILES+=("$app")
    fi
done

# 检查是否找到 app 文件
if [ ${#APP_FILES[@]} -eq 0 ]; then
    echo -e "${RED}❌ 错误: 在同级目录下未找到 .app 文件${NC}"
    echo ""
    echo "💡 请将 .app 文件放在与此脚本相同的目录下"
    echo "   当前目录: $SCRIPT_DIR"
    echo ""
    read -p "按回车键退出..."
    exit 1
fi

# 选择要安装的应用
if [ ${#APP_FILES[@]} -eq 1 ]; then
    APP_PATH="${APP_FILES[0]}"
else
    # 多个 app 文件，让用户选择
    echo "找到多个 .app 文件:"
    echo ""
    for i in "${!APP_FILES[@]}"; do
        echo "   [$((i+1))] $(basename "${APP_FILES[$i]}")"
    done
    echo ""
    read -p "请选择要安装的应用 (1-${#APP_FILES[@]}): " CHOICE
    
    if ! [[ "$CHOICE" =~ ^[0-9]+$ ]] || [ "$CHOICE" -lt 1 ] || [ "$CHOICE" -gt ${#APP_FILES[@]} ]; then
        echo -e "${RED}❌ 错误: 无效的选择${NC}"
        read -p "按回车键退出..."
        exit 1
    fi
    
    APP_PATH="${APP_FILES[$((CHOICE-1))]}"
fi

APP_NAME=$(basename "$APP_PATH")
TARGET_PATH="/Applications/$APP_NAME"

echo -e "${GREEN}✅ 找到应用: $APP_NAME${NC}"
echo "   源路径: $APP_PATH"
echo "   目标路径: $TARGET_PATH"
echo ""

# 检查目标位置是否已存在
if [ -d "$TARGET_PATH" ]; then
    echo -e "${YELLOW}⚠️  应用程序目录中已存在该应用${NC}"
    read -p "是否覆盖安装? (y/N): " OVERWRITE
    if [[ ! "$OVERWRITE" =~ ^[Yy]$ ]]; then
        echo "❌ 已取消安装"
        read -p "按回车键退出..."
        exit 0
    fi
    echo ""
    echo "🗑️  删除现有应用..."
    sudo rm -rf "$TARGET_PATH"
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 错误: 删除现有应用失败${NC}"
        read -p "按回车键退出..."
        exit 1
    fi
    echo -e "${GREEN}   ✅ 已删除${NC}"
    echo ""
fi

# 复制应用到应用程序目录
echo "📦 正在复制应用到应用程序目录..."
echo "   (需要管理员权限，可能会提示输入密码)"
echo ""
sudo cp -R "$APP_PATH" "$TARGET_PATH"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 错误: 复制失败${NC}"
    read -p "按回车键退出..."
    exit 1
fi

echo -e "${GREEN}   ✅ 复制成功${NC}"
echo ""

# 使用 xattr 移除隔离属性（解决"无法验证开发者"问题）
echo "🔓 正在移除隔离属性 (com.apple.quarantine)..."
sudo xattr -cr "$TARGET_PATH"

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  警告: xattr 命令执行失败${NC}"
    echo "   应用已复制，但可能需要手动在系统设置中允许运行"
else
    echo -e "${GREEN}   ✅ 已移除隔离属性${NC}"
fi

echo ""

# 修复权限
echo "🔧 正在修复权限..."
sudo chmod -R 755 "$TARGET_PATH"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ 权限修复成功${NC}"
else
    echo -e "${YELLOW}⚠️  警告: 权限修复失败${NC}"
fi

echo ""
echo "================================================"
echo -e "${GREEN}✅ 安装完成！${NC}"
echo "================================================"
echo ""
echo "🚀 应用已安装到: $TARGET_PATH"
echo ""
echo "💡 提示:"
echo "   • 你可以在启动台或应用程序文件夹中找到该应用"
echo "   • 首次运行时，如果系统提示安全警告，请在"
echo "     系统设置 → 隐私与安全性 中允许运行"
echo ""

# 询问是否立即打开应用
read -p "是否现在打开应用？(Y/n): " OPEN_APP
OPEN_APP=${OPEN_APP:-Y}

if [[ "$OPEN_APP" =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 正在启动应用..."
    open "$TARGET_PATH"
fi

echo ""
echo "✨ 完成！"
echo ""
read -p "按回车键关闭此窗口..."

