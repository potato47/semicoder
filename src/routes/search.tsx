import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search as SearchIcon, ArrowUpRight } from "lucide-react";
import { catalog, projects, entries } from "../generated/catalog";
import { projectDocuments } from "../lib/content";
import { ContentLink } from "../components/ContentLink";
import type { ContentKind } from "../lib/site";
import { seo } from "../lib/seo";
import { useMounted } from "../lib/client";
import {
  needsChineseFallback,
  searchLiteral,
  searchFilters,
  parseSearch,
  type SearchRecord,
} from "../lib/search";
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
  validateSearch: (raw) =>
    parseSearch(
      raw,
      projects
        .filter((project) => projectDocuments(catalog, project.id).length)
        .map((project) => project.id),
    ),
  head: () => seo("搜索", "搜索博客、项目和文档。", "/search"),
  component: Search,
});
function Search() {
  const mounted = useMounted();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const query = search.q ?? "",
    kind = search.type ?? "all",
    projectId = search.projectId;
  const [hits, setHits] = useState<Hit[]>([]),
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
          const data = searchLiteral(await fallbackPromise, query, kind, projectId);
          if (!cancelled) setHits(data);
          return;
        }
        const index = await loadIndex();
        const results = await index.search(query, {
          filters: searchFilters(kind, projectId),
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
  }, [query, kind, projectId]);
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
          onChange={(e) =>
            void navigate({ search: { ...search, q: e.target.value || undefined }, replace: true })
          }
          placeholder="试试「FIA」「麻辣烫」或「安装」"
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
            onClick={() =>
              void navigate({
                search: {
                  ...search,
                  type: k.id === "all" ? undefined : (k.id as ContentKind),
                  projectId: k.id === "docs" ? projectId : undefined,
                },
              })
            }
            aria-pressed={kind === k.id}
          >
            {k.label}
          </button>
        ))}
      </div>
      {kind === "docs" && (
        <div className="row" style={{ marginBottom: 24 }}>
          <label htmlFor="search-project">文档范围</label>
          <select
            id="search-project"
            className="field"
            style={{ width: "auto", maxWidth: "100%" }}
            value={projectId ?? ""}
            onChange={(event) =>
              void navigate({ search: { ...search, projectId: event.target.value || undefined } })
            }
          >
            <option value="">全部项目文档</option>
            {projects
              .filter((project) => projectDocuments(catalog, project.id).length)
              .map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
          </select>
          <button
            className="button small"
            onClick={() => void navigate({ search: { q: search.q } })}
          >
            搜索全站
          </button>
        </div>
      )}
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
        hits.map((h) => {
          const entry = entries.find((item) => item.path === h.url.replace(/\/$/, ""));
          return entry ? (
            <article key={h.url} style={{ padding: "25px 0", borderTop: "1px solid var(--line)" }}>
              <h2 style={{ fontSize: 21 }}>
                <ContentLink entry={entry}>
                  {h.meta.title} <ArrowUpRight size={17} />
                </ContentLink>
              </h2>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.9 }}>
                {h.excerpt.replace(/<[^>]*>/g, "")}
              </p>
            </article>
          ) : null;
        })}
    </>
  );
}
