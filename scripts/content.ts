import { mkdir, readdir, readFile, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { compile } from "@mdx-js/mdx";
import * as pagefind from "pagefind";
import { markdownFiles } from "./content-files";
import type { ContentEntry, ContentKind, ContentCatalog, ProjectEntry } from "../src/lib/site";
import { site } from "../src/lib/site";
import { contentPath, reservedSegments, staticPublicPaths } from "../src/lib/content";
export { contentPath } from "../src/lib/content";

const segment = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const common = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string().min(1),
  slug: z.string().regex(segment),
  date: z.coerce.date().transform((d) => d.toISOString().slice(0, 10)),
  updated: z.coerce
    .date()
    .transform((d) => d.toISOString().slice(0, 10))
    .optional(),
  tags: z.array(z.string()).default([]),
  comments: z.boolean().optional(),
  sample: z.boolean().default(false),
  draft: z.boolean().default(false),
  aliases: z.array(z.string().regex(/^\/(?!\/)[a-zA-Z0-9/_-]+$/)).default([]),
});
const schemas = {
  blog: common.strict(),
  projects: common
    .extend({
      stack: z.array(z.string()).default([]),
      status: z.enum(["构建中", "已发布", "已归档"]).optional(),
      source: z.url().optional(),
      demo: z.url().optional(),
      category: z.string().trim().min(1).optional(),
      featured: z.boolean().optional(),
      start: z
        .object({ label: z.string().trim().min(1), doc: z.string().min(1) })
        .strict()
        .optional(),
    })
    .strict(),
  docs: common
    .extend({
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/),
    })
    .strict(),
};
const navSchema = z
  .object({
    groups: z.array(
      z
        .object({
          title: z.string().trim().min(1),
          items: z.array(z.string().min(1)),
        })
        .strict(),
    ),
  })
  .strict();
type Row = { entry: ContentEntry; body: string };

export function xml(value: string) {
  return value.replace(
    /[<>&"']/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!,
  );
}
export async function loadCatalog(preview = false, root = ".") {
  const all: Row[] = [];
  const rawNavigation = new Map<string, z.infer<typeof navSchema>>();
  const publicRoot = resolve(root, "public");
  const reserved = new Set(reservedSegments);
  if (existsSync(publicRoot)) for (const name of await readdir(publicRoot)) reserved.add(name);
  // Also reserve new static route namespaces without requiring a second manual registration.
  const routesRoot = join(root, "src/routes");
  if (existsSync(routesRoot)) {
    for (const file of await readdir(routesRoot)) {
      if (!/\.tsx?$/.test(file)) continue;
      const source = await readFile(join(routesRoot, file), "utf8");
      for (const match of source.matchAll(/createFileRoute\(["']\/([^/$"']+)/g))
        reserved.add(match[1]);
    }
  }
  async function readEntry(filename: string, kind: ContentKind, project?: ProjectEntry) {
    const { data: raw, content: body } = matter(await readFile(filename, "utf8"));
    const parsed = schemas[kind].safeParse(raw);
    if (!parsed.success) throw new Error(`${filename}: ${parsed.error.message}`);
    const data = parsed.data;
    if (kind === "projects" && reserved.has(data.slug))
      throw new Error(`${filename}: 项目路径占用保留名称 ${data.slug}`);
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
    const base = {
      ...data,
      path: contentPath(kind, { slug: data.slug, projectSlug: project?.slug }),
      file: relative(root, filename).split(sep).join("/"),
      comments: data.comments ?? kind !== "docs",
      toc,
      readingTime: Math.max(1, Math.ceil(body.length / 450)),
    };
    let entry: ContentEntry;
    if (kind === "projects")
      entry = { ...base, ...schemas.projects.parse(raw), comments: base.comments, kind };
    else if (kind === "docs") {
      if (!project) throw new Error(`${filename}: 文档缺少项目`);
      entry = { ...base, kind, projectId: project.id, projectSlug: project.slug };
    } else entry = { ...base, kind };
    all.push({ entry, body });
    return entry;
  }
  for (const file of await markdownFiles(join(root, "content/blog"))) await readEntry(file, "blog");
  const projectsRoot = join(root, "content/projects");
  for (const directory of (await readdir(projectsRoot, { withFileTypes: true })).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    if (!directory.isDirectory()) throw new Error(`项目必须使用目录：${directory.name}`);
    const directoryPath = join(projectsRoot, directory.name);
    const project = await readEntry(join(directoryPath, "index.mdx"), "projects");
    if (project.kind !== "projects") throw new Error("项目类型错误");
    const documents = await markdownFiles(join(directoryPath, "docs"));
    for (const file of documents) await readEntry(file, "docs", project);
    const navFile = join(directoryPath, "nav.json");
    if (documents.length || existsSync(navFile)) {
      if (!existsSync(navFile)) throw new Error(`${directoryPath}: 文档缺少 nav.json`);
      rawNavigation.set(project.id, navSchema.parse(JSON.parse(await readFile(navFile, "utf8"))));
    }
  }
  if (existsSync(join(root, "content/docs"))) throw new Error("文档必须迁入所属项目的 docs 目录");
  const ids = new Set<string>();
  const paths = new Set<string>(staticPublicPaths);
  const projects = all.map((row) => row.entry).filter((entry) => entry.kind === "projects");
  for (const { entry } of all) {
    if (ids.has(entry.id) || paths.has(entry.path)) throw new Error(`${entry.file}: ID 或路径重复`);
    ids.add(entry.id);
    paths.add(entry.path);
  }
  for (const project of projects) paths.add(`${project.path}/docs`);
  for (const { entry } of all) {
    for (const alias of entry.aliases) {
      if (paths.has(alias) || reserved.has(alias.split("/")[1]))
        throw new Error(`重定向冲突 ${alias}`);
      paths.add(alias);
    }
  }
  const publishedProjects = new Set(
    projects.filter((project) => preview || !project.draft).map((project) => project.id),
  );
  const rows = all
    .filter(
      ({ entry }) =>
        (preview || !entry.draft) &&
        (entry.kind !== "docs" || publishedProjects.has(entry.projectId)),
    )
    .sort(
      (a, b) => b.entry.date.localeCompare(a.entry.date) || a.entry.id.localeCompare(b.entry.id),
    );
  const visibleIds = new Set(rows.map((row) => row.entry.id));
  const catalog: ContentCatalog = {
    entries: rows.map((row) => row.entry),
    projects: rows.map((row) => row.entry).filter((entry) => entry.kind === "projects"),
    navigation: {},
    publicPaths: [],
  };
  for (const project of projects) {
    const seen = new Set<string>();
    const groups = (rawNavigation.get(project.id)?.groups ?? [])
      .map((group) => ({
        title: group.title,
        items: group.items
          .map((id) => {
            const doc = all.find((row) => row.entry.id === id)?.entry;
            if (!doc || doc.kind !== "docs" || doc.projectId !== project.id)
              throw new Error(`${project.file}: 无效导航引用 ${id}`);
            if (seen.has(id)) throw new Error(`${project.file}: 导航重复引用 ${id}`);
            seen.add(id);
            return doc;
          })
          .filter((doc) => visibleIds.has(doc.id)),
      }))
      .filter((group) => group.items.length);
    for (const { entry } of rows) {
      if (
        entry.kind === "docs" &&
        entry.projectId === project.id &&
        !entry.draft &&
        !project.draft &&
        !seen.has(entry.id)
      )
        throw new Error(`${entry.file}: 公开文档未配置导航`);
    }
    if (publishedProjects.has(project.id)) {
      if (
        project.start &&
        !groups.some((group) => group.items.some((doc) => doc.id === project.start?.doc))
      )
        throw new Error(`${project.file}: 开始入口必须引用本项目可见的文档`);
      catalog.navigation[project.id] = groups;
      if (rows.some(({ entry }) => entry.kind === "docs" && entry.projectId === project.id))
        project.docsPath = `${project.path}/docs`;
    }
  }
  catalog.publicPaths = [
    ...staticPublicPaths,
    ...catalog.entries.map((entry) => entry.path),
    ...catalog.projects.flatMap((project) => (project.docsPath ? [project.docsPath] : [])),
  ];
  const publicPaths = new Set([
    ...catalog.publicPaths,
    ...catalog.entries.flatMap((entry) => entry.aliases),
  ]);
  for (const { entry, body } of rows) {
    for (const match of body.matchAll(/!?\[[^\]]*\]\(([^\s)]+)(?:\s+[^)]*)?\)/g)) {
      const href = match[1];
      if (/^(https?:|mailto:|#)/.test(href)) continue;
      const target = href.split(/[?#]/)[0];
      const asset = resolve(publicRoot, `.${target}`);
      if (
        !target.startsWith("/") ||
        (!publicPaths.has(target) && !(asset.startsWith(publicRoot + sep) && existsSync(asset)))
      )
        throw new Error(`${entry.file}: 无效站内链接 ${href}`);
    }
  }
  return { rows, catalog };
}
export async function loadContent(preview = false, root = ".") {
  return (await loadCatalog(preview, root)).rows;
}
export async function generate(check = false) {
  const preview = process.env.CONTENT_PREVIEW === "true";
  if (
    preview &&
    (process.env.CI || process.env.CLOUDFLARE_ENV || process.argv.includes("--production"))
  )
    throw new Error("部署不能启用草稿预览");
  const { rows, catalog } = await loadCatalog(preview);
  const entries = rows.map((x) => x.entry);
  const catalogJson = JSON.stringify(catalog, null, 2) + "\n";
  const catalogModule = `// Generated by scripts/content.ts. Do not edit.\nimport type { ContentCatalog } from "../lib/site";\nexport const catalog: ContentCatalog = ${JSON.stringify(catalog)};\nexport const { entries, projects, navigation, publicPaths } = catalog;\n`;
  const manifest = JSON.stringify(entries, null, 2) + "\n";
  const redirects =
    "# Generated from content aliases.\n" +
    entries.flatMap((x) => x.aliases.map((alias) => `${alias} ${x.path} 308\n`)).join("");
  const contentModule = `// Generated by scripts/content.ts. Do not edit.\n${rows.map((x, i) => `import C${i} from "./mdx/${x.entry.id}.mdx";`).join("\n")}\nexport const components = {${rows.map((x, i) => `${JSON.stringify(x.entry.id)}: C${i}`).join(",")}};\n`;
  if (check) {
    for (const [file, expected] of [
      ["src/generated/catalog.json", catalogJson],
      ["src/generated/catalog.ts", catalogModule],
    ]) {
      if (!existsSync(file) || (await readFile(file, "utf8")) !== expected)
        throw new Error("项目清单过期，请运行 bun run content:generate");
    }
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
  await writeFile("src/generated/catalog.json", catalogJson);
  await writeFile("src/generated/catalog.ts", catalogModule);
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
      filters: {
        type: [entry.kind],
        ...(entry.kind === "docs" ? { projectId: [entry.projectId] } : {}),
      },
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
        ...(entry.kind === "docs" ? { projectId: entry.projectId } : {}),
        title: entry.title,
        description: entry.description,
        text: body.replace(/<[^>]*>/g, "").replace(/\s+/g, " "),
      })),
    ),
  );
  const paths = catalog.publicPaths;
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
