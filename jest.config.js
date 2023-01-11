module.exports = {
    roots: ["<rootDir>/test/", "<rootDir>/src/"],
    testMatch: ["**.test.ts"],
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,
};