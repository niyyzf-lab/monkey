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
    [ -f "$BUNDLE_DIR/macos/${APP_NAME}.app.tar.gz" ] && BUILD_COUNT=$((BUILD_COUNT + 1))
    [ -f "$BUNDLE_DIR/appimage/${APP_NAME}.AppImage.tar.gz" ] && BUILD_COUNT=$((BUILD_COUNT + 1))
    [ -f "$BUNDLE_DIR/nsis/${APP_NAME}.nsis.zip" ] && BUILD_COUNT=$((BUILD_COUNT + 1))
    
    # 检查是否有带版本号的构建产物
    BUILD_COUNT_VERSIONED=0
    if compgen -G "$BUNDLE_DIR/macos/${APP_NAME}_*.app.tar.gz" > /dev/null 2>&1; then
        BUILD_COUNT_VERSIONED=$((BUILD_COUNT_VERSIONED + 1))
    fi
    if compgen -G "$BUNDLE_DIR/appimage/${APP_NAME}_*.AppImage.tar.gz" > /dev/null 2>&1; then
        BUILD_COUNT_VERSIONED=$((BUILD_COUNT_VERSIONED + 1))
    fi
    if compgen -G "$BUNDLE_DIR/nsis/${APP_NAME}_*.nsis.zip" > /dev/null 2>&1; then
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
        if [ -f "$BUNDLE_DIR/appimage/${APP_NAME}.AppImage.tar.gz" ]; then
            echo "   • Linux: ${APP_NAME}.AppImage.tar.gz"
        fi
        for file in "$BUNDLE_DIR/appimage/${APP_NAME}_"*".AppImage.tar.gz"; do
            if [ -f "$file" ]; then
                echo "   • Linux: $(basename "$file")"
            fi
        done
        if [ -f "$BUNDLE_DIR/nsis/${APP_NAME}.nsis.zip" ]; then
            echo "   • Windows: ${APP_NAME}.nsis.zip"
        fi
        for file in "$BUNDLE_DIR/nsis/${APP_NAME}_"*".nsis.zip"; do
            if [ -f "$file" ]; then
                echo "   • Windows: $(basename "$file")"
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
    
    # 执行构建命令
    echo "📦 执行构建命令: $BUILD_COMMAND"
    echo ""
    eval $BUILD_COMMAND
    
    BUILD_EXIT_CODE=$?
    echo ""
    
    if [ $BUILD_EXIT_CODE -ne 0 ]; then
        echo "❌ 构建失败，退出码: $BUILD_EXIT_CODE"
        
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
    
    echo "✅ 构建成功！"
    echo ""
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
    
    # Linux 构建文件
    if [ -f "$BUNDLE_DIR/appimage/${APP_NAME}.AppImage.tar.gz" ]; then
        local new_name="${APP_NAME}_${VERSION}_amd64.AppImage.tar.gz"
        echo "📝 重命名 Linux 构建文件:"
        echo "   ${APP_NAME}.AppImage.tar.gz → $new_name"
        mv "$BUNDLE_DIR/appimage/${APP_NAME}.AppImage.tar.gz" "$BUNDLE_DIR/appimage/$new_name"
        
        if [ -f "$BUNDLE_DIR/appimage/${APP_NAME}.AppImage.tar.gz.sig" ]; then
            mv "$BUNDLE_DIR/appimage/${APP_NAME}.AppImage.tar.gz.sig" "$BUNDLE_DIR/appimage/$new_name.sig"
            echo "   ${APP_NAME}.AppImage.tar.gz.sig → $new_name.sig"
        fi
        renamed=1
    fi
    
    # Windows 构建文件
    if [ -f "$BUNDLE_DIR/nsis/${APP_NAME}.nsis.zip" ]; then
        local new_name="${APP_NAME}_${VERSION}_x64-setup.nsis.zip"
        echo "📝 重命名 Windows 构建文件:"
        echo "   ${APP_NAME}.nsis.zip → $new_name"
        mv "$BUNDLE_DIR/nsis/${APP_NAME}.nsis.zip" "$BUNDLE_DIR/nsis/$new_name"
        
        if [ -f "$BUNDLE_DIR/nsis/${APP_NAME}.nsis.zip.sig" ]; then
            mv "$BUNDLE_DIR/nsis/${APP_NAME}.nsis.zip.sig" "$BUNDLE_DIR/nsis/$new_name.sig"
            echo "   ${APP_NAME}.nsis.zip.sig → $new_name.sig"
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

# Linux x64
LINUX_SIG=""
if [ -f "$BUNDLE_DIR/appimage/${APP_NAME}_${VERSION}_amd64.AppImage.tar.gz.sig" ]; then
    LINUX_SIG=$(read_sig "$BUNDLE_DIR/appimage/${APP_NAME}_${VERSION}_amd64.AppImage.tar.gz.sig")
    LINUX_FILE="${APP_NAME}_${VERSION}_amd64.AppImage.tar.gz"
elif [ -f "$BUNDLE_DIR/appimage/${APP_NAME}.AppImage.tar.gz.sig" ]; then
    LINUX_SIG=$(read_sig "$BUNDLE_DIR/appimage/${APP_NAME}.AppImage.tar.gz.sig")
    LINUX_FILE="${APP_NAME}.AppImage.tar.gz"
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

# Windows x64
WINDOWS_SIG=""
if [ -f "$BUNDLE_DIR/nsis/${APP_NAME}_${VERSION}_x64-setup.nsis.zip.sig" ]; then
    WINDOWS_SIG=$(read_sig "$BUNDLE_DIR/nsis/${APP_NAME}_${VERSION}_x64-setup.nsis.zip.sig")
    WINDOWS_FILE="${APP_NAME}_${VERSION}_x64-setup.nsis.zip"
elif [ -f "$BUNDLE_DIR/nsis/${APP_NAME}.nsis.zip.sig" ]; then
    WINDOWS_SIG=$(read_sig "$BUNDLE_DIR/nsis/${APP_NAME}.nsis.zip.sig")
    WINDOWS_FILE="${APP_NAME}.nsis.zip"
fi

if [ -n "$WINDOWS_SIG" ]; then
    [ $PLATFORM_COUNT -gt 0 ] && echo "," >> latest.json
    cat >> latest.json <<EOF
    "windows-x86_64": {
      "signature": "$WINDOWS_SIG",
      "url": "$RELEASE_URL/$WINDOWS_FILE$URL_TOKEN_PARAM"
    }
EOF
    echo "  ✅ 找到 Windows x64 构建: $WINDOWS_FILE"
    PLATFORM_COUNT=$((PLATFORM_COUNT + 1))
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
    echo "Windows x64:"
    echo "  📦 $BUNDLE_DIR/nsis/$WINDOWS_FILE"
    echo "  🔑 $BUNDLE_DIR/nsis/$WINDOWS_FILE.sig"
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
    
    # 上传 Windows 文件
    if [ -n "$WINDOWS_SIG" ]; then
        upload_file "$BUNDLE_DIR/nsis/$WINDOWS_FILE"
        upload_file "$BUNDLE_DIR/nsis/$WINDOWS_FILE.sig"
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

