/**
 * @fileoverview Vite build configuration with integrated Vitest test runner.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    watch: {
      ignored: ['**/coverage/**', '**/dist/**', '**/src/__tests__/**'],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/**/*.d.ts',
        'src/types/**',
        'src/state/planActions.ts',
        'src/domain/budget/types.ts',
        'src/domain/subEvents/types.ts',
        'src/__tests__/**',
      ],
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
    },
  },
});
