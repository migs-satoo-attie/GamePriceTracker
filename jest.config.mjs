/**
 * Configuração do Jest para o back-end.
 *
 * O back-end vive em `src/server/` e é JavaScript puro de Node (ESM), testado
 * de forma isolada do Next.js. Usamos @swc/jest para transpilar `import/export`
 * sem depender do pipeline do Next, mantendo os testes rápidos.
 *
 * Os testes do front-end (componentes React) NÃO são cobertos aqui — o escopo
 * deste projeto é exclusivamente back-end.
 */

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/jest.setup.js'],
  // Apenas back-end: domínio, aplicação, infraestrutura e rotas de API.
  roots: ['<rootDir>/src/server', '<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
  transform: {
    '^.+\\.js$': ['@swc/jest'],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  clearMocks: true,
  collectCoverageFrom: [
    'src/server/**/*.js',
    '!src/server/**/*.test.js',
  ],
  coverageDirectory: '<rootDir>/coverage',
};

export default config;
