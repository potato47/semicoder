import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadCatalog } from "../../scripts/content";
import { findDoc, findProject, projectDocuments } from "../../src/lib/content";

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});
async function write(root: string, path: string, text: string) {
  const target = join(root, path);
  await mkdir(join(target, ".."), { recursive: true });
  await writeFile(target, text);
}
function markdown(fields: Record<string, unknown>, body = "## 公开章节\n\n测试正文。") {
  const data = {
    title: "测试内容",
    description: "用于验证内容结构",
    date: "2026-10-04",
    ...fields,
  };
  return `---\n${Object.entries(data)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n")}\n---\n\n${body}\n`;
}
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "semicoder-catalog-"));
  roots.push(root);
  await write(
    root,
    "content/projects/alpha/index.mdx",
    markdown({ id: "project-alpha", slug: "alpha", stack: ["React"] }),
  );
  await write(
    root,
    "content/projects/alpha/docs/start.md",
    markdown({ id: "doc-start", slug: "start" }),
  );
  await write(
    root,
    "content/projects/alpha/docs/guides/write.md",
    markdown({ id: "doc-write", slug: "guides/write" }),
  );
  await write(
    root,
    "content/projects/alpha/nav.json",
    JSON.stringify({ groups: [{ title: "指南", items: ["doc-write", "doc-start"] }] }),
  );
  return root;
}
describe("项目内容目录", () => {
  test("多级路径及章节顺序来自配置，目录名不决定 URL", async () => {
    const root = await fixture();
    const { catalog } = await loadCatalog(false, root);
    expect(projectDocuments(catalog, "project-alpha").map((doc) => doc.id)).toEqual([
      "doc-write",
      "doc-start",
    ]);
    expect(findDoc(catalog, "project-alpha", "guides/write")?.path).toBe(
      "/alpha/docs/guides/write",
    );
    expect(catalog.publicPaths.filter((path) => path === "/alpha")).toHaveLength(1);
    expect(catalog.publicPaths).not.toContain("/alpha/docs");
    await write(
      root,
      "content/projects/alpha/index.mdx",
      markdown({ id: "project-alpha", slug: "renamed" }),
    );
    const renamed = (await loadCatalog(false, root)).catalog;
    expect(findProject(renamed, "alpha")).toBeUndefined();
    expect(findProject(renamed, "renamed")?.id).toBe("project-alpha");
    expect(findDoc(renamed, "project-alpha", "guides/write")?.path).toBe(
      "/renamed/docs/guides/write",
    );
    expect(findDoc(renamed, "project-alpha", "guides/write")?.id).toBe("doc-write");
  });
  test("多项目允许同名章节，但不能跨项目引用导航", async () => {
    const root = await fixture();
    await write(
      root,
      "content/projects/beta/index.mdx",
      markdown({ id: "project-beta", slug: "beta" }),
    );
    await write(
      root,
      "content/projects/beta/docs/start.md",
      markdown({ id: "doc-beta-start", slug: "start" }),
    );
    await write(
      root,
      "content/projects/beta/nav.json",
      JSON.stringify({ groups: [{ title: "入门", items: ["doc-beta-start"] }] }),
    );
    const { catalog } = await loadCatalog(false, root);
    expect(findDoc(catalog, "project-beta", "start")?.id).toBe("doc-beta-start");
    expect(findDoc(catalog, "project-beta", "guides/write")).toBeUndefined();
    await write(
      root,
      "content/projects/beta/nav.json",
      JSON.stringify({ groups: [{ title: "错误", items: ["doc-start"] }] }),
    );
    await expect(loadCatalog(false, root)).rejects.toThrow("无效导航引用");
  });
  test("嵌套草稿、草稿项目及空分组从全部公开清单中隔离", async () => {
    const root = await fixture();
    await write(
      root,
      "content/projects/alpha/docs/private/deep.md",
      markdown({ id: "draft-deep", slug: "private/deep", draft: true }, "私有草稿标记"),
    );
    await write(
      root,
      "content/projects/alpha/nav.json",
      JSON.stringify({
        groups: [
          { title: "入门", items: ["doc-start", "doc-write"] },
          { title: "私有分组", items: ["draft-deep"] },
        ],
      }),
    );
    const published = await loadCatalog(false, root);
    expect(JSON.stringify(published)).not.toContain("draft-deep");
    expect(JSON.stringify(published)).not.toContain("私有分组");
    expect(
      (await loadCatalog(true, root)).catalog.entries.some((doc) => doc.id === "draft-deep"),
    ).toBe(true);
    await write(
      root,
      "content/projects/alpha/index.mdx",
      markdown({ id: "project-alpha", slug: "alpha", draft: true }),
    );
    const hidden = await loadCatalog(false, root);
    expect(hidden.catalog.projects).toHaveLength(0);
    expect(hidden.catalog.entries).toHaveLength(0);
    expect(hidden.catalog.navigation).toEqual({});
  });
  test.each([
    "blog",
    "docs",
    "projects",
    "admin",
    "api",
    "healthz",
    "assets",
    "pagefind",
    "images",
    "future",
  ])("拒绝保留的项目路径 %s", async (slug) => {
    const root = await fixture();
    await write(root, "public/images/icon.svg", "<svg />");
    await write(root, "src/routes/future.tsx", 'createFileRoute("/future")({});');
    await write(root, "content/projects/alpha/index.mdx", markdown({ id: "project-alpha", slug }));
    await expect(loadCatalog(false, root)).rejects.toThrow("保留名称");
  });
  test.each([
    ["缺失引用", ["not-found"], "无效导航引用"],
    ["重复引用", ["doc-start", "doc-start"], "导航重复引用"],
    ["遗漏章节", ["doc-start"], "公开文档未配置导航"],
  ] as const)("校验导航：%s", async (_, items, error) => {
    const root = await fixture();
    await write(
      root,
      "content/projects/alpha/nav.json",
      JSON.stringify({ groups: [{ title: "入门", items }] }),
    );
    await expect(loadCatalog(false, root)).rejects.toThrow(error);
  });
  test("拒绝重复 ID、路径、旧 project 字段和失效链接", async () => {
    const root = await fixture();
    for (const fields of [
      { id: "doc-start", slug: "different" },
      { id: "unique-id", slug: "start" },
    ]) {
      await write(root, "content/projects/alpha/docs/guides/write.md", markdown(fields));
      await expect(loadCatalog(false, root)).rejects.toThrow("ID 或路径重复");
    }
    await write(
      root,
      "content/projects/alpha/docs/guides/write.md",
      markdown({ id: "doc-write", slug: "guides/write", project: "beta" }),
    );
    await expect(loadCatalog(false, root)).rejects.toThrow("project");
    await write(
      root,
      "content/projects/alpha/docs/guides/write.md",
      markdown({ id: "doc-write", slug: "guides/write" }, "[旧地址](/docs/alpha/start)"),
    );
    await expect(loadCatalog(false, root)).rejects.toThrow("无效站内链接");
  });
  test("无章节的项目仍有 Home，不生成旧概览地址", async () => {
    const root = await fixture();
    await rm(join(root, "content/projects/alpha/docs"), { recursive: true });
    await rm(join(root, "content/projects/alpha/nav.json"));
    const { catalog } = await loadCatalog(false, root);
    expect(projectDocuments(catalog, "project-alpha")).toEqual([]);
    expect(catalog.publicPaths).not.toContain("/alpha/docs");
    expect(catalog.publicPaths).toContain("/alpha");
  });
  test("项目 Home 关闭评论，保留身份和项目搜索类型；博客评论仍可配置", async () => {
    const root = await fixture();
    await write(
      root,
      "content/projects/alpha/index.mdx",
      markdown({ id: "project-alpha", slug: "alpha", comments: true }),
    );
    await write(root, "content/blog/default.md", markdown({ id: "blog-default", slug: "default" }));
    await write(
      root,
      "content/blog/closed.md",
      markdown({ id: "blog-closed", slug: "closed", comments: false }),
    );
    const { catalog } = await loadCatalog(false, root);
    const home = findProject(catalog, "alpha");
    expect(home?.id).toBe("project-alpha");
    expect(home?.kind).toBe("projects");
    expect(home?.comments).toBe(false);
    expect(catalog.entries.find((entry) => entry.id === "blog-default")?.comments).toBe(true);
    expect(catalog.entries.find((entry) => entry.id === "blog-closed")?.comments).toBe(false);
  });
  test("删除概览后拒绝正文继续引用旧概览地址", async () => {
    const root = await fixture();
    await write(
      root,
      "content/projects/alpha/index.mdx",
      markdown({ id: "project-alpha", slug: "alpha" }, "[旧概览](/alpha/docs)"),
    );
    await expect(loadCatalog(false, root)).rejects.toThrow("无效站内链接");
  });
  test("安装入口跟随文档稳定 ID，并拒绝缺失、跨项目和未发布文档", async () => {
    const root = await fixture();
    const project = { id: "project-alpha", slug: "alpha", category: "框架", featured: true };
    await write(
      root,
      "content/projects/alpha/index.mdx",
      markdown({ ...project, start: { label: "安装", doc: "doc-start" } }),
    );
    const initial = (await loadCatalog(false, root)).catalog;
    expect(initial.projects[0].start?.doc).toBe("doc-start");
    await write(
      root,
      "content/projects/alpha/docs/start.md",
      markdown({ id: "doc-start", slug: "install" }),
    );
    expect(
      projectDocuments((await loadCatalog(false, root)).catalog, "project-alpha").find(
        (doc) => doc.id === "doc-start",
      )?.path,
    ).toBe("/alpha/docs/install");
    await write(
      root,
      "content/projects/beta/index.mdx",
      markdown({ id: "project-beta", slug: "beta" }),
    );
    await write(
      root,
      "content/projects/beta/docs/start.md",
      markdown({ id: "doc-beta-start", slug: "start" }),
    );
    await write(
      root,
      "content/projects/beta/nav.json",
      JSON.stringify({ groups: [{ title: "入门", items: ["doc-beta-start"] }] }),
    );
    for (const doc of ["missing", "doc-beta-start"]) {
      await write(
        root,
        "content/projects/alpha/index.mdx",
        markdown({ ...project, start: { label: "安装", doc } }),
      );
      await expect(loadCatalog(false, root)).rejects.toThrow("开始入口必须引用本项目可见的文档");
    }
    await write(
      root,
      "content/projects/alpha/index.mdx",
      markdown({ ...project, start: { label: "安装", doc: "doc-start" } }),
    );
    await write(
      root,
      "content/projects/alpha/docs/start.md",
      markdown({ id: "doc-start", slug: "install", draft: true }),
    );
    await expect(loadCatalog(false, root)).rejects.toThrow("开始入口必须引用本项目可见的文档");
    expect((await loadCatalog(true, root)).catalog.projects[0].start?.doc).toBe("doc-start");
  });
});

test("生产生成命令拒绝草稿预览", async () => {
  const child = Bun.spawn(["bun", "scripts/content.ts", "--production"], {
    env: { ...process.env, CONTENT_PREVIEW: "true" },
    stdout: "pipe",
    stderr: "pipe",
  });
  expect(await child.exited).not.toBe(0);
  expect(await new Response(child.stderr).text()).toContain("部署不能启用草稿预览");
});
