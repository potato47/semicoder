import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { entries } from "../generated/catalog";
import { ArticleList } from "../components/ContentCards";
import { seo } from "../lib/seo";
export const Route = createFileRoute("/blog/")({
  head: () => seo("博客", "记录编程路上的思考、实践与学习笔记。", "/blog"),
  // These small, frequently used lists must not wait for a route chunk on first navigation.
  codeSplitGroupings: [],
  component: Blog,
});
function Blog() {
  const [tag, setTag] = useState("全部");
  const articles = entries.filter((x) => x.kind === "blog");
  const tags = ["全部", ...new Set(articles.flatMap((x) => x.tags))];
  return (
    <div className="collectionPage">
      <h1 className="visuallyHidden">博客</h1>
      <div className="row" style={{ marginBottom: 28 }}>
        {tags.map((t) => (
          <button
            className={`button small ${tag === t ? "primary" : ""}`}
            key={t}
            onClick={() => setTag(t)}
            aria-pressed={tag === t}
          >
            {t}
          </button>
        ))}
      </div>
      <ArticleList items={articles.filter((x) => tag === "全部" || x.tags.includes(tag))} />
    </div>
  );
}
