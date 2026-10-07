import { ArrowUpRight, Code2, ArrowRight } from "lucide-react";
import type { ContentEntry, ProjectEntry } from "../lib/site";
import { formatDate } from "../lib/site";
import { ContentLink } from "./ContentLink";
import styles from "./ContentCards.module.css";
export function ArticleList({ items }: { items: ContentEntry[] }) {
  return (
    <div>
      {items.map((item, i) => (
        <article className={styles.article} key={item.id}>
          <span className={styles.number}>{String(i + 1).padStart(2, "0")}</span>
          <div>
            <div className={styles.meta}>
              <span>{item.tags[0] || "随笔"}</span>
              <span>·</span>
              <time dateTime={item.date}>{formatDate(item.date)}</time>
              {item.sample && <span className="sample">示例</span>}
            </div>
            <h3>
              <ContentLink entry={item}>{item.title}</ContentLink>
            </h3>
            <p>{item.description}</p>
            <div className={styles.articleBottom}>
              <span>{item.readingTime} 分钟阅读</span>
              <span>
                {item.tags
                  .slice(1)
                  .map((t) => `# ${t}`)
                  .join("  ")}
              </span>
            </div>
          </div>
          <ContentLink entry={item} className={styles.arrow} aria-label={`阅读 ${item.title}`}>
            <ArrowUpRight size={21} />
          </ContentLink>
        </article>
      ))}
    </div>
  );
}
export function ProjectCard({ item }: { item: ProjectEntry }) {
  return (
    <article className={styles.project}>
      <div className={styles.projectHeading}>
        <h3>
          <ContentLink entry={item}>
            <Code2 size={28} aria-hidden="true" />
            {item.title}
          </ContentLink>
        </h3>
        <ContentLink entry={item} className={styles.projectDocs} aria-label={`${item.title} 文档`}>
          文档 <ArrowRight size={15} aria-hidden="true" />
        </ContentLink>
      </div>
      <p>{item.description}</p>
      {item.sample && <span className="sample">示例项目</span>}
    </article>
  );
}
