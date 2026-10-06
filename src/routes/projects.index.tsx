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
    <div className="collectionPage">
      <h1 className="visuallyHidden">项目</h1>
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
    </div>
  );
}
