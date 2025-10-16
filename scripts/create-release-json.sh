#!/bin/bash

# 创建 Gitea Release 的 latest.json 文件

echo "================================================"
echo "  Tauri 自动更新 - Gitea Release JSON 生成器"
echo "================================================"
echo ""

# 读取配置文件
CONFIG_FILE=".updater.config.json"

BUILD_COMMAND=""
PRIVATE_KEY_PATH=""
PRIVATE_KEY_PASSWORD=""
GITEA_TOKEN=""
AUTO_UPLOAD=""
REMOTE_BUILDS_ENABLED=""
REMOTE_HOST=""
REMOTE_PORT=""
REMOTE_USER=""
REMOTE_PASSWORD=""
REMOTE_KEY_PATH=""
REMOTE_PROJECT_PATH=""
REMOTE_BUILD_COMMAND=""
REMOTE_GIT_BRANCH=""
REMOTE_GIT_REMOTE=""

if [ -f "$CONFIG_FILE" ]; then
    echo "📄 读取配置文件: $CONFIG_FILE"
    
    # 检查是否安装了 jq
    if command -v jq &> /dev/null; then
        # 使用 jq 解析 JSON
        GITEA_URL=$(jq -r '.gitea.url' "$CONFIG_FILE")
        OWNER=$(jq -r '.gitea.owner' "$CONFIG_FILE")
        REPO=$(jq -r '.gitea.repo' "$CONFIG_FILE")
        GITEA_TOKEN=$(jq -r '.gitea.token' "$CONFIG_FILE")
        AUTO_UPLOAD=$(jq -r '.gitea.autoUpload' "$CONFIG_FILE")
        APP_NAME=$(jq -r '.app.name' "$CONFIG_FILE")
        BUILD_COMMAND=$(jq -r '.build.command' "$CONFIG_FILE")
        PRIVATE_KEY_PATH=$(jq -r '.build.privateKeyPath' "$CONFIG_FILE")
        PRIVATE_KEY_PASSWORD=$(jq -r '.build.privateKeyPassword' "$CONFIG_FILE")
        
        # 读取远程构建配置（Windows）
        REMOTE_BUILDS_ENABLED=$(jq -r '.build.remoteBuilds[0].enabled' "$CONFIG_FILE" 2>/dev/null)
        if [ "$REMOTE_BUILDS_ENABLED" = "true" ]; then
            REMOTE_HOST=$(jq -r '.build.remoteBuilds[0].host' "$CONFIG_FILE")
            REMOTE_PORT=$(jq -r '.build.remoteBuilds[0].port' "$CONFIG_FILE")
            REMOTE_USER=$(jq -r '.build.remoteBuilds[0].username' "$CONFIG_FILE")
            REMOTE_PASSWORD=$(jq -r '.build.remoteBuilds[0].password' "$CONFIG_FILE")
            REMOTE_KEY_PATH=$(jq -r '.build.remoteBuilds[0].privateKeyPath' "$CONFIG_FILE")
            REMOTE_PROJECT_PATH=$(jq -r '.build.remoteBuilds[0].remoteProjectPath' "$CONFIG_FILE")
            REMOTE_BUILD_COMMAND=$(jq -r '.build.remoteBuilds[0].buildCommand' "$CONFIG_FILE")
            REMOTE_GIT_BRANCH=$(jq -r '.build.remoteBuilds[0].gitBranch // "main"' "$CONFIG_FILE")
            REMOTE_GIT_REMOTE=$(jq -r '.build.remoteBuilds[0].gitRemote // "origin"' "$CONFIG_FILE")
        fi
    else
        # 简单的 grep 解析（备用方案）
        GITEA_URL=$(grep -o '"url"[[:space:]]*:[[:space:]]*"[^"]*"' "$CONFIG_FILE" | head -1 | sed 's/.*"\([^"]*\)".*/\1/')
        OWNER=$(grep -o '"owner"[[:space:]]*:[[:space:]]*"[^"]*"' "$CONFIG_FILE" | sed 's/.*"\([^"]*\)".*/\1/')
        REPO=$(grep -o '"repo"[[:space:]]*:[[:space:]]*"[^"]*"' "$CONFIG_FILE" | sed 's/.*"\([^"]*\)".*/\1/')
        GITEA_TOKEN=$(grep -o '"token"[[:space:]]*:[[:space:]]*"[^"]*"' "$CONFIG_FILE" | sed 's/.*"\([^"]*\)".*/\1/')
        AUTO_UPLOAD=$(grep -o '"autoUpload"[[:space:]]*:[[:space:]]*[^,}]*' "$CONFIG_FILE" | sed 's/.*:[[:space:]]*\(.*\)/\1/')
        APP_NAME=$(grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' "$CONFIG_FILE" | tail -1 | sed 's/.*"\([^"]*\)".*/\1/')
        BUILD_COMMAND=$(grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' "$CONFIG_FILE" | sed 's/.*"\([^"]*\)".*/\1/')
        PRIVATE_KEY_PATH=$(grep -o '"privateKeyPath"[[:space:]]*:[[:space:]]*"[^"]*"' "$CONFIG_FILE" | sed 's/.*"\([^"]*\)".*/\1/')
        PRIVATE_KEY_PASSWORD=$(grep -o '"privateKeyPassword"[[:space:]]*:[[:space:]]*"[^"]*"' "$CONFIG_FILE" | sed 's/.*"\([^"]*\)".*/\1/')
    fi
    
    echo "   ✅ 已加载配置"
    echo ""
else
    echo "⚠️  未找到配置文件 $CONFIG_FILE"
    echo ""
fi

# 读取当前版本号
CURRENT_VERSION=""
TAURI_CONF="src-tauri/tauri.conf.json"
PACKAGE_JSON="package.json"

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
    fi
}

# 从参数或交互式输入获取版本号
if [ -z "$1" ]; then
    if [ -n "$CURRENT_VERSION" ] && [ "$CURRENT_VERSION" != "null" ]; then
        echo "💡 当前版本: $CURRENT_VERSION"
        echo ""
        
        # 计算建议版本
        suggest_versions "$CURRENT_VERSION"
        
        if [ -n "$SUGGESTED_PATCH" ]; then
            echo "   建议版本:"
            echo "   [1] 补丁版本 (Patch): $SUGGESTED_PATCH  - 修复 bug"
            echo "   [2] 次版本 (Minor):   $SUGGESTED_MINOR  - 新增功能"
            echo "   [3] 主版本 (Major):   $SUGGESTED_MAJOR  - 重大更新"
            echo "   [0] 自定义版本"
            echo ""
            read -p "📦 请选择版本类型 (1/2/3/0) 或直接输入版本号 [默认: 1]: " VERSION_CHOICE
            
            case "$VERSION_CHOICE" in
                ""|"1")
                    VERSION=$SUGGESTED_PATCH
                    ;;
                "2")
                    VERSION=$SUGGESTED_MINOR
                    ;;
                "3")
                    VERSION=$SUGGESTED_MAJOR
                    ;;
                "0")
                    read -p "   请输入自定义版本号: " VERSION
                    ;;
                *)
                    # 如果直接输入了版本号
                    VERSION=$VERSION_CHOICE
                    ;;
            esac
        else
            read -p "📦 请输入新版本号 (直接回车使用 $CURRENT_VERSION): " VERSION
            if [ -z "$VERSION" ]; then
                VERSION=$CURRENT_VERSION
            fi
        fi
    else
        read -p "📦 请输入版本号 (例如: 0.2.0): " VERSION
    fi
else
    VERSION=$1
fi

# 如果配置文件中没有值，则交互式输入
if [ -z "$GITEA_URL" ] || [ "$GITEA_URL" = "null" ] || [ "$GITEA_URL" = "your-gitea-server.com" ]; then
    if [ -z "$2" ]; then
        read -p "🌐 请输入 Gitea 服务器地址 (例如: https://gitea.example.com): " GITEA_URL
    else
        GITEA_URL=$2
    fi
fi

if [ -z "$OWNER" ] || [ "$OWNER" = "null" ] || [ "$OWNER" = "your-username" ]; then
    if [ -z "$3" ]; then
        read -p "👤 请输入仓库所有者 (owner): " OWNER
    else
        OWNER=$3
    fi
fi

if [ -z "$REPO" ] || [ "$REPO" = "null" ]; then
    if [ -z "$4" ]; then
        read -p "📁 请输入仓库名称 (repo): " REPO
    else
        REPO=$4
    fi
fi

if [ -z "$APP_NAME" ] || [ "$APP_NAME" = "null" ]; then
    APP_NAME="watch-monkey-app"
fi

# 验证输入
if [ -z "$VERSION" ] || [ -z "$GITEA_URL" ] || [ -z "$OWNER" ] || [ -z "$REPO" ]; then
    echo "❌ 错误: 所有参数都是必需的"
    echo ""
    echo "💡 提示: 你可以创建 .updater.config.json 文件来保存配置"
    echo "   或者使用命令行参数: $0 <version> <gitea-url> <owner> <repo>"
    exit 1
fi

echo ""
echo "📋 配置信息:"
echo "   版本: $VERSION"
echo "   应用: $APP_NAME"
echo "   服务器: $GITEA_URL"
echo "   仓库: $OWNER/$REPO"
echo ""

BUNDLE_DIR="src-tauri/target/release/bundle"
RELEASE_URL="$GITEA_URL/$OWNER/$REPO/releases/download/v$VERSION"
PUB_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# URL Token 参数（用于私有仓库）
URL_TOKEN_PARAM=""
if [ -n "$GITEA_TOKEN" ] && [ "$GITEA_TOKEN" != "null" ]; then
    URL_TOKEN_PARAM="?token=$GITEA_TOKEN"
    echo "🔑 检测到 Gitea Token，将在 URL 中添加认证参数"
fi

# 检查是否需要构建或重新构建
NEED_BUILD=0
HAS_EXISTING_BUILD=0

# 检查是否有构建产物
if [ -d "$BUNDLE_DIR" ]; then
    BUILD_COUNT=0
    # Tauri 标准命名格式
    [ -f "$BUNDLE_DIR/macos/${APP_NAME}.app.tar.gz" ] && BUILD_COUNT=$((BUILD_COUNT + 1))
    [ -f "$BUNDLE_DIR/appimage/${APP_NAME}.AppImage" ] && BUILD_COUNT=$((BUILD_COUNT + 1))
    [ -f "$BUNDLE_DIR/nsis/${APP_NAME}-setup.exe" ] && BUILD_COUNT=$((BUILD_COUNT + 1))
    [ -f "$BUNDLE_DIR/msi/${APP_NAME}.msi" ] && BUILD_COUNT=$((BUILD_COUNT + 1))
    
    # 检查是否有带版本号的构建产物
    BUILD_COUNT_VERSIONED=0
    if compgen -G "$BUNDLE_DIR/macos/${APP_NAME}_*.app.tar.gz" > /dev/null 2>&1; then
        BUILD_COUNT_VERSIONED=$((BUILD_COUNT_VERSIONED + 1))
    fi
    if compgen -G "$BUNDLE_DIR/appimage/${APP_NAME}_*.AppImage" > /dev/null 2>&1; then
        BUILD_COUNT_VERSIONED=$((BUILD_COUNT_VERSIONED + 1))
    fi
    if compgen -G "$BUNDLE_DIR/nsis/${APP_NAME}_*-setup.exe" > /dev/null 2>&1; then
        BUILD_COUNT_VERSIONED=$((BUILD_COUNT_VERSIONED + 1))
    fi
    if compgen -G "$BUNDLE_DIR/msi/${APP_NAME}_*.msi" > /dev/null 2>&1; then
        BUILD_COUNT_VERSIONED=$((BUILD_COUNT_VERSIONED + 1))
    fi
    
    if [ $BUILD_COUNT -gt 0 ] || [ $BUILD_COUNT_VERSIONED -gt 0 ]; then
        HAS_EXISTING_BUILD=1
        TOTAL_COUNT=$((BUILD_COUNT + BUILD_COUNT_VERSIONED))
        echo "✅ 找到现有构建产物 ($TOTAL_COUNT 个平台)"
        
        # 显示已有的构建文件
        echo ""
        echo "   已有构建:"
        if [ -f "$BUNDLE_DIR/macos/${APP_NAME}.app.tar.gz" ]; then
            echo "   • macOS: ${APP_NAME}.app.tar.gz"
        fi
        for file in "$BUNDLE_DIR/macos/${APP_NAME}_"*".app.tar.gz"; do
            if [ -f "$file" ]; then
                echo "   • macOS: $(basename "$file")"
            fi
        done
        if [ -f "$BUNDLE_DIR/appimage/${APP_NAME}.AppImage" ]; then
            echo "   • Linux: ${APP_NAME}.AppImage"
        fi
        for file in "$BUNDLE_DIR/appimage/${APP_NAME}_"*".AppImage"; do
            if [ -f "$file" ]; then
                echo "   • Linux: $(basename "$file")"
            fi
        done
        if [ -f "$BUNDLE_DIR/nsis/${APP_NAME}-setup.exe" ]; then
            echo "   • Windows NSIS: ${APP_NAME}-setup.exe"
        fi
        for file in "$BUNDLE_DIR/nsis/${APP_NAME}_"*"-setup.exe"; do
            if [ -f "$file" ]; then
                echo "   • Windows NSIS: $(basename "$file")"
            fi
        done
        if [ -f "$BUNDLE_DIR/msi/${APP_NAME}.msi" ]; then
            echo "   • Windows MSI: ${APP_NAME}.msi"
        fi
        for file in "$BUNDLE_DIR/msi/${APP_NAME}_"*".msi"; do
            if [ -f "$file" ]; then
                echo "   • Windows MSI: $(basename "$file")"
            fi
        done
    fi
fi

# 始终询问用户是否需要构建/重新构建
echo ""
if [ $HAS_EXISTING_BUILD -eq 1 ]; then
    read -p "🔄 是否重新构建应用？(y/N): " REBUILD
    if [[ "$REBUILD" =~ ^[Yy]$ ]]; then
        NEED_BUILD=1
    fi
else
    echo "⚠️  未找到构建产物"
    read -p "🔨 是否现在构建应用? (Y/n): " BUILD_NOW
    BUILD_NOW=${BUILD_NOW:-Y}  # 默认为 Y
    if [[ "$BUILD_NOW" =~ ^[Yy]$ ]]; then
        NEED_BUILD=1
    else
        echo "❌ 错误: 需要先构建应用"
        if [ -n "$BUILD_COMMAND" ] && [ "$BUILD_COMMAND" != "null" ]; then
            echo "💡 请手动运行: $BUILD_COMMAND"
        else
            echo "💡 请先运行: bun run tauri build"
        fi
        exit 1
    fi
fi

# ============================================
# 在构建前先更新版本号
# ============================================
if [ $NEED_BUILD -eq 1 ]; then
    echo ""
    echo "================================================"
    echo "🔄 更新版本号（构建前）"
    echo "================================================"
    echo ""
    
    # 备份原版本号
    BACKUP_VERSION=$CURRENT_VERSION
    
    # 更新 tauri.conf.json
    if [ -f "$TAURI_CONF" ]; then
        echo "📝 更新 $TAURI_CONF 版本号: $CURRENT_VERSION → $VERSION"
        
        if command -v jq &> /dev/null; then
            TMP_FILE=$(mktemp)
            jq --arg version "$VERSION" '.version = $version' "$TAURI_CONF" > "$TMP_FILE"
            mv "$TMP_FILE" "$TAURI_CONF"
            echo "   ✅ 已更新 tauri.conf.json"
        else
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$VERSION\"/" "$TAURI_CONF"
            else
                sed -i "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$VERSION\"/" "$TAURI_CONF"
            fi
            echo "   ✅ 已更新 tauri.conf.json"
        fi
    fi
    
    # 更新 package.json
    if [ -f "$PACKAGE_JSON" ]; then
        echo "📝 更新 $PACKAGE_JSON 版本号: $CURRENT_VERSION → $VERSION"
        
        if command -v jq &> /dev/null; then
            TMP_FILE=$(mktemp)
            jq --arg version "$VERSION" '.version = $version' "$PACKAGE_JSON" > "$TMP_FILE"
            mv "$TMP_FILE" "$PACKAGE_JSON"
            echo "   ✅ 已更新 package.json"
        else
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$VERSION\"/" "$PACKAGE_JSON"
            else
                sed -i "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$VERSION\"/" "$PACKAGE_JSON"
            fi
            echo "   ✅ 已更新 package.json"
        fi
    fi
    
    echo ""
fi

# ============================================
# 远程构建函数
# ============================================
remote_windows_build() {
    echo "================================================"
    echo "  远程 Windows 构建"
    echo "================================================"
    echo ""
    echo "   主机: $REMOTE_HOST:$REMOTE_PORT"
    echo "   用户: $REMOTE_USER"
    echo "   项目路径: $REMOTE_PROJECT_PATH"
    echo ""
    
    # 构建 SSH 命令参数
    SSH_OPTS="-p $REMOTE_PORT"
    SCP_OPTS="-P $REMOTE_PORT"
    
    # 如果配置了密钥认证
    if [ -n "$REMOTE_KEY_PATH" ] && [ "$REMOTE_KEY_PATH" != "null" ] && [ -f "$REMOTE_KEY_PATH" ]; then
        SSH_OPTS="$SSH_OPTS -i $REMOTE_KEY_PATH"
        SCP_OPTS="$SCP_OPTS -i $REMOTE_KEY_PATH"
        echo "   🔑 使用 SSH 密钥认证"
    elif [ -n "$REMOTE_PASSWORD" ] && [ "$REMOTE_PASSWORD" != "null" ]; then
        # 使用 sshpass（需要安装）
        if ! command -v sshpass &> /dev/null; then
            echo "   ⚠️  建议安装 sshpass 以支持密码认证: brew install sshpass"
            echo "   或者配置 SSH 密钥认证"
            return 1
        fi
        SSH_CMD="sshpass -p '$REMOTE_PASSWORD' ssh $SSH_OPTS"
        SCP_CMD="sshpass -p '$REMOTE_PASSWORD' scp $SCP_OPTS"
        echo "   🔐 使用密码认证"
    else
        SSH_CMD="ssh $SSH_OPTS"
        SCP_CMD="scp $SCP_OPTS"
        echo "   🔑 使用 SSH 默认认证"
    fi
    
    echo ""
    echo "1️⃣  使用 Git 同步项目文件到远程主机..."
    echo ""
    
    # 1. 确保本地已提交所有更改
    if [ -n "$(git status --porcelain)" ]; then
        echo "   ⚠️  检测到未提交的更改"
        echo ""
        git status --short
        echo ""
        read -p "   是否自动提交并推送这些更改？(Y/n): " AUTO_COMMIT
        AUTO_COMMIT=${AUTO_COMMIT:-Y}
        
        if [[ "$AUTO_COMMIT" =~ ^[Yy]$ ]]; then
            echo "   📝 提交更改..."
            git add .
            git commit -m "chore: auto commit for remote build v$VERSION" || true
            
            echo "   📤 推送到远程仓库..."
            git push $REMOTE_GIT_REMOTE $REMOTE_GIT_BRANCH
            
            if [ $? -ne 0 ]; then
                echo "   ❌ Git 推送失败"
                return 1
            fi
        else
            echo "   ℹ️  跳过自动提交，将使用远程现有代码"
        fi
    else
        echo "   ✅ 工作区干净，无需提交"
        echo "   📤 推送到远程仓库..."
        git push $REMOTE_GIT_REMOTE $REMOTE_GIT_BRANCH 2>/dev/null || echo "   ℹ️  没有新的提交需要推送"
    fi
    
    echo ""
    echo "   2️⃣  在远程主机上拉取最新代码..."
    
    # 使用 PowerShell + git 命令检查是否是仓库 (更可靠)
    REMOTE_GIT_CHECK="powershell -Command \"cd '$REMOTE_PROJECT_PATH'; if (Test-Path '.git') { git rev-parse --git-dir 2>\\$null; if (\\\$?) { Write-Output 'exists' } else { Write-Output 'not_exists' } } else { Write-Output 'not_exists' }\""
    REMOTE_REPO_STATUS=$(eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"$REMOTE_GIT_CHECK\"" 2>/dev/null | grep -o "exists\|not_exists" | head -1)
    
    echo "   检测结果: [$REMOTE_REPO_STATUS]"
    
    if [ "$REMOTE_REPO_STATUS" = "exists" ]; then
        echo "   ✅ 远程仓库已存在，拉取更新..."
        
        # 获取 Git 远程仓库地址（先从本地获取）
        GIT_REMOTE_URL=$(git remote get-url $REMOTE_GIT_REMOTE 2>/dev/null)
        
        # 如果本地没有获取到，尝试从远程获取
        if [ -z "$GIT_REMOTE_URL" ]; then
            REMOTE_GET_URL="powershell -Command \"cd '$REMOTE_PROJECT_PATH'; git remote get-url $REMOTE_GIT_REMOTE\""
            GIT_REMOTE_URL=$(eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"$REMOTE_GET_URL\"" 2>/dev/null | tr -d '\r\n')
        fi
        
        echo "   📡 Git 远程地址: $GIT_REMOTE_URL"
        
        # 如果是 HTTP(S) URL 且有 Gitea Token，添加认证信息
        if [[ "$GIT_REMOTE_URL" =~ ^https?:// ]] && [ -n "$GITEA_TOKEN" ] && [ "$GITEA_TOKEN" != "null" ]; then
            # 先移除可能已存在的认证信息
            GIT_CLEAN_URL=$(echo "$GIT_REMOTE_URL" | sed 's|://[^@]*@|://|')
            # 添加新的认证信息
            GIT_AUTH_URL=$(echo "$GIT_CLEAN_URL" | sed "s|://|://$GITEA_TOKEN@|")
            echo "   🔐 使用 Gitea Token 认证"
            
            # 更新远程 URL 为带 Token 的版本，并禁用凭证管理器（使用 PowerShell）
            REMOTE_SET_URL="powershell -Command \"cd '$REMOTE_PROJECT_PATH'; git config --unset-all credential.helper; git config credential.helper ''; git remote set-url $REMOTE_GIT_REMOTE '$GIT_AUTH_URL'\""
            SET_URL_OUTPUT=$(eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"$REMOTE_SET_URL\"" 2>&1)
            if [ $? -eq 0 ]; then
                echo "   ✅ 远程 URL 已更新"
                
                # 验证设置
                REMOTE_VERIFY_URL="powershell -Command \"cd '$REMOTE_PROJECT_PATH'; git remote get-url $REMOTE_GIT_REMOTE\""
                VERIFY_URL=$(eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"$REMOTE_VERIFY_URL\"" 2>/dev/null | tr -d '\r\n')
                echo "   🔍 验证 URL: ${VERIFY_URL:0:50}..."
            else
                echo "   ⚠️  更新远程 URL 失败: $SET_URL_OUTPUT"
            fi
        fi
        
        # 远程执行 git pull (修复分支问题)
        # 由于已经设置了带 Token 的 URL，直接拉取即可
        echo "   执行 Git 同步..."
        
        # 步骤1: fetch 远程更新（使用 PowerShell 设置环境变量）
        # PowerShell 能更可靠地设置环境变量并执行 git
        REMOTE_GIT_FETCH="powershell -Command \"cd '$REMOTE_PROJECT_PATH'; \\\$env:GIT_TERMINAL_PROMPT='0'; \\\$env:GIT_ASKPASS='echo'; git -c core.askPass='' -c credential.helper='' fetch $REMOTE_GIT_REMOTE $REMOTE_GIT_BRANCH\""
        echo "   📥 正在 fetch 远程更新 ($REMOTE_GIT_REMOTE/$REMOTE_GIT_BRANCH)..."
        FETCH_OUTPUT=$(eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"$REMOTE_GIT_FETCH\"" 2>&1)
        FETCH_EXIT=$?
        
        # 过滤掉不重要的信息
        FETCH_FILTERED=$(echo "$FETCH_OUTPUT" | grep -v "Unable to persist credentials" | grep -v "warning: redirecting to" | grep -v "^$")
        
        if [ $FETCH_EXIT -ne 0 ]; then
            # 检查是否是认证问题
            if echo "$FETCH_OUTPUT" | grep -qi "could not read Username\|authentication\|access denied"; then
                echo "   ❌ Fetch 失败: 认证错误"
                echo "   💡 尝试重新设置远程 URL..."
                
                # 再次确认远程 URL 包含 Token
                REMOTE_VERIFY_URL="cd \"$REMOTE_PROJECT_PATH\" && git remote get-url $REMOTE_GIT_REMOTE"
                CURRENT_REMOTE_URL=$(eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"$REMOTE_VERIFY_URL\"" 2>/dev/null | tr -d '\r\n')
                echo "   当前远程 URL: $CURRENT_REMOTE_URL"
                
                # 如果 URL 中没有 Token，说明设置失败
                if [[ ! "$CURRENT_REMOTE_URL" =~ @gitea\.watchmonkey\.icu ]]; then
                    echo "   ⚠️  远程 URL 未包含认证信息，无法继续"
                    return 1
                fi
            fi
            
            echo "   ❌ Fetch 失败:"
            echo "$FETCH_FILTERED" | head -10
            echo "   💡 提示: 请检查网络连接和 Token 权限"
            return 1
        elif [ -n "$FETCH_FILTERED" ]; then
            echo "   ⚠️  Fetch 输出:"
            echo "$FETCH_FILTERED" | head -5
        else
            echo "   ✅ Fetch 完成"
        fi
        
        # 步骤2: 切换到正确的分支（先检查是否存在）
        REMOTE_GIT_CHECKOUT="powershell -Command \"cd '$REMOTE_PROJECT_PATH'; if (git show-ref --verify --quiet refs/heads/$REMOTE_GIT_BRANCH) { git checkout $REMOTE_GIT_BRANCH } else { git checkout -b $REMOTE_GIT_BRANCH $REMOTE_GIT_REMOTE/$REMOTE_GIT_BRANCH }\""
        echo "   🔀 正在切换分支 $REMOTE_GIT_BRANCH..."
        eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"$REMOTE_GIT_CHECKOUT\"" 2>&1 | grep -v "Unable to persist credentials" || true
        
        # 步骤3: 显示当前和目标提交
        REMOTE_GIT_SHOW_CURRENT="powershell -Command \"cd '$REMOTE_PROJECT_PATH'; git rev-parse --short HEAD\""
        CURRENT_COMMIT=$(eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"$REMOTE_GIT_SHOW_CURRENT\"" 2>/dev/null | tr -d '\r\n')
        
        REMOTE_GIT_SHOW_TARGET="powershell -Command \"cd '$REMOTE_PROJECT_PATH'; git rev-parse --short $REMOTE_GIT_REMOTE/$REMOTE_GIT_BRANCH\""
        TARGET_COMMIT=$(eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"$REMOTE_GIT_SHOW_TARGET\"" 2>/dev/null | tr -d '\r\n')
        
        echo "   📍 当前提交: $CURRENT_COMMIT"
        echo "   📍 目标提交: $TARGET_COMMIT"
        
        # 步骤4: 重置到远程最新状态
        if [ "$CURRENT_COMMIT" != "$TARGET_COMMIT" ]; then
            REMOTE_GIT_RESET="powershell -Command \"cd '$REMOTE_PROJECT_PATH'; git reset --hard $REMOTE_GIT_REMOTE/$REMOTE_GIT_BRANCH\""
            echo "   🔄 正在重置到最新版本..."
            RESET_OUTPUT=$(eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"$REMOTE_GIT_RESET\"" 2>&1)
            RESET_EXIT=$?
            
            if [ $RESET_EXIT -eq 0 ]; then
                # 验证重置后的提交
                REMOTE_GIT_VERIFY="powershell -Command \"cd '$REMOTE_PROJECT_PATH'; git rev-parse --short HEAD\""
                FINAL_COMMIT=$(eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"$REMOTE_GIT_VERIFY\"" 2>/dev/null | tr -d '\r\n')
                
                if [ "$FINAL_COMMIT" = "$TARGET_COMMIT" ]; then
                    echo "   ✅ 已重置到 $FINAL_COMMIT"
                else
                    echo "   ⚠️  重置后的提交 ($FINAL_COMMIT) 与目标提交 ($TARGET_COMMIT) 不一致"
                fi
            else
                echo "   ❌ 重置失败: $RESET_OUTPUT"
                return 1
            fi
        else
            echo "   ✅ 已经是最新版本"
        fi
        
        # 显示最终的提交信息
        REMOTE_GIT_LOG="powershell -Command \"cd '$REMOTE_PROJECT_PATH'; git log -1 --oneline\""
        FINAL_LOG=$(eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"$REMOTE_GIT_LOG\"" 2>/dev/null | head -1)
        echo "   📝 最终提交: $FINAL_LOG"
        
        echo "   ✅ Git 代码同步成功"
    else
        echo "   📦 远程仓库不存在，执行首次克隆..."
        
        # 获取 Git 远程仓库地址
        GIT_REMOTE_URL=$(git remote get-url $REMOTE_GIT_REMOTE 2>/dev/null)
        
        if [ -z "$GIT_REMOTE_URL" ]; then
            echo "   ❌ 无法获取 Git 远程仓库地址"
            return 1
        fi
        
        echo "   仓库地址: $GIT_REMOTE_URL"
        
        # 如果是 HTTP(S) URL 且有 Gitea Token，添加认证信息
        if [[ "$GIT_REMOTE_URL" =~ ^https?:// ]] && [ -n "$GITEA_TOKEN" ] && [ "$GITEA_TOKEN" != "null" ]; then
            # 在 URL 中嵌入 Token 进行认证
            # 格式: https://token@gitea.example.com/user/repo.git
            GIT_AUTH_URL=$(echo "$GIT_REMOTE_URL" | sed "s|://|://$GITEA_TOKEN@|")
            echo "   🔐 使用 Gitea Token 认证"
        else
            GIT_AUTH_URL="$GIT_REMOTE_URL"
        fi
        
        # 检查远程目录是否已存在 (Windows 兼容)
        REMOTE_DIR_CHECK="if exist \"$REMOTE_PROJECT_PATH\" (echo exists) else (echo not_exists)"
        REMOTE_DIR_STATUS=$(eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"$REMOTE_DIR_CHECK\"" 2>/dev/null | tr -d '\r\n ')
        
        if [ "$REMOTE_DIR_STATUS" = "exists" ]; then
            echo "   ⚠️  远程目录已存在: $REMOTE_PROJECT_PATH"
            echo ""
            read -p "   目录已存在，是否删除并重新克隆？(y/N): " RECREATE_DIR
            
            if [[ "$RECREATE_DIR" =~ ^[Yy]$ ]]; then
                echo "   🗑️  删除现有目录..."
                REMOTE_RM_CMD="rmdir /s /q \"$REMOTE_PROJECT_PATH\""
                eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"$REMOTE_RM_CMD\""
            else
                echo "   ℹ️  跳过克隆，将直接使用现有仓库"
                echo ""
                echo "   提示: 脚本将继续使用现有仓库进行构建"
                echo ""
                # 不执行克隆，直接返回继续后续流程
                return 0
            fi
        fi
        
        # 在远程克隆仓库 (Windows 环境，禁用凭证管理器和交互式提示)
        REMOTE_GIT_CLONE="set GIT_TERMINAL_PROMPT=0 && git -c credential.helper= clone -b $REMOTE_GIT_BRANCH $GIT_AUTH_URL \"$REMOTE_PROJECT_PATH\""
        eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"$REMOTE_GIT_CLONE\""
        
        if [ $? -eq 0 ]; then
            echo "   ✅ Git 仓库克隆成功"
            
            # 首次克隆后需要安装依赖
            echo ""
            echo "   📦 首次构建，安装依赖..."
            REMOTE_INSTALL_CMD="cd \"$REMOTE_PROJECT_PATH\" && bun install"
            eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"$REMOTE_INSTALL_CMD\""
        else
            echo "   ❌ Git clone 失败"
            echo ""
            echo "   💡 可能的原因:"
            echo "      1. 远程 Windows 机器无法访问 Git 仓库"
            echo "      2. Git 仓库需要认证但 Token 未配置"
            echo "      3. 远程目录已存在且不为空"
            echo ""
            echo "   💡 解决方案:"
            echo "      - 确保 Windows 机器可以访问: $GIT_REMOTE_URL"
            echo "      - 或在 Windows 上手动克隆: git clone $GIT_REMOTE_URL"
            return 1
        fi
    fi
    
    # 同步签名密钥（Git 不会跟踪 .tauri/*.key）
    echo ""
    echo "   3️⃣  同步签名密钥..."
    REMOTE_TAURI_DIR="${REMOTE_PROJECT_PATH}/.tauri"
    
    # 创建 .tauri 目录（Windows 兼容）
    eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"if not exist \\\"$REMOTE_TAURI_DIR\\\" mkdir \\\"$REMOTE_TAURI_DIR\\\"\"" 2>/dev/null || true
    
    # 上传签名密钥
    if [ -f "$PRIVATE_KEY_PATH" ]; then
        eval "$SCP_CMD \"$PRIVATE_KEY_PATH\" $REMOTE_USER@$REMOTE_HOST:\"$REMOTE_TAURI_DIR/watch-monkey.key\""
        if [ $? -eq 0 ]; then
            echo "   ✅ 签名密钥同步成功"
        else
            echo "   ⚠️  签名密钥同步失败"
        fi
    fi
    
    echo ""
    echo "4️⃣  在远程主机执行构建..."
    echo ""
    
    # 转义构建命令中的引号和特殊字符
    ESCAPED_BUILD_CMD="${REMOTE_BUILD_COMMAND//\"/\\\"}"
    # 转义 $ 符号以防止在 bash 中被解析
    ESCAPED_BUILD_CMD="${ESCAPED_BUILD_CMD//\$/\\\$}"
    
    # 在远程主机执行构建
    echo "   执行: $REMOTE_BUILD_COMMAND"
    echo ""
    eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"$ESCAPED_BUILD_CMD\""
    
    if [ $? -ne 0 ]; then
        echo ""
        echo "   ❌ 远程构建失败"
        return 1
    fi
    
    echo ""
    echo "   ✅ 远程构建成功"
    echo ""
    echo "5️⃣  上传构建产物到 Gitea..."
    echo ""
    
    # 构建路径
    REMOTE_NSIS_PATH="${REMOTE_PROJECT_PATH}/src-tauri/target/release/bundle/nsis"
    REMOTE_MSI_PATH="${REMOTE_PROJECT_PATH}/src-tauri/target/release/bundle/msi"
    
    # API 基础 URL
    API_BASE="${GITEA_URL}/api/v1"
    
    # 在远程 Windows 上创建上传脚本
    UPLOAD_SCRIPT_PATH="C:/Users/$REMOTE_USER/Desktop/gitea-upload-temp.ps1"
    
    # 生成 PowerShell 上传脚本
    cat > /tmp/gitea-upload.ps1 << 'UPLOAD_SCRIPT_EOF'
param(
    [string]$GiteaUrl,
    [string]$Token,
    [string]$Owner,
    [string]$Repo,
    [string]$Version,
    [string]$NsisPath,
    [string]$MsiPath
)

$ErrorActionPreference = "Stop"
$ApiBase = "$GiteaUrl/api/v1"
$Headers = @{ "Authorization" = "token $Token" }

# 检查或创建 Release
Write-Host "   📦 检查 Release v$Version..."
$ReleaseUrl = "$ApiBase/repos/$Owner/$Repo/releases/tags/v$Version"
$Release = $null

try {
    $Release = Invoke-RestMethod -Uri $ReleaseUrl -Headers $Headers -Method Get
    Write-Host "   ✅ Release 已存在 (ID: $($Release.id))"
} catch {
    Write-Host "   📝 创建新 Release..."
    $CreateData = @{
        tag_name = "v$Version"
        name = "v$Version"
        body = "Release v$Version - Windows Build"
        draft = $false
        prerelease = $false
    } | ConvertTo-Json
    
    $Release = Invoke-RestMethod -Uri "$ApiBase/repos/$Owner/$Repo/releases" `
        -Headers $Headers `
        -Method Post `
        -Body $CreateData `
        -ContentType "application/json"
    Write-Host "   ✅ Release 创建成功 (ID: $($Release.id))"
}

$ReleaseId = $Release.id

# 上传文件函数
function Upload-File {
    param([string]$FilePath)
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "   ⚠️  文件不存在: $FilePath"
        return $null
    }
    
    $FileName = Split-Path $FilePath -Leaf
    $FileSize = (Get-Item $FilePath).Length
    Write-Host "   📤 上传 $FileName ($([math]::Round($FileSize/1MB, 2)) MB)..."
    
    # 检查文件是否已存在
    $Assets = Invoke-RestMethod -Uri "$ApiBase/repos/$Owner/$Repo/releases/$ReleaseId/assets" -Headers $Headers
    $ExistingAsset = $Assets | Where-Object { $_.name -eq $FileName }
    
    if ($ExistingAsset) {
        Write-Host "      删除已存在的文件..."
        Invoke-RestMethod -Uri "$ApiBase/repos/$Owner/$Repo/releases/$ReleaseId/assets/$($ExistingAsset.id)" `
            -Headers $Headers `
            -Method Delete | Out-Null
    }
    
    # 上传文件
    $UploadUrl = "$ApiBase/repos/$Owner/$Repo/releases/$ReleaseId/assets?name=$FileName"
    $FileBytes = [System.IO.File]::ReadAllBytes($FilePath)
    
    $Response = Invoke-RestMethod -Uri $UploadUrl `
        -Headers $Headers `
        -Method Post `
        -Body $FileBytes `
        -ContentType "application/octet-stream"
    
    Write-Host "      ✅ 上传成功"
    return @{
        name = $FileName
        url = $Response.browser_download_url
        size = $FileSize
    }
}

# 收集所有需要上传的文件
$Files = @()
$Files += Get-ChildItem -Path $NsisPath -Filter "*-setup.exe*" -File
$Files += Get-ChildItem -Path $MsiPath -Filter "*.msi*" -File

# 上传所有文件并收集信息
$UploadedFiles = @()
foreach ($File in $Files) {
    $Result = Upload-File -FilePath $File.FullName
    if ($Result) {
        $UploadedFiles += $Result
    }
}

# 输出 JSON 格式的结果（用于本地解析）
Write-Host ""
Write-Host "UPLOAD_RESULT_JSON_START"
$UploadedFiles | ConvertTo-Json -Depth 10
Write-Host "UPLOAD_RESULT_JSON_END"
UPLOAD_SCRIPT_EOF

    # 上传脚本到远程（使用 base64 编码避免转义问题）
    echo "   📝 准备上传脚本..."
    SCRIPT_BASE64=$(base64 < /tmp/gitea-upload.ps1)
    
    # 在远程解码并保存脚本
    DECODE_CMD="powershell -Command \"\$bytes = [System.Convert]::FromBase64String('$SCRIPT_BASE64'); [System.IO.File]::WriteAllBytes('$UPLOAD_SCRIPT_PATH', \$bytes)\""
    eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"$DECODE_CMD\"" 2>/dev/null
    
    if [ $? -ne 0 ]; then
        echo "   ❌ 脚本上传失败"
        rm -f /tmp/gitea-upload.ps1
        return 1
    fi
    
    # 执行上传脚本
    echo "   🚀 执行上传..."
    UPLOAD_OUTPUT=$(eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"powershell -ExecutionPolicy Bypass -File '$UPLOAD_SCRIPT_PATH' -GiteaUrl '$GITEA_URL' -Token '$GITEA_TOKEN' -Owner '$OWNER' -Repo '$REPO' -Version '$VERSION' -NsisPath '$REMOTE_NSIS_PATH' -MsiPath '$REMOTE_MSI_PATH'\"" 2>&1)
    UPLOAD_EXIT=$?
    
    # 显示上传过程
    echo "$UPLOAD_OUTPUT" | grep -v "UPLOAD_RESULT_JSON"
    
    # 清理远程临时脚本
    eval "$SSH_CMD $REMOTE_USER@$REMOTE_HOST \"del '$UPLOAD_SCRIPT_PATH' 2>nul\"" 2>/dev/null || true
    rm -f /tmp/gitea-upload.ps1
    
    if [ $UPLOAD_EXIT -eq 0 ]; then
        # 解析上传结果
        UPLOAD_JSON=$(echo "$UPLOAD_OUTPUT" | sed -n '/UPLOAD_RESULT_JSON_START/,/UPLOAD_RESULT_JSON_END/p' | grep -v "UPLOAD_RESULT_JSON")
        
        if [ -z "$UPLOAD_JSON" ] || [ "$UPLOAD_JSON" = "null" ]; then
            echo ""
            echo "   ⚠️  未获取到上传结果信息"
            echo "   💡  文件可能已上传，但无法解析返回数据"
            return 1
        fi
        
        # 保存到临时文件供后续使用
        echo "$UPLOAD_JSON" > /tmp/windows-upload-result.json
        
        echo ""
        echo "   ✅ Windows 构建产物上传成功"
        echo "   📊 上传结果已保存"
        return 0
    else
        echo ""
        echo "   ❌ Windows 构建产物上传失败"
        echo "   💡  请检查网络连接和 Gitea Token 权限"
        return 1
    fi
}

# ============================================
# 开始构建
# ============================================
if [ $NEED_BUILD -eq 1 ]; then
    # 检查是否配置了构建命令
    if [ -z "$BUILD_COMMAND" ] || [ "$BUILD_COMMAND" = "null" ]; then
        echo "❌ 错误: 未配置构建命令"
        echo "💡 请在 .updater.config.json 中配置 build.command"
        echo "💡 或者手动运行: bun run tauri build"
        
        # 恢复版本号
        echo ""
        echo "🔄 恢复版本号..."
        if [ -f "$TAURI_CONF" ] && [ -n "$BACKUP_VERSION" ]; then
            if command -v jq &> /dev/null; then
                TMP_FILE=$(mktemp)
                jq --arg version "$BACKUP_VERSION" '.version = $version' "$TAURI_CONF" > "$TMP_FILE"
                mv "$TMP_FILE" "$TAURI_CONF"
            else
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    sed -i '' "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$BACKUP_VERSION\"/" "$TAURI_CONF"
                else
                    sed -i "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$BACKUP_VERSION\"/" "$TAURI_CONF"
                fi
            fi
        fi
        if [ -f "$PACKAGE_JSON" ] && [ -n "$BACKUP_VERSION" ]; then
            if command -v jq &> /dev/null; then
                TMP_FILE=$(mktemp)
                jq --arg version "$BACKUP_VERSION" '.version = $version' "$PACKAGE_JSON" > "$TMP_FILE"
                mv "$TMP_FILE" "$PACKAGE_JSON"
            else
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    sed -i '' "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$BACKUP_VERSION\"/" "$PACKAGE_JSON"
                else
                    sed -i "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$BACKUP_VERSION\"/" "$PACKAGE_JSON"
                fi
            fi
        fi
        exit 1
    fi
    
    echo ""
    echo "================================================"
    echo "  开始构建应用..."
    echo "================================================"
    echo ""
    
    # 设置签名环境变量
    if [ -n "$PRIVATE_KEY_PATH" ] && [ "$PRIVATE_KEY_PATH" != "null" ] && [ -f "$PRIVATE_KEY_PATH" ]; then
        echo "🔑 设置签名密钥: $PRIVATE_KEY_PATH"
        export TAURI_SIGNING_PRIVATE_KEY=$(cat "$PRIVATE_KEY_PATH")
        
        if [ -n "$PRIVATE_KEY_PASSWORD" ] && [ "$PRIVATE_KEY_PASSWORD" != "null" ]; then
            export TAURI_SIGNING_PRIVATE_KEY_PASSWORD="$PRIVATE_KEY_PASSWORD"
        fi
        echo ""
    else
        echo "⚠️  警告: 未找到签名密钥，构建将不会生成签名文件"
        echo "💡 自动更新功能需要签名文件才能正常工作"
        echo ""
        read -p "是否继续构建？(y/N): " CONTINUE_BUILD
        if [[ ! "$CONTINUE_BUILD" =~ ^[Yy]$ ]]; then
            echo "❌ 已取消构建"
            
            # 恢复版本号
            echo ""
            echo "🔄 恢复版本号..."
            if [ -f "$TAURI_CONF" ] && [ -n "$BACKUP_VERSION" ]; then
                if command -v jq &> /dev/null; then
                    TMP_FILE=$(mktemp)
                    jq --arg version "$BACKUP_VERSION" '.version = $version' "$TAURI_CONF" > "$TMP_FILE"
                    mv "$TMP_FILE" "$TAURI_CONF"
                else
                    if [[ "$OSTYPE" == "darwin"* ]]; then
                        sed -i '' "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$BACKUP_VERSION\"/" "$TAURI_CONF"
                    else
                        sed -i "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$BACKUP_VERSION\"/" "$TAURI_CONF"
                    fi
                fi
            fi
            if [ -f "$PACKAGE_JSON" ] && [ -n "$BACKUP_VERSION" ]; then
                if command -v jq &> /dev/null; then
                    TMP_FILE=$(mktemp)
                    jq --arg version "$BACKUP_VERSION" '.version = $version' "$PACKAGE_JSON" > "$TMP_FILE"
                    mv "$TMP_FILE" "$PACKAGE_JSON"
                else
                    if [[ "$OSTYPE" == "darwin"* ]]; then
                        sed -i '' "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$BACKUP_VERSION\"/" "$PACKAGE_JSON"
                    else
                        sed -i "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$BACKUP_VERSION\"/" "$PACKAGE_JSON"
                    fi
                fi
            fi
            exit 1
        fi
        echo ""
    fi
    
    # 执行本地构建命令
    echo "📦 执行本地构建命令: $BUILD_COMMAND"
    echo ""
    eval $BUILD_COMMAND
    
    BUILD_EXIT_CODE=$?
    echo ""
    
    if [ $BUILD_EXIT_CODE -ne 0 ]; then
        echo "❌ 本地构建失败，退出码: $BUILD_EXIT_CODE"
        
        # 恢复版本号
        echo ""
        echo "🔄 恢复版本号..."
        if [ -f "$TAURI_CONF" ] && [ -n "$BACKUP_VERSION" ]; then
            if command -v jq &> /dev/null; then
                TMP_FILE=$(mktemp)
                jq --arg version "$BACKUP_VERSION" '.version = $version' "$TAURI_CONF" > "$TMP_FILE"
                mv "$TMP_FILE" "$TAURI_CONF"
                echo "   ✅ 已恢复 tauri.conf.json 到版本 $BACKUP_VERSION"
            else
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    sed -i '' "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$BACKUP_VERSION\"/" "$TAURI_CONF"
                else
                    sed -i "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$BACKUP_VERSION\"/" "$TAURI_CONF"
                fi
                echo "   ✅ 已恢复 tauri.conf.json 到版本 $BACKUP_VERSION"
            fi
        fi
        if [ -f "$PACKAGE_JSON" ] && [ -n "$BACKUP_VERSION" ]; then
            if command -v jq &> /dev/null; then
                TMP_FILE=$(mktemp)
                jq --arg version "$BACKUP_VERSION" '.version = $version' "$PACKAGE_JSON" > "$TMP_FILE"
                mv "$TMP_FILE" "$PACKAGE_JSON"
                echo "   ✅ 已恢复 package.json 到版本 $BACKUP_VERSION"
            else
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    sed -i '' "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$BACKUP_VERSION\"/" "$PACKAGE_JSON"
                else
                    sed -i "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$BACKUP_VERSION\"/" "$PACKAGE_JSON"
                fi
                echo "   ✅ 已恢复 package.json 到版本 $BACKUP_VERSION"
            fi
        fi
        exit 1
    fi
    
    echo "✅ 本地构建成功！"
    echo ""
    
    # 检查是否需要远程构建 Windows 版本
    if [ "$REMOTE_BUILDS_ENABLED" = "true" ]; then
        echo ""
        read -p "🪟 是否在远程 Windows 主机上构建 Windows 版本？(Y/n): " BUILD_REMOTE_WINDOWS
        BUILD_REMOTE_WINDOWS=${BUILD_REMOTE_WINDOWS:-Y}
        
        if [[ "$BUILD_REMOTE_WINDOWS" =~ ^[Yy]$ ]]; then
            echo ""
            remote_windows_build
            
            if [ $? -ne 0 ]; then
                echo ""
                echo "⚠️  远程 Windows 构建失败，将仅使用本地构建产物"
                echo ""
            fi
        fi
    fi
fi

echo "🔍 正在扫描构建产物..."
echo ""

# 读取签名文件
read_sig() {
    local file=$1
    if [ -f "$file" ]; then
        cat "$file"
    else
        echo ""
    fi
}

# 获取当前系统架构
CURRENT_ARCH=$(uname -m)
if [ "$CURRENT_ARCH" = "arm64" ]; then
    CURRENT_ARCH="aarch64"
elif [ "$CURRENT_ARCH" = "x86_64" ]; then
    CURRENT_ARCH="x64"
fi

# 重命名构建文件以包含版本号和架构信息
rename_build_files() {
    local renamed=0
    
    # macOS 构建文件
    if [ -f "$BUNDLE_DIR/macos/${APP_NAME}.app.tar.gz" ]; then
        local new_name="${APP_NAME}_${VERSION}_${CURRENT_ARCH}.app.tar.gz"
        echo "📝 重命名 macOS 构建文件:"
        echo "   ${APP_NAME}.app.tar.gz → $new_name"
        mv "$BUNDLE_DIR/macos/${APP_NAME}.app.tar.gz" "$BUNDLE_DIR/macos/$new_name"
        
        if [ -f "$BUNDLE_DIR/macos/${APP_NAME}.app.tar.gz.sig" ]; then
            mv "$BUNDLE_DIR/macos/${APP_NAME}.app.tar.gz.sig" "$BUNDLE_DIR/macos/$new_name.sig"
            echo "   ${APP_NAME}.app.tar.gz.sig → $new_name.sig"
        fi
        renamed=1
    fi
    
    # Linux 构建文件 (AppImage)
    if [ -f "$BUNDLE_DIR/appimage/${APP_NAME}.AppImage" ]; then
        local new_name="${APP_NAME}_${VERSION}_amd64.AppImage"
        echo "📝 重命名 Linux 构建文件:"
        echo "   ${APP_NAME}.AppImage → $new_name"
        mv "$BUNDLE_DIR/appimage/${APP_NAME}.AppImage" "$BUNDLE_DIR/appimage/$new_name"
        
        if [ -f "$BUNDLE_DIR/appimage/${APP_NAME}.AppImage.sig" ]; then
            mv "$BUNDLE_DIR/appimage/${APP_NAME}.AppImage.sig" "$BUNDLE_DIR/appimage/$new_name.sig"
            echo "   ${APP_NAME}.AppImage.sig → $new_name.sig"
        fi
        renamed=1
    fi
    
    # Windows NSIS 构建文件
    if [ -f "$BUNDLE_DIR/nsis/${APP_NAME}-setup.exe" ]; then
        local new_name="${APP_NAME}_${VERSION}_x64-setup.exe"
        echo "📝 重命名 Windows NSIS 构建文件:"
        echo "   ${APP_NAME}-setup.exe → $new_name"
        mv "$BUNDLE_DIR/nsis/${APP_NAME}-setup.exe" "$BUNDLE_DIR/nsis/$new_name"
        
        if [ -f "$BUNDLE_DIR/nsis/${APP_NAME}-setup.exe.sig" ]; then
            mv "$BUNDLE_DIR/nsis/${APP_NAME}-setup.exe.sig" "$BUNDLE_DIR/nsis/$new_name.sig"
            echo "   ${APP_NAME}-setup.exe.sig → $new_name.sig"
        fi
        renamed=1
    fi
    
    # Windows MSI 构建文件
    if [ -f "$BUNDLE_DIR/msi/${APP_NAME}.msi" ]; then
        local new_name="${APP_NAME}_${VERSION}_x64.msi"
        echo "📝 重命名 Windows MSI 构建文件:"
        echo "   ${APP_NAME}.msi → $new_name"
        mv "$BUNDLE_DIR/msi/${APP_NAME}.msi" "$BUNDLE_DIR/msi/$new_name"
        
        if [ -f "$BUNDLE_DIR/msi/${APP_NAME}.msi.sig" ]; then
            mv "$BUNDLE_DIR/msi/${APP_NAME}.msi.sig" "$BUNDLE_DIR/msi/$new_name.sig"
            echo "   ${APP_NAME}.msi.sig → $new_name.sig"
        fi
        renamed=1
    fi
    
    if [ $renamed -eq 1 ]; then
        echo ""
    fi
}

# 重命名构建文件
rename_build_files

# 获取更新说明
echo ""
echo "📝 请输入更新说明 (输入完成后按 Ctrl+D):"
NOTES=$(cat)

if [ -z "$NOTES" ]; then
    NOTES="版本 $VERSION 更新"
fi

# 创建 JSON
cat > latest.json <<EOF
{
  "version": "$VERSION",
  "notes": "$NOTES",
  "pub_date": "$PUB_DATE",
  "platforms": {
EOF

PLATFORM_COUNT=0

# macOS ARM64 - 尝试多种命名格式
MACOS_ARM_SIG=""
if [ -f "$BUNDLE_DIR/macos/${APP_NAME}.app.tar.gz.sig" ]; then
    MACOS_ARM_SIG=$(read_sig "$BUNDLE_DIR/macos/${APP_NAME}.app.tar.gz.sig")
    MACOS_ARM_FILE="${APP_NAME}.app.tar.gz"
elif [ -f "$BUNDLE_DIR/macos/${APP_NAME}_${VERSION}_aarch64.app.tar.gz.sig" ]; then
    MACOS_ARM_SIG=$(read_sig "$BUNDLE_DIR/macos/${APP_NAME}_${VERSION}_aarch64.app.tar.gz.sig")
    MACOS_ARM_FILE="${APP_NAME}_${VERSION}_aarch64.app.tar.gz"
fi

if [ -n "$MACOS_ARM_SIG" ]; then
    [ $PLATFORM_COUNT -gt 0 ] && echo "," >> latest.json
    cat >> latest.json <<EOF
    "darwin-aarch64": {
      "signature": "$MACOS_ARM_SIG",
      "url": "$RELEASE_URL/$MACOS_ARM_FILE$URL_TOKEN_PARAM"
    }
EOF
    echo "  ✅ 找到 macOS ARM64 构建: $MACOS_ARM_FILE"
    PLATFORM_COUNT=$((PLATFORM_COUNT + 1))
fi

# macOS x64
MACOS_X64_SIG=""
if [ -f "$BUNDLE_DIR/macos/${APP_NAME}_${VERSION}_x64.app.tar.gz.sig" ]; then
    MACOS_X64_SIG=$(read_sig "$BUNDLE_DIR/macos/${APP_NAME}_${VERSION}_x64.app.tar.gz.sig")
    MACOS_X64_FILE="${APP_NAME}_${VERSION}_x64.app.tar.gz"
elif [ -f "$BUNDLE_DIR/macos/${APP_NAME}_x64.app.tar.gz.sig" ]; then
    MACOS_X64_SIG=$(read_sig "$BUNDLE_DIR/macos/${APP_NAME}_x64.app.tar.gz.sig")
    MACOS_X64_FILE="${APP_NAME}_x64.app.tar.gz"
fi

if [ -n "$MACOS_X64_SIG" ]; then
    [ $PLATFORM_COUNT -gt 0 ] && echo "," >> latest.json
    cat >> latest.json <<EOF
    "darwin-x86_64": {
      "signature": "$MACOS_X64_SIG",
      "url": "$RELEASE_URL/$MACOS_X64_FILE$URL_TOKEN_PARAM"
    }
EOF
    echo "  ✅ 找到 macOS x64 构建: $MACOS_X64_FILE"
    PLATFORM_COUNT=$((PLATFORM_COUNT + 1))
fi

# Linux x64 (AppImage)
LINUX_SIG=""
if [ -f "$BUNDLE_DIR/appimage/${APP_NAME}_${VERSION}_amd64.AppImage.sig" ]; then
    LINUX_SIG=$(read_sig "$BUNDLE_DIR/appimage/${APP_NAME}_${VERSION}_amd64.AppImage.sig")
    LINUX_FILE="${APP_NAME}_${VERSION}_amd64.AppImage"
elif [ -f "$BUNDLE_DIR/appimage/${APP_NAME}.AppImage.sig" ]; then
    LINUX_SIG=$(read_sig "$BUNDLE_DIR/appimage/${APP_NAME}.AppImage.sig")
    LINUX_FILE="${APP_NAME}.AppImage"
fi

if [ -n "$LINUX_SIG" ]; then
    [ $PLATFORM_COUNT -gt 0 ] && echo "," >> latest.json
    cat >> latest.json <<EOF
    "linux-x86_64": {
      "signature": "$LINUX_SIG",
      "url": "$RELEASE_URL/$LINUX_FILE$URL_TOKEN_PARAM"
    }
EOF
    echo "  ✅ 找到 Linux x64 构建: $LINUX_FILE"
    PLATFORM_COUNT=$((PLATFORM_COUNT + 1))
fi

# Windows x64 (NSIS) - Tauri 更新器优先使用 NSIS
WINDOWS_SIG=""
WINDOWS_FILE=""
WINDOWS_MSI_SIG=""
WINDOWS_MSI_FILE=""

# 检查是否有远程上传的 Windows 文件信息
if [ -f "/tmp/windows-upload-result.json" ] && command -v jq &> /dev/null; then
    echo "  🌐 使用远程 Windows 构建..."
    
    # 从上传结果中提取 NSIS 文件
    NSIS_URL=$(jq -r '.[] | select(.name | contains("-setup.exe") and (contains(".sig") | not)) | .url' /tmp/windows-upload-result.json 2>/dev/null | head -1)
    NSIS_SIG_URL=$(jq -r '.[] | select(.name | contains("-setup.exe.sig")) | .url' /tmp/windows-upload-result.json 2>/dev/null | head -1)
    
    if [ -n "$NSIS_URL" ] && [ -n "$NSIS_SIG_URL" ] && [ "$NSIS_URL" != "null" ] && [ "$NSIS_SIG_URL" != "null" ]; then
        # 下载签名文件到本地以读取签名
        TEMP_SIG="/tmp/nsis-temp.sig"
        curl -s -H "Authorization: token $GITEA_TOKEN" "$NSIS_SIG_URL" -o "$TEMP_SIG" 2>/dev/null
        
        if [ -f "$TEMP_SIG" ] && [ -s "$TEMP_SIG" ]; then
            WINDOWS_SIG=$(read_sig "$TEMP_SIG")
            WINDOWS_FILE=$(basename "$NSIS_URL")
            rm -f "$TEMP_SIG"
            echo "      NSIS: $WINDOWS_FILE"
        else
            echo "      ⚠️  无法下载 NSIS 签名文件"
            rm -f "$TEMP_SIG"
        fi
    fi
    
    # 从上传结果中提取 MSI 文件
    MSI_URL=$(jq -r '.[] | select(.name | contains(".msi") and (contains(".sig") | not)) | .url' /tmp/windows-upload-result.json 2>/dev/null | head -1)
    MSI_SIG_URL=$(jq -r '.[] | select(.name | contains(".msi.sig")) | .url' /tmp/windows-upload-result.json 2>/dev/null | head -1)
    
    if [ -n "$MSI_URL" ] && [ -n "$MSI_SIG_URL" ] && [ "$MSI_URL" != "null" ] && [ "$MSI_SIG_URL" != "null" ]; then
        TEMP_MSI_SIG="/tmp/msi-temp.sig"
        curl -s -H "Authorization: token $GITEA_TOKEN" "$MSI_SIG_URL" -o "$TEMP_MSI_SIG" 2>/dev/null
        
        if [ -f "$TEMP_MSI_SIG" ] && [ -s "$TEMP_MSI_SIG" ]; then
            WINDOWS_MSI_SIG=$(read_sig "$TEMP_MSI_SIG")
            WINDOWS_MSI_FILE=$(basename "$MSI_URL")
            rm -f "$TEMP_MSI_SIG"
            echo "      MSI: $WINDOWS_MSI_FILE"
        else
            echo "      ⚠️  无法下载 MSI 签名文件"
            rm -f "$TEMP_MSI_SIG"
        fi
    fi
else
    # 使用本地构建文件
    if [ -f "$BUNDLE_DIR/nsis/${APP_NAME}_${VERSION}_x64-setup.exe.sig" ]; then
        WINDOWS_SIG=$(read_sig "$BUNDLE_DIR/nsis/${APP_NAME}_${VERSION}_x64-setup.exe.sig")
        WINDOWS_FILE="${APP_NAME}_${VERSION}_x64-setup.exe"
    elif [ -f "$BUNDLE_DIR/nsis/${APP_NAME}-setup.exe.sig" ]; then
        WINDOWS_SIG=$(read_sig "$BUNDLE_DIR/nsis/${APP_NAME}-setup.exe.sig")
        WINDOWS_FILE="${APP_NAME}-setup.exe"
    fi
    
    # Windows x64 MSI (备用)
    if [ -f "$BUNDLE_DIR/msi/${APP_NAME}_${VERSION}_x64.msi.sig" ]; then
        WINDOWS_MSI_SIG=$(read_sig "$BUNDLE_DIR/msi/${APP_NAME}_${VERSION}_x64.msi.sig")
        WINDOWS_MSI_FILE="${APP_NAME}_${VERSION}_x64.msi"
    elif [ -f "$BUNDLE_DIR/msi/${APP_NAME}.msi.sig" ]; then
        WINDOWS_MSI_SIG=$(read_sig "$BUNDLE_DIR/msi/${APP_NAME}.msi.sig")
        WINDOWS_MSI_FILE="${APP_NAME}.msi"
    fi
fi

if [ -n "$WINDOWS_SIG" ] && [ -n "$WINDOWS_FILE" ]; then
    [ $PLATFORM_COUNT -gt 0 ] && echo "," >> latest.json
    cat >> latest.json <<EOF
    "windows-x86_64": {
      "signature": "$WINDOWS_SIG",
      "url": "$RELEASE_URL/$WINDOWS_FILE$URL_TOKEN_PARAM"
    }
EOF
    echo "  ✅ 找到 Windows x64 构建 (NSIS): $WINDOWS_FILE"
    PLATFORM_COUNT=$((PLATFORM_COUNT + 1))
fi

# MSI 也添加到平台信息（作为额外的下载选项，但不用于自动更新）
if [ -n "$WINDOWS_MSI_SIG" ] && [ -n "$WINDOWS_MSI_FILE" ]; then
    echo "  ✅ 找到 Windows x64 构建 (MSI): $WINDOWS_MSI_FILE"
fi

cat >> latest.json <<EOF

  }
}
EOF

echo ""
if [ $PLATFORM_COUNT -eq 0 ]; then
    echo "❌ 错误: 没有找到任何平台的构建产物"
    echo "💡 请确保已运行构建命令并设置了签名密钥"
    rm latest.json
    exit 1
fi

echo "================================================"
echo "✅ latest.json 已成功创建！"
echo "================================================"
echo ""
echo "📊 包含 $PLATFORM_COUNT 个平台的更新信息"
echo ""
echo "📤 下一步操作:"
echo "   1. 在 Gitea 创建新的 Release: $GITEA_URL/$OWNER/$REPO/releases/new"
echo "   2. 标签名称设置为: v$VERSION"
echo "   3. 上传以下文件到 Release:"
echo ""

# 列出需要上传的文件
if [ -n "$MACOS_ARM_SIG" ]; then
    echo "      • $MACOS_ARM_FILE"
    echo "      • $MACOS_ARM_FILE.sig"
fi

if [ -n "$MACOS_X64_SIG" ]; then
    echo "      • $MACOS_X64_FILE"
    echo "      • $MACOS_X64_FILE.sig"
fi

if [ -n "$LINUX_SIG" ]; then
    echo "      • $LINUX_FILE"
    echo "      • $LINUX_FILE.sig"
fi

if [ -n "$WINDOWS_SIG" ]; then
    echo "      • $WINDOWS_FILE"
    echo "      • $WINDOWS_FILE.sig"
fi

if [ -n "$WINDOWS_MSI_SIG" ]; then
    echo "      • $WINDOWS_MSI_FILE (可选)"
    echo "      • $WINDOWS_MSI_FILE.sig (可选)"
fi

echo ""
echo "   4. 上传 latest.json 文件"
echo ""
echo "🔗 更新地址将是: $RELEASE_URL/latest.json"
echo ""
echo "================================================"
echo "📂 构建产物位置:"
echo "================================================"
echo ""

# 显示实际的文件路径
if [ -n "$MACOS_ARM_SIG" ]; then
    echo "macOS ARM64:"
    echo "  📦 $BUNDLE_DIR/macos/$MACOS_ARM_FILE"
    echo "  🔑 $BUNDLE_DIR/macos/$MACOS_ARM_FILE.sig"
    echo ""
fi

if [ -n "$MACOS_X64_SIG" ]; then
    echo "macOS x64:"
    echo "  📦 $BUNDLE_DIR/macos/$MACOS_X64_FILE"
    echo "  🔑 $BUNDLE_DIR/macos/$MACOS_X64_FILE.sig"
    echo ""
fi

if [ -n "$LINUX_SIG" ]; then
    echo "Linux x64:"
    echo "  📦 $BUNDLE_DIR/appimage/$LINUX_FILE"
    echo "  🔑 $BUNDLE_DIR/appimage/$LINUX_FILE.sig"
    echo ""
fi

if [ -n "$WINDOWS_SIG" ]; then
    echo "Windows x64 (NSIS):"
    echo "  📦 $BUNDLE_DIR/nsis/$WINDOWS_FILE"
    echo "  🔑 $BUNDLE_DIR/nsis/$WINDOWS_FILE.sig"
    echo ""
fi

if [ -n "$WINDOWS_MSI_SIG" ]; then
    echo "Windows x64 (MSI):"
    echo "  📦 $BUNDLE_DIR/msi/$WINDOWS_MSI_FILE"
    echo "  🔑 $BUNDLE_DIR/msi/$WINDOWS_MSI_FILE.sig"
    echo ""
fi

echo "latest.json:"
echo "  📄 ./latest.json"
echo ""

# ============================================
# 自动上传到 Gitea Release
# ============================================

# 询问是否自动上传
SHOULD_UPLOAD=0
if [ "$AUTO_UPLOAD" = "true" ] && [ -n "$GITEA_TOKEN" ] && [ "$GITEA_TOKEN" != "null" ]; then
    SHOULD_UPLOAD=1
    echo "================================================"
    echo "🚀 自动上传已启用"
    echo "================================================"
    echo ""
elif [ -n "$GITEA_TOKEN" ] && [ "$GITEA_TOKEN" != "null" ]; then
    echo "================================================"
    echo "📤 检测到 Gitea Token"
    echo "================================================"
    echo ""
    read -p "是否自动上传到 Gitea Release？(Y/n): " UPLOAD_CHOICE
    UPLOAD_CHOICE=${UPLOAD_CHOICE:-Y}
    if [[ "$UPLOAD_CHOICE" =~ ^[Yy]$ ]]; then
        SHOULD_UPLOAD=1
    fi
fi

if [ $SHOULD_UPLOAD -eq 1 ]; then
    echo "开始上传到 Gitea..."
    echo ""
    
    # 检查 curl 是否可用
    if ! command -v curl &> /dev/null; then
        echo "❌ 错误: 未找到 curl 命令"
        echo "💡 请安装 curl 后重试"
        exit 1
    fi
    
    # API 基础 URL - 确保使用 https
    API_BASE="${GITEA_URL/http:/https:}/api/v1"
    AUTH_HEADER="Authorization: token $GITEA_TOKEN"
    
    # 1. 检查 Release 是否已存在
    echo "🔍 检查 Release v$VERSION 是否存在..."
    RELEASE_INFO=$(curl -s -H "$AUTH_HEADER" "$API_BASE/repos/$OWNER/$REPO/releases/tags/v$VERSION")
    
    RELEASE_ID=""
    if echo "$RELEASE_INFO" | grep -q '"id":[0-9]*'; then
        RELEASE_ID=$(echo "$RELEASE_INFO" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
        echo "   ✅ Release 已存在 (ID: $RELEASE_ID)"
        echo ""
        read -p "⚠️  是否删除现有 Release 并重新创建？(y/N): " DELETE_EXISTING
        if [[ "$DELETE_EXISTING" =~ ^[Yy]$ ]]; then
            echo "   🗑️  删除现有 Release..."
            curl -s -X DELETE -H "$AUTH_HEADER" "$API_BASE/repos/$OWNER/$REPO/releases/$RELEASE_ID" > /dev/null
            RELEASE_ID=""
            echo "   ✅ 已删除"
            echo ""
        else
            echo "   ℹ️  将向现有 Release 添加文件"
            echo ""
        fi
    fi
    
    # 2. 创建 Release（如果不存在）
    if [ -z "$RELEASE_ID" ]; then
        echo "📦 创建 Release v$VERSION..."
        
        # 转义 JSON 中的特殊字符（兼容 macOS 和 Linux）
        if command -v jq &> /dev/null; then
            # 使用 jq 进行 JSON 转义（最可靠）
            NOTES_ESCAPED=$(echo "$NOTES" | jq -Rs . | sed 's/^"//;s/"$//')
        else
            # 回退到 sed 方案（简化版本）
            NOTES_ESCAPED=$(echo "$NOTES" | sed 's/"/\\"/g' | tr '\n' ' ')
        fi
        
        CREATE_RESPONSE=$(curl -s -X POST \
            -H "$AUTH_HEADER" \
            -H "Content-Type: application/json" \
            -d "{
                \"tag_name\": \"v$VERSION\",
                \"name\": \"v$VERSION\",
                \"body\": \"$NOTES_ESCAPED\",
                \"draft\": false,
                \"prerelease\": false
            }" \
            "$API_BASE/repos/$OWNER/$REPO/releases")
        
        # 显示响应的前200字符用于调试
        echo "API 响应前200字符: $(echo "$CREATE_RESPONSE" | head -c 200)"
        echo ""
        
        # 提取 Release ID（直接用 grep，避免 jq 解析包含换行符的 JSON）
        if echo "$CREATE_RESPONSE" | grep -q '"id":[0-9]*'; then
            RELEASE_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
        else
            RELEASE_ID=""
        fi
        
        if [ -z "$RELEASE_ID" ]; then
            echo "❌ 创建 Release 失败 - 无法从响应中提取 ID"
            echo "完整响应: $CREATE_RESPONSE"
            exit 1
        fi
        
        echo "   ✅ Release 创建成功 (ID: $RELEASE_ID)"
        echo ""
    fi
    
    # 3. 上传文件
    echo "📤 上传构建产物..."
    echo ""
    
    UPLOAD_COUNT=0
    UPLOAD_FAILED=0
    
    # 上传函数
    upload_file() {
        local file_path=$1
        local file_name=$(basename "$file_path")
        
        if [ ! -f "$file_path" ]; then
            echo "   ⚠️  跳过: $file_name (文件不存在)"
            echo "      路径: $file_path"
            return
        fi
        
        echo "   📤 上传: $file_name"
        echo "      文件大小: $(du -h "$file_path" | cut -f1)"
        
        # 上传文件
        UPLOAD_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST \
            -H "$AUTH_HEADER" \
            -F "attachment=@$file_path" \
            "$API_BASE/repos/$OWNER/$REPO/releases/$RELEASE_ID/assets?name=$file_name")
        
        # 提取 HTTP 状态码
        HTTP_CODE=$(echo "$UPLOAD_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
        RESPONSE_BODY=$(echo "$UPLOAD_RESPONSE" | sed '/HTTP_CODE:/d')
        
        # 检查是否成功
        if echo "$RESPONSE_BODY" | grep -q '"name"' && [ "$HTTP_CODE" = "201" ]; then
            echo "      ✅ 成功 (HTTP $HTTP_CODE)"
            UPLOAD_COUNT=$((UPLOAD_COUNT + 1))
        else
            echo "      ❌ 失败 (HTTP $HTTP_CODE)"
            echo "      响应前200字符: $(echo "$RESPONSE_BODY" | head -c 200)"
            UPLOAD_FAILED=$((UPLOAD_FAILED + 1))
        fi
    }
    
    # 上传 macOS 文件
    if [ -n "$MACOS_ARM_SIG" ]; then
        upload_file "$BUNDLE_DIR/macos/$MACOS_ARM_FILE"
        upload_file "$BUNDLE_DIR/macos/$MACOS_ARM_FILE.sig"
    fi
    
    if [ -n "$MACOS_X64_SIG" ]; then
        upload_file "$BUNDLE_DIR/macos/$MACOS_X64_FILE"
        upload_file "$BUNDLE_DIR/macos/$MACOS_X64_FILE.sig"
    fi
    
    # 上传 Linux 文件
    if [ -n "$LINUX_SIG" ]; then
        upload_file "$BUNDLE_DIR/appimage/$LINUX_FILE"
        upload_file "$BUNDLE_DIR/appimage/$LINUX_FILE.sig"
    fi
    
    # 上传 Windows NSIS 文件（仅当使用本地构建时）
    if [ -n "$WINDOWS_SIG" ] && [ ! -f "/tmp/windows-upload-result.json" ]; then
        upload_file "$BUNDLE_DIR/nsis/$WINDOWS_FILE"
        upload_file "$BUNDLE_DIR/nsis/$WINDOWS_FILE.sig"
    elif [ -f "/tmp/windows-upload-result.json" ]; then
        echo "   ⏭️  跳过 Windows 文件上传（已在远程主机上传）"
    fi
    
    # 上传 Windows MSI 文件（可选，仅当使用本地构建时）
    if [ -n "$WINDOWS_MSI_SIG" ] && [ ! -f "/tmp/windows-upload-result.json" ]; then
        upload_file "$BUNDLE_DIR/msi/$WINDOWS_MSI_FILE"
        upload_file "$BUNDLE_DIR/msi/$WINDOWS_MSI_FILE.sig"
    fi
    
    # 上传 latest.json
    upload_file "latest.json"
    
    echo ""
    echo "================================================"
    if [ $UPLOAD_FAILED -eq 0 ]; then
        echo "✅ 上传完成！成功上传 $UPLOAD_COUNT 个文件"
    else
        echo "⚠️  上传完成，但有 $UPLOAD_FAILED 个文件失败"
        echo "   成功: $UPLOAD_COUNT 个文件"
    fi
    echo "================================================"
    echo ""
    echo "🔗 Release 地址:"
    echo "   $GITEA_URL/$OWNER/$REPO/releases/tag/v$VERSION"
    echo ""
    echo "🔗 更新检查地址:"
    echo "   $RELEASE_URL/latest.json"
    echo ""
else
    echo "💡 提示: 配置 Gitea Token 可以自动上传到 Release"
    echo "   在 .updater.config.json 中添加:"
    echo "   \"gitea\": {"
    echo "     \"token\": \"your-gitea-token\","
    echo "     \"autoUpload\": true"
    echo "   }"
    echo ""
fi

# ============================================
# 确认版本号更新（如果没有构建则现在更新）
# ============================================
if [ $NEED_BUILD -eq 0 ]; then
    echo "================================================"
    echo "🔄 更新版本号"
    echo "================================================"
    echo ""
    
    # 更新 tauri.conf.json
    if [ -f "$TAURI_CONF" ]; then
        echo "📝 更新 $TAURI_CONF 版本号: $CURRENT_VERSION → $VERSION"
        
        if command -v jq &> /dev/null; then
            TMP_FILE=$(mktemp)
            jq --arg version "$VERSION" '.version = $version' "$TAURI_CONF" > "$TMP_FILE"
            mv "$TMP_FILE" "$TAURI_CONF"
            echo "   ✅ 已更新 tauri.conf.json"
        else
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$VERSION\"/" "$TAURI_CONF"
            else
                sed -i "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$VERSION\"/" "$TAURI_CONF"
            fi
            echo "   ✅ 已更新 tauri.conf.json"
        fi
    else
        echo "   ⚠️  未找到 $TAURI_CONF"
    fi
    
    # 更新 package.json
    if [ -f "$PACKAGE_JSON" ]; then
        echo "📝 更新 $PACKAGE_JSON 版本号: $CURRENT_VERSION → $VERSION"
        
        if command -v jq &> /dev/null; then
            TMP_FILE=$(mktemp)
            jq --arg version "$VERSION" '.version = $version' "$PACKAGE_JSON" > "$TMP_FILE"
            mv "$TMP_FILE" "$PACKAGE_JSON"
            echo "   ✅ 已更新 package.json"
        else
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$VERSION\"/" "$PACKAGE_JSON"
            else
                sed -i "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$VERSION\"/" "$PACKAGE_JSON"
            fi
            echo "   ✅ 已更新 package.json"
        fi
    else
        echo "   ⚠️  未找到 $PACKAGE_JSON"
    fi
    
    echo ""
    echo "✅ 版本号更新完成！"
    echo ""
else
    echo "================================================"
    echo "✅ 版本号已在构建前更新"
    echo "================================================"
    echo ""
fi

# ============================================
# 清理临时文件
# ============================================
rm -f /tmp/windows-upload-result.json 2>/dev/null || true
rm -f /tmp/nsis-temp.sig 2>/dev/null || true
rm -f /tmp/msi-temp.sig 2>/dev/null || true
rm -f /tmp/gitea-upload.ps1 2>/dev/null || true

