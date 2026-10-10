---
id: "docs-malatang-plugin-development"
slug: "plugin-development"
title: "开发第一个插件"
description: "用麻辣烫 CLI 创建独立插件项目，共享宿主组件、模型与本地存储。"
date: "2026-10-10"
---

## 准备开发环境

本页适用于 **麻辣烫 0.4.1 / SDK 0.3.0（manifest 兼容版本 0.3）**。先完成 [安装](/malatang/docs/installation)，从应用菜单安装 CLI，并安装 [Bun](https://bun.sh/docs/installation) 1.4.2 或以上；源码宿主开发固定使用 1.4.3。普通应用用户不需要 Bun。

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

React、JSX、ReactDOM 和公共 UI 实现由宿主共享，底层采用 Base UI 1.9 与 Tailwind CSS 4.3。插件不直接依赖 Base UI、Radix、Lucide 或宿主私有实现，不打包另一份共享运行时；图标也从 SDK UI 导入。Field 关联标签、提示和错误，交互组件提供统一键盘和焦点行为。完整接口见 [SDK 文档](https://github.com/potato47/malatang/blob/sdk-v0.3.0/packages/sdk/README.md)。

业务样式使用完整静态的 `p:` Tailwind 类名，如 `p:flex p:gap-4 p:bg-surface p:text-foreground`。模板入口 `src/styles.css` 导入 SDK 的 `tailwind.css` 主题映射，由 CLI 编译；复杂样式仍可使用 CSS Modules 和 `--m-*` 语义 token。宿主统一加载公共样式与 reset；插件不导入全局主题或重复 Preflight。选择器、动画、内部变量和 `@property` 按插件隔离，Portal 继承同一作用域。

检查拒绝全局 reset、根主题覆盖、公共 token 重定义和宿主私有类依赖。品牌或数据颜色可在 package.json 顶层 `malatangStyleExceptions` 按样式文件注明理由。

CSS 的相对 url 由构建器处理；JS 导入图片后使用 `new URL(asset, import.meta.url).href`。构建自动输出 JS、统一 CSS 和引用资源，不手工遗漏资源文件。

SDK 0.3 的 Dialog、Select、Popover、Menu 等采用 Trigger / Content 和配套子组件；用 `render` 组合触发元素，选择组件使用 `value/onValueChange`，复选框与开关使用 `checked/onCheckedChange`，原生输入保留表单事件。

[SDK 0.3.0 已独立发布 npm](https://www.npmjs.com/package/@semicoder/malatang-sdk/v/0.3.0)；CLI 模板继续优先使用随应用提供的固定归档。

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
  "sdkVersion": "0.3",
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

需要后端时，用 `definePlugin` 和 `defineMethod` 默认导出方法，增加 `src/backend.ts` 和 manifest 的 `backend: "dist/backend.js"`。输入由 schema 校验。可参考 [内置译文](https://github.com/potato47/malatang/tree/v0.4.1/plugins/translate)。

## 打包安装与旧插件迁移

`pack` 生成如 `my-notes-0.1.0.tgz` 的归档。通过「应用中心 → 选择本地包」安装，或调用现有安装 API：

```bash
malatang call plugins.install --json '{"source":"/absolute/path/my-notes-0.1.0.tgz"}'
malatang call plugins.jobs --json '{}'
```

安装返回任务，需检查最终状态。项目创建和打包不会自动安装插件。当前不提供热更新或自动发布流程。

**SDK 0.2 及更早插件不能直接用于麻辣烫 0.4.1。** 更新组合式组件 API、样式入口、manifest `sdkVersion: "0.3"` 和 CLI SDK 快照，用 SDK 0.3.0 重新构建安装；不能只改 manifest 而不重建。保持原 ID 可继续使用 KV / 历史，无旧 API 兼容层。旧宿主资料保留在 [v0.4.0 SDK 文档](https://github.com/potato47/malatang/blob/v0.4.0/packages/sdk/README.md)。

## Base UI 与 Tailwind CSS 4

麻辣烫 0.4.1 与 SDK 0.3.0 使用 Base UI 1.9 和 Tailwind CSS 4.3，manifest `sdkVersion` 为 `0.3`，下列组合式示例与本页教程适用于该契约。

新界面保留 48px 图标侧栏，以统一的浅色／深色语义颜色、14px 界面文字和 28／36／40px 控件升级设置、翻译、应用中心与笔记。公共组件新增搜索选择、数字输入、滑块、标签页、折叠区、设置行、确认对话框、上下文菜单、通知、进度和骨架屏。

开发版本的组件采用组合式 API：DialogTrigger／DialogContent／DialogTitle／DialogDescription／DialogFooter，SelectTrigger／SelectContent／SelectItem 等。用 `render` 组合触发元素，选择组件使用 `value/onValueChange`，复选框与开关使用 `checked/onCheckedChange`。模型选择支持搜索和服务商分组。

```tsx
import {
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@semicoder/malatang-sdk/ui";

<Dialog>
  <DialogTrigger render={<Button />}>打开</DialogTrigger>
  <DialogContent>
    <DialogTitle>示例</DialogTitle>
    <DialogDescription>组合式公共组件。</DialogDescription>
    <DialogFooter>
      <DialogClose render={<Button />}>关闭</DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```

插件使用完整静态的 `p:` Tailwind 类名，如 `p:flex p:gap-4 p:bg-surface p:text-foreground`。模板入口 `src/styles.css` 只导入 SDK 的 `tailwind.css` 主题映射，由 CLI 编译；复杂局部样式仍支持 CSS Modules。编译后的选择器、动画和内部变量按插件隔离，Portal 继承相同作用域。宿主统一加载公共样式和 reset，插件不直接导入 Base UI 或全局主题。

使用 0.4.1 宿主的 `plugin create` 内置快照创建项目。新契约没有旧 API 兼容层；普通模型配置、插件记录、KV 和历史保留，ChatGPT 凭证升级按[安装指南](/malatang/docs/installation#后续更新)重新登录。
