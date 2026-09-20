import { z } from "zod";
import type { Actor } from "./auth";
import { AppError, rateLimit } from "./security";
export const bodySchema = z.string().trim().min(1, "请输入评论").max(3000, "评论最多 3000 字");
export const createSchema = z.object({
  contentId: z.string().min(1),
  body: bodySchema,
  parentId: z.string().nullable().default(null),
  requestId: z.uuid(),
  token: z.string().min(1).max(2048),
});
export const editSchema = z.object({
  id: z.string(),
  body: bodySchema,
  version: z.number().int().positive(),
  token: z.string().min(1).max(2048),
});
export interface CommentRow {
  id: string;
  content_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  status: "pending" | "approved" | "hidden" | "deleted";
  version: number;
  created_at: number;
  updated_at: number;
  name: string;
}
export async function ensureMember(db: D1Database, actor: Actor | null): Promise<Actor> {
  if (!actor) throw new AppError("UNAUTHORIZED", "请先使用 GitHub 登录");
  await db
    .prepare("INSERT OR IGNORE INTO profile (user_id,trusted,banned) VALUES (?,0,0)")
    .bind(actor.id)
    .run();
  const p = await db
    .prepare("SELECT banned FROM profile WHERE user_id=?")
    .bind(actor.id)
    .first<{ banned: number }>();
  if (p?.banned) throw new AppError("FORBIDDEN", "此账号暂时无法参与讨论");
  return actor;
}
export async function ensureAdmin(db: D1Database, actor: Actor | null) {
  const member = await ensureMember(db, actor);
  if (!member.admin) throw new AppError("FORBIDDEN", "需要管理员权限");
  return member;
}
export async function listComments(
  db: D1Database,
  contentId: string,
  page = 0,
  actor: Actor | null = null,
) {
  const { results: roots } = await db
    .prepare(
      "SELECT c.*,u.name FROM comment c JOIN user u ON u.id=c.user_id WHERE c.content_id=? AND c.parent_id IS NULL AND c.status IN ('approved','deleted') ORDER BY c.created_at DESC,c.id DESC LIMIT 11 OFFSET ?",
    )
    .bind(contentId, page * 10)
    .all<CommentRow>();
  const visible = roots.slice(0, 10);
  let replies: CommentRow[] = [];
  if (visible.length) {
    const { results } = await db
      .prepare(
        `SELECT c.*,u.name FROM comment c JOIN user u ON u.id=c.user_id WHERE c.parent_id IN (${visible.map(() => "?").join(",")}) AND c.status IN ('approved','deleted') ORDER BY c.created_at,c.id`,
      )
      .bind(...visible.map((r) => r.id))
      .all<CommentRow>();
    replies = results;
  }
  const mine = actor
    ? (
        await db
          .prepare(
            "SELECT c.*,u.name FROM comment c JOIN user u ON u.id=c.user_id WHERE c.content_id=? AND c.user_id=? AND c.status='pending' ORDER BY c.created_at DESC LIMIT 50",
          )
          .bind(contentId, actor.id)
          .all<CommentRow>()
      ).results
    : [];
  return { roots: visible, replies, mine, hasMore: roots.length > 10 };
}
export async function createComment(
  db: D1Database,
  actor: Actor | null,
  input: z.infer<typeof createSchema>,
  validate: () => Promise<void>,
) {
  const member = await ensureMember(db, actor);
  const existing = await db
    .prepare(
      "SELECT id,status,content_id,body,parent_id FROM comment WHERE user_id=? AND request_id=?",
    )
    .bind(member.id, input.requestId)
    .first<{
      id: string;
      status: string;
      content_id: string;
      body: string;
      parent_id: string | null;
    }>();
  if (existing) {
    if (
      existing.content_id !== input.contentId ||
      existing.body !== input.body ||
      existing.parent_id !== input.parentId
    )
      throw new AppError("CONFLICT", "重复提交标识已被使用");
    return { id: existing.id, status: existing.status };
  }
  await rateLimit(db, `comment:${member.id}`, 5, 60);
  await validate();
  if (input.parentId) {
    const parent = await db
      .prepare(
        "SELECT id FROM comment WHERE id=? AND content_id=? AND parent_id IS NULL AND status IN ('approved','deleted')",
      )
      .bind(input.parentId, input.contentId)
      .first();
    if (!parent) throw new AppError("VALIDATION", "回复目标不存在或不可见");
  }
  const id = crypto.randomUUID(),
    now = Date.now();
  // The status and ban check are evaluated at INSERT time, not from stale client state.
  const row = await db
    .prepare(
      "INSERT INTO comment (id,content_id,user_id,parent_id,body,status,version,request_id,created_at,updated_at) SELECT ?,?,?,?,?,CASE WHEN trusted=1 THEN 'approved' ELSE 'pending' END,1,?,?,? FROM profile WHERE user_id=? AND banned=0 ON CONFLICT(user_id,request_id) DO NOTHING RETURNING id,status",
    )
    .bind(
      id,
      input.contentId,
      member.id,
      input.parentId,
      input.body,
      input.requestId,
      now,
      now,
      member.id,
    )
    .first<{ id: string; status: string }>();
  if (!row) throw new AppError("CONFLICT", "提交状态已变化，请刷新查看");
  return row;
}
export async function editComment(
  db: D1Database,
  actor: Actor | null,
  input: z.infer<typeof editSchema>,
  validate: () => Promise<void>,
) {
  const member = await ensureMember(db, actor);
  await rateLimit(db, `edit:${member.id}`, 10, 60);
  await validate();
  const result = await db
    .prepare(
      "UPDATE comment SET body=?,status='pending',version=version+1,updated_at=? WHERE id=? AND user_id=? AND version=? AND status IN ('approved','pending') AND NOT EXISTS (SELECT 1 FROM profile WHERE user_id=? AND banned=1) RETURNING id",
    )
    .bind(input.body, Date.now(), input.id, member.id, input.version, member.id)
    .first();
  if (!result) throw new AppError("CONFLICT", "无法编辑：评论已变化或不属于当前账号");
  return { ok: true };
}
export async function deleteComment(db: D1Database, actor: Actor | null, id: string) {
  const member = await ensureMember(db, actor);
  await rateLimit(db, `delete:${member.id}`, 20, 60);
  const result = await db
    .prepare(
      "UPDATE comment SET body='',status='deleted',version=version+1,updated_at=? WHERE id=? AND user_id=? AND status IN ('approved','pending') RETURNING id",
    )
    .bind(Date.now(), id, member.id)
    .first();
  if (!result) throw new AppError("FORBIDDEN", "无法删除此评论");
  return { ok: true };
}
export async function moderateComment(
  db: D1Database,
  actor: Actor | null,
  id: string,
  version: number,
  action: "approve" | "hide",
) {
  const member = await ensureAdmin(db, actor),
    now = Date.now();
  const status = action === "approve" ? "approved" : "hidden";
  const results = await db.batch([
    db
      .prepare(
        "UPDATE comment SET status=?,version=version+1,updated_at=? WHERE id=? AND version=? AND status!='deleted' AND NOT EXISTS (SELECT 1 FROM profile WHERE user_id=comment.user_id AND banned=1) RETURNING id",
      )
      .bind(status, now, id, version),
    db
      .prepare(
        "INSERT INTO audit(id,actor_id,action,target_id,created_at) SELECT ?,?,?,?,? WHERE changes()=1",
      )
      .bind(crypto.randomUUID(), member.id, action, id, now),
    db
      .prepare(
        "UPDATE profile SET trusted=1 WHERE user_id=(SELECT user_id FROM comment WHERE id=? AND status='approved' AND version=?) AND ?='approve'",
      )
      .bind(id, version + 1, action),
  ]);
  if (!results[0].results.length) throw new AppError("CONFLICT", "评论已被更新，请刷新后重新审核");
  return { ok: true };
}
export async function banUser(
  db: D1Database,
  actor: Actor | null,
  userId: string,
  banned: boolean,
) {
  const member = await ensureAdmin(db, actor);
  if (member.id === userId) throw new AppError("VALIDATION", "不能封禁自己的账号");
  const target = await db.prepare("SELECT id FROM user WHERE id=?").bind(userId).first();
  if (!target) throw new AppError("VALIDATION", "用户不存在");
  await db.batch([
    db
      .prepare(
        "INSERT INTO profile(user_id,trusted,banned) VALUES(?,0,?) ON CONFLICT(user_id) DO UPDATE SET banned=excluded.banned,trusted=0",
      )
      .bind(userId, banned ? 1 : 0),
    db
      .prepare(
        "UPDATE comment SET status='hidden',version=version+1,updated_at=? WHERE user_id=? AND status IN ('approved','pending') AND ?=1",
      )
      .bind(Date.now(), userId, banned ? 1 : 0),
    db
      .prepare("INSERT INTO audit(id,actor_id,action,target_id,created_at) VALUES(?,?,?,?,?)")
      .bind(crypto.randomUUID(), member.id, banned ? "ban" : "unban", userId, Date.now()),
  ]);
  return { ok: true };
}
export async function adminData(db: D1Database, actor: Actor | null, page = 0) {
  await ensureAdmin(db, actor);
  const [comments, users, audits, stats] = await Promise.all([
    db
      .prepare(
        "SELECT c.*,u.name FROM comment c JOIN user u ON c.user_id=u.id WHERE status!='deleted' ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END,c.created_at DESC LIMIT 30 OFFSET ?",
      )
      .bind(page * 30)
      .all<CommentRow>(),
    db
      .prepare(
        "SELECT u.id,u.name,COALESCE(p.banned,0) AS banned,COALESCE(p.trusted,0) AS trusted FROM user u LEFT JOIN profile p ON u.id=p.user_id ORDER BY u.created_at DESC LIMIT 30 OFFSET ?",
      )
      .bind(page * 30)
      .all<{ id: string; name: string; banned: number; trusted: number }>(),
    db
      .prepare(
        "SELECT a.*,u.name FROM audit a LEFT JOIN user u ON a.actor_id=u.id ORDER BY a.created_at DESC LIMIT 30 OFFSET ?",
      )
      .bind(page * 30)
      .all<{ id: string; name: string; action: string; target_id: string; created_at: number }>(),
    db
      .prepare("SELECT status,COUNT(*) AS count FROM comment GROUP BY status")
      .all<{ status: string; count: number }>(),
  ]);
  return {
    comments: comments.results,
    users: users.results,
    audits: audits.results,
    stats: stats.results,
  };
}
