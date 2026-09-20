import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";
import { authReady, type AppEnv } from "./env";
const instances = new WeakMap<AppEnv, ReturnType<typeof createAuth>>();
function createAuth(e: AppEnv) {
  if (!authReady(e)) throw new Error("GitHub 登录尚未配置");
  const auth = betterAuth({
    appName: "新手程序员",
    baseURL: e.SITE_URL,
    secret: e.BETTER_AUTH_SECRET,
    database: drizzleAdapter(drizzle(e.DB), { provider: "sqlite", schema }),
    socialProviders: {
      github: { clientId: e.GITHUB_CLIENT_ID!, clientSecret: e.GITHUB_CLIENT_SECRET! },
    },
    trustedOrigins: [e.SITE_URL],
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    advanced: {
      useSecureCookies: e.APP_ENV !== "development",
      ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] },
    },
    rateLimit: { enabled: true, storage: "database", modelName: "authRateLimit" },
  });
  return auth;
}
export function getAuth(e: AppEnv) {
  const existing = instances.get(e);
  if (existing) return existing;
  const auth = createAuth(e);
  instances.set(e, auth);
  return auth;
}
export interface Actor {
  id: string;
  name: string;
  admin: boolean;
}
export async function resolveActor(e: AppEnv, headers: Headers): Promise<Actor | null> {
  if (!authReady(e)) return null;
  const result = await getAuth(e).api.getSession({ headers });
  if (!result) return null;
  const linked = await e.DB.prepare(
    "SELECT account_id FROM account WHERE user_id=? AND provider_id='github'",
  )
    .bind(result.user.id)
    .first<{ account_id: string }>();
  const admin =
    !!linked &&
    (e.ADMIN_GITHUB_IDS ?? "")
      .split(",")
      .map((s) => s.trim())
      .includes(linked.account_id);
  return { id: result.user.id, name: result.user.name, admin };
}
