---
id: "docs-malatang-installation"
slug: "installation"
title: "下载与安装"
description: "下载麻辣烫正式 DMG，或使用同一版本的公开源码自行构建。"
date: "2026-10-10"
---

## 下载麻辣烫

麻辣烫官网位于 [Semicoder 的麻辣烫项目页](/malatang)，本页是统一安装入口。

**当前版本：0.4.1（Build 5）。** 支持 **macOS 14 及以上、Apple Silicon（M 系列）**；当前不支持 Intel、Windows 或 Linux。应用和 DMG 已使用 Developer ID 签名，DMG 已通过 Apple 公证。

- [下载麻辣烫 0.4.1 DMG](https://github.com/potato47/malatang/releases/download/v0.4.1/Malatang-0.4.1-5-mac-arm64.dmg)
- [下载 SHA-256 校验文件](https://github.com/potato47/malatang/releases/download/v0.4.1/Malatang-0.4.1-5-mac-arm64.dmg.sha256)
- [查看本次发行说明](https://github.com/potato47/malatang/releases/tag/v0.4.1)

使用应用无需安装 Git、Bun 或 Swift。首次安装：

1. 下载并打开 DMG。
2. 将 `Malatang.app` 拖入 **Applications / 应用程序**。
3. 推出磁盘映像，从“应用程序”打开麻辣烫。
4. 前往 [第一次使用](/malatang/docs/getting-started)，配置自己的模型服务或体验随手记插件。

如需校验下载完整性，将 DMG 和校验文件放在同一目录，进入该目录执行：

```bash
shasum -a 256 -c Malatang-0.4.1-5-mac-arm64.dmg.sha256
```

应显示 `Malatang-0.4.1-5-mac-arm64.dmg: OK`。校验失败时重新下载，不继续安装。

## 从源码构建

仅开发者需要本节。以下固定使用公开 **v0.4.1** 标签，FIA 源码位于同仓的 `framework/fia/`，与应用一起构建，不再下载相邻框架归档。本机构建不会自动获得官方签名和公证。

需要 Git、**Bun 1.4.3 和 Swift 6 工具链**（Xcode / Command Line Tools）；系统要求与 DMG 相同。Bun 的安装方法见[官方说明](https://bun.sh/docs/installation)。在新建目录执行，不要覆盖已有项目。

### 获取固定源码

```bash
git clone --branch v0.4.1 --single-branch https://github.com/potato47/malatang.git
cd malatang
bun install --frozen-lockfile --ignore-scripts
```

框架与运行时从同一提交生成，报告记录源码、工具链和输入 / 产物哈希。FIA 独立 npm 0.18.0 不包含共仓改动，不能用相同版本字符串替换来源。历史 v0.4.0 及更早标签继续使用各自的 `release/runtime-lock.json`，不能混用当前构建步骤。

### 运行或构建

开发体验：

```bash
bun run dev
```

构建本机应用：

```bash
bun run check
bun run build
open dist/Malatang.app
```

构建结果位于 `dist/Malatang.app`。开发实例与安装应用的数据各自独立，模型配置和插件不会自动迁移。开发插件可继续阅读 [插件开发](/malatang/docs/plugin-development)，本版本使用 `@semicoder/malatang-sdk`。

从 0.4.0 起，`bun run dev` 显示 `Malatang Dev`（黄色 `DEV`），使用 `.fia/dev/data`；`bun run run` 启动 `Malatang Preview`（蓝色 `PREV`），使用 `.fia/preview/data`。菜单栏和窗口标题也会标明环境，两者均停用正式更新源，可与官网版同时运行。预览数据跨重启保留，首次需单独配置模型。

直接打开 `dist/Malatang.app` 默认使用正式数据目录，与官网下载版共用数据，同目录的第二个实例会被阻止启动。日常测试请用 dev / run。旧 0.2.0 的 `run` 尚无预览隔离，不适用上述规则。

## 后续更新

稳定更新源提供 0.4.1（Build 5）清单，可在「设置 → 应用更新」检查发行。0.4.1 更换原生 Host 和 Bun 1.4.3，**请下载完整 DMG，退出旧应用后替换安装**，不能只靠代码更新。

ChatGPT 旧钥匙串登录不迁移，也不会被删除；升级后重新登录，删除旧的未连接订阅模型，再从新账号目录添加，不自动重绑账号，见[凭证与数据](/malatang/docs/models#凭证与数据)。SDK 0.2 及更早插件需更新为 SDK 0.3 的组件 API 与 manifest，重新构建安装，见[插件迁移](/malatang/docs/plugin-development#打包安装与旧插件迁移)。普通 API Key、模型配置、插件记录、KV、外观和历史保留。跨版本代码热更新仍未实测。

更新由用户确认，模型、插件或登录任务忙碌时推迟。原生运行时变化需要从本页重新下载完整安装包；代码更新不会替你升级独立安装的插件。

0.3.0 起默认提供标题栏最右侧“在浏览器中打开”按钮，开发、预览和正式版都可使用；原生窗口与浏览器共享后端和持久数据。刷新可继续使用，重启、更新或“断开浏览器连接”后需重新授权。具体见[第一次使用](/malatang/docs/getting-started)。

0.4.0 在浏览器入口左侧新增置顶图标，点击即可置顶当前原生窗口，再次点击取消。窗口隐藏再打开会保留，退出应用后重置；不控制浏览器窗口或跨桌面显示。

## 共同开发

0.4.1 将 FIA 源码放入 `framework/fia/`，与应用一起构建，麻辣烫稳定后再独立拆出框架。FIA 独立 npm 发布暂时停止，现有公开包继续保留。

维护者需要 Apple Silicon macOS、Bun 1.4.3 和 Swift 6，在仓库根执行 `bun run dev`。框架 TypeScript 或原生修改会重建并重启开发实例，应用前端继续 HMR；重启清除未保存页面状态并使浏览器授权失效，持久业务数据保留。依赖或维护工具变化时按终端提示重新安装或重启。

`run`、`build`、`check` 也会准备匹配的框架；`framework:check`、`framework:pack`、`framework:verify` 分别检查框架、验证归档和验证仓库外独立消费。依赖或维护工具变化时需按终端提示重新安装或重启。此工具链要求只针对开发源码，安装正式 DMG 的用户无需安装 Swift。
