---
id: "docs-malatang-installation"
slug: "installation"
title: "下载与安装"
description: "下载麻辣烫正式 DMG，或使用同一版本的公开源码自行构建。"
date: "2026-10-09"
---

## 下载麻辣烫

麻辣烫官网位于 [Semicoder 的麻辣烫项目页](/malatang)，本页是统一安装入口。

**当前版本：0.3.0（Build 3）。** 支持 **macOS 14 及以上、Apple Silicon（M 系列）**；当前不支持 Intel、Windows 或 Linux。应用和 DMG 已使用 Developer ID 签名，DMG 已通过 Apple 公证。

- [下载麻辣烫 0.3.0 DMG](https://github.com/potato47/malatang/releases/download/v0.3.0/Malatang-0.3.0-3-mac-arm64.dmg)
- [下载 SHA-256 校验文件](https://github.com/potato47/malatang/releases/download/v0.3.0/Malatang-0.3.0-3-mac-arm64.dmg.sha256)
- [查看本次发行说明](https://github.com/potato47/malatang/releases/tag/v0.3.0)

使用应用无需安装 Git、Bun 或 Swift。首次安装：

1. 下载并打开 DMG。
2. 将 `Malatang.app` 拖入 **Applications / 应用程序**。
3. 推出磁盘映像，从“应用程序”打开麻辣烫。
4. 前往 [第一次使用](/malatang/docs/getting-started)，配置自己的模型服务或体验随手记插件。

如需校验下载完整性，将 DMG 和校验文件放在同一目录，进入该目录执行：

```bash
shasum -a 256 -c Malatang-0.3.0-3-mac-arm64.dmg.sha256
```

应显示 `Malatang-0.3.0-3-mac-arm64.dmg: OK`。校验失败时重新下载，不继续安装。

## 从源码构建

仅开发者需要本节。以下固定使用 **v0.3.0** 源码（提交 `7c0f237986728d13063fd25e38e0a826738af213`）和该版本的 FIA 归档，提供与本次发行一致的功能；本机构建不会自动获得官方签名和公证。

需要 Git 和 Bun 1.4.2；系统要求与 DMG 相同。下载 Bun 的方法见 [官方安装说明](https://bun.sh/docs/installation)。固定框架包自带 Host 和 Bun，不需要 FIA 源码或 Swift 编译器。以下命令在新建目录执行，不要覆盖已有 `fia` 或 `malatang` 项目。

### 获取固定源码

```bash
mkdir malatang-workspace
cd malatang-workspace
git clone https://github.com/potato47/malatang.git
cd malatang
git checkout 7c0f237986728d13063fd25e38e0a826738af213
```

若使用其他版本，请同时使用该版本 `release/runtime-lock.json` 中的框架依赖，不能混用任意 npm 同版本包。

### 准备固定 FIA 运行时

在 `malatang` 目录执行：

```bash
curl --fail --location --output fia-runtime.tgz \
  https://github.com/potato47/malatang/releases/download/fia-runtime-4689c707913c/semicoder-fia-0.17.0.tgz
printf '%s  %s\n' \
  521a07c387efa5b2c7ddbb76807b5c613b5b26cdf6e9c84fb965d27a5dd536b6 \
  fia-runtime.tgz | shasum -a 256 -c -
```

只有输出 `fia-runtime.tgz: OK` 才继续解压。如果校验失败，停止操作并重新核对来源，不跳过检查。

```bash
mkdir -p ../fia/packages/cli
tar -xzf fia-runtime.tgz --strip-components=1 -C ../fia/packages/cli
bun install --frozen-lockfile --ignore-scripts
```

安装后会得到相邻目录：

```text
malatang-workspace/
├── fia/packages/cli/     固定框架包
└── malatang/            应用源码
```

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

0.3.0 的 `bun run dev` 显示 `Malatang Dev`（黄色 `DEV`），使用 `.fia/dev/data`；`bun run run` 启动 `Malatang Preview`（蓝色 `PREV`），使用 `.fia/preview/data`。菜单栏和窗口标题也会标明环境，两者均停用正式更新源，可与官网版同时运行。预览数据跨重启保留，首次需单独配置模型。

直接打开 `dist/Malatang.app` 默认使用正式数据目录，与官网下载版共用数据，同目录的第二个实例会被阻止启动。日常测试请用 dev / run。旧 0.2.0 的 `run` 尚无预览隔离，不适用上述规则。

## 后续更新

稳定更新源已发布 0.3.0（Build 3）清单，可在「设置 → 应用更新」检查当前发行。0.3.0 更新了原生运行时，从 0.2.0 或更早版本升级需要下载上方完整 DMG，退出应用后替换原应用。模型配置、账号、KV 和运行历史保留；SDK 0.1 插件需要迁移到 SDK 0.2 并重新构建，详见 [插件开发](/malatang/docs/plugin-development)。跨版本代码热更新仍未实测。

更新由用户确认，模型、插件或登录任务忙碌时推迟。原生运行时变化需要从本页重新下载完整安装包；代码更新不会替你升级独立安装的插件。

0.3.0 默认提供标题栏最右侧“在浏览器中打开”按钮，开发、预览和正式版都可使用；原生窗口与浏览器共享后端和持久数据。刷新可继续使用，重启、更新或“断开浏览器连接”后需重新授权。具体见[第一次使用](/malatang/docs/getting-started)。
