#!/bin/bash

# 交互式版本号更新脚本

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo "================================================"
echo "         📦 交互式版本号更新工具"
echo "================================================"
echo ""

# 配置文件路径
TAURI_CONF="src-tauri/tauri.conf.json"
PACKAGE_JSON="package.json"

# ============================================
# 读取当前版本号
# ============================================
CURRENT_VERSION=""

if [ -f "$TAURI_CONF" ]; then
    if command -v jq &> /dev/null; then
        CURRENT_VERSION=$(jq -r '.version' "$TAURI_CONF" 2>/dev/null)
    else
        CURRENT_VERSION=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' "$TAURI_CONF" | head -1 | sed 's/.*"\([^"]*\)".*/\1/')
    fi
fi

# 如果从 tauri.conf.json 读取失败，尝试从 package.json 读取
if [ -z "$CURRENT_VERSION" ] || [ "$CURRENT_VERSION" = "null" ]; then
    if [ -f "$PACKAGE_JSON" ]; then
        if command -v jq &> /dev/null; then
            CURRENT_VERSION=$(jq -r '.version' "$PACKAGE_JSON" 2>/dev/null)
        else
            CURRENT_VERSION=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' "$PACKAGE_JSON" | head -1 | sed 's/.*"\([^"]*\)".*/\1/')
        fi
    fi
fi

if [ -z "$CURRENT_VERSION" ] || [ "$CURRENT_VERSION" = "null" ]; then
    echo -e "${RED}❌ 错误: 无法读取当前版本号${NC}"
    echo ""
    echo "   请检查以下文件是否存在："
    echo "   • $TAURI_CONF"
    echo "   • $PACKAGE_JSON"
    echo ""
    exit 1
fi

echo -e "${CYAN}📋 当前配置信息:${NC}"
echo ""
echo "   当前版本: $CURRENT_VERSION"
echo "   Tauri 配置: $TAURI_CONF"
echo "   Package 配置: $PACKAGE_JSON"
echo ""

# ============================================
# 计算建议的版本号
# ============================================
suggest_versions() {
    local current=$1
    if [[ $current =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
        local major="${BASH_REMATCH[1]}"
        local minor="${BASH_REMATCH[2]}"
        local patch="${BASH_REMATCH[3]}"
        
        SUGGESTED_PATCH="$major.$minor.$((patch + 1))"
        SUGGESTED_MINOR="$major.$((minor + 1)).0"
        SUGGESTED_MAJOR="$((major + 1)).0.0"
    else
        echo -e "${RED}❌ 错误: 版本号格式不正确 (应为 x.y.z)${NC}"
        exit 1
    fi
}

# 计算建议版本
suggest_versions "$CURRENT_VERSION"

# ============================================
# 交互式选择新版本号
# ============================================
NEW_VERSION=""

if [ -n "$1" ]; then
    # 如果提供了命令行参数，直接使用
    NEW_VERSION=$1
    echo -e "${YELLOW}💡 使用命令行参数指定的版本: $NEW_VERSION${NC}"
    echo ""
else
    # 交互式选择
    echo -e "${YELLOW}💡 版本升级选项:${NC}"
    echo ""
    echo "   [1] 🐛 补丁版本 (Patch): $SUGGESTED_PATCH"
    echo "       └─ 用于: Bug 修复、小改进"
    echo ""
    echo "   [2] ✨ 次版本 (Minor):  $SUGGESTED_MINOR"
    echo "       └─ 用于: 新功能、向后兼容的更改"
    echo ""
    echo "   [3] 🚀 主版本 (Major):  $SUGGESTED_MAJOR"
    echo "       └─ 用于: 重大更新、破坏性更改"
    echo ""
    echo "   [0] ✏️  自定义版本"
    echo ""
    
    read -p "📦 请选择版本类型 (1/2/3/0) [默认: 1]: " VERSION_CHOICE
    VERSION_CHOICE=${VERSION_CHOICE:-1}
    
    case "$VERSION_CHOICE" in
        "1")
            NEW_VERSION=$SUGGESTED_PATCH
            echo -e "${GREEN}✓ 选择补丁版本: $NEW_VERSION${NC}"
            ;;
        "2")
            NEW_VERSION=$SUGGESTED_MINOR
            echo -e "${GREEN}✓ 选择次版本: $NEW_VERSION${NC}"
            ;;
        "3")
            NEW_VERSION=$SUGGESTED_MAJOR
            echo -e "${GREEN}✓ 选择主版本: $NEW_VERSION${NC}"
            ;;
        "0")
            echo ""
            read -p "   ✏️  请输入自定义版本号: " NEW_VERSION
            if [ -z "$NEW_VERSION" ]; then
                echo -e "${RED}❌ 错误: 版本号不能为空${NC}"
                exit 1
            fi
            ;;
        *)
            # 如果直接输入了版本号
            if [[ "$VERSION_CHOICE" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
                NEW_VERSION=$VERSION_CHOICE
                echo -e "${GREEN}✓ 使用输入的版本: $NEW_VERSION${NC}"
            else
                echo -e "${RED}❌ 错误: 无效的选择或版本号格式${NC}"
                exit 1
            fi
            ;;
    esac
fi

echo ""

# 验证版本号格式
if [[ ! "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${RED}❌ 错误: 版本号格式不正确${NC}"
    echo "   应该是 x.y.z 格式，例如: 1.2.3"
    echo ""
    exit 1
fi

# 检查版本号是否有变化
if [ "$NEW_VERSION" = "$CURRENT_VERSION" ]; then
    echo -e "${YELLOW}⚠️  警告: 新版本号与当前版本相同${NC}"
    echo ""
    read -p "是否继续？(y/N): " CONTINUE_SAME
    if [[ ! "$CONTINUE_SAME" =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}已取消更新${NC}"
        exit 0
    fi
    echo ""
fi

# ============================================
# 显示更新预览
# ============================================
echo "================================================"
echo -e "${CYAN}📝 更新预览${NC}"
echo "================================================"
echo ""
echo -e "   ${YELLOW}旧版本:${NC} $CURRENT_VERSION"
echo -e "   ${GREEN}新版本:${NC} $NEW_VERSION"
echo ""
echo "   将更新以下文件:"
if [ -f "$TAURI_CONF" ]; then
    echo "   ✓ $TAURI_CONF"
fi
if [ -f "$PACKAGE_JSON" ]; then
    echo "   ✓ $PACKAGE_JSON"
fi
echo ""

# 最后确认
read -p "确认更新版本号？(Y/n): " CONFIRM
CONFIRM=${CONFIRM:-Y}
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}已取消更新${NC}"
    exit 0
fi

echo ""

# ============================================
# 执行更新
# ============================================
echo "================================================"
echo -e "${CYAN}🔄 正在更新版本号...${NC}"
echo "================================================"
echo ""

UPDATE_SUCCESS=0
UPDATE_FAILED=0

# 更新 tauri.conf.json
if [ -f "$TAURI_CONF" ]; then
    echo -e "${BLUE}[1/2] 更新 $TAURI_CONF...${NC}"
    
    # 创建备份
    cp "$TAURI_CONF" "${TAURI_CONF}.backup"
    
    if command -v jq &> /dev/null; then
        TMP_FILE=$(mktemp)
        if jq --arg version "$NEW_VERSION" '.version = $version' "$TAURI_CONF" > "$TMP_FILE"; then
            mv "$TMP_FILE" "$TAURI_CONF"
            echo -e "${GREEN}   ✅ 已更新 tauri.conf.json${NC}"
            UPDATE_SUCCESS=$((UPDATE_SUCCESS + 1))
        else
            echo -e "${RED}   ❌ 更新失败${NC}"
            mv "${TAURI_CONF}.backup" "$TAURI_CONF"
            UPDATE_FAILED=$((UPDATE_FAILED + 1))
        fi
    else
        if [[ "$OSTYPE" == "darwin"* ]]; then
            if sed -i '' "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" "$TAURI_CONF"; then
                echo -e "${GREEN}   ✅ 已更新 tauri.conf.json${NC}"
                UPDATE_SUCCESS=$((UPDATE_SUCCESS + 1))
            else
                echo -e "${RED}   ❌ 更新失败${NC}"
                mv "${TAURI_CONF}.backup" "$TAURI_CONF"
                UPDATE_FAILED=$((UPDATE_FAILED + 1))
            fi
        else
            if sed -i "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" "$TAURI_CONF"; then
                echo -e "${GREEN}   ✅ 已更新 tauri.conf.json${NC}"
                UPDATE_SUCCESS=$((UPDATE_SUCCESS + 1))
            else
                echo -e "${RED}   ❌ 更新失败${NC}"
                mv "${TAURI_CONF}.backup" "$TAURI_CONF"
                UPDATE_FAILED=$((UPDATE_FAILED + 1))
            fi
        fi
    fi
    
    # 验证更新
    if command -v jq &> /dev/null; then
        VERIFY_VERSION=$(jq -r '.version' "$TAURI_CONF" 2>/dev/null)
    else
        VERIFY_VERSION=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' "$TAURI_CONF" | head -1 | sed 's/.*"\([^"]*\)".*/\1/')
    fi
    
    if [ "$VERIFY_VERSION" = "$NEW_VERSION" ]; then
        echo -e "${GREEN}   ✓ 验证通过: $VERIFY_VERSION${NC}"
        rm -f "${TAURI_CONF}.backup"
    else
        echo -e "${RED}   ✗ 验证失败: 期望 $NEW_VERSION，实际 $VERIFY_VERSION${NC}"
        mv "${TAURI_CONF}.backup" "$TAURI_CONF"
        UPDATE_FAILED=$((UPDATE_FAILED + 1))
        UPDATE_SUCCESS=$((UPDATE_SUCCESS - 1))
    fi
    
    echo ""
else
    echo -e "${YELLOW}⚠️  未找到 $TAURI_CONF${NC}"
    echo ""
fi

# 更新 package.json
if [ -f "$PACKAGE_JSON" ]; then
    echo -e "${BLUE}[2/2] 更新 $PACKAGE_JSON...${NC}"
    
    # 创建备份
    cp "$PACKAGE_JSON" "${PACKAGE_JSON}.backup"
    
    if command -v jq &> /dev/null; then
        TMP_FILE=$(mktemp)
        if jq --arg version "$NEW_VERSION" '.version = $version' "$PACKAGE_JSON" > "$TMP_FILE"; then
            mv "$TMP_FILE" "$PACKAGE_JSON"
            echo -e "${GREEN}   ✅ 已更新 package.json${NC}"
            UPDATE_SUCCESS=$((UPDATE_SUCCESS + 1))
        else
            echo -e "${RED}   ❌ 更新失败${NC}"
            mv "${PACKAGE_JSON}.backup" "$PACKAGE_JSON"
            UPDATE_FAILED=$((UPDATE_FAILED + 1))
        fi
    else
        if [[ "$OSTYPE" == "darwin"* ]]; then
            if sed -i '' "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" "$PACKAGE_JSON"; then
                echo -e "${GREEN}   ✅ 已更新 package.json${NC}"
                UPDATE_SUCCESS=$((UPDATE_SUCCESS + 1))
            else
                echo -e "${RED}   ❌ 更新失败${NC}"
                mv "${PACKAGE_JSON}.backup" "$PACKAGE_JSON"
                UPDATE_FAILED=$((UPDATE_FAILED + 1))
            fi
        else
            if sed -i "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" "$PACKAGE_JSON"; then
                echo -e "${GREEN}   ✅ 已更新 package.json${NC}"
                UPDATE_SUCCESS=$((UPDATE_SUCCESS + 1))
            else
                echo -e "${RED}   ❌ 更新失败${NC}"
                mv "${PACKAGE_JSON}.backup" "$PACKAGE_JSON"
                UPDATE_FAILED=$((UPDATE_FAILED + 1))
            fi
        fi
    fi
    
    # 验证更新
    if command -v jq &> /dev/null; then
        VERIFY_VERSION=$(jq -r '.version' "$PACKAGE_JSON" 2>/dev/null)
    else
        VERIFY_VERSION=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' "$PACKAGE_JSON" | head -1 | sed 's/.*"\([^"]*\)".*/\1/')
    fi
    
    if [ "$VERIFY_VERSION" = "$NEW_VERSION" ]; then
        echo -e "${GREEN}   ✓ 验证通过: $VERIFY_VERSION${NC}"
        rm -f "${PACKAGE_JSON}.backup"
    else
        echo -e "${RED}   ✗ 验证失败: 期望 $NEW_VERSION，实际 $VERIFY_VERSION${NC}"
        mv "${PACKAGE_JSON}.backup" "$PACKAGE_JSON"
        UPDATE_FAILED=$((UPDATE_FAILED + 1))
        UPDATE_SUCCESS=$((UPDATE_SUCCESS - 1))
    fi
    
    echo ""
else
    echo -e "${YELLOW}⚠️  未找到 $PACKAGE_JSON${NC}"
    echo ""
fi

# ============================================
# 显示结果
# ============================================
echo "================================================"
if [ $UPDATE_FAILED -eq 0 ] && [ $UPDATE_SUCCESS -gt 0 ]; then
    echo -e "${GREEN}✅ 版本号更新完成！${NC}"
    echo "================================================"
    echo ""
    echo -e "${CYAN}📊 更新摘要:${NC}"
    echo ""
    echo "   • 旧版本: $CURRENT_VERSION"
    echo "   • 新版本: $NEW_VERSION"
    echo "   • 更新文件: $UPDATE_SUCCESS 个"
    echo ""
    echo -e "${YELLOW}🔔 下一步操作:${NC}"
    echo ""
    echo "   1. 提交版本更新："
    echo "      git add ."
    echo "      git commit -m \"chore: bump version to $NEW_VERSION\""
    echo ""
    echo "   2. 创建 Git 标签（可选）："
    echo "      git tag -a v$NEW_VERSION -m \"Release v$NEW_VERSION\""
    echo ""
    echo "   3. 推送到远程："
    echo "      git push origin main"
    echo "      git push origin v$NEW_VERSION"
    echo ""
    echo "   4. 同步到 release 分支触发构建："
    echo "      bash scripts/sync-to-release.sh"
    echo ""
elif [ $UPDATE_FAILED -gt 0 ]; then
    echo -e "${RED}❌ 版本号更新失败${NC}"
    echo "================================================"
    echo ""
    echo "   成功: $UPDATE_SUCCESS 个文件"
    echo "   失败: $UPDATE_FAILED 个文件"
    echo ""
    echo "   已恢复所有备份文件"
    echo ""
    exit 1
else
    echo -e "${YELLOW}⚠️  没有文件被更新${NC}"
    echo "================================================"
    echo ""
    exit 1
fi

