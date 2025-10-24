#!/bin/bash

# PWA 部署脚本 - Watch Monkey App
# 用于快速部署到 1Panel + Nginx 服务器
#
# 使用方法：
#   ./scripts/deploy-pwa.sh
#
# 或者通过环境变量配置：
#   DEPLOY_HOST=your-server.com \
#   DEPLOY_USER=root \
#   DEPLOY_PATH=/path/to/site \
#   ./scripts/deploy-pwa.sh

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 显示横幅
show_banner() {
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║   Watch Monkey PWA 部署脚本           ║"
    echo "║   Deploy to 1Panel + Nginx            ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
}

# 加载配置
load_config() {
    # 尝试从 .env 文件加载
    if [ -f ".env.deploy" ]; then
        log_info "Loading configuration from .env.deploy"
        source .env.deploy
    fi
    
    # 从环境变量或提示用户输入
    if [ -z "$DEPLOY_HOST" ]; then
        read -p "SSH 服务器地址: " DEPLOY_HOST
    fi
    
    if [ -z "$DEPLOY_USER" ]; then
        read -p "SSH 用户名 (默认: root): " DEPLOY_USER
        DEPLOY_USER=${DEPLOY_USER:-root}
    fi
    
    if [ -z "$DEPLOY_PORT" ]; then
        DEPLOY_PORT=22
    fi
    
    if [ -z "$DEPLOY_PATH" ]; then
        read -p "部署路径 (默认: /opt/1panel/apps/openresty/openresty/www/sites/watch-monkey): " DEPLOY_PATH
        DEPLOY_PATH=${DEPLOY_PATH:-/opt/1panel/apps/openresty/openresty/www/sites/watch-monkey}
    fi
    
    if [ -z "$VITE_API_BASE_URL" ]; then
        read -p "API 基础地址 (默认: http://localhost:5678): " VITE_API_BASE_URL
        VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:5678}
    fi
    
    # 显示配置
    echo ""
    log_info "部署配置："
    echo "  服务器: $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PORT"
    echo "  路径: $DEPLOY_PATH"
    echo "  API: $VITE_API_BASE_URL"
    echo ""
    
    # 确认
    read -p "确认部署配置正确？(y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "部署已取消"
        exit 1
    fi
}

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."
    
    local missing_deps=()
    
    # 检查 Node.js 或 Bun
    if ! command_exists bun && ! command_exists node; then
        missing_deps+=("bun 或 node")
    fi
    
    # 检查 SSH
    if ! command_exists ssh; then
        missing_deps+=("ssh")
    fi
    
    # 检查 rsync
    if ! command_exists rsync; then
        missing_deps+=("rsync")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "缺少以下依赖："
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        exit 1
    fi
    
    log_success "所有依赖已满足"
}

# 构建 PWA
build_pwa() {
    log_info "开始构建 PWA..."
    
    # 清理旧的构建
    if [ -d "dist" ]; then
        log_info "清理旧的构建..."
        rm -rf dist
    fi
    
    # 安装依赖
    if [ ! -d "node_modules" ]; then
        log_info "安装依赖..."
        if command_exists bun; then
            bun install
        else
            npm install
        fi
    fi
    
    # 设置环境变量
    export VITE_PWA_PROMPT_ENABLED=true
    export VITE_API_BASE_URL="$VITE_API_BASE_URL"
    
    # 构建
    log_info "正在构建..."
    if command_exists bun; then
        bun run build
    else
        npm run build
    fi
    
    # 验证构建
    if [ ! -f "dist/index.html" ]; then
        log_error "构建失败：未找到 dist/index.html"
        exit 1
    fi
    
    # 显示构建信息
    local build_size=$(du -sh dist | cut -f1)
    log_success "构建完成！大小: $build_size"
    
    # 列出关键文件
    log_info "PWA 关键文件："
    find dist -name "sw.js" -o -name "manifest.*" -o -name "registerSW.js" | while read file; do
        echo "  ✓ $(basename $file)"
    done
}

# 测试 SSH 连接
test_ssh() {
    log_info "测试 SSH 连接..."
    
    if ssh -p "$DEPLOY_PORT" -o ConnectTimeout=10 -o StrictHostKeyChecking=no \
        "$DEPLOY_USER@$DEPLOY_HOST" "echo '连接成功'" >/dev/null 2>&1; then
        log_success "SSH 连接正常"
        return 0
    else
        log_error "SSH 连接失败"
        log_info "请检查："
        echo "  1. 服务器地址和端口是否正确"
        echo "  2. SSH 密钥是否已配置"
        echo "  3. 防火墙是否允许 SSH 连接"
        exit 1
    fi
}

# 创建远程备份
create_backup() {
    log_info "创建远程备份..."
    
    ssh -p "$DEPLOY_PORT" -o StrictHostKeyChecking=no \
        "$DEPLOY_USER@$DEPLOY_HOST" "
            if [ -d '$DEPLOY_PATH' ]; then
                BACKUP_PATH='${DEPLOY_PATH}.backup.$(date +%Y%m%d_%H%M%S)'
                echo '📦 备份到: \$BACKUP_PATH'
                cp -r '$DEPLOY_PATH' '\$BACKUP_PATH'
                
                # 只保留最近 3 个备份
                ls -dt ${DEPLOY_PATH}.backup.* 2>/dev/null | tail -n +4 | xargs rm -rf 2>/dev/null || true
                
                echo '✅ 备份完成'
            else
                echo '📁 目标目录不存在，创建: $DEPLOY_PATH'
                mkdir -p '$DEPLOY_PATH'
            fi
        "
    
    log_success "备份创建完成"
}

# 部署文件
deploy_files() {
    log_info "开始部署文件..."
    
    # 使用 rsync 同步
    rsync -avz --delete --progress \
        -e "ssh -p $DEPLOY_PORT -o StrictHostKeyChecking=no" \
        dist/ \
        "$DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH/" \
        || {
            log_error "文件同步失败"
            exit 1
        }
    
    log_success "文件同步完成"
}

# 设置权限
set_permissions() {
    log_info "设置文件权限..."
    
    ssh -p "$DEPLOY_PORT" -o StrictHostKeyChecking=no \
        "$DEPLOY_USER@$DEPLOY_HOST" "
            cd '$DEPLOY_PATH'
            
            # 设置权限
            find . -type d -exec chmod 755 {} \;
            find . -type f -exec chmod 644 {} \;
            
            # 尝试修改所有者（可能需要 root 权限）
            if id 'www' &>/dev/null; then
                chown -R www:www . 2>/dev/null && echo '✅ 所有者已设置为 www' || echo '⚠️  无法设置所有者'
            fi
            
            echo '✅ 权限设置完成'
        "
    
    log_success "权限设置完成"
}

# 重载 Nginx
reload_nginx() {
    log_info "重载 Nginx..."
    
    # 询问是否重载 Nginx
    read -p "是否重载 Nginx？(y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "跳过 Nginx 重载"
        return 0
    fi
    
    ssh -p "$DEPLOY_PORT" -o StrictHostKeyChecking=no \
        "$DEPLOY_USER@$DEPLOY_HOST" "
            # 尝试不同的 Nginx 命令
            if command -v nginx &>/dev/null; then
                nginx -t && nginx -s reload && echo '✅ Nginx 已重载'
            elif command -v systemctl &>/dev/null; then
                systemctl reload nginx && echo '✅ Nginx 已重载 (systemctl)'
            elif [ -f '/www/server/openresty/nginx/sbin/nginx' ]; then
                /www/server/openresty/nginx/sbin/nginx -t && \
                /www/server/openresty/nginx/sbin/nginx -s reload && \
                echo '✅ OpenResty (1Panel) 已重载'
            else
                echo '⚠️  无法找到 Nginx 命令'
                exit 1
            fi
        " && log_success "Nginx 重载成功" || log_warning "Nginx 重载失败"
}

# 验证部署
verify_deployment() {
    log_info "验证部署..."
    
    # 检查远程文件
    ssh -p "$DEPLOY_PORT" -o StrictHostKeyChecking=no \
        "$DEPLOY_USER@$DEPLOY_HOST" "
            cd '$DEPLOY_PATH'
            
            # 检查关键文件
            if [ ! -f 'index.html' ]; then
                echo '❌ index.html 不存在'
                exit 1
            fi
            
            echo '✅ index.html 存在'
            
            # 检查 PWA 文件
            if [ -f 'sw.js' ]; then
                echo '✅ Service Worker 存在'
            else
                echo '⚠️  Service Worker 不存在'
            fi
            
            if [ -f 'manifest.webmanifest' ] || [ -f 'manifest.json' ]; then
                echo '✅ Manifest 存在'
            else
                echo '⚠️  Manifest 不存在'
            fi
            
            # 显示文件统计
            FILE_COUNT=\$(find . -type f | wc -l)
            TOTAL_SIZE=\$(du -sh . | cut -f1)
            echo \"📊 文件数: \$FILE_COUNT, 总大小: \$TOTAL_SIZE\"
        " || {
            log_error "远程验证失败"
            exit 1
        }
    
    log_success "部署验证通过"
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║     🎉 部署成功！                     ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    log_success "PWA 已成功部署到服务器"
    echo ""
    log_info "下一步："
    echo "  1. 访问你的域名验证部署"
    echo "  2. 在浏览器中打开开发者工具"
    echo "  3. 检查 Application → Service Worker"
    echo "  4. 测试 PWA 安装功能"
    echo "  5. 测试离线功能"
    echo ""
    log_info "有用的命令："
    echo "  查看日志: ssh $DEPLOY_USER@$DEPLOY_HOST 'tail -f $DEPLOY_PATH/../logs/error.log'"
    echo "  回滚: ssh $DEPLOY_USER@$DEPLOY_HOST 'cp -r $DEPLOY_PATH.backup.* $DEPLOY_PATH'"
    echo ""
}

# 保存配置
save_config() {
    read -p "是否保存配置到 .env.deploy？(y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cat > .env.deploy << EOF
# PWA 部署配置
# 由 deploy-pwa.sh 自动生成

DEPLOY_HOST=$DEPLOY_HOST
DEPLOY_USER=$DEPLOY_USER
DEPLOY_PORT=$DEPLOY_PORT
DEPLOY_PATH=$DEPLOY_PATH
VITE_API_BASE_URL=$VITE_API_BASE_URL
EOF
        log_success "配置已保存到 .env.deploy"
        log_warning "请不要将 .env.deploy 提交到 Git！"
    fi
}

# 主函数
main() {
    show_banner
    
    # 检查依赖
    check_dependencies
    
    # 加载配置
    load_config
    
    # 构建
    build_pwa
    
    # 测试连接
    test_ssh
    
    # 创建备份
    create_backup
    
    # 部署
    deploy_files
    
    # 设置权限
    set_permissions
    
    # 重载 Nginx
    reload_nginx
    
    # 验证
    verify_deployment
    
    # 显示信息
    show_deployment_info
    
    # 保存配置
    save_config
}

# 捕获错误
trap 'log_error "部署过程中发生错误！"; exit 1' ERR

# 运行主函数
main

