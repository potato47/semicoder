import { createFileRoute } from "@tanstack/react-router";
import { projects } from "../generated/catalog";
import type { ProjectEntry } from "../lib/site";
import { ProjectCard } from "../components/ContentCards";
import styles from "../components/ContentCards.module.css";
import { seo } from "../lib/seo";
export const Route = createFileRoute("/projects/")({
  head: () => seo("项目", "从想法到作品，记录每一次动手构建。", "/projects"),
  // These small, frequently used lists must not wait for a route chunk on first navigation.
  codeSplitGroupings: [],
  component: Projects,
});
function Projects() {
  const groups = new Map<string, ProjectEntry[]>();
  for (const project of projects) {
    const category = project.category ?? "个人项目";
    const items = groups.get(category) ?? [];
    items.push(project);
    groups.set(category, items);
  }
  return (
    <div className="collectionPage">
      <h1 className="visuallyHidden">项目</h1>
      <div className={styles.projectGroups}>
        {[...groups].map(([category, items], index) => (
          <section key={category} aria-labelledby={`project-category-${index}`}>
            <h2 className={styles.category} id={`project-category-${index}`}>
              {category}
            </h2>
            <div className={styles.projectGrid}>
              {items.map((item) => (
                <ProjectCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
