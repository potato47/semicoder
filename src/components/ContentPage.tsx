import { Link } from "@tanstack/react-router";
import { ArrowLeft, Clock } from "lucide-react";
import type { BlogEntry } from "../lib/site";
import { formatDate } from "../lib/site";
import { ContentBody, ContentLabels } from "./ContentBody";
import styles from "./ContentPage.module.css";
export function ContentPage({ entry }: { entry: BlogEntry }) {
  return (
    <>
      <header className={styles.heading}>
        <Link to="/blog" className={styles.back}>
          <ArrowLeft size={14} />
          博客
        </Link>
        <ContentLabels entry={entry} />
        <h1>{entry.title}</h1>
        <p>{entry.description}</p>
        <div className={styles.meta}>
          <span>新手程序员</span>
          <span>·</span>
          <time dateTime={entry.date}>{formatDate(entry.date)}</time>
          <span>·</span>
          <span>
            <Clock size={12} />
            {entry.readingTime} 分钟阅读
          </span>
        </div>
      </header>
      <div className={styles.layout}>
        <div>
          <ContentBody entry={entry} />
        </div>
        <aside className={styles.sidebar}>
          <span className="eyebrow">ON THIS PAGE / 目录</span>
          <nav aria-label="本页目录">
            {entry.toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                style={{ paddingLeft: item.depth === 3 ? 16 : 0 }}
              >
                {item.text}
              </a>
            ))}
          </nav>
        </aside>
      </div>
    </>
  );
}
