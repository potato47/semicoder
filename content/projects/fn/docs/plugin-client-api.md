---
id: "docs-fn-plugin-client-api"
slug: "plugin-client-api"
title: "前端 API"
description: "模型、运行记录、KV、后端调用，以及事件订阅和重连的完整示例。"
date: "2026-10-14"
---

> 本地开发、尚未发布。本页对应 fn 更名后的源码；新 SDK、应用和官方市场尚未公开，请按[本地构建说明](/fn/docs/installation)使用。

本页适用于 **fn 0.4.3 / SDK 0.3.2**。客户端只在宿主加载的插件页面中使用，不是独立网页或服务端 HTTP SDK。

## 创建客户端

```ts
import { createPluginClient } from "@semicoder/fn-sdk/client";
import type { JSONValue, ModelInfo, ModelRequest, ModelRun } from "@semicoder/fn-sdk/types";

const client = createPluginClient("my-model");
```

参数 `pluginId: string` 应与 manifest 的 id 一致，用于模型任务、KV 和方法调用的归属。`createPluginClient` 同步返回对象；普通网页没有宿主 bridge 时会立即抛出 `This plugin must be opened in fn.`。不要把初始化放在官网或 SSR 环境执行。

## models：模型目录与启动

| 方法                                  | 返回值                 | 行为                                       |
| ------------------------------------- | ---------------------- | ------------------------------------------ |
| models.list()                         | `Promise<ModelInfo[]>` | 获取宿主模型配置，不返回密钥               |
| models.start(input: ModelRequest)     | `Promise<ModelRun>`    | 创建后台运行，返回初始快照，不等待输出完成 |
| models.onChange(listener: () => void) | () => void             | 订阅模型配置变化，返回解除订阅函数         |

`configured` 表示配置可用状态，不代表已验证网络连通性。没有模型时提示前往「设置 → 模型服务」。预设模型从目录退出、账号未连接等情况可能使 configured 为 false；不要静默改用其他服务商。

## runs：运行记录与取消

| 方法                                | 返回值                | 行为                                                           |
| ----------------------------------- | --------------------- | -------------------------------------------------------------- |
| runs.list()                         | `Promise<ModelRun[]>` | 当前插件最近 30 条摘要，从新到旧；input/output 各截到 300 字符 |
| runs.get(runId: string)             | `Promise<ModelRun>`   | 当前插件指定运行的完整快照                                     |
| runs.cancel(runId: string)          | `Promise<ModelRun>`   | 取消运行并等待终态保存；已结束的运行返回当前状态               |
| runs.onChange(listener: () => void) | () => void            | 仅通知当前插件运行有变化，不传文本增量                         |

变化通知没有历史重放。**先订阅，再读取；重连后重新读取；卸载时解除订阅。** 同一运行的多个异步读取可能乱序，使用 `revision` 避免旧结果覆盖新结果。启动返回后再 get 一次，补齐启动期间已经发生的变化。

## kv：JSON 持久化

| 方法                                  | 返回值                       | 行为                                                      |
| ------------------------------------- | ---------------------------- | --------------------------------------------------------- |
| kv.get(key: string)                   | `Promise<JSONValue 或 null>` | 不存在返回 null；显式保存 null 与不存在无法仅凭返回值区分 |
| kv.set(key: string, value: JSONValue) | `Promise<null>`              | 等待写入完成，单值序列化后的 UTF-8 最多 64 KiB            |
| kv.delete(key: string)                | `Promise<null>`              | 等待删除完成                                              |

前端 key 长度 1–200。`JSONValue` 包括 null、boolean、number、string、数组及字符串键对象，递归成员也必须为 JSON；不支持 undefined、Date 实例、函数、BigInt 或循环引用。中文字符占多个字节，字符计数不等于 64 KiB 上限。

KV 按插件 ID 存在宿主数据目录，卸载保留；无跨设备同步或 KV 变化订阅 API。完整读写与错误处理见[笔记示例](/fn/docs/plugin-development#创建随手记插件)。

## invoke 与重连

| 方法                                                    | 返回值       | 行为                              |
| ------------------------------------------------------- | ------------ | --------------------------------- |
| `invoke<T = JSONValue>`(method: string, input: unknown) | `Promise<T>` | 调用当前插件后端 methods 中的方法 |
| onReconnect(listener: () => void)                       | () => void   | 连接恢复时回调，返回解除订阅函数  |

invoke 的 method 长度 1–100；虽然 TypeScript 接受 unknown，传输与宿主仍要求 input 为 JSON，再由后端 schema 校验。泛型 T 不会验证返回值。插件未激活、方法缺失、schema 不匹配、处理器抛错、结果不是 JSON 或超过 256 KiB 都会失败。完整示例见[后端 API](/fn/docs/plugin-backend-api)。

所有远端调用都可能因连接或宿主校验失败而 reject，需要显示错误并允许用户重试。onReconnect 只通知连接恢复，不自动重放请求或恢复 UI；避免重连时重复发起生成或覆盖未保存草稿。

## 请求与返回类型

`ModelRequest`：

| 字段    | 类型         | 约束                                                |
| ------- | ------------ | --------------------------------------------------- |
| modelId | string，必填 | 宿主 models.list 返回的 id，不是服务商原始模型名    |
| prompt  | string，必填 | 非空且不能仅空白，最多 16,000 字符                  |
| system  | string，可选 | 系统提示词，最多 16,000 字符                        |
| title   | string，可选 | 运行标题，前端请求最多 100 字符；省略时从提示词生成 |

宿主全局最多同时生成 8 个任务，单次最长 180 秒，输出最多 64 KiB。超时、输出超限或流断开可产生 failed 终态，并保留已经收到的部分输出。首次启动成功不表示最终成功。

`ModelRun`：

| 字段                    | 类型 / 含义                                 |
| ----------------------- | ------------------------------------------- |
| id / pluginId / modelId | string；运行、插件及宿主模型标识            |
| title / input / output  | string；标题、提示词及当前累计文本          |
| status                  | running、completed、cancelled、failed       |
| error                   | string 或 null；失败原因                    |
| createdAt / updatedAt   | number；Unix 毫秒时间戳                     |
| revision                | number；当前运行修订号，适合排除乱序响应    |
| demo                    | boolean；只用于旧演示历史，新运行固定 false |

`ModelInfo`：

| 字段                       | 类型 / 含义                                       |
| -------------------------- | ------------------------------------------------- |
| id / name                  | string；宿主模型标识和显示名称                    |
| provider / model / baseURL | string；服务商、原始模型标识、服务地址            |
| kind                       | openai-compatible、pi、chatgpt                    |
| configured / hasApiKey     | boolean；配置状态、是否保存了密钥；不返回密钥本身 |
| preset                     | string 或 null；Pi provider 标识                  |
| chatgptProfileId           | 可选 string；稳定宿主账号引用，不包含邮箱或凭证   |
| options                    | `Record<string, string>`；非密钥选项              |

ChatGPT 模型绑定具体宿主账号；使用 SDK ModelSelect 会自动标记订阅用量入口。自行绘制选择器时也应说明使用 ChatGPT plan。宿主负责登录、刷新与限额，不自动切换为 API Key 计费。

## 模型生成与取消

执行 `fn plugin create ./my-model --template model --id my-model` 并安装依赖，以下代码可完整替换 `src/client.tsx`。保留生成的 styles.css。示例不在模型失效时自动选择替代模型。

```tsx
import "./styles.css";
import { useEffect, useRef, useState } from "react";
import { createPluginClient } from "@semicoder/fn-sdk/client";
import type { ModelInfo, ModelRun } from "@semicoder/fn-sdk/types";
import {
  Alert,
  Button,
  EmptyState,
  Field,
  Loading,
  ModelSelect,
  Page,
  PageHeader,
  Textarea,
} from "@semicoder/fn-sdk/ui";

const client = createPluginClient("my-model");
export default function ModelPage() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [modelId, setModelId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [run, setRun] = useState<ModelRun | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const selectedRun = useRef("");
  const live = useRef(false);
  const requestPending = useRef(false);

  function accept(next: ModelRun) {
    if (!live.current || selectedRun.current !== next.id) return;
    setRun((previous) =>
      !previous || previous.id !== next.id || next.revision >= previous.revision ? next : previous,
    );
  }

  useEffect(() => {
    let active = true;
    let generation = 0;
    live.current = true;
    async function refreshModels() {
      const current = ++generation;
      try {
        const items = await client.models.list();
        if (active && current === generation) {
          setModels(items);
          setModelId((value) =>
            items.some((item) => item.id === value && item.configured) ? value : "",
          );
        }
      } catch (reason) {
        if (active && current === generation) setError(String(reason));
      } finally {
        if (active && current === generation) setLoading(false);
      }
    }
    async function refreshRun() {
      const id = selectedRun.current;
      if (!id) return;
      try {
        const next = await client.runs.get(id);
        if (active) accept(next);
      } catch (reason) {
        if (active && selectedRun.current === id) setError(String(reason));
      }
    }
    const offModels = client.models.onChange(() => void refreshModels());
    const offRuns = client.runs.onChange(() => void refreshRun());
    const offReconnect = client.onReconnect(() => {
      void refreshModels();
      void refreshRun();
    });
    void refreshModels();
    return () => {
      active = false;
      live.current = false;
      offModels();
      offRuns();
      offReconnect();
    };
  }, []);

  async function start() {
    if (requestPending.current) return;
    requestPending.current = true;
    setPending(true);
    setError("");
    setRun(null);
    selectedRun.current = "";
    try {
      const initial = await client.models.start({ modelId, prompt });
      if (!live.current) return;
      selectedRun.current = initial.id;
      accept(initial);
      accept(await client.runs.get(initial.id));
    } catch (reason) {
      if (live.current) setError(String(reason));
    } finally {
      requestPending.current = false;
      if (live.current) setPending(false);
    }
  }
  async function cancel() {
    if (!run || requestPending.current) return;
    requestPending.current = true;
    setPending(true);
    setError("");
    try {
      accept(await client.runs.cancel(run.id));
    } catch (reason) {
      if (live.current) setError(String(reason));
    } finally {
      requestPending.current = false;
      if (live.current) setPending(false);
    }
  }
  const busy = pending || run?.status === "running";
  const available = models.some((item) => item.configured);
  const selected = models.some((item) => item.id === modelId && item.configured);
  return (
    <Page className="p:space-y-4">
      <PageHeader title="模型示例" />
      {loading && <Loading label="读取模型" />}
      {!loading && !available && (
        <EmptyState title="尚无可用模型" description="请在设置 → 模型服务中添加并连接模型。" />
      )}
      <Field label="模型">
        <ModelSelect models={models} value={modelId} disabled={busy} onValueChange={setModelId} />
      </Field>
      <Field label="提示词">
        <Textarea
          value={prompt}
          maxLength={16000}
          disabled={busy}
          onChange={(event) => setPrompt(event.target.value)}
        />
      </Field>
      {run?.status === "running" ? (
        <Button variant="secondary" loading={pending} onClick={() => void cancel()}>
          取消生成
        </Button>
      ) : (
        <Button
          loading={pending}
          disabled={!selected || !prompt.trim()}
          onClick={() => void start()}
        >
          生成
        </Button>
      )}
      <div className="p:whitespace-pre-wrap p:break-words" aria-live="polite">
        {run?.output}
      </div>
      {run && <p>状态：{run.status}</p>}
      {(error || run?.error) && <Alert>{error || run?.error}</Alert>}
    </Page>
  );
}
```

页面重挂载后示例从空白开始；若需要恢复运行，先调用 runs.list 展示记录，再按用户选择 runs.get。切页或卸载不自动取消宿主任务，应由用户显式取消。

## 其他公开类型与管理边界

以下类型也由 types 导出，主要用于宿主管理结果或实现 SDK；createPluginClient 不提供对应管理方法。

| 类型           | 字段与用途                                                                                                                                                                                                                        |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ProviderPreset | id、name、modelCount、apiKeySupported、keyLabel、notice；fields 为 key/label/placeholder/required 数组                                                                                                                            |
| PresetModel    | id、name、api、baseURL、contextWindow、reasoning；预设模型目录项                                                                                                                                                                  |
| PluginInfo     | id/name/description/icon/color、version/packageName/source、可空 market（marketId/marketURL）、enabled、status（active/disabled/error）、可空 error、clientURL、可空 styleURL、keepAlive、methods（name/description/inputSchema） |
| InstallJob     | id/source、operation（install/update）、可空 targetVersion、status（installing/completed/failed）、message、可空 pluginId、createdAt                                                                                              |
| HostBridge     | call(method, input): `Promise<unknown>`；on(event, listener) 与 onReconnect(listener) 返回取消订阅函数；由宿主注入，不自行读写全局 bridge                                                                                         |

BackendPlugin、PluginMethod、PluginContext 见[后端 API](/fn/docs/plugin-backend-api)；PluginManifest 见[清单](/fn/docs/plugin-manifest)。插件安装、市场配置和模型管理使用[宿主 CLI](/fn/docs/automation)，不能写成 `client.plugins.install` 或 `client.marketplaces`。

来源：client.ts：`packages/sdk/src/client.ts`（本地源码）、types.ts：`packages/sdk/src/types.ts`（本地源码）、宿主校验：`shared/api.ts`（本地源码）。
