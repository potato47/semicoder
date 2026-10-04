import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, ArrowRight, Code2, Terminal, GitFork, Rss, Sprout } from "lucide-react";
import { entries } from "../generated/catalog";
import { ArticleList, ProjectCard } from "../components/ContentCards";
import styles from "../styles/Home.module.css";
export const Route = createFileRoute("/")({ component: Home });
function Home() {
  const blogs = entries.filter((x) => x.kind === "blog"),
    projects = entries.filter((x) => x.kind === "projects");
  const featured = projects.filter((project) => project.featured);
  const otherProject = projects.find((project) => !project.featured);
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
            从 FIA 桌面框架，到麻辣烫插件应用，
            <br />
            把想法做成工具，也把过程写成文档。
          </p>
          <div className={styles.heroButtons}>
            <Link to="/projects" className="button primary">
              探索项目
              <ArrowUpRight size={16} />
            </Link>
            <Link to="/blog" className="button">
              阅读博客
              <ArrowRight size={16} />
            </Link>
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
      <section className={styles.featured} aria-labelledby="featured-projects">
        <div className="sectionHeading">
          <h2 id="featured-projects">
            正在构建<span className={styles.sectionLabel}> / FRAMEWORK & APPS</span>
          </h2>
          <Link to="/projects">
            全部项目
            <ArrowUpRight size={14} />
          </Link>
        </div>
        <p className={styles.projectIntro}>
          FIA 提供桌面应用的基础，麻辣烫用插件把模型能力变成日常工具。
        </p>
        <div className={styles.featuredGrid}>
          {featured.map((project) => (
            <ProjectCard key={project.id} item={project} />
          ))}
        </div>
      </section>
      <section className={styles.contentGrid}>
        <div>
          <div className="sectionHeading">
            <h2>
              最近在写<span className={styles.sectionLabel}> / JOURNAL</span>
            </h2>
            <Link to="/blog">
              全部文章
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <ArticleList items={blogs.slice(0, 3)} />
        </div>
        <aside>
          <div className="sectionHeading">
            <h2>
              关于本站<span className={styles.sectionLabel}> / THIS SITE</span>
            </h2>
            <Link to="/projects" aria-label="全部项目">
              <ArrowUpRight size={16} />
            </Link>
          </div>
          {otherProject && <ProjectCard item={otherProject} />}
        </aside>
      </section>
      <section className={styles.bottomGrid}>
        <Link to="/projects" className={styles.projectCta}>
          <span className={styles.cardIcon}>
            <Code2 size={23} />
          </span>
          <div>
            <span className="eyebrow">BUILD WITH CONTEXT</span>
            <h2>从一个项目，开始动手。</h2>
            <p>了解设计、阅读文档，找到适合你的安装方式。</p>
          </div>
          <ArrowUpRight size={22} />
        </Link>
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
