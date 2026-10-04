---
id: "docs-fia-distribution"
slug: "distribution"
title: "构建、版本与分发"
description: "区分 npm 发行版、麻辣烫固定框架构建和最终应用安装包。"
date: "2026-10-04"
---

## 当前可获取的版本

核对日期：2026-10-04。

| 产物                | 获取方式                                                                               | 范围                                                                 |
| ------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| FIA npm 0.16.1      | [npm](https://www.npmjs.com/package/@semicoder/fia)                                    | 已发布的 FIA 4 基础框架，含预编译 Apple Silicon 运行时               |
| 麻辣烫固定 FIA 构建 | [框架归档](https://github.com/potato47/malatang/releases/tag/fia-runtime-8650f80f4a11) | 源码基线 `8650f80f4a11`，用于麻辣烫构建；包版本同为 0.16.1，内容不同 |
| 麻辣烫应用          | [下载与安装说明](/malatang/docs/installation)                                          | 当前可从源码构建；公开应用 DMG 尚未发布                              |

框架归档 `.tgz` 是开发依赖，不是双击安装的应用。FIA 4 的“4”也不是 npm 版本号。

## 本机构建

```bash
bun run check
bun run build
```

`fia build` 生成本机 `.app`，包含固定的原生宿主、Bun、CLI 与业务资源。普通使用者不需要另装运行时。本机构建不等于已通过 Developer ID 签名和公证的公开发行包。

## 公开应用分发

npm 0.16.1 的 `fia release` 使用 Developer ID 签名、公证并输出 ZIP。配置 `signing.releaseIdentity` 与 `signing.notarizationProfile` 后执行项目中的 `bun run release`。证书、公证凭据由发布者准备，不进入仓库。

较新的固定构建改为 DMG：`fia build --dmg` 创建本机测试镜像，`fia release` 对应用和 DMG 签名、公证并检查镜像内应用，输出 DMG、SHA-256 与报告。签名身份是 Developer ID Application，不是 Developer ID Installer。此能力尚不能视为公开 npm 0.16.1 已有功能。

## 签名代码更新

FIA 支持前后端代码一起更新。先生成 Ed25519 密钥，把公钥和更新源放入应用配置，私钥由发布环境保管。

```bash
bunx fia update keygen --output /secure/path/my-app-keys
FIA_UPDATE_PRIVATE_KEY_FILE=/secure/path/my-app-keys/update-private.pem bunx fia release --update
```

每次提高 `app.version` 和 `app.build`。将 `dist/updates/releases/<build>/` 上传到对应 HTTPS 地址，最后发布 `latest.json`。CLI 生成产物，不自动上传。

## 更新边界

- 下载后由用户确认生效；活动调用、脚本或 `beforeUpdate` 报忙会推迟切换。
- 启动或观察失败回退代码；用户数据不会一起回退，数据迁移需兼容旧代码。
- 原生宿主、Bun、系统权限或其他运行时配置变化，需要完整安装包。
- 应用业务依赖需能打包为 JS/TS、静态资源或 WASM；不能把额外原生可执行文件当成普通代码热更新。

安装入门从 [快速开始](/fia/docs/installation) 继续；生产行为以所用包内框架契约为准。
