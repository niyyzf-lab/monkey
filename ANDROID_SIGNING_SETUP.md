# Android 签名配置指南

## 📋 概述

本项目已配置 Android 自动签名功能，支持本地构建和 CI/CD 自动构建。

## 🔑 本地开发配置

### 1. 配置 keystore.properties

您的 keystore 文件位于：`/Users/wenbo/upload-keystore.jks`

编辑文件：`src-tauri/gen/android/keystore.properties`

```properties
password=YOUR_KEYSTORE_PASSWORD_HERE
keyAlias=upload
storeFile=/Users/wenbo/upload-keystore.jks
```

**重要：** 将 `YOUR_KEYSTORE_PASSWORD_HERE` 替换为您创建 keystore 时设置的实际密码。

### 2. 本地构建签名的 APK

配置完成后，直接构建即可自动签名：

```bash
# 构建 Android APK（自动签名）
bun tauri android build

# 或构建 Android App Bundle
bun tauri android build --apk
```

构建完成后，签名的 APK 位于：
```
src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk
```

## 🚀 GitHub Actions CI/CD 配置

### 1. 准备 Keystore Base64

将您的 keystore 文件转换为 base64：

```bash
base64 -i /Users/wenbo/upload-keystore.jks | pbcopy
```

这会将 base64 编码后的内容复制到剪贴板。

### 2. 配置 GitHub Secrets

在您的 GitHub 仓库中，进入 `Settings` → `Secrets and variables` → `Actions`，添加以下 secrets：

| Secret 名称 | 值 | 说明 |
|------------|-----|------|
| `ANDROID_KEY_ALIAS` | `upload` | keystore 别名 |
| `ANDROID_KEY_PASSWORD` | `88888888` | keystore 密码（您的实际密码） |
| `ANDROID_KEY_BASE64` | 上一步复制的 base64 | keystore 文件的 base64 编码 |

### 3. Android 构建已集成到主 workflow

Android 构建已经整合到 `.github/workflows/publish.yml` 中，当您推送到 `release` 分支或手动触发 workflow 时，会自动构建所有平台（包括 Android）。

## 🔒 安全注意事项

1. **永远不要提交以下文件到 Git：**
   - `keystore.properties`
   - `*.jks` 或 `*.keystore` 文件
   
2. **已配置的 .gitignore 规则：**
   ```gitignore
   # Android signing (SENSITIVE - never commit!)
   src-tauri/gen/android/keystore.properties
   *.jks
   *.keystore
   ```

3. **备份您的 keystore 文件：**
   - 将 `/Users/wenbo/upload-keystore.jks` 保存到安全的地方
   - 如果丢失，您将无法更新已发布的应用

## 📱 验证签名

构建完成后，验证 APK 是否已签名：

```bash
# 查看 APK 签名信息
jarsigner -verify -verbose -certs src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk
```

成功签名会显示：`jar verified.`

## 🎯 发布到 Google Play

1. 使用构建的签名 APK 或 App Bundle
2. 在 Google Play Console 上传应用
3. Google Play 会使用 Play App Signing 进行额外签名

详见：[Google Play App Signing 文档](https://support.google.com/googleplay/android-developer/answer/9842756)

## ❓ 常见问题

### Q: 如何生成新的 keystore？

```bash
keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

### Q: 忘记了 keystore 密码怎么办？

很遗憾，密码无法恢复。您需要：
1. 生成新的 keystore
2. 作为新应用发布（无法更新现有应用）

### Q: 构建失败提示找不到 keystore？

检查 `keystore.properties` 中的 `storeFile` 路径是否正确。

## 📚 参考资料

- [Tauri Android 签名文档](https://tauri.app/distribute/sign/android/)
- [Android 应用签名官方指南](https://developer.android.com/studio/publish/app-signing)

