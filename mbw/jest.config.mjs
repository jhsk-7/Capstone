import nextJest from 'next/jest.js'; // or 'next/jest' in CJS
const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const custom = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
};
export default createJestConfig(custom);
