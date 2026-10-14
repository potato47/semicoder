---
id: "docs-fn-plugin-ui-overlays"
slug: "plugin-ui-overlays"
title: "UI 浮层与反馈"
description: "对话框、菜单、提示、通知、标签页、折叠区和反馈组件。"
date: "2026-10-14"
---

> 本地开发、尚未发布。本页对应 fn 更名后的源码；新 SDK、应用和官方市场尚未公开，请按[本地构建说明](/fn/docs/installation)使用。

本页适用于 **fn 0.4.3 / SDK 0.3.2**，沿用 [UI 公共约定](/fn/docs/plugin-ui#公共约定)。下面组件统一从 `@semicoder/fn-sdk/ui` 导入；由宿主 UIProvider 提供 Portal、主题和页面可见性。

## 浮层组合与焦点

Dialog、AlertDialog、Popover、Menu、ContextMenu、Tooltip 均接受 `open?: boolean`、`defaultOpen?: boolean`（SDK 默认 false）和 `onOpenChange?: (open: boolean) => void`。受控模式应在回调更新 open。Trigger 用 `render={<Button />}` 组合，不要嵌套两个 button；自定义触发组件需透传 props 和 ref。

Content 已包含 Portal 与必要的背景或定位器，无需另加 Portal。页面切走会关闭公共浮层并释放键盘监听，不向隐藏触发器恢复焦点。非 Tooltip 的相应 Popup 可以通过 finalFocus 配置返回焦点，但 SDK 会阻止聚焦隐藏页面。

| Content                                           | 定位参数                                                                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------- |
| PopoverContent / MenuContent / ContextMenuContent | side 默认 bottom、align 默认 start、sideOffset 默认 6、collisionPadding 默认 12 |
| TooltipContent                                    | 同上，但 side 默认 right                                                        |
| DialogContent / AlertDialogContent                | 居中对话框，不提供上述锚点定位参数                                              |
| SelectContent / ComboboxContent                   | 使用内部固定定位，不开放这些参数，见基础 UI 页                                  |

side/align 等类型由对应定位器约束；常用 side 为 top/bottom/left/right，align 为 start/center/end。className 为字符串。

## Dialog 与 AlertDialog

| 导出                                       | 用途与主要属性                                                         |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| Dialog / AlertDialog                       | 根状态与 children；Dialog 适合编辑，AlertDialog 适合需要明确确认的操作 |
| DialogTrigger / AlertDialogTrigger         | render、disabled；打开对话框                                           |
| DialogContent / AlertDialogContent         | Popup 属性、children、className、initialFocus/finalFocus；包含遮罩     |
| DialogTitle / AlertDialogTitle             | 对话框标题，自动关联可访问名称                                         |
| DialogDescription / AlertDialogDescription | 描述内容，自动关联可访问说明                                           |
| DialogClose / AlertDialogClose             | render、disabled；关闭按钮                                             |
| DialogFooter / AlertDialogFooter           | div 属性；操作区布局                                                   |

```tsx
import {
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Field,
  Input,
} from "@semicoder/fn-sdk/ui";

export function DialogExample() {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>编辑名称</DialogTrigger>
      <DialogContent>
        <DialogTitle>编辑名称</DialogTitle>
        <DialogDescription>输入新的笔记名称。</DialogDescription>
        <Field label="名称">
          <Input defaultValue="第一条笔记" />
        </Field>
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>关闭</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

确认操作建议受控打开：只有异步操作成功才关闭，失败继续展示错误。下例由调用方传入真正的删除动作，不预先关闭窗口。

```tsx
import { useState } from "react";
import {
  Alert,
  Button,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogClose,
} from "@semicoder/fn-sdk/ui";

export function ConfirmExample({ remove }: { remove: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function confirm() {
    setBusy(true);
    setError("");
    try {
      await remove();
      setOpen(false);
    } catch (reason) {
      setError(String(reason));
    } finally {
      setBusy(false);
    }
  }
  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (!busy) setOpen(value);
      }}
    >
      <AlertDialogTrigger render={<Button variant="danger" />}>删除</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>删除这条记录？</AlertDialogTitle>
        <AlertDialogDescription>此操作无法撤销。</AlertDialogDescription>
        {error && <Alert>{error}</Alert>}
        <AlertDialogFooter>
          <AlertDialogClose disabled={busy} render={<Button variant="secondary" />}>
            取消
          </AlertDialogClose>
          <Button variant="danger" loading={busy} onClick={() => void confirm()}>
            确认删除
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

## Popover 与 Tooltip

Popover 配套 `PopoverTrigger`、`PopoverContent`、`PopoverTitle`、`PopoverDescription`、`PopoverClose`。标题和描述接受 children；Trigger/Close 支持 render。适合轻量交互内容。

Tooltip 配套 `TooltipTrigger`、`TooltipContent`，由宿主 Provider 设置 400ms 延迟。只提供辅助提示，不能替代按钮 label；可交互内容使用 Popover。

```tsx
import {
  Button,
  IconButton,
  Settings,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@semicoder/fn-sdk/ui";

export function HintsExample() {
  return (
    <div className="p:flex p:gap-4">
      <Popover>
        <PopoverTrigger render={<Button variant="secondary" />}>说明</PopoverTrigger>
        <PopoverContent side="bottom" align="start">
          <PopoverTitle>保存位置</PopoverTitle>
          <PopoverDescription>内容保存在宿主本地 KV。</PopoverDescription>
          <PopoverClose render={<Button size="sm" />}>知道了</PopoverClose>
        </PopoverContent>
      </Popover>
      <Tooltip>
        <TooltipTrigger render={<IconButton label="设置" variant="ghost" />}>
          <Settings size={16} aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>打开设置</TooltipContent>
      </Tooltip>
    </div>
  );
}
```

## Menu 与 ContextMenu

| 导出                                                  | 用途与主要属性                                                     |
| ----------------------------------------------------- | ------------------------------------------------------------------ |
| Menu / MenuTrigger / MenuContent                      | 按钮打开菜单；Trigger 支持 render，Content 支持定位参数            |
| ContextMenu / ContextMenuTrigger / ContextMenuContent | 右键打开；Trigger 包裹目标内容，其菜单内容复用 MenuItem 等         |
| MenuItem                                              | children、disabled、onClick；选择后默认关闭菜单                    |
| MenuGroup / MenuGroupLabel                            | 分组与标签                                                         |
| MenuSeparator                                         | 分隔线                                                             |
| MenuCheckboxItem                                      | checked/defaultChecked、onCheckedChange、disabled；内置勾选指示器  |
| MenuRadioGroup / MenuRadioItem                        | 组提供 value/defaultValue、onValueChange；选项提供 value、disabled |
| MenuSubmenu / MenuSubmenuTrigger                      | 嵌套子菜单；Trigger 自带右箭头，子内容继续用 MenuContent           |

```tsx
import { useState } from "react";
import {
  Button,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuGroup,
  MenuGroupLabel,
  MenuSeparator,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSubmenu,
  MenuSubmenuTrigger,
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
} from "@semicoder/fn-sdk/ui";

export function MenusExample() {
  const [wrap, setWrap] = useState(true);
  const [order, setOrder] = useState("new");
  return (
    <div className="p:space-y-4">
      <Menu>
        <MenuTrigger render={<Button variant="secondary" />}>选项</MenuTrigger>
        <MenuContent>
          <MenuGroup>
            <MenuGroupLabel>显示</MenuGroupLabel>
            <MenuCheckboxItem checked={wrap} onCheckedChange={setWrap}>
              自动换行
            </MenuCheckboxItem>
          </MenuGroup>
          <MenuSeparator />
          <MenuSubmenu>
            <MenuSubmenuTrigger>排序</MenuSubmenuTrigger>
            <MenuContent side="right">
              <MenuRadioGroup value={order} onValueChange={setOrder}>
                <MenuRadioItem value="new">最新优先</MenuRadioItem>
                <MenuRadioItem value="old">最早优先</MenuRadioItem>
              </MenuRadioGroup>
            </MenuContent>
          </MenuSubmenu>
        </MenuContent>
      </Menu>
      <ContextMenu>
        <ContextMenuTrigger>
          <p>在这里点击右键</p>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <MenuItem onClick={() => setWrap(!wrap)}>切换换行</MenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
```

菜单选项内不要嵌套额外按钮或输入；需要表单时使用 Popover 或 Dialog。

## Tabs、Accordion 与 ScrollArea

| 导出                                | 主要属性                                                                    |
| ----------------------------------- | --------------------------------------------------------------------------- |
| Tabs                                | value/defaultValue、onValueChange、orientation                              |
| TabsList                            | children、aria-label；给标签集合命名                                        |
| TabsTrigger / TabsContent           | value 与同一 tab 对应，Trigger 可 disabled                                  |
| Accordion                           | value/defaultValue 为展开项数组；onValueChange、multiple                    |
| AccordionItem                       | value 标识项、disabled                                                      |
| AccordionTrigger / AccordionContent | children；Trigger 已包含 Header 和箭头                                      |
| Separator                           | orientation、decorative；默认水平                                           |
| ScrollArea                          | 根属性、children、className；内置 viewport、双轴 scrollbar、thumb 和 corner |

```tsx
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Separator,
  ScrollArea,
} from "@semicoder/fn-sdk/ui";

export function SectionsExample() {
  return (
    <Tabs defaultValue="content">
      <TabsList aria-label="笔记视图">
        <TabsTrigger value="content">正文</TabsTrigger>
        <TabsTrigger value="help">帮助</TabsTrigger>
      </TabsList>
      <TabsContent value="content">
        <ScrollArea className="p:h-40">
          <p>这里放较长正文。</p>
        </ScrollArea>
      </TabsContent>
      <TabsContent value="help">
        <Separator />
        <Accordion defaultValue={["save"]}>
          <AccordionItem value="save">
            <AccordionTrigger>如何保存？</AccordionTrigger>
            <AccordionContent>点击保存，将内容写入 KV。</AccordionContent>
          </AccordionItem>
        </Accordion>
      </TabsContent>
    </Tabs>
  );
}
```

## 状态、进度与头像

| 组件       | 属性与默认                                                                                |
| ---------- | ----------------------------------------------------------------------------------------- |
| Alert      | div 属性；tone 默认 error；error 时 role=alert，其余 role=status                          |
| Badge      | span 属性；tone 默认 neutral                                                              |
| Loading    | label 默认“加载中”，role=status                                                           |
| EmptyState | 必填 title；可选 description、children，children 可放引导操作                             |
| Skeleton   | div 属性、aria-hidden；用 className 指定占位尺寸                                          |
| Progress   | value/defaultValue、min/max 等 Root 属性；value=null 表示不确定进度，内置 Track/Indicator |
| Avatar     | 必填 alt、fallback: ReactNode；可选 src 及 Root 属性                                      |
| Kbd        | kbd 原生属性，用于显示快捷键                                                              |

```tsx
import {
  Alert,
  Badge,
  Loading,
  EmptyState,
  Skeleton,
  Progress,
  Avatar,
  Kbd,
} from "@semicoder/fn-sdk/ui";

export function FeedbackExample() {
  return (
    <div className="p:space-y-4">
      <Alert tone="success">保存完成</Alert>
      <Badge tone="warning">尚未同步</Badge>
      <Loading label="正在读取历史" />
      <Skeleton className="p:h-10 p:w-full" />
      <Progress value={40} min={0} max={100} aria-label="导入进度" />
      <Avatar alt="笔记作者" fallback="记" />
      <EmptyState title="暂无笔记" description="创建第一条记录后会显示在这里。" />
      <p>
        快捷键说明：<Kbd>⌘ S</Kbd>
      </p>
    </div>
  );
}
```

Kbd 只负责展示，不注册快捷键；进度与状态由业务更新。Skeleton 不能代替读屏可感知的加载说明，可搭配 Loading。

## useToast 与 Toast

`useToast()` 返回宿主 Provider 中的通知管理器，主要成员为 `toasts`、`add(options)`、`update(id, options)`、`close(id)` 和 `promise(promise, options)`。add 返回通知 ID；常用 options 包括 title、description、timeout（毫秒，0 表示不自动关闭）。当前默认 timeout 为 5000ms，建议对业务通知显式设置。

```tsx
import { Button, useToast } from "@semicoder/fn-sdk/ui";

export function ToastExample() {
  const toast = useToast();
  return (
    <Button
      onClick={() => {
        toast.add({ title: "操作完成", description: "这是一条示例通知。", timeout: 3000 });
      }}
    >
      显示通知
    </Button>
  );
}
```

需要跟踪异步任务时，保存 add 返回的 ID，成功用 update 更新标题、描述和时长，主动关闭用 close(id)。promise 接受 Promise，以及 loading/success/error 通知选项；具体泛型可通过 `ReturnType<typeof useToast>` 获取。重要错误同时保留在页面上，避免通知消失后无法定位。

公开 `Toast` 是已加样式的底层 Root，需传通知对象 `toast`，用于定制展示；SDK 没有导出完整 Toast 子组件集合，普通插件使用 useToast，由 UIProvider 渲染现成通知区。切页隐藏时宿主会关闭该页面的通知。不要额外创建 Provider 或重复绘制同一通知。

来源：浮层：`packages/sdk/src/ui/overlays.tsx`（本地源码）、布局：`packages/sdk/src/ui/layout.tsx`（本地源码）、Provider：`packages/sdk/src/ui/provider.tsx`（本地源码）。
