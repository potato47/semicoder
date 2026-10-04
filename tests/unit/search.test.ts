import { expect, test } from "bun:test";
import { searchLiteral, parseSearch, searchFilters } from "../../src/lib/search";

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

test("同名文档按稳定项目 ID 隔离，清除范围可搜索所有项目", () => {
  const records = ["alpha", "beta"].map((projectId) => ({
    url: `/${projectId}/docs/start`,
    kind: "docs",
    title: "快速开始",
    description: "入门文档",
    text: "配置项目",
    projectId,
  }));
  expect(searchLiteral(records, "快速开始", "docs", "alpha").map((hit) => hit.url)).toEqual([
    "/alpha/docs/start",
  ]);
  expect(searchLiteral(records, "快速开始", "docs")).toHaveLength(2);
  expect(searchLiteral(records, "快速开始", "all", "alpha")).toHaveLength(2);
});

test("搜索查询参数校验与 Pagefind 筛选保持一致", () => {
  expect(parseSearch({ q: "快速 开始", type: "docs", projectId: "alpha" }, ["alpha"])).toEqual({
    q: "快速 开始",
    type: "docs",
    projectId: "alpha",
  });
  expect(parseSearch({ q: ["bad"], type: "unknown", projectId: "alpha" }, ["alpha"])).toEqual({
    q: undefined,
    type: undefined,
    projectId: undefined,
  });
  expect(parseSearch({ type: "blog", projectId: "alpha" }, ["alpha"]).projectId).toBeUndefined();
  expect(parseSearch({ type: "docs", projectId: "missing" }, ["alpha"]).projectId).toBeUndefined();
  expect(searchFilters("docs", "alpha")).toEqual({ type: "docs", projectId: "alpha" });
  expect(searchFilters("all", "alpha")).toEqual({});
});
