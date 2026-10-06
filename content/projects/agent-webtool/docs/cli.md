---
id: "docs-agent-webtool-cli"
slug: "cli"
title: "命令行抓取与搜索"
description: "控制输出格式、搜索引擎、超时、站点限制与结果数量。"
date: "2026-10-06"
---

## 抓取网页

以下示例基于已安装的 0.7.0：

```sh
webtool fetch https://example.com
webtool fetch https://example.com --format text
webtool fetch https://example.com --format html
webtool fetch https://example.com --max-bytes 50000 --timeout-ms 10000 --raw
```

默认 Markdown、最多 100,000 字节、30 秒请求超时。超出输出限制时追加 `[truncated]` 标记。交互终端会渲染 Markdown；管道和重定向输出原始文本，`--raw` 可强制关闭渲染。

## 多引擎搜索

```sh
webtool search "Bun runtime" --limit 5
webtool search "TypeScript handbook" --engines baidu,duckduckgo --site typescriptlang.org
webtool search "AI news" --time week --timeout-ms 5000 --raw
```

默认使用 `baidu,wechat,toutiao,duckduckgo`，返回最多 10 项，每个引擎默认超时 3 秒。`--limit` 范围 1–30；时间范围为 `day`、`week`、`month`、`year`，引擎可能忽略不支持的时间条件。

输出包含引用编号、标题、URL 和摘要，部分失败或无结果会附状态说明。验证码、超时、解析失败和不相关的回退结果都可能使某个引擎失败；可以缩小引擎范围后重试。无需 API Key 不等于没有目标站点访问限制。

## 网络与错误

HTTP 地址会升级为 HTTPS。抓取默认仅跟随同源重定向，跨主机跳转返回目标地址，需要明确使用新地址再次抓取。私网、回环与链路本地地址默认拒绝；`WEBTOOL_ALLOW_PRIVATE=1` 仅适合明确需要访问本地服务的开发环境。响应体上限为 10 MiB。

| 退出码 | 含义                                 |
| ------ | ------------------------------------ |
| 0      | 命令完成；搜索是否有结果仍需查看状态 |
| 1      | 一般错误                             |
| 2      | 参数、URL 或地址校验失败             |
| 3      | 网络或抓取错误                       |

通过 `webtool fetch --help`、`webtool search --help` 查看当前安装版本的参数。
