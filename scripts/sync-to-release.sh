#!/bin/bash

# 脚本：更新版本号并将 main 分支同步到 release 分支
# 用途：开发在 main 上完成后，使用此脚本更新版本号、提交、打标签，然后同步到 release 分支触发构建

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
echo "  📦 版本发布工具 (版本更新 + 同步到 Release)"
echo "================================================"
echo ""

# 配置文件路径
TAURI_CONF="src-tauri/tauri.conf.json"
PACKAGE_JSON="package.json"

# ============================================
# 步骤 1: 检查当前工作目录状态
# ============================================
echo -e "${YELLOW}[1/10] 检查工作目录状态...${NC}"
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}❌ 错误: 工作目录有未提交的改动，请先提交或暂存。${NC}"
    git status -s
    echo ""
    exit 1
fi
echo -e "${GREEN}✓ 工作目录干净${NC}"
echo ""

# ============================================
# 步骤 2: 获取当前分支并检查
# ============================================
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}[2/10] 当前分支: ${CURRENT_BRANCH}${NC}"

# 如果不在 main 分支，先切换到 main
if [[ "$CURRENT_BRANCH" != "main" ]]; then
    echo -e "${BLUE}切换到 main 分支...${NC}"
    git checkout main
    git pull origin main
fi
echo ""

# ============================================
# 步骤 3: 读取当前版本号
# ============================================
echo -e "${YELLOW}[3/10] 读取当前版本号...${NC}"

CURRENT_VERSION=""
if [ -f "$TAURI_CONF" ]; then
    if command -v jq &> /dev/null; then
        CURRENT_VERSION=$(jq -r '.version' "$TAURI_CONF" 2>/dev/null)
    else
        CURRENT_VERSION=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' "$TAURI_CONF" | head -1 | sed 's/.*"\([^"]*\)".*/\1/')
    fi
fi

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
    exit 1
fi

echo -e "${CYAN}📋 当前版本: $CURRENT_VERSION${NC}"
echo ""

# ============================================
# 步骤 4: 计算并选择新版本号
# ============================================
echo -e "${YELLOW}[4/10] 选择新版本号...${NC}"

# 计算建议的版本号
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

suggest_versions "$CURRENT_VERSION"

NEW_VERSION=""

if [ -n "$1" ]; then
    # 如果提供了命令行参数，直接使用
    NEW_VERSION=$1
    echo -e "${GREEN}✓ 使用命令行参数指定的版本: $NEW_VERSION${NC}"
else
    # 交互式选择
    echo ""
    echo -e "${CYAN}💡 版本升级选项:${NC}"
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
    echo -e "${RED}❌ 错误: 版本号格式不正确 (应为 x.y.z)${NC}"
    echo ""
    exit 1
fi

# 检查版本号是否有变化
if [ "$NEW_VERSION" = "$CURRENT_VERSION" ]; then
    echo -e "${YELLOW}⚠️  警告: 新版本号与当前版本相同${NC}"
    echo ""
    read -p "是否继续？(y/N): " CONTINUE_SAME
    if [[ ! "$CONTINUE_SAME" =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}已取消发布${NC}"
        exit 0
    fi
    echo ""
fi

# 最后确认
echo "================================================"
echo -e "${CYAN}📝 发布预览${NC}"
echo "================================================"
echo ""
echo -e "   ${YELLOW}旧版本:${NC} $CURRENT_VERSION"
echo -e "   ${GREEN}新版本:${NC} $NEW_VERSION"
echo ""
echo "   将执行以下操作:"
echo "   1. 更新版本号文件"
echo "   2. 提交版本更新"
echo "   3. 创建 Git 标签 v$NEW_VERSION"
echo "   4. 推送到 main 分支"
echo "   5. 同步到 release 分支触发构建"
echo ""

read -p "确认发布新版本？(Y/n): " CONFIRM
CONFIRM=${CONFIRM:-Y}
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}已取消发布${NC}"
    exit 0
fi

echo ""

# ============================================
# 步骤 5: 更新版本号文件
# ============================================
echo "================================================"
echo -e "${CYAN}🔄 正在更新版本号...${NC}"
echo "================================================"
echo ""

UPDATE_SUCCESS=0
UPDATE_FAILED=0

# 更新 tauri.conf.json
if [ -f "$TAURI_CONF" ]; then
    echo -e "${BLUE}[5/10] 更新 $TAURI_CONF...${NC}"
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
        echo -e "${RED}   ✗ 验证失败${NC}"
        mv "${TAURI_CONF}.backup" "$TAURI_CONF"
        UPDATE_FAILED=$((UPDATE_FAILED + 1))
        UPDATE_SUCCESS=$((UPDATE_SUCCESS - 1))
    fi
    echo ""
fi

# 更新 package.json
if [ -f "$PACKAGE_JSON" ]; then
    echo -e "${BLUE}[6/10] 更新 $PACKAGE_JSON...${NC}"
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
        echo -e "${RED}   ✗ 验证失败${NC}"
        mv "${PACKAGE_JSON}.backup" "$PACKAGE_JSON"
        UPDATE_FAILED=$((UPDATE_FAILED + 1))
        UPDATE_SUCCESS=$((UPDATE_SUCCESS - 1))
    fi
    echo ""
fi

# 检查更新结果
if [ $UPDATE_FAILED -gt 0 ]; then
    echo -e "${RED}❌ 版本号更新失败，已恢复备份文件${NC}"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ 版本号更新成功${NC}"
echo ""

# ============================================
# 步骤 6: 提交版本更新
# ============================================
echo -e "${YELLOW}[7/10] 提交版本更新...${NC}"
git add "$TAURI_CONF" "$PACKAGE_JSON"
git commit -m "chore: bump version to $NEW_VERSION"
echo -e "${GREEN}✓ 版本更新已提交${NC}"
echo ""

# ============================================
# 步骤 7: 创建 Git 标签
# ============================================
echo -e "${YELLOW}[8/10] 创建 Git 标签 v$NEW_VERSION...${NC}"
if git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"; then
    echo -e "${GREEN}✓ 标签已创建${NC}"
else
    echo -e "${YELLOW}⚠️  标签可能已存在，继续...${NC}"
fi
echo ""

# ============================================
# 步骤 8: 推送到 main 分支
# ============================================
echo -e "${YELLOW}[9/10] 推送到 main 分支...${NC}"
git push origin main
git push origin "v$NEW_VERSION"
echo -e "${GREEN}✓ 已推送到 main 分支${NC}"
echo ""

# ============================================
# 步骤 9: 同步到 release 分支
# ============================================
echo -e "${YELLOW}[10/10] 同步到 release 分支...${NC}"
echo ""

# 拉取最新的远程分支
echo -e "${BLUE}   → 拉取远程最新代码...${NC}"
git fetch origin
echo ""

# 切换到 release 分支
echo -e "${BLUE}   → 切换到 release 分支...${NC}"
git checkout release
git pull origin release
echo ""

# 合并 main 到 release
echo -e "${BLUE}   → 合并 main 到 release...${NC}"
if git merge main --no-edit; then
    echo -e "${GREEN}   ✓ 合并成功${NC}"
else
    echo -e "${RED}   ❌ 错误: 合并冲突，请手动解决冲突${NC}"
    echo ""
    echo "   请执行以下命令解决冲突："
    echo "   1. git add ."
    echo "   2. git commit"
    echo "   3. git push origin release"
    echo ""
    exit 1
fi
echo ""

# 推送到远程 release 分支
echo -e "${BLUE}   → 推送到远程 release 分支...${NC}"
git push origin release
echo -e "${GREEN}   ✓ 推送成功${NC}"
echo ""

# ============================================
# 步骤 10: 切换回原分支
# ============================================
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "release" ]]; then
    echo -e "${BLUE}切换回原分支: ${CURRENT_BRANCH}${NC}"
    git checkout "$CURRENT_BRANCH"
    echo ""
else
    git checkout main
fi

# ============================================
# 显示完成信息
# ============================================
echo "================================================"
echo -e "${GREEN}🎉 版本发布完成！${NC}"
echo "================================================"
echo ""
echo -e "${CYAN}📊 发布摘要:${NC}"
echo ""
echo "   • 版本号: $CURRENT_VERSION → $NEW_VERSION"
echo "   • Git 标签: v$NEW_VERSION"
echo "   • 已推送到 main 分支"
echo "   • 已同步到 release 分支"
echo ""
echo -e "${GREEN}✓ GitHub Actions 将自动开始构建...${NC}"
echo ""
echo -e "${YELLOW}🔗 查看构建状态:${NC}"
echo "   https://github.com/$(git remote get-url origin | sed 's/.*github.com[:\/]\(.*\)\.git/\1/')/actions"
echo ""

