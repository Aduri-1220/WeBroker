import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Picks up `paths: { "@/*": ["./*"] }` from tsconfig.json
    // (Vite 5+ supports this natively, no plugin required.)
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/.next/**", "tests/e2e/**"],
    globals: false,
    reporters: "default",
  },
});
