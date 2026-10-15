---
id: "docs-agent-webtool-installation"
slug: "installation"
title: "安装与快速开始"
description: "使用 npm 或 Bun 安装公开版本，选择 SDK、CLI 或 MCP 入口。"
date: "2026-10-16"
---

## 运行环境

使用 Node.js 20.18.1 或更高版本，也可使用 Bun。项目开发与构建使用 Bun 1.4.2；安装已构建的 npm 包不需要 Bun。SDK 使用服务端 DNS 和网络 API，不用于浏览器打包。

## 无需全局安装

以下命令使用固定的公开版本：

```sh
npx -y agent-webtool@0.8.1 fetch https://example.com
npx -y agent-webtool@0.8.1 search "Bun runtime" --limit 5
```

Bun 用户可将 `npx -y` 替换为 `bunx`。执行时需要访问 npm 和目标网页；网络错误不代表安装失败。

## 安装到项目

```sh
npm install agent-webtool@0.8.1
# 或
bun add agent-webtool@0.8.1
```

通过 [SDK](/agent-webtool/docs/sdk) 导入 `webFetch` 与 `webSearch`。如果只需要终端命令，也可以全局安装：

```sh
npm install -g agent-webtool@0.8.1
webtool --version
agent-webtool --version
```

两个命令名称指向相同入口，均应输出 `0.8.1`。MCP 客户端配置见 [MCP 接入](/agent-webtool/docs/mcp)。

## 版本边界

2026-10-16 已在独立目录安装公开 0.8.1，验证 ESM/CJS、TypeScript、两个 CLI、MCP 及来源上下文；公开归档与 GitHub 流水线验收归档逐字节一致。0.7.0 起提供 `SourceContext` 和 `createSourceContext`，从 0.6.0 升级后现有调用继续可用，独立会话可按 [SDK 指南](/agent-webtool/docs/sdk) 接入。

0.8.0 升级 MCP SDK v2，支持新旧协议、结构化工具结果和取消；严格校验会拒绝未知参数。JavaScript SDK 返回类型和普通 CLI 输出保持一致，详见 [MCP 接入](/agent-webtool/docs/mcp)。

0.8.1 增加结构化抓取、流式大小限制和 DNS/正文取消；旧文本 SDK、CLI/MCP 返回结构保留。网络工具实现阶段已在 fn 隔离实例验证一次真实搜索；结果只代表当时网络与查询。多引擎状态及常见失败说明见 [命令行](/agent-webtool/docs/cli)。升级时应先阅读适用版本与迁移说明，再更新依赖版本。
