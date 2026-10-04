import type { ContentCatalog, ContentKind, DocEntry } from "./site";

export const staticPublicPaths = [
  "/",
  "/blog",
  "/projects",
  "/search",
  "/about",
  "/privacy",
  "/rules",
];
export const reservedSegments = [
  ...staticPublicPaths.filter((path) => path !== "/").map((path) => path.slice(1)),
  "docs",
  "admin",
  "api",
  "_serverFn",
  "healthz",
  "assets",
  "pagefind",
];
export function contentPath(kind: ContentKind, data: { slug: string; projectSlug?: string }) {
  if (kind === "docs") {
    if (!data.projectSlug) throw new Error("文档缺少所属项目");
    return `/${data.projectSlug}/docs/${data.slug}`;
  }
  return kind === "projects" ? `/${data.slug}` : `/blog/${data.slug}`;
}
export function findProject(catalog: ContentCatalog, slug: string) {
  return catalog.projects.find((project) => project.slug === slug);
}
export function findDoc(catalog: ContentCatalog, projectId: string, slug: string) {
  return catalog.entries.find(
    (entry): entry is DocEntry =>
      entry.kind === "docs" && entry.projectId === projectId && entry.slug === slug,
  );
}
export function projectDocuments(catalog: ContentCatalog, projectId: string) {
  return (catalog.navigation[projectId] ?? []).flatMap((group) => group.items);
}
