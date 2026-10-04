---
id: "docs-malatang-installation"
slug: "installation"
title: "下载与安装"
description: "查看发布状态，或用公开源码和固定 FIA 运行时构建应用。"
date: "2026-10-04"
---

## 下载状态

**截至 2026-10-04，尚无公开的麻辣烫应用 DMG。** 可以查看 [GitHub Releases](https://github.com/potato47/malatang/releases) 获取后续发行信息。当前以 `fia-runtime-` 命名的预发布只包含框架依赖，不是麻辣烫安装包。

正式发行的安装方式是打开 DMG，将 `Malatang.app` 拖到 Applications，然后从应用程序目录启动。当前可按下面步骤自行构建；不需要等待 FIA 源码仓库公开，也不需要编译 Swift。

## 准备环境

需要 macOS 14+、Apple Silicon、Git 和 Bun 1.4.2。下载 Bun 的方法见 [官方安装说明](https://bun.sh/docs/installation)。以下命令在一个新建的工作目录执行，不要覆盖已有 `fia` 或 `malatang` 项目。

## 获取已核对的源码

```bash
mkdir malatang-workspace
cd malatang-workspace
git clone https://github.com/potato47/malatang.git
cd malatang
git checkout 300453def9ac082b21922f3216f4f41be25a89ef
```

本页使用固定提交。若使用其他版本，请同时使用该版本 `release/runtime-lock.json` 中的框架依赖，不能混用任意 npm 同版本包。

## 准备固定 FIA 运行时

在 `malatang` 目录执行：

```bash
curl --fail --location --output fia-runtime.tgz \
  https://github.com/potato47/malatang/releases/download/fia-runtime-8650f80f4a11/semicoder-fia-0.16.1.tgz
printf '%s  %s\n' \
  e4206d0a416526e21df6387a64ca847c249fc2b9ede5db6e8c84494274ff9a16 \
  fia-runtime.tgz | shasum -a 256 -c -
```

只有输出 `fia-runtime.tgz: OK` 才继续解压。如果校验失败，停止操作并重新核对来源，不跳过检查。

```bash
mkdir -p ../fia/packages/cli
tar -xzf fia-runtime.tgz --strip-components=1 -C ../fia/packages/cli
bun install --frozen-lockfile --ignore-scripts
```

归档自带 Host 和 Bun，且包含麻辣烫需要的框架改进。安装后会得到下面的相邻目录结构：

```text
malatang-workspace/
├── fia/packages/cli/     固定框架包
└── malatang/            应用源码
```

## 运行或构建

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

构建结果位于 `dist/Malatang.app`，是本机开发构建，不是正式签名公证发行版。运行最终应用不需要系统 Bun。开发实例与构建应用的数据各自独立，模型配置和插件不会自动迁移。

完成后阅读 [第一次使用](/malatang/docs/getting-started)。如果需要开发插件，继续 [插件开发](/malatang/docs/plugin-development)。

## 后续更新

正式安装包配置签名更新源后，可以从「设置 → 应用更新」检查。更新由用户确认，任务忙碌时推迟；运行时变化需要重新下载安装包。当前尚无公开稳定更新清单，因此不能据此承诺已可在线升级。
