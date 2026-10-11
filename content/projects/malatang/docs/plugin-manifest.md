---
id: "docs-malatang-plugin-manifest"
slug: "plugin-manifest"
title: "插件结构与生命周期"
description: "完整 manifest 字段、SDK 导入入口、页面和后端生命周期。"
date: "2026-10-11"
---

本页适用于 **麻辣烫 0.4.3 / SDK 0.3.2**。新项目先按[入门教程](/malatang/docs/plugin-development)生成，再修改业务源码。

## 项目结构

```text
my-notes/
  package.json          # 包身份、版本、malatang 清单
  tsconfig.json         # TypeScript 配置
  tools.ts              # SDK check/build/pack 入口
  vendor/malatang-sdk.tgz
  src/client.tsx        # 默认导出 React 页面
  src/styles.css        # 只导入 SDK tailwind.css
  src/page.module.css   # 可选局部样式
  src/assets/           # 被源码引用的图片等资源
  src/backend.ts        # 可选，默认导出 definePlugin 对象
  dist/                 # 构建生成，不手工维护
```

保存源码、锁文件和 vendor 归档。CLI 打包会收集清单及完整 dist；Git 来源安装则需自行提交预构建 dist。宿主不替插件执行构建或安装脚本。

## package.json 与 manifest

```json
{
  "name": "malatang-plugin-my-notes",
  "version": "0.1.0",
  "type": "module",
  "malatang": {
    "schemaVersion": 1,
    "id": "my-notes",
    "name": "我的笔记",
    "description": "把想法保存到本机。",
    "icon": "记",
    "color": "#686868",
    "sdkVersion": "0.3",
    "frontend": "dist/client.js",
    "styles": "dist/client.css",
    "keepAlive": true
  }
}
```

上面是包元信息片段，合并到 CLI 生成的 package.json，保留依赖与 scripts。包 `name` 用于分发身份，`version` 用于更新比较；市场仅接受 `x.y.z` 稳定版本。

| 字段          | 必填 / 默认 | 约束与含义                                                                        |
| ------------- | ----------- | --------------------------------------------------------------------------------- |
| schemaVersion | 必填        | 固定数字 `1`                                                                      |
| id            | 必填        | 2–64 位，首位小写字母，其余小写字母、数字、连字符；禁止 models、plugins、settings |
| name          | 必填        | 去除首尾空白后 1–60 字符                                                          |
| description   | 必填        | 字符串，最多 240 字符                                                             |
| icon          | 必填        | 字符串长度 1–4，适合一个短字或符号                                                |
| color         | 必填        | 六位十六进制颜色，如 `#686868`                                                    |
| sdkVersion    | 必填        | 固定字符串 `"0.3"`，不是 npm 包版本 `0.3.2`                                       |
| frontend      | 必填        | 固定 `dist/client.js`                                                             |
| styles        | 必填        | 固定 `dist/client.css`                                                            |
| backend       | 可选        | 声明时固定 `dist/backend.js`，并存在 `src/backend.ts`                             |
| keepAlive     | 默认 false  | 是否在当前窗口切页时保留已加载的页面实例                                          |

清单使用 strict schema，未知字段会被拒绝。入口必须在包内，不能通过绝对路径、`..` 或软链接访问包外文件。`PluginManifest` 类型中的入口是 string，但实际安装与检查以这些固定路径的 schema 为准。`manifestSchema` 可从 `@semicoder/malatang-sdk/manifest` 导入用于构建工具校验；普通项目由 CLI 自动检查。

## SDK 导入入口

| 入口                                          | 用途                                                                         |
| --------------------------------------------- | ---------------------------------------------------------------------------- |
| `@semicoder/malatang-sdk/client`              | 前端 createPluginClient                                                      |
| `@semicoder/malatang-sdk/types`               | JSONValue、模型、运行记录、插件与后端类型；使用 import type                  |
| `@semicoder/malatang-sdk/runtime`             | 后端 definePlugin、defineMethod、z；也导出 BackendPlugin、PluginContext 类型 |
| `@semicoder/malatang-sdk/ui`                  | 组件、图标、Size、Tone                                                       |
| `@semicoder/malatang-sdk/manifest`            | 构建工具中的 manifestSchema                                                  |
| `@semicoder/malatang-sdk/plugin`              | create/check/build/pack 工具及 runPluginTool                                 |
| `@semicoder/malatang-sdk/build`               | 低层 buildPlugin                                                             |
| `@semicoder/malatang-sdk/tailwind.css`        | 插件构建时的主题映射                                                         |
| `@semicoder/malatang-sdk/theme.css`、`ui.css` | 宿主加载的全局资源，插件不得导入                                             |

包没有根导出，不能直接从 `@semicoder/malatang-sdk` 导入客户端。不要深层导入 `src/`，也不要把后端模块导入前端。

## 页面生命周期

| 场景                           | 行为                                                                              |
| ------------------------------ | --------------------------------------------------------------------------------- |
| 首次打开                       | 按需加载并挂载页面                                                                |
| keepAlive false 时切走         | 卸载页面，执行 React effect cleanup；返回重新初始化                               |
| keepAlive true 时切走          | 保留状态、DOM、滚动位置；订阅和 effect 继续运行，页面不参与布局、键盘及无障碍访问 |
| 隐藏页面的公共浮层             | 关闭并释放键盘、焦点占用，不把焦点送回隐藏触发器                                  |
| 刷新、重启                     | 丢失未持久化状态；没有自动草稿恢复                                                |
| 停用、卸载、升级或资源身份变化 | 释放旧实例；重新启用后首次打开再挂载                                              |

短暂断线不等于卸载；重连后重新读取权威状态。keepAlive 没有自动淘汰机制，会持续占用内存。需要长期保存的数据用 KV，而不是仅依赖组件状态。

## 后端生命周期与持久化

前端卸载不等于后端 `dispose`，也不会自动取消模型任务。后端 `activate` 在插件启用加载时执行，`dispose` 负责正常停用、卸载、替换或宿主停止时的清理；进程意外终止不能保证执行清理。详见[后端 API](/malatang/docs/plugin-backend-api)。

卸载保留 KV 和运行历史；同 ID 重新安装可继续访问。更新保留启停状态与已存数据，但会丢失未保存草稿。模型运行、方法调用或生命周期切换期间，宿主会阻止冲突的停用、卸载或更新操作。

## 能力边界

插件按可信本地代码执行。ID 命名空间、CSS 作用域和前后端入口区分都不是安全沙箱。宿主目前提供文本模型生成、运行记录、JSON KV 和插件方法；没有公共工具注册、预设 agent loop、自建长任务托管或自动升级 API。

来源：[SDK 固定版本](https://github.com/semicoder-dev/malatang/tree/sdk-v0.3.2/packages/sdk/src)、[宿主插件实现](https://github.com/semicoder-dev/malatang/blob/v0.4.3/backend/plugins.ts)。
