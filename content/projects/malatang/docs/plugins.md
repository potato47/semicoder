---
id: "docs-malatang-plugins"
slug: "plugins"
title: "安装与管理插件"
description: "通过应用中心或 CLI 安装预构建插件，了解启停、升级和数据保留。"
date: "2026-10-10"
---

本页适用于麻辣烫 **0.4.2**。应用不内置插件，所有插件由用户安装；旧版本升级请先阅读[升级说明](/malatang/docs/installation#后续更新)。

## 从插件市场安装

首次启动进入「应用中心 → 插件市场」。官方市场提供「译文」和「随手记」，点击安装，任务成功后即可打开。随手记不需要模型，适合先体验安装与本地保存。

进入市场会检查更新；有新版时逐个点击「更新」，不会自动安装。支持搜索、市场筛选、刷新及来源管理。安装与更新需要联网，成功读取的索引保留离线缓存和更新时间；一个来源失败不影响已安装插件运行。

## 管理市场源

默认配置[官方市场](https://github.com/potato47/malatang-plugins)。在「管理市场源」添加名称与 HTTPS 索引地址，也可重命名、启停和删除。官方源同样可以停用或删除，重启后不会恢复；修改地址请删除后重新添加。

不同源的同 ID 条目分别显示来源。已安装插件固定使用原市场更新，不跨来源替换；来源被删后插件仍可运行。手动安装不自动关联市场，如需市场更新，先卸载再从选定市场安装相同 ID。

## 从地址安装

点击「从地址安装」，输入来源或「选择本地包」，再安装。

| 来源   | 输入形式                  | 要求                                       |
| ------ | ------------------------- | ------------------------------------------ |
| 本地包 | `.tgz` 绝对路径或文件选择 | 使用 `malatang plugin pack` 生成的完整归档 |
| npm    | 包名或带版本包名          | 包已存在并预构建                           |
| Git    | `git+https://…`           | 仓库含可运行 `dist`，安装时不编译          |

官方插件通过 GitHub Releases 分发，不是公开 npm 插件包。npm / Git 入口保留，真实第三方远端插件未逐一验收。

## 更新、启停与卸载

「已安装」页提供打开、启停、卸载、任务和错误反馈。更新只接受更高的稳定 `x.y.z` 版本，校验后切换，保留启停状态、KV 与历史。激活或保存失败恢复旧版本；请先保存草稿，更新会释放旧页面。

正在运行的模型任务或插件调用会阻止替换、停用和卸载。卸载保留 KV 和历史，重新安装相同 ID 可以继续读取。手动插件通过 `plugins.update` 显式指定新版来源更新。

## 兼容与信任

manifest `sdkVersion` 仍为 `"0.3"`。SDK 0.2 及更早插件须按[开发指南](/malatang/docs/plugin-development#打包安装与旧插件迁移)更新组件 API 并重建。仅修改 manifest 不能完成迁移。

市场安装先校验归档 SHA-256，再核对包名、ID、版本、SDK 和资源。插件是能执行本机代码的可信扩展，禁用安装脚本不等于沙箱，只安装信任的来源。

## CLI

```bash
malatang call marketplaces.refresh --json '{}'
malatang call marketplaces.catalog --json '{"offset":0,"limit":20}'
malatang call plugins.installFromMarket --json '{"marketId":"official","pluginId":"quick-notes"}'
malatang call plugins.jobs --json '{}'
malatang call plugins.update --json '{"pluginId":"quick-notes"}'
malatang call plugins.install --json '{"source":"/absolute/path/plugin.tgz"}'
```

安装更新返回任务，接受任务不表示成功，继续查询 `plugins.jobs` 终态。开发项目使用 `bun run agent` 代替 `malatang`。重连后重新读取市场、插件和任务快照。

## 发布市场

市场使用静态 JSON v1，包含 `schemaVersion/name/plugins`；条目包含 `id/packageName/name/description/icon/color/version/sdkVersion/url/sha256`。只列当前稳定版本，索引与归档使用 HTTPS，无需专门市场服务。

参考[官方仓库](https://github.com/potato47/malatang-plugins)及[宿主协议](https://github.com/potato47/malatang/blob/v0.4.2/docs/plugin-marketplace.md)。官方插件分别打标签、上传归档，验收公开下载哈希后通过索引 PR 上架。
