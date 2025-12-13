import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import jsdoc from "eslint-plugin-jsdoc";
import jest from "eslint-plugin-jest";

export default defineConfig(
  tseslint.configs.strict,
  jsdoc.configs["flat/recommended-typescript"],
  jest.configs["flat/recommended"],
  prettierRecommended,
  {
    files: ["src/*/*"],
    settings: {
      node: {
        extensions: [".ts", ".json"],
      },
    },
    rules: {
      "prettier/prettier": "error",
      "comma-dangle": 0,
      "no-trailing-spaces": "off",
      "import/extensions": 0,
      "jsdoc/no-undefined-types": "off",
      "jsdoc/require-param-type": "off",
      "jsdoc/require-returns-type": "off",
      "@typescript-eslint/ban-ts-ignore": 0,
      "@typescript-eslint/explicit-function-return-type": 0,
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "max-lines": "off",
      "max-nested-callbacks": "off",
      "max-statements": "off",
    },
  },
);
