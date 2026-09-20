import { ArrowUpRight, Code2, ArrowRight } from "lucide-react";
import type { ContentEntry } from "../lib/site";
import { formatDate } from "../lib/site";
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
              <a href={item.path}>{item.title}</a>
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
          <a href={item.path} className={styles.arrow} aria-label={`阅读 ${item.title}`}>
            <ArrowUpRight size={21} />
          </a>
        </article>
      ))}
    </div>
  );
}
export function ProjectCard({ item }: { item: ContentEntry }) {
  return (
    <article className={styles.project}>
      <div className={styles.visual} aria-hidden="true">
        <div className={styles.windowBar}>
          <span />
          <span />
          <span />
          <small>semicoder / workspace</small>
        </div>
        <div className={styles.codeArt}>
          <div>
            <span className={styles.codeOrange}>const</span> idea ={" "}
            <span className={styles.codeGreen}>"make something"</span>;
          </div>
          <div>
            <span className={styles.codeOrange}>while</span> (curious) {"{"}
          </div>
          <div className={styles.indent}>
            learn();
            <br />
            build();
            <br />
            <span className={styles.codeDim}>// a little better, every day</span>
          </div>
          <div>{"}"}</div>
        </div>
        <div className={styles.buildBadge}>
          <span /> ALWAYS IN PROGRESS
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
          <a href={item.path}>
            {item.title}
            <ArrowUpRight size={20} />
          </a>
        </h3>
        <p>{item.description}</p>
        <div className={styles.stack}>
          {item.stack.map((x) => (
            <span key={x}>{x}</span>
          ))}
        </div>
        <div className={styles.projectFooter}>
          {item.sample ? <span className="sample">示例项目介绍</span> : <span>开源项目</span>}
          <a href={item.path}>
            查看项目 <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </article>
  );
}
