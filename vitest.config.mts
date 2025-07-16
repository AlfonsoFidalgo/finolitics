import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    coverage: {
      provider: "istanbul", // or 'v8'
      reporter: ["text", "html", "clover"],
      include: [
        "src/**/*.{ts,tsx}", // Include all TypeScript files in src
        // Add more patterns as needed
      ],
      exclude: [
        "src/**/*.test.{ts,tsx}", // Exclude test files
        "src/**/*.d.ts", // Exclude type declaration files
        "src/app/**/layout.tsx", // Exclude specific files if needed
        "src/app/**/loading.tsx",
        // Add more exclusion patterns as needed
      ],
      // Optional: Set coverage thresholds
      // thresholds: {
      //   global: {
      //     branches: 80,
      //     functions: 80,
      //     lines: 80,
      //     statements: 80,
      //   },
      // },
    },
  },
});
