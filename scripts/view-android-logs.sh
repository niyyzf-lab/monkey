#!/bin/bash

# Android 日志查看脚本
# 用于查看 watch-monkey-app 的 Android 日志

echo "=========================================="
echo "  Watch Monkey App - Android 日志查看"
echo "=========================================="
echo ""

# 检查 adb 是否可用
if ! command -v adb &> /dev/null; then
    echo "❌ 错误: 找不到 adb 命令"
    echo "请确保 Android SDK 已安装并添加到 PATH"
    echo ""
    echo "通常 adb 位于: ~/Library/Android/sdk/platform-tools/adb"
    echo "或运行: export PATH=\$PATH:~/Library/Android/sdk/platform-tools"
    exit 1
fi

# 检查设备连接
echo "🔍 检查已连接的设备..."
DEVICES=$(adb devices | grep -v "List" | grep "device$" | wc -l)

if [ "$DEVICES" -eq 0 ]; then
    echo "❌ 错误: 没有检测到连接的设备或模拟器"
    echo ""
    echo "请确保:"
    echo "  1. 模拟器已启动"
    echo "  2. 或者真机已通过 USB 连接并开启 USB 调试"
    echo ""
    echo "运行 'adb devices' 查看设备列表"
    exit 1
fi

echo "✅ 检测到 $DEVICES 个设备"
echo ""

# 显示选项
echo "请选择查看方式:"
echo "  1) 查看应用相关日志 (推荐)"
echo "  2) 查看 MainActivity 日志"
echo "  3) 查看所有日志"
echo "  4) 实时监控返回键事件"
echo "  5) 查看浏览器控制台日志"
echo ""
read -p "请输入选项 (1-5): " choice

echo ""
echo "=========================================="
echo "  开始显示日志 (按 Ctrl+C 停止)"
echo "=========================================="
echo ""

case $choice in
    1)
        echo "📱 显示应用相关日志..."
        adb logcat -v time | grep -E "WatchMonkey|watch_monkey_app|chromium"
        ;;
    2)
        echo "📱 显示 MainActivity 日志..."
        adb logcat -v time -s WatchMonkey_MainActivity
        ;;
    3)
        echo "📱 显示所有日志..."
        adb logcat -v time
        ;;
    4)
        echo "🔙 实时监控返回键事件..."
        adb logcat -v time | grep -E "handleOnBackPressed|Back button|android-back-button"
        ;;
    5)
        echo "🌐 显示浏览器控制台日志..."
        adb logcat -v time | grep -E "chromium|Console"
        ;;
    *)
        echo "❌ 无效的选项"
        exit 1
        ;;
esac

