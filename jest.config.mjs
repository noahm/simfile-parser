import { createDefaultEsmPreset } from "ts-jest";

const tsJestCfg = createDefaultEsmPreset();

export default {
  ...tsJestCfg,
  testEnvironment: "node",
  // otherwise shared test helpers get picked up as (empty) suites
  testMatch: ["**/*.test.ts"],
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
