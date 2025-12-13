import { createDefaultEsmPreset } from "ts-jest";

const tsJestCfg = createDefaultEsmPreset();

export default {
  ...tsJestCfg,
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
