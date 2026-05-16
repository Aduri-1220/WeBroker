import { defineConfig, devices } from "@playwright/test";
import { loadEnvConfig } from "@next/env";

// Next.js loads .env automatically when `next dev` starts, but the Playwright
// runner is a separate Node process that doesn't, so global-setup and the
// webServer env block below would see undefined values. Load the same .env
// files Next would (`.env`, `.env.local`, etc.) before we read process.env.
loadEnvConfig(process.cwd());

/**
 * The E2E suite builds and runs `next start` on port 3199 against an isolated
 * Postgres database (`TEST_DATABASE_URL` only — never `DATABASE_URL`).
 * Global setup runs `prisma migrate reset --force` before tests.
 */
const PORT = 3199;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL?.trim() ?? "";

if (!TEST_DATABASE_URL) {
  throw new Error(
    "Playwright: set TEST_DATABASE_URL to a dedicated Postgres DB or Neon branch. " +
      "E2E runs `prisma migrate reset --force` and must not use DATABASE_URL as a fallback.",
  );
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI
    ? "github"
    : [
        ["list"],
        // HTML report served on http://localhost:9323 via `playwright show-report`.
        // `open: "never"` keeps `next dev` from being interrupted at the end of a run.
        ["html", { outputFolder: "playwright-report", open: "never" }],
      ],
  globalSetup: "./tests/e2e/global-setup.ts",
  use: {
    baseURL: BASE_URL,
    trace: "on",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Build + start (production mode) instead of `next dev`. `next dev` keeps
    // a webpack/chokidar file watcher open on every file in the project,
    // which on macOS easily exhausts the per-process fd budget (EMFILE) and
    // then Chromium can't launch. `next start` doesn't watch files, so the
    // suite is both faster (precompiled routes) and far more reliable.
    command: `next build && next start -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    // First run includes a full Next build, so be generous.
    timeout: 240_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
      NEXTAUTH_SECRET: "test-secret-do-not-use-in-prod-aaaaaaaaaaaaa",
      AUTH_TRUST_HOST: "true",
      E2E_SKIP_EMAIL_VERIFICATION: "true",
      ENABLE_PAYMENT_SIMULATE: "true",
      PAYMENT_PROVIDER: "mock",
    },
  },
});
