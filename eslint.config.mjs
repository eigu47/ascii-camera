// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";

export default tseslint.config(
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
    },
    settings: {
      react: {
        version: "18.0",
      },
    },
    rules: {
      // Preact-specific rules
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unknown-property": ["error", { ignore: ["class"] }],

      // TypeScript rules adjustments
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-misused-promises": "warn",
      "@typescript-eslint/require-await": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-confusing-void-expression": "off",
    },
  },
  {
    ignores: ["dist/", "node_modules/", "*.config.js", "*.config.mjs"],
  },
);
