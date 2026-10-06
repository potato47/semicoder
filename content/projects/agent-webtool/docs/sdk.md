---
id: "docs-agent-webtool-sdk"
slug: "sdk"
title: "JavaScript SDK"
description: "抓取网页、读取结构化搜索结果，并理解来源编号与取消行为。"
date: "2026-10-06"
---

## 抓取与搜索（0.7.0）

```ts
import { webFetch, webSearch } from "agent-webtool";

const markdown = await webFetch({ url: "https://example.com" });
const controller = new AbortController();
const search = await webSearch(
  { query: "Bun runtime", engines: ["duckduckgo"], limit: 5, timeoutMs: 5000 },
  { signal: controller.signal },
);

console.log(markdown);
console.log(search.text);
console.log(search.results);
console.log(search.engines);
```

`webFetch()` 返回字符串，支持 `markdown`、`text`、`html`。`webSearch()` 返回当前调用的 `text`、结构化 `results` 和逐引擎 `engines` 状态；每项结果包括标题、URL、摘要、RRF 分数、来源引擎、引用 ID 和是否已抓取。ESM 与 CommonJS 均可使用，并附 TypeScript 声明。

两种调用的第二参数都支持 `AbortSignal`。取消后应等待请求结束，再处理调用方的会话清理。部分搜索引擎失败时查看 `engines`；全部失败或无结果时，返回状态说明，不应把空列表视为成功找到了资料。

## 默认来源范围

默认来源表属于整个进程。同一 URL 保留引用编号；`collectedSources()` 读取历史，`clearCollectedSources()` 清空并重置编号。仅在没有使用该来源表的在途请求时清空。每次搜索的 `results` 独立，但进程级历史不是会话隔离存储；多会话应用不能把全局来源表直接当成某个会话的完整来源。

## 独立会话来源（0.7.0 起）

为每个会话创建独立上下文，并在两个工具调用中传入同一份 `sources`：

```ts
import { createSourceContext, webFetch, webSearch } from "agent-webtool";

const sources = createSourceContext();
const result = await webSearch({ query: "Bun runtime" }, { sources });
if (result.results[0]) {
  await webFetch({ url: result.results[0].url }, { sources });
}
const restored = createSourceContext(sources.snapshot());
```

每个上下文独立分配编号；同一上下文可以供并发调用共享，编号的分配顺序取决于完成顺序。快照保留 ID，恢复后从最大 ID 继续；应用负责持久化，库本身不写入会话数据库。快照是副本，重复 ID、重复规范化 URL 或非法 ID 会被拒绝。

只有在该上下文的请求全部结束后才调用 `clear()`；开始新会话也可新建上下文。省略 `sources` 仍使用默认全局表；旧全局 API 不会读取或清空显式上下文。缓存正文可共享，但缓存命中会为当前上下文登记来源，已取消的请求在读缓存前拒绝。

## 从 0.6.0 升级

原有 SDK 调用与全局来源 API 保持兼容；只有需要会话隔离的应用才需传入 `sources`。0.6.0 不含上下文 API，抓取缓存命中也不会重新登记已清空的来源表。0.7.0 已修复此行为，并将标题的 UTF-8 字节一起计入缓存容量。
