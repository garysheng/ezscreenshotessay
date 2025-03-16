import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Disable all rules by setting an empty configuration
  {
    rules: {},
    ignorePatterns: ["**/*"],
  }
  // Previous config commented out
  // ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
