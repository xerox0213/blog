import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import checkFile from "eslint-plugin-check-file";
import pluginVue from "eslint-plugin-vue";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  // Base config
  js.configs.recommended,
  tseslint.configs.recommended,

  // Vue config
  ...pluginVue.configs["flat/recommended"],
  {
    files: ["apps/frontend/src/**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    files: ["apps/frontend/src/pages/**/*.vue"],
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },

  // Check file config
  {
    plugins: {
      "check-file": checkFile,
    },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        {
          "**/*": "KEBAB_CASE",
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
      "check-file/folder-naming-convention": [
        "error",
        {
          "**/*": "KEBAB_CASE",
        },
      ],
    },
  },

  // Override stylistic eslint rules. Must always be the last one
  eslintConfigPrettier,
]);
