---
id: "docs-fia-shared-api"
slug: "shared-api"
title: "共享 API"
description: "声明一次契约，让界面、命令行和脚本调用同一份实现。"
date: "2026-10-04"
---

## 契约放在哪里

`shared/api.ts` 是应用方法与事件的唯一声明来源。保持模块无副作用，不在这里连接数据库或启动任务。

```ts
import { defineAPI, z } from "@semicoder/fia/api";

export default defineAPI({
  methods: {
    "greeting.read": {
      description: "生成一条问候语。",
      input: z.strictObject({ name: z.string().min(1) }),
      output: z.strictObject({ text: z.string() }),
    },
  },
  events: {},
});
```

## 后端实现

在 `backend/index.ts` 实现契约中的方法。框架在调用时校验输入与返回值。

```ts
import { defineBackend, implementAPI } from "@semicoder/fia/backend";
import api from "../shared/api";

export default defineBackend({
  api: implementAPI(api, {
    "greeting.read": ({ name }) => ({ text: `你好，${name}。` }),
  }),
});
```

## 前端与 CLI 调用

前端在 React 的事件处理或数据读取流程中调用：

```ts
import { createClient } from "@semicoder/fia/client";
import type api from "../shared/api";

const app = createClient<typeof api>();
const result = await app.call("greeting.read", { name: "朋友" });
console.log(result.text);
```

开发实例运行时，同样可以从终端调用：

```bash
bun run agent call greeting.read --json '{"name":"朋友"}'
```

如果用此示例替换计数器契约，也要同步替换前端的计数器调用。完整项目仍需保留首次挂载时的 `native.ready()`。

## 事件用于通知，状态需要重读

事件由后端 `context.emit` 发出。前端通过 `app.on` 订阅，组件卸载时取消订阅；通过 `app.onReconnect` 在连接恢复时重读状态。事件不保存历史，不能仅依赖一次通知确认业务结果。

发生连接错误时，在途操作可能已经执行。先查询状态，再决定是否重试写操作。

## 数据与任务边界

- 输入、输出和事件只接受 JSON；schema 必须能生成 JSON Schema。
- 单条契约消息上限为 1 MiB UTF-8，包含协议 envelope。
- 长任务应立即返回任务 ID，在后台执行，并提供读取状态和取消的方法。
- 业务数据放在 `context.app.dataDirectory`；不要写入会被更新替换的代码目录。
- 后台任务通过 `beforeUpdate` 阻止忙碌时更新，通过 `stop` 释放资源；FIA 不提供持久任务调度器。

附件或连续流可以使用 `defineBackend.http`。它与框架复用同一个 Bun 服务，自定义路由挂在 `/api` 下，不会自动成为应用 CLI 方法。
