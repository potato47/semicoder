import { defineConfig } from "vitest/config";
import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-plugin";
export default defineConfig({
  plugins: [
    cloudflareTest({
      miniflare: {
        compatibilityDate: "2026-09-20",
        compatibilityFlags: ["nodejs_compat"],
        d1Databases: ["DB"],
        bindings: { TEST_MIGRATIONS: await readD1Migrations("./drizzle") },
      },
    }),
  ],
  test: { include: ["tests/workers/**/*.test.ts"], testTimeout: 15000 },
});
