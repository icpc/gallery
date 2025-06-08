import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import pluginReact from "eslint-plugin-react";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  eslintConfigPrettier,
  {
    ignores: ["**/dist/**", "**/tests/**", "**/lib/**"],
  },
  {
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
    },
  },
);
