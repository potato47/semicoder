---
id: "docs-fn-installation"
slug: "installation"
title: "下载与安装"
description: "下载 fn 0.4.4，安装官方插件，了解独立数据目录和源码构建。"
date: "2026-10-15"
---

## 下载 fn

当前版本为 **fn 0.4.4 / build 8**，支持 **macOS 14+ / Apple Silicon**。应用与 DMG 使用 Developer ID 签名，DMG 已通过 Apple 公证并附带公证票据。

[下载 fn 0.4.4（Apple Silicon）](https://github.com/semicoder-dev/fn/releases/download/v0.4.4/fn-0.4.4-8-mac-arm64.dmg) · [发行说明](https://github.com/semicoder-dev/fn/releases/tag/v0.4.4)

下载并打开 DMG，将 `fn.app` 拖入「应用程序」，然后从「应用程序」启动。普通用户无需安装 Bun、Node.js 或 Swift。

安装包 SHA-256：

```text
0258a257fec62dd3a4c081572103053a9025a4ffdabb9379f8f0a805c5909994
```

## 从原麻辣烫开始使用 fn

本次使用完整 DMG 安装。fn 的应用标识为 `com.semicoder.fn`，数据保存在 Application Support 下的独立目录；不读取、移动或删除旧应用的数据，不提供旧名称、旧 CLI 或旧插件别名。

首次启动后重新配置模型或登录 ChatGPT，再安装插件。旧应用仍保留自己的数据；不要将其目录复制到 fn。插件开发者须改用新 SDK、`fn` 清单和新运行时标识后重新构建，manifest 兼容版本仍为 `0.3`。

## 安装官方插件

fn 不内置插件。在「应用中心 → 插件市场」安装 **译文 0.1.2** 和 **随手记 0.1.2**。译文使用宿主模型，随手记使用本地 KV，无需模型。接着阅读[第一次使用](/fn/docs/getting-started)和[插件管理](/fn/docs/plugins)。

官方插件由 [fn-plugins](https://github.com/semicoder-dev/fn-plugins) 通过 GitHub Releases 分发；它们不是公开 npm 插件包。官方市场只登记已经公开下载并校验过的完整归档，检查到更新后由用户逐个确认安装。

如需本地构建，在该仓库根执行：

```bash
bun install --frozen-lockfile --ignore-scripts
bun run check
bun run test
bun run pack
bun run index:check
```

当前仓库固定消费公开 `@semicoder/fn-sdk@0.3.4`，不依赖相邻源码。生成的 `artifacts/translate-0.1.2.tgz` 和 `artifacts/quick-notes-0.1.2.tgz` 可通过「从地址安装」选择；本地打包不会自动上架。

## 插件开发与 SDK

应用菜单可安装 `fn` 命令行。按[插件开发](/fn/docs/plugin-development)创建项目，CLI 会携带 SDK 0.3.4 固定快照；项目可脱离宿主源码开发。独立维护时也可使用固定公开版本：

```bash
bun add --dev --exact @semicoder/fn-sdk@0.3.4
```

开发插件需要 Bun 1.4.2 或更高版本；React 与 ReactDOM 19 应精确同版本，并保留模板所需的 TypeScript 和类型依赖。SDK、应用和插件的版本分别管理。

## 从源码构建

源码见 [fn v0.4.4](https://github.com/semicoder-dev/fn/tree/v0.4.4)。源码构建需要 Bun 1.4.3 和 Swift 6 工具链（Xcode / Command Line Tools）。在仓库根执行：

```bash
bun install --frozen-lockfile --ignore-scripts
bun run check
bun run build
```

产物为 `dist/fn.app`；本地构建不具备官方发行的签名公证证明。FIA 源码在同仓 `framework/fia/`，报告记录源码、工具链和产物哈希，不需要相邻 FIA 仓库。

日常体验使用 `bun run dev` 或 `bun run run`。开发实例为 `fn Dev` / `fn-dev`，使用 `.fia/dev/data/com.semicoder.fn`；预览为 `fn Preview` / `fn-preview`，使用 `.fia/preview/data/com.semicoder.fn`。两者带 DEV / PREV 标记，并禁用正式更新源。直接打开 `dist/fn.app` 使用 fn 正式数据目录；三种模式互相隔离。

## 后续更新

应用更新源为 `https://semicoder-dev.github.io/fn/updates/latest.json`。启动时及每 24 小时检查更新，安装前需用户确认；任务忙碌时推迟，原生运行时变化需要完整 DMG。首次 fn 发行尚无跨版本公开升级实测，不将模拟回归当成真实升级证据。

更新站独立保存 fn 历史，不提供旧更新源回退。官方市场为 `https://raw.githubusercontent.com/semicoder-dev/fn-plugins/main/marketplace.json`；插件更新与宿主更新分开管理。

## 共同开发

FIA 与 fn 共仓开发，fn 稳定后再独立拆出框架，FIA 独立 npm 继续暂停。`dev` 自动监听框架源码并重建、重启，应用前端保持 HMR；重启会清除未保存状态并使浏览器授权失效。

`framework:check`、`framework:pack`、`framework:verify` 分别检查框架、验证归档和仓库外独立消费。公开 FIA 0.18.0 与当前共仓源码并非同一产物。
