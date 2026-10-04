---
id: "docs-malatang-automation"
slug: "automation"
title: "CLI 与自动化"
description: "查询模型、安装插件、调用插件方法，并跟踪任务结果。"
date: "2026-10-04"
---

## 选择正确实例

开发时，在已启动 `bun run dev` 的项目目录使用 `bun run agent`。安装应用后从应用菜单安装 CLI，再使用 `malatang`。这两个实例的数据独立，命令不会自动共享模型配置。

```bash
bun run agent schema --json
bun run agent call models.list --json '{}'
bun run agent call plugins.list --json '{}'
```

动态插件方法的名称、描述和输入 JSON Schema 来自 `plugins.list` 的 `methods`。先发现当前已安装插件，不假设任意插件都存在。

## 调用译文插件

从 `models.list` 选出实际可用的模型 ID，再替换下面的占位值：

```bash
bun run agent call plugins.invoke --json '{"pluginId":"translate","method":"translate","input":{"text":"Hello","target":"简体中文","modelId":"实际模型 ID"}}'
bun run agent call runs.list --json '{"pluginId":"translate"}'
```

生成返回运行记录，不等于已经完成。列表显示最近 30 次运行摘要，输入输出最多各 300 字符；使用实际 `runId` 获取完整状态：

```bash
bun run agent call runs.get --json '{"pluginId":"translate","runId":"实际运行 ID"}'
bun run agent call runs.cancel --json '{"pluginId":"translate","runId":"实际运行 ID"}'
```

## 管理插件与外观

```bash
bun run agent call plugins.install --json '{"source":"/absolute/path/plugin.tgz"}'
bun run agent call plugins.jobs --json '{}'
bun run agent call appearance.set --json '{"theme":"dark"}'
```

安装需轮询任务终态；停用和卸载操作可能因任务忙碌而被拒绝。模型和安装事件不保留历史，订阅后或重连后重新读取状态。

## 交给外部 agent

安装生产 CLI 后，可运行 `malatang skill install` 安装随应用生成的使用说明。FIA 提供发现与调用机制，麻辣烫提供业务方法；这不表示应用内已经实现通用 agent loop。

需要用脚本组合多次调用时，参阅 [FIA 的脚本说明](/fia/docs/automation)。
