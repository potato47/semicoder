import { readFile, readdir } from "node:fs/promises";
import { resolve, join, sep, dirname } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import matter from "gray-matter";
import { markdownFiles } from "./content-files.ts";
import { searchLiteral } from "../src/lib/search.ts";
import type { SearchRecord } from "../src/lib/search.ts";
import type { ContentCatalog, ContentEntry } from "../src/lib/site.ts";
import { projectDocuments } from "../src/lib/content.ts";

const root = resolve("dist/client");
const entries: ContentEntry[] = JSON.parse(await readFile("src/generated/manifest.json", "utf8"));
const privateMarkers: string[] = [];
const catalog: ContentCatalog = JSON.parse(await readFile("src/generated/catalog.json", "utf8"));
const sources = await Promise.all(
  (await markdownFiles("content")).map(async (file) => ({
    file,
    ...matter(await readFile(file, "utf8")),
  })),
);
const draftProjects = sources
  .filter((source) => source.file.endsWith("/index.mdx") && source.data.draft)
  .map((source) => dirname(source.file) + sep);
for (const source of sources) {
  if (source.data.draft || draftProjects.some((directory) => source.file.startsWith(directory)))
    privateMarkers.push(
      source.data.id,
      ...source.content.split("\n").filter((line) => line.length > 30),
    );
}
const sitemap = await readFile(join(root, "sitemap.xml"), "utf8");
for (const path of catalog.publicPaths) {
  const html = await readFile(join(root, path, "index.html"), "utf8");
  if (!html.includes("新手程序员")) throw new Error(`预渲染缺少正文 ${path}`);
  if (!sitemap.includes(`<loc>https://semicoder.dev${path}</loc>`))
    throw new Error(`sitemap 缺少页面 ${path}`);
  if (!html.includes(`rel="canonical" href="https://semicoder.dev${path}"`))
    throw new Error(`canonical 不匹配 ${path}`);
}
const home = await readFile(join(root, "index.html"), "utf8");
if (!home.includes("此时此刻") || !home.includes("等待本地时间") || !home.includes("<noscript>"))
  throw new Error("首页缺少静态时间占位或无脚本说明");
if (/<time[^>]*dateTime=|<time[^>]*datetime=|role="progressbar"|<progress[^>]*value=/.test(home))
  throw new Error("首页将动态时间或进度固化到预渲染 HTML");
for (const entry of entries) {
  const html = await readFile(join(root, entry.path, "index.html"), "utf8");
  if (!html.includes(entry.title) || !html.includes("data-pagefind-body"))
    throw new Error(`预渲染缺少内容 ${entry.path}`);
  for (const heading of entry.toc)
    if (!html.includes(`id="${heading.id}"`))
      throw new Error(`目录锚点无效 ${entry.path}#${heading.id}`);
}
const sitemapPaths = [...sitemap.matchAll(/<loc>https:\/\/semicoder\.dev([^<]*)<\/loc>/g)].map(
  (match) => match[1],
);
if (JSON.stringify([...sitemapPaths].sort()) !== JSON.stringify([...catalog.publicPaths].sort()))
  throw new Error("sitemap 包含过期路径");
function navMarkup(html: string, label: string) {
  return (
    html.match(new RegExp(`<nav\\b[^>]*aria-label="${label}"[^>]*>([\\s\\S]*?)</nav>`))?.[1] ?? ""
  );
}
for (const project of catalog.projects) {
  if (catalog.publicPaths.includes(`${project.path}/docs`) || project.comments)
    throw new Error(`项目 Home 元信息错误 ${project.path}`);
  const html = await readFile(join(root, project.path, "index.html"), "utf8");
  const chapters = navMarkup(html, "文档章节");
  const homeLink = chapters.match(/<a\b[^>]*>Home<\/a>/)?.[0];
  if (!homeLink?.includes(`href="${project.path}"`) || !homeLink.includes('aria-current="page"'))
    throw new Error(`Home 未进入章节导航或未高亮 ${project.path}`);
  if (html.includes('aria-label="评论"')) throw new Error(`项目仍显示评论 ${project.path}`);
  const documents = projectDocuments(catalog, project.id);
  const pagination = navMarkup(html, "相邻章节");
  if (documents[0] && !pagination.includes(`href="${documents[0].path}"`))
    throw new Error(`Home 未连接首篇章节 ${project.path}`);
  for (const entry of [project, ...documents]) {
    const page = await readFile(join(root, entry.path, "index.html"), "utf8");
    if (!navMarkup(page, "文档章节") || (entry.toc.length && !navMarkup(page, "本页目录")))
      throw new Error(`缺少共享章节或本页目录 ${entry.path}`);
    if (
      page.includes('id="docs-project"') ||
      page.includes("搜索此项目") ||
      page.includes("项目主页 ↗")
    )
      throw new Error(`旧项目工具栏仍存在 ${entry.path}`);
  }
  if (documents[0]) {
    const first = await readFile(join(root, documents[0].path, "index.html"), "utf8");
    const previous = navMarkup(first, "相邻章节");
    if (!previous.includes(`href="${project.path}"`) || !previous.includes("Home"))
      throw new Error(`首篇章节未返回 Home ${documents[0].path}`);
  }
}
async function scan(directory: string): Promise<void> {
  for (const file of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, file.name);
    if (file.isDirectory()) await scan(path);
    else if (/\.(html|js|json|xml|txt|map)$/.test(path)) {
      const text = await readFile(path, "utf8");
      if (privateMarkers.some((marker) => text.includes(marker)))
        throw new Error(`公开构建产物泄露草稿：${path}`);
    }
  }
}
await scan(root);
// Pagefind's actual WebAssembly runtime loads its generated assets through fetch.
// This adapter keeps the build check offline and confines reads to the built search directory.
const searchRoot = join(root, "pagefind");
const loadSearchAsset = async (input: RequestInfo | URL) => {
  const url = new URL(
    typeof input === "string" ? input : input instanceof URL ? input.href : input.url,
  );
  const path = fileURLToPath(url);
  if (!path.startsWith(searchRoot + sep)) throw new Error("搜索资源越界");
  return new Response(await readFile(path), {
    headers: {
      "content-type": path.endsWith(".wasm") ? "application/wasm" : "application/octet-stream",
    },
  });
};
Object.defineProperty(globalThis, "fetch", { value: loadSearchAsset, configurable: true });
interface SearchIndex {
  options(options: { baseUrl: string }): Promise<void>;
  search(
    query: string,
    options?: { filters: Record<string, string> },
  ): Promise<{
    results: { data(): Promise<{ url: string }> }[];
  }>;
  destroy(): Promise<void>;
}
const index: SearchIndex = await import(pathToFileURL(join(searchRoot, "pagefind.js")).href);
try {
  await index.options({ baseUrl: "/" });
  const fallback: SearchRecord[] = JSON.parse(
    await readFile(join(searchRoot, "fallback.json"), "utf8"),
  );
  for (const entry of entries) {
    const found = await index.search(entry.title, { filters: { type: entry.kind } });
    const hits = await Promise.all(found.results.map((result) => result.data()));
    if (!hits.some((hit) => hit.url.replace(/\/$/, "") === entry.path))
      throw new Error(`中文搜索或类型筛选不可用：${entry.path}`);
    if (entry.kind === "docs") {
      const scoped = await index.search(entry.title, {
        filters: { type: "docs", projectId: entry.projectId },
      });
      const scopedHits = await Promise.all(scoped.results.map((result) => result.data()));
      const expectedPaths = new Set(
        entries
          .filter((item) => item.kind === "docs" && item.projectId === entry.projectId)
          .map((item) => item.path),
      );
      for (const result of [
        scopedHits,
        searchLiteral(fallback, entry.title, "docs", entry.projectId),
      ]) {
        if (
          !result.some((hit) => hit.url.replace(/\/$/, "") === entry.path) ||
          result.some((hit) => !expectedPaths.has(hit.url.replace(/\/$/, "")))
        )
          throw new Error(`项目搜索范围错误 ${entry.projectId}`);
      }
    }
    if (
      hits.some(
        (hit) =>
          !entries.some(
            (item) => item.path === hit.url.replace(/\/$/, "") && item.kind === entry.kind,
          ),
      )
    )
      throw new Error("搜索结果包含未发布内容或错误类型");
  }
} finally {
  await index.destroy();
}
console.log(
  `✓ ${catalog.publicPaths.length} 个静态页面、Home 导航、目录锚点、草稿隔离与项目搜索通过`,
);
