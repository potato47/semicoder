# 项目资料与发布状态

公开发行核对：2026-10-09；FIA 0.18.0、麻辣烫 0.4.0 / build 4、SDK 0.2.1 均已实际发布并验证。网站内容由本站维护，不在构建时复制外部工作区。分别记录源码、公开固定归档、npm 和正式应用产物；网站上线以独立部署工作流为准。

Semicoder 是各自有项目统一的官网文档入口。当前工作区已更名为 `semicoder-workspace`，包含 FIA、麻辣烫、Semicoder 和 agent-webtool 四个开发项目；FIA 活跃源码已迁入麻辣烫，原独立仓库保留历史；本站为工作区内实体目录。该布局只用于维护协作，不作为本站运行/构建的前提。

## 2026-10-10 本地 UI / SDK 重构（未发布）

麻辣烫实现提交 `ad9a587`，基线 `5bf293f`，本次源码采用 @base-ui/react 1.9.0、Tailwind CSS 4.3.3 和 SDK manifest 0.3。来源包括 packages/sdk/src/ui、theme.css、styles.ts、build.ts、frontend 和内置插件；包版本与应用 build 未调整。SDK 归档独立消费已本地验证，完整 UI 验收由 workspace 会话记录归档。

用户随后要求收尾并合入本地主干：麻辣烫 `main` 已快进至 `7290479`（实现 `ad9a587`，后续只补待发布来源），保留 `codex/base-ui-refresh`。本站本轮说明随 `codex/base-ui-docs` 一并合入本地 `main`，特性分支保留；合并不代表公开发行或网站部署。

本站插件开发、开始使用、模型和插件管理指南增加明确未发布说明，保留公开应用 0.4.0 / SDK 0.2.1 的默认安装和代码示例；未推送或部署。无 FIA 契约、网站运行时或安装入口变动。

## 2026-10-10 本地共仓重构（未发布）

用户确认麻辣烫是 FIA 第一个正式项目，先在应用仓库共同开发，稳定后拆出框架。麻辣烫 `codex/fia-integration` 以不压缩 subtree 导入 FIA `0a319af8619578f3a3c99a34d389886499166d9d`，来源应用基线 `c766a05db213f673a2e74bb7373aeee8fb3ffde9`；活跃框架路径为 `framework/fia/`，顶层原 FIA 仓库保留历史。

本次改为 workspace 依赖与根锁文件，开发命令自动构建/监督框架，CI 从同一提交构建原生运行时；源码开发增加 Swift 工具链要求。版本号仍为 FIA 0.18.0 / 应用 0.4.0，不代表与公开产物相同。FIA npm 共仓发布禁用，现有 npm、DMG、更新源与正式源码快照不变。

本地网站仅补充明确的未发布说明；原正式下载及 v0.4.0 固定源码教程继续保留。代码、官网文档均未推送或部署；真实 GitHub runner / 签名公证 / 公开发行未在本轮验证。源码实现验收基线为麻辣烫 `80f38d9`，最终本地验收由 workspace 会话记录归档。本站文档与内容检查、生产构建及 31 个静态页面检查通过；没有网站运行时或构建依赖本机 workspace。

## FIA

### 当前发行：0.18.0（2026-10-09）

- [公开源码与 v0.18.0](https://github.com/potato47/fia/tree/v0.18.0) 固定 `85206f6f532242fb2dfcfdf2a4b608f131726bf5`，新建公开仓库已匿名核实。新增每个原生网页窗口的置顶图标，默认模板自动包含；点击切换普通/浮动层级，隐藏/后端重连保留，窗口销毁/退出后重置。已有应用需完整重建分发。
- [手动验收 37887494256](https://github.com/potato47/fia/actions/runs/37887494256) 与 [正式标签 OIDC 发布 37887890823](https://github.com/potato47/fia/actions/runs/37887890823) 成功，覆盖版本校验、macos-26 arm64 运行时、73 CLI / 48 Swift 测试、归档校验及 artifact 传递。npm Environment 仅允许精确 v0.18.0；Trusted Publisher 限定仓库/工作流/环境，未使用长期 npm token。
- registry latest 为 0.18.0，公开 tarball 与正式 Actions artifact 逐字节一致，SHA-256 `faf196b9408cc2fa4b9edfb0145c592a9a87b6fbc0b0245ad6b89c6c0e7ff4e2`。在 workspace 外通过公开 npm 创建默认应用，检查、构建、启动验收通过；置顶/取消置顶的原生交互已验证。
- 麻辣烫 0.4.0 已切换同一官方固定 FIA 0.18.0 归档并接入置顶，SDK 仍为 0.2.1。本站安装入口、介绍、开发指南和分发说明同步；网站部署证据另行记录。

### 0.17.0 发行（2026-10-09，历史）

- 公开 npm `@semicoder/fia@0.17.0`，registry latest 已核实为 0.17.0；源码 / 本地 v0.17.0 标签为 `4689c707913ca31f93b03cfe4deb61466c9e69f2`。默认浏览器标题栏入口、短期会话、Native 白名单、文件选择连接修复、隔离 Dev / Preview 均已发布，也包括此前固定归档的外观、OAuth、代理、DMG 和应用子命令能力。
- [固定 FIA 归档](https://github.com/potato47/malatang/releases/tag/fia-runtime-4689c707913c) 与公开 npm tarball、唯一验收包逐字节一致，SHA-256 `521a07c387efa5b2c7ddbb76807b5c613b5b26cdf6e9c84fb965d27a5dd536b6`。本次固定归档为 prerelease / 非 latest，不是应用安装包。
- runtime 构建、完整 check（73 CLI / 47 Swift）与 smoke 通过；从公开 npm 在 workspace 外执行 `bunx @semicoder/fia@0.17.0 create`，默认模板 check / 生产 build 通过。先前本地 Chromium / Safari 覆盖授权、刷新、Worker 恢复、撤销、资源、Native 文件选择和计数器共享；真实发布应用检查单独见下方。
- 本次经维护者本机 npm 认证发布；FIA 目标源码仓库仍返回 404，本地未配置 remote，未新建仓库、未验证 GitHub OIDC。源码入口仍不对读者提供。旧应用升级 Host 须完整安装包。

### 历史核对（下列未发布边界已由 0.17.0 替代）

- 2026-10-09 本地未发布浏览器能力：`codex/browser-access` 基于 FIA `410638d`；源文件 `browser-sessions.ts` / `browser-assets.ts` / `gateway.ts`、Native `Runtime.swift` / `Windows.swift` / `FIAApplication.swift` 和模板新增默认入口、独立标签页会话、Service Worker 与 WS 握手票据、撤销及权限白名单。官网 development 新增明确未发布段落，旧 npm 与固定归档安装路线保持不变。此次 Host 变更需未来完整应用安装包。

- 2026-10-08 本地未发布：FIA `410638dc950ffce18f412b90b4912f60ac3b3c7e` 已从 `codex/local-app-identity` 快进合入本地 `main`，新增 Dev / Preview 名称、独立 macOS Bundle ID、DEV/PREV Dock 与菜单栏标记、隔离 `fia run` 和 `fia agent --preview`。新 Host / CLI 已重建并在麻辣烫复制依赖中验证；逻辑 identifier、旧开发数据路径与 Keychain service 保持兼容，应用仍负责按数据路径区分凭据 key。公开 npm 与下方固定归档尚不含这些能力；FIA development 页面已标明版本边界，未替换默认安装路线。

- 2026-10-05 已公开固定归档的源码为 `dd430c851192b2e32116d50973e452a6ff2f1b72`；新增 `agent.commands` 与原生交互等待修复。公开基础教程仍面向 npm `0.16.1`，本次没有发布 FIA npm。
- [固定运行时 dd430c851192](https://github.com/potato47/malatang/releases/tag/fia-runtime-dd430c851192) 已公开，附件 `semicoder-fia-0.16.1.tgz` 的 SHA-256 为 `368e6ac1316bb130360817943788129bf544adc3f163aa614ac1a8d043e2184a`。独立下载与本地验证归档一致，麻辣烫 CI 已实际消费该锁定归档。
- 该运行时作为构建依赖标记 prerelease，不是应用安装包；版本字符串与旧 npm 相同，内容不同。旧 `fia-runtime-8650f80f4a11` 不包含新命令，不改写旧归档或其能力记录。
- FIA 源码仓库此前匿名访问返回 404，本站不要求克隆私有源码，不增加未经验证的源码按钮。

## 麻辣烫

### 当前发行：0.4.0（2026-10-09）

- 正式 [v0.4.0 / Build 4](https://github.com/potato47/malatang/releases/tag/v0.4.0)，源码 `620d19a450578ca98c58c3ae1b7e13b524e57368`。[主干 CI 37888908778](https://github.com/potato47/malatang/actions/runs/37888908778) 与 [正式发布 37888912203](https://github.com/potato47/malatang/actions/runs/37888912203) 成功；实际消费 FIA 官方 v0.18.0 同一 npm artifact，冻结安装、69 测试、签名、公证、镜像运行与 Pages 部署通过。
- 五项公开附件匿名下载并核对 digest。`Malatang-0.4.0-4-mac-arm64.dmg` 为 30,513,939 字节，SHA-256 `8aca60752d1e25a28e50dbd122b03b505ed40088408d73bab0ab7077617ffef7`。独立 hdiutil / stapler / Gatekeeper DMG 与 app / codesign、安装包与签名更新逐文件比对通过。
- 公网 latest.json 与 Release 一致，Ed25519 签名及 33 个在线文件大小 / SHA-256 通过。runtimeId `9cd13e79576bff74bb3ca30f659e0cd1e40a9d407b3b0102dd9f2895ee63dbf4`。从 0.3.0 或更早版本升级须完整 DMG，账号、模型、KV 和历史保留；跨版本代码热更新未实测。
- 原生 Dev / Preview 和公开正式 DMG 均实际点击置顶 / 取消置顶并验证反馈。正式包在临时独立数据目录运行，未操作用户正式数据或调用真实模型。置顶归 FIA 管理，麻辣烫没有重复实现；SDK 仍为 0.2.1，manifest 兼容版本仍为 0.2，插件开发契约未改变。
- github-pages 仅新增精确 v0.4.0 tag 规则，其他保护保留。官网安装、介绍、首次使用与常见问题按公开产物同步；网站部署单独验收。

### 0.3.0 发行（2026-10-09，历史）

- 正式 [v0.3.0 / Build 3](https://github.com/potato47/malatang/releases/tag/v0.3.0)，非 draft / prerelease，源码 `7c0f237986728d13063fd25e38e0a826738af213`。[主干 CI 37868718881](https://github.com/potato47/malatang/actions/runs/37868718881) 与 [正式发布 37868966391](https://github.com/potato47/malatang/actions/runs/37868966391) 成功；固定 FIA 下载、冻结安装、检查 / 69 测试、SDK 归档消费、签名 / 公证 / 镜像启动、更新校验与 Pages 部署通过。
- 已匿名下载五项正式附件并核对 GitHub digest。`Malatang-0.3.0-3-mac-arm64.dmg` 为 30,516,155 字节，SHA-256 `8784f623d3a97fbf2f7acc7f2e00fa098154f939209aca5503b33d35fc589145`；hdiutil、stapler、Gatekeeper DMG / app、codesign 均通过，只读挂载内应用与签名更新逐文件一致。
- 公网 latest.json 与 Release 字节一致，Ed25519 签名与全部 33 个在线文件大小 / SHA-256 通过。runtimeId `2f469910b09105865dc6df75930f16b39c8fa707ebddc31ef8a35844a259f22d`，与 0.2.0 不同，须完整 DMG 升级；账号、模型、KV 和历史保留。跨版本代码热更新不据此视为实测。
- SDK npm `@semicoder/malatang-sdk@0.2.1` 已独立发布，latest 为 0.2.1，SHA-256 `711f7f2d39cfd3b51ed937b45cf44b136f2708b54c10de6c8490630edc5ae93f`（公开 tarball 与验收包一致）。从 registry 在 workspace 外安装，create 回执 0.2.1、notes check / build / pack 通过。本次本机 npm 认证，未执行 SDK OIDC，不推送重复版本的 sdk 标签。
- manifest 兼容版本保持 0.2；Popover 新定位参数需要宿主 0.3.0 和 SDK 0.2.1。SDK 0.1 插件仍须迁移重建。Pi AI 保持 1.0.2，不代表全部真实模型或登录刷新均已验收。
- `github-pages` 仅增加精确 `v0.3.0` tag 规则，其余保护保留。官网安装、指南与版本证据按这些公开产物同步；网站部署按本次 main 工作流单独验收。

### 历史核对（下列本地未发布边界已由 0.3.0 替代）

- 2026-10-09 麻辣烫 `codex/browser-access` 基于 `31d0561` 接入本地重建 FIA，沿用空应用标题栏，由框架提供入口；同步 getting-started / installation / troubleshooting。公开 0.2.0、SDK npm 和 `release/runtime-lock.json` 的 dd430c851192 不变。下次发行须公开、验收新 FIA 固定归档后切换 lock，再同步安装入口。本任务未推送、发布或部署。
- 同日文件选择问题修复：FIA `vite.ts` 按实际 SDK 文件内容使同版本 `file:` 更新的 Vite 缓存失效；麻辣烫 troubleshooting 记录开发重启与旧缓存排查。仅修复已有文件对话框能力的连接，不扩大浏览器 Native 权限，仍未发布。

- 2026-10-08 本地未发布身份区分：麻辣烫 `31d05614dcc00bb799c61ed3a01addaff29aa84a` 已从 `codex/local-app-identity` 快进合入本地 `main`，接入新 FIA `app.mode`，窗口显示「麻辣烫 · 开发版 / 预览版」；`dev` 保留原开发数据，新的 `run` 使用 `.fia/preview/data`，停用正式更新源。三种实际应用同时运行，预览 KV 与开发/正式版隔离，正式数据文件哈希未变；未进行真实模型调用或重新登录。installation / troubleshooting 已补充旧归档与新预览的边界，当前下载保持 0.2.0；`release/runtime-lock.json` 仍指向旧公开归档，后续发行必须公开并验收新 runtime 后切换。网站文档由 `codex/local-app-identity-docs` 整合到本地主干，保留特性分支；按用户要求不推送或部署。

- 2026-10-08 本地未发布样式修复：麻辣烫 `c678460` 已按用户授权从 `codex/theme-popover-style` 快进合入本地 `main`，调整 `frontend/ThemeControl.tsx` 与 SDK `src/ui.tsx` / `src/ui.css`，主题浮层改在侧栏右侧展开并留出约 8px 间距，选择框焦点提示改为贴合边框的 1px 细线。SDK Popover 新增定位参数，尚未进入公开应用或 npm 0.2.0。已核对 getting-started、plugin-development、installation 与 troubleshooting：现有公开指南不承诺浮层位置或这些新参数，安装入口保持已发布 0.2.0；后续发行时更新来源和受影响指南。用户明确要求暂不推送或部署，本次只提交本地来源记录。
- 正式版本 [v0.2.0 / Build 2](https://github.com/potato47/malatang/releases/tag/v0.2.0)，非 draft、非 prerelease；源码提交 `c82d6adebf0f1dfe81ded21ce15ef4b7c15040be`。统一 UI、SDK 0.2 / manifest 0.2、CSS Modules 与 notes/model 开发 CLI 已在这一发行中可用。
- [Release Malatang 37289643139](https://github.com/potato47/malatang/actions/runs/37289643139) 成功，涵盖固定运行时、检查/测试、SDK 独立消费、签名、公证、镜像启动与退出、更新签名和 Pages 部署。SDK、应用 Release 和官网各自发布，不能互相代替验收。
- 五项附件已匿名下载并与 GitHub digest 校验：DMG、SHA-256、DMG report、updates.tar.gz、latest.json。DMG 为 `Malatang-0.2.0-2-mac-arm64.dmg`，30,448,594 字节，SHA-256 `5d8171ab67748b5203f1abf8a3af9938edf474acf12e4441a3370899d34c03b5`。
- 独立通过 `hdiutil verify`、`stapler validate`、Gatekeeper DMG / app 检查及 `codesign --verify --deep --strict`；公开报告 `ok: true`。`verifyRelease` 对比只读挂载应用与签名更新的全部代码、runtime、version/build，均一致；报告的桌面交互明确为未测试，真实 WKWebView UI 验收来自本地实现阶段。
- 公网更新清单 `https://nobug.space/malatang/updates/latest.json` 与 Release 逐字节一致，Ed25519 签名及线上 33 个文件 size / SHA-256 全部通过。runtimeId 为 `ef60bd6049cc567c62980dd10fb2659e82802f2f455e393789f481cc1e8b4df4`，与 0.1.0 不同，因此升级需完整 DMG；跨版本代码更新仍未实测。
- [@semicoder/malatang-sdk 0.2.0](https://www.npmjs.com/package/@semicoder/malatang-sdk) 已通过用户 npm 登录首次正式发布；registry latest 为 0.2.0。公开归档与验收归档逐字节一致，SHA-1 `32d14881d97c71ffcef14cd3358305d6b7209bb5`；在 workspace 外直接安装 npm 版本后，模板 check/build/pack 全部通过。此次不是 OIDC 发布，后续 Trusted Publisher 及远端 OIDC 仍待单独验收，不推送重复版本的 SDK 发布标签。
- CLI 创建项目继续内带 SDK 快照；SDK 0.1 插件需迁移并重建，模型配置、账号、同 ID 的 KV 与历史保留。Pi AI 仍为 1.0.2；本次不代表所有模型、真实令牌刷新或撤销均已验证。

## agent-webtool

- 2026-10-06 正式发布 [0.7.0](https://github.com/potato47/agent-webtool/releases/tag/v0.7.0)，tag 源码 `ec6a2afcea8a651d58ea9a4cec513a12089a27b3`。新增 `SourceContext` / `createSourceContext`、快照恢复、缓存命中登记与标题容量修复；现有调用兼容，未接入麻辣烫。
- [三平台 CI 37424449550](https://github.com/potato47/agent-webtool/actions/runs/37424449550)、手动归档验收 37424738211 和 [正式 OIDC 发布 37424883345](https://github.com/potato47/agent-webtool/actions/runs/37424883345) 成功。Linux Node 20.18.1 / 24、macOS Node 24 均通过独立消费；Trusted Publisher 限定仓库、工作流与 `npm` 环境，本次环境只允许精确 `v0.7.0` 标签。
- 公开归档 `https://registry.npmjs.org/agent-webtool/-/agent-webtool-0.7.0.tgz` 与正式 GitHub artifact 逐字节一致。SHA-256 `5d51d108d64121172f213e83821eea7daa06cff7c0a2994303165bc354d46d52`，SHA-1 `a411bcd8a50e252af53175dc30316c4230bb58ac`；registry 已附 SLSA provenance，发布日志透明索引 3103730359。
- 使用全新临时目录及 npm 缓存按版本安装，Node ESM/CJS、TypeScript、两个 CLI、MCP 初始化/工具列表/筛选/非法 URL 错误返回通过；实际公开 SDK 的来源隔离、缓存登记、快照恢复和取消也通过。真实搜索引擎可用性未重新验收。
- 本站新增 `content/projects/agent-webtool/`：介绍、安装、SDK、CLI、MCP，共 4 篇指南；默认固定已验证的 0.7.0，SDK 保留 0.6.0 迁移边界。内容随本站主干工作流部署，实际部署结果单独验收，不以本地内容代替上线证据。
- 旧公开 npm 0.6.0 的 SHA-1 为 `4a9b5332511ffaa62cf1e59808616189fb5cb3c5`，不含 SourceContext；此前源码预览现由正式 0.7.0 指南替代。包名仍为 `agent-webtool`，0.7.0 package homepage 保留 GitHub README。

## 维护入口

FIA 介绍和 5 篇指南位于 `content/projects/fia/`；麻辣烫介绍和 7 篇指南位于 `content/projects/malatang/`；本站介绍和 2 篇指南位于 `content/projects/semicoder/`。agent-webtool 介绍及 4 篇指南位于 `content/projects/agent-webtool/`。发布状态首先更新各自安装页，再同步项目介绍与版本说明。发布后的下载链接应使用真实 Release 及其附件，保留平台要求与安装步骤；不要将 CI artifact 或框架包伪装为正式应用。

本站只链接公开源码和包地址，不托管二进制，不代替源项目发布框架、应用或 npm 包。网站随主干既有工作流执行质量检查、预发布和生产发布。

## 跨项目更新流程

| 变化来源                                                      | 本站核对位置                                                                           |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| FIA API、原生能力、CLI、构建与平台要求                        | FIA 项目介绍、shared-api / development / automation / installation / distribution 指南 |
| 麻辣烫设置、模型/账号、插件安装与生命周期                     | 麻辣烫项目介绍、getting-started / models / plugins / troubleshooting / automation 指南 |
| SDK 包名、manifest、构建方式与方法                            | plugin-development、项目介绍；与安装指南的源码版本保持一致                             |
| agent-webtool 抓取/搜索、SDK/CLI/MCP、来源生命周期或 npm 发布 | agent-webtool 项目介绍、安装与使用指南、本来源记录；核对公开导出与本地未发布改动       |
| Semicoder 自身使用与内容写作流程                              | `content/projects/semicoder/` 和相关工程文档；无用户文档影响时说明依据                 |
| 公开应用、npm SDK、固定 FIA 归档                              | installation、plugin-development、本来源记录；核对 tag、文件、平台和 SHA-256           |

1. 确认变更所属项目、源码提交、对应契约及已验证行为；框架或应用缺陷反馈源仓库修正，网站不创造新的 API 约定。
2. 每次项目版本发布必须同步本站对应文档、安装入口、迁移说明及版本证据。分开核对本地实现、公开可获取产物和网站部署版本；各项目无需同时升版，但默认安装路线必须完整可复现。先准备文档，公开产物验证后再切换默认路径；只更新文案时不重打运行时归档。
3. 先改安装页及版本范围，再核对介绍、指南、导航、站内引用；发布状态或来源改变时记录日期、提交、归档/哈希和验证结果。没有变化的检查不制造新发布结论。
4. 依据 `docs/impact.json` 同步工程文档。仅工程 Markdown 修改检查事实、链接、格式与 `docs:check`；公开 `content/` 正文变化须生成内容、执行 `content:check`、生产构建及 `build:check`。命令变化实际验证相应步骤，路由或代码变化依项目规范执行相关完整检查。
5. 交付分别说明源项目、本站及 workspace 知识库的修改与待办。页面缺失、公开产物未验或部署未获授权时，明确记录未完成项和完成条件。网站 `main` 推送会部署；麻辣烫应用 `v*`、SDK `sdk-v*`、FIA npm `v*` 及 agent-webtool npm 各自管理，均不由本站操作代替。agent-webtool 的 CI 与 0.7.0 OIDC 发布已验收；未来版本须核对环境标签规则并单独授权。

`docs/impact.json` 只能发现本站仓库内的修改；相邻项目变更仍需在开发任务交付时主动核对。源码仓库不可用时保留已验证快照，记录缺少的来源，不猜测最新行为。麻辣烫更新源由应用的 GitHub Pages 发布流程维护，与本站内容部署独立，不能只因官网整合就改为本站域名。

## 首次正式发行与官网文档同步（历史）

2026-10-04，网站在既有本地下载入口修订上接续更新：默认安装路线改为真实 DMG，源码锁定 v0.1.0 提交，模型和 SDK 教程统一到同一公开版本，并更新 FIA 分发页中的应用下载状态。

官网为 `https://semicoder.dev/malatang`，统一安装入口为 `https://semicoder.dev/malatang/docs/installation`；应用更新源仍由麻辣烫发布流程维护。官网本地内容完成不等于线上页面已部署，网站提交、推送和部署状态另行记录。

本次官网文档提交前，本地 `bun run check`、28 项单元测试、11 项 Workers 测试、生产构建与 `build:check` 全部通过。30 个公开静态页面的 canonical、章节锚点、草稿隔离与真实 Pagefind 项目搜索通过；额外核对安装页 HTML 包含真实 Release / DMG / SHA 链接、固定源码提交及升级验证边界。`git diff --check` 通过。线上部署结果由 workspace 知识库的交付记录单独追踪，不从本地检查或 Git 推送推断。

## 正式发布前的下载与官网入口复核（历史）

2026-10-04，本地网站基线 `47b2955caa76`、麻辣烫 `451d16559826`。本次匿名请求与浏览器检查结果：

| 入口                                               | 结果                                                                          |
| -------------------------------------------------- | ----------------------------------------------------------------------------- |
| GitHub Releases 列表                               | HTTP 200，仅两个 `fia-runtime-*` 预发布，各含一个框架 `.tgz`；无应用 DMG      |
| GitHub 最新正式 Release API                        | HTTP 404，尚无稳定发行版                                                      |
| `https://nobug.space/malatang/updates/latest.json` | HTTP 404，尚无公开稳定更新清单                                                |
| `https://semicoder.dev/malatang/docs/installation` | 线上页面可读取，仍显示未发布状态，与发行记录一致                              |
| 仓库 About website                                 | 原为空；已在 GitHub 保存为 `https://semicoder.dev/malatang`，可见链接确认成功 |

官网统一为 `https://semicoder.dev/malatang`，安装入口为 `https://semicoder.dev/malatang/docs/installation`。本地应用完整安装跳转、npm homepage、后续 Release 说明及更新站首页已同步上述地址，待对应产物发布后生效；代码更新清单和下载文件继续使用原更新源，不迁移到内容网站。

本次修正安装页、项目介绍和常见问题的状态说明，不创建猜测的 DMG 直链，也不把 Actions 验收产物当作公开下载。当时缺少首次正式发行；本次发行结果见上方记录。网站推送/部署、正式 Release 与 SDK npm 发布各自单独完成；公开源码安装快照保持不变。

## 前次本地同步核对（历史）

2026-10-04 以本地 FIA `8650f80f4a11`、麻辣烫 `f836a06d9326` 和本站改动前 `c5f7878d0d32` 为证据，补充跨项目规范、来源影响映射与模型指南版本范围。固定 FIA 归档和安装快照保持不变；本轮没有新增应用构建、真实账号/模型、npm 发布或网站部署验收。

## 首次官网集成验证（历史）

- 网站 `bun run check`、28 项单元测试、11 项 Workers 测试、生产构建与 `build:check` 通过；30 个公开静态页面（另有后台预渲染页），包括全部新文档的 canonical、目录锚点、草稿隔离和真实 Pagefind 项目筛选。
- 在全新临时目录通过匿名公开源码克隆、固定 FIA 下载及 SHA-256 校验，完成麻辣烫 `check` / `build`；没有使用本地私有 FIA 源码补齐依赖。
- 公开 npm FIA 0.16.1 实际创建默认应用并完成 `check` / `build`；文档中的笔记插件代码实际经 SDK 构建与 `bun pm pack`。以上未启动真实模型或访问用户账号。
- 生产预览经 ego-browser 检查首页、项目、文档、安装入口、中文项目搜索、手机章节和项目切换；检查 1440px 桌面与 390px 手机布局、浅深色主题。
- 内容与安装验证未执行手动部署，也未发布应用或 npm 包；网站上线以主干工作流结果为准，正式应用下载和在线更新仍以 Release 的真实状态为准。

## 2026-10-05 发布前 UI / CLI 预览（历史，已由页首发行记录替代）

- 本地特性分支：FIA codex/app-cli-commands（基于 ff9aa2c），麻辣烫 codex/plugin-ui-cli（基于 d9b128c）；网站 codex/plugin-ui-cli-docs。来源为 FIA config.ts / agent-artifacts.ts / agent-cli.ts / agent-server.ts 与麻辣烫 packages/sdk、commands/plugin.ts、scripts/sdk-snapshot.ts。
- 新增 SDK 0.2.0 / manifest 0.2、宿主共享 UI 与 CSS Modules、notes/model 模板和 plugin create/check/build/pack。官网只追加明确标注的预览段落；SDK 0.1 的正式教程与已核实 v0.1.0 安装入口保留。
- 新 FIA CLI / 原生启动等待修复需要新的 runtimeId 和固定归档；旧公开归档不支持新命令。未推送、发布 npm/Release、切换 CI 远端下载锁或部署。最终本地验证和归档哈希由工作区交付记录维护，不能把本地构建状态当作线上状态。

## 2026-10-10 自定义配色补充（未发布）

麻辣烫 `ad9a587` 新增 `shared/theme.ts`、`backend/appearance.ts`、`frontend/AppearanceSettings.tsx` 与主题 Provider：明暗模式控制原生标题栏，默认 / GitHub / 自定义配色只作用于内容区，SDK token 和 Portal 继承。第一次使用指南追加预览、保存、取消、恢复与版本边界。未修改公开安装入口，无 FIA 框架变更，无版本调整或部署。

## 2026-10-10 标题栏样式核对（未发布）

本地麻辣烫 `ad9a587` 中的 FIA `Sources/FIA/Windows.swift` 将框架置顶与浏览器按钮改为无边框、中性图标色，保留实心置顶、悬停反馈、明暗模式与可访问名称。已核对 FIA 安装/窗口指南及麻辣烫第一次使用/常见问题：现有正文按位置、图标与行为描述，无边框或蓝色依赖，无需修改公开操作教程。API、安装入口及公开发行事实保持不变；原生 Host 已改变，未来发行须完整安装包。本轮不发布、不部署。
