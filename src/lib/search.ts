import type { ContentKind } from "./site";
export interface SearchState {
  q?: string;
  type?: ContentKind;
  projectId?: string;
}
export function parseSearch(raw: Record<string, unknown>, projectIds: string[]): SearchState {
  const type =
    raw.type === "docs" || raw.type === "projects" || raw.type === "blog" ? raw.type : undefined;
  return {
    q: typeof raw.q === "string" && raw.q ? raw.q : undefined,
    type,
    projectId:
      type === "docs" && typeof raw.projectId === "string" && projectIds.includes(raw.projectId)
        ? raw.projectId
        : undefined,
  };
}
export function searchFilters(kind: string, projectId?: string): Record<string, string> {
  return {
    ...(kind === "all" ? {} : { type: kind }),
    ...(kind === "docs" && projectId ? { projectId } : {}),
  };
}
export interface SearchRecord {
  url: string;
  kind: string;
  title: string;
  description: string;
  text: string;
  projectId?: string;
}
export function needsChineseFallback(query: string) {
  if (!/\p{Script=Han}/u.test(query)) return false;
  if (typeof Intl.Segmenter === "undefined") return true;
  // Some embedded browsers expose Segmenter without the Chinese word dictionary.
  return [...new Intl.Segmenter("zh-CN", { granularity: "word" }).segment("编程")].length !== 1;
}
export function searchLiteral(
  records: SearchRecord[],
  query: string,
  kind: string,
  projectId?: string,
) {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return records
    .filter((record) => {
      const text = `${record.title} ${record.description} ${record.text}`.toLocaleLowerCase();
      return (
        (kind === "all" || record.kind === kind) &&
        (kind !== "docs" || !projectId || record.projectId === projectId) &&
        terms.every((term) => text.includes(term))
      );
    })
    .slice(0, 30)
    .map((record) => ({
      url: record.url,
      meta: { title: record.title, description: record.description },
      excerpt: record.description,
    }));
}
