import { describe, expect, test } from "bun:test";
import { contentPath, loadContent, xml } from "../../scripts/content";
import { bodySchema } from "../../src/server/comments";
import { assertOrigin } from "../../src/server/security";
describe("内容发布与边界", () => {
  test("公开内容排除草稿，显式预览包含草稿", async () => {
    const published = await loadContent();
    const preview = await loadContent(true);
    expect(published.some((x) => x.entry.id === "draft-not-published")).toBe(false);
    expect(preview.some((x) => x.entry.id === "draft-not-published")).toBe(true);
  });
  test("文档绑定项目，内容 ID 独立于路径", () => {
    const original = { id: "stable-id", slug: "old", project: "portal" };
    const renamed = { ...original, slug: "new" };
    expect(contentPath("docs", renamed)).toBe("/docs/portal/new");
    expect(original.id).toBe(renamed.id);
    expect(contentPath("blog", original)).not.toBe(contentPath("blog", renamed));
  });
  test("RSS 转义不允许破坏 XML", () =>
    expect(xml('<script a="x">&')).toBe("&lt;script a=&quot;x&quot;&gt;&amp;"));
  test("评论内容边界", () => {
    expect(bodySchema.safeParse(" ").success).toBe(false);
    expect(bodySchema.safeParse("x".repeat(3001)).success).toBe(false);
    expect(bodySchema.parse("  好的  ")).toBe("好的");
  });
  test("禁止缺失和跨站 Origin", () => {
    expect(() => assertOrigin(new Headers(), "https://semicoder.dev")).toThrow();
    expect(() =>
      assertOrigin(new Headers({ origin: "https://evil.example" }), "https://semicoder.dev"),
    ).toThrow();
    expect(() =>
      assertOrigin(new Headers({ origin: "https://semicoder.dev" }), "https://semicoder.dev"),
    ).not.toThrow();
  });
});
