import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link, useMatches, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Sun,
  Moon,
  Menu,
  X,
  ArrowUpRight,
  GitFork,
  Rss,
  LogOut,
  UserRound,
  Settings,
} from "lucide-react";
import { authClient, signIn, useSessionInfo } from "../lib/client";
import type { Actor } from "../server/auth";
import styles from "./Shell.module.css";
export function Shell({ children }: { children: ReactNode }) {
  const matches = useMatches();
  const inProject = matches.some((match) => match.routeId === "/$project");
  const router = useRouter();
  const focusLogin = useRef(false);
  const [open, setOpen] = useState<"nav" | "account" | null>(null),
    [loginError, setLoginError] = useState("");
  const { data: session } = useSessionInfo();
  useEffect(() => router.subscribe("onBeforeNavigate", () => setOpen(null)), [router]);
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
          <strong>新手程序员</strong>
        </Link>
        <nav
          id="primary-navigation"
          className={`${styles.nav} ${open === "nav" ? styles.open : ""}`}
          aria-label="主导航"
        >
          {(
            [
              { to: "/", label: "首页" },
              { to: "/blog", label: "博客" },
              { to: "/projects", label: "项目" },
              { to: "/about", label: "关于" },
            ] as const
          ).map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={n.to === "/projects" && inProject ? styles.active : undefined}
              aria-current={n.to === "/projects" && inProject ? "page" : undefined}
              onClick={() => setOpen(null)}
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
            <AccountMenu
              key={session.actor.id}
              actor={session.actor}
              open={open === "account"}
              onToggle={() => setOpen(open === "account" ? null : "account")}
              onClose={() => setOpen(null)}
              onSignedOut={() => {
                focusLogin.current = true;
                setOpen(null);
              }}
            />
          ) : (
            <button
              ref={(node) => {
                if (node && focusLogin.current) {
                  focusLogin.current = false;
                  node.focus();
                }
              }}
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
            onClick={() => setOpen(open === "nav" ? null : "nav")}
            aria-label={open === "nav" ? "关闭导航" : "打开导航"}
            aria-expanded={open === "nav"}
            aria-controls="primary-navigation"
          >
            {open === "nav" ? <X size={20} /> : <Menu size={20} />}
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

function AccountMenu({
  actor,
  open,
  onToggle,
  onClose,
  onSignedOut,
}: {
  actor: Actor;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSignedOut: () => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const query = useQueryClient();
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const initial = Array.from(actor.name.trim())[0]?.toUpperCase();

  useEffect(() => {
    if (!open) return;
    function dismiss(event: PointerEvent) {
      if (event.target instanceof Node && !container.current?.contains(event.target)) onClose();
    }
    function escape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
      trigger.current?.focus();
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open, onClose]);

  async function logout() {
    if (pending) return;
    // Keep focus inside the disclosure before disabling its focused action.
    trigger.current?.focus();
    setPending(true);
    setError("");
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Sign out failed");
    } catch {
      setError("退出失败，请重试");
      setPending(false);
      return;
    }
    query.setQueryData<ReturnType<typeof useSessionInfo>["data"]>(["session"], (current) =>
      current ? { ...current, actor: null } : current,
    );
    onSignedOut();
    await query.invalidateQueries();
  }

  return (
    <div
      ref={container}
      className={styles.account}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onClose();
      }}
    >
      <button
        ref={trigger}
        className={styles.avatar}
        aria-label="账号菜单"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        {actor.image && actor.image !== failedImage ? (
          <img src={actor.image} alt="" onError={() => setFailedImage(actor.image)} />
        ) : initial ? (
          <span aria-hidden="true">{initial}</span>
        ) : (
          <UserRound size={18} aria-hidden="true" />
        )}
      </button>
      {open && (
        <div id={panelId} className={styles.accountPanel}>
          <p className={styles.accountName}>{actor.name.trim() || "当前用户"}</p>
          {actor.admin && (
            <Link to="/admin" className={styles.accountAction} onClick={onClose}>
              <Settings size={16} />
              管理后台
            </Link>
          )}
          <button className={styles.accountAction} onClick={logout} disabled={pending}>
            <LogOut size={16} />
            {pending ? "正在退出…" : "退出登录"}
          </button>
          {error && (
            <p className={styles.accountError} role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
