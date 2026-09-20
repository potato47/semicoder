import { mkdir, readdir, readFile, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { compile } from "@mdx-js/mdx";
import * as pagefind from "pagefind";
import type { ContentEntry, ContentKind } from "../src/lib/site";
import { site } from "../src/lib/site";

const schema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  date: z.coerce.date().transform((d) => d.toISOString().slice(0, 10)),
  updated: z.coerce
    .date()
    .transform((d) => d.toISOString().slice(0, 10))
    .optional(),
  tags: z.array(z.string()).default([]),
  comments: z.boolean().optional(),
  sample: z.boolean().default(false),
  draft: z.boolean().default(false),
  project: z.string().optional(),
  order: z.number().default(0),
  stack: z.array(z.string()).default([]),
  status: z.enum(["构建中", "已发布", "已归档"]).optional(),
  source: z.url().optional(),
  demo: z.url().optional(),
  aliases: z.array(z.string().regex(/^\/(?!\/)[a-zA-Z0-9/_-]+$/)).default([]),
});
export function contentPath(kind: ContentKind, data: { slug: string; project?: string }) {
  return kind === "docs" ? `/docs/${data.project}/${data.slug}` : `/${kind}/${data.slug}`;
}
export function xml(value: string) {
  return value.replace(
    /[<>&"']/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!,
  );
}
export async function loadContent(preview = false) {
  const all: { entry: ContentEntry; body: string }[] = [];
  const ids = new Set<string>();
  const paths = new Set<string>();
  for (const kind of ["blog", "projects", "docs"] as const) {
    for (const file of (await readdir(`content/${kind}`)).sort()) {
      if (!/\.mdx?$/.test(file)) continue;
      const filename = `content/${kind}/${file}`;
      const { data: raw, content: body } = matter(await readFile(filename, "utf8"));
      const data = schema.parse(raw);
      if (kind === "docs" && !data.project) throw new Error(`${filename}: 文档需要 project`);
      const path = contentPath(kind, data);
      if (ids.has(data.id) || paths.has(path)) throw new Error(`${filename}: ID 或路径重复`);
      ids.add(data.id);
      paths.add(path);
      await compile(body);
      const counts = new Map<string, number>();
      const toc = [...body.replace(/```[\s\S]*?```/g, "").matchAll(/^(#{2,3})\s+(.+)$/gm)].map(
        (m) => {
          const text = m[2].replace(/[*`]/g, "");
          const base = text
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\s-]/gu, "")
            .replace(/\s/g, "-");
          const n = counts.get(base) ?? 0;
          counts.set(base, n + 1);
          return { id: n ? `${base}-${n}` : base, text, depth: m[1].length };
        },
      );
      const entry: ContentEntry = {
        ...data,
        kind,
        path,
        file: filename,
        comments: data.comments ?? kind !== "docs",
        toc,
        readingTime: Math.max(1, Math.ceil(body.length / 450)),
      };
      all.push({ entry, body });
    }
  }
  for (const { entry } of all) {
    if (
      entry.kind === "docs" &&
      !all.some((x) => x.entry.kind === "projects" && x.entry.slug === entry.project)
    )
      throw new Error(`${entry.file}: 项目引用不存在`);
    for (const alias of entry.aliases) {
      if (
        paths.has(alias) ||
        [
          "/",
          "/blog",
          "/projects",
          "/docs",
          "/search",
          "/admin",
          "/about",
          "/privacy",
          "/rules",
        ].includes(alias)
      )
        throw new Error(`重定向冲突 ${alias}`);
      paths.add(alias);
    }
  }
  const visible = all.filter((x) => preview || !x.entry.draft);
  const publicPaths = new Set([
    "/",
    "/blog",
    "/projects",
    "/docs",
    "/search",
    "/about",
    "/privacy",
    "/rules",
    ...visible.map((x) => x.entry.path),
    ...visible.flatMap((x) => x.entry.aliases),
  ]);
  for (const { entry, body } of visible) {
    if (
      entry.kind === "docs" &&
      !visible.some((x) => x.entry.kind === "projects" && x.entry.slug === entry.project)
    )
      throw new Error(`公开文档不能引用草稿项目：${entry.file}`);
    for (const m of body.matchAll(/!?\[[^\]]*\]\(([^\s)]+)(?:\s+[^)]*)?\)/g)) {
      const href = m[1];
      if (/^(https?:|mailto:|#)/.test(href)) continue;
      const target = href.split(/[?#]/)[0];
      if (
        !target.startsWith("/") ||
        (!publicPaths.has(target) && !existsSync(join("public", target)))
      )
        throw new Error(`${entry.file}: 无效站内链接 ${href}`);
    }
  }
  return visible.sort(
    (a, b) => b.entry.date.localeCompare(a.entry.date) || a.entry.order - b.entry.order,
  );
}
export async function generate(check = false) {
  const preview = process.env.CONTENT_PREVIEW === "true";
  if (preview && (process.env.CI || process.env.CLOUDFLARE_ENV))
    throw new Error("部署不能启用草稿预览");
  const rows = await loadContent(preview);
  const entries = rows.map((x) => x.entry);
  const manifest = JSON.stringify(entries, null, 2) + "\n";
  const redirects =
    "# Generated from content aliases.\n" +
    entries.flatMap((x) => x.aliases.map((alias) => `${alias} ${x.path} 308\n`)).join("");
  const contentModule = `// Generated by scripts/content.ts. Do not edit.\nimport type { ContentEntry } from "../lib/site";\n${rows.map((x, i) => `import C${i} from "./mdx/${x.entry.id}.mdx";`).join("\n")}\nexport const entries: ContentEntry[] = ${JSON.stringify(entries)};\nexport const components = {${rows.map((x, i) => `${JSON.stringify(x.entry.id)}: C${i}`).join(",")}};\n`;
  if (check) {
    if (
      !existsSync("src/generated/manifest.json") ||
      (await readFile("src/generated/manifest.json", "utf8")) !== manifest
    )
      throw new Error("内容清单过期，请运行 bun run content:generate");
    if ((await readFile("src/generated/content.ts", "utf8")) !== contentModule)
      throw new Error("内容入口过期，请运行 bun run content:generate");
    if ((await readFile("public/_redirects", "utf8")) !== redirects)
      throw new Error("重定向清单过期，请运行 bun run content:generate");
    const modules = (await readdir("src/generated/mdx")).sort();
    if (JSON.stringify(modules) !== JSON.stringify(entries.map((x) => `${x.id}.mdx`).sort()))
      throw new Error("生成目录包含缺失或多余内容，请运行 bun run content:generate");
    for (const { entry, body } of rows)
      if ((await readFile(`src/generated/mdx/${entry.id}.mdx`, "utf8")) !== body)
        throw new Error(`内容模块过期 ${entry.id}`);
    console.log(`✓ ${rows.length} 篇内容校验通过`);
    return;
  }
  await mkdir("src/generated/mdx", { recursive: true });
  await rm("src/generated/mdx", { recursive: true, force: true });
  await mkdir("src/generated/mdx", { recursive: true });
  await writeFile("src/generated/manifest.json", manifest);
  for (const { entry, body } of rows) await writeFile(`src/generated/mdx/${entry.id}.mdx`, body);
  await writeFile("src/generated/content.ts", contentModule);
  await writeFile("public/_redirects", redirects);
  const { index } = await pagefind.createIndex({ forceLanguage: "zh-cn" });
  if (!index) throw new Error("Pagefind 初始化失败");
  for (const { entry, body } of rows) {
    const result = await index.addCustomRecord({
      url: entry.path,
      content: `${entry.title}\n${entry.description}\n${body.replace(/import .*\n/g, "")}`,
      language: "zh-cn",
      meta: { title: entry.title, description: entry.description },
      filters: { type: [entry.kind] },
    });
    if (result.errors.length) throw new Error(result.errors.join(","));
  }
  await rm("public/pagefind", { recursive: true, force: true });
  const result = await index.writeFiles({ outputPath: "public/pagefind" });
  if (result.errors.length) throw new Error(result.errors.join(","));
  await pagefind.close();
  await writeFile(
    "public/pagefind/fallback.json",
    JSON.stringify(
      rows.map(({ entry, body }) => ({
        url: entry.path,
        kind: entry.kind,
        title: entry.title,
        description: entry.description,
        text: body.replace(/<[^>]*>/g, "").replace(/\s+/g, " "),
      })),
    ),
  );
  const paths = [
    "/",
    "/blog",
    "/projects",
    "/docs",
    "/about",
    "/search",
    "/privacy",
    "/rules",
    ...entries.map((x) => x.path),
  ];
  await writeFile(
    "public/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((p) => `<url><loc>${site.url}${xml(p)}</loc></url>`).join("")}</urlset>`,
  );
  await writeFile(
    "public/rss.xml",
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${site.name}</title><link>${site.url}</link><description>${site.description}</description>${entries
      .filter((x) => x.kind === "blog")
      .map(
        (x) =>
          `<item><title>${xml(x.title)}</title><link>${site.url}${x.path}</link><guid isPermaLink="false">${x.id}</guid><description>${xml(x.description)}</description><pubDate>${new Date(x.date).toUTCString()}</pubDate></item>`,
      )
      .join("")}</channel></rss>`,
  );
  await writeFile(
    "public/robots.txt",
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /_serverFn/\nSitemap: ${site.url}/sitemap.xml\n`,
  );
  console.log(`✓ 已生成 ${entries.length} 篇内容、中文搜索和订阅资源`);
}
if (import.meta.main) await generate(process.argv.includes("--check"));
