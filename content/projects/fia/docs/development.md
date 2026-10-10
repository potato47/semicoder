---
id: "docs-fia-development"
slug: "development"
title: "开发与原生能力"
description: "了解进程分工、窗口生命周期和真实宿主上的浏览器调试。"
date: "2026-10-09"
---

## 三个部分如何协作

```text
React / WKWebView ── HTTP 与事件 ──┐
应用 CLI / TypeScript ── Unix Socket ── Bun 共享后端
                                      │
                                Swift Host 原生能力
```

Swift Host 管理原生应用与窗口，Bun 是唯一业务服务器。开发时 Vite 代理到 Bun，生产时由 Bun 提供打包的页面资源。

## 原生能力

通过 `@semicoder/fia/client` 的 `native` 使用系统能力，例如：

```ts
import { native } from "@semicoder/fia/client";

await native.clipboard.writeText({ text: "来自 FIA 的问候" });
const files = await native.dialogs.openFiles({ multiple: false });
```

可用 API 的完整类型和契约随 npm 包提供，位于 `node_modules/@semicoder/fia/docs/framework/README.md`。系统权限仍由 macOS 决定，应用需在配置中声明相应用途。

## 窗口与就绪

`native.windows.create` 声明窗口，`open` 或 `focus` 才展示它。不要把“创建成功”理解为“已经可见”。主窗口关闭通常隐藏页面，应用仍可通过菜单栏运行；退出应用才结束后端。

默认模板已在前端首次挂载时调用 `native.ready()`。自定义入口也必须保留这一信号，包括隐藏启动，否则应用更新无法确认首屏就绪。

## 浏览器调试

```bash
bun run dev --open-browser
```

也可在已运行的开发实例中获取新的登录链接：

```bash
bun run agent open --browser --url
```

链接一次有效，60 秒过期。后端重启后重新获取，不直接访问 Vite 裸地址。浏览器连接的是真实原生宿主，窗口与剪贴板等调用仍会作用于本机。

## 资源与数据

需要按文件路径读取的资源在 `backend.assets` 中声明，然后相对 `context.app.codeDirectory` 读取。该目录开发时指向项目根目录，打包后指向随应用发布的代码目录。

用户数据使用 `context.app.dataDirectory`。开发实例与安装应用的数据和连接相互独立，切换到生产包不会自动搬运开发数据。

## 适用版本

本文面向 npm 0.18.0，包含应用原生外观、系统浏览器 OAuth 回调、系统代理继承与钥匙串等待修复。完整契约随包分发，见 [版本与分发](/fia/docs/distribution)。

### 开发与预览标记（0.17.0）

从 0.17.0 开始，`fia dev` 显示 `Dev` 名称、黄色 `DEV` Dock 标记和菜单栏文字，macOS Bundle ID 追加 `.dev`。`fia run` 改为独立的 `Preview` 打包预览，使用蓝色 `PREV` 标记、`.preview` Bundle ID 和 `.fia/preview/data` 数据目录；`fia agent --preview` 控制该预览。两种本地模式均停用正式更新源。

npm 0.16.1 和麻辣烫 0.2.0 的旧固定归档不含此行为，请勿把新 `run` 隔离规则套用于旧版本。开发数据继续沿用 `.fia/dev/data`；逻辑应用标识与 Keychain service 保持兼容，应用仍需按数据目录区分 Keychain key。正式 `build` 产物默认使用正式数据目录。

### 完整浏览器界面（0.17.0）

FIA 0.17.0 把完整浏览器界面作为默认能力，覆盖开发、预览与正式构建；`fia create` 新应用也自带入口。每个网页窗口标题栏最右侧提供“在浏览器中打开”按钮，打开该窗口配置的应用内页面，保留原生窗口。框架按钮不受应用 `setTitlebar([])` 影响。

应用 CLI 支持 `open --browser`，默认打开主窗口；开发使用 `fia agent open --browser`，预览使用 `fia agent --preview open --browser`。普通操作不打印凭证，显式追加 `--url` 才输出 60 秒单次授权链接。

浏览器和原生窗口共享后端与持久数据，各自保留未保存的页面状态。授权仅限当前后端运行期间，刷新可恢复；后端重启、更新或应用 / 托盘菜单“断开浏览器连接”后，页面提示重新从标题栏进入并停止无效重连。

服务仍只监听本机，裸 IP 与端口不授予 API 权限。浏览器使用独立的标签页会话与按客户端绑定的 Service Worker，保护 API、动态插件模块、CSS、SSE 和资源。业务 WebSocket 应使用 `@semicoder/fia/client` 的 `await openWebSocket("/api/stream", protocols)`，由框架交换短效握手票据。

文件对话框、剪贴板、窗口、外观、通知和更新等可用；直接调用钥匙串、CLI 管理、退出、全局快捷键、屏幕捕获及未知原生方法被拒绝。`native.capabilities()` 反映当前权限。浏览器 `ready()` 不能代替原生窗口完成更新健康验证。

该能力随 FIA 0.17.0 发布，麻辣烫 0.3.0 已接入。由于原生 Host 改变，已有应用需要重新分发完整安装包；只更新业务代码无法增加标题栏入口。

### 原生窗口置顶（0.18.0）

默认项目的原生标题栏在浏览器入口左侧增加置顶图标。点击“置顶窗口”后图标填充高亮，当前窗口保持在当前桌面的普通窗口之上；再次点击“取消置顶”恢复。加载或后端重连时仍可操作，应用自定义标题栏不会移除该按钮。

隐藏再显示、后端重启会保留当前窗口的置顶状态；真正关闭后重建窗口或重启应用恢复不置顶。它不控制浏览器自身窗口，也不把窗口移动到其他桌面或全屏空间。已有应用需升级 FIA 后重新构建并分发完整安装包，业务代码更新无法替换原生宿主。麻辣烫 0.4.0 已接入此按钮，0.3.0 及更早版本需通过完整 DMG 升级。

## 随首个应用共同开发（尚未发布）

FIA 正在迁入麻辣烫仓库的 `framework/fia/`，通过同一提交完善框架与首个正式应用，待麻辣烫稳定后独立拆出。框架仍保留独立 API、模板、测试和归档消费能力；当前公开 npm 0.18.0 不包含这次维护流程变更。

共仓维护需要 Swift 6 工具链及 Bun 1.4.3，统一开发入口会自动重建 FIA 并重启开发实例。新的开发 CLI 支持重复传入 `--watch-ignore <项目相对目录>`，供外层构建工具排除已经由其管理的子树，按目录边界匹配；普通应用无需使用。框架重启后未保存页面状态不恢复，浏览器需要重新授权。Bun 1.4.3 内置运行时尚未发布，公开 FIA 0.18.0 仍使用 1.4.2；运行时更换需应用重新构建完整安装包，不能只通过代码更新替换 Bun。

上述为尚未发布的源码开发说明；本文前面的 npm 安装及应用开发契约仍适用于已发布 0.18.0。
