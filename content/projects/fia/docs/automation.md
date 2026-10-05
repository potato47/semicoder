---
id: "docs-fia-automation"
slug: "automation"
title: "CLI、脚本与 agent"
description: "让应用可发现、可调用，并把业务流程交给外部 agent。"
date: "2026-10-04"
---

## 开发时操作应用

在项目根目录对正在运行的开发实例使用 `bun run agent`：

```bash
bun run agent schema --json
bun run agent call counter.get --json '{}'
bun run agent status --json
```

`schema` 给出可调用方法、输入输出和说明。应用业务应通过共享契约公开，不另起一套 CLI 或服务。

## 安装后的命令

将应用放到最终位置后，从应用菜单或菜单栏安装 CLI。默认路径为 `~/.local/bin`，框架不自动修改 shell 配置；需要确保该目录位于 PATH。以下 `my-app` 是创建项目时的命令名：

```bash
my-app call counter.get --json '{}'
my-app open
my-app status --json
my-app quit
```

CLI 可以在后台冷启动应用；`open` 才显示窗口。移动 `.app` 后重新安装 CLI，以修复入口路径。

## TypeScript 脚本

```bash
my-app exec -e 'console.log(await app.call("counter.get", {}))'
my-app exec --file workflow.ts --timeout 60000
```

脚本获得 `app` SDK，可组合多次调用。每次执行使用独立 Bun 子进程，超时或取消会清理受管进程。脚本是可信本机代码，可访问文件和网络，不是安全沙箱，也不会自动安装缺失依赖。

需要长期运行或重启恢复的任务，应在应用后端管理，不能依赖一次 `exec` 保活。

## 有界等待事件

```bash
my-app events counter.changed --jsonl --count 1 --timeout 30000
```

先订阅，再从另一个终端触发修改。达到数量退出 0，超时退出 124；事件没有重放，等待之后仍需读取当前状态。可使用 `--match` 匹配事件 payload 顶层标量字段。

## 给 agent 的使用说明

```bash
my-app skill install --dir ~/.agents/skills
```

构建会生成方法 schema、类型定义和 skill，并合入 `agent/instructions.md` 的业务指导。说明应该解释工作流、前置条件和失败处理。安装 skill 本身不会授予工具权限。

skill 随应用生效的代码版本更新和回退；不要把工作区内部笔记、账号信息或凭证写入公开说明。

## 固定运行时中的应用子命令

FIA 固定运行时 dd430c851192 新增 `agent.commands`：以命令名称为键，声明 description 与项目内 entry 模块。名称不得覆盖 FIA 内置命令。入口默认导出函数，接收 args、cwd、assetsDirectory，返回 void 或 0–255 退出码；构建将入口编译到应用代码产物，并加入 help 与 agent 使用说明。

执行从当前生效代码加载，沿用应用实例连接、后台启动和脚本进程监督机制；Ctrl-C 清理子进程，运行期间阻止代码更新。开发与安装入口分别为 `bun run agent <命令>`、`<应用命令> <命令>`。应用可声明额外开发依赖，例如麻辣烫插件开发命令要求开发者 Bun。

[固定运行时 dd430c851192](https://github.com/potato47/malatang/releases/tag/fia-runtime-dd430c851192) 已公开，并由麻辣烫 0.2.0 使用。公开 npm 0.16.1 与此前固定归档不包含这一能力。CLI 改变 runtimeId，因此已有应用需要新的完整安装包；不能用相同 npm 版本号推断能力一致。
