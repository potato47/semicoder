import { env } from "cloudflare:workers";
export interface AppEnv {
  DB: D1Database;
  ASSETS: Fetcher;
  SITE_URL: string;
  APP_ENV: "development" | "staging" | "production";
  TURNSTILE_SITE_KEY: string;
  BETTER_AUTH_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  TURNSTILE_SECRET_KEY?: string;
  ADMIN_GITHUB_IDS?: string;
}
export function getEnv(): AppEnv {
  return env as unknown as AppEnv;
}
export function authReady(e: AppEnv) {
  return !!(e.BETTER_AUTH_SECRET && e.GITHUB_CLIENT_ID && e.GITHUB_CLIENT_SECRET);
}
