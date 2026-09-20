import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders, setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { getEnv, authReady } from "./env";
import { resolveActor } from "./auth";
import { AppError, assertOrigin, verifyTurnstile } from "./security";
import * as comments from "./comments";
import manifest from "../generated/manifest.json";

async function safe<T>(fn: () => Promise<T>) {
  setResponseHeader("Cache-Control", "private, no-store");
  try {
    return { ok: true as const, data: await fn() };
  } catch (error) {
    if (error instanceof AppError)
      return { ok: false as const, error: error.message, code: error.code };
    console.error(
      JSON.stringify({
        event: "request_failed",
        type: error instanceof Error ? error.name : "unknown",
      }),
    );
    return { ok: false as const, error: "服务暂时不可用，请稍后重试", code: "INTERNAL" };
  }
}
async function context(write = false) {
  const e = getEnv(),
    headers = getRequestHeaders();
  if (write) assertOrigin(headers, e.SITE_URL);
  return { e, actor: await resolveActor(e, headers) };
}
function assertContent(contentId: string) {
  const content = manifest.find((x) => x.id === contentId);
  if (!content?.comments) throw new AppError("VALIDATION", "此内容不开放评论");
}
export const getSessionInfo = createServerFn({ method: "GET" }).handler(() =>
  safe(async () => {
    const { e, actor } = await context();
    return { actor, configured: authReady(e), turnstileSiteKey: e.TURNSTILE_SITE_KEY };
  }),
);
export const getComments = createServerFn({ method: "GET" })
  .validator(
    z.object({ contentId: z.string(), page: z.number().int().min(0).max(1000).default(0) }),
  )
  .handler(({ data }) =>
    safe(async () => {
      assertContent(data.contentId);
      const { e, actor } = await context();
      return comments.listComments(e.DB, data.contentId, data.page, actor);
    }),
  );
export const postComment = createServerFn({ method: "POST" })
  .validator(comments.createSchema)
  .handler(({ data }) =>
    safe(async () => {
      assertContent(data.contentId);
      const { e, actor } = await context(true);
      return comments.createComment(e.DB, actor, data, () => verifyTurnstile(e, data.token));
    }),
  );
export const updateComment = createServerFn({ method: "POST" })
  .validator(comments.editSchema)
  .handler(({ data }) =>
    safe(async () => {
      const { e, actor } = await context(true);
      return comments.editComment(e.DB, actor, data, () => verifyTurnstile(e, data.token));
    }),
  );
export const removeComment = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(({ data }) =>
    safe(async () => {
      const { e, actor } = await context(true);
      return comments.deleteComment(e.DB, actor, data.id);
    }),
  );
export const getAdminData = createServerFn({ method: "GET" })
  .validator(z.object({ page: z.number().int().min(0).max(1000).default(0) }))
  .handler(({ data }) =>
    safe(async () => {
      const { e, actor } = await context();
      return comments.adminData(e.DB, actor, data.page);
    }),
  );
export const moderate = createServerFn({ method: "POST" })
  .validator(
    z.object({ id: z.string(), version: z.number().int(), action: z.enum(["approve", "hide"]) }),
  )
  .handler(({ data }) =>
    safe(async () => {
      const { e, actor } = await context(true);
      return comments.moderateComment(e.DB, actor, data.id, data.version, data.action);
    }),
  );
export const setUserBan = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), banned: z.boolean() }))
  .handler(({ data }) =>
    safe(async () => {
      const { e, actor } = await context(true);
      return comments.banUser(e.DB, actor, data.id, data.banned);
    }),
  );
