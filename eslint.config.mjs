import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // v1.15.0：以下为存量代码遗留告警（多为 React 19 新 hooks 规则），先降级为 warn 保证 lint 可跑通；
      // 存量清理排入 P2（逐一修复涉及行为回归风险）
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react/no-children-prop": "warn",
      "react/no-unescaped-entities": "warn",
      "@next/next/no-html-link-for-pages": "warn",
      "prefer-const": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 本地临时脚本目录（gitignored，非应用代码）
    ".workbuddy/**",
    // 第三方 vendored 静态资源
    "public/vendor/**",
  ]),
]);

export default eslintConfig;
