import { createFileRoute } from "@tanstack/react-router";
import { entries } from "../generated/catalog";
import { ProjectCard } from "../components/ContentCards";
import { seo } from "../lib/seo";
export const Route = createFileRoute("/projects/")({
  head: () => seo("项目", "从想法到作品，记录每一次动手构建。", "/projects"),
  component: Projects,
});
function Projects() {
  return (
    <>
      <div className="pageIntro">
        <span className="eyebrow">
          <b>02 /</b> SELECTED WORK
        </span>
        <h1>想法，值得被实现。</h1>
        <p>桌面框架、插件应用与这个网站。了解它们的设计，找到文档和安装入口。</p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 310px), 1fr))",
          gap: 25,
        }}
      >
        {entries
          .filter((x) => x.kind === "projects")
          .map((x) => (
            <ProjectCard key={x.id} item={x} />
          ))}
      </div>
    </>
  );
}
