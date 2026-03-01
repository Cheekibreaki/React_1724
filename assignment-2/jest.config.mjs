export default {
  testEnvironment: "node",

  // Key: make Jest treat TS as ESM
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts"],

  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true, tsconfig: "tsconfig.json" }],
  },

  // Optional but often avoids ESM path quirks
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
