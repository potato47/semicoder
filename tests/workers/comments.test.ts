/// <reference types="@cloudflare/vitest-plugin/types" />
import { env } from "cloudflare:workers";
import { applyD1Migrations, reset } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";
import { makeSignature } from "better-auth/crypto";
import * as service from "../../src/server/comments";
import { rateLimit, verifyTurnstile } from "../../src/server/security";
import { resolveActor, getAuth, type Actor } from "../../src/server/auth";
import type { AppEnv } from "../../src/server/env";
const bindings = env as unknown as {
  DB: D1Database;
  TEST_MIGRATIONS: { name: string; queries: string[] }[];
};
const db = bindings.DB;
const owner: Actor = { id: "owner", name: "管理员", admin: true };
const alice: Actor = { id: "alice", name: "Alice", admin: false };
const bob: Actor = { id: "bob", name: "Bob", admin: false };
const valid = async () => {};
const settings: AppEnv = {
  DB: db,
  ASSETS: {} as Fetcher,
  SITE_URL: "http://localhost:3000",
  APP_ENV: "development",
  TURNSTILE_SITE_KEY: "test",
  TURNSTILE_SECRET_KEY: "test",
  BETTER_AUTH_SECRET: "test-only-secret-at-least-thirty-two-characters-12345",
  GITHUB_CLIENT_ID: "test-client",
  GITHUB_CLIENT_SECRET: "test-secret",
  ADMIN_GITHUB_IDS: "99",
};
const input = (more: Partial<Parameters<typeof service.createComment>[2]> = {}) => ({
  contentId: "blog-start-small",
  body: "一条评论",
  parentId: null,
  requestId: crypto.randomUUID(),
  token: "valid",
  ...more,
});
beforeEach(async () => {
  await reset();
  await applyD1Migrations(db, bindings.TEST_MIGRATIONS);
  for (const actor of [owner, alice, bob]) {
    await db
      .prepare(
        "INSERT INTO user(id,name,email,email_verified,created_at,updated_at) VALUES(?,?,?,1,?,?)",
      )
      .bind(actor.id, actor.name, `${actor.id}@example.test`, Date.now(), Date.now())
      .run();
  }
});
describe("实际 Workers / D1 评论生命周期", () => {
  it("首次待审、通过后直发、编辑重新审核且不会泄露待审正文", async () => {
    const first = await service.createComment(db, alice, input(), valid);
    expect(first.status).toBe("pending");
    expect((await service.listComments(db, "blog-start-small")).roots).toHaveLength(0);
    expect((await service.listComments(db, "blog-start-small", 0, alice)).mine).toHaveLength(1);
    expect((await service.listComments(db, "blog-start-small", 0, bob)).mine).toHaveLength(0);
    await service.moderateComment(db, owner, first.id, 1, "approve");
    expect((await service.createComment(db, alice, input({ body: "第二条" }), valid)).status).toBe(
      "approved",
    );
    await service.editComment(
      db,
      alice,
      { id: first.id, version: 2, body: "修改后", token: "valid" },
      valid,
    );
    expect(
      (await service.listComments(db, "blog-start-small")).roots.some((x) => x.id === first.id),
    ).toBe(false);
  });
  it("拒绝越权修改、删除、审核和匿名写入", async () => {
    const c = await service.createComment(db, alice, input(), valid);
    await expect(
      service.editComment(db, bob, { id: c.id, body: "越权", version: 1, token: "valid" }, valid),
    ).rejects.toThrow();
    await expect(service.deleteComment(db, bob, c.id)).rejects.toThrow();
    await expect(service.moderateComment(db, alice, c.id, 1, "approve")).rejects.toThrow("管理员");
    await expect(service.createComment(db, null, input(), valid)).rejects.toThrow("登录");
  });
  it("防止跨内容和多层回复，删除父评论保留已批准回复", async () => {
    const root = await service.createComment(db, alice, input(), valid);
    await service.moderateComment(db, owner, root.id, 1, "approve");
    const reply = await service.createComment(db, bob, input({ parentId: root.id }), valid);
    await service.moderateComment(db, owner, reply.id, 1, "approve");
    await expect(
      service.createComment(db, bob, input({ parentId: root.id, contentId: "another" }), valid),
    ).rejects.toThrow();
    await expect(
      service.createComment(db, bob, input({ parentId: reply.id }), valid),
    ).rejects.toThrow();
    await service.deleteComment(db, alice, root.id);
    const list = await service.listComments(db, "blog-start-small");
    expect(list.roots[0].body).toBe("");
    expect(list.roots[0].status).toBe("deleted");
    expect(list.replies).toHaveLength(1);
  });
  it("重复提交幂等、请求标识不可挪作他用", async () => {
    const data = input();
    const first = await service.createComment(db, alice, data, valid);
    const again = await service.createComment(db, alice, data, async () => {
      throw new Error("不能重复消费 Turnstile");
    });
    expect(again.id).toBe(first.id);
    await expect(
      service.createComment(db, alice, { ...data, body: "changed" }, valid),
    ).rejects.toThrow("重复");
  });
  it("并发版本检查阻止审核过期正文", async () => {
    const c = await service.createComment(db, alice, input(), valid);
    await service.editComment(
      db,
      alice,
      { id: c.id, body: "已修改", version: 1, token: "valid" },
      valid,
    );
    await expect(service.moderateComment(db, owner, c.id, 1, "approve")).rejects.toThrow("更新");
    expect(
      (
        await db
          .prepare("SELECT trusted FROM profile WHERE user_id='alice'")
          .first<{ trusted: number }>()
      )?.trusted,
    ).toBe(0);
    expect((await db.prepare("SELECT COUNT(*) AS n FROM audit").first<{ n: number }>())?.n).toBe(0);
  });
  it("封禁隐藏评论并阻止写入，解除封禁不自动恢复信任", async () => {
    const c = await service.createComment(db, alice, input(), valid);
    await service.moderateComment(db, owner, c.id, 1, "approve");
    await service.banUser(db, owner, alice.id, true);
    await expect(service.createComment(db, alice, input(), valid)).rejects.toThrow("无法参与");
    expect((await service.listComments(db, "blog-start-small")).roots).toHaveLength(0);
    await service.banUser(db, owner, alice.id, false);
    expect((await service.createComment(db, alice, input(), valid)).status).toBe("pending");
    await expect(service.banUser(db, owner, owner.id, true)).rejects.toThrow();
  });
  it("持久限流在窗口内生效并在新窗口恢复", async () => {
    await rateLimit(db, "test", 2, 60, 1000);
    await rateLimit(db, "test", 2, 60, 1000);
    await expect(rateLimit(db, "test", 2, 60, 1000)).rejects.toThrow("频繁");
    await expect(rateLimit(db, "test", 2, 60, 61000)).resolves.toBeUndefined();
  });
  it("Turnstile 失败、action 和 hostname 不匹配不能写入", async () => {
    for (const answer of [
      { success: false },
      { success: true, hostname: "evil.test", action: "comment" },
      { success: true, hostname: "localhost", action: "login" },
    ]) {
      const fetcher = async () => Response.json(answer);
      await expect(verifyTurnstile(settings, "token", fetcher)).rejects.toThrow("无效");
    }
    const fail = () =>
      verifyTurnstile(settings, "token", async () => Response.json({ success: false }));
    await expect(service.createComment(db, alice, input(), fail)).rejects.toThrow();
    expect((await db.prepare("SELECT COUNT(*) AS n FROM comment").first<{ n: number }>())?.n).toBe(
      0,
    );
  });
});
describe("真实 Better Auth 会话与 D1 适配器", () => {
  async function headers(expires = Date.now() + 3600000) {
    await db
      .prepare(
        "INSERT INTO account(id,account_id,provider_id,user_id,created_at,updated_at) VALUES('account','99','github','owner',?,?)",
      )
      .bind(Date.now(), Date.now())
      .run();
    const token = crypto.randomUUID();
    await db
      .prepare(
        "INSERT INTO session(id,token,expires_at,created_at,updated_at,user_id) VALUES(?,?,?,?,?,'owner')",
      )
      .bind(crypto.randomUUID(), token, expires, Date.now(), Date.now())
      .run();
    const signature = await makeSignature(token, settings.BETTER_AUTH_SECRET!);
    return new Headers({
      cookie: `better-auth.session_token=${encodeURIComponent(`${token}.${signature}`)}`,
    });
  }
  it("有效签名会话映射不可变 GitHub ID 为管理员", async () => {
    const h = await headers();
    const actor = await resolveActor(settings, h);
    expect(actor?.id).toBe("owner");
    expect(actor?.admin).toBe(true);
    const ordinary = await resolveActor({ ...settings, ADMIN_GITHUB_IDS: "someone-else" }, h);
    expect(ordinary?.admin).toBe(false);
  });
  it("过期和伪造会话不能认证", async () => {
    expect(await resolveActor(settings, await headers(Date.now() - 1000))).toBeNull();
    expect(
      await resolveActor(settings, new Headers({ cookie: "better-auth.session_token=forged" })),
    ).toBeNull();
  });
  it("OAuth 登录端点生成 GitHub 跳转并保存认证状态", async () => {
    const response = await getAuth(settings).handler(
      new Request("http://localhost:3000/api/auth/sign-in/social", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "http://localhost:3000" },
        body: JSON.stringify({ provider: "github", callbackURL: "http://localhost:3000/" }),
      }),
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as { url: string };
    expect(new URL(body.url).hostname).toBe("github.com");
  });
});
