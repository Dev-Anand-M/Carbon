import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * Vitest configuration for CarbonWise test suite
 * @see https://vitest.dev/config/
 */
export default defineConfig({
  plugins: [react()],
  test: {
    /* Use jsdom for DOM simulation */
    environment: 'jsdom',
    /* Global test utilities */
    globals: true,
    /* Setup file for test matchers */
    setupFiles: ['./src/test/setup.js'],
    /* Include test file patterns */
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    /* Coverage configuration */
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/test/**',
        'src/main.jsx',
        'src/**/*.test.{js,jsx}',
      ],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
    },
  },
});
