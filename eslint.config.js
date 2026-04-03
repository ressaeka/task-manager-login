import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  prettier,

  {
    files: ["**/*.js"],
    ignores: ["node_modules/**", "dist/**"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },

    rules: {
      /*
       * 🔥 WAJIB - Cegah Bug
       */
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      "no-unreachable": "error",
      "no-duplicate-imports": "error",
      "no-shadow": "warn",
      eqeqeq: ["error", "always"],
      curly: "error",
      "consistent-return": "error",

      /*
       * 🔥 WAJIB - Modern JS
       */
      "no-var": "error",
      "prefer-const": "error",
    },
  },
];
