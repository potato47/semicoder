---
id: "docs-malatang-plugin-development"
slug: "plugin-development"
title: "开发第一个插件"
description: "在源码 workspace 中使用 SDK，构建一个能持久保存内容的独立页面。"
date: "2026-10-04"
---

## 准备源码工作区

先完成 [源码安装](/malatang/docs/installation)。`@semicoder/malatang-sdk` 当前尚未发布到 npm；在麻辣烫仓库的 `examples/` 下开发，可直接使用 workspace SDK。

本页与安装指南统一使用 **v0.1.0** 源码，SDK 包名为 `@semicoder/malatang-sdk`。应用 DMG 已发布不代表 SDK npm 包已发布；插件开发继续使用源码 workspace，无需更换为旧包名。

每个插件拥有 React 页面，可选后端，使用版本化 manifest 描述入口。React、主题和基础 UI 来自宿主，不再创建独立 React 运行时。

## 创建插件清单

新建 `examples/my-notes/package.json`：

```json
{
  "name": "@local/my-notes",
  "version": "0.1.0",
  "type": "module",
  "files": ["dist"],
  "devDependencies": { "@semicoder/malatang-sdk": "workspace:*" },
  "malatang": {
    "schemaVersion": 1,
    "id": "my-notes",
    "name": "我的笔记",
    "description": "把一个想法保存在本机。",
    "icon": "记",
    "color": "#6e8169",
    "sdkVersion": "0.1",
    "frontend": "dist/client.js",
    "keepAlive": true
  }
}
```

`id` 是持久数据命名空间：2–64 位小写字母、数字和连字符，首位为字母；不要使用保留名称 `models`、`plugins`、`settings`，也不要在更新时随意更换。

## 编写页面

新建 `examples/my-notes/src/client.tsx`：

```tsx
import { useEffect, useState } from "react";
import { createPluginClient } from "@semicoder/malatang-sdk/client";
import { Button, PageHeader, Panel } from "@semicoder/malatang-sdk/ui";

const host = createPluginClient("my-notes");

export default function MyNotes() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;
    host.kv
      .get("note")
      .then((value) => {
        if (active) {
          if (typeof value === "string") setText(value);
          setLoaded(true);
        }
      })
      .catch((error) => {
        if (active) setStatus(String(error));
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function save() {
    setBusy(true);
    try {
      await host.kv.set("note", text);
      setStatus("已保存");
    } catch (error) {
      setStatus(String(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="m-page">
      <PageHeader title="我的笔记" />
      <Panel>
        <label htmlFor="note">内容</label>
        <textarea
          id="note"
          value={text}
          disabled={busy || !loaded}
          onChange={(event) => setText(event.target.value)}
        />
        <Button disabled={busy || !loaded} onClick={() => void save()}>
          {busy ? "处理中…" : "保存"}
        </Button>
        <p role="status">{status}</p>
      </Panel>
    </div>
  );
}
```

KV 只接受 JSON，每值最多 64 KiB，不存在的键返回 null。示例读取失败会显示错误，生产插件还应提供重试和更完整的数据恢复交互。

## 构建与安装

在麻辣烫仓库根目录执行：

```bash
bun install --ignore-scripts
bun packages/sdk/build.ts examples/my-notes
cd examples/my-notes
bun pm pack
```

在应用中心选择生成的 `.tgz` 安装。构建器打包业务 JS，React 与 JSX runtime 由宿主共享；额外 CSS、图片或其他资源需要自行放入 `dist`，并在 manifest 中声明样式入口。不要把后端模块导入前端。

## 调用模型与可选后端

前端通过 `host.models.list()` 获取宿主模型，用 `host.models.start()` 创建生成任务。订阅 `models.onChange`、`runs.onChange` 后读取快照，重连再读，并在卸载时取消订阅。没有可用模型时提示去设置，不提供虚构结果。

后端使用 `definePlugin` 和 `defineMethod` 导出方法，manifest 增加 `backend: "dist/backend.js"`；输入由 schema 校验。完整示例见 [内置译文源码](https://github.com/potato47/malatang/tree/v0.1.0/plugins/translate) 和 [SDK 文档](https://github.com/potato47/malatang/blob/v0.1.0/packages/sdk/README.md)。

## 页面生命周期与主题

`keepAlive` 默认 false，切走卸载；true 时隐藏并保留组件状态，订阅和计时器继续执行，仍占用内存。刷新、重启、停用或升级会释放实例，需要持久化的数据继续使用 KV。

使用 `.m-page` 和 `--m-bg`、`--m-surface`、`--m-text`、`--m-accent` 等主题变量。避免全局 reset 与写死黑白颜色，业务 CSS 加插件前缀。宿主负责外观偏好，插件不要修改根元素主题。
