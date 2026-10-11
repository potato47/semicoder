---
id: "docs-malatang-plugin-styling"
slug: "plugin-styling"
title: "样式与主题"
description: "使用语义 Tailwind 类、CSS Modules 与宿主主题，处理资源和样式校验。"
date: "2026-10-11"
---

本页适用于 **麻辣烫 0.4.3 / SDK 0.3.2**。宿主统一提供主题、公共组件 CSS 与 reset；插件只维护自己的业务布局和样式。

## 样式入口与静态类名

生成项目的 `src/styles.css` 只能包含以下导入（允许注释），不要追加规则或导入 Tailwind Preflight：

```css
@import "@semicoder/malatang-sdk/tailwind.css";
```

在 `src/client.tsx` 导入 `./styles.css`。CLI 只扫描当前插件 src，在构建时编译 `p:` 工具类；宿主使用无前缀类，SDK 内部使用 `ui:`，插件不能依赖后者。

```tsx
export function ThemeCard() {
  return (
    <div className="p:flex p:gap-4 p:rounded-xl p:bg-surface p:p-4 p:text-foreground">
      <span className="p:text-muted">自动继承当前主题</span>
    </div>
  );
}
```

类名必须完整静态出现。不要拼接 `p:bg-${tone}`；条件分支应选择完整字符串，如 `ok ? "p:text-success" : "p:text-error"`。不要用任意颜色类覆盖公共视觉。

## Tailwind 语义映射

| Tailwind 颜色名           | 宿主 token                            | 示例                           |
| ------------------------- | ------------------------------------- | ------------------------------ |
| background                | --m-bg                                | p:bg-background                |
| surface                   | --m-surface                           | p:bg-surface                   |
| hover                     | --m-surface-hover                     | p:hover:bg-hover               |
| popup                     | --m-popup                             | p:bg-popup                     |
| foreground                | --m-text                              | p:text-foreground              |
| muted                     | --m-muted                             | p:text-muted                   |
| border                    | --m-line                              | p:border-border                |
| primary / on-primary      | --m-accent / --m-on-accent            | p:bg-primary p:text-on-primary |
| error / success / warning | --m-error / --m-success / --m-warning | p:text-error                   |
| focus                     | --m-focus                             | p:outline-focus                |
| transparent / current     | transparent / currentColor            | p:bg-transparent               |

`p:font-sans` 引用 `--m-font`。SDK 映射清除了默认颜色命名空间，优先使用表中的语义颜色。具体交互控件优先选 SDK 组件，避免自己重复制作按钮、焦点和禁用样式。

## CSS Modules 与 token

除 styles.css 外，业务 CSS 必须使用 `.module.css`。每个选择器位于本地 class 内：

```css
.note {
  min-height: 180px;
  padding: var(--m-space-4);
  color: var(--m-text);
  background: var(--m-surface);
  border: 1px solid var(--m-line);
  border-radius: var(--m-radius);
}
```

在同目录 TSX 中 `import styles from "./page.module.css"`，通过 `className={styles.note}` 使用。可以读取公共 token，不能重新定义它们。

| token 类别 | 可读变量                                                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 背景与文字 | --m-bg、--m-surface、--m-surface-muted、--m-surface-hover、--m-popup、--m-overlay、--m-heading、--m-text、--m-text-secondary、--m-muted、--m-placeholder |
| 输入与边线 | --m-line、--m-line-soft、--m-input-bg、--m-input-border、--m-focus                                                                                       |
| 强调与按钮 | --m-accent、--m-accent-hover、--m-accent-border、--m-on-accent、--m-button-secondary、--m-button-secondary-hover、--m-selection                          |
| 状态       | --m-success / --m-warning / --m-error，以及各自的 -bg、-line                                                                                             |
| 辅助区域   | --m-sidebar、--m-sidebar-hover、--m-sidebar-active、--m-sidebar-text、--m-sidebar-muted、--m-art-bg、--m-art-text；插件通常不需使用侧栏 token            |
| 字体       | --m-font、--m-font-size（14px）、--m-line-height（1.5）                                                                                                  |
| 间距       | --m-space-1/2/3/4/6/8，分别为 4/8/12/16/24/32px                                                                                                          |
| 控件高度   | --m-control-sm/md/lg，分别为 28/36/40px                                                                                                                  |
| 圆角       | --m-radius-sm、--m-radius（8px）、--m-radius-lg（16px）、--m-radius-dialog（24px）                                                                       |
| 动效与阴影 | --m-motion（120ms）、--m-shadow（颜色）、--m-shadow-popup（完整阴影）                                                                                    |

颜色随浅色、深色和用户自定义配色变化，不把默认十六进制值写死到插件。自定义配色只影响内容区，原生标题栏跟随明暗模式。插件不提供另一个全局主题开关。

## 作用域与 Portal

构建器按插件 ID 隔离选择器、动画名、Tailwind 内部变量和 `@property`。不要在 JS 中引用编译后的内部变量名或动画名。公共浮层 Portal 继承同一插件作用域与主题，通常不需要额外样式入口。

页面隐藏时其样式停用，卸载时移除；keepAlive 保留的页面仍应通过 SDK 浮层处理可见性。CSS 作用域用于避免样式冲突，不是安全隔离。

## 图片与字体资源

CSS Module 中用包内相对 `url(./assets/image.png)`。JS 导入图片后使用模块相对 URL；例如 src/assets 下有 icon.svg 时：

```tsx
import icon from "./assets/icon.svg";

export function PluginIllustration() {
  return <img src={new URL(icon, import.meta.url).href} alt="插件示意图" />;
}
```

构建器支持 SVG、PNG、JPG、WebP、WOFF、WOFF2 等 loader，并输出被引用资源。交付完整 dist，不能只复制 client.js。样式检查要求 CSS URL 指向包内资源，禁止网络 URL、data URL、绝对路径和越界文件；不支持通过 CSS Module 自行声明 @font-face。普通插件使用宿主字体。

## 样式检查与例外

`malatang plugin check` 会检查：全局选择器（如 :root、:global、html/body、ID）、data-theme 覆盖、--m-* 重定义、私有 `.m-*` / `ui:` 类、直接导入 Base UI/Radix/Lucide、导入 SDK theme.css/ui.css、非 Module 样式与缺失资源。

品牌或数据可视化确实需要固定颜色时，在 package.json **顶层**按文件声明理由：

```json
{
  "malatangStyleExceptions": {
    "src/chart.module.css": "数据系列使用固定品牌色，文字与控件继续使用宿主语义 token。"
  }
}
```

例外只允许该样式文件使用固定颜色，不允许全局规则、公共 token 重定义或私有类依赖；文件必须存在且理由非空。没有必要时不声明。

来源：[主题 token](https://github.com/semicoder-dev/malatang/blob/sdk-v0.3.2/packages/sdk/src/theme.css)、[Tailwind 映射](https://github.com/semicoder-dev/malatang/blob/sdk-v0.3.2/packages/sdk/src/tailwind.css)、[样式检查器](https://github.com/semicoder-dev/malatang/blob/sdk-v0.3.2/packages/sdk/src/style-check.ts)。
