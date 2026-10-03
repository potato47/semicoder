import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, ArrowRight, BookOpen, Terminal, GitFork, Rss, Sprout } from "lucide-react";
import { entries } from "../generated/content";
import { ArticleList, ProjectCard } from "../components/ContentCards";
import styles from "../styles/Home.module.css";
export const Route = createFileRoute("/")({ component: Home });
function Home() {
  const blogs = entries.filter((x) => x.kind === "blog"),
    projects = entries.filter((x) => x.kind === "projects");
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className="eyebrow">
            <b>●</b> A DEVELOPER'S FIELD NOTES
          </span>
          <h1>
            保持好奇，
            <br />
            把想法
            <span className={styles.underline}>
              写成现实
              <svg viewBox="0 0 300 12" aria-hidden="true">
                <path d="M3 9 Q140 -3 297 7" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
            </span>
            <span className={styles.period}>.</span>
          </h1>
          <p>
            你好，这里是新手程序员。
            <br />
            记录编程路上的思考与实践，分享从零到一的作品。
            <br />
            不急着成为专家，先认真做好每一次尝试。
          </p>
          <div className={styles.heroButtons}>
            <a href="/blog" className="button primary">
              开始阅读
              <ArrowUpRight size={16} />
            </a>
            <a href="/projects" className="button">
              探索项目
              <ArrowRight size={16} />
            </a>
          </div>
          <div className={styles.heroNote}>
            <span />
            持续学习中 <span className={styles.noteDivider}>/</span> ALWAYS A BEGINNER
          </div>
        </div>
        <div className={styles.heroArt} aria-label="从想法到构建的开发手记">
          <div className={styles.artTop}>
            <span>THE MAKING OF THINGS</span>
            <span>NO. 001 ↗</span>
          </div>
          <div className={styles.orbit}>
            <div className={styles.orbitInner} />
            <div className={styles.artIcon}>
              {"{ "}
              <span>*</span>
              {" }"}
            </div>
            <span className={styles.orbitDot} />
          </div>
          <div className={styles.artText}>
            Small steps.
            <br />
            Real things.
          </div>
          <div className={styles.artBottom}>
            <span>一行代码，一个新的可能。</span>
            <ArrowUpRight size={26} />
          </div>
          <div className={styles.floating}>
            <Terminal size={15} />
            <code>
              hello, possibilities<span>_</span>
            </code>
          </div>
        </div>
      </section>
      <div className={styles.divider}>
        <span>LEARN. BUILD. SHARE.</span>
        <div />
        <span>从这里，继续向前 ↓</span>
      </div>
      <section className={styles.contentGrid}>
        <div>
          <div className="sectionHeading">
            <h2>
              最近在写<span className={styles.sectionLabel}> / JOURNAL</span>
            </h2>
            <a href="/blog">
              全部文章
              <ArrowUpRight size={14} />
            </a>
          </div>
          <ArticleList items={blogs.slice(0, 3)} />
        </div>
        <aside>
          <div className="sectionHeading">
            <h2>
              正在构建<span className={styles.sectionLabel}> / WORK</span>
            </h2>
            <a href="/projects" aria-label="全部项目">
              <ArrowUpRight size={16} />
            </a>
          </div>
          {projects[0] && <ProjectCard item={projects[0]} />}
        </aside>
      </section>
      <section className={styles.bottomGrid}>
        <a href="/docs" className={styles.docsCard}>
          <span className={styles.cardIcon}>
            <BookOpen size={23} />
          </span>
          <div>
            <span className="eyebrow">BUILD WITH CONTEXT</span>
            <h2>好项目，也需要好文档。</h2>
            <p>从快速开始到实现细节，少一点摸索，多一点理解。</p>
          </div>
          <ArrowUpRight size={22} />
        </a>
        <div className={styles.connect}>
          <Sprout size={23} />
          <h3>一起，慢慢成长。</h3>
          <p>保持开放，分享所学。</p>
          <div>
            <a href="https://github.com/potato47/semicoder">
              <GitFork size={16} />
              GitHub ↗
            </a>
            <a href="/rss.xml">
              <Rss size={16} />
              RSS ↗
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
