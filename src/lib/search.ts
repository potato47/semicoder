export interface SearchRecord {
  url: string;
  kind: string;
  title: string;
  description: string;
  text: string;
}
export function needsChineseFallback(query: string) {
  if (!/\p{Script=Han}/u.test(query)) return false;
  if (typeof Intl.Segmenter === "undefined") return true;
  // Some embedded browsers expose Segmenter without the Chinese word dictionary.
  return [...new Intl.Segmenter("zh-CN", { granularity: "word" }).segment("编程")].length !== 1;
}
export function searchLiteral(records: SearchRecord[], query: string, kind: string) {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return records
    .filter((record) => {
      const text = `${record.title} ${record.description} ${record.text}`.toLocaleLowerCase();
      return (kind === "all" || record.kind === kind) && terms.every((term) => text.includes(term));
    })
    .slice(0, 30)
    .map((record) => ({
      url: record.url,
      meta: { title: record.title, description: record.description },
      excerpt: record.description,
    }));
}
