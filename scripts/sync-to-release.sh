#!/bin/bash

# 脚本：将 main 分支同步到 release 分支
# 用途：开发在 main 上完成后，使用此脚本同步到 release 分支触发构建

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== 同步 main 到 release 分支 ===${NC}\n"

# 1. 检查当前工作目录状态
echo -e "${YELLOW}[1/7] 检查工作目录状态...${NC}"
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}错误: 工作目录有未提交的改动，请先提交或暂存。${NC}"
    git status -s
    exit 1
fi
echo -e "${GREEN}✓ 工作目录干净${NC}\n"

# 2. 获取当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}[2/7] 当前分支: ${CURRENT_BRANCH}${NC}\n"

# 3. 拉取最新的远程分支
echo -e "${YELLOW}[3/7] 拉取远程最新代码...${NC}"
git fetch origin
echo -e "${GREEN}✓ 远程代码已更新${NC}\n"

# 4. 切换到 main 分支并更新
echo -e "${YELLOW}[4/7] 切换到 main 分支并更新...${NC}"
git checkout main
git pull origin main
echo -e "${GREEN}✓ main 分支已更新${NC}\n"

# 5. 切换到 release 分支
echo -e "${YELLOW}[5/7] 切换到 release 分支...${NC}"
git checkout release
git pull origin release
echo -e "${GREEN}✓ release 分支已更新${NC}\n"

# 6. 合并 main 到 release
echo -e "${YELLOW}[6/7] 合并 main 到 release...${NC}"
if git merge main --no-edit; then
    echo -e "${GREEN}✓ 合并成功${NC}\n"
else
    echo -e "${RED}错误: 合并冲突，请手动解决冲突后执行：${NC}"
    echo -e "${YELLOW}  git add .${NC}"
    echo -e "${YELLOW}  git commit${NC}"
    echo -e "${YELLOW}  git push origin release${NC}"
    exit 1
fi

# 7. 推送到远程 release 分支
echo -e "${YELLOW}[7/7] 推送到远程 release 分支...${NC}"
git push origin release
echo -e "${GREEN}✓ 推送成功${NC}\n"

# 8. 切换回原分支（如果不是 main 或 release）
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "release" ]]; then
    echo -e "${YELLOW}切换回原分支: ${CURRENT_BRANCH}${NC}"
    git checkout "$CURRENT_BRANCH"
    echo ""
fi

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}✓ 同步完成！${NC}"
echo -e "${GREEN}==================================${NC}"
echo -e "${BLUE}main 分支已成功同步到 release 分支${NC}"
echo -e "${BLUE}GitHub Actions 将自动开始构建...${NC}"
echo -e "\n${YELLOW}查看构建状态: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:\/]\(.*\)\.git/\1/')/actions${NC}\n"

