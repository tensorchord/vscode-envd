import type { JestConfigWithTsJest } from 'ts-jest'

const jestConfig: JestConfigWithTsJest = {
  roots: ["<rootDir>/test/", "<rootDir>/src/"],
  testMatch: ["**.test.ts"],
  preset: "ts-jest/presets/js-with-ts-esm",
  testEnvironment: "node",
  verbose: true,
  // transform will ignore node_modules by default
  transformIgnorePatterns: [
  ],
}

export default jestConfig