import eslint from "typescript-eslint";

export default eslint.config(
  { ignores: ["dist/**", "node_modules/**"] },
  ...eslint.configs.recommended,
  {
    files: ["**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    },
  },
);
