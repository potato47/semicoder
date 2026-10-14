---
id: "docs-fn-installation"
slug: "installation"
title: "下载与安装"
description: "fn 尚未发布，当前通过本地源码构建并安装插件归档。"
date: "2026-10-14"
---

## 当前状态

**本地开发、尚未发布。** fn 新名称下尚无经过本次验收的公开 DMG、npm SDK 或官方市场。本页不提供旧产物冒充的新下载链接。应用源码保持 0.4.3 / build 7，SDK 源码保持 0.3.2 / manifest 0.3，版本号未因日常重构增加。

支持 **macOS 14+ / Apple Silicon**。源码构建需要 **Bun 1.4.3 和 Swift 6 工具链**（Xcode / Command Line Tools）。新 GitHub 仓库名称尚未落地；使用已完成更名的本地 fn checkout，不从历史发行标签推断新契约。

## 从源码构建

在本地 fn 仓库根目录执行：

```bash
bun install --frozen-lockfile --ignore-scripts
bun run check
bun run build
```

产物为 `dist/fn.app`；本地构建不具备官方发行的签名公证证明。FIA 源码在同仓 `framework/fia/`，报告记录源码、工具链和产物哈希，不需要相邻 FIA 仓库。

日常体验使用以下任一入口：

```bash
bun run dev
# 或打包预览
bun run run
```

开发实例为 `fn Dev`，使用 `.fia/dev/data/com.semicoder.fn`；预览为 `fn Preview`，使用 `.fia/preview/data/com.semicoder.fn`。两者有 DEV / PREV 标记，均禁用正式更新源。直接打开 `dist/fn.app` 使用 Application Support 下的 `com.semicoder.fn` 正式数据目录。

三种身份互相隔离，fn 不读取、移动或删除旧应用的数据。首次使用需要独立配置模型、登录和插件；不提供名称兼容、旧插件适配或迁移步骤。

## 安装官方插件的本地归档

独立 `fn-plugins` 仓库携带经过校验的 `vendor/fn-sdk.tgz`，无需相邻宿主源码或未发布的 npm 包。在该仓库根执行：

```bash
bun install --frozen-lockfile --ignore-scripts
bun run check
bun run test
bun run pack
bun run index:check
```

在 fn「应用中心 → 从地址安装」选择 `artifacts/translate-0.1.1.tgz` 或 `artifacts/quick-notes-0.1.1.tgz`。这些是本地候选归档，不是已发布版本；正式索引暂为空，打包不会上架。接着阅读[第一次使用](/fn/docs/getting-started)。

开发自己的插件请按[插件开发](/fn/docs/plugin-development)通过 CLI 生成带 SDK 快照的项目。

## 后续更新

目标官网为 `https://semicoder.dev/fn`，更新源为 `https://semicoder-dev.github.io/fn/updates/latest.json`，官方市场为 `https://raw.githubusercontent.com/semicoder-dev/fn-plugins/main/marketplace.json`。这些新入口尚未发布，当前检查可能报告不可用。

后续需分别完成 GitHub 更名、新 SDK、插件归档及市场、完整 DMG 和官网部署验收，才会增加正式下载入口。新身份使用独立更新站，不提供旧更新源回退。fn 内部更新仍需用户确认，任务忙碌时推迟；原生运行时变化需要完整安装包。

## 共同开发

FIA 与 fn 共仓开发，fn 稳定后再独立拆出框架，FIA 独立 npm 继续暂停。`dev` 自动监听框架源码并重建、重启；应用前端保持 HMR。重启清除未保存状态并使浏览器授权失效。

`framework:check`、`framework:pack`、`framework:verify` 分别检查框架、验证归档和仓库外独立消费。公开 FIA 0.18.0 与当前共仓源码并非同一产物。
