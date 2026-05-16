import { execSync } from "node:child_process";

/**
 * Runs once before the Playwright suite.
 *  - Requires TEST_DATABASE_URL (never DATABASE_URL) so we never wipe the wrong DB.
 *  - Runs `prisma migrate reset --force` so each run matches migrations under
 *    prisma/migrations (same path production uses via migrate deploy).
 *
 * Playwright config validates TEST_DATABASE_URL before this runs.
 */
export default async function globalSetup() {
  const testUrl = process.env.TEST_DATABASE_URL?.trim();
  if (!testUrl) {
    throw new Error(
      "E2E global-setup: TEST_DATABASE_URL is missing. Playwright config should have caught this.",
    );
  }

  execSync("npx prisma migrate reset --force --skip-generate --skip-seed", {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: testUrl,
    },
  });

  process.env.DATABASE_URL = testUrl;
}
