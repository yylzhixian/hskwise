import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "react-hooks/exhaustive-deps": "error",
    },
  },
  {
    files: [
      "src/app/**/*.{ts,tsx}",
      "src/views/**/*.tsx",
      "src/components/**/*.tsx",
      "src/courses/*/components/**/*.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/store/**/atoms/**",
                "@/store/**/storage/**",
                "@/learning/runtime/state/**",
                "@/lib/media/*-adapter*",
              ],
              message:
                "UI must use a domain hook instead of importing state or adapters directly.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "src/**/model/**/*.{ts,tsx}",
      "src/**/*-schema.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: ["jotai", "jotai-immer", "react"],
          patterns: [
            {
              group: [
                "@/app/**",
                "@/components/**",
                "@/views/**",
                "@/hooks/**",
                "@/courses/*/components/**",
              ],
              message:
                "Domain models and schemas must remain independent of React and UI modules.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "src/store/**/atoms/**/*.{ts,tsx}",
      "src/learning/runtime/state/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/app/**",
                "@/components/**",
                "@/views/**",
                "@/courses/*/components/**",
              ],
              message:
                "State modules may depend on models and adapters, never on UI components.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
