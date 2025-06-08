import eslint from "@eslint/js";
import tanstackQuery from "@tanstack/eslint-plugin-query";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import pluginReact from "eslint-plugin-react";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  eslintConfigPrettier,
  tanstackQuery.configs["flat/recommended"],
  {
    ignores: ["**/dist/**", "**/tests/**", "**/lib/**"],
  },
  {
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
    },
  },
);
