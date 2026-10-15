---
id: "docs-fn-plugin-distribution"
slug: "plugin-distribution"
title: "构建与分发"
description: "插件 CLI、SDK 工具 API、归档校验、安装更新与静态市场索引。"
date: "2026-10-16"
---

> 适用于 fn 0.4.5 / SDK 0.3.5，manifest 为 0.3。先按[安装指南](/fn/docs/installation)安装 fn；旧名称插件和旧应用数据不迁移。

本页适用于 **fn 0.4.5 / SDK 0.3.5 / manifest 0.3**。制作插件从[入门教程](/fn/docs/plugin-development)开始；用户安装操作见[插件管理](/fn/docs/plugins)。

## CLI 命令

| 命令                               | 参数与行为                                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| fn plugin create &lt;directory&gt; | 目录必填；--template notes/model（默认 notes）、--id、--name；默认从目录名推导身份；拒绝非空目录 |
| fn plugin check [directory]        | 默认当前目录；检查包元信息、manifest、TypeScript、样式与资源，不修改源码                         |
| fn plugin build [directory]        | 先 check，再构建完整 dist；失败清除旧 dist 与半成品                                              |
| fn plugin pack [directory]         | 再次检查、构建，生成 `id-version.tgz` 并解包验证完整资源                                         |

四个子命令均支持 `--help`、`--json`；结果输出到 stdout，诊断输出到 stderr。成功退出 0，校验失败退出 1。目录含空格时加引号。源码开发宿主中对应 `bun run agent plugin …`。

```bash
fn plugin create ./my-notes --template notes --id my-notes --name 我的笔记
cd my-notes
bun install --ignore-scripts
fn plugin check --json
fn plugin build --json
fn plugin pack --json
```

CLI 复制固定 SDK 到 vendor，脚本消费项目自己的 SDK；复制项目时一起保留 vendor。生成的 bun run check/build/pack 调用相同实现。普通开发无需直接从 npm 安装 SDK；独立维护时可使用精确公开版本 `@semicoder/fn-sdk@0.3.5`，React 与 ReactDOM 19 应精确同版本，并保留生成项目所需的 TypeScript 和类型依赖。

## SDK 构建工具 API

这些 API 在 Bun 中执行，不能放进插件浏览器页面。来自 `@semicoder/fn-sdk/plugin`：

| 导出               | 参数                                                                                          | 返回值                                                    |
| ------------------ | --------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| createPlugin       | directory: string；options 包含必填 sdkArchive，及可选 template、id、name、templatesDirectory | Promise，结果含 directory、template、id、next、sdkVersion |
| checkPlugin        | directory: string                                                                             | Promise，结果含 root、pkg、manifest                       |
| buildCheckedPlugin | directory: string                                                                             | Promise，同 checkPlugin 结果；已生成并验证 dist           |
| packPlugin         | directory: string                                                                             | `Promise<string>`，归档绝对路径                           |
| runPluginTool      | args: string[]；可选 `options: { cwd?, sdkArchive?, templatesDirectory? }`                    | `Promise<number>`，CLI 退出码；会输出结果与诊断           |

低层 `buildPlugin(directory: string): Promise<void>` 从 `@semicoder/fn-sdk/build` 导入，只做构建；发布流程用 buildCheckedPlugin 或 packPlugin 以保留完整校验。`manifestSchema` 从 `/manifest` 导入，parse 返回规范化清单（含默认 keepAlive），safeParse 可检查错误。

CLI 项目的 tools.ts 如下，通常无需修改：

```ts
import { runPluginTool } from "@semicoder/fn-sdk/plugin";
process.exitCode = await runPluginTool(process.argv.slice(2), { cwd: import.meta.dir });
```

## 产物与本地安装

归档中包含 `package/package.json` 和完整 `package/dist/`，不包含源码、SDK 开发依赖或安装脚本。业务 JS 依赖会被打包；共享 React、JSX、ReactDOM、SDK UI 使用宿主实现。不要把原生依赖或需要额外运行时文件的 npm 包当作自动支持。

```bash
tar -tzf my-notes-0.1.0.tgz
shasum -a 256 my-notes-0.1.0.tgz
```

确认包含 client.js、client.css、可选 backend.js 及引用资源。在应用中心选择本地包安装，或使用**宿主管理 CLI**：

```bash
fn call plugins.install --json '{"source":"/absolute/path/my-notes-0.1.0.tgz"}'
fn call plugins.jobs --json '{}'
```

把示例路径改为真实归档绝对路径。install 只返回任务，按任务 id 在 jobs 中查询，直到 completed 或 failed；失败查看 message。支持 npm spec、Git HTTPS/GitHub spec 和本地归档，包必须预构建，宿主禁用安装脚本。npm 分发需单独执行发布流程，CLI pack 不会自动发布；Git 分发必须携带 dist。

## 更新与版本身份

修改后提高 package.json.version，保持 package name 和 manifest id。手动来源更新示例：

```bash
fn call plugins.update --json '{"pluginId":"my-notes","source":"/absolute/path/my-notes-0.1.1.tgz"}'
fn call plugins.jobs --json '{}'
```

市场安装的插件绑定原市场 ID、URL 和包身份；更新不提供 source，由宿主读取原市场。手动插件不会被同名市场自动接管。更新只接受更高稳定版本，不降级、不批量更新、不自动升级。

更新保留 KV、历史与启停状态，释放旧前端实例；先保存草稿并停止运行中的模型或方法调用。归档校验、激活或保存失败时宿主尝试恢复旧包，插件自行产生的外部副作用不在恢复范围内。

## 制作静态市场索引

市场索引是 HTTPS 托管的 JSON，不需要专用市场服务。schemaVersion 固定 1，name 非空（最多 100 字符），plugins 最多 1000 条，同一 id 只能有一个条目。以下是完整结构示例；**example.com 地址和全零哈希是占位，发布前必须替换**：

```json
{
  "schemaVersion": 1,
  "name": "我的插件市场",
  "plugins": [
    {
      "id": "my-notes",
      "packageName": "fn-plugin-my-notes",
      "name": "我的笔记",
      "description": "把想法保存到本机。",
      "icon": "记",
      "color": "#686868",
      "version": "0.1.0",
      "sdkVersion": "0.3",
      "url": "https://example.com/plugins/my-notes-0.1.0.tgz",
      "sha256": "0000000000000000000000000000000000000000000000000000000000000000"
    }
  ]
}
```

| 条目字段                  | 约束                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| id                        | 与清单同规则：2–64 位小写字母/数字/连字符，首字母，非宿主保留名                                   |
| packageName               | npm 风格包名，最多 214 字符；与包内 name 相同                                                     |
| name / description / icon | name 去空白后 1–100 字符，description 最多 1000，icon 长度 1–16；建议与更严格的 manifest 保持一致 |
| color                     | 六位十六进制颜色                                                                                  |
| version                   | 无前导零的 x.y.z 稳定版本，每段最多 9 位，与包版本一致                                            |
| sdkVersion                | 字符串，最多 20 字符；当前插件填写 0.3，与包内清单一致                                            |
| url                       | 最多 2000 字符的 HTTPS URL，无用户名、密码或片段                                                  |
| sha256                    | 64 位小写十六进制，必须是最终归档的真实哈希                                                       |

索引与条目是 strict schema，不增加自定义字段。索引 URL 同样必须为无凭证、无片段的 HTTPS 地址，重定向仍需 HTTPS；首版没有私有源认证、作者签名或预发布通道。SHA-256 验证内容一致性，不代表作者身份认证。

## 分发操作顺序

1. 检查、构建并打包，在隔离开发环境安装验收；固定最终归档，不再覆盖同版本内容。
2. 上传到稳定 HTTPS 地址，从公开地址下载后重新计算 SHA-256，与本地产物比较。
3. 将真实 URL、哈希、包名、ID、版本与 sdkVersion 写入索引，发布 JSON。
4. 在应用中心添加该市场，刷新目录并安装验证；后续仅在新归档验收后更新索引。

宿主最多配置 20 个市场，索引最多 2 MiB，索引请求最长 15 秒；市场归档最多 50 MiB，安装过程最长 120 秒，最多跟随 5 次重定向。刷新失败保留旧缓存；安装和更新仍重新获取并验证条目、哈希及包身份，不能用过期缓存保证安装成功。

官方源在 [fn-plugins](https://github.com/semicoder-dev/fn-plugins) 维护，宿主不携带官方插件。自行托管市场不等于进入官方源；官方上架遵守该仓库的贡献和发布流程。

## 宿主管理 API 与类型变更

客户端没有 plugins 或 marketplaces 命名空间。管理安装与来源使用[自动化 CLI](/fn/docs/automation)：marketplaces.list/add/update/remove/refresh/catalog、plugins.install/installFromMarket/update/jobs/list 等。普通插件业务只使用[客户端 API](/fn/docs/plugin-client-api)。

PluginInfo 使用可空 market（marketId/marketURL），InstallJob 包含 operation 和 targetVersion；manifest 为 0.3。官方插件当前独立消费固定公开 `@semicoder/fn-sdk@0.3.4`。仅支持 fn 的包名、清单字段与运行时，不提供旧插件迁移。

来源：SDK 工具：`packages/sdk/plugin.ts`（[v0.4.5 源码](https://github.com/semicoder-dev/fn/tree/v0.4.5)）、市场 schema：`shared/marketplace.ts`（[v0.4.5 源码](https://github.com/semicoder-dev/fn/tree/v0.4.5)）、安装与更新实现：`backend/plugins.ts`（[v0.4.5 源码](https://github.com/semicoder-dev/fn/tree/v0.4.5)）。
