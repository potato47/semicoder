import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search as SearchIcon, ArrowUpRight } from "lucide-react";
import { seo } from "../lib/seo";
import { useMounted } from "../lib/client";
import { needsChineseFallback, searchLiteral, type SearchRecord } from "../lib/search";
interface Hit {
  url: string;
  meta: { title: string; description?: string };
  excerpt: string;
}
interface SearchIndex {
  search: (
    query: string,
    options: { filters: Record<string, string> },
  ) => Promise<{ results: { data: () => Promise<Hit> }[] }>;
}
let indexPromise: Promise<SearchIndex> | undefined;
let fallbackPromise: Promise<SearchRecord[]> | undefined;
function loadIndex(): Promise<SearchIndex> {
  // An absolute URL keeps Vite from treating the generated public module as source code.
  const url = new URL("/pagefind/pagefind.js", window.location.origin).href;
  return (indexPromise ??= import(/* @vite-ignore */ url).catch((error) => {
    indexPromise = undefined;
    throw error;
  }));
}
export const Route = createFileRoute("/search")({
  head: () => seo("搜索", "搜索博客、项目和文档。", "/search"),
  component: Search,
});
function Search() {
  const mounted = useMounted();
  const [query, setQuery] = useState(""),
    [kind, setKind] = useState("all"),
    [hits, setHits] = useState<Hit[]>([]),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setHits([]);
        setLoading(false);
        setError("");
        return;
      }
      setLoading(true);
      setError("");
      try {
        if (needsChineseFallback(query)) {
          fallbackPromise ??= fetch("/pagefind/fallback.json")
            .then((response) => {
              if (!response.ok) throw new Error("搜索内容加载失败");
              return response.json() as Promise<SearchRecord[]>;
            })
            .catch((cause) => {
              fallbackPromise = undefined;
              throw cause;
            });
          const data = searchLiteral(await fallbackPromise, query, kind);
          if (!cancelled) setHits(data);
          return;
        }
        const index = await loadIndex();
        const results = await index.search(query, {
          filters: kind === "all" ? {} : { type: kind },
        });
        const data = await Promise.all(results.results.slice(0, 30).map((x) => x.data()));
        if (!cancelled) setHits(data);
      } catch {
        if (!cancelled) setError("搜索暂时不可用，请稍后重试。");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, kind]);
  return (
    <>
      <div className="pageIntro">
        <span className="eyebrow">
          <b>FIND YOUR NEXT IDEA /</b> SEARCH
        </span>
        <h1>你想了解什么？</h1>
        <p>搜索文章、项目与文档，找到下一个灵感。</p>
      </div>
      <div className="row">
        <SearchIcon size={22} />
        <label htmlFor="search-input" className="eyebrow">
          关键词
        </label>
        <input
          id="search-input"
          disabled={!mounted}
          className="field"
          style={{ flex: 1, minWidth: 180 }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="试试「编程」「Cloudflare」或「文档」"
          type="search"
        />
      </div>
      <div className="row" style={{ margin: "22px 0" }}>
        {[
          { id: "all", label: "全部" },
          { id: "blog", label: "博客" },
          { id: "projects", label: "项目" },
          { id: "docs", label: "文档" },
        ].map((k) => (
          <button
            className={`button small ${kind === k.id ? "primary" : ""}`}
            key={k.id}
            onClick={() => setKind(k.id)}
            aria-pressed={kind === k.id}
          >
            {k.label}
          </button>
        ))}
      </div>
      <div aria-live="polite">
        {loading ? (
          <p className="muted">正在查找…</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : query.trim() ? (
          <p className="muted" style={{ fontSize: 12 }}>
            找到 {hits.length} 条结果
          </p>
        ) : (
          <p className="muted">输入关键词开始探索。</p>
        )}
      </div>
      {!loading &&
        hits.map((h) => (
          <article key={h.url} style={{ padding: "25px 0", borderTop: "1px solid var(--line)" }}>
            <h2 style={{ fontSize: 21 }}>
              <a href={h.url}>
                {h.meta.title} <ArrowUpRight size={17} />
              </a>
            </h2>
            <p className="muted" style={{ fontSize: 14, lineHeight: 1.9 }}>
              {h.excerpt.replace(/<[^>]*>/g, "")}
            </p>
          </article>
        ))}
    </>
  );
}
