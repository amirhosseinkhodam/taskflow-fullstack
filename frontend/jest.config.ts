import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',
  rootDir: './src',
  testMatch: ['**/*.spec.ts'],
  setupFiles: ['<rootDir>/../setup-jest.ts'],
  transform: {
    '^.+\\.(ts|js|mjs|html|svg)$': [
      'jest-preset-angular',
      { tsconfig: '<rootDir>/../tsconfig.frontend.spec.json' },
    ],
  },
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/../../shared/$1',
    '^@models/(.*)$': '<rootDir>/../app/models/$1',
  },
  coverageDirectory: '../coverage',
  collectCoverageFrom: [
    '**/*.service.ts',
    '**/*.component.ts',
    '**/*.pipe.ts',
    '**/*.guard.ts',
    '**/*.interceptor.ts',
    '**/*.store.ts',
    '!**/*.module.ts',
    '!**/*.routes.ts',
  ],
  transformIgnorePatterns: ['node_modules/(?!(@ngrx|@ng-select|rxjs|@angular))'],
};

export default config;
