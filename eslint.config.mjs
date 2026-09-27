import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next-*/**",
    ".next-playwright/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "admin_reference_code/**",
  ]),
  {
    // Plesk startup files are intentionally CommonJS. The project package is
    // not ESM and Passenger loads this file directly with Node.js.
    files: ["start.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
