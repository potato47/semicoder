import { ArrowUpRight, Code2, ArrowRight } from "lucide-react";
import { catalog } from "../generated/catalog";
import { projectDocuments } from "../lib/content";
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
  const start = projectDocuments(catalog, item.id).find((doc) => doc.id === item.start?.doc);
  return (
    <article className={styles.project}>
      <div className={styles.visual} aria-hidden="true">
        <div className={styles.windowBar}>
          <span />
          <span />
          <span />
          <small>{item.slug} / workspace</small>
        </div>
        <div className={styles.projectArt}>
          <span>{item.category ?? "个人项目"}</span>
          <strong>{item.title}</strong>
          <small>{item.stack.join(" / ")}</small>
        </div>
      </div>
      <div className={styles.projectBody}>
        <div className={styles.projectMeta}>
          <span className={styles.projectIcon}>
            <Code2 size={20} />
          </span>
          <span className="tag">{item.status}</span>
        </div>
        <h3>
          <ContentLink entry={item}>
            {item.title}
            <ArrowUpRight size={20} />
          </ContentLink>
        </h3>
        <p>{item.description}</p>
        <div className={styles.stack}>
          {item.stack.map((x) => (
            <span key={x}>{x}</span>
          ))}
        </div>
        <div className={styles.projectFooter}>
          {start ? (
            <ContentLink entry={start}>
              {item.start?.label}
              <ArrowRight size={14} />
            </ContentLink>
          ) : item.sample ? (
            <span className="sample">示例项目介绍</span>
          ) : (
            <span>{item.category ?? "个人项目"}</span>
          )}
          <ContentLink entry={item}>
            查看项目 <ArrowRight size={14} />
          </ContentLink>
        </div>
      </div>
    </article>
  );
}
