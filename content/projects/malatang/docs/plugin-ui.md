---
id: "docs-malatang-plugin-ui"
slug: "plugin-ui"
title: "UI 基础与表单"
description: "SDK 公共组件、布局、输入、选择控件、模型选择及图标参考。"
date: "2026-10-11"
---

本页适用于 **麻辣烫 0.4.3 / SDK 0.3.2**。所有示例组件从 `@semicoder/malatang-sdk/ui` 导入，在 CLI 创建的插件页面中使用。宿主共享 React、ReactDOM 与公共 UI，不直接导入 Base UI、Radix、Lucide 或宿主源码。

## 公共约定

- `Size` 为 `"sm" | "md" | "lg"`，对应 28 / 36 / 40px 控件高度；仅声明 size 的组件接受它。
- `Tone` 为 `"neutral" | "success" | "warning" | "error"`，用于 Badge、Alert。
- 封装控件的 className 接受字符串；推荐完整静态 `p:` 类或 CSS Module。不要传 Base UI 风格的 className 函数。
- 原生输入用 onChange(event)，选择组件用 onValueChange(value, details)，复选框与开关用 onCheckedChange(checked, details)。事件的首个参数是新值，不是 DOM event。
- 受控模式同时传 value/checked/open 和对应回调；非受控模式用 defaultValue/defaultChecked/defaultOpen。浮层根的 onOpenChange 在 SDK 中简化为 `(open: boolean) => void`。
- 表格列出 SDK 属性及主要透传属性；其余原生或底层属性以当前 SDK 的 `React.ComponentProps<typeof 组件>` 为准，不向组件猜测添加属性。

## 页面与面板

| 组件                                     | 属性与用途                                                                         |
| ---------------------------------------- | ---------------------------------------------------------------------------------- |
| Page                                     | div 属性、children、className；默认内容最大宽 1120px                               |
| PageHeader                               | 必填 title: string；可选 description: string、actions: ReactNode                   |
| Panel                                    | section 的 HTML 属性；容纳一个业务区域                                             |
| PanelHeader / PanelContent / PanelFooter | div 属性；分别组织标题、内容与操作                                                 |
| SettingsGroup                            | 必填 title: string；可选 description；其余 section 属性                            |
| SettingsRow                              | 必填 label: ReactNode；可选 description: ReactNode；children 放控件，透传 div 属性 |
| InputGroup                               | div 属性；组合输入及装饰元素，不自动提供标签                                       |

```tsx
import {
  Page,
  PageHeader,
  Panel,
  PanelHeader,
  PanelContent,
  PanelFooter,
  Button,
  SettingsGroup,
  SettingsRow,
  Switch,
} from "@semicoder/malatang-sdk/ui";

export function LayoutExample() {
  return (
    <Page>
      <PageHeader title="偏好" description="配置当前插件。" actions={<Button>保存</Button>} />
      <Panel>
        <PanelHeader>阅读设置</PanelHeader>
        <PanelContent>
          <SettingsGroup title="显示" description="只影响本插件。">
            <SettingsRow label="紧凑模式" description="减少条目间距。">
              <Switch aria-label="紧凑模式" defaultChecked />
            </SettingsRow>
          </SettingsGroup>
        </PanelContent>
        <PanelFooter>
          <Button variant="secondary">恢复默认</Button>
        </PanelFooter>
      </Panel>
    </Page>
  );
}
```

SettingsRow 的可见 label 不会像 Field 那样自动关联控件，需提供 aria-label 或显式关联。布局示例中的按钮仅展示外观，业务保存由插件实现。

## 按钮、输入与 Field

| 组件        | 属性、默认值与事件                                                                                                          |
| ----------- | --------------------------------------------------------------------------------------------------------------------------- |
| Button      | 原生 button 属性；variant 默认 primary，可选 secondary/ghost/danger；size 默认 md；loading 显示进度并禁用；type 默认 button |
| IconButton  | Button 全部属性；必填 label: string 转为 aria-label                                                                         |
| Input       | 原生 input 属性，size 改为 Size，默认 md；onChange 使用原生事件                                                             |
| Textarea    | 原生 textarea 属性，例如 rows、maxLength、value、onChange；没有 SDK size 属性                                               |
| SearchInput | Input 属性；默认 type=search，并附搜索图标                                                                                  |
| Field       | 必填 label: string、children；可选 id、hint: ReactNode、error: string；error 优先于 hint 显示                               |

Field 内放一个逻辑控件，自动关联标签、说明和错误状态。Select 关联 Trigger，Combobox 关联 Input/Trigger；复合选择器不要复制同一 Field ID 到多个可编辑控件。

```tsx
import { useState } from "react";
import {
  Button,
  IconButton,
  Copy,
  Field,
  Input,
  InputGroup,
  SearchInput,
  Textarea,
} from "@semicoder/malatang-sdk/ui";

export function InputsExample() {
  const [name, setName] = useState("");
  return (
    <div className="p:space-y-4">
      <Field label="名称" hint="最多 60 字符" error={name.length > 60 ? "名称过长" : undefined}>
        <Input value={name} onChange={(event) => setName(event.target.value)} />
      </Field>
      <Field label="搜索">
        <SearchInput placeholder="输入关键词" />
      </Field>
      <Field label="备注">
        <Textarea rows={4} />
      </Field>
      <InputGroup>
        <Input aria-label="分享地址" readOnly value="example" />
        <IconButton
          label="复制地址"
          variant="ghost"
          onClick={() => void navigator.clipboard.writeText("example")}
        >
          <Copy size={16} aria-hidden="true" />
        </IconButton>
      </InputGroup>
      <Button size="sm" variant="secondary">
        取消
      </Button>
    </div>
  );
}
```

需要提交表单时显式设置 `type="submit"`；普通 Button 不会意外提交。IconButton 的 label 必填，Tooltip 不能替代可访问名称。

## 复选框、开关、单选、数值与滑块

| 组件        | 主要属性与事件                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| Checkbox    | checked/defaultChecked、onCheckedChange、indeterminate、disabled；内置勾选指示器                        |
| Switch      | checked/defaultChecked、onCheckedChange、disabled；内置开关滑块                                         |
| RadioGroup  | value/defaultValue、onValueChange、disabled；容纳 Radio                                                 |
| Radio       | value、disabled；每个选项用 aria-label 或自己的 label 命名                                              |
| NumberField | value/defaultValue、onValueChange、min/max/step、disabled；内置输入及加减按钮；值可为 null              |
| Slider      | value/defaultValue、onValueChange、min/max/step、disabled；number 或 number[]；内置轨道与对应数量的拖柄 |

SDK 未另设这些值的默认范围，未传属性使用当前包携带的底层默认值。业务代码建议显式指定初值、范围及步长；以下示例范围为 0–100。

```tsx
import { useState } from "react";
import {
  Checkbox,
  Field,
  NumberField,
  Radio,
  RadioGroup,
  Slider,
  Switch,
} from "@semicoder/malatang-sdk/ui";

export function ControlsExample() {
  const [enabled, setEnabled] = useState(false);
  const [amount, setAmount] = useState<number | null>(20);
  return (
    <div className="p:space-y-4">
      <Field label="开启提醒">
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </Field>
      <Field label="包含摘要">
        <Checkbox defaultChecked />
      </Field>
      <Field label="语言">
        <RadioGroup defaultValue="zh">
          <Radio value="zh" aria-label="中文" />
          <span>中文</span>
          <Radio value="en" aria-label="英文" />
          <span>英文</span>
        </RadioGroup>
      </Field>
      <Field label="数量">
        <NumberField value={amount} onValueChange={setAmount} min={0} max={100} step={1} />
      </Field>
      <Field label="强度">
        <Slider defaultValue={20} min={0} max={100} step={1} />
      </Field>
    </div>
  );
}
```

## Select：固定选项

| 导出                           | 主要属性与用途                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| Select                         | value/defaultValue、onValueChange、items、multiple、disabled，以及 open/defaultOpen/onOpenChange |
| SelectTrigger                  | size 默认 md；disabled、children；省略 children 时显示带“请选择”占位的 SelectValue               |
| SelectValue                    | placeholder；显示选中项标签                                                                      |
| SelectContent                  | Popup 属性、className、children、finalFocus；内部提供 Portal、定位器和列表                       |
| SelectItem                     | 必填 value，children 为标签；可选 disabled；自动显示选中指示器                                   |
| SelectGroup / SelectGroupLabel | 对选项分组及添加组标题                                                                           |

SDK 从直接组合的 SelectItem 收集标签，也可显式传 items。单选清空时可能得到 null；不要把它当成原生 change event。SelectContent 的定位固定 sideOffset=6、collisionPadding=12、alignItemWithTrigger=false，默认与触发器同宽；**没有开放 side/align 等定位参数**。

```tsx
import { useState } from "react";
import {
  Field,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
} from "@semicoder/malatang-sdk/ui";

export function SelectExample() {
  const [language, setLanguage] = useState<string | null>("zh");
  return (
    <Field label="输出语言">
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger>
          <SelectValue placeholder="请选择语言" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectGroupLabel>语言</SelectGroupLabel>
            <SelectItem value="zh">中文</SelectItem>
            <SelectItem value="en">英文</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}
```

## Combobox：可搜索选择

| 导出                               | 主要属性与用途                                                                                                                                              |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Combobox                           | items、value/defaultValue、onValueChange、inputValue/onInputValueChange、multiple、disabled；filteredItems/filter 可用于自定义筛选；open 回调与 Select 相同 |
| ComboboxInput                      | 可编辑搜索输入，继承 Field 关联；固定 md 外观                                                                                                               |
| ComboboxTrigger                    | 打开列表的按钮式触发器，固定 md 外观                                                                                                                        |
| ComboboxValue                      | 在按钮式选择器中展示所选值                                                                                                                                  |
| ComboboxContent                    | Popup 属性、finalFocus；内置 Portal，sideOffset=6、collisionPadding=12，未开放定位参数                                                                      |
| ComboboxList                       | 列表容器，支持按 items 渲染子项函数                                                                                                                         |
| ComboboxItem                       | value、children、disabled；内置选中指示器                                                                                                                   |
| ComboboxEmpty                      | 无结果状态                                                                                                                                                  |
| ComboboxGroup / ComboboxGroupLabel | 选项分组与标题                                                                                                                                              |
| ComboboxCollection                 | 按当前集合渲染子项，用于组合分组列表                                                                                                                        |

```tsx
import { useState } from "react";
import {
  Field,
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxList,
  ComboboxItem,
} from "@semicoder/malatang-sdk/ui";

const languages = ["中文", "English", "日本語"];
export function ComboboxExample() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Field label="搜索语言">
      <Combobox items={languages} value={value} onValueChange={setValue}>
        <ComboboxInput placeholder="输入语言" />
        <ComboboxContent>
          <ComboboxEmpty>没有匹配项</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}
```

## ModelSelect：宿主模型选择

| 属性          | 类型 / 默认                                        |
| ------------- | -------------------------------------------------- |
| models        | 必填 ModelInfo[]，由 client.models.list 读取       |
| value         | 必填 string；空字符串表示未选中                    |
| onValueChange | 必填 `(value: string) => void`                     |
| disabled      | 可选 boolean；无任何 configured 模型时组件也会禁用 |
| aria-label    | 可选 string，默认“选择模型”                        |

组件按服务商分组，支持名称/provider/id 搜索，禁用不可用模型并标记 ChatGPT plan 用量入口。不自行加载目录，也不负责启动模型；不接受 className、size 或原生 onChange。完整用法见[模型生成示例](/malatang/docs/plugin-client-api#模型生成与取消)。

## 图标与 Provider

公开图标清单：Plus、X、Check、ChevronDown、ChevronRight、ArrowRight、Copy、Settings、Search、Sun、Moon、Monitor、Package、Blocks、MoreHorizontal、Trash2、Pencil、Download、ExternalLink、RefreshCw、Square、SlidersHorizontal。

它们接受 SVG 属性及 size、strokeWidth 等图标属性。纯装饰使用 aria-hidden，有交互的图标放进带 label 的 IconButton。不直接安装另一份 Lucide 作为公共 UI 的替代。

`UIProvider` 接受 children（必填）、visible（默认 true）、pluginId（可选）。宿主已经包裹插件页面，提供 Tooltip、Toast、可见性和带插件作用域的 Portal，**普通插件不要再嵌套 Provider**。Provider 的导出用于宿主集成等场景，不会让 createPluginClient 在普通网页中可用。

后续阅读：[浮层与反馈](/malatang/docs/plugin-ui-overlays)、[样式与主题](/malatang/docs/plugin-styling)。来源：[UI 导出](https://github.com/semicoder-dev/malatang/blob/sdk-v0.3.2/packages/sdk/src/ui.tsx)、[组件实现](https://github.com/semicoder-dev/malatang/tree/sdk-v0.3.2/packages/sdk/src/ui)。
