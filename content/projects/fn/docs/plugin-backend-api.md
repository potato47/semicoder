---
id: "docs-fn-plugin-backend-api"
slug: "plugin-backend-api"
title: "后端 API"
description: "定义带 schema 的插件方法，使用后端模型和 KV 上下文。"
date: "2026-10-15"
---

> 适用于 fn 0.4.4 / SDK 0.3.4，manifest 为 0.3。先按[安装指南](/fn/docs/installation)安装 fn；旧名称插件和旧应用数据不迁移。

本页适用于 **fn 0.4.4 / SDK 0.3.4**。后端在宿主 Bun 进程运行，适合业务校验、数据整理和调用宿主模型。纯前端笔记插件不需要后端。

## 定义与调用

| 导出         | 签名与行为                                                                                                                              |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| definePlugin | `(plugin: BackendPlugin): BackendPlugin`；返回传入对象，默认导出给宿主加载                                                              |
| defineMethod | `(description: string, schema: z.ZodType<T>, handler: (input: T, context: PluginContext) => unknown 或 Promise<unknown>): PluginMethod` |
| z            | SDK 使用的 Zod；输入 schema 同时用于 JSON Schema 发现与调用时 parse                                                                     |

`BackendPlugin.methods` 为必填的方法名到 `PluginMethod` 的映射；可选 `activate(context)`、`dispose()` 返回 void 或 `Promise<void>`。`PluginMethod` 包含 `description`、JSON 格式 `inputSchema` 和 `execute(input, context)`，优先用 defineMethod 生成。

schema 必须能转换成 JSON Schema；避免 Date、自定义 transform 等不能表示的输入。调用必须传 JSON，方法返回值也必须是 JSON，不能返回 undefined、函数或循环对象。返回 JSON 序列化后最多 **256 KiB**；校验或处理器抛错会使前端 Promise reject。

## PluginContext

| 成员                  | 返回值              | 说明                                           |
| --------------------- | ------------------- | ---------------------------------------------- |
| pluginId              | readonly string     | 当前插件 ID，无需由调用方传入                  |
| models.list()         | ModelInfo[]         | **同步**读取宿主模型目录                       |
| models.start(request) | `Promise<ModelRun>` | 启动宿主模型任务，返回运行记录，不等待生成结束 |
| kv.get(key)           | JSONValue 或 null   | **同步**读取；不存在返回 null                  |
| kv.set(key, value)    | `Promise<void>`     | 每值 JSON UTF-8 最多 64 KiB，等待持久化        |
| kv.delete(key)        | `Promise<void>`     | 删除并持久化                                   |

上下文没有 runs、invoke 或事件订阅接口。模型请求及限制见[前端 API](/fn/docs/plugin-client-api#请求与返回类型)。前端 KV 所有操作均为 Promise，set/delete 返回 null；不要把前端与后端签名混用。

## 完整示例：保存并统计笔记

在入门的 `my-notes` 项目添加 `src/backend.ts`，并在 `package.json.fn` 添加 `"backend": "dist/backend.js"`。源码文件与清单必须同时存在。

```ts
import { defineMethod, definePlugin, z } from "@semicoder/fn-sdk/runtime";

export default definePlugin({
  methods: {
    saveNote: defineMethod(
      "保存笔记并返回字符数",
      z.strictObject({ text: z.string().max(8000) }),
      async ({ text }, context) => {
        await context.kv.set("note", text);
        return { text, characters: Array.from(text).length };
      },
    ),
  },
});
```

用下列代码替换 `src/client.tsx`。`invoke` 的方法名是本插件 methods 的键，泛型只提供 TypeScript 提示，不会验证返回数据。

```tsx
import "./styles.css";
import { useEffect, useState } from "react";
import { createPluginClient } from "@semicoder/fn-sdk/client";
import { Alert, Button, Field, Page, PageHeader, Textarea } from "@semicoder/fn-sdk/ui";

const client = createPluginClient("my-notes");
type SavedNote = { text: string; characters: number };

export default function BackendNotes() {
  const [text, setText] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    void client.kv
      .get("note")
      .then((value) => {
        if (live) {
          setText(typeof value === "string" ? value : "");
          setReady(true);
        }
      })
      .catch((reason: unknown) => {
        if (live) setError(String(reason));
      });
    return () => {
      live = false;
    };
  }, []);
  async function save() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await client.invoke<SavedNote>("saveNote", { text });
      setMessage(`已保存 ${result.characters} 个字符`);
    } catch (reason) {
      setError(String(reason));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page className="p:space-y-4">
      <PageHeader title="带后端的笔记" />
      <Field label="笔记">
        <Textarea
          value={text}
          maxLength={8000}
          disabled={!ready || busy}
          onChange={(event) => setText(event.target.value)}
        />
      </Field>
      <Button disabled={!ready} loading={busy} onClick={() => void save()}>
        保存并统计
      </Button>
      {message && <Alert tone="success">{message}</Alert>}
      {error && <Alert>{error}</Alert>}
    </Page>
  );
}
```

继续执行 `bun run check`、`bun run build`、`bun run pack` 并安装归档。修改已安装插件时提高包版本后更新；仅修改源码不会改变宿主正在运行的版本。

## 初始化与释放

`activate(context)` 用于短时初始化；完成前插件尚未 active，不要在这里调用 `context.models.start`。激活失败会让插件进入 error 状态。将模型启动放在用户触发的方法里，返回 ModelRun 后由前端订阅进度。

`dispose()` 应释放插件自己创建的资源；不要依赖它在崩溃时保存数据。没有宿主管理的自建持久任务接口，避免创建无法取消的常驻后台任务。方法调用期间会占用插件调用计数，阻止冲突的停用和更新，处理器应及时结束。

## 故障定位

| 症状               | 检查项                                           |
| ------------------ | ------------------------------------------------ |
| 插件方法不存在     | methods 的键、前端 invoke 名称、是否安装了新归档 |
| 插件未就绪或已停用 | 应用中心的 active 状态、激活错误、是否正在更新   |
| 输入校验失败       | JSON 形状、strictObject 多余字段、长度约束       |
| 返回结果失败       | 是否为 JSON、是否超过 256 KiB、是否遗漏 return   |
| 激活失败           | backend 默认导出、清单入口、模块初始化异常       |

类型来源：runtime.ts：`packages/sdk/src/runtime.ts`（[v0.4.4 源码](https://github.com/semicoder-dev/fn/tree/v0.4.4)）、types.ts：`packages/sdk/src/types.ts`（[v0.4.4 源码](https://github.com/semicoder-dev/fn/tree/v0.4.4)）。宿主最终执行校验见插件实现：`backend/plugins.ts`（[v0.4.4 源码](https://github.com/semicoder-dev/fn/tree/v0.4.4)）。
