---
id: "docs-malatang-plugin-development"
slug: "plugin-development"
title: "开发第一个插件"
description: "从 CLI 创建笔记插件，到使用宿主 KV、构建归档并安装。"
date: "2026-10-11"
---

## 准备开发环境

本手册适用于 **麻辣烫 0.4.2 / SDK 0.3.1 / manifest 0.3**。先完成[安装](/malatang/docs/installation)，从应用菜单安装 CLI，并安装 Bun 1.4.2 或以上。普通应用用户不需要 Bun；宿主源码开发固定使用 1.4.3。

插件是独立 React 小应用。宿主提供模型、运行记录、KV、UI 和可选后端方法；插件不需要克隆宿主源码。CLI 将随应用提供的 SDK 归档复制到 `vendor/malatang-sdk.tgz`，项目通过相对 `file:` 依赖使用它，可移动到任意目录。

## 创建随手记插件

```bash
malatang plugin create ./my-notes --template notes --id my-notes --name 我的笔记
cd my-notes
bun install --ignore-scripts
bun run check
```

`notes` 是默认模板。创建不会覆盖非空目录，也不会自动安装依赖、初始化 Git 或安装插件。保留生成的 `vendor/`、`tools.ts`、`tsconfig.json` 和 `src/styles.css`。以下代码可直接替换生成项目的 `src/client.tsx`：

```tsx
import "./styles.css";
import { useEffect, useState } from "react";
import { createPluginClient } from "@semicoder/malatang-sdk/client";
import {
  Alert,
  Button,
  Field,
  Loading,
  Page,
  PageHeader,
  Textarea,
} from "@semicoder/malatang-sdk/ui";

const client = createPluginClient("my-notes");

export default function Notes() {
  const [text, setText] = useState("");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let live = true;
    void client.kv
      .get("note")
      .then((value) => {
        if (!live) return;
        setText(typeof value === "string" ? value : "");
        setReady(true);
      })
      .catch((reason: unknown) => {
        if (live) setError(String(reason));
      });
    return () => {
      live = false;
    };
  }, []);

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await client.kv.set("note", text);
      setSaved(true);
    } catch (reason) {
      setError(String(reason));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Page className="p:space-y-4">
      <PageHeader title="我的笔记" description="内容保存在当前宿主的本地数据目录。" />
      {!ready && !error && <Loading label="读取笔记" />}
      <Field label="笔记内容" hint="每个 KV 值最多 64 KiB，中文按 UTF-8 字节计算。">
        <Textarea
          rows={8}
          value={text}
          disabled={!ready || saving}
          onChange={(event) => {
            setText(event.target.value);
            setSaved(false);
          }}
        />
      </Field>
      <Button disabled={!ready} loading={saving} onClick={() => void save()}>
        保存
      </Button>
      {saved && <Alert tone="success">已保存</Alert>}
      {error && <Alert>{error}</Alert>}
    </Page>
  );
}
```

客户端 ID 必须与生成的 `package.json.malatang.id` 一致。读取失败时不开放保存，避免用空白覆盖已有内容；修复连接后重新打开页面重试。模板默认 `keepAlive: true`，切页保留草稿；刷新或重启只恢复已保存的 KV。

## 共享组件与样式

从 [UI 基础与表单](/malatang/docs/plugin-ui) 查阅组件参数；从 [UI 浮层与反馈](/malatang/docs/plugin-ui-overlays) 查阅对话框、菜单和通知。React、ReactDOM 与公共组件实现由宿主共享。

业务样式使用完整静态的 `p:` 类名，复杂布局使用 CSS Modules；主题、Portal 和 reset 由宿主管理。完整 token 和资源规则见[样式与主题](/malatang/docs/plugin-styling)。

## 清单与数据

[插件结构与生命周期](/malatang/docs/plugin-manifest) 说明全部 manifest 字段和 keepAlive 行为。[前端 API](/malatang/docs/plugin-client-api) 说明 KV、模型和运行记录。ID 决定数据命名空间；升级时保持 ID，卸载会保留 KV 与历史。

## 创建模型插件

```bash
malatang plugin create ./my-model --template model --id my-model
```

model 模板包含模型选择、流式结果、取消、错误、事件与重连处理。完整可复制代码见[模型生成与取消](/malatang/docs/plugin-client-api#模型生成与取消)。模型由用户在「设置 → 模型服务」配置，插件不收集密钥。需要业务后端时，继续阅读[后端 API](/malatang/docs/plugin-backend-api)。

## 打包安装与旧插件迁移

在 `my-notes` 项目执行：

```bash
bun run check
bun run build
bun run pack
```

`pack` 会再次检查和构建，输出路径以命令结果为准。在应用中心选择「从地址安装 → 选择本地包」，选中生成的 `.tgz`。等待安装任务成功，再从侧栏打开插件。编辑源文件后需重新构建和安装，CLI 不提供热更新。

后续更新应提高 `package.json.version`，保持包名和插件 ID；用户通过手动更新安装。完整 CLI、市场索引和 SDK 0.2 迁移说明见[构建与分发](/malatang/docs/plugin-distribution)。

## Base UI 与 Tailwind CSS 4

SDK 0.3 使用 Base UI 1.9 与 Tailwind CSS 4.3。组合式组件使用 Trigger / Content 和 `render`，选择类组件使用 `value/onValueChange`。对应示例已集中到 [UI 手册](/malatang/docs/plugin-ui)，避免在入门页重复维护接口。

## 市场分发与 SDK 0.3.1

SDK 0.3.1 已公开；CLI 默认使用随应用提供的归档。官方翻译、随手记 0.1.0 仍使用固定 SDK 0.3.0，模型、KV、UI 与 manifest 0.3 契约兼容。0.3.1 的管理类型变化及市场分发见[构建与分发](/malatang/docs/plugin-distribution)。
