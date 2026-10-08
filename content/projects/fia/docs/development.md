---
id: "docs-fia-development"
slug: "development"
title: "开发与原生能力"
description: "了解进程分工、窗口生命周期和真实宿主上的浏览器调试。"
date: "2026-10-04"
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

## 已发布版本与固定构建

本文基础能力面向 npm 0.16.1。麻辣烫使用的固定构建还增加了应用原生外观、系统浏览器 OAuth 回调、系统代理继承与钥匙串等待修复。它们属于较新的源码能力，使用前核对包内契约，见 [版本与分发](/fia/docs/distribution)。

### 本地源码中的开发标记（尚未发布）

2026-10-08 的本地源码新增开发身份区分：`fia dev` 显示 `Dev` 名称、黄色 `DEV` Dock 标记和菜单栏文字，macOS Bundle ID 追加 `.dev`。`fia run` 改为独立的 `Preview` 打包预览，使用蓝色 `PREV` 标记、`.preview` Bundle ID 和 `.fia/preview/data` 数据目录；`fia agent --preview` 控制该预览。两种本地模式均停用正式更新源。

这些能力尚不包含在公开 npm 0.16.1 或麻辣烫当前固定 FIA 归档中，请勿把新 `run` 隔离行为套用于旧版本。开发数据继续沿用 `.fia/dev/data`；逻辑应用标识与 Keychain service 保持兼容，应用仍需按数据目录区分 Keychain key。正式 `build` 产物默认使用正式数据目录。
