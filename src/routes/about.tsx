import { Link, createFileRoute } from "@tanstack/react-router";
import { seo } from "../lib/seo";
export const Route = createFileRoute("/about")({
  head: () => seo("关于", "保持好奇，认真构建。认识新手程序员。", "/about"),
  component: () => (
    <>
      <div className="pageIntro">
        <span className="eyebrow">ALWAYS A BEGINNER</span>
        <h1>做一个永远好奇的新手。</h1>
        <p>新手程序员 · SEMICODER.DEV</p>
      </div>
      <article className="prose" style={{ maxWidth: 740 }}>
        <p>
          这里是一份持续生长的开发手记。记录学习中的思考，分享动手做出来的作品，也为每个项目留下可以循迹的文档。
        </p>
        <h2>为什么叫「新手程序员」？</h2>
        <p>
          技术总在变化。保留新手的好奇心，承认不知道的事，认真完成每一次尝试——这是这个网站想坚持的节奏。
        </p>
        <h2>在这里，你可以找到</h2>
        <ul>
          <li>
            <Link to="/blog">博客</Link>：学习笔记、技术实践与工程思考。
          </li>
          <li>
            <Link to="/projects">项目</Link>：从想法到作品的构建过程。
          </li>
          <li>
            <Link to="/docs">文档</Link>：让使用和理解项目更容易。
          </li>
        </ul>
        <p className="notice">
          网站正在建设中。标有「示例」的内容用于展示阅读与发布流程，将逐步替换为真实的文章与项目介绍。
        </p>
        <p>
          <a href="https://github.com/potato47/semicoder">在 GitHub 查看这个网站 ↗</a> ·{" "}
          <a href="/rss.xml">通过 RSS 订阅</a>
        </p>
      </article>
    </>
  ),
});
