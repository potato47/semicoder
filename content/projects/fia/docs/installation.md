---
id: "docs-fia-installation"
slug: "installation"
title: "安装与快速开始"
description: "准备 macOS 与 Bun，创建第一个同时支持桌面和 CLI 的应用。"
date: "2026-10-09"
---

## 环境要求

| 项目          | 要求                                                        |
| ------------- | ----------------------------------------------------------- |
| 系统          | macOS 14 或更高版本                                         |
| 芯片          | Apple Silicon（M 系列）；当前不支持 Intel、Windows 或 Linux |
| 开发工具      | Bun 1.4.0 及以上；当前项目使用 1.4.2                        |
| Swift / Xcode | 普通应用开发无需 Swift 编译；维护原生宿主才需要工具链       |

从 [Bun 官方安装说明](https://bun.sh/docs/installation) 安装 Bun，并用 `bun --version` 确认版本。正式签名和公证仍需要 Apple 的发布工具与开发者凭据。

## 创建项目

以下使用已公开的固定 npm 版本，便于重现：

```bash
bunx @semicoder/fia@0.18.0 create my-app --yes
cd my-app
bun run dev
```

创建命令生成项目并安装依赖。`--yes` 使用默认配置；需要自己选择时可去掉它。开发命令会启动原生窗口、Bun 后端与 Vite。初始页面是一个持久化共享计数器。点击原生标题栏最右侧“在浏览器中打开”，即可在本机浏览器使用同一界面；原生窗口继续保留。浏览器入口左侧的置顶图标可切换当前原生窗口置顶，选中时填充高亮。

## 验证同一份业务

保持开发窗口运行，在另一个终端进入 `my-app`：

```bash
bun run agent call counter.get --json '{}'
bun run agent call counter.increment --json '{"by":1}'
```

计数会同步到桌面和已授权的浏览器页面。这些入口都由 `backend/index.ts` 处理，没有另写一份 CLI 业务逻辑。

## 项目结构

| 路径                    | 用途                                 |
| ----------------------- | ------------------------------------ |
| `fia.config.ts`         | 应用名称、标识、版本、窗口与分发配置 |
| `shared/api.ts`         | 方法、事件、输入输出 schema          |
| `backend/index.ts`      | 共享 API 实现和后端生命周期          |
| `frontend/`             | React 页面和前端资源                 |
| `agent/instructions.md` | 提供给外部 agent 的业务操作说明      |

## 构建本地应用

```bash
bun run check
bun run build
```

在项目的 `dist/` 下找到 `.app`。这是本机开发构建，公开分发还需签名和公证。最终使用者运行应用不需要系统 Bun。

安装失败时先检查网络、Bun 版本和芯片架构；运行 `bunx fia doctor --target dev --json` 查看当前项目的诊断。不要用创建 Swift 工程的方式补救缺失的预编译运行时。

下一步阅读 [共享 API](/fia/docs/shared-api) 与 [开发和原生能力](/fia/docs/development)。
