---
id: "docs-agent-webtool-mcp"
slug: "mcp"
title: "MCP 接入"
description: "通过 stdio 启动网页工具服务，为 MCP 客户端提供抓取和搜索。"
date: "2026-10-15"
---

## 启动服务

```sh
npx -y agent-webtool@0.8.0 mcp
```

服务通过标准输入输出传输 MCP 消息，默认提供 `web_fetch` 和 `web_search`。它由客户端作为子进程管理，不是 HTTP 服务，无需另开监听端口。输出用于协议通信，不应当作普通终端抓取结果使用。

## 客户端配置

支持通用 `mcpServers` 配置的客户端可使用：

```json
{
  "mcpServers": {
    "webtool": {
      "command": "npx",
      "args": ["-y", "agent-webtool@0.8.0", "mcp"]
    }
  }
}
```

配置文件位置和启用方式由各客户端决定。Bun 用户可将 `command` 改为 `bunx`，`args` 改为 `["agent-webtool@0.8.0", "mcp"]`。

## 选择工具

```sh
npx -y agent-webtool@0.8.0 mcp --tools fetch
npx -y agent-webtool@0.8.0 mcp --tools fetch,search
```

`fetch` 对应 `web_fetch`，`search` 对应 `web_search`。工具同时返回 MCP 文本和结构化结果；出错时提供错误标记及说明。搜索的引擎选择、超时、站点和时间条件由工具输入传入，具体以客户端读取到的 schema 为准。

## 协议与升级（0.8.0 起）

0.8.0 使用 MCP TypeScript SDK 2.3.1 和正式协议 **2026-07-28**，通过 `serveStdio` 支持新协议发现，同时保留 2025-11-25、2025-06-18、2025-03-26、2024-11-05、2024-10-07 的初始化协商。启动命令和工具名称保持一致，仍为 stdio 服务。0.7.1 不包含本节的新能力，升级时更新客户端配置中的包版本。

## 结果与错误

两个工具保留原有单个文本内容块，同时提供 `outputSchema` 和 `structuredContent`：

| 工具         | 结构化结果                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------------- |
| `web_fetch`  | `{ text: string }`，与文本块中的页面内容或重定向提示一致                                       |
| `web_search` | `{ text, results, engines }`，复用 SDK 的 `SearchResponse`，包含来源编号、排序分数及各引擎状态 |

工具声明为只读、幂等及访问外部网络。参数遵守完整严格 schema，未知字段现在会被拒绝。输入校验及执行失败返回 `isError: true` 和错误文本；未知或被筛除的工具返回 JSON-RPC `-32602`。搜索部分失败、全部失败或无结果仍通过正常结果中的引擎状态表达。

## 取消与来源范围

客户端取消会传递至底层抓取与搜索；关闭 stdin 或发送 SIGINT/SIGTERM 会关闭连接并中止在途操作。来源编号在同一连接内稳定，不同 server 实例互相隔离；不提供来源快照或持久化接口。SDK 和普通 CLI 的来源管理方式保持原有契约。

公开 0.8.0 已在独立目录通过 Node 20.18.1 和 Node 24 的 SDK/CLI/MCP 消费检查，覆盖六个协议版本、schema、工具筛选、错误及 EOF；源码离线测试另覆盖自动协商、成功结果、并发、来源隔离和取消/关闭。真实搜索引擎和各桌面客户端本轮未验证。协议细节见 [官方迁移说明](https://ts.sdk.modelcontextprotocol.io/v2/migration/support-2026-07-28)。
