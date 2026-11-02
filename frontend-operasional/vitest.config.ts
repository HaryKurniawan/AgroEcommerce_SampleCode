import path from "path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["__tests__/unit/**/*.{test,spec}.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**"],
    alias: {
      "@": path.resolve(__dirname, "."),
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.ts", "lib/**/*.ts"],
    },
  },
});
