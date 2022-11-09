module.exports = {
  plugins: ["@typescript-eslint", "prettier", "jsdoc", "jest"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "plugin:jsdoc/recommended",
    "plugin:jest/recommended",
  ],
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
  },
  overrides: [
    {
      files: ["src/*/*"],
      rules: {
        "max-lines": "off",
        "max-nested-callbacks": "off",
        "max-statements": "off",
      },
    },
  ],
  settings: {
    node: {
      extensions: [".ts", ".json"],
    },
  },
};
