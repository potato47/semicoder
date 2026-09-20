import { readFile, readdir } from "node:fs/promises";
import { resolve, join, sep } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import matter from "gray-matter";
import type { ContentEntry } from "../src/lib/site.ts";

const root = resolve("dist/client");
const entries: ContentEntry[] = JSON.parse(await readFile("src/generated/manifest.json", "utf8"));
const privateMarkers: string[] = [];
for (const kind of ["blog", "projects", "docs"]) {
  for (const filename of await readdir(`content/${kind}`)) {
    if (!/\.mdx?$/.test(filename)) continue;
    const { data, content } = matter(await readFile(`content/${kind}/${filename}`, "utf8"));
    if (data.draft)
      privateMarkers.push(data.id, ...content.split("\n").filter((x) => x.length > 30));
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
    options?: { filters: { type: string } },
  ): Promise<{
    results: { data(): Promise<{ url: string }> }[];
  }>;
  destroy(): Promise<void>;
}
const index: SearchIndex = await import(pathToFileURL(join(searchRoot, "pagefind.js")).href);
try {
  await index.options({ baseUrl: "/" });
  for (const entry of entries) {
    const found = await index.search(entry.title, { filters: { type: entry.kind } });
    const hits = await Promise.all(found.results.map((result) => result.data()));
    if (!hits.some((hit) => hit.url.replace(/\/$/, "") === entry.path))
      throw new Error(`中文搜索或类型筛选不可用：${entry.path}`);
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
console.log(`✓ 构建草稿隔离、${entries.length} 篇内容的中文搜索和类型筛选通过`);
