import type { Config } from 'jest';

const config: Config = {
  // Ambiente de simulação do DOM para testes de componentes React
  testEnvironment: 'jest-environment-jsdom',

  // Executa o setup do RTL antes de cada teste
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Suporte a aliases de imports TypeScript (@/...)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Ignorar arquivos estáticos
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/__mocks__/fileMock.js',
  },

  // Padrões de arquivos de teste que o Jest vai procurar
  testMatch: [
    '**/__tests__/**/*.{ts,tsx}',
    '**/*.spec.{ts,tsx}',
    '**/*.test.{ts,tsx}',
  ],

  // Arquivos que serão ignorados pelo Jest
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
  ],

  // Transforma arquivos TypeScript via ts-jest
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        strict: false,
      },
    }],
  },

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/layout.tsx',
  ],
};

export default config;
