import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

// Merge the contents of eslint-config-prettier into every
export default tseslint.config(
  {
    ignores: ["build/", "build-site/"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        console: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-prototype-builtins": "off",
    },
  },
);
