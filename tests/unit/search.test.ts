import { expect, test } from "bun:test";
import { searchLiteral } from "../../src/lib/search";

test("缺少中文词典的浏览器仍能搜索连续词并筛选类型", () => {
  const records = [
    {
      url: "/blog/a",
      kind: "blog",
      title: "学习编程",
      description: "从小项目开始",
      text: "使用 Cloudflare",
    },
    {
      url: "/docs/a",
      kind: "docs",
      title: "编程文档",
      description: "部署",
      text: "Cloudflare Workers",
    },
  ];
  expect(searchLiteral(records, "编程", "all")).toHaveLength(2);
  expect(searchLiteral(records, "编程 cloudflare", "docs").map((x) => x.url)).toEqual(["/docs/a"]);
  expect(searchLiteral(records, "不存在", "all")).toHaveLength(0);
  expect(searchLiteral(records, " ", "all")).toHaveLength(0);
});
