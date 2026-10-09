import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default defineConfig(
  globalIgnores([
    "dist",
    "node_modules",
    "coverage",
    "playwright-report",
    "test-results",
  ]),
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  reactHooks.configs.flat.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { "react-refresh": reactRefresh },
    rules: {
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Tests get Vitest globals and jest-dom types from their own tsconfig, so
    // app code cannot accidentally type-check against them.
    files: ["src/**/*.test.{ts,tsx}", "src/test-setup.ts"],
    languageOptions: {
      parserOptions: { projectService: false, project: "./tsconfig.test.json" },
    },
  },
  {
    // vite.config.ts runs in Node and is type-checked via tsconfig.node.json.
    files: ["vite.config.ts", "playwright.config.ts", "e2e/**/*.ts"],
    languageOptions: {
      globals: globals.node,
      parserOptions: { projectService: false, project: "./tsconfig.node.json" },
    },
  },
  {
    // Plain JS configs have no type information to lint against.
    files: ["*.config.js"],
    languageOptions: { globals: globals.node },
    extends: [tseslint.configs.disableTypeChecked],
  },
);
