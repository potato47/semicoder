import { useState, type ReactNode } from "react";
import { Link, useMatches } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Sun, Moon, Menu, X, ArrowUpRight, GitFork, Rss, LogOut } from "lucide-react";
import { authClient, signIn, useSessionInfo } from "../lib/client";
import styles from "./Shell.module.css";
export function Shell({ children }: { children: ReactNode }) {
  const matches = useMatches();
  const inDocs = matches.some((match) => match.routeId === "/$project/docs");
  const inProject = matches.some((match) => match.routeId === "/$project");
  const [open, setOpen] = useState(false),
    [loginError, setLoginError] = useState("");
  const { data: session } = useSessionInfo();
  const query = useQueryClient();
  function toggleTheme() {
    const value = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = value;
    try {
      localStorage.setItem("theme", value);
    } catch {
      /* Theme still works when storage is unavailable. */
    }
  }
  async function login() {
    try {
      setLoginError("");
      await signIn();
    } catch {
      setLoginError("登录暂时不可用，请稍后重试");
    }
  }
  return (
    <>
      <a className="skip" href="#main">
        跳到正文
      </a>
      <header className={styles.header}>
        <Link className={styles.brand} to="/" aria-label="新手程序员首页">
          <span className={styles.logo}>
            s<span>_</span>
          </span>
          <span>
            <strong>
              SEMICODER<span className={styles.dot}>.</span>
            </strong>
            <small>新手程序员</small>
          </span>
        </Link>
        <nav className={`${styles.nav} ${open ? styles.open : ""}`} aria-label="主导航">
          {(
            [
              { to: "/", label: "首页" },
              { to: "/blog", label: "博客" },
              { to: "/projects", label: "项目" },
              { to: "/docs", label: "文档" },
              { to: "/about", label: "关于" },
            ] as const
          ).map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={
                (n.to === "/docs" && inDocs) || (n.to === "/projects" && inProject && !inDocs)
                  ? styles.active
                  : undefined
              }
              aria-current={
                (n.to === "/docs" && inDocs) || (n.to === "/projects" && inProject && !inDocs)
                  ? "page"
                  : undefined
              }
              onClick={() => setOpen(false)}
              activeOptions={{ exact: n.to === "/" }}
              activeProps={{ className: styles.active }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className={styles.actions}>
          <Link to="/search" className="iconButton" aria-label="搜索">
            <Search size={19} />
          </Link>
          <button className="iconButton" onClick={toggleTheme} aria-label="切换浅色或深色主题">
            <Sun className="sun" size={19} />
            <Moon className="moon" size={19} />
          </button>
          {session?.actor ? (
            <>
              <a className={styles.account} href={session.actor.admin ? "/admin" : "/about"}>
                {session.actor.name}
              </a>
              <button
                className={styles.login}
                aria-label="退出登录"
                onClick={async () => {
                  await authClient.signOut();
                  await query.invalidateQueries();
                }}
              >
                <LogOut size={15} />
                退出
              </button>
            </>
          ) : (
            <button
              className={styles.login}
              onClick={login}
              aria-label="使用 GitHub 登录"
              disabled={!session?.configured}
              title={session?.configured ? "使用 GitHub 登录" : "GitHub 登录尚未配置"}
            >
              <GitFork size={15} />
              登录
            </button>
          )}
          <button
            className={`${styles.menu} iconButton`}
            onClick={() => setOpen(!open)}
            aria-label={open ? "关闭导航" : "打开导航"}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>
      {loginError && (
        <p role="alert" className="notice">
          {loginError}
        </p>
      )}
      <main id="main" className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div>
            <Link to="/" className={styles.footerBrand}>
              保持好奇，认真构建<span>↗</span>
            </Link>
            <p>代码是一种表达。这里记录思考，也分享过程。</p>
          </div>
          <a href="/rss.xml" className="button">
            <Rss size={16} />
            订阅更新
            <ArrowUpRight size={15} />
          </a>
        </div>
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} 新手程序员 · semicoder.dev</span>
          <div>
            <a href="https://github.com/potato47/semicoder">GitHub ↗</a>
            <Link to="/privacy">隐私</Link>
            <Link to="/rules">评论规则</Link>
            <Link to="/admin">管理</Link>
          </div>
          <span className={styles.built}>
            用热爱构建 <span>●</span>
          </span>
        </div>
      </footer>
    </>
  );
}
