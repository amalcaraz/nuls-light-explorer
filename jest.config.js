
module.exports = {
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    testRegex: "(/tests/.*|(\\.|/)(test|spec))\\.(tsx?)$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    collectCoverageFrom: [
        "src/**/*.ts",
        '!**/*.d.ts',
        "!**/node_modules/**"
    ],
    testPathIgnorePatterns: [
        "./node_modules/",
        "./tests/jest-setup.ts"
    ],
    reporters: ["default"],
    coverageDirectory: 'tests/coverage',
    coverageReporters: [
        "cobertura",
        "lcov"
    ],
    bail: true,
    coverageThreshold: {
        global: {
            branches: 60,
            functions: 60,
            lines: 60,
            statements: 60
        }
    },
    setupFiles: [
        './tests/jest-setup.ts'
    ],
};