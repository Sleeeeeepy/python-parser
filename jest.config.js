/** @type {import('ts-jest').JestConfigWithTsJest} */
const { pathsToModuleNameMapper } = require('ts-jest')

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper({
    "@src/*": ["src/*"],
    "@parser/*": ["src/parser/*"],
    "@exceptions/*": ["src/exceptions/*"],
    "@interface/*": ["src/interface/*"],
    "@utils/*": ["src/utils"]
  }),
  modulePaths: [
    '<rootDir>'
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/dist/'
  ]
};