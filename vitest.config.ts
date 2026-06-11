import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "integration",
          environment: "node",
          include: ["src/**/*.{test,spec}.ts"],
          exclude: [
            "src/server/__tests__/auth-rate-limit.test.ts",
            "src/server/__tests__/public-rate-limit.test.ts",
          ],
          setupFiles: ["src/test/setup.ts"],
          env: { DISABLE_AUTH_RATE_LIMIT: "true" },
          restoreMocks: true,
          fileParallelism: false,
          maxWorkers: 1,
        },
      },
      {
        test: {
          name: "auth-rate-limit",
          environment: "node",
          include: ["src/server/__tests__/auth-rate-limit.test.ts"],
          setupFiles: ["src/test/setup.ts"],
          fileParallelism: false,
          maxWorkers: 1,
        },
      },
      {
        test: {
          name: "public-rate-limit",
          environment: "node",
          include: ["src/server/__tests__/public-rate-limit.test.ts"],
          setupFiles: ["src/test/setup.ts"],
          fileParallelism: false,
          maxWorkers: 1,
        },
      },
    ],
  },
});
