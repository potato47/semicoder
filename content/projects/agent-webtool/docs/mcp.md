---
id: "docs-agent-webtool-mcp"
slug: "mcp"
title: "MCP 接入"
description: "通过 stdio 启动网页工具服务，为 MCP 客户端提供抓取和搜索。"
date: "2026-10-06"
---

## 启动服务

```sh
npx -y agent-webtool@0.7.0 mcp
```

服务通过标准输入输出传输 MCP 消息，默认提供 `web_fetch` 和 `web_search`。它由客户端作为子进程管理，不是 HTTP 服务，无需另开监听端口。输出用于协议通信，不应当作普通终端抓取结果使用。

## 客户端配置

支持通用 `mcpServers` 配置的客户端可使用：

```json
{
  "mcpServers": {
    "webtool": {
      "command": "npx",
      "args": ["-y", "agent-webtool@0.7.0", "mcp"]
    }
  }
}
```

配置文件位置和启用方式由各客户端决定。Bun 用户可将 `command` 改为 `bunx`，`args` 改为 `["agent-webtool@0.7.0", "mcp"]`。

## 选择工具

```sh
npx -y agent-webtool@0.7.0 mcp --tools fetch
npx -y agent-webtool@0.7.0 mcp --tools fetch,search
```

`fetch` 对应 `web_fetch`，`search` 对应 `web_search`。工具返回 MCP 文本内容；出错时提供错误标记及说明。搜索的引擎选择、超时、站点和时间条件由工具输入传入，具体以客户端读取到的 schema 为准。

本次已验证公开 0.7.0 的初始化、工具列表、工具筛选及非法 URL 错误返回；没有逐一验证具体 MCP 客户端或真实搜索结果。SDK 的显式会话上下文参数不属于 MCP 输入；需要独立来源存储的应用应通过 SDK 接入。
