import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { entries } from "../generated/content";
import { ArticleList } from "../components/ContentCards";
import { seo } from "../lib/seo";
export const Route = createFileRoute("/blog/")({
  head: () => seo("博客", "记录编程路上的思考、实践与学习笔记。", "/blog"),
  component: Blog,
});
function Blog() {
  const [tag, setTag] = useState("全部");
  const articles = entries.filter((x) => x.kind === "blog");
  const tags = ["全部", ...new Set(articles.flatMap((x) => x.tags))];
  return (
    <>
      <div className="pageIntro">
        <span className="eyebrow">
          <b>01 /</b> JOURNAL
        </span>
        <h1>写下来，让思考有迹可循。</h1>
        <p>学习笔记、工程实践，还有那些值得分享的小发现。</p>
      </div>
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
    </>
  );
}
