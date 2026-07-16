import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './src',
  testMatch: ['**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      { tsconfig: '<rootDir>/../../tsconfig.backend.json' },
    ],
  },
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/../../shared/$1',
  },
  coverageDirectory: '../coverage',
  collectCoverageFrom: [
    '**/*.service.ts',
    '**/*.controller.ts',
    '**/*.guard.ts',
    '**/*.strategy.ts',
    '!**/*.module.ts',
    '!**/*.dto.ts',
    '!**/*.decorator.ts',
  ],
};

export default config;
