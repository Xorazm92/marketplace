// MVP e2e: haqiqiy Postgres (TEST_DATABASE_URL, nomi *_test), ketma-ket.
module.exports = {
  rootDir: '../..',
  testMatch: ['<rootDir>/test/mvp/**/*.e2e-spec.ts'],
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json', isolatedModules: true }] },
  testEnvironment: 'node',
  testTimeout: 30000,
  maxWorkers: 1,
};
