---
id: "docs-malatang-plugin-development"
slug: "plugin-development"
title: "开发第一个插件"
description: "用麻辣烫 CLI 创建独立插件项目，共享宿主组件、模型与本地存储。"
date: "2026-10-05"
---

## 准备开发环境

本页适用于 **麻辣烫 0.2.0 / SDK 0.2**。先完成 [安装](/malatang/docs/installation)，从应用菜单安装 CLI，并安装 [Bun](https://bun.sh/docs/installation) 1.4.2 或以上。普通应用用户不需要 Bun。

插件项目可以放在任意目录。CLI 会复制随应用提供、经过验证的 SDK 归档，以相对 `file:./vendor/malatang-sdk.tgz` 依赖引用，不要求克隆麻辣烫源码，也不依赖 SDK npm 安装成功。

## 创建随手记插件

```bash
malatang plugin create ./my-notes --template notes --name 我的笔记
cd my-notes
bun install --ignore-scripts
bun run check
bun run build
bun run pack
```

`create` 默认使用 notes 模板，ID 和名称从目录推导，也可用 `--id`、`--name` 指定。ID 为 2–64 位小写字母、数字和连字符，首位为字母；`models`、`plugins`、`settings` 是保留名称。名称不能留空。命令不覆盖非空目录，不自动安装依赖、初始化 Git 或安装插件。

项目包含页面源码、CSS Module、图片资源、manifest、TypeScript 配置、README、AGENTS 开发约定、工具脚本和 SDK 快照。`vendor/` 下的 SDK 归档需要随项目保存；不用把 node_modules、dist 或插件发布包提交到源码仓库。

四个命令都支持 `--help` 和 `--json`；诊断输出到 stderr，机器结果输出到 stdout。check/build/pack 默认当前目录，也接受显式路径；路径含空格时加引号。

| 命令                    | 行为                                                  |
| ----------------------- | ----------------------------------------------------- |
| `malatang plugin check` | 检查 manifest、TypeScript、样式约束和资源，不修改源码 |
| `malatang plugin build` | 先检查，再生成完整 dist；失败清除 dist                |
| `malatang plugin pack`  | 重新检查、构建，生成并解包验证完整 `.tgz`             |

项目的 `bun run check/build/pack` 与 CLI 使用同一 SDK 实现。使用源码开发宿主时，在运行 `bun run dev` 的项目中改用 `bun run agent plugin …`，通过显式目录指定插件项目。

## 共享组件与样式

插件默认导出 React 页面，通过 `@semicoder/malatang-sdk/client` 创建客户端，从 `@semicoder/malatang-sdk/ui` 导入组件。例如：

```tsx
import { Field, Page, PageHeader, Panel, PanelContent, Textarea } from "@semicoder/malatang-sdk/ui";
import styles from "./page.module.css";

export default function Notes() {
  return (
    <Page>
      <PageHeader title="我的笔记" description="把一个想法保存在本机。" />
      <Panel>
        <PanelContent>
          <Field label="笔记内容" hint="保存与读取逻辑见 notes 模板">
            <Textarea className={styles.note} placeholder="从一个想法开始…" />
          </Field>
        </PanelContent>
      </Panel>
    </Page>
  );
}
```

`page.module.css`：

```css
.note {
  min-height: 180px;
  color: var(--m-text);
}
```

React、JSX、ReactDOM 和公共 UI 实现由宿主共享。插件不直接引入 Radix，不打包自己的 React 或 UI 实现。Button、Input、Select 等控件支持 sm/md 两档（28px/36px）；Field 关联标签、提示和错误；Menu、Popover、Dialog、Tooltip 统一键盘和焦点行为。完整接口见 [SDK 文档](https://github.com/potato47/malatang/blob/v0.2.0/packages/sdk/README.md)。

业务样式使用 CSS Modules 和 `--m-*` 语义 token。检查会拒绝全局 reset、根主题覆盖、公共 token 重定义和宿主私有类依赖，不能使用 `.m-page` 等私有类代替组件。品牌或数据颜色可在 package.json 顶层 `malatangStyleExceptions` 按样式文件注明理由。

CSS 的相对 url 由构建器处理；JS 导入图片后使用 `new URL(asset, import.meta.url).href`。构建自动输出 JS、统一 CSS 和引用资源，不手工遗漏资源文件。

## 清单与数据

生成项目的 `package.json.malatang` 包含：

```json
{
  "schemaVersion": 1,
  "id": "my-notes",
  "name": "我的笔记",
  "description": "把一个想法保存在本机。",
  "icon": "记",
  "color": "#686868",
  "sdkVersion": "0.2",
  "frontend": "dist/client.js",
  "styles": "dist/client.css",
  "keepAlive": true
}
```

ID 是持久数据命名空间，不要在升级时随意更换。notes 模板演示读取、保存、等待与错误状态；KV 只接受 JSON，每值最多 64 KiB，不存在的键返回 null。插件卸载会保留 KV 和历史。

`keepAlive` 默认 false，切走卸载；true 保留当前窗口内的草稿和滚动位置，普通订阅仍继续。公共弹层在所属页面隐藏时关闭并释放键盘/焦点占用。刷新、重启、停用或升级会释放实例，需要长期保存的数据继续使用 KV。

## 创建模型插件

```bash
malatang plugin create ./my-model --template model
```

model 模板演示宿主模型选择、空模型状态、流式输出、取消及错误。模型配置来自「设置 → 模型服务」，插件不单独收集密钥。模板通过事件通知读取完整快照，重连时重新读取，卸载时取消订阅；切页不会自动取消后台模型运行。

需要后端时，用 `definePlugin` 和 `defineMethod` 默认导出方法，增加 `src/backend.ts` 和 manifest 的 `backend: "dist/backend.js"`。输入由 schema 校验。可参考 [内置译文](https://github.com/potato47/malatang/tree/v0.2.0/plugins/translate)。

## 打包安装与旧插件迁移

`pack` 生成如 `my-notes-0.1.0.tgz` 的归档。通过「应用中心 → 选择本地包」安装，或调用现有安装 API：

```bash
malatang call plugins.install --json '{"source":"/absolute/path/my-notes-0.1.0.tgz"}'
malatang call plugins.jobs --json '{}'
```

安装返回任务，需检查最终状态。项目创建和打包不会自动安装插件。当前不提供热更新或自动发布流程。

SDK 0.1 插件不能直接用于 0.2 宿主：迁移公共组件与 CSS Modules、更新 manifest 并重新构建安装，原有 ID 对应的 KV/历史保留。旧版开发资料仍可在 [v0.1.0 的 SDK 文档](https://github.com/potato47/malatang/blob/v0.1.0/packages/sdk/README.md) 查看。
