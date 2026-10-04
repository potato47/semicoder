import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { getAdminData, moderate, setUserBan } from "../server/functions";
import { useSessionInfo, unwrap, signIn } from "../lib/client";
import { entries } from "../generated/catalog";
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "管理后台 · 新手程序员" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: Admin,
});
function Admin() {
  const { data: session } = useSessionInfo(),
    queryClient = useQueryClient();
  const [page, setPage] = useState(0),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [tab, setTab] = useState("comments");
  const query = useQuery({
    queryKey: ["admin", page, session?.actor?.id],
    queryFn: async () => unwrap(await getAdminData({ data: { page } })),
    enabled: !!session?.actor?.admin,
    retry: false,
  });
  async function act(fn: () => Promise<unknown>) {
    setBusy(true);
    setMessage("");
    try {
      await fn();
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
      await queryClient.invalidateQueries({ queryKey: ["comments"] });
      setMessage("操作已保存");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    } finally {
      setBusy(false);
    }
  }
  if (!session?.actor)
    return (
      <div className="empty">
        <span className="eyebrow">ADMINISTRATION</span>
        <h1>管理后台</h1>
        <p>
          {session?.configured
            ? "请使用管理员 GitHub 账号登录。"
            : "GitHub 登录尚未配置，请先完成部署环境设置。"}
        </p>
        <button
          className="button primary"
          disabled={!session?.configured}
          onClick={() => signIn().catch(() => setMessage("登录失败"))}
        >
          GitHub 登录
        </button>
        {message && <p role="alert">{message}</p>}
      </div>
    );
  if (!session.actor.admin)
    return (
      <div className="empty">
        <h1>无权访问</h1>
        <p>此页面仅对站点管理员开放。</p>
        <Link className="button" to="/">
          返回首页
        </Link>
      </div>
    );
  return (
    <>
      <div className="pageIntro">
        <span className="eyebrow">ADMINISTRATION</span>
        <h1>让交流保持有序。</h1>
        <p>评论审核、用户管理与操作记录。</p>
      </div>
      <div className="row" style={{ marginBottom: 25 }}>
        {query.data?.stats.map((s) => (
          <span className="tag" key={s.status}>
            {s.status} · {s.count}
          </span>
        ))}
      </div>
      <div className="row" style={{ marginBottom: 25 }}>
        {[
          { id: "comments", label: "评论审核" },
          { id: "users", label: "用户管理" },
          { id: "audit", label: "审核记录" },
        ].map((t) => (
          <button
            key={t.id}
            className={`button ${tab === t.id ? "primary" : ""}`}
            onClick={() => {
              setTab(t.id);
              setPage(0);
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {message && (
        <output className="notice" style={{ display: "block" }}>
          {message}
        </output>
      )}
      {query.isError && (
        <p className="notice" role="alert">
          {query.error.message}{" "}
          <button className="button small" onClick={() => query.refetch()}>
            重试
          </button>
        </p>
      )}
      {query.isLoading && <p>正在加载…</p>}
      {tab === "comments" &&
        query.data?.comments.map((c) => (
          <article
            key={c.id}
            style={{
              padding: 25,
              border: "1px solid var(--line)",
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <div className="row">
              <strong>{c.name}</strong>
              <span className="tag">{c.status}</span>
              <a href={entries.find((x) => x.id === c.content_id)?.path ?? "/"} className="muted">
                {entries.find((x) => x.id === c.content_id)?.title ?? c.content_id}
              </a>
            </div>
            <div className="prose">
              <ReactMarkdown skipHtml disallowedElements={["img"]}>
                {c.body}
              </ReactMarkdown>
            </div>
            <div className="row">
              <button
                className="button small"
                disabled={busy || c.status === "approved"}
                onClick={() =>
                  act(async () =>
                    unwrap(
                      await moderate({ data: { id: c.id, version: c.version, action: "approve" } }),
                    ),
                  )
                }
              >
                通过
              </button>
              <button
                className="button small"
                disabled={busy || c.status === "hidden"}
                onClick={() =>
                  act(async () =>
                    unwrap(
                      await moderate({ data: { id: c.id, version: c.version, action: "hide" } }),
                    ),
                  )
                }
              >
                隐藏
              </button>
            </div>
          </article>
        ))}
      {tab === "users" &&
        query.data?.users.map((u) => (
          <div
            key={u.id}
            className="row"
            style={{
              justifyContent: "space-between",
              padding: 20,
              borderBottom: "1px solid var(--line)",
            }}
          >
            <div>
              <strong>{u.name}</strong>
              <p className="muted" style={{ fontSize: 12, margin: "8px 0" }}>
                {u.banned ? "已封禁" : u.trusted ? "已通过首次审核" : "尚未通过首次审核"}
              </p>
            </div>
            <button
              className="button small"
              disabled={busy || u.id === session.actor?.id}
              onClick={() => {
                if (window.confirm(`${u.banned ? "解除封禁" : "封禁"} ${u.name}？`))
                  void act(async () =>
                    unwrap(await setUserBan({ data: { id: u.id, banned: !u.banned } })),
                  );
              }}
            >
              {u.banned ? "解除封禁" : "封禁"}
            </button>
          </div>
        ))}
      {tab === "audit" &&
        query.data?.audits.map((a) => (
          <p className="notice" key={a.id}>
            {new Date(a.created_at).toLocaleString("zh-CN")} · {a.name} · {a.action} · {a.target_id}
          </p>
        ))}
      <div className="row" style={{ marginTop: 30 }}>
        <button
          className="button small"
          disabled={!page || busy}
          onClick={() => setPage((p) => p - 1)}
        >
          上一页
        </button>
        <span>第 {page + 1} 页</span>
        <button
          className="button small"
          disabled={
            busy ||
            !query.data ||
            (tab === "comments"
              ? query.data.comments
              : tab === "users"
                ? query.data.users
                : query.data.audits
            ).length < 30
          }
          onClick={() => setPage((p) => p + 1)}
        >
          下一页
        </button>
      </div>
    </>
  );
}
