import { useState, useRef, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageSquare, GitFork } from "lucide-react";
import { useSessionInfo, useMounted, unwrap, signIn } from "../lib/client";
import { getComments, postComment, updateComment, removeComment } from "../server/functions";
import type { CommentRow } from "../server/comments";
import { Turnstile } from "./Turnstile";
import styles from "./Comments.module.css";
export function Comments({ contentId }: { contentId: string }) {
  const mounted = useMounted(),
    { data: session } = useSessionInfo(),
    queryClient = useQueryClient();
  const [page, setPage] = useState(0),
    [body, setBody] = useState(""),
    [token, setToken] = useState(""),
    [widget, setWidget] = useState(0),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const [reply, setReply] = useState<CommentRow | null>(null),
    [editing, setEditing] = useState<CommentRow | null>(null);
  const requestId = useRef<string | null>(null);
  const comments = useQuery({
    queryKey: ["comments", contentId, page, session?.actor?.id],
    queryFn: async () => unwrap(await getComments({ data: { contentId, page } })),
    enabled: mounted,
    retry: false,
  });
  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["comments", contentId] });
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || !token) return;
    setBusy(true);
    setMessage("");
    try {
      requestId.current ??= crypto.randomUUID();
      if (editing)
        unwrap(
          await updateComment({ data: { id: editing.id, version: editing.version, body, token } }),
        );
      else
        unwrap(
          await postComment({
            data: {
              contentId,
              body,
              parentId: reply?.id ?? null,
              requestId: requestId.current,
              token,
            },
          }),
        );
      setBody("");
      setReply(null);
      setEditing(null);
      requestId.current = null;
      setMessage("评论已提交。待审核内容通过后会公开展示。");
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "提交失败，请稍后重试");
    } finally {
      setBusy(false);
      setToken("");
      setWidget((x) => x + 1);
    }
  }
  async function remove(id: string) {
    if (!window.confirm("删除这条评论？已有回复将保留。")) return;
    setMessage("");
    try {
      unwrap(await removeComment({ data: { id } }));
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "删除失败");
    }
  }
  function renderComment(c: CommentRow, child = false) {
    const own = c.user_id === session?.actor?.id;
    return (
      <article className={`${styles.comment} ${child ? styles.reply : ""}`} key={c.id}>
        <div className={styles.commentHead}>
          <span className={styles.avatar}>{c.name.slice(0, 1).toUpperCase()}</span>
          <strong>{c.name}</strong>
          <time>{new Date(c.created_at).toLocaleDateString("zh-CN")}</time>
          {c.status === "pending" && <span className="tag">待审核 · 仅你可见</span>}
        </div>
        {c.status === "deleted" ? (
          <p className="muted">此评论已删除</p>
        ) : (
          <div className={`${styles.markdown} prose`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              skipHtml
              disallowedElements={["img"]}
              components={{
                a: ({ children, ...props }) => (
                  <a {...props} rel="nofollow ugc noreferrer">
                    {children}
                  </a>
                ),
              }}
            >
              {c.body}
            </ReactMarkdown>
          </div>
        )}
        <div className={styles.commentActions}>
          {session?.actor && !child && c.status !== "pending" && (
            <button
              onClick={() => {
                setReply(c);
                setEditing(null);
                setBody("");
                requestId.current = null;
              }}
            >
              回复
            </button>
          )}
          {own && c.status !== "deleted" && (
            <>
              <button
                onClick={() => {
                  setEditing(c);
                  setReply(null);
                  setBody(c.body);
                  requestId.current = null;
                }}
              >
                编辑
              </button>
              <button onClick={() => remove(c.id)}>删除</button>
            </>
          )}
        </div>
      </article>
    );
  }
  return (
    <section className={styles.section} aria-label="评论">
      <div className="sectionHeading">
        <h2>
          <MessageSquare size={21} /> 一起讨论
        </h2>
        <a href="/rules">评论规则 ↗</a>
      </div>
      <p className={styles.hint}>分享你的想法，让每一次交流都有收获。</p>
      {comments.isError ? (
        <div className="notice">
          评论暂时无法加载，正文不受影响。
          <button className="button small" onClick={() => comments.refetch()}>
            重试
          </button>
        </div>
      ) : comments.data?.roots.length ? (
        <>
          {comments.data.roots.map((c) => (
            <div key={c.id}>
              {renderComment(c)}
              {comments.data.replies
                .filter((r) => r.parent_id === c.id)
                .map((r) => renderComment(r, true))}
            </div>
          ))}
          <div className="row">
            <button className="button small" disabled={!page} onClick={() => setPage((p) => p - 1)}>
              上一页
            </button>
            <span className="muted">第 {page + 1} 页</span>
            <button
              className="button small"
              disabled={!comments.data.hasMore}
              onClick={() => setPage((p) => p + 1)}
            >
              下一页
            </button>
          </div>
        </>
      ) : (
        <p className={styles.empty}>还没有公开评论。欢迎留下第一个想法。</p>
      )}
      {!!comments.data?.mine.length && (
        <div className={styles.pending}>{comments.data.mine.map((c) => renderComment(c))}</div>
      )}
      {!session?.actor ? (
        <div className={styles.login}>
          <GitFork size={24} />
          <div>
            <strong>用 GitHub 加入讨论</strong>
            <p>
              {session?.configured
                ? "首次评论审核通过后会公开显示。"
                : "评论功能正在准备中，你可以先阅读和浏览内容。"}
            </p>
          </div>
          <button
            className="button small"
            disabled={!session?.configured}
            onClick={() => signIn().catch(() => setMessage("登录暂时不可用"))}
          >
            登录参与
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className={styles.form}>
          <label htmlFor={`comment-${contentId}`}>
            {editing ? "编辑评论（将重新审核）" : reply ? `回复 ${reply.name}` : "写下你的想法"}
          </label>
          {(reply || editing) && (
            <button
              type="button"
              className="button small"
              onClick={() => {
                setReply(null);
                setEditing(null);
                setBody("");
                requestId.current = null;
              }}
            >
              取消
            </button>
          )}
          <textarea
            id={`comment-${contentId}`}
            className="field"
            rows={5}
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              requestId.current = null;
            }}
            minLength={1}
            maxLength={3000}
            required
            placeholder="支持 Markdown。请友善交流，不要发布个人敏感信息。"
          />
          <div className={styles.formFooter}>
            <span>{body.length} / 3000</span>
            <button className="button primary" disabled={busy || !token || !body.trim()}>
              {busy ? "正在提交…" : "提交评论 ↗"}
            </button>
          </div>
          {session.turnstileSiteKey ? (
            <Turnstile key={widget} siteKey={session.turnstileSiteKey} onToken={setToken} />
          ) : (
            <p className="notice">评论安全验证尚未配置，暂时无法提交。</p>
          )}
        </form>
      )}
      {message && (
        <output className="notice" style={{ display: "block" }}>
          {message}
        </output>
      )}
    </section>
  );
}
