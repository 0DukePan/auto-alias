module.exports = {
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src$1",
    "^@cli": "<rootDir>/src/cli$1",
    "^@core": "<rootDir>/src/core$1",
    "^@generators": "<rootDir>/src/generators$1",
    "^@tests": "<rootDir>/src/tests$1",
    "^@types": "<rootDir>/src/types$1",
    "^@utils": "<rootDir>/src/utils$1"
},
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src"],
    testMatch: ['**/tests/**/*.test.ts'],
    collectCoverageFrom: ["src//*.{ts,tsx}", "!src//*.d.ts", "!src/cli/index.ts"],
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov", "html"],
    moduleFileExtensions: ['ts', 'js'],
    // setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
  }