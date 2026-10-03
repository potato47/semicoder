import { createFileRoute } from "@tanstack/react-router";
import { entries } from "../generated/content";
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
        <p>小工具、开源实验与持续生长的项目。这里展示构建，也记录过程。</p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 310px), 1fr))",
          gap: 25,
          maxWidth: 760,
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
